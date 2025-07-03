// src/pages/FamilyTreePage.jsx
import React, { useState, useEffect, useCallback, useRef } from 'react';
import Layout from '../Components/Layout';
import FamilyTreeDisplay from '../Components/FamilyTreeDisplay';
import FamilyMemberModal from '../Components/FamilyMemberModal';
import { v4 as uuidv4 } from 'uuid'; // npm install uuid

// *** IMPORTANT: REPLACE THESE WITH YOUR ACTUAL IMAGE IMPORTS ***
// Example:
// import grandfatherImage from '../assets/family-avatars/grandfather.png';
// import grandmotherImage from '../assets/family-avatars/grandmother.png';
// import fatherImage from '../assets/family-avatars/father.png';
// import motherImage from '../assets/family-avatars/mother.png';
// import uncleImage from '../assets/family-avatars/uncle.png';
// import auntImage from '../assets/family-avatars/aunt.png';
// import brotherImage from '../assets/family-avatars/brother.png';
// import sisterImage from '../assets/family-avatars/sister.png';
// import meImage from '../assets/family-avatars/me.png';
// import cousin1Image from '../assets/family-avatars/cousin1.png';
// import cousin2Image from '../assets/family-avatars/cousin2.png';
// import cousin3Image from '../assets/family-avatars/cousin3.png';
// import sonImage from '../assets/family-avatars/son.png'; // Example for children
// import daughterImage from '../assets/family-avatars/daughter.png';
// import spouseImage from '../assets/family-avatars/spouse.png';


// Helper to generate placeholder image URLs that mimic the cartoon style
// YOU WILL REMOVE THIS FUNCTION ONCE YOU HAVE YOUR ACTUAL IMAGE IMPORTS
const getPlaceholderImg = (text, hexColor) => `https://placehold.co/100x100/${hexColor}/FFFFFF?text=${text}`;

// --- FamilyTreePage Component ---
const FamilyTreePage = () => {
    const [treeData, setTreeData] = useState([]);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [selectedNodeData, setSelectedNodeData] = useState(null);
    const [modalMode, setModalMode] = useState('add-self');

    const nodeRefs = useRef({});

    // --- Initial Load: Set up the "Me" node and open modal ---
    useEffect(() => {
        if (treeData.length === 0) {
            const initialSelfNode = {
                id: uuidv4(),
                name: 'ME',
                photo: getPlaceholderImg('Me', '40B4D1'), // Replace with meImage
                relationToSelf: 'Self',
                gender: 'Unknown',
                attributes: { isSelf: true },
                // Initial position for 'ME' in the grid (these will be adjusted by layout logic)
                row: 0, col: 0, // Placeholder, actual position determined by layout
                parentIds: [],
                childrenIds: [],
                spouseId: null,
            };
            setTreeData([initialSelfNode]);
            setSelectedNodeData(initialSelfNode);
            setModalMode('add-family');
            setIsModalOpen(true);
        }
    }, [treeData.length]);

    // --- Helper to find a node by ID in the flat array ---
    const findNodeById = useCallback((nodes, id) => {
        return nodes.find(node => node.id === id);
    }, []);

    // --- Helper to update a node in the flat array ---
    const updateNodeInFlatArray = useCallback((nodes, targetId, updateFn) => {
        return nodes.map(node => {
            if (node.id === targetId) {
                return updateFn(node);
            }
            return node;
        });
    }, []);

    // --- LAYOUT LOGIC: Assigns row/col based on relationships ---
    // This is a simplified layout engine. For complex trees, a dedicated layout algorithm is needed.
    const assignLayoutPositions = useCallback((nodes) => {
        const newNodes = JSON.parse(JSON.stringify(nodes)); // Deep copy to avoid direct mutation
        const visited = new Set();
        const queue = [];
        let maxRow = 0;
        let minRow = 0;

        // Find the "highest" nodes (those without parents or whose parents are not yet in the tree)
        let rootNodes = newNodes.filter(node => !node.parentIds || node.parentIds.length === 0 || !node.parentIds.some(pId => newNodes.some(n => n.id === pId)));
        // If 'ME' is the only node, it's the root.
        if (rootNodes.length === 0 && newNodes.length > 0) {
            rootNodes = [newNodes.find(n => n.attributes?.isSelf) || newNodes[0]];
        }

        // Initialize roots
        rootNodes.forEach((root, index) => {
            root.row = 0; // Top row
            root.col = 2 + index * 2; // Spread out roots
            queue.push(root);
            visited.add(root.id);
        });

        let head = 0;
        while (head < queue.length) {
            const currentNode = queue[head++];

            // Layout children
            const childrenToProcess = newNodes.filter(n => currentNode.childrenIds.includes(n.id) && !visited.has(n.id));
            if (childrenToProcess.length > 0) {
                const childRow = currentNode.row + 1;
                maxRow = Math.max(maxRow, childRow);

                // Calculate starting column for children to center them under parents
                let startCol = currentNode.col;
                if (currentNode.spouseId) {
                    const spouse = findNodeById(newNodes, currentNode.spouseId);
                    if (spouse) {
                        startCol = Math.min(currentNode.col, spouse.col);
                    }
                }

                const totalWidth = childrenToProcess.length * 2; // Each child takes 2 columns (node + gap)
                let currentChildCol = startCol + Math.floor((currentNode.spouseId ? 2 : 1) / 2) - Math.floor(totalWidth / 2); // Adjust to center under parent(s)

                childrenToProcess.forEach(child => {
                    child.row = childRow;
                    child.col = currentChildCol;
                    currentChildCol += 2; // Move to next available column

                    queue.push(child);
                    visited.add(child.id);
                });
            }

            // Layout spouse (if not already visited and exists)
            if (currentNode.spouseId && !visited.has(currentNode.spouseId)) {
                const spouse = findNodeById(newNodes, currentNode.spouseId);
                if (spouse) {
                    spouse.row = currentNode.row;
                    spouse.col = currentNode.col - 1; // Spouse to the left
                    queue.push(spouse);
                    visited.add(spouse.id);
                }
            }

            // Layout parents (if not already visited and exists)
            const parentsToProcess = newNodes.filter(n => currentNode.parentIds.includes(n.id) && !visited.has(n.id));
            if (parentsToProcess.length > 0) {
                const parentRow = currentNode.row - 1;
                minRow = Math.min(minRow, parentRow);

                let currentParentCol = currentNode.col; // Simple placement for now
                parentsToProcess.forEach(parent => {
                    parent.row = parentRow;
                    parent.col = currentParentCol;
                    currentParentCol += 1; // Simple increment

                    queue.push(parent);
                    visited.add(parent.id);
                });
            }

            // Layout siblings (if not already visited and exist)
            // Siblings share parents, so find parents and then their other children
            if (currentNode.parentIds && currentNode.parentIds.length > 0) {
                const commonParents = newNodes.filter(n => currentNode.parentIds.includes(n.id));
                if (commonParents.length > 0) {
                    const siblingCandidates = newNodes.filter(n =>
                        n.id !== currentNode.id &&
                        !visited.has(n.id) &&
                        n.parentIds.some(pId => commonParents.map(cp => cp.id).includes(pId))
                    );

                    if (siblingCandidates.length > 0) {
                        const siblingRow = currentNode.row;
                        let currentSiblingCol = currentNode.col; // Start near current node

                        siblingCandidates.forEach((sibling, idx) => {
                            // Simple spread for siblings
                            sibling.row = siblingRow;
                            sibling.col = currentNode.col + (idx % 2 === 0 ? (idx / 2 + 1) : -(idx / 2 + 1));
                            queue.push(sibling);
                            visited.add(sibling.id);
                        });
                    }
                }
            }
        }

        // Normalize rows so the top-most row is 0 or 1
        const rowOffset = Math.abs(minRow);
        newNodes.forEach(node => {
            node.row += rowOffset;
        });

        // Normalize columns (optional, to shift everything to the left if too much empty space)
        // const minCol = Math.min(...newNodes.map(n => n.col));
        // if (minCol < 0) {
        //     newNodes.forEach(node => node.col -= minCol);
        // }

        return newNodes;
    }, [findNodeById]);


    // --- Handle saving data from the modal ---
    const handleSaveFamilyMember = useCallback((formData) => {
        setTreeData(prevTreeData => {
            let newTree = JSON.parse(JSON.stringify(prevTreeData)); // Deep copy for safe mutation

            // --- Logic for 'add-self' (initial setup) or 'add-family' (for 'ME' node) ---
            if (modalMode === 'add-self' || (modalMode === 'add-family' && selectedNodeData?.attributes?.isSelf)) {
                const selfNode = findNodeById(newTree, selectedNodeData.id);
                if (!selfNode) return newTree;

                // 1. Add Parents
                let fatherNode = null;
                let motherNode = null;

                if (formData.fatherName) {
                    fatherNode = {
                        id: uuidv4(),
                        name: formData.fatherName,
                        photo: formData.fatherPhoto || getPlaceholderImg(formData.fatherName.charAt(0), '40B4D1'),
                        relationToSelf: 'Father',
                        gender: 'Male',
                        parentIds: [], childrenIds: [], spouseId: null,
                    };
                    newTree.push(fatherNode);
                }
                if (formData.motherName) {
                    motherNode = {
                        id: uuidv4(),
                        name: formData.motherName,
                        photo: formData.motherPhoto || getPlaceholderImg(formData.motherName.charAt(0), 'E8BE4D'),
                        relationToSelf: 'Mother',
                        gender: 'Female',
                        parentIds: [], childrenIds: [], spouseId: null,
                    };
                    newTree.push(motherNode);
                }

                // Link parents as spouse
                if (fatherNode && motherNode) {
                    fatherNode.spouseId = motherNode.id;
                    motherNode.spouseId = fatherNode.id;
                }

                // Link 'Self' to new parents
                if (fatherNode || motherNode) {
                    selfNode.parentIds = [];
                    if (fatherNode) selfNode.parentIds.push(fatherNode.id);
                    if (motherNode) selfNode.parentIds.push(motherNode.id);

                    // Add 'Self' to parents' childrenIds
                    if (fatherNode) fatherNode.childrenIds.push(selfNode.id);
                    if (motherNode) motherNode.childrenIds.push(selfNode.id);
                }

                // 2. Add Spouse for 'Self'
                if (formData.spouseName) {
                    const spouseNode = {
                        id: uuidv4(),
                        name: formData.spouseName,
                        photo: formData.spousePhoto || getPlaceholderImg(formData.spouseName.charAt(0), 'EA68A0'),
                        relationToSelf: 'Spouse',
                        gender: formData.spouseGender,
                        parentIds: selfNode.parentIds,
                        childrenIds: [],
                        spouseId: selfNode.id,
                    };
                    newTree.push(spouseNode);
                    selfNode.spouseId = spouseNode.id;
                }

                // 3. Add Siblings for 'Self'
                if (formData.siblings && formData.siblings.length > 0) {
                    formData.siblings.forEach((sibling) => {
                        const siblingNode = {
                            id: uuidv4(),
                            name: sibling.name,
                            photo: sibling.photo || getPlaceholderImg(sibling.name.charAt(0), sibling.gender === 'Male' ? '40B4D1' : 'EA68A0'),
                            relationToSelf: sibling.gender === 'Male' ? 'Brother' : 'Sister',
                            gender: sibling.gender,
                            parentIds: selfNode.parentIds,
                            childrenIds: [],
                            spouseId: null,
                        };
                        newTree.push(siblingNode);
                        // Add sibling to parents' childrenIds
                        selfNode.parentIds.forEach(parentId => {
                            const parent = findNodeById(newTree, parentId);
                            if (parent && !parent.childrenIds.includes(siblingNode.id)) {
                                parent.childrenIds.push(siblingNode.id);
                            }
                        });
                    });
                }

                // 4. Add Children for 'Self'
                if (formData.children && formData.children.length > 0) {
                    formData.children.forEach((child) => {
                        const childNode = {
                            id: uuidv4(),
                            name: child.name,
                            photo: child.photo || getPlaceholderImg(child.name.charAt(0), child.gender === 'Male' ? '40B4D1' : 'EA68A0'),
                            relationToSelf: child.gender === 'Male' ? 'Son' : 'Daughter',
                            gender: child.gender,
                            parentIds: [selfNode.id, selfNode.spouseId].filter(Boolean),
                            childrenIds: [],
                            spouseId: null,
                        };
                        newTree.push(childNode);
                        selfNode.childrenIds.push(childNode.id);
                        if (selfNode.spouseId) {
                            const spouse = findNodeById(newTree, selfNode.spouseId);
                            if (spouse) spouse.childrenIds.push(childNode.id);
                        }
                    });
                }

            } else if (modalMode === 'edit') {
                // Logic for editing an existing node
                newTree = updateNodeInFlatArray(newTree, selectedNodeData.id, (node) => {
                    const updatedNode = {
                        ...node,
                        name: formData.name,
                        photo: formData.photo,
                        gender: formData.gender,
                    };
                    // Update spouse if applicable
                    if (node.spouseId) {
                        newTree = updateNodeInFlatArray(newTree, node.spouseId, (spouse) => ({
                            ...spouse,
                            name: formData.spouseName || spouse.name,
                            photo: formData.spousePhoto || spouse.photo,
                            gender: formData.spouseGender || spouse.gender,
                        }));
                    }
                    return updatedNode;
                });

            } else if (modalMode === 'add-child-or-partner') {
                // Logic for adding children/partner to a specific node (not 'Self')
                const targetNode = findNodeById(newTree, selectedNodeData.id);
                if (!targetNode) return newTree;

                // Add partner if provided
                if (formData.spouseName && !targetNode.spouseId) {
                    const spouseNode = {
                        id: uuidv4(),
                        name: formData.spouseName,
                        photo: formData.spousePhoto || getPlaceholderImg(formData.spouseName.charAt(0), 'EA68A0'),
                        relationToSelf: 'Spouse',
                        gender: formData.spouseGender,
                        parentIds: targetNode.parentIds,
                        childrenIds: [],
                        spouseId: targetNode.id,
                    };
                    newTree.push(spouseNode);
                    targetNode.spouseId = spouseNode.id;
                }

                // Add children if provided
                if (formData.children && formData.children.length > 0) {
                    formData.children.forEach((child) => {
                        const childNode = {
                            id: uuidv4(),
                            name: child.name,
                            photo: child.photo || getPlaceholderImg(child.name.charAt(0), child.gender === 'Male' ? '40B4D1' : 'EA68A0'),
                            relationToSelf: child.gender === 'Male' ? 'Son' : 'Daughter',
                            gender: child.gender,
                            parentIds: [targetNode.id, targetNode.spouseId].filter(Boolean),
                            childrenIds: [],
                            spouseId: null,
                        };
                        newTree.push(childNode);
                        targetNode.childrenIds.push(childNode.id);
                        if (targetNode.spouseId) {
                            const spouse = findNodeById(newTree, targetNode.spouseId);
                            if (spouse) spouse.childrenIds.push(childNode.id);
                        }
                    });
                }

            } else if (modalMode === 'add-parents') {
                // Logic for adding parents to a clicked node (e.g., Grandparents for Father/Mother)
                const targetNode = findNodeById(newTree, selectedNodeData.id);
                if (!targetNode) return newTree;

                let newFatherNode = null;
                let newMotherNode = null;

                if (formData.fatherName) {
                    newFatherNode = {
                        id: uuidv4(),
                        name: formData.fatherName,
                        photo: formData.fatherPhoto || getPlaceholderImg(formData.fatherName.charAt(0), '40B4D1'),
                        relationToSelf: 'Father',
                        gender: 'Male',
                        parentIds: [], childrenIds: [], spouseId: null,
                    };
                    newTree.push(newFatherNode);
                }
                if (formData.motherName) {
                    newMotherNode = {
                        id: uuidv4(),
                        name: formData.motherName,
                        photo: formData.motherPhoto || getPlaceholderImg(formData.motherName.charAt(0), 'E8BE4D'),
                        relationToSelf: 'Mother',
                        gender: 'Female',
                        parentIds: [], childrenIds: [], spouseId: null,
                    };
                    newTree.push(newMotherNode);
                }

                // Link new parents as spouse
                if (newFatherNode && newMotherNode) {
                    newFatherNode.spouseId = newMotherNode.id;
                    newMotherNode.spouseId = newFatherNode.id;
                }

                // Link targetNode to new parents
                targetNode.parentIds = [];
                if (newFatherNode) targetNode.parentIds.push(newFatherNode.id);
                if (newMotherNode) targetNode.parentIds.push(newMotherNode.id);

                // Add targetNode to new parents' childrenIds
                if (newFatherNode) newFatherNode.childrenIds.push(targetNode.id);
                if (newMotherNode) newMotherNode.childrenIds.push(targetNode.id);
            }

            // After all updates, re-assign layout positions
            return assignLayoutPositions(newTree);
        }); // End setTreeData

        setIsModalOpen(false);
        setSelectedNodeData(null);
    }, [modalMode, selectedNodeData, findNodeById, updateNodeInFlatArray, assignLayoutPositions]);

    // --- Handle node clicks to open modal ---
    const handleNodeClick = useCallback((nodeDatum) => {
        setSelectedNodeData(nodeDatum);
        // Determine modal mode based on clicked node
        if (nodeDatum.attributes?.isSelf) {
            setModalMode('add-family'); // For 'Me' node, add parents/spouse/children/siblings
        } else if (nodeDatum.relationToSelf === 'Father' || nodeDatum.relationToSelf === 'Mother' || nodeDatum.relationToSelf === 'Grandfather' || nodeDatum.relationToSelf === 'Grandmother' || nodeDatum.relationToSelf === 'Uncle' || nodeDatum.relationToSelf === 'Aunt') {
            setModalMode('add-parents'); // For parents/grandparents/aunts/uncles, add their parents
        } else {
            setModalMode('add-child-or-partner'); // For any other node, add their children/partner
        }
        setIsModalOpen(true);
    }, []);

    // Find the current 'Self' node for initial modal data
    const findSelfNode = useCallback((nodes) => {
        for (const node of nodes) {
            if (node.attributes?.isSelf) {
                return node;
            }
        }
        return null;
    }, []);

    return (
        <Layout>
            <div className="min-h-screen bg-gray-50 flex flex-col items-center py-8">
                <div className="w-full max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <h1 className="text-4xl font-extrabold text-gray-900 mb-8 text-center text-gray-800">My Family Tree</h1>
                    <div className="bg-white p-6 rounded-lg shadow-xl overflow-auto min-h-[600px] flex justify-center items-center">
                        {treeData.length > 0 ? (
                            <FamilyTreeDisplay
                                data={treeData}
                                onNodeClick={handleNodeClick}
                                nodeRefs={nodeRefs} // Pass nodeRefs down
                            />
                        ) : (
                            <div className="text-center text-gray-600 py-20">
                                Loading your family tree...
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {isModalOpen && (
                <FamilyMemberModal
                    isOpen={isModalOpen}
                    onClose={() => setIsModalOpen(false)}
                    onSave={handleSaveFamilyMember}
                    mode={modalMode}
                    initialNodeData={selectedNodeData}
                    // Pass current 'Self' node if adding parents to it
                    selfNode={findSelfNode(treeData)}
                />
            )}
        </Layout>
    );
};

export default FamilyTreePage;