'use client';

import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import { useState, useEffect } from 'react';
import { Home, Calendar, Users, MessageCircle, AlertTriangle, Gamepad2, Brain } from 'lucide-react';
import { AppHeader } from '@/components/ui/AppHeader';
import { useSession } from '@/lib/useSession';
import styles from './patient.module.css';

const tabs = [
    { href: '/patient', label: 'Home', icon: Home, exact: true },
    { href: '/patient/schedule', label: 'Schedule', icon: Calendar, exact: false },
    { href: '/patient/memories', label: 'Memories', icon: Brain, exact: false },
    { href: '/patient/games', label: 'Games', icon: Gamepad2, exact: false },
    { href: '/patient/companion', label: 'Saathi', icon: MessageCircle, exact: false },
    { href: '/patient/people', label: 'People', icon: Users, exact: false },
];

export default function PatientLayout({
    children,
}: {
    children: React.ReactNode;
}) {
    const pathname = usePathname();
    const router = useRouter();
    const { user, logout } = useSession();
    const userName = user?.name?.split(' ')[0] || 'Patient';

    const isActive = (tab: typeof tabs[0]) => {
        if (tab.exact) return pathname === tab.href;
        return pathname.startsWith(tab.href);
    };

    return (
        <div className={styles.layout}>
            {/* Sticky Header */}
            <AppHeader
                variant="patient"
                userName={userName}
                onSignOut={logout}
                onSOS={() => router.push('/patient/sos')}
            />

            {/* Main content */}
            <main className={styles.main}>
                {children}
            </main>

            {/* Bottom tab bar */}
            <nav className="bottom-tab-bar" aria-label="Patient navigation">
                {tabs.map((tab) => {
                    const Icon = tab.icon;
                    const active = isActive(tab);
                    return (
                        <Link
                            key={tab.href}
                            href={tab.href}
                            className={`tab-item${active ? ' tab-item--active' : ''}`}
                            aria-current={active ? 'page' : undefined}
                        >
                            <Icon size={30} strokeWidth={active ? 2.5 : 1.8} />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Floating SOS - always visible */}
            <Link
                href="/patient/sos"
                className="sos-fab"
                aria-label="SOS Emergency - tap for help"
                style={{ display: 'flex' }}
            >
                <AlertTriangle size={32} strokeWidth={2.5} />
            </Link>
        </div>
    );
}
