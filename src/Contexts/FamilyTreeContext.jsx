import React, { createContext, useContext, useState, useCallback } from 'react';
import dagre from 'dagre';

const FamilyTreeContext = createContext();

// Helper to create a new person object
function createPerson(data, nextId, generation = null) {
  return {
    id: nextId,
    name: data.name || 'Unknown',
    gender: data.gender || 'male',
    age: data.age || '',
    img: data.img || '',
    generation,
    x: 0,
    y: 0,
    parents: new Set(),
    children: new Set(),
    spouses: new Set(),
    siblings: new Set(),
  };
}

function clonePeopleMap(map) {
  // Deep clone the people map for undo/redo
  const newMap = new Map();
  map.forEach((p, id) => {
    newMap.set(id, {
      ...p,
      parents: new Set(p.parents),
      children: new Set(p.children),
      spouses: new Set(p.spouses),
      siblings: new Set(p.siblings),
    });
  });
  return newMap;
}

// Helper to recalculate generations for the whole tree
function recalculateGenerations(people) {
  // Find all roots (nodes with no parents)
  const roots = [];
  people.forEach((p) => {
    if (!p.parents || p.parents.size === 0) roots.push(p.id);
  });
  // BFS from roots, assign generation
  const visited = new Set();
  const queue = [];
  roots.forEach((id) => {
    queue.push({ id, gen: 0 });
  });
  while (queue.length > 0) {
    const { id, gen } = queue.shift();
    if (visited.has(id)) continue;
    visited.add(id);
    const p = people.get(id);
    if (p) {
      p.generation = gen;
      p.children && p.children.forEach((cid) => {
        queue.push({ id: cid, gen: gen + 1 });
      });
    }
  }
  // Debug: Print all people's generations after recalculation
  console.log('--- Generations after recalc ---');
  people.forEach((p) => {
    console.log(`${p.name} (id:${p.id}): gen ${p.generation}`);
  });
}

export const FamilyTreeProvider = ({ children }) => {
  const [people, setPeople] = useState(() => {
    // Start with a root person
    const root = createPerson({ name: 'You', gender: 'male', age: 30 }, 1, 0);
    return new Map([[1, root]]);
  });
  const [nextId, setNextId] = useState(2);
  const [rootId] = useState(1);

  // Undo/redo stacks
  const [history, setHistory] = useState([]);
  const [future, setFuture] = useState([]);

  // Helper to push current state to history
  const pushHistory = useCallback(() => {
    setHistory(prev => [...prev, clonePeopleMap(people)]);
    setFuture([]);
  }, [people]);

  // Undo
  const undo = useCallback(() => {
    setHistory(prev => {
      if (prev.length === 0) return prev;
      setFuture(fut => [clonePeopleMap(people), ...fut]);
      setPeople(clonePeopleMap(prev[prev.length - 1]));
      return prev.slice(0, -1);
    });
  }, [people]);

  // Redo
  const redo = useCallback(() => {
    setFuture(prev => {
      if (prev.length === 0) return prev;
      setHistory(hist => [...hist, clonePeopleMap(people)]);
      setPeople(clonePeopleMap(prev[0]));
      return prev.slice(1);
    });
  }, [people]);

  const canUndo = history.length > 0;
  const canRedo = future.length > 0;

  // Add a new person
  const addPerson = useCallback((data, generation = null) => {
    pushHistory();
    setPeople(prev => {
      const newPerson = createPerson(data, nextId, generation);
      const newMap = new Map(prev);
      newMap.set(nextId, newPerson);
      // Recalculate generations
      recalculateGenerations(newMap);
      return newMap;
    });
    setNextId(id => id + 1);
    return nextId;
  }, [nextId, pushHistory]);

  // Edit a person
  const editPerson = useCallback((id, updates) => {
    pushHistory();
    setPeople(prev => {
      const newMap = new Map(prev);
      const person = newMap.get(id);
      if (person) {
        Object.assign(person, updates);
        newMap.set(id, { ...person });
      }
      // Recalculate generations
      recalculateGenerations(newMap);
      return newMap;
    });
  }, [pushHistory]);

  // Delete a person and clean up relationships
  const deletePerson = useCallback((id) => {
    pushHistory();
    setPeople(prev => {
      const newMap = new Map(prev);
      newMap.delete(id);
      newMap.forEach(person => {
        person.parents.delete(id);
        person.children.delete(id);
        person.spouses.delete(id);
        person.siblings.delete(id);
      });
      // Recalculate generations
      recalculateGenerations(newMap);
      return newMap;
    });
  }, [pushHistory]);

  // Add a relationship
  const addRelation = useCallback((id1, id2, type) => {
    pushHistory();
    setPeople(prev => {
      const newMap = new Map(prev);
      const p1 = newMap.get(id1);
      const p2 = newMap.get(id2);
      if (!p1 || !p2) return newMap;
      if (type === 'parent') {
        p1.children.add(id2);
        p2.parents.add(id1);
      } else if (type === 'child') {
        p1.parents.add(id2);
        p2.children.add(id1);
      } else if (type === 'spouse') {
        p1.spouses.add(id2);
        p2.spouses.add(id1);
      } else if (type === 'sibling') {
        p1.siblings.add(id2);
        p2.siblings.add(id1);
      }
      newMap.set(id1, { ...p1 });
      newMap.set(id2, { ...p2 });
      // Recalculate generations
      recalculateGenerations(newMap);
      return newMap;
    });
  }, [pushHistory]);

  // Arrange the tree using dagre
  const arrangeTree = useCallback(() => {
    const g = new dagre.graphlib.Graph({ compound: true });
    g.setGraph({ compound: true, rankdir: 'TB', nodesep: 60, ranksep: 90, marginx: 80, marginy: 80, ranker: 'longest-path' });
    g.setDefaultEdgeLabel(() => ({}));
    // 1. Add all person nodes first
    people.forEach(p => {
      g.setNode(p.id.toString(), { label: p.name, width: 140, height: 120, rank: p.generation });
    });
    // 2. Add only parent-child edges for layout
    people.forEach(person => {
      person.children.forEach(childId => {
        g.setEdge(person.id.toString(), childId.toString());
      });
    });
    // (Optional) Spouse and sibling edges can be drawn visually elsewhere, but not added to dagre for layout
    dagre.layout(g);
    // Debug: Print node positions and generations after layout
    g.nodes().forEach(v => {
      const node = g.node(v);
      if (node) {
        const person = people.get(parseInt(v));
        if (person) {
          console.log(`Node ${v} (${person.name}): gen ${person.generation}, y=${node.y}`);
        }
      }
    });
    setPeople(prev => {
      const newMap = new Map(prev);
      g.nodes().forEach(v => {
        const node = g.node(v);
        const id = parseInt(v);
        if (!isNaN(id) && newMap.has(id)) {
          newMap.get(id).x = node.x;
          newMap.get(id).y = node.y;
        }
      });
      recalculateGenerations(newMap);
      return newMap;
    });
  }, [people]);

  // Download tree data
  const downloadTreeData = useCallback(() => {
    const peopleArr = Array.from(people.values()).map(p => ({
      ...p,
      parents: Array.from(p.parents),
      children: Array.from(p.children),
      spouses: Array.from(p.spouses),
      siblings: Array.from(p.siblings),
    }));
    const dataStr = JSON.stringify({ people: peopleArr }, null, 2);
    const blob = new Blob([dataStr], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = 'family-tree-data.json';
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  }, [people]);

  // Stats
  const getStats = useCallback(() => {
    let male = 0, female = 0;
    const generations = new Set();
    people.forEach(p => {
      if (p.gender === 'male') male++;
      else female++;
      if (p.generation !== null) generations.add(p.generation);
    });
    return {
      total: people.size,
      male,
      female,
      generations: people.size > 0 ? (Math.max(...[...generations]) - Math.min(...[...generations]) + 1) : 0
    };
  }, [people]);

  return (
    <FamilyTreeContext.Provider value={{
      people,
      rootId,
      addPerson,
      editPerson,
      deletePerson,
      addRelation,
      arrangeTree,
      downloadTreeData,
      getStats,
      undo,
      redo,
      canUndo,
      canRedo,
    }}>
      {children}
    </FamilyTreeContext.Provider>
  );
};

export const useFamilyTreeContext = () => useContext(FamilyTreeContext); 