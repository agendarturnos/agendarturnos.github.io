import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { signInWithEmailAndPassword, signOut } from 'firebase/auth';
import { collection, query, where, getDocs } from 'firebase/firestore';
import { auth, db } from '../firebaseConfig';
import { useAuth } from '../AuthProvider';

export default function PortalLogin() {
  const navigate = useNavigate();
  const { user, profile } = useAuth();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');

  useEffect(() => {
    async function redirectIfLoggedIn() {
      if (!user || !profile) return;
      if (!profile.companyId || (!profile.isAdmin && !profile.isProfesional)) {
        alert('Acceso no autorizado.');
        await signOut(auth);
        return;
      }
      const snap = await getDocs(
        query(collection(db, 'tenants'), where('companyId', '==', profile.companyId))
      );
      if (snap.empty) {
        alert('No se encontró empresa asociada.');
        await signOut(auth);
        return;
      }
      const slug = snap.docs[0].id;
      navigate(`/${slug}`, { replace: true });
    }
    redirectIfLoggedIn();
  }, [user, profile, navigate]);

  const handleLogin = async () => {
    try {
      await signInWithEmailAndPassword(auth, email, password);
    } catch (err) {
      let msg = err.message;
      if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
        msg = 'Credenciales inválidas.';
      } else if (err.code === 'auth/invalid-email') {
        msg = 'El correo no tiene un formato válido.';
      }
      alert(msg);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">Iniciar Sesión</h2>
      <input
        type="email"
        placeholder="Email"
        value={email}
        onChange={e => setEmail(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <input
        type="password"
        placeholder="Contraseña"
        value={password}
        onChange={e => setPassword(e.target.value)}
        className="border p-2 w-full rounded"
      />
      <button
        onClick={handleLogin}
        className="w-full bg-[#f1bc8a] text-white py-2 rounded-full hover:bg-[#f1bc8a] transition"
      >
        Entrar
      </button>
    </div>
  );
}
