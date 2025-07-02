// src/Components/FamilyMemberModal.jsx
import React, { useState, useEffect } from 'react';

const FamilyMemberModal = ({ isOpen, onClose, onSave, mode, initialNodeData, selfNode }) => {
    if (!isOpen) return null;

    // State for form fields
    const [fatherName, setFatherName] = useState('');
    const [fatherPhoto, setFatherPhoto] = useState('');
    const [motherName, setMotherName] = useState('');
    const [motherPhoto, setMotherPhoto] = useState('');
    const [siblings, setSiblings] = useState([]); // Array of {name, photo, gender}
    const [spouseName, setSpouseName] = useState('');
    const [spousePhoto, setSpousePhoto] = useState('');
    const [spouseGender, setSpouseGender] = useState('Female'); // Default for spouse
    const [children, setChildren] = useState([]); // Array of {name, photo, gender}

    // For 'edit' mode or 'add-child-or-partner' for existing nodes
    const [currentName, setCurrentName] = useState('');
    const [currentPhoto, setCurrentPhoto] = useState('');
    const [currentGender, setCurrentGender] = useState('Unknown');

    useEffect(() => {
        // Pre-fill fields if editing or adding to an existing node
        if (initialNodeData) {
            setCurrentName(initialNodeData.name || '');
            setCurrentPhoto(initialNodeData.photo || '');
            setCurrentGender(initialNodeData.gender || 'Unknown');

            if (initialNodeData.attributes?.partner) {
                setSpouseName(initialNodeData.attributes.partner.name || '');
                setSpousePhoto(initialNodeData.attributes.partner.photo || '');
                setSpouseGender(initialNodeData.attributes.partner.gender || 'Female');
            }
            if (initialNodeData.children) {
                setChildren(initialNodeData.children.map(child => ({
                    name: child.name,
                    photo: child.photo,
                    gender: child.gender
                })));
            }
        }

        // If adding parents to 'Self', pre-fill 'Self's' info if needed
        if (mode === 'add-parents' && selfNode) {
            // This modal is for adding parents *to* the selfNode, so selfNode is the context
            // No need to prefill selfNode's parents, but ensure its children/spouse fields are empty
            setSpouseName('');
            setSpousePhoto('');
            setSpouseGender('Female');
            setChildren([]);
        }
    }, [initialNodeData, mode, selfNode]);

    const handleAddSibling = () => {
        setSiblings([...siblings, { name: '', photo: '', gender: 'Unknown' }]);
    };

    const handleSiblingChange = (index, field, value) => {
        const newSiblings = [...siblings];
        newSiblings[index][field] = value;
        setSiblings(newSiblings);
    };

    const handleRemoveSibling = (index) => {
        const newSiblings = [...siblings];
        newSiblings.splice(index, 1);
        setSiblings(newSiblings);
    };

    const handleAddChild = () => {
        setChildren([...children, { name: '', photo: '', gender: 'Unknown' }]);
    };

    const handleChildChange = (index, field, value) => {
        const newChildren = [...children];
        newChildren[index][field] = value;
        setChildren(newChildren);
    };

    const handleRemoveChild = (index) => {
        const newChildren = [...children];
        newChildren.splice(index, 1);
        setChildren(newChildren);
    };


    const handleSubmit = (e) => {
        e.preventDefault();
        const formData = {
            name: currentName,
            photo: currentPhoto,
            gender: currentGender,
            fatherName,
            fatherPhoto,
            motherName,
            motherPhoto,
            siblings,
            spouseName,
            spousePhoto,
            spouseGender,
            children,
        };
        onSave(formData);
    };

    const getModalTitle = () => {
        if (mode === 'add-self') return 'Tell Us About Yourself';
        if (mode === 'add-family' && initialNodeData?.attributes?.isSelf) return 'Add Your Family Members';
        if (mode === 'add-parents') return `Add Parents for ${initialNodeData?.name || 'this person'}`;
        if (mode === 'add-child-or-partner') return `Add Family for ${initialNodeData?.name || 'this person'}`;
        if (mode === 'edit') return `Edit ${initialNodeData?.name || 'Member'} Details`;
        return 'Family Member Details';
    };


    return (
        <div className="fixed inset-0 bg-gray-600 bg-opacity-50 flex items-center justify-center z-50 p-4 overflow-hidden">
            <div className="bg-white rounded-lg shadow-xl p-6 w-full max-w-md relative animate-fade-in-up overflow-hidden custom-scrollbar">
                <div className="max-h-[90vh] overflow-y-auto p-6 custom-scrollbar animate-fade-in-up">
                    <h2 className="text-2xl font-bold text-gray-800 mb-4 text-center">{getModalTitle()}</h2>
                    <form onSubmit={handleSubmit} className="space-y-4">

                        {/* Section for adding Parents (Grandparents if clicked on a parent) */}
                        {(mode === 'add-family' && initialNodeData?.attributes?.isSelf) || mode === 'add-parents' ? (
                            <div className="border p-4 rounded-md bg-blue-50">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">
                                    {mode === 'add-parents' ? `Parents of ${initialNodeData?.name}` : 'Your Parents'}
                                </h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Father's Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={fatherName}
                                        onChange={(e) => setFatherName(e.target.value)}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mt-2">Father's Photo URL</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={fatherPhoto}
                                        onChange={(e) => setFatherPhoto(e.target.value)}
                                    />
                                </div>
                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700">Mother's Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={motherName}
                                        onChange={(e) => setMotherName(e.target.value)}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mt-2">Mother's Photo URL</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={motherPhoto}
                                        onChange={(e) => setMotherPhoto(e.target.value)}
                                    />
                                </div>

                                {/* Siblings of the current person (if adding parents to self) */}
                                {mode === 'add-family' && initialNodeData?.attributes?.isSelf && (
                                    <div className="mt-4 border-t pt-4">
                                        <h3 className="text-lg font-semibold text-gray-700 mb-2">Your Siblings</h3>
                                        {siblings.map((sibling, index) => (
                                            <div key={index} className="flex items-end space-x-2 mb-2">
                                                <div className="flex-grow">
                                                    <label className="block text-xs font-medium text-gray-600">Name</label>
                                                    <input
                                                        type="text"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                        value={sibling.name}
                                                        onChange={(e) => handleSiblingChange(index, 'name', e.target.value)}
                                                    />
                                                </div>
                                                <div className="flex-grow">
                                                    <label className="block text-xs font-medium text-gray-600">Photo URL</label>
                                                    <input
                                                        type="text"
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                        value={sibling.photo}
                                                        onChange={(e) => handleSiblingChange(index, 'photo', e.target.value)}
                                                    />
                                                </div>
                                                <div>
                                                    <label className="block text-xs font-medium text-gray-600">Gender</label>
                                                    <select
                                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                        value={sibling.gender}
                                                        onChange={(e) => handleSiblingChange(index, 'gender', e.target.value)}
                                                    >
                                                        <option value="Unknown">Unknown</option>
                                                        <option value="Male">Male</option>
                                                        <option value="Female">Female</option>
                                                    </select>
                                                </div>
                                                <button type="button" onClick={() => handleRemoveSibling(index)} className="bg-red-500 text-white p-2 rounded-md text-sm">Remove</button>
                                            </div>
                                        ))}
                                        <button type="button" onClick={handleAddSibling} className="mt-2 bg-green-500 text-white px-3 py-1 rounded-md text-sm hover:bg-green-600">Add Sibling</button>
                                    </div>
                                )}
                            </div>
                        ) : null}


                        {/* Section for editing current node's details (if not adding parents) */}
                        {mode === 'edit' && (
                            <div className="border p-4 rounded-md bg-purple-50">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Edit Member Details</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={currentName}
                                        onChange={(e) => setCurrentName(e.target.value)}
                                        required
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mt-2">Photo URL</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={currentPhoto}
                                        onChange={(e) => setCurrentPhoto(e.target.value)}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mt-2">Gender</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={currentGender}
                                        onChange={(e) => setCurrentGender(e.target.value)}
                                    >
                                        <option value="Unknown">Unknown</option>
                                        <option value="Male">Male</option>
                                        <option value="Female">Female</option>
                                    </select>
                                </div>
                            </div>
                        )}


                        {/* Section for Spouse (if applicable) */}
                        {mode !== 'add-parents' && ( // Don't show spouse if adding parents to a node
                            <div className="border p-4 rounded-md bg-green-50">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Spouse Information</h3>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Spouse's Name</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={spouseName}
                                        onChange={(e) => setSpouseName(e.target.value)}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mt-2">Spouse's Photo URL</label>
                                    <input
                                        type="text"
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={spousePhoto}
                                        onChange={(e) => setSpousePhoto(e.target.value)}
                                    />
                                    <label className="block text-sm font-medium text-gray-700 mt-2">Spouse's Gender</label>
                                    <select
                                        className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 focus:ring-blue-500 focus:border-blue-500"
                                        value={spouseGender}
                                        onChange={(e) => setSpouseGender(e.target.value)}
                                    >
                                        <option value="Female">Female</option>
                                        <option value="Male">Male</option>
                                        <option value="Other">Other</option>
                                    </select>
                                </div>
                            </div>
                        )}


                        {/* Section for Children */}
                        {mode !== 'add-parents' && ( // Don't show children if adding parents to a node
                            <div className="border p-4 rounded-md bg-yellow-50">
                                <h3 className="text-lg font-semibold text-gray-700 mb-2">Children Information</h3>
                                {children.map((child, index) => (
                                    <div key={index} className="flex items-end space-x-2 mb-2">
                                        <div className="flex-grow">
                                            <label className="block text-xs font-medium text-gray-600">Name</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                value={child.name}
                                                onChange={(e) => handleChildChange(index, 'name', e.target.value)}
                                            />
                                        </div>
                                        <div className="flex-grow">
                                            <label className="block text-xs font-medium text-gray-600">Photo URL</label>
                                            <input
                                                type="text"
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                value={child.photo}
                                                onChange={(e) => handleChildChange(index, 'photo', e.target.value)}
                                            />
                                        </div>
                                        <div>
                                            <label className="block text-xs font-medium text-gray-600">Gender</label>
                                            <select
                                                className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm p-2 text-sm"
                                                value={child.gender}
                                                onChange={(e) => handleChildChange(index, 'gender', e.target.value)}
                                            >
                                                <option value="Unknown">Unknown</option>
                                                <option value="Male">Male</option>
                                                <option value="Female">Female</option>
                                            </select>
                                        </div>
                                        <button type="button" onClick={() => handleRemoveChild(index)} className="bg-red-500 text-white p-2 rounded-md text-sm">Remove</button>
                                    </div>
                                ))}
                                <button type="button" onClick={handleAddChild} className="mt-2 bg-blue-500 text-white px-3 py-1 rounded-md text-sm hover:bg-blue-600">Add Child</button>
                            </div>
                        )}


                        <div className="flex justify-end space-x-4 mt-6">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-5 py-2 bg-gray-300 text-gray-800 rounded-md hover:bg-gray-400 transition duration-200"
                            >
                                Cancel
                            </button>
                            <button
                                type="submit"
                                className="px-5 py-2 bg-primary-600 text-white rounded-md hover:bg-primary-700 transition duration-200"
                            >
                                Save Family
                            </button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
};

export default FamilyMemberModal;