import React, { useState } from 'react';
import { useUser } from '../../context/UserContext';
import { aiEditExercise } from '../../services/ai';
import { buildSharedContext } from '../../services/sharedContext';
import { Edit3, X, Check, Sparkles, Loader, Plus, Trash2 } from 'lucide-react';

const DAYS_ORDER = ['Pazartesi', 'Salı', 'Çarşamba', 'Perşembe', 'Cuma', 'Cumartesi', 'Pazar'];

const WorkoutPage = () => {
    const { user, plans, updatePlans, progress, chatHistory } = useUser();
    const schedule = plans?.workout?.schedule || [];
    const [selectedIdx, setSelectedIdx] = useState(0);

    /* --- editing states --- */
    const [editingIdx, setEditingIdx] = useState(null);       // which exercise row is being edited
    const [editMode, setEditMode] = useState(null);            // 'manual' | 'ai'
    const [editData, setEditData] = useState({});              // manual edit form data
    const [aiPrompt, setAiPrompt] = useState('');              // AI prompt text
    const [aiLoading, setAiLoading] = useState(false);
    const [addingNew, setAddingNew] = useState(false);         // adding new exercise
    const [newExercise, setNewExercise] = useState({ name: '', sets: 3, reps: '10', tempo: '2-1-2', rest: '60s' });

    const day = schedule[selectedIdx];
    const exercises = day?.exercises || [];

    /* --- helper: update a single exercise in the plan --- */
    const updateExercise = (exIdx, newExercise) => {
        const newSchedule = JSON.parse(JSON.stringify(schedule));
        newSchedule[selectedIdx].exercises[exIdx] = newExercise;
        updatePlans({ workout: { ...plans.workout, schedule: newSchedule } });
        setEditingIdx(null);
        setEditMode(null);
        setAiPrompt('');
    };

    /* --- delete an exercise --- */
    const deleteExercise = (exIdx) => {
        const newSchedule = JSON.parse(JSON.stringify(schedule));
        newSchedule[selectedIdx].exercises.splice(exIdx, 1);
        updatePlans({ workout: { ...plans.workout, schedule: newSchedule } });
    };

    /* --- add a new exercise --- */
    const handleAddExercise = () => {
        if (!newExercise.name.trim()) return;
        const newSchedule = JSON.parse(JSON.stringify(schedule));
        newSchedule[selectedIdx].exercises.push({ ...newExercise, sets: parseInt(newExercise.sets) });
        updatePlans({ workout: { ...plans.workout, schedule: newSchedule } });
        setAddingNew(false);
        setNewExercise({ name: '', sets: 3, reps: '10', tempo: '2-1-2', rest: '60s' });
    };

    /* --- start manual edit --- */
    const startManualEdit = (exIdx) => {
        setEditingIdx(exIdx);
        setEditMode('manual');
        setEditData({ ...exercises[exIdx] });
    };

    /* --- start AI edit --- */
    const startAiEdit = (exIdx) => {
        setEditingIdx(exIdx);
        setEditMode('ai');
        setAiPrompt('');
    };

    /* --- process AI edit --- */
    const handleAiEdit = async (exIdx) => {
        if (!aiPrompt.trim()) return;
        setAiLoading(true);
        try {
            const ctx = buildSharedContext(user, plans, progress, chatHistory);
            const result = await aiEditExercise(aiPrompt, exercises[exIdx], ctx);
            updateExercise(exIdx, result);
        } catch (err) {
            console.error(err);
        } finally {
            setAiLoading(false);
        }
    };

    const totalSets = exercises.reduce((a, e) => a + (e.sets || 0), 0);
    const totalExercises = exercises.length;
    const estDuration = Math.round(totalSets * 2.5 + totalExercises * 1);

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <div>
                    <h1>Antrenman Programı</h1>
                    <p className="subtitle">Progressive overload. Her hafta bir adım ileri.</p>
                </div>
            </div>

            <div className="grid-sidebar">
                {/* Schedule sidebar */}
                <div>
                    <div className="card-header"><h3>Haftalık Takvim</h3></div>
                    {schedule.map((d, i) => (
                        <div key={i} className={`schedule-card ${selectedIdx === i ? 'active' : ''}`}
                            onClick={() => { setSelectedIdx(i); setEditingIdx(null); setEditMode(null); }}>
                            <div className="schedule-day">{d.day?.slice(0, 3)}</div>
                            <div className="schedule-info">
                                <strong>{d.focus}</strong>
                                <span>{d.exercises?.length || 0} hareket</span>
                            </div>
                        </div>
                    ))}
                </div>

                {/* Main exercise table */}
                <div>
                    {day && (
                        <div className="card">
                            <div className="card-header card-header-flex">
                                <div>
                                    <h2 style={{ fontSize: '1.2rem' }}>{day.focus}</h2>
                                    <p className="text-dim-small" style={{ marginTop: 2 }}>{day.day} — {totalExercises} hareket, ~{estDuration} dk</p>
                                </div>
                                <button className="btn btn-ghost btn-sm" onClick={() => setAddingNew(!addingNew)}>
                                    <Plus size={14} /> Ekle
                                </button>
                            </div>

                            {/* Exercise Table */}
                            <div className="exercise-table">
                                <div className="exercise-header">
                                    <span>Hareket</span><span>Set × Tekrar</span><span>Tempo</span><span>Dinlenme</span><span></span>
                                </div>
                                {exercises.map((ex, i) => (
                                    <React.Fragment key={i}>
                                        <div className={`exercise-row ${editingIdx === i ? 'editing' : ''}`}>
                                            <span className="font-medium">{ex.name}</span>
                                            <span>{ex.sets} × {ex.reps}</span>
                                            <span className="text-dim-small">{ex.tempo || '—'}</span>
                                            <span className="badge-rest">{ex.rest || '—'}</span>
                                            <span className="flex-gap-xs">
                                                <button className="icon-btn" title="Manuel düzenle" onClick={() => startManualEdit(i)}>
                                                    <Edit3 size={13} />
                                                </button>
                                                <button className="icon-btn ai-btn" title="AI ile değiştir" onClick={() => startAiEdit(i)}>
                                                    <Sparkles size={13} />
                                                </button>
                                                <button className="icon-btn danger-btn" title="Sil" onClick={() => deleteExercise(i)}>
                                                    <Trash2 size={13} />
                                                </button>
                                            </span>
                                        </div>

                                        {/* Inline Manual Edit */}
                                        {editingIdx === i && editMode === 'manual' && (
                                            <div className="inline-edit-panel">
                                                <div className="edit-row">
                                                    <div className="input-group compact">
                                                        <label>Hareket</label>
                                                        <input value={editData.name || ''} onChange={e => setEditData({ ...editData, name: e.target.value })} />
                                                    </div>
                                                    <div className="input-group compact">
                                                        <label>Set</label>
                                                        <input type="number" value={editData.sets || ''} onChange={e => setEditData({ ...editData, sets: parseInt(e.target.value) || 0 })} />
                                                    </div>
                                                    <div className="input-group compact">
                                                        <label>Tekrar</label>
                                                        <input value={editData.reps || ''} onChange={e => setEditData({ ...editData, reps: e.target.value })} />
                                                    </div>
                                                    <div className="input-group compact">
                                                        <label>Tempo</label>
                                                        <input value={editData.tempo || ''} onChange={e => setEditData({ ...editData, tempo: e.target.value })} />
                                                    </div>
                                                    <div className="input-group compact">
                                                        <label>Dinlenme</label>
                                                        <input value={editData.rest || ''} onChange={e => setEditData({ ...editData, rest: e.target.value })} />
                                                    </div>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingIdx(null); setEditMode(null); }}>
                                                        <X size={14} /> İptal
                                                    </button>
                                                    <button className="btn btn-primary btn-sm" onClick={() => updateExercise(i, editData)}>
                                                        <Check size={14} /> Kaydet
                                                    </button>
                                                </div>
                                            </div>
                                        )}

                                        {/* Inline AI Edit */}
                                        {editingIdx === i && editMode === 'ai' && (
                                            <div className="inline-edit-panel ai-edit">
                                                <div style={{ display: 'flex', gap: '0.5rem', alignItems: 'center' }}>
                                                    <Sparkles size={16} color="var(--primary)" />
                                                    <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)' }}>
                                                        Ne değiştirmek istiyorsun? (ör: "daha hafif yap", "evde yapabileceğim alternatif")
                                                    </span>
                                                </div>
                                                <div style={{ display: 'flex', gap: '0.5rem', marginTop: '0.5rem' }}>
                                                    <input
                                                        value={aiPrompt}
                                                        onChange={e => setAiPrompt(e.target.value)}
                                                        onKeyDown={e => e.key === 'Enter' && handleAiEdit(i)}
                                                        placeholder="AI'a ne istediğini yaz..."
                                                        disabled={aiLoading}
                                                        style={{ flex: 1 }}
                                                    />
                                                    <button className="btn btn-ghost btn-sm" onClick={() => { setEditingIdx(null); setEditMode(null); }}>
                                                        <X size={14} />
                                                    </button>
                                                    <button className="btn btn-primary btn-sm" onClick={() => handleAiEdit(i)} disabled={aiLoading || !aiPrompt.trim()}>
                                                        {aiLoading ? <Loader size={14} className="spin" /> : <Sparkles size={14} />}
                                                        {aiLoading ? 'Düşünüyor...' : 'Değiştir'}
                                                    </button>
                                                </div>
                                            </div>
                                        )}
                                    </React.Fragment>
                                ))}
                            </div>

                            {/* Add New Exercise Form */}
                            {addingNew && (
                                <div className="inline-edit-panel" style={{ marginTop: '0.75rem' }}>
                                    <div style={{ fontSize: '0.85rem', fontWeight: 600, marginBottom: '0.5rem' }}>Yeni Hareket Ekle</div>
                                    <div className="edit-row">
                                        <div className="input-group compact">
                                            <label>Hareket</label>
                                            <input value={newExercise.name} onChange={e => setNewExercise({ ...newExercise, name: e.target.value })} placeholder="Hareket adı" />
                                        </div>
                                        <div className="input-group compact">
                                            <label>Set</label>
                                            <input type="number" value={newExercise.sets} onChange={e => setNewExercise({ ...newExercise, sets: e.target.value })} />
                                        </div>
                                        <div className="input-group compact">
                                            <label>Tekrar</label>
                                            <input value={newExercise.reps} onChange={e => setNewExercise({ ...newExercise, reps: e.target.value })} />
                                        </div>
                                        <div className="input-group compact">
                                            <label>Tempo</label>
                                            <input value={newExercise.tempo} onChange={e => setNewExercise({ ...newExercise, tempo: e.target.value })} />
                                        </div>
                                        <div className="input-group compact">
                                            <label>Dinlenme</label>
                                            <input value={newExercise.rest} onChange={e => setNewExercise({ ...newExercise, rest: e.target.value })} />
                                        </div>
                                    </div>
                                    <div style={{ display: 'flex', gap: '0.5rem', justifyContent: 'flex-end' }}>
                                        <button className="btn btn-ghost btn-sm" onClick={() => setAddingNew(false)}><X size={14} /> İptal</button>
                                        <button className="btn btn-primary btn-sm" onClick={handleAddExercise}><Plus size={14} /> Ekle</button>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* Bottom Stats */}
            <div className="stat-row" style={{ marginTop: '1.5rem' }}>
                <div className="stat-card"><div className="stat-value">{totalExercises}</div><div className="stat-label">Hareket</div></div>
                <div className="stat-card"><div className="stat-value">{totalSets}</div><div className="stat-label">Toplam Set</div></div>
                <div className="stat-card"><div className="stat-value">~{estDuration} dk</div><div className="stat-label">Tahmini Süre</div></div>
                <div className="stat-card"><div className="stat-value">{schedule.length}</div><div className="stat-label">Haftalık Gün</div></div>
            </div>
        </div>
    );
};

export default WorkoutPage;
