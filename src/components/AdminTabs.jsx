// src/components/AdminTabs.jsx
import React, { useState } from 'react';
import AdminServiceScreen   from './AdminServiceScreen';
import AdminProfessionalScreen from './AdminProfessionalScreen';
import AdminAppointmentsScreen from './AdminAppointmentsScreen';
import AdminCategoryScreen     from './AdminCategoryScreen';

export default function AdminTabs({
  profile,
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
  const isAdmin = profile?.isAdmin;
  const [tab, setTab] = useState(isAdmin ? 'services' : 'appointments');

  return (
    <div className="p-2">
      <div className="flex flex-wrap space-x-2 mb-4">
        {isAdmin && (
          <button
            onClick={() => setTab('services')}
            className={`px-4 py-2 my-2 rounded ${tab === 'services' ? 'bg-[#f1bc8a] text-white' : 'bg-gray-200'}`}
          >
            Servicios
          </button>
        )}
        {isAdmin && (
          <button
            onClick={() => setTab('professionals')}
            className={`px-4 py-2 my-2 rounded ${tab === 'professionals' ? 'bg-[#f1bc8a] text-white' : 'bg-gray-200'}`}
          >
            Profesionales
          </button>
        )}
        <button
          onClick={() => setTab('appointments')}
          className={`px-4 py-2 my-2 rounded ${tab === 'appointments' ? 'bg-[#f1bc8a] text-white' : 'bg-gray-200'}`}
        >
          Turnos
        </button>
        {isAdmin && (
          <button
            onClick={() => setTab('categories')}
            className={`px-4 py-2 my-2 rounded ${tab === 'categories' ? 'bg-[#f1bc8a] text-white' : 'bg-gray-200'}`}
          >
            Categorías
          </button>
        )}
      </div>
      <div>
        {tab === 'services' && isAdmin && (
          <AdminServiceScreen
            services={services}
            categories={categories}
            onAddService={onAddService}
            onUpdateService={onUpdateService}
            onDeleteService={onDeleteService}
          />
        )}
        {tab === 'professionals' && isAdmin && (
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
            profile={profile}
            stylists={stylists}
            appointments={appointments}
          />
        )}
        {tab === 'categories' && isAdmin && (
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
