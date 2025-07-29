import React, { useState } from 'react';

export default function TenantSignup() {
  const [slug, setSlug] = useState('');
  const [projectName, setProjectName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  const handleSubmit = async e => {
    e.preventDefault();
    setLoading(true);
    setMessage('');
    try {
      const res = await fetch('/createTenant', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ slug: slug.trim(), projectName: projectName.trim(), email: email.trim(), password })
      });
      const text = await res.text();
      if (!res.ok) throw new Error(text);
      setMessage('Cuenta creada correctamente');
      setSlug('');
      setProjectName('');
      setEmail('');
      setPassword('');
    } catch (err) {
      setMessage(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-md mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">Crear Cuenta</h2>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div className="flex items-center space-x-2">
          <span>agendarturnos.ar/</span>
          <input
            className="border p-2 rounded flex-grow"
            value={slug}
            onChange={e => setSlug(e.target.value.replace(/\s+/g, ''))}
            placeholder="slug"
            required
          />
        </div>
        <input
          className="border p-2 rounded w-full"
          value={projectName}
          onChange={e => setProjectName(e.target.value)}
          placeholder="Nombre del Proyecto"
        />
        <input
          type="email"
          className="border p-2 rounded w-full"
          value={email}
          onChange={e => setEmail(e.target.value)}
          placeholder="Email"
          required
        />
        <input
          type="password"
          className="border p-2 rounded w-full"
          value={password}
          onChange={e => setPassword(e.target.value)}
          placeholder="Contraseña"
          required
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f1bc8a] text-white py-2 rounded-full"
        >
          {loading ? 'Procesando...' : 'Crear y Pagar'}
        </button>
      </form>
      {message && <p className="text-center text-red-500">{message}</p>}
    </div>
  );
}
