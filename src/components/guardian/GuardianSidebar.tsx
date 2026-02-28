'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Calendar, Brain, Users, Home,
    Gamepad2, FileText, QrCode, Bell, BarChart3,
    Layers, ClipboardList, LogOut, Heart, ChevronDown,
    ChevronLeft, ChevronRight,
} from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './GuardianSidebar.module.css';

interface NavGroup {
    label: string;
    items: {
        href: string;
        label: string;
        icon: React.ReactNode;
        exact?: boolean;
        badge?: number;
    }[];
}

const navGroups: NavGroup[] = [
    {
        label: 'Overview',
        items: [
            { href: '/guardian', label: 'Dashboard', icon: <LayoutDashboard size={18} />, exact: true },
        ],
    },
    {
        label: 'Care & Content',
        items: [
            { href: '/guardian/schedule', label: 'Schedule', icon: <Calendar size={18} /> },
            { href: '/guardian/memories', label: 'Memories', icon: <Brain size={18} /> },
            { href: '/guardian/people', label: 'People Wallet', icon: <Users size={18} /> },
            { href: '/guardian/contributions', label: 'Contributions', icon: <Heart size={18} />, badge: 1 },
        ],
    },
    {
        label: 'Engagement',
        items: [
            { href: '/guardian/analytics', label: 'Analytics', icon: <BarChart3 size={18} /> },
            { href: '/guardian/stage', label: 'Care Stage', icon: <Layers size={18} /> },
        ],
    },
    {
        label: 'Administration',
        items: [
            { href: '/guardian/health', label: 'Health Records', icon: <FileText size={18} /> },
            { href: '/guardian/qr', label: 'QR Code', icon: <QrCode size={18} /> },
            { href: '/guardian/alerts', label: 'Alerts', icon: <Bell size={18} />, badge: 2 },
            { href: '/guardian/reports', label: 'Reports', icon: <ClipboardList size={18} /> },
        ],
    },
];

export default function GuardianSidebar() {
    const pathname = usePathname();
    const [collapsed, setCollapsed] = useState<Record<string, boolean>>({});
    const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
    const { user, logout } = useSession();

    const guardianName = user?.name || 'Guardian';
    const guardianRole = user?.role ? `${user.role.charAt(0).toUpperCase()}${user.role.slice(1)}` : 'Guardian';
    const guardianInitials = guardianName.split(' ').map((n: string) => n[0]).join('').slice(0, 2).toUpperCase();
    const patientName = user?.patientName || 'Patient';

    const toggleGroup = (label: string) => {
        setCollapsed((prev) => ({ ...prev, [label]: !prev[label] }));
    };

    const isItemActive = (item: NavGroup['items'][0]) => {
        if (item.exact) return pathname === item.href;
        return pathname.startsWith(item.href);
    };

    // Check if any item in a group is active
    const isGroupActive = (group: NavGroup) =>
        group.items.some((item) => isItemActive(item));

    return (
        <aside
            className={`${styles.sidebar} ${sidebarCollapsed ? styles.sidebarCollapsed : ''}`}
            role="navigation"
            aria-label="Guardian navigation"
        >
            {/* Collapse toggle button */}
            <button
                className={styles.collapseBtn}
                onClick={() => setSidebarCollapsed(!sidebarCollapsed)}
                aria-label={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
                title={sidebarCollapsed ? 'Expand sidebar' : 'Collapse sidebar'}
            >
                {sidebarCollapsed ? <ChevronRight size={16} /> : <ChevronLeft size={16} />}
            </button>

            <div className={styles.logoArea}>
                <div className={styles.logoIcon}>
                    <Heart size={20} />
                </div>
                <div className={styles.logoContent}>
                    <span className={styles.logoText}>SaathiCare</span>
                    <span className={styles.logoSub}>Guardian View</span>
                </div>
            </div>

            <div className={styles.patientChip}>
                <div className={styles.patientAvatar}>{(patientName || 'Patient').split(' ').map(p => p[0]).join('').slice(0, 2).toUpperCase()}</div>
                <div className={styles.patientInfo}>
                    <span className={styles.patientName}>{patientName || 'Patient'}</span>
                    <span className={styles.patientStage}>Care Plan Active</span>
                </div>
            </div>

            <nav className={styles.nav}>
                {navGroups.map((group, groupIdx) => {
                    const isOpen = !collapsed[group.label];
                    const groupActive = isGroupActive(group);

                    return (
                        <div
                            key={group.label}
                            className={styles.navGroup}
                            style={{ animationDelay: `${groupIdx * 80}ms` }}
                        >
                            {/* Group header — Overview has no toggle */}
                            {group.label !== 'Overview' ? (
                                <button
                                    className={`${styles.groupHeader} ${groupActive ? styles.groupHeaderActive : ''}`}
                                    onClick={() => toggleGroup(group.label)}
                                    aria-expanded={isOpen}
                                >
                                    <span className={styles.groupLabel}>{group.label}</span>
                                    <ChevronDown
                                        size={14}
                                        className={`${styles.groupChevron} ${isOpen ? styles.groupChevronOpen : ''}`}
                                    />
                                </button>
                            ) : null}

                            {/* Nav items — always show Overview, toggle others */}
                            <ul
                                className={`${styles.navList} ${group.label !== 'Overview' && !isOpen ? styles.navListCollapsed : ''
                                    }`}
                            >
                                {group.items.map((item, itemIdx) => {
                                    const active = isItemActive(item);
                                    return (
                                        <li
                                            key={item.href}
                                            style={{ animationDelay: `${(groupIdx * 80) + (itemIdx * 40)}ms` }}
                                        >
                                            <Link
                                                href={item.href}
                                                className={`${styles.navItem} ${active ? styles.navItemActive : ''}`}
                                                aria-current={active ? 'page' : undefined}
                                                title={item.label}
                                            >
                                                <span className={styles.navItemIcon}>{item.icon}</span>
                                                <span className={styles.navItemLabel}>{item.label}</span>
                                                {item.badge ? (
                                                    <span className={styles.badge} aria-label={`${item.badge} unread`}>
                                                        {item.badge}
                                                    </span>
                                                ) : null}
                                            </Link>
                                        </li>
                                    );
                                })}
                            </ul>
                        </div>
                    );
                })}
            </nav>

            <div className={styles.sidebarFooter}>
                <div className={styles.guardianChip}>
                    <div className={styles.guardianAvatar}>{guardianInitials}</div>
                    <div className={styles.guardianInfo}>
                        <span className={styles.guardianName}>{guardianName}</span>
                        <span className={styles.guardianRole}>{guardianRole}</span>
                    </div>
                </div>
                <button className={styles.logoutBtn} aria-label="Sign out" onClick={logout}>
                    <LogOut size={16} aria-hidden="true" />
                    <span className={styles.logoutLabel}>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
