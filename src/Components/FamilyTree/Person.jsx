import React from 'react';
import { RelationshipCalculator } from '../../utils/relationshipCalculator';
import { getTranslation } from '../../utils/languageTranslations';

const CARD_WIDTH = 170; // Adjust to match actual card width
const CARD_HEIGHT = 220; // Should match minHeight or actual card height

const Person = ({ person, isRoot, onClick, rootId, tree, language, isNew, isSelected }) => {
    const personSize = 100;
    const ageText = person.age ? ` (Age: ${person.age})` : '';

    // Calculate relationship to root
    let relationshipText = '';
    if (!isRoot && rootId && tree) {
        const calculator = new RelationshipCalculator(tree);
        const rel = calculator.calculateRelationship(rootId, person.id);
        if (rel && rel.type && rel.type !== 'unknown' && rel.type !== 'self') {
            // Use detailed Tamil relationship if available
            if (rel.relationshipCode && language === 'tamil') {
                relationshipText = calculator.getDetailedTamilRelationship(rel.relationshipCode, language);
            } else {
                relationshipText = getTranslation(`relationships.${rel.type}`, language);
                // Fallback if translation is missing
                if (relationshipText === `relationships.${rel.type}`) {
                    // For 'custom', show 'Relative' or the code/description
                    relationshipText = rel.type === 'custom'
                        ? (getTranslation('relationships.relative', language) || rel.description || 'Relative')
                        : (rel.description || rel.type);
                }
            }
        }
    }

    return (
        <div
            className={`person ${person.gender} ${isRoot ? 'root' : ''} ${isNew ? 'person-new' : ''} ${isSelected ? 'person-selected' : ''} group transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-green-200`}
            style={{
                left: `${person.x - CARD_WIDTH / 2}px`,
                top: `${person.y - CARD_HEIGHT / 2}px`,
                position: 'absolute',
                minWidth: CARD_WIDTH,
                maxWidth: 250,
                width: 'fit-content',
                minHeight: CARD_HEIGHT,
                margin: '24px',
                padding: '12px 12px 22px 12px', // less top padding to bring image up
                background: isRoot
                  ? 'linear-gradient(135deg, #e0e7ff 0%, #c7d2fe 100%)' // blue highlight for root
                  : isNew
                  ? 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)' // soft gray/blue for new
                  : 'linear-gradient(135deg, #f3f4f6 0%, #e0e7ff 100%)', // neutral/blue for all
                border: isRoot
                  ? '4px solid #2563eb' // blue border for root
                  : isNew
                  ? '2.5px dashed #60a5fa' // blue for new
                  : isSelected
                  ? '3px solid #2563eb' // blue for selected
                  : '2.5px solid #c7d2fe', // blue border for all
                borderRadius: 24,
                boxShadow: isRoot
                  ? '0 0 0 6px #93c5fd, 0 12px 36px rgba(37,99,235,0.10)'
                  : isSelected
                  ? '0 12px 36px rgba(37,99,235,0.13)'
                  : '0 6px 24px rgba(37,99,235,0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                zIndex: 2,
                fontFamily: 'Poppins, Arial, sans-serif',
                transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
                overflow: 'visible', // ensure content stays inside
            }}
            onClick={() => onClick(person.id)}
            data-person-id={person.id}
        >
            <div className="profile-pic-container flex items-center justify-center relative">
                <div className={`profile-pic-circle w-16 h-16 rounded-full overflow-hidden bg-gray-100 border-4 ${isRoot ? 'border-blue-500 shadow-blue-300' : person.gender === 'male' ? 'border-blue-300' : person.gender === 'female' ? 'border-blue-200' : 'border-gray-300'} shadow-lg group-hover:shadow-2xl transition-all duration-200`}>
                    <img
                        src={person.imgPreview ? person.imgPreview : (typeof person.img === 'string' && person.img ? person.img : 'https://cdn-icons-png.flaticon.com/512/149/149071.png')}
                        alt="Profile"
                        className="w-full h-full object-cover rounded-full"
                        onError={(e) => {
                            e.target.src = 'https://cdn-icons-png.flaticon.com/512/149/149071.png';
                        }}
                    />
                </div>
                {isNew && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-br from-green-400 to-teal-400 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-base shadow-md">+</span>
                )}
                {isSelected && !isNew && (
                  <span className="absolute -top-2 -right-2 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full w-6 h-6 flex items-center justify-center font-bold text-sm shadow-md"> 714</span>
                )}
            </div>
            {/* All info inside the card */}
            <div className="mt-3 w-full flex flex-col items-center justify-center">
                <span className="bg-white/90 px-3 py-0.5 rounded-full shadow text-gray-900 font-semibold text-[13px] border border-green-100 backdrop-blur-md tracking-wide text-center mb-1" style={{lineHeight: '1.2', maxWidth: '200px', overflowWrap: 'break-word', wordBreak: 'break-word'}}>
                    {person.name}
                </span>
                <span className="details text-xs text-gray-600 text-center font-medium mb-1">
                    {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}{ageText}
                </span>
                {relationshipText && (
                    <span className="relationship inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold text-xs text-center tracking-wide shadow-sm mt-1" style={{maxWidth: '110px', overflowWrap: 'break-word', wordBreak: 'break-word'}}>
                        {relationshipText}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Person; 