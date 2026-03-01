'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import {
    Brain, Calendar, Smile, Zap, Gamepad2, QrCode,
    AlertTriangle, ChevronRight, TrendingUp, CheckCircle2
} from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useSession } from '@/lib/useSession';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

// ─── Types ────────────────────────────────────────────────────────────────────

interface ScheduleTask {
    id: string;
    title: string;
    scheduled_time: string;
    category: string;
    is_completed: number;
    description?: string;
}

interface Alert {
    id: string;
    alert_type: string;
    severity: string;
    message: string;
    is_read: number;
    created_at: number;
}

interface AnalyticsData {
    cognitiveScore: number;
    careStage: string;
    cognitiveScoreTrend: { date: string; score: number }[];
    recallAccuracy: number;
    moodDistribution: { mood: string; count: number }[];
    gameStreak: number;
    avgDailyGameScore: number;
    scheduleCompletion: { total: number; completed: number };
}

// ─── Mock fallback analytics (demo accounts) ───────────────────────────────
import { mockAnalytics, mockAlerts, mockSchedule, mockGameScores, type Alert as MockAlert, type GameScore, type QRScan, mockQRScans } from '@/lib/mock-data';

// ─── Sub-components ────────────────────────────────────────────────────────

function CognitiveTrendChart({ scores }: { scores: { date: string; score: number }[] }) {
    if (!scores || scores.length < 2) return null;
    const max = 100, min = 50, range = max - min;
    const w = 220, h = 64;
    const points = scores.map((d, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((d.score - min) / range) * h;
        return `${x},${y}`;
    });
    const pathD = `M ${points.join(' L ')}`;
    const areaD = `M 0,${h} L ${points.join(' L ')} L ${w},${h} Z`;
    return (
        <svg viewBox={`0 0 ${w} ${h}`} className={styles.trendChart} aria-label="Cognitive score trend">
            <defs>
                <linearGradient id="cog-grad" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor="#7C3AED" stopOpacity="0.25" />
                    <stop offset="100%" stopColor="#7C3AED" stopOpacity="0.02" />
                </linearGradient>
            </defs>
            <path d={areaD} fill="url(#cog-grad)" />
            <path d={pathD} stroke="#7C3AED" strokeWidth="2.5" fill="none" strokeLinecap="round" strokeLinejoin="round" />
            {scores.map((d, i) => {
                const x = (i / (scores.length - 1)) * w;
                const y = h - ((d.score - min) / range) * h;
                return <circle key={i} cx={x} cy={y} r="3.5" fill="#7C3AED" />;
            })}
        </svg>
    );
}

function MoodBadge({ distribution }: { distribution: { mood: string; count: number }[] }) {
    const moodColor: Record<string, string> = { happy: '#22C55E', calm: '#3B82F6', neutral: '#F59E0B', anxious: '#F59E0B', agitated: '#EF4444', sad: '#EF4444' };
    const moodEmoji: Record<string, string> = { happy: '😊', calm: '😌', neutral: '😐', anxious: '😟', agitated: '😤', sad: '😢' };
    // Most frequent mood
    const top = distribution.reduce((a, b) => (a.count >= b.count ? a : b), { mood: 'calm', count: 0 });
    return (
        <div className={styles.moodMain}>
            <span className={styles.moodEmoji} role="img" aria-label={top.mood}>{moodEmoji[top.mood] ?? '😌'}</span>
            <span className={styles.moodWord} style={{ color: moodColor[top.mood] }}>{top.mood.charAt(0).toUpperCase() + top.mood.slice(1)}</span>
        </div>
    );
}

function SkeletonDash() {
    return (
        <div className={styles.grid}>
            {[1, 2, 3, 4, 5, 6, 7].map(i => (
                <div key={i} className={styles.card} style={i === 1 ? { gridColumn: '1/2', gridRow: '1/3' } : {}}>
                    <div className={styles.skH} />
                    <div className={styles.skHsm} />
                    <div className={styles.skBar} />
                </div>
            ))}
        </div>
    );
}

// ─── Main Component ────────────────────────────────────────────────────────

export default function GuardianDashboard() {
    const { user, isDemo } = useSession();
    const guardianName = user?.name?.split(' ')[0] || 'there';
    const patientName = user?.patientName?.split(' ')[0] || 'your loved one';

    const [loaded, setLoaded] = useState(false);
    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [schedule, setSchedule] = useState<ScheduleTask[]>([]);
    const [alerts, setAlerts] = useState<Alert[]>([]);
    const [qrCount, setQrCount] = useState<number>(0);

    useEffect(() => {
        const t = setTimeout(() => setLoaded(true), 700);
        return () => clearTimeout(t);
    }, []);

    useEffect(() => {
        if (isDemo) return; // demo uses mock data below

        apiFetch<AnalyticsData>('/api/analytics').then(setAnalytics).catch(() => { });
        apiFetch<{ tasks: ScheduleTask[] }>('/api/schedule').then(d => setSchedule(d.tasks || [])).catch(() => { });
        apiFetch<{ alerts: Alert[] }>('/api/alerts').then(d => setAlerts(d.alerts || [])).catch(() => { });
    }, [isDemo]);

    // ── Resolve data: API for real users, mock for demo ─────────────────────
    const cogScore = isDemo ? 72 : (analytics?.cognitiveScore ?? 0);
    const cogTrend = isDemo ? mockAnalytics.cognitiveScores : (analytics?.cognitiveScoreTrend ?? []);
    const medAdherence = isDemo ? mockAnalytics.medicationAdherence : 0;
    const recallPct = isDemo ? mockAnalytics.averageRecall : (analytics?.recallAccuracy ?? 0);
    const gameStreak = isDemo ? mockAnalytics.gameStreak : (analytics?.gameStreak ?? 0);
    const avgGame = isDemo ? mockAnalytics.avgDailyGameScore : (analytics?.avgDailyGameScore ?? 0);

    // Mood
    const moodDistribution = isDemo
        ? [{ mood: 'calm', count: 5 }]
        : (analytics?.moodDistribution ?? [{ mood: 'calm', count: 1 }]);

    // Schedule
    const resolvedSchedule = isDemo ? mockSchedule.slice(0, 5).map(t => ({
        id: t.id,
        title: t.title,
        scheduled_time: t.time,
        category: t.category,
        is_completed: t.completed ? 1 : 0,
    })) : schedule.slice(0, 5);
    const completedToday = resolvedSchedule.filter(t => t.is_completed).length;

    // Alerts
    const resolvedAlerts = isDemo ? mockAlerts.slice(0, 3) : alerts.slice(0, 3);

    // QR scans — number only
    const resolvedQrCount = isDemo ? mockQRScans.length : qrCount;

    const categoryColors: Record<string, string> = {
        medication: 'var(--color-danger)', exercise: 'var(--color-success)',
        therapy: 'var(--color-primary)', meal: 'var(--color-warning)',
        hygiene: 'var(--color-info)', social: '#EC4899',
        medicine: 'var(--color-danger)',
    };

    const trendDelta = cogTrend.length >= 2
        ? cogTrend[cogTrend.length - 1].score - cogTrend[0].score
        : 0;

    return (
        <div className={styles.page}>
            <GuardianHeader title={`Welcome back, ${guardianName}`} />
            <main className={styles.content}>
                {!loaded ? <SkeletonDash /> : (
                    <>
                        <section className={styles.digest} aria-label="Daily digest">
                            <div className={styles.digestIcon}><Zap size={15} aria-hidden="true" /></div>
                            <p className={styles.digestText}>
                                <strong>Today&rsquo;s summary:</strong> {patientName} completed {completedToday} of {resolvedSchedule.length} tasks today.
                                Cognitive score is <strong>{cogScore}/100</strong>
                                {trendDelta !== 0 && <>, {trendDelta > 0 ? 'up' : 'down'} {Math.abs(trendDelta)} pts vs last reading</>}.
                                {resolvedAlerts.filter(a => !('read' in a ? a.read : a.is_read)).length > 0
                                    ? ` ${resolvedAlerts.filter(a => !('read' in a ? a.read : a.is_read)).length} alerts need your attention.`
                                    : ' No urgent alerts.'}
                            </p>
                        </section>

                        <div className={styles.grid}>
                            {/* COGNITIVE SCORE */}
                            <article className={`${styles.card} ${styles.cardFeatured}`} aria-label="Cognitive score overview">
                                <div className={styles.cardHeaderRow}>
                                    <div>
                                        <span className={styles.cardLabel}>Cognitive Score</span>
                                        <div className={styles.scoreRow}>
                                            <span className={styles.scoreNum}><AnimatedNumber value={cogScore} /></span>
                                            <span className={styles.scoreMax}>/100</span>
                                            {trendDelta !== 0 && (
                                                <span className={styles.scoreDelta}>
                                                    <TrendingUp size={13} aria-hidden="true" /> {trendDelta > 0 ? '+' : ''}{trendDelta} this period
                                                </span>
                                            )}
                                        </div>
                                        <p className={styles.scoreNote}>{analytics?.careStage ?? 'Moderate'} range</p>
                                    </div>
                                    <span className={styles.scoreBadge}>{analytics?.careStage?.charAt(0).toUpperCase() + (analytics?.careStage?.slice(1) ?? '') || 'Moderate'}</span>
                                </div>
                                <CognitiveTrendChart scores={cogTrend} />
                                <div className={styles.featuredStats}>
                                    <div className={styles.fStat}>
                                        <span className={styles.fStatNum}><AnimatedNumber value={medAdherence} suffix="%" /></span>
                                        <span className={styles.fStatLabel}>Medication adherence</span>
                                    </div>
                                    <div className={styles.fStat}>
                                        <span className={styles.fStatNum}><AnimatedNumber value={recallPct} suffix="%" /></span>
                                        <span className={styles.fStatLabel}>Avg recall rate</span>
                                    </div>
                                    <div className={styles.fStat}>
                                        <span className={styles.fStatNum}><AnimatedNumber value={gameStreak} suffix="d" /></span>
                                        <span className={styles.fStatLabel}>Game streak</span>
                                    </div>
                                </div>
                                <Link href="/guardian/analytics" className={styles.cardLink}>
                                    Full analytics <ChevronRight size={14} aria-hidden="true" />
                                </Link>
                            </article>

                            {/* TODAY'S SCHEDULE */}
                            <article className={styles.card} aria-label="Today's schedule summary">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><Calendar size={13} aria-hidden="true" /> Schedule</span>
                                    <Link href="/guardian/schedule" className={styles.viewAll}>View all</Link>
                                </div>
                                <div className={styles.taskProgress}>
                                    <div className={styles.taskBar}>
                                        <div className={styles.taskFill} style={{ width: `${resolvedSchedule.length ? (completedToday / resolvedSchedule.length) * 100 : 0}%` }} />
                                    </div>
                                    <span className={styles.taskCount}>{completedToday}/{resolvedSchedule.length}</span>
                                </div>
                                <ul className={styles.taskList}>
                                    {resolvedSchedule.slice(0, 4).map(task => (
                                        <li key={task.id} className={`${styles.taskItem} ${task.is_completed ? styles.taskDone : ''}`}>
                                            <span className={styles.taskDot} style={{ background: categoryColors[task.category?.toLowerCase()] || 'var(--color-primary)' }} aria-hidden="true" />
                                            <span className={styles.taskTime}>{task.scheduled_time}</span>
                                            <span className={styles.taskTitle}>{task.title}</span>
                                            {!!task.is_completed && <CheckCircle2 size={12} className={styles.taskCheck} aria-label="Done" />}
                                        </li>
                                    ))}
                                </ul>
                            </article>

                            {/* MOOD */}
                            <article className={styles.card} aria-label="Patient's mood">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><Smile size={13} aria-hidden="true" /> Mood Today</span>
                                </div>
                                <MoodBadge distribution={moodDistribution} />
                                <p className={styles.moodNote}>Based on logged mood entries</p>
                            </article>

                            {/* MEMORY RECALL */}
                            <article className={styles.card} aria-label="Memory recall stats">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><Brain size={13} aria-hidden="true" /> Memory Recall</span>
                                    <Link href="/guardian/memories" className={styles.viewAll}>View</Link>
                                </div>
                                <div className={styles.recallScore}>
                                    <span className={styles.recallNum}><AnimatedNumber value={recallPct} suffix="%" /></span>
                                    <span className={styles.recallLbl}>recall accuracy</span>
                                </div>
                                <div className={styles.recallBar} role="meter" aria-valuenow={recallPct} aria-valuemin={0} aria-valuemax={100}>
                                    <div className={styles.recallFill} style={{ width: `${recallPct}%` }} />
                                </div>
                            </article>

                            {/* GAMES */}
                            <article className={styles.card} aria-label="Games and activities">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><Gamepad2 size={13} aria-hidden="true" /> Games</span>
                                    <Link href="/guardian/games" className={styles.viewAll}>View</Link>
                                </div>
                                <div className={styles.streakWrap}>
                                    <span className={styles.streakNum}><AnimatedNumber value={gameStreak} /></span>
                                    <span className={styles.streakText}>day streak 🔥</span>
                                </div>
                                <p className={styles.gameAvg}>Avg: {avgGame}/100 this month</p>
                            </article>

                            {/* ALERTS */}
                            <article
                                className={`${styles.card} ${resolvedAlerts.length > 0 ? styles.cardUrgent : ''}`}
                                aria-label="Recent alerts"
                            >
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><AlertTriangle size={13} aria-hidden="true" /> Alerts</span>
                                    <Link href="/guardian/alerts" className={styles.viewAll}>All alerts</Link>
                                </div>
                                {resolvedAlerts.length === 0 ? (
                                    <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>No recent alerts.</p>
                                ) : (
                                    <ul className={styles.alertList}>
                                        {resolvedAlerts.map((alert) => {
                                            const isApiAlert = 'is_read' in alert;
                                            const title = isApiAlert ? (alert as Alert).message : (alert as MockAlert).title;
                                            const unread = isApiAlert ? !(alert as Alert).is_read : !(alert as MockAlert).read;
                                            const time = isApiAlert
                                                ? new Date((alert as Alert).created_at * 1000).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })
                                                : new Date((alert as MockAlert).timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
                                            return (
                                                <li key={alert.id} className={styles.alertItem}>
                                                    <span className={`${styles.alertDot} ${styles[`alertDot_${isApiAlert ? (alert as Alert).severity : (alert as MockAlert).type}`]}`} aria-hidden="true" />
                                                    <div className={styles.alertMeta}>
                                                        <span className={styles.alertTitle}>{title}</span>
                                                        <span className={styles.alertTime}>{time}</span>
                                                    </div>
                                                    {unread && <span className={styles.unreadDot} aria-label="Unread" />}
                                                </li>
                                            );
                                        })}
                                    </ul>
                                )}
                            </article>

                            {/* QR LOG */}
                            <article className={styles.card} aria-label="QR scan log">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><QrCode size={13} aria-hidden="true" /> QR Scans</span>
                                    <Link href="/guardian/qr" className={styles.viewAll}>Manage</Link>
                                </div>
                                <div className={styles.qrCount}>
                                    <span className={styles.qrNum}><AnimatedNumber value={resolvedQrCount} /></span>
                                    <span className={styles.qrLbl}>scans logged</span>
                                </div>
                            </article>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
