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
    let nodesep, ranksep, marginx, marginy, coupleSpacing, nodeWidth, nodeHeight;
    
    // Dynamic spacing based on tree size
    if (memberCount > 100) {
        nodesep = 120;  // Increased horizontal spacing
        ranksep = 180;  // Increased vertical spacing
        coupleSpacing = 80;  // More space between couples
        nodeWidth = 180;  // Increased node width
        nodeHeight = 80;   // Increased node height
    } else if (memberCount > 50) {
        nodesep = 100;
        ranksep = 160;
        coupleSpacing = 70;
        nodeWidth = 160;
        nodeHeight = 70;
    } else {
        nodesep = 180;
        ranksep = 50;
        coupleSpacing = 0;
        nodeWidth = 50;
        nodeHeight = 65;
    }
    marginx = 50;
    marginy = 50;

    g.setGraph({
        rankdir: 'TB',
        nodesep: nodesep,
        ranksep: ranksep,
        marginx: marginx,
        marginy: marginy,
        // Add clustering for better organization
        compound: true,
        // Use network-simplex for more stable layout
        ranker: 'network-simplex',
        // Allow edges to be very short
        minlen: 1,
        // Better edge routing
        edgesep: 10,
        // Use simpler edge routing
        ranker: 'tight-tree',
        // Disable complex acyclicer to prevent errors
        acyclicer: undefined,
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
                
                // Create a subgraph to keep spouses on the same rank
                const subgraphId = `spouse-group-${person.id}-${spouseId}`;
                
                // Add both spouses to the same subgraph to ensure same rank
                g.setNode(subgraphId, {
                    rank: 'same',
                    style: 'invis',
                    width: 0,
                    height: 0
                });
                
                // Add both spouses to this subgraph
                g.setParent(person.id.toString(), subgraphId);
                g.setParent(spouseId.toString(), subgraphId);
                
                // Connect spouses with a high-weight edge to keep them close
                g.setEdge(person.id.toString(), spouseId.toString(), {
                    weight: 1000,  // Very high weight to keep spouses together
                    minlen: 2,     // Minimal length between spouses
                    style: 'stroke: #ff69b4, stroke-width: 2',
                    curve: 'line',
                    arrowhead: 'none',
                    constraint: false
                });
                
                // Set node properties to ensure side-by-side layout
                const nodeOptions = {
                    rank: 'same',
                    width: nodeWidth,
                    height: nodeHeight,
                    fixedSize: true,
                    marginx: 20,
                    marginy: 10
                };
                
                g.setNode(person.id.toString(), {
                    ...g.node(person.id.toString()),
                    ...nodeOptions,
                    labelpos: 'r'
                });
                
                g.setNode(spouseId.toString(), {
                    ...g.node(spouseId.toString()),
                    ...nodeOptions,
                    labelpos: 'l'
                });
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
        // Simple connection between spouses with proper spacing
        g.setEdge(id1.toString(), id2.toString(), {
            weight: 1000,  // Very high weight to keep them together
            minlen: 2,     // Increased minimum length to prevent overlap
            style: 'stroke: #ff69b4, stroke-width: 2px',
            curve: 'line', // Straight line
            arrowhead: 'none',
            // Add invisible edge to help with layout
            edgeLabel: '',
            edgeLabelStyle: 'opacity:0',
            // Add more padding
            padding: 20,
            // Keep them on the same rank
            constraint: true,
            // Add fixed spacing
            width: 160,
            height: 80,
            // Add margins
            marginx: 15,
            marginy: 10,
            // Ensure they stay on the same level
            rank: 'same'
        });
        
        // Add them to the same rank
        g.setNode(id1.toString(), {
            ...g.node(id1.toString()),
            rank: 'same'
        });
        
        g.setNode(id2.toString(), {
            ...g.node(id2.toString()),
            rank: 'same'
        });
        
        // Add constraints to keep them on the same level
        // Set consistent node sizes and spacing for spouses
        const nodeOptions = {
            width: nodeWidth,  // Increased width for better spacing
            height: nodeHeight,  // Increased height
            padding: 20,  // More padding
            marginx: 30,  // More horizontal margin
            marginy: 20,  // More vertical margin
            rank: 'same', // Keep on same rank
            fixed: false,
            // Add minimum spacing
            minlen: 4,  // Increased minimum length
            // Ensure nodes don't overlap
            overlap: 'false',
            // Add more spacing around nodes
            margin: 20,
            // Fixed size constraints
            fixedsize: true,
            // More space for labels
            labeloffset: 15,
            // Force node dimensions
            nodeDimensionsIncludeLabels: true
        };
        
        // Apply to both nodes
        g.setNode(id1.toString(), {
            ...g.node(id1.toString()),
            ...nodeOptions
        });
        
        g.setNode(id2.toString(), {
            ...g.node(id2.toString()),
            ...nodeOptions
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
        nodesep: nodesep * 2,  // Further increased node separation
        ranksep: ranksep * 1.8,  // Further increased rank separation
        marginx: 100,   // Fixed large margins
        marginy: 100,
        acyclicer: 'greedy',
        ranker: 'network-simplex',  // Better for complex trees
        align: 'UL',
        edgesep: nodesep / 1.5,  // Better edge separation
        maxiter: 7000,  // Even more iterations for better layout
        compound: true,
        // Improved layout parameters
        nodeRankFactor: 2.5,  // Better node positioning
        // Better spacing control
        ranksep: ranksep,
        nodesep: nodesep,
        // Improved convergence
        tolerance: 0.00001,
        // Prevent node overlap with more strict settings
        overlap: 'false',
        overlap_shrink: true,
        overlap_scaling: 10,
        // Better edge routing
        splines: 'polyline',
        // More space between nodes
        edgesep: 80,
        // Better spacing for large trees
        ranksep: memberCount > 50 ? ranksep * 2 : ranksep * 1.5,
        // Prevent edge crossing
        acyclic: true,
        // Force node dimensions
        nodeDimensionsIncludeLabels: true,
        // Better edge routing
        edgeWeight: 2,
        // More space for labels
        labeloffset: 10
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