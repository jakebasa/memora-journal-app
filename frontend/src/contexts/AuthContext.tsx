import {
    createContext,
    useContext,
    useState,
    useEffect,
    ReactNode,
} from 'react';
import { buildApiUrl } from '@/config/api';
import { clearEntriesCache } from '@/hooks/useEntries';

interface User {
    id: string;
    name: string;
    email: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null;
    login: (email: string, password: string) => Promise<void>;
    signup: (name: string, email: string, password: string) => Promise<void>;
    logout: () => void;
    loading: boolean;
    isAuthenticated: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (context === undefined) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null); // store token
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(buildApiUrl('/api/auth/login'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await response.json();

            if (!response.ok) {
                throw new Error(data.message || 'Login failed');
            }

            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
            });
            setToken(data.token); // store token in state
            localStorage.setItem('journal-user', JSON.stringify(data.user));
            localStorage.setItem('journal-token', data.token);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const signup = async (name: string, email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const response = await fetch(buildApiUrl('/api/auth/signup'), {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name, email, password }),
            });

            const data = await response.json();
            if (!response.ok) throw new Error(data.message || 'Signup failed');

            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
            });
            setToken(data.token);
            localStorage.setItem('journal-user', JSON.stringify(data.user));
            localStorage.setItem('journal-token', data.token);
        } catch (err) {
            setError(err.message);
            throw err;
        } finally {
            setLoading(false);
        }
    };

    const logout = () => {
        // Clear entries cache for current user before logout
        if (user) {
            clearEntriesCache(user.id);
        }

        setUser(null);
        setToken(null); // ✅ clear token
        localStorage.removeItem('journal-user');
        localStorage.removeItem('journal-token');
    };

    // Persist login & token on refresh
    useEffect(() => {
        const savedUser = localStorage.getItem('journal-user');
        const savedToken = localStorage.getItem('journal-token');
        if (savedUser && savedToken) {
            setUser(JSON.parse(savedUser));
            setToken(savedToken);
        }
    }, []);

    return (
        <AuthContext.Provider
            value={{
                user,
                token,
                login,
                signup,
                logout,
                isAuthenticated: !!user,
                loading,
                error,
            }}
        >
            {children}
        </AuthContext.Provider>
    );
};
