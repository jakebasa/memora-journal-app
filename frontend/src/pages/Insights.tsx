import { useState, useEffect, useMemo } from 'react';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import {
    format,
    startOfWeek,
    endOfWeek,
    eachDayOfInterval,
    differenceInCalendarDays,
} from 'date-fns';
import {
    ArrowLeft,
    TrendingUp,
    Calendar,
    Clock,
    Heart,
    Target,
    Zap,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

export default function Insights() {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);

    const fetchEntries = async () => {
        try {
            const res = await fetch('http://localhost:5000/api/entries', {
                headers: { Authorization: `Bearer ${token}` },
            });
            const data = await res.json();
            if (res.ok) setEntries(data);
        } catch (error) {
            console.error(error);
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        if (token) fetchEntries();
    }, [token]);

    // ---------- Computed Metrics ----------
    const sortedEntries = useMemo(
        () =>
            [...entries].sort(
                (a, b) =>
                    new Date(a.createdAt).getTime() -
                    new Date(b.createdAt).getTime()
            ),
        [entries]
    );

    const streakDays = useMemo(() => {
        if (!entries.length) return 0;

        // Get unique journal days in YYYY-MM-DD format
        const uniqueDays = Array.from(
            new Set(
                entries.map((e) =>
                    new Date(e.createdAt).toISOString().slice(0, 10)
                )
            )
        ).sort(); // ascending order

        let streak = 0;
        const day = new Date(); // today

        // Loop backwards from today
        while (uniqueDays.includes(day.toISOString().slice(0, 10))) {
            streak++;
            day.setDate(day.getDate() - 1);
        }

        return streak;
    }, [entries]);
    const totalEntries = entries.length;

    const avgWordsPerEntry = useMemo(() => {
        if (totalEntries === 0) return 0;
        const totalWords = entries.reduce(
            (sum, e) => sum + e.content.split(' ').length,
            0
        );
        return Math.round(totalWords / totalEntries);
    }, [entries, totalEntries]);

    const moodCounts = useMemo(() => {
        return entries.reduce((acc: Record<string, number>, e) => {
            acc[e.mood] = (acc[e.mood] || 0) + 1;
            return acc;
        }, {});
    }, [entries]);

    const mostUsedMood = useMemo(() => {
        return (
            Object.entries(moodCounts).sort((a, b) => b[1] - a[1])[0]?.[0] ||
            '😊'
        );
    }, [moodCounts]);

    const tagCounts = useMemo(() => {
        return entries
            .flatMap((e) => e.tags)
            .reduce((acc: Record<string, number>, tag) => {
                acc[tag] = (acc[tag] || 0) + 1;
                return acc;
            }, {});
    }, [entries]);

    const topTags = useMemo(() => {
        return Object.entries(tagCounts)
            .sort((a, b) => b[1] - a[1])
            .slice(0, 5)
            .map(([tag, count]) => ({ tag, count }));
    }, [tagCounts]);

    const writingTimes: { hour: string; count: number }[] = useMemo(() => {
        const arr = Array.from({ length: 24 }, (_, i) => ({
            hour: `${i}:00`,
            count: 0,
        }));
        entries.forEach((e) => {
            const h = new Date(e.createdAt).getHours();
            arr[h].count += 1;
        });
        return arr.filter((w) => w.count > 0);
    }, [entries]);

    const currentWeek = eachDayOfInterval({
        start: startOfWeek(new Date()),
        end: endOfWeek(new Date()),
    });

    const weeklyActivity = currentWeek.map((day) => {
        const count = entries.filter(
            (e) => new Date(e.createdAt).toDateString() === day.toDateString()
        ).length;
        return { date: day, entries: count };
    });

    const moodDistribution = useMemo(() => {
        return Object.entries(moodCounts)
            .map(([mood, count]) => ({
                mood,
                name: mood,
                count,
                percentage: Math.round((count / totalEntries) * 100),
            }))
            .sort((a, b) => b.count - a.count); // always highest first
    }, [moodCounts, totalEntries]);

    const getActivityLevel = (count: number) => {
        if (count === 0) return 'opacity-20';
        if (count === 1) return 'opacity-40';
        if (count === 2) return 'opacity-60';
        return 'opacity-100';
    };

    // Pagination for Mood Distribution
    const [currentPage, setCurrentPage] = useState(1);
    const itemsPerPage = 5;
    const totalPages = Math.ceil(moodDistribution.length / itemsPerPage);
    const paginatedMoods = moodDistribution.slice(
        (currentPage - 1) * itemsPerPage,
        currentPage * itemsPerPage
    );

    if (loading) return <div className='p-8 text-center'>Loading...</div>;

    // ---------- JSX Render ----------
    return (
        <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft'>
            <header className='border-b border-border bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60'>
                <div className='container mx-auto px-4 py-4 flex items-center justify-between'>
                    <div className='flex items-center gap-4'>
                        <Button
                            variant='ghost'
                            size='icon'
                            onClick={() => navigate('/dashboard')}
                        >
                            <ArrowLeft className='h-4 w-4' />
                        </Button>
                        <div>
                            <h1 className='text-2xl font-semibold text-foreground'>
                                Insights
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                Your journaling patterns and progress
                            </p>
                        </div>
                    </div>
                    <div className='flex items-center gap-4'>
                        <span className='text-sm text-muted-foreground'>
                            Hello, {user?.name.split(' ')[0]}
                        </span>
                        <ThemeToggle />
                        <Button variant='ghost' onClick={logout}>
                            Logout
                        </Button>
                    </div>
                </div>
            </header>

            <main className='container mx-auto px-4 py-8'>
                {/* Key Metrics */}
                <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                    <Card className='shadow-elegant'>
                        <CardContent className='p-6 flex items-center gap-4'>
                            <div className='p-3 bg-primary/10 rounded-lg'>
                                <Zap className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <p className='text-2xl font-bold text-foreground'>
                                    {streakDays}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    Day Streak
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='shadow-elegant'>
                        <CardContent className='p-6 flex items-center gap-4'>
                            <div className='p-3 bg-primary/10 rounded-lg'>
                                <Calendar className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <p className='text-2xl font-bold text-foreground'>
                                    {totalEntries}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    Total Entries
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='shadow-elegant'>
                        <CardContent className='p-6 flex items-center gap-4'>
                            <div className='p-3 bg-primary/10 rounded-lg'>
                                <TrendingUp className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <p className='text-2xl font-bold text-foreground'>
                                    {avgWordsPerEntry}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    Avg Words
                                </p>
                            </div>
                        </CardContent>
                    </Card>

                    <Card className='shadow-elegant'>
                        <CardContent className='p-6 flex items-center gap-4'>
                            <div className='p-3 bg-primary/10 rounded-lg'>
                                <Heart className='h-6 w-6 text-primary' />
                            </div>
                            <div>
                                <p className='text-2xl font-bold text-foreground'>
                                    {mostUsedMood}
                                </p>
                                <p className='text-sm text-muted-foreground'>
                                    Top Mood
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Weekly Activity & Mood Distribution */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    {/* Weekly Activity */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Calendar className='h-5 w-5' /> Weekly Activity
                            </CardTitle>
                            <CardDescription>
                                Your journaling activity this week
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='space-y-4'>
                                <div className='flex justify-between items-center'>
                                    {weeklyActivity.map((day, index) => (
                                        <div
                                            key={index}
                                            className='flex flex-col items-center space-y-2'
                                        >
                                            <div className='text-xs text-muted-foreground'>
                                                {format(day.date, 'EEE')}
                                            </div>
                                            <div
                                                className={`w-8 h-8 bg-primary rounded-sm flex items-center justify-center text-xs font-medium text-primary-foreground ${getActivityLevel(
                                                    day.entries
                                                )}`}
                                            >
                                                {day.entries}
                                            </div>
                                            <div className='text-xs text-muted-foreground'>
                                                {format(day.date, 'dd')}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                                <div className='text-center text-sm text-muted-foreground'>
                                    {weeklyActivity.reduce(
                                        (sum, day) => sum + day.entries,
                                        0
                                    )}{' '}
                                    entries this week
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                    {/* Mood Distribution with Pagination & Animation */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Heart className='h-5 w-5' /> Mood Distribution
                            </CardTitle>
                            <CardDescription>
                                How you've been feeling
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <AnimatePresence mode='popLayout'>
                                {paginatedMoods.map((mood) => (
                                    <motion.div
                                        key={mood.mood}
                                        initial={{ opacity: 0, x: -10 }}
                                        animate={{ opacity: 1, x: 0 }}
                                        exit={{ opacity: 0, x: 10 }}
                                        transition={{ duration: 0.3 }}
                                        className='space-y-2'
                                    >
                                        <div className='flex items-center justify-between'>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-lg'>
                                                    {mood.mood}
                                                </span>
                                            </div>
                                            <div className='flex items-center gap-2'>
                                                <span className='text-sm text-muted-foreground'>
                                                    {mood.count}
                                                </span>
                                                <span className='text-sm font-medium'>
                                                    {mood.percentage}%
                                                </span>
                                            </div>
                                        </div>
                                        <Progress
                                            value={mood.percentage}
                                            className='h-2 transition-all duration-500'
                                        />
                                    </motion.div>
                                ))}
                            </AnimatePresence>

                            {/* Pagination Controls */}
                            <div className='flex justify-center gap-2 mt-4'>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    disabled={currentPage === 1}
                                    onClick={() => setCurrentPage((p) => p - 1)}
                                >
                                    Previous
                                </Button>
                                <span className='text-sm text-muted-foreground'>
                                    Page {currentPage} of {totalPages}
                                </span>
                                <Button
                                    size='sm'
                                    variant='outline'
                                    disabled={currentPage === totalPages}
                                    onClick={() => setCurrentPage((p) => p + 1)}
                                >
                                    Next
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>

                {/* Top Tags & Writing Times */}
                <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                    {/* Top Tags */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Target className='h-5 w-5' /> Popular Topics
                            </CardTitle>
                            <CardDescription>
                                Your most frequently used tags
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {topTags.map((item, index) => (
                                <div
                                    key={item.tag}
                                    className='flex items-center justify-between'
                                >
                                    <div className='flex items-center gap-3'>
                                        <div className='w-6 h-6 bg-primary/10 rounded-full flex items-center justify-center text-xs font-medium text-primary'>
                                            {index + 1}
                                        </div>
                                        <Badge
                                            variant='outline'
                                            className='capitalize'
                                        >
                                            {item.tag}
                                        </Badge>
                                    </div>
                                    <span className='text-sm font-medium text-muted-foreground'>
                                        {item.count} entries
                                    </span>
                                </div>
                            ))}
                        </CardContent>
                    </Card>

                    {/* Writing Times */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Clock className='h-5 w-5' /> Writing Times
                            </CardTitle>
                            <CardDescription>
                                When you prefer to journal
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            {writingTimes.map((time) => (
                                <div key={time.hour} className='space-y-2'>
                                    <div className='flex items-center justify-between'>
                                        <span className='text-sm font-medium'>
                                            {time.hour}
                                        </span>
                                        <span className='text-sm text-muted-foreground'>
                                            {time.count} entries
                                        </span>
                                    </div>
                                    <Progress
                                        value={
                                            (time.count /
                                                Math.max(
                                                    ...writingTimes.map(
                                                        (t) => t.count
                                                    )
                                                )) *
                                            100
                                        }
                                        className='h-2 transition-all duration-500'
                                    />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </div>

                {/* Goals / Progress */}
                <Card className='mt-8 shadow-elegant'>
                    <CardHeader>
                        <CardTitle className='flex items-center gap-2'>
                            <Target className='h-5 w-5' /> Your Progress
                        </CardTitle>
                        <CardDescription>
                            Keep up the great work!
                        </CardDescription>
                    </CardHeader>
                    <CardContent className='grid grid-cols-1 md:grid-cols-3 gap-6'>
                        <div className='text-center p-6 bg-primary/5 rounded-lg'>
                            <div className='text-3xl font-bold text-primary mb-2'>
                                {Math.round((streakDays / 30) * 100)}%
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                Monthly Goal Progress
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                                {streakDays} / 30 days
                            </p>
                        </div>
                        <div className='text-center p-6 bg-primary/5 rounded-lg'>
                            <div className='text-3xl font-bold text-primary mb-2'>
                                {totalEntries}
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                Lifetime Entries
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                                Amazing dedication!
                            </p>
                        </div>
                        <div className='text-center p-6 bg-primary/5 rounded-lg'>
                            <div className='text-3xl font-bold text-primary mb-2'>
                                {avgWordsPerEntry}
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                Average Words
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                                Great depth!
                            </p>
                        </div>
                    </CardContent>
                </Card>
            </main>
        </div>
    );
}
