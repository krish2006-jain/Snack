'use client';

import { useState } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockGameScores } from '@/lib/mock-data';
import { Gamepad2, Trophy, Clock, Target, PlayCircle, Settings, Download } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './page.module.css';

const GAMES_META = [
    { id: 'memory-match', name: 'Memory Match', category: 'Recall', desc: 'Find matching pairs of familiar faces or objects.', color: 'var(--color-primary)' },
    { id: 'name-face', name: 'Name That Face', category: 'Recognition', desc: 'Identify family members from photos.', color: 'var(--color-info)' },
    { id: 'word-puzzle', name: 'Word Puzzle (Hindi)', category: 'Language', desc: 'Complete familiar proverbs and words.', color: 'var(--color-success)' },
    { id: 'pic-sequence', name: 'Picture Sequence', category: 'Logic', desc: 'Arrange daily activities in the correct order.', color: 'var(--color-warning)' },
    { id: 'number-sort', name: 'Number Sort', category: 'Math', desc: 'Simple numerical ordering and counting.', color: '#EC4899' },
];

export default function GamesPage() {
    const { user } = useSession();
    const patientFirstName = user?.patientName?.split(' ')[0] || 'Patient';
    const [activeTab, setActiveTab] = useState<'overview' | 'settings'>('overview');

    // Group scores by game
    const stats = GAMES_META.map(game => {
        const scores = mockGameScores.filter(s => s.game === game.name);
        const avgScore = scores.length ? Math.round(scores.reduce((sum, s) => sum + s.score, 0) / scores.length) : 0;
        const playCount = scores.length;
        const bestScore = scores.length ? Math.max(...scores.map(s => s.score)) : 0;
        const recent = scores[0]; // mock is already sorted descending

        return { ...game, avgScore, playCount, bestScore, recent };
    });

    const totalPlays = mockGameScores.length;
    const avgOverall = Math.round(mockGameScores.reduce((sum, s) => sum + s.score, 0) / totalPlays);

    return (
        <div className={styles.page}>
            <GuardianHeader title="Cognitive Games" subtitle={`Manage ${patientFirstName}'s therapeutic game settings & track progress`} />
            <main className={styles.content}>

                {/* Top KPIs */}
                <div className={styles.kpiRow}>
                    <div className={styles.kpiCard}>
                        <span className={styles.kpiValue}>{totalPlays}</span>
                        <span className={styles.kpiLabel}>Total sessions played</span>
                    </div>
                    <div className={styles.kpiCard}>
                        <span className={styles.kpiValue} style={{ color: avgOverall >= 70 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                            {avgOverall}%
                        </span>
                        <span className={styles.kpiLabel}>Average success rate</span>
                    </div>
                    <div className={styles.kpiCard}>
                        <span className={styles.kpiValue}>14 days</span>
                        <span className={styles.kpiLabel}>Current streak 🔥</span>
                    </div>
                    <button className={styles.reportBtn}>
                        <Download size={14} aria-hidden="true" /> Provider Report
                    </button>
                </div>

                {/* Tabs */}
                <div className={styles.tabs}>
                    <button className={`${styles.tab} ${activeTab === 'overview' ? styles.tabActive : ''}`} onClick={() => setActiveTab('overview')}>
                        <Trophy size={14} aria-hidden="true" /> Performance Overview
                    </button>
                    <button className={`${styles.tab} ${activeTab === 'settings' ? styles.tabActive : ''}`} onClick={() => setActiveTab('settings')}>
                        <Settings size={14} aria-hidden="true" /> Game Settings
                    </button>
                </div>

                {activeTab === 'overview' && (
                    <div className={styles.gameGrid}>
                        {stats.map(game => (
                            <article key={game.id} className={styles.gameCard}>
                                <div className={styles.gameHeader}>
                                    <div className={styles.gameIconWrap} style={{ background: game.color + '15', color: game.color }}>
                                        <Gamepad2 size={24} aria-hidden="true" />
                                    </div>
                                    <div className={styles.gameInfo}>
                                        <h3 className={styles.gameTitle}>{game.name}</h3>
                                        <span className={styles.gameCategory}>{game.category} • {game.playCount} sessions</span>
                                    </div>
                                </div>

                                <p className={styles.gameDesc}>{game.desc}</p>

                                <div className={styles.gameStatsRow}>
                                    <div className={styles.statBox}>
                                        <span className={styles.statBoxLbl}>Avg Score</span>
                                        <span className={styles.statBoxVal} style={{ color: game.avgScore >= 75 ? 'var(--color-success)' : 'var(--color-warning)' }}>
                                            {game.avgScore}%
                                        </span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statBoxLbl}>Best Score</span>
                                        <span className={styles.statBoxVal}>{game.bestScore}%</span>
                                    </div>
                                    <div className={styles.statBox}>
                                        <span className={styles.statBoxLbl}>Last Played</span>
                                        <span className={styles.statBoxVal} style={{ fontSize: '12px' }}>
                                            {game.recent ? new Date(game.recent.date).toLocaleDateString('en-IN', { day: 'numeric', month: 'short' }) : 'Never'}
                                        </span>
                                    </div>
                                </div>

                                <div className={styles.gameActions}>
                                    <button className={styles.btnOutline}>View Details</button>
                                    <button className={styles.btnPrimary}>
                                        <PlayCircle size={14} aria-hidden="true" /> Assign Task
                                    </button>
                                </div>
                            </article>
                        ))}
                    </div>
                )}

                {activeTab === 'settings' && (
                    <div className={styles.settingsPanel}>
                        <div className={styles.settingsCard}>
                            <h2 className={styles.settingsTitle}>Difficulty Management</h2>
                            <p className={styles.settingsDesc}>SaathiCare automatically adjusts difficulty based on {patientFirstName}&apos;s performance, but you can override it here.</p>

                            <ul className={styles.settingsList}>
                                {GAMES_META.map(game => (
                                    <li key={game.id} className={styles.settingsItem}>
                                        <div>
                                            <span className={styles.setItemTitle}>{game.name}</span>
                                            <span className={styles.setItemDesc}>Current mode: Auto-adjust</span>
                                        </div>
                                        <select className={styles.select} defaultValue="auto" aria-label={`Difficulty for ${game.name}`}>
                                            <option value="auto">Auto (Recommended)</option>
                                            <option value="easy">Easy (Fewer options)</option>
                                            <option value="medium">Medium</option>
                                            <option value="hard">Hard (More complex)</option>
                                            <option value="disabled">Disable Game</option>
                                        </select>
                                    </li>
                                ))}
                            </ul>
                        </div>

                        <div className={styles.settingsCard}>
                            <h2 className={styles.settingsTitle}>Daily Goal Settings</h2>
                            <div className={styles.formGroup}>
                                <label className={styles.label} htmlFor="goal-time">Target minutes per day</label>
                                <input id="goal-time" type="number" className={styles.input} defaultValue="15" />
                            </div>
                            <div className={styles.toggleRow}>
                                <div>
                                    <span className={styles.toggleLabel}>Remind if goal not met</span>
                                    <span className={styles.toggleDesc}>Sends an alert to {patientFirstName} at 6:00 PM</span>
                                </div>
                                <div className={styles.toggle} role="switch" aria-checked="true" tabIndex={0}>
                                    <div className={styles.toggleKnobActive} />
                                </div>
                            </div>
                            <button className={styles.saveBtn} style={{ marginTop: 'var(--space-4)' }}>Save Preferences</button>
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
