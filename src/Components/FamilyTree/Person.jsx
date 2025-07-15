import React, { useMemo } from 'react';
import RelationshipCalculator from '../../utils/relationshipCalculator';
import { getTranslation } from '../../utils/languageTranslations';

const Person = ({ person, isRoot, onClick, rootId, tree, language, isNew, isSelected }) => {
    // Dynamic sizing based on tree size
    const memberCount = tree ? tree.people.size : 0;
    
    const cardDimensions = useMemo(() => {
        if (memberCount > 100) {
            // Very compact for large trees
            return {
                width: window.innerWidth <= 600 ? 90 : 140,
                height: window.innerWidth <= 600 ? 110 : 160,
                fontSizeName: window.innerWidth <= 600 ? 10 : 11,
                fontSizeDetails: window.innerWidth <= 600 ? 9 : 10,
                fontSizeRelationship: window.innerWidth <= 600 ? 8 : 9,
                profileSize: window.innerWidth <= 600 ? 32 : 48,
                padding: window.innerWidth <= 600 ? '2px' : '4px',
                margin: '1px'
            };
        } else if (memberCount > 50) {
            // Compact for medium trees
            return {
                width: window.innerWidth <= 600 ? 100 : 150,
                height: window.innerWidth <= 600 ? 120 : 180,
                fontSizeName: window.innerWidth <= 600 ? 11 : 12,
                fontSizeDetails: window.innerWidth <= 600 ? 10 : 11,
                fontSizeRelationship: window.innerWidth <= 600 ? 9 : 10,
                profileSize: window.innerWidth <= 600 ? 36 : 56,
                padding: window.innerWidth <= 600 ? '3px' : '5px',
                margin: '2px'
            };
        } else {
            // Normal size for small trees
            return {
                width: window.innerWidth <= 600 ? 110 : 170,
                height: window.innerWidth <= 600 ? 140 : 220,
                fontSizeName: window.innerWidth <= 600 ? 11 : 13,
                fontSizeDetails: window.innerWidth <= 600 ? 10 : 12,
                fontSizeRelationship: window.innerWidth <= 600 ? 9 : 11,
                profileSize: window.innerWidth <= 600 ? 40 : 64,
                padding: window.innerWidth <= 600 ? '4px' : '6px',
                margin: window.innerWidth <= 600 ? '1px' : '8px'
            };
        }
    }, [memberCount]);

    const { width, height, fontSizeName, fontSizeDetails, fontSizeRelationship, profileSize, padding, margin } = cardDimensions;
    
    const ageText = person.age ? ` (Age: ${person.age})` : '';

    // Calculate relationship to root (memoized for performance)
    const relationshipText = useMemo(() => {
        if (!isRoot && rootId && tree) {
            const calculator = new RelationshipCalculator(tree);
            const rel = calculator.calculateRelationship(rootId, person.id);
            if (rel && rel.relationshipCode) {
                // Always use getTranslation for all languages
                return getTranslation(rel.relationshipCode, language) || rel.description || rel.relationshipCode;
            }
        }
        return '';
    }, [isRoot, rootId, tree, person.id, language]);

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

    // Optimize rendering for large trees
    const isLargeTree = memberCount > 50;
    const cardOpacity = isLargeTree ? 0.95 : 1;
    const shadowIntensity = isLargeTree ? 0.05 : 0.08;

    return (
        <div
            className={`person ${person.gender} ${isRoot ? 'root' : ''} ${isNew ? 'person-new' : ''} ${isSelected ? 'person-selected' : ''} group transition-transform duration-200 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-green-200`}
            style={{
                left: `${person.x - width / 2}px`,
                top: `${person.y - height / 2}px`,
                position: 'absolute',
                minWidth: width,
                maxWidth: memberCount > 50 ? 200 : 250,
                width: 'fit-content',
                minHeight: height,
                margin: margin,
                padding: padding,
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
                borderRadius: memberCount > 50 ? 12 : 18,
                boxShadow: isRoot
                  ? '0 0 0 8px rgba(248, 181, 0, 0.25), 0 12px 36px rgba(248, 181, 0.18)'
                  : isSelected
                  ? '0 12px 36px rgba(79, 172, 254, 0.13)'
                  : person.gender === 'male'
                  ? `0 6px 24px rgba(79, 172, 254, ${shadowIntensity})`
                  : person.gender === 'female'
                  ? `0 6px 24px rgba(250, 112, 154, ${shadowIntensity})`
                  : `0 6px 24px rgba(168, 237, 234, ${shadowIntensity})`,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'flex-start',
                zIndex: 2,
                fontFamily: 'Poppins, Arial, sans-serif',
                transition: 'box-shadow 0.18s, border 0.18s, background 0.18s',
                overflow: 'visible',
                opacity: cardOpacity,
            }}
            onClick={handleCardClick}
            data-person-id={person.id}
        >
            {/* Radial Menu Button - Top Right Corner */}
            <button
                className="radial-menu-button absolute top-1 right-1 w-5 h-5 bg-gradient-to-br from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white rounded-full flex items-center justify-center font-bold text-xs shadow-lg hover:shadow-xl transition-all duration-200 z-10 border border-white"
                onClick={handleRadialMenuClick}
                style={{
                    boxShadow: '0 2px 8px rgba(34, 197, 94, 0.3)',
                    width: memberCount > 50 ? '16px' : '24px',
                    height: memberCount > 50 ? '16px' : '24px',
                    top: memberCount > 50 ? '2px' : '8px',
                    right: memberCount > 50 ? '2px' : '8px',
                }}
                title="Add family member"
            >
                +
            </button>

            <div className="profile-pic-container flex items-center justify-center relative">
                <div 
                    className={`profile-pic-circle rounded-full overflow-hidden bg-gray-100 border-4 ${isRoot ? 'border-yellow-400 shadow-yellow-200' : person.gender === 'male' ? 'border-blue-300' : person.gender === 'female' ? 'border-pink-200' : 'border-gray-300'} shadow-lg group-hover:shadow-2xl transition-all duration-200`}
                    style={{
                        width: `${profileSize}px`,
                        height: `${profileSize}px`,
                        borderWidth: memberCount > 50 ? '2px' : '4px'
                    }}
                >
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
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-teal-400 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs shadow-md">+</span>
                )}
                {isSelected && !isNew && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs shadow-md">✓</span>
                )}
            </div>
            
            {/* All info inside the card */}
            <div className="mt-1 w-full flex flex-col items-center justify-center">
                <span 
                    className="bg-white/90 px-2 py-0.5 rounded-full shadow text-gray-900 font-semibold border border-green-100 backdrop-blur-md tracking-wide text-center mb-1" 
                    style={{
                        lineHeight: '1.2', 
                        fontSize: `${fontSizeName}px`, 
                        maxWidth: memberCount > 50 ? '80px' : '120px', 
                        overflowWrap: 'break-word', 
                        wordBreak: 'break-word'
                    }}
                >
                    {person.name}
                </span>
                <span 
                    className="details text-xs text-gray-600 text-center font-medium mb-1" 
                    style={{fontSize: `${fontSizeDetails}px`}}
                >
                    {person.gender.charAt(0).toUpperCase() + person.gender.slice(1)}{ageText}
                </span>
                {relationshipText && (
                    <span 
                        className="relationship inline-block px-2 py-0.5 rounded-full bg-green-100 text-green-700 font-semibold text-center tracking-wide shadow-sm mt-1" 
                        style={{
                            fontSize: `${fontSizeRelationship}px`, 
                            maxWidth: memberCount > 50 ? '60px' : '80px', 
                            overflowWrap: 'break-word', 
                            wordBreak: 'break-word'
                        }}
                    >
                        {relationshipText}
                    </span>
                )}
            </div>
        </div>
    );
};

export default Person; 