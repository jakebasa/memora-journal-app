import { useState, useRef, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { X, Plus } from 'lucide-react';
import { devLog } from '@/config/api';

interface TagSelectorProps {
  selectedTags: string[];
  onChange: (tags: string[]) => void;
}

// Predefined tags for suggestions
const suggestedTags = [
  'gratitude', 'reflection', 'goals', 'creative', 'nature', 'travel',
  'learning', 'mindfulness', 'relationships', 'work', 'health', 'inspiration',
  'challenges', 'success', 'dreams', 'memories', 'growth', 'adventure'
];

export function TagSelector({ selectedTags, onChange }: TagSelectorProps) {
  const [inputValue, setInputValue] = useState('');
  const [showSuggestions, setShowSuggestions] = useState(false);

  const filteredSuggestions = suggestedTags.filter(
    tag => 
      tag.toLowerCase().includes(inputValue.toLowerCase()) &&
      !selectedTags.includes(tag)
  );

  const addTag = (tag: string) => {
    devLog('addTag called with:', tag);
    devLog('selectedTags:', selectedTags);
    if (tag && !selectedTags.includes(tag)) {
      devLog('Adding tag:', tag);
      onChange([...selectedTags, tag]);
    } else {
      devLog('Tag not added - empty or duplicate');
    }
    setInputValue('');
    setShowSuggestions(false);
  };

  const removeTag = (tagToRemove: string) => {
    onChange(selectedTags.filter(tag => tag !== tagToRemove));
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && inputValue.trim()) {
      e.preventDefault();
      addTag(inputValue.trim());
    } else if (e.key === 'Escape') {
      setShowSuggestions(false);
      setInputValue('');
    }
  };

  // Close suggestions when clicking outside
  const containerRef = useRef<HTMLDivElement>(null);
  
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };
    
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  return (
    <div className="space-y-3" ref={containerRef}>
      {/* Selected Tags */}
      {selectedTags.length > 0 && (
        <div className="flex flex-wrap gap-2">
          {selectedTags.map((tag) => (
            <Badge key={tag} variant="secondary" className="pl-3 pr-1">
              {tag}
              <Button
                variant="ghost"
                size="icon-sm"
                className="ml-1 h-4 w-4 p-0 hover:bg-destructive hover:text-destructive-foreground"
                onClick={() => removeTag(tag)}
              >
                <X className="h-2 w-2" />
              </Button>
            </Badge>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="relative">
        <div className="flex gap-2">
          <Input
            placeholder="Add tags (press Enter)"
            value={inputValue}
            onChange={(e) => {
              setInputValue(e.target.value);
              setShowSuggestions(true);
            }}
            onKeyDown={handleKeyDown}
            onFocus={() => setShowSuggestions(true)}
            className="shadow-soft"
          />
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              devLog('Plus button clicked, inputValue:', inputValue);
              addTag(inputValue.trim());
            }}
            disabled={!inputValue.trim()}
            className="px-3"
          >
            <Plus className="h-4 w-4" />
          </Button>
        </div>

        {/* Suggestions */}
        {showSuggestions && filteredSuggestions.length > 0 && (
          <div className="absolute top-full left-0 right-0 z-10 mt-1 bg-popover border border-border rounded-lg shadow-elegant max-h-40 overflow-y-auto custom-scroll">
            {filteredSuggestions.map((tag) => (
              <button
                key={tag}
                className="w-full text-left px-3 py-2 text-sm hover:bg-accent hover:text-accent-foreground focus:bg-accent focus:text-accent-foreground outline-none"
                onClick={() => addTag(tag)}
              >
                {tag}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* Quick Add Popular Tags */}
      <div className="space-y-2">
        <p className="text-xs text-muted-foreground font-medium">Quick add:</p>
        <div className="flex flex-wrap gap-2">
          {suggestedTags.slice(0, 6).filter(tag => !selectedTags.includes(tag)).map((tag) => (
            <Button
              key={tag}
              variant="outline"
              size="sm"
              className="h-7 text-xs"
              onClick={() => addTag(tag)}
            >
              + {tag}
            </Button>
          ))}
        </div>
      </div>
    </div>
  );
}