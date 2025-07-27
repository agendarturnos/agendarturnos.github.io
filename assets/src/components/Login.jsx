// src/components/Login.jsx
import React, { useState } from 'react';
import { useNavigate, useLocation, Link } from 'react-router-dom';
import { useTenant } from '../TenantProvider';
import {
  signInWithEmailAndPassword,
  createUserWithEmailAndPassword
} from 'firebase/auth';
import { auth, db } from '../firebaseConfig';
import { doc, setDoc } from 'firebase/firestore';
import { COUNTRY_CODES, AREA_CODES } from '../data/phone';

export default function Login() {
  const navigate = useNavigate();
  const location = useLocation();
  const { slug } = useTenant();
  const from = location.state?.from?.pathname || `/${slug}`;
  const fromState = location.state?.from?.state || {};

  const [email,     setEmail    ] = useState('');
  const [password,  setPassword ] = useState('');
  const [isRegister,setIsRegister] = useState(false);
  const [firstName, setFirstName] = useState('');
  const [lastName,  setLastName ] = useState('');
  const [phoneCode, setPhoneCode] = useState(COUNTRY_CODES[0].code);
  const [phoneArea, setPhoneArea] = useState(AREA_CODES[0].code);
  const [phone,     setPhone    ] = useState('');

  const handleAuth = async () => {
    try {
      if (isRegister) {
        if (!firstName || !lastName || !phone) {
          alert('Completa nombre, apellido y teléfono.');
          return;
        }
        const cred = await createUserWithEmailAndPassword(auth, email, password);
        const uid = cred.user.uid;
        await setDoc(doc(db, 'users', uid), {
          uid,
          firstName: firstName.trim(),
          lastName:  lastName.trim(),
          phone:     `${phoneCode}${phoneArea}${phone.trim()}`,
          email:     email.trim(),
          isAdmin:   false
        });
      } else {
        await signInWithEmailAndPassword(auth, email, password);
      }
      navigate(from, { replace: true, state: fromState });
    } catch (err) {
      let msg = err.message;
      if (isRegister) {
        if (err.code === 'auth/email-already-in-use') {
          msg = 'Ya existe una cuenta con ese correo.';
        } else if (err.code === 'auth/invalid-email') {
          msg = 'El correo no tiene un formato válido.';
        } else if (err.code === 'auth/weak-password') {
          msg = 'La contraseña es muy débil (mínimo 6 caracteres).';
        }
      } else {
        if (err.code === 'auth/user-not-found' || err.code === 'auth/wrong-password') {
          msg = 'Credenciales inválidas.';
        }
      }
      alert(msg);
    }
  };

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">
        {isRegister ? 'Registrarse' : 'Iniciar Sesión'}
      </h2>

      {isRegister && (
        <>
          <input
            type="text"
            placeholder="Nombre"
            value={firstName}
            onChange={e => setFirstName(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <input
            type="text"
            placeholder="Apellido"
            value={lastName}
            onChange={e => setLastName(e.target.value)}
            className="border p-2 w-full rounded"
          />
          <div className="flex space-x-3 ">
            <select
              value={phoneCode}
              onChange={e => setPhoneCode(e.target.value)}
              className="border p-2 rounded flex-shrink-0"
            >
              {COUNTRY_CODES.map(cc => (
                <option key={cc.code} value={cc.code}>
                  {cc.label} ({cc.code})
                </option>
              ))}
            </select>
            <input
              type="tel"
              placeholder="Prefijo"
              value={phoneArea}
              onChange={e => setPhoneArea(e.target.value.replace(/\D/, ''))}
              className="border p-2 w-1/4 rounded"
            />
            <input
              type="tel"
              placeholder="Celular"
              value={phone}
              onChange={e => setPhone(e.target.value.replace(/\D/, ''))}
              className="border p-2 w-2/4 rounded"
            />
          </div>
        </>
      )}

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
        onClick={handleAuth}
        className="w-full bg-[#f1bc8a] text-white py-2 rounded-full hover:bg-[#f1bc8a] transition"
      >
        {isRegister ? 'Registrarse' : 'Entrar'}
      </button>

      <div className="flex justify-between text-sm">
        <button
          onClick={() => setIsRegister(!isRegister)}
          className="text-[#f1bc8a] underline"
        >
          {isRegister ? 'Ya tengo cuenta' : 'Crear cuenta'}
        </button>
         <Link to={`/${slug}/reset-password`} className="text-[#f1bc8a] underline">
           Recuperar Contraseña
         </Link>
      </div>
    </div>
  );
}
