// /pages/BrowseEntries.tsx
import { useState, useEffect, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Shimmer, ShimmerCard, ShimmerText, ShimmerEntry } from '@/components/ui/shimmer';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
import { useEntries } from '@/hooks/useEntries';
import { buildApiUrl } from '@/config/api';
import { formatDistanceToNow, format } from 'date-fns';
import { Search, Filter, ArrowLeft, Eye, Edit, Calendar } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

const PAGE_SIZE = 9; // 3x3 grid

export default function BrowseEntries() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState('');
    const [selectedMood, setSelectedMood] = useState('');
    const [selectedTag, setSelectedTag] = useState('');
    const [sortBy, setSortBy] = useState<'newest' | 'oldest' | 'title'>('newest');
    const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');
    const [filterTag, setFilterTag] = useState('all');
    const [filterYear, setFilterYear] = useState('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [pagination, setPagination] = useState({
        total: 0,
        limit: 20,
        offset: 0,
        hasMore: false
    });

    const fetchEntries = useCallback(async () => {
        setIsLoading(true);
        try {
            const res = await fetch(buildApiUrl(`/api/entries?page=${currentPage}&limit=${PAGE_SIZE}&search=${encodeURIComponent(searchTerm)}&mood=${selectedMood}&tag=${selectedTag}`), {
                headers: { Authorization: `Bearer ${token}` },
                credentials: 'include',
            });
            const data = await res.json();
            if (res.ok) {
                // Debug logs removed - API working correctly
                
                // Ensure we have a valid array
                if (Array.isArray(data)) {
                    setEntries(data);
                } else if (data && Array.isArray(data.entries)) {
                    setEntries(data.entries);
                } else {
                    console.error('Invalid API response format:', data);
                    setEntries([]);
                }
            }
        } catch (error) {
            console.error('Failed to fetch entries', error);
        } finally {
            setIsLoading(false);
        }
    }, [token]);

    useEffect(() => {
        if (token) fetchEntries();
    }, [token, fetchEntries]);

    useEffect(() => {
        const handleStorage = (e: StorageEvent) => {
            if (e.key === 'new-entry-saved') fetchEntries();
        };
        window.addEventListener('storage', handleStorage);
        return () => window.removeEventListener('storage', handleStorage);
    }, [fetchEntries]);

    const allTags = Array.isArray(entries) ? Array.from(new Set(entries.flatMap((entry) => entry.tags))) : [];
    const allYears = Array.isArray(entries) ? Array.from(
        new Set(entries.map((entry) => new Date(entry.createdAt).getFullYear()))
    ).sort((a, b) => b - a) : [];

    const filteredEntries = Array.isArray(entries) ? entries
        .filter((entry) => {
            const matchesSearch =
                entry.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
                entry.content.toLowerCase().includes(searchTerm.toLowerCase());
            const matchesTag =
                filterTag === 'all' || entry.tags.includes(filterTag);
            const matchesYear =
                filterYear === 'all' ||
                new Date(entry.createdAt).getFullYear().toString() ===
                    filterYear;
            return matchesSearch && matchesTag && matchesYear;
        })
        .sort((a, b) => {
            if (sortBy === 'newest')
                return (
                    new Date(b.createdAt).getTime() -
                    new Date(a.createdAt).getTime()
                );
            if (sortBy === 'oldest')
                return (
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
                );
            return a.title.localeCompare(b.title);
        }) : [];

    // For performance with large datasets, implement virtual pagination
    const ITEMS_PER_PAGE = 50; // Increased from 9 for better performance
    const totalPages = Math.ceil(filteredEntries.length / ITEMS_PER_PAGE);
    const paginatedEntries = filteredEntries.slice(
        (currentPage - 1) * ITEMS_PER_PAGE,
        currentPage * ITEMS_PER_PAGE
    );

    useEffect(() => {
        setCurrentPage(1); // reset page when filters/search change
    }, [searchTerm, sortBy, filterTag, filterYear]);

    return (
        <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft'>
            {/* HEADER */}
            <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => navigate('/dashboard')}
                            className='hover:bg-secondary-soft'
                        >
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                        <div>
                            <h1 className='text-2xl font-semibold text-foreground'>
                                Browse Entries
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                All your journal entries
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span className='text-sm text-muted-foreground hidden sm:block'>
                            Hello, {user?.name.split(' ')[0]}
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

            <main className='container mx-auto px-4 py-8'>
                {/* SEARCH & FILTER */}
                <Card className='mb-8 shadow-elegant'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Filter className='h-5 w-5' /> Search & Filter
                        </CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className='grid grid-cols-1 md:grid-cols-4 gap-4'>
                            <div className='relative'>
                                <Search className='absolute left-3 top-3 h-4 w-4 text-muted-foreground' />
                                <Input
                                    placeholder='Search entries...'
                                    value={searchTerm}
                                    onChange={(e) =>
                                        setSearchTerm(e.target.value)
                                    }
                                    className='pl-10'
                                />
                            </div>
                            <Select value={sortBy} onValueChange={(value: 'newest' | 'oldest' | 'title') => setSortBy(value)}>
                                <SelectTrigger>
                                    <SelectValue placeholder='Sort by' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='newest'>
                                        Newest First
                                    </SelectItem>
                                    <SelectItem value='oldest'>
                                        Oldest First
                                    </SelectItem>
                                    <SelectItem value='title'>
                                        Title A-Z
                                    </SelectItem>
                                </SelectContent>
                            </Select>
                            <Select
                                value={filterTag}
                                onValueChange={setFilterTag}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Filter by tag' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>
                                        All Tags
                                    </SelectItem>
                                    {allTags.map((tag) => (
                                        <SelectItem key={tag} value={tag}>
                                            {tag}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                            <Select
                                value={filterYear}
                                onValueChange={setFilterYear}
                            >
                                <SelectTrigger>
                                    <SelectValue placeholder='Filter by year' />
                                </SelectTrigger>
                                <SelectContent>
                                    <SelectItem value='all'>
                                        All Years
                                    </SelectItem>
                                    {allYears.map((year) => (
                                        <SelectItem
                                            key={year}
                                            value={year.toString()}
                                        >
                                            {year}
                                        </SelectItem>
                                    ))}
                                </SelectContent>
                            </Select>
                        </div>
                    </CardContent>
                </Card>

                {/* ENTRIES GRID */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4'>
                    {isLoading ? (
                        // Shimmer loading for entries
                        Array.from({ length: 6 }).map((_, i) => (
                            <ShimmerEntry key={i} />
                        ))
                    ) : (
                        paginatedEntries.map((entry) => (
                            <Card
                                key={entry._id}
                                className='shadow-elegant hover:shadow-soft transition-shadow cursor-pointer group'
                            >
                                <CardHeader className='pb-3'>
                                    <div className='flex items-start justify-between'>
                                        <div className='flex-1'>
                                            <CardTitle className='text-lg font-medium line-clamp-1'>
                                                {entry.title}
                                            </CardTitle>
                                            <div className='flex items-center gap-2 mt-2'>
                                                <Badge
                                                    variant='secondary'
                                                    className='text-sm'
                                                >
                                                    {entry.mood}
                                                </Badge>
                                                <div className='flex items-center gap-1 text-xs text-muted-foreground'>
                                                    <Calendar className='h-3 w-3' />
                                                    {format(
                                                        new Date(entry.createdAt),
                                                        'MMM dd, yyyy'
                                                    )}
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </CardHeader>
                                <CardContent className='pt-0'>
                                    <div
                                        className='text-sm text-muted-foreground line-clamp-3 mb-4 prose prose-sm max-w-none'
                                        dangerouslySetInnerHTML={{
                                            __html: entry.content,
                                        }}
                                    />
                                    <div className='flex items-center gap-2 flex-wrap mb-4'>
                                        {entry.tags.slice(0, 3).map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant='outline'
                                                className='text-xs'
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                        {entry.tags.length > 3 && (
                                            <Badge
                                                variant='outline'
                                                className='text-xs'
                                            >
                                                +{entry.tags.length - 3}
                                            </Badge>
                                        )}
                                    </div>
                                    <div className='flex items-center justify-between'>
                                        <p className='text-xs text-muted-foreground'>
                                            {formatDistanceToNow(
                                                new Date(entry.createdAt),
                                                { addSuffix: true }
                                            )}
                                        </p>
                                        <div className='flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity'>
                                            <Button
                                                variant='ghost'
                                                size='icon-sm'
                                                asChild
                                                className='h-8 w-8'
                                            >
                                                <Link to={`/entries/${entry._id}`}>
                                                    <Eye className='h-3 w-3' />
                                                </Link>
                                            </Button>
                                            <Button
                                                variant='ghost'
                                                size='icon-sm'
                                                asChild
                                                className='h-8 w-8'
                                            >
                                                <Link
                                                    to={`/entries/${entry._id}/edit`}
                                                >
                                                    <Edit className='h-3 w-3' />
                                                </Link>
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))
                    )}
                </div>

                {/* PAGINATION CONTROLS */}
                {totalPages > 1 && (
                    <div className='flex justify-center items-center gap-4 mt-8'>
                        <Button
                            variant='outline'
                            disabled={currentPage === 1}
                            onClick={() => setCurrentPage((prev) => prev - 1)}
                        >
                            Previous
                        </Button>
                        <span className='text-sm text-muted-foreground'>
                            Page {currentPage} of {totalPages}
                        </span>
                        <Button
                            variant='outline'
                            disabled={currentPage === totalPages}
                            onClick={() => setCurrentPage((prev) => prev + 1)}
                        >
                            Next
                        </Button>
                    </div>
                )}

                {!isLoading && filteredEntries.length === 0 && (
                    <Card className='text-center py-12 shadow-elegant'>
                        <CardContent>
                            <div className='text-muted-foreground mb-4'>
                                <Search className='h-12 w-12 mx-auto mb-4 opacity-50' />
                                <p className='text-lg font-medium'>
                                    No entries found
                                </p>
                                <p className='text-sm'>
                                    Try adjusting your search or filters
                                </p>
                            </div>
                            <Button
                                variant='soft'
                                onClick={() => {
                                    setSearchTerm('');
                                    setFilterTag('all');
                                    setFilterYear('all');
                                }}
                            >
                                Clear filters
                            </Button>
                        </CardContent>
                    </Card>
                )}
            </main>
            
            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={() => {
                    logout();
                    setShowLogoutModal(false);
                }}
                title='Logout'
                description='Are you sure you want to logout?'
                confirmText='Logout'
                cancelText='Cancel'
            />
        </div>
    );
}
