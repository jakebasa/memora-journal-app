import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Switch } from '@/components/ui/switch';
import { Separator } from '@/components/ui/separator';
import {
    Select,
    SelectContent,
    SelectItem,
    SelectTrigger,
    SelectValue,
} from '@/components/ui/select';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { Shimmer, ShimmerText } from '@/components/ui/shimmer';
import { useTheme } from '@/contexts/ThemeContext';
import { ConfirmationModal } from '@/components/ui/confirmation-modal';
import { useAuth } from '@/contexts/AuthContext';
import {
    ArrowLeft,
    Save,
    User,
    Shield,
    Bell,
    Palette,
    Download,
    Trash2,
} from 'lucide-react';
import { useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';

export default function Settings() {
    const { user, logout } = useAuth();
    const navigate = useNavigate();
    const { toast } = useToast();
    const { themePreference, colorTheme, setThemePreference, setColorTheme, isLoading: themeLoading } = useTheme();

    // Profile settings
    const [name, setName] = useState(user?.name || '');
    const [email, setEmail] = useState(user?.email || '');

    // Privacy settings
    const [enableAnalytics, setEnableAnalytics] = useState(true);
    const [shareAnonymousData, setShareAnonymousData] = useState(false);

    // Notification settings
    const [dailyReminders, setDailyReminders] = useState(true);
    const [reminderTime, setReminderTime] = useState('20:00');
    const [weeklyDigest, setWeeklyDigest] = useState(true);

    // App settings
    const [autoSave, setAutoSave] = useState(true);
    const [defaultMood, setDefaultMood] = useState('😊');
    const [entriesPerPage, setEntriesPerPage] = useState('10');

    const [isLoading, setIsLoading] = useState(false);
    const [showLogoutModal, setShowLogoutModal] = useState(false);
    const [isInitialLoading, setIsInitialLoading] = useState(true);

    const handleSaveProfile = async () => {
        if (!name.trim() || !email.trim()) {
            toast({
                title: 'Required Fields',
                description: 'Please fill in all required fields.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            // Mock API call
            await new Promise((resolve) => setTimeout(resolve, 1000));

            toast({
                title: 'Settings Saved',
                description:
                    'Your profile settings have been updated successfully.',
            });
        } catch (error) {
            toast({
                title: 'Save Failed',
                description: 'Failed to save settings. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    const handleExportData = async () => {
        try {
            // Mock export functionality
            await new Promise((resolve) => setTimeout(resolve, 2000));

            toast({
                title: 'Export Complete',
                description:
                    'Your journal data has been exported successfully.',
            });
        } catch (error) {
            toast({
                title: 'Export Failed',
                description: 'Failed to export your data. Please try again.',
                variant: 'destructive',
            });
        }
    };

    const handleDeleteAccount = () => {
        // This would typically show a confirmation dialog
        toast({
            title: 'Account Deletion',
            description:
                'This action would permanently delete your account and all data.',
            variant: 'destructive',
        });
    };

    // Simulate initial loading
    useState(() => {
        const timer = setTimeout(() => {
            setIsInitialLoading(false);
        }, 1500);
        return () => clearTimeout(timer);
    });

    if (isInitialLoading) {
        return (
            <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft'>
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
                                    Settings
                                </h1>
                                <p className='text-sm text-muted-foreground'>
                                    Manage your account and preferences
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

                <main className='container mx-auto px-4 py-8 max-w-4xl'>
                    <div className='space-y-8'>
                        {/* Profile Settings Shimmer */}
                        <Card className='shadow-elegant'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <User className='h-5 w-5' />
                                    Profile Settings
                                </CardTitle>
                                <CardDescription>
                                    Update your personal information and account details
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                    <div className='space-y-2'>
                                        <Label>Full Name</Label>
                                        <Shimmer className='h-10 w-full rounded' />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Email Address</Label>
                                        <Shimmer className='h-10 w-full rounded' />
                                    </div>
                                </div>
                                <Separator />
                                <div className='flex justify-end'>
                                    <Shimmer className='h-10 w-32 rounded' />
                                </div>
                            </CardContent>
                        </Card>

                        {/* Notification Settings Shimmer */}
                        <Card className='shadow-elegant'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Bell className='h-5 w-5' />
                                    Notifications
                                </CardTitle>
                                <CardDescription>
                                    Configure when and how you receive notifications
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                {Array.from({ length: 4 }).map((_, i) => (
                                    <div key={i} className='flex items-center justify-between'>
                                        <div className='space-y-0.5'>
                                            <Shimmer className='h-4 w-32 rounded' />
                                            <Shimmer className='h-3 w-48 rounded' />
                                        </div>
                                        <Shimmer className='h-6 w-11 rounded-full' />
                                    </div>
                                ))}
                            </CardContent>
                        </Card>

                        {/* App Preferences Shimmer */}
                        <Card className='shadow-elegant'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Palette className='h-5 w-5' />
                                    App Preferences
                                </CardTitle>
                                <CardDescription>
                                    Customize your journaling experience
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-6'>
                                <div className='space-y-6'>
                                    <div className='space-y-2'>
                                        <Label>Theme Preference</Label>
                                        <Shimmer className='h-10 w-full rounded' />
                                    </div>
                                    <div className='space-y-2'>
                                        <Label>Color Theme</Label>
                                        <div className='grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3'>
                                            {Array.from({ length: 6 }).map((_, i) => (
                                                <Shimmer key={i} className='h-16 w-full rounded-lg' />
                                            ))}
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>

                        {/* Data Management Shimmer */}
                        <Card className='shadow-elegant'>
                            <CardHeader>
                                <CardTitle className='flex items-center gap-2'>
                                    <Download className='h-5 w-5' />
                                    Data Management
                                </CardTitle>
                                <CardDescription>
                                    Export or delete your journal data
                                </CardDescription>
                            </CardHeader>
                            <CardContent className='space-y-4'>
                                <div className='flex items-center justify-between p-4 border border-border rounded-lg'>
                                    <div>
                                        <Shimmer className='h-4 w-24 rounded mb-2' />
                                        <Shimmer className='h-3 w-40 rounded' />
                                    </div>
                                    <Shimmer className='h-10 w-20 rounded' />
                                </div>
                                <div className='flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5'>
                                    <div>
                                        <Shimmer className='h-4 w-28 rounded mb-2' />
                                        <Shimmer className='h-3 w-48 rounded' />
                                    </div>
                                    <Shimmer className='h-10 w-24 rounded' />
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </main>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-gradient-to-br from-background to-secondary-soft'>
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
                                Settings
                            </h1>
                            <p className='text-sm text-muted-foreground'>
                                Manage your account and preferences
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

            <main className='container mx-auto px-4 py-8 max-w-4xl'>
                <div className='space-y-8'>
                    {/* Profile Settings */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <User className='h-5 w-5' />
                                Profile Settings
                            </CardTitle>
                            <CardDescription>
                                Update your personal information and account
                                details
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label htmlFor='name'>Full Name</Label>
                                    <Input
                                        id='name'
                                        value={name}
                                        onChange={(e) =>
                                            setName(e.target.value)
                                        }
                                        placeholder='Enter your full name'
                                        aria-describedby='name-description'
                                        aria-label='Full name input field'
                                    />
                                </div>
                                <div className='space-y-2'>
                                    <Label htmlFor='email'>Email Address</Label>
                                    <Input
                                        id='email'
                                        type='email'
                                        value={email}
                                        onChange={(e) =>
                                            setEmail(e.target.value)
                                        }
                                        placeholder='Enter your email address'
                                        aria-describedby='email-description'
                                        aria-label='Email address input field'
                                    />
                                </div>
                            </div>
                            <Button
                                onClick={handleSaveProfile}
                                disabled={isLoading}
                                aria-label='Save profile changes'
                            >
                                <Save className='w-4 h-4 mr-2' />
                                {isLoading ? 'Saving...' : 'Save Profile'}
                            </Button>
                        </CardContent>
                    </Card>

                    {/* Notification Settings */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Bell className='h-5 w-5' />
                                Notifications
                            </CardTitle>
                            <CardDescription>
                                Configure when and how you receive notifications
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='flex items-center justify-between'>
                                <div className='space-y-0.5'>
                                    <Label>Daily Writing Reminders</Label>
                                    <p className='text-sm text-muted-foreground'>
                                        Get reminded to write in your journal
                                        every day
                                    </p>
                                </div>
                                <Switch
                                    checked={dailyReminders}
                                    onCheckedChange={setDailyReminders}
                                />
                            </div>

                            {dailyReminders && (
                                <div className='ml-6 space-y-2'>
                                    <Label htmlFor='reminder-time'>
                                        Reminder Time
                                    </Label>
                                    <Select
                                        value={reminderTime}
                                        onValueChange={setReminderTime}
                                    >
                                        <SelectTrigger className='w-48'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='08:00'>
                                                8:00 AM
                                            </SelectItem>
                                            <SelectItem value='12:00'>
                                                12:00 PM
                                            </SelectItem>
                                            <SelectItem value='18:00'>
                                                6:00 PM
                                            </SelectItem>
                                            <SelectItem value='20:00'>
                                                8:00 PM
                                            </SelectItem>
                                            <SelectItem value='22:00'>
                                                10:00 PM
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            )}

                            <Separator />

                            <div className='flex items-center justify-between'>
                                <div className='space-y-0.5'>
                                    <Label>Weekly Digest</Label>
                                    <p className='text-sm text-muted-foreground'>
                                        Receive a summary of your week's entries
                                    </p>
                                </div>
                                <Switch
                                    checked={weeklyDigest}
                                    onCheckedChange={setWeeklyDigest}
                                />
                            </div>
                        </CardContent>
                    </Card>

                    {/* App Preferences */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Palette className='h-5 w-5' />
                                App Preferences
                            </CardTitle>
                            <CardDescription>
                                Customize your journaling experience
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-6'>
                            <div className='space-y-6'>
                                <div className='space-y-2'>
                                    <Label>Theme Preference</Label>
                                    <p className='text-sm text-muted-foreground'>
                                        Choose your preferred theme for the application
                                    </p>
                                    <Select
                                        value={themePreference}
                                        onValueChange={setThemePreference}
                                        disabled={themeLoading}
                                    >
                                        <SelectTrigger className='w-48'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='light'>
                                                ☀️ Light
                                            </SelectItem>
                                            <SelectItem value='dark'>
                                                🌙 Dark
                                            </SelectItem>
                                            <SelectItem value='system'>
                                                💻 System
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>

                                <div className='space-y-2'>
                                    <Label>Color Theme</Label>
                                    <p className='text-sm text-muted-foreground'>
                                        Choose your preferred color palette
                                    </p>
                                    <Select
                                        value={colorTheme}
                                        onValueChange={setColorTheme}
                                        disabled={themeLoading}
                                    >
                                        <SelectTrigger className='w-48'>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='sage'>
                                                🌿 Sage Green
                                            </SelectItem>
                                            <SelectItem value='ocean'>
                                                🌊 Ocean Blue
                                            </SelectItem>
                                            <SelectItem value='sunset'>
                                                🌅 Sunset Orange
                                            </SelectItem>
                                            <SelectItem value='lavender'>
                                                💜 Lavender Purple
                                            </SelectItem>
                                            <SelectItem value='rose'>
                                                🌹 Rose Pink
                                            </SelectItem>
                                            <SelectItem value='mono'>
                                                ⚫ Monochrome
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div>

                            <Separator />

                            <div className='flex items-center justify-between'>
                                <div className='space-y-0.5'>
                                    <Label>Auto-save Drafts</Label>
                                    <p className='text-sm text-muted-foreground'>
                                        Automatically save your entries as you
                                        write
                                    </p>
                                </div>
                                <Switch
                                    checked={autoSave}
                                    onCheckedChange={setAutoSave}
                                />
                            </div>

                            {/* <Separator /> */}

                            {/* <div className='grid grid-cols-1 md:grid-cols-2 gap-4'>
                                <div className='space-y-2'>
                                    <Label>Default Mood</Label>
                                    <Select
                                        value={defaultMood}
                                        onValueChange={setDefaultMood}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='😊'>
                                                😊 Happy
                                            </SelectItem>
                                            <SelectItem value='😌'>
                                                😌 Peaceful
                                            </SelectItem>
                                            <SelectItem value='🤔'>
                                                🤔 Thoughtful
                                            </SelectItem>
                                            <SelectItem value='😴'>
                                                😴 Tired
                                            </SelectItem>
                                            <SelectItem value='😔'>
                                                😔 Sad
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                                <div className='space-y-2'>
                                    <Label>Entries Per Page</Label>
                                    <Select
                                        value={entriesPerPage}
                                        onValueChange={setEntriesPerPage}
                                    >
                                        <SelectTrigger>
                                            <SelectValue />
                                        </SelectTrigger>
                                        <SelectContent>
                                            <SelectItem value='5'>
                                                5 entries
                                            </SelectItem>
                                            <SelectItem value='10'>
                                                10 entries
                                            </SelectItem>
                                            <SelectItem value='20'>
                                                20 entries
                                            </SelectItem>
                                            <SelectItem value='50'>
                                                50 entries
                                            </SelectItem>
                                        </SelectContent>
                                    </Select>
                                </div>
                            </div> */}
                        </CardContent>
                    </Card>

                    {/* Data Management */}
                    <Card className='shadow-elegant'>
                        <CardHeader>
                            <CardTitle className='flex items-center gap-2'>
                                <Download className='h-5 w-5' />
                                Data Management
                            </CardTitle>
                            <CardDescription>
                                Export or delete your journal data
                            </CardDescription>
                        </CardHeader>
                        <CardContent className='space-y-4'>
                            <div className='flex items-center justify-between p-4 border border-border rounded-lg'>
                                <div>
                                    <h4 className='font-medium'>
                                        Export Your Data
                                    </h4>
                                    <p className='text-sm text-muted-foreground'>
                                        Download all your journal entries in
                                        JSON format
                                    </p>
                                </div>
                                <Button
                                    variant='outline'
                                    onClick={handleExportData}
                                >
                                    <Download className='w-4 h-4 mr-2' />
                                    Export
                                </Button>
                            </div>

                            <div className='flex items-center justify-between p-4 border border-destructive/20 rounded-lg bg-destructive/5'>
                                <div>
                                    <h4 className='font-medium text-destructive'>
                                        Delete Account
                                    </h4>
                                    <p className='text-sm text-muted-foreground'>
                                        Permanently delete your account and all
                                        data
                                    </p>
                                </div>
                                <Button
                                    variant='destructive'
                                    onClick={handleDeleteAccount}
                                >
                                    <Trash2 className='w-4 h-4 mr-2' />
                                    Delete
                                </Button>
                            </div>
                        </CardContent>
                    </Card>
                </div>
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
