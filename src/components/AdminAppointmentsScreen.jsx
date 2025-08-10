// src/components/AdminAppointmentsScreen.jsx
import React, { useState, useMemo, useEffect } from 'react';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import {
  collection,
  onSnapshot,
  updateDoc,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTenant } from '../TenantProvider';
import TimelineChart from './TimelineChart';

export default function AdminAppointmentsScreen({ profile, stylists = [], appointments }) {
  const [selectedDate, setSelectedDate] = useState(null);
  const [selectedStylist, setSelectedStylist] = useState('');
  const [users, setUsers] = useState([]);
  const { usaConfirmacionSenia } = useTenant() || {};

  useEffect(() => {
    const unsub = onSnapshot(collection(db, 'users'), snap =>
      setUsers(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );
    return unsub;
  }, []);

  const userMap = useMemo(() => {
    const m = {};
    users.forEach(u => { m[u.id] = u; });
    return m;
  }, [users]);

  const filteredAppointments = useMemo(() => {
    if (profile?.isAdmin && selectedStylist) {
      return appointments.filter(a => a.stylistId === selectedStylist);
    }
    return appointments;
  }, [appointments, profile, selectedStylist]);

  const byDate = useMemo(() => {
    return filteredAppointments.reduce((acc, appt) => {
      const key = format(parseISO(appt.datetime), 'yyyy-MM-dd');
      (acc[key] ||= []).push(appt);
      return acc;
    }, {});
  }, [filteredAppointments]);

  const dates = useMemo(() => Object.keys(byDate).sort(), [byDate]);

  const handleConfirmDeposit = async appt => {
    if (!window.confirm('¿Confirmar recepción de la seña?')) return;
    await updateDoc(doc(db, 'appointments', appt.id), { depositConfirmed: true });
    alert('Seña confirmada');
  };


  const handleCancel = async appt => {
    if (!window.confirm('¿Estás seguro de cancelar este turno?')) return;
    await deleteDoc(doc(db, 'appointments', appt.id));
    alert('Turno cancelado');
  };

  const dropdown = profile?.isAdmin && (
    <div className="mb-4">
      <select
        className="border p-2 rounded"
        value={selectedStylist}
        onChange={e => setSelectedStylist(e.target.value)}
      >
        <option value="">Todos los profesionales</option>
        {stylists.map(st => (
          <option key={st.id} value={st.id}>
            {st.name}
          </option>
        ))}
      </select>
    </div>
  );

  if (selectedDate) {
    const list = byDate[selectedDate].sort(
      (a, b) => new Date(a.datetime) - new Date(b.datetime)
    );
    const prettyDate = format(parseISO(list[0].datetime), 'PPP', { locale: es });

    return (
      <div className="p-4 max-w-4xl mx-auto">
        {dropdown}
        <button
          onClick={() => setSelectedDate(null)}
          className="mb-4 text-[#f1bc8a] underline"
        >
          ← Volver a días
        </button>
        <h3 className="text-xl font-semibold mb-4">
          Turnos para {prettyDate}
        </h3>
        <TimelineChart appointments={list} userMap={userMap} />

        {/* Desktop */}
        <div className="hidden md:block overflow-x-auto">
          <table className="min-w-full bg-white rounded shadow">
            <thead>
              <tr className="bg-gray-100">
                <th className="px-4 py-2 text-left">Hora</th>
                <th className="px-4 py-2 text-left">Profesional</th>
                <th className="px-4 py-2 text-left">Servicio</th>
                <th className="px-4 py-2 text-left">Cliente</th>
                <th className="px-4 py-2 text-left">Teléfono</th>
                {usaConfirmacionSenia && (
                  <th className="px-4 py-2 text-left">Seña</th>
                )}
                <th className="px-4 py-2 text-center">Acciones</th>
              </tr>
            </thead>
            <tbody>
              {list.map(appt => {
                const user = userMap[appt.clientId] || {};
                const dt = parseISO(appt.datetime);
                const end = new Date(dt.getTime() + (appt.duration || 0) * 60000);
                return (
                  <tr key={appt.id} className="border-b">
                    <td className="px-2 py-2">
                      {format(dt, 'HH:mm')} a {format(end, 'HH:mm')}
                    </td>
                    <td className="px-4 py-2">{appt.stylistName}</td>
                    <td className="px-4 py-2">{appt.serviceName}</td>
                    <td className="px-4 py-2">
                      {user.firstName
                        ? `${user.firstName} ${user.lastName}`
                        : appt.clientEmail}
                    </td>
                    <td className="px-4 py-2">
                      {user.phone ? (
                        <a
                          href={`https://wa.me/${user.phone.replace(/\D/g, '')}`}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center space-x-1 text-green-500 hover:text-green-700"
                        >
                          <span className="text-sm">{user.phone}</span>
                          <svg
                            xmlns="http://www.w3.org/2000/svg"
                            viewBox="0 0 24 24"
                            width="18"
                            height="18"
                            fill="currentColor"
                          >
                            <path d="M20.52 3.48C18.52 1.48 15.788.5 12.953.5 5.991.5 .5 5.991.5 12.953c0 2.097.549 4.131 1.594 5.944L.5 23.5l4.694-1.547c1.779 1.027 3.82 1.567 5.759 1.567 6.962 0 12.453-5.491 12.453-12.453 0-2.835-.98-5.567-2.884-7.533zm-7.567 18.858c-1.809 0-3.586-.488-5.154-1.412l-.369-.219-2.789.919.938-2.718-.241-.374C4.8 16.292 4.312 14.514 4.312 12.7c0-4.772 3.878-8.65 8.641-8.65 2.306 0 4.47.898 6.102 2.53 1.632 1.633 2.53 3.796 2.53 6.102 0 4.763-3.878 8.641-8.641 8.641z"/>
                            <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.672.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.645.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.372-.025-.521-.074-.148-.672-1.612-.921-2.208-.242-.579-.487-.5-.672-.51l-.572-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.119-.273-.198-.57-.347z"/>
                          </svg>
                        </a>
                      ) : (
                        '—'
                      )}
                    </td>
                    {usaConfirmacionSenia && (
                      <td className="px-4 py-2">
                        {appt.depositConfirmed
                          ? <span className="text-green-600">Confirmada</span>
                          : <span className="text-red-600">Pendiente</span>}
                      </td>
                    )}
                    <td className="px-4 py-2 text-center space-x-2">
                      {usaConfirmacionSenia && !appt.depositConfirmed && (
                        <button
                          onClick={() => handleConfirmDeposit(appt)}
                          className="px-2 py-1 bg-yellow-500 text-white rounded text-xs hover:bg-yellow-600 transition"
                        >
                          Confirmar Seña
                        </button>
                      )}
                      <button
                        onClick={() => handleCancel(appt)}
                        className="px-2 py-1 bg-red-500 text-white rounded text-xs hover:bg-red-600 transition"
                      >
                        Cancelar
                      </button>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>

        {/* Mobile */}
        <div className="space-y-4 md:hidden">
          {list.map(appt => {
            const user = userMap[appt.clientId] || {};
            const dt = parseISO(appt.datetime);
            return (
              <div
                key={appt.id}
                className="bg-white rounded-lg shadow p-4 space-y-2"
              >
                <div className="flex justify-between">
                  <span className="font-semibold">
                    {format(dt, 'HH:mm')} - {format(new Date(dt.getTime() + (appt.duration || 0) * 60000), 'HH:mm')}
                  </span>
                  <div className="flex space-x-2">
                    {usaConfirmacionSenia && !appt.depositConfirmed && (
                      <button
                        onClick={() => handleConfirmDeposit(appt)}
                        className="bg-yellow-500 text-white px-2 py-1 rounded-full text-xs hover:bg-yellow-600 transition"
                      >
                        Seña
                      </button>
                    )}
                    <button
                      onClick={() => handleCancel(appt)}
                      className="bg-red-500 text-white px-2 py-1 rounded-full text-xs hover:bg-red-600 transition"
                    >
                      Cancelar
                    </button>
                  </div>
                </div>
                <p className="text-sm"><strong>Prof.:</strong> {appt.stylistName}</p>
                <p className="text-sm"><strong>Serv.:</strong> {appt.serviceName}</p>
                <p className="text-sm"><strong>Cliente:</strong> {user.firstName ? `${user.firstName} ${user.lastName}` : appt.clientEmail}</p>
                <p className="text-sm flex items-center space-x-1">
                  <strong>Teléfono:</strong>
                  {user.phone ? (
                    <a
                      href={`https://wa.me/${user.phone.replace(/\D/g, '')}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center space-x-1 text-green-500 hover:text-green-700"
                    >
                      <span className="text-sm">{user.phone}</span>
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        viewBox="0 0 24 24"
                        width="16"
                        height="16"
                        fill="currentColor"
                      >
                        <path d="M20.52 3.48C18.52 1.48 15.788.5 12.953.5 5.991.5 .5 5.991.5 12.953c0 2.097.549 4.131 1.594 5.944L.5 23.5l4.694-1.547c1.779 1.027 3.82 1.567 5.759 1.567 6.962 0 12.453-5.491 12.453-12.453 0-2.835-.98-5.567-2.884-7.533zm-7.567 18.858c-1.809 0-3.586-.488-5.154-1.412l-.369-.219-2.789.919.938-2.718-.241-.374C4.8 16.292 4.312 14.514 4.312 12.7c0-4.772 3.878-8.65 8.641-8.65 2.306 0 4.47.898 6.102 2.53 1.632 1.633 2.53 3.796 2.53 6.102 0 4.763-3.878 8.641-8.641 8.641z"/>
                        <path d="M17.472 14.382c-.297-.149-1.758-.867-2.031-.967-.273-.099-.472-.148-.672.149-.198.297-.767.967-.94 1.165-.173.198-.347.223-.645.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.52.149-.174.198-.298.297-.497.099-.198.05-.372-.025-.521-.074-.148-.672-1.612-.921-2.208-.242-.579-.487-.5-.672-.51l-.572-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.262.489 1.693.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.413-.074-.119-.273-.198-.57-.347z"/>
                      </svg>
                    </a>
                  ) : (
                    <span>—</span>
                  )}
                </p>
                {usaConfirmacionSenia && (
                  <p className="text-sm">
                    <strong>Seña:</strong>{' '}
                    {appt.depositConfirmed
                      ? <span className="text-green-600">Confirmada</span>
                      : <span className="text-red-600">Pendiente</span>}
                  </p>
                )}
              </div>
            );
          })}
        </div>
      </div>
    );
  }

  // Lista de días
  return (
    <div className="p-4 max-w-4xl mx-auto">
      {dropdown}
      <h2 className="text-2xl font-bold text-center mb-6">
        Selecciona un día
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
        {dates.map(dateKey => {
          const count = byDate[dateKey].length;
          const dateObj = parseISO(byDate[dateKey][0].datetime);
          const raw = format(dateObj, "EEEE d 'de' MMMM", { locale: es });
          const title = raw
            .split(' ')
            .map(w => w.charAt(0).toUpperCase() + w.slice(1))
            .join(' ');
          return (
            <div
              key={dateKey}
              onClick={() => setSelectedDate(dateKey)}
              className="cursor-pointer bg-white rounded-lg shadow p-4 hover:shadow-lg transition"
            >
              <div className="text-lg font-medium">{title}</div>
              <div className="text-sm text-gray-500 mt-1">
                {count} turno{count !== 1 && 's'}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}
