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
import { Shimmer, ShimmerText } from '@/components/ui/shimmer';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { ImageModal } from '@/components/ui/image-modal';
import { useAuth } from '@/contexts/AuthContext';
import { format } from 'date-fns';
import {
    ArrowLeft,
    Edit,
    Trash2,
    Calendar,
    Clock,
    Image as ImageIcon,
    Sparkles,
} from 'lucide-react';
import { Link, useNavigate, useParams, useSearchParams } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { buildApiUrl, devLog } from '@/config/api';

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

export default function ViewEntry() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const { id } = useParams();
    const [searchParams] = useSearchParams();
    const { toast } = useToast();
    
    const from = searchParams.get('from') || 'browse';

    const [entry, setEntry] = useState<JournalEntry | null>(null);
    const [loading, setLoading] = useState(true);
    const [showSummaryPanel, setShowSummaryPanel] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [showAiSummary, setShowAiSummary] = useState(false);
    const [selectedImage, setSelectedImage] = useState<{ url: string; alt?: string } | null>(null);

    useEffect(() => {
        const fetchEntry = async () => {
            try {
                if (!id || !token) return;
                setLoading(true);
                const res = await fetch(buildApiUrl(`/api/entries/${id}`), {
                    headers: { Authorization: `Bearer ${token}` },
                });
                const data = await res.json();
                if (!res.ok)
                    throw new Error(data.message || 'Failed to fetch entry');
                devLog('ViewEntry - Fetched entry data:', data);
                devLog('ViewEntry - Images in data:', data.images);
                setEntry(data);
            } catch (error) {
                toast({
                    title: 'Error',
                    description: (error as Error).message,
                    variant: 'destructive',
                });
            } finally {
                setLoading(false);
            }
        };
        fetchEntry();
    }, [id, token, toast]);

    // 🗑️ Delete handler
    const handleDelete = async () => {
        if (!id || !token) return;

        try {
            const res = await fetch(buildApiUrl(`/api/entries/${id}`), {
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

            navigate(from === 'dashboard' ? '/dashboard' : '/browse');
        } catch (error) {
            toast({
                title: 'Error',
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

    if (loading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft'>
                {/* Header */}
                <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                    <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                        <div className='flex items-center gap-4'>
                            <Button
                                variant='ghost'
                                size='icon'
                                onClick={() => navigate(from === 'dashboard' ? '/dashboard' : '/browse')}
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
                            <span className='text-sm text-muted-foreground hidden sm:block'>
                                Welcome, {user?.name.split(' ')[0]}
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

                {/* Main Content Shimmer */}
                <main className='container mx-auto px-4 py-8 max-w-4xl'>
                    <Card className='shadow-elegant'>
                        <CardHeader className='border-b border-border'>
                            <div className='flex items-start justify-between'>
                                <div className='flex-1'>
                                    <div className='flex items-center gap-3 mb-3'>
                                        <Shimmer className='h-9 w-80 rounded' />
                                        <Shimmer className='h-8 w-20 rounded-full' />
                                    </div>
                                    <div className='flex items-center gap-4 mb-4'>
                                        <div className='flex items-center gap-1'>
                                            <Calendar className='h-4 w-4 text-muted-foreground' />
                                            <Shimmer className='h-4 w-40 rounded' />
                                        </div>
                                        <div className='flex items-center gap-1'>
                                            <Clock className='h-4 w-4 text-muted-foreground' />
                                            <Shimmer className='h-4 w-16 rounded' />
                                        </div>
                                    </div>
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        <Shimmer className='h-6 w-16 rounded-full' />
                                        <Shimmer className='h-6 w-20 rounded-full' />
                                        <Shimmer className='h-6 w-14 rounded-full' />
                                    </div>
                                </div>
                            </div>
                        </CardHeader>

                        <CardContent className='p-8'>
                            <div className='space-y-4'>
                                <ShimmerText lines={8} />
                            </div>
                        </CardContent>

                        <div className='border-t border-border p-6'>
                            <div className='flex items-center justify-between'>
                                <Shimmer className='h-4 w-48 rounded' />
                                <div className='flex items-center gap-2'>
                                    <Shimmer className='h-8 w-20 rounded' />
                                    <Shimmer className='h-8 w-16 rounded' />
                                    <Shimmer className='h-8 w-18 rounded' />
                                </div>
                            </div>
                        </div>
                    </Card>
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
            {/* header */}
            <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => navigate(from === 'dashboard' ? '/dashboard' : '/browse')}
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
                        <span className='text-sm text-muted-foreground hidden sm:block'>
                            Welcome, {user?.name.split(' ')[0]}
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

                    <CardContent className='p-8 space-y-6'>
                        {/* Images Section */}
                        {entry.images && entry.images.length > 0 && (
                            <div className='space-y-4'>
                                <div className='flex items-center justify-between'>
                                    <h3 className='text-lg font-medium text-foreground flex items-center gap-2'>
                                        <ImageIcon className='w-5 h-5' />
                                        Images ({entry.images.length})
                                    </h3>
                                </div>
                                
                                {/* Single Image - Full Width */}
                                {entry.images.length === 1 && (
                                    <div className='relative group'>
                                        <img
                                            src={entry.images[0].url}
                                            alt={entry.images[0].alt || 'Entry image'}
                                            className='w-full max-h-96 object-cover rounded-xl shadow-soft hover:shadow-lg transition-shadow duration-200 cursor-pointer'
                                            loading="lazy"
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                devLog('Image clicked:', entry.images[0].url);
                                                setSelectedImage({ url: entry.images[0].url, alt: entry.images[0].alt });
                                            }}
                                        />
                                        <div 
                                            className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-end justify-center pb-4 cursor-pointer'
                                            onClick={(e) => {
                                                e.preventDefault();
                                                e.stopPropagation();
                                                setSelectedImage({ url: entry.images[0].url, alt: entry.images[0].alt });
                                            }}
                                        >
                                            <div className='bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800 pointer-events-none'>
                                                Click to expand
                                            </div>
                                        </div>
                                        {entry.images[0].alt && (
                                            <div className='mt-3 p-3 bg-muted/50 rounded-lg'>
                                                <p className='text-sm text-muted-foreground'>
                                                    {entry.images[0].alt}
                                                </p>
                                            </div>
                                        )}
                                    </div>
                                )}

                                {/* Two Images - Side by Side */}
                                {entry.images.length === 2 && (
                                    <div className='grid grid-cols-2 gap-4'>
                                        {entry.images.map((image, index) => (
                                            <div key={image.publicId} className='relative group'>
                                                <img
                                                    src={image.url}
                                                    alt={image.alt || `Entry image ${index + 1}`}
                                                    className='w-full h-64 object-cover rounded-xl shadow-soft hover:shadow-lg transition-shadow duration-200 cursor-pointer'
                                                    loading="lazy"
                                                    onClick={(e) => {
                                                        e.preventDefault();
                                                        e.stopPropagation();
                                                        setSelectedImage({ url: image.url, alt: image.alt });
                                                    }}
                                                />
                                                <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-end justify-center pb-4'>
                                                    <div className='bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800'>
                                                        Click to expand
                                                    </div>
                                                </div>
                                                {image.alt && (
                                                    <p className='text-xs text-muted-foreground mt-2 px-1'>
                                                        {image.alt}
                                                    </p>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                )}

                                {/* Three or More Images - Masonry Layout */}
                                {entry.images.length >= 3 && (
                                    <div className='space-y-4'>
                                        {/* First image - hero */}
                                        <div className='relative group'>
                                            <img
                                                src={entry.images[0].url}
                                                alt={entry.images[0].alt || 'Entry image 1'}
                                                className='w-full h-80 object-cover rounded-xl shadow-soft hover:shadow-lg transition-shadow duration-200 cursor-pointer'
                                                loading="lazy"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    setSelectedImage({ url: entry.images[0].url, alt: entry.images[0].alt });
                                                }}
                                            />
                                            <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-xl flex items-end justify-center pb-4'>
                                                <div className='bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-sm font-medium text-gray-800'>
                                                    Click to expand
                                                </div>
                                            </div>
                                            {entry.images[0].alt && (
                                                <p className='text-xs text-muted-foreground mt-2 px-1'>
                                                    {entry.images[0].alt}
                                                </p>
                                            )}
                                        </div>
                                        
                                        {/* Remaining images in grid */}
                                        <div className='grid grid-cols-2 md:grid-cols-3 gap-3'>
                                            {entry.images.slice(1).map((image, index) => (
                                                <div key={image.publicId} className='relative group'>
                                                    <img
                                                        src={image.url}
                                                        alt={image.alt || `Entry image ${index + 2}`}
                                                        className='w-full h-32 md:h-40 object-cover rounded-lg shadow-soft hover:shadow-lg transition-shadow duration-200 cursor-pointer'
                                                        loading="lazy"
                                                        onClick={(e) => {
                                                            e.preventDefault();
                                                            e.stopPropagation();
                                                            setSelectedImage({ url: image.url, alt: image.alt });
                                                        }}
                                                    />
                                                    <div className='absolute inset-0 bg-gradient-to-t from-black/20 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-200 rounded-lg flex items-end justify-center pb-2'>
                                                        <div className='bg-white/90 backdrop-blur-sm px-2 py-1 rounded-full text-xs font-medium text-gray-800'>
                                                            Expand
                                                        </div>
                                                    </div>
                                                    {image.alt && (
                                                        <p className='text-xs text-muted-foreground mt-1 px-1 truncate'>
                                                            {image.alt}
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Content Section */}
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
                                    Insights
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
                                    onClick={() => setShowDeleteModal(true)}
                                >
                                    <Trash2 className='h-4 w-4 mr-2' />
                                    Delete
                                </Button>
                            </div>
                        </div>
                    </div>
                </Card>
            {/* Image Modal */}
            <ImageModal
                isOpen={!!selectedImage}
                onClose={() => setSelectedImage(null)}
                imageUrl={selectedImage?.url || ''}
                alt={selectedImage?.alt}
            />

            {/* AI Summary Panel */}
            <AiSummaryPanel
                isOpen={showSummaryPanel}
                onClose={() => setShowSummaryPanel(false)}
                entryContent={entry?.content || ''}
                entryTitle={entry?.title || ''}
            />

            {/* Delete Confirmation Modal */}
            <ConfirmationModal
                isOpen={showDeleteModal}
                onClose={() => setShowDeleteModal(false)}
                onConfirm={handleDelete}
                title="Delete Entry"
                description="Are you sure you want to delete this journal entry? This action cannot be undone."
                confirmText="Delete"
                cancelText="Cancel"
                variant="destructive"
            />

            {/* Logout Confirmation Modal */}
            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title="Logout"
                description="Are you sure you want to logout?"
                confirmText="Logout"
                cancelText="Cancel"
                variant="destructive"
            />
            </main>
        </div>
    );
}
