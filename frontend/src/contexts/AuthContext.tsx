import React, { createContext, useContext, useState, useEffect } from 'react';

interface User {
    id: string;
    email: string;
    name: string;
}

interface AuthContextType {
    user: User | null;
    token: string | null; // ✅ Add token here
    login: (email: string, password: string) => Promise<void>;
    signup: (email: string, password: string, name: string) => Promise<void>;
    logout: () => void;
    isAuthenticated: boolean;
    loading: boolean;
    error: string | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
    const context = useContext(AuthContext);
    if (!context) {
        throw new Error('useAuth must be used within an AuthProvider');
    }
    return context;
};

interface AuthProviderProps {
    children: React.ReactNode;
}

const BACKEND_URL = 'http://localhost:5000'; // replace with your backend URL

export const AuthProvider: React.FC<AuthProviderProps> = ({ children }) => {
    const [user, setUser] = useState<User | null>(null);
    const [token, setToken] = useState<string | null>(null); // ✅ store token
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    const login = async (email: string, password: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password }),
            });

            const data = await res.json();

            if (!res.ok) {
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

    const signup = async (email: string, password: string, name: string) => {
        setLoading(true);
        setError(null);
        try {
            const res = await fetch(`${BACKEND_URL}/api/auth/signup`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password, name }),
            });

            const data = await res.json();
            if (!res.ok) throw new Error(data.message || 'Signup failed');

            setUser({
                id: data.user.id,
                email: data.user.email,
                name: data.user.name,
            });
            setToken(data.token); // ✅ store token in state
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
                token, // ✅ provide token
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
