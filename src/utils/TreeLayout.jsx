import dagre from 'dagre';

export function autoArrange(tree) {
    const g = new dagre.graphlib.Graph({ compound: true });
    g.setGraph({
        rankdir: 'TB',
        nodesep: 120, // reduced horizontal space between boxes
        ranksep: 150, // reduced vertical space between boxes
        marginx: 80,
        marginy: 80,
    });
    g.setDefaultEdgeLabel(() => ({}));

    const personNodeSize = 100;
    const familyNodeSize = 10;
    const familyUnits = new Map();

    tree.people.forEach(p => {
        g.setNode(p.id.toString(), { label: p.name, width: personNodeSize, height: personNodeSize });
    });

    tree.people.forEach(person => {
        if (person.children.size > 0) {
            const parentIds = [person.id];
            person.spouses.forEach(spouseId => {
                const spouse = tree.people.get(spouseId);
                const isCoParent = [...person.children].every(childId => spouse.children.has(childId));
                if (isCoParent) parentIds.push(spouseId);
            });
            
            const parentKey = parentIds.sort().join('-');
            if (!familyUnits.has(parentKey)) {
                const familyId = `family-${parentKey}`;
                familyUnits.set(parentKey, familyId);
                g.setNode(familyId, { width: familyNodeSize, height: familyNodeSize });
                parentIds.forEach(pid => g.setEdge(pid.toString(), familyId, { weight: 10 }));
                
                const childrenOfThisUnit = [...person.children].filter(childId => {
                    const child = tree.people.get(childId);
                    return [...child.parents].sort().join('-') === parentKey;
                });
                childrenOfThisUnit.forEach(cid => g.setEdge(familyId, cid.toString()));
            }
        }

        person.spouses.forEach(spouseId => {
            if (person.id < spouseId) {
                const spouse = tree.people.get(spouseId);
                const commonChildren = [...person.children].filter(c => spouse.children.has(c));
                if (commonChildren.length === 0) {
                    const clusterId = `cluster-${person.id}-${spouseId}`;
                    g.setParent(person.id.toString(), clusterId);
                    g.setParent(spouseId.toString(), clusterId);
                }
            }
        });
    });

    dagre.layout(g);

    let minX = Infinity, minY = Infinity;
    g.nodes().forEach(v => {
        const node = g.node(v);
        if (node) {
            minX = Math.min(minX, node.x - node.width / 2);
            minY = Math.min(minY, node.y - node.height / 2);
        }
    });

    const dagreLayoutOffsetX = (minX === Infinity) ? 50 : -minX + 50;
    const dagreLayoutOffsetY = (minY === Infinity) ? 50 : -minY + 50;

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