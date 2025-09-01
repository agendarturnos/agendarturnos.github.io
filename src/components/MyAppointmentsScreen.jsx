// src/components/MyAppointmentsScreen.jsx
import React, { useState, useEffect, useMemo } from 'react';
import {
  collection,
  query,
  where,
  getDocs,
  deleteDoc,
  doc
} from 'firebase/firestore';
import { format, parseISO } from 'date-fns';
import { es } from 'date-fns/locale';
import { db, auth } from '../firebaseConfig';
import { useTenant } from '../TenantProvider';

export default function MyAppointmentsScreen() {
  const [appointments, setAppointments] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [services, setServices] = useState([]);
  const [loading, setLoading] = useState(true);
  const { usaConfirmacionSenia } = useTenant() || {};

  // Fetch my appointments
  useEffect(() => {
    async function fetchMyTurns() {
      const q = query(
        collection(db, 'appointments'),
        where('clientId', '==', auth.currentUser.uid)
      );
      const snap = await getDocs(q);
      const now = new Date();
      const data = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(a => parseISO(a.datetime) >= now);
      data.sort((a, b) => parseISO(a.datetime) - parseISO(b.datetime));
      setAppointments(data);
      setLoading(false);
    }
    fetchMyTurns();
  }, []);

  // Fetch professionals to get their aliases
  useEffect(() => {
    async function fetchStylists() {
      const snap = await getDocs(collection(db, 'stylists'));
      setStylists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchStylists();
  }, []);

  // Fetch services to get their deposit (seña) values
  useEffect(() => {
    async function fetchServices() {
      const snap = await getDocs(collection(db, 'services'));
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchServices();
  }, []);

  // Map stylistId → alias
  const aliasMap = useMemo(() => {
    const m = {};
    stylists.forEach(s => {
      m[s.id] = s.alias || '';
    });
    return m;
  }, [stylists]);

  // Map serviceId → service data
  const serviceMap = useMemo(() => {
    const m = {};
    services.forEach(s => {
      m[s.id] = s;
    });
    return m;
  }, [services]);

  const handleCancel = async (id, datetime) => {
    const diff = new Date(datetime) - new Date();
    if (diff < 1000 * 60 * 60 * 24) return;
    if (!window.confirm('¿Estás seguro de que quieres cancelar este turno?'))
      return;
    try {
      await deleteDoc(doc(db, 'appointments', id));
      setAppointments(prev => prev.filter(a => a.id !== id));
      alert('Turno cancelado correctamente.');
    } catch {
      alert('Error al cancelar el turno.');
    }
  };

  const fallbackCopy = text => {
    const textarea = document.createElement('textarea');
    textarea.value = text;
    textarea.style.position = 'fixed';
    textarea.style.top = '0';
    textarea.style.left = '0';
    textarea.style.width = '1px';
    textarea.style.height = '1px';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.focus();
    textarea.select();
    try {
      document.execCommand('copy');
      alert('Alias copiado al portapapeles');
    } catch {
      alert('Error al copiar alias');
    }
    document.body.removeChild(textarea);
  };

  const copyToClipboard = text => {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard
        .writeText(text)
        .then(() => alert('Alias copiado al portapapeles'))
        .catch(() => fallbackCopy(text));
    } else {
      fallbackCopy(text);
    }
  };

  if (loading) {
    return <p className="p-4 text-center">Cargando tus turnos…</p>;
  }

  return (
    <div className="p-4 max-w-lg mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">Mis Turnos</h2>
      <p className="text-sm text-gray-500 text-center">
        Sólo puedes cancelar hasta 24 hs antes del turno.
      </p>

      {appointments.length > 0 ? (
        <ul className="space-y-4">
          {appointments.map(a => {
            const apptDate = new Date(a.datetime);
            const canCancel = apptDate - new Date() >= 1000 * 60 * 60 * 24;
            const depositConfirmed = !!a.depositConfirmed;
            const stylistAlias = aliasMap[a.stylistId];
            const service = serviceMap[a.serviceId] || {};
            const depositValue = service.senia;

            return (
              <li
                key={a.id}
                className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div className="flex-1 space-y-1">
                  <p className="font-semibold text-lg">{a.serviceName}</p>
                  <p className="text-gray-600 text-sm">Con {a.stylistName}</p>

                  {/* Valor de la seña (tomado del servicio) */}
                  {usaConfirmacionSenia && depositValue != null && (
                    <p className="text-gray-700 text-sm">
                      Valor de la seña: ${depositValue}
                    </p>
                  )}

                  {/* Alias de pago */}
                  { stylistAlias && (
                    <div className="flex items-center text-sm text-gray-700">
                      <span>Alias de pago: {stylistAlias}</span>
                      <button
                        onClick={() => copyToClipboard(stylistAlias)}
                        type="button"
                        className="ml-2 inline-flex items-center text-gray-500 hover:text-gray-700"
                        aria-label="Copiar alias"
                      >
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          viewBox="0 0 24 24"
                          width="16"
                          height="16"
                          fill="currentColor"
                        >
                          <path d="M16 1H4a2 2 0 00-2 2v14h2V3h12V1z" />
                          <path d="M20 5H8a2 2 0 00-2 2v14a2 2 0 002 2h12a2 2 0 002-2V7a2 2 0 00-2-2zm0 16H8V7h12v14z" />
                        </svg>
                      </button>
                    </div>
                  )}

                  <p className="text-gray-500 text-sm">
                    {format(apptDate, "PPP 'a las' p", { locale: es })}
                  </p>

                  {usaConfirmacionSenia && (
                    <div className="flex space-x-2">
                      <span
                        className={`inline-block px-2 py-1 rounded-full text-xs font-medium ${
                          depositConfirmed
                            ? 'bg-[#f1bc8a] text-green-800'
                            : 'bg-yellow-100 text-yellow-800'
                        }`}
                      >
                        Seña {depositConfirmed ? 'Confirmada' : 'Pendiente'}
                      </span>
                    </div>
                  )}
                </div>

                <div className="mt-3 sm:mt-0 flex flex-col sm:flex-row sm:items-center sm:space-x-2">
                  {canCancel && (
                    <button
                      onClick={() => handleCancel(a.id, a.datetime)}
                      className="w-full sm:w-auto bg-red-500 text-white px-4 py-2 rounded-full text-sm hover:bg-red-600 transition"
                    >
                      Cancelar
                    </button>
                  )}
                </div>
              </li>
            );
          })}
        </ul>
      ) : (
        <p className="text-center text-gray-500">
          No tienes turnos reservados.
        </p>
      )}
    </div>
  );
}
