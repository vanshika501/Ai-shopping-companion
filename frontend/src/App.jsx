import React, { useEffect, useState } from 'react';
import { Routes, Route, Navigate, useNavigate } from 'react-router-dom';
import Navbar from './components/Navbar.jsx';
import Auth from './pages/Auth.jsx';
import Dashboard from './pages/Dashboard.jsx';
import { api } from './api.js';

function ProtectedRoute({ children }) {
  const [loading, setLoading] = useState(true);
  const [authed, setAuthed] = useState(false);
  const navigate = useNavigate();

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const me = await api.get('/api/auth/me');
        if (mounted) {
          setAuthed(!!me?.user);
        }
      } catch {
        if (mounted) setAuthed(false);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => { mounted = false; };
  }, [navigate]);

  if (loading) return <div className="center">Loading...</div>;
  if (!authed) return <Navigate to="/auth" replace />;
  return children;
}

export default function App() {
  return (
    <div className="app">
      <Navbar />
      <Routes>
        <Route path="/auth" element={<Auth />} />
        <Route
          path="/"
          element={
            <ProtectedRoute>
              <Dashboard />
            </ProtectedRoute>
          }
        />
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </div>
  );
}
