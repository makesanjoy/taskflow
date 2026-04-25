import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../context/AppContext';

export default function LoginPage() {
  const { login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setLoading(true);
    await new Promise(r => setTimeout(r, 400));
    const ok = login(email, password);
    setLoading(false);
    if (ok) { navigate('/dashboard'); }
    else { setError('Invalid email or password. Try admin@taskflow.com / password123'); }
  };

  return (
    <div className="login-page" data-testid="login-page">
      <div className="login-card">
        <div className="login-logo">
          <span className="logo-mark">TF</span>
          <span className="logo-name">TaskFlow</span>
        </div>
        <h1 className="login-title">Welcome back</h1>
        <p className="login-sub">Sign in to manage your projects</p>
        <form onSubmit={handleSubmit} data-testid="login-form" noValidate>
          <div className="field">
            <label htmlFor="email">Email</label>
            <input id="email" type="email" data-testid="email-input" placeholder="you@example.com" value={email} onChange={e => setEmail(e.target.value)} />
          </div>
          <div className="field">
            <label htmlFor="password">Password</label>
            <input id="password" type="password" data-testid="password-input" placeholder="••••••••" value={password} onChange={e => setPassword(e.target.value)} />
          </div>
          {error && <div className="error-msg" data-testid="login-error" role="alert">{error}</div>}
          <button type="submit" className="btn-primary" data-testid="login-button" disabled={loading}>
            {loading ? <span className="spinner" /> : 'Sign in'}
          </button>
        </form>
        <div className="login-hint">
          <span>Demo credentials:</span>
          <code>admin@taskflow.com</code> / <code>password123</code>
        </div>
      </div>
    </div>
  );
}