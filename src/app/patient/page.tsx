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
    Gamepad2,
    Home,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useSession } from '@/lib/useSession';
import { apiFetch } from '@/lib/api';
import styles from './home.module.css';
import { mockSchedule } from '@/lib/mock-data/patient';

function SkeletonDash() {
    return (
        <div style={{ padding: '24px', display: 'flex', flexDirection: 'column', gap: '20px' }}>
            <div style={{ width: '60%', height: '40px', background: 'var(--bg-subtle)', borderRadius: '8px' }} />
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(200px, 1fr))', gap: '16px' }}>
                {[1, 2, 3, 4].map(i => (
                    <div key={i} style={{ height: '140px', background: 'var(--bg-subtle)', borderRadius: '12px' }} />
                ))}
            </div>
            <div style={{ width: '100%', height: '100px', background: 'var(--bg-subtle)', borderRadius: '12px' }} />
        </div>
    );
}

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
    const { user, isDemo } = useSession();
    const userName = user?.name?.split(' ')[0] || 'Patient';

    const [time, setTime] = useState(formatTime());
    const [medTaken, setMedTaken] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const todayDate = formatDate();

    useEffect(() => { const t = setTimeout(() => setLoaded(true), 700); return () => clearTimeout(t); }, []);
    useEffect(() => {
        const interval = setInterval(() => setTime(formatTime()), 30000);
        return () => clearInterval(interval);
    }, []);

    interface ScheduleTaskAPI {
        id: string;
        title: string;
        scheduled_time: string;
        category: string;
        is_completed: number;
    }
    const [apiTasks, setApiTasks] = useState<ScheduleTaskAPI[]>([]);

    useEffect(() => {
        apiFetch<{ tasks: ScheduleTaskAPI[] }>('/api/schedule')
            .then((data) => setApiTasks(data.tasks || []))
            .catch(() => { /* fallback to mock */ });
    }, []);

    // Use API data if available, mock data as fallback
    const hasApiData = apiTasks.length > 0;
    const pendingTasks = hasApiData
        ? apiTasks.filter(t => !t.is_completed).length
        : mockSchedule.filter((t) => t.status !== 'done').length;
    const completedTasks = hasApiData
        ? apiTasks.filter(t => t.is_completed).length
        : mockSchedule.filter(t => t.status === 'done').length;
    const totalTasks = hasApiData ? apiTasks.length : mockSchedule.length;
    const upcomingTasks = hasApiData
        ? apiTasks.filter(t => !t.is_completed).slice(0, 3).map(t => ({ id: t.id, title: t.title, time: t.scheduled_time, status: 'upcoming' }))
        : mockSchedule.filter((t) => t.status === 'upcoming').slice(0, 3);

    return (
        <div className={`${styles.page} patient-page-enter`}>
            {/* Gradient header area */}
            <div className={styles.heroArea}>
                <div className={styles.heroContent}>
                    <p className={styles.dateLabel}>{todayDate}</p>
                    <h1 className={styles.greeting}>
                        {getGreeting()}, {userName}
                    </h1>
                    <p className={styles.timeLabel}>{time}</p>
                </div>
            </div>

            {!loaded ? <SkeletonDash /> : (
                <>
                    {/* Quick action grid — asymmetric layout */}
                    <section className={styles.section}>
                        <div className={styles.quickGrid}>
                            {/* Featured — Schedule */}
                            <Link href="/patient/schedule" className={`${styles.quickCard} ${styles.quickCardFeatured} card-enter`} style={{ animationDelay: '0ms' }}>
                                <div className={styles.quickCardTop}>
                                    <Calendar size={44} color="var(--color-primary)" aria-hidden="true" />
                                    <span className={styles.quickBadge}><AnimatedNumber value={pendingTasks} /> left</span>
                                </div>
                                <h2 className={styles.quickTitle}>Today&apos;s Schedule</h2>
                                <p className={styles.quickSub}><AnimatedNumber value={completedTasks} /> of {totalTasks} tasks done</p>
                                <ChevronRight size={22} className={styles.chevron} />
                            </Link>

                            {/* Memory Time */}
                            <Link href="/patient/memories" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '100ms' }}>
                                <Brain size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>Memory Time</h2>
                                <p className={styles.quickSub}><AnimatedNumber value={hasApiData ? 0 : 14} /> flashcards waiting</p>
                            </Link>

                            {/* My People */}
                            <Link href="/patient/people" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '200ms' }}>
                                <Users size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>My People</h2>
                                <p className={styles.quickSub}><AnimatedNumber value={hasApiData ? 0 : 6} /> people who love you</p>
                            </Link>

                            {/* Talk to Saathi */}
                            <Link href="/patient/companion" className={`${styles.quickCard} ${styles.quickCardCompanion} card-enter`} style={{ animationDelay: '300ms' }}>
                                <MessageCircle size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>Talk to Saathi</h2>
                                <p className={styles.quickSub}>Your AI companion is here</p>
                            </Link>

                            {/* Memory Room */}
                            <Link href="/patient/memory-room" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '400ms' }}>
                                <Home size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>Memory Room</h2>
                                <p className={styles.quickSub}>Explore familiar rooms</p>
                            </Link>

                            {/* Brain Games */}
                            <Link href="/patient/games" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '500ms' }}>
                                <Gamepad2 size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>Brain Games</h2>
                                <p className={styles.quickSub}>Keep your mind active</p>
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
                            {upcomingTasks
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
                </>
            )}
        </div>
    );
}
