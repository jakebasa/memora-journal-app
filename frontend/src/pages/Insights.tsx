import { useState, useEffect, useMemo } from 'react';
import { useEntries } from '@/hooks/useEntries';
import { Button } from '@/components/ui/button';
import {
    Card,
    CardContent,
    CardHeader,
    CardTitle,
    CardDescription,
} from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Shimmer, ShimmerCard, ShimmerText } from '@/components/ui/shimmer';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/contexts/AuthContext';
import { useToast } from '@/hooks/use-toast';
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
    Sparkles,
    Brain,
    Loader2,
    Tag,
    BarChart3,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { buildApiUrl } from '@/config/api';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

const Insights = () => {
    const { user, token, logout } = useAuth();
    const navigate = useNavigate();
    const [isLoading, setIsLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const { toast } = useToast();

    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [selectedPeriod, setSelectedPeriod] = useState('monthly');
    const [aiSummary, setAiSummary] = useState<string>('');
    const [isGeneratingSummary, setIsGeneratingSummary] = useState(false);
    const [summaryData, setSummaryData] = useState<{
        summary: string;
        period: string;
        entryCount: number;
        dateRange: {
            start: string;
            end: string;
        };
    } | null>(null);

    const { entries: cachedEntries, loading: entriesLoading } = useEntries();

    useEffect(() => {
        setEntries(cachedEntries);
        setLoading(entriesLoading);
    }, [cachedEntries, entriesLoading]);

    useEffect(() => {
        const fetchEntries = async () => {
            try {
                const res = await fetch(
                    `${
                        import.meta.env.VITE_BACKEND_URL ||
                        'http://localhost:5000'
                    }/api/entries?limit=1000`,
                    {
                        headers: { Authorization: `Bearer ${token}` },
                    }
                );
                const data = await res.json();
                if (res.ok) {
                    const entriesArray = Array.isArray(data) ? data : [];
                    setEntries(entriesArray);
                } else {
                    console.error('Failed to fetch entries');
                }
            } catch (error) {
                console.error(error);
            } finally {
                setLoading(false);
            }
        };
        if (token) fetchEntries();
    }, [token]);

    const generateSummary = async () => {
        setIsGeneratingSummary(true);
        try {
            const response = await fetch(
                buildApiUrl('/api/ai/period-summary'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    body: JSON.stringify({ period: selectedPeriod }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to generate summary');
            }

            const data = await response.json();
            setSummaryData(data);
            setAiSummary(data.summary);
        } catch (error) {
            toast({
                title: 'Summary Generation Failed',
                description: 'Could not generate summary. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsGeneratingSummary(false);
        }
    };

    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 1000);
        return () => clearTimeout(timer);
    }, []);

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

        // Get unique journal days in Philippine time YYYY-MM-DD format
        const uniqueDays = Array.from(
            new Set(
                entries.map((e) => {
                    // Convert to Philippine time before extracting date
                    const philippineDate = new Date(
                        e.createdAt
                    ).toLocaleDateString('en-CA', {
                        timeZone: 'Asia/Manila',
                    });
                    return philippineDate; // Returns YYYY-MM-DD format
                })
            )
        ).sort(); // ascending order

        if (uniqueDays.length === 0) return 0;

        let streak = 0;
        const today = new Date();

        // Start from today in Philippine time
        const checkDate = new Date(
            today.toLocaleDateString('en-CA', {
                timeZone: 'Asia/Manila',
            })
        );

        // Check if there's an entry today, if not start from yesterday
        const todayStr = checkDate.toISOString().slice(0, 10);
        if (!uniqueDays.includes(todayStr)) {
            checkDate.setDate(checkDate.getDate() - 1);
        }

        // Loop backwards from the starting date
        while (uniqueDays.includes(checkDate.toISOString().slice(0, 10))) {
            streak++;
            checkDate.setDate(checkDate.getDate() - 1);
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
            hour: new Date(2024, 0, 1, i).toLocaleTimeString('en-PH', {
                hour: 'numeric',
                hour12: true,
                timeZone: 'Asia/Manila',
            }),
            count: 0,
        }));
        entries.forEach((e) => {
            // Convert to Philippine time before getting hour
            const philippineDate = new Date(e.createdAt).toLocaleString(
                'en-US',
                {
                    timeZone: 'Asia/Manila',
                }
            );
            const h = new Date(philippineDate).getHours();
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

    if (loading) {
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
                            <span className='text-sm text-muted-foreground hidden sm:block'>
                                Hello, {user?.name.split(' ')[0]}
                            </span>
                            <ThemeToggle />
                            <Button
                                variant='ghost'
                                onClick={() => setShowLogoutModal(true)}
                                size='sm'
                            >
                                <span className='hidden sm:inline'>Logout</span>
                                <span className='sm:hidden'>Exit</span>
                            </Button>
                        </div>
                    </div>
                </header>

                <main className='container mx-auto px-4 py-8'>
                    {/* Journey Reflection Shimmer */}
                    <Card className='shadow-elegant mb-8'>
                        <CardHeader>
                            <div className='flex items-center justify-between'>
                                <div className='flex items-center gap-2'>
                                    <Sparkles className='h-5 w-5 text-primary' />
                                    <CardTitle>Journey Reflection</CardTitle>
                                </div>
                                <div className='flex items-center gap-3'>
                                    <Shimmer className='h-10 w-32 rounded' />
                                    <Shimmer className='h-10 w-40 rounded' />
                                </div>
                            </div>
                            <CardDescription>
                                Discover patterns and insights from your
                                journaling journey
                            </CardDescription>
                        </CardHeader>
                        <CardContent>
                            <div className='text-center py-8'>
                                <Shimmer className='h-12 w-12 mx-auto mb-4 rounded' />
                                <ShimmerText
                                    lines={2}
                                    className='max-w-md mx-auto'
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* Key Metrics Shimmer */}
                    <div className='grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8'>
                        <ShimmerCard />
                        <ShimmerCard />
                        <ShimmerCard />
                        <ShimmerCard />
                    </div>

                    {/* Charts Shimmer */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                        <Card className='shadow-elegant'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Calendar className='h-5 w-5' /> Weekly
                                    Activity
                                </CardTitle>
                                <CardDescription>
                                    Your journaling activity this week
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <div className='flex justify-between items-center mb-4'>
                                    {Array.from({ length: 7 }).map((_, i) => (
                                        <div
                                            key={i}
                                            className='flex flex-col items-center space-y-2'
                                        >
                                            <Shimmer className='w-8 h-8 rounded-sm' />
                                            <Shimmer className='w-6 h-3 rounded' />
                                        </div>
                                    ))}
                                </div>
                                <Shimmer className='h-4 w-32 mx-auto rounded' />
                            </CardContent>
                        </Card>

                        <Card className='shadow-elegant'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Heart className='h-5 w-5' /> Mood
                                    Distribution
                                </CardTitle>
                                <CardDescription>
                                    How you've been feeling
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div key={i} className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <Shimmer className='h-4 w-16 rounded' />
                                            <Shimmer className='h-4 w-12 rounded' />
                                        </div>
                                        <Shimmer className='h-2 w-full rounded' />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Bottom Cards Shimmer */}
                    <div className='grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8'>
                        <Card className='shadow-elegant'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Target className='h-5 w-5' /> Popular
                                    Topics
                                </CardTitle>
                                <CardDescription>
                                    Your most frequently used tags
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                {Array.from({ length: 5 }).map((_, i) => (
                                    <div
                                        key={i}
                                        className='flex items-center justify-between'
                                    >
                                        <div className='flex items-center gap-3'>
                                            <Shimmer className='w-6 h-6 rounded-full' />
                                            <Shimmer className='h-6 w-20 rounded-full' />
                                        </div>
                                        <Shimmer className='h-4 w-16 rounded' />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

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
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className='space-y-2'>
                                        <div className='flex items-center justify-between'>
                                            <Shimmer className='h-4 w-12 rounded' />
                                            <Shimmer className='h-4 w-16 rounded' />
                                        </div>
                                        <Shimmer className='h-2 w-full rounded' />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>
                    </div>

                    {/* Progress Shimmer */}
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
                            {Array.from({ length: 3 }).map((_, i) => (
                                <div
                                    key={i}
                                    className='text-center p-6 bg-primary/5 rounded-lg'
                                >
                                    <Shimmer className='h-8 w-16 mx-auto mb-2 rounded' />
                                    <Shimmer className='h-4 w-24 mx-auto mb-1 rounded' />
                                    <Shimmer className='h-3 w-20 mx-auto rounded' />
                                </div>
                            ))}
                        </CardContent>
                    </Card>
                </main>
            </div>
        );
    }

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
                        <span className='text-sm text-muted-foreground hidden sm:block'>
                            Hello, {user?.name.split(' ')[0]}
                        </span>
                        <ThemeToggle />
                        <Button
                            variant='ghost'
                            onClick={() => setShowLogoutModal(true)}
                            size='sm'
                        >
                            <span className='hidden sm:inline'>Logout</span>
                            <span className='sm:hidden'>Exit</span>
                        </Button>
                    </div>
                </div>
            </header>

            <main className='container mx-auto px-4 py-8'>
                {/* Journey Reflection Section - Hidden in simple mode */}
                <Card className='shadow-elegant mb-8'>
                    <CardHeader>
                        <div className='flex flex-col sm:flex-row sm:items-center justify-between gap-4'>
                            <div className='flex items-center gap-2'>
                                <Sparkles className='h-5 w-5 text-primary' />
                                <CardTitle>Journey Reflection</CardTitle>
                            </div>
                            <div className='flex items-center gap-3 flex-wrap'>
                                <Select
                                    value={selectedPeriod}
                                    onValueChange={setSelectedPeriod}
                                >
                                    <SelectTrigger className='w-32'>
                                        <SelectValue />
                                    </SelectTrigger>
                                    <SelectContent>
                                        <SelectItem value='daily'>
                                            Daily
                                        </SelectItem>
                                        <SelectItem value='weekly'>
                                            Weekly
                                        </SelectItem>
                                        <SelectItem value='monthly'>
                                            Monthly
                                        </SelectItem>
                                        <SelectItem value='yearly'>
                                            Yearly
                                        </SelectItem>
                                    </SelectContent>
                                </Select>
                                <Button
                                    onClick={generateSummary}
                                    disabled={isGeneratingSummary}
                                    variant='outline'
                                    size='sm'
                                    className='flex-shrink-0'
                                >
                                    {isGeneratingSummary ? (
                                        <>
                                            <Loader2 className='h-4 w-4 mr-2 animate-spin' />
                                            <span className='hidden sm:inline'>
                                                Generating...
                                            </span>
                                            <span className='sm:hidden'>
                                                Gen...
                                            </span>
                                        </>
                                    ) : (
                                        <>
                                            <Brain className='h-4 w-4 sm:mr-2' />
                                            <span className='hidden sm:inline'>
                                                Generate Summary
                                            </span>
                                            <span className='sm:hidden'>
                                                Generate
                                            </span>
                                        </>
                                    )}
                                </Button>
                            </div>
                        </div>
                        <CardDescription>
                            Discover patterns and insights from your journaling
                            journey for the selected time period
                        </CardDescription>
                    </CardHeader>
                    {summaryData && (
                        <CardContent>
                            <div className='bg-gradient-to-r from-primary-soft/20 to-secondary-soft/20 border border-primary/20 rounded-lg p-6'>
                                <div className='flex items-center gap-2 mb-4'>
                                    <Brain className='h-5 w-5 text-primary' />
                                    <span className='font-medium text-primary'>
                                        {summaryData.period
                                            .charAt(0)
                                            .toUpperCase() +
                                            summaryData.period.slice(1)}{' '}
                                        Summary
                                    </span>
                                    <Badge variant='secondary' className='ml-2'>
                                        {summaryData.entryCount} entries
                                    </Badge>
                                </div>
                                <div className='prose prose-sm max-w-none text-foreground/90 leading-relaxed'>
                                    {aiSummary
                                        .split('\n')
                                        .map((paragraph, index) => (
                                            <p
                                                key={index}
                                                className='mb-3 last:mb-0'
                                            >
                                                {paragraph}
                                            </p>
                                        ))}
                                </div>
                            </div>
                        </CardContent>
                    )}
                    {!summaryData && !isGeneratingSummary && (
                        <CardContent>
                            <div className='text-center py-8 text-muted-foreground'>
                                <Sparkles className='h-12 w-12 mx-auto mb-4 opacity-50' />
                                <p>
                                    Select a time period and discover insights
                                    from your journaling journey
                                </p>
                            </div>
                        </CardContent>
                    )}
                </Card>

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
                                {(() => {
                                    const currentMonth = new Date().getMonth();
                                    const currentYear =
                                        new Date().getFullYear();
                                    const monthlyEntries = entries.filter(
                                        (entry) => {
                                            const entryDate = new Date(
                                                entry.createdAt
                                            );
                                            return (
                                                entryDate.getMonth() ===
                                                    currentMonth &&
                                                entryDate.getFullYear() ===
                                                    currentYear
                                            );
                                        }
                                    ).length;
                                    return Math.round(
                                        (monthlyEntries / 30) * 100
                                    );
                                })()}
                                %
                            </div>
                            <p className='text-sm text-muted-foreground'>
                                Monthly Goal Progress
                            </p>
                            <p className='text-xs text-muted-foreground mt-1'>
                                {(() => {
                                    const currentMonth = new Date().getMonth();
                                    const currentYear =
                                        new Date().getFullYear();
                                    const monthlyEntries = entries.filter(
                                        (entry) => {
                                            const entryDate = new Date(
                                                entry.createdAt
                                            );
                                            return (
                                                entryDate.getMonth() ===
                                                    currentMonth &&
                                                entryDate.getFullYear() ===
                                                    currentYear
                                            );
                                        }
                                    ).length;
                                    return monthlyEntries;
                                })()}{' '}
                                / 30 days
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
};

export default Insights;
