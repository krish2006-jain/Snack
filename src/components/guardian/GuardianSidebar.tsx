'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import {
    LayoutDashboard, Calendar, Brain, Users, Home,
    Gamepad2, FileText, QrCode, Bell, BarChart3,
    Layers, ClipboardList, LogOut, Heart
} from 'lucide-react';
import styles from './GuardianSidebar.module.css';

const navItems = [
    { href: '/guardian', label: 'Dashboard', icon: LayoutDashboard, exact: true },
    { href: '/guardian/schedule', label: 'Schedule', icon: Calendar },
    { href: '/guardian/memories', label: 'Memories', icon: Brain },
    { href: '/guardian/people', label: 'People Wallet', icon: Users },
    { href: '/guardian/memory-room', label: 'Memory Room', icon: Home },
    { href: '/guardian/games', label: 'Games', icon: Gamepad2 },
    { href: '/guardian/health', label: 'Health Records', icon: FileText },
    { href: '/guardian/qr', label: 'QR Code', icon: QrCode },
    { href: '/guardian/alerts', label: 'Alerts', icon: Bell, badge: 2 },
    { href: '/guardian/analytics', label: 'Analytics', icon: BarChart3 },
    { href: '/guardian/stage', label: 'Care Stage', icon: Layers },
    { href: '/guardian/reports', label: 'Reports', icon: ClipboardList },
];

export default function GuardianSidebar() {
    const pathname = usePathname();

    return (
        <aside className={styles.sidebar} role="navigation" aria-label="Guardian navigation">
            <div className={styles.logoArea}>
                <div className={styles.logoIcon}>
                    <Heart size={20} />
                </div>
                <div>
                    <span className={styles.logoText}>SaathiCare</span>
                    <span className={styles.logoSub}>Guardian View</span>
                </div>
            </div>

            <div className={styles.patientChip}>
                <div className={styles.patientAvatar}>RS</div>
                <div className={styles.patientInfo}>
                    <span className={styles.patientName}>Ravi Sharma</span>
                    <span className={styles.patientStage}>Moderate Stage</span>
                </div>
            </div>

            <nav className={styles.nav}>
                <ul className={styles.navList}>
                    {navItems.map((item) => {
                        const isActive = item.exact
                            ? pathname === item.href
                            : pathname.startsWith(item.href);
                        return (
                            <li key={item.href}>
                                <Link
                                    href={item.href}
                                    className={`${styles.navItem} ${isActive ? styles.navItemActive : ''}`}
                                    aria-current={isActive ? 'page' : undefined}
                                >
                                    <item.icon size={18} aria-hidden="true" />
                                    <span>{item.label}</span>
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
            </nav>

            <div className={styles.sidebarFooter}>
                <div className={styles.guardianChip}>
                    <div className={styles.guardianAvatar}>PS</div>
                    <div>
                        <span className={styles.guardianName}>Priya Sharma</span>
                        <span className={styles.guardianRole}>Guardian • Daughter</span>
                    </div>
                </div>
                <button className={styles.logoutBtn} aria-label="Sign out">
                    <LogOut size={16} aria-hidden="true" />
                    <span>Sign out</span>
                </button>
            </div>
        </aside>
    );
}
