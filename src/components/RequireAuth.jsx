import React from 'react';
import { Navigate, useLocation } from 'react-router-dom';
import { auth } from '../firebaseConfig';
import { useTenant } from '../TenantProvider';

export default function RequireAuth({ children }) {
  const location = useLocation();
  const { slug } = useTenant();
  if (!auth.currentUser) {
    // guardamos la ruta completa (pathname + state) en from
    return <Navigate to={`/${slug}/login`} state={{ from: location }} replace />;
  }
  return children;
}
