import { useState, useEffect, useRef } from 'react';
import { Search, MapPin, Loader2 } from 'lucide-react';
import './SearchBar.css';

export interface LocationResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // state/region
}

interface SearchBarProps {
  onLocationSelect: (location: LocationResult) => void;
}

export function SearchBar({ onLocationSelect }: SearchBarProps) {
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<LocationResult[]>([]);
  const [isSearching, setIsSearching] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Close dropdown when clicking outside
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    const searchTimeout = setTimeout(async () => {
      if (query.trim().length > 2) {
        setIsSearching(true);
        try {
          const res = await fetch(`https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(query)}&count=5&language=en&format=json`);
          const data = await res.json();
          if (data.results) {
            setResults(data.results);
            setIsOpen(true);
          } else {
            setResults([]);
          }
        } catch (error) {
          console.error("Failed to search location:", error);
        } finally {
          setIsSearching(false);
        }
      } else {
        setResults([]);
        setIsOpen(false);
      }
    }, 500); // 500ms debounce

    return () => clearTimeout(searchTimeout);
  }, [query]);

  const handleSelect = (result: LocationResult) => {
    onLocationSelect(result);
    setQuery('');
    setIsOpen(false);
  };

  return (
    <div className="search-container animate-fade-in" ref={dropdownRef}>
      <div className="search-input-wrapper glass-panel">
        <Search className="search-icon" size={20} />
        <input
          type="text"
          className="search-input"
          placeholder="Search for a city..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onFocus={() => { if (results.length > 0) setIsOpen(true); }}
        />
        {isSearching && <Loader2 className="spinner-icon search-loader" size={20} />}
      </div>
      
      {isOpen && results.length > 0 && (
        <div className="search-dropdown glass-panel animate-fade-in">
          {results.map((result) => (
            <button
              key={result.id}
              className="search-result-item"
              onClick={() => handleSelect(result)}
            >
              <MapPin size={16} className="item-icon" />
              <div className="item-details">
                <span className="item-name">{result.name}</span>
                <span className="item-region">
                  {result.admin1 ? `${result.admin1}, ` : ''}{result.country}
                </span>
              </div>
            </button>
          ))}
        </div>
      )}
    </div>
  );
}
