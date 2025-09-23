import React, { useMemo, useEffect, useState } from 'react';
import RelationshipCalculator from '../../utils/relationshipCalculator';
import { getTranslation } from '../../utils/languageTranslations';
import { fetchCustomLabel } from '../../utils/fetchCustomLabel';
import { useFamilyTreeLabels } from '../../Contexts/FamilyTreeContext';
import { useUser } from '../../Contexts/UserContext';
import { FiEye } from 'react-icons/fi';
import { fetchAssociatedFamilyPrefixes } from '../../utils/familyTreeApi';
import Swal from 'sweetalert2';
import { useNavigate, useParams } from 'react-router-dom';

// Helper function to get proper gender label
const getGenderLabel = (person, tree, currentUserId) => {
    if (!person.gender || person.gender === 'unknown' || person.gender === '') return '';
    
    // Check if this person is a spouse of the current user
    const isSpouseOfCurrentUser = () => {
        if (!tree || !currentUserId) return false;
        
        // Find current user in tree
        const currentUser = Array.from(tree.people.values()).find(p => 
            p.memberId === currentUserId || p.userId === currentUserId
        );
        
        if (!currentUser) return false;
        
        // Check if person is in current user's spouse list
        const spouses = currentUser.spouses instanceof Set 
            ? Array.from(currentUser.spouses)
            : Array.isArray(currentUser.spouses) 
            ? currentUser.spouses 
            : [];
            
        return spouses.includes(person.id);
    };
    
    // If this person is a spouse, use H/W labels
    if (isSpouseOfCurrentUser()) {
        return person.gender.toLowerCase() === 'male' ? 'H' : 
               person.gender.toLowerCase() === 'female' ? 'W' : '';
    }
    
    // For non-spouses, use standard gender labels
    const normalizedGender = person.gender.toLowerCase().trim();
    switch (normalizedGender) {
        case 'male':
        case 'm':
            return 'Male';
        case 'female':
        case 'f':
            return 'Female';
        case 'unknown':
        case '':
        case 'man': // Handle 'MAN' case
        case 'woman':
            return '';
        default:
            // Don't show raw gender values like 'MAN' - return empty for unknown values
            return '';
    }
};

const Person = ({ person, isRoot, onClick, rootId, tree, language, isNew, isSelected, isHighlighted, isSearchResult, currentUserId, currentFamilyId, viewOnly, sourceRelationship }) => {
    // Dynamic sizing based on tree size
    const memberCount = tree ? tree.people.size : 0;
    const { userInfo } = useUser();
    const { code } = useParams(); // Get current family code from URL
    const navigate = useNavigate();
    
    // Get source relationship from URL parameters
    const urlParams = new URLSearchParams(window.location.search);
    const urlSourceRelationship = urlParams.get('source');
    
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
    const isRemembering = person.lifeStatus === 'remembering';

    // Calculate relationship code to root (memoized for performance)
    const relationshipCode = useMemo(() => {
        if (!isRoot && rootId && tree) {
            const calculator = new RelationshipCalculator(tree);
            const rel = calculator.calculateRelationship(rootId, person.id);
            if (rel && rel.relationshipCode) {
                console.log(`🔍 Relationship for ${person.name}: ${rel.relationshipCode}`);
                return rel.relationshipCode;
            }
        }
        return '';
    }, [isRoot, rootId, tree, person.id]);

    // Determine if we're viewing birth family or associated family
    const isViewingBirthFamily = useMemo(() => {
        // If no code in URL, we're viewing user's birth family
        if (!code) return true;
        // If code matches user's birth family code, we're viewing birth family
        if (code === userInfo?.familyCode) return true;
        // Otherwise, we're viewing an associated family
        return false;
    }, [code, userInfo?.familyCode]);

    // Enhanced relationship code display with proper family context
    const displayRelationshipCode = useMemo(() => {
        if (!relationshipCode) return '';
        
        // For birth family: show normal codes (F, M, B+, B-, etc.)
        if (isViewingBirthFamily) {
            return relationshipCode;
        }
        
        // For associated family: use the source relationship from URL or prop
        // If viewing from SS (Son's Son), all codes should be ASS+[original]
        // If viewing from M (Mother), all codes should be AM+[original]
        // If viewing from F (Father), all codes should be AF+[original]
        
        const sourceRel = urlSourceRelationship || sourceRelationship;
        if (sourceRel) {
            return `A${sourceRel}+${relationshipCode}`;
        }
        
        // Fallback: use logged-in user's gender to determine H/W prefix
        const loggedInUserGender = userInfo?.gender?.toLowerCase();
        let genderPrefix = '';
        
        if (loggedInUserGender === 'male' || loggedInUserGender === 'husband') {
            genderPrefix = 'H';
        } else if (loggedInUserGender === 'female' || loggedInUserGender === 'wife') {
            genderPrefix = 'W';
        } else {
            // If gender is unknown, try to determine from relationship code first character
            const firstChar = relationshipCode.charAt(0);
            genderPrefix = firstChar !== 'U' ? firstChar : 'H'; // Default to H if unknown
        }
        
        return `A${genderPrefix}+${relationshipCode}`;
    }, [relationshipCode, isViewingBirthFamily, urlSourceRelationship, sourceRelationship, userInfo?.gender]);

    // Use context to get label - use displayRelationshipCode for translation consistency
    const { getLabel, refreshLabels } = useFamilyTreeLabels();
    const relationshipText = displayRelationshipCode ? getLabel(displayRelationshipCode) : '';

    // Inline edit state for relationship label
    const [isEditingLabel, setIsEditingLabel] = useState(false);
    const [editLabelValue, setEditLabelValue] = useState('');

    // Handler to start editing
    const handleEditLabelClick = (e) => {
        e.stopPropagation();
        setEditLabelValue(relationshipText);
        setIsEditingLabel(true);
    };

    // Handler to save label
    const handleSaveLabel = async (e) => {
        e.stopPropagation();
        if (!currentUserId || !currentFamilyId) {
            Swal.fire({ icon: 'warning', title: 'Missing info', text: 'User ID or Family Code missing. Cannot save label.' });
            return;
        }
        const apiLanguage = language === 'tamil' ? 'ta' : language;
        const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
        try {
            await fetch(`${baseUrl}/custom-labels`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    relationshipKey: displayRelationshipCode,
                    language: apiLanguage,
                    custom_label: editLabelValue,
                    creatorId: currentUserId, // FIXED: use correct param name
                    familyCode: currentFamilyId, // FIXED: use correct param name
                    scope: 'user', // or 'family'/'global' as needed
                    gender: userInfo?.gender
                })           
            });
            if (refreshLabels) refreshLabels();
            setIsEditingLabel(false);
            Swal.fire({ icon: 'success', title: 'Saved', text: 'Label saved successfully.' });
        } catch (err) {
            Swal.fire({ icon: 'error', title: 'Save failed', text: 'Failed to save label.' });
        }
    };

    // Handler to cancel editing
    const handleCancelEdit = (e) => {
        e.stopPropagation();
        setIsEditingLabel(false);
    };

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

    // Determine if this person has an associated family tree
    const getAssociatedCodes = () => {
        let codes = [];
        if (Array.isArray(person.associatedFamilyCodes)) {
            codes = person.associatedFamilyCodes.filter(code => code && !code.startsWith('REL_'));
        } else if (typeof person.associatedFamilyCodes === 'string' && person.associatedFamilyCodes) {
            try {
                const arr = JSON.parse(person.associatedFamilyCodes);
                if (Array.isArray(arr)) codes = arr.filter(code => code && !code.startsWith('REL_'));
            } catch {
                if (!person.associatedFamilyCodes.startsWith('REL_')) codes = [person.associatedFamilyCodes];
            }
        }
        return Array.from(new Set(codes));
    };

    const hasAssociatedTree = Boolean(person.memberId) || getAssociatedCodes().length > 0;

    // Handler for viewing family tree (uses backend prefixes)
    const handleViewAssociatedFamilyTree = async (e) => {
        e.stopPropagation();
        
        // Fetch spouse-connected associated families via API (fallback to local field)
        let associatedData = [];
        try {
            const uid = person.memberId || person.userId;
            if (uid) {
                associatedData = await fetchAssociatedFamilyPrefixes(uid);
            }
        } catch {}

        // Convert to codes list; if API empty, derive from legacy field
        const associatedCodes = associatedData.length
            ? associatedData.map(d => `${d.prefix || ''}${d.prefix ? ' - ' : ''}${d.familyCode}`)
            : getAssociatedCodes();
        
        // If no associated family codes, show error
        if (associatedCodes.length === 0) {
            Swal.fire({
                icon: 'info',
                title: 'No Associated Family Tree',
                text: 'This member is not associated with any other family trees.',
                confirmButtonColor: '#3f982c',
            });
            return;
        }
        
        // Helper: resolve counterpart (spouse) to their userId/memberId for cross-family focus
        const resolveCounterpartUserId = (targetFamilyCode) => {
            try {
                const meUserId = person.memberId || person.userId;
                if (meUserId && targetFamilyCode) {
                    const key = `assoc_pair:${meUserId}:${targetFamilyCode}`;
                    const stored = localStorage.getItem(key);
                    if (stored) return Number(stored);
                }
            } catch (_) {}
            const spouseIds = person.spouses instanceof Set
                ? Array.from(person.spouses)
                : Array.isArray(person.spouses)
                    ? person.spouses
                    : [];
            if (!spouseIds || spouseIds.length === 0) return null;
            const spousePersonId = Number(spouseIds[0]);
            const spouse = tree && tree.people ? tree.people.get(spousePersonId) : null;
            return spouse ? (spouse.memberId || spouse.userId || null) : null;
        };

        // If only one associated family code, navigate directly to it
        if (associatedCodes.length === 1) {
            const firstCode = associatedCodes[0].split(' - ').pop();
            // Prefer focusing counterpart (spouse) when jumping to associated family (convert spouse personId -> userId)
            const counterpartUserId = resolveCounterpartUserId(firstCode);
            const uid = counterpartUserId || (person.userId || person.memberId);
            
            // Use logged-in user's gender to determine proper source prefix
            const loggedInUserGender = userInfo?.gender?.toLowerCase();
            let sourcePrefix = '';
            
            if (loggedInUserGender === 'male' || loggedInUserGender === 'husband') {
                sourcePrefix = 'H';
            } else if (loggedInUserGender === 'female' || loggedInUserGender === 'wife') {
                sourcePrefix = 'W';
            } else {
                sourcePrefix = 'H'; // Default to H if unknown
            }
            
            // Pass focus user id so the other tree highlights counterpart, and include relationship code as source
            const query = new URLSearchParams({
                source: String(relationshipCode || sourcePrefix),
                focus: uid ? String(uid) : ''
            }).toString();
            navigate(`/family-tree/${firstCode}?${query}`);
            return;
        }
        
        // If multiple associated family codes, show a dropdown to select
        Swal.fire({
            title: 'Select Associated Family Tree',
            text: 'This member is associated with multiple family trees. Please select one to view:',
            input: 'select',
            inputOptions: associatedCodes.reduce((acc, entry) => {
            const [prefixLabel, code] = entry.split(' - ').length === 2 ? entry.split(' - ') : ['', entry];
            acc[entry] = prefixLabel ? `${prefixLabel} → ${code}` : `Family: ${code}`;
                return acc;
            }, {}),
            inputPlaceholder: 'Select a family tree',
            showCancelButton: true,
            confirmButtonColor: '#3f982c',
            cancelButtonText: 'Cancel',
            confirmButtonText: 'View Tree'
        }).then((result) => {
            if (result.isConfirmed && result.value) {
                // Extract familyCode after optional prefix label
                const parts = result.value.split(' - ');
                const selectedCode = parts.length === 2 ? parts[1] : parts[0];
                // Pass relationship code; prefer focusing counterpart (spouse) when changing family (convert spouse personId -> userId)
                const counterpartUserId = resolveCounterpartUserId(selectedCode);
                const uid = counterpartUserId || (person.userId || person.memberId);
                
                // Use logged-in user's gender to determine proper source prefix
                const loggedInUserGender = userInfo?.gender?.toLowerCase();
                let sourcePrefix = '';
                
                if (loggedInUserGender === 'male' || loggedInUserGender === 'husband') {
                    sourcePrefix = 'H';
                } else if (loggedInUserGender === 'female' || loggedInUserGender === 'wife') {
                    sourcePrefix = 'W';
                } else {
                    sourcePrefix = 'H'; // Default to H if unknown
                }
                
                const query = new URLSearchParams({
                    source: String(relationshipCode || sourcePrefix),
                    focus: uid ? String(uid) : ''
                }).toString();
                navigate(`/family-tree/${selectedCode}?${query}`);
            }
        });
    };

    // Optimize rendering for large trees
    const isLargeTree = memberCount > 50;
    const cardOpacity = isLargeTree ? 0.95 : 1;
    const shadowIntensity = isLargeTree ? 0.05 : 0.08;


    return (
        <div id={`person-${person.id}`} className="person-container" style={{ position: 'absolute', left: `${person.x - width / 2}px`, top: `${person.y - height / 2}px` }}>
            {/* Main Person Card */}
            <div
                className={`person ${person.gender} ${isRoot ? 'root' : ''} ${isNew ? 'person-new' : ''} ${isSelected ? 'person-selected' : ''} ${
                    person.lifeStatus === 'remembering' ? 'remembering' : ''
                } ${isHighlighted ? 'person-highlighted' : ''} ${isSearchResult ? 'person-search-result' : ''} group transition-all duration-300 hover:scale-105 hover:shadow-2xl hover:ring-4 hover:ring-green-200`}
                style={{
                    position: 'relative',
                    minWidth: width,
                    maxWidth: memberCount > 50 ? 200 : 250,
                    width: 'fit-content',
                    minHeight: height,
                    margin: margin,
                    padding: padding,
                    opacity: person.lifeStatus === 'remembering' ? 0.8 : 1,
                    background: isRoot
                      ? 'linear-gradient(135deg, #fceabb 0%, #f8b500 100%)' // gold gradient for root
                      : isNew
                      ? 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)' // pink to red gradient for new
                      : person.gender === 'male'
                      ? 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)' // blue gradient for males
                      : person.gender === 'female'
                      ? 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)' // pink to yellow gradient for females
                      : 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)', // soft teal to pink for others
                    border: isHighlighted
                      ? '4px solid #ff6b35' // orange border for highlighted (search focus)
                      : isSearchResult
                      ? '3px solid #ffd700' // gold border for search results
                      : isRoot
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
                    boxShadow: isHighlighted
                      ? '0 0 0 8px rgba(255, 107, 53, 0.3), 0 12px 36px rgba(255, 107, 53, 0.2), 0 0 20px rgba(255, 107, 53, 0.4)' // orange glow for highlighted
                      : isSearchResult
                      ? '0 0 0 6px rgba(255, 215, 0, 0.25), 0 8px 24px rgba(255, 215, 0, 0.15)' // gold glow for search results
                      : isRoot
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
                onClick={viewOnly ? undefined : handleCardClick}
                data-person-id={person.id}
            >
            {/* Eye Icon for Associated Family Tree (only if person has one and not viewOnly) */}
            {!viewOnly && (
                <button
                    className="absolute top-1 left-1 w-6 h-6 bg-white/80 hover:bg-green-100 text-green-700 rounded-full flex items-center justify-center shadow-md transition-all duration-200 z-10 border border-green-200"
                    onClick={handleViewAssociatedFamilyTree}
                    title={`View Associated Family Tree${hasAssociatedTree ? '' : ' (No associated families)'}`}
                    style={{
                        width: '24px',
                        height: '24px',
                        top: memberCount > 50 ? '2px' : '8px',
                        left: memberCount > 50 ? '2px' : '8px',
                        opacity: hasAssociatedTree ? 1 : 0.3
                    }}
                    disabled={!hasAssociatedTree}
                >
                    <FiEye size={16} />
                </button>
            )}
            {/* Radial Menu Button - Top Right Corner (hide in viewOnly mode) */}
            {!viewOnly && (
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
            )}
            {/* Profile pic and info (always show) */}
            <div className="profile-pic-container flex items-center justify-center relative">
                {person.lifeStatus === 'remembering' && (
                    <>
                        {/* Purple tint overlay */}
                        <div className="absolute inset-0 rounded-full bg-purple-500 bg-opacity-20 z-10"></div>
                        {/* Tiny ribbon badge */}
                        <span
                            className="absolute -top-1 -left-1 bg-purple-600 text-white text-[10px] font-semibold px-[6px] py-[1px] rounded-sm rotate-[-12deg] shadow-lg select-none z-20"
                            title="In Loving Memory"
                        >
                            ✝
                        </span>
                    </>
                )}
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
                {isNew && !viewOnly && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-green-400 to-teal-400 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs shadow-md">+</span>
                )}
                {isSelected && !isNew && !viewOnly && !isHighlighted && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-green-500 to-green-700 text-white rounded-full w-4 h-4 flex items-center justify-center font-bold text-xs shadow-md">✓</span>
                )}
                {isHighlighted && (
                  <span className="absolute -top-1 -right-1 bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-full w-5 h-5 flex items-center justify-center font-bold text-xs shadow-lg animate-pulse">🔍</span>
                )}
            </div>
            {/* All info inside the card */}
            <div className="mt-1 w-full flex flex-col items-center justify-center">
                {person.lifeStatus === 'remembering' && (
                    <div className="mb-1 px-2 py-0.5 bg-purple-100 text-purple-800 text-xs rounded-full font-medium">
                        In Loving Memory
                    </div>
                )}
                <div className="flex flex-col items-center">
                    <span 
                        className="bg-white/90 px-2 py-0.5 rounded-full shadow text-gray-900 font-semibold border border-green-100 backdrop-blur-md tracking-wide text-center" 
                        style={{
                            lineHeight: '1.2', 
                            fontSize: `${fontSizeName}px`, 
                            maxWidth: memberCount > 50 ? '100px' : '140px', 
                            overflowWrap: 'break-word', 
                            wordBreak: 'break-word',
                            whiteSpace: 'nowrap',
                            overflow: 'hidden',
                            textOverflow: 'ellipsis',
                            display: 'block'
                        }}
                        title={person.name || [person.firstName, person.lastName].filter(Boolean).join(' ').trim() || 'Unnamed Family Member'}
                    >
                        {person.name || [person.firstName, person.lastName].filter(Boolean).join(' ').trim() || (language === 'tamil' ? 'பெயரில்லாத உறுப்பினர்' : 'Family Member')}
                    </span>
                </div>
                {/* Show relationship code and label below name */}
                {relationshipCode && (
                  <span className="details text-xs text-blue-700 text-center font-mono mb-1" style={{fontSize: `${fontSizeDetails}px`}}>
                    {displayRelationshipCode}
                  </span>
                )}
                <span 
                    className="details text-xs text-gray-600 text-center font-medium mb-1" 
                    style={{fontSize: `${fontSizeDetails}px`}}
                >
                    {getGenderLabel(person, tree, currentUserId)}{ageText}
                </span>
                {/* Hide edit label in viewOnly mode */}
                {relationshipText && !isEditingLabel && !viewOnly && (
                    <span 
                        className={`relationship inline-block px-2 py-0.5 rounded-full font-semibold text-center tracking-wide shadow-sm mt-1 cursor-pointer transition ${
                            isViewingBirthFamily 
                                ? 'bg-green-100 text-green-700 hover:bg-green-200' 
                                : 'bg-green-200 text-green-800 hover:bg-green-300 border border-green-400'
                        }`}
                        style={{
                            fontSize: `${fontSizeRelationship}px`, 
                            maxWidth: memberCount > 50 ? '60px' : '80px', 
                            overflowWrap: 'break-word', 
                            wordBreak: 'break-word'
                        }}
                        title="Click to edit label"
                        onClick={handleEditLabelClick}
                    >
                        {relationshipText} ✏️
                    </span>
                )}
                {/* Hide editing UI in viewOnly mode */}
                {isEditingLabel && !viewOnly && (
                    <span className="relationship-edit inline-flex items-center mt-1">
                        <input
                            type="text"
                            className="px-2 py-0.5 rounded-l bg-white border border-green-300 text-green-700 font-semibold text-center tracking-wide shadow-sm focus:outline-none focus:ring-2 focus:ring-green-400"
                            value={editLabelValue}
                            onChange={e => setEditLabelValue(e.target.value)}
                            style={{fontSize: `${fontSizeRelationship}px`}}
                        />
                        <button className="px-2 py-0.5 rounded-r bg-green-500 text-white font-bold" onClick={handleSaveLabel}>Save</button>
                        <button className="px-2 py-0.5 rounded-r bg-gray-300 text-gray-700 font-bold" onClick={handleCancelEdit}>Cancel</button>
                    </span>
                )}
            </div>
        </div>
        </div>
    );
};

export default Person;