import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { RichTextEditor } from '@/components/ui/rich-text-editor';
import { TagSelector } from '@/components/ui/tag-selector';
import { MoodSelector } from '@/components/ui/mood-selector';
import { AiPromptPanel } from '@/components/ui/ai-prompt-panel';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import { ArrowLeft, Save, Eye, Trash2, Sparkles } from 'lucide-react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

const BACKEND_URL = 'http://localhost:5000';

export default function EditEntry() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();

    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPromptPanel, setShowPromptPanel] = useState(false);

    // Fetch entry from backend
    useEffect(() => {
        const fetchEntry = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/entries/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok)
                    throw new Error(data.message || 'Failed to fetch entry');
                setEntry(data);
                setTitle(data.title);
                setContent(data.content);
                setSelectedTags(data.tags);
                setSelectedMood(data.mood);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: (error as Error).message,
                    variant: 'destructive',
                });
            }
        };
        if (token && id) fetchEntry();
    }, [token, id]);

    // Auto-save
    useEffect(() => {
        if (!entry) return;
        const autoSaveTimer = setTimeout(() => {
            if (title || content) handleAutoSave();
        }, 2000);
        return () => clearTimeout(autoSaveTimer);
    }, [title, content, selectedTags, selectedMood]);

    const handleAutoSave = async () => {
        try {
            if (!entry) return;
            await fetch(`${BACKEND_URL}/api/entries/${entry._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags: selectedTags,
                    mood: selectedMood,
                }),
            });
            setLastSaved(new Date());
        } catch (error) {
            console.error('Auto-save failed', error);
        }
    };

    const handleSave = async () => {
        if (!entry) return;
        if (!title.trim()) {
            toast({
                title: 'Title Required',
                description: 'Please enter a title for your entry.',
                variant: 'destructive',
            });
            return;
        }
        setIsLoading(true);
        try {
            const res = await fetch(`${BACKEND_URL}/api/entries/${entry._id}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    Authorization: `Bearer ${token}`,
                },
                body: JSON.stringify({
                    title,
                    content,
                    tags: selectedTags,
                    mood: selectedMood,
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Failed to save entry');

            toast({
                title: 'Entry Updated',
                description:
                    'Your journal entry has been successfully updated.',
            });
            setLastSaved(new Date());
            navigate(`/entries/${entry._id}`);
        } catch (error) {
            toast({
                title: 'Save Failed',
                description: (error as Error).message,
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!entry) return;

        if (
            !confirm(
                'Are you sure you want to delete this entry? This action cannot be undone.'
            )
        ) {
            return;
        }

        try {
            const res = await fetch(`${BACKEND_URL}/api/entries/${entry._id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Failed to delete entry');

            toast({
                title: 'Entry Deleted',
                description: 'Your journal entry has been permanently deleted.',
            });

            navigate('/browse');
        } catch (error) {
            toast({
                title: 'Delete Failed',
                description: (error as Error).message,
                variant: 'destructive',
            });
        }
    };

    const handlePromptSelect = (prompt: string) => {
        setContent((prev) => (prev ? prev + '\n\n' + prompt : prompt));
        setShowPromptPanel(false);
    };

    if (!entry) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft flex items-center justify-center'>
                <Card className='shadow-elegant max-w-md w-full mx-4'>
                    <CardHeader className='text-center'>
                        <CardTitle>Entry Not Found</CardTitle>
                        <CardDescription>
                            The requested journal entry could not be found.
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='text-center'>
                        <Button
                            variant='soft'
                            onClick={() => navigate('/browse')}
                            className='w-full'
                        >
                            Back to Browse
                        </Button>
                    </CardContent>
                </Card>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft'>
            <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => navigate(`/entries/${entry._id}`)}
                            className='hover:bg-secondary-soft'
                        >
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                        <div>
                            <h1 className='text-2xl font-semibold text-foreground'>
                                Edit Entry
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                {lastSaved
                                    ? `Last saved ${format(
                                          lastSaved,
                                          'h:mm a'
                                      )}`
                                    : 'Unsaved changes'}
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span className='text-sm text-muted-foreground'>
                            Welcome, {user?.name}
                        </span>
                        <ThemeToggle />
                        <Button
                            variant='ghost'
                            onClick={logout}
                            className='text-muted-foreground hover:text-foreground'
                        >
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className='container mx-auto px-4 py-8 max-w-6xl'>
                <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                    {/* Editor Section */}
                    <div className='lg:col-span-3 space-y-6'>
                        <Card className='shadow-elegant border border-border/40'>
                            <CardHeader>
                                <div className='flex flex-col gap-2'>
                                    <Label
                                        htmlFor='title'
                                        className='text-sm font-medium'
                                    >
                                        Entry Title
                                    </Label>
                                    <div className='relative'>
                                        <Input
                                            id='title'
                                            value={title}
                                            onChange={(e) =>
                                                setTitle(e.target.value)
                                            }
                                            placeholder='Give your entry a title...'
                                            className='text-xl font-semibold pr-10'
                                        />
                                        <Button
                                            variant='ghost'
                                            size='icon'
                                            className='absolute right-1 top-1/2 -translate-y-1/2 h-8 w-8 text-primary hover:text-primary-hover'
                                            onClick={() =>
                                                setShowPromptPanel(true)
                                            }
                                        >
                                            <Sparkles className='h-4 w-4' />
                                        </Button>
                                    </div>
                                    <div className='flex items-center gap-2 text-xs text-muted-foreground'>
                                        <span>
                                            Created{' '}
                                            {format(
                                                new Date(entry.createdAt),
                                                'MMM dd, yyyy'
                                            )}{' '}
                                            at{' '}
                                            {format(
                                                new Date(entry.createdAt),
                                                'h:mm a'
                                            )}
                                        </span>
                                        <span className='px-2 py-0.5 rounded-full bg-secondary text-secondary-foreground text-[10px]'>
                                            {lastSaved
                                                ? `Saved ${format(
                                                      lastSaved,
                                                      'h:mm a'
                                                  )}`
                                                : 'Unsaved'}
                                        </span>
                                    </div>
                                </div>
                            </CardHeader>
                            <CardContent className='p-0'>
                                <div className='relative'>
                                    <RichTextEditor
                                        content={content}
                                        onChange={setContent}
                                        placeholder='Start writing your thoughts...'
                                    />
                                    <Button
                                        variant='secondary'
                                        size='sm'
                                        className='absolute top-3 right-3 shadow-sm'
                                        onClick={() => setShowPromptPanel(true)}
                                    >
                                        <Sparkles className='h-4 w-4 mr-1' />
                                        Prompts
                                    </Button>
                                </div>
                            </CardContent>
                        </Card>
                    </div>

                    {/* Sidebar */}
                    <aside className='space-y-6'>
                        {/* Entry Details */}
                        <Card className='shadow-soft border border-border/40'>
                            <CardHeader>
                                <CardTitle className='text-base'>
                                    Entry Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div>
                                    <Label className='mb-2 block'>Mood</Label>
                                    <MoodSelector
                                        selectedMood={selectedMood}
                                        onChange={setSelectedMood}
                                    />
                                </div>
                                <div>
                                    <Label className='mb-2 block'>Tags</Label>
                                    <TagSelector
                                        selectedTags={selectedTags}
                                        onChange={setSelectedTags}
                                    />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Actions */}
                        <Card className='shadow-soft border border-border/40'>
                            <CardContent className='pt-6 space-y-3'>
                                <Button
                                    onClick={handleSave}
                                    disabled={isLoading || !title.trim()}
                                    className='w-full'
                                    size='lg'
                                >
                                    <Save className='w-4 h-4 mr-2' />
                                    {isLoading ? 'Saving...' : 'Save Changes'}
                                </Button>

                                <Button
                                    variant='outline'
                                    asChild
                                    className='w-full'
                                    size='lg'
                                >
                                    <Link to={`/entries/${entry._id}`}>
                                        <Eye className='w-4 h-4 mr-2' />
                                        Preview
                                    </Link>
                                </Button>

                                <Button
                                    variant='ghost'
                                    className='w-full text-destructive hover:text-destructive'
                                    size='lg'
                                    onClick={handleDelete}
                                >
                                    <Trash2 className='w-4 h-4 mr-2' />
                                    Delete Entry
                                </Button>
                            </CardContent>
                        </Card>
                    </aside>
                </div>
            </main>

            <AiPromptPanel
                isOpen={showPromptPanel}
                onClose={() => setShowPromptPanel(false)}
                onSelectPrompt={handlePromptSelect}
            />
        </div>
    );
}
