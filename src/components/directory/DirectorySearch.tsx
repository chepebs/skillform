import React, { useState, useRef, useEffect } from 'react';
import { Search, X, Clock } from 'lucide-react';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { cn } from '@/lib/utils';

interface DirectorySearchProps {
  value: string;
  onChange: (value: string) => void;
  className?: string;
}

const RECENT_SEARCHES_KEY = 'directory_recent_searches';
const MAX_RECENT_SEARCHES = 5;

export const DirectorySearch: React.FC<DirectorySearchProps> = ({
  value,
  onChange,
  className,
}) => {
  const [isFocused, setIsFocused] = useState(false);
  const [recentSearches, setRecentSearches] = useState<string[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const stored = localStorage.getItem(RECENT_SEARCHES_KEY);
    if (stored) {
      try {
        setRecentSearches(JSON.parse(stored));
      } catch {
        setRecentSearches([]);
      }
    }
  }, []);

  const saveSearch = (search: string) => {
    if (!search.trim()) return;
    const updated = [search, ...recentSearches.filter(s => s !== search)].slice(0, MAX_RECENT_SEARCHES);
    setRecentSearches(updated);
    localStorage.setItem(RECENT_SEARCHES_KEY, JSON.stringify(updated));
  };

  const handleClear = () => {
    onChange('');
    inputRef.current?.focus();
  };

  const handleSelectRecent = (search: string) => {
    onChange(search);
    setIsFocused(false);
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && value.trim()) {
      saveSearch(value.trim());
      setIsFocused(false);
    }
  };

  const showDropdown = isFocused && recentSearches.length > 0 && !value;

  return (
    <div className={cn('relative', className)}>
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          ref={inputRef}
          placeholder="Search by name, position, department..."
          value={value}
          onChange={(e) => onChange(e.target.value)}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setTimeout(() => setIsFocused(false), 200)}
          onKeyDown={handleKeyDown}
          className="pl-10 pr-10 bg-dark-elevated border-dark-border focus:border-primary h-11"
        />
        {value && (
          <Button
            variant="ghost"
            size="icon"
            onClick={handleClear}
            className="absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 hover:bg-dark-card"
          >
            <X className="h-4 w-4" />
          </Button>
        )}
      </div>

      {showDropdown && (
        <div className="absolute z-50 top-full left-0 right-0 mt-1 py-2 bg-card border border-border">
          <div className="px-3 py-1.5 text-xs text-muted-foreground font-medium">
            Recent Searches
          </div>
          {recentSearches.map((search, index) => (
            <button
              key={index}
              onClick={() => handleSelectRecent(search)}
              className="w-full px-3 py-2 flex items-center gap-2 text-sm text-foreground hover:bg-dark-elevated transition-colors"
            >
              <Clock className="h-3.5 w-3.5 text-muted-foreground" />
              {search}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};
