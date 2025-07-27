// src/components/ServiceListScreen.jsx
import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { collection, getDocs, query, where } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTenant } from '../TenantProvider';

export default function ServiceListScreen() {
  const { companyId, slug, usaConfirmacionSenia } = useTenant();
  const [services, setServices] = useState([]);
  const [categories, setCategories] = useState([]);
  const [selectedCat, setSelectedCat] = useState('');


  useEffect(() => {
    async function fetchServices() {
      const q = query(
        collection(db, 'services'),
        where('companyId', '==', companyId)
      );
      const snap = await getDocs(q);
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchServices();
  }, []);

  useEffect(() => {
    async function fetchCategories() {
      const q = query(
        collection(db, 'categories'),
        where('companyId', '==', companyId)
      );
      const snap = await getDocs(q);
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })));
    }
    fetchCategories();
  }, []);

  // Filtrar por categoría
  const filtered = selectedCat
    ? services.filter(svc => svc.categoryId === selectedCat)
    : services;

  return (
    <div className="p-4">
      {/* Título con nombre de proyecto */}
      <h2 className="text-2xl font-semibold text-center mb-6">Servicios</h2>
  
      {/* Botones de categoría */}
      <div className="flex flex-wrap justify-center gap-2 mb-6">
        <button
          onClick={() => setSelectedCat('')}
          className={`px-4 py-1 rounded-full text-sm ${
            selectedCat === ''
              ? 'bg-[#f1bc8a] text-white'
              : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
          }`}
        >
          Todos
        </button>
        {categories.map(cat => (
          <button
            key={cat.id}
            onClick={() => setSelectedCat(cat.id)}
            className={`px-4 py-1 rounded-full text-sm ${
              selectedCat === cat.id
                ? 'bg-[#f1bc8a] text-white'
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            {cat.name}
          </button>
        ))}
      </div>
<hr className='mb-6' />
      {/* Grid de servicios */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {filtered.map(svc => (
          <div
            key={svc.id}
            className="bg-white rounded-2xl shadow p-6 flex flex-col"
          >
            <h3 className="text-lg font-semibold mb-1 text-center">{svc.name}</h3>
            <p className="mb-2 text-center">{svc.description}</p>
            <p className="text-gray-600 text-center">
              Precio: ${svc.price}
              {usaConfirmacionSenia && ` – Seña: ${svc.senia}`}
            </p>
            <p className="text-gray-600 mb-4 text-center">
              Duración: {svc.duration} min
            </p>
            <Link
              to={`/${slug}/summary`}
              state={{ service: svc }}
              className="mt-auto h4 text-capitalize w-full py-2 border border-[#f1bc8a] text-[#f1bc8a] rounded-full text-center hover:bg-[#f1bc8a] hover:text-white transition"
            >
              Elegir
            </Link>
          </div>
        ))}
        {filtered.length === 0 && (
          <p className="col-span-full text-center text-gray-500">
            No hay servicios en esta categoría.
          </p>
        )}
      </div>
    </div>
  );
}
