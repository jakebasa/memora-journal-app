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
import { Shimmer, ShimmerText } from '@/components/ui/shimmer';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Save,
    Trash2,
    Calendar,
    Clock,
    Image as ImageIcon,
    Sparkles,
    Eye,
} from 'lucide-react';
import {
    Link,
    useNavigate,
    useParams,
    useSearchParams,
} from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { useEntries } from '@/hooks/useEntries';
import { buildApiUrl } from '@/config/api';

import { ImageUpload } from '@/components/ui/image-upload';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    images?: {
        url: string;
        publicId: string;
        alt?: string;
        uploadedAt: string;
    }[];
    createdAt: string;
    updatedAt: string;
}

const BACKEND_URL = 'http://localhost:5000';

export default function EditEntry() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    const { invalidateCache } = useEntries();

    const from = searchParams.get('from') || 'browse';

    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [title, setTitle] = useState('');
    const [content, setContent] = useState('');
    const [selectedTags, setSelectedTags] = useState<string[]>([]);
    const [selectedMood, setSelectedMood] = useState('');
    const [images, setImages] = useState<
        {
            url: string;
            publicId: string;
            width: number;
            height: number;
            format: string;
            bytes: number;
            originalName: string;
            alt?: string;
            uploadedAt?: string;
        }[]
    >([]);
    const [isLoading, setIsLoading] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [showPromptPanel, setShowPromptPanel] = useState(false);
    const [selectedPrompt, setSelectedPrompt] = useState<string>('');
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Fetch entry from backend
    useEffect(() => {
        const fetchEntry = async () => {
            try {
                setIsInitialLoading(true);
                const res = await fetch(buildApiUrl(`/api/entries/${id}`), {
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
                setImages(data.images || []);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: (error as Error).message,
                    variant: 'destructive',
                });
            } finally {
                setIsInitialLoading(false);
            }
        };
        if (token && id) fetchEntry();
    }, [token, id, toast]);

    // Auto-save disabled - user controls when to save
    // useEffect(() => {
    //     if (!entry) return;
    //     const autoSaveTimer = setTimeout(() => {
    //         if (title || content) handleAutoSave();
    //     }, 1000);
    //     return () => clearTimeout(autoSaveTimer);
    // }, [title, content, selectedTags, selectedMood]);

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
                    images: images.map((img) => ({
                        url: img.url,
                        publicId: img.publicId,
                        alt: img.alt || '',
                        uploadedAt: img.uploadedAt || new Date().toISOString(),
                    })),
                }),
            });
            const data = await res.json();
            if (!res.ok)
                throw new Error(data.message || 'Failed to save entry');

            // Invalidate cache to refresh dashboard
            invalidateCache();

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

            // Invalidate cache to refresh dashboard
            invalidateCache();

            toast({
                title: 'Entry Deleted',
                description: 'Your journal entry has been permanently deleted.',
            });

            navigate(from === 'dashboard' ? '/dashboard' : '/browse');
        } catch (error) {
            toast({
                title: 'Delete Failed',
                description: (error as Error).message,
                variant: 'destructive',
            });
        } finally {
            setShowDeleteModal(false);
        }
    };

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    const handlePromptSelect = (prompt: string) => {
        setSelectedPrompt(prompt);
        setShowPromptPanel(false);
    };

    if (isInitialLoading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft'>
                <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                    <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={() =>
                                    navigate(
                                        from === 'dashboard'
                                            ? '/dashboard'
                                            : '/browse'
                                    )
                                }
                                className='hover:bg-secondary-soft'
                            >
                                <ArrowLeft className='h-4 w-4' />
                            </Button>
                            <div>
                                <h1 className='text-2xl font-semibold text-foreground'>
                                    Edit Entry
                                </h1>
                                <Shimmer className='h-4 w-24 mt-1 rounded' />
                            </div>
                        </div>
                        <div className='flex items-center gap-4'>
                            <span className='text-sm text-muted-foreground hidden sm:block'>
                                Welcome, {user?.name}
                            </span>
                            <ThemeToggle />
                            <Button
                                variant='ghost'
                                onClick={() => setShowLogoutModal(true)}
                                className='text-muted-foreground hover:text-foreground'
                                size='sm'
                            >
                                <span className='hidden sm:inline'>Logout</span>
                                <span className='sm:hidden'>Exit</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className='container mx-auto px-4 py-8 max-w-6xl'>
                    <div className='grid grid-cols-1 lg:grid-cols-4 gap-8'>
                        {/* Editor Section Shimmer */}
                        <div className='lg:col-span-3 space-y-6'>
                            <Card className='shadow-elegant border border-border/40'>
                                <CardHeader>
                                    <div className='flex flex-col gap-2'>
                                        <Label className='text-sm font-medium'>
                                            Entry Title
                                        </Label>
                                        <Shimmer className='h-12 w-full rounded' />
                                        <div className='flex items-center gap-2'>
                                            <Shimmer className='h-3 w-32 rounded' />
                                            <Shimmer className='h-5 w-16 rounded-full' />
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='p-0'>
                                    <div className='space-y-4 p-6'>
                                        {/* Toolbar shimmer */}
                                        <div className='flex gap-2 p-2 border rounded'>
                                            {Array.from({ length: 8 }).map(
                                                (_, i) => (
                                                    <Shimmer
                                                        key={i}
                                                        className='h-8 w-8 rounded'
                                                    />
                                                )
                                            )}
                                        </div>
                                        {/* Editor content shimmer */}
                                        <div className='min-h-[400px] p-4 border rounded'>
                                            <ShimmerText lines={10} />
                                        </div>
                                        <Shimmer className='absolute top-3 right-3 h-8 w-20 rounded' />
                                    </div>
                                </CardContent>
                            </Card>
                        </div>

                        {/* Sidebar Shimmer */}
                        <aside className='space-y-6'>
                            {/* Entry Details Shimmer */}
                            <Card className='shadow-soft border border-border/40'>
                                <CardHeader>
                                    <CardTitle className='text-base'>
                                        Entry Details
                                    </CardTitle>
                                </CardHeader>
                                <CardContent className='space-y-6'>
                                    <div>
                                        <Label className='mb-2 block'>
                                            Mood
                                        </Label>
                                        <div className='flex flex-wrap gap-2'>
                                            {Array.from({ length: 6 }).map(
                                                (_, i) => (
                                                    <Shimmer
                                                        key={i}
                                                        className='h-10 w-16 rounded-full'
                                                    />
                                                )
                                            )}
                                        </div>
                                    </div>
                                    <div>
                                        <Label className='mb-2 block'>
                                            Tags
                                        </Label>
                                        <div className='space-y-2'>
                                            <Shimmer className='h-10 w-full rounded' />
                                            <div className='flex gap-2'>
                                                <Shimmer className='h-6 w-16 rounded-full' />
                                                <Shimmer className='h-6 w-20 rounded-full' />
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Actions Shimmer */}
                            <Card className='shadow-soft border border-border/40'>
                                <CardContent className='pt-6 space-y-3'>
                                    <Shimmer className='h-11 w-full rounded' />
                                    <Shimmer className='h-11 w-full rounded' />
                                    <Shimmer className='h-11 w-full rounded' />
                                </CardContent>
                            </Card>
                        </aside>
                    </div>
                </main>
            </div>
        );
    }

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
                            onClick={() =>
                                navigate(
                                    from === 'dashboard'
                                        ? '/dashboard'
                                        : `/entries/${entry._id}`
                                )
                            }
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
                        <span className='text-sm text-muted-foreground hidden sm:block'>
                            Welcome, {user?.name}
                        </span>
                        <ThemeToggle />
                        <Button
                            variant='ghost'
                            onClick={() => setShowLogoutModal(true)}
                            className='text-muted-foreground hover:text-foreground'
                            size='sm'
                        >
                            <span className='hidden sm:inline'>Logout</span>
                            <span className='sm:hidden'>Exit</span>
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
                                    <Input
                                        id='title'
                                        value={title}
                                        onChange={(e) =>
                                            setTitle(e.target.value)
                                        }
                                        placeholder='Give your entry a title...'
                                        className='text-xl font-semibold'
                                    />
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
                        </Card>

                        {/* Content Editor */}
                        <Card className='shadow-elegant border border-border/40'>
                            <CardHeader>
                                <div className='flex items-center justify-between'>
                                    <div>
                                        <CardTitle className='text-lg font-medium'>
                                            Your Thoughts
                                        </CardTitle>
                                        <CardDescription>
                                            Express yourself freely with rich
                                            text formatting
                                        </CardDescription>
                                    </div>
                                    <Button
                                        variant='ghost'
                                        onClick={() => setShowPromptPanel(true)}
                                        className='flex items-center gap-2 text-primary hover:text-primary-hover'
                                        size='sm'
                                    >
                                        <Sparkles className='h-4 w-4' />
                                        Writing Prompts
                                    </Button>
                                </div>
                            </CardHeader>
                            <CardContent className='p-0'>
                                {selectedPrompt && (
                                    <div className='m-6 mb-4 p-3 bg-primary/5 border border-primary/20 rounded-lg'>
                                        <div className='flex items-start gap-2'>
                                            <Sparkles className='h-4 w-4 text-primary mt-0.5 flex-shrink-0' />
                                            <div className='flex-1'>
                                                <div className='flex items-center justify-between'>
                                                    <p className='text-sm font-medium text-primary mb-1'>
                                                        Writing Prompt:
                                                    </p>
                                                    <Button
                                                        variant='ghost'
                                                        size='icon'
                                                        onClick={() =>
                                                            setSelectedPrompt(
                                                                ''
                                                            )
                                                        }
                                                        className='h-6 w-6 text-muted-foreground hover:text-foreground'
                                                    >
                                                        <span className='sr-only'>
                                                            Remove prompt
                                                        </span>
                                                        ✕
                                                    </Button>
                                                </div>
                                                <p className='text-sm text-foreground'>
                                                    {selectedPrompt}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                                <RichTextEditor
                                    content={content}
                                    onChange={setContent}
                                    placeholder={
                                        selectedPrompt
                                            ? 'Share your thoughts about this prompt...'
                                            : 'Express your thoughts and feelings...'
                                    }
                                />
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

                        {/* Image Upload */}
                        <Card className='shadow-soft border border-border/40'>
                            <CardHeader>
                                <CardTitle className='text-lg font-medium flex items-center gap-2'>
                                    <ImageIcon className='w-5 h-5' />
                                    Images{' '}
                                    {images.length > 0 && `(${images.length})`}
                                </CardTitle>
                                <CardDescription>
                                    {images.length === 0
                                        ? 'Add photos to capture your memories'
                                        : `Managing ${images.length} image${
                                              images.length > 1 ? 's' : ''
                                          } • Up to 5 images allowed`}
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <ImageUpload
                                    images={images}
                                    onImagesChange={setImages}
                                    maxImages={5}
                                />
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
                                    onClick={() => setShowDeleteModal(true)}
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

            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title='Delete Entry'
                description='Are you sure you want to delete this journal entry? This action cannot be undone.'
                confirmText='Delete'
                cancelText='Cancel'
                variant='destructive'
            />

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title='Logout'
                description='Are you sure you want to logout? Any unsaved changes will be lost.'
                confirmText='Logout'
                cancelText='Cancel'
            />
        </div>
    );
}
