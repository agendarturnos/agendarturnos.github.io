// src/components/PasswordReset.jsx
import React, { useState } from 'react';
import { sendPasswordResetEmail } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { Link } from 'react-router-dom';
import { useTenant } from '../TenantProvider';

export default function PasswordReset() {
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState({ type: '', message: '' });
  const [loading, setLoading] = useState(false);
  const { slug } = useTenant();

  const handleReset = async e => {
    e.preventDefault();
    setStatus({ type: '', message: '' });
    if (!email) {
      setStatus({ type: 'error', message: 'Por favor ingresa tu correo.' });
      return;
    }
    setLoading(true);
    try {
      await sendPasswordResetEmail(auth, email);
      setStatus({
        type: 'success',
        message:
          'Si el correo existe, recibirás un enlace para restablecer tu contraseña.'
      });
    } catch (err) {
      let msg = 'Ocurrió un error. Intenta nuevamente.';
      if (err.code === 'auth/invalid-email') {
        msg = 'El correo no tiene un formato válido.';
      } else if (err.code === 'auth/user-not-found') {
        msg =
          'No existe una cuenta con ese correo. Verifica e inténtalo de nuevo.';
      }
      setStatus({ type: 'error', message: msg });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto space-y-6">
      <h2 className="text-2xl font-bold text-center">Recuperar contraseña</h2>
      {status.message && (
        <p
          className={`text-sm p-2 rounded ${
            status.type === 'success'
              ? 'bg-[#f1bc8a] text-green-800'
              : 'bg-red-100 text-red-800'
          }`}
        >
          {status.message}
        </p>
      )}
      <form onSubmit={handleReset} className="space-y-4">
        <input
          type="email"
          placeholder="Tu correo electrónico"
          value={email}
          onChange={e => setEmail(e.target.value)}
          className="border p-2 w-full rounded"
        />
        <button
          type="submit"
          disabled={loading}
          className="w-full bg-[#f1bc8a] text-white py-2 rounded-full hover:bg-[#f1bc8a] transition disabled:opacity-50"
        >
          {loading ? 'Enviando…' : 'Enviar enlace de recuperación'}
        </button>
      </form>
      <div className="text-center text-sm">
        <Link to={`/${slug}/login`} className="text-[#f1bc8a] underline">
          Volver al login
        </Link>
      </div>
    </div>
  );
}
