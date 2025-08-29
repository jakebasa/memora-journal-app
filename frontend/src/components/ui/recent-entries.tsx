import { useEffect, useState } from 'react';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { formatDistanceToNow } from 'date-fns';
import { Eye, Edit } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/components/ui/use-toast';

const BACKEND_URL = 'http://localhost:5000';
interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string; // from backend
    updatedAt: string;
}

export function RecentEntries() {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const { token } = useAuth();
    const { toast } = useToast();

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(`${BACKEND_URL}/api/entries?limit=3`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                if (!res.ok) {
                    throw new Error('Failed to fetch entries');
                }

                const data: JournalEntry[] = await res.json();

                // If backend doesn’t support ?limit, slice manually
                setEntries(data.slice(0, 3));
            } catch (error) {
                toast({
                    title: 'Error',
                    description: (error as Error).message,
                    variant: 'destructive',
                });
            }
        };

        if (token) fetchEntries();
    }, [token]);

    return (
        <Card className='shadow-elegant'>
            <CardHeader>
                <CardTitle className='text-lg font-medium'>
                    Recent Entries
                </CardTitle>
                <CardDescription>
                    Your latest thoughts and reflections
                </CardDescription>
            </CardHeader>
            <CardContent className='space-y-4'>
                {entries.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                        No entries yet.
                    </p>
                ) : (
                    entries.map((entry) => (
                        <div
                            key={entry._id}
                            className='space-y-3 p-4 rounded-lg bg-secondary-soft border border-border hover:shadow-soft transition-smooth'
                        >
                            <div className='flex items-start justify-between'>
                                <div className='flex-1 space-y-2'>
                                    <div className='flex items-center gap-3'>
                                        <h3 className='font-medium text-foreground'>
                                            {entry.title}
                                        </h3>
                                        <Badge
                                            variant='secondary'
                                            className='text-sm'
                                        >
                                            {entry.mood}
                                        </Badge>
                                    </div>
                                    <div
                                        className='text-sm text-muted-foreground line-clamp-2 prose prose-sm max-w-none'
                                        dangerouslySetInnerHTML={{
                                            __html: entry.content,
                                        }}
                                    />
                                    <div className='flex items-center gap-2 flex-wrap'>
                                        {entry.tags.map((tag) => (
                                            <Badge
                                                key={tag}
                                                variant='outline'
                                                className='text-xs'
                                            >
                                                {tag}
                                            </Badge>
                                        ))}
                                    </div>
                                    <p className='text-xs text-muted-foreground'>
                                        {formatDistanceToNow(
                                            new Date(entry.createdAt),
                                            { addSuffix: true }
                                        )}
                                    </p>
                                </div>
                                <div className='flex items-center gap-1 ml-4'>
                                    <Button
                                        variant='ghost'
                                        size='icon-sm'
                                        asChild
                                    >
                                        <Link to={`/entries/${entry._id}`}>
                                            <Eye className='h-3 w-3' />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='icon-sm'
                                        asChild
                                    >
                                        <Link to={`/entries/${entry._id}/edit`}>
                                            <Edit className='h-3 w-3' />
                                        </Link>
                                    </Button>
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    );
}
