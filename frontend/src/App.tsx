import { Toaster } from '@/components/ui/toaster';
import { Toaster as Sonner } from '@/components/ui/sonner';
import { TooltipProvider } from '@/components/ui/tooltip';
import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { BrowserRouter, Routes, Route, Navigate } from 'react-router-dom';
import { AuthProvider, useAuth } from '@/contexts/AuthContext';
import { ThemeProvider } from '@/contexts/ThemeContext';
import Login from './pages/Login';
import Signup from './pages/Signup';
import Dashboard from './pages/Dashboard';
import NewEntry from './pages/NewEntry';
import BrowseEntries from './pages/BrowseEntries';
import ViewEntry from './pages/ViewEntry';
import EditEntry from './pages/EditEntry';
import Settings from './pages/Settings';
import Insights from './pages/Insights';
import NotFound from './pages/NotFound';

const queryClient = new QueryClient();

// Protected Route component
const ProtectedRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return isAuthenticated ? <>{children}</> : <Navigate to='/login' replace />;
};

// Public Route component (redirect to dashboard if authenticated)
const PublicRoute = ({ children }: { children: React.ReactNode }) => {
    const { isAuthenticated } = useAuth();
    return !isAuthenticated ? (
        <>{children}</>
    ) : (
        <Navigate to='/dashboard' replace />
    );
};

const AppRoutes = () => (
    <Routes>
        <Route path='/' element={<Navigate to='/dashboard' replace />} />
        <Route
            path='/login'
            element={
                <PublicRoute>
                    <Login />
                </PublicRoute>
            }
        />
        <Route
            path='/signup'
            element={
                <PublicRoute>
                    <Signup />
                </PublicRoute>
            }
        />
        <Route
            path='/dashboard'
            element={
                <ProtectedRoute>
                    <Dashboard />
                </ProtectedRoute>
            }
        />
        <Route
            path='/new-entry'
            element={
                <ProtectedRoute>
                    <NewEntry />
                </ProtectedRoute>
            }
        />
        <Route
            path='/browse'
            element={
                <ProtectedRoute>
                    <BrowseEntries />
                </ProtectedRoute>
            }
        />
        <Route
            path='/entries/:id'
            element={
                <ProtectedRoute>
                    <ViewEntry />
                </ProtectedRoute>
            }
        />
        <Route
            path='/entries/:id/edit'
            element={
                <ProtectedRoute>
                    <EditEntry />
                </ProtectedRoute>
            }
        />
        <Route
            path='/settings'
            element={
                <ProtectedRoute>
                    <Settings />
                </ProtectedRoute>
            }
        />
        <Route
            path='/insights'
            element={
                <ProtectedRoute>
                    <Insights />
                </ProtectedRoute>
            }
        />
        <Route path='*' element={<NotFound />} />
    </Routes>
);

const App = () => (
    <QueryClientProvider client={queryClient}>
        <ThemeProvider>
            <AuthProvider>
                <TooltipProvider>
                    <Toaster />
                    <Sonner />
                    <BrowserRouter>
                        <AppRoutes />
                    </BrowserRouter>
                </TooltipProvider>
            </AuthProvider>
        </ThemeProvider>
    </QueryClientProvider>
);

export default App;
