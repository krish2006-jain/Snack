'use client';

import { useState, useEffect, useRef } from 'react';
import { Bell, Search, ChevronDown } from 'lucide-react';
import { useRouter } from 'next/navigation';
import { useSession } from '@/lib/useSession';
import styles from './GuardianHeader.module.css';

interface GuardianHeaderProps {
    title: string;
    subtitle?: string;
}

export default function GuardianHeader({ title, subtitle }: GuardianHeaderProps) {
    const now = new Date();
    const dateStr = now.toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
        year: 'numeric',
    });

    const [profileOpen, setProfileOpen] = useState(false);
    const { user, logout } = useSession();
    const router = useRouter();
    const menuRef = useRef<HTMLDivElement | null>(null);

    useEffect(() => {
        function onDoc(e: MouseEvent) {
            if (!menuRef.current) return;
            if (!menuRef.current.contains(e.target as Node)) setProfileOpen(false);
        }
        document.addEventListener('click', onDoc);
        return () => document.removeEventListener('click', onDoc);
    }, []);

    const handleSignOut = () => {
        logout();
        setProfileOpen(false);
    };

    const initials = user ? user.name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';

    return (
        <header className={styles.header} role="banner">
            <div className={styles.left}>
                <h1 className={styles.title}>{title}</h1>
                {subtitle && <p className={styles.subtitle}>{subtitle}</p>}
                {!subtitle && <p className={styles.date}>{dateStr}</p>}
            </div>
            <div className={styles.right}>
                <div className={styles.searchWrap}>
                    <Search size={16} className={styles.searchIcon} aria-hidden="true" />
                    <input
                        className={styles.search}
                        type="search"
                        placeholder="Search..."
                        aria-label="Search"
                    />
                </div>
                <button className={styles.notifBtn} aria-label="2 unread notifications">
                    <Bell size={20} aria-hidden="true" />
                    <span className={styles.notifDot} aria-hidden="true" />
                </button>

                <div className={styles.profileWrap} ref={menuRef}>
                    <button className={styles.avatar} aria-haspopup="menu" aria-expanded={profileOpen} onClick={() => setProfileOpen(p => !p)}>
                        {initials} <ChevronDown size={12} style={{ marginLeft: 6 }} aria-hidden="true" />
                    </button>

                    {profileOpen && (
                        <div className={styles.profileMenu} role="menu">
                            {user ? (
                                <>
                                    <div className={styles.profileInfo}>
                                        <div className={styles.profileName}>{user.name}</div>
                                        <div className={styles.profileRole}>{user.role || 'Guardian'}</div>
                                    </div>
                                    <button className={styles.profileItem} onClick={() => router.push('/guardian')}>Profile</button>
                                    <button className={styles.profileItemDanger} onClick={handleSignOut}>Sign out</button>
                                </>
                            ) : (
                                <>
                                    <div className={styles.profileInfo}>
                                        <div className={styles.profileName}>Not signed in</div>
                                    </div>
                                    <button className={styles.profileItem} onClick={() => router.push('/login')}>Sign in</button>
                                </>
                            )}
                        </div>
                    )}
                </div>
            </div>
        </header>
    );
}
