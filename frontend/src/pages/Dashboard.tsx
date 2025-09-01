import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { CalendarWidget } from '@/components/ui/calendar-widget';
import { RecentEntries } from '@/components/ui/recent-entries';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import {
    ShimmerCard,
    ShimmerCalendar,
    ShimmerEntry,
} from '@/components/ui/shimmer';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/contexts/AuthContext';
import { BookOpen, Plus, Settings, LogOut, BarChart3 } from 'lucide-react';
import { Link } from 'react-router-dom';

const Dashboard = () => {
    const { user, logout } = useAuth();
    const [isLoading, setIsLoading] = useState(true);
    const [showLogoutModal, setShowLogoutModal] = useState(false);

    // Simulate loading state
    useEffect(() => {
        const timer = setTimeout(() => {
            setIsLoading(false);
        }, 500); // 2 second loading simulation
        return () => clearTimeout(timer);
    }, []);

    const handleLogout = () => {
        logout();
        setShowLogoutModal(false);
    };

    return (
        <div className='min-h-screen bg-background'>
            {/* Header */}
            <header className='header-blur sticky top-0 z-30'>
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
                            <Link to='/new-entry' className='hidden sm:block'>
                                <Button
                                    variant='auth'
                                    size='sm'
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
                                    onClick={() => setShowLogoutModal(true)}
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
                    {isLoading ? (
                        // Shimmer loading for quick actions
                        <>
                            <ShimmerCard />
                            <ShimmerCard />
                            <ShimmerCard />
                            <ShimmerCard />
                        </>
                    ) : (
                        <>
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
                                        <div className='p-2 rounded-lg bg-primary-soft'>
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
                        </>
                    )}
                </div>

                {/* Main Dashboard Grid */}
                <div className='grid grid-cols-1 lg:grid-cols-3 gap-8'>
                    {/* Calendar Widget */}
                    <div className='lg:col-span-1'>
                        {isLoading ? <ShimmerCalendar /> : <CalendarWidget />}
                    </div>

                    {/* Recent Entries */}
                    <div className='lg:col-span-2'>
                        {isLoading ? (
                            <div className='space-y-4'>
                                <div className='p-6 border border-border/50 rounded-lg'>
                                    <div className='h-6 w-32 bg-gradient-to-r from-muted via-muted/50 to-muted bg-[length:200%_100%] animate-shimmer rounded mb-4' />
                                    <div className='space-y-3'>
                                        <ShimmerEntry />
                                        <ShimmerEntry />
                                        <ShimmerEntry />
                                    </div>
                                </div>
                            </div>
                        ) : (
                            <RecentEntries />
                        )}
                    </div>
                </div>
            </main>

            <ConfirmationModal
                isOpen={showLogoutModal}
                onClose={() => setShowLogoutModal(false)}
                onConfirm={handleLogout}
                title='Logout'
                description='Are you sure you want to logout?'
                confirmText='Logout'
                cancelText='Cancel'
            />
        </div>
    );
};

export default Dashboard;
