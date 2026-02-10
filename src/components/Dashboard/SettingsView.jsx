import React, { useState, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { Settings, User, LogOut, RefreshCw, Save, Activity } from 'lucide-react';
import { generateWorkoutPlan, generateNutritionPlan } from '../../services/ai';

const GOAL_LABELS = {
    fat_loss: 'Yağ Kaybı', muscle_gain: 'Kas Kazanımı',
    recomp: 'Recomposition', performance: 'Performans',
};
const EQUIPMENT_LABELS = {
    gym: 'Tam Donanımlı Salon', home_weights: 'Ev (Ağırlıklar)',
    bodyweight: 'Vücut Ağırlığı',
};

const SettingsView = () => {
    const { user, logout, updatePlans, updateUserInfo } = useUser();
    const [notes, setNotes] = useState('');
    const [saving, setSaving] = useState(false);

    useEffect(() => {
        if (user?.healthNotes) setNotes(user.healthNotes);
    }, [user]);

    const regeneratePlans = async () => {
        if (!user) return;
        const [workout, nutrition] = await Promise.all([
            generateWorkoutPlan(user), generateNutritionPlan(user),
        ]);
        updatePlans({ workout, nutrition });
    };

    const handleSaveNotes = async () => {
        setSaving(true);
        await updateUserInfo({ healthNotes: notes });
        setSaving(false);
    };

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <div>
                    <h1>Ayarlar</h1>
                    <p className="subtitle">Profil ve uygulama tercihleri</p>
                </div>
            </div>

            <div className="grid-main">
                <div className="settings-section">
                    <h3><User size={14} /> Profil Bilgileri</h3>
                    {[
                        ['İsim', user?.name],
                        ['Yaş', user?.age],
                        ['Boy', user?.height ? `${user.height} cm` : null],
                        ['Kilo', user?.weight ? `${user.weight} kg` : null],
                        ['Hedef', GOAL_LABELS[user?.goal]],
                        ['Ekipman', EQUIPMENT_LABELS[user?.equipment]],
                        ['Haftalık Gün', user?.activityLevel ? `${user.activityLevel} gün` : null],
                    ].map(([label, value]) => (
                        <div key={label} className="settings-row">
                            <label>{label}</label>
                            <span className="settings-value">{value || '—'}</span>
                        </div>
                    ))}
                </div>

                <div className="settings-section">
                    <h3><Activity size={14} /> Sağlık & Diğer Detaylar</h3>
                    <p style={{ fontSize: '0.85rem', color: 'var(--text-dim)', marginBottom: '1rem' }}>
                        Sakatlıklar, alerjiler veya koçun bilmesi gereken diğer özel durumlar.
                    </p>
                    <textarea
                        className="input-group"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Örn: Bel fıtığım var, yumurta alerjim var..."
                        style={{ minHeight: '100px', width: '100%', padding: '1rem', resize: 'vertical' }}
                    />
                    <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: '1rem' }}>
                        <button className="btn btn-primary btn-sm" onClick={handleSaveNotes} disabled={saving}>
                            {saving ? 'Kaydediliyor...' : <><Save size={14} /> Kaydet</>}
                        </button>
                    </div>
                </div>
            </div>

            <div className="settings-section" style={{ marginTop: '1.5rem' }}>
                <h3>İşlemler</h3>
                <div style={{ display: 'flex', gap: '1rem', flexWrap: 'wrap' }}>
                    <button className="btn btn-outline" onClick={regeneratePlans}>
                        <RefreshCw size={16} /> Planları Yeniden Oluştur
                    </button>
                    <button className="btn btn-danger" onClick={logout}>
                        <LogOut size={16} /> Sıfırla ve Çıkış Yap
                    </button>
                </div>
            </div>
        </div>
    );
};

export default SettingsView;
