import { useState, useEffect, useCallback, memo } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Eye, Clock } from 'lucide-react';
import { format, isSameDay } from 'date-fns';
import { Link } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { useEntries } from '@/hooks/useEntries';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

function CalendarWidgetComponent() {
    const { entries, loading } = useEntries();
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(new Date());
    const [memories, setMemories] = useState<JournalEntry[]>([]);
    const [showMemories, setShowMemories] = useState(false);

    // Calculate memories when entries change
    useEffect(() => {
        const today = new Date();
        const todayMemories = entries.filter((entry: JournalEntry) => {
            const entryDate = new Date(entry.createdAt);
            return (
                entryDate.getMonth() === today.getMonth() &&
                entryDate.getDate() === today.getDate() &&
                entryDate.getFullYear() !== today.getFullYear()
            );
        });
        setMemories(todayMemories);
    }, [entries]);

    // Get entries for calendar highlighting - with null check
    const entryDates = Array.isArray(entries) ? entries.map((entry) => new Date(entry.createdAt)) : [];

    // Get selected date entries - with null check
    const selectedEntries = selectedDate && Array.isArray(entries)
        ? entries.filter((entry) =>
              isSameDay(new Date(entry.createdAt), selectedDate)
          )
        : [];

    if (loading) {
        return (
            <Card className='shadow-elegant text-center'>
                <CardContent className='p-6'>
                    <p className='text-muted-foreground'>Loading calendar...</p>
                </CardContent>
            </Card>
        );
    }

    return (
        <Card className='shadow-elegant text-center'>
            <CardHeader className='pb-4'>
                <div className='flex items-center justify-between'>
                    <CardTitle className='text-lg font-medium'>
                        Journal Calendar
                    </CardTitle>
                    {memories.length > 0 && (
                        <Button
                            variant='ghost'
                            size='sm'
                            onClick={() => setShowMemories(!showMemories)}
                            className='flex items-center gap-2'
                        >
                            <Clock className='h-4 w-4' />
                            Memories ({memories.length})
                        </Button>
                    )}
                </div>
            </CardHeader>
            <CardContent className='space-y-4 flex flex-col justify-center items-center'>
                {showMemories && memories.length > 0 && (
                    <div className='w-full mb-4 p-4 bg-primary-soft/10 rounded-lg border border-primary/20'>
                        <h4 className='font-medium text-primary mb-3 flex items-center gap-2'>
                            <Clock className='h-4 w-4' />
                            On This Day in Previous Years
                        </h4>
                        <div className='space-y-2'>
                            {memories.map((memory) => (
                                <div
                                    key={memory._id}
                                    className='flex items-center justify-between p-2 bg-background rounded border'
                                >
                                    <div className='flex items-center gap-3 flex-1'>
                                        <Badge variant='secondary'>{memory.mood}</Badge>
                                        <div className='text-left'>
                                            <p className='text-sm font-medium'>{memory.title}</p>
                                            <p className='text-xs text-muted-foreground'>
                                                {format(new Date(memory.createdAt), 'yyyy')}
                                            </p>
                                        </div>
                                    </div>
                                    <Button variant='ghost' size='sm' asChild>
                                        <Link to={`/entries/${memory._id}?from=dashboard`}>
                                            <Eye className='h-4 w-4' />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className='rounded-lg border border-border/50 bg-card/50 backdrop-blur-sm'
                    modifiers={{
                        hasEntry: entryDates,
                    }}
                    modifiersClassNames={{
                        hasEntry: 'relative after:absolute after:bottom-0.5 after:left-1/2 after:transform after:-translate-x-1/2 after:w-1.5 after:h-1.5 after:bg-primary after:rounded-full after:shadow-sm',
                    }}
                />

                {selectedEntries.length > 0 && (
                    <div className='pt-4 border-t border-border w-full'>
                        <div className='space-y-3'>
                            <p className='text-sm font-medium text-foreground'>
                                {format(selectedDate!, 'MMMM d, yyyy')} ({selectedEntries.length} {selectedEntries.length === 1 ? 'entry' : 'entries'})
                            </p>
                            {selectedEntries.map((entry, index) => (
                                <div
                                    key={entry._id}
                                    className='flex items-center justify-between p-3 bg-gradient-to-r from-secondary-soft/20 to-accent/10 rounded-lg border border-border/50 hover:border-primary/30 transition-all duration-200 hover:shadow-sm'
                                    style={{ animationDelay: `${index * 100}ms` }}
                                >
                                    <div className='flex items-center gap-3 flex-1'>
                                        <Badge variant='secondary' className='text-lg shadow-sm'>
                                            {entry.mood}
                                        </Badge>
                                        <div className='text-left'>
                                            <p className='text-sm font-medium text-foreground'>{entry.title}</p>
                                            <p className='text-xs text-muted-foreground'>
                                                {format(new Date(entry.createdAt), 'h:mm a')}
                                            </p>
                                            {entry.tags && entry.tags.length > 0 && (
                                                <div className='flex items-center gap-1 mt-1 flex-wrap'>
                                                    {entry.tags.slice(0, 2).map((tag) => (
                                                        <Badge
                                                            key={tag}
                                                            variant='outline'
                                                            className='text-xs'
                                                        >
                                                            {tag}
                                                        </Badge>
                                                    ))}
                                                    {entry.tags.length > 2 && (
                                                        <span className='text-xs text-muted-foreground'>+{entry.tags.length - 2}</span>
                                                    )}
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                    <Button variant='ghost' size='sm' asChild className='hover:bg-primary/10'>
                                        <Link to={`/entries/${entry._id}?from=dashboard`}>
                                            <Eye className='h-4 w-4' />
                                        </Link>
                                    </Button>
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {selectedDate && selectedEntries.length === 0 && (
                    <div className='pt-4 border-t border-border'>
                        <p className='text-sm text-muted-foreground'>
                            No entries for {format(selectedDate, 'MMMM d, yyyy')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}

export const CalendarWidget = memo(CalendarWidgetComponent);
