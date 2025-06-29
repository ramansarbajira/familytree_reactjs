import React, { useState, useEffect } from 'react';

function FamilyCodeAutocomplete({ formData, setFormData }) {
  const [query, setQuery] = useState(formData.familyCode || '');
  const [suggestions, setSuggestions] = useState([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  
  // Fetch matching family codes from backend
  useEffect(() => {
    const delayDebounce = setTimeout(() => {
      if (query.trim().length >= 2) {
        setIsLoading(true); // Start loader
        fetch(`${import.meta.env.VITE_API_BASE_URL}/family/search?query=${query}`)
          .then(res => res.json())
          .then(data => setSuggestions(data))
          .catch(() => setSuggestions([]))
          .finally(() => setIsLoading(false));
      } else {
        setSuggestions([]);
        setIsLoading(false);
      }
    }, 300);

    return () => clearTimeout(delayDebounce);
  }, [query]);

  const handleSelect = (code) => {
    setFormData(prev => ({ ...prev, familyCode: code }));
    setQuery(code);
    setSuggestions([]);
    setShowSuggestions(false);
  };

  return (
    <div className="relative max-w-xs">
      <label className="block text-sm font-medium text-gray-700 mb-1">Family code/Root ID</label>
      <input
        type="text"
        name="familyCode"
        value={query}
        onChange={(e) => {
          setQuery(e.target.value);
          setShowSuggestions(true);
        }}
        placeholder="FAM1111"
        autoComplete="off"
        className="w-full px-4 py-2.5 border border-gray-300 rounded-md text-sm placeholder:text-sm focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] text-gray-600"
      />
      {isLoading && (
        <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
          <svg className="w-4 h-4 text-gray-400 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v4l3-3-3-3v4a8 8 0 00-8 8h4z"></path>
          </svg>
        </div>
      )}
      <datalist id="familyCodes">
        {suggestions.map((item, idx) => (
          <option key={idx} value={item.familyCode} />
        ))}
      </datalist>
      {showSuggestions && suggestions.length > 0 && (
        <ul className="absolute z-10 bg-white shadow-md border border-gray-200 rounded-md mt-1 w-full max-h-48 overflow-auto text-sm">
          {suggestions.map((item, index) => (
            <li
              key={index}
              className="px-4 py-2 hover:bg-gray-100 cursor-pointer"
              onClick={() => handleSelect(item.familyCode)}
            >
              <strong>{item.code}</strong> – {item.familyName}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}

export default FamilyCodeAutocomplete;
