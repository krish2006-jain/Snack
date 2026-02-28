'use client';

import { AppLayout } from '@/components/ui/AppLayout';
import {
    todaysTasks,
    journalEntries,
    medications,
    caretakerProfile,
} from '@/lib/mock-data/caretaker';
import {
    CheckCircle2, Clock, AlertCircle, Pill, BookOpen,
    Stethoscope, MessageCircle, ChevronRight, TrendingUp,
    Thermometer, Users, Activity,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import styles from './page.module.css';

function SkeletonDash() {
    return (
        <div className={styles.grid} style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: '20px', padding: '20px' }}>
            {[1, 2, 3, 4, 5, 6].map(i => (
                <div key={i} className="card card--flat" style={{ height: '150px' }}>
                    <div style={{ width: '40%', height: '20px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '16px' }} />
                    <div style={{ width: '80%', height: '12px', background: 'var(--bg-subtle)', borderRadius: '4px', marginBottom: '8px' }} />
                    <div style={{ width: '60%', height: '12px', background: 'var(--bg-subtle)', borderRadius: '4px' }} />
                </div>
            ))}
        </div>
    );
}

// --- helpers ---
const getGreeting = () => {
    const h = new Date().getHours();
    if (h < 12) return 'Good morning';
    if (h < 17) return 'Good afternoon';
    return 'Good evening';
};

const moodLabels: Record<number, string> = { 1: 'Very low', 2: 'Low', 3: 'Fair', 4: 'Good', 5: 'Great' };
const moodColors: Record<number, string> = {
    1: 'var(--color-danger)', 2: 'var(--color-warning)',
    3: 'var(--text-muted)', 4: 'var(--color-success)', 5: '#2D7A4F',
};

// Use simple SVG instead of emoji
const MoodIcon = ({ score }: { score: number }) => {
    if (score >= 4) return <Activity size={24} color={moodColors[score]} />;
    if (score === 3) return <TrendingUp size={24} color={moodColors[score]} />;
    return <AlertCircle size={24} color={moodColors[score]} />;
};

export default function CaretakerDashboard() {
    const [loaded, setLoaded] = useState(false);
    const [userName, setUserName] = useState('Anita');

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 700);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        const stored = localStorage.getItem('saathi_user');
        if (stored) {
            try {
                const u = JSON.parse(stored);
                const fullName = u.name || u;
                setUserName(fullName.split(' ')[0]);
            } catch {
                // if parse fails, use caretaker profile default
                setUserName(caretakerProfile.firstName);
            }
        } else {
            // if no localStorage, use caretaker profile default
            setUserName(caretakerProfile.firstName);
        }
    }, []);

    const completedTasks = todaysTasks.filter(t => t.status === 'completed').length;
    const overdueTasks = todaysTasks.filter(t => t.status === 'overdue');
    const totalTasks = todaysTasks.length;

    const medsGivenToday = medications.filter(m => m.administeredToday.every(Boolean)).length;
    const todayEntry = journalEntries[0];

    const ringPct = Math.round((completedTasks / totalTasks) * 100) || 0;
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference - (ringPct / 100) * circumference;

    const recentTasks = todaysTasks.slice(0, 4);

    return (
        <AppLayout role="caretaker" userName={userName} alertCount={1}>
            <div className={styles.page}>

                {/* ── Greeting ────────────────────────────────────────── */}
                <div className={styles.greetingRow}>
                    <div>
                        <h1 className={styles.greetingTitle}>
                            {getGreeting()}, {userName}
                        </h1>
                        <p className={styles.shiftInfo}>
                            <Clock size={16} />
                            Shift: {caretakerProfile.shift}
                        </p>
                    </div>
                </div>

                {!loaded ? <SkeletonDash /> : (
                    <>
                        {/* ── Quick Stats Row ──────────────────────────────────── */}
                        <div className={styles.statsGrid}>

                            {/* Tasks Ring */}
                            <div className={`${styles.statCard} card card--flat`}>
                                <div className={styles.ringWrapper}>
                                    <svg width={80} height={80} viewBox="0 0 88 88">
                                        <circle cx="44" cy="44" r="36" className={styles.ringCircleBg} />
                                        <circle
                                            cx="44" cy="44" r="36"
                                            className={styles.ringCircleProgress}
                                            strokeDasharray={circumference}
                                            strokeDashoffset={strokeDashoffset}
                                            transform="rotate(-90 44 44)"
                                        />
                                        <text x="44" y="44" textAnchor="middle" dominantBaseline="central" className={styles.ringText}>
                                            <AnimatedNumber value={ringPct} suffix="%" />
                                        </text>
                                    </svg>
                                </div>
                                <div>
                                    <p className={styles.statValue}><AnimatedNumber value={completedTasks} />/{totalTasks}</p>
                                    <p className={styles.statLabel}>Tasks done</p>
                                </div>
                            </div>

                            {/* Medications */}
                            <div className={`${styles.statCard} card card--flat`}>
                                <div className={`${styles.iconWrapper} ${styles.iconWrapperSuccess}`}>
                                    <Pill size={24} color="var(--color-success)" />
                                </div>
                                <div>
                                    <p className={styles.statValue}><AnimatedNumber value={medsGivenToday} />/{medications.length}</p>
                                    <p className={styles.statLabel}>Meds given</p>
                                </div>
                            </div>

                            {/* Today's Mood */}
                            <div className={`${styles.statCard} card card--flat`}>
                                <div className={`${styles.iconWrapper} ${styles.iconWrapperMood}`}>
                                    <MoodIcon score={todayEntry.mood} />
                                </div>
                                <div>
                                    <p className={styles.statValue} style={{ color: moodColors[todayEntry.mood] }}>
                                        {moodLabels[todayEntry.mood]}
                                    </p>
                                    <p className={styles.statLabel}>Today&apos;s mood</p>
                                </div>
                            </div>
                        </div>

                        {/* ── Two-col body ─────────────────────────────────────── */}
                        <div className={styles.bodyGrid}>

                            {/* Left: urgent + recent tasks */}
                            <div className={styles.leftCol}>

                                {/* Urgent items */}
                                {overdueTasks.length > 0 && (
                                    <div className="card card--urgent card--padded">
                                        <div className={styles.cardTitleRow}>
                                            <h2 className={styles.cardTitleUrgent}>
                                                <AlertCircle size={20} />
                                                {overdueTasks.length} Overdue {overdueTasks.length === 1 ? 'task' : 'tasks'}
                                            </h2>
                                        </div>
                                        <div className={styles.urgentList}>
                                            {overdueTasks.map(t => (
                                                <div key={t.id} className={styles.urgentItem}>
                                                    <div>
                                                        <p className={styles.urgentItemTitle}>{t.title}</p>
                                                        <p className={styles.urgentItemTime}>Was due at {t.time}</p>
                                                    </div>
                                                    <Link href="/caretaker/schedule" className="btn btn--danger btn--sm btn--pill">
                                                        Mark done
                                                    </Link>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent tasks preview */}
                                <div className="card card--flat card--padded">
                                    <div className={styles.cardTitleRow}>
                                        <h2 className={styles.cardTitle}>Today&apos;s Schedule</h2>
                                        <Link href="/caretaker/schedule" className={styles.viewAllLink}>
                                            View all <ChevronRight size={16} />
                                        </Link>
                                    </div>
                                    <div className={styles.recentList}>
                                        {recentTasks.map(t => {
                                            const isDone = t.status === 'completed';
                                            const isOverdue = t.status === 'overdue';
                                            const itemClass = isDone
                                                ? styles.recentItemDone
                                                : isOverdue ? styles.recentItemOverdue
                                                    : styles.recentItemPending;

                                            const titleClass = isDone
                                                ? styles.recentItemTitleDone
                                                : styles.recentItemTitlePending;

                                            const iconColor = isDone
                                                ? 'var(--color-success)'
                                                : isOverdue ? 'var(--color-danger)'
                                                    : 'var(--text-muted)';

                                            return (
                                                <div key={t.id} className={`${styles.recentItem} ${itemClass}`}>
                                                    <CheckCircle2 size={20} color={iconColor} />
                                                    <div style={{ flex: 1 }}>
                                                        <p className={`${styles.recentItemTitle} ${titleClass}`}>
                                                            {t.title}
                                                        </p>
                                                        <p className={styles.recentItemTime}>{t.time}</p>
                                                    </div>
                                                    <CategoryBadge cat={t.category} />
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>

                                {/* Today's journal quick view */}
                                {todayEntry && (
                                    <div className="card card--gradient card--padded">
                                        <div className={styles.cardTitleRow}>
                                            <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={20} color="var(--color-primary)" />
                                                Today&apos;s shift journal
                                            </h2>
                                            <Link href="/caretaker/journal" className={styles.viewAllLink}>Edit</Link>
                                        </div>
                                        <p className={styles.journalPreview}>
                                            {todayEntry.notes}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {/* Right: quick actions + next tasks */}
                            <div className={styles.rightCol}>

                                <div className={`card card--flat ${styles.widgetCard}`}>
                                    <h2 className={styles.widgetTitle}>Quick actions</h2>
                                    <div className={styles.actionStack}>
                                        <Link href="/caretaker/journal" className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start' }}>
                                            <BookOpen size={18} /> Write journal entry
                                        </Link>
                                        <Link href="/caretaker/medications" className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start' }}>
                                            <Pill size={18} /> Log medication
                                        </Link>
                                        <Link href="/caretaker/chat" className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start' }}>
                                            <MessageCircle size={18} /> Message Guardian
                                        </Link>
                                        <Link href="/caretaker/schedule" className="btn btn--primary btn--full" style={{ justifyContent: 'flex-start' }}>
                                            <CheckCircle2 size={18} /> View all tasks
                                        </Link>
                                    </div>
                                </div>

                                {/* Upcoming tasks */}
                                <div className={`card card--flat ${styles.widgetCard}`}>
                                    <h2 className={styles.widgetTitle}>Up next</h2>
                                    <div className={styles.upcomingMiniList}>
                                        {todaysTasks.filter(t => t.status === 'pending').slice(0, 4).map(t => (
                                            <div key={t.id} className={styles.upcomingMiniItem}>
                                                <Clock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <p className={styles.upcomingMiniTitle}>{t.title}</p>
                                                    <p className={styles.upcomingMiniTime}>{t.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {/* Patient snapshot */}
                                <div className={`card ${styles.snapshotCard} ${styles.widgetCard}`}>
                                    <div className={styles.snapshotHeader}>
                                        <div className={styles.snapshotAvatar}>
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className={styles.snapshotName}>Ravi Sharma</p>
                                            <span className="badge badge--primary">Moderate stage</span>
                                        </div>
                                    </div>
                                    <div className={styles.snapshotVitals}>
                                        <InfoRow icon={<Activity size={16} />} label="Mood" value={moodLabels[todayEntry.mood]} />
                                        <InfoRow icon={<Thermometer size={16} />} label="Appetite" value={todayEntry.appetite} />
                                        <InfoRow icon={<TrendingUp size={16} />} label="Sleep" value={todayEntry.sleep} />
                                        <InfoRow icon={<Stethoscope size={16} />} label="BP" value="128/82 mmHg" />
                                    </div>
                                </div>
                            </div>
                        </div>
                    </>
                )}
            </div>
        </AppLayout>
    );
}

function CategoryBadge({ cat }: { cat: string }) {
    const map: Record<string, { label: string; cls: string }> = {
        medication: { label: 'Med', cls: 'badge--info' },
        meal: { label: 'Meal', cls: 'badge--success' },
        activity: { label: 'Activity', cls: 'badge--primary' },
        therapy: { label: 'Therapy', cls: 'badge--warning' },
        hygiene: { label: 'Hygiene', cls: 'badge--info' },
        check: { label: 'Check', cls: 'badge--danger' },
        rest: { label: 'Rest', cls: 'badge--success' },
    };
    const b = map[cat] ?? { label: cat, cls: 'badge--primary' };
    return <span className={`badge ${b.cls}`}>{b.label}</span>;
}

function InfoRow({ icon, label, value }: { icon: React.ReactNode; label: string; value: string }) {
    return (
        <div className={styles.vitalRow}>
            <span className={styles.vitalLabel}>
                {icon} {label}
            </span>
            <span className={styles.vitalValue}>{value}</span>
        </div>
    );
}
