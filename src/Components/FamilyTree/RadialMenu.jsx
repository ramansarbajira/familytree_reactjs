import React from 'react';
import { UserPlus, Users, Edit, Trash2, Plus, User, UserMinus } from 'lucide-react';

// Simple icon map with solid color
const iconMap = {
  'Add Parents': { icon: Users },
  'Add Spouse': { icon: UserPlus },
  'Add Child': { icon: Plus },
  'Add Sibling': { icon: UserMinus },
  'Edit': { icon: Edit },
  'Delete': { icon: Trash2 },
};

const RadialMenu = ({ isActive, position, items, onItemClick, onClose }) => {
    if (!isActive) return null;

    const itemWidth = 90;
    const itemHeight = 60;
    const gap = 12;
    const menuWidth = items.length * (itemWidth + gap);
    const menuHeight = itemHeight + 24;
    const padding = 8;
    const isMobile = window.innerWidth < 600;

    let x = position.x;
    let y = position.y;

    if (isMobile) {
        // Centered bottom sheet for mobile
        x = window.innerWidth / 2;
        y = window.innerHeight - menuHeight / 2 - 16;
    } else {
        // Clamp to viewport
        x = Math.max(padding + menuWidth / 2, Math.min(x, window.innerWidth - menuWidth / 2 - padding));
        y = Math.max(padding + menuHeight / 2, Math.min(y, window.innerHeight - menuHeight / 2 - padding));
    }

    return (
        <>
            {/* Overlay for outside click */}
            <div
                style={{
                    position: 'fixed',
                    top: 0,
                    left: 0,
                    width: '100vw',
                    height: '100vh',
                    zIndex: 999,
                    background: 'transparent',
                }}
                onClick={onClose}
            />
            {/* Menu itself */}
            <div
                className={isMobile ? 'radial-menu-mobile-sheet' : 'radial-menu-horizontal'}
                style={{
                    position: 'fixed',
                    top: `${y}px`,
                    left: `${x}px`,
                    zIndex: 1000,
                    background: 'rgba(255,255,255,0.98)',
                    border: '1.5px solid #e5e7eb',
                    borderRadius: isMobile ? 24 : 18,
                    boxShadow: '0 6px 32px rgba(60,60,90,0.13)',
                    padding: isMobile ? '18px 8px' : `12px ${gap}px`,
                    display: 'flex',
                    flexDirection: isMobile ? 'column' : 'row',
                    alignItems: 'center',
                    pointerEvents: 'auto',
                    minWidth: isMobile ? '90vw' : `${menuWidth}px`,
                    minHeight: `${menuHeight}px`,
                    transform: 'translate(-50%, -50%)',
                    gap: `${gap}px`,
                }}
                onClick={e => e.stopPropagation()}
            >
                {items.map((item, i) => {
                    const Icon = iconMap[item.label]?.icon || User;
                    let itemStyle = {
                        width: itemWidth,
                        height: itemHeight,
                        background: '#f4f7fa',
                        borderRadius: 14,
                        display: 'flex',
                        flexDirection: 'column',
                        alignItems: 'center',
                        justifyContent: 'center',
                        boxShadow: '0 1px 4px rgba(60,60,90,0.06)',
                        border: '1px solid #e5e7eb',
                        cursor: 'pointer',
                        transition: 'background 0.18s, box-shadow 0.18s, border 0.18s',
                        outline: 'none',
                        margin: 0,
                        padding: '4px 6px',
                        position: 'relative',
                    };
                    return (
                        <div
                            key={item.label}
                            tabIndex={0}
                            style={itemStyle}
                            onClick={e => {
                                e.stopPropagation();
                                onItemClick(item);
                                onClose();
                            }}
                            onKeyDown={e => {
                                if (e.key === 'Enter' || e.key === ' ') {
                                    onItemClick(item);
                                    onClose();
                                }
                            }}
                            onMouseEnter={e => {
                                e.currentTarget.style.background = '#e0f2fe';
                                e.currentTarget.style.boxShadow = '0 2px 8px rgba(60,60,90,0.13)';
                                e.currentTarget.style.border = '1.5px solid #2563eb';
                            }}
                            onMouseLeave={e => {
                                e.currentTarget.style.background = '#f4f7fa';
                                e.currentTarget.style.boxShadow = '0 1px 4px rgba(60,60,90,0.06)';
                                e.currentTarget.style.border = '1px solid #e5e7eb';
                            }}
                        >
                            <Icon size={22} color="#2563eb" style={{ marginBottom: 2 }} />
                            <span style={{
                                fontSize: 13,
                                fontWeight: 600,
                                color: '#222',
                                textAlign: 'center',
                                lineHeight: 1.15,
                                maxWidth: itemWidth - 10,
                                whiteSpace: 'normal',
                                wordBreak: 'break-word',
                                overflow: 'hidden',
                                textOverflow: 'ellipsis',
                                marginTop: 2,
                                display: '-webkit-box',
                                WebkitLineClamp: 2,
                                WebkitBoxOrient: 'vertical',
                                minHeight: 28,
                                padding: '0 2px',
                            }}>{item.label}</span>
                        </div>
                    );
                })}
            </div>
        </>
    );
};

export default RadialMenu; 