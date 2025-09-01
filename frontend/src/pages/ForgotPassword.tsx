import { useState } from 'react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { Loader2, BookOpen, ArrowLeft, Mail } from 'lucide-react';
import journalHero from '@/assets/journal-hero.jpg';

const ForgotPassword = () => {
    const [email, setEmail] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const [isSubmitted, setIsSubmitted] = useState(false);

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email) {
            toast({
                title: 'Email required',
                description: 'Please enter your email address.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            const response = await fetch('/api/auth/forgot-password', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ email }),
            });

            const data = await response.json();

            if (response.ok) {
                setIsSubmitted(true);
                toast({
                    title: 'Reset link sent',
                    description: data.message,
                });
            } else {
                toast({
                    title: 'Error',
                    description: data.message || 'An error occurred. Please try again.',
                    variant: 'destructive',
                });
            }
        } catch (error) {
            toast({
                title: 'Network error',
                description: 'Unable to send reset email. Please try again.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

    if (isSubmitted) {
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
                            Check your email for password reset instructions.
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
                            {/* Mobile branding */}
                            <div className='lg:hidden flex items-center justify-center mb-8'>
                                <BookOpen className='h-8 w-8 text-primary mr-2' />
                                <h1 className='text-2xl font-semibold text-foreground'>
                                    Memora
                                </h1>
                            </div>

                            <Card className='shadow-elegant border-border/50'>
                                <CardHeader className='space-y-1 text-center'>
                                    <div className='flex justify-center mb-4'>
                                        <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center'>
                                            <Mail className='h-8 w-8 text-primary' />
                                        </div>
                                    </div>
                                    <CardTitle className='text-2xl font-medium'>
                                        Check your email
                                    </CardTitle>
                                    <CardDescription>
                                        We've sent password reset instructions to{' '}
                                        <span className='font-medium'>{email}</span>
                                    </CardDescription>
                                </CardHeader>
                                <CardContent className='space-y-4'>
                                    <div className='text-sm text-muted-foreground text-center space-y-2'>
                                        <p>
                                            Click the link in the email to reset your password.
                                            The link will expire in 15 minutes.
                                        </p>
                                        <p>
                                            Didn't receive the email? Check your spam folder.
                                        </p>
                                    </div>

                                    <div className='flex flex-col space-y-3'>
                                        <Button
                                            onClick={() => {
                                                setIsSubmitted(false);
                                                setEmail('');
                                            }}
                                            variant='outline'
                                            className='w-full'
                                        >
                                            Try different email
                                        </Button>
                                        
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
                        Reset your password to continue your journaling journey.
                    </p>
                </div>
            </div>

            {/* Right side - Forgot password form */}
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
                                    Forgot password?
                                </CardTitle>
                                <CardDescription>
                                    Enter your email and we'll send you a reset link
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form onSubmit={handleSubmit} className='space-y-4'>
                                    <div className='space-y-2'>
                                        <Label htmlFor='email'>Email</Label>
                                        <Input
                                            id='email'
                                            type='email'
                                            placeholder='your@email.com'
                                            value={email}
                                            onChange={(e) => setEmail(e.target.value)}
                                            className='shadow-soft'
                                            disabled={isLoading}
                                        />
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
                                                Sending reset link...
                                            </>
                                        ) : (
                                            'Send reset link'
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

export default ForgotPassword;
