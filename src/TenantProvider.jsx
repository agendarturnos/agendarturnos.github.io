import React, { createContext, useContext, useEffect, useState } from 'react';
import { useParams } from 'react-router-dom';
import { doc, onSnapshot } from 'firebase/firestore';
import { db } from './firebaseConfig';

const TenantContext = createContext(null);

export function useTenant() {
  return useContext(TenantContext);
}

export function TenantProvider({ children }) {
  const { tenant } = useParams();
  const [config, setConfig] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const unsubscribe = onSnapshot(doc(db, 'tenants', tenant), snap => {
      setConfig(snap.exists() ? { slug: tenant, ...snap.data() } : null);
      setLoading(false);
    });
    return () => unsubscribe();
  }, [tenant]);

  if (loading) return <p className="p-4 text-center">Cargando...</p>;
  if (!config) return <p className="p-4 text-center">Cliente no válido</p>;

  return (
    <TenantContext.Provider value={config}>{children}</TenantContext.Provider>
  );
}
