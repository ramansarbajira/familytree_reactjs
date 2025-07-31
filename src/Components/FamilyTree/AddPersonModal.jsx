import React, { useState, useEffect } from 'react';
import { getTranslation } from '../../utils/languageTranslations';
import { useLanguage } from '../../Contexts/LanguageContext';
import { X, UserPlus, Users, Edit, Plus, UserMinus, Camera, Save, ArrowLeft } from 'lucide-react';
import { fetchRelationships } from '../../utils/familyTreeApi';

const PRIMARY_COLOR = '#3f982c';

const AddPersonModal = ({ isOpen, onClose, action, onAddPersons, familyCode, token, existingMemberIds = [] }) => {
    const [count, setCount] = useState(1);
    const [forms, setForms] = useState([]);
    const [imageData, setImageData] = useState({});
    const [imagePreview, setImagePreview] = useState({});
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [parentSelections, setParentSelections] = useState({ father: { selectedMemberId: null, showManualEntry: false }, mother: { selectedMemberId: null, showManualEntry: false } });
    const [formSelections, setFormSelections] = useState({});
    const { language } = useLanguage();
    // Add state for relationships
    const [relationshipTypes, setRelationshipTypes] = useState([]);

    // Fetch relationship types on mount
    useEffect(() => {
        fetchRelationships()
            .then(setRelationshipTypes)
            .catch(() => setRelationshipTypes([]));
    }, []);

    // Helper to get the correct label for a relationship
    const getRelationshipLabel = (rel) => {
        // Map language code to DB field
        const langMap = { ta: 'ta', en: 'en', hi: 'hi', te: 'te', ml: 'ml', kn: 'ka', ka: 'ka' };
        const dbLang = langMap[language] || 'en';
        return rel[`description_${dbLang}`] || rel.description_en || rel.key;
    };

    const titles = {
        parents: 'Add Parents',
        spouse: 'Add Spouse',
        children: 'Add Child',
        siblings: 'Add Sibling',
        edit: 'Edit'
    };

    // Add tab state for each form
    const [activeTabs, setActiveTabs] = useState({});

    // Fetch family members when modal opens
    useEffect(() => {
        if (isOpen && familyCode && token) {
            setLoadingMembers(true);
            fetch(`http://localhost:3000/family/member/${familyCode}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'accept': '*/*',
                },
            })
                .then(res => res.json())
                .then(data => {
                    if (data && data.data) {
                        setFamilyMembers(data.data);
                    }
                })
                .finally(() => setLoadingMembers(false));
        }
    }, [isOpen, familyCode, token]);

    useEffect(() => {
        if (isOpen) {
            generateForms();
            setSelectedMemberId(null);
            setShowManualEntry(false);
            setParentSelections({ father: { selectedMemberId: null, showManualEntry: true }, mother: { selectedMemberId: null, showManualEntry: true } });
            
            // Initialize form selections for other types
            const initialFormSelections = {};
            if (action.type !== 'parents') {
                for (let i = 0; i < count; i++) {
                    initialFormSelections[i] = { selectedMemberId: null, showManualEntry: true };
                }
            }
            setFormSelections(initialFormSelections);
            
            // Default tabs: new (manual entry) as default
            const initialTabs = {};
            if (action.type === 'parents') {
                initialTabs.father = 'new';
                initialTabs.mother = 'new';
            } else {
                for (let i = 0; i < count; i++) {
                    initialTabs[i] = 'new';
                }
            }
            setActiveTabs(initialTabs);
        }
    }, [isOpen, count, action]);

    const generateForms = () => {
        const newForms = [];
        
        if (action.type === 'parents') {
            newForms.push(
                { type: 'father', index: 0, gender: 'male' },
                { type: 'mother', index: 1, gender: 'female' }
            );
        } else if (action.type === 'spouse') {
            newForms.push({ type: 'spouse', index: 0 });
        } else if (action.type === 'edit') {
            newForms.push({ type: 'edit', index: 0 });
        } else {
            for (let i = 0; i < count; i++) {
                newForms.push({ type: 'person', index: i });
            }
        }
        
        setForms(newForms);
    };

    // Modified: Get all family members, but mark existing ones as disabled in dropdown
    const getEligibleMembersWithAll = (form) => {
        if (!form) return [];
        let genderFilter = null;
        if (form.type === 'father') genderFilter = 'Male';
        if (form.type === 'mother') genderFilter = 'Female';
        if (form.type === 'spouse' && action.person) genderFilter = action.person.gender === 'male' ? 'Female' : 'Male';
        // For children/siblings, allow both genders
        return familyMembers.filter(m => {
            const g = m.user?.userProfile?.gender;
            if (genderFilter && g !== genderFilter) return false;
            return true;
        });
    };

    const handleImageUpload = (event, index) => {
        const file = event.target.files[0];
        if (!file) return;
        // Store the File object directly for binary upload
        setImageData(prev => ({
            ...prev,
            [index]: file
        }));
        // Generate preview URL
        const url = URL.createObjectURL(file);
        setImagePreview(prev => ({
            ...prev,
            [index]: url
        }));
    };

    // Clean up object URLs when modal closes or image changes
    useEffect(() => {
        return () => {
            Object.values(imagePreview).forEach(url => {
                if (url) URL.revokeObjectURL(url);
            });
        };
    }, [isOpen]);

    const handleParentDropdown = (type, value) => {
        setParentSelections(prev => ({
            ...prev,
            [type]: {
                selectedMemberId: value === 'manual' ? null : value,
                showManualEntry: value === 'manual',
            }
        }));
    };

    const handleFormDropdown = (formIndex, value) => {
        setFormSelections(prev => ({
            ...prev,
            [formIndex]: {
                selectedMemberId: value === 'manual' ? null : value,
                showManualEntry: value === 'manual',
            }
        }));
    };

    const handleSubmit = (e) => {
        e.preventDefault();
        // Fallback: Prevent adding an already-in-tree user
        const formData = new FormData(e.target);
        let duplicate = false;
        forms.forEach(form => {
            const sel = formSelections[form.index] || {};
            if (sel.selectedMemberId && !sel.showManualEntry) {
                if (existingMemberIds.includes(parseInt(sel.selectedMemberId))) {
                    duplicate = true;
                }
            }
        });
        if (duplicate) {
            alert('This user is already part of the family tree!');
            return;
        }
        // Special handling for parents: handle both father and mother
        if (action.type === 'parents') {
            const parentForms = forms.filter(f => f.type === 'father' || f.type === 'mother');
            const parentPersons = [];
            let hasValidParent = false;
            
            parentForms.forEach(form => {
                const sel = parentSelections[form.type];
                
                // Check if user has made a selection for this parent
                if (sel) {
                    if (sel.selectedMemberId && !sel.showManualEntry) {
                        // Existing member selected
                        const member = familyMembers.find(m => m.user?.id === parseInt(sel.selectedMemberId));
                        if (member) {
                            parentPersons.push({
                                name: member.user.fullName,
                                gender: member.user.userProfile.gender === 'Male' ? 'male' : 'female',
                                age: member.user.userProfile.dob ? (new Date().getFullYear() - new Date(member.user.userProfile.dob).getFullYear()) : '',
                                img: member.user.profileImage,
                                imgPreview: imagePreview[form.index] || '',
                                dob: member.user.userProfile.dob,
                                memberId: member.user.id,
                                birthOrder: 1, // Default birth order for parents
                            });
                            hasValidParent = true;
                        }
                    } else if (sel.showManualEntry) {
                        const name = formData.get(`name_${form.index}`);
                        if (name && name.trim() !== '') {
                            parentPersons.push({
                                name: name.trim(),
                                gender: form.gender,
                                age: formData.get(`age_${form.index}`),
                                img: imageData[form.index] || '', // File object or empty string
                                imgPreview: imagePreview[form.index] || '',
                                generation: action.person ? action.person.generation - 1 : 0,
                                birthOrder: 1, // Default birth order for parents
                            });
                            hasValidParent = true;
                        }
                    }
                }
            });
            // Only proceed if we have at least one valid parent
            if (!hasValidParent) {
                alert('Please fill in at least one parent\'s details. Select an existing member or add a new person.');
                return;
            }
            onAddPersons(parentPersons);
            onClose();
            return;
        }
        // For other types: spouse, child, sibling, etc.
        const persons = [];
        let hasValidPerson = false;
        forms.forEach(form => {
            const sel = formSelections[form.index] || {};
            // Check if user has made a selection for this person
            if (sel.selectedMemberId && !sel.showManualEntry) {
                // Existing member selected
                const member = familyMembers.find(m => m.user?.id === parseInt(sel.selectedMemberId));
                if (member) {
                    persons.push({
                        name: member.user.fullName,
                        gender: member.user.userProfile.gender === 'Male' ? 'male' : 'female',
                        age: member.user.userProfile.dob ? (new Date().getFullYear() - new Date(member.user.userProfile.dob).getFullYear()) : '',
                        img: member.user.profileImage,
                        imgPreview: imagePreview[form.index] || '',
                        dob: member.user.userProfile.dob,
                        memberId: member.user.id,
                        birthOrder: parseInt(formData.get(`birthOrder_${form.index}`)) || 1,
                    });
                    hasValidPerson = true;
                }
            } else if (sel.showManualEntry) {
                const name = formData.get(`name_${form.index}`);
                if (name && name.trim() !== '') {
                    let generation, gender;
                    if (action.type === 'children') {
                        generation = action.person ? action.person.generation + 1 : 1;
                        gender = formData.get(`gender_${form.index}`);
                    } else if (action.type === 'siblings') {
                        generation = action.person ? action.person.generation : 1;
                        gender = formData.get(`gender_${form.index}`);
                    } else if (action.type === 'spouse') {
                        generation = action.person ? action.person.generation : 1;
                        gender = formData.get(`gender_0`);
                    } else if (action.type === 'edit') {
                        generation = action.person ? action.person.generation : 1;
                        gender = formData.get(`gender_0`);
                    }
                    // --- FIX: Add id and memberId for edit ---
                    const personObj = {
                        name: name.trim(),
                        gender: gender || 'male',
                        age: formData.get(`age_${form.index}`),
                        generation,
                        img: imageData[form.index] || '', // File object or empty string
                        imgPreview: imagePreview[form.index] || '',
                        birthOrder: parseInt(formData.get(`birthOrder_${form.index}`)) || 1,
                    };
                    if (action.type === 'edit' && action.person) {
                        personObj.id = action.person.id;
                        if (action.person.memberId) personObj.memberId = action.person.memberId;
                    }
                    persons.push(personObj);
                    hasValidPerson = true;
                }
            }
        });
        // Only proceed if we have at least one valid person
        if (!hasValidPerson) {
            alert('Please fill in at least one person\'s details. Select an existing member or add a new person.');
            return;
        }
        onAddPersons(persons);
        onClose();
    };

    // Tab switch handler
    const handleTabSwitch = (formKey, tab) => {
        setActiveTabs(prev => ({ ...prev, [formKey]: tab }));
        if (action.type === 'parents') {
            setParentSelections(prev => ({
                ...prev,
                [formKey]: {
                    ...prev[formKey],
                    showManualEntry: tab === 'new',
                }
            }));
        } else {
            setFormSelections(prev => ({
                ...prev,
                [formKey]: {
                    ...prev[formKey],
                    showManualEntry: tab === 'new',
                }
            }));
        }
    };

    if (!isOpen) return null;

    return (
        <div 
            className="modal-overlay-upgraded"
            style={{ 
                position: 'fixed', 
                top: 0, 
                left: 0, 
                width: '100vw', 
                height: '100vh', 
                background: 'rgba(0, 0, 0, 0.6)', 
                backdropFilter: 'blur(8px)',
                zIndex: 1000, 
                display: 'flex', 
                alignItems: 'center', 
                justifyContent: 'center', 
                fontFamily: 'Poppins, Arial, sans-serif',
                animation: 'modalFadeIn 0.3s cubic-bezier(0.4, 0, 0.2, 1)'
            }} 
            onClick={onClose}
        >
            <div 
                className="modal-content-upgraded"
                style={{ 
                    position: 'relative', 
                    background: 'rgba(255, 255, 255, 0.95)',
                    backdropFilter: 'blur(20px) saturate(1.8)',
                    borderRadius: 24, 
                    boxShadow: '0 25px 80px rgba(0, 0, 0, 0.25), 0 8px 32px rgba(0, 0, 0, 0.15)', 
                    maxWidth: 500, 
                    width: '95vw', 
                    maxHeight: '90vh', 
                    display: 'flex', 
                    flexDirection: 'column', 
                    padding: 0,
                    border: '1px solid rgba(255, 255, 255, 0.3)',
                    animation: 'modalSlideIn 0.4s cubic-bezier(0.4, 0, 0.2, 1)'
                }} 
                onClick={(e) => e.stopPropagation()}
            >
                {/* Modal Header */}
                <div style={{ 
                    padding: '28px 32px 20px 32px', 
                    borderBottom: '1px solid rgba(0, 0, 0, 0.08)', 
                    display: 'flex', 
                    alignItems: 'center', 
                    justifyContent: 'space-between',
                    background: PRIMARY_COLOR,
                    borderRadius: '24px 24px 0 0'
                }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                        <div style={{
                            width: 40,
                            height: 40,
                            borderRadius: 12,
                            background: PRIMARY_COLOR,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            boxShadow: '0 4px 15px rgba(63, 152, 44, 0.18)'
                        }}>
                            {action.type === 'parents' && <Users size={20} color="#fff" />}
                            {action.type === 'spouse' && <UserPlus size={20} color="#fff" />}
                            {action.type === 'children' && <Plus size={20} color="#fff" />}
                            {action.type === 'siblings' && <UserMinus size={20} color="#fff" />}
                            {action.type === 'edit' && <Edit size={20} color="#fff" />}
                        </div>
                        <h3 className="modal-title-upgraded" style={{ 
                            fontSize: 24, 
                            fontWeight: 700, 
                            margin: 0,
                            color: '#fff',
                            background: 'none',
                        }}>
                            {titles[action.type] || 'Add Person'}
                        </h3>
                    </div>
                    <button 
                        onClick={onClose} 
                        style={{ 
                            background: 'rgba(0, 0, 0, 0.05)', 
                            border: 'none', 
                            fontSize: 20, 
                            cursor: 'pointer', 
                            color: '#fff',
                            width: 36,
                            height: 36,
                            borderRadius: 10,
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            transition: 'all 0.2s ease'
                        }} 
                        onMouseEnter={(e) => {
                            e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                            e.target.style.color = '#fff';
                        }}
                        onMouseLeave={(e) => {
                            e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                            e.target.style.color = '#fff';
                        }}
                        aria-label="Close"
                    >
                        <X size={18} />
                    </button>
                </div>

                {/* Modal Body (Scrollable) */}
                <form onSubmit={handleSubmit} style={{ 
                    flex: 1, 
                    overflow: 'auto', 
                    padding: '24px 32px 0 32px',
                    background: 'rgba(255, 255, 255, 0.5)'
                }}>
                    {/* For parents, show two dropdowns/manuals: father and mother */}
                    {action.type === 'parents' && forms.map((form) => {
                        const eligible = getEligibleMembersWithAll(form);
                        // Default tab is 'new' (Add New)
                        const tab = activeTabs[form.type] || 'new';
                        return (
                        <div key={form.index} style={{ marginBottom: 24 }}>
                            {/* Tab Toggle: Add New first, then Select Existing */}
                            <div style={{ 
                                display: 'flex', 
                                gap: 0, 
                                marginBottom: 16, 
                                borderRadius: 12, 
                                overflow: 'hidden', 
                                border: `2px solid ${PRIMARY_COLOR}22`, 
                                width: 'fit-content', 
                                fontWeight: 600, 
                                fontSize: 14,
                                background: 'rgba(255, 255, 255, 0.8)',
                                boxShadow: `0 4px 15px ${PRIMARY_COLOR}18`
                            }}>
                                <button 
                                    type="button" 
                                    onClick={() => handleTabSwitch(form.type, 'new')} 
                                    style={{ 
                                        padding: '10px 24px', 
                                        background: tab === 'new' ? PRIMARY_COLOR : 'transparent', 
                                        color: tab === 'new' ? '#fff' : PRIMARY_COLOR, 
                                        border: 'none', 
                                        outline: 'none', 
                                        cursor: 'pointer', 
                                        transition: 'all 0.3s ease',
                                        fontWeight: 600
                                    }}
                                >
                                    Add New
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleTabSwitch(form.type, 'existing')} 
                                    style={{ 
                                        padding: '10px 24px', 
                                        background: tab === 'existing' ? PRIMARY_COLOR : 'transparent', 
                                        color: tab === 'existing' ? '#fff' : PRIMARY_COLOR, 
                                        border: 'none', 
                                        outline: 'none', 
                                        cursor: 'pointer', 
                                        transition: 'all 0.3s ease',
                                        fontWeight: 600
                                    }} 
                                    disabled={eligible.length === 0}
                                >
                                    Select Existing
                                </button>
                            </div>

                            {/* Existing Member Dropdown */}
                            {tab === 'existing' && eligible.length > 0 && !parentSelections[form.type]?.showManualEntry && (
                                <div className="form-group-upgraded" style={{ marginBottom: 16 }}>
                                    <label style={{ 
                                        fontWeight: 600, 
                                        color: '#333',
                                        marginBottom: 8,
                                        display: 'block'
                                    }}>
                                        Select Existing {form.type === 'father' ? 'Father' : 'Mother'}:
                                    </label>
                                    <select
                                        value={parentSelections[form.type]?.selectedMemberId || ''}
                                        onChange={e => handleParentDropdown(form.type, e.target.value)}
                                        style={{ 
                                            width: '100%', 
                                            borderRadius: 12, 
                                            border: `2px solid ${PRIMARY_COLOR}22`, 
                                            padding: '12px 16px', 
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = PRIMARY_COLOR;
                                            e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}18`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = `${PRIMARY_COLOR}22`;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="">-- Select --</option>
                                        {eligible.map(member => (
                                            <option key={member.user.id} value={member.user.id} disabled={existingMemberIds.includes(member.user.id)}>
                                                {member.user.fullName} {member.user.userProfile && member.user.userProfile.gender ? `(${member.user.userProfile.gender}${member.user.userProfile.dob ? ', ' + member.user.userProfile.dob.split('T')[0] : ''})` : ''} {existingMemberIds.includes(member.user.id) ? '(Already in tree)' : ''}
                                            </option>
                                        ))}
                                        <option value="manual">Add New Member</option>
                                    </select>
                                </div>
                            )}

                            {/* Manual entry for parent if needed */}
                            {tab === 'new' && (
                                <div className="person-form-upgraded" style={{ 
                                    background: '#f6fdf7',
                                    borderRadius: 16, 
                                    padding: 24, 
                                    marginBottom: 0, 
                                    boxShadow: `0 4px 20px ${PRIMARY_COLOR}10`,
                                    border: `1px solid ${PRIMARY_COLOR}10`
                                }}>
                                    <h4 style={{ 
                                        marginBottom: 16, 
                                        fontWeight: 700, 
                                        fontSize: 18,
                                        color: '#333',
                                        display: 'flex',
                                        alignItems: 'center',
                                        gap: 8
                                    }}>
                                        {form.type === 'father' ? '👨 Father' : '👩 Mother'}
                                    </h4>
                                    <div className="form-row-upgraded" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                        <div className="form-group-upgraded" style={{ flex: 1 }}>
                                            <label style={{ 
                                                fontWeight: 600, 
                                                color: '#333',
                                                marginBottom: 8,
                                                display: 'block'
                                            }}>
                                                Name:
                                            </label>
                                            <input 
                                                type="text" 
                                                name={`name_${form.index}`}
                                                required 
                                                style={{ 
                                                    width: '100%', 
                                                    borderRadius: 12, 
                                                    border: '2px solid rgba(102, 126, 234, 0.2)', 
                                                    padding: '12px 16px', 
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row-upgraded" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                        <div className="form-group-upgraded" style={{ flex: 1 }}>
                                            <label style={{ 
                                                fontWeight: 600, 
                                                color: '#333',
                                                marginBottom: 8,
                                                display: 'block'
                                            }}>
                                                Age:
                                            </label>
                                            <input 
                                                type="number" 
                                                name={`age_${form.index}`}
                                                min="0"
                                                style={{ 
                                                    width: '100%', 
                                                    borderRadius: 12, 
                                                    border: '2px solid rgba(102, 126, 234, 0.2)', 
                                                    padding: '12px 16px', 
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row-upgraded" style={{ display: 'flex', gap: 16 }}>
                                        <div className="form-group-upgraded" style={{ flex: 1 }}>
                                            <label style={{ 
                                                fontWeight: 600, 
                                                color: '#333',
                                                marginBottom: 8,
                                                display: 'block'
                                            }}>
                                                Profile Image (optional):
                                            </label>
                                            <div style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                cursor: 'pointer'
                                            }}>
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, form.index)}
                                                    style={{ 
                                                        position: 'absolute',
                                                        opacity: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <div style={{
                                                    padding: '12px 20px',
                                                    borderRadius: 12,
                                                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                                                    background: 'rgba(102, 126, 234, 0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    transition: 'all 0.3s ease',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    color: '#667eea'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                                    e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                                                }}
                                                >
                                                    <Camera size={16} />
                                                    Choose Image
                                                </div>
                                            </div>
                                            <input 
                                                type="hidden" 
                                                name={`img_data_${form.index}`}
                                                value={imageData[form.index] || ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );})}

                    {/* For other types: spouse, child, sibling, etc. */}
                    {action.type !== 'parents' && forms.map((form) => {
                        const eligible = getEligibleMembersWithAll(form);
                        // Default tab is 'new' (Add New)
                        const tab = activeTabs[form.index] || 'new';
                        return (
                        <div key={form.index} style={{ marginBottom: 24 }}>
                            {/* Tab Toggle: Add New first, then Select Existing */}
                            <div style={{ 
                                display: 'flex', 
                                gap: 0, 
                                marginBottom: 16, 
                                borderRadius: 12, 
                                overflow: 'hidden', 
                                border: `2px solid ${PRIMARY_COLOR}22`, 
                                width: 'fit-content', 
                                fontWeight: 600, 
                                fontSize: 14,
                                background: 'rgba(255, 255, 255, 0.8)',
                                boxShadow: `0 4px 15px ${PRIMARY_COLOR}18`
                            }}>
                                <button 
                                    type="button" 
                                    onClick={() => handleTabSwitch(form.index, 'new')} 
                                    style={{ 
                                        padding: '10px 24px', 
                                        background: tab === 'new' ? PRIMARY_COLOR : 'transparent', 
                                        color: tab === 'new' ? '#fff' : PRIMARY_COLOR, 
                                        border: 'none', 
                                        outline: 'none', 
                                        cursor: 'pointer', 
                                        transition: 'all 0.3s ease',
                                        fontWeight: 600
                                    }}
                                >
                                    Add New
                                </button>
                                <button 
                                    type="button" 
                                    onClick={() => handleTabSwitch(form.index, 'existing')} 
                                    style={{ 
                                        padding: '10px 24px', 
                                        background: tab === 'existing' ? PRIMARY_COLOR : 'transparent', 
                                        color: tab === 'existing' ? '#fff' : PRIMARY_COLOR, 
                                        border: 'none', 
                                        outline: 'none', 
                                        cursor: 'pointer', 
                                        transition: 'all 0.3s ease',
                                        fontWeight: 600
                                    }} 
                                    disabled={eligible.length === 0}
                                >
                                    Select Existing
                                </button>
                            </div>

                            {/* Existing Member Dropdown */}
                            {tab === 'existing' && eligible.length > 0 && !formSelections[form.index]?.showManualEntry && (
                                <div className="form-group-upgraded" style={{ marginBottom: 16 }}>
                                    <label style={{ 
                                        fontWeight: 600, 
                                        color: '#333',
                                        marginBottom: 8,
                                        display: 'block'
                                    }}>
                                        Select Existing Member:
                                    </label>
                                    <select
                                        value={formSelections[form.index]?.selectedMemberId || ''}
                                        onChange={e => handleFormDropdown(form.index, e.target.value)}
                                        style={{ 
                                            width: '100%', 
                                            borderRadius: 12, 
                                            border: `2px solid ${PRIMARY_COLOR}22`, 
                                            padding: '12px 16px', 
                                            background: 'rgba(255, 255, 255, 0.9)',
                                            fontSize: 14,
                                            fontWeight: 500,
                                            transition: 'all 0.3s ease',
                                            outline: 'none'
                                        }}
                                        onFocus={(e) => {
                                            e.target.style.borderColor = PRIMARY_COLOR;
                                            e.target.style.boxShadow = `0 0 0 3px ${PRIMARY_COLOR}18`;
                                        }}
                                        onBlur={(e) => {
                                            e.target.style.borderColor = `${PRIMARY_COLOR}22`;
                                            e.target.style.boxShadow = 'none';
                                        }}
                                    >
                                        <option value="">-- Select --</option>
                                        {eligible.map(member => (
                                            <option key={member.user.id} value={member.user.id} disabled={existingMemberIds.includes(member.user.id)}>
                                                {member.user.fullName} {member.user.userProfile && member.user.userProfile.gender ? `(${member.user.userProfile.gender}${member.user.userProfile.dob ? ', ' + member.user.userProfile.dob.split('T')[0] : ''})` : ''} {existingMemberIds.includes(member.user.id) ? '(Already in tree)' : ''}
                                            </option>
                                        ))}
                                        <option value="manual">Add New Member</option>
                                    </select>
                                </div>
                            )}

                            {/* Manual entry for other types if needed */}
                            {tab === 'new' && (
                                <div className="person-form-upgraded" style={{ 
                                    background: '#f6fdf7',
                                    borderRadius: 16, 
                                    padding: 24, 
                                    marginBottom: 0, 
                                    boxShadow: `0 4px 20px ${PRIMARY_COLOR}10`,
                                    border: `1px solid ${PRIMARY_COLOR}10`
                                }}>
                                    {form.type === 'spouse' && (
                                        <h4 style={{ 
                                            marginBottom: 16, 
                                            fontWeight: 700, 
                                            fontSize: 18,
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}>
                                            💕 Spouse
                                        </h4>
                                    )}
                                    {form.type === 'person' && (
                                        <h4 style={{ 
                                            marginBottom: 16, 
                                            fontWeight: 700, 
                                            fontSize: 18,
                                            color: '#333',
                                            display: 'flex',
                                            alignItems: 'center',
                                            gap: 8
                                        }}>
                                            👤 Person {form.index + 1}
                                        </h4>
                                    )}
                                    <div className="form-row-upgraded" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                        <div className="form-group-upgraded" style={{ flex: 1 }}>
                                            <label style={{ 
                                                fontWeight: 600, 
                                                color: '#333',
                                                marginBottom: 8,
                                                display: 'block'
                                            }}>
                                                Name:
                                            </label>
                                            <input 
                                                type="text" 
                                                name={`name_${form.index}`}
                                                defaultValue={action.type === 'edit' && action.person ? action.person.name : ''}
                                                required 
                                                style={{ 
                                                    width: '100%', 
                                                    borderRadius: 12, 
                                                    border: '2px solid rgba(102, 126, 234, 0.2)', 
                                                    padding: '12px 16px', 
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                        {form.type !== 'father' && form.type !== 'mother' && (
                                            <div className="form-group-upgraded" style={{ flex: 1 }}>
                                                <label style={{ 
                                                    fontWeight: 600, 
                                                    color: '#333',
                                                    marginBottom: 8,
                                                    display: 'block'
                                                }}>
                                                    Gender:
                                                </label>
                                                <select 
                                                    name={`gender_${form.index}`} 
                                                    defaultValue={action.type === 'edit' && action.person ? action.person.gender : (action.type === 'spouse' && action.person ? (action.person.gender === 'female' ? 'male' : 'female') : 'male')}
                                                    style={{ 
                                                        width: '100%', 
                                                        borderRadius: 12, 
                                                        border: '2px solid rgba(102, 126, 234, 0.2)', 
                                                        padding: '12px 16px', 
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        transition: 'all 0.3s ease',
                                                        outline: 'none'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#667eea';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                >
                                                    <option value="male">Male</option>
                                                    <option value="female">Female</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-row-upgraded" style={{ display: 'flex', gap: 16, marginBottom: 16 }}>
                                        <div className="form-group-upgraded" style={{ flex: 1 }}>
                                            <label style={{ 
                                                fontWeight: 600, 
                                                color: '#333',
                                                marginBottom: 8,
                                                display: 'block'
                                            }}>
                                                Age:
                                            </label>
                                            <input 
                                                type="number" 
                                                name={`age_${form.index}`}
                                                min="0"
                                                defaultValue={action.type === 'edit' && action.person ? action.person.age : ''}
                                                style={{ 
                                                    width: '100%', 
                                                    borderRadius: 12, 
                                                    border: '2px solid rgba(102, 126, 234, 0.2)', 
                                                    padding: '12px 16px', 
                                                    background: 'rgba(255, 255, 255, 0.9)',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    transition: 'all 0.3s ease',
                                                    outline: 'none'
                                                }}
                                                onFocus={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                }}
                                                onBlur={(e) => {
                                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                                    e.target.style.boxShadow = 'none';
                                                }}
                                            />
                                        </div>
                                        {/* Birth Order Field for Siblings and Children */}
                                        {(action.type === 'siblings' || action.type === 'children') && (
                                            <div className="form-group-upgraded" style={{ flex: 1 }}>
                                                <label style={{ 
                                                    fontWeight: 600, 
                                                    color: '#333',
                                                    marginBottom: 8,
                                                    display: 'block'
                                                }}>
                                                    Birth Order:
                                                </label>
                                                <input 
                                                    type="number" 
                                                    name={`birthOrder_${form.index}`}
                                                    min="1"
                                                    defaultValue="1"
                                                    style={{ 
                                                        width: '100%', 
                                                        borderRadius: 12, 
                                                        border: '2px solid rgba(102, 126, 234, 0.2)', 
                                                        padding: '12px 16px', 
                                                        background: 'rgba(255, 255, 255, 0.9)',
                                                        fontSize: 14,
                                                        fontWeight: 500,
                                                        transition: 'all 0.3s ease',
                                                        outline: 'none'
                                                    }}
                                                    onFocus={(e) => {
                                                        e.target.style.borderColor = '#667eea';
                                                        e.target.style.boxShadow = '0 0 0 3px rgba(102, 126, 234, 0.1)';
                                                    }}
                                                    onBlur={(e) => {
                                                        e.target.style.borderColor = 'rgba(102, 126, 234, 0.2)';
                                                        e.target.style.boxShadow = 'none';
                                                    }}
                                                />
                                                <p style={{ 
                                                    fontSize: 12, 
                                                    color: '#666', 
                                                    marginTop: 4,
                                                    fontStyle: 'italic'
                                                }}>
                                                    Older sibling has lower number, younger sibling has higher number
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-row-upgraded" style={{ display: 'flex', gap: 16 }}>
                                        <div className="form-group-upgraded" style={{ flex: 1 }}>
                                            <label style={{ 
                                                fontWeight: 600, 
                                                color: '#333',
                                                marginBottom: 8,
                                                display: 'block'
                                            }}>
                                                Profile Image (optional):
                                            </label>
                                            <div style={{
                                                position: 'relative',
                                                display: 'inline-block',
                                                cursor: 'pointer'
                                            }}>
                                                <input 
                                                    type="file" 
                                                    accept="image/*"
                                                    onChange={(e) => handleImageUpload(e, form.index)}
                                                    style={{ 
                                                        position: 'absolute',
                                                        opacity: 0,
                                                        width: '100%',
                                                        height: '100%',
                                                        cursor: 'pointer'
                                                    }}
                                                />
                                                <div style={{
                                                    padding: '12px 20px',
                                                    borderRadius: 12,
                                                    border: '2px dashed rgba(102, 126, 234, 0.3)',
                                                    background: 'rgba(102, 126, 234, 0.05)',
                                                    display: 'flex',
                                                    alignItems: 'center',
                                                    gap: 8,
                                                    transition: 'all 0.3s ease',
                                                    fontSize: 14,
                                                    fontWeight: 500,
                                                    color: '#667eea'
                                                }}
                                                onMouseEnter={(e) => {
                                                    e.target.style.borderColor = '#667eea';
                                                    e.target.style.background = 'rgba(102, 126, 234, 0.1)';
                                                }}
                                                onMouseLeave={(e) => {
                                                    e.target.style.borderColor = 'rgba(102, 126, 234, 0.3)';
                                                    e.target.style.background = 'rgba(102, 126, 234, 0.05)';
                                                }}
                                                >
                                                    <Camera size={16} />
                                                    Choose Image
                                                </div>
                                            </div>
                                            <input 
                                                type="hidden" 
                                                name={`img_data_${form.index}`}
                                                value={imageData[form.index] || ''}
                                            />
                                        </div>
                                    </div>
                                </div>
                            )}
                        </div>
                    );})}

                    {/* Modal Footer */}
                    <div className="modal-buttons-upgraded" style={{ 
                        display: 'flex', 
                        justifyContent: 'flex-end', 
                        gap: 16, 
                        padding: '24px 0 24px 0', 
                        background: 'transparent', 
                        position: 'sticky', 
                        bottom: 0, 
                        zIndex: 2,
                        borderTop: '1px solid rgba(0, 0, 0, 0.08)',
                        marginTop: 16
                    }}>
                        <button 
                            type="button" 
                            className="btn-cancel-upgraded" 
                            style={{ 
                                background: 'rgba(0, 0, 0, 0.05)', 
                                color: '#666', 
                                borderRadius: 12, 
                                padding: '12px 24px', 
                                fontWeight: 600, 
                                border: 'none', 
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer'
                            }} 
                            onClick={onClose}
                            onMouseEnter={(e) => {
                                e.target.style.background = 'rgba(0, 0, 0, 0.1)';
                                e.target.style.color = '#333';
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.background = 'rgba(0, 0, 0, 0.05)';
                                e.target.style.color = '#666';
                            }}
                        >
                            <ArrowLeft size={16} />
                            Cancel
                        </button>
                        <button 
                            type="submit" 
                            className="btn-success-upgraded" 
                            style={{ 
                                background: PRIMARY_COLOR, 
                                color: '#fff', 
                                borderRadius: 12, 
                                padding: '12px 28px', 
                                fontWeight: 700, 
                                border: 'none', 
                                fontSize: 14,
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                transition: 'all 0.3s ease',
                                cursor: 'pointer',
                                boxShadow: `0 4px 15px ${PRIMARY_COLOR}33`
                            }}
                            onMouseEnter={(e) => {
                                e.target.style.transform = 'translateY(-2px)';
                                e.target.style.boxShadow = `0 6px 20px ${PRIMARY_COLOR}44`;
                            }}
                            onMouseLeave={(e) => {
                                e.target.style.transform = 'translateY(0)';
                                e.target.style.boxShadow = `0 4px 15px ${PRIMARY_COLOR}33`;
                            }}
                        >
                            <Save size={16} />
                            {action.type === 'edit' ? 'Save Changes' : 'Add'}
                        </button>
                    </div>
                </form>

                <style>{`
                    @keyframes modalFadeIn {
                        from { opacity: 0; }
                        to { opacity: 1; }
                    }
                    
                    @keyframes modalSlideIn {
                        from { 
                            opacity: 0; 
                            transform: scale(0.9) translateY(20px);
                        }
                        to { 
                            opacity: 1; 
                            transform: scale(1) translateY(0);
                        }
                    }
                `}</style>
            </div>
        </div>
    );
};

export default AddPersonModal; 