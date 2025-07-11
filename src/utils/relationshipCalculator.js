// Family Relationship Calculator
// This utility calculates the relationship between any two people in a family tree

import tamilTranslations from './lang_tamil.js';

export class RelationshipCalculator {
  constructor(tree) {
    this.tree = tree;
    this.people = tree.people;
  }

  // Calculate relationship between two people
  calculateRelationship(person1Id, person2Id) {
    if (person1Id === person2Id) {
      return { type: 'self', description: 'self', relationshipCode: 'self' };
    }

    const person1 = this.people.get(person1Id);
    const person2 = this.people.get(person2Id);

    if (!person1 || !person2) {
      return { type: 'unknown', description: 'unknown', relationshipCode: 'unknown' };
    }

    // Check direct relationships first
    const directRelation = this.checkDirectRelationship(person1, person2);
    if (directRelation) return directRelation;

    // Check through parents
    const parentRelation = this.checkThroughParents(person1, person2);
    if (parentRelation) return parentRelation;

    // Check through spouses
    const spouseRelation = this.checkThroughSpouses(person1, person2);
    if (spouseRelation) return spouseRelation;

    // Check through siblings
    const siblingRelation = this.checkThroughSiblings(person1, person2);
    if (siblingRelation) return siblingRelation;

    // Check complex relationships
    const complexRelation = this.checkComplexRelationships(person1, person2);
    if (complexRelation) return complexRelation;

    // If not found, use path-based code
    const path = this.getRelationshipPath(person1Id, person2Id);
    if (path && path.length > 0) {
      const code = this.getRelationshipCodeFromPath(path, person1, person2);
      return {
        type: 'custom',
        description: this.getDetailedTamilRelationship(code, 'tamil'),
        relationshipCode: code
      };
    }

    return { type: 'unknown', description: 'unknown', relationshipCode: 'unknown' };
  }

  // Check direct relationships (parent-child, spouse, sibling)
  checkDirectRelationship(person1, person2) {
    // Check if person2 is spouse of any of person1's children (son-in-law/daughter-in-law)
    for (const childId of person1.children) {
      const child = this.people.get(childId);
      if (child && child.spouses.has(person2.id)) {
        const relationshipCode = person2.gender === 'male' ? 'DH' : 'DW';
        return {
          type: person2.gender === 'male' ? 'sonInLaw' : 'daughterInLaw',
          description: person2.gender === 'male' ? 'sonInLaw' : 'daughterInLaw',
          generationDiff: 1,
          relationshipCode
        };
      }
    }
    // Grandchild relationship (my child's child)
    for (const childId of person1.children) {
      const child = this.people.get(childId);
      if (child && child.children.has(person2.id)) {
        const relationshipCode = person2.gender === 'male' ? 'SS' : 'SD';
        return {
          type: person2.gender === 'male' ? 'grandson' : 'granddaughter',
          description: person2.gender === 'male' ? 'grandson' : 'granddaughter',
          generationDiff: 2,
          relationshipCode
        };
      }
    }
    // Parent-child relationship
    if (person1.parents.has(person2.id)) {
      const relationshipCode = person2.gender === 'male' ? 'F' : 'M';
      return {
        type: person2.gender === 'male' ? 'father' : 'mother',
        description: person2.gender === 'male' ? 'father' : 'mother',
        generationDiff: -1,
        relationshipCode
      };
    }

    if (person1.children.has(person2.id)) {
      const relationshipCode = person2.gender === 'male' ? 'S' : 'D';
      return {
        type: person2.gender === 'male' ? 'son' : 'daughter',
        description: person2.gender === 'male' ? 'son' : 'daughter',
        generationDiff: 1,
        relationshipCode
      };
    }

    // Spouse relationship
    if (person1.spouses.has(person2.id)) {
      const relationshipCode = person2.gender === 'male' ? 'H' : 'W';
      return {
        type: person2.gender === 'male' ? 'husband' : 'wife',
        description: person2.gender === 'male' ? 'husband' : 'wife',
        generationDiff: 0,
        relationshipCode
      };
    }

    // Sibling relationship
    if (person1.siblings.has(person2.id)) {
      // Determine if elder or younger sibling
      const birthOrder1 = person1.birthOrder || 0;
      const birthOrder2 = person2.birthOrder || 0;
      let relationshipCode;
      
      if (person2.gender === 'male') {
        relationshipCode = birthOrder2 < birthOrder1 ? 'B+' : 'B-';
      } else {
        relationshipCode = birthOrder2 < birthOrder1 ? 'Z+' : 'Z-';
      }
      
      return {
        type: person2.gender === 'male' ? 'brother' : 'sister',
        description: person2.gender === 'male' ? 'brother' : 'sister',
        generationDiff: 0,
        relationshipCode
      };
    }

    return null;
  }

  // Check relationships through parents
  checkThroughParents(person1, person2) {
    // Grandparent-grandchild
    for (const parentId of person1.parents) {
      const parent = this.people.get(parentId);
      if (parent && parent.parents.has(person2.id)) {
        const relationshipCode = person2.gender === 'male' ? 'FF' : 'FM';
        return {
          type: person2.gender === 'male' ? 'grandfather' : 'grandmother',
          description: person2.gender === 'male' ? 'grandfather' : 'grandmother',
          generationDiff: -2,
          relationshipCode
        };
      }
    }

    // Uncle/Aunt - Niece/Nephew
    for (const parentId of person1.parents) {
      const parent = this.people.get(parentId);
      if (parent && parent.siblings.has(person2.id)) {
        // Use birth order to distinguish elder/younger
        const parentBirthOrder = parent.birthOrder || 0;
        const uncleAuntBirthOrder = person2.birthOrder || 0;
        let relationshipCode;
        if (parent.gender === 'male') {
          // Father's side
          if (person2.gender === 'male') {
            relationshipCode = uncleAuntBirthOrder < parentBirthOrder ? 'FB+' : 'FB';
          } else {
            relationshipCode = uncleAuntBirthOrder < parentBirthOrder ? 'FZ+' : 'FZ';
          }
        } else {
          // Mother's side
          if (person2.gender === 'male') {
            relationshipCode = uncleAuntBirthOrder < parentBirthOrder ? 'MB+' : 'MB';
          } else {
            relationshipCode = uncleAuntBirthOrder < parentBirthOrder ? 'MZ+' : 'MZ';
          }
        }
        return {
          type: person2.gender === 'male' ? 'uncle' : 'aunt',
          description: person2.gender === 'male' ? 'uncle' : 'aunt',
          generationDiff: -1,
          relationshipCode
        };
      }
    }

    // Cousin relationship
    for (const parent1Id of person1.parents) {
      const parent1 = this.people.get(parent1Id);
      if (parent1) {
        for (const parent2Id of person2.parents) {
          const parent2 = this.people.get(parent2Id);
          if (parent2 && parent1.siblings.has(parent2.id)) {
            // Determine cousin type based on parent relationship
            const parent1Gender = parent1.gender;
            const parent2Gender = parent2.gender;
            let relationshipCode;
            
            if (parent1Gender === 'male' && parent2Gender === 'male') {
              // Father's brother's children
              relationshipCode = person2.gender === 'male' ? 'FB+S' : 'FB+D';
            } else if (parent1Gender === 'male' && parent2Gender === 'female') {
              // Father's sister's children
              relationshipCode = person2.gender === 'male' ? 'FZ+S' : 'FZ+D';
            } else if (parent1Gender === 'female' && parent2Gender === 'male') {
              // Mother's brother's children
              relationshipCode = person2.gender === 'male' ? 'MB+S' : 'MB+D';
            } else {
              // Mother's sister's children
              relationshipCode = person2.gender === 'male' ? 'MZ+S' : 'MZ+D';
            }
            
            return {
              type: 'cousin',
              description: 'cousin',
              generationDiff: 0,
              relationshipCode
            };
          }
        }
      }
    }

    return null;
  }

  // Check relationships through spouses
  checkThroughSpouses(person1, person2) {
    // In-law relationships
    for (const spouseId of person1.spouses) {
      const spouse = this.people.get(spouseId);
      if (spouse) {
        // Father-in-law, Mother-in-law
        if (spouse.parents.has(person2.id)) {
          const relationshipCode = person2.gender === 'male' ? 'FF' : 'FM';
          return {
            type: person2.gender === 'male' ? 'fatherInLaw' : 'motherInLaw',
            description: person2.gender === 'male' ? 'fatherInLaw' : 'motherInLaw',
            generationDiff: -1,
            relationshipCode
          };
        }

        // Brother-in-law, Sister-in-law
        if (spouse.siblings.has(person2.id)) {
          // Determine specific in-law type based on spouse's gender and birth order
          const spouseGender = spouse.gender;
          const spouseBirthOrder = spouse.birthOrder || 0;
          const inLawBirthOrder = person2.birthOrder || 0;
          let relationshipCode;
          
          if (spouseGender === 'male') {
            // Husband's side
            if (person2.gender === 'male') {
              relationshipCode = inLawBirthOrder < spouseBirthOrder ? 'HB+' : 'HB-';
            } else {
              relationshipCode = inLawBirthOrder < spouseBirthOrder ? 'HZ+' : 'HZ-';
            }
          } else {
            // Wife's side
            if (person2.gender === 'male') {
              relationshipCode = inLawBirthOrder < spouseBirthOrder ? 'WB+' : 'WB-';
            } else {
              relationshipCode = inLawBirthOrder < spouseBirthOrder ? 'WZ+' : 'WZ-';
            }
          }
          
          return {
            type: person2.gender === 'male' ? 'brotherInLaw' : 'sisterInLaw',
            description: person2.gender === 'male' ? 'brotherInLaw' : 'sisterInLaw',
            generationDiff: 0,
            relationshipCode
          };
        }
      }
    }

    return null;
  }

  // Check relationships through siblings
  checkThroughSiblings(person1, person2) {
    // Niece/Nephew
    for (const siblingId of person1.siblings) {
      const sibling = this.people.get(siblingId);
      if (sibling && sibling.children.has(person2.id)) {
        const relationshipCode = person2.gender === 'male' ? 'BS' : 'BD';
        return {
          type: person2.gender === 'male' ? 'nephew' : 'niece',
          description: person2.gender === 'male' ? 'nephew' : 'niece',
          generationDiff: 1,
          relationshipCode
        };
      }
    }

    return null;
  }

  // Check complex relationships (great-grandparents, etc.)
  checkComplexRelationships(person1, person2) {
    // Great-grandparent relationship
    for (const parentId of person1.parents) {
      const parent = this.people.get(parentId);
      if (parent) {
        for (const grandparentId of parent.parents) {
          const grandparent = this.people.get(grandparentId);
          if (grandparent && grandparent.parents.has(person2.id)) {
            const relationshipCode = person2.gender === 'male' ? 'FFF' : 'FFM';
            return {
              type: person2.gender === 'male' ? 'greatGrandfather' : 'greatGrandmother',
              description: person2.gender === 'male' ? 'greatGrandfather' : 'greatGrandmother',
              generationDiff: -3,
              relationshipCode
            };
          }
        }
      }
    }

    // Great-grandchild relationship
    for (const childId of person1.children) {
      const child = this.people.get(childId);
      if (child) {
        for (const grandchildId of child.children) {
          const grandchild = this.people.get(grandchildId);
          if (grandchild && grandchild.children.has(person2.id)) {
            const relationshipCode = person2.gender === 'male' ? 'SSS' : 'SSD';
            return {
              type: person2.gender === 'male' ? 'greatGrandson' : 'greatGranddaughter',
              description: person2.gender === 'male' ? 'greatGrandson' : 'greatGranddaughter',
              generationDiff: 3,
              relationshipCode
            };
          }
        }
      }
    }

    return null;
  }

  // Get all relationships for a person
  getAllRelationships(personId) {
    const relationships = [];
    const person = this.people.get(personId);
    
    if (!person) return relationships;

    this.people.forEach((otherPerson, otherId) => {
      if (otherId !== personId) {
        const relationship = this.calculateRelationship(personId, otherId);
        if (relationship.type !== 'unknown') {
          relationships.push({
            personId: otherId,
            personName: otherPerson.name,
            personGender: otherPerson.gender,
            relationship: relationship
          });
        }
      }
    });

    return relationships.sort((a, b) => {
      // Sort by generation difference first, then by relationship type
      const genDiffA = a.relationship.generationDiff || 0;
      const genDiffB = b.relationship.generationDiff || 0;
      if (genDiffA !== genDiffB) return genDiffA - genDiffB;
      return a.relationship.type.localeCompare(b.relationship.type);
    });
  }

  // Get relationship path between two people
  getRelationshipPath(person1Id, person2Id) {
    if (person1Id === person2Id) {
      return [{ type: 'self', personId: person1Id }];
    }

    const visited = new Set();
    const queue = [{ personId: person1Id, path: [] }];
    
    while (queue.length > 0) {
      const { personId: currentId, path } = queue.shift();
      
      if (currentId === person2Id) {
        return path;
      }
      
      if (visited.has(currentId)) continue;
      visited.add(currentId);
      
      const person = this.people.get(currentId);
      if (!person) continue;
      
      // Check parents
      for (const parentId of person.parents) {
        if (!visited.has(parentId)) {
          queue.push({
            personId: parentId,
            path: [...path, { type: 'parent', personId: currentId, targetId: parentId }]
          });
        }
      }
      
      // Check children
      for (const childId of person.children) {
        if (!visited.has(childId)) {
          queue.push({
            personId: childId,
            path: [...path, { type: 'child', personId: currentId, targetId: childId }]
          });
        }
      }
      
      // Check spouses
      for (const spouseId of person.spouses) {
        if (!visited.has(spouseId)) {
          queue.push({
            personId: spouseId,
            path: [...path, { type: 'spouse', personId: currentId, targetId: spouseId }]
          });
        }
      }
      
      // Check siblings
      for (const siblingId of person.siblings) {
        if (!visited.has(siblingId)) {
          queue.push({
            personId: siblingId,
            path: [...path, { type: 'sibling', personId: currentId, targetId: siblingId }]
          });
        }
      }
    }
    
    return null; // No path found
  }

  // Get generation difference between two people
  getGenerationDifference(person1Id, person2Id) {
    const person1 = this.people.get(person1Id);
    const person2 = this.people.get(person2Id);
    
    if (!person1 || !person2) return 0;
    
    return (person2.generation || 0) - (person1.generation || 0);
  }

  // Get detailed Tamil relationship using relationship code
  getDetailedTamilRelationship(relationshipCode, language = 'tamil') {
    if (language === 'tamil' && tamilTranslations[relationshipCode]) {
      return tamilTranslations[relationshipCode];
    }
    
    // Fallback to basic relationship types
    const basicRelationships = {
      'F': 'father', 'M': 'mother', 'S': 'son', 'D': 'daughter',
      'H': 'husband', 'W': 'wife', 'B+': 'elder brother', 'B-': 'younger brother',
      'Z+': 'elder sister', 'Z-': 'younger sister'
    };
    
    return basicRelationships[relationshipCode] || relationshipCode;
  }

  // Helper: Convert a relationship path to a code string (e.g., FFF, SSS, FB+S, etc.)
  getRelationshipCodeFromPath(path, person1, person2) {
    if (!path || path.length === 0) return '';
    let code = '';
    let currentGender = person1.gender;
    let lastType = null;
    for (const step of path) {
      if (step.type === 'parent') {
        code += 'F';
        currentGender = this.people.get(step.targetId)?.gender || currentGender;
      } else if (step.type === 'child') {
        code += 'S';
        currentGender = this.people.get(step.targetId)?.gender || currentGender;
      } else if (step.type === 'spouse') {
        code += (currentGender === 'male' ? 'W' : 'H');
        // Spouse doesn't change gender context
      } else if (step.type === 'sibling') {
        // Use birth order to distinguish elder/younger
        const from = this.people.get(step.personId);
        const to = this.people.get(step.targetId);
        if (to.gender === 'male') {
          code += (to.birthOrder < from.birthOrder ? 'B+' : 'B-');
        } else {
          code += (to.birthOrder < from.birthOrder ? 'Z+' : 'Z-');
        }
        currentGender = to.gender;
      }
      lastType = step.type;
    }
    return code;
  }
} 