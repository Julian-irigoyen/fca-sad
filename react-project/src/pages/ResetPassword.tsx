import { useState } from 'react';
import { useNavigate } from 'react-router-dom';

export default function ResetPassword() {
    const [username, setUsername] = useState('');
    const [newPassword, setNewPassword] = useState('');
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const navigate = useNavigate();

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        if (!username || !newPassword) {
            setError('Por favor, complete todos los campos.');
            return;
        }
        try {
            const res = await fetch('http://localhost:4000/api/reset-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, newPassword })
            });
            const data = await res.json();
            if (!res.ok) {
                setError(data.error || 'Error al cambiar la contraseña');
                return;
            }
            setSuccess('Contraseña actualizada correctamente. Ahora puede iniciar sesión.');
        } catch (err) {
            setError('Error de red o del servidor');
        }
    };

    return (
        <div className="login-bg">
            <div className="login-card">
                <h1 className="login-title">Recuperar/Cambiar Contraseña</h1>
                <form className="login-form" onSubmit={handleSubmit}>
                    <label htmlFor="username" className="login-label">Usuario (id_empleado o email)</label>
                    <input id="username" type="text" className="login-input" placeholder="id_empleado o email" value={username} onChange={e => setUsername(e.target.value)} />
                    <label htmlFor="newPassword" className="login-label">Nueva Contraseña</label>
                    <input id="newPassword" type="password" className="login-input" placeholder="Nueva contraseña" value={newPassword} onChange={e => setNewPassword(e.target.value)} />
                    {error && <div style={{ color: '#d32f2f', textAlign: 'center', marginBottom: 8 }}>{error}</div>}
                    {success && <div style={{ color: '#388e3c', textAlign: 'center', marginBottom: 8 }}>{success}</div>}
                    <button type="submit" className="login-btn">Cambiar Contraseña</button>
                </form>
                <div style={{ textAlign: 'center', marginTop: 16 }}>
                    <a href="#" className="login-recover" onClick={e => { e.preventDefault(); navigate('/'); }}>Volver al login</a>
                </div>
            </div>
        </div>
    );
} 