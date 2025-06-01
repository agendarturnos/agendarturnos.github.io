// src/components/AdminTabs.jsx
import React, { useState } from 'react';
import AdminServiceScreen   from './AdminServiceScreen';
import AdminProfessionalScreen from './AdminProfessionalScreen';
import AdminAppointmentsScreen from './AdminAppointmentsScreen';
import AdminCategoryScreen     from './AdminCategoryScreen';

export default function AdminTabs({
  services,
  stylists,
  appointments,
  categories,
  onAddService,
  onUpdateService,
  onDeleteService,
  onAddProfessional,
  onUpdateProfessional,
  onDeleteProfessional,
  onAddCategory,
  onUpdateCategory,
  onDeleteCategory
}) {
  const [tab, setTab] = useState('services');

  return (
    <div className="p-4">
      <div className="flex flex-wrap space-x-2 mb-4">
        <button
          onClick={() => setTab('services')}
          className={`px-4 py-2 my-2 rounded ${tab === 'services' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Servicios
        </button>
        <button
          onClick={() => setTab('professionals')}
          className={`px-4 py-2 my-2 rounded ${tab === 'professionals' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Profesionales
        </button>
        <button
          onClick={() => setTab('appointments')}
          className={`px-4 py-2 my-2 rounded ${tab === 'appointments' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Turnos
        </button>
        <button
          onClick={() => setTab('categories')}
          className={`px-4 py-2 my-2 rounded ${tab === 'categories' ? 'bg-blue-500 text-white' : 'bg-gray-200'}`}
        >
          Categorías
        </button>
      </div>
      <div>
        {tab === 'services' && (
          <AdminServiceScreen
            services={services}
            categories={categories}
            onAddService={onAddService}
            onUpdateService={onUpdateService}
            onDeleteService={onDeleteService}
          />
        )}
        {tab === 'professionals' && (
          <AdminProfessionalScreen
            services={services}
            stylists={stylists}
            onAddProfessional={onAddProfessional}
            onUpdateProfessional={onUpdateProfessional}
            onDeleteProfessional={onDeleteProfessional}
          />
        )}
        {tab === 'appointments' && (
          <AdminAppointmentsScreen
            stylists={stylists}
            appointments={appointments}
          />
        )}
        {tab === 'categories' && (
          <AdminCategoryScreen
            categories={categories}
            onAdd={onAddCategory}
            onUpdate={onUpdateCategory}
            onDelete={onDeleteCategory}
          />
        )}
      </div>
    </div>
  );
}
