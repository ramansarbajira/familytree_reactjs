import React, { useState, useEffect } from 'react';
import { getTranslation } from '../../utils/languageTranslations';
import { useLanguage } from '../../Contexts/LanguageContext';
import RelationshipCalculator from '../../utils/relationshipCalculator';
import { useFamilyTreeLabels } from '../../Contexts/FamilyTreeContext';
import { updateRelationshipLabel } from '../../utils/familyTreeApi';
import Swal from 'sweetalert2';

const RelationshipDisplay = ({ tree, selectedPersonId, onPersonSelect }) => {
  const { language, changeLanguage } = useLanguage();
  const { getLabel } = useFamilyTreeLabels();
  const [relationships, setRelationships] = useState([]);
  const [hoveredPersonId, setHoveredPersonId] = useState(null);
  const [editModal, setEditModal] = useState({ open: false, code: '', current: '', newLabel: '' });
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    if (tree && selectedPersonId) {
      const calculator = new RelationshipCalculator(tree);
      const allRelationships = calculator.getAllRelationships(selectedPersonId);
      setRelationships(allRelationships);
    } else {
      setRelationships([]);
    }
  }, [tree, selectedPersonId]);

  const handleLanguageChange = (newLanguage) => {
    changeLanguage(newLanguage);
  };

  const getRelationshipText = (relationship) => {
    if (relationship.relationshipCode) {
      return getLabel(relationship.relationshipCode);
    }
    return relationship.type;
  };

  const getGenerationText = (generationDiff) => {
    if (generationDiff === 0) {
      return getTranslation('relationships.sameGeneration', language);
    } else if (generationDiff < 0) {
      return getTranslation('relationships.olderGeneration', language);
    } else {
      return getTranslation('relationships.youngerGeneration', language);
    }
  };

  const getGenderIcon = (gender) => {
    return gender === 'male' ? '👨' : '👩';
  };

  const getRelationshipColor = (generationDiff) => {
    if (generationDiff < 0) return 'text-blue-600'; // Older generation
    if (generationDiff === 0) return 'text-green-600'; // Same generation
    return 'text-purple-600'; // Younger generation
  };

  const handleEditClick = (relationship) => {
    setEditModal({
      open: true,
      code: relationship.relationshipCode,
      current: getRelationshipText(relationship),
      newLabel: getRelationshipText(relationship),
    });
  };

  const handleEditSave = async () => {
    setUpdating(true);
    try {
      await updateRelationshipLabel(editModal.code, editModal.newLabel, {}); // Add language fields as needed
      setEditModal({ open: false, code: '', current: '', newLabel: '' });
      // Optionally, trigger a refresh here
      window.location.reload();
    } catch (err) {
      Swal.fire({ icon: 'error', title: 'Update failed', text: 'Failed to update label' });
    }
    setUpdating(false);
  };

  if (!tree || !selectedPersonId) {
    return (
      <div className="bg-white rounded-lg shadow-md p-6">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-lg font-semibold text-gray-800">
            {getTranslation('relationships.relationshipTo', language)}
          </h3>
          <div className="flex space-x-2">
            <button
              onClick={() => handleLanguageChange('tamil')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                language === 'tamil' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              தமிழ்
            </button>
            <button
              onClick={() => handleLanguageChange('english')}
              className={`px-3 py-1 rounded text-sm font-medium ${
                language === 'english' 
                  ? 'bg-blue-600 text-white' 
                  : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
              }`}
            >
              English
            </button>
          </div>
        </div>
        <p className="text-gray-500 text-center py-8">
          {getTranslation('selectPersonToSeeRelationship', language)}
        </p>
      </div>
    );
  }

  const selectedPerson = tree.people.get(selectedPersonId);

  return (
    <div className="bg-white rounded-lg shadow-md p-6">
      <div className="flex items-center justify-between mb-4">
        <h3 className="text-lg font-semibold text-gray-800">
          {getTranslation('relationships.relationshipTo', language)}: {selectedPerson?.name}
        </h3>
        <div className="flex space-x-2">
          <button
            onClick={() => handleLanguageChange('tamil')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              language === 'tamil' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            தமிழ்
          </button>
          <button
            onClick={() => handleLanguageChange('english')}
            className={`px-3 py-1 rounded text-sm font-medium ${
              language === 'english' 
                ? 'bg-blue-600 text-white' 
                : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
            }`}
          >
            English
          </button>
        </div>
      </div>

      {relationships.length === 0 ? (
        <p className="text-gray-500 text-center py-8">
          {getTranslation('noRelationshipFound', language)}
        </p>
      ) : (
        <div className="space-y-3 max-h-96 overflow-y-auto">
          {relationships.map((rel) => (
            <div
              key={rel.personId}
              className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                hoveredPersonId === rel.personId
                  ? 'border-blue-400 bg-blue-50'
                  : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
              }`}
              onClick={() => onPersonSelect && onPersonSelect(rel.personId)}
              onMouseEnter={() => setHoveredPersonId(rel.personId)}
              onMouseLeave={() => setHoveredPersonId(null)}
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                  <span className="text-xl">{getGenderIcon(rel.personGender)}</span>
                  <div>
                    <p className="font-medium text-gray-800">{rel.personName}</p>
                    <p className={`text-sm font-medium ${getRelationshipColor(rel.relationship.generationDiff)}`}>
                      {getRelationshipText(rel.relationship)}
                      <button
                        className="ml-2 text-xs text-blue-600 underline"
                        onClick={e => { e.stopPropagation(); handleEditClick(rel.relationship); }}
                      >
                        Edit
                      </button>
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <p className="text-xs text-gray-500">
                    {getGenerationText(rel.relationship.generationDiff)}
                  </p>
                  {rel.relationship.generationDiff !== 0 && (
                    <p className="text-xs text-gray-400">
                      {Math.abs(rel.relationship.generationDiff)} {getTranslation('relationships.generationGap', language)}
                    </p>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
      {/* Edit Modal */}
      {editModal.open && (
        <div className="fixed inset-0 flex items-center justify-center bg-black bg-opacity-30 z-50">
          <div className="bg-white rounded-lg shadow-lg p-6 w-80">
            <h4 className="text-lg font-semibold mb-2">Edit Relationship Label</h4>
            <p className="text-sm text-gray-500 mb-2">Code: <span className="font-mono">{editModal.code}</span></p>
            <input
              className="w-full border rounded px-2 py-1 mb-4"
              value={editModal.newLabel}
              onChange={e => setEditModal(m => ({ ...m, newLabel: e.target.value }))}
              disabled={updating}
            />
            <div className="flex justify-end gap-2">
              <button
                className="px-3 py-1 bg-gray-200 rounded"
                onClick={() => setEditModal({ open: false, code: '', current: '', newLabel: '' })}
                disabled={updating}
              >Cancel</button>
              <button
                className="px-3 py-1 bg-blue-600 text-white rounded"
                onClick={handleEditSave}
                disabled={updating}
              >{updating ? 'Saving...' : 'Save'}</button>
            </div>
          </div>
        </div>
      )}

      <div className="mt-4 pt-4 border-t border-gray-200">
        <div className="flex items-center justify-between text-sm text-gray-600">
          <span>
            {getTranslation('total', language)}: <span className="font-semibold">{relationships.length}</span>
          </span>
          <span>
            {getTranslation('relationshipCalculated', language)}
          </span>
        </div>
      </div>
    </div>
  );
};

export default RelationshipDisplay; 