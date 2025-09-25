import React from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Navbar() {
  const navigate = useNavigate();

  const logout = async () => {
    try {
      await api.post('/api/auth/logout', {});
      navigate('/auth');
    } catch (e) {
      console.error(e);
      navigate('/auth');
    }
  };

  return (
    <header className="nav">
      <div className="brand">AI Shopping Companion</div>
      <nav>
        <Link to="/">Dashboard</Link>
        <button className="logout" onClick={logout}>Logout</button>
      </nav>
    </header>
  );
}
