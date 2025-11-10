import React, { createContext, useContext, useEffect, useState } from 'react';
import { buildApiUrl, devLog, devError } from '../config/api';
import { useAuth } from './AuthContext';

type ThemePreference = 'light' | 'dark' | 'system';
type ResolvedTheme = 'light' | 'dark';
type ColorTheme = 'sage' | 'ocean' | 'sunset' | 'lavender' | 'rose' | 'mono';

interface ThemeContextType {
  theme: ResolvedTheme;
  themePreference: ThemePreference;
  colorTheme: ColorTheme;
  setThemePreference: (theme: ThemePreference) => Promise<void>;
  setColorTheme: (colorTheme: ColorTheme) => Promise<void>;
  isLoading: boolean;
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);

export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme must be used within a ThemeProvider');
  }
  return context;
};

interface ThemeProviderProps {
  children: React.ReactNode;
}

export const ThemeProvider: React.FC<ThemeProviderProps> = ({ children }) => {
  const [themePreference, setThemePreferenceState] = useState<ThemePreference>('system');
  const [colorTheme, setColorThemeState] = useState<ColorTheme>('sage');
  const [resolvedTheme, setResolvedTheme] = useState<ResolvedTheme>('light');
  const [isLoading, setIsLoading] = useState(false);
  const { user, token } = useAuth();

  // Get system theme preference
  const getSystemTheme = (): ResolvedTheme => {
    return window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light';
  };

  // Resolve theme based on preference
  const resolveTheme = (preference: ThemePreference): ResolvedTheme => {
    if (preference === 'system') {
      return getSystemTheme();
    }
    return preference;
  };

  // Fetch user theme from backend
  const fetchUserTheme = async () => {
    if (!user || !token) return;

    try {
      setIsLoading(true);
      const response = await fetch(buildApiUrl('/api/user/theme'), {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        credentials: 'include',
      });

      if (response.ok) {
        const data = await response.json();
        const userTheme = data.theme as ThemePreference;
        const userColorTheme = data.colorTheme as ColorTheme;
        setThemePreferenceState(userTheme);
        setColorThemeState(userColorTheme);
        setResolvedTheme(resolveTheme(userTheme));
        localStorage.setItem('journal-theme-preference', userTheme);
        localStorage.setItem('journal-color-theme', userColorTheme);
        devLog('Fetched user themes:', { theme: userTheme, colorTheme: userColorTheme });
      }
    } catch (error) {
      devError('Failed to fetch user theme:', error);
    } finally {
      setIsLoading(false);
    }
  };

  // Update theme preference (sync to backend and localStorage)
  const setThemePreference = async (newPreference: ThemePreference) => {
    try {
      setIsLoading(true);
      
      // Update local state immediately for responsive UI
      setThemePreferenceState(newPreference);
      setResolvedTheme(resolveTheme(newPreference));
      localStorage.setItem('journal-theme-preference', newPreference);

      // Sync to backend if user is authenticated
      if (user && token) {
        const response = await fetch(buildApiUrl('/api/user/theme'), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ theme: newPreference }),
        });

        if (!response.ok) {
          throw new Error('Failed to update theme on server');
        }
        
        devLog('Theme synced to backend:', newPreference);
      }
    } catch (error) {
      devError('Failed to update theme:', error);
      // Revert on error
      const savedTheme = localStorage.getItem('journal-theme-preference') as ThemePreference || 'system';
      setThemePreferenceState(savedTheme);
      setResolvedTheme(resolveTheme(savedTheme));
    } finally {
      setIsLoading(false);
    }
  };

  // Update color theme (sync to backend and localStorage)
  const setColorTheme = async (newColorTheme: ColorTheme) => {
    try {
      setIsLoading(true);
      
      // Update local state immediately for responsive UI
      setColorThemeState(newColorTheme);
      localStorage.setItem('journal-color-theme', newColorTheme);

      // Sync to backend if user is authenticated
      if (user && token) {
        const response = await fetch(buildApiUrl('/api/user/theme'), {
          method: 'PUT',
          headers: {
            'Authorization': `Bearer ${token}`,
            'Content-Type': 'application/json',
          },
          credentials: 'include',
          body: JSON.stringify({ colorTheme: newColorTheme }),
        });

        if (!response.ok) {
          throw new Error('Failed to update color theme on server');
        }
        
        devLog('Color theme synced to backend:', newColorTheme);
      }
    } catch (error) {
      devError('Failed to update color theme:', error);
      // Revert on error
      const savedColorTheme = localStorage.getItem('journal-color-theme') as ColorTheme || 'sage';
      setColorThemeState(savedColorTheme);
    } finally {
      setIsLoading(false);
    }
  };

  // Initialize theme on mount
  useEffect(() => {
    const savedTheme = localStorage.getItem('journal-theme-preference') as ThemePreference;
    const savedColorTheme = localStorage.getItem('journal-color-theme') as ColorTheme;
    
    devLog('Initializing themes from localStorage:', { savedTheme, savedColorTheme });
    
    if (savedTheme) {
      setThemePreferenceState(savedTheme);
      setResolvedTheme(resolveTheme(savedTheme));
    } else {
      // Default to system theme
      setResolvedTheme(getSystemTheme());
    }
    
    if (savedColorTheme) {
      setColorThemeState(savedColorTheme);
    }
  }, []);

  // Fetch user theme when user logs in
  useEffect(() => {
    if (user && token) {
      fetchUserTheme();
    }
  }, [user, token]);

  // Listen for system theme changes
  useEffect(() => {
    const mediaQuery = window.matchMedia('(prefers-color-scheme: dark)');
    const handleChange = () => {
      if (themePreference === 'system') {
        setResolvedTheme(getSystemTheme());
      }
    };

    mediaQuery.addEventListener('change', handleChange);
    return () => mediaQuery.removeEventListener('change', handleChange);
  }, [themePreference]);

  // Apply theme to document
  useEffect(() => {
    document.documentElement.classList.toggle('dark', resolvedTheme === 'dark');
    document.documentElement.setAttribute('data-color-theme', colorTheme);
    devLog('Applied theme to document:', { resolvedTheme, colorTheme, 
      documentClass: document.documentElement.className,
      dataColorTheme: document.documentElement.getAttribute('data-color-theme'),
      computedPrimaryColor: getComputedStyle(document.documentElement).getPropertyValue('--primary')
    });
  }, [resolvedTheme, colorTheme]);

  return (
    <ThemeContext.Provider value={{ 
      theme: resolvedTheme, 
      themePreference,
      colorTheme,
      setThemePreference,
      setColorTheme,
      isLoading 
    }}>
      {children}
    </ThemeContext.Provider>
  );
};