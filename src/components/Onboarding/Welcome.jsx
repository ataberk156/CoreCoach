import React from 'react';
import { useUser } from '../../context/UserContext';
import { Zap, Target, Utensils, TrendingUp } from 'lucide-react';

const Welcome = () => {
    const { setOnboardingStep } = useUser();

    return (
        <div className="welcome-screen glass flex-center">
            <div className="brand-logo">
                <Zap size={36} color="var(--primary)" />
            </div>

            <h1 className="hero-title gradient-text">AI COACH</h1>
            <p className="hero-subtitle">Premium Yapay Zeka Destekli Fitness Koçun</p>

            <div className="welcome-features">
                <div className="feature-pill glass">
                    <Target size={22} color="var(--primary)" />
                    <p>Kişisel Antrenman</p>
                </div>
                <div className="feature-pill glass">
                    <Utensils size={22} color="var(--accent)" />
                    <p>Akıllı Beslenme</p>
                </div>
                <div className="feature-pill glass">
                    <TrendingUp size={22} color="var(--success)" />
                    <p>Gelişim Takibi</p>
                </div>
            </div>

            <div className="welcome-cta">
                <button className="btn-primary" onClick={() => setOnboardingStep('onboarding')}>
                    Hadi Başlayalım <Zap size={18} />
                </button>
            </div>
        </div>
    );
};

export default Welcome;
