import React, { useContext } from 'react';
import { Routes, Route, Link, Navigate, useLocation } from 'react-router-dom';
import { AuthProvider, AuthContext } from './AuthContext';
import CHWRequestForm from './CHWRequestForm';
import CHARequests from './CHARequests';
import CHALogin from './CHALogin';
import CHWSignup from './CHWSignup';
import { ThemeProvider } from './ThemeContext';
import AdminCHWApproval from './AdminCHWApproval';

function AppRoutes() {
  const { chaId } = useContext(AuthContext);
  const location = useLocation();
  const hideCHWRegistrationLink = location.pathname === '/request' || location.pathname === '/cha-dashboard';;

  return (
    <>
      <nav style={styles.navbar}>
        <div style={styles.navWrapper}>
          <div style={styles.navContent}>
            {/* Uncomment or add any navigation links you need here */}
          </div>
          <div>
            {!hideCHWRegistrationLink && (
              <Link to="/chw/signup" style={styles.link}>CHW Registration</Link>
            )}
          </div>
          <div>
            {!hideCHWRegistrationLink && (
            <Link to="/cha-dashboard" style={styles.link}>CHA Login</Link> )}
            {/* <Link to="/admin/chw-approval" style={styles.link}>Admin CHW Approval</Link> */}
          </div>
          <div>
            {!hideCHWRegistrationLink && (
            <Link to="/request" style={styles.link}>CHW Form</Link> )}
            {/* <Link to="/admin/chw-approval" style={styles.link}>Admin CHW Approval</Link> */}
          </div>
        </div>
      </nav>

      <main style={styles.mainContent}>
        <Routes>
          {/* <Route path="/" element={<CHWRequestForm />} /> */}
          <Route path="/" element={<CHWSignup />} />
          <Route path="/request" element={<CHWRequestForm />} />
          <Route
            path="/cha-dashboard"
            element={chaId ? <CHARequests /> : <Navigate to="/login" replace />}
          />
          <Route
            path="/login"
            element={chaId ? <Navigate to="/cha-dashboard" replace /> : <CHALogin />}
          />
          <Route path="/chw/signup" element={<CHWSignup />} />
          <Route path="/admin/chw-approval" element={<AdminCHWApproval />} />
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </main>
    </>
  );
}

function App() {
  return (
    <AuthProvider>
      <ThemeProvider>
        <AppRoutes />
      </ThemeProvider>
    </AuthProvider>
  );
}

const styles = {
  navbar: {
    backgroundColor: '#ffffff',
    padding: '1rem 2rem',
    boxShadow: '0 4px 12px rgba(0, 0, 0, 0.05)',
    position: 'sticky',
    top: 0,
    zIndex: 1000,
    marginBottom: '1.5rem',
  },
  navWrapper: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  navContent: {
    display: 'flex',
    gap: '1.5rem',
    alignItems: 'center',
  },
  link: {
    textDecoration: 'none',
    color: '#4CAF50',
    fontWeight: '600',
    fontSize: '1rem',
    transition: 'color 0.2s ease-in-out',
  },
  mainContent: {
    padding: '0 2rem',
    maxWidth: '960px',
    margin: '0 auto',
  },
};

export default App;