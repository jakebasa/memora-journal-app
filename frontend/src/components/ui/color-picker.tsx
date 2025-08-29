import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Label } from '@/components/ui/label';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Check } from 'lucide-react';

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
}

const predefinedColors = [
  { name: 'Sage Green', hsl: '151 25% 35%', preview: '#6B8E6B' },
  { name: 'Ocean Blue', hsl: '210 70% 45%', preview: '#2563EB' },
  { name: 'Purple', hsl: '260 60% 50%', preview: '#7C3AED' },
  { name: 'Rose', hsl: '350 70% 55%', preview: '#EC4899' },
  { name: 'Amber', hsl: '35 85% 55%', preview: '#F59E0B' },
  { name: 'Emerald', hsl: '160 70% 45%', preview: '#10B981' },
  { name: 'Indigo', hsl: '240 60% 55%', preview: '#6366F1' },
  { name: 'Teal', hsl: '175 65% 45%', preview: '#14B8A6' }
];

export function ColorPicker({ value, onChange }: ColorPickerProps) {
  const [isOpen, setIsOpen] = useState(false);

  const updateCSSVariable = (hslValue: string) => {
    const root = document.documentElement;
    root.style.setProperty('--primary', hslValue);
    
    // Calculate variants
    const [h, s, l] = hslValue.split(' ').map(v => parseFloat(v.replace('%', '')));
    
    // Hover state (slightly darker)
    const hoverL = Math.max(l - 5, 0);
    root.style.setProperty('--primary-hover', `${h} ${s}% ${hoverL}%`);
    
    // Soft variant (much lighter)
    const softL = Math.min(l + 55, 95);
    const softS = Math.max(s - 15, 10);
    root.style.setProperty('--primary-soft', `${h} ${softS}% ${softL}%`);
    
    // Ring variant (same as primary)
    root.style.setProperty('--ring', hslValue);
    
    // Update gradients
    const gradientPrimary = `linear-gradient(135deg, hsl(${hslValue}), hsl(${h} ${s}% ${Math.min(l + 10, 100)}%))`;
    root.style.setProperty('--gradient-primary', gradientPrimary);
  };

  const handleColorChange = (hslValue: string) => {
    onChange(hslValue);
    updateCSSVariable(hslValue);
    setIsOpen(false);
  };

  const currentColor = predefinedColors.find(color => color.hsl === value);

  return (
    <div className="space-y-2">
      <Label>Primary Color</Label>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button 
            variant="outline" 
            className="w-full justify-start gap-3 h-auto p-3"
          >
            <div 
              className="w-6 h-6 rounded-lg border-2 border-border"
              style={{ backgroundColor: currentColor?.preview || '#6B8E6B' }}
            />
            <span>{currentColor?.name || 'Custom Color'}</span>
          </Button>
        </PopoverTrigger>
        <PopoverContent className="w-80 p-4" align="start">
          <div className="space-y-4">
            <h4 className="font-medium">Choose a color</h4>
            <div className="grid grid-cols-4 gap-3">
              {predefinedColors.map((color) => (
                <button
                  key={color.hsl}
                  className="group relative aspect-square rounded-lg border-2 border-border hover:border-foreground/20 transition-colors"
                  style={{ backgroundColor: color.preview }}
                  onClick={() => handleColorChange(color.hsl)}
                >
                  {value === color.hsl && (
                    <div className="absolute inset-0 flex items-center justify-center">
                      <Check className="h-4 w-4 text-white drop-shadow-sm" />
                    </div>
                  )}
                  <div className="absolute -bottom-8 left-1/2 transform -translate-x-1/2 opacity-0 group-hover:opacity-100 transition-opacity">
                    <div className="bg-popover text-popover-foreground text-xs px-2 py-1 rounded border shadow-md whitespace-nowrap">
                      {color.name}
                    </div>
                  </div>
                </button>
              ))}
            </div>
          </div>
        </PopoverContent>
      </Popover>
    </div>
  );
}