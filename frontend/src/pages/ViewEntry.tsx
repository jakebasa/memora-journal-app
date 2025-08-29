// ... keep your imports
import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardDescription,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { AiSummaryPanel } from '@/components/ui/ai-summary-panel';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Edit,
    Share,
    Trash2,
    Calendar,
    Clock,
    Sparkles,
} from 'lucide-react';
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

export default function ViewEntry() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const { toast } = useToast();

    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [showSummaryPanel, setShowSummaryPanel] = useState(false);

    useEffect(() => {
        const fetchEntry = async () => {
            try {
                if (!id || !token) return;
                const res = await fetch(`${BACKEND_URL}/api/entries/${id}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok)
                    throw new Error(data.message || 'Failed to fetch entry');
                setEntry(data);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: (error as Error).message,
                    variant: 'destructive',
                });
            }
        };
        fetchEntry();
    }, [id, token]);

    // 🗑️ Delete handler
    const handleDelete = async () => {
        if (!id || !token) return;

        const confirmed = window.confirm(
            'Are you sure you want to delete this entry? This action cannot be undone.'
        );
        if (!confirmed) return;

        try {
            const res = await fetch(`${BACKEND_URL}/api/entries/${id}`, {
                method: 'DELETE',
                headers: {
                    Authorization: `Bearer ${token}`,
                },
            });

            const data = await res.json();

            if (!res.ok) throw new Error(data.message || 'Failed to delete');

            toast({
                title: 'Deleted',
                description: 'Your journal entry has been deleted.',
            });

            navigate('/browse'); // redirect after success
        } catch (error) {
            toast({
                title: 'Error',
                description: (error as Error).message,
                variant: 'destructive',
            });
        }
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
            {/* header */}
            <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => navigate('/browse')}
                            className='hover:bg-secondary-soft'
                        >
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                        <div>
                            <h1 className='text-2xl font-semibold text-foreground'>
                                View Entry
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                Reading mode
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

            {/* main content */}
            <main className='container mx-auto px-4 py-8 max-w-4xl'>
                <Card className='shadow-elegant'>
                    <CardHeader className='border-b border-border'>
                        <div className='flex items-start justify-between'>
                            <div className='flex-1'>
                                <div className='flex items-center gap-3 mb-3'>
                                    <CardTitle className='text-3xl font-medium'>
                                        {entry.title}
                                    </CardTitle>
                                    <Badge
                                        variant='secondary'
                                        className='text-lg px-3 py-1'
                                    >
                                        {entry.mood}
                                    </Badge>
                                </div>
                                <div className='flex items-center gap-4 text-sm text-muted-foreground'>
                                    <div className='flex items-center gap-1'>
                                        <Calendar className='h-4 w-4' />
                                        {format(
                                            new Date(entry.createdAt),
                                            'EEEE, MMMM dd, yyyy'
                                        )}
                                    </div>
                                    <div className='flex items-center gap-1'>
                                        <Clock className='h-4 w-4' />
                                        {format(
                                            new Date(entry.createdAt),
                                            'h:mm a'
                                        )}
                                    </div>
                                    {new Date(entry.updatedAt).getTime() !==
                                        new Date(entry.createdAt).getTime() && (
                                        <div className='text-xs'>
                                            (Updated{' '}
                                            {format(
                                                new Date(entry.updatedAt),
                                                'h:mm a'
                                            )}
                                            )
                                        </div>
                                    )}
                                </div>
                                <div className='flex items-center gap-2 mt-4 flex-wrap'>
                                    {entry.tags.map((tag) => (
                                        <Badge
                                            key={tag}
                                            variant='outline'
                                            className='text-sm'
                                        >
                                            {tag}
                                        </Badge>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </CardHeader>

                    <CardContent className='p-8'>
                        <div
                            className='editor-content prose-reading'
                            dangerouslySetInnerHTML={{ __html: entry.content }}
                        />
                    </CardContent>

                    <div className='border-t border-border p-6'>
                        <div className='flex items-center justify-between'>
                            <div className='text-sm text-muted-foreground'>
                                Created{' '}
                                {format(
                                    new Date(entry.createdAt),
                                    'MMM dd, yyyy'
                                )}{' '}
                                at {format(new Date(entry.createdAt), 'h:mm a')}
                            </div>
                            <div className='flex items-center gap-2'>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    onClick={() => setShowSummaryPanel(true)}
                                >
                                    <Sparkles className='h-4 w-4 mr-2' />
                                    AI Summary
                                </Button>
                                {/* <Button variant='ghost' size='sm'>
                                    <Share className='h-4 w-4 mr-2' />
                                    Share
                                </Button> */}
                                <Button variant='ghost' size='sm' asChild>
                                    <Link to={`/entries/${entry._id}/edit`}>
                                        <Edit className='h-4 w-4 mr-2' />
                                        Edit
                                    </Link>
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='sm'
                                    className='text-destructive hover:text-destructive'
                                    onClick={handleDelete} // 🗑️ added here
                                >
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            </main>

            <AiSummaryPanel
                isOpen={showSummaryPanel}
                onClose={() => setShowSummaryPanel(false)}
                entryContent={entry?.content || ''}
                entryTitle={entry?.title || ''}
            />
        </div>
    );
}
