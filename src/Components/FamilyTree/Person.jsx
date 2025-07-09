import React from 'react';
import { RelationshipCalculator } from '../../utils/relationshipCalculator';
import { getTranslation } from '../../utils/languageTranslations';

const Person = ({ person, isRoot, onClick, rootId, tree, language }) => {
    const personSize = 100;
    const ageText = person.age ? ` (Age: ${person.age})` : '';

    // Calculate relationship to root
    let relationshipText = '';
    if (!isRoot && rootId && tree) {
        const calculator = new RelationshipCalculator(tree);
        const rel = calculator.calculateRelationship(rootId, person.id);
        if (rel && rel.type && rel.type !== 'unknown' && rel.type !== 'self') {
            relationshipText = getTranslation(`relationships.${rel.type}`, language);
        }
    }

    return (
        <div
            className={`person ${person.gender} ${isRoot ? 'root' : ''}`}
            style={{
                left: `${person.x - personSize / 2}px`,
                top: `${person.y - personSize / 2}px`,
                position: 'absolute',
                minWidth: 140,
                minHeight: 170,
                padding: '12px 8px 8px 8px',
                background: '#fff',
                border: isRoot ? '3px solid #34d399' : '2px solid #6366f1',
                borderRadius: 16,
                boxShadow: '0 2px 8px rgba(60,60,90,0.10)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                zIndex: 2,
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
            <div className="name" style={{ fontWeight: 600, fontSize: 16, marginTop: 8, textAlign: 'center' }}>{person.name}</div>
            <div className="details" style={{ fontSize: 13, color: '#555', marginTop: 2, textAlign: 'center' }}>
                {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}{ageText}
            </div>
            {relationshipText && (
                <div className="relationship" style={{ color: '#6366f1', fontWeight: 500, fontSize: 13, marginTop: 6, marginBottom: 2, textAlign: 'center', letterSpacing: 0.2 }}>
                    {relationshipText}
                </div>
            )}
        </div>
    );
};

export default Person; 