import React, { useState } from 'react';
import { signUp, signIn } from '../../services/supabase';
import { Mail, Lock, LogIn, UserPlus, AlertCircle, Dumbbell } from 'lucide-react';

const AuthScreen = () => {
    const [mode, setMode] = useState('login');
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError('');
        setSuccess('');
        setLoading(true);

        try {
            if (mode === 'signup') {
                await signUp(email, password);
                setSuccess('Hesap oluşturuldu! E-postanı kontrol et veya giriş yap.');
                setMode('login');
            } else {
                await signIn(email, password);
                // Auth state change will handle the rest
            }
        } catch (err) {
            const msg = err.message || 'Bir hata oluştu';
            if (msg.includes('Invalid login')) setError('E-posta veya şifre hatalı.');
            else if (msg.includes('already registered')) setError('Bu e-posta zaten kayıtlı.');
            else if (msg.includes('Password should be')) setError('Şifre en az 6 karakter olmalı.');
            else setError(msg);
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="welcome-screen">
            <div className="brand-logo">
                <Dumbbell size={32} color="var(--primary)" />
            </div>
            <h1 className="hero-title" style={{ fontSize: 'clamp(2rem, 4vw, 3rem)', letterSpacing: '6px', marginBottom: '0.5rem' }}>
                AI COACH
            </h1>
            <p className="hero-subtitle" style={{ marginBottom: '2rem' }}>
                Premium Fitness Intelligence
            </p>

            <div className="onboarding-container">
                <div className="auth-tabs">
                    <button
                        onClick={() => { setMode('login'); setError(''); }}
                        className={`btn auth-tab-btn ${mode === 'login' ? 'btn-primary' : 'btn-ghost'}`}>
                        <LogIn size={16} /> Giriş Yap
                    </button>
                    <button
                        onClick={() => { setMode('signup'); setError(''); }}
                        className={`btn auth-tab-btn ${mode === 'signup' ? 'btn-primary' : 'btn-ghost'}`}>
                        <UserPlus size={16} /> Kayıt Ol
                    </button>
                </div>

                <form onSubmit={handleSubmit}>
                    <div className="input-group">
                        <label><Mail size={12} style={{ marginRight: 4 }} /> E-posta</label>
                        <input type="email" value={email} onChange={e => setEmail(e.target.value)}
                            placeholder="ornek@email.com" required />
                    </div>

                    <div className="input-group">
                        <label><Lock size={12} style={{ marginRight: 4 }} /> Şifre</label>
                        <input type="password" value={password} onChange={e => setPassword(e.target.value)}
                            placeholder="••••••••" required minLength={6} />
                    </div>

                    {error && (
                        <div className="alert alert-error">
                            <AlertCircle size={16} /> {error}
                        </div>
                    )}

                    {success && (
                        <div className="alert alert-success">
                            <CheckCircle size={16} /> {success}
                        </div>
                    )}

                    <button type="submit" className="btn btn-primary btn-lg input-full" disabled={loading}>
                        {loading ? (
                            <div className="loading-dots"><span></span><span></span><span></span></div>
                        ) : mode === 'login' ? (
                            <><LogIn size={18} /> Giriş Yap</>
                        ) : (
                            <><UserPlus size={18} /> Hesap Oluştur</>
                        )}
                    </button>
                </form>
            </div>
        </div>
    );
};

export default AuthScreen;
