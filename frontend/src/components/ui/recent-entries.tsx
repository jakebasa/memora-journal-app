import { useEffect, useState, memo } from 'react';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from './card';
import { Badge } from './badge';
import { Button } from './button';
import { Link } from 'react-router-dom';
import { Eye, Edit } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { useAuth } from '../../contexts/AuthContext';
import { useToast } from '../../hooks/use-toast';
import { useEntries } from '../../hooks/useEntries';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string; // from backend
    updatedAt: string;
}

function RecentEntriesComponent() {
    const { entries, loading, error } = useEntries();
    const { toast } = useToast();

    // Show only the 3 most recent entries
    const recentEntries = entries.slice(0, 3);

    useEffect(() => {
        if (error) {
            toast({
                title: 'Error',
                description: error,
                variant: 'destructive',
            });
        }
    }, [error, toast]);

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
                {recentEntries.length === 0 ? (
                    <p className='text-sm text-muted-foreground'>
                        No entries yet.
                    </p>
                ) : (
                    recentEntries.map((entry) => (
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
                                        <Link to={`/entries/${entry._id}?from=dashboard`}>
                                            <Eye className='h-3 w-3' />
                                        </Link>
                                    </Button>
                                    <Button
                                        variant='ghost'
                                        size='icon-sm'
                                        asChild
                                    >
                                        <Link to={`/entries/${entry._id}/edit?from=dashboard`}>
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

export const RecentEntries = memo(RecentEntriesComponent);
