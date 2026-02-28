'use client';

import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockAnalytics, mockGameScores, mockPeople } from '@/lib/mock-data';
import { Download, TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { AnimatedNumber } from '@/components/ui/AnimatedNumber';
import styles from './page.module.css';

function LineChart({
    data, color = '#7C3AED', label
}: {
    data: { date: string; score: number }[];
    color?: string;
    label: string;
}) {
    const w = 100, h = 60;
    const scores = data.map(d => d.score);
    const min = Math.min(...scores) - 2;
    const max = Math.max(...scores) + 2;
    const range = max - min;
    const pts = scores.map((s, i) => {
        const x = (i / (scores.length - 1)) * w;
        const y = h - ((s - min) / range) * h;
        return `${x},${y}`;
    });
    const area = `M 0,${h} L ${pts.join(' L ')} L ${w},${h} Z`;
    const line = `M ${pts.join(' L ')}`;

    return (
        <svg viewBox={`0 0 ${w} ${h}`} preserveAspectRatio="none" className={styles.chart} aria-label={label} role="img">
            <defs>
                <linearGradient id={`grad-${label}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={color} stopOpacity="0.2" />
                    <stop offset="100%" stopColor={color} stopOpacity="0" />
                </linearGradient>
            </defs>
            <path d={area} fill={`url(#grad-${label})`} />
            <path d={line} stroke={color} strokeWidth="2" fill="none" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
    );
}

function MoodHeatmap() {
    const moods = mockAnalytics.moodTrend;
    const moodColor: Record<string, string> = {
        happy: '#22C55E', calm: '#3B82F6', neutral: '#94A3B8',
        anxious: '#F59E0B', agitated: '#EF4444', sad: '#EF4444'
    };
    const days = ['1', '4', '7', '10', '13', '16', '19', '22', '25', '28'];

    return (
        <div className={styles.heatmapGrid} role="img" aria-label="Mood heatmap for February">
            {days.map((day, i) => {
                const mood = moods[i]?.mood || 'neutral';
                return (
                    <div key={day} className={styles.heatCell} title={`Feb ${day}: ${mood}`}>
                        <div className={styles.heatBlock} style={{ background: moodColor[mood] }} />
                        <span className={styles.heatDay}>{day}</span>
                    </div>
                );
            })}
        </div>
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
    const avgGame = mockAnalytics.avgDailyGameScore;
    const cogLast = mockAnalytics.cognitiveScores;
    const first = cogLast[0].score;
    const last = cogLast[cogLast.length - 1].score;
    const trend = last - first;

    // Per-game averages
    const games = ['Memory Match', 'Name That Face', 'Word Puzzle (Hindi)', 'Picture Sequence', 'Number Sort'];
    const gameAvgs = games.map(game => {
        const relevant = mockGameScores.filter(g => g.game === game);
        const avg = relevant.length > 0 ? Math.round(relevant.reduce((s, g) => s + g.score, 0) / relevant.length) : 0;
        return { game, avg };
    });

    return (
        <div className={styles.page}>
            <GuardianHeader title="Care Analytics" subtitle="30-day cognitive and behavioural trends for Ravi" />
            <main className={styles.content}>
                {/* Top KPIs */}
                <div className={styles.kpiRow}>
                    {[
                        { label: 'Current Cognitive Score', num: 72, suffix: '/100', delta: `+${trend} pts (30 days)`, up: trend >= 0 },
                        { label: 'Medication Adherence', num: mockAnalytics.medicationAdherence, suffix: '%', delta: 'Good compliance', up: true },
                        { label: 'Average Memory Recall', num: mockAnalytics.averageRecall, suffix: '%', delta: '78% this month', up: true },
                        { label: 'Game Streak', num: mockAnalytics.gameStreak, suffix: 'd', delta: '🔥 Ongoing streak', up: true },
                        { label: 'Wandering Incidents', num: mockAnalytics.wanderingIncidents, suffix: '', delta: 'Last 30 days', up: false },
                        { label: 'QR Scans', num: mockAnalytics.qrScansLast30, suffix: '', delta: 'Good Samaritans helped', up: true },
                    ].map((kpi, i) => (
                        <div key={i} className={styles.kpiCard}>
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
                                <h2 className={styles.chartTitle}>Cognitive Score — 30-Day Trend</h2>
                                <p className={styles.chartSub}>Mini-Mental State assessment scores plotted over time</p>
                            </div>
                            <span className={`${styles.trendPill} ${trend >= 0 ? styles.trendUp : styles.trendDown}`}>
                                {trend >= 0 ? <TrendingUp size={13} /> : <TrendingDown size={13} />}
                                {trend >= 0 ? '+' : ''}{trend} pts
                            </span>
                        </div>
                        <div className={styles.chartWrap}>
                            <LineChart data={cogLast} color="#7C3AED" label="Cognitive score trend" />
                        </div>
                        <div className={styles.chartXAxis}>
                            {['Jan 29', 'Feb 5', 'Feb 12', 'Feb 19', 'Feb 28'].map(d => (
                                <span key={d} className={styles.xLabel}>{d}</span>
                            ))}
                        </div>
                    </section>

                    {/* Mood heatmap */}
                    <section className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>Mood Calendar — February</h2>
                        </div>
                        <MoodHeatmap />
                        <div className={styles.moodLegend}>
                            {[['#22C55E', 'Happy'], ['#3B82F6', 'Calm'], ['#F59E0B', 'Anxious'], ['#EF4444', 'Agitated']].map(([c, l]) => (
                                <div key={l} className={styles.moodLegendItem}>
                                    <span className={styles.moodLegendDot} style={{ background: c }} aria-hidden="true" />
                                    <span>{l}</span>
                                </div>
                            ))}
                        </div>
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
                        <p className={styles.chartSub}>Average score per game type — last 30 days</p>
                    </section>

                    {/* People recognition */}
                    <section className={styles.chartCard} style={{ gridColumn: '1 / 3' }}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>People Recognition Rates</h2>
                            <p className={styles.chartSub}>How reliably Ravi identifies each person in his wallet</p>
                        </div>
                        <div className={styles.recognitionGrid}>
                            {mockPeople.map((person, i) => {
                                const color = person.recognitionRate >= 85 ? 'var(--color-success)' : person.recognitionRate >= 65 ? 'var(--color-warning)' : 'var(--color-danger)';
                                const initials = person.name.split(' ').map(n => n[0]).join('').toUpperCase().slice(0, 2);
                                return (
                                    <div key={person.id} className={styles.recognitionItem}>
                                        <div className={styles.recogAvatar}>{initials}</div>
                                        <div className={styles.recogInfo}>
                                            <span className={styles.recogName}>{person.name.split(' ')[0]}</span>
                                            <span className={styles.recogRelation}>{person.relation}</span>
                                        </div>
                                        <div className={styles.recogBarWrap}>
                                            <div className={styles.recogBar}>
                                                <div className={styles.recogFill} style={{ width: `${person.recognitionRate}%`, background: color }} />
                                            </div>
                                            <span className={styles.recogScore} style={{ color }}>{person.recognitionRate}%</span>
                                        </div>
                                    </div>
                                );
                            })}
                        </div>
                    </section>

                    {/* Medication adherence */}
                    <section className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>Medication Adherence</h2>
                        </div>
                        <div className={styles.circleWrap}>
                            <svg viewBox="0 0 80 80" className={styles.donut} aria-label={`${mockAnalytics.medicationAdherence}% medication adherence`}>
                                <circle cx="40" cy="40" r="30" fill="none" stroke="var(--bg-surface-soft)" strokeWidth="10" />
                                <circle cx="40" cy="40" r="30" fill="none" stroke="var(--color-success)" strokeWidth="10"
                                    strokeDasharray={`${(mockAnalytics.medicationAdherence / 100) * 188.5} 188.5`}
                                    strokeLinecap="round" transform="rotate(-90 40 40)" />
                                <text x="40" y="44" textAnchor="middle" fontSize="14" fontWeight="800" fill="var(--text-heading)">{mockAnalytics.medicationAdherence}%</text>
                            </svg>
                            <p className={styles.donutLabel}>87% doses taken on time this month</p>
                        </div>
                        <div className={styles.adherenceBreakdown}>
                            <div className={styles.adherenceItem}>
                                <span className={styles.aLabel}>Donepezil (morning)</span>
                                <span className={styles.aScore} style={{ color: 'var(--color-success)' }}>93%</span>
                            </div>
                            <div className={styles.adherenceItem}>
                                <span className={styles.aLabel}>Memantine (evening)</span>
                                <span className={styles.aScore} style={{ color: 'var(--color-warning)' }}>81%</span>
                            </div>
                            <div className={styles.adherenceItem}>
                                <span className={styles.aLabel}>Vitamin D3 (weekly)</span>
                                <span className={styles.aScore} style={{ color: 'var(--color-success)' }}>100%</span>
                            </div>
                        </div>
                    </section>

                    {/* Decline alerts */}
                    <section className={styles.chartCard}>
                        <div className={styles.chartHeader}>
                            <h2 className={styles.chartTitle}>Decline Risk Monitor</h2>
                        </div>
                        <div className={styles.riskGrid}>
                            {[
                                { label: 'Cognitive Stability', status: 'Good', color: 'var(--color-success)', note: 'Score trending up' },
                                { label: 'Medication Gaps', status: 'Moderate', color: 'var(--color-warning)', note: '2 missed in 30 days' },
                                { label: 'Wandering Risk', status: 'Elevated', color: 'var(--color-danger)', note: '2 incidents this month' },
                                { label: 'Social Engagement', status: 'Good', color: 'var(--color-success)', note: 'Weekly family calls' },
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
                        <Activity size={14} aria-hidden="true" /> Analytics are generated from Ravi's daily care logs. Last updated: 28 Feb 2026.
                    </p>
                    <button className={styles.exportBtn}>
                        <Download size={16} aria-hidden="true" /> Export PDF Report
                    </button>
                </div>
            </main>
        </div>
    );
}
