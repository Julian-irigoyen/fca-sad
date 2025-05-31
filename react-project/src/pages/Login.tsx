import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import '../Login.css';
import logo from '../assets/logo.png';

export default function Login() {
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    try {
      const res = await fetch('http://localhost:4000/api/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ username, password })
      });
      const data = await res.json();
      if (!res.ok) {
        setError(data.error || 'Error de inicio de sesión');
        return;
      }
      // Guardar JWT y rol en localStorage
      localStorage.setItem('token', data.token);
      localStorage.setItem('role', data.role);
      navigate('/dashboard');
    } catch (err) {
      setError('Error de red o del servidor');
    }
  };

  return (
    <div className="login-bg">
      <div className="login-card">
        <img src={logo} alt="Logo" className="login-logo" />
        <h1 className="login-title">FCA SAD</h1>
        <form className="login-form" onSubmit={handleSubmit}>
          <label htmlFor="username" className="login-label">Usuario</label>
          <input id="username" type="text" className="login-input" placeholder="id_empleado o email" value={username} onChange={e => setUsername(e.target.value)} />
          <label htmlFor="password" className="login-label">Contraseña</label>
          <input id="password" type="password" className="login-input" placeholder="Contraseña" value={password} onChange={e => setPassword(e.target.value)} />
          {error && <div style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 8 }}>{error}</div>}
          <button type="submit" className="login-btn">Iniciar Sesión</button>
        </form>
        <div className="login-footer">¿Olvidó su contraseña? <a href="#" className="login-recover" onClick={e => { e.preventDefault(); navigate('/recuperar'); }}>Recuperar</a></div>
      </div>
    </div>
  );
} 