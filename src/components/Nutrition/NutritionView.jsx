import React from 'react';
import { useUser } from '../../context/UserContext';
import { Utensils, Apple } from 'lucide-react';

const NutritionView = () => {
    const { plans } = useUser();
    const nutrition = plans?.nutrition;

    return (
        <div className="fade-in-up">
            <h2 style={{ display: 'flex', alignItems: 'center', gap: '0.75rem', marginBottom: '1.5rem' }}>
                <Utensils size={24} color="var(--accent)" /> Beslenme Planı
            </h2>

            {nutrition?.coachMessage && (
                <div className="ai-coach-bubble glass" style={{ marginBottom: '1.5rem' }}>
                    <Apple size={20} color="var(--success)" />
                    <p>{nutrition.coachMessage}</p>
                </div>
            )}

            <div className="dashboard-card glass" style={{ marginBottom: '1.5rem' }}>
                <div className="card-header"><h3>Günlük Hedefler</h3></div>
                <div className="macros-grid">
                    <div className="macro-item">
                        <label>Kalori</label>
                        <div className="macro-val cal">{nutrition?.targets?.calories || '—'}</div>
                    </div>
                    <div className="macro-item">
                        <label>Protein</label>
                        <div className="macro-val protein">{nutrition?.targets?.protein || '—'}g</div>
                    </div>
                    <div className="macro-item">
                        <label>Karbonhidrat</label>
                        <div className="macro-val carbs">{nutrition?.targets?.carbs || '—'}g</div>
                    </div>
                    <div className="macro-item">
                        <label>Yağ</label>
                        <div className="macro-val fats">{nutrition?.targets?.fats || '—'}g</div>
                    </div>
                </div>
            </div>

            <div className="dashboard-card glass">
                <div className="card-header"><h3>Öğün Önerileri</h3></div>
                <div className="meal-list">
                    {(nutrition?.mealSuggestions || []).map((meal, i) => (
                        <div key={i} className="meal-card">
                            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                                <h4>{meal.name}</h4>
                                <span style={{ fontSize: '0.8rem', color: 'var(--warning)', fontWeight: 600 }}>
                                    {meal.calories} kcal
                                </span>
                            </div>
                            <p>{meal.description}</p>
                            {meal.protein && (
                                <span style={{ fontSize: '0.75rem', color: 'var(--primary)', marginTop: '0.5rem', display: 'inline-block' }}>
                                    Protein: {meal.protein}g
                                </span>
                            )}
                        </div>
                    ))}
                </div>
            </div>
        </div>
    );
};

export default NutritionView;
