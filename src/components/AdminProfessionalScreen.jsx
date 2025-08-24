// src/components/AdminProfessionalScreen.jsx
import React, { useState, useEffect } from 'react';

export default function AdminProfessionalScreen({
  services = [],
  stylists = [],
  onAddProfessional,
  onUpdateProfessional,
  onDeleteProfessional
}) {
  const daysOfWeek = ['Lunes','Martes','Miércoles','Jueves','Viernes','Sábado','Domingo'];

  const [name, setName] = useState('');
  const [alias, setAlias] = useState('');
  const [email, setEmail] = useState('');
  const [selected, setSelected] = useState([]);
  const [schedule, setSchedule] = useState({});
  const [exceptions, setExceptions] = useState([]);
  const [editingId, setEditingId] = useState(null);
  const [copyFrom, setCopyFrom] = useState(null);
  const [copyTargets, setCopyTargets] = useState([]);

  useEffect(() => {
    if (editingId) {
      const prof = stylists.find(s => s.id === editingId);
      if (prof) {
        setName(prof.name);
        setAlias(prof.alias || '');
        setEmail(prof.email || '');
        setSelected(prof.specialties || []);
        setSchedule(
          Object.fromEntries(
            Object.entries(prof.schedule || {}).map(([d, val]) => [
              d,
              Array.isArray(val) ? val : [val]
            ])
          )
        );
        setExceptions(prof.exceptions || []);
      }
    }
  }, [editingId, stylists]);

  const toggleSpecialty = svcName => {
    setSelected(sel =>
      sel.includes(svcName) ? sel.filter(x => x !== svcName) : [...sel, svcName]
    );
  };

  const toggleDay = day => {
    setSchedule(sc => {
      const copy = { ...sc };
      if (copy[day]) delete copy[day];
      else copy[day] = [{ from: '', to: '' }];
      return copy;
    });
  };

  const addBlock = day => {
    setSchedule(sc => ({
      ...sc,
      [day]: [...(sc[day] || []), { from: '', to: '' }]
    }));
  };

  const removeBlock = (day, idx) => {
    setSchedule(sc => ({
      ...sc,
      [day]: sc[day].filter((_, i) => i !== idx)
    }));
  };

  const startCopy = day => {
    setCopyFrom(day);
    setCopyTargets([]);
  };

  const toggleCopyTarget = target => {
    setCopyTargets(ts =>
      ts.includes(target) ? ts.filter(t => t !== target) : [...ts, target]
    );
  };

  const confirmCopy = () => {
    if (!copyFrom || copyTargets.length === 0) {
      cancelCopy();
      return;
    }
    setSchedule(sc => {
      const blocks = (sc[copyFrom] || []).map(b => ({ ...b }));
      const copy = { ...sc };
      copyTargets.forEach(t => {
        copy[t] = blocks.map(b => ({ ...b }));
      });
      return copy;
    });
    cancelCopy();
  };

  const cancelCopy = () => {
    setCopyFrom(null);
    setCopyTargets([]);
  };

  const setTime = (day, idx, field, value) => {
    setSchedule(sc => ({
      ...sc,
      [day]: sc[day].map((b, i) =>
        i === idx ? { ...b, [field]: value } : b
      )
    }));
  };

  const addException = date => {
    if (date && !exceptions.includes(date)) {
      setExceptions(ex => [...ex, date]);
    }
  };

  const removeException = date => {
    setExceptions(ex => ex.filter(d => d !== date));
  };

  const resetForm = () => {
    setName('');
    setAlias('');
    setEmail('');
    setSelected([]);
    setSchedule({});
    setExceptions([]);
    setEditingId(null);
  };

  const handleSubmit = () => {
    const data = {
      name,
      alias: alias.trim(),
      email: email.trim(),
      specialties: selected,
      schedule,
      exceptions
    };
    if (editingId) {
      onUpdateProfessional(editingId, data);
    } else {
      onAddProfessional(data);
    }
    resetForm();
  };

  const handleDelete = id => {
    if (window.confirm('¿Estás seguro de eliminar este profesional?')) {
      onDeleteProfessional(id);
      if (editingId === id) resetForm();
    }
  };

  return (
    <div className="p-4 max-w-xl mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">
        {editingId ? 'Editar Profesional' : 'Agregar Profesional'}
      </h2>

      <div className="space-y-4">
        <input
          type="text"
          placeholder="Nombre"
          value={name}
          onChange={e => setName(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="text"
          placeholder="Alias de pago"
          value={alias}
          onChange={e => setAlias(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <input
          type="email"
          placeholder="Email"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />

        <div>
          <h3 className="font-medium mb-2">Especialidades</h3>
          <div className="grid grid-cols-2 gap-2">
            {services.map(svc => (
              <label key={svc.id} className="flex items-center">
                <input
                  type="checkbox"
                  checked={selected.includes(svc.name)}
                  onChange={() => toggleSpecialty(svc.name)}
                  className="mr-2"
                />
                {svc.name}
              </label>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Horarios de trabajo</h3>
          <div className="space-y-2">
            {daysOfWeek.map(day => (
              <div key={day} className="space-y-1">
                <div className="flex items-center space-x-2">
                  <input
                    type="checkbox"
                    checked={Boolean(schedule[day])}
                    onChange={() => toggleDay(day)}
                  />
                  <span className="w-20">{day}</span>
                  {schedule[day] && (
                    <>
                      <button
                        type="button"
                        onClick={() => addBlock(day)}
                        className="bg-[#5bcf85] text-white w-6 h-6 rounded-full flex items-center justify-center"
                        title="Agregar bloque"
                      >
                        +
                      </button>
                      <button
                        type="button"
                        onClick={() => startCopy(day)}
                        className="bg-[#c2956b] text-white w-6 h-6 rounded-full flex items-center justify-center ml-1"
                        title="Copiar a otros"
                      >
                        ⎘
                      </button>
                    </>
                  )}
                </div>
                {schedule[day] &&
                  schedule[day].map((block, i) => (
                    <div key={i} className="flex items-center space-x-2 ml-8">
                      <input
                        type="time"
                        value={block.from}
                        onChange={e => setTime(day, i, 'from', e.target.value)}
                        className="border p-1 rounded"
                      />
                      <span>a</span>
                      <input
                        type="time"
                        value={block.to}
                        onChange={e => setTime(day, i, 'to', e.target.value)}
                        className="border p-1 rounded"
                      />
                      {schedule[day].length > 1 && (
                        <button
                          type="button"
                          onClick={() => removeBlock(day, i)}
                          className="text-red-500"
                        >
                          x
                        </button>
                      )}
                    </div>
                  ))}
                {copyFrom === day && (
                  <div className="ml-8 bg-gray-100 p-2 rounded shadow space-y-2">
                    <div className="flex flex-wrap gap-2">
                      {daysOfWeek
                        .filter(d => d !== day)
                        .map(other => (
                          <label
                            key={other}
                            className="flex items-center space-x-1"
                          >
                            <input
                              type="checkbox"
                              checked={copyTargets.includes(other)}
                              onChange={() => toggleCopyTarget(other)}
                            />
                            <span>{other}</span>
                          </label>
                        ))}
                    </div>
                    <div className="flex space-x-2">
                      <button
                        type="button"
                        onClick={confirmCopy}
                        className="bg-[#c2956b] text-white px-2 py-1 rounded"
                      >
                        Copiar
                      </button>
                      <button
                        type="button"
                        onClick={cancelCopy}
                        className="bg-gray-300 px-2 py-1 rounded"
                      >
                        Cancelar
                      </button>
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>

        <div>
          <h3 className="font-medium mb-2">Excepciones (Feriados)</h3>
          <div className="flex space-x-2 mb-2">
            <input id="exc-date" type="date" className="border p-1 rounded" />
            <button
              onClick={() => addException(document.getElementById('exc-date').value)}
              className="bg-[#5bcf85] text-white px-3 py-1 rounded"
            >
              Agregar
            </button>
          </div>
          <ul className="list-disc pl-5 space-y-1">
            {exceptions.map(date => (
              <li key={date} className="flex justify-between items-center">
                <span>{date}</span>
                <button
                  onClick={() => removeException(date)}
                  className="text-red-500"
                >
                  Eliminar
                </button>
              </li>
            ))}
          </ul>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[#f1bc8a] text-white py-2 rounded-full hover:bg-[#f1bc8a] transition"
        >
          {editingId ? 'Guardar Cambios' : 'Agregar Profesional'}
        </button>
      </div>

      {stylists.length > 0 && (
        <div className="space-y-2">
          <h3 className="font-medium">Lista de Profesionales</h3>
          <ul className="space-y-2">
            {stylists.map(st => (
              <li
                key={st.id}
                className="bg-white rounded-2xl shadow p-4 flex flex-col sm:flex-row sm:justify-between sm:items-center"
              >
                <div>
                  <p className="font-semibold">{st.name}</p>
                  <p className="text-sm text-gray-500">
                    {st.specialties?.join(', ') || 'Sin especialidades'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Alias de pago: {st.alias || '—'}
                  </p>
                  <p className="text-sm text-gray-500">
                    Email: {st.email || '—'}
                  </p>
                </div>
                <div className="flex space-x-2 mt-2 self-end sm:mt-0 sm:self-auto">
                  <button
                    onClick={() => setEditingId(st.id)}
                    className="text-yellow-500 hover:text-yellow-600 transition"
                  >
                    Editar
                  </button>
                  <button
                    onClick={() => handleDelete(st.id)}
                    className="text-red-500 hover:text-red-600 transition"
                  >
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        </div>
      )}
    </div>
  );
}
