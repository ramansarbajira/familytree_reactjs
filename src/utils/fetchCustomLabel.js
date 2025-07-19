export async function fetchCustomLabel({ relationshipKey, language, creatorId, familyCode }) {
    const baseUrl = import.meta.env.VITE_API_BASE_URL || '';
    try {
        const res = await fetch(`${baseUrl}/custom-labels?relationshipKey=${encodeURIComponent(relationshipKey)}&language=${encodeURIComponent(language)}&creatorId=${encodeURIComponent(creatorId)}&familyCode=${encodeURIComponent(familyCode)}`);
        const data = await res.json();
        return data.label || relationshipKey;
    } catch {
        return relationshipKey;
    }
} 