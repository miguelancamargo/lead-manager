import { useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';

export default function Login() {
    const [username, setUsername] = useState('');
    const [password, setPassword] = useState('');
    const [error, setError] = useState('');
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            const res = await fetch('/api/auth/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.error);

            login(data.user, data.token);
            navigate('/');
        } catch (err) {
            setError(err.message);
        }
    };

    return (
        <div style={{ height: '100vh', display: 'flex', alignItems: 'center', justifyContent: 'center', position: 'relative', padding: '1rem' }}>
            <img
                src="/leadvault-logo.png"
                alt="LeadVault Pro"
                style={{
                    position: 'absolute',
                    top: '2rem',
                    left: '2rem',
                    height: '40px',
                    objectFit: 'contain'
                }}
            />

            <div className="card" style={{ width: '100%', maxWidth: '400px' }}>
                <h2 style={{ marginBottom: '1.5rem', textAlign: 'center', fontSize: '1.6rem', fontWeight: '800', lineHeight: '1.2' }}>
                    Sistema de Gestion de <span style={{ color: '#8b5cf6' }}>Leads</span> en tiempo real
                </h2>
                {error && <div style={{ color: 'var(--danger)', marginBottom: '1rem' }}>{error}</div>}
                <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Username</label>
                        <input
                            type="text"
                            className="input"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                        />
                    </div>
                    <div>
                        <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem' }}>Password</label>
                        <input
                            type="password"
                            className="input"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                        />
                    </div>
                    <button type="submit" className="btn btn-primary" style={{ marginTop: '0.5rem' }}>
                        Login
                    </button>
                </form>
                <div style={{ marginTop: '1.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)', textAlign: 'center' }}>
                    <p>Bienvenido al Sistema LeadVault Pro</p>
                </div>
            </div>

            <footer style={{
                position: 'absolute',
                bottom: '1rem',
                width: '100%',
                textAlign: 'center',
                color: 'var(--text-secondary)',
                fontSize: '0.75rem',
                opacity: 0.6
            }}>
                Diseñado por Miguel Angel Camargo
            </footer>
        </div>
    );
}
