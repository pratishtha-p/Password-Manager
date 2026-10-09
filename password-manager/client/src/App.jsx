import { useState } from 'react';
import Auth from './pages/Auth.jsx';
import Vault from './pages/Vault.jsx';

export default function App() {
  const [user, setUser] = useState(localStorage.getItem('token') ? localStorage.getItem('email') : null);
  const logout = () => { localStorage.clear(); setUser(null); };
  return user ? <Vault email={user} onLogout={logout} /> : <Auth onAuth={setUser} />;
}
