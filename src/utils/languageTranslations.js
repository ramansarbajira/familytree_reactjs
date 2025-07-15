import tamil from './lang_tamil.js';
import english from './lang_english.js';
import hindi from './lang_hindi.js';
import telugu from './lang_telugu.js';
import malayalam from './lang_malayalam.js';
import kannada from './lang_kannada.js';

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
  let mod;
  switch (lang) {
    case 'english':
      mod = await import('./lang_english.js');
      translations = { ...mod.default, _lang: 'english' };
      break;
    case 'hindi':
      mod = await import('./lang_hindi.js');
      translations = { ...mod.default, _lang: 'hindi' };
      break;
    case 'telugu':
      mod = await import('./lang_telugu.js');
      translations = { ...mod.default, _lang: 'telugu' };
      break;
    case 'malayalam':
      mod = await import('./lang_malayalam.js');
      translations = { ...mod.default, _lang: 'malayalam' };
      break;
    case 'kannada':
      mod = await import('./lang_kannada.js');
      translations = { ...mod.default, _lang: 'kannada' };
      break;
    case 'tamil':
    default:
      mod = await import('./lang_tamil.js');
      translations = { ...mod.default, _lang: 'tamil' };
      break;
  }
  return translations;
};

export const getTranslation = (key, language = null) => {
  const lang = language || getCurrentLanguage();
  let dict;
  switch (lang) {
    case 'english':
      dict = english;
      break;
    case 'hindi':
      dict = hindi;
      break;
    case 'telugu':
      dict = telugu;
      break;
    case 'malayalam':
      dict = malayalam;
      break;
    case 'kannada':
      dict = kannada;
      break;
    case 'tamil':
    default:
      dict = tamil;
      break;
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
  [
    'english',
    'tamil',
    'hindi',
    'telugu',
    'malayalam',
    'kannada',
  ].forEach(lang => {
    result[lang] = getTranslation(key, lang);
  });
  return result;
}; 