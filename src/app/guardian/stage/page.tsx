'use client';

import GuardianHeader from '@/components/guardian/GuardianHeader';
import { Activity, Brain, Shield, Crosshair, ArrowRight, BookOpen } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './page.module.css';

const STAGES = [
    { level: 1, name: 'Normal', desc: 'No impairment.' },
    { level: 2, name: 'Very Mild', desc: 'Subjective memory loss.' },
    { level: 3, name: 'Mild', desc: 'Mild cognitive decline. Early-stage Alzheimer\'s in some cases.', current: false },
    { level: 4, name: 'Moderate', desc: 'Clear-cut clinical deficit. Difficulty with complex tasks (e.g., finances).', current: true },
    { level: 5, name: 'Moderately Severe', desc: 'Needs help surviving. Requires assistance with choosing clothes.', current: false },
    { level: 6, name: 'Severe', desc: 'Needs help with ADLs (dressing, bathing, toileting). Personality changes.', current: false },
    { level: 7, name: 'Very Severe', desc: 'Severe speech loss, loss of motor skills.', current: false },
];

export default function CareStagePage() {
    const { user } = useSession();
    const patientFirstName = user?.patientName?.split(' ')[0] || 'The patient';
    return (
        <div className={styles.page}>
            <GuardianHeader
                title="Alzheimer's Care Stage"
                subtitle="Global Deterioration Scale (GDS) — Current Assessment"
            />

            <main className={styles.content}>

                <div className={styles.grid}>

                    {/* Current Stage Overview */}
                    <section className={styles.mainPanel}>
                        <div className={styles.stageHero}>
                            <span className={styles.stageLabel}>Current Assessment (Last verified: 12 Feb 2026)</span>
                            <h1 className={styles.stageTitle}>Stage 4: Moderate Cognitive Decline</h1>
                            <p className={styles.stageDesc}>
                                {patientFirstName} requires assistance with complex daily tasks like managing finances, making travel plans, and occasionally
                                remembering recent events. However, he remains highly oriented to time and familiar people, and can recognize his home environment.
                            </p>

                            <div className={styles.timeline}>
                                {STAGES.map((s, i) => (
                                    <div key={s.level} className={`${styles.timelineNode} ${s.current ? styles.nodeCurrent : s.level < 4 ? styles.nodePast : ''}`}>
                                        <div className={styles.nodeCircle}>{s.level}</div>
                                        <span className={styles.nodeName}>{s.name}</span>
                                    </div>
                                ))}
                                <div className={styles.timelineLine} />
                            </div>
                        </div>

                        <div className={styles.capabilities}>
                            <h2 className={styles.sectionTitle}>Current Capabilities & Challenges</h2>
                            <div className={styles.capGrid}>
                                <div className={styles.capCard} style={{ borderColor: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
                                    <div className={styles.capHeader}>
                                        <Brain size={16} color="var(--color-success)" />
                                        <span className={styles.capTitle}>Strengths</span>
                                    </div>
                                    <ul className={styles.list}>
                                        <li>Recognizes immediate family comfortably</li>
                                        <li>Can perform basic ADLs (dressing, eating) independently</li>
                                        <li>Enjoys familiar music and old photos</li>
                                    </ul>
                                </div>
                                <div className={styles.capCard} style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-bg)' }}>
                                    <div className={styles.capHeader}>
                                        <Activity size={16} color="var(--color-warning)" />
                                        <span className={styles.capTitle}>Challenges</span>
                                    </div>
                                    <ul className={styles.list}>
                                        <li>Short-term memory recall is inconsistent</li>
                                        <li>Struggles with new technology or complex instructions</li>
                                        <li>Occasional disorientation in unfamiliar places</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    </section>

                    {/* Guidelines Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={styles.guideCard}>
                            <h2 className={styles.guideTitle}>
                                <Shield size={16} aria-hidden="true" /> Caretaker Guidelines for Stage 4
                            </h2>
                            <div className={styles.guideContent}>
                                <p>Provide structure and routine. Introduce cues for orientation but avoid correcting mistakes abruptly.</p>
                                <div className={styles.guideActions}>
                                    <div className={styles.actionItem}>
                                        <Crosshair size={14} color="var(--color-primary)" />
                                        <span>Simplify choices (e.g., 2 shirt options instead of a full closet)</span>
                                    </div>
                                    <div className={styles.actionItem}>
                                        <Crosshair size={14} color="var(--color-primary)" />
                                        <span>Automate safety (stove knobs, smart locks)</span>
                                    </div>
                                    <div className={styles.actionItem}>
                                        <Crosshair size={14} color="var(--color-primary)" />
                                        <span>Provide emotional reassurance during moments of frustration</span>
                                    </div>
                                </div>
                            </div>
                        </div>

                        <div className={styles.resourceCard}>
                            <h3 className={styles.resourceTitle}><BookOpen size={16} /> Recommended Reading</h3>
                            <a href="#" className={styles.resourceLink}>
                                Communicating with Stage 4 Patients <ArrowRight size={14} />
                            </a>
                            <a href="#" className={styles.resourceLink}>
                                Home Safety Modifications <ArrowRight size={14} />
                            </a>
                            <a href="#" className={styles.resourceLink}>
                                Managing Sundowning <ArrowRight size={14} />
                            </a>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}
