'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import {
    mockAlerts, mockSchedule, mockQRScans, mockGameScores, mockAnalytics, type Alert, type QRScan, type GameScore
} from '@/lib/mock-data';
import { mockPatient } from '@/lib/mock-data/patient';
import {
    Brain, Calendar, Smile, Zap, Gamepad2, QrCode,
    AlertTriangle, ChevronRight, TrendingUp, CheckCircle2
} from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useSession } from '@/lib/useSession';
import styles from './page.module.css';

function CognitiveTrendChart({ scores }: { scores: { date: string; score: number }[] }) {
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
        <svg viewBox={`0 0 ${w} ${h}`} className={styles.trendChart} aria-label="Cognitive score trend over 4 weeks">
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

function MoodSparkline() {
    const moods = mockAnalytics.moodTrend.slice(-7);
    const moodVal: Record<string, number> = { happy: 5, calm: 4, neutral: 3, anxious: 2, agitated: 1, sad: 1 };
    const moodColor: Record<string, string> = { happy: '#22C55E', calm: '#3B82F6', neutral: '#F59E0B', anxious: '#F59E0B', agitated: '#EF4444', sad: '#EF4444' };
    const w = 110, h = 32;
    const vals = moods.map((m: { date: string; mood: string }) => moodVal[m.mood] || 3);
    const max = 5, min = 1;
    const points = vals.map((v: number, i: number) => {
        const x = (i / (vals.length - 1)) * w;
        const y = h - ((v - min) / (max - min)) * h;
        return `${x},${y}`;
    });
    const last = moods[moods.length - 1];
    return (
        <div className={styles.moodSparkWrap}>
            <svg viewBox={`0 0 ${w} ${h}`} className={styles.sparkline} aria-label="Mood trend sparkline">
                <path d={`M ${points.join(' L ')}`} stroke={moodColor[last?.mood] || '#3B82F6'} strokeWidth="2" fill="none" strokeLinecap="round" />
            </svg>
            <span className={styles.moodLabel} style={{ color: moodColor[last?.mood] || '#3B82F6' }}>
                {last?.mood ?? 'calm'}
            </span>
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

export default function GuardianDashboard() {
    const { user } = useSession();
    const guardianName = user?.name?.split(' ')[0] || 'there';
    const patientName = user?.patientName?.split(' ')[0] || 'your loved one';
    const [loaded, setLoaded] = useState(false);
    useEffect(() => { const t = setTimeout(() => setLoaded(true), 700); return () => clearTimeout(t); }, []);

    // mockSchedule status is 'done' | 'upcoming' | 'missed'
    const today = mockSchedule.slice(0, 5);
    const completedToday = today.filter(t => t.completed).length;
    const urgentAlerts = mockAlerts.filter((a: Alert) => a.type === 'danger' || a.type === 'warning');
    const latestGame = mockGameScores[0] as GameScore | undefined;

    const categoryColors: Record<string, string> = {
        medication: 'var(--color-danger)', exercise: 'var(--color-success)',
        therapy: 'var(--color-primary)', meal: 'var(--color-warning)',
        hygiene: 'var(--color-info)', social: '#EC4899',
    };

    return (
        <div className={styles.page}>
            <GuardianHeader title={`Welcome back, ${guardianName}`} />
            <main className={styles.content}>
                {!loaded ? <SkeletonDash /> : (
                    <>
                        <section className={styles.digest} aria-label="Daily digest">
                            <div className={styles.digestIcon}><Zap size={15} aria-hidden="true" /></div>
                            <p className={styles.digestText}>
                                <strong>Today&rsquo;s summary:</strong> {patientName} had a calm morning — completed the walk and medication on time.
                                Cognitive score is stable at <strong>72/100</strong>, up 3 points from last week.
                                The caretaker is on shift until 4 PM. Two alerts need your attention.
                            </p>
                        </section>

                        <div className={styles.grid}>
                            {/* COGNITIVE SCORE — featured 2-row card */}
                            <article className={`${styles.card} ${styles.cardFeatured}`} aria-label="Cognitive score overview">
                                <div className={styles.cardHeaderRow}>
                                    <div>
                                        <span className={styles.cardLabel}>Cognitive Score</span>
                                        <div className={styles.scoreRow}>
                                            <span className={styles.scoreNum}><AnimatedNumber value={72} /></span>
                                            <span className={styles.scoreMax}>/100</span>
                                            <span className={styles.scoreDelta}>
                                                <TrendingUp size={13} aria-hidden="true" /> +3 this week
                                            </span>
                                        </div>
                                        <p className={styles.scoreNote}>Moderate range — 4-week upward trend</p>
                                    </div>
                                    <span className={styles.scoreBadge}>Moderate</span>
                                </div>
                                <CognitiveTrendChart scores={mockAnalytics.cognitiveScores} />
                                <div className={styles.scoreWeeks}>
                                    {['4 wks ago', '3 wks', '2 wks', 'This week'].map((l, i) => (
                                        <span key={i} className={styles.weekLabel}>{l}</span>
                                    ))}
                                </div>
                                <div className={styles.featuredStats}>
                                    <div className={styles.fStat}>
                                        <span className={styles.fStatNum}><AnimatedNumber value={87} suffix="%" /></span>
                                        <span className={styles.fStatLabel}>Medication adherence</span>
                                    </div>
                                    <div className={styles.fStat}>
                                        <span className={styles.fStatNum}><AnimatedNumber value={78} suffix="%" /></span>
                                        <span className={styles.fStatLabel}>Avg recall rate</span>
                                    </div>
                                    <div className={styles.fStat}>
                                        <span className={styles.fStatNum}><AnimatedNumber value={mockAnalytics.gameStreak} suffix="d" /></span>
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
                                        <div className={styles.taskFill} style={{ width: `${(completedToday / today.length) * 100}%` }} />
                                    </div>
                                    <span className={styles.taskCount}>{completedToday}/{today.length}</span>
                                </div>
                                <ul className={styles.taskList}>
                                    {today.slice(0, 4).map(task => (
                                        <li key={task.id} className={`${styles.taskItem} ${task.completed ? styles.taskDone : ''}`}>
                                            <span className={styles.taskDot} style={{ background: categoryColors[task.category.toLowerCase()] || 'var(--color-primary)' }} aria-hidden="true" />
                                            <span className={styles.taskTime}>{task.time}</span>
                                            <span className={styles.taskTitle}>{task.title}</span>
                                            {task.completed && <CheckCircle2 size={12} className={styles.taskCheck} aria-label="Done" />}
                                        </li>
                                    ))}
                                </ul>
                            </article>

                            {/* MOOD */}
                            <article className={styles.card} aria-label="Patient's mood today">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><Smile size={13} aria-hidden="true" /> Mood Today</span>
                                </div>
                                <div className={styles.moodMain}>
                                    <span className={styles.moodEmoji} role="img" aria-label="Calm face">😌</span>
                                    <span className={styles.moodWord}>Calm</span>
                                </div>
                                <MoodSparkline />
                                <p className={styles.moodNote}>7-day trend — mostly calm</p>
                            </article>

                            {/* MEMORY RECALL */}
                            <article className={styles.card} aria-label="Memory recall stats">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><Brain size={13} aria-hidden="true" /> Memory Recall</span>
                                    <Link href="/guardian/memories" className={styles.viewAll}>View</Link>
                                </div>
                                <div className={styles.recallScore}>
                                    <span className={styles.recallNum}><AnimatedNumber value={85} suffix="%" /></span>
                                    <span className={styles.recallLbl}>family recognition</span>
                                </div>
                                <div className={styles.recallBar} role="meter" aria-valuenow={85} aria-valuemin={0} aria-valuemax={100} aria-label="85% recall">
                                    <div className={styles.recallFill} style={{ width: '85%' }} />
                                </div>
                                <div className={styles.recallBreakdown}>
                                    <span>People: 94%</span><span>Objects: 78%</span>
                                </div>
                            </article>

                            {/* GAMES */}
                            <article className={styles.card} aria-label="Games and activities">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><Gamepad2 size={13} aria-hidden="true" /> Games</span>
                                    <Link href="/guardian/games" className={styles.viewAll}>View</Link>
                                </div>
                                <div className={styles.streakWrap}>
                                    <span className={styles.streakNum}><AnimatedNumber value={mockAnalytics.gameStreak} /></span>
                                    <span className={styles.streakText}>day streak 🔥</span>
                                </div>
                                {latestGame && (
                                    <div className={styles.latestGame}>
                                        <span className={styles.lgTitle}>{latestGame.game}</span>
                                        <span className={styles.lgScore}>{latestGame.score}/100</span>
                                    </div>
                                )}
                                <p className={styles.gameAvg}>Avg: {mockAnalytics.avgDailyGameScore}/100 this month</p>
                            </article>

                            {/* ALERTS */}
                            <article
                                className={`${styles.card} ${urgentAlerts.length > 0 ? styles.cardUrgent : ''}`}
                                aria-label="Recent alerts"
                            >
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><AlertTriangle size={13} aria-hidden="true" /> Alerts</span>
                                    <Link href="/guardian/alerts" className={styles.viewAll}>All alerts</Link>
                                </div>
                                <ul className={styles.alertList}>
                                    {mockAlerts.slice(0, 3).map((alert: Alert) => (
                                        <li key={alert.id} className={styles.alertItem}>
                                            <span className={`${styles.alertDot} ${styles[`alertDot_${alert.type}`]}`} aria-hidden="true" />
                                            <div className={styles.alertMeta}>
                                                <span className={styles.alertTitle}>{alert.title}</span>
                                                <span className={styles.alertTime}>
                                                    {new Date(alert.timestamp).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                            {!alert.read && <span className={styles.unreadDot} aria-label="Unread" />}
                                        </li>
                                    ))}
                                </ul>
                            </article>

                            {/* QR LOG */}
                            <article className={styles.card} aria-label="QR scan log">
                                <div className={styles.cardTopRow}>
                                    <span className={styles.cardLabel}><QrCode size={13} aria-hidden="true" /> QR Scans</span>
                                    <Link href="/guardian/qr" className={styles.viewAll}>Manage</Link>
                                </div>
                                <div className={styles.qrCount}>
                                    <span className={styles.qrNum}><AnimatedNumber value={mockQRScans.length} /></span>
                                    <span className={styles.qrLbl}>scans in 30 days</span>
                                </div>
                                <ul className={styles.qrLog}>
                                    {mockQRScans.slice(0, 2).map((scan: QRScan) => (
                                        <li key={scan.id} className={styles.qrLogItem}>
                                            <span className={styles.qrLoc}>{scan.location}</span>
                                            <span className={styles.qrTime}>{new Date(scan.timestamp).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' })}</span>
                                        </li>
                                    ))}
                                </ul>
                            </article>
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
