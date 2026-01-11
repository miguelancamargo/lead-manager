import { useState, useEffect } from 'react';
import { Plus, Phone, MessageCircle, Calendar, Save, Upload, FileSpreadsheet } from 'lucide-react';
import * as XLSX from 'xlsx';

export default function LeadsView() {
    const [leads, setLeads] = useState([]);
    const [showForm, setShowForm] = useState(false);
    const [isBulk, setIsBulk] = useState(false);
    const [formData, setFormData] = useState({ first_name: '', last_name: '', phone: '', observations: '' });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchLeads();
    }, []);

    const fetchLeads = async () => {
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/leads', {
                headers: { Authorization: `Bearer ${token}` }
            });
            const data = await res.json();
            setLeads(data);
        } catch (err) {
            console.error(err);
        } finally {
            setLoading(false);
        }
    };

    const handleCreate = async (e) => {
        e.preventDefault();
        try {
            const token = localStorage.getItem('token');
            const res = await fetch('/api/leads', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify(formData),
            });
            if (res.ok) {
                setShowForm(false);
                setFormData({ first_name: '', last_name: '', phone: '', observations: '' });
                fetchLeads();
            }
        } catch (err) {
            console.error(err);
        }
    };

    const handleFileUpload = (e) => {
        const file = e.target.files[0];
        if (!file) return;

        const reader = new FileReader();
        reader.onload = (evt) => {
            const bstr = evt.target.result;
            const wb = XLSX.read(bstr, { type: 'binary' });
            const wsname = wb.SheetNames[0];
            const ws = wb.Sheets[wsname];
            const data = XLSX.utils.sheet_to_json(ws);

            // Normalize keys to lowercase/expected format if needed
            const normalizedData = data.map(row => ({
                first_name: row['Nombre'] || row['First Name'] || row['first_name'],
                last_name: row['Apellido'] || row['Last Name'] || row['last_name'] || '',
                phone: row['Telefono'] || row['Phone'] || row['phone'],
                observations: row['Observaciones'] || row['Notes'] || row['observations'] || '',
                created_at: row['Fecha'] || new Date().toISOString()
            }));

            setFormData({ ...formData, bulkData: JSON.stringify(normalizedData) });
        };
        reader.readAsBinaryString(file);
    };

    const handleBulkUpload = async (e) => {
        e.preventDefault();
        try {
            const json = JSON.parse(formData.bulkData);
            const token = localStorage.getItem('token');
            const res = await fetch('/api/leads/bulk', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ leads: json }),
            });
            if (res.ok) {
                setShowForm(false);
                setIsBulk(false);
                fetchLeads();
            }
        } catch (err) {
            alert('Error en datos. Verifique el archivo.');
        }
    };

    const updateLead = async (id, field, value) => {
        // Optimistic update
        setLeads(leads.map(l => l.id === id ? { ...l, [field]: value } : l));

        try {
            const token = localStorage.getItem('token');
            await fetch(`/api/leads/${id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`
                },
                body: JSON.stringify({ [field]: value }),
            });
        } catch (err) {
            console.error(err);
            fetchLeads(); // Revert on error
        }
    };

    return (
        <div>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '2rem' }}>
                <h2 style={{ fontSize: '1.75rem', fontWeight: 'bold', color: 'var(--text-primary)' }}>Gestión de Leads</h2>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button onClick={() => { setIsBulk(true); setShowForm(true); }} className="btn btn-secondary">
                        <FileSpreadsheet size={18} style={{ marginRight: '0.5rem', color: 'var(--accent-primary)' }} /> Carga Masiva (Excel/CSV)
                    </button>
                    <button onClick={() => { setIsBulk(false); setShowForm(true); }} className="btn btn-primary">
                        <Plus size={18} style={{ marginRight: '0.5rem' }} /> Nuevo Lead
                    </button>
                </div>
            </div>

            {showForm && (
                <div className="card" style={{ marginBottom: '2rem', animation: 'fadeIn 0.3s' }}>
                    <h3 style={{ marginBottom: '1.5rem', color: 'var(--accent-primary)' }}>{isBulk ? 'Importar Leads (Excel/CSV)' : 'Registrar Nuevo Lead'}</h3>
                    {isBulk ? (
                        <form onSubmit={handleBulkUpload}>
                            <div style={{ border: '2px dashed var(--bg-hover)', padding: '2rem', textAlign: 'center', borderRadius: 'var(--radius-md)', marginBottom: '1rem' }}>
                                <input type="file" accept=".xlsx, .xls, .csv" onChange={handleFileUpload} style={{ color: 'var(--text-secondary)' }} />
                                <p style={{ marginTop: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Formatos soportados: .xlsx, .csv. Columnas esperadas: Nombre, Telefono, Observaciones</p>
                            </div>
                            {formData.bulkData && <p style={{ color: 'var(--success)', marginBottom: '1rem' }}>✓ Archivo procesado listo para subir.</p>}

                            <div style={{ display: 'flex', gap: '0.5rem' }}>
                                <button type="submit" className="btn btn-primary" disabled={!formData.bulkData}>Subir Leads</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
                            </div>
                        </form>
                    ) : (
                        <form onSubmit={handleCreate} style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '1.5rem' }}>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Nombre</label>
                                <input className="input" placeholder="Ej. Juan Perez" value={formData.first_name} onChange={e => setFormData({ ...formData, first_name: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Apellido</label>
                                <input className="input" placeholder="Ej. Rodriguez" value={formData.last_name} onChange={e => setFormData({ ...formData, last_name: e.target.value })} />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Teléfono</label>
                                <input className="input" placeholder="Ej. 3001234567" value={formData.phone} onChange={e => setFormData({ ...formData, phone: e.target.value })} required />
                            </div>
                            <div>
                                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: 'var(--text-secondary)' }}>Observaciones</label>
                                <input className="input" placeholder="Notas iniciales..." value={formData.observations} onChange={e => setFormData({ ...formData, observations: e.target.value })} />
                            </div>
                            <div style={{ gridColumn: 'span 2', display: 'flex', gap: '0.5rem', marginTop: '1rem' }}>
                                <button type="submit" className="btn btn-primary">Guardar Lead</button>
                                <button type="button" onClick={() => setShowForm(false)} className="btn btn-secondary">Cancelar</button>
                            </div>
                        </form>
                    )}
                </div>
            )}

            <div className="card table-container">
                {loading ? <p style={{ textAlign: 'center', padding: '2rem', color: 'var(--text-secondary)' }}>Cargando leads...</p> : (
                    <table style={{ width: '100%' }}>
                        <thead>
                            <tr>
                                <th style={{ width: '100px' }}>Estado</th>
                                <th>Datos Personales</th>
                                <th>Fecha Ingreso</th>
                                <th>Gestión de Contacto</th>
                                <th>Agenda</th>
                                <th>Observaciones</th>
                            </tr>
                        </thead>
                        <tbody>
                            {leads.map(lead => (
                                <tr key={lead.id} style={{ transition: 'background 0.2s' }}>
                                    <td>
                                        <span className={`badge badge-${lead.temperature.toLowerCase()}`}>{lead.temperature === 'Hot' ? '🔥 Caliente' : lead.temperature === 'Warm' ? '⛅ Tibio' : '❄️ Frio'}</span>
                                    </td>
                                    <td>
                                        <div style={{ fontWeight: '600', color: 'var(--text-primary)' }}>{lead.first_name} {lead.last_name}</div>
                                        <div style={{ fontSize: '0.875rem', color: 'var(--text-secondary)', display: 'flex', alignItems: 'center', gap: '0.25rem' }}>
                                            <Phone size={12} /> {lead.phone}
                                        </div>
                                    </td>
                                    <td style={{ fontSize: '0.875rem', color: 'var(--text-secondary)' }}>
                                        {new Date(lead.created_at).toLocaleDateString()}
                                        <div style={{ fontSize: '0.75rem', opacity: 0.7 }}>{new Date(lead.created_at).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', flexDirection: 'column', gap: '0.5rem' }}>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <MessageCircle size={16} color="var(--success)" />
                                                <select
                                                    className="select"
                                                    style={{ padding: '0.25rem', fontSize: '0.875rem', width: 'auto' }}
                                                    value={lead.answered_whatsapp ? "1" : "0"}
                                                    onChange={(e) => updateLead(lead.id, 'answered_whatsapp', e.target.value === "1")}
                                                >
                                                    <option value="0">No Contestó</option>
                                                    <option value="1">Si Contestó</option>
                                                </select>
                                            </div>
                                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                                <Phone size={16} color="var(--accent-primary)" />
                                                <select
                                                    className="select"
                                                    style={{ padding: '0.25rem', fontSize: '0.875rem', width: 'auto' }}
                                                    value={lead.answered_phone ? "1" : "0"}
                                                    onChange={(e) => updateLead(lead.id, 'answered_phone', e.target.value === "1")}
                                                >
                                                    <option value="0">No Contestó</option>
                                                    <option value="1">Si Contestó</option>
                                                </select>
                                            </div>
                                        </div>
                                    </td>
                                    <td>
                                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                                            <Calendar size={16} color={lead.demo_scheduled ? "var(--warning)" : "var(--text-secondary)"} />
                                            <select
                                                className="select"
                                                style={{ padding: '0.25rem', fontSize: '0.875rem', width: 'auto', borderColor: lead.demo_scheduled ? 'var(--warning)' : '' }}
                                                value={lead.demo_scheduled ? "1" : "0"}
                                                onChange={(e) => updateLead(lead.id, 'demo_scheduled', e.target.value === "1")}
                                            >
                                                <option value="0">Sin Agendar</option>
                                                <option value="1">Agendada</option>
                                            </select>
                                        </div>
                                    </td>
                                    <td>
                                        <textarea
                                            className="input"
                                            style={{ padding: '0.5rem', fontSize: '0.875rem', width: '100%', minWidth: '200px', resize: 'vertical', background: 'transparent' }}
                                            defaultValue={lead.observations}
                                            rows={3}
                                            placeholder="Escribe observaciones aquí..."
                                            onBlur={(e) => updateLead(lead.id, 'observations', e.target.value)}
                                        />
                                    </td>
                                </tr>
                            ))}
                        </tbody>
                    </table>
                )}
            </div>
        </div>
    );
}
