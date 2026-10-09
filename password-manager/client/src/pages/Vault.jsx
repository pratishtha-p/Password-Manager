import { useEffect, useState } from 'react';
import { api } from '../api.js';

const empty = { site: '', username: '', password: '' };
const tints = ['#1F6F6B', '#3B5BA5', '#8A5A9E', '#B8860B', '#A8473A', '#4F7A3A'];
const tint = (s) => tints[[...s].reduce((a, c) => a + c.charCodeAt(0), 0) % tints.length];
const generate = () => {
  const set = 'abcdefghijkmnopqrstuvwxyzABCDEFGHJKLMNPQRSTUVWXYZ23456789!@#$%&*';
  return [...crypto.getRandomValues(new Uint32Array(16))].map((n) => set[n % set.length]).join('');
};

export default function Vault({ email, onLogout }) {
  const [items, setItems] = useState([]);
  const [search, setSearch] = useState('');
  const [panel, setPanel] = useState(null); // null, or the credential being added/edited
  const [shown, setShown] = useState({});
  const [toast, setToast] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(true);

  const load = async (q = '') => {
    try { setItems(await api('/credentials?search=' + encodeURIComponent(q))); }
    catch (e) { setError(e.message); }
    setLoading(false);
  };
  useEffect(() => { const t = setTimeout(() => load(search), 250); return () => clearTimeout(t); }, [search]);

  const flash = (m) => { setToast(m); setTimeout(() => setToast(''), 1800); };
  const copy = async (text, what) => { await navigator.clipboard.writeText(text); flash(`${what} copied`); };

  const save = async (e) => {
    e.preventDefault(); setError('');
    const { _id, site, username, password } = panel;
    try {
      if (_id) await api('/credentials/' + _id, 'PUT', { site, username, password });
      else await api('/credentials', 'POST', { site, username, password });
      setPanel(null); flash(_id ? 'Changes saved' : 'Credential added'); load(search);
    } catch (err) { setError(err.message); }
  };

  const remove = async (c) => {
    if (!window.confirm(`Delete the login for ${c.site}? This can't be undone.`)) return;
    await api('/credentials/' + c._id, 'DELETE'); flash('Credential deleted'); load(search);
  };

  return (
    <div className="vault">
      <header>
        <div className="brand"><div className="mark small" aria-hidden="true"><span /></div><b>Keyring</b></div>
        <div className="who"><span>{email}</span><button className="link" onClick={onLogout}>Log out</button></div>
      </header>

      <div className="bar">
        <input type="search" placeholder="Search by site or username" value={search} onChange={(e) => setSearch(e.target.value)} aria-label="Search credentials" />
        <button className="primary" onClick={() => { setError(''); setPanel({ ...empty }); }}>Add credential</button>
      </div>

      {error && !panel && <p className="error">{error}</p>}

      <ul className="list">
        {items.map((c) => (
          <li key={c._id}>
            <div className="tile" style={{ background: tint(c.site) }}>{c.site[0].toUpperCase()}</div>
            <div className="info"><strong>{c.site}</strong><span>{c.username}</span></div>
            <code className={'pw' + (shown[c._id] ? ' open' : '')}>{shown[c._id] ? c.password : '••••••••••'}</code>
            <div className="actions">
              <button onClick={() => setShown({ ...shown, [c._id]: !shown[c._id] })}>{shown[c._id] ? 'Hide' : 'Show'}</button>
              <button onClick={() => copy(c.username, 'Username')}>Copy username</button>
              <button onClick={() => copy(c.password, 'Password')}>Copy password</button>
              <button onClick={() => { setError(''); setPanel(c); }}>Edit</button>
              <button className="danger" onClick={() => remove(c)}>Delete</button>
            </div>
          </li>
        ))}
      </ul>

      {!loading && items.length === 0 && (
        <p className="empty">{search ? `No logins match "${search}".` : 'Your vault is empty. Add your first credential to get started.'}</p>
      )}

      {panel && (
        <div className="scrim" onClick={() => setPanel(null)}>
          <form className="panel" onClick={(e) => e.stopPropagation()} onSubmit={save}>
            <h2>{panel._id ? 'Edit credential' : 'Add credential'}</h2>
            <label>Site<input autoFocus required value={panel.site} onChange={(e) => setPanel({ ...panel, site: e.target.value })} placeholder="github.com" /></label>
            <label>Username or email<input required value={panel.username} onChange={(e) => setPanel({ ...panel, username: e.target.value })} /></label>
            <label>Password
              <div className="row">
                <input required value={panel.password} onChange={(e) => setPanel({ ...panel, password: e.target.value })} />
                <button type="button" onClick={() => setPanel({ ...panel, password: generate() })}>Generate</button>
              </div>
            </label>
            {error && <p className="error" role="alert">{error}</p>}
            <div className="row end">
              <button type="button" onClick={() => setPanel(null)}>Cancel</button>
              <button className="primary">Save</button>
            </div>
          </form>
        </div>
      )}
      {toast && <div className="toast" role="status">{toast}</div>}
    </div>
  );
}
