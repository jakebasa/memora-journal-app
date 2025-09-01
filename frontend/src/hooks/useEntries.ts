import { useState, useEffect, useCallback } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { buildApiUrl } from '@/config/api';

interface JournalEntry {
    _id: string;
    title: string;
    content: string;
    mood: string;
    tags: string[];
    createdAt: string;
    updatedAt: string;
}

// User-specific cache for entries
let entriesCache: { [userId: string]: JournalEntry[] } = {};
let cacheTimestamp: { [userId: string]: number } = {};
const CACHE_DURATION = 5 * 60 * 1000; // 5 minutes

// Clear cache for specific user
export const clearEntriesCache = (userId?: string) => {
    if (userId) {
        delete entriesCache[userId];
        delete cacheTimestamp[userId];
    } else {
        // Clear all cache
        entriesCache = {};
        cacheTimestamp = {};
    }
};

export const useEntries = () => {
    const [entries, setEntries] = useState<JournalEntry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const { token, user } = useAuth();

    const fetchEntries = useCallback(async (forceRefresh = false) => {
        if (!token || !user) {
            setEntries([]);
            setLoading(false);
            return [];
        }

        const userId = user.id;
        
        // Check user-specific cache first
        const now = Date.now();
        const userCache = entriesCache[userId];
        const userCacheTime = cacheTimestamp[userId];
        
        if (!forceRefresh && userCache && userCacheTime && (now - userCacheTime) < CACHE_DURATION) {
            setEntries(userCache);
            setLoading(false);
            return userCache;
        }

        setLoading(true);
        setError(null);

        try {
            const response = await fetch(buildApiUrl('/api/entries?limit=1000'), {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.ok) {
                throw new Error(`HTTP ${response.status}: ${response.statusText}`);
            }

            const data = await response.json();
            const entriesArray = Array.isArray(data) ? data : (data.entries || []);
            
            // Update user-specific cache
            entriesCache[userId] = entriesArray;
            cacheTimestamp[userId] = now;
            
            setEntries(entriesArray);
            return entriesArray;
        } catch (err) {
            const errorMessage = err instanceof Error ? err.message : 'Failed to fetch entries';
            setError(errorMessage);
            console.error('Error fetching entries:', err);
            return [];
        } finally {
            setLoading(false);
        }
    }, [token, user]);

    const refreshEntries = useCallback(() => {
        fetchEntries(true);
    }, [fetchEntries]);

    // Clear entries immediately when user changes
    useEffect(() => {
        if (!user) {
            setEntries([]);
            setLoading(false);
        }
    }, [user]);

    const invalidateCache = useCallback(() => {
        if (user) {
            clearEntriesCache(user.id);
        }
        fetchEntries(true);
    }, [fetchEntries, user]);

    useEffect(() => {
        fetchEntries();
    }, [fetchEntries]);

    return { entries, loading, error, refreshEntries, invalidateCache };
};
