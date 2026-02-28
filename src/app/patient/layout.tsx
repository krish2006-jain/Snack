'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, Users, MessageCircle, AlertTriangle, Gamepad2, DoorOpen } from 'lucide-react';
import styles from './patient.module.css';

const tabs = [
    { href: '/patient', label: 'Home', icon: Home, exact: true },
    { href: '/patient/schedule', label: 'Schedule', icon: Calendar, exact: false },
    { href: '/patient/memory-room', label: 'Rooms', icon: DoorOpen, exact: false },
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

    const isActive = (tab: typeof tabs[0]) => {
        if (tab.exact) return pathname === tab.href;
        return pathname.startsWith(tab.href);
    };

    return (
        <div className={styles.layout}>
            {/* Sticky Header */}
            <header className={styles.header}>
                <div className={styles.headerLogo}>
                    <span className={styles.logoSaathi}>Saathi</span>
                    <span className={styles.logoCare}>Care</span>
                </div>
                <Link href="/patient/sos" className={styles.headerSos} aria-label="SOS Emergency">
                    <AlertTriangle size={22} />
                    <span>SOS</span>
                </Link>
            </header>

            {/* Main content */}
            <main className={styles.main}>
                {children}
            </main>

            {/* Bottom tab bar — mobile only */}
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
                            <Icon size={22} />
                            <span>{tab.label}</span>
                        </Link>
                    );
                })}
            </nav>

            {/* Floating SOS — always visible on desktop */}
            <Link
                href="/patient/sos"
                className="sos-fab"
                aria-label="SOS Emergency — tap for help"
                style={{ display: 'flex' }}
            >
                <AlertTriangle size={28} strokeWidth={2.5} />
            </Link>
        </div>
    );
}
