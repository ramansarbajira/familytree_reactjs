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

    const handleCardClick = (e) => {
        // Only trigger onClick if the click is not on the radial menu button
        if (!e.target.closest('.radial-menu-button')) {
            onClick(person.id);
        }
    };

    const handleRadialMenuClick = (e) => {
        e.stopPropagation();
        onClick(person.id);
    };

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
                padding: '12px 12px 22px 12px',
                background: isRoot
                  ? 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' // gold gradient for root
                  : isNew
                  ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' // pink to red gradient for new
                  : person.gender === 'male'
                  ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' // blue gradient for males
                  : person.gender === 'female'
                  ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' // pink to yellow gradient for females
                  : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // soft teal to pink for others
                border: isRoot
                  ? '4px solid #f8b500' // gold border for root
                  : isNew
                  ? '2.5px dashed #f093fb' // pink border for new
                  : isSelected
                  ? '3px solid #4facfe' // blue border for selected
                  : person.gender === 'male'
                  ? '2.5px solid #4facfe' // blue border for males
                  : person.gender === 'female'
                  ? '2.5px solid #fa709a' // pink border for females
                  : '2.5px solid #a8edea', // teal border for others
                borderRadius: 24,
                boxShadow: isRoot
                  ? '0 0 0 8px rgba(248, 181, 0, 0.25), 0 12px 36px rgba(248, 181, 0, 0.18)'
                  : isSelected
                  ? '0 12px 36px rgba(79, 172, 254, 0.13)'
                  : person.gender === 'male'
                  ? '0 6px 24px rgba(79, 172, 254, 0.08)'
                  : person.gender === 'female'
                  ? '0 6px 24px rgba(250, 112, 154, 0.08)'
                  : '0 6px 24px rgba(168, 237, 234, 0.08)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                zIndex: 2,
                fontFamily: 'Poppins, Arial, sans-serif',
                transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
                overflow: 'visible',
            }}
            onClick={handleCardClick}
            data-person-id={person.id}
        >
            {/* Radial Menu Button - Top Right Corner */}
            <button
                className="radial-menu-button absolute top-2 right-2 w-6 h-6 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full flex items-center justify-center font-bold text-sm shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-white"
                onClick={handleRadialMenuClick}
                style={{
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                }}
                title="Add family member"
            >
                +
            </button>

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