import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { TrendingUp, Upload, Plus, ArrowDownRight, ArrowUpRight, Minus, Calendar } from 'lucide-react';

const ProgressPage = () => {
    const { user, progress, addProgressEntry } = useUser();
    const [showForm, setShowForm] = useState(false);
    const [entry, setEntry] = useState({ weight: '', chest: '', waist: '', arm: '', neck: '', hips: '', note: '' });

    const handleSubmit = (e) => {
        e.preventDefault();
        addProgressEntry(entry);
        setEntry({ weight: '', chest: '', waist: '', arm: '', neck: '', hips: '', note: '' });
        setShowForm(false);
    };

    const latest = progress.length > 0 ? progress[progress.length - 1] : null;
    const previous = progress.length > 1 ? progress[progress.length - 2] : null;
    const startWeight = parseFloat(user?.weight);
    const currentWeight = latest?.weight ? parseFloat(latest.weight) : startWeight;
    const weightDiff = latest && previous && latest.weight && previous.weight
        ? (parseFloat(latest.weight) - parseFloat(previous.weight)).toFixed(1)
        : null;

    const getDelta = (curr, prev) => {
        if (!curr || !prev) return null;
        return (parseFloat(curr) - parseFloat(prev)).toFixed(1);
    };

    const getTrend = (delta, invertGood = false) => {
        if (delta === null) return { text: '— Stabil', cls: 'stable' };
        const n = parseFloat(delta);
        if (n === 0) return { text: '— Stabil', cls: 'stable' };
        const isGood = invertGood ? n < 0 : n > 0;
        if (isGood) return { text: `↗ Büyüme`, cls: 'growth' };
        return { text: `↘ ${(Math.abs(n / (parseFloat(previous?.weight || user?.weight || 80))) * 100).toFixed(1)}%`, cls: 'loss' };
    };

    const biometrics = [
        { label: 'Kilo (kg)', key: 'weight' },
        { label: 'Göğüs (cm)', key: 'chest' },
        { label: 'Bel (cm)', key: 'waist', invert: true },
        { label: 'Kol (cm)', key: 'arm' },
        { label: 'Boyun (cm)', key: 'neck' },
        { label: 'Kalça (cm)', key: 'hips', invert: true },
    ];

    const weightVariance = progress.length > 2
        ? (Math.max(...progress.slice(-7).map(p => parseFloat(p.weight || 0))) - Math.min(...progress.slice(-7).map(p => parseFloat(p.weight || 0)))).toFixed(1)
        : null;

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <div>
                    <h1>İlerleme Analizi</h1>
                    <p className="subtitle">Objektif takip sistemi</p>
                </div>
                <button className="btn btn-primary btn-sm" onClick={() => setShowForm(!showForm)}>
                    <Plus size={16} /> Yeni Ölçüm
                </button>
            </div>

            {/* Input Form */}
            {showForm && (
                <form onSubmit={handleSubmit} className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header"><h3>Yeni Ölçüm Kayıt</h3></div>
                    <div className="input-row">
                        <div className="input-group"><label>Kilo (kg)</label><input type="number" step="0.1" value={entry.weight} onChange={e => setEntry({ ...entry, weight: e.target.value })} placeholder="75.5" /></div>
                        <div className="input-group"><label>Göğüs (cm)</label><input type="number" value={entry.chest} onChange={e => setEntry({ ...entry, chest: e.target.value })} placeholder="100" /></div>
                    </div>
                    <div className="input-row">
                        <div className="input-group"><label>Bel (cm)</label><input type="number" value={entry.waist} onChange={e => setEntry({ ...entry, waist: e.target.value })} placeholder="80" /></div>
                        <div className="input-group"><label>Kol (cm)</label><input type="number" value={entry.arm} onChange={e => setEntry({ ...entry, arm: e.target.value })} placeholder="35" /></div>
                    </div>
                    <div className="input-row">
                        <div className="input-group"><label>Boyun (cm)</label><input type="number" value={entry.neck} onChange={e => setEntry({ ...entry, neck: e.target.value })} placeholder="38" /></div>
                        <div className="input-group"><label>Kalça (cm)</label><input type="number" value={entry.hips} onChange={e => setEntry({ ...entry, hips: e.target.value })} placeholder="98" /></div>
                    </div>
                    <div className="input-group"><label>Not</label><input type="text" value={entry.note} onChange={e => setEntry({ ...entry, note: e.target.value })} placeholder="Bugün kendimi iyi hissediyorum" /></div>
                    <button type="submit" className="btn btn-primary" style={{ width: '100%' }}>Kaydet</button>
                </form>
            )}

            <div className="grid-main">
                {/* Trend Analysis Card */}
                <div className="card">
                    <div className="card-header">
                        <div>
                            <h3>Trend Analizi</h3>
                            <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>Son ölçüm verilerine göre ağırlık değişimi</p>
                        </div>
                    </div>

                    {/* Simple weight chart visualization */}
                    <div style={{ height: '200px', display: 'flex', alignItems: 'flex-end', gap: 2, padding: '1rem 0' }}>
                        {(progress.length > 0 ? progress.slice(-10) : [{ weight: user?.weight }]).map((p, i, arr) => {
                            const w = parseFloat(p.weight || user?.weight || 80);
                            const min = Math.min(...arr.map(a => parseFloat(a.weight || user?.weight || 80))) - 2;
                            const max = Math.max(...arr.map(a => parseFloat(a.weight || user?.weight || 80))) + 2;
                            const h = ((w - min) / (max - min || 1)) * 100;
                            return (
                                <div key={i} style={{ flex: 1, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 4 }}>
                                    <span style={{ fontSize: '0.65rem', color: 'var(--text-dim)' }}>{w}</span>
                                    <div style={{
                                        width: '100%', height: `${h}%`, minHeight: '8px',
                                        borderRadius: '4px 4px 0 0',
                                        background: i === arr.length - 1
                                            ? 'linear-gradient(0deg, rgba(var(--primary-rgb),0.4), var(--primary))'
                                            : 'rgba(var(--primary-rgb), 0.15)',
                                    }} />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Status Cards */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.75rem' }}>
                            <div style={{ width: 36, height: 36, borderRadius: 10, background: 'rgba(var(--primary-rgb),0.1)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <TrendingUp size={18} color="var(--primary)" />
                            </div>
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>
                                    {weightDiff ? (Math.abs(parseFloat(weightDiff)) < 0.5 ? 'Kilo Stabil' : parseFloat(weightDiff) < 0 ? 'Kilo Düşüyor' : 'Kilo Artıyor') : 'Veri Bekleniyor'}
                                </div>
                            </div>
                        </div>
                        <p style={{ fontSize: '0.82rem', color: 'var(--text-dim)' }}>
                            {weightVariance ? `Varyans son 7 kayıtta ${weightVariance} kg.` : 'İlk ölçümlerini girerek takibe başla.'}
                        </p>
                        <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: '0.75rem', fontSize: '0.75rem' }}>
                            <span style={{ color: 'var(--text-dim)' }}>TREND</span>
                            <span style={{ fontWeight: 700, color: 'var(--text-secondary)' }}>
                                {weightDiff ? (Math.abs(parseFloat(weightDiff)) < 0.5 ? 'NÖTR' : parseFloat(weightDiff) < 0 ? 'DÜŞÜŞ' : 'ARTIŞ') : '—'}
                            </span>
                        </div>
                    </div>

                    <div className="card">
                        <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '0.5rem' }}>
                            <Calendar size={18} color="var(--text-secondary)" />
                            <div>
                                <div style={{ fontWeight: 700, fontSize: '0.95rem' }}>Sonraki Ölçüm</div>
                                <div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Her hafta tartıl</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Biometrics Table */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header">
                    <div>
                        <h3>Son Biyometrik Veriler</h3>
                        <p style={{ fontSize: '0.8rem', color: 'var(--text-dim)', marginTop: 2 }}>Ham ölçüm verileri</p>
                    </div>
                </div>
                <table className="bio-table">
                    <thead>
                        <tr>
                            <th>Metrik</th>
                            <th>Güncel</th>
                            <th>Önceki</th>
                            <th>Fark</th>
                            <th>Trend</th>
                        </tr>
                    </thead>
                    <tbody>
                        {biometrics.map(bio => {
                            const curr = latest?.[bio.key] || (bio.key === 'weight' ? user?.weight : null);
                            const prev = previous?.[bio.key] || (bio.key === 'weight' ? user?.weight : null);
                            const delta = getDelta(curr, prev);
                            const trend = getTrend(delta, bio.invert);
                            return (
                                <tr key={bio.key}>
                                    <td style={{ fontWeight: 500 }}>{bio.label}</td>
                                    <td style={{ fontWeight: 600 }}>{curr || '—'}</td>
                                    <td style={{ color: 'var(--text-dim)' }}>{prev || '—'}</td>
                                    <td className={delta ? (parseFloat(delta) > 0 ? 'delta-positive' : parseFloat(delta) < 0 ? 'delta-negative' : 'delta-neutral') : 'delta-neutral'}>
                                        {delta ? (parseFloat(delta) > 0 ? `+${delta}` : delta) : '—'}
                                    </td>
                                    <td>
                                        <span className={`trend-badge ${trend.cls}`}>{trend.text}</span>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
                {progress.length > 0 && (
                    <div style={{ textAlign: 'center', marginTop: '1rem', paddingTop: '0.75rem', borderTop: '1px solid var(--border)' }}>
                        <span style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
                            Toplam {progress.length} kayıt
                        </span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ProgressPage;
