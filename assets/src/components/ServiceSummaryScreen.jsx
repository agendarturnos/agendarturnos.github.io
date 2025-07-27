import React from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useTenant } from '../TenantProvider';

export default function ServiceSummaryScreen() {
  const navigate = useNavigate();
  const { state } = useLocation();
  const service = state?.service;
  const { usaConfirmacionSenia, slug } = useTenant();

  if (!service) {
    return (
      <div className="p-4 text-center">
        <p className="text-gray-500 mb-4">No se encontró el servicio seleccionado.</p>
        <button
          onClick={() => navigate(`/${slug}`)}
          className="text-[#f1bc8a] underline"
        >
          Volver al menú
        </button>
      </div>
    );
  }

  return (
    <div className="p-4 max-w-md mx-auto">
      <h2 className="text-2xl font-bold text-center mb-6">Resumen de Servicio</h2>
      <div className="bg-white rounded-2xl shadow p-6 flex flex-col">
        <h3 className="text-lg font-semibold mb-4">{service.name}</h3>
        <p className="text-gray-600 mb-2">Precio: ${service.price}</p>
        <p className="text-gray-600 mb-2">{usaConfirmacionSenia && ` Seña: $${service.senia}`}</p>
        <p className="text-gray-600 mb-6">Duración: {service.duration} min</p>
        <button
          onClick={() => navigate(`/${slug}/stylists`, { state: { service } })}
          className="mt-auto h4 text-capitalize w-full py-2 border border-[#f1bc8a] text-[#f1bc8a] rounded-full hover:bg-[#f1bc8a] hover:text-white transition"
        >
          Elegir Profesional
        </button>
      </div>
    </div>
  );
}
