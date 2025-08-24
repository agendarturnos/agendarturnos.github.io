import React from 'react';
import { useTenant } from '../TenantProvider';
import { db } from '../firebaseConfig';
import { doc, updateDoc } from 'firebase/firestore';

export default function AdminConfigScreen() {
  const { slug, usaConfirmacionSenia } = useTenant();

  const handleChange = async e => {
    const checked = e.target.checked;
    await updateDoc(doc(db, 'tenants', slug), {
      usaConfirmacionSenia: checked
    });
  };

  return (
    <div className="p-4">
      <label className="flex items-center space-x-2">
        <input
          type="checkbox"
          checked={!!usaConfirmacionSenia}
          onChange={handleChange}
        />
        <span>Trabajar con seña</span>
      </label>
    </div>
  );
}
