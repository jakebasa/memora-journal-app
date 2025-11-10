import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Sparkles, RefreshCw, Copy, Clock, Heart } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { useAuth } from '@/contexts/AuthContext';
import { buildApiUrl } from '@/config/api';

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
  const [currentFeeling, setCurrentFeeling] = useState('');
  const [showFeelingInput, setShowFeelingInput] = useState(false);
  const [moodBasedPrompt, setMoodBasedPrompt] = useState('');
  const [isGeneratingMoodPrompt, setIsGeneratingMoodPrompt] = useState(false);
  const { toast } = useToast();
  const { token } = useAuth();

  const generateCustomPrompt = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch(buildApiUrl('/api/ai/prompt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
      });

      if (!response.ok) {
        throw new Error('Failed to generate prompt');
      }

      const data = await response.json();
      setGeneratedPrompt(data.prompt);
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

  const generateMoodBasedPrompt = async () => {
    if (!currentFeeling.trim()) {
      toast({
        title: "Please share your feeling",
        description: "Tell us how you're feeling to get a personalized prompt.",
        variant: "destructive",
      });
      return;
    }

    setIsGeneratingMoodPrompt(true);
    try {
      const response = await fetch(buildApiUrl('/api/ai/mood-prompt'), {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`,
        },
        credentials: 'include',
        body: JSON.stringify({ feeling: currentFeeling }),
      });

      if (!response.ok) {
        throw new Error('Failed to generate mood-based prompt');
      }

      const data = await response.json();
      setMoodBasedPrompt(data.prompt);
    } catch (error) {
      toast({
        title: "Generation Failed",
        description: "Could not generate a mood-based prompt. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGeneratingMoodPrompt(false);
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
              <CardTitle>Writing Prompts</CardTitle>
            </div>
            <Button variant="ghost" size="sm" onClick={onClose}>
              ✕
            </Button>
          </div>
          <CardDescription>
            Get inspired with personalized prompts or choose from curated suggestions
          </CardDescription>
        </CardHeader>
        
        <CardContent className="space-y-6 p-6">
          {/* Mood-Based Prompt Generation */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Heart className="h-5 w-5 text-primary" />
              <h3 className="font-medium">How are you feeling today?</h3>
            </div>
            <Card className="bg-gradient-to-r from-primary-soft/20 to-secondary-soft/20 border-primary/20">
              <CardContent className="p-4 space-y-4">
                <p className="text-sm text-muted-foreground">
                  Tell me how you're feeling, and I'll create a personalized journal prompt just for you.
                </p>
                <div className="space-y-3">
                  <Label htmlFor="feeling">Your current feeling or mood</Label>
                  <Input
                    id="feeling"
                    placeholder="e.g., anxious, excited, overwhelmed, peaceful..."
                    value={currentFeeling}
                    onChange={(e) => setCurrentFeeling(e.target.value)}
                    className="bg-background/50"
                  />
                  <Button
                    onClick={generateMoodBasedPrompt}
                    disabled={isGeneratingMoodPrompt || !currentFeeling.trim()}
                    variant="default"
                    className="w-full hover:bg-primary-hover"
                  >
                    {isGeneratingMoodPrompt ? (
                      <>
                        <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                        Creating your prompt...
                      </>
                    ) : (
                      <>
                        <Sparkles className="h-4 w-4 mr-2" />
                        Generate Personalized Prompt
                      </>
                    )}
                  </Button>
                </div>
                
                {moodBasedPrompt && (
                  <Card className="bg-background/50 border-primary/30">
                    <CardContent className="p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <Sparkles className="h-4 w-4 text-primary" />
                        <span className="text-sm font-medium">Your personalized prompt:</span>
                      </div>
                      <p className="text-sm leading-relaxed mb-3">{moodBasedPrompt}</p>
                      <div className="flex items-center gap-2">
                        <Button
                          variant="default"
                          size="sm"
                          onClick={() => onSelectPrompt(moodBasedPrompt)}
                        >
                          Use This Prompt
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => copyToClipboard(moodBasedPrompt)}
                        >
                          <Copy className="h-3 w-3" />
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Generate Custom Prompt */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="font-medium">Generate Random Prompt</h3>
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
                      className="cursor-pointer hover:bg-accent/50 transition-colors"
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