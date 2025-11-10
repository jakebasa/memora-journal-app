import { useState } from 'react';
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
import { Sparkles, TrendingUp, Heart, Brain, Calendar } from 'lucide-react';
import { useToast } from '@/hooks/use-toast';
import { buildApiUrl } from '@/config/api';

interface AiSummaryPanelProps {
    isOpen: boolean;
    onClose: () => void;
    entryContent: string;
    entryTitle: string;
}

interface SummaryData {
    summary: string;
    keyThemes: string[];
    detectedMood: { emoji: string; label: string; confidence: number };
    insights: string[];
    patterns: string[];
    encouragement: string;
}

export function AiSummaryPanel({
    isOpen,
    onClose,
    entryContent,
    entryTitle,
}: AiSummaryPanelProps) {
    const [summaryData, setSummaryData] = useState<SummaryData | null>(null);
    const [isAnalyzing, setIsAnalyzing] = useState(false);
    const { toast } = useToast();

    const analyzeEntry = async () => {
        setIsAnalyzing(true);
        try {
            const token = localStorage.getItem('journal-token');

            if (!token) {
                toast({
                    title: 'Authentication Required',
                    description: 'Please log in to analyze your entry.',
                    variant: 'destructive',
                });
                return;
            }

            const response = await fetch(
                buildApiUrl('/api/ai/summarize'),
                {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        Authorization: `Bearer ${token}`,
                    },
                    credentials: 'include',
                    body: JSON.stringify({
                        entryContent,
                        entryTitle,
                    }),
                }
            );

            if (!response.ok) {
                throw new Error('Failed to analyze entry');
            }

            const analysisData = await response.json();
            setSummaryData(analysisData);
        } catch (error) {
            toast({
                title: 'Analysis Failed',
                description: 'Could not analyze the entry. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsAnalyzing(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className='fixed inset-0 bg-black/50 backdrop-blur-sm z-50 flex items-center justify-center p-4'>
            <Card className='w-full max-w-3xl max-h-[80vh] overflow-y-auto shadow-xl'>
                <CardHeader className='border-b border-border'>
                    <div className='flex items-center justify-between'>
                        <div className='flex items-center gap-2'>
                            <Sparkles className='h-5 w-5 text-primary' />
                            <CardTitle>Entry Insights</CardTitle>
                        </div>
                        <Button variant='ghost' size='sm' onClick={onClose}>
                            ✕
                        </Button>
                    </div>
                    <CardDescription>
                        Deep insights and analysis
                    </CardDescription>
                </CardHeader>

                <CardContent className='space-y-6 p-6'>
                    {!summaryData && !isAnalyzing && (
                        <div className='text-center py-8'>
                            <Sparkles className='h-12 w-12 text-primary mx-auto mb-4' />
                            <h3 className='text-lg font-medium mb-2'>
                                Ready to Analyze
                            </h3>
                            <p className='text-muted-foreground mb-6'>
                                Discover insights about your journal entry
                                including mood analysis, key themes, and
                                patterns.
                            </p>
                            <Button onClick={analyzeEntry} className='px-8'>
                                <Brain className='h-4 w-4 mr-2' />
                                Analyze Entry
                            </Button>
                        </div>
                    )}

                    {isAnalyzing && (
                        <div className='text-center py-8'>
                            <div className='animate-pulse'>
                                <Sparkles className='h-12 w-12 text-primary mx-auto mb-4' />
                            </div>
                            <h3 className='text-lg font-medium mb-2'>
                                Analyzing Your Entry...
                            </h3>
                            <p className='text-muted-foreground mb-4'>
                                Analyzing your thoughts and emotions
                            </p>
                            <Progress value={75} className='w-64 mx-auto' />
                        </div>
                    )}

                    {summaryData && (
                        <div className='space-y-6'>
                            {/* Summary */}
                            <Card className='bg-primary-soft/20 border-primary/20'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        <Brain className='h-5 w-5' />
                                        Summary
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='leading-relaxed'>
                                        {summaryData.summary}
                                    </p>
                                </CardContent>
                            </Card>

                            {/* Mood Analysis */}
                            <Card>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        <Heart className='h-5 w-5' />
                                        Detected Mood
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex items-center gap-4'>
                                        <div className='text-4xl'>
                                            {summaryData.detectedMood.emoji}
                                        </div>
                                        <div className='flex-1'>
                                            <p className='font-medium'>
                                                {summaryData.detectedMood.label}
                                            </p>
                                            <div className='flex items-center gap-2 mt-1'>
                                                <Progress
                                                    value={
                                                        summaryData.detectedMood
                                                            .confidence
                                                    }
                                                    className='flex-1'
                                                />
                                                <span className='text-sm text-muted-foreground'>
                                                    {
                                                        summaryData.detectedMood
                                                            .confidence
                                                    }
                                                    % confident
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Key Themes */}
                            <Card>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        <TrendingUp className='h-5 w-5' />
                                        Key Themes
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <div className='flex flex-wrap gap-2'>
                                        {summaryData.keyThemes.map(
                                            (theme, index) => (
                                                <Badge
                                                    key={index}
                                                    variant='secondary'
                                                >
                                                    {theme}
                                                </Badge>
                                            )
                                        )}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* Insights */}
                            <Card>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg'>
                                        Personal Insights
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className='space-y-2'>
                                        {summaryData.insights.map(
                                            (insight, index) => (
                                                <li
                                                    key={index}
                                                    className='flex items-start gap-2'
                                                >
                                                    <div className='w-1.5 h-1.5 bg-primary rounded-full mt-2 flex-shrink-0' />
                                                    <span className='text-sm leading-relaxed'>
                                                        {insight}
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Detected Patterns */}
                            <Card>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        <Calendar className='h-5 w-5' />
                                        Writing Patterns
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <ul className='space-y-2'>
                                        {summaryData.patterns.map(
                                            (pattern, index) => (
                                                <li
                                                    key={index}
                                                    className='flex items-start gap-2'
                                                >
                                                    <div className='w-1.5 h-1.5 bg-accent rounded-full mt-2 flex-shrink-0' />
                                                    <span className='text-sm leading-relaxed'>
                                                        {pattern}
                                                    </span>
                                                </li>
                                            )
                                        )}
                                    </ul>
                                </CardContent>
                            </Card>

                            {/* Encouragement */}
                            <Card className='bg-gradient-soft border-primary/20'>
                                <CardHeader className='pb-3'>
                                    <CardTitle className='text-lg flex items-center gap-2'>
                                        <Heart className='h-5 w-5 text-success' />
                                        Encouragement
                                    </CardTitle>
                                </CardHeader>
                                <CardContent>
                                    <p className='leading-relaxed text-foreground/90'>
                                        {summaryData.encouragement}
                                    </p>
                                </CardContent>
                            </Card>
                        </div>
                    )}
                </CardContent>
            </Card>
        </div>
    );
}
