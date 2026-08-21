import React, { useState, useEffect, useRef } from 'react';
import axios from 'axios';
import { MapPin, Loader2 } from 'lucide-react';

interface Props {
  value: string;
  onChange: (val: string) => void;
  placeholder: string;
  iconColorClass?: string;
  restrictToCountry?: string | null;
}

export default function LocationAutocomplete({ value, onChange, placeholder, iconColorClass = "text-brand-green", restrictToCountry = null }: Props) {
  const [suggestions, setSuggestions] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const wrapperRef = useRef<HTMLDivElement>(null);
  
  // Debounce search
  useEffect(() => {
    if (!value || value.length < 3 || !isOpen) {
      setSuggestions([]);
      return;
    }
    
    const timeoutId = setTimeout(async () => {
      setLoading(true);
      try {
        const params: any = {
          q: value,
          format: 'json',
          limit: 5,
        };
        
        if (restrictToCountry) {
          params.countrycodes = restrictToCountry;
        }

        const res = await axios.get('https://nominatim.openstreetmap.org/search', { params });
        const results = res.data.map((item: any) => item.display_name);
        setSuggestions(results);
      } catch (err) {
        console.error("Geocoding autocomplete error", err);
      } finally {
        setLoading(false);
      }
    }, 500);
    
    return () => clearTimeout(timeoutId);
  }, [value, isOpen]);

  // Click outside to close
  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (wrapperRef.current && !wrapperRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, [wrapperRef]);

  return (
    <div className="relative w-full" ref={wrapperRef}>
      <MapPin className={`absolute left-3 top-3.5 w-4 h-4 ${iconColorClass}`} />
      <input 
        type="text" 
        value={value}
        onChange={(e) => {
          onChange(e.target.value);
          setIsOpen(true);
        }}
        onFocus={() => setIsOpen(true)}
        className="w-full bg-slate-50 border border-border-custom rounded-xl py-3 pl-10 pr-10 text-sm text-slate-800 focus:outline-none focus:border-brand-green focus:bg-white transition-all"
        placeholder={placeholder}
      />
      {loading && (
        <div className="absolute right-3 top-3.5">
          <Loader2 className="w-4 h-4 text-slate-400 animate-spin" />
        </div>
      )}
      
      {isOpen && suggestions.length > 0 && (
        <ul className="absolute z-50 w-full bg-white mt-1 rounded-xl shadow-lg border border-slate-100 overflow-hidden max-h-60 overflow-y-auto">
          {suggestions.map((suggestion, idx) => (
            <li 
              key={idx} 
              onClick={() => {
                onChange(suggestion);
                setIsOpen(false);
              }}
              className="px-4 py-3 text-xs text-slate-700 hover:bg-slate-50 cursor-pointer border-b border-slate-50 last:border-none truncate"
            >
              {suggestion}
            </li>
          ))}
        </ul>
      )}
    </div>
  );
}
