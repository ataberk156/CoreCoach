import React from 'react';
import { useUser } from '../../context/UserContext';
import { Dumbbell, RefreshCw, ThumbsDown } from 'lucide-react';

const WorkoutView = () => {
    const { plans } = useUser();
    const schedule = plans?.workout?.schedule || [];

    return (
        <div className="fade-in-up">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '1.5rem' }}>
                <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
                    <Dumbbell size={24} color="var(--primary)" /> Haftalık Antrenman Programı
                </h2>
            </div>

            {schedule.length === 0 && (
                <div className="dashboard-card glass" style={{ textAlign: 'center', padding: '3rem' }}>
                    <p className="text-muted">Henüz bir antrenman planı oluşturulmadı.</p>
                </div>
            )}

            {schedule.map((day, dayIndex) => (
                <div key={dayIndex} className="dashboard-card glass" style={{ marginBottom: '1rem' }}>
                    <div className="workout-day-header">
                        <h3>{day.day} <span className="card-badge">{day.focus}</span></h3>
                    </div>
                    <div className="exercise-list">
                        {day.exercises.map((ex, exIndex) => (
                            <div key={exIndex} className="exercise-row">
                                <span className="exercise-name">{ex.name}</span>
                                <div className="exercise-detail">
                                    <span>Set</span><strong>{ex.sets}</strong>
                                </div>
                                <div className="exercise-detail">
                                    <span>Tekrar</span><strong>{ex.reps}</strong>
                                </div>
                                <div className="exercise-detail">
                                    <span>Tempo</span><strong>{ex.tempo || '—'}</strong>
                                </div>
                                <div className="exercise-detail">
                                    <span>Dinlenme</span><strong>{ex.rest}</strong>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ))}
        </div>
    );
};

export default WorkoutView;
