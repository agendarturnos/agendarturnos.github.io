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
  onSnapshot
} from 'firebase/firestore';
import { db } from '../firebaseConfig';
import { useTenant } from '../TenantProvider';

export default function AdminRouter() {
  const { companyId } = useTenant();
  const [services, setServices]       = useState([]);
  const [stylists, setStylists]       = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [categories, setCategories]   = useState([]);

  useEffect(() => {
    // Query compartido: todos filtrados por companyId
    const qServices = query(
      collection(db, 'services'),
      where('companyId', '==', companyId)
    );
    const unsubServices = onSnapshot(qServices, snap =>
      setServices(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const qStylists = query(
      collection(db, 'stylists'),
      where('companyId', '==', companyId)
    );
    const unsubStylists = onSnapshot(qStylists, snap =>
      setStylists(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    const qAppointments = query(
      collection(db, 'appointments'),
      where('companyId', '==', companyId)
    );
    const unsubAppointments = onSnapshot(qAppointments, snap => {
      const today = new Date();
      today.setHours(0, 0, 0, 0);
      setAppointments(
        snap.docs
          .map(d => ({ id: d.id, ...d.data() }))
          .filter(a => new Date(a.datetime) >= today)
      );
    });

    const qCategories = query(
      collection(db, 'categories'),
      where('companyId', '==', companyId)
    );
    const unsubCategories = onSnapshot(qCategories, snap =>
      setCategories(snap.docs.map(d => ({ id: d.id, ...d.data() })))
    );

    return () => {
      unsubServices();
      unsubStylists();
      unsubAppointments();
      unsubCategories();
    };
  }, []);

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
  };
  const handleUpdateProfessional = async (id, data) => {
    await updateDoc(doc(db, 'stylists', id), {
      ...data,
      companyId: companyId
    });
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
