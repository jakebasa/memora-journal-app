import { useState } from 'react';
import { Calendar } from '@/components/ui/calendar';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { format } from 'date-fns';

interface JournalEntry {
    id: string;
    date: Date;
    title: string;
    mood: string;
    hasEntry: boolean;
}

// Mock data - replace with real data later
const mockEntries: JournalEntry[] = [
    {
        id: '1',
        date: new Date(2024, 7, 15),
        title: 'Beautiful Day',
        mood: '😊',
        hasEntry: true,
    },
    {
        id: '2',
        date: new Date(2024, 7, 20),
        title: 'Reflection',
        mood: '🤔',
        hasEntry: true,
    },
    {
        id: '3',
        date: new Date(2024, 7, 25),
        title: 'Adventure',
        mood: '🎉',
        hasEntry: true,
    },
];

export function CalendarWidget() {
    const [selectedDate, setSelectedDate] = useState<Date | undefined>(
        new Date()
    );

    // Get entries for calendar highlighting
    const entryDates = mockEntries.map((entry) => entry.date);

    // Get selected date entry
    const selectedEntry = selectedDate
        ? mockEntries.find(
              (entry) =>
                  format(entry.date, 'yyyy-MM-dd') ===
                  format(selectedDate, 'yyyy-MM-dd')
          )
        : null;

    return (
        <Card className='shadow-elegant text-center'>
            <CardHeader className='pb-4'>
                <CardTitle className='text-lg font-medium'>
                    Journal Calendar
                </CardTitle>
            </CardHeader>
            <CardContent className='space-y-4 flex flex-col justify-center items-center'>
                <Calendar
                    mode='single'
                    selected={selectedDate}
                    onSelect={setSelectedDate}
                    className='rounded-lg'
                    modifiers={{
                        hasEntry: entryDates,
                    }}
                    modifiersStyles={{
                        hasEntry: {
                            backgroundColor: 'hsl(var(--primary-soft))',
                            color: 'hsl(var(--primary))',
                            fontWeight: '500',
                        },
                    }}
                />

                {selectedEntry && (
                    <div className='pt-4 border-t border-border'>
                        <div className='space-y-2'>
                            <div className='flex items-center justify-between'>
                                <p className='text-sm font-medium text-foreground'>
                                    {format(selectedDate!, 'MMMM d, yyyy')}
                                </p>
                                <Badge variant='secondary' className='text-lg'>
                                    {selectedEntry.mood}
                                </Badge>
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                {selectedEntry.title}
                            </p>
                        </div>
                    </div>
                )}

                {selectedDate && !selectedEntry && (
                    <div className='pt-4 border-t border-border'>
                        <p className='text-sm text-muted-foreground'>
                            No entry for {format(selectedDate, 'MMMM d, yyyy')}
                        </p>
                    </div>
                )}
            </CardContent>
        </Card>
    );
}
