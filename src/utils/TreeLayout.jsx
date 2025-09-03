import dagre from 'dagre';

export function autoArrange(tree) {
    const g = new dagre.graphlib.Graph({ compound: true });
    
    // Dynamic spacing based on tree size
    const memberCount = tree.people.size;
    let nodesep, ranksep, marginx, marginy;
    
    if (memberCount <= 10) {
        nodesep = 120;
        ranksep = 150;
        marginx = 80;
        marginy = 80;
    } else if (memberCount <= 25) {
        nodesep = 100;
        ranksep = 130;
        marginx = 60;
        marginy = 60;
    } else if (memberCount <= 50) {
        nodesep = 80;
        ranksep = 110;
        marginx = 50;
        marginy = 50;
    } else if (memberCount <= 100) {
        nodesep = 60;
        ranksep = 90;
        marginx = 40;
        marginy = 40;
    } else {
        // For 100+ members, use compact layout
        nodesep = 50;
        ranksep = 70;
        marginx = 30;
        marginy = 30;
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

    const personNodeSize = memberCount > 50 ? 80 : 100; // Smaller nodes for large trees
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

    // Create family units and connections
    tree.people.forEach(person => {
        if (person.children.size > 0) {
            const parentIds = [person.id];
            person.spouses.forEach(spouseId => {
                const spouse = tree.people.get(spouseId);
                if (!spouse) return; // skip if spouse not found in tree
                const isCoParent = [...person.children].every(childId => spouse.children && spouse.children.has(childId));
                if (isCoParent) parentIds.push(spouseId);
            });
            
            const parentKey = parentIds.sort().join('-');
            if (!familyUnits.has(parentKey)) {
                const familyId = `family-${parentKey}`;
                familyUnits.set(parentKey, familyId);
                g.setNode(familyId, { width: familyNodeSize, height: familyNodeSize });
                
                // Connect parents to family node
                parentIds.forEach(pid => {
                    g.setEdge(pid.toString(), familyId, { weight: 10 });
                });
                
                // Connect family node to children
                [...person.children].forEach(childId => {
                    g.setEdge(familyId, childId.toString());
                });
            }
        }

        // Create spouse clusters for better organization
        person.spouses.forEach(spouseId => {
            if (person.id < spouseId) {
                const spouse = tree.people.get(spouseId);
                if (!spouse) return; // spouse not found
                const commonChildren = [...person.children].filter(c => spouse.children && spouse.children.has(c));
                if (commonChildren.length === 0) {
                    const clusterId = `cluster-${person.id}-${spouseId}`;
                    g.setParent(person.id.toString(), clusterId);
                    g.setParent(spouseId.toString(), clusterId);
                }
            }
        });
    });

    // For very large trees, use hierarchical layout
    if (memberCount > 100) {
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
            if (personIds.length > 10) {
                const subgraphId = `subgraph-gen-${generation}`;
                personIds.forEach(pid => {
                    g.setParent(pid.toString(), subgraphId);
                });
            }
        });
    }

    // Apply layout
    dagre.layout(g);

    // Calculate offsets with better bounds checking
    let minX = Infinity, minY = Infinity, maxX = -Infinity, maxY = -Infinity;
    g.nodes().forEach(v => {
        const node = g.node(v);
        if (node) {
            minX = Math.min(minX, node.x - node.width / 2);
            minY = Math.min(minY, node.y - node.height / 2);
            maxX = Math.max(maxX, node.x + node.width / 2);
            maxY = Math.max(maxY, node.y + node.height / 2);
        }
    });

    // Ensure minimum bounds
    if (minX === Infinity) minX = 0;
    if (minY === Infinity) minY = 0;
    if (maxX === -Infinity) maxX = 100;
    if (maxY === -Infinity) maxY = 100;

    const dagreLayoutOffsetX = -minX + 50;
    const dagreLayoutOffsetY = -minY + 50;

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