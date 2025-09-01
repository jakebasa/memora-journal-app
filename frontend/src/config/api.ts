// API Configuration
export const API_CONFIG = {
    BASE_URL: import.meta.env.VITE_BACKEND_URL || 'http://localhost:5000',
    ENDPOINTS: {
        ENTRIES: '/api/entries',
        AUTH: '/api/auth',
        IMAGES: '/api/images',
        USER: {
            THEME: '/api/user/theme',
            PROFILE: '/api/user/profile',
        },
        AI: {
            SUMMARIZE: '/api/ai/summarize',
            PROMPT: '/api/ai/prompt',
            MOOD_PROMPT: '/api/ai/mood-prompt',
            PERIOD_SUMMARY: '/api/ai/period-summary',
            CHAT: '/api/ai/chat',
        },
    },
    TIMEOUTS: {
        DEFAULT: 10000, // 10 seconds
        UPLOAD: 30000, // 30 seconds for file uploads
        AI: 60000, // 60 seconds for AI operations
    },
} as const;

// Helper function to build full URLs
export const buildApiUrl = (endpoint: string): string => {
    return `${API_CONFIG.BASE_URL}${endpoint}`;
};

// Development mode check
export const isDevelopment = process.env.NODE_ENV === 'development' || import.meta.env.MODE === 'development' || !import.meta.env.PROD;

// Logger utility for development
export const devLog = (...args: any[]) => {
    if (isDevelopment) {
        console.log('[DEV]', ...args);
    }
};

export const devError = (...args: any[]) => {
    if (isDevelopment) {
        console.error('[DEV]', ...args);
    }
};
