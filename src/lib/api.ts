/** Get the stored JWT token */
export function getToken(): string | null {
    if (typeof window === 'undefined') return null;
    return localStorage.getItem('saathi_token');
}

/** Store the JWT token */
export function setToken(token: string): void {
    localStorage.setItem('saathi_token', token);
}

/** Clear the JWT token */
export function clearToken(): void {
    localStorage.removeItem('saathi_token');
}

/** Authenticated fetch wrapper */
export async function apiFetch<T = unknown>(
    path: string,
    options: RequestInit = {}
): Promise<T> {
    const token = getToken();
    const headers: Record<string, string> = {
        'Content-Type': 'application/json',
        ...(options.headers as Record<string, string> || {}),
    };

    if (token) {
        headers['Authorization'] = `Bearer ${token}`;
    }

    const res = await fetch(path, {
        ...options,
        headers,
    });

    if (!res.ok) {
        const body = await res.json().catch(() => ({ error: 'Request failed' }));
        throw new Error(body.error || `HTTP ${res.status}`);
    }

    return res.json();
}
