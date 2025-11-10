import { useState, useEffect } from 'react';
import { Link, useParams, useNavigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { PasswordInput } from '@/components/ui/password-input';
import { Label } from '@/components/ui/label';
import {
    Card,
    CardContent,
    CardDescription,
    CardHeader,
    CardTitle,
} from '@/components/ui/card';
import { ThemeToggle } from '@/components/ui/theme-toggle';
import { toast } from '@/hooks/use-toast';
import { Loader2, BookOpen, ArrowLeft, CheckCircle, AlertCircle } from 'lucide-react';
import { buildApiUrl } from '@/config/api';
import journalHero from '@/assets/journal-hero.jpg';

const ResetPassword = () => {
    const [password, setPassword] = useState('');
    const [confirmPassword, setConfirmPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isVerifying, setIsVerifying] = useState(true);
    const [isValidToken, setIsValidToken] = useState(false);
    const [isSuccess, setIsSuccess] = useState(false);
    const { token } = useParams<{ token: string }>();
    const navigate = useNavigate();

    useEffect(() => {
        const verifyToken = async () => {
            if (!token) {
                setIsValidToken(false);
                setIsVerifying(false);
                return;
            }

            try {
                const response = await fetch(buildApiUrl(`/api/auth/reset-password/${token}`), {
                    credentials: 'include',
                });
                if (response.ok) {
                    setIsValidToken(true);
                } else {
                    setIsValidToken(false);
                    const data = await response.json();
                    toast({
                        title: 'Invalid token',
                        description: data.message || 'This reset link is invalid or has expired.',
                        variant: 'destructive',
                    });
                }
            } catch (error) {
                setIsValidToken(false);
                toast({
                    title: 'Error',
                    description: 'Unable to verify reset token. Please try again.',
                    variant: 'destructive',
                });
            } finally {
                setIsVerifying(false);
            }
        };

        verifyToken();
    }, [token]);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!password || !confirmPassword) {
            toast({
                title: 'Missing information',
                description: 'Please fill in all fields.',
                variant: 'destructive',
            });
            return;
        }

        if (password !== confirmPassword) {
            toast({
                title: 'Passwords do not match',
                description: 'Please make sure both passwords are identical.',
                variant: 'destructive',
            });
            return;
        }

        if (password.length < 6) {
            toast({
                title: 'Password too short',
                description: 'Password must be at least 6 characters long.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch(buildApiUrl(`/api/auth/reset-password/${token}`), {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                credentials: 'include',
                body: JSON.stringify({ password }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSuccess(true);
                toast({
                    title: 'Password reset successful',
                    description: 'Your password has been updated successfully.',
                });
                // Redirect to login after 3 seconds
                setTimeout(() => {
                    navigate('/login');
                }, 3000);
            } else {
                toast({
                    title: 'Reset failed',
                    description: data.message || 'Unable to reset password. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Network error',
                description: 'Unable to reset password. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isVerifying) {
        return (
            <div className='min-h-screen bg-background flex items-center justify-center'>
                <div className='text-center'>
                    <Loader2 className='h-8 w-8 animate-spin mx-auto mb-4 text-primary' />
                    <p className='text-muted-foreground'>Verifying reset token...</p>
                </div>
            </div>
        );
    }

    if (!isValidToken) {
        return (
            <div className='min-h-screen bg-background flex'>
                {/* Left side - Hero image and branding */}
                <div className='hidden lg:flex lg:w-1/2 xl:w-3/5 relative'>
                    <img
                        src={journalHero}
                        alt='Journal'
                        className='absolute inset-0 w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 gradient-soft opacity-90' />
                    <div className='relative z-10 flex flex-col justify-center px-12 text-center'>
                        <div className='flex items-center justify-center mb-8'>
                            <BookOpen className='h-12 w-12 text-primary mr-3' />
                            <h1 className='text-4xl font-semibold text-foreground'>
                                Memora
                            </h1>
                        </div>
                        <p className='text-xl text-muted-foreground max-w-md mx-auto leading-relaxed'>
                            This reset link is no longer valid.
                        </p>
                    </div>
                </div>

                {/* Right side - Invalid token message */}
                <div className='flex-1 lg:w-1/2 xl:w-2/5 flex flex-col'>
                    <div className='flex justify-end p-6'>
                        <ThemeToggle />
                    </div>

                    <div className='flex-1 flex items-center justify-center px-6 pb-12'>
                        <div className='w-full max-w-sm'>
                            <Card className='shadow-elegant border-border/50'>
                                <CardHeader className='space-y-1 text-center'>
                                    <div className='flex justify-center mb-4'>
                                        <div className='w-16 h-16 bg-destructive/10 rounded-full flex items-center justify-center'>
                                            <AlertCircle className='h-8 w-8 text-destructive' />
                                        </div>
                                    </div>
                                    <CardTitle className='text-2xl font-medium'>
                                        Invalid reset link
                                    </CardTitle>
                                    <CardDescription>
                                        This password reset link is invalid or has expired
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='text-sm text-muted-foreground text-center'>
                                        <p>
                                            Reset links expire after 15 minutes for security.
                                            Please request a new password reset.
                                        </p>
                                    </div>

                                    <div className='flex flex-col space-y-3'>
                                        <Link to='/forgot-password'>
                                            <Button variant='auth' className='w-full'>
                                                Request new reset link
                                            </Button>
                                        </Link>
                                        
                                        <Link to='/login'>
                                            <Button variant='ghost' className='w-full'>
                                                <ArrowLeft className='mr-2 h-4 w-4' />
                                                Back to login
                                            </Button>
                                        </Link>
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    if (isSuccess) {
        return (
            <div className='min-h-screen bg-background flex'>
                {/* Left side - Hero image and branding */}
                <div className='hidden lg:flex lg:w-1/2 xl:w-3/5 relative'>
                    <img
                        src={journalHero}
                        alt='Journal'
                        className='absolute inset-0 w-full h-full object-cover'
                    />
                    <div className='absolute inset-0 gradient-soft opacity-90' />
                    <div className='relative z-10 flex flex-col justify-center px-12 text-center'>
                        <div className='flex items-center justify-center mb-8'>
                            <BookOpen className='h-12 w-12 text-primary mr-3' />
                            <h1 className='text-4xl font-semibold text-foreground'>
                                Memora
                            </h1>
                        </div>
                        <p className='text-xl text-muted-foreground max-w-md mx-auto leading-relaxed'>
                            Your password has been reset successfully.
                        </p>
                    </div>
                </div>

                {/* Right side - Success message */}
                <div className='flex-1 lg:w-1/2 xl:w-2/5 flex flex-col'>
                    <div className='flex justify-end p-6'>
                        <ThemeToggle />
                    </div>

                    <div className='flex-1 flex items-center justify-center px-6 pb-12'>
                        <div className='w-full max-w-sm'>
                            <Card className='shadow-elegant border-border/50'>
                                <CardHeader className='space-y-1 text-center'>
                                    <div className='flex justify-center mb-4'>
                                        <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
                                            <CheckCircle className='h-8 w-8 text-primary' />
                                        </div>
                                    </div>
                                    <CardTitle className='text-2xl font-medium'>
                                        Password reset successful
                                    </CardTitle>
                                    <CardDescription>
                                        You can now sign in with your new password
                                    </CardDescription>
                                </CardHeader>
                                <CardContent>
                                    <div className='text-sm text-muted-foreground text-center mb-4'>
                                        <p>Redirecting to login page in a few seconds...</p>
                                    </div>

                                    <Link to='/login'>
                                        <Button variant='auth' className='w-full'>
                                            Continue to login
                                        </Button>
                                    </Link>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className='min-h-screen bg-background flex'>
            {/* Left side - Hero image and branding */}
            <div className='hidden lg:flex lg:w-1/2 xl:w-3/5 relative'>
                <img
                    src={journalHero}
                    alt='Journal'
                    className='absolute inset-0 w-full h-full object-cover'
                />
                <div className='absolute inset-0 gradient-soft opacity-90' />
                <div className='relative z-10 flex flex-col justify-center px-12 text-center'>
                    <div className='flex items-center justify-center mb-8'>
                        <BookOpen className='h-12 w-12 text-primary mr-3' />
                        <h1 className='text-4xl font-semibold text-foreground'>
                            Memora
                        </h1>
                    </div>
                    <p className='text-xl text-muted-foreground max-w-md mx-auto leading-relaxed'>
                        Choose a new secure password for your account.
                    </p>
                </div>
            </div>

            {/* Right side - Reset password form */}
            <div className='flex-1 lg:w-1/2 xl:w-2/5 flex flex-col'>
                <div className='flex justify-end p-6'>
                    <ThemeToggle />
                </div>

                <div className='flex-1 flex items-center justify-center px-6 pb-12'>
                    <div className='w-full max-w-sm'>
                        {/* Mobile branding */}
                        <div className='lg:hidden flex items-center justify-center mb-8'>
                            <BookOpen className='h-8 w-8 text-primary mr-2' />
                            <h1 className='text-2xl font-semibold text-foreground'>
                                Memora
                            </h1>
                        </div>

                        <Card className='shadow-elegant border-border/50'>
                            <CardHeader className='space-y-1 text-center'>
                                <CardTitle className='text-2xl font-medium'>
                                    Reset your password
                                </CardTitle>
                                <CardDescription>
                                    Enter your new password below
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='password'>New Password</Label>
                                        <PasswordInput
                                            id='password'
                                            placeholder='••••••••'
                                            value={password}
                                            onChange={(e) => setPassword(e.target.value)}
                                            className='shadow-soft'
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='confirmPassword'>
                                            Confirm New Password
                                        </Label>
                                        <PasswordInput
                                            id='confirmPassword'
                                            placeholder='••••••••'
                                            value={confirmPassword}
                                            onChange={(e) => setConfirmPassword(e.target.value)}
                                            className='shadow-soft'
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className='text-xs text-muted-foreground'>
                                        Password must be at least 6 characters long
                                    </div>

                                    <Button
                                        type='submit'
                                        variant='auth'
                                        size='lg'
                                        className='w-full'
                                        disabled={isLoading}
                                    >
                                        {isLoading ? (
                                            <>
                                                <Loader2 className='mr-2 h-4 w-4 animate-spin' />
                                                Resetting password...
                                            </>
                                        ) : (
                                            'Reset password'
                                        )}
                                    </Button>
                                </form>

                                <div className='mt-6 text-center'>
                                    <Link
                                        to='/login'
                                        className='text-sm text-muted-foreground hover:text-foreground inline-flex items-center underline-offset-4 hover:underline'
                                    >
                                        <ArrowLeft className='mr-1 h-3 w-3' />
                                        Back to login
                                    </Link>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default ResetPassword;
