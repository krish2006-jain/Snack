'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { Bell, AlertTriangle, User } from 'lucide-react';

export type HeaderVariant = 'default' | 'patient' | 'public';

interface AppHeaderProps {
    variant?: HeaderVariant;
    userName?: string;
    alertCount?: number;
    onSOS?: () => void;
    onSignOut?: () => void;
}

export function AppHeader({
    variant = 'default',
    userName = '',
    alertCount = 3,
    onSOS,
    onSignOut,
}: AppHeaderProps) {
    const [scrolled, setScrolled] = useState(false);

    useEffect(() => {
        if (variant !== 'public') return;
        const handleScroll = () => setScrolled(window.scrollY > 20);
        window.addEventListener('scroll', handleScroll, { passive: true });
        return () => window.removeEventListener('scroll', handleScroll);
    }, [variant]);

    if (variant === 'public') {
        return (
            <header
                className={`floating-nav ${scrolled ? 'floating-nav--scrolled' : ''}`}
                style={{ justifyContent: 'space-between' }}
            >
                <Link href="/" style={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                    <Logo />
                </Link>
                <nav style={{ display: 'flex', gap: 32, alignItems: 'center' }}>
                    <Link href="/about" style={{ color: scrolled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 500, transition: 'color 0.2s' }}>About</Link>
                    <Link href="/guardian" style={{ color: scrolled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 500, transition: 'color 0.2s' }}>For Guardians</Link>
                    <Link href="/scan" style={{ color: scrolled ? 'rgba(255,255,255,0.8)' : 'rgba(255,255,255,0.9)', fontSize: 15, fontWeight: 500 }}>QR Scan</Link>
                </nav>
                <Link href="/login" className="btn btn--glass btn--pill" style={{ padding: '10px 24px', minHeight: 40, fontSize: 14 }}>
                    Sign In
                </Link>
            </header>
        );
    }

    if (variant === 'patient') {
        return (
            <header className="app-header" style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
                <Link href="/patient" style={{ display: 'flex', alignItems: 'center' }}>
                    <Logo compact />
                </Link>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    {userName && onSignOut && (
                        <button
                            onClick={onSignOut}
                            className="btn--icon"
                            aria-label="Sign out"
                            style={{ background: 'transparent', border: 'none', cursor: 'pointer' }}
                        >
                            <User size={20} color="var(--text-body)" />
                        </button>
                    )}
                    <button
                        onClick={onSOS}
                        className="btn btn--danger btn--pill"
                        style={{ padding: '10px 20px', minHeight: 40, gap: 6 }}
                        aria-label="SOS Emergency"
                    >
                        <AlertTriangle size={18} />
                        <span style={{ fontWeight: 700, fontSize: 14 }}>SOS</span>
                    </button>
                </div>
            </header>
        );
    }

    // default — guardian/caretaker
    return (
        <header className="app-header">
            <Link href="/" style={{ display: 'flex', alignItems: 'center', marginRight: 'auto' }}>
                <Logo />
            </Link>

            <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                {/* Bell with badge */}
                <button
                    className="btn--icon"
                    aria-label={`${alertCount} notifications`}
                    style={{ position: 'relative', background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 12, width: 44, height: 44, display: 'flex', alignItems: 'center', justifyContent: 'center', cursor: 'pointer' }}
                >
                    <Bell size={20} color="var(--text-body)" />
                    {alertCount > 0 && (
                        <span style={{
                            position: 'absolute',
                            top: -4,
                            right: -4,
                            background: 'var(--color-danger)',
                            color: '#fff',
                            fontSize: 10,
                            fontWeight: 700,
                            width: 18,
                            height: 18,
                            borderRadius: '50%',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            border: '2px solid #fff',
                        }}>
                            {alertCount}
                        </span>
                    )}
                </button>

                {/* Avatar + name */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        borderRadius: '50%',
                        background: 'var(--color-primary)',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <User size={18} color="#fff" />
                    </div>
                    <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)' }}>
                        {userName}
                    </span>
                </div>
            </div>
        </header>
    );
}

function Logo({ compact = false }: { compact?: boolean }) {
    return (
        <span style={{ display: 'flex', alignItems: 'baseline', gap: 0, userSelect: 'none' }}>
            <span style={{
                fontSize: compact ? 18 : 22,
                fontWeight: 800,
                color: 'var(--text-heading)',
                letterSpacing: '-0.02em',
                lineHeight: 1,
            }}>
                Saathi
            </span>
            <span style={{
                fontSize: compact ? 18 : 22,
                fontWeight: 400,
                color: 'var(--color-primary)',
                letterSpacing: '-0.01em',
                lineHeight: 1,
            }}>
                Care
            </span>
        </span>
    );
}

export { Logo };
