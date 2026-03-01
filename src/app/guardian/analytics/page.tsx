'use client';

import { useState, useEffect } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockAnalytics, mockGameScores } from '@/lib/mock-data';
import { Download, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import { useSession } from '@/lib/useSession';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

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

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    time_of_day: string;
}

function LineChart({
    data, color = '#7C3AED', label
}: {
    data: { date: string; score: number }[];
    color?: string;
    label: string;
}) {
    if (!data || data.length < 2) {
        return (
            <div style={{ height: 180, display: 'flex', alignItems: 'center', justifyContent: 'center', color: 'var(--text-muted)', fontSize: '0.85rem' }}>
                Not enough data yet
            </div>
        );
    }
    const w = 400, h = 180;
    const padding = { top: 20, right: 10, bottom: 20, left: 30 };
    const chartW = w - padding.left - padding.right;
    const chartH = h - padding.top - padding.bottom;

    const scores = data.map(d => d.score);
    const min = Math.max(0, Math.min(...scores) - 5);
    const max = Math.min(100, Math.max(...scores) + 5);
    const range = max - min || 1;

    const pts = scores.map((s, i) => {
        const x = padding.left + (i / (scores.length - 1)) * chartW;
        const y = padding.top + chartH - ((s - min) / range) * chartH;
        return { x, y, score: s };
    });

    const area = `M ${padding.left},${padding.top + chartH} L ${pts.map(p => `${p.x},${p.y}`).join(' L ')} L ${pts[pts.length - 1].x},${padding.top + chartH} Z`;
    const line = `M ${pts.map(p => `${p.x},${p.y}`).join(' L ')}`;

    const gridLines = [];
    for (let i = 0; i < 4; i++) {
        const val = min + (range * i) / 3;
        const y = padding.top + chartH - (i / 3) * chartH;
        gridLines.push({ y, val: Math.round(val) });
    }

    return (
        <svg viewBox={`0 0 ${w} ${h}`} className={styles.chart} aria-label={label} role="img" preserveAspectRatio="none">
            <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.3" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            {gridLines.map((lineDef, i) => (
                <g key={i}>
                    <line x1={padding.left} y1={lineDef.y} x2={w - padding.right} y2={lineDef.y} stroke="var(--border-subtle)" strokeWidth="1" strokeDasharray="4 4" vectorEffect="non-scaling-stroke" />
                    <text x={padding.left - 8} y={lineDef.y + 4} fontSize="11" fill="var(--text-muted)" textAnchor="end" fontFamily="var(--font-body)">{lineDef.val}</text>
                </g>
            ))}
            <path d={area} fill={`url(#grad-${label})`} />
            <path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" vectorEffect="non-scaling-stroke" />
            {pts.map((p, i) => (
                <g key={i}>
                    <circle cx={p.x} cy={p.y} r="4" fill="var(--bg-surface)" stroke={color} strokeWidth="2" vectorEffect="non-scaling-stroke" />
                </g>
            ))}
        </svg>
    );
}

function GameBar({ game, score }: { game: string; score: number }) {
    const color = score >= 75 ? 'var(--color-success)' : score >= 55 ? 'var(--color-warning)' : 'var(--color-danger)';
    return (
        <div className={styles.gameBarRow}>
            <span className={styles.gameBarLabel}>{game}</span>
            <div className={styles.gameBarTrack}>
                <div className={styles.gameBarFill} style={{ width: `${score}%`, background: color }} />
            </div>
            <span className={styles.gameBarScore} style={{ color }}>{score}</span>
        </div>
    );
}

export default function AnalyticsPage() {
    const { user, isDemo } = useSession();
    const patientFirstName = user?.patientName?.split(' ')[0] || 'your patient';

    const [analytics, setAnalytics] = useState<AnalyticsData | null>(null);
    const [medications, setMedications] = useState<Medication[]>([]);

    useEffect(() => {
        if (isDemo) return;
        apiFetch<AnalyticsData>('/api/analytics').then(setAnalytics).catch(() => { });
        apiFetch<{ medications: Medication[] }>('/api/medications').then(d => setMedications(d.medications || [])).catch(() => { });
    }, [isDemo]);

    // Resolve values
    const cogScore = isDemo ? 72 : (analytics?.cognitiveScore ?? 0);
    const cogTrend = isDemo ? mockAnalytics.cognitiveScores : (analytics?.cognitiveScoreTrend ?? []);
    const recallPct = isDemo ? mockAnalytics.averageRecall : (analytics?.recallAccuracy ?? 0);
    const gameStreakVal = isDemo ? mockAnalytics.gameStreak : (analytics?.gameStreak ?? 0);
    const wanderingCount = isDemo ? mockAnalytics.wanderingIncidents : 0;
    const medAdherence = isDemo ? mockAnalytics.medicationAdherence : 0;

    const first = cogTrend.length > 0 ? cogTrend[0].score : cogScore;
    const last = cogTrend.length > 0 ? cogTrend[cogTrend.length - 1].score : cogScore;
    const trend = last - first;

    // Game averages from mock (analytics doesn't break down by game type from API yet)
    const games = ['Memory Match', 'Name That Face', 'Word Puzzle (Hindi)', 'Picture Sequence', 'Number Sort'];
    const gameAvgs = isDemo
        ? games.map(game => {
            const relevant = mockGameScores.filter(g => g.game === game);
            const avg = relevant.length > 0 ? Math.round(relevant.reduce((s, g) => s + g.score, 0) / relevant.length) : 0;
            return { game, avg };
        })
        : games.map(game => ({ game, avg: analytics?.avgDailyGameScore ?? 0 }));

    const today = new Date().toLocaleDateString('en-IN', { day: 'numeric', month: 'short', year: 'numeric' });

    return (
        <div className={styles.page}>
            <GuardianHeader title="Care Analytics" subtitle={`30-day cognitive and behavioural trends for ${patientFirstName}`} />
            <main className={styles.content}>
                {/* Top KPIs */}
                <div className={styles.kpiRow}>
                    {[
                        { label: 'Current Cognitive Score', num: cogScore, suffix: '/100', delta: trend !== 0 ? `${trend > 0 ? '+' : ''}${trend} pts trend` : 'Stable', up: trend >= 0 },
                        { label: 'Medication Adherence', num: medAdherence, suffix: '%', delta: medAdherence > 0 ? 'Good compliance' : 'No data yet', up: medAdherence >= 80 },
                        { label: 'Average Memory Recall', num: recallPct, suffix: '%', delta: recallPct > 0 ? 'This period' : 'No data yet', up: recallPct >= 70 },
                        { label: 'Game Streak', num: gameStreakVal, suffix: 'd', delta: '🔥 Ongoing streak', up: true },
                        { label: 'Wandering Incidents', num: wanderingCount, suffix: '', delta: 'Last 30 days', up: wanderingCount === 0 },
                        { label: 'Schedule Completion', num: analytics ? Math.round((analytics.scheduleCompletion.completed / (analytics.scheduleCompletion.total || 1)) * 100) : 0, suffix: '%', delta: `${analytics?.scheduleCompletion.completed ?? 0}/${analytics?.scheduleCompletion.total ?? 0} tasks today`, up: true },
                    ].map((kpi, i) => (
                        <div key={i} className={styles.kpiCard} data-tooltip={kpi.label}>
                            <span className={styles.kpiValue}>
                                <AnimatedNumber value={kpi.num} />{kpi.suffix}
                            </span>
                            <span className={styles.kpiLabel}>{kpi.label}</span>
                            <span className={styles.kpiDelta} style={{ color: kpi.up ? 'var(--color-success)' : 'var(--color-danger)' }}>
                                {kpi.up ? <TrendingUp size={11} /> : <TrendingDown size={11} />} {kpi.delta}
                            </span>
                        </div>
                    ))}
                </div>

                <div className={styles.grid}>
                    {/* Cognitive score chart */}
                    <section className={styles.chartCard} style={{ gridColumn: '1 / 3' }}>
                        <div className={styles.chartHeader}>
                            <div>
                                <h2 className={styles.chartTitle}>Cognitive Score - Trend</h2>
                                <p className={styles.chartSub}>Game and assessment scores plotted over time</p>
                            </div>
                            <span className={`${styles.trendPill} ${trend >= 0 ? styles.trendUp : styles.trendDown}`}>
                                {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                {trend >= 0 ? '+' : ''}{trend} pts
                            </span>
                        </div>
                        <div className={styles.chartWrap}>
                            <LineChart data={cogTrend} color="#7C3AED" label="Cognitive score trend" />
                        </div>
                        {cogTrend.length > 0 && (
                            <div className={styles.chartXAxis}>
                                {[...new Set(cogTrend.map(d => d.date))].slice(0, 5).map(d => (
                                    <span key={d} className={styles.xLabel}>
                                        {new Date(d).toLocaleDateString('en-IN', { month: 'short', day: 'numeric' })}
                                    </span>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Game performance */}
                    <section className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>Game Performance</h2>
                        </div>
                        <div className={styles.gameBars}>
                            {gameAvgs.map(({ game, avg }) => (
                                <GameBar key={game} game={game} score={avg} />
                            ))}
                        </div>
                        <p className={styles.chartSub}>Average score per game type</p>
                    </section>

                    {/* Medication adherence */}
                    <section className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>Active Medications</h2>
                        </div>
                        {medications.length === 0 && !isDemo ? (
                            <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>No medications found in database.</p>
                        ) : (
                            <div className={styles.adherenceBreakdown}>
                                {(isDemo
                                    ? [{ id: 'm1', name: 'Donepezil', dosage: '10mg', frequency: 'Morning', time_of_day: 'morning', score: 93, color: 'var(--color-success)' },
                                    { id: 'm2', name: 'Memantine', dosage: '20mg', frequency: 'Evening', time_of_day: 'evening', score: 81, color: 'var(--color-warning)' },
                                    { id: 'm3', name: 'Vitamin D3', dosage: '', frequency: 'Weekly', time_of_day: 'morning', score: 100, color: 'var(--color-success)' }] as (Medication & { score: number; color: string })[]
                                    : medications.map(m => ({ ...m, score: 0, color: 'var(--text-muted)' }))
                                ).map((m) => (
                                    <div key={m.id} className={styles.adherenceItem}>
                                        <span className={styles.aLabel}>{m.name} {m.dosage} ({m.time_of_day || m.frequency})</span>
                                        {isDemo && (m as { score: number }).score > 0 && (
                                            <span className={styles.aScore} style={{ color: (m as { color: string }).color }}>{(m as { score: number }).score}%</span>
                                        )}
                                    </div>
                                ))}
                            </div>
                        )}
                    </section>

                    {/* Decline alerts */}
                    <section className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>Decline Risk Monitor</h2>
                        </div>
                        <div className={styles.riskGrid}>
                            {[
                                { label: 'Cognitive Stability', status: trend >= 0 ? 'Good' : 'Declining', color: trend >= 0 ? 'var(--color-success)' : 'var(--color-danger)', note: trend !== 0 ? `Score ${trend > 0 ? '+' : ''}${trend} pts` : 'Stable' },
                                { label: 'Medication Gaps', status: medAdherence >= 80 ? 'Good' : 'Moderate', color: medAdherence >= 80 ? 'var(--color-success)' : 'var(--color-warning)', note: `${medAdherence}% adherence` },
                                { label: 'Wandering Risk', status: wanderingCount === 0 ? 'Low' : 'Elevated', color: wanderingCount === 0 ? 'var(--color-success)' : 'var(--color-danger)', note: `${wanderingCount} incidents` },
                                { label: 'Game Engagement', status: gameStreakVal >= 3 ? 'Good' : 'Low', color: gameStreakVal >= 3 ? 'var(--color-success)' : 'var(--color-warning)', note: `${gameStreakVal} day streak` },
                            ].map(item => (
                                <div key={item.label} className={styles.riskItem}>
                                    <span className={styles.riskDot} style={{ background: item.color }} aria-hidden="true" />
                                    <div>
                                        <span className={styles.riskLabel}>{item.label}</span>
                                        <span className={styles.riskNote}>{item.note}</span>
                                    </div>
                                    <span className={styles.riskStatus} style={{ color: item.color }}>{item.status}</span>
                                </div>
                            ))}
                        </div>
                    </section>
                </div>

                <div className={styles.exportRow}>
                    <p className={styles.exportNote}>
                        <Activity size={14} aria-hidden="true" /> Analytics generated from {patientFirstName}&apos;s daily care logs. Last updated: {today}.
                    </p>
                    <button className={styles.exportBtn} data-tooltip="Download a PDF care report to share with doctors and family">
                        <Download size={16} aria-hidden="true" /> Export PDF Report
                    </button>
                </div>
            </main>
        </div>
    );
}
