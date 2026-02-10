import React, { useState, useRef, useEffect } from 'react';
import { useUser } from '../../context/UserContext';
import { chatWithCoach } from '../../services/ai';
import { buildSharedContext } from '../../services/sharedContext';
import { Send, Bot, User } from 'lucide-react';

const ChatView = () => {
    const { user, plans, progress, chatHistory, addChatMessage } = useUser();
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const messagesEndRef = useRef(null);

    const scrollToBottom = () => messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    useEffect(() => { scrollToBottom(); }, [chatHistory, isTyping]);

    const handleSend = async () => {
        const message = input.trim();
        if (!message || isTyping) return;
        addChatMessage({ role: 'user', content: message });
        setInput('');
        setIsTyping(true);
        try {
            // Build shared context so AI is aware of all modules
            const sharedCtx = buildSharedContext(user, plans, progress, chatHistory);
            const response = await chatWithCoach(message, user, chatHistory, sharedCtx);
            addChatMessage({ role: 'assistant', content: response });
        } catch {
            addChatMessage({ role: 'assistant', content: 'Üzgünüm, bir hata oluştu. Lütfen tekrar dene.' });
        } finally {
            setIsTyping(false);
        }
    };

    const handleKeyDown = (e) => {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend(); }
    };

    const quickQuestions = [
        'Antrenmanımı değiştirmek istiyorum',
        'Motivasyonum düşük, ne yapmalıyım?',
        'Beslenme önerilerini güncelle',
        'Bu haftaki ilerlememem nasıl?',
    ];

    return (
        <div className="fade-in-up">
            <div className="page-header">
                <div>
                    <h1>AI Koç</h1>
                    <p className="subtitle">Antrenman, beslenme veya motivasyon hakkında sohbet et.</p>
                </div>
            </div>

            <div className="card" style={{ display: 'flex', flexDirection: 'column', minHeight: '55vh' }}>
                <div className="chat-container" style={{ flex: 1, overflowY: 'auto', maxHeight: '50vh', padding: '0.5rem' }}>
                    {chatHistory.length === 0 && (
                        <div style={{ textAlign: 'center', padding: '3rem 1rem' }}>
                            <Bot size={42} color="var(--primary)" style={{ marginBottom: '1rem' }} />
                            <p style={{ color: 'var(--text-secondary)', marginBottom: '1.5rem', fontSize: '0.95rem' }}>
                                Merhaba {user?.name || 'Sporcu'}! Ben senin AI koçunum.<br />
                                Tüm antrenman, beslenme ve ilerleme verilerinden haberdarım.<br />
                                Ne hakkında konuşmak istersin?
                            </p>
                            <div style={{ display: 'flex', flexWrap: 'wrap', gap: '0.5rem', justifyContent: 'center' }}>
                                {quickQuestions.map((q, i) => (
                                    <button key={i} className="btn btn-ghost btn-sm" onClick={() => setInput(q)}>
                                        {q}
                                    </button>
                                ))}
                            </div>
                        </div>
                    )}

                    {chatHistory.map((msg, i) => (
                        <div key={i} className={`chat-message ${msg.role === 'user' ? 'user' : 'ai'}`}>
                            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', marginBottom: '0.25rem', fontSize: '0.7rem', color: 'var(--text-dim)' }}>
                                {msg.role === 'user' ? <User size={12} /> : <Bot size={12} />}
                                {msg.role === 'user' ? 'Sen' : 'AI Koç'}
                            </div>
                            {msg.content}
                        </div>
                    ))}

                    {isTyping && (
                        <div className="chat-message ai">
                            <div className="loading-dots" style={{ justifyContent: 'flex-start' }}>
                                <span></span><span></span><span></span>
                            </div>
                        </div>
                    )}
                    <div ref={messagesEndRef} />
                </div>

                <div className="chat-input-area">
                    <input value={input} onChange={e => setInput(e.target.value)} onKeyDown={handleKeyDown}
                        placeholder="Koçuna bir şey sor..." disabled={isTyping} />
                    <button className="btn btn-primary" onClick={handleSend}
                        disabled={isTyping || !input.trim()} style={{ padding: '12px 18px' }}>
                        <Send size={18} />
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ChatView;
