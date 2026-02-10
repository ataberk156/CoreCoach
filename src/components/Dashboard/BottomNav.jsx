import React from 'react';
import { LayoutDashboard, Dumbbell, Utensils, MessageSquare, Menu } from 'lucide-react';

const BottomNav = ({ activeTab, setActiveTab }) => {
    const navItems = [
        { id: 'overview', icon: LayoutDashboard, label: 'Özet' },
        { id: 'workout', icon: Dumbbell, label: 'Antrenman' },
        { id: 'nutrition', icon: Utensils, label: 'Beslenme' },
        { id: 'chat', icon: MessageSquare, label: 'AI Koç' },
        { id: 'settings', icon: Menu, label: 'Ayarlar' },
    ];

    return (
        <div className="bottom-nav">
            {navItems.map((item) => {
                const Icon = item.icon;
                const isActive = activeTab === item.id;
                return (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={`nav-item ${isActive ? 'active' : ''}`}
                    >
                        <Icon size={20} strokeWidth={isActive ? 2.5 : 2} />
                        <span className="nav-label">{item.label}</span>
                    </button>
                );
            })}
        </div>
    );
};

export default BottomNav;
