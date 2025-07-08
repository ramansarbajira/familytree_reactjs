import React from 'react';

const Person = ({ person, isRoot, onClick }) => {
    const personSize = 100;
    const ageText = person.age ? ` (Age: ${person.age})` : '';

    return (
        <div
            className={`person ${person.gender} ${isRoot ? 'root' : ''}`}
            style={{
                left: `${person.x - personSize / 2}px`,
                top: `${person.y - personSize / 2}px`
            }}
            onClick={() => onClick(person.id)}
            data-person-id={person.id}
        >
            <div className="profile-pic-container" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                <div className="profile-pic-circle" style={{ width: 64, height: 64, borderRadius: '50%', overflow: 'hidden', background: '#f3f4f6', border: isRoot ? '3px solid #34d399' : '2px solid #e5e7eb', boxShadow: '0 2px 8px rgba(60,60,90,0.10)' }}>
                    <img 
                        src={person.img ? person.img : 'https://cdn-icons-png.flaticon.com/512/149/149071.png'} 
                        alt="Profile" 
                        style={{ width: '100%', height: '100%', objectFit: 'cover', borderRadius: '50%' }}
                        onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                        }}
                    />
                </div>
            </div>
            <div className="name">{person.name}</div>
            <div className="details">
                {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}{ageText}
            </div>
        </div>
    );
};

export default Person; 