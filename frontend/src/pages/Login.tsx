import { useState } from 'react';
import { Link, Navigate } from 'react-router-dom';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
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
import { useAuth } from '@/contexts/AuthContext';
import { toast } from '@/hooks/use-toast';
import { Loader2, BookOpen } from 'lucide-react';
import journalHero from '@/assets/journal-hero.jpg';

const Login = () => {
    const [email, setEmail] = useState('');
    const [password, setPassword] = useState('');
    const [isLoading, setIsLoading] = useState(false);
    const { login, isAuthenticated } = useAuth();

    if (isAuthenticated) {
        return <Navigate to='/dashboard' replace />;
    }

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!email || !password) {
            toast({
                title: 'Missing information',
                description: 'Please fill in all fields.',
                variant: 'destructive',
            });
            return;
        }

        setIsLoading(true);
        try {
            await login(email, password);
            toast({
                title: 'Welcome back!',
                description: 'Successfully signed in to your journal.',
            });
        } catch (error) {
            toast({
                title: 'Sign in failed',
                description: 'Please check your email and password.',
                variant: 'destructive',
            });
        } finally {
            setIsLoading(false);
        }
    };

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
                        Capture your thoughts, memories, and reflections in a
                        beautiful, minimalist space.
                    </p>
                </div>
            </div>

            {/* Right side - Login form */}
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
                                    Welcome back
                                </CardTitle>
                                <CardDescription>
                                    Sign in to continue your journaling journey
                                </CardDescription>
                            </CardHeader>
                            <CardContent>
                                <form
                                    onSubmit={handleSubmit}
                                    className='space-y-4'
                                >
                                    <div className='space-y-2'>
                                        <Label htmlFor='email'>Email</Label>
                                        <Input
                                            id='email'
                                            type='email'
                                            placeholder='your@email.com'
                                            value={email}
                                            onChange={(e) =>
                                                setEmail(e.target.value)
                                            }
                                            className='shadow-soft'
                                            disabled={isLoading}
                                        />
                                    </div>

                                    <div className='space-y-2'>
                                        <Label htmlFor='password'>
                                            Password
                                        </Label>
                                        <PasswordInput
                                            id='password'
                                            placeholder='••••••••'
                                            value={password}
                                            onChange={(e) =>
                                                setPassword(e.target.value)
                                            }
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
                                                Signing in...
                                            </>
                                        ) : (
                                            'Sign In'
                                        )}
                                    </Button>
                                </form>

                                <div className='mt-4 text-center'>
                                    <Link
                                        to='/forgot-password'
                                        className='text-sm text-muted-foreground hover:text-foreground underline-offset-4 hover:underline'
                                    >
                                        Forgot your password?
                                    </Link>
                                </div>

                                <div className='mt-6 text-center'>
                                    <p className='text-sm text-muted-foreground'>
                                        Don't have an account?{' '}
                                        <Link
                                            to='/signup'
                                            className='text-primary hover:text-primary-hover font-medium underline-offset-4 hover:underline'
                                        >
                                            Sign up
                                        </Link>
                                    </p>
                                </div>
                            </CardContent>
                        </Card>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default Login;
