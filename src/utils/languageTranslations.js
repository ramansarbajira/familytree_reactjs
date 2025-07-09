import tamil from './lang_tamil.js';
import english from './lang_english.js';

let translations = null;

export const getCurrentLanguage = () => {
  return localStorage.getItem('familyTreeLanguage') || 'tamil';
};

export const setLanguage = (language) => {
  localStorage.setItem('familyTreeLanguage', language);
  translations = null; // Reset cache
};

export const loadTranslations = async (language = null) => {
  const lang = language || getCurrentLanguage();
  if (translations && translations._lang === lang) return translations;
  if (lang === 'english') {
    const mod = await import('./lang_english.js');
    translations = { ...mod.default, _lang: 'english' };
    return translations;
  } else {
    const mod = await import('./lang_tamil.js');
    translations = { ...mod.default, _lang: 'tamil' };
    return translations;
  }
};

export const getTranslation = (key, language = null) => {
  const lang = language || getCurrentLanguage();
  let dict;
  if (lang === 'english') {
    dict = english;
  } else {
    dict = tamil;
  }
  const keys = key.split('.');
  let value = dict;
  for (const k of keys) {
    if (value && value[k]) {
      value = value[k];
    } else {
      return key;
    }
  }
  return value;
};

// Function to get all translations for a specific key
export const getAllTranslations = (key) => {
  const result = {};
  Object.keys(translations).forEach(lang => {
    result[lang] = getTranslation(key, lang);
  });
  return result;
}; 