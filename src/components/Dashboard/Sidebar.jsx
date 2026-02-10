import React from 'react';
import { LayoutDashboard, Dumbbell, Utensils, TrendingUp, MessageSquare, Settings } from 'lucide-react';
import { useUser } from '../../context/UserContext';

const NAV_ITEMS = [
    { id: 'overview', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'workout', label: 'Antrenman', icon: Dumbbell },
    { id: 'nutrition', label: 'Beslenme', icon: Utensils },
    { id: 'progress', label: 'Gelişim', icon: TrendingUp },
    { id: 'chat', label: 'AI Koç', icon: MessageSquare },
    { id: 'settings', label: 'Ayarlar', icon: Settings },
];

const Sidebar = ({ activeTab, setActiveTab }) => {
    const { user } = useUser();
    const initials = (user?.name || 'U').slice(0, 2).toUpperCase();

    return (
        <aside className="sidebar">
            <div className="sidebar-brand">
                <div className="brand-icon">AI</div>
                <span>AI Coach</span>
            </div>

            <nav className="sidebar-nav">
                {NAV_ITEMS.map(item => {
                    const Icon = item.icon;
                    return (
                        <button key={item.id}
                            className={activeTab === item.id ? 'active' : ''}
                            onClick={() => setActiveTab(item.id)}>
                            <Icon size={18} /> {item.label}
                        </button>
                    );
                })}
            </nav>

            <div className="sidebar-user">
                <div className="avatar">{initials}</div>
                <div className="user-info">
                    <div className="name">{user?.name || 'Kullanıcı'}</div>
                    <div className="plan">Pro Plan</div>
                </div>
            </div>
        </aside>
    );
};

export default Sidebar;
