import React, { useState, useEffect } from 'react';
import Layout from '../Components/Layout';
import { FaEdit, FaPlus, FaUser, FaUserFriends, FaVenus, FaMars } from 'react-icons/fa';
import { useUser } from '../Contexts/UserContext';

const ProfessionalFamilyTree = () => {
  const { userInfo } = useUser();
  const [treeData, setTreeData] = useState(null);
  const [selectedNode, setSelectedNode] = useState(null);
  const [isEditMode, setIsEditMode] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    gender: 'male',
    relation: 'self'
  });

  // Initialize tree with current user
  useEffect(() => {
    if (!treeData && userInfo) {
      setTreeData({
        id: 1,
        name: userInfo.name || 'You',
        gender: userInfo.gender || 'male',
        relation: 'self',
        image: userInfo.profileImage || `https://randomuser.me/api/portraits/${userInfo.gender === 'female' ? 'women' : 'men'}/1.jpg`,
        spouse: null,
        parents: [],
        children: []
      });
    }
  }, [userInfo, treeData]);

  const handleNodeClick = (node) => {
    setSelectedNode(node);
    setIsEditMode(false);
    setFormData({
      name: node.name,
      gender: node.gender,
      relation: node.relation
    });
  };

  const handleAddRelative = (relation) => {
    setFormData({
      name: '',
      gender: relation === 'spouse' 
        ? (selectedNode.gender === 'male' ? 'female' : 'male')
        : 'male',
      relation
    });
    setIsEditMode(true);
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    
    const newMember = {
      id: Date.now(),
      name: formData.name,
      gender: formData.gender,
      relation: formData.relation,
      image: `https://randomuser.me/api/portraits/${formData.gender === 'female' ? 'women' : 'men'}/${Math.floor(Math.random() * 100)}.jpg`,
      spouse: null,
      parents: [],
      children: []
    };

    let updatedTree;
    if (formData.relation === 'spouse') {
      updatedTree = {
        ...selectedNode,
        spouse: newMember
      };
    } else if (formData.relation === 'child') {
      updatedTree = {
        ...selectedNode,
        children: [...(selectedNode.children || []), newMember]
      };
    } else if (formData.relation === 'parent') {
      updatedTree = {
        ...newMember,
        children: [selectedNode]
      };
    }

    setTreeData(updatedTree);
    setSelectedNode(null);
  };

  const renderNode = (node, isRoot = false) => {
    return (
      <div className={`flex flex-col items-center ${isRoot ? 'mt-8' : ''}`}>
        {/* Node Card */}
        <div 
          className={`relative p-4 rounded-lg shadow-md w-40 text-center cursor-pointer
            ${node.gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200'}
            ${node.relation === 'self' ? 'border-2 border-yellow-400' : 'border'}
            hover:shadow-lg transition-shadow`}
          onClick={() => handleNodeClick(node)}
        >
          <img 
            src={node.image} 
            alt={node.name}
            className="w-16 h-16 rounded-full mx-auto mb-2 object-cover border-2 border-white shadow-sm"
          />
          <h3 className="font-medium text-sm truncate">{node.name}</h3>
          <div className="flex justify-center mt-1">
            {node.gender === 'male' ? (
              <FaMars className="text-blue-500" />
            ) : (
              <FaVenus className="text-pink-500" />
            )}
          </div>
        </div>

        {/* Spouse */}
        {node.spouse && (
          <div className="flex items-center justify-center my-2">
            <div className="h-px w-8 bg-gray-300 relative">
              <div className="absolute -right-1 -top-1 text-xs text-pink-500">❤</div>
            </div>
            <div 
              className={`ml-4 p-3 rounded-lg shadow-md w-36 text-center cursor-pointer
                ${node.spouse.gender === 'male' ? 'bg-blue-50 border-blue-200' : 'bg-pink-50 border-pink-200'}
                border hover:shadow-lg transition-shadow`}
              onClick={() => handleNodeClick(node.spouse)}
            >
              <img 
                src={node.spouse.image} 
                alt={node.spouse.name}
                className="w-12 h-12 rounded-full mx-auto mb-1 object-cover border-2 border-white shadow-sm"
              />
              <h3 className="font-medium text-xs truncate">{node.spouse.name}</h3>
            </div>
          </div>
        )}

        {/* Children */}
        {node.children && node.children.length > 0 && (
          <div className="mt-4">
            <div className="h-6 w-px bg-gray-400 mx-auto"></div>
            <div className="flex justify-center space-x-4 pt-4">
              {node.children.map((child, index) => (
                <div key={index} className="flex flex-col items-center">
                  {renderNode(child)}
                </div>
              ))}
            </div>
          </div>
        )}
      </div>
    );
  };

  return (
    <Layout activeTab="familyTree">
      <div className="min-h-screen bg-gradient-to-b from-gray-50 to-gray-100 p-4">
        <div className="max-w-6xl mx-auto">
          <h1 className="text-3xl font-bold text-gray-800 mb-6">Family Tree</h1>
          
          {treeData ? (
            <div className="bg-white rounded-xl shadow-lg p-6 overflow-x-auto">
              <div className="min-w-max mx-auto">
                {renderNode(treeData, true)}
              </div>
            </div>
          ) : (
            <div className="bg-white rounded-xl shadow-lg p-8 text-center">
              <p className="text-gray-600 mb-4">No family tree created yet</p>
              <button
                onClick={() => setTreeData({
                  id: 1,
                  name: userInfo.name || 'You',
                  gender: userInfo.gender || 'male',
                  relation: 'self',
                  image: userInfo.profileImage || `https://randomuser.me/api/portraits/${userInfo.gender === 'female' ? 'women' : 'men'}/1.jpg`,
                  spouse: null,
                  parents: [],
                  children: []
                })}
                className="bg-blue-600 text-white px-6 py-2 rounded-lg hover:bg-blue-700"
              >
                Start Your Family Tree
              </button>
            </div>
          )}

          {/* Node Details Modal */}
          {selectedNode && (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
              <div className="bg-white rounded-xl shadow-xl p-6 w-full max-w-md">
                <div className="flex justify-between items-center mb-4">
                  <h2 className="text-xl font-bold text-gray-800">
                    {isEditMode ? 'Add Family Member' : selectedNode.name}
                  </h2>
                  <button
                    onClick={() => setSelectedNode(null)}
                    className="text-gray-500 hover:text-gray-700 text-xl"
                  >
                    &times;
                  </button>
                </div>

                {isEditMode ? (
                  <form onSubmit={handleSubmit} className="space-y-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                      <input
                        type="text"
                        value={formData.name}
                        onChange={(e) => setFormData({...formData, name: e.target.value})}
                        className="w-full p-2 border rounded-md"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Gender</label>
                      <select
                        value={formData.gender}
                        onChange={(e) => setFormData({...formData, gender: e.target.value})}
                        className="w-full p-2 border rounded-md"
                      >
                        <option value="male">Male</option>
                        <option value="female">Female</option>
                      </select>
                    </div>

                    <div className="flex justify-end space-x-3 pt-4">
                      <button
                        type="button"
                        onClick={() => setIsEditMode(false)}
                        className="px-4 py-2 border rounded-md"
                      >
                        Cancel
                      </button>
                      <button
                        type="submit"
                        className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
                      >
                        Save
                      </button>
                    </div>
                  </form>
                ) : (
                  <>
                    <div className="flex justify-center mb-4">
                      <img 
                        src={selectedNode.image} 
                        alt={selectedNode.name}
                        className="w-24 h-24 rounded-full object-cover border-4 border-white shadow-md"
                      />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-6">
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Relationship</p>
                        <p className="font-medium capitalize">{selectedNode.relation}</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-500">Gender</p>
                        <p className="font-medium capitalize">{selectedNode.gender}</p>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4">
                      <button
                        onClick={() => handleAddRelative('spouse')}
                        disabled={selectedNode.spouse}
                        className={`flex items-center justify-center p-3 rounded-lg ${selectedNode.spouse ? 'bg-gray-100 text-gray-400' : 'bg-blue-50 text-blue-600 hover:bg-blue-100'}`}
                      >
                        <FaUserFriends className="mr-2" />
                        Add Spouse
                      </button>
                      <button
                        onClick={() => handleAddRelative('child')}
                        className="flex items-center justify-center p-3 bg-green-50 text-green-600 rounded-lg hover:bg-green-100"
                      >
                        <FaPlus className="mr-2" />
                        Add Child
                      </button>
                      <button
                        onClick={() => handleAddRelative('parent')}
                        className="flex items-center justify-center p-3 bg-purple-50 text-purple-600 rounded-lg hover:bg-purple-100"
                      >
                        <FaUser className="mr-2" />
                        Add Parent
                      </button>
                      <button
                        onClick={() => setIsEditMode(true)}
                        className="flex items-center justify-center p-3 bg-yellow-50 text-yellow-600 rounded-lg hover:bg-yellow-100"
                      >
                        <FaEdit className="mr-2" />
                        Edit
                      </button>
                    </div>
                  </>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </Layout>
  );
};

export default ProfessionalFamilyTree;