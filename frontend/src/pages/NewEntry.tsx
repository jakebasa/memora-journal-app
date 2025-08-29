// /pages/NewEntry.tsx
import { useState, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TagSelector } from '@/components/ui/tag-selector';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AiChatButton } from '@/components/ui/ai-chat-button';
import { AiPromptPanel } from '@/components/ui/ai-prompt-panel';
import { toast } from '@/hooks/use-toast';
import { ArrowLeft, Save, Clock, Sparkles } from 'lucide-react';
import { format } from 'date-fns';
import { useAuth } from '@/contexts/AuthContext';
import { MoodSelector } from '@/components/ui/mood-selector';

const BACKEND_URL = 'http://localhost:5000';

// Keep moods in sync with MoodSelector
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

const NewEntry = () => {
    const navigate = useNavigate();
    const { token } = useAuth();

    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState(''); // stores mood "value" (e.g. "happy")
    const [isSaving, setIsSaving] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPromptPanel, setShowPromptPanel] = useState(false);

    // Auto-save draft
    useEffect(() => {
        const timer = setInterval(() => {
            if (title || content || selectedTags.length > 0 || selectedMood) {
                setLastSaved(new Date());
                localStorage.setItem(
                    'journal-draft',
                    JSON.stringify({
                        title,
                        content,
                        selectedTags,
                        selectedMood,
                        lastSaved: new Date().toISOString(),
                    })
                );
            }
        }, 30000);
        return () => clearInterval(timer);
    }, [title, content, selectedTags, selectedMood]);

    // Load draft
    useEffect(() => {
        const savedDraft = localStorage.getItem('journal-draft');
        if (savedDraft) {
            try {
                const draft = JSON.parse(savedDraft);
                setTitle(draft.title || '');
                setContent(draft.content || '');
                setSelectedTags(draft.selectedTags || []);
                setSelectedMood(draft.selectedMood || '');
                if (draft.lastSaved) setLastSaved(new Date(draft.lastSaved));
            } catch (err) {
                console.error('Error loading draft:', err);
            }
        }
    }, []);

    const handleSave = async () => {
        if (!title.trim()) {
            toast({
                title: 'Title required',
                description: 'Please add a title for your entry.',
                variant: 'destructive',
            });
            return;
        }

        setIsSaving(true);
        try {
            const moodEmoji =
                moods.find((m) => m.value === selectedMood)?.emoji || '';

            const res = await fetch(`${BACKEND_URL}/api/entries`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags: selectedTags,
                    mood: moodEmoji, // ✅ store emoji only
                    date: new Date().toISOString(),
                }),
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Failed to save entry');

            localStorage.removeItem('journal-draft');
            toast({
                title: 'Entry saved!',
                description: 'Your journal entry has been saved successfully.',
            });
            navigate('/dashboard');
        } catch (err) {
            toast({
                title: 'Save failed',
                description: err.message || 'Could not save your entry.',
                variant: 'destructive',
            });
        } finally {
            setIsSaving(false);
        }
    };

    const handlePromptSelect = (prompt: string) => {
        setContent(content ? content + '\n\n' + prompt : prompt);
        setShowPromptPanel(false);
    };

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30'>
                <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-16'>
                        <div className='flex items-center gap-4'>
                            <Link to='/dashboard'>
                                <Button variant='ghost' size='icon-sm'>
                                    <ArrowLeft className='h-4 w-4' />
                                </Button>
                            </Link>
                            <div>
                                <h1 className='text-lg font-medium text-foreground'>
                                    New Entry
                                </h1>
                                {lastSaved && (
                                    <p className='text-xs text-muted-foreground flex items-center gap-1'>
                                        <Clock className='h-3 w-3' />
                                        Draft saved {format(lastSaved, 'HH:mm')}
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className='flex items-center gap-3'>
                            <ThemeToggle />
                            <Button
                                variant='default'
                                onClick={handleSave}
                                disabled={isSaving}
                                className='shadow-soft'
                            >
                                {isSaving ? (
                                    <>
                                        <Save className='h-4 w-4 mr-2 animate-spin' />
                                        Saving...
                                    </>
                                ) : (
                                    <>
                                        <Save className='h-4 w-4 mr-2' />
                                        Save Entry
                                    </>
                                )}
                            </Button>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-8 max-w-4xl'>
                <div className='space-y-6'>
                    {/* Entry Details */}
                    <Card className='shadow-elegant'>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-lg font-medium'>
                                Entry Details
                            </CardTitle>
                            <CardDescription>
                                {format(new Date(), 'EEEE, MMMM d, yyyy')}
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='space-y-2'>
                                <Label htmlFor='title'>Title</Label>
                                <div className='relative'>
                                    <Input
                                        id='title'
                                        placeholder="What's on your mind today?"
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        className='text-lg shadow-soft pr-10'
                                    />
                                    <Button
                                        variant='ghost'
                                        size='icon'
                                        className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary-hover'
                                        onClick={() => setShowPromptPanel(true)}
                                    >
                                        <Sparkles className='h-4 w-4' />
                                    </Button>
                                </div>
                            </div>

                            {/* Mood & Tags */}
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>Mood</Label>
                                    <MoodSelector
                                        selectedMood={selectedMood}
                                        onChange={setSelectedMood}
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label>Tags</Label>
                                    <TagSelector
                                        selectedTags={selectedTags}
                                        onChange={setSelectedTags}
                                    />
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Content Editor */}
                    <Card className='shadow-elegant'>
                        <CardHeader className='pb-4'>
                            <CardTitle className='text-lg font-medium'>
                                Your Thoughts
                            </CardTitle>
                            <CardDescription>
                                Express yourself freely with rich text
                                formatting
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='relative'>
                            <div className='relative'>
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder='Start writing your entry here...'
                                />
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='absolute top-2 right-2 text-primary hover:text-primary-hover'
                                    onClick={() => setShowPromptPanel(true)}
                                >
                                    <Sparkles className='h-4 w-4 mr-1' />
                                    Prompts
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
            </main>

            <AiChatButton />
            <AiPromptPanel
                isOpen={showPromptPanel}
                onClose={() => setShowPromptPanel(false)}
                onSelectPrompt={handlePromptSelect}
            />
        </div>
    );
};

export default NewEntry;
