import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { ChevronDown } from 'lucide-react';

interface MoodSelectorProps {
  selectedMood: string;
  onChange: (mood: string) => void;
}

const moods = [
  { emoji: '😊', label: 'Happy', value: 'happy' },
  { emoji: '😌', label: 'Peaceful', value: 'peaceful' },
  { emoji: '😄', label: 'Excited', value: 'excited' },
  { emoji: '🤔', label: 'Thoughtful', value: 'thoughtful' },
  { emoji: '😴', label: 'Tired', value: 'tired' },
  { emoji: '😓', label: 'Stressed', value: 'stressed' },
  { emoji: '😢', label: 'Sad', value: 'sad' },
  { emoji: '😤', label: 'Frustrated', value: 'frustrated' },
  { emoji: '🎉', label: 'Celebratory', value: 'celebratory' },
  { emoji: '💪', label: 'Motivated', value: 'motivated' },
  { emoji: '🌱', label: 'Growing', value: 'growing' },
  { emoji: '❤️', label: 'Grateful', value: 'grateful' },
  { emoji: '🤗', label: 'Loved', value: 'loved' },
  { emoji: '😇', label: 'Blessed', value: 'blessed' },
  { emoji: '🧘', label: 'Zen', value: 'zen' },
  { emoji: '💭', label: 'Contemplative', value: 'contemplative' },
];

export function MoodSelector({ selectedMood, onChange }: MoodSelectorProps) {
  const [open, setOpen] = useState(false);
  
  const selectedMoodData = moods.find(mood => mood.value === selectedMood);

  return (
    <Popover open={open} onOpenChange={setOpen}>
      <PopoverTrigger asChild>
        <Button 
          variant="outline" 
          className="w-full justify-between shadow-soft"
          role="combobox"
        >
          <div className="flex items-center gap-2">
            {selectedMoodData ? (
              <>
                <span className="text-lg">{selectedMoodData.emoji}</span>
                <span className="text-sm">{selectedMoodData.label}</span>
              </>
            ) : (
              <span className="text-muted-foreground text-sm">Select your mood</span>
            )}
          </div>
          <ChevronDown className="h-4 w-4 opacity-50" />
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-2" align="start">
        <div className="grid grid-cols-4 gap-2">
          {moods.map((mood) => (
            <Button
              key={mood.value}
              variant={selectedMood === mood.value ? "default" : "ghost"}
              size="sm"
              className="flex flex-col items-center gap-1 h-auto py-3"
              onClick={() => {
                onChange(mood.value);
                setOpen(false);
              }}
            >
              <span className="text-lg">{mood.emoji}</span>
              <span className="text-xs">{mood.label}</span>
            </Button>
          ))}
        </div>
      </PopoverContent>
    </Popover>
  );
}