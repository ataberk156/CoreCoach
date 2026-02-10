import React, { useState, useRef } from 'react';
import { useUser } from '../../context/UserContext';
import { Camera, Droplets, Pill, CheckCircle, Loader, Edit3, X, Check, Sparkles, Trash2, Plus } from 'lucide-react';
import { analyzeFoodImage, aiEditMeal } from '../../services/ai';
import { getMealImage, buildSharedContext } from '../../services/sharedContext';
import { addScannedMealDB } from '../../services/supabase';

const NutritionPage = () => {
    const { session, user, plans, updatePlans, progress, chatHistory } = useUser();
    const nutrition = plans?.nutrition;
    const meals = nutrition?.mealSuggestions || [];

    /* ---------- Food Scanner State ---------- */
    const [scanImage, setScanImage] = useState(null);
    const [scanResult, setScanResult] = useState(null);
    const [scanning, setScanning] = useState(false);
    const [showScanner, setShowScanner] = useState(false);
    const [scannedMeals, setScannedMeals] = useState([]);
    const fileRef = useRef(null);

    /* ---------- Meal Editing State ---------- */
    const [editingIdx, setEditingIdx] = useState(null);
    const [editMode, setEditMode] = useState(null);  // 'manual' | 'ai'
    const [editData, setEditData] = useState({});
    const [aiPrompt, setAiPrompt] = useState('');
    const [aiLoading, setAiLoading] = useState(false);
    const [addingNew, setAddingNew] = useState(false);
    const [newMeal, setNewMeal] = useState({ name: '', description: '', calories: '', protein: '', carbs: '', fats: '' });

    /* --- Image scanner --- */
    const handleImageSelect = async (e) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = async (ev) => {
            const base64 = ev.target.result;
            setScanImage(base64);
            setScanResult(null);
            setScanning(true);
            try {
                const result = await analyzeFoodImage(base64);
                setScanResult(result);
                const newEntry = { ...result, image: base64, time: new Date().toLocaleTimeString('tr-TR', { hour: '2-digit', minute: '2-digit' }) };
                setScannedMeals(prev => [...prev, newEntry]);
                if (session?.user?.id) addScannedMealDB(session.user.id, result).catch(console.error);
            } catch (err) {
                console.error('Food analysis failed:', err);
                setScanResult({ error: true });
            } finally { setScanning(false); }
        };
        reader.readAsDataURL(file);
    };

    /* --- Meal CRUD helpers --- */
    const updateMeal = (idx, newMeal) => {
        const updatedMeals = [...meals];
        updatedMeals[idx] = newMeal;
        updatePlans({ nutrition: { ...plans.nutrition, mealSuggestions: updatedMeals } });
        setEditingIdx(null);
        setEditMode(null);
        setAiPrompt('');
    };

    const deleteMeal = (idx) => {
        const updatedMeals = meals.filter((_, i) => i !== idx);
        updatePlans({ nutrition: { ...plans.nutrition, mealSuggestions: updatedMeals } });
    };

    const handleAddMeal = () => {
        if (!newMeal.name.trim()) return;
        const parsed = {
            ...newMeal,
            calories: parseInt(newMeal.calories) || 0,
            protein: parseInt(newMeal.protein) || 0,
            carbs: parseInt(newMeal.carbs) || 0,
            fats: parseInt(newMeal.fats) || 0,
        };
        updatePlans({ nutrition: { ...plans.nutrition, mealSuggestions: [...meals, parsed] } });
        setAddingNew(false);
        setNewMeal({ name: '', description: '', calories: '', protein: '', carbs: '', fats: '' });
    };

    const startManualEdit = (idx) => {
        setEditingIdx(idx);
        setEditMode('manual');
        setEditData({ ...meals[idx] });
    };

    const startAiEdit = (idx) => {
        setEditingIdx(idx);
        setEditMode('ai');
        setAiPrompt('');
    };

    const handleAiEdit = async (idx) => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const ctx = buildSharedContext(user, plans, progress, chatHistory);
            const result = await aiEditMeal(aiPrompt, meals[idx], ctx);
            updateMeal(idx, result);
        } catch (err) {
            console.error(err);
        } finally { setAiLoading(false); }
    };

    const targets = nutrition?.targets || { calories: 2400, protein: 180, carbs: 250, fats: 70 };
    const consumed = scannedMeals.reduce((acc, m) => ({
        calories: acc.calories + (m.calories || 0), protein: acc.protein + (m.protein || 0),
        carbs: acc.carbs + (m.carbs || 0), fats: acc.fats + (m.fats || 0),
    }), { calories: 0, protein: 0, carbs: 0, fats: 0 });

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <div>
                    <h1>Beslenme Planı</h1>
                    <p className="subtitle">Disiplinli ol. Performansını besle.</p>
                </div>
                <div style={{ display: 'flex', gap: '0.75rem' }}>
                    <button className="btn btn-ghost btn-sm" onClick={() => setAddingNew(!addingNew)}>
                        <Plus size={16} /> Öğün Ekle
                    </button>
                    <button className="btn btn-primary btn-sm" onClick={() => setShowScanner(!showScanner)}>
                        <Camera size={16} /> Yemek Tara
                    </button>
                </div>
            </div>

            {/* Macro Cards */}
            <div className="grid-4" style={{ marginBottom: '1.5rem' }}>
                <div className="macro-card">
                    <div className="macro-label">Günlük Alım{consumed.calories > 0 && <span className="badge" style={{ background: 'rgba(var(--success-rgb),0.15)', color: 'var(--success)' }}>Takipte</span>}</div>
                    <div className="macro-value">{consumed.calories || targets.calories}<small> / {targets.calories} kcal</small></div>
                    <div className="macro-sub">{Math.max(0, targets.calories - consumed.calories)} kcal kaldı</div>
                    <div className="progress-bar"><div className="progress-bar-fill fill-primary" style={{ width: `${Math.min((consumed.calories / targets.calories) * 100, 100)}%` }}></div></div>
                </div>
                <div className="macro-card">
                    <div className="macro-label">Protein</div>
                    <div className="macro-value">{consumed.protein || targets.protein}g<small> / {targets.protein}g</small></div>
                    <div className="progress-bar"><div className="progress-bar-fill fill-success" style={{ width: `${Math.min(((consumed.protein || targets.protein) / targets.protein) * 100, 100)}%` }}></div></div>
                </div>
                <div className="macro-card">
                    <div className="macro-label">Karbonhidrat</div>
                    <div className="macro-value">{consumed.carbs || targets.carbs}g<small> / {targets.carbs}g</small></div>
                    <div className="progress-bar"><div className="progress-bar-fill fill-secondary" style={{ width: `${Math.min(((consumed.carbs || targets.carbs) / targets.carbs) * 100, 100)}%` }}></div></div>
                </div>
                <div className="macro-card">
                    <div className="macro-label">Yağ</div>
                    <div className="macro-value">{consumed.fats || targets.fats}g<small> / {targets.fats}g</small></div>
                    <div className="progress-bar"><div className="progress-bar-fill fill-accent" style={{ width: `${Math.min(((consumed.fats || targets.fats) / targets.fats) * 100, 100)}%` }}></div></div>
                </div>
            </div>

            {/* Food Scanner */}
            {showScanner && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header"><h3>🍽️ AI Yemek Tarayıcı</h3></div>
                    <div style={{ display: 'grid', gridTemplateColumns: scanImage ? '1fr 1fr' : '1fr', gap: '1.5rem' }}>
                        <div className="food-scanner" onClick={() => fileRef.current?.click()}>
                            <input type="file" ref={fileRef} accept="image/*" capture="environment" onChange={handleImageSelect} />
                            <div className="scanner-icon"><Camera size={32} color="var(--primary)" /></div>
                            <h4>Yemek Fotoğrafı Çek veya Yükle</h4>
                            <p>AI besin değerlerini otomatik hesaplayacak</p>
                        </div>
                        {scanImage && (
                            <div>
                                <div className="food-preview"><img src={scanImage} alt="Taranan yemek" /></div>
                                {scanning && <div style={{ display: 'flex', alignItems: 'center', gap: 8, color: 'var(--primary)', marginTop: 8 }}><Loader size={16} className="spin" /> Analiz ediliyor...</div>}
                                {scanResult && !scanResult.error && (
                                    <div className="food-result">
                                        <h4 style={{ marginBottom: '0.75rem', display: 'flex', alignItems: 'center', gap: 8 }}><CheckCircle size={18} color="var(--success)" /> {scanResult.name}</h4>
                                        <div className="grid-4">
                                            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--warning)' }}>{scanResult.calories}</div><div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>kcal</div></div>
                                            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--primary)' }}>{scanResult.protein}g</div><div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Protein</div></div>
                                            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--secondary)' }}>{scanResult.carbs}g</div><div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Karb</div></div>
                                            <div style={{ textAlign: 'center' }}><div style={{ fontSize: '1.3rem', fontWeight: 800, color: 'var(--accent)' }}>{scanResult.fats}g</div><div style={{ fontSize: '0.7rem', color: 'var(--text-dim)' }}>Yağ</div></div>
                                        </div>
                                    </div>
                                )}
                                {scanResult?.error && <div style={{ padding: '1rem', color: 'var(--accent)', fontSize: '0.85rem' }}>Analiz başarısız. Tekrar deneyin.</div>}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Add New Meal Form */}
            {addingNew && (
                <div className="card" style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header"><h3>Yeni Öğün Ekle</h3></div>
                    <div className="edit-row">
                        <div className="input-group compact"><label>Öğün Adı</label><input value={newMeal.name} onChange={e => setNewMeal({ ...newMeal, name: e.target.value })} placeholder="Kahvaltı" /></div>
                        <div className="input-group compact"><label>Kalori</label><input type="number" value={newMeal.calories} onChange={e => setNewMeal({ ...newMeal, calories: e.target.value })} placeholder="500" /></div>
                        <div className="input-group compact"><label>Protein</label><input type="number" value={newMeal.protein} onChange={e => setNewMeal({ ...newMeal, protein: e.target.value })} placeholder="35" /></div>
                        <div className="input-group compact"><label>Karb</label><input type="number" value={newMeal.carbs} onChange={e => setNewMeal({ ...newMeal, carbs: e.target.value })} placeholder="50" /></div>
                        <div className="input-group compact"><label>Yağ</label><input type="number" value={newMeal.fats} onChange={e => setNewMeal({ ...newMeal, fats: e.target.value })} placeholder="15" /></div>
                    </div>
                    <div className="input-group compact" style={{ marginTop: '0.5rem' }}><label>İçerik (virgülle ayır)</label><input value={newMeal.description} onChange={e => setNewMeal({ ...newMeal, description: e.target.value })} placeholder="Yumurta, ekmek, avokado" /></div>
                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.75rem' }}>
                        <button className="btn btn-ghost btn-sm" onClick={() => setAddingNew(false)}><X size={14} /> İptal</button>
                        <button className="btn btn-primary btn-sm" onClick={handleAddMeal}><Plus size={14} /> Ekle</button>
                    </div>
                </div>
            )}

            {/* Scanned Meals */}
            {scannedMeals.length > 0 && (
                <div style={{ marginBottom: '1.5rem' }}>
                    <div className="card-header"><h3>📸 Taranan Öğünler</h3></div>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                        {scannedMeals.map((meal, i) => (
                            <div key={i} className="meal-card">
                                <div className="meal-image" style={{ backgroundImage: `url(${meal.image})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    <div className="meal-number">TARANDI</div>
                                    <div className="meal-time">{meal.time}</div>
                                </div>
                                <div className="meal-info">
                                    <h4>{meal.name} <CheckCircle size={14} color="var(--success)" /></h4>
                                    <ul>{(meal.items || []).map((item, j) => <li key={j}>{item}</li>)}</ul>
                                </div>
                                <div className="meal-macros">
                                    <div><div className="kcal">{meal.calories} kcal</div><div className="macro-mini">{meal.protein}P | {meal.carbs}C | {meal.fats}F</div></div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            )}

            {/* Suggested Meals with Edit */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '1rem' }}>
                {meals.map((meal, i) => {
                    const imageUrl = getMealImage(meal.name || meal.description?.split(',')[0]);
                    return (
                        <React.Fragment key={i}>
                            <div className={`meal-card ${editingIdx === i ? 'editing' : ''}`}>
                                <div className="meal-image" style={{ backgroundImage: `url(${imageUrl})`, backgroundSize: 'cover', backgroundPosition: 'center' }}>
                                    <div className="meal-number">ÖĞÜN {i + 1}</div>
                                    <div className="meal-time">{['08:00', '12:30', '16:00', '18:00', '21:00'][i] || '—'}</div>
                                </div>
                                <div className="meal-info">
                                    <h4>{meal.name} <CheckCircle size={14} color="var(--success)" /></h4>
                                    <ul>{(meal.description || '').split(',').map((item, j) => <li key={j}>{item.trim()}</li>)}</ul>
                                </div>
                                <div className="meal-macros">
                                    <div>
                                        <div className="kcal">{meal.calories} kcal</div>
                                        <div className="macro-mini">{meal.protein || '—'}P | {meal.carbs || '—'}C | {meal.fats || '—'}F</div>
                                    </div>
                                    <div style={{ display: 'flex', gap: 4, marginTop: 6 }}>
                                        <button className="icon-btn" title="Manuel düzenle" onClick={() => startManualEdit(i)}><Edit3 size={13} /></button>
                                        <button className="icon-btn ai-btn" title="AI ile değiştir" onClick={() => startAiEdit(i)}><Sparkles size={13} /></button>
                                        <button className="icon-btn danger-btn" title="Sil" onClick={() => deleteMeal(i)}><Trash2 size={13} /></button>
                                    </div>
                                </div>
                            </div>

                            {/* Inline Manual Edit */}
                            {editingIdx === i && editMode === 'manual' && (
                                <div className="inline-edit-panel">
                                    <div className="edit-row">
                                        <div className="input-group compact"><label>Öğün Adı</label><input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} /></div>
                                        <div className="input-group compact"><label>Kalori</label><input type="number" value={editData.calories || ''} onChange={e => setEditData({ ...editData, calories: parseInt(e.target.value) || 0 })} /></div>
                                        <div className="input-group compact"><label>Protein</label><input type="number" value={editData.protein || ''} onChange={e => setEditData({ ...editData, protein: parseInt(e.target.value) || 0 })} /></div>
                                        <div className="input-group compact"><label>Karb</label><input type="number" value={editData.carbs || ''} onChange={e => setEditData({ ...editData, carbs: parseInt(e.target.value) || 0 })} /></div>
                                        <div className="input-group compact"><label>Yağ</label><input type="number" value={editData.fats || ''} onChange={e => setEditData({ ...editData, fats: parseInt(e.target.value) || 0 })} /></div>
                                    </div>
                                    <div className="input-group compact" style={{ marginTop: '0.5rem' }}>
                                        <label>İçerik</label>
                                        <input value={editData.description || ''} onChange={e => setEditData({ ...editData, description: e.target.value })} />
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end', marginTop: '0.5rem' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingIdx(null); setEditMode(null); }}><X size={14} /> İptal</button>
                                        <button className="btn btn-primary btn-sm" onClick={() => updateMeal(i, editData)}><Check size={14} /> Kaydet</button>
                                    </div>
                                </div>
                            )}

                            {/* Inline AI Edit */}
                            {editingIdx === i && editMode === 'ai' && (
                                <div className="inline-edit-panel ai-edit">
                                    <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                        <Sparkles size={16} color="var(--primary)" />
                                        <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>Ne değiştirmek istiyorsun? (ör: "vegan alternatif", "daha az karbonhidrat")</span>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                        <input value={aiPrompt} onChange={e => setAiPrompt(e.target.value)} onKeyDown={e => e.key === 'Enter' && handleAiEdit(i)} placeholder="AI'a ne istediğini yaz..." disabled={aiLoading} style={{ flex: 1 }} />
                                        <button className="btn btn-ghost btn-sm" onClick={() => { setEditingIdx(null); setEditMode(null); }}><X size={14} /></button>
                                        <button className="btn btn-primary btn-sm" onClick={() => handleAiEdit(i)} disabled={aiLoading || !aiPrompt.trim()}>
                                            {aiLoading ? <Loader size={14} className="spin" /> : <Sparkles size={14} />}
                                            {aiLoading ? 'Düşünüyor...' : 'Değiştir'}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </React.Fragment>
                    );
                })}
            </div>

            {/* Bottom Widgets */}
            <div className="grid-2" style={{ marginTop: '1.5rem' }}>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Droplets size={24} color="var(--primary)" />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Hidrasyon</div><div className="progress-bar" style={{ marginTop: 6 }}><div className="progress-bar-fill fill-primary" style={{ width: '62%' }}></div></div></div>
                    <span style={{ fontWeight: 600, fontSize: '0.85rem' }}>2.5L / 4L</span>
                </div>
                <div className="card" style={{ display: 'flex', alignItems: 'center', gap: '1rem' }}>
                    <Pill size={24} color="var(--warning)" />
                    <div style={{ flex: 1 }}><div style={{ fontWeight: 600, fontSize: '0.9rem' }}>Günlük Takviyeler</div><div style={{ fontSize: '0.8rem', color: 'var(--text-dim)' }}>Omega 3, Multivitamin, Kreatin</div></div>
                    <CheckCircle size={22} color="var(--primary)" />
                </div>
            </div>
        </div>
    );
};

export default NutritionPage;
