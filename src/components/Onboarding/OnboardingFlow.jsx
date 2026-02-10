import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { ChevronRight, ChevronLeft, Check, Flame, Dumbbell, RefreshCw, Zap } from 'lucide-react';

const GOALS = [
    { id: 'fat_loss', label: 'Yağ Kaybı', desc: 'Sıkılaş ve yağ yak', icon: '🔥' },
    { id: 'muscle_gain', label: 'Kas Kazanımı', desc: 'Hacim ve güç kazan', icon: '💪' },
    { id: 'recomp', label: 'Recomposition', desc: 'Yağ yak, kas yap', icon: '⚡' },
    { id: 'performance', label: 'Performans', desc: 'Atletik gelişim', icon: '🏃' },
];

const OnboardingFlow = () => {
    const { updateUserInfo, setOnboardingStep } = useUser();
    const [step, setStep] = useState(1);
    const totalSteps = 3;

    const [formData, setFormData] = useState({
        age: '', gender: 'male', weight: '', height: '',
        goal: 'recomp', activityLevel: '4', equipment: 'gym',
        experience: 'intermediate', name: '',
    });

    const update = (key, value) => setFormData(prev => ({ ...prev, [key]: value }));

    const nextStep = () => {
        if (step === 1 && (!formData.name || !formData.age || !formData.weight || !formData.height)) return;
        setStep(s => Math.min(s + 1, totalSteps));
    };

    const prevStep = () => setStep(s => Math.max(s - 1, 1));

    const handleSubmit = (e) => {
        e.preventDefault();
        updateUserInfo(formData);
        setOnboardingStep('dashboard');
    };

    return (
        <div className="onboarding-container glass">
            <div className="step-indicator">
                {[1, 2, 3].map(s => (
                    <div key={s} className={`step-dot ${step > s ? 'completed' : ''} ${step >= s ? 'active' : ''}`}>
                        {step > s ? <Check size={14} /> : s}
                    </div>
                ))}
            </div>

            <form onSubmit={handleSubmit} className="onboarding-form">
                {step === 1 && (
                    <div className="form-step fade-in-up">
                        <h2>Seni Tanıyalım</h2>
                        <p className="step-desc">Kişisel planını oluşturmak için birkaç bilgiye ihtiyacımız var.</p>

                        <div className="input-group">
                            <label>İsim</label>
                            <input type="text" value={formData.name} onChange={e => update('name', e.target.value)} placeholder="Adın" required />
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Yaş</label>
                                <input type="number" value={formData.age} onChange={e => update('age', e.target.value)} placeholder="25" min="14" max="80" required />
                            </div>
                            <div className="input-group">
                                <label>Cinsiyet</label>
                                <select value={formData.gender} onChange={e => update('gender', e.target.value)}>
                                    <option value="male">Erkek</option>
                                    <option value="female">Kadın</option>
                                    <option value="other">Diğer</option>
                                </select>
                            </div>
                        </div>

                        <div className="input-row">
                            <div className="input-group">
                                <label>Boy (cm)</label>
                                <input type="number" value={formData.height} onChange={e => update('height', e.target.value)} placeholder="175" required />
                            </div>
                            <div className="input-group">
                                <label>Kilo (kg)</label>
                                <input type="number" value={formData.weight} onChange={e => update('weight', e.target.value)} placeholder="75" required />
                            </div>
                        </div>
                    </div>
                )}

                {step === 2 && (
                    <div className="form-step fade-in-up">
                        <h2>Hedefin Ne?</h2>
                        <p className="step-desc">Ana hedefini seç, programın buna göre şekillensin.</p>

                        <div className="goal-options">
                            {GOALS.map(goal => (
                                <div key={goal.id}
                                    className={`goal-card glass ${formData.goal === goal.id ? 'selected' : ''}`}
                                    onClick={() => update('goal', goal.id)}>
                                    <div className="goal-icon">{goal.icon}</div>
                                    <h4>{goal.label}</h4>
                                    <p>{goal.desc}</p>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {step === 3 && (
                    <div className="form-step fade-in-up">
                        <h2>Son Detaylar</h2>
                        <p className="step-desc">Planını optimize etmek için birkaç detay daha.</p>

                        <div className="input-group">
                            <label>Haftalık Antrenman Günü</label>
                            <input type="range" min="2" max="6" value={formData.activityLevel}
                                onChange={e => update('activityLevel', e.target.value)} />
                            <div className="range-display">
                                <span className="text-muted">Haftada</span>
                                <span className="range-value">{formData.activityLevel} Gün</span>
                            </div>
                        </div>

                        <div className="input-group">
                            <label>Deneyim Seviyesi</label>
                            <select value={formData.experience} onChange={e => update('experience', e.target.value)}>
                                <option value="beginner">Başlangıç (0-1 yıl)</option>
                                <option value="intermediate">Orta (1-3 yıl)</option>
                                <option value="advanced">İleri (3+ yıl)</option>
                            </select>
                        </div>

                        <div className="input-group">
                            <label>Ekipman</label>
                            <select value={formData.equipment} onChange={e => update('equipment', e.target.value)}>
                                <option value="gym">Tam Donanımlı Salon</option>
                                <option value="home_weights">Ev (Ağırlıklar Var)</option>
                                <option value="bodyweight">Sadece Vücut Ağırlığı</option>
                            </select>
                        </div>
                    </div>
                )}

                <div className="form-actions">
                    {step > 1 ? (
                        <button type="button" className="btn btn-ghost" onClick={prevStep}>
                            <ChevronLeft size={18} /> Geri
                        </button>
                    ) : <div />}

                    {step < totalSteps ? (
                        <button type="button" className="btn btn-primary btn-lg" onClick={nextStep}>
                            Devam <ChevronRight size={18} />
                        </button>
                    ) : (
                        <button type="submit" className="btn btn-primary btn-lg">
                            Planımı Oluştur <Zap size={18} />
                        </button>
                    )}
                </div>
            </form>
        </div>
    );
};

export default OnboardingFlow;
