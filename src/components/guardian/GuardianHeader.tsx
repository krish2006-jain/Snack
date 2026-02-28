'use client';

import { Bell, Search } from 'lucide-react';
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
                <div className={styles.avatar} aria-label="Priya Sharma">PS</div>
            </div>
        </header>
    );
}
