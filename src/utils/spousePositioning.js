/**
 * Utility functions for dynamic spouse card positioning in family tree
 */

/**
 * Calculate optimal positioning for spouse cards based on gender and context
 */
export function calculateSpouseCardPosition(person, spouse, familyContext = {}) {
    const { memberCount = 0, generation = 0 } = familyContext;
    
    // Base spacing adjustments based on tree size
    const baseSpacing = memberCount > 50 ? 80 : 120;
    const verticalOffset = 0; // Spouses stay on same level
    
    // Gender-based positioning strategy
    let strategy = 'neutral';
    let leftPerson = person;
    let rightPerson = spouse;
    
    if (person.gender === 'male' && spouse.gender === 'female') {
        strategy = 'traditional';
        leftPerson = person;
        rightPerson = spouse;
    } else if (person.gender === 'female' && spouse.gender === 'male') {
        strategy = 'traditional';
        leftPerson = spouse;
        rightPerson = person;
    } else {
        // Same gender or unknown: use ID-based positioning
        strategy = 'neutral';
        leftPerson = person.id < spouse.id ? person : spouse;
        rightPerson = person.id < spouse.id ? spouse : person;
    }
    
    return {
        strategy,
        spacing: baseSpacing,
        positions: {
            [leftPerson.id]: {
                x: -baseSpacing / 2,
                y: verticalOffset,
                z: 0
            },
            [rightPerson.id]: {
                x: baseSpacing / 2,
                y: verticalOffset,
                z: 0
            }
        },
        metadata: {
            leftPerson: leftPerson.id,
            rightPerson: rightPerson.id,
            relationshipType: 'spouse',
            generation
        }
    };
}

/**
 * Apply spouse positioning to family tree data
 */
export function applySpousePositioning(treeData, spouseRelationships) {
    const updatedPeople = new Map(treeData.people);
    
    spouseRelationships.forEach(relationship => {
        const { person1Id, person2Id, familyContext } = relationship;
        const person1 = updatedPeople.get(person1Id);
        const person2 = updatedPeople.get(person2Id);
        
        if (person1 && person2) {
            const positioning = calculateSpouseCardPosition(person1, person2, familyContext);
            
            // Apply relative positioning
            const baseX = (person1.x + person2.x) / 2;
            const baseY = (person1.y + person2.y) / 2;
            
            person1.x = baseX + positioning.positions[person1Id].x;
            person1.y = baseY + positioning.positions[person1Id].y;
            
            person2.x = baseX + positioning.positions[person2Id].x;
            person2.y = baseY + positioning.positions[person2Id].y;
            
            // Add positioning metadata
            person1.spousePositioning = positioning.metadata;
            person2.spousePositioning = positioning.metadata;
        }
    });
    
    return {
        ...treeData,
        people: updatedPeople
    };
}

/**
 * Generate spouse card creation request data
 */
export function generateSpouseCardData(yourPersonId, spouseUserId, familyCode, positioningStrategy) {
    return {
        yourPersonId,
        spouseUserId,
        positioningInfo: {
            strategy: positioningStrategy.strategy,
            spousePosition: positioningStrategy.positions[spouseUserId] || { x: 60, y: 0, z: 0 },
            yourPosition: positioningStrategy.positions[yourPersonId] || { x: -60, y: 0, z: 0 },
            metadata: positioningStrategy.metadata
        }
    };
}

/**
 * Validate spouse positioning data
 */
export function validateSpousePositioning(positioningData) {
    const required = ['strategy', 'positions', 'metadata'];
    const missing = required.filter(field => !positioningData[field]);
    
    if (missing.length > 0) {
        throw new Error(`Missing required positioning fields: ${missing.join(', ')}`);
    }
    
    return true;
}
