import React, { createContext, useContext, useState, useEffect } from 'react';
// Simple language management without external translations

const LanguageContext = createContext();

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) {
    throw new Error('useLanguage must be used within a LanguageProvider');
  }
  return context;
};

// Simple language functions
const getCurrentLanguage = () => {
  return localStorage.getItem('language') || 'tamil';
};

const setLanguage = (language) => {
  localStorage.setItem('language', language);
};

export const LanguageProvider = ({ children }) => {
  const [currentLanguage, setCurrentLanguage] = useState(getCurrentLanguage());

  const changeLanguage = (language) => {
    setCurrentLanguage(language);
    setLanguage(language);
  };

  useEffect(() => {
    // Set initial language
    setLanguage(currentLanguage);
  }, []);

  const value = {
    language: currentLanguage,
    changeLanguage,
  };

  return (
    <LanguageContext.Provider value={value}>
      {children}
    </LanguageContext.Provider>
  );
};