'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Calendar, Image, Users, Brain, Gamepad2,
    FileText, QrCode, Bell, BarChart3, Activity, ScrollText,
    CheckSquare, BookOpen, Pill, MessageCircle, ChevronDown,
} from 'lucide-react';
import { Logo } from './AppHeader';
import { useSession } from '@/lib/useSession';

type SidebarRole = 'guardian' | 'caretaker';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    exact?: boolean;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const guardianGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', href: '/guardian', icon: <LayoutDashboard size={18} />, exact: true },
        ],
    },
    {
        label: 'Care & Content',
        items: [
            { label: 'Schedule', href: '/guardian/schedule', icon: <Calendar size={18} /> },
            { label: 'Memories', href: '/guardian/memories', icon: <Image size={18} /> },
            { label: 'People', href: '/guardian/people', icon: <Users size={18} /> },
            { label: 'Memory Room', href: '/guardian/memory-room', icon: <Brain size={18} /> },
        ],
    },
    {
        label: 'Engagement',
        items: [
            { label: 'Games', href: '/guardian/games', icon: <Gamepad2 size={18} /> },
            { label: 'Analytics', href: '/guardian/analytics', icon: <BarChart3 size={18} /> },
            { label: 'Care Stage', href: '/guardian/stage', icon: <Activity size={18} /> },
        ],
    },
    {
        label: 'Administration',
        items: [
            { label: 'Health Records', href: '/guardian/health', icon: <FileText size={18} /> },
            { label: 'QR Code', href: '/guardian/qr', icon: <QrCode size={18} /> },
            { label: 'Alerts', href: '/guardian/alerts', icon: <Bell size={18} /> },
            { label: 'Reports', href: '/guardian/reports', icon: <ScrollText size={18} /> },
        ],
    },
];

const caretakerGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', href: '/caretaker', icon: <LayoutDashboard size={18} />, exact: true },
        ],
    },
    {
        label: 'Daily Tasks',
        items: [
            { label: 'Tasks', href: '/caretaker/schedule', icon: <CheckSquare size={18} /> },
            { label: 'Medications', href: '/caretaker/medications', icon: <Pill size={18} /> },
        ],
    },
    {
        label: 'Records',
        items: [
            { label: 'Journal', href: '/caretaker/journal', icon: <BookOpen size={18} /> },
        ],
    },
    {
        label: 'Communication',
        items: [
            { label: 'Chat', href: '/caretaker/chat', icon: <MessageCircle size={18} /> },
        ],
    },
];

interface AppSidebarProps {
    role: SidebarRole;
}

export function AppSidebar({ role }: AppSidebarProps) {
    const pathname = usePathname();
    const groups = role === 'guardian' ? guardianGroups : caretakerGroups;
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const { user, logout } = useSession();
    const userName = user?.name || (role === 'caretaker' ? 'Caregiver' : 'Guardian');

    const toggleGroup = (label: string) => {
        setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isItemActive = (item: NavItem) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    const isGroupActive = (group: NavGroup) =>
        group.items.some((item) => isItemActive(item));

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
                textTransform: 'uppercase' as const,
            }}>
                {role === 'guardian' ? 'Guardian View' : 'Caretaker View'}
            </div>

            {/* Nav Groups */}
            <nav style={{ padding: '4px 8px 24px', display: 'flex', flexDirection: 'column', gap: 2 }} aria-label="Main navigation">
                {groups.map((group, groupIdx) => {
                    const isOpen = !collapsed[group.label];
                    const groupActive = isGroupActive(group);
                    const isOverview = group.label === 'Overview';

                    return (
                        <div
                            key={group.label}
                            style={{
                                animation: `fadeUp 0.5s cubic-bezier(0.22,1,0.36,1) both`,
                                animationDelay: `${groupIdx * 80}ms`,
                            }}
                        >
                            {/* Group header */}
                            {!isOverview && (
                                <button
                                    onClick={() => toggleGroup(group.label)}
                                    aria-expanded={isOpen}
                                    style={{
                                        display: 'flex',
                                        alignItems: 'center',
                                        justifyContent: 'space-between',
                                        width: '100%',
                                        padding: '8px 12px',
                                        marginTop: 8,
                                        marginBottom: 2,
                                        fontSize: 11,
                                        fontWeight: 700,
                                        color: groupActive ? 'var(--color-primary)' : 'var(--text-muted)',
                                        letterSpacing: '0.06em',
                                        textTransform: 'uppercase' as const,
                                        cursor: 'pointer',
                                        borderRadius: 'var(--radius-button)',
                                        transition: 'color 0.25s, background 0.25s',
                                        background: 'none',
                                        border: 'none',
                                        textAlign: 'left' as const,
                                        fontFamily: 'var(--font-body)',
                                    }}
                                    onMouseEnter={(e) => {
                                        e.currentTarget.style.background = 'var(--bg-surface-soft)';
                                        e.currentTarget.style.color = 'var(--text-heading)';
                                    }}
                                    onMouseLeave={(e) => {
                                        e.currentTarget.style.background = 'none';
                                        e.currentTarget.style.color = groupActive ? 'var(--color-primary)' : 'var(--text-muted)';
                                    }}
                                >
                                    <span>{group.label}</span>
                                    <ChevronDown
                                        size={14}
                                        style={{
                                            transition: 'transform 0.35s ease',
                                            transform: isOpen ? 'rotate(0deg)' : 'rotate(-90deg)',
                                            flexShrink: 0,
                                        }}
                                    />
                                </button>
                            )}

                            {/* Nav items */}
                            <div style={{
                                overflow: 'hidden',
                                maxHeight: (isOverview || isOpen) ? 500 : 0,
                                opacity: (isOverview || isOpen) ? 1 : 0,
                                transition: 'max-height 0.45s cubic-bezier(0.22,1,0.36,1), opacity 0.35s ease',
                                pointerEvents: (isOverview || isOpen) ? 'auto' : 'none',
                            }}>
                                {group.items.map((item) => {
                                    const active = isItemActive(item);
                                    return (
                                        <Link
                                            key={item.href}
                                            href={item.href}
                                            className={`nav-item ${active ? 'nav-item--active' : ''}`}
                                            aria-current={active ? 'page' : undefined}
                                        >
                                            <span style={{
                                                color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                flexShrink: 0,
                                                transition: 'color 0.25s',
                                            }}>
                                                {item.icon}
                                            </span>
                                            {item.label}
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            {/* footer with profile + sign-out for both roles */}
            <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 8 }}>
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'var(--color-primary-muted)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                    }}>
                        {userName
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>
                    <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                        {userName}
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn btn--ghost btn--sm"
                    style={{ width: '100%' }}
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
