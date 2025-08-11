// src/routes/AdminRouter.jsx
import React, { useState, useEffect } from 'react';
import AdminTabs from '../components/AdminTabs';
import {
  collection,
  addDoc,
  updateDoc,
  deleteDoc,
  doc,
  query,
  where,
  onSnapshot,
  getDocs
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTenant } from '../TenantProvider';

export default function AdminRouter({ profile }) {
  const { companyId } = useTenant();
  const [services, setServices] = useState([]);
  const [stylists, setStylists] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [categories, setCategories] = useState([]);
  const [myStylistId, setMyStylistId] = useState(null);

  useEffect(() => {
    const qServices = query(
      collection(db, 'services'),
      where('companyId', '==', companyId)
    );
    const unsubServices = onSnapshot(qServices, snap =>
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const qCategories = query(
      collection(db, 'categories'),
      where('companyId', '==', companyId)
    );
    const unsubCategories = onSnapshot(qCategories, snap =>
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubServices();
      unsubCategories();
    };
  }, [companyId]);

  useEffect(() => {
    const qStylists = query(
      collection(db, 'stylists'),
      where('companyId', '==', companyId)
    );
    const unsubStylists = onSnapshot(qStylists, snap => {
      const list = snap.docs.map(d => ({ id: d.id, ...d.data() }));
      setStylists(list);
      if (profile?.isProfesional) {
        const me = list.find(s => s.email === profile.email);
        setMyStylistId(me ? me.id : null);
      }
    });
    return () => unsubStylists();
  }, [companyId, profile]);

  useEffect(() => {
    const qAppointments = query(
      collection(db, 'appointments'),
      where('companyId', '==', companyId)
    );
    const unsubAppointments = onSnapshot(qAppointments, snap => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      let list = snap.docs
        .map(d => ({ id: d.id, ...d.data() }))
        .filter(a => new Date(a.datetime) >= today);
      if (profile?.isProfesional && myStylistId) {
        list = list.filter(a => a.stylistId === myStylistId);
      }
      setAppointments(list);
    });
    return () => unsubAppointments();
  }, [companyId, profile, myStylistId]);

  // Al crear, añadimos companyId en los campos
  const handleAddService = async data => {
    await addDoc(collection(db, 'services'), {
      ...data,
      companyId: companyId
    });
  };
  const handleUpdateService = async (id, data) => {
    await updateDoc(doc(db, 'services', id), {
      ...data,
      companyId: companyId
    });
  };
  const handleDeleteService = async id => {
    await deleteDoc(doc(db, 'services', id));
  };

  const handleAddProfessional = async data => {
    await addDoc(collection(db, 'stylists'), {
      ...data,
      companyId: companyId
    });
    if (data.email) {
      const q = query(collection(db, 'users'), where('email', '==', data.email));
      const snap = await getDocs(q);
      await Promise.all(
        snap.docs.map(u =>
          u.data().isProfesional
            ? Promise.resolve()
            : updateDoc(u.ref, { isProfesional: true })
        )
      );
    }
  };
  const handleUpdateProfessional = async (id, data) => {
    await updateDoc(doc(db, 'stylists', id), {
      ...data,
      companyId: companyId
    });
    if (data.email) {
      const q = query(collection(db, 'users'), where('email', '==', data.email));
      const snap = await getDocs(q);
      await Promise.all(
        snap.docs.map(u =>
          u.data().isProfesional
            ? Promise.resolve()
            : updateDoc(u.ref, { isProfesional: true })
        )
      );
    }
  };
  const handleDeleteProfessional = async id => {
    await deleteDoc(doc(db, 'stylists', id));
  };

  const handleAddCategory = async data => {
    await addDoc(collection(db, 'categories'), {
      ...data,
      companyId: companyId
    });
  };
  const handleUpdateCategory = async (id, data) => {
    await updateDoc(doc(db, 'categories', id), {
      ...data,
      companyId: companyId
    });
  };
  const handleDeleteCategory = async id => {
    await deleteDoc(doc(db, 'categories', id));
  };

  return (
    <AdminTabs
      profile={profile}
      services={services}
      stylists={stylists}
      appointments={appointments}
      categories={categories}
      onAddService={handleAddService}
      onUpdateService={handleUpdateService}
      onDeleteService={handleDeleteService}
      onAddProfessional={handleAddProfessional}
      onUpdateProfessional={handleUpdateProfessional}
      onDeleteProfessional={handleDeleteProfessional}
      onAddCategory={handleAddCategory}
      onUpdateCategory={handleUpdateCategory}
      onDeleteCategory={handleDeleteCategory}
    />
  );
}
