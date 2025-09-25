import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { api } from '../api.js';

export default function Auth() {
  const navigate = useNavigate();
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const onChange = (e) => setForm({ ...form, [e.target.name]: e.target.value });

  const submit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    try {
      const name = (form.name || '').trim();
      const email = (form.email || '').trim().toLowerCase();
      const password = (form.password || '').trim();
      if (mode === 'register') {
        await api.post('/api/auth/register', { name, email, password });
      } else {
        await api.post('/api/auth/login', { email, password });
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Failed');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="container">
      <div className="card">
        <h2>{mode === 'register' ? 'Create account' : 'Log in'}</h2>
        <form onSubmit={submit}>
          {mode === 'register' && (
            <div className="field">
              <label>Name</label>
              <input name="name" value={form.name} onChange={onChange} required />
            </div>
          )}
          <div className="field">
            <label>Email</label>
            <input type="email" name="email" value={form.email} onChange={onChange} required />
          </div>
          <div className="field">
            <label>Password</label>
            <input type="password" name="password" value={form.password} onChange={onChange} required minLength={6} />
          </div>
          {error && <div className="error">{error}</div>}
          <button className="primary" disabled={loading}>{loading ? 'Please wait…' : (mode === 'register' ? 'Register' : 'Login')}</button>
        </form>
        <div className="switch">
          {mode === 'register' ? (
            <span>Already have an account? <button onClick={() => setMode('login')}>Login</button></span>
          ) : (
            <span>New here? <button onClick={() => setMode('register')}>Create account</button></span>
          )}
        </div>
      </div>
    </div>
  );
}
