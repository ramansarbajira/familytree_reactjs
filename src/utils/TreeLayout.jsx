import dagre from 'dagre';

// Helper function to find all descendants of a person
function getAllDescendants(tree, personId, visited = new Set()) {
    if (visited.has(personId)) return [];
    visited.add(personId);
    
    const person = tree.people.get(personId);
    if (!person) return [];
    
    let descendants = [personId];
    person.children.forEach(childId => {
        descendants = [...descendants, ...getAllDescendants(tree, childId, visited)];
    });
    return descendants;
}

export function autoArrange(tree) {
    const g = new dagre.graphlib.Graph({ compound: true });
    
    // Dynamic spacing based on tree size
    const memberCount = tree.people.size;
    let nodesep, ranksep, marginx, marginy, coupleSpacing;
    
    // More compact spacing for all tree sizes
    if (memberCount <= 10) {
        nodesep = 60;    // Horizontal spacing between nodes
        ranksep = 100;   // Vertical spacing between ranks
        coupleSpacing = 20;  // Space between couples
        marginx = 50;
        marginy = 50;
    } else if (memberCount <= 25) {
        nodesep = 50;
        ranksep = 90;
        coupleSpacing = 20;
        marginx = 40;
        marginy = 40;
    } else if (memberCount <= 50) {
        nodesep = 40;
        ranksep = 80;
        coupleSpacing = 15;
        marginx = 30;
        marginy = 30;
    } else if (memberCount <= 100) {
        nodesep = 30;
        ranksep = 70;
        coupleSpacing = 10;
        marginx = 20;
        marginy = 20;
    } else {
        nodesep = 20;
        ranksep = 60;
        coupleSpacing = 5;
        marginx = 10;
        marginy = 10;
    }

    g.setGraph({
        rankdir: 'TB',
        nodesep: nodesep,
        ranksep: ranksep,
        marginx: marginx,
        marginy: marginy,
        // Add clustering for better organization
        compound: true,
        // Optimize for large graphs
        orderRestarts: memberCount > 50 ? 20 : 10,
        nestingRoot: memberCount > 50 ? 'root' : undefined,
    });
    g.setDefaultEdgeLabel(() => ({}));

    const personNodeSize = memberCount > 80 ? 100 : 130; // Smaller nodes for large trees
    const familyNodeSize = 10;
    const familyUnits = new Map();

    // Add all people as nodes
    tree.people.forEach(p => {
        g.setNode(p.id.toString(), { 
            label: p.name, 
            width: personNodeSize, 
            height: personNodeSize,
            // Add generation info for better clustering
            generation: p.generation || 0
        });
    });

    // First pass: Create family units and parent-child relationships
    const familyGroups = new Map();
    
    // Create family groups (parents + their children)
    tree.people.forEach(person => {
        if (person.children.size > 0) {
            const parentIds = [person.id];
            // Include spouses who are also parents of the same children
            person.spouses.forEach(spouseId => {
                const spouse = tree.people.get(spouseId);
                if (!spouse) return;
                const isCoParent = [...person.children].some(childId => 
                    spouse.children && spouse.children.has(childId));
                if (isCoParent) parentIds.push(spouseId);
            });
            
            const parentKey = parentIds.sort().join('-');
            if (!familyUnits.has(parentKey)) {
                const familyId = `family-${parentKey}`;
                familyUnits.set(parentKey, familyId);
                g.setNode(familyId, { 
                    width: familyNodeSize, 
                    height: familyNodeSize,
                    clusterLabelPos: 'top',
                    style: 'fill: #f0f0f0',
                    rx: 5,
                    ry: 5
                });
                
                // Connect parents to family node with higher weight
                parentIds.forEach(pid => {
                    g.setEdge(pid.toString(), familyId, { 
                        weight: 25,  // Higher weight to keep parents close to family node
                        minlen: 1
                    });
                });
                
                // Connect family node to children
                const children = [...person.children];
                children.forEach((childId, index) => {
                    g.setEdge(familyId, childId.toString(), {
                        weight: 15,  // Slightly lower weight than parent connections
                        minlen: 1,
                        // Add some spacing between siblings
                        ...(index > 0 && { weight: 15 - (index * 0.1) })
                    });
                });
                
                // Store family group for clustering
                const familyGroup = {
                    id: familyId,
                    parents: [...parentIds],
                    children: children,
                    allMembers: [...parentIds, ...children]
                };
                familyGroups.set(familyId, familyGroup);
            }
        }
    });
    
    // Second pass: Create clusters for each family unit
    familyGroups.forEach((family, familyId) => {
        // Create a cluster for this family
        const clusterId = `cluster-${familyId}`;
        
        // Add all family members to this cluster
        family.allMembers.forEach(memberId => {
            g.setParent(memberId.toString(), clusterId);
        });
        
        // Style the cluster
        g.setNode(clusterId, {
            cluster: true,
            label: '',
            style: 'fill: none',
            clusterLabelPos: 'top',
            margin: 20
        });
    });

    // Create spouse connections with higher weight to keep them together
    tree.people.forEach(person => {
        person.spouses.forEach(spouseId => {
            if (person.id < spouseId) {
                const spouse = tree.people.get(spouseId);
                if (!spouse) return;
                
                // Check if they have common children
                const commonChildren = [...person.children].filter(c => 
                    spouse.children && spouse.children.has(c));
                
                // Connect spouses with a high-weight edge to keep them close
                g.setEdge(person.id.toString(), spouseId.toString(), {
                    weight: 50,  // Increased weight to keep spouses closer
                    minlen: 0.5, // Reduced minimum length
                    style: 'stroke: #ff69b4',
                    curve: 'curveStep',  // Use step curve for spouse connections
                    // Force horizontal alignment
                    labelpos: 'c',
                    labeloffset: 0,
                    // Add invisible edge to help with layout
                    edgeLabel: '',
                    edgeLabelStyle: 'opacity:0',
                    // Add some padding to prevent overlap
                    padding: 10
                });
                
                // If they have no common children, create a special cluster
                if (commonChildren.length === 0) {
                    const clusterId = `spouse-cluster-${person.id}-${spouseId}`;
                    g.setNode(clusterId, {
                        cluster: true,
                        label: '',
                        style: 'fill: #fff5f7',
                        margin: 10
                    });
                    g.setParent(person.id.toString(), clusterId);
                    g.setParent(spouseId.toString(), clusterId);
                }
            }
        });
    });

    // Create a map to track couples and their positions
    const coupleMap = new Map();
    const processedPairs = new Set();
    const coupleNodes = [];

    // First pass: identify all couples
    tree.people.forEach(person => {
        person.spouses.forEach(spouseId => {
            const pairKey = [person.id, spouseId].sort().join('-');
            if (!processedPairs.has(pairKey)) {
                coupleMap.set(person.id, { spouseId, isLeft: true });
                coupleMap.set(spouseId, { spouseId: person.id, isLeft: false });
                coupleNodes.push([person.id, spouseId]);
                processedPairs.add(pairKey);
            }
        });
    });

    // Process each couple
    coupleNodes.forEach(([id1, id2]) => {
        const coupleId = `couple-${id1}-${id2}`;
        
        // Create a cluster for this couple
        g.setNode(coupleId, {
            cluster: true,
            label: '',
            style: 'fill: none',
            margin: 0,
            padding: 0,
            rank: 'same',
            // Force horizontal alignment
            rankdir: 'LR',
            // Make the cluster as small as possible
            width: 0,
            height: 0
        });
        
        // Add both spouses to the cluster
        g.setParent(id1.toString(), coupleId);
        g.setParent(id2.toString(), coupleId);
        
        // Position the second spouse to the right of the first
        g.setNode(id1.toString(), {
            ...g.node(id1.toString()),
            // Add some padding to the node
            padding: 10,
            // Force position constraints
            constraint: true,
            // Make sure they stay on the same rank
            rank: 'same',
            // Add some spacing between the couple
            margin: { left: 0, right: coupleSpacing }
        });
        
        g.setNode(id2.toString(), {
            ...g.node(id2.toString()),
            // Add some padding to the node
            padding: 10,
            // Force position constraints
            constraint: true,
            // Make sure they stay on the same rank
            rank: 'same',
            // Add some spacing between the couple
            margin: { left: coupleSpacing, right: 0 }
        });
        
        // Connect the couple with a strong edge
        g.setEdge(id1.toString(), id2.toString(), {
            weight: 1000,  // Extremely high weight to keep them together
            minlen: 0,     // No minimum length
            style: 'stroke: #ff69b4, stroke-width: 2px',
            curve: 'curveStep',
            // Make the connection straight
            curve: 'line',
            // Add arrow in the middle
            arrowhead: 'none',
            // Add some spacing
            padding: 10,
            // Make sure the edge doesn't affect layout too much
            constraint: false
        });
    });

    // For large trees, apply additional organization
    if (memberCount > 20) {
        // Group by generations for better organization
        const generationGroups = new Map();
        tree.people.forEach(person => {
            const gen = person.generation || 0;
            if (!generationGroups.has(gen)) {
                generationGroups.set(gen, []);
            }
            generationGroups.get(gen).push(person.id);
        });

        // Create subgraphs for each generation
        generationGroups.forEach((personIds, generation) => {
            if (personIds.length > 5) {
                const subgraphId = `gen-${generation}`;
                g.setNode(subgraphId, {
                    cluster: true,
                    label: `Generation ${generation}`,
                    style: 'fill: #f8f9fa',
                    margin: 30,
                    rank: 'same',
                    rankdir: 'LR'
                });
                
                personIds.forEach(pid => {
                    if (!g.parent(pid.toString())) {  // Only if not already in a family cluster
                        g.setParent(pid.toString(), subgraphId);
                    }
                });
            }
        });
    }

    // Apply layout with better configuration
    const layoutConfig = {
        rankdir: 'TB',
        nodesep: nodesep,
        ranksep: ranksep,
        marginx: marginx,
        marginy: marginy,
        acyclicer: 'greedy',
        ranker: 'tight-tree',
        align: 'UL',
        ranksep: ranksep,
        edgesep: nodesep / 2,
        ranker: 'longest-path',
        maxiter: 2000,  // Increased iterations for better layout
        compound: true
    };
    
    // Apply the layout
    dagre.layout(g, layoutConfig);

    // Calculate offsets with better bounds checking and padding
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    g.nodes().forEach(v => {
        const node = g.node(v);
        if (node) {
            // For clusters, use their bounds if available
            if (node.cluster) {
                if (node.x !== undefined && node.y !== undefined) {
                    minX = Math.min(minX, node.x - (node.width || 0) / 2);
                    minY = Math.min(minY, node.y - (node.height || 0) / 2);
                    maxX = Math.max(maxX, node.x + (node.width || 0) / 2);
                    maxY = Math.max(maxY, node.y + (node.height || 0) / 2);
                }
            } else {
                minX = Math.min(minX, node.x - (node.width || 0) / 2);
                minY = Math.min(minY, node.y - (node.height || 0) / 2);
                maxX = Math.max(maxX, node.x + (node.width || 0) / 2);
                maxY = Math.max(maxY, node.y + (node.height || 0) / 2);
            }
        }
    });

    // Ensure minimum bounds with padding
    const padding = 100;
    if (minX === Infinity) minX = 0;
    if (minY === Infinity) minY = 0;
    if (maxX === -Infinity) maxX = 100;
    if (maxY === -Infinity) maxY = 100;

    // Add padding
    minX -= padding;
    minY -= padding;
    maxX += padding;
    maxY += padding;

    const dagreLayoutOffsetX = -minX + padding;
    const dagreLayoutOffsetY = -minY + padding;

    // Update person positions
    g.nodes().forEach(v => {
        const personId = parseInt(v);
        if (!isNaN(personId) && tree.people.has(personId)) {
            const node = g.node(v);
            const person = tree.people.get(personId);
            person.x = node.x + dagreLayoutOffsetX;
            person.y = node.y + dagreLayoutOffsetY;
        }
    });

    return { g, dagreLayoutOffsetX, dagreLayoutOffsetY };
} 