import { UNIVERSAL_RELATIONSHIPS } from './universalRelationships';

export function getUniversalRelationshipLabel(code, lang = 'en') {
  return UNIVERSAL_RELATIONSHIPS[code]?.[lang] || code;
} 