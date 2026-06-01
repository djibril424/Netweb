
import React, { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { supabase } from '../lib/supabase';
import { Search } from '../assets/icons.jsx';
import UserPreview from './user.jsx';

export default function SearchBar() {
  const navigate = useNavigate();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState([]);
  const [focused, setFocused] = useState(false);
  const containerRef = useRef(null);

  useEffect(() => {
    const fetchResults = async () => {
      if (!query.trim()) {
        setResults();
        return;
      }

      try {
        const { data, error } = await supabase
        .from('profiles')
        .select('*')
        .or(`username.ilike.%${query}%,handle.ilike.%${query}%`)
        .limit(5);

        if (error) throw error;
        setResults(data ||);
      } catch (err) {
        console.error('Error fetching search results', err);
      }
    };

    const delay = setTimeout(fetchResults, 200);
    return () => clearTimeout(delay);
  }, [query]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (containerRef.current &&!containerRef.current.contains(e.target)) {
        setFocused(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  },);

  const handleUserClick = (userId) => {
    setQuery('');
    setResults();
    setFocused(false);
    navigate(`/profile/${userId}`);
  };

  return (
    <div className="search-bar-container" ref={containerRef}>
      <div className="search-input-wrapper">
        <Search className="search-icon-inside" size={16} />
        <input
          type="text"
          className="search-text-input"
          placeholder="Search"
          value={query}
          onFocus={() => setFocused(true)}
          onChange={(e) => setQuery(e.target.value)}
        />
      </div>

      {focused && results.length > 0 && (
        <div className="search-dropdown">
          {results.map(user => (
            <UserPreview
              key={user.id}
              user={user}
              onClick={() => handleUserClick(user.id)}
            />
          ))}
        </div>
      )}
    </div>
  );
}
