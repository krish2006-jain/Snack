'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Calendar, Image, Users, Brain, Gamepad2,
    FileText, QrCode, Bell, BarChart3, Activity, ScrollText,
    CheckSquare, BookOpen, Pill, MessageCircle,
} from 'lucide-react';
import { Logo } from './AppHeader';

type SidebarRole = 'guardian' | 'caretaker';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
}

const guardianNav: NavItem[] = [
    { label: 'Dashboard', href: '/guardian', icon: <LayoutDashboard size={18} /> },
    { label: 'Schedule', href: '/guardian/schedule', icon: <Calendar size={18} /> },
    { label: 'Memories', href: '/guardian/memories', icon: <Image size={18} /> },
    { label: 'People', href: '/guardian/people', icon: <Users size={18} /> },
    { label: 'Memory Room', href: '/guardian/memory-room', icon: <Brain size={18} /> },
    { label: 'Games', href: '/guardian/games', icon: <Gamepad2 size={18} /> },
    { label: 'Health Records', href: '/guardian/health', icon: <FileText size={18} /> },
    { label: 'QR Code', href: '/guardian/qr', icon: <QrCode size={18} /> },
    { label: 'Alerts', href: '/guardian/alerts', icon: <Bell size={18} /> },
    { label: 'Analytics', href: '/guardian/analytics', icon: <BarChart3 size={18} /> },
    { label: 'Care Stage', href: '/guardian/care-stage', icon: <Activity size={18} /> },
    { label: 'Reports', href: '/guardian/reports', icon: <ScrollText size={18} /> },
];

const caretakerNav: NavItem[] = [
    { label: 'Dashboard', href: '/caretaker', icon: <LayoutDashboard size={18} /> },
    { label: 'Tasks', href: '/caretaker/schedule', icon: <CheckSquare size={18} /> },
    { label: 'Journal', href: '/caretaker/journal', icon: <BookOpen size={18} /> },
    { label: 'Medications', href: '/caretaker/medications', icon: <Pill size={18} /> },
    { label: 'Chat', href: '/caretaker/chat', icon: <MessageCircle size={18} /> },
];

interface AppSidebarProps {
    role: SidebarRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
    const pathname = usePathname();
    const navItems = role === 'guardian' ? guardianNav : caretakerNav;

    return (
        <aside className="app-sidebar">
            {/* Logo area */}
            <div style={{
                padding: '24px 16px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
            }}>
                <Link href={role === 'guardian' ? '/guardian' : '/caretaker'}>
                    <Logo />
                </Link>
            </div>

            {/* Role label */}
            <div style={{
                padding: '8px 20px 4px',
                fontSize: 11,
                fontWeight: 700,
                color: 'var(--text-muted)',
                letterSpacing: '0.08em',
                textTransform: 'uppercase',
            }}>
                {role === 'guardian' ? 'Guardian View' : 'Caretaker View'}
            </div>

            {/* Nav */}
            <nav style={{ padding: '4px 8px 24px' }} aria-label="Main navigation">
                {navItems.map((item) => {
                    const isActive = pathname === item.href ||
                        (item.href !== '/guardian' && item.href !== '/caretaker' && pathname.startsWith(item.href));
                    return (
                        <Link
                            key={item.href}
                            href={item.href}
                            className={`nav-item ${isActive ? 'nav-item--active' : ''}`}
                            aria-current={isActive ? 'page' : undefined}
                        >
                            <span style={{
                                color: isActive ? 'var(--color-primary)' : 'var(--text-muted)',
                                display: 'flex',
                                alignItems: 'center',
                                flexShrink: 0,
                                transition: 'color 0.15s',
                            }}>
                                {item.icon}
                            </span>
                            {item.label}
                        </Link>
                    );
                })}
            </nav>
        </aside>
    );
}
