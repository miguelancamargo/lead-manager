
import { useEffect, useState } from 'react';
import { useAuth } from '../context/AuthContext';
import { Users, Flame, Sun, Target, TrendingUp, Phone, Calendar, Clock } from 'lucide-react';
import { AreaChart, Area, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer, PieChart, Pie, Cell, Legend } from 'recharts';

export default function DashboardHome() {
    const { user } = useAuth();
    const [stats, setStats] = useState({
        total: 0,
        hot: 0,
        warm: 0,
        cold: 0,
        conversionRate: 0,
        recentLeads: [],
        distribution: []
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchStats();
    }, []);

    const fetchStats = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('http://localhost:3000/api/leads', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const leads = await res.json();

            const total = leads.length;
            const hot = leads.filter(l => l.temperature === 'Hot').length;
            const warm = leads.filter(l => l.temperature === 'Warm').length;
            const cold = leads.filter(l => l.temperature === 'Cold').length;

            const demos = leads.filter(l => l.demo_scheduled).length;
            const conversionRate = total > 0 ? Math.round((demos / total) * 100) : 0;

            // Sort by Date Descending for Recent
            const sortedLeads = [...leads].sort((a, b) => new Date(b.created_at) - new Date(a.created_at));

            setStats({
                total,
                hot,
                warm,
                cold,
                conversionRate,
                recentLeads: sortedLeads.slice(0, 5),
                distribution: [
                    { name: 'Calientes (Hot)', value: hot, color: '#ef4444' }, // Red
                    { name: 'Tibios (Warm)', value: warm, color: '#f59e0b' }, // Amber
                    { name: 'Fríos (Cold)', value: cold, color: '#3b82f6' }  // Blue
                ]
            });
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const gradientCardStyle = {
        background: 'linear-gradient(145deg, #1e293b 0%, #0f172a 100%)',
        border: '1px solid rgba(255,255,255,0.05)',
        borderRadius: '16px',
        padding: '1.5rem',
        boxShadow: '0 4px 6px -1px rgba(0, 0, 0, 0.1), 0 2px 4px -1px rgba(0, 0, 0, 0.06)',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-between',
        height: '100%'
    };

    const StatCard = ({ title, value, icon: Icon, color, trend }) => (
        <div style={gradientCardStyle}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '1rem' }}>
                <div style={{ padding: '0.75rem', borderRadius: '12px', background: `${color}15` }}>
                    <Icon size={24} color={color} />
                </div>
                {trend && (
                    <span style={{ fontSize: '0.75rem', color: '#10b981', display: 'flex', alignItems: 'center', gap: '0.25rem', background: 'rgba(16, 185, 129, 0.1)', padding: '0.25rem 0.5rem', borderRadius: '20px' }}>
                        <TrendingUp size={12} /> {trend}
                    </span>
                )}
            </div>
            <div>
                <h3 style={{ fontSize: '2rem', fontWeight: 'bold', color: 'white', marginBottom: '0.25rem' }}>{value}</h3>
                <p style={{ color: '#94a3b8', fontSize: '0.875rem' }}>{title}</p>
            </div>
        </div>
    );

    return (
        <div style={{ animation: 'fadeIn 0.6s ease-out', maxWidth: '1400px', margin: '0 auto' }}>
            {/* Hero Section */}
            <div style={{
                background: 'linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%)',
                padding: '2.5rem',
                borderRadius: '24px',
                marginBottom: '2.5rem',
                color: 'white',
                boxShadow: '0 20px 25px -5px rgba(79, 70, 229, 0.3)',
                position: 'relative',
                overflow: 'hidden'
            }}>
                <div style={{ position: 'relative', zIndex: 1 }}>
                    <h1 style={{ fontSize: '2.25rem', fontWeight: 'bold', marginBottom: '0.5rem' }}>Bienvenido de nuevo, {user?.username}</h1>
                    <p style={{ opacity: 0.9, fontSize: '1.1rem', maxWidth: '600px' }}>
                        Aquí tienes el resumen de tu operación comercial. Tienes <strong style={{ color: '#fbbf24' }}>{stats.hot} leads calientes</strong> que requieren atención inmediata.
                    </p>
                </div>
                {/* Decoration Circles */}
                <div style={{ position: 'absolute', top: '-50px', right: '-50px', width: '200px', height: '200px', background: 'white', opacity: 0.1, borderRadius: '50%' }} />
                <div style={{ position: 'absolute', bottom: '-20px', right: '100px', width: '100px', height: '100px', background: 'white', opacity: 0.05, borderRadius: '50%' }} />
            </div>

            {/* Stats Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: '1.5rem', marginBottom: '2.5rem' }}>
                <StatCard title="Total de Leads" value={stats.total} icon={Users} color="#3b82f6" trend="+12% vs mes anterior" />
                <StatCard title="Oportunidades Calientes" value={stats.hot} icon={Flame} color="#ef4444" trend="+5 nuevos hoy" />
                <StatCard title="En Seguimiento (Tibios)" value={stats.warm} icon={Sun} color="#f59e0b" />
                <StatCard title="Tasa de Conversión (Leads -> Demos)" value={`${stats.conversionRate}%`} icon={Target} color="#10b981" trend="+2% esta semana" />
            </div>

            {/* Main Content Grid */}
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(400px, 1fr))', gap: '1.5rem' }}>

                {/* Distribution Chart */}
                <div style={{ ...gradientCardStyle, padding: '2rem' }}>
                    <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', marginBottom: '1.5rem', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                        <Target size={20} color="#8b5cf6" />
                        Distribución de Leads
                    </h3>
                    <div style={{ height: '300px', width: '100%' }}>
                        <ResponsiveContainer>
                            <PieChart>
                                <Pie
                                    data={stats.distribution}
                                    cx="50%"
                                    cy="50%"
                                    innerRadius={60}
                                    outerRadius={100}
                                    paddingAngle={5}
                                    dataKey="value"
                                    stroke="none"
                                >
                                    {stats.distribution.map((entry, index) => (
                                        <Cell key={`cell-${index}`} fill={entry.color} />
                                    ))}
                                </Pie>
                                <RechartsTooltip
                                    contentStyle={{ backgroundColor: '#1e293b', border: '1px solid #334155', borderRadius: '8px', color: '#fff' }}
                                    itemStyle={{ color: '#fff' }}
                                />
                                <Legend verticalAlign="bottom" height={36} iconType="circle" />
                            </PieChart>
                        </ResponsiveContainer>
                    </div>
                </div>

                {/* Recent Leads Table */}
                <div style={{ ...gradientCardStyle, padding: '2rem' }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                        <h3 style={{ color: 'white', fontSize: '1.25rem', fontWeight: '600', display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                            <Clock size={20} color="#3b82f6" />
                            Ingresos Recientes
                        </h3>
                        <a href="/leads" style={{ color: '#3b82f6', fontSize: '0.875rem', textDecoration: 'none', fontWeight: '500' }}>Ver todos &rarr;</a>
                    </div>

                    <div style={{ overflowX: 'auto' }}>
                        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
                            <thead>
                                <tr style={{ borderBottom: '1px solid #334155', textAlign: 'left' }}>
                                    <th style={{ padding: '0.75rem 0', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>Nombre</th>
                                    <th style={{ padding: '0.75rem 0', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>Estado</th>
                                    <th style={{ padding: '0.75rem 0', color: '#94a3b8', fontSize: '0.875rem', fontWeight: '500' }}>Fecha</th>
                                </tr>
                            </thead>
                            <tbody>
                                {stats.recentLeads.map((lead, i) => (
                                    <tr key={i} style={{ borderBottom: i < stats.recentLeads.length - 1 ? '1px solid #334155' : 'none' }}>
                                        <td style={{ padding: '1rem 0', color: 'white', fontWeight: '500' }}>
                                            {lead.first_name} {lead.last_name}
                                            <div style={{ fontSize: '0.75rem', color: '#64748b', display: 'flex', alignItems: 'center', gap: '0.25rem', marginTop: '0.25rem' }}>
                                                <Phone size={10} /> {lead.phone}
                                            </div>
                                        </td>
                                        <td style={{ padding: '1rem 0' }}>
                                            <span style={{
                                                padding: '0.25rem 0.75rem',
                                                borderRadius: '20px',
                                                fontSize: '0.75rem',
                                                fontWeight: '600',
                                                backgroundColor: lead.temperature === 'Hot' ? 'rgba(239, 68, 68, 0.2)' : lead.temperature === 'Warm' ? 'rgba(245, 158, 11, 0.2)' : 'rgba(59, 130, 246, 0.2)',
                                                color: lead.temperature === 'Hot' ? '#fca5a5' : lead.temperature === 'Warm' ? '#fcd34d' : '#93c5fd'
                                            }}>
                                                {lead.temperature === 'Hot' ? 'Caliente' : lead.temperature === 'Warm' ? 'Tibio' : 'Frío'}
                                            </span>
                                        </td>
                                        <td style={{ padding: '1rem 0', color: '#94a3b8', fontSize: '0.875rem' }}>
                                            {new Date(lead.created_at).toLocaleDateString()}
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                        {stats.recentLeads.length === 0 && (
                            <div style={{ textAlign: 'center', padding: '2rem', color: '#64748b' }}>No hay leads recientes</div>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}
