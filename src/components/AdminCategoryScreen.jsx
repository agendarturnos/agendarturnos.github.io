// src/components/AdminCategoryScreen.jsx
import React, { useState, useEffect } from 'react';

export default function AdminCategoryScreen({
  categories = [],
  onAdd,
  onUpdate,
  onDelete
}) {
  const [name, setName] = useState('');
  const [editingId, setEditingId] = useState(null);

  useEffect(() => {
    if (editingId) {
      const cat = categories.find(c => c.id === editingId);
      if (cat) setName(cat.name);
    }
  }, [editingId, categories]);

  const reset = () => {
    setName('');
    setEditingId(null);
  };

  const handleSubmit = () => {
    const data = { id: editingId, name: name.trim() };
    if (editingId) onUpdate(editingId, data);
    else onAdd({ name: name.trim() });
    reset();
  };

  const handleDelete = id => {
    if (window.confirm('¿Seguro querés eliminar esta categoría?')) {
      onDelete(id);
      if (editingId === id) reset();
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto space-y-6">
      <h2 className="text-xl font-bold text-center">
        {editingId ? 'Editar Categoría' : 'Agregar Categoría'}
      </h2>
      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nombre de categoría"
          value={name}
          onChange={e => setName(e.target.value)}
          className="w-full border p-2 rounded"
        />
        <button
          onClick={handleSubmit}
          className="w-full bg-[#f1bc8a] text-white py-2 rounded hover:bg-[#f1bc8a]"
        >
          {editingId ? 'Guardar Cambios' : 'Agregar Categoría'}
        </button>
      </div>

      {categories.length > 0 && (
        <ul className="space-y-2">
          {categories.map(cat => (
            <li
              key={cat.id}
              className="flex justify-between p-2 bg-white rounded shadow"
            >
              <span>{cat.name}</span>
              <div className="space-x-2">
                <button
                  onClick={() => setEditingId(cat.id)}
                  className="text-yellow-500 hover:text-yellow-600"
                >
                  Editar
                </button>
                <button
                  onClick={() => handleDelete(cat.id)}
                  className="text-red-500 hover:text-red-600"
                >
                  Eliminar
                </button>
              </div>
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
