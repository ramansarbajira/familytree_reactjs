import React from 'react';
import { UserPlus, Users, Edit, Trash2, Plus, User, UserMinus } from 'lucide-react';

// Map label to icon component and color
const iconMap = {
  'Add Parents': { icon: Users, color: 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)' },
  'Add Spouse': { icon: UserPlus, color: 'linear-gradient(135deg, #396afc 0%, #2948ff 100%)' },
  'Add Child': { icon: Plus, color: 'linear-gradient(135deg, #fd6e6a 0%, #ffc600 100%)' },
  'Add Sibling': { icon: UserMinus, color: 'linear-gradient(135deg, #a770ef 0%, #f6d365 100%)' },
  'Edit': { icon: Edit, color: 'linear-gradient(135deg, #f7971e 0%, #ffd200 100%)' },
  'Delete': { icon: Trash2, color: 'linear-gradient(135deg, #f857a6 0%, #ff5858 100%)' },
};

const RadialMenu = ({ isActive, position, items, onItemClick, onClose }) => {
    if (!isActive) return null;

    const angleStep = 360 / items.length;
    const menuRadius = items.length > 4 ? 110 : 90;

    return (
        <div 
            className={`radial-menu glassy-menu ${isActive ? 'active' : ''}`}
            style={{
                top: `${position.y}px`,
                left: `${position.x}px`,
                background: 'transparent',
                boxShadow: '0 8px 32px rgba(60,60,90,0.18), 0 2px 8px rgba(60,60,90,0.12)',
                border: '2px solid rgba(255,255,255,0.18)',
                borderRadius: '50%',
                padding: 12,
                zIndex: 50,
                pointerEvents: 'none',
            }}
        >
            {items.map((item, i) => {
                const angle = (i * angleStep - 90) * (Math.PI / 180);
                const x = menuRadius * Math.cos(angle);
                const y = menuRadius * Math.sin(angle);
                const Icon = iconMap[item.label]?.icon || User;
                const bgColor = iconMap[item.label]?.color || 'linear-gradient(135deg, #43e97b 0%, #38f9d7 100%)';

                return (
                    <div
                        key={item.label}
                        className="menu-item menu-item-modern glassy-item"
                        style={{
                            transform: `translate(${x}px, ${y}px)`,
                            background: bgColor,
                            boxShadow: '0 4px 16px rgba(60,60,90,0.18)',
                            width: 96,
                            height: 96,
                            display: 'flex',
                            flexDirection: 'column',
                            alignItems: 'center',
                            justifyContent: 'center',
                            borderRadius: '50%',
                            border: '2.5px solid rgba(255,255,255,0.35)',
                            cursor: 'pointer',
                            transition: 'transform 0.18s, box-shadow 0.18s',
                            pointerEvents: 'auto',
                            overflow: 'hidden',
                            padding: '8px 6px 6px 6px',
                        }}
                        onClick={(e) => {
                            e.stopPropagation();
                            onItemClick(item);
                            onClose();
                        }}
                    >
                        <Icon size={32} color="#fff" style={{ marginBottom: 2, flexShrink: 0, filter: 'drop-shadow(0 1px 2px rgba(0,0,0,0.12))' }} />
                        <span className="menu-item-text-modern" style={{ fontSize: 12, fontWeight: 500, color: '#fff', textShadow: '0 1px 4px rgba(0,0,0,0.13)', textAlign: 'center', maxWidth: 80, whiteSpace: 'normal', wordBreak: 'break-word', overflow: 'hidden', textOverflow: 'ellipsis', lineHeight: 1.15, marginTop: 2, display: 'block', minHeight: 28 }}>{item.label}</span>
                    </div>
                );
            })}
        </div>
    );
};

export default RadialMenu; 