'use client';

import { AppLayout } from '@/components/ui/AppLayout';

import {
    CheckCircle2, Clock, AlertCircle, Pill, BookOpen,
    Stethoscope, ChevronRight, TrendingUp,
    Thermometer, Users, Activity,
} from 'lucide-react';
import { useState, useEffect } from 'react';
import Link from 'next/link';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useSession } from '@/lib/useSession';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';
import { todaysTasks, journalEntries, type JournalEntry, medications as mockMedications } from '@/lib/mock-data/caretaker';

// ─── Types ─────────────────────────────────────────────────────────────────

interface ScheduleTask {
    id: string;
    title: string;
    scheduled_time: string;
    category: string;
    is_completed: number;
}

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    time_of_day: string;
}

interface MedLog {
    medication_id: string;
    administered_at: number;
}

// ─── Helpers ───────────────────────────────────────────────────────────────

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

const MoodIcon = ({ score }: { score: number }) => {
    if (score >= 4) return <Activity size={24} color={moodColors[score]} />;
    if (score === 3) return <TrendingUp size={24} color={moodColors[score]} />;
    return <AlertCircle size={24} color={moodColors[score]} />;
};

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
            <span className={styles.vitalLabel}>{icon} {label}</span>
            <span className={styles.vitalValue}>{value}</span>
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function CaretakerDashboard() {
    const [loaded, setLoaded] = useState(false);
    const { user, isDemo } = useSession();
    const userName = user?.name?.split(' ')[0] || 'Caregiver';
    const patientName = user?.patientName || 'Your Patient';

    const [apiTasks, setApiTasks] = useState<ScheduleTask[]>([]);
    const [apiMeds, setApiMeds] = useState<Medication[]>([]);
    const [medLogs, setMedLogs] = useState<MedLog[]>([]);
    // null = loading, undefined = no entry exists, JournalEntry = loaded
    const [apiJournalEntry, setApiJournalEntry] = useState<JournalEntry | null | undefined>(null);

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 700);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (isDemo) return;
        apiFetch<{ tasks: ScheduleTask[] }>('/api/schedule')
            .then(d => setApiTasks(d.tasks || []))
            .catch(() => { });
        apiFetch<{ medications: Medication[]; todayLogs: MedLog[] }>('/api/medications')
            .then(d => { setApiMeds(d.medications || []); setMedLogs(d.todayLogs || []); })
            .catch(() => { });
        // Fetch most recent journal entry for Patient Snapshot widget
        const rawToken = typeof window !== 'undefined' ? localStorage.getItem('saathi_token') : '';
        fetch('/api/journal', { headers: { 'Authorization': `Bearer ${rawToken || ''}` } })
            .then(r => r.json())
            .then((data: { entries?: Array<{ id: string; mood_score: number; appetite: string; sleep_quality: string; incidents: string; notes: string; date: string }> }) => {
                if (data.entries && data.entries.length > 0) {
                    const e = data.entries[0];
                    setApiJournalEntry({
                        id: e.id,
                        date: e.date,
                        mood: (Math.min(5, Math.max(1, e.mood_score || 3))) as 1 | 2 | 3 | 4 | 5,
                        appetite: (e.appetite || 'fair') as 'poor' | 'fair' | 'good' | 'excellent',
                        sleep: (e.sleep_quality || 'fair') as 'poor' | 'fair' | 'good' | 'excellent',
                        incidents: e.incidents || '',
                        notes: e.notes || '',
                        caretakerId: '',
                    });
                } else {
                    setApiJournalEntry(undefined);
                }
            })
            .catch(() => setApiJournalEntry(undefined));
    }, [isDemo]);

    // ── Resolve data ──────────────────────────────────────────────────────
    const useMock = isDemo || apiTasks.length === 0;

    // Tasks - kept in state so marking done updates the UI instantly
    type ResolvedTask = { id: string; title: string; time: string; category: string; status: 'completed' | 'pending' | 'overdue' };

    const [resolvedTasks, setResolvedTasks] = useState<ResolvedTask[]>([]);

    // Sync resolved tasks when source data genuinely changes (initial load or API response)
    useEffect(() => {
        const tasks: ResolvedTask[] = useMock
            ? todaysTasks.map(t => ({ id: t.id, title: t.title, time: t.time, category: t.category, status: t.status as 'completed' | 'pending' | 'overdue' }))
            : apiTasks.map(t => ({ id: t.id, title: t.title, time: t.scheduled_time, category: t.category, status: t.is_completed ? 'completed' : 'pending' }));
        setResolvedTasks(tasks);
    }, [useMock, apiTasks.length]); // only re-run when data source switches or API data count changes

    const markTaskDone = async (taskId: string) => {
        // Optimistically update UI
        setResolvedTasks(prev => prev.map(t =>
            t.id === taskId ? { ...t, status: 'completed' as const } : t
        ));
        // If using real API, persist
        if (!useMock) {
            try {
                await apiFetch('/api/schedule', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ taskId, completed: true }),
                });
            } catch {
                // Revert on failure
                setResolvedTasks(prev => prev.map(t =>
                    t.id === taskId ? { ...t, status: 'overdue' as const } : t
                ));
            }
        }
    };

    const completedTasks = resolvedTasks.filter(t => t.status === 'completed').length;
    const overdueTasks = resolvedTasks.filter(t => t.status === 'overdue');
    const totalTasks = resolvedTasks.length;
    const recentTasks = resolvedTasks.slice(0, 4);

    const ringPct = Math.round((completedTasks / (totalTasks || 1)) * 100) || 0;
    const circumference = 2 * Math.PI * 36;
    const strokeDashoffset = circumference - (ringPct / 100) * circumference;

    // Medications
    const resolvedMeds = isDemo ? mockMedications : apiMeds;
    const medsGivenToday = isDemo
        ? mockMedications.filter(m => m.administeredToday.every(Boolean)).length
        : medLogs.length;

    // Journal / mood: demo uses mock journalEntries[0], real users use API response
    const todayEntry: JournalEntry | undefined = isDemo
        ? journalEntries[0]
        : (apiJournalEntry ?? undefined);

    return (
        <AppLayout role="caretaker" userName={userName} alertCount={overdueTasks.length}>
            <div className={styles.page}>

                {/* ── Greeting ────────────────────────────────────────────── */}
                <div className={styles.greetingRow}>
                    <div>
                        <h1 className={styles.greetingTitle}>
                            {getGreeting()}, {userName}
                        </h1>
                        <p className={styles.shiftInfo}>
                            <Clock size={16} />
                            Your current shift
                        </p>
                    </div>
                </div>

                {!loaded ? <SkeletonDash /> : (
                    <>
                        {/* ── Quick Stats Row ──────────────────────────────────── */}
                        <div className={styles.statsGrid}>

                            {/* Tasks Ring */}
                            <div className={`${styles.statCard} card card--flat`} data-tooltip="Percentage of today's care tasks that have been completed this shift">
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
                            <div className={`${styles.statCard} card card--flat`} data-tooltip="Number of medications administered today versus total prescribed for the patient">
                                <div className={`${styles.iconWrapper} ${styles.iconWrapperSuccess}`}>
                                    <Pill size={24} color="var(--color-success)" />
                                </div>
                                <div>
                                    <p className={styles.statValue}><AnimatedNumber value={medsGivenToday} />/{resolvedMeds.length}</p>
                                    <p className={styles.statLabel}>Meds given</p>
                                </div>
                            </div>

                            {/* Today's Mood */}
                            <div className={`${styles.statCard} card card--flat`} data-tooltip="Patient's assessed mood for today based on journal observations">
                                <div className={`${styles.iconWrapper} ${styles.iconWrapperMood}`}>
                                    <MoodIcon score={todayEntry?.mood ?? 3} />
                                </div>
                                <div>
                                    <p className={styles.statValue} style={{ color: moodColors[todayEntry?.mood ?? 3] }}>
                                        {todayEntry ? moodLabels[todayEntry.mood] : '-'}
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
                                                    <button type="button" onClick={() => markTaskDone(t.id)} className="btn btn--danger btn--sm btn--pill" data-tooltip="Mark this overdue task as completed now">
                                                        Mark done
                                                    </button>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Recent tasks preview */}
                                <div className="card card--flat card--padded" data-tooltip="Overview of today's scheduled care tasks and their completion status">
                                    <div className={styles.cardTitleRow}>
                                        <h2 className={styles.cardTitle}>Today&apos;s Schedule</h2>
                                        <Link href="/caretaker/schedule" className={styles.viewAllLink} data-tooltip="Open the full care schedule for today">
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
                                                : isOverdue ? 'var(--color-danger)' : 'var(--text-muted)';
                                            return (
                                                <div key={t.id} className={`${styles.recentItem} ${itemClass}`}>
                                                    <CheckCircle2 size={20} color={iconColor} />
                                                    <div style={{ flex: 1 }}>
                                                        <p className={`${styles.recentItemTitle} ${titleClass}`}>{t.title}</p>
                                                        <p className={styles.recentItemTime}>{t.time}</p>
                                                    </div>
                                                    <CategoryBadge cat={t.category} />
                                                </div>
                                            );
                                        })}
                                        {recentTasks.length === 0 && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', padding: '8px 0' }}>No tasks scheduled for today.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Today's journal quick view */}
                                {todayEntry ? (
                                    <div className="card card--gradient card--padded" data-tooltip="Today's shift journal - quick observations about the patient's condition">
                                        <div className={styles.cardTitleRow}>
                                            <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={20} color="var(--color-primary)" />
                                                Today&apos;s shift journal
                                            </h2>
                                            <Link href="/caretaker/journal" className={styles.viewAllLink} data-tooltip="Edit or add to today's shift journal entry">Edit</Link>
                                        </div>
                                        <p className={styles.journalPreview}>{todayEntry.notes || 'No notes yet.'}</p>
                                    </div>
                                ) : !isDemo && apiJournalEntry === undefined ? (
                                    <div className="card card--flat card--padded" data-tooltip="No journal entry has been created for today's shift yet.">
                                        <div className={styles.cardTitleRow}>
                                            <h2 className={styles.cardTitle} style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                                                <BookOpen size={20} color="var(--color-primary)" />
                                                Shift journal
                                            </h2>
                                            <Link href="/caretaker/journal" className={styles.viewAllLink} data-tooltip="Add a new journal entry for today's shift">Add entry</Link>
                                        </div>
                                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: 8 }}>No journal entries yet. Tap &ldquo;Add entry&rdquo; to write today&apos;s notes.</p>
                                    </div>
                                ) : null}
                            </div>

                            {/* Right: quick actions + next tasks */}
                            <div className={styles.rightCol}>

                                <div className={`card card--flat ${styles.widgetCard}`}>
                                    <h2 className={styles.widgetTitle}>Quick actions</h2>
                                    <div className={styles.actionStack}>
                                        <Link href="/caretaker/journal" className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start' }} data-tooltip="Write observations about the patient's condition, mood, and behaviour during your shift">
                                            <BookOpen size={18} /> Write journal entry
                                        </Link>
                                        <Link href="/caretaker/medications" className="btn btn--secondary btn--full" style={{ justifyContent: 'flex-start' }} data-tooltip="Record that a medication has been administered to the patient">
                                            <Pill size={18} /> Log medication
                                        </Link>

                                        <Link href="/caretaker/schedule" className="btn btn--primary btn--full" style={{ justifyContent: 'flex-start' }} data-tooltip="View and manage the full care task schedule">
                                            <CheckCircle2 size={18} /> View all tasks
                                        </Link>
                                    </div>
                                </div>

                                {/* Upcoming tasks */}
                                <div className={`card card--flat ${styles.widgetCard}`}>
                                    <h2 className={styles.widgetTitle}>Up next</h2>
                                    <div className={styles.upcomingMiniList}>
                                        {resolvedTasks.filter(t => t.status === 'pending').slice(0, 4).map(t => (
                                            <div key={t.id} className={styles.upcomingMiniItem}>
                                                <Clock size={16} color="var(--text-muted)" style={{ flexShrink: 0 }} />
                                                <div style={{ flex: 1 }}>
                                                    <p className={styles.upcomingMiniTitle}>{t.title}</p>
                                                    <p className={styles.upcomingMiniTime}>{t.time}</p>
                                                </div>
                                            </div>
                                        ))}
                                        {resolvedTasks.filter(t => t.status === 'pending').length === 0 && (
                                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem' }}>No pending tasks.</p>
                                        )}
                                    </div>
                                </div>

                                {/* Patient snapshot - name from session */}
                                <div className={`card ${styles.snapshotCard} ${styles.widgetCard}`} data-tooltip="Quick snapshot of the patient's current wellbeing key indicators">
                                    <div className={styles.snapshotHeader}>
                                        <div className={styles.snapshotAvatar}>
                                            <Users size={20} />
                                        </div>
                                        <div>
                                            <p className={styles.snapshotName}>{patientName}</p>
                                            <span className="badge badge--primary" data-tooltip="This patient is currently under active care">Active Patient</span>
                                        </div>
                                    </div>
                                    <div className={styles.snapshotVitals}>
                                        <InfoRow icon={<Activity size={16} />} label="Mood" value={todayEntry ? moodLabels[todayEntry.mood] : '-'} />
                                        <InfoRow icon={<Thermometer size={16} />} label="Appetite" value={todayEntry ? todayEntry.appetite : '-'} />
                                        <InfoRow icon={<TrendingUp size={16} />} label="Sleep" value={todayEntry ? todayEntry.sleep : '-'} />
                                        <InfoRow icon={<Stethoscope size={16} />} label="Tasks" value={`${completedTasks}/${totalTasks} done`} />
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
