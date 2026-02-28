'use client';

import { useState, useEffect, useCallback } from 'react';
import { useRouter } from 'next/navigation';

export interface SessionData {
    id: string;
    name: string;
    email: string;
    role: string;
    isDemo?: boolean;
    patientName?: string;
}

export interface UseSessionReturn {
    user: SessionData | null;
    token: string | null;
    isDemo: boolean;
    isLoggedIn: boolean;
    loading: boolean;
    logout: () => void;
}

/**
 * Client-side session hook.
 * Reads saathi_user + saathi_token from localStorage.
 * Provides isDemo flag and logout helper.
 */
export function useSession(): UseSessionReturn {
    const router = useRouter();
    const [user, setUser] = useState<SessionData | null>(null);
    const [token, setToken] = useState<string | null>(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        try {
            const rawUser = localStorage.getItem('saathi_user');
            const rawToken = localStorage.getItem('saathi_token');

            if (rawUser) {
                const parsed = JSON.parse(rawUser);
                setUser(parsed);
            }
            if (rawToken) {
                setToken(rawToken);
            }
        } catch {
            // corrupted localStorage, treat as logged out
        }
        setLoading(false);
    }, []);

    const logout = useCallback(() => {
        try {
            localStorage.removeItem('saathi_user');
            localStorage.removeItem('saathi_token');
            localStorage.removeItem('demoUser');
        } catch { }
        setUser(null);
        setToken(null);
        router.push('/login');
    }, [router]);

    const isDemo = user?.isDemo === true || token === 'demo-token';

    return {
        user,
        token,
        isDemo,
        isLoggedIn: !!user && !!token,
        loading,
        logout,
    };
}
