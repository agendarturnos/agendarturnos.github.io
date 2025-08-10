// src/App.jsx
import React from 'react';
import {
  BrowserRouter as Router,
  Routes,
  Route,
  Navigate
} from 'react-router-dom';
import { AuthProvider, useAuth } from './AuthProvider';
import { TenantProvider, useTenant } from './TenantProvider';
import RequireAuth from './components/RequireAuth';
import PasswordReset from './components/PasswordReset';
import ServiceListScreen from './components/ServiceListScreen';
import ServiceSummaryScreen from './components/ServiceSummaryScreen';
import StylistSelectionScreen from './components/StylistSelectionScreen';
import ProfessionalCalendarScreen from './components/ProfessionalCalendarScreen';
import MyAppointmentsScreen from './components/MyAppointmentsScreen';
import MyProfileScreen from './components/MyProfileScreen';
import AdminRouter from './routes/AdminRouter';
import SuperAdminRouter from './routes/SuperAdminRouter';
import Login from './components/Login';
import MainNavbar from './components/MainNavbar';
import TenantSignup from './components/TenantSignup';

export default function App() {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/alta" element={<TenantSignup />} />
          <Route path="/super/*" element={<SuperAdminRouter />} />
          <Route
            path="/:tenant/*"
            element={
              <TenantProvider>
                <AppContent />
              </TenantProvider>
            }
          />
        </Routes>
      </Router>
    </AuthProvider>
  );
}

function AppContent() {
  const { user, profile } = useAuth();
  const { slug, projectName, companyId } = useTenant();
  // usados para mostrar/ocultar el panel admin
  const canAccessAdmin =
    (profile?.isAdmin || profile?.isProfesional) &&
    profile?.companyId === companyId;

  return (
    <>
      <MainNavbar />

      <main className="p-2">
        <Routes>
          <Route index element={<ServiceListScreen />} />
          <Route path="summary" element={<ServiceSummaryScreen />} />
          <Route path="stylists" element={<StylistSelectionScreen />} />

          <Route
            path="login"
            element={user ? <Navigate to="" replace /> : <Login />}
          />

          <Route path="reset-password" element={<PasswordReset />} />

          <Route
            path="professional"
            element={
              <RequireAuth>
                <ProfessionalCalendarScreen />
              </RequireAuth>
            }
          />

          <Route
            path="mis-turnos"
            element={
              <RequireAuth>
                <MyAppointmentsScreen />
              </RequireAuth>
            }
          />

          <Route
            path="mi-perfil"
            element={
              <RequireAuth>
                <MyProfileScreen />
              </RequireAuth>
            }
          />

          <Route
            path="admin/*"
            element={
              <RequireAuth>
                {canAccessAdmin ? (
                  <AdminRouter profile={profile} />
                ) : (
                  <Navigate to="" replace />
                )}
              </RequireAuth>
            }
          />

          <Route path="*" element={<Navigate to="" replace />} />
        </Routes>
      </main>
    </>
  );
}
