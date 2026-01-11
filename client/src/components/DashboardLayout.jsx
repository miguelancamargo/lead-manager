import { useAuth } from '../context/AuthContext';
import { LogOut, Users, BarChart3, Menu, X } from 'lucide-react';
import { useState } from 'react';

export default function Dashboard({ children }) {
    const { user, logout } = useAuth();
    const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);

    return (
        <div className="dashboard-grid">
            {/* Mobile Header */}
            <div style={{
                display: 'none',
                padding: '1rem',
                borderBottom: '1px solid rgba(255,255,255,0.1)',
                alignItems: 'center',
                justifyContent: 'space-between',
                position: 'sticky',
                top: 0,
                backgroundColor: 'var(--bg-card)',
                zIndex: 40
            }} className="mobile-header">
                <img src="/teybot-logo.png" alt="Teybot" style={{ height: '30px' }} />
                <button onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)} style={{ color: 'white' }}>
                    {isMobileMenuOpen ? <X size={24} /> : <Menu size={24} />}
                </button>
            </div>

            {/* Sidebar Overlay for Mobile */}
            {isMobileMenuOpen && (
                <div
                    onClick={() => setIsMobileMenuOpen(false)}
                    style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 45 }}
                    className="mobile-overlay"
                />
            )}

            <aside className={`sidebar ${isMobileMenuOpen ? 'open' : ''}`}>
                <div style={{ marginBottom: '2.5rem', textAlign: 'center' }}>
                    <img src="/teybot-logo.png" alt="Teybot" style={{ height: '50px', objectFit: 'contain' }} />
                </div>
                <nav style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem', flex: 1 }}>
                    {user?.role !== 'sales' && (
                        <div
                            onClick={() => window.location.pathname !== '/' && (window.location.href = '/')}
                            style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: window.location.pathname === '/' ? 'var(--accent-primary)' : 'transparent', color: window.location.pathname === '/' ? '#050b1c' : 'var(--text-primary)', display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer', fontWeight: window.location.pathname === '/' ? '600' : '400' }}
                        >
                            <BarChart3 size={20} />
                            <span>Dashboard</span>
                        </div>
                    )}

                    <div
                        onClick={() => window.location.pathname !== '/leads' && (window.location.href = '/leads')}
                        style={{ padding: '0.75rem', borderRadius: 'var(--radius-md)', backgroundColor: window.location.pathname === '/leads' ? 'var(--accent-primary)' : 'transparent', color: window.location.pathname === '/leads' ? '#050b1c' : 'var(--text-primary)', display: 'flex', gap: '0.75rem', alignItems: 'center', cursor: 'pointer', fontWeight: window.location.pathname === '/leads' ? '600' : '400' }}
                    >
                        <Users size={20} />
                        <span>Gestión de Leads</span>
                    </div>
                </nav>

                <button onClick={logout} className="btn btn-secondary" style={{ marginTop: 'auto', width: '100%', justifyContent: 'flex-start', gap: '0.75rem' }}>
                    <LogOut size={18} />
                    Logout
                </button>
            </aside>

            <main className="main-content" style={{ display: 'flex', flexDirection: 'column', height: '100%' }}>
                <div style={{ flex: 1 }}>
                    {children}
                </div>
                <footer style={{ marginTop: '2rem', textAlign: 'right', fontStyle: 'italic', fontSize: '0.75rem', color: 'var(--text-secondary)', opacity: 0.6 }}>
                    Diseñado por Miguel Angel Camargo
                </footer>
            </main>
        </div>
    );
}
