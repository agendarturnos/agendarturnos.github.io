// src/components/ProfessionalCalendarScreen.jsx
import React, { useState, useEffect, useCallback, useMemo } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs, addDoc } from 'firebase/firestore';
import { db, auth } from '../firebaseConfig';
import {
  format,
  addDays,
  startOfDay,
  setHours,
  setMinutes,
  isSameDay,
  isBefore,
} from 'date-fns';
import { es } from 'date-fns/locale';
import { useTenant } from '../TenantProvider';

export default function ProfessionalCalendarScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const { stylist, service, from, datetime } = state || {};
  const { companyId, slug } = useTenant();

  const [appointments, setAppointments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [selectedDate, setSelectedDate] = useState(null);
  const [slotsByDate, setSlotsByDate] = useState({});

  // Memoizamos las próximas 4 semanas (28 días)
  const days = useMemo(() => {
    const today = startOfDay(new Date());
    return Array.from({ length: 28 }, (_, i) => addDays(today, i));
  }, []);

  // Cargar citas existentes
  useEffect(() => {
    if (!stylist || !service) {
      navigate(`/${slug}`, { replace: true });
      return;
    }
    getDocs(collection(db, 'appointments'))
      .then(snap =>
        setAppointments(
          snap.docs.map(d => ({
            id: d.id,
            datetime: d.data().datetime,
            duration: d.data().duration || service.duration,
            stylistId: d.data().stylistId
          }))
        )
      )
      .finally(() => setLoading(false));
  }, [stylist, service, navigate]);

  // Generar franjas libres por día sin desperdiciar huecos
  useEffect(() => {
    if (!stylist || loading) return;

    // Preparamos todas las ventanas ocupadas del profesional
    const windowsByDate = {};
    appointments
      .filter(a => a.stylistId === stylist.id)
      .forEach(a => {
        const start = new Date(a.datetime).getTime();
        const end = start + a.duration * 60000;
        const dateKey = format(new Date(a.datetime), 'yyyy-MM-dd');
        windowsByDate[dateKey] = windowsByDate[dateKey] || [];
        windowsByDate[dateKey].push({ start, end });
      });
    // Ordenamos las ventanas por hora de inicio
    Object.values(windowsByDate).forEach(arr =>
      arr.sort((w1, w2) => w1.start - w2.start)
    );

    const sched = stylist.schedule || {};
    const except = stylist.exceptions || [];

    const byDate = {};
    days.forEach(date => {
      const key = format(date, 'yyyy-MM-dd');
      const raw = format(date, 'EEEE', { locale: es });
      const dayName = raw.charAt(0).toUpperCase() + raw.slice(1);

      // Si no trabaja o es feriado o día pasado, no hay slots
      if (
        !sched[dayName] ||
        except.includes(key) ||
        isBefore(date, startOfDay(new Date()))
      ) {
        byDate[key] = [];
        return;
      }

      // Horario laboral (uno o más bloques)
      const blocks = Array.isArray(sched[dayName]) ? sched[dayName] : [sched[dayName]];
      // Tomamos solo las ventanas de este día
      const occupied = windowsByDate[key] || [];
      const slots = [];

      blocks.forEach(block => {
        if (!block) return;
        const [fh, fm] = block.from.split(':').map(Number);
        const [th, tm] = block.to.split(':').map(Number);
        const dayStart = startOfDay(date);
        const blockStart = setMinutes(setHours(dayStart, fh), fm).getTime();
        const blockEnd = setMinutes(setHours(dayStart, th), tm).getTime();

        let cursor = blockStart;

        occupied.forEach(win => {
          if (win.end <= blockStart || win.start >= blockEnd) return;
          const winStart = Math.max(win.start, blockStart);
          const winEnd = Math.min(win.end, blockEnd);

          if (cursor + service.duration * 60000 <= winStart) {
            let slotTime = cursor;
            while (slotTime + service.duration * 60000 <= winStart) {
              slots.push(new Date(slotTime));
              slotTime += service.duration * 60000;
            }
          }

          if (winEnd > cursor) {
            cursor = winEnd;
          }
        });

        while (cursor + service.duration * 60000 <= blockEnd) {
          slots.push(new Date(cursor));
          cursor += service.duration * 60000;
        }
      });

      byDate[key] = slots.sort((a, b) => a - b);
    });

    setSlotsByDate(byDate);
    const firstAvail = days.find(d =>
      (byDate[format(d, 'yyyy-MM-dd')] || []).length > 0
    );
    setSelectedDate(firstAvail || days[0]);
  }, [appointments, stylist, service, loading, days]);

  // Manejador de click en slot (incluye reintento tras login)
  const handleSlotClick = useCallback(
    async dt => {
      if (!auth.currentUser) {
        navigate(`/${slug}/login`, {
          state: {
            from: 'booking',
            stylist,
            service,
            datetime: dt.toISOString(),
          },
        });
        return;
      }
      const confirmReservation = window.confirm(
        `¿Confirmas reservar el turno el ${format(
          dt,
          'PPP',
          { locale: es }
        )} a las ${format(dt, 'HH:mm')} con ${stylist.name}?`
      );
      if (!confirmReservation) return;
      try {
        await addDoc(collection(db, 'appointments'), {
          stylistId: stylist.id,
          stylistName: stylist.name,
          serviceId: service.id,
          serviceName: service.name,
          clientId: auth.currentUser.uid,
          clientEmail: auth.currentUser.email,
          datetime: dt.toISOString(),
          duration: service.duration,
          companyId: companyId,
        });
        alert('Turno reservado correctamente.');
        navigate(`/${slug}`);
      } catch (error) {
        console.error('Error guardando turno:', error);
        alert('Ocurrió un error al reservar el turno. Intenta nuevamente.');
      }
    },
    [navigate, service, stylist]
  );

  // Reanudar reserva tras login
  useEffect(() => {
    if (from === 'booking' && datetime && auth.currentUser) {
      handleSlotClick(new Date(datetime));
    }
  }, [from, datetime, handleSlotClick]);

  if (!stylist || !service) return null;
  if (loading) return <p className="p-4 text-center">Cargando disponibilidad…</p>;

  const selectedKey = format(selectedDate, 'yyyy-MM-dd');
  const slots = slotsByDate[selectedKey] || [];

  return (
    <div className="p-4 max-w-lg mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center mb-4">
        Turnos de {stylist.name} para {service.name}
      </h2>

      {/* Carrusel de días */}
      <div className="flex space-x-3 overflow-x-auto pb-2">
        {days.map(date => {
          const key = format(date, 'yyyy-MM-dd');
          const hasSlots = (slotsByDate[key] || []).length > 0;
          const isSelected = isSameDay(date, selectedDate);
          return (
            <button
              key={key}
              onClick={() => hasSlots && setSelectedDate(date)}
              disabled={!hasSlots}
              className={`flex-shrink-0 px-4 py-2 rounded-full text-sm font-medium transition ${
                isSelected
                  ? 'bg-[#f1bc8a] text-white'
                  : hasSlots
                  ? 'bg-white text-gray-800 hover:bg-[#f1bc8a]'
                  : 'bg-gray-100 text-gray-400 cursor-not-allowed'
              }`}
            >
              <div>{format(date, 'EEE', { locale: es })}</div>
              <div className="text-xs">{format(date, 'dd/MM')}</div>
            </button>
          );
        })}
      </div>

      {slots.length > 0 ? (
        <div className="grid grid-cols-3 gap-2">
          {slots.map(dt => (
            <button
              key={dt.getTime()}
              onClick={() => handleSlotClick(dt)}
              className="py-2 text-sm bg-white rounded shadow hover:bg-[#f1bc8a] transition"
            >
              {format(dt, 'HH:mm')}
            </button>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No hay turnos disponibles para el día {format(selectedDate, 'dd/MM/yyyy')}.
        </p>
      )}
    </div>
  );
}
