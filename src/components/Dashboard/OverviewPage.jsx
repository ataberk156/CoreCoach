import React from 'react';
import { useUser } from '../../context/UserContext';
import { Sparkles, PlayCircle, ChevronRight, Flame, Scale, CheckCircle, Moon } from 'lucide-react';

const DAYS = ['Pzt', 'Sal', 'Çar', 'Per', 'Cum', 'Cmt', 'Paz'];

const OverviewPage = ({ onNavigate }) => {
    const { user, plans } = useUser();
    const schedule = plans?.workout?.schedule || [];
    const nutrition = plans?.nutrition;
    const today = new Date();
    const dayIndex = (today.getDay() + 6) % 7;
    const todayWorkout = schedule[dayIndex % schedule.length];

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <div>
                    <h1>Günaydın, {user?.name || 'Sporcu'} 👋</h1>
                    <p className="subtitle">
                        {today.toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}
                    </p>
                </div>
                <button className="btn btn-primary btn-lg" onClick={() => onNavigate('workout')}>
                    <PlayCircle size={18} /> Antrenmana Başla
                </button>
            </div>

            {/* AI Insight */}
            <div className="ai-insight">
                <Sparkles size={22} color="var(--primary)" style={{ flexShrink: 0, marginTop: 2 }} />
                <div>
                    <div className="insight-badge">AI Koç Analizi</div>
                    <p>{plans?.workout?.coachMessage || 'Planların hazır! Bugün harika bir antrenman günü olacak. Progressive overload hedeflerine bağlı kal ve hidrasyon seviyeni yüksek tut!'}</p>
                </div>
            </div>

            {/* Main Grid */}
            <div className="grid-main">
                {/* Today's Focus */}
                <div className="card">
                    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
                        <div>
                            <div className="insight-badge" style={{ marginBottom: 8 }}>Bugünün Odağı</div>
                            <h2 style={{ fontSize: '1.4rem', marginBottom: 4 }}>{todayWorkout?.focus || 'Dinlenme'}</h2>
                            <p style={{ color: 'var(--text-dim)', fontSize: '0.85rem' }}>{todayWorkout?.day}</p>
                        </div>
                        {todayWorkout?.exercises && (
                            <div style={{ textAlign: 'right', color: 'var(--text-dim)', fontSize: '0.85rem' }}>
                                <div style={{ fontSize: '2rem', fontWeight: 800, fontFamily: 'var(--font-display)', color: 'var(--text)' }}>
                                    {Math.round(todayWorkout.exercises.length * 12)}
                                    <span style={{ fontSize: '0.8rem', fontWeight: 400, marginLeft: 4 }}>dk</span>
                                </div>
                                TAHMİNİ SÜRE
                            </div>
                        )}
                    </div>
                    {todayWorkout?.exercises && (
                        <>
                            <div className="grid-3" style={{ margin: '1.25rem 0' }}>
                                <div className="stat-box">
                                    <div className="stat-box-label">Hacim</div>
                                    <div className="stat-box-value">{todayWorkout.exercises.reduce((a, e) => a + (e.sets || 0), 0) * 50} kg</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-box-label">Yoğunluk</div>
                                    <div className="stat-box-value">Yüksek</div>
                                </div>
                                <div className="stat-box">
                                    <div className="stat-box-label">Hareketler</div>
                                    <div className="stat-box-value">{todayWorkout.exercises.length} Set</div>
                                </div>
                            </div>
                            <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                                <button className="btn btn-outline btn-sm" onClick={() => onNavigate('workout')}>
                                    Planı Gör <ChevronRight size={14} />
                                </button>
                            </div>
                        </>
                    )}
                </div>

                {/* Nutrition Summary */}
                <div className="card">
                    <div className="card-header">
                        <h3>Beslenme</h3>
                        <button className="btn btn-outline btn-sm" onClick={() => onNavigate('nutrition')}>Öğün Ekle</button>
                    </div>
                    <div className="donut-container">
                        <div className="donut-ring" style={{
                            background: `conic-gradient(var(--primary) 0% 75%, var(--border) 75% 100%)`,
                        }}>
                            <div style={{ width: '90px', height: '90px', borderRadius: '50%', background: 'var(--bg-card)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                                <div className="donut-center">
                                    <div className="donut-val">{nutrition?.targets?.calories || 2400}</div>
                                    <div className="donut-label">/ {Math.round((nutrition?.targets?.calories || 2400) * 1.15)} kcal</div>
                                </div>
                            </div>
                        </div>
                    </div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', marginTop: '1rem' }}>
                        {[
                            { label: 'Protein', val: nutrition?.targets?.protein || 180, max: 200, color: 'var(--primary)' },
                            { label: 'Karb', val: nutrition?.targets?.carbs || 220, max: 300, color: 'var(--secondary)' },
                            { label: 'Yağ', val: nutrition?.targets?.fats || 55, max: 80, color: 'var(--accent)' },
                        ].map(m => (
                            <div key={m.label}>
                                <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: '0.85rem', marginBottom: 4 }}>
                                    <span>{m.label}</span>
                                    <span style={{ fontWeight: 600 }}>{m.val}g <span style={{ color: 'var(--text-dim)' }}>/ {m.max}g</span></span>
                                </div>
                                <div className="progress-bar">
                                    <div className="progress-bar-fill" style={{ width: `${Math.min((m.val / m.max) * 100, 100)}%`, background: m.color }}></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* Weekly Schedule */}
            <div className="card" style={{ marginTop: '1.5rem' }}>
                <div className="card-header"><h3>Haftalık Program</h3></div>
                <div className="weekly-dots">
                    {DAYS.map((d, i) => (
                        <div key={d} className="dot-day">
                            <span className="dot-label">{d}</span>
                            <div className={`dot ${i < dayIndex ? 'done' : i === dayIndex ? 'today' : ''}`}>
                                {i < dayIndex ? <CheckCircle size={16} /> : i === dayIndex ? today.getDate() : ''}
                            </div>
                        </div>
                    ))}
                </div>
            </div>

            {/* Stats Row */}
            <div className="stat-row">
                <div className="stat-card">
                    <div>
                        <div className="stat-label">Gün Serisi</div>
                        <div className="stat-value">{dayIndex} <small>gün</small></div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(245,158,11,0.1)' }}>
                        <Flame size={20} color="var(--warning)" />
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <div className="stat-label">Mevcut Kilo</div>
                        <div className="stat-value">{user?.weight || '—'} <small>kg</small></div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(var(--primary-rgb),0.1)' }}>
                        <Scale size={20} color="var(--primary)" />
                    </div>
                </div>
                <div className="stat-card">
                    <div>
                        <div className="stat-label">Haftalık Gün</div>
                        <div className="stat-value">{user?.activityLevel || 4} <small>/ 7</small></div>
                    </div>
                    <div className="stat-icon" style={{ background: 'rgba(var(--success-rgb),0.1)' }}>
                        <CheckCircle size={20} color="var(--success)" />
                    </div>
                </div>
            </div>
        </div>
    );
};

export default OverviewPage;
