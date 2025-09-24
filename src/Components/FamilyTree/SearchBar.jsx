import React, { useState, useEffect, useRef } from 'react';
import { FaSearch, FaTimes, FaChevronUp, FaChevronDown, FaUser } from 'react-icons/fa';

const SearchBar = ({ 
    tree, 
    onSearchResults, 
    onFocusPerson, 
    onClearSearch,
    language = 'english' 
}) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [searchResults, setSearchResults] = useState([]);
    const [currentResultIndex, setCurrentResultIndex] = useState(-1);
    const [isSearchOpen, setIsSearchOpen] = useState(false);
    const [showResults, setShowResults] = useState(false);
    const searchInputRef = useRef(null);
    const resultsRef = useRef(null);

    // Perform search when query changes or show all when empty
    useEffect(() => {
        if (!tree) {
            setSearchResults([]);
            setCurrentResultIndex(-1);
            setShowResults(false);
            if (onSearchResults) onSearchResults([]);
            return;
        }

        const query = searchQuery.toLowerCase().trim();
        const results = [];

        // If search is empty, show all family members
        if (!query) {
            tree.people.forEach((person, personId) => {
                const name = person.name || '';
                const firstName = person.firstName || '';
                const lastName = person.lastName || '';
                const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
                
                results.push({
                    id: personId,
                    person: person,
                    displayName: name || fullName || 'Unnamed Member',
                    matchType: 'all'
                });
            });
            
            // Sort alphabetically when showing all
            results.sort((a, b) => a.displayName.localeCompare(b.displayName));
        } else {
            // Search through all people in the tree
            tree.people.forEach((person, personId) => {
                const name = person.name || '';
                const firstName = person.firstName || '';
                const lastName = person.lastName || '';
                const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
                
                // Check if any name field matches the search query (partial match)
                const nameMatches = name.toLowerCase().includes(query) ||
                                   firstName.toLowerCase().includes(query) ||
                                   lastName.toLowerCase().includes(query) ||
                                   fullName.toLowerCase().includes(query);

                if (nameMatches) {
                    results.push({
                        id: personId,
                        person: person,
                        displayName: name || fullName || 'Unnamed Member',
                        matchType: 'search'
                    });
                }
            });

            // Sort results by relevance (exact matches first, then partial matches)
            results.sort((a, b) => {
                const aName = a.displayName.toLowerCase();
                const bName = b.displayName.toLowerCase();
                
                // Exact matches first
                if (aName === query && bName !== query) return -1;
                if (bName === query && aName !== query) return 1;
                
                // Starts with query
                if (aName.startsWith(query) && !bName.startsWith(query)) return -1;
                if (bName.startsWith(query) && !aName.startsWith(query)) return 1;
                
                // Alphabetical order for same relevance
                return aName.localeCompare(bName);
            });
        }

        setSearchResults(results);
        setCurrentResultIndex(results.length > 0 ? 0 : -1);
        setShowResults(results.length > 0);
        
        if (onSearchResults) onSearchResults(results);
    }, [searchQuery, tree]);

    // Handle search input change
    const handleSearchChange = (e) => {
        setSearchQuery(e.target.value);
    };

    // Clear search
    const handleClearSearch = () => {
        setSearchQuery('');
        setSearchResults([]);
        setCurrentResultIndex(-1);
        setShowResults(false);
        setIsSearchOpen(false);
        if (onClearSearch) onClearSearch();
    };

    // Navigate to next result
    const handleNextResult = () => {
        if (searchResults.length === 0) return;
        const nextIndex = (currentResultIndex + 1) % searchResults.length;
        setCurrentResultIndex(nextIndex);
        focusOnResult(nextIndex);
    };

    // Navigate to previous result
    const handlePrevResult = () => {
        if (searchResults.length === 0) return;
        const prevIndex = currentResultIndex === 0 ? searchResults.length - 1 : currentResultIndex - 1;
        setCurrentResultIndex(prevIndex);
        focusOnResult(prevIndex);
    };

    // Focus on a specific result
    const focusOnResult = (index) => {
        if (index >= 0 && index < searchResults.length) {
            const result = searchResults[index];
            if (onFocusPerson) {
                onFocusPerson(result.id, result.person);
            }
        }
    };

    // Handle result item click
    const handleResultClick = (index) => {
        // Directly focus on the clicked result without relying on state update
        if (index >= 0 && index < searchResults.length) {
            const result = searchResults[index];
            if (onFocusPerson) {
                onFocusPerson(result.id, result.person);
            }
        }
        setCurrentResultIndex(index);
        setShowResults(false);
    };

    // Handle keyboard navigation
    const handleKeyDown = (e) => {
        if (e.key === 'Enter') {
            e.preventDefault();
            if (searchResults.length > 0 && currentResultIndex >= 0) {
                focusOnResult(currentResultIndex);
                setShowResults(false);
            }
        } else if (e.key === 'ArrowDown') {
            e.preventDefault();
            handleNextResult();
        } else if (e.key === 'ArrowUp') {
            e.preventDefault();
            handlePrevResult();
        } else if (e.key === 'Escape') {
            e.preventDefault();
            setShowResults(false);
            searchInputRef.current?.blur();
        }
    };

    // Toggle search bar
    const toggleSearch = () => {
        setIsSearchOpen(!isSearchOpen);
        if (!isSearchOpen) {
            setTimeout(() => {
                searchInputRef.current?.focus();
                // Populate and show all results when opening search
                if (tree && tree.people.size > 0) {
                    // Force repopulate search results by triggering the search logic
                    const results = [];
                    tree.people.forEach((person, personId) => {
                        const name = person.name || '';
                        const firstName = person.firstName || '';
                        const lastName = person.lastName || '';
                        const fullName = [firstName, lastName].filter(Boolean).join(' ').trim();
                        
                        results.push({
                            id: personId,
                            person: person,
                            displayName: name || fullName || 'Unnamed Member',
                            matchType: 'all'
                        });
                    });
                    
                    // Sort alphabetically when showing all
                    results.sort((a, b) => a.displayName.localeCompare(b.displayName));
                    
                    setSearchResults(results);
                    setCurrentResultIndex(results.length > 0 ? 0 : -1);
                    setShowResults(true);
                    
                    if (onSearchResults) onSearchResults(results);
                }
            }, 100);
        } else {
            handleClearSearch();
        }
    };

    // Close results when clicking outside
    useEffect(() => {
        const handleClickOutside = (event) => {
            if (resultsRef.current && !resultsRef.current.contains(event.target) &&
                searchInputRef.current && !searchInputRef.current.contains(event.target)) {
                setShowResults(false);
            }
        };

        document.addEventListener('mousedown', handleClickOutside);
        return () => document.removeEventListener('mousedown', handleClickOutside);
    }, []);

    return (
        <div className="relative z-50">
            {/* Search Toggle Button */}
            {!isSearchOpen && (
                <button
                    onClick={toggleSearch}
                    className="flex items-center gap-1.5 px-3 py-2 bg-white border-2 border-blue-600 text-blue-600 rounded-lg hover:bg-blue-50 text-sm font-semibold active:scale-95 transition-all duration-200 shadow-sm"
                    title="Search family members"
                >
                    <FaSearch className="text-sm" />
                    <span className="hidden sm:inline">Search</span>
                </button>
            )}

            {/* Search Bar */}
            {isSearchOpen && (
                <div className="flex items-center gap-2 bg-white rounded-lg shadow-xl border-2 border-blue-300 p-3 w-[280px] sm:w-[320px] backdrop-blur-sm">
                    <FaSearch className="text-blue-500 text-sm ml-2" />
                    <input
                        ref={searchInputRef}
                        type="text"
                        value={searchQuery}
                        onChange={handleSearchChange}
                        onKeyDown={handleKeyDown}
                        onFocus={() => {
                            // Always show results when focusing, even if empty (shows all members)
                            if (tree && tree.people.size > 0) {
                                setShowResults(true);
                            }
                        }}
                        placeholder={language === 'tamil' ? 'குடும்ப உறுப்பினர்களைத் தேடுங்கள்...' : 'Search family members...'}
                        className="flex-1 px-2 py-1 border-none outline-none text-gray-700 placeholder-gray-400"
                        autoComplete="off"
                    />
                    
                    
                    {/* Clear Button */}
                    <button
                        onClick={handleClearSearch}
                        className="p-1.5 hover:bg-red-50 rounded-full text-gray-400 hover:text-red-500 transition-all duration-200 border border-gray-200 hover:border-red-300"
                        title="Clear search"
                    >
                        <FaTimes className="text-sm" />
                    </button>
                </div>
            )}

            {/* Search Results Dropdown */}
            {isSearchOpen && showResults && searchResults.length > 0 && (
                <div
                    ref={resultsRef}
                    className="absolute top-full left-0 right-0 mt-3 bg-white rounded-xl shadow-2xl border-2 border-blue-200 max-h-72 overflow-y-auto z-[9999] backdrop-blur-sm w-[280px] sm:w-[320px] max-w-[90vw]"
                >
                    <div className="p-3 border-b border-gray-200 bg-gradient-to-r from-blue-50 to-indigo-50">
                        <span className="text-sm font-semibold text-blue-700">
                            {!searchQuery.trim() 
                                ? (language === 'tamil' 
                                    ? `அனைத்து குடும்ப உறுப்பினர்கள் (${searchResults.length})` 
                                    : `All Family Members (${searchResults.length})`)
                                : `${searchResults.length} ${language === 'tamil' ? 'முடிவுகள்' : 'results'} found`
                            }
                        </span>
                    </div>
                    {searchResults.map((result, index) => (
                        <div
                            key={result.id}
                            onClick={() => handleResultClick(index)}
                            className={`flex items-center gap-3 p-4 hover:bg-blue-50 cursor-pointer transition-all duration-200 border-b border-gray-100 last:border-b-0 ${
                                index === currentResultIndex ? 'bg-gradient-to-r from-blue-100 to-indigo-100 border-blue-300 shadow-sm' : ''
                            }`}
                        >
                            <div className="flex-shrink-0">
                                {result.person.img ? (
                                    <img
                                        src={result.person.img}
                                        alt={result.displayName}
                                        className="w-10 h-10 rounded-full object-cover border-2 border-blue-200 shadow-sm"
                                        onError={(e) => {
                                            e.target.style.display = 'none';
                                            e.target.nextSibling.style.display = 'flex';
                                        }}
                                    />
                                ) : null}
                                <div 
                                    className="w-10 h-10 rounded-full bg-gradient-to-br from-gray-200 to-gray-300 flex items-center justify-center border-2 border-gray-300 shadow-sm"
                                    style={{ display: result.person.img ? 'none' : 'flex' }}
                                >
                                    <FaUser className="text-gray-500 text-sm" />
                                </div>
                            </div>
                            <div className="flex-1 min-w-0">
                                <div className="font-semibold text-gray-900 truncate text-sm">
                                    {result.displayName}
                                </div>
                                <div className="text-xs text-gray-600 mt-1 flex items-center gap-2">
                                    {result.person.gender && (
                                        <span className="capitalize bg-gray-100 px-2 py-0.5 rounded-full font-medium">
                                            {result.person.gender}
                                        </span>
                                    )}
                                    {result.person.age && (
                                        <span className="bg-blue-100 text-blue-700 px-2 py-0.5 rounded-full font-medium">
                                            Age: {result.person.age}
                                        </span>
                                    )}
                                </div>
                            </div>
                            {index === currentResultIndex && (
                                <div className="flex-shrink-0">
                                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-indigo-500 rounded-full shadow-sm animate-pulse"></div>
                                </div>
                            )}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default SearchBar;
