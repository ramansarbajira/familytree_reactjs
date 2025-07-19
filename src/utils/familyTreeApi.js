// API utility for family tree CRUD operations

const API_BASE = '/family-tree';

function getToken() {
  return localStorage.getItem('access_token');
}

function authHeaders() {
  const token = getToken();
  return {
    'Content-Type': 'application/json',
    ...(token ? { Authorization: `Bearer ${token}` } : {}),
  };
}

export async function fetchFamilyTree(familyCode) {
  if (!familyCode) throw new Error('familyCode is required');
  const res = await fetch(`${API_BASE}?familyCode=${familyCode}`, {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch family tree');
  const data = await res.json();
  return data.people;
}

export async function addPerson(person, familyCode) {
  if (!familyCode) throw new Error('familyCode is required');
  const { memberId, userId, ...rest } = person;
  // Fix types and remove img
  const payload = {
    ...rest,
    familyCode,
    age: person.age ? parseInt(person.age, 10) : undefined,
    parents: Array.isArray(person.parents) ? person.parents : [],
    children: Array.isArray(person.children) ? person.children : [],
    spouses: Array.isArray(person.spouses) ? person.spouses : [],
    siblings: Array.isArray(person.siblings) ? person.siblings : [],
    isDummy: typeof person.isDummy === 'boolean' ? person.isDummy : false,
  };
  delete payload.img;
  const res = await fetch(`${API_BASE}/person`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify(payload),
  });
  if (!res.ok) throw new Error('Failed to add person');
  return await res.json();
}

export async function editPerson(id, person, familyCode) {
  if (!familyCode) throw new Error('familyCode is required');
  const res = await fetch(`${API_BASE}/person/${id}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ ...person, familyCode }),
  });
  if (!res.ok) throw new Error('Failed to edit person');
  return await res.json();
}

export async function deletePerson(id, familyCode) {
  if (!familyCode) throw new Error('familyCode is required');
  const res = await fetch(`${API_BASE}/person/${id}`, {
    method: 'DELETE',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to delete person');
  return true;
}

export async function saveFamilyTree(people, familyCode) {
  if (!familyCode) throw new Error('familyCode is required');
  const res = await fetch(`${API_BASE}/save`, {
    method: 'POST',
    headers: authHeaders(),
    body: JSON.stringify({ people, familyCode }),
  });
  if (!res.ok) throw new Error('Failed to save family tree');
  return true;
}

// Fetch all relationships with multilingual descriptions
export async function fetchRelationships() {
  const res = await fetch('/api/relationships', {
    method: 'GET',
    headers: authHeaders(),
  });
  if (!res.ok) throw new Error('Failed to fetch relationships');
  return await res.json();
}

// Update a relationship label (and mark as curated)
export async function updateRelationshipLabel(code, description, labels) {
  const res = await fetch(`/relationships/edit/${code}`, {
    method: 'PUT',
    headers: authHeaders(),
    body: JSON.stringify({ description, labels }),
  });
  if (!res.ok) throw new Error('Failed to update relationship label');
  return await res.json();
} 