export class FamilyTree {
    constructor() {
        this.people = new Map();
        this.nextId = 1;
        this.rootId = null;
    }

    addPerson(data) {
        // Prevent duplicate memberId
        if (data.memberId) {
            for (let person of this.people.values()) {
                if (person.memberId && person.memberId === data.memberId) {
                    // Already exists, do not add
                    return null;
                }
            }
        }
        const person = {
            id: this.nextId++,
            name: data.name || 'Unknown',
            gender: data.gender || 'male',
            age: data.age || '',
            birthOrder: data.birthOrder || 0,
            generation: data.generation !== undefined ? data.generation : null,
            x: data.x || 0,
            y: data.y || 0,
            parents: new Set(),
            children: new Set(),
            spouses: new Set(),
            siblings: new Set(),
            img: data.img || '',
            lifeStatus: data.lifeStatus || 'living',
            memberId: data.memberId || null,
        };
        this.people.set(person.id, person);
        if (!this.rootId) {
            this.rootId = person.id;
            person.generation = 0;
        }
        return person;
    }

    addRelation(person1Id, person2Id, relationType) {
        const p1 = this.people.get(person1Id);
        const p2 = this.people.get(person2Id);
        if (!p1 || !p2) return;

        switch(relationType) {
            case 'parent-child':
                p1.children.add(p2.id);
                p2.parents.add(p1.id);
                this.updateGenerations(p2.id, p1.generation + 1);
                this.updateSiblings(p2.id);
                break;
            case 'spouse':
                p1.spouses.add(p2.id);
                p2.spouses.add(p1.id);
                p2.generation = p1.generation;
                break;
        }
    }
    
    updateGenerations(startId, startGen) {
        const queue = [[startId, startGen]];
        const visited = new Set([startId]);
        const p = this.people.get(startId);
        if(p) p.generation = startGen;

        while (queue.length > 0) {
            const [currentId, currentGen] = queue.shift();
            const person = this.people.get(currentId);
            if (!person) continue;

            person.children.forEach(childId => {
                if (!visited.has(childId)) {
                    const child = this.people.get(childId);
                    if (child) child.generation = currentGen + 1;
                    visited.add(childId);
                    queue.push([childId, currentGen + 1]);
                }
            });
        }
    }

    updateSiblings(personId) {
        const person = this.people.get(personId);
        if (!person || person.parents.size === 0) return;
        
        const allSiblings = new Set();
        person.parents.forEach(parentId => {
            const parent = this.people.get(parentId);
            if(parent){
                parent.children.forEach(childId => {
                    if(childId !== personId) allSiblings.add(childId);
                });
            }
        });

        person.siblings = allSiblings;
        allSiblings.forEach(sibId => {
            const sibling = this.people.get(sibId);
            if(sibling) {
                sibling.siblings.add(personId);
                person.parents.forEach(p => sibling.parents.add(p));
            }
        });
    }
    
    getStats() {
        let total = 0, male = 0, female = 0;
        let minGeneration = Infinity;
        let maxGeneration = -Infinity;
        
        for (const person of this.people.values()) {
            total++;
            const gender = (person.gender || '').toLowerCase();
            if (gender === 'male') male++;
            else if (gender === 'female') female++;
            
            if (person.generation !== null && person.generation !== undefined) {
                if (person.generation < minGeneration) {
                    minGeneration = person.generation;
                }
                if (person.generation > maxGeneration) {
                    maxGeneration = person.generation;
                }
            }
        }
        
        // Calculate total generations as the range between min and max + 1
        const totalGenerations = (minGeneration !== Infinity && maxGeneration !== -Infinity) 
            ? (maxGeneration - minGeneration + 1) 
            : 1;
        
        return {
            total,
            male,
            female,
            generations: totalGenerations
        };
    }
} 