'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { Home, Calendar, BookImage, Users, Bot } from 'lucide-react';

const tabs = [
    { label: 'Home', href: '/patient', icon: <Home size={22} />, tooltip: 'Go to your home dashboard' },
    { label: 'Schedule', href: '/patient/schedule', icon: <Calendar size={22} />, tooltip: 'View today\'s tasks and appointments' },
    { label: 'Memories', href: '/patient/memories', icon: <BookImage size={22} />, tooltip: 'Practice memory recall with flashcards' },
    { label: 'People', href: '/patient/people', icon: <Users size={22} />, tooltip: 'See the people who care about you' },
    { label: 'Companion', href: '/patient/companion', icon: <Bot size={22} />, tooltip: 'Talk to your AI memory companion' },
];

export function BottomTabBar() {
    const pathname = usePathname();

    return (
        <nav className="bottom-tab-bar" aria-label="Main navigation">
            {tabs.map((tab) => {
                const isActive = pathname === tab.href ||
                    (tab.href !== '/patient' && pathname.startsWith(tab.href));
                return (
                    <Link
                        key={tab.href}
                        href={tab.href}
                        className={`tab-item ${isActive ? 'tab-item--active' : ''}`}
                        aria-current={isActive ? 'page' : undefined}
                        aria-label={tab.label}
                        data-tooltip={tab.tooltip}
                        data-tooltip-pos="top"
                    >
                        <span style={{
                            color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                            transition: 'color 0.15s',
                        }}>
                            {tab.icon}
                        </span>
                        <span style={{ fontSize: 11, fontWeight: isActive ? 600 : 500 }}>
                            {tab.label}
                        </span>
                    </Link>
                );
            })}
        </nav>
    );
}
