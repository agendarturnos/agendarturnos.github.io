import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { signOut } from 'firebase/auth';
import { auth } from '../firebaseConfig';
import { useAuth } from '../AuthProvider';
import { useTenant } from '../TenantProvider';

export default function MainNavbar() {
  const [open, setOpen] = useState(false);
  const [isDesktop, setIsDesktop] = useState(
    typeof window !== 'undefined' ? window.innerWidth >= 992 : false
  );
  const { user, profile } = useAuth();
  const { slug, projectName, companyId } = useTenant();
  const isTenantStaff =
    (profile?.isAdmin || profile?.isProfesional) &&
    profile?.companyId === companyId;

  // Listen for viewport changes to update isDesktop
  useEffect(() => {
    const mediaQuery = window.matchMedia('(min-width: 992px)');
    const handler = (e) => setIsDesktop(e.matches);

    // set initial value
    setIsDesktop(mediaQuery.matches);
    mediaQuery.addEventListener('change', handler);
    return () => mediaQuery.removeEventListener('change', handler);
  }, []);

  const toggle = () => setOpen((o) => !o);
  const close = () => setOpen(false);

  // Always show on desktop, collapse on mobile unless open
  const collapseClass = `navbar-collapse ${
    isDesktop || open ? 'show' : 'collapse'
  }`;

  return (
    <nav className="navbar navbar-dark navbar-expand-lg"   style={{ backgroundColor: '#383937' }}>
      <div className="container-fluid">
        <Link className="h5 pl-1  text-white" to={`/${slug}`} onClick={close}>
          {projectName}
        </Link>
        <button
          className="navbar-toggler"
          type="button"
          aria-controls="mainNavbar"
          aria-expanded={open}
          aria-label="Toggle navigation"
          onClick={toggle}
        >
          <span className="navbar-toggler-icon" />
        </button>
        <div className={collapseClass} id="mainNavbar">
          <ul className="navbar-nav ms-auto mb-2 mb-lg-0">
            {user && (
              <>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to={`/${slug}/mis-turnos`}
                    onClick={close}
                  >
                    Mis Turnos
                  </Link>
                </li>
                <li className="nav-item">
                  <Link
                    className="nav-link"
                    to={`/${slug}/mi-perfil`}
                    onClick={close}
                  >
                    Mi Perfil
                  </Link>
                </li>
                {isTenantStaff && (
                  <li className="nav-item">
                    <Link
                      className="nav-link"
                      to={`/${slug}/admin`}
                      onClick={close}
                    >
                      Panel Admin
                    </Link>
                  </li>
                )}
              </>
            )}
            {user ? (
              <li className="nav-item">
                <button
                  onClick={() => {
                    signOut(auth);
                    close();
                  }}
                  className="nav-link btn btn-link"
                >
                  Logout
                </button>
              </li>
            ) : (
              <li className="nav-item">
                <Link
                  className="nav-link"
                  to={`/${slug}/login`}
                  onClick={close}
                >
                  Login
                </Link>
              </li>
            )}
          </ul>
        </div>
      </div>
    </nav>
  );
}
