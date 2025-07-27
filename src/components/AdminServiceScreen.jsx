// src/components/AdminServiceScreen.jsx
import React, { useState, useEffect } from 'react';
import { useTenant } from '../TenantProvider';

export default function AdminServiceScreen({
  services,
  categories,
  onAddService,
  onUpdateService,
  onDeleteService
}) {
  const { usaConfirmacionSenia } = useTenant() || {};
  const initialForm = {
    id: '',
    name: '',
    description: '',
    price: '',
    duration: '',
    senia: '',
    categoryId: ''
  };
  const [form, setForm] = useState(initialForm);

  // Cuando selecciono un servicio para editar, cargo el form con su id real
  useEffect(() => {
    if (form.id) {
      const svc = services.find(s => s.id === form.id);
      if (svc) {
        setForm({
          id: svc.id,
          name: svc.name,
          description: svc.description,
          price: String(svc.price),
          duration: String(svc.duration),
          senia: String(svc.senia ?? 0),
          categoryId: svc.categoryId || ''
        });
      }
    }
  }, [form.id, services]);

  const handleChange = e => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
  };

  const handleSubmit = e => {
    e.preventDefault();
    const data = {
      name: form.name.trim(),
      description: form.description.trim(),
      price: Number(form.price),
      duration: Number(form.duration),
      senia: usaConfirmacionSenia ? Number(form.senia) : 0,
      categoryId: form.categoryId
    };
    if (form.id) {
      onUpdateService(form.id, { id: form.id, ...data });
    } else {
      onAddService(data);
    }
    setForm(initialForm);
  };

  const startEdit = id => {
    setForm(f => ({ ...f, id }));
  };

  const handleDelete = id => {
    if (window.confirm('¿Estás seguro de eliminar este servicio?')) {
      onDeleteService(id);
      if (form.id === id) setForm(initialForm);
    }
  };

  return (
    <div className="p-4">
      <form onSubmit={handleSubmit} className="space-y-4 mb-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="name"
            value={form.name}
            onChange={handleChange}
            placeholder="Nombre del servicio"
            className="border p-2 rounded w-full"
          />
          <input
            name="description"
            value={form.description}
            onChange={handleChange}
            placeholder="Descripción"
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <input
            name="price"
            type="number"
            value={form.price}
            onChange={handleChange}
            placeholder="Precio ($)"
            className="border p-2 rounded w-full"
          />
          <input
            name="duration"
            type="number"
            value={form.duration}
            onChange={handleChange}
            placeholder="Duración (min)"
            className="border p-2 rounded w-full"
          />
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          {usaConfirmacionSenia && (
            <input
              name="senia"
              type="number"
              value={form.senia}
              onChange={handleChange}
              placeholder="Seña ($)"
              className="border p-2 rounded w-full"
            />
          )}
          <select
            name="categoryId"
            value={form.categoryId}
            onChange={handleChange}
            className="border p-2 rounded w-full"
          >
            <option value="">Categoría</option>
            {categories.map(cat => (
              <option key={cat.id} value={cat.id}>
                {cat.name}
              </option>
            ))}
          </select>
        </div>
        <button
          type="submit"
          className="w-full bg-[#f1bc8a] text-white py-2 rounded-full hover:bg-[#f1bc8a] transition"
        >
          {form.id ? 'Guardar cambios' : 'Agregar servicio'}
        </button>
      </form>

      <ul className="space-y-2">
        {services.map(svc => (
          <li
            key={svc.id}
            className="bg-white rounded-2xl shadow p-4 flex justify-between items-start"
          >
            <div>
              <p className="font-semibold">{svc.name}</p>
              <p className="text-sm text-gray-600">{svc.description}</p>
              <p className="text-sm text-gray-600">
                Categoría:{' '}
                {categories.find(c => c.id === svc.categoryId)?.name || '—'}
              </p>
              <p className="text-sm text-gray-600">Precio: ${svc.price}</p>
              {usaConfirmacionSenia && (
                <p className="text-sm text-gray-600">
                  Seña: ${svc.senia ?? 0}
                </p>
              )}
              <p className="text-sm text-gray-600">
                Duración: {svc.duration} min
              </p>
            </div>
            <div className="flex flex-col space-y-1">
              <button
                onClick={() => startEdit(svc.id)}
                className="text-[#f1bc8a] hover:text-[#f1bc8a] transition"
              >
                Editar
              </button>
              <button
                onClick={() => handleDelete(svc.id)}
                className="text-red-500 hover:text-red-600 transition"
              >
                Eliminar
              </button>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
