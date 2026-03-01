'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { usePathname, useRouter } from 'next/navigation';
import {
    LayoutDashboard, Calendar, Image, Users, Brain, Gamepad2,
    FileText, QrCode, Bell, BarChart3, Activity, ScrollText,
    CheckSquare, BookOpen, Pill, ChevronDown,
    ChevronLeft, ChevronRight, Heart
} from 'lucide-react';
import { Logo } from './AppHeader';
import { useSession } from '@/lib/useSession';

type SidebarRole = 'guardian' | 'caretaker';

interface NavItem {
    label: string;
    href: string;
    icon: React.ReactNode;
    exact?: boolean;
    tooltip?: string;
}

interface NavGroup {
    label: string;
    items: NavItem[];
}

const guardianGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', href: '/guardian', icon: <LayoutDashboard size={18} />, exact: true, tooltip: 'Overview of all your patient\'s care metrics and daily activity' },
        ],
    },
    {
        label: 'Care & Content',
        items: [
            { label: 'Schedule', href: '/guardian/schedule', icon: <Calendar size={18} />, tooltip: 'View and manage the patient\'s daily care schedule' },
            { label: 'Memories', href: '/guardian/memories', icon: <Image size={18} />, tooltip: 'Upload and curate photo flashcards for memory therapy' },
            { label: 'People', href: '/guardian/people', icon: <Users size={18} />, tooltip: 'Manage the patient\'s people wallet - family and friends' },
            { label: 'Memory Room', href: '/guardian/memory-room', icon: <Brain size={18} />, tooltip: 'Set up interactive virtual rooms for spatial memory therapy' },
        ],
    },
    {
        label: 'Engagement',
        items: [
            { label: 'Games', href: '/guardian/games', icon: <Gamepad2 size={18} />, tooltip: 'View brain game scores, streaks, and activity logs' },
            { label: 'Analytics', href: '/guardian/analytics', icon: <BarChart3 size={18} />, tooltip: 'Deep-dive into cognitive score trends and health metrics' },
            { label: 'Care Stage', href: '/guardian/stage', icon: <Activity size={18} />, tooltip: 'Understand the current Alzheimer\'s care stage and what it means' },
        ],
    },
    {
        label: 'Administration',
        items: [
            { label: 'Health Records', href: '/guardian/health', icon: <FileText size={18} />, tooltip: 'View and manage the patient\'s medical health records' },
            { label: 'QR Code', href: '/guardian/qr', icon: <QrCode size={18} />, tooltip: 'Manage the emergency QR bracelet and view scan history' },
            { label: 'Alerts', href: '/guardian/alerts', icon: <Bell size={18} />, tooltip: 'View and respond to safety and care alerts' },
            { label: 'Reports', href: '/guardian/reports', icon: <ScrollText size={18} />, tooltip: 'Generate and download care reports for medical professionals' },
        ],
    },
];

const caretakerGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { label: 'Dashboard', href: '/caretaker', icon: <LayoutDashboard size={18} />, exact: true, tooltip: 'Overview of today\'s shift tasks, medications, and patient status' },
        ],
    },
    {
        label: 'Daily Tasks',
        items: [
            { label: 'Tasks', href: '/caretaker/schedule', icon: <CheckSquare size={18} />, tooltip: 'View and complete today\'s care tasks' },
            { label: 'Medications', href: '/caretaker/medications', icon: <Pill size={18} />, tooltip: 'Log administered medications and track adherence' },
        ],
    },
    {
        label: 'Records',
        items: [
            { label: 'Journal', href: '/caretaker/journal', icon: <BookOpen size={18} />, tooltip: 'Write shift observations and notes about the patient' },
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
    const [sidebarCollapsed, setSidebarCollapsed] = useState(true);
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
        <aside className={`app-sidebar ${sidebarCollapsed ? 'app-sidebar--collapsed' : ''}`} role="navigation">


            {/* Logo area */}
            <div style={{
                padding: '24px 16px 16px',
                borderBottom: '1px solid var(--border-subtle)',
                marginBottom: 8,
                display: 'flex',
                alignItems: 'center',
                overflow: 'hidden',
                whiteSpace: 'nowrap'
            }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
                    <div style={{
                        width: 36,
                        height: 36,
                        background: 'var(--color-primary-muted)',
                        color: 'var(--color-primary)',
                        borderRadius: 10,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0,
                    }}>
                        <Heart size={20} />
                    </div>
                    <div className="sidebar-text" style={{
                        display: 'flex',
                        alignItems: 'center',
                        flexShrink: 0
                    }}>
                        <Logo />
                    </div>
                </div>
            </div>

            {/* Role label */}
            <div className="sidebar-text" style={{
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
                                    className="sidebar-text"
                                    onClick={() => toggleGroup(group.label)}
                                    aria-expanded={isOpen}
                                    data-tooltip={isOpen ? `Collapse ${group.label}` : `Expand ${group.label}`}
                                    data-tooltip-pos="right"
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
                                            title={item.label}
                                            data-tooltip={item.tooltip || item.label}
                                            data-tooltip-pos="right"
                                            style={{
                                                paddingLeft: 12,
                                                paddingRight: 12
                                            }}
                                        >
                                            <span style={{
                                                color: active ? 'var(--color-primary)' : 'var(--text-muted)',
                                                display: 'flex',
                                                alignItems: 'center',
                                                justifyContent: 'center',
                                                flexShrink: 0,
                                                width: 24,
                                                transition: 'color 0.25s, transform 0.2s',
                                            }}>
                                                {item.icon}
                                            </span>
                                            <span className="sidebar-text" style={{ flex: 1 }}>{item.label}</span>
                                        </Link>
                                    );
                                })}
                            </div>
                        </div>
                    );
                })}
            </nav>

            <div style={{ marginTop: 'auto', padding: '16px 20px', borderTop: '1px solid var(--border-subtle)', background: 'var(--bg-sidebar)', display: 'flex', flexDirection: 'column', gap: 8, overflow: 'hidden' }}>
                <div className="sidebar-footer-profile" data-tooltip="Your account profile">
                    <div style={{
                        width: 32,
                        height: 32,
                        borderRadius: '50%',
                        background: 'linear-gradient(135deg, #2D5A3D, #4A7C5C)',
                        color: '#fff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: 12,
                        fontWeight: 700,
                        flexShrink: 0,
                        transition: 'transform 0.2s, box-shadow 0.2s'
                    }}
                        onMouseEnter={(e) => {
                            e.currentTarget.style.transform = 'scale(1.08)';
                            e.currentTarget.style.boxShadow = '0 2px 8px rgba(45,90,61,0.2)';
                        }}
                        onMouseLeave={(e) => {
                            e.currentTarget.style.transform = 'scale(1)';
                            e.currentTarget.style.boxShadow = 'none';
                        }}
                    >
                        {userName
                            .split(' ')
                            .map((p) => p[0])
                            .join('')
                            .slice(0, 2)
                            .toUpperCase()}
                    </div>
                    <div className="sidebar-text" style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-heading)' }}>
                        {userName}
                    </div>
                </div>
                <button
                    onClick={logout}
                    className="btn btn--ghost btn--sm sidebar-text"
                    data-tooltip="Sign out of your SaathiCare account"
                    style={{
                        width: '100%',
                        justifyContent: 'flex-start',
                        padding: '6px 12px'
                    }}
                >
                    Sign out
                </button>
            </div>
        </aside>
    );
}
