import React, { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { collection, getDocs } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTenant } from '../TenantProvider';

export default function StylistSelectionScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const service = state?.service;
  const { slug } = useTenant();

  // Si no hay servicio, volvemos al listado
  useEffect(() => {
    if (!service) {
      navigate(`/${slug}`, { replace: true });
    }
  }, [service, navigate]);

  const [stylists, setStylists] = useState([]);
  const [loading, setLoading] = useState(true);

  // Cargar profesionales
  useEffect(() => {
    async function fetchStylists() {
      const snap = await getDocs(collection(db, 'stylists'));
      setStylists(snap.docs.map(d => ({ id: d.id, ...d.data() })));
      setLoading(false);
    }
    fetchStylists();
  }, []);

  if (!service) return null;
  if (loading) return <p className="p-4 text-center">Cargando profesionales...</p>;

  // Filtrar por service.name en lugar de service.type
  const disponibles = stylists.filter(
    st =>
      Array.isArray(st.specialties) &&
      st.specialties.includes(service.name)
  );

  return (
    <div className="p-4 max-w-lg mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">
        Profesionales para {service.name}
      </h2>

      {disponibles.length > 0 ? (
        <div className="space-y-4">
          {disponibles.map(st => (
            <div
              key={st.id}
              className="bg-white rounded-2xl shadow p-4 flex items-center justify-between"
            >
              <div>
                <h3 className="text-lg font-medium">{st.name}</h3>
              </div>
              <button
                onClick={() =>
                  navigate(`/${slug}/professional`, { state: { service, stylist: st } })
                }
                className="py-2 px-4 h5 text-capitalize border border-[#f1bc8a] text-[#f1bc8a] rounded-full hover:bg-[#f1bc8a] hover:text-white transition"
              >
                Seleccionar
              </button>
            </div>
          ))}
        </div>
      ) : (
        <p className="text-center text-gray-500">
          No hay profesionales disponibles para este servicio.
        </p>
      )}
    </div>
  );
}
