import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarWidget } from '@/components/ui/calendar-widget';
import { RecentEntries } from '@/components/ui/recent-entries';
import { AiChatButton } from '@/components/ui/ai-chat-button';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Plus, Settings, LogOut, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='border-b border-border bg-card/50 backdrop-blur-sm sticky top-0 z-30'>
                <div className='container mx-auto px-4 sm:px-6 lg:px-8'>
                    <div className='flex items-center justify-between h-16'>
                        {/* Logo */}
                        <div className='flex items-center gap-3'>
                            <BookOpen className='h-6 w-6 text-primary' />
                            <h1 className='text-xl font-semibold text-foreground'>
                                Memora
                            </h1>
                        </div>

                        {/* Actions */}
                        <div className='flex items-center gap-3'>
                            <Link to='/new-entry'>
                                <Button
                                    variant='default'
                                    size='sm'
                                    className='shadow-soft'
                                >
                                    <Plus className='h-4 w-4 mr-2' />
                                    New Entry
                                </Button>
                            </Link>

                            <div className='flex items-center gap-2'>
                                <ThemeToggle />
                                <Button variant='ghost' size='icon-sm' asChild>
                                    <Link to='/settings'>
                                        <Settings className='h-4 w-4' />
                                    </Link>
                                </Button>
                                <Button
                                    variant='ghost'
                                    size='icon-sm'
                                    onClick={logout}
                                >
                                    <LogOut className='h-4 w-4' />
                                </Button>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content */}
            <main className='container mx-auto px-4 sm:px-6 lg:px-8 py-8'>
                {/* Welcome Section */}
                <div className='mb-8'>
                    <h2 className='text-3xl font-medium text-foreground mb-2'>
                        Welcome back, {user?.name.split(' ')[0] || 'User'}
                    </h2>
                    <p className='text-muted-foreground'>
                        Ready to capture today's thoughts and reflections?
                    </p>
                </div>

                {/* Quick Actions */}
                <div className='grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-8'>
                    <Link to='/new-entry'>
                        <Card className='p-6 hover:shadow-elegant transition-smooth cursor-pointer gradient-card border-border/50'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-primary-soft'>
                                    <Plus className='h-5 w-5 text-primary' />
                                </div>
                                <div>
                                    <h3 className='font-medium text-foreground'>
                                        New Entry
                                    </h3>
                                    <p className='text-sm text-muted-foreground'>
                                        Start writing
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to='/browse'>
                        <Card className='p-6 hover:shadow-elegant transition-smooth cursor-pointer gradient-card border-border/50'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-accent'>
                                    <BookOpen className='h-5 w-5 text-primary' />
                                </div>
                                <div>
                                    <h3 className='font-medium text-foreground'>
                                        Browse Entries
                                    </h3>
                                    <p className='text-sm text-muted-foreground'>
                                        View all
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to='/insights'>
                        <Card className='p-6 hover:shadow-elegant transition-smooth cursor-pointer gradient-card border-border/50'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-primary-soft'>
                                    <BarChart3 className='h-5 w-5 text-primary' />
                                </div>
                                <div>
                                    <h3 className='font-medium text-foreground'>
                                        Insights
                                    </h3>
                                    <p className='text-sm text-muted-foreground'>
                                        Your patterns
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>

                    <Link to='/settings'>
                        <Card className='p-6 hover:shadow-elegant transition-smooth cursor-pointer gradient-card border-border/50'>
                            <div className='flex items-center gap-3'>
                                <div className='p-2 rounded-lg bg-primary-soft'>
                                    <Settings className='h-5 w-5 text-primary' />
                                </div>
                                <div>
                                    <h3 className='font-medium text-foreground'>
                                        Settings
                                    </h3>
                                    <p className='text-sm text-muted-foreground'>
                                        Preferences
                                    </p>
                                </div>
                            </div>
                        </Card>
                    </Link>
                </div>

                {/* Main Dashboard Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Calendar Widget */}
                    <div className='lg:col-span-1'>
                        <CalendarWidget />
                    </div>

                    {/* Recent Entries */}
                    <div className='lg:col-span-2'>
                        <RecentEntries />
                    </div>
                </div>
            </main>

            {/* AI Chat Button */}
            <AiChatButton />
        </div>
    );
};

export default Dashboard;
