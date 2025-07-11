// Test file to demonstrate Tamil relationship mapping
import { FamilyTree } from './FamilyTree.jsx';
import { RelationshipCalculator } from './relationshipCalculator.js';

// Create a sample family tree to test relationships
export function createSampleFamilyTree() {
    const tree = new FamilyTree();
    
    // Add family members with birth order
    const raman = tree.addPerson({ name: 'ரமன்', gender: 'male', age: 60, birthOrder: 1 });
    const divya = tree.addPerson({ name: 'திவ்யா', gender: 'female', age: 58, birthOrder: 1 });
    
    // Add their children
    const shiro = tree.addPerson({ name: 'சிரோ', gender: 'female', age: 35, birthOrder: 1 });
    const laksh = tree.addPerson({ name: 'லட்சுமி', gender: 'male', age: 37, birthOrder: 2 });
    
    // Add grandchild
    const dhayan = tree.addPerson({ name: 'தயான்', gender: 'male', age: 10, birthOrder: 1 });
    
    // Add relationships
    tree.addRelation(raman.id, shiro.id, 'parent-child');
    tree.addRelation(divya.id, shiro.id, 'parent-child');
    tree.addRelation(raman.id, laksh.id, 'parent-child');
    tree.addRelation(divya.id, laksh.id, 'parent-child');
    tree.addRelation(raman.id, divya.id, 'spouse');
    tree.addRelation(shiro.id, dhayan.id, 'parent-child');
    tree.addRelation(laksh.id, dhayan.id, 'parent-child');
    tree.addRelation(shiro.id, laksh.id, 'spouse');
    
    return tree;
}

// Test function to show all relationships
export function testTamilRelationships() {
    const tree = createSampleFamilyTree();
    const calculator = new RelationshipCalculator(tree);
    
    console.log('=== Tamil Family Relationship Test ===');
    console.log('Family Tree Created Successfully!');
    
    // Test relationships from root (ரமன்) to all family members
    const rootId = 1; // ரமன்'s ID
    
    tree.people.forEach((person, personId) => {
        if (personId !== rootId) {
            const relationship = calculator.calculateRelationship(rootId, personId);
            const tamilTerm = calculator.getDetailedTamilRelationship(relationship.relationshipCode, 'tamil');
            
            console.log(`${person.name} (${person.gender}) -> ${tamilTerm} (Code: ${relationship.relationshipCode})`);
        }
    });
    
    // Test sibling relationship (elder/younger)
    const shiroId = 3;
    const lakshId = 4;
    const siblingRel = calculator.calculateRelationship(shiroId, lakshId);
    const siblingTamil = calculator.getDetailedTamilRelationship(siblingRel.relationshipCode, 'tamil');
    
    console.log(`\n=== Sibling Relationship Test ===`);
    console.log(`சிரோ -> லட்சுமி: ${siblingTamil} (Code: ${siblingRel.relationshipCode})`);
    
    // Test all relationships for a person
    console.log(`\n=== All Relationships for ரமன் ===`);
    const allRelationships = calculator.getAllRelationships(rootId);
    allRelationships.forEach(rel => {
        const tamilTerm = calculator.getDetailedTamilRelationship(rel.relationship.relationshipCode, 'tamil');
        console.log(`${rel.personName}: ${tamilTerm} (Code: ${rel.relationship.relationshipCode})`);
    });
    
    return tree;
}

// Function to get relationship between any two people
export function getRelationshipBetween(tree, person1Name, person2Name) {
    const calculator = new RelationshipCalculator(tree);
    
    // Find people by name
    let person1 = null, person2 = null;
    tree.people.forEach((person, id) => {
        if (person.name === person1Name) person1 = { ...person, id };
        if (person.name === person2Name) person2 = { ...person, id };
    });
    
    if (!person1 || !person2) {
        console.log('One or both people not found in the tree');
        return null;
    }
    
    const relationship = calculator.calculateRelationship(person1.id, person2.id);
    const tamilTerm = calculator.getDetailedTamilRelationship(relationship.relationshipCode, 'tamil');
    
    console.log(`${person1Name} -> ${person2Name}: ${tamilTerm} (Code: ${relationship.relationshipCode})`);
    return relationship;
}

// Export for use in other files
export { FamilyTree, RelationshipCalculator }; 