import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { TrendingUp, Plus, Scale, Ruler } from 'lucide-react';

const ProgressView = () => {
    const { user, progress, addProgressEntry } = useUser();
    const [showForm, setShowForm] = useState(false);
    const [entry, setEntry] = useState({ weight: '', chest: '', waist: '', arm: '', note: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addProgressEntry(entry);
        setEntry({ weight: '', chest: '', waist: '', arm: '', note: '' });
        setShowForm(false);
    };

    const latestWeight = progress.length > 0 ? progress[progress.length - 1].weight : user?.weight;
    const startWeight = user?.weight;
    const diff = latestWeight && startWeight ? (parseFloat(latestWeight) - parseFloat(startWeight)).toFixed(1) : null;

    return (
        <div className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <TrendingUp size={24} color="var(--success)" /> Gelişim Takibi
                </h2>
                <button className="btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} /> Kayıt Ekle
                </button>
            </div>

            {showForm && (
                <form onSubmit={handleSubmit} className="dashboard-card glass" style={{ marginBottom: '1.5rem' }}>
                    <h3 style={{ marginBottom: '1rem' }}>Yeni Ölçüm</h3>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Kilo (kg)</label>
                            <input type="number" step="0.1" value={entry.weight}
                                onChange={e => setEntry({ ...entry, weight: e.target.value })} placeholder="75.5" />
                        </div>
                        <div className="input-group">
                            <label>Göğüs (cm)</label>
                            <input type="number" value={entry.chest}
                                onChange={e => setEntry({ ...entry, chest: e.target.value })} placeholder="100" />
                        </div>
                    </div>
                    <div className="input-row">
                        <div className="input-group">
                            <label>Bel (cm)</label>
                            <input type="number" value={entry.waist}
                                onChange={e => setEntry({ ...entry, waist: e.target.value })} placeholder="80" />
                        </div>
                        <div className="input-group">
                            <label>Kol (cm)</label>
                            <input type="number" value={entry.arm}
                                onChange={e => setEntry({ ...entry, arm: e.target.value })} placeholder="35" />
                        </div>
                    </div>
                    <div className="input-group">
                        <label>Not</label>
                        <input type="text" value={entry.note}
                            onChange={e => setEntry({ ...entry, note: e.target.value })} placeholder="Bugün kendimi iyi hissediyorum" />
                    </div>
                    <button type="submit" className="btn-primary" style={{ width: '100%' }}>Kaydet</button>
                </form>
            )}

            <div className="stat-cards" style={{ marginBottom: '1.5rem' }}>
                <div className="stat-card glass">
                    <Scale size={20} color="var(--primary)" style={{ marginBottom: '0.5rem' }} />
                    <div className="stat-value gradient-text">{latestWeight || '—'}</div>
                    <div className="stat-label">Mevcut Kilo (kg)</div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-value" style={{ color: 'var(--warning)' }}>{startWeight || '—'}</div>
                    <div className="stat-label">Başlangıç Kilo (kg)</div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-value" style={{ color: diff > 0 ? 'var(--accent)' : 'var(--success)' }}>
                        {diff ? (diff > 0 ? `+${diff}` : diff) : '—'}
                    </div>
                    <div className="stat-label">Değişim (kg)</div>
                </div>
                <div className="stat-card glass">
                    <div className="stat-value" style={{ color: 'var(--secondary)' }}>{progress.length}</div>
                    <div className="stat-label">Toplam Kayıt</div>
                </div>
            </div>

            {progress.length > 0 && (
                <div className="dashboard-card glass">
                    <div className="card-header"><h3>Geçmiş Kayıtlar</h3></div>
                    <div className="exercise-list">
                        {[...progress].reverse().map((entry, i) => (
                            <div key={i} className="exercise-row" style={{ gridTemplateColumns: 'auto 1fr auto auto auto' }}>
                                <span style={{ fontSize: '0.75rem', color: 'var(--text-dim)' }}>
                                    {new Date(entry.date).toLocaleDateString('tr-TR', { day: 'numeric', month: 'short' })}
                                </span>
                                <span className="exercise-name">{entry.note || '—'}</span>
                                <div className="exercise-detail">
                                    <span>Kilo</span><strong>{entry.weight || '—'}kg</strong>
                                </div>
                                <div className="exercise-detail">
                                    <span>Bel</span><strong>{entry.waist || '—'}cm</strong>
                                </div>
                                <div className="exercise-detail">
                                    <span>Kol</span><strong>{entry.arm || '—'}cm</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {progress.length === 0 && !showForm && (
                <div className="dashboard-card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <Ruler size={32} color="var(--text-dim)" style={{ marginBottom: '1rem' }} />
                    <p className="text-muted">Henüz bir ölçüm kaydı yok.</p>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginTop: '0.5rem' }}>
                        "Kayıt Ekle" butonuyla ilk ölçümünü kaydet, gelişimini takip edelim!
                    </p>
                </div>
            )}
        </div>
    );
};

export default ProgressView;
