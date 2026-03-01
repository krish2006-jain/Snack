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
    Mic,
    BookOpen,
    Radio,
} from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useSession } from '@/lib/useSession';
import { apiFetch } from '@/lib/api';
import styles from './home.module.css';
import { mockSchedule, type ScheduleTask } from '@/lib/mock-data/patient';

/* Category visual config for the upcoming section */
const CATEGORY_CONFIG: Record<string, { color: string; bg: string }> = {
    Medicine: { color: '#B91C1C', bg: '#FEF2F2' },
    Medication: { color: '#B91C1C', bg: '#FEF2F2' },
    Meal: { color: '#B45309', bg: '#FFFBEB' },
    Game: { color: '#6D28D9', bg: '#F5F3FF' },
    Chore: { color: '#0369A1', bg: '#F0F9FF' },
    Therapy: { color: '#065F46', bg: '#ECFDF5' },
    Exercise: { color: '#14532D', bg: '#F0FDF4' },
    Rest: { color: '#1E3A5F', bg: '#EFF6FF' },
    Social: { color: '#9D174D', bg: '#FDF2F8' },
};

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

interface ScheduleTaskAPI {
    id: string;
    title: string;
    scheduled_time: string;
    category: string;
    is_completed: number;
}

interface ApiMedication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    time_of_day: string;
    instructions?: string;
}

export default function PatientHome() {
    const { user, isDemo } = useSession();
    const userName = user?.name?.split(' ')[0] || 'Patient';

    const [time, setTime] = useState(formatTime());
    const [medTaken, setMedTaken] = useState(false);
    const [loaded, setLoaded] = useState(false);
    const todayDate = formatDate();

    const [apiTasks, setApiTasks] = useState<ScheduleTaskAPI[]>([]);
    const [apiMedications, setApiMedications] = useState<ApiMedication[]>([]);
    const [peopleCount, setPeopleCount] = useState<number>(0);

    useEffect(() => { const t = setTimeout(() => setLoaded(true), 700); return () => clearTimeout(t); }, []);
    useEffect(() => {
        const interval = setInterval(() => setTime(formatTime()), 30000);
        return () => clearInterval(interval);
    }, []);

    useEffect(() => {
        apiFetch<{ tasks: ScheduleTaskAPI[] }>('/api/schedule')
            .then((data) => setApiTasks(data.tasks || []))
            .catch(() => { });

        if (!isDemo) {
            apiFetch<{ medications: ApiMedication[] }>('/api/medications')
                .then(d => setApiMedications(d.medications || []))
                .catch(() => { });
            apiFetch<{ people: unknown[] }>('/api/people')
                .then(d => setPeopleCount((d.people || []).length))
                .catch(() => { });
        }
    }, [isDemo]);

    // ── Schedule data ────────────────────────────────────────────────────────
    const hasApiData = apiTasks.length > 0 && !isDemo;
    const pendingTasks = hasApiData
        ? apiTasks.filter(t => !t.is_completed).length
        : mockSchedule.filter((t) => t.status !== 'done').length;
    const completedTasks = hasApiData
        ? apiTasks.filter(t => t.is_completed).length
        : mockSchedule.filter(t => t.status === 'done').length;
    const totalTasks = hasApiData ? apiTasks.length : mockSchedule.length;
    const upcomingTasks = hasApiData
        ? apiTasks.filter(t => !t.is_completed).slice(0, 3).map(t => ({ id: t.id, title: t.title, time: t.scheduled_time, status: 'upcoming', category: t.category }))
        : mockSchedule.filter((t) => t.status === 'upcoming').slice(0, 3);

    // ── Medication reminder ─────────────────────────────────────────────────
    // For demo: show first medicine from mock schedule
    // For real: show first active medication from API that hasn't been taken today
    const demoFirstMed = mockSchedule.find(t => t.category === 'Medicine' || t.category === 'Medication');
    const apiFirstMed = apiMedications.length > 0 ? apiMedications[0] : null;

    const medName = isDemo
        ? 'Donepezil 10mg'
        : apiFirstMed
            ? `${apiFirstMed.name} ${apiFirstMed.dosage}`
            : null;
    const medTime = isDemo
        ? (demoFirstMed?.time ?? '8:30 AM')
        : apiFirstMed?.time_of_day ?? '';
    const medNote = isDemo
        ? 'with water after breakfast'
        : apiFirstMed?.instructions ?? '';

    const resolvedPeopleCount = isDemo ? 6 : peopleCount;

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
                    {/* Quick action grid */}
                    <section className={styles.section}>
                        <div className={styles.quickGrid}>

                            {/* Featured - Schedule */}
                            <Link href="/patient/schedule" className={`${styles.quickCard} ${styles.quickCardFeatured} card-enter`} style={{ animationDelay: '0ms' }} data-tooltip="View and manage all of today's tasks and appointments">
                                <div className={styles.quickCardTop}>
                                    <Calendar size={44} color="var(--color-primary)" aria-hidden="true" />
                                    <span className={styles.quickBadge}><AnimatedNumber value={pendingTasks} /> left</span>
                                </div>
                                <h2 className={styles.quickTitle}>Today&apos;s Schedule</h2>
                                <p className={styles.quickSub}><AnimatedNumber value={completedTasks} /> of {totalTasks} tasks done</p>
                                <ChevronRight size={22} className={styles.chevron} />
                            </Link>

                            {/* Memory Time + Memory Room - split half-block */}
                            <div className={styles.splitCardRow}>
                                <Link href="/patient/memories" className={`${styles.quickCard} ${styles.quickCardSplit} card-enter`} style={{ animationDelay: '100ms' }} data-tooltip="Practice memory recall with AI-guided photo flashcards">
                                    <Brain size={32} color="var(--color-primary)" aria-hidden="true" />
                                    <div>
                                        <h2 className={styles.quickTitleSmall}>Memory Time</h2>
                                        <p className={styles.quickSub}>Flashcards</p>
                                    </div>
                                </Link>
                                <Link href="/patient/memory-room" className={`${styles.quickCard} ${styles.quickCardSplit} card-enter`} style={{ animationDelay: '150ms' }} data-tooltip="Explore familiar virtual spaces connected to your memories">
                                    <Home size={32} color="var(--color-primary)" aria-hidden="true" />
                                    <div>
                                        <h2 className={styles.quickTitleSmall}>Memory Room</h2>
                                        <p className={styles.quickSub}>Familiar spaces</p>
                                    </div>
                                </Link>
                            </div>

                            {/* My People */}
                            <Link href="/patient/people" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '200ms' }} data-tooltip="See the family and friends who are part of your care network">
                                <Users size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>My People</h2>
                                <p className={styles.quickSub}><AnimatedNumber value={resolvedPeopleCount} /> people who love you</p>
                            </Link>

                            {/* Saathi - split block */}
                            <div className={styles.splitCardRow}>
                                <Link href="/patient/companion" className={`${styles.quickCard} ${styles.quickCardSplit} ${styles.quickCardCompanion} card-enter`} style={{ animationDelay: '300ms' }} data-tooltip="Have a real-time voice conversation with your AI memory companion">
                                    <Mic size={32} color="var(--color-primary)" aria-hidden="true" />
                                    <div>
                                        <h2 className={styles.quickTitleSmall}>Talk to Saathi</h2>
                                        <p className={styles.quickSub}>Voice</p>
                                    </div>
                                </Link>
                                <Link href="/patient/chat" className={`${styles.quickCard} ${styles.quickCardSplit} ${styles.quickCardCompanion} card-enter`} style={{ animationDelay: '350ms' }} data-tooltip="Text chat with Saathi for emotional support and memory exercises">
                                    <MessageCircle size={32} color="var(--color-primary)" aria-hidden="true" />
                                    <div>
                                        <h2 className={styles.quickTitleSmall}>Chat with Saathi</h2>
                                        <p className={styles.quickSub}>Text</p>
                                    </div>
                                </Link>
                            </div>

                            {/* Brain Games */}
                            <Link href="/patient/games" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '400ms' }} data-tooltip="Play cognitive games designed to keep your mind sharp and active">
                                <Gamepad2 size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>Brain Games</h2>
                                <p className={styles.quickSub}>Keep your mind active</p>
                            </Link>

                            {/* Nostalgia Radio */}
                            <Link href="/patient/radio" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '450ms' }} data-tooltip="Listen to favorite songs from the past">
                                <Radio size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>Nostalgia Radio</h2>
                                <p className={styles.quickSub}>Music from the past</p>
                            </Link>

                            {/* Stories */}
                            <Link href="/patient/stories" className={`${styles.quickCard} card-enter`} style={{ animationDelay: '500ms' }} data-tooltip="Read your personal journal and heartfelt messages from family">
                                <BookOpen size={44} color="var(--color-primary)" aria-hidden="true" />
                                <h2 className={styles.quickTitle}>Stories</h2>
                                <p className={styles.quickSub}>Your journal and family messages</p>
                            </Link>
                        </div>
                    </section>

                    {/* Medication reminder - only show if there's a med to remind about */}
                    {!medTaken && medName && (
                        <section className={styles.section}>
                            <div className={`card card--urgent ${styles.medCard}`}>
                                <div className={styles.medHeader}>
                                    <div className={styles.medIcon}>
                                        <Pill size={26} color="var(--color-danger)" aria-hidden="true" />
                                    </div>
                                    <div className={styles.medInfo}>
                                        <p className={styles.medLabel}>Medication Reminder</p>
                                        <h3 className={styles.medTitle}>Time to take {medName}</h3>
                                        <div className={styles.medMeta}>
                                            <Clock size={14} />
                                            <span>{medTime}{medNote ? ` - ${medNote}` : ''}</span>
                                        </div>
                                    </div>
                                </div>
                                <button
                                    className={`btn btn--success btn--patient ${styles.medBtn}`}
                                    onClick={() => setMedTaken(true)}
                                    aria-label={`Mark ${medName} as taken`}
                                    data-tooltip="Confirm you have taken this medication. Great job staying on track!"
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
                                        {medName ? `${medName} taken!` : 'Medication taken!'}
                                    </h3>
                                    <p className={styles.medSub}>Great job! Check your schedule for next tasks.</p>
                                </div>
                            </div>
                        </section>
                    )}

                    {/* Today at a glance */}
                    <section className={styles.scheduleSection}>
                        <div className={styles.scheduleCard}>
                            <div className={styles.scheduleSectionHeader}>
                                <h2 className={styles.sectionTitle}>Coming up today</h2>
                                <div className={styles.progressBar} role="progressbar" aria-valuenow={completedTasks} aria-valuemax={totalTasks} aria-label={`${completedTasks} of ${totalTasks} tasks done`} data-tooltip={`${completedTasks} of ${totalTasks} tasks completed today`}>
                                    <div className={styles.progressFill} style={{ width: `${totalTasks ? (completedTasks / totalTasks) * 100 : 0}%` }} />
                                </div>
                                <span className={styles.progressLabel}>
                                    <AnimatedNumber value={completedTasks} />/{totalTasks} done
                                </span>
                            </div>
                            <div className={styles.upcomingList}>
                                {upcomingTasks.length === 0 && (
                                    <div className={styles.upcomingEmpty}>
                                        <CheckCircle size={28} color="var(--color-success)" />
                                        <p>All caught up! No upcoming tasks.</p>
                                    </div>
                                )}
                                {(upcomingTasks as ScheduleTask[])
                                    .map((task) => {
                                        const cat = CATEGORY_CONFIG[task.category] || { color: '#374151', bg: '#F9FAFB' };
                                        return (
                                            <div key={task.id} className={styles.upcomingItem}>
                                                <div className={styles.upcomingIconBadge} style={{ background: cat.color }} />
                                                <div className={styles.upcomingInfo}>
                                                    <span className={styles.upcomingTitle}>{task.title}</span>
                                                    <span className={styles.upcomingTime}>{task.time}</span>
                                                </div>
                                                <span className={styles.upcomingCatLabel} style={{ color: cat.color, background: cat.bg }}>
                                                    {task.category}
                                                </span>
                                            </div>
                                        );
                                    })}
                            </div>
                            <Link href="/patient/schedule" className={`btn btn--ghost ${styles.viewAllBtn}`} data-tooltip="Open your full daily schedule with all tasks and times">
                                See full schedule
                                <ChevronRight size={16} />
                            </Link>
                        </div>
                    </section>
                </>
            )}
        </div>
    );
}
