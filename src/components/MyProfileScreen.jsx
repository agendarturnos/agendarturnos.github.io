import React, { useState, useEffect } from 'react';
import { doc, updateDoc } from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useAuth } from '../AuthProvider';
import { COUNTRY_CODES, AREA_CODES } from '../data/phone';

export default function MyProfileScreen() {
  const { user, profile, setProfile } = useAuth();
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [phoneCode, setPhoneCode] = useState(COUNTRY_CODES[0].code);
  const [phoneArea, setPhoneArea] = useState(AREA_CODES[0].code);
  const [phoneNumber, setPhoneNumber] = useState('');

  useEffect(() => {
    if (profile) {
      setFirstName(profile.firstName || '');
      setLastName(profile.lastName || '');
      const p = profile.phone || '';
      if (p) {
        setPhoneCode(p.slice(0, 3));
        setPhoneNumber(p.slice(3));
      } else {
        setPhoneCode(COUNTRY_CODES[0].code);
        setPhoneNumber('');
      }
    }
  }, [profile]);

  const handleSave = async () => {
    if (!firstName.trim() || !lastName.trim()) {
      alert('Completa nombre y apellido');
      return;
    }
    try {
      const updatedProfile = {
        firstName: firstName.trim(),
        lastName: lastName.trim(),
        phone: `${phoneCode}${phoneNumber.trim()}`,
      };
      await updateDoc(doc(db, 'users', user.uid), updatedProfile);
      setProfile(prev => ({ ...prev, ...updatedProfile }));
      alert('Datos actualizados');
    } catch (err) {
      alert('Error al guardar');
    }
  };

  if (!user) return null;

  return (
    <div className="p-4 max-w-sm mx-auto space-y-4">
      <h2 className="text-2xl font-bold text-center">Mi Perfil</h2>
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
      <div className="flex space-x-3">
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
          placeholder="Celular"
          value={phoneNumber}
          onChange={e => setPhoneNumber(e.target.value.replace(/\D/, ''))}
          className="border p-2 w-2/4 rounded"
        />
      </div>
      <button
        onClick={handleSave}
        className="w-full bg-[#f1bc8a] text-white py-2 rounded-full hover:bg-[#f1bc8a] transition"
      >
        Guardar Cambios
      </button>
    </div>
  );
}
