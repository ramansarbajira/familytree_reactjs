import React, { useState, useEffect, useRef } from 'react';
import Layout from '../Components/Layout';
import { useUser } from '../Contexts/UserContext';
import { FamilyTree } from '../utils/FamilyTree';
import { autoArrange } from '../utils/TreeLayout';
import Person from '../Components/FamilyTree/Person';
import TreeConnections from '../Components/FamilyTree/TreeConnections';
import RadialMenu from '../Components/FamilyTree/RadialMenu';
import AddPersonModal from '../Components/FamilyTree/AddPersonModal';
import { getTranslation } from '../utils/languageTranslations';
import { useLanguage } from '../Contexts/LanguageContext';
import RelationshipCalculator from '../utils/relationshipCalculator';
import html2canvas from 'html2canvas';
import LanguageSwitcher from '../Components/LanguageSwitcher';
import Swal from 'sweetalert2';
import { FaPlus, FaSave } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import { FamilyTreeProvider } from '../Contexts/FamilyTreeContext';

// Utility for authenticated fetch with logout on 401 or error
const authFetch = async (url, options = {}) => {
    const token = localStorage.getItem('access_token');
    const headers = {
        ...options.headers,
        Authorization: token ? `Bearer ${token}` : undefined,
        // Do not set Content-Type for FormData
    };
    // Debug: log token and headers
    console.log('authFetch token:', token);
    console.log('authFetch headers:', headers);
    try {
        const response = await fetch(url, { ...options, headers });
        if (response.status === 401) {
            localStorage.removeItem('access_token');
            window.location.href = '/login';
            return null;
        }
        return response;
    } catch (err) {
        // Only logout on 401, not on network error
        Swal.fire({
            icon: 'error',
            title: 'Network Error',
            text: 'Network error or server error. Please try again.',
        });
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
    const [selectedPersonId, setSelectedPersonId] = useState(null);
    const [treeLoading, setTreeLoading] = useState(false);
    const { language } = useLanguage();
    const { userInfo, userLoading } = useUser();
    const navigate = useNavigate();

    // Only allow editing for role 2 or 3
    const canEdit = userInfo && (userInfo.role === 2 || userInfo.role === 3);

    // Check approval status and familyCode
    useEffect(() => {
        if (userLoading) return; // Wait for user data to load
        
        if (!userInfo) {
            // User not logged in, redirect to login
            navigate('/login');
            return;
        }

        // Check if user is approved and has familyCode
        if (userInfo.approveStatus !== 'approved' || !userInfo.familyCode) {
            Swal.fire({
                icon: 'warning',
                title: 'Access Restricted',
                text: userInfo.approveStatus !== 'approved' 
                    ? 'Your family membership is pending approval. Please wait for admin approval.'
                    : 'You need to create or join a family first.',
                confirmButtonText: 'Go to My Family',
                showCancelButton: false,
            }).then(() => {
                navigate('/my-family');
            });
            return;
        }
    }, [userInfo, userLoading, navigate]);

    // Show loading state while checking approval or if user is not approved
    if (userLoading || !userInfo || userInfo.approveStatus !== 'approved' || !userInfo.familyCode) {
        return (
            <Layout>
                <div className="flex items-center justify-center min-h-screen bg-gray-100">
                    <div className="text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                        <p className="text-gray-600">Loading family tree...</p>
                    </div>
                </div>
            </Layout>
        );
    }

    // Initialize tree (now with API/sample data support)
    useEffect(() => {
        const initializeTree = async () => {
            // Fetch family data from API using familyCode
            if (!userInfo || !userInfo.familyCode) return;
            
            setTreeLoading(true);
            let data = null;
            try {
                const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/family/tree/${userInfo.familyCode}`, {
                    headers: { 'accept': '*/*' }
                });
                if (response.ok) {
                    data = await response.json();
                }
            } catch (err) {
                data = null;
            }
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
                        memberId: person.memberId !== undefined ? person.memberId : null,
                        parents: new Set((person.parents || []).map(id => Number(id))),
                        children: new Set((person.children || []).map(id => Number(id))),
                        spouses: new Set((person.spouses || []).map(id => Number(id))),
                        siblings: new Set((person.siblings || []).map(id => Number(id)))
                    });
                });
                newTree.nextId = Math.max(...data.people.map(p => parseInt(p.id))) + 1;
                // Set rootId to the person whose memberId matches the logged-in user's userId (robust string comparison)
                let rootPersonId = null;
                const userIdStr = String(userInfo.userId);
                for (const [personId, personObj] of newTree.people.entries()) {
                    if (personObj.memberId && String(personObj.memberId) === userIdStr) {
                        rootPersonId = personId;
                        break;
                    }
                }
                // Fallback: match by name if memberId is missing or not matched
                if (rootPersonId === null) {
                    for (const [personId, personObj] of newTree.people.entries()) {
                        if (personObj.name && personObj.name === userInfo.name) {
                            rootPersonId = personId;
                            break;
                        }
                    }
                }
                // Final fallback: use the first person in the data
                if (rootPersonId !== null) {
                    newTree.rootId = rootPersonId;
                } else {
                    newTree.rootId = data.people[0].id;
                }
                setTree(newTree);
                updateStats(newTree);
                arrangeTree(newTree);
            }
            setTreeLoading(false);
        };
        if (userInfo) initializeTree();
    }, [userInfo]);

    const updateStats = (treeInstance) => {
        setStats(treeInstance.getStats());
    };

    const arrangeTree = (treeInstance) => {
        // For large trees, show loading state during arrangement
        const memberCount = treeInstance.people.size;
        if (memberCount > 50) {
            setTreeLoading(true);
            // Use setTimeout to allow UI to update before heavy computation
            setTimeout(() => {
        const layout = autoArrange(treeInstance);
        if (layout) {
            setDagreGraph(layout.g);
            setDagreLayoutOffsetX(layout.dagreLayoutOffsetX);
            setDagreLayoutOffsetY(layout.dagreLayoutOffsetY);
        }
                setTree(treeInstance);
                setTreeLoading(false);
            }, 100);
        } else {
            const layout = autoArrange(treeInstance);
            if (layout) {
                setDagreGraph(layout.g);
                setDagreLayoutOffsetX(layout.dagreLayoutOffsetX);
                setDagreLayoutOffsetY(layout.dagreLayoutOffsetY);
        }
        setTree(treeInstance);
        }
        
        // Debug: Log positions of each person (only for smaller trees)
        if (treeInstance && treeInstance.people && memberCount <= 25) {
            console.log('Person positions:', Array.from(treeInstance.people.values()).map(p => ({ id: p.id, name: p.name, x: p.x, y: p.y })));
        }
    };

    const handlePersonClick = (personId) => {
        if (!tree) return;
        const person = tree.people.get(personId);
        if (!person) return;

        // Set selected person for relationship display
        setSelectedPersonId(personId);

        // Set up icons with English labels (no translation except for relationships)
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
        
        if (!persons || persons.length === 0) {
            return;
        }
        
        const newTree = new FamilyTree();
        newTree.people = new Map(tree.people);
        newTree.nextId = tree.nextId;
        newTree.rootId = tree.rootId;

        // Map to hold the correct personId for each personData (existing or new)
        const personIdMap = new Map();
        let duplicateFound = false;
        const { type, person: basePerson } = modal.action;

        // Special handling for edit: only update, never create
        if (type === 'edit' && basePerson) {
            const existingPerson = newTree.people.get(basePerson.id);
            if (existingPerson && persons.length > 0) {
                existingPerson.name = persons[0].name;
                existingPerson.gender = persons[0].gender;
                existingPerson.age = persons[0].age;
                existingPerson.img = persons[0].img;
                existingPerson.memberId = persons[0].memberId || persons[0].userId || null;
            }
            setTree(newTree);
            updateStats(newTree);
            arrangeTree(newTree);
            return;
        }

        persons.forEach(personData => {
            // Try to find an existing person by memberId or userId
            let existing = null;
            if (personData.memberId || personData.userId) {
                for (let p of newTree.people.values()) {
                    if (
                        (personData.memberId && p.memberId === personData.memberId) ||
                        (personData.userId && p.memberId === personData.userId)
                    ) {
                        existing = p;
                        break;
                    }
                }
            }
            if (existing) {
                // Use existing person's id
                personIdMap.set(personData, existing.id);
            } else {
                // Create new person
                const person = newTree.addPerson({
                    ...personData,
                    memberId: personData.memberId || personData.userId || null,
                });
                // PATCH: preserve imgPreview for preview in tree
                if (person && personData.imgPreview) {
                    person.imgPreview = personData.imgPreview;
                }
                if (!person) {
                    // Only set duplicate if it's an existing member (has memberId)
                    if (personData.memberId || personData.userId) {
                        duplicateFound = true;
                    }
                } else {
                    personIdMap.set(personData, person.id);
                }
            }
        });
        if (duplicateFound) {
            Swal.fire({
                icon: 'info',
                title: 'Duplicate Member',
                text: 'This member already exists in the tree.',
            });
            return;
        }

        // Add relationships based on action type
        // If basePerson is undefined (new tree), just add the persons without relationships
        if (!basePerson) {
            setTree(newTree);
            updateStats(newTree);
            arrangeTree(newTree);
            return;
        }
        
        // Make sure basePerson exists in the new tree
        const basePersonInNewTree = newTree.people.get(basePerson.id);
        if (!basePersonInNewTree) {
            console.error('Base person not found in tree');
            setTree(newTree);
            updateStats(newTree);
            arrangeTree(newTree);
            return;
        }
        
        if (type === 'parents') {
            persons.forEach(personData => {
                const parentId = personIdMap.get(personData);
                if (parentId) {
                    newTree.addRelation(parentId, basePersonInNewTree.id, 'parent-child');
                }
            });
            // If two parents, add spouse relation
            if (persons.length === 2) {
                const parent1 = personIdMap.get(persons[0]);
                const parent2 = personIdMap.get(persons[1]);
                if (parent1 && parent2) {
                    newTree.addRelation(parent1, parent2, 'spouse');
                }
            }
        } else if (type === 'children') {
            persons.forEach(personData => {
                const childId = personIdMap.get(personData);
                if (childId) {
                    newTree.addRelation(basePersonInNewTree.id, childId, 'parent-child');
                    // Add to all spouses of the base person
                    basePersonInNewTree.spouses.forEach(spouseId => {
                        const spouse = newTree.people.get(spouseId);
                        if (spouse) {
                            newTree.addRelation(spouseId, childId, 'parent-child');
                        }
                    });
                }
            });
        } else if (type === 'spouse') {
            const spouseId = personIdMap.get(persons[0]);
            if (spouseId) {
                newTree.addRelation(basePersonInNewTree.id, spouseId, 'spouse');
            }
        } else if (type === 'siblings') {
            persons.forEach(personData => {
                const siblingId = personIdMap.get(personData);
                if (siblingId) {
                    basePersonInNewTree.parents.forEach(parentId => {
                        const parent = newTree.people.get(parentId);
                        if (parent) {
                            newTree.addRelation(parentId, siblingId, 'parent-child');
                        }
                    });
                }
            });
        }

        setTree(newTree);
        updateStats(newTree);
        arrangeTree(newTree);
    };

    const deletePerson = async (personId) => {
        if (!tree) return;
        if (personId === tree.rootId) {
            Swal.fire({
                icon: 'info',
                title: 'Cannot Delete Root',
                text: 'Cannot delete the root person.',
            });
            return;
        }

        const result = await Swal.fire({
            icon: 'warning',
            title: 'Are you sure?',
            text: 'You are about to delete this person. This action cannot be undone.',
            showCancelButton: true,
            confirmButtonText: 'Yes, delete it!',
            cancelButtonText: 'No, cancel!',
        });

        if (result.isConfirmed) {
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
            if (selectedPersonId === personId) {
                setSelectedPersonId(null);
            }
        }
    };

    const resetTree = async () => {
        const result = await Swal.fire({
            icon: 'warning',
            title: 'Create New Tree',
            text: 'Are you sure you want to create a new tree? This will overwrite your current tree.',
            showCancelButton: true,
            confirmButtonText: 'Yes, create new tree!',
            cancelButtonText: 'No, keep current tree!',
        });

        if (result.isConfirmed) {
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
            setSelectedPersonId(null);
        }
    };

    const downloadTreeData = async () => {
        // Download the tree as an image (PNG)
        const treeCanvas = document.querySelector('.tree-canvas');
        if (!treeCanvas) return;

        // Step 1: Replace all images in the tree with a local image to avoid CORS issues
        const allImgs = treeCanvas.querySelectorAll('img');
        const originalSrcs = [];
        const localImg = '/public/assets/user.png'; // Adjust path if needed
        allImgs.forEach(img => {
            originalSrcs.push(img.src);
            img.src = localImg;
        });

        // Save original styles
        const originalOverflow = treeCanvas.style.overflow;
        const originalWidth = treeCanvas.style.width;
        const originalHeight = treeCanvas.style.height;

        // Expand to fit content
        treeCanvas.style.overflow = 'visible';
        treeCanvas.style.width = 'auto';
        treeCanvas.style.height = 'auto';

        try {
            // Use html2canvas with higher scale for better quality
            const canvas = await html2canvas(treeCanvas, {
                backgroundColor: '#fff', // Set a white background
                scale: 2, // Higher scale for better resolution
                useCORS: true,
                allowTaint: true,
                scrollX: 0,
                scrollY: 0,
                windowWidth: document.body.scrollWidth,
                windowHeight: document.body.scrollHeight,
            });

            // Restore original images
            allImgs.forEach((img, i) => {
                img.src = originalSrcs[i];
            });

            // Restore original styles
            treeCanvas.style.overflow = originalOverflow;
            treeCanvas.style.width = originalWidth;
            treeCanvas.style.height = originalHeight;

            const image = canvas.toDataURL('image/png');
            const a = document.createElement('a');
            a.href = image;
            a.download = 'family-tree.png';
            document.body.appendChild(a);
            a.click();
            document.body.removeChild(a);
        } catch (err) {
            // Restore original images and styles on error
            allImgs.forEach((img, i) => {
                img.src = originalSrcs[i];
            });
            treeCanvas.style.overflow = originalOverflow;
            treeCanvas.style.width = originalWidth;
            treeCanvas.style.height = originalHeight;
            Swal.fire({
                icon: 'error',
                title: 'Export Failed',
                text: 'Could not generate image. Try again or check for CORS issues.'
            });
        }
    };

    const useAdvancedAlgorithms = () => {
        Swal.fire({
            icon: 'info',
            title: 'Advanced Algorithms',
            text: 'Advanced algorithms feature is available in the React version!',
        });
    };

    const centerTreeInView = () => {
        if (!containerRef.current) return;
        
        let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
        const memberCount = tree.people.size;
        const personSize = memberCount > 50 ? 80 : 100; // Dynamic person size
        
        tree.people.forEach(person => {
            minX = Math.min(minX, person.x - personSize / 2);
            minY = Math.min(minY, person.y - personSize / 2);
            maxX = Math.max(maxX, person.x + personSize / 2);
            maxY = Math.max(maxY, person.y + personSize / 2);
        });
        
        const treeWidth = maxX - minX;
        const treeHeight = maxY - minY;
        
        // For large trees, center both horizontally and vertically
        if (memberCount > 50) {
        containerRef.current.scrollLeft = (minX + treeWidth / 2) - containerRef.current.clientWidth / 2;
            containerRef.current.scrollTop = (minY + treeHeight / 2) - containerRef.current.clientHeight / 2;
        } else {
            // For smaller trees, center horizontally, align to top vertically
            containerRef.current.scrollLeft = (minX + treeWidth / 2) - containerRef.current.clientWidth / 2;
            containerRef.current.scrollTop = 0;
        }
    };

    useEffect(() => {
        if (tree && tree.people.size > 0) {
            centerTreeInView();
        }
    }, [tree]);

    // On mobile, always scroll to top and center horizontally after tree loads
    useEffect(() => {
        if (tree && tree.people.size > 0 && window.innerWidth <= 600 && containerRef.current) {
            const memberCount = tree.people.size;
            const personSize = memberCount > 50 ? 80 : 100; // Dynamic person size
            
            containerRef.current.scrollTop = 0;
            // Center horizontally
            let minX = Infinity, maxX = -Infinity;
            tree.people.forEach(person => {
                minX = Math.min(minX, person.x - personSize / 2);
                maxX = Math.max(maxX, person.x + personSize / 2);
            });
            const treeWidth = maxX - minX;
            containerRef.current.scrollLeft = (minX + treeWidth / 2) - containerRef.current.clientWidth / 2;
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
            // Calculate and attach relationshipCode for each person
            const calculator = new RelationshipCalculator(tree);
            const rootId = tree.rootId;
            for (const person of tree.people.values()) {
                if (person.id !== rootId) {
                    const rel = calculator.calculateRelationship(rootId, person.id);
                    person.relationshipCode = rel.relationshipCode;
                } else {
                    person.relationshipCode = 'SELF';
                }
            }
            const formData = new FormData();
            let index = 0;
            for (const person of tree.people.values()) {
                formData.append(`person_${index}_id`, person.id);
                formData.append(`person_${index}_name`, person.name);
                formData.append(`person_${index}_gender`, person.gender);
                formData.append(`person_${index}_age`, person.age);
                formData.append(`person_${index}_generation`, person.generation);
                formData.append(`person_${index}_birthOrder`, person.birthOrder || 0);
                formData.append(`person_${index}_memberId`, person.memberId || '');
                formData.append(`person_${index}_parents`, person.parents ? Array.from(person.parents).join(',') : '');
                formData.append(`person_${index}_children`, person.children ? Array.from(person.children).join(',') : '');
                formData.append(`person_${index}_spouses`, person.spouses ? Array.from(person.spouses).join(',') : '');
                formData.append(`person_${index}_siblings`, person.siblings ? Array.from(person.siblings).join(',') : '');
                formData.append(`person_${index}_relationshipCode`, person.relationshipCode || '');
                // For image
                if (person.img instanceof File) {
                    formData.append(`person_${index}_img`, person.img);
                } else if (typeof person.img === 'string') {
                    formData.append(`person_${index}_img`, person.img);
                }
                index++;
            }
            formData.append('person_count', index);
            // Add familyCode to payload if available
            if (userInfo && userInfo.familyCode) {
                formData.append('familyCode', userInfo.familyCode);
            }
            const response = await authFetch(`${import.meta.env.VITE_API_BASE_URL}/family/tree/create`, {
                method: 'POST',
                body: formData,
                headers: {
                    // Authorization header will be set in authFetch
                },
            });
            if (!response) return;
            if (!response.ok) throw new Error('Failed to save');
            setSaveStatus('success');
            setSaveMessage('Family tree saved successfully!');
        } catch (err) {
            setSaveStatus('error');
            setSaveMessage('Failed to save family tree.');
        }
    };

    useEffect(() => {
        if (saveStatus === 'success') {
            Swal.fire({
                icon: 'success',
                title: 'Success',
                text: 'Family tree saved successfully!',
            });
            setSaveStatus('idle');
        } else if (saveStatus === 'error') {
            Swal.fire({
                icon: 'error',
                title: 'Error',
                text: 'Failed to save family tree.',
            });
            setSaveStatus('idle');
        }
    }, [saveStatus]);

    return (
        <FamilyTreeProvider language={language}>
            {/* All components that use useFamilyTreeLabels must be children here */}
            <Layout>
                {/* Main container for tree and controls */}
                <div className="relative flex flex-col h-[calc(100vh-56px)] w-full bg-gray-100 overflow-hidden">
                    {canEdit && (
                        <div className="hidden sm:flex w-full justify-between items-center gap-4 px-8 py-4 bg-white border-b border-gray-200 z-40">
                            {/* Stats section */}
                            <div className="flex gap-6 text-gray-700 text-base font-medium">
                                <div>Total: <span className="font-bold">{stats.total}</span></div>
                                <div>Male: <span className="font-bold">{stats.male}</span></div>
                                <div>Female: <span className="font-bold">{stats.female}</span></div>
                                <div>Generations: <span className="font-bold">{stats.generations}</span></div>
                                <div><LanguageSwitcher /></div>
                            </div>
                            {/* Action buttons */}
                            <div className="flex gap-4">
                                <button
                                    className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md text-lg font-semibold active:scale-95 transition"
                                    onClick={resetTree}
                                >
                                    <FaPlus /> New Tree
                                </button>
                                <button
                                    className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md text-lg font-semibold active:scale-95 transition disabled:opacity-60"
                                    onClick={saveTreeToApi}
                                    disabled={saveStatus === 'loading'}
                                >
                                    {saveStatus === 'loading' && (
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z"></path>
                                        </svg>
                                    )}
                                    <FaSave /> Save
                                </button>
                            </div>
                        </div>
                    )}
                    {!canEdit && (
                        <div className="hidden sm:flex w-full justify-start items-center gap-4 px-8 py-4 bg-white border-b border-gray-200 z-40">
                            {/* Stats section only */}
                            <div className="flex gap-6 text-gray-700 text-base font-medium">
                                <div>Total: <span className="font-bold">{stats.total}</span></div>
                                <div>Male: <span className="font-bold">{stats.male}</span></div>
                                <div>Female: <span className="font-bold">{stats.female}</span></div>
                                <div>Generations: <span className="font-bold">{stats.generations}</span></div>
                            </div>
                        </div>
                    )}
                    {/* Tree visualization area */}
                    <div ref={containerRef} className="flex-1 w-full h-full min-h-0 min-w-0 overflow-auto">
                        {treeLoading && (
                            <div className="absolute inset-0 flex items-center justify-center bg-white/80 z-50">
                                <div className="text-center">
                                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                                    <p className="text-gray-600 font-medium">
                                        {tree && tree.people.size > 50 ? 'Loading large family tree...' : 'Loading family tree...'}
                                    </p>
                                </div>
                            </div>
                        )}
                        <div 
                            className="relative w-max h-max mx-auto flex flex-col items-start justify-start sm:items-center sm:justify-center"
                            style={{
                                minWidth: tree && tree.people.size > 50 ? '1200px' : '900px',
                                minHeight: tree && tree.people.size > 50 ? '800px' : '600px'
                            }}
                        >
                            {/* Tree SVG connections */}
                            {dagreGraph && (
                                <TreeConnections 
                                    dagreGraph={dagreGraph}
                                    dagreLayoutOffsetX={dagreLayoutOffsetX}
                                    dagreLayoutOffsetY={dagreLayoutOffsetY}
                                />
                            )}
                            {/* Render person cards with optimization for large trees */}
                            {tree && Array.from(tree.people.values())
                                .sort((a, b) => {
                                    // Sort by generation first, then by x position for better rendering order
                                    if (a.generation !== b.generation) {
                                        return (a.generation || 0) - (b.generation || 0);
                                    }
                                    return a.x - b.x;
                                })
                                .map(person => (
                                <Person
                                    key={person.id}
                                    person={person}
                                    isRoot={person.id === tree.rootId}
                                    onClick={canEdit ? handlePersonClick : undefined}
                                    rootId={tree.rootId}
                                    tree={tree}
                                    language={language}
                                    isSelected={selectedPersonId === person.id}
                                    currentUserId={userInfo?.userId} // <-- Pass userId
                                    currentFamilyId={userInfo?.familyId || userInfo?.familyCode} // <-- Pass familyId or familyCode
                                />
                            ))}
                        </div>
                    </div>
                    {canEdit && (
                        <div className="fixed bottom-0 left-0 w-full bg-white border-t border-gray-200 flex justify-around items-center py-3 z-50 sm:hidden">
                            <button
                                className="flex items-center gap-2 px-6 py-2 bg-green-500 text-white rounded-lg shadow-md text-lg font-semibold active:scale-95 transition"
                                onClick={resetTree}
                            >
                                <FaPlus /> New Tree
                            </button>
                            <button
                                className="flex items-center gap-2 px-6 py-2 bg-blue-600 text-white rounded-lg shadow-md text-lg font-semibold active:scale-95 transition"
                                onClick={saveTreeToApi}
                                disabled={saveStatus === 'loading'}
                            >
                                <FaSave /> Save
                            </button>
                        </div>
                    )}
                </div>

                <RadialMenu
                    isActive={canEdit && radialMenu.isActive}
                    position={radialMenu.position}
                    items={canEdit ? radialMenu.items : []}
                    onItemClick={handleRadialMenuItemClick}
                    onClose={() => setRadialMenu({ isActive: false, position: { x: 0, y: 0 }, items: [], activePersonId: null })}
                />

                <AddPersonModal
                    isOpen={canEdit && modal.isOpen}
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
            </Layout>
        </FamilyTreeProvider>
    );
};
export default FamilyTreePage;

