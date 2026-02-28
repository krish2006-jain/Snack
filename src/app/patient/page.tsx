'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import {
    Calendar,
    Brain,
    Users,
    MessageCircle,
    CheckCircle,
    Clock,
    Pill,
    ChevronRight,
} from 'lucide-react';
import styles from './home.module.css';
import { mockSchedule } from '@/lib/mock-data/patient';

function getGreeting() {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 17) return 'Good afternoon';
    return 'Good evening';
}

function formatTime() {
    return new Date().toLocaleTimeString('en-IN', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: true,
    });
}

function formatDate() {
    return new Date().toLocaleDateString('en-IN', {
        weekday: 'long',
        day: 'numeric',
        month: 'long',
    });
}

export default function PatientHome() {
    const [time, setTime] = useState(formatTime());
    const [medTaken, setMedTaken] = useState(false);

    useEffect(() => {
        const interval = setInterval(() => setTime(formatTime()), 30000);
        return () => clearInterval(interval);
    }, []);

    const pendingTasks = mockSchedule.filter((t) => t.status !== 'done').length;
    const todayDate = formatDate();

    return (
        <div className={styles.page}>
            {/* Gradient header area */}
            <div className={`${styles.heroArea} page-enter`}>
                <div className={styles.heroContent}>
                    <p className={styles.dateLabel}>{todayDate}</p>
                    <h1 className={styles.greeting}>
                        {getGreeting()}, Ravi
                    </h1>
                    <p className={styles.timeLabel}>{time}</p>
                </div>
            </div>

            {/* Quick action grid — asymmetric layout */}
            <section className={styles.section}>
                <div className={styles.quickGrid}>
                    {/* Featured — Schedule */}
                    <Link href="/patient/schedule" className={`${styles.quickCard} ${styles.quickCardFeatured}`}>
                        <div className={styles.quickCardTop}>
                            <Calendar size={32} color="var(--color-primary)" aria-hidden="true" />
                            <span className={styles.quickBadge}>{pendingTasks} left</span>
                        </div>
                        <h2 className={styles.quickTitle}>Today&apos;s Schedule</h2>
                        <p className={styles.quickSub}>{mockSchedule.filter(t => t.status === 'done').length} of {mockSchedule.length} tasks done</p>
                        <ChevronRight size={20} className={styles.chevron} />
                    </Link>

                    {/* Memory Time */}
                    <Link href="/patient/memories" className={styles.quickCard}>
                        <Brain size={32} color="var(--color-primary)" aria-hidden="true" />
                        <h2 className={styles.quickTitle}>Memory Time</h2>
                        <p className={styles.quickSub}>14 flashcards waiting</p>
                    </Link>

                    {/* My People */}
                    <Link href="/patient/people" className={styles.quickCard}>
                        <Users size={32} color="var(--color-primary)" aria-hidden="true" />
                        <h2 className={styles.quickTitle}>My People</h2>
                        <p className={styles.quickSub}>6 people who love you</p>
                    </Link>

                    {/* Talk to Saathi */}
                    <Link href="/patient/companion" className={`${styles.quickCard} ${styles.quickCardCompanion}`}>
                        <MessageCircle size={32} color="var(--color-primary)" aria-hidden="true" />
                        <h2 className={styles.quickTitle}>Talk to Saathi</h2>
                        <p className={styles.quickSub}>Your AI companion is here</p>
                    </Link>
                </div>
            </section>

            {/* Medication reminder — urgent */}
            {!medTaken && (
                <section className={styles.section}>
                    <div className={`card card--urgent ${styles.medCard}`}>
                        <div className={styles.medHeader}>
                            <div className={styles.medIcon}>
                                <Pill size={26} color="var(--color-danger)" aria-hidden="true" />
                            </div>
                            <div className={styles.medInfo}>
                                <p className={styles.medLabel}>Medication Reminder</p>
                                <h3 className={styles.medTitle}>Time to take Donepezil</h3>
                                <div className={styles.medMeta}>
                                    <Clock size={14} />
                                    <span>10:00 AM — with water after breakfast</span>
                                </div>
                            </div>
                        </div>
                        <button
                            className={`btn btn--success btn--patient ${styles.medBtn}`}
                            onClick={() => setMedTaken(true)}
                            aria-label="Mark Donepezil as taken"
                        >
                            <CheckCircle size={22} />
                            Mark as Taken
                        </button>
                    </div>
                </section>
            )}

            {medTaken && (
                <section className={styles.section}>
                    <div className={`card card--success ${styles.medCard} ${styles.medDone}`}>
                        <CheckCircle size={28} color="var(--color-success)" />
                        <div>
                            <h3 className={styles.medTitle} style={{ color: 'var(--color-success)' }}>
                                Donepezil taken!
                            </h3>
                            <p className={styles.medSub}>Next medication at 8:00 PM</p>
                        </div>
                    </div>
                </section>
            )}

            {/* Today at a glance */}
            <section className={styles.section}>
                <h2 className={styles.sectionTitle}>Coming up today</h2>
                <div className={styles.upcomingList}>
                    {mockSchedule
                        .filter((t) => t.status === 'upcoming')
                        .slice(0, 3)
                        .map((task) => (
                            <div key={task.id} className={styles.upcomingItem}>
                                <div className={styles.upcomingDot} data-status={task.status} />
                                <div className={styles.upcomingInfo}>
                                    <span className={styles.upcomingTitle}>{task.title}</span>
                                    <span className={styles.upcomingTime}>{task.time}</span>
                                </div>
                            </div>
                        ))}
                </div>
                <Link href="/patient/schedule" className={`btn btn--ghost ${styles.viewAllBtn}`}>
                    See full schedule
                    <ChevronRight size={16} />
                </Link>
            </section>
        </div>
    );
}
