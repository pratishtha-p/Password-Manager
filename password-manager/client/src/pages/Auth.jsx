import { useState } from 'react';
import { api } from '../api.js';

export default function Auth({ onAuth }) {
  const [mode, setMode] = useState('login');
  const [form, setForm] = useState({ email: '', password: '' });
  const [error, setError] = useState('');
  const [busy, setBusy] = useState(false);

  const submit = async (e) => {
    e.preventDefault(); setError(''); setBusy(true);
    try {
      const d = await api(`/auth/${mode}`, 'POST', form);
      localStorage.setItem('token', d.token); localStorage.setItem('email', d.email);
      onAuth(d.email);
    } catch (err) { setError(err.message); }
    setBusy(false);
  };

  return (
    <main className="auth">
      <section className="auth-intro">
        <div className="mark" aria-hidden="true"><span /></div>
        <h1>Keyring</h1>
        <p>Every login you own, on one ring. Passwords are encrypted before they are stored.</p>
      </section>
      <form className="auth-form" onSubmit={submit}>
        <h2>{mode === 'login' ? 'Open your vault' : 'Create your vault'}</h2>
        <label>Email<input type="email" required value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} /></label>
        <label>Password<input type="password" required minLength={8} value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} /></label>
        {error && <p className="error" role="alert">{error}</p>}
        <button className="primary" disabled={busy}>{busy ? 'Please wait…' : mode === 'login' ? 'Log in' : 'Create account'}</button>
        <button type="button" className="link" onClick={() => { setMode(mode === 'login' ? 'register' : 'login'); setError(''); }}>
          {mode === 'login' ? 'New here? Create an account' : 'Already have an account? Log in'}
        </button>
      </form>
    </main>
  );
}
