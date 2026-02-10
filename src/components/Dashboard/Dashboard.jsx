import React, { useEffect, useState } from 'react';
import { useUser } from '../../context/UserContext';
import { generateWorkoutPlan, generateNutritionPlan } from '../../services/ai';
import { Activity, Utensils, TrendingUp, MessageSquare, Settings, LogOut, Dumbbell, BarChart3 } from 'lucide-react';
import WorkoutView from '../Workout/WorkoutView';
import NutritionView from '../Nutrition/NutritionView';
import ProgressView from '../Progress/ProgressView';
import ChatView from '../Dashboard/ChatView';
import SettingsView from '../Dashboard/SettingsView';

const TABS = [
    { id: 'overview', label: 'Genel', icon: BarChart3 },
    { id: 'workout', label: 'Antrenman', icon: Dumbbell },
    { id: 'nutrition', label: 'Beslenme', icon: Utensils },
    { id: 'progress', label: 'Gelişim', icon: TrendingUp },
    { id: 'chat', label: 'AI Koç', icon: MessageSquare },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
];

const Dashboard = () => {
    const { user, plans, updatePlans } = useUser();
    const [activeTab, setActiveTab] = useState('overview');
    const [loading, setLoading] = useState(!plans);

    useEffect(() => {
        const fetchPlans = async () => {
            if (!plans && user) {
                setLoading(true);
                try {
                    const [workout, nutrition] = await Promise.all([
                        generateWorkoutPlan(user),
                        generateNutritionPlan(user),
                    ]);
                    updatePlans({ workout, nutrition });
                } catch (err) {
                    console.error('Plan generation failed:', err);
                } finally {
                    setLoading(false);
                }
            }
        };
        fetchPlans();
    }, []);

    if (loading) {
        return (
            <div className="loading-screen">
                <div className="loading-dots">
                    <span></span><span></span><span></span>
                </div>
                <p>AI Koçun planlarını hazırlıyor...</p>
            </div>
        );
    }

    const todayWorkout = plans?.workout?.schedule?.[new Date().getDay() % (plans?.workout?.schedule?.length || 1)];

    return (
        <div className="dashboard-container fade-in-up">
            <header className="dashboard-header">
                <div className="user-welcome">
                    <h1>Selam, <span className="gradient-text">{user?.name || 'Sporcu'}</span> 👋</h1>
                    <p className="text-muted">{new Date().toLocaleDateString('tr-TR', { weekday: 'long', day: 'numeric', month: 'long' })}</p>
                </div>
                <div className="ai-coach-bubble glass">
                    <MessageSquare size={20} color="var(--primary)" />
                    <p>{plans?.workout?.coachMessage || 'Planın hazır, hadi başlayalım!'}</p>
                </div>
            </header>

            <nav className="nav-tabs">
                {TABS.map(tab => {
                    const Icon = tab.icon;
                    return (
                        <button key={tab.id} className={`nav-tab ${activeTab === tab.id ? 'active' : ''}`}
                            onClick={() => setActiveTab(tab.id)}>
                            <Icon size={16} /> {tab.label}
                        </button>
                    );
                })}
            </nav>

            {activeTab === 'overview' && (
                <div className="dashboard-grid">
                    <section className="dashboard-card glass">
                        <div className="card-header">
                            <Activity color="var(--primary)" size={20} />
                            <h3>Bugünkü Antrenman</h3>
                            {todayWorkout && <span className="card-badge">{todayWorkout.focus}</span>}
                        </div>
                        <div className="exercise-list">
                            {todayWorkout?.exercises?.slice(0, 4).map((ex, i) => (
                                <div key={i} className="exercise-row">
                                    <span className="exercise-name">{ex.name}</span>
                                    <div className="exercise-detail"><span>Set</span><strong>{ex.sets}</strong></div>
                                    <div className="exercise-detail"><span>Tekrar</span><strong>{ex.reps}</strong></div>
                                    <div className="exercise-detail"><span>Dinlenme</span><strong>{ex.rest}</strong></div>
                                </div>
                            )) || <p className="text-muted">Dinlenme günü 🧘</p>}
                        </div>
                        <button className="btn-secondary btn-sm" onClick={() => setActiveTab('workout')}>Tüm Programı Gör</button>
                    </section>

                    <section className="dashboard-card glass">
                        <div className="card-header">
                            <Utensils color="var(--accent)" size={20} />
                            <h3>Beslenme Hedefi</h3>
                        </div>
                        <div className="macros-grid">
                            <div className="macro-item">
                                <label>Kalori</label>
                                <div className="macro-val cal">{plans?.nutrition?.targets?.calories || '—'}</div>
                            </div>
                            <div className="macro-item">
                                <label>Protein</label>
                                <div className="macro-val protein">{plans?.nutrition?.targets?.protein || '—'}g</div>
                            </div>
                            <div className="macro-item">
                                <label>Karb</label>
                                <div className="macro-val carbs">{plans?.nutrition?.targets?.carbs || '—'}g</div>
                            </div>
                            <div className="macro-item">
                                <label>Yağ</label>
                                <div className="macro-val fats">{plans?.nutrition?.targets?.fats || '—'}g</div>
                            </div>
                        </div>
                        <button className="btn-secondary btn-sm" onClick={() => setActiveTab('nutrition')}>Öğünleri Gör</button>
                    </section>

                    <section className="dashboard-card glass full-width">
                        <div className="card-header">
                            <TrendingUp color="var(--success)" size={20} />
                            <h3>Gelişim Özeti</h3>
                        </div>
                        <div className="stat-cards">
                            <div className="stat-card glass">
                                <div className="stat-value gradient-text">{user?.weight || '—'}</div>
                                <div className="stat-label">Mevcut Kilo (kg)</div>
                            </div>
                            <div className="stat-card glass">
                                <div className="stat-value" style={{ color: 'var(--success)' }}>{plans?.workout?.schedule?.length || 0}</div>
                                <div className="stat-label">Haftalık Gün</div>
                            </div>
                            <div className="stat-card glass">
                                <div className="stat-value" style={{ color: 'var(--warning)' }}>{plans?.nutrition?.targets?.calories || '—'}</div>
                                <div className="stat-label">Günlük Kalori</div>
                            </div>
                            <div className="stat-card glass">
                                <div className="stat-value" style={{ color: 'var(--primary)' }}>{plans?.nutrition?.targets?.protein || '—'}g</div>
                                <div className="stat-label">Günlük Protein</div>
                            </div>
                        </div>
                    </section>
                </div>
            )}

            {activeTab === 'workout' && <WorkoutView />}
            {activeTab === 'nutrition' && <NutritionView />}
            {activeTab === 'progress' && <ProgressView />}
            {activeTab === 'chat' && <ChatView />}
            {activeTab === 'settings' && <SettingsView />}
        </div>
    );
};

export default Dashboard;
