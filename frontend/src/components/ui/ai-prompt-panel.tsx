import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Sparkles, RefreshCw, Copy, Clock } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';

interface AiPromptPanelProps {
  isOpen: boolean;
  onClose: () => void;
  onSelectPrompt: (prompt: string) => void;
}

const predefinedPrompts = [
  "What emotions am I experiencing today and why?",
  "What are three things I'm grateful for right now?",
  "What challenges did I face today and how did I handle them?",
  "What would I tell my younger self about this situation?",
  "How has my perspective changed recently?",
  "What patterns do I notice in my daily habits?",
  "What brings me the most joy lately?",
  "What would I like to improve about myself?",
  "How do I want to feel tomorrow?",
  "What lesson did today teach me?"
];

const categories = [
  { name: "Reflection", prompts: predefinedPrompts.slice(0, 4) },
  { name: "Growth", prompts: predefinedPrompts.slice(4, 7) },
  { name: "Gratitude", prompts: predefinedPrompts.slice(7, 10) }
];

export function AiPromptPanel({ isOpen, onClose, onSelectPrompt }: AiPromptPanelProps) {
  const [customPrompt, setCustomPrompt] = useState('');
  const [generatedPrompt, setGeneratedPrompt] = useState('');
  const [isGenerating, setIsGenerating] = useState(false);
  const { toast } = useToast();

  const generateCustomPrompt = async () => {
    setIsGenerating(true);
    try {
      // Simulate AI generation
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      const randomPrompts = [
        "Imagine you're writing a letter to someone you deeply care about. What would you want them to know about your current state of mind?",
        "If today was a chapter in your life story, what would be its title and why?",
        "What's one small thing that happened today that made you smile, even briefly?",
        "How would you describe your energy levels today, and what might be influencing them?",
        "What's something you've been avoiding thinking about that might be worth exploring?",
        "If you could have a conversation with your emotions today, what would they tell you?",
        "What's one decision you made today that you feel good about, and what guided that choice?"
      ];
      
      const randomPrompt = randomPrompts[Math.floor(Math.random() * randomPrompts.length)];
      setGeneratedPrompt(randomPrompt);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate a prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const copyToClipboard = (text: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copied!",
      description: "Prompt copied to clipboard.",
    });
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-2xl max-h-[80vh] overflow-y-auto shadow-xl">
        <CardHeader className="border-b border-border">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-primary" />
              <CardTitle>AI Writing Prompts</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <CardDescription>
            Get inspired with AI-generated prompts or choose from curated suggestions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Generate Custom Prompt */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Generate Custom Prompt</h3>
              <Button
                variant="outline"
                size="sm"
                onClick={generateCustomPrompt}
                disabled={isGenerating}
              >
                {isGenerating ? (
                  <>
                    <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                    Generating...
                  </>
                ) : (
                  <>
                    <Sparkles className="h-4 w-4 mr-2" />
                    Generate
                  </>
                )}
              </Button>
            </div>
            
            {generatedPrompt && (
              <Card className="bg-primary-soft/30 border-primary/20">
                <CardContent className="p-4">
                  <p className="text-sm leading-relaxed">{generatedPrompt}</p>
                  <div className="flex items-center gap-2 mt-3">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => onSelectPrompt(generatedPrompt)}
                    >
                      Use This Prompt
                    </Button>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => copyToClipboard(generatedPrompt)}
                    >
                      <Copy className="h-3 w-3" />
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>

          {/* Predefined Categories */}
          <div className="space-y-4">
            <h3 className="font-medium">Curated Prompts</h3>
            {categories.map((category) => (
              <div key={category.name} className="space-y-3">
                <div className="flex items-center gap-2">
                  <Badge variant="secondary">{category.name}</Badge>
                </div>
                <div className="grid gap-2">
                  {category.prompts.map((prompt, index) => (
                    <Card 
                      key={index}
                      className="cursor-pointer hover:bg-secondary-soft/50 transition-colors"
                      onClick={() => onSelectPrompt(prompt)}
                    >
                      <CardContent className="p-3">
                        <p className="text-sm">{prompt}</p>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </div>
            ))}
          </div>

          {/* Custom Prompt Input */}
          <div className="space-y-3">
            <h3 className="font-medium">Create Your Own</h3>
            <Textarea
              placeholder="Write your own prompt or modify an existing one..."
              value={customPrompt}
              onChange={(e) => setCustomPrompt(e.target.value)}
              className="min-h-[80px]"
            />
            <Button
              variant="outline"
              onClick={() => onSelectPrompt(customPrompt)}
              disabled={!customPrompt.trim()}
              className="w-full"
            >
              Use Custom Prompt
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}