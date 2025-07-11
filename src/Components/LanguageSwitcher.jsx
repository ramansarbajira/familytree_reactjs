import React from 'react';
import { useLanguage } from '../Contexts/LanguageContext';

const LANGUAGES = [
  { code: 'english', label: 'English' },
  { code: 'tamil', label: 'தமிழ்' },
  // Add more languages here in the future
];

const LanguageSwitcher = () => {
  const { language, changeLanguage } = useLanguage();

  return (
    <div style={{ marginLeft: 12 }}>
      <select
        value={language}
        onChange={e => changeLanguage(e.target.value)}
        style={{
          borderRadius: 8,
          padding: '6px 12px',
          fontWeight: 600,
          border: '1.5px solid #2563eb',
          background: '#fff',
          color: '#2563eb',
          cursor: 'pointer',
          minWidth: 80,
        }}
        aria-label="Switch language"
      >
        {LANGUAGES.map(lang => (
          <option key={lang.code} value={lang.code}>{lang.label}</option>
        ))}
      </select>
    </div>
  );
};

export default LanguageSwitcher; 