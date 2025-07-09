import React, { useState, useEffect } from 'react';
import { getTranslation } from '../../utils/languageTranslations';
import { useLanguage } from '../../Contexts/LanguageContext';

const AddPersonModal = ({ isOpen, onClose, action, onAddPersons, familyCode, token, existingMemberIds = [] }) => {
    const [count, setCount] = useState(1);
    const [forms, setForms] = useState([]);
    const [imageData, setImageData] = useState({});
    const [familyMembers, setFamilyMembers] = useState([]);
    const [selectedMemberId, setSelectedMemberId] = useState(null);
    const [showManualEntry, setShowManualEntry] = useState(false);
    const [loadingMembers, setLoadingMembers] = useState(false);
    const [parentSelections, setParentSelections] = useState({ father: { selectedMemberId: null, showManualEntry: false }, mother: { selectedMemberId: null, showManualEntry: false } });
    const [formSelections, setFormSelections] = useState({});
    const { language } = useLanguage();
    
    const titles = {
        parents: getTranslation('addParents', language),
        spouse: getTranslation('addSpouse', language),
        children: getTranslation('addChild', language),
        siblings: getTranslation('addSibling', language),
        edit: getTranslation('edit', language)
    };

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
            setParentSelections({ father: { selectedMemberId: null, showManualEntry: false }, mother: { selectedMemberId: null, showManualEntry: false } });
            setFormSelections({});
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

    // Filter family members by gender and exclude already-added
    const getEligibleMembers = (form) => {
        if (!form) return [];
        let genderFilter = null;
        if (form.type === 'father') genderFilter = 'Male';
        if (form.type === 'mother') genderFilter = 'Female';
        if (form.type === 'spouse' && action.person) genderFilter = action.person.gender === 'male' ? 'Female' : 'Male';
        // For children/siblings, allow both genders
        return familyMembers.filter(m => {
            const g = m.user?.userProfile?.gender;
            const id = m.user?.id;
            if (existingMemberIds.includes(id)) return false;
            if (genderFilter && g !== genderFilter) return false;
            return true;
        });
    };

    const handleImageUpload = (event, index) => {
        const file = event.target.files[0];
        if (!file) return;
        
        const reader = new FileReader();
        reader.onload = (e) => {
            setImageData(prev => ({
                ...prev,
                [index]: e.target.result
            }));
        };
        reader.readAsDataURL(file);
    };

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
        // Special handling for parents: handle both father and mother
        if (action.type === 'parents') {
            const parentForms = forms.filter(f => f.type === 'father' || f.type === 'mother');
            const parentPersons = [];
            parentForms.forEach(form => {
                const sel = parentSelections[form.type];
                if (sel && sel.selectedMemberId && !sel.showManualEntry) {
                    // Existing member
                    const member = familyMembers.find(m => m.user?.id === parseInt(sel.selectedMemberId));
                    if (member) {
                        parentPersons.push({
                            name: member.user.fullName,
                            gender: member.user.userProfile.gender === 'Male' ? 'male' : 'female',
                            age: member.user.userProfile.dob ? (new Date().getFullYear() - new Date(member.user.userProfile.dob).getFullYear()) : '',
                            img: member.user.profileImage,
                            dob: member.user.userProfile.dob,
                            memberId: member.user.id,
                        });
                    }
                } else if (sel && sel.showManualEntry) {
                    // Manual entry
                    const formData = new FormData(e.target);
                    const name = formData.get(`name_${form.index}`);
                    if (!name) return;
                    parentPersons.push({
                        name: name.trim(),
                        gender: form.gender,
                        age: formData.get(`age_${form.index}`),
                        img: imageData[form.index] || '',
                        generation: action.person.generation - 1,
                    });
                }
            });
            onAddPersons(parentPersons);
            onClose();
            return;
        }
        // For other types: spouse, child, sibling, etc.
        const formData = new FormData(e.target);
        const persons = [];
        forms.forEach(form => {
            const sel = formSelections[form.index] || {};
            if (sel.selectedMemberId && !sel.showManualEntry) {
                // Existing member
                const member = familyMembers.find(m => m.user?.id === parseInt(sel.selectedMemberId));
                if (member) {
                    persons.push({
                        name: member.user.fullName,
                        gender: member.user.userProfile.gender === 'Male' ? 'male' : 'female',
                        age: member.user.userProfile.dob ? (new Date().getFullYear() - new Date(member.user.userProfile.dob).getFullYear()) : '',
                        img: member.user.profileImage,
                        dob: member.user.userProfile.dob,
                        memberId: member.user.id,
                    });
                }
            } else {
                // Manual entry
                const name = formData.get(`name_${form.index}`);
                if (!name) return;
                let generation, gender;
                if (action.type === 'children') {
                    generation = action.person.generation + 1;
                    gender = formData.get(`gender_${form.index}`);
                } else if (action.type === 'siblings') {
                    generation = action.person.generation;
                    gender = formData.get(`gender_${form.index}`);
                } else if (action.type === 'spouse') {
                    generation = action.person.generation;
                    gender = formData.get(`gender_0`);
                } else if (action.type === 'edit') {
                    generation = action.person.generation;
                    gender = formData.get(`gender_0`);
                }
                persons.push({
                    name: name.trim(),
                    gender: gender || 'male',
                    age: formData.get(`age_${form.index}`),
                    generation,
                    img: imageData[form.index] || '',
                });
            }
        });
        onAddPersons(persons);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="modal show" style={{ position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh', background: 'rgba(30,30,40,0.32)', zIndex: 1000, display: 'flex', alignItems: 'center', justifyContent: 'center' }} onClick={onClose}>
            <div className="modal-content" style={{ position: 'relative', background: '#fff', borderRadius: 18, boxShadow: '0 8px 32px rgba(60,60,90,0.18)', maxWidth: 420, width: '95vw', maxHeight: '90vh', display: 'flex', flexDirection: 'column', padding: 0 }} onClick={(e) => e.stopPropagation()}>
                {/* Modal Header */}
                <div style={{ padding: '24px 32px 12px 32px', borderBottom: '1px solid #f3f4f6', display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                    <h3 className="modal-title" style={{ fontSize: 22, fontWeight: 700, margin: 0 }}>{titles[action.type] || 'Add Person'}</h3>
                    <button onClick={onClose} style={{ background: 'none', border: 'none', fontSize: 22, cursor: 'pointer', color: '#888', marginLeft: 12, lineHeight: 1 }} aria-label="Close">×</button>
                </div>
                {/* Modal Body (Scrollable) */}
                <form onSubmit={handleSubmit} style={{ flex: 1, overflow: 'auto', padding: '18px 32px 0 32px' }}>
                    {/* For parents, show two dropdowns/manuals: father and mother */}
                    {action.type === 'parents' && forms.map((form) => (
                        <div key={form.index} style={{ marginBottom: 18 }}>
                            {getEligibleMembers(form).length > 0 && !(parentSelections[form.type]?.showManualEntry) && (
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label style={{ fontWeight: 500 }}>Select Existing {form.type === 'father' ? 'Father' : 'Mother'}:</label>
                                    <select
                                        value={parentSelections[form.type]?.selectedMemberId || ''}
                                        onChange={e => handleParentDropdown(form.type, e.target.value)}
                                        style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: 4 }}
                                    >
                                        <option value="">-- Select --</option>
                                        {getEligibleMembers(form).map(member => (
                                            <option key={member.user.id} value={member.user.id}>
                                                {member.user.fullName} ({member.user.userProfile.gender}, {member.user.userProfile.dob?.split('T')[0]})
                                            </option>
                                        ))}
                                        <option value="manual">Add New Member</option>
                                    </select>
                                </div>
                            )}
                            {/* Manual entry for parent if needed */}
                            {(parentSelections[form.type]?.showManualEntry || getEligibleMembers(form).length === 0) && (
                                <div className="person-form" style={{ background: '#f9fafb', borderRadius: 12, padding: 18, marginBottom: 0, boxShadow: '0 1px 4px rgba(60,60,90,0.06)' }}>
                                    <h4 style={{ marginBottom: 12, fontWeight: 600, fontSize: 17 }}>{form.type === 'father' ? 'Father' : 'Mother'}</h4>
                                    <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ fontWeight: 500 }}>{getTranslation('name', language)}:</label>
                                            <input 
                                                type="text" 
                                                name={`name_${form.index}`}
                                                required 
                                                style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: 4 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ fontWeight: 500 }}>{getTranslation('age', language)}:</label>
                                            <input 
                                                type="number" 
                                                name={`age_${form.index}`}
                                                min="0"
                                                style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: 4 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{ display: 'flex', gap: 16 }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ fontWeight: 500 }}>Profile Image (optional):</label>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, form.index)}
                                                style={{ marginTop: 4 }}
                                            />
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
                    ))}
                    {/* For other types: spouse, child, sibling, etc. */}
                    {action.type !== 'parents' && forms.map((form) => (
                        <div key={form.index} style={{ marginBottom: 18 }}>
                            {getEligibleMembers(form).length > 0 && !(formSelections[form.index]?.showManualEntry) && (
                                <div className="form-group" style={{ marginBottom: 12 }}>
                                    <label style={{ fontWeight: 500 }}>{getTranslation('selectExistingMember', language)}:</label>
                                    <select
                                        value={formSelections[form.index]?.selectedMemberId || ''}
                                        onChange={e => handleFormDropdown(form.index, e.target.value)}
                                        style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: 4 }}
                                    >
                                        <option value="">-- Select --</option>
                                        {getEligibleMembers(form).map(member => (
                                            <option key={member.user.id} value={member.user.id}>
                                                {member.user.fullName} ({member.user.userProfile.gender}, {member.user.userProfile.dob?.split('T')[0]})
                                            </option>
                                        ))}
                                        <option value="manual">{getTranslation('addNewMember', language)}</option>
                                    </select>
                                </div>
                            )}
                            {/* Manual entry for other types if needed */}
                            {(formSelections[form.index]?.showManualEntry || getEligibleMembers(form).length === 0) && (
                                <div className="person-form" style={{ background: '#f9fafb', borderRadius: 12, padding: 18, marginBottom: 0, boxShadow: '0 1px 4px rgba(60,60,90,0.06)' }}>
                                    {form.type === 'spouse' && <h4 style={{ marginBottom: 12, fontWeight: 600, fontSize: 17 }}>Spouse</h4>}
                                    {form.type === 'person' && <h4 style={{ marginBottom: 12, fontWeight: 600, fontSize: 17 }}>Person {form.index + 1}</h4>}
                                    <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ fontWeight: 500 }}>{getTranslation('name', language)}:</label>
                                            <input 
                                                type="text" 
                                                name={`name_${form.index}`}
                                                defaultValue={action.type === 'edit' ? action.person.name : ''}
                                                required 
                                                style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: 4 }}
                                            />
                                        </div>
                                        {form.type !== 'father' && form.type !== 'mother' && (
                                            <div className="form-group" style={{ flex: 1 }}>
                                                <label style={{ fontWeight: 500 }}>{getTranslation('gender', language)}:</label>
                                                <select name={`gender_${form.index}`} style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: 4 }}>
                                                    <option value="male" selected={action.type === 'spouse' && action.person.gender === 'female'}>{getTranslation('male', language)}</option>
                                                    <option value="female" selected={action.type === 'spouse' && action.person.gender === 'male'}>{getTranslation('female', language)}</option>
                                                </select>
                                            </div>
                                        )}
                                    </div>
                                    <div className="form-row" style={{ display: 'flex', gap: 16, marginBottom: 12 }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ fontWeight: 500 }}>{getTranslation('age', language)}:</label>
                                            <input 
                                                type="number" 
                                                name={`age_${form.index}`}
                                                min="0"
                                                defaultValue={action.type === 'edit' ? action.person.age : ''}
                                                style={{ width: '100%', borderRadius: 8, border: '1px solid #e5e7eb', padding: '8px 12px', marginTop: 4 }}
                                            />
                                        </div>
                                    </div>
                                    <div className="form-row" style={{ display: 'flex', gap: 16 }}>
                                        <div className="form-group" style={{ flex: 1 }}>
                                            <label style={{ fontWeight: 500 }}>Profile Image (optional):</label>
                                            <input 
                                                type="file" 
                                                accept="image/*"
                                                onChange={(e) => handleImageUpload(e, form.index)}
                                                style={{ marginTop: 4 }}
                                            />
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
                    ))}
                    {/* Modal Footer */}
                    <div className="modal-buttons" style={{ display: 'flex', justifyContent: 'flex-end', gap: 12, padding: '18px 0 18px 0', background: 'transparent', position: 'sticky', bottom: 0, zIndex: 2 }}>
                        <button type="button" className="btn btn-cancel" style={{ background: '#e5e7eb', color: '#333', borderRadius: 8, padding: '8px 22px', fontWeight: 600, border: 'none', fontSize: 16 }} onClick={onClose}>
                            Cancel
                        </button>
                        <button type="submit" className="btn btn-success" style={{ background: '#22c55e', color: '#fff', borderRadius: 8, padding: '8px 28px', fontWeight: 700, border: 'none', fontSize: 16 }}>
                            {action.type === 'edit' ? 'Save Changes' : 'Add'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddPersonModal; 