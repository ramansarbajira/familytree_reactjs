import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext';
import { FamilyTree } from '../utils/FamilyTree';
import { autoArrange } from '../utils/TreeLayout';
import Person from '../Components/FamilyTree/Person';
import TreeConnections from '../Components/FamilyTree/TreeConnections';
import RadialMenu from '../Components/FamilyTree/RadialMenu';
import AddPersonModal from '../Components/FamilyTree/AddPersonModal';
import html2canvas from 'html2canvas';

const sampleFamilyData = {
    people: [
        { id: 1, name: 'John', gender: 'male', age: 60, generation: 1, parents: [], children: [3,4], spouses: [2], siblings: [] },
        { id: 2, name: 'Mary', gender: 'female', age: 58, generation: 1, parents: [], children: [3,4], spouses: [1], siblings: [] },
        { id: 3, name: 'Alice', gender: 'female', age: 35, generation: 2, parents: [1,2], children: [5], spouses: [4], siblings: [4] },
        { id: 4, name: 'Bob', gender: 'male', age: 37, generation: 2, parents: [1,2], children: [5], spouses: [3], siblings: [3] },
        { id: 5, name: 'Charlie', gender: 'male', age: 10, generation: 3, parents: [3,4], children: [], spouses: [], siblings: [] },
    ]
};

// Utility for authenticated fetch with logout on 401 or error
const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    const headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
        'Content-Type': 'application/json',
    };
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
            return null;
        }
        return response;
    } catch (err) {
        localStorage.removeItem('access_token');
        window.location.href = '/login';
        return null;
    }
};

const FamilyTreePage = () => {
const [tree, setTree] = useState(null);
    const [stats, setStats] = useState({ total: 1, male: 1, female: 0, generations: 1 });
    const [dagreGraph, setDagreGraph] = useState(null);
    const [dagreLayoutOffsetX, setDagreLayoutOffsetX] = useState(0);
    const [dagreLayoutOffsetY, setDagreLayoutOffsetY] = useState(0);
    const [radialMenu, setRadialMenu] = useState({
        isActive: false,
        position: { x: 0, y: 0 },
        items: [],
        activePersonId: null
    });
    const [modal, setModal] = useState({
        isOpen: false,
        action: { type: '', person: null }
    });
    const [debugPanel, setDebugPanel] = useState(false);
    const containerRef = useRef(null);
    const [saveStatus, setSaveStatus] = useState('idle'); // idle | loading | success | error
    const [saveMessage, setSaveMessage] = useState('');
    const { userInfo } = useUser();

    // Initialize tree (now with API/sample data support)
    useEffect(() => {
        const initializeTree = async () => {
            // For now, load sample data. In future, this will be replaced with API call
            const fetchFamilyDataFromApi = async () => {
                // Simulate API delay
                await new Promise(resolve => setTimeout(resolve, 100));
                // Return sample data for now
                return sampleFamilyData;
            };

            let data = await fetchFamilyDataFromApi();
            if (!data || !data.people || data.people.length === 0) {
                // No data, create new tree with logged-in user as root
                if (!userInfo) return; // Wait for userInfo to load
                const newTree = new FamilyTree();
                newTree.addPerson({
                    name: userInfo.name,
                    gender: userInfo.gender,
                    age: userInfo.age,
                    img: userInfo.profileUrl,
                    dob: userInfo.dob,
                    memberId: userInfo.userId, // Ensure root has userId
                });
                setTree(newTree);
                updateStats(newTree);
                arrangeTree(newTree);
            } else {
                // Data exists, build tree from data
                const newTree = new FamilyTree();
                newTree.people = new Map();
                data.people.forEach(person => {
                    newTree.people.set(person.id, {
                        ...person,
                        parents: new Set(person.parents),
                        children: new Set(person.children),
                        spouses: new Set(person.spouses),
                        siblings: new Set(person.siblings)
                    });
                });
                newTree.nextId = Math.max(...data.people.map(p => p.id)) + 1;
                newTree.rootId = data.people[0].id;
                setTree(newTree);
                updateStats(newTree);
                arrangeTree(newTree);
            }
        };
        if (userInfo) initializeTree();
    }, [userInfo]);

    const updateStats = (treeInstance) => {
        setStats(treeInstance.getStats());
    };

    const arrangeTree = (treeInstance) => {
        const layout = autoArrange(treeInstance);
        if (layout) {
            setDagreGraph(layout.g);
            setDagreLayoutOffsetX(layout.dagreLayoutOffsetX);
            setDagreLayoutOffsetY(layout.dagreLayoutOffsetY);
        }
        setTree(treeInstance);
    };

    const handlePersonClick = (personId) => {
        if (!tree) return;
        const person = tree.people.get(personId);
        if (!person) return;

        const icons = {
            'Add Parents': `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4zM20 10h-2V8h-2v2h-2v2h2v2h2v-2h2v-2z"/></svg>`,
            'Add Spouse': `<svg viewBox="0 0 24 24"><path d="M12 12c2.21 0 4-1.79 4-4s-1.79-4-4-4-4 1.79-4 4 1.79 4 4 4zm0 2c-2.67 0-8 1.34-8 4v2h16v-2c0-2.66-5.33-4-8-4z"/></svg>`,
            'Add Child': `<svg viewBox="0 0 24 24"><path d="M19 13h-6v6h-2v-6H5v-2h6V5h2v6h6v2z"/></svg>`,
            'Add Sibling': `<svg viewBox="0 0 24 24"><path d="M15.5 14h-.79l-.28-.27A6.471 6.471 0 0016 9.5 6.5 6.5 0 109.5 16c1.61 0 3.09-.59 4.23-1.57l.27.28v.79l5 4.99L20.49 19l-4.99-5zm-6 0C7.01 14 5 11.99 5 9.5S7.01 5 9.5 5 14 7.01 14 9.5 11.99 14 9.5 14zM12 10h-2v2H8v-2H6V8h2V6h2v2h2v2z"/></svg>`,
            'Edit': `<svg viewBox="0 0 24 24"><path d="M3 17.25V21h3.75L17.81 9.94l-3.75-3.75L3 17.25zM20.71 7.04c.39-.39.39-1.02 0-1.41l-2.34-2.34a.9959.9959 0 00-1.41 0l-1.83 1.83 3.75 3.75 1.83-1.83z"/></svg>`,
            'Delete': `<svg viewBox="0 0 24 24"><path d="M6 19c0 1.1.9 2 2 2h8c1.1 0 2-.9 2-2V7H6v12zM19 4h-3.5l-1-1h-5l-1 1H5v2h14V4z"/></svg>`
        };

        const items = [];
        if (person.parents.size === 0) {
            items.push({ 
                label: 'Add Parents', 
                action: () => setModal({ isOpen: true, action: { type: 'parents', person } }),
                icon: icons['Add Parents'] 
            });
        }
        items.push({ 
            label: 'Add Spouse', 
            action: () => setModal({ isOpen: true, action: { type: 'spouse', person } }),
            icon: icons['Add Spouse'] 
        });
        items.push({ 
            label: 'Add Child', 
            action: () => setModal({ isOpen: true, action: { type: 'children', person } }),
            icon: icons['Add Child'] 
        });
        if (person.parents.size > 0) {
            items.push({ 
                label: 'Add Sibling', 
                action: () => setModal({ isOpen: true, action: { type: 'siblings', person } }),
                icon: icons['Add Sibling'] 
            });
        }
        items.push({ 
            label: 'Edit', 
            action: () => setModal({ isOpen: true, action: { type: 'edit', person } }),
            icon: icons['Edit'] 
        });
        if (person.id !== tree?.rootId) {
            items.push({ 
                label: 'Delete', 
                action: () => deletePerson(personId),
                icon: icons['Delete'] 
            });
        }

        // Calculate position for radial menu
        const personElement = document.querySelector(`[data-person-id="${personId}"]`);
        if (personElement) {
            const rect = personElement.getBoundingClientRect();
            setRadialMenu({
                isActive: true,
                position: {
                    x: rect.left + rect.width / 2 + window.scrollX,
                    y: rect.top + rect.height / 2 + window.scrollY
                },
                items,
                activePersonId: personId
            });
        }
    };

    const handleRadialMenuItemClick = (item) => {
        item.action();
    };

    const handleAddPersons = (persons) => {
        if (!tree) return;
        const newTree = new FamilyTree();
        newTree.people = new Map(tree.people);
        newTree.nextId = tree.nextId;
        newTree.rootId = tree.rootId;

        const newPersons = [];
        persons.forEach(personData => {
            // If personData has memberId or userId, store it in the tree
            // For dropdown, memberId should be member.user.id
            const person = newTree.addPerson({
                ...personData,
                memberId: personData.memberId || personData.userId || null,
            });
            newPersons.push(person);
        });

        // Add relationships based on action type
        const { type, person: basePerson } = modal.action;
        
        if (type === 'parents') {
            newPersons.forEach(person => {
                newTree.addRelation(person.id, basePerson.id, 'parent-child');
            });
            if (newPersons.length === 2) {
                newTree.addRelation(newPersons[0].id, newPersons[1].id, 'spouse');
            }
        } else if (type === 'children') {
            newPersons.forEach(person => {
                newTree.addRelation(basePerson.id, person.id, 'parent-child');
                basePerson.spouses.forEach(spouseId => {
                    newTree.addRelation(spouseId, person.id, 'parent-child');
                });
            });
        } else if (type === 'spouse') {
            newTree.addRelation(basePerson.id, newPersons[0].id, 'spouse');
        } else if (type === 'siblings') {
            newPersons.forEach(person => {
                basePerson.parents.forEach(parentId => {
                    newTree.addRelation(parentId, person.id, 'parent-child');
                });
            });
        } else if (type === 'edit') {
            // Update existing person
            const existingPerson = newTree.people.get(basePerson.id);
            if (existingPerson) {
                existingPerson.name = persons[0].name;
                existingPerson.gender = persons[0].gender;
                existingPerson.age = persons[0].age;
                existingPerson.img = persons[0].img;
                existingPerson.memberId = persons[0].memberId || persons[0].userId || null;
            }
        }

        setTree(newTree);
        updateStats(newTree);
        arrangeTree(newTree);
    };

    const deletePerson = (personId) => {
        if (!tree) return;
        if (personId === tree.rootId) {
            alert("Cannot delete the root person.");
            return;
        }

        if (window.confirm("Are you sure you want to delete this person and all their connections? This cannot be undone.")) {
            const newTree = new FamilyTree();
            newTree.people = new Map(tree.people);
            newTree.nextId = tree.nextId;
            newTree.rootId = tree.rootId;

            const personToDelete = newTree.people.get(personId);
            if (!personToDelete) return;
            
            const relatives = new Set([...personToDelete.parents, ...personToDelete.children, ...personToDelete.spouses, ...personToDelete.siblings]);

            relatives.forEach(relId => {
                const relative = newTree.people.get(relId);
                if(relative){
                    relative.parents.delete(personId);
                    relative.children.delete(personId);
                    relative.spouses.delete(personId);
                    relative.siblings.delete(personId);
                }
            });

            newTree.people.delete(personId);
            
            setTree(newTree);
            updateStats(newTree);
            arrangeTree(newTree);
        }
    };

    const resetTree = () => {
        if (window.confirm('Are you sure you want to start a new tree? All current data will be lost.')) {
            const newTree = new FamilyTree();
            newTree.addPerson({
                name: userInfo.name,
                gender: userInfo.gender,
                age: userInfo.age,
                img: userInfo.profileUrl,
                dob: userInfo.dob,
                memberId: userInfo.userId
            });
            setTree(newTree);
            updateStats(newTree);
            arrangeTree(newTree);
        }
    };

    const downloadTreeData = async () => {
        // Download the tree as an image (PNG)
        const treeCanvas = document.querySelector('.tree-canvas');
        if (!treeCanvas) return;
        const canvas = await html2canvas(treeCanvas, { backgroundColor: null });
        const image = canvas.toDataURL('image/png');
        const a = document.createElement('a');
        a.href = image;
        a.download = 'family-tree.png';
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
    };

    const useAdvancedAlgorithms = () => {
        alert('Advanced algorithms feature is available in the React version!');
    };

    const centerTreeInView = () => {
        if (!containerRef.current) return;
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        tree.people.forEach(person => {
            const personSize = 100;
            minX = Math.min(minX, person.x - personSize / 2);
            minY = Math.min(minY, person.y - personSize / 2);
            maxX = Math.max(maxX, person.x + personSize / 2);
            maxY = Math.max(maxY, person.y + personSize / 2);
        });
        
        const treeWidth = maxX - minX;
        // const treeHeight = maxY - minY; // Not needed for top alignment
        
        // Center horizontally, align to top vertically
        containerRef.current.scrollLeft = (minX + treeWidth / 2) - containerRef.current.clientWidth / 2;
        containerRef.current.scrollTop = 0; // Always scroll to top
    };

    useEffect(() => {
        if (tree && tree.people.size > 0) {
            centerTreeInView();
        }
    }, [tree]);

    // Recalculate radial menu position on scroll/resize if open
    useEffect(() => {
        if (!radialMenu.isActive || !radialMenu.activePersonId) return;
        function updateMenuPosition() {
            const personElement = document.querySelector(`[data-person-id="${radialMenu.activePersonId}"]`);
            if (personElement) {
                const rect = personElement.getBoundingClientRect();
                setRadialMenu(prev => ({
                    ...prev,
                    position: {
                        x: rect.left + rect.width / 2 + window.scrollX,
                        y: rect.top + rect.height / 2 + window.scrollY
                    }
                }));
            }
        }
        window.addEventListener('scroll', updateMenuPosition, true);
        window.addEventListener('resize', updateMenuPosition);
        return () => {
            window.removeEventListener('scroll', updateMenuPosition, true);
            window.removeEventListener('resize', updateMenuPosition);
        };
    }, [radialMenu.isActive, radialMenu.activePersonId]);

    const saveTreeToApi = async () => {
        if (!tree) return;
        setSaveStatus('loading');
        setSaveMessage('');
        try {
            const people = Array.from(tree.people.values()).map(person => ({
                id: person.id,
                name: person.name,
                gender: person.gender,
                age: person.age,
                img: person.img,
                generation: person.generation,
                parents: Array.from(person.parents),
                children: Array.from(person.children),
                spouses: Array.from(person.spouses),
                siblings: Array.from(person.siblings),
                userId: person.memberId || null,
            }));
            const response = await authFetch('/api/family-tree/save', {
                method: 'POST',
                body: JSON.stringify({ people })
            });
            if (!response) return; // Already logged out if 401 or error
            if (!response.ok) throw new Error('Failed to save');
            setSaveStatus('success');
            setSaveMessage('Family tree saved successfully!');
        } catch (err) {
            setSaveStatus('error');
            setSaveMessage('Failed to save family tree.');
        }
    };

    return (
      <Layout>
        <div className="mx-auto px-4 py-8 space-y-8">
            {/* Section Header */}
            {/* <div className="bg-white rounded-2xl shadow p-6 flex flex-col md:flex-row md:items-center md:justify-between mb-6">
                <div>
                    <h1 className="text-3xl font-bold text-gray-900 mb-1">Family Tree</h1>
                    <p className="text-gray-600">Visualize and manage your family connections.</p>
                </div>
            </div> */}

            {/* Controls and Stats */}
            <div className="flex flex-col md:flex-row justify-between items-center gap-6 mb-3 sticky top-0 z-20 bg-white shadow border-b border-gray-200" style={{paddingTop: '1rem', paddingBottom: '1rem'}}>
                <div className="flex gap-3 ml-3 mr-3">
                    <button className="bg-primary-600 text-white rounded-xl px-5 py-2.5 shadow-lg hover:bg-primary-700 transition font-semibold" onClick={resetTree}>
                        New Tree
                    </button>
                    <button className="bg-purple-600 text-white rounded-xl px-5 py-2.5 shadow-lg hover:bg-purple-700 transition font-semibold hidden" onClick={useAdvancedAlgorithms}>
                        Advanced Algo
                    </button>
                    <button className="bg-gray-800 text-white rounded-xl px-5 py-2.5 shadow-lg hover:bg-gray-900 transition font-semibold" onClick={downloadTreeData}>
                        Download Tree Data
                    </button>
                    <button className="bg-green-600 text-white rounded-xl px-5 py-2.5 shadow-lg hover:bg-green-700 transition font-semibold" onClick={saveTreeToApi} disabled={saveStatus === 'loading'}>
                        {saveStatus === 'loading' ? 'Saving...' : 'Save Family Tree'}
                    </button>
                </div>
                <div className="flex gap-4 text-sm font-medium mr-3">
                    <span>Total: <span className="font-bold">{stats.total}</span></span>
                    <span>Males: <span className="font-bold">{stats.male}</span></span>
                    <span>Females: <span className="font-bold">{stats.female}</span></span>
                    <span>Generations: <span className="font-bold">{stats.generations}</span></span>
                </div>
            </div>

            {saveStatus !== 'idle' && (
                <div className={`mt-2 text-center ${saveStatus === 'success' ? 'text-green-600' : 'text-red-600'}`}>{saveMessage}</div>
            )}

            {/* Family Tree Section */}
            <div
              className="bg-gray-50 rounded-2xl shadow-xl p-2 sm:p-4 md:p-8 flex items-start justify-center max-w-full w-full overflow-auto"
              style={{
                maxWidth: '100vw',
                width: '100%',
                height: '100vh',
                minHeight: '100vh',
                overflow: 'auto',
              }}
            >
                <div className="tree-canvas" style={{ marginTop: '32px' }}>
                    <TreeConnections 
                        dagreGraph={dagreGraph}
                        dagreLayoutOffsetX={dagreLayoutOffsetX}
                        dagreLayoutOffsetY={dagreLayoutOffsetY}
                    />
                    {tree && Array.from(tree.people.values()).map(person => (
                        <Person
                            key={person.id}
                            person={person}
                            isRoot={person.id === tree.rootId}
                            onClick={handlePersonClick}
                        />
                    ))}
                </div>
            </div>

            <RadialMenu
                isActive={radialMenu.isActive}
                position={radialMenu.position}
                items={radialMenu.items}
                onItemClick={handleRadialMenuItemClick}
                onClose={() => setRadialMenu({ isActive: false, position: { x: 0, y: 0 }, items: [], activePersonId: null })}
            />

            <AddPersonModal
                isOpen={modal.isOpen}
                onClose={() => setModal({ isOpen: false, action: { type: '', person: null } })}
                action={modal.action}
                onAddPersons={handleAddPersons}
                familyCode={userInfo?.familyCode}
                token={localStorage.getItem('access_token')}
                existingMemberIds={tree ? Array.from(tree.people.values()).map(p => p.memberId).filter(Boolean) : []}
            />

            {/* Debug Panel */}
            {debugPanel && (
                <div className="debug-panel">
                    <div className="debug-header">
                        <h3>Debug Panel - Traversal Analysis</h3>
                        <button className="btn btn-sm" onClick={() => setDebugPanel(false)}>×</button>
                    </div>
                    <div className="debug-content">
                        <div className="debug-tabs">
                            <button className="debug-tab active">Traversal Logs</button>
                            <button className="debug-tab">Path Analysis</button>
                            <button className="debug-tab">Family Structure</button>
                            <button className="debug-tab">Relationship Matrix</button>
                        </div>
                        <div className="debug-tab-content">
                            <div className="debug-tab-pane active">
                                <div className="debug-controls">
                                    <button className="btn btn-sm">Clear Logs</button>
                                    <button className="btn btn-sm">Export</button>
                                    <button className="btn btn-sm">Clean Memory</button>
                                </div>
                                <div className="debug-logs">
                                    <p>Debug logs will appear here...</p>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
      </Layout>
    );
}
export default FamilyTreePage;
