'use client';

import { useState } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { Activity, Brain, Shield, Crosshair, ArrowRight, BookOpen, ChevronRight } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './page.module.css';

interface StageData {
    level: number;
    name: string;
    clinical: string;
    description: string;
    strengths: string[];
    challenges: string[];
    tips: { title: string; items: string[] }[];
}

const STAGES: StageData[] = [
    {
        level: 1, name: 'Normal', clinical: 'No Cognitive Decline',
        description: 'No measurable cognitive impairment. The individual functions normally in daily life with no memory concerns reported by themselves or others.',
        strengths: ['Full independence in all activities', 'Normal memory and reasoning', 'No observable deficits', 'Able to manage complex tasks'],
        challenges: ['None - this is the baseline stage'],
        tips: [{ title: 'Prevention', items: ['Encourage regular exercise', 'Maintain social engagement', 'Healthy diet rich in omega-3s', 'Mental stimulation through puzzles and reading'] }],
    },
    {
        level: 2, name: 'Very Mild', clinical: 'Very Mild Cognitive Decline',
        description: 'Subjective complaints of memory loss - the individual may forget familiar names or misplace objects. These changes are not detectable by friends, family, or during medical examination.',
        strengths: ['Fully independent in daily activities', 'Can manage work and social obligations', 'Memory lapses are normal age-related changes', 'No functional impact'],
        challenges: ['Occasional word-finding difficulty', 'Misplacing objects (keys, glasses)', 'Forgetting names of acquaintances'],
        tips: [{ title: 'Monitoring', items: ['Keep a memory journal to track concerns', 'Annual cognitive screening with doctor', 'Maintain physical and social activity', 'Reduce stress and improve sleep quality'] }],
    },
    {
        level: 3, name: 'Mild', clinical: 'Mild Cognitive Decline',
        description: 'Early-stage cognitive decline becomes noticeable to close family and colleagues. Difficulty concentrating, decreased work performance, and getting lost in unfamiliar locations may occur.',
        strengths: ['Can still perform most daily activities', 'Recognises all family and friends', 'Retains long-term memories well', 'Can manage personal hygiene independently'],
        challenges: ['Difficulty with complex planning or organising', 'Reduced performance at work', 'Getting lost when travelling to new places', 'Increased anxiety about cognitive changes', 'Difficulty remembering names of new acquaintances'],
        tips: [{ title: 'Early Intervention', items: ['Consult a neurologist for formal assessment', 'Begin organisational aids (calendars, lists)', 'Discuss legal and financial planning early', 'Join a support group for early-stage diagnosis'] }],
    },
    {
        level: 4, name: 'Moderate', clinical: 'Moderate Cognitive Decline',
        description: 'Clear-cut deficits in complex task management - handling finances, planning meals, or organising travel. Short-term memory gaps are frequent: recent events, conversations, and appointments may be forgotten. The individual remains aware of familiar surroundings and recognises close family.',
        strengths: ['Recognises immediate family comfortably', 'Can perform basic ADLs (dressing, eating) independently', 'Enjoys familiar music, old photos, and stories', 'Retains long-term procedural memory (e.g., cooking familiar recipes)', 'Can follow simple, one-step instructions reliably', 'Oriented to time of day and familiar locations'],
        challenges: ['Short-term memory recall is inconsistent', 'Struggles with new technology or complex instructions', 'Occasional disorientation in unfamiliar places', 'Difficulty managing finances, bills, and appointments', 'May confuse dates, seasons, or recent events', 'Social withdrawal and emotional mood fluctuations'],
        tips: [
            { title: 'Communication', items: ['Use short, simple sentences - one idea at a time', 'Allow extra time for responses; avoid rushing', 'Gently redirect instead of correcting mistakes', 'Use visual cues (photos, labels) to aid understanding'] },
            { title: 'Daily Routine', items: ['Maintain a consistent daily schedule for meals, walks, and rest', 'Lay out clothes in advance to simplify choices', 'Use reminders and alarms for medications', 'Engage with familiar activities: music, gardening, puzzles'] },
        ],
    },
    {
        level: 5, name: 'Moderately Severe', clinical: 'Moderately Severe Cognitive Decline',
        description: 'The individual can no longer survive without assistance. They may be unable to recall their own address, phone number, or the names of close family members. Disorientation to time and place is common.',
        strengths: ['Still knows own name', 'Can distinguish familiar from unfamiliar faces', 'Retains some long-term memories', 'Can eat and use the toilet with guidance'],
        challenges: ['Cannot recall address or phone number', 'Needs help choosing appropriate clothing', 'Frequently disoriented to time/place', 'May wander and become lost', 'Significant difficulty with basic arithmetic', 'Requires supervision for safety'],
        tips: [{ title: 'Safety & Support', items: ['Install door alarms and GPS tracking', 'Supervise all medication administration', 'Simplify the living environment', 'Use nightlights to reduce sundowning confusion', 'Establish a consistent caretaker routine'] }],
    },
    {
        level: 6, name: 'Severe', clinical: 'Severe Cognitive Decline',
        description: 'Personality and emotional changes become prominent. The individual requires extensive help with daily activities including dressing, bathing, and toileting. They may not remember the name of their spouse or primary caretaker.',
        strengths: ['Can distinguish familiar from unfamiliar faces', 'Responds to non-verbal communication (touch, tone)', 'Retains some emotional memory', 'Can walk with assistance'],
        challenges: ['Unaware of recent experiences and surroundings', 'Incontinence may develop', 'Personality changes (suspicion, delusions, repetitive behaviour)', 'Needs full-time assistance with personal care', 'Difficulty completing any task without step-by-step guidance', 'Sleep pattern disruptions'],
        tips: [{ title: 'Comfort Care', items: ['Focus on comfort, dignity, and emotional connection', 'Use gentle touch and soothing voice', 'Play familiar music or nature sounds', 'Maintain physical activity (gentle walks, stretching)', 'Consider respite care for caretaker well-being'] }],
    },
    {
        level: 7, name: 'Very Severe', clinical: 'Very Severe Cognitive Decline',
        description: 'The final stage - the individual loses the ability to respond to their environment, communicate verbally, and eventually control movement. Total care is required.',
        strengths: ['May still respond to familiar voices and music', 'Can experience comfort from gentle touch', 'Reflexive responses remain intact'],
        challenges: ['Loss of speech (limited to few words)', 'Loss of ability to walk, sit, or hold head up', 'Requires total assistance for all activities', 'Swallowing difficulties may develop', 'Susceptible to infections'],
        tips: [{ title: 'End-of-Life Care', items: ['Prioritise comfort and pain management', 'Maintain skin integrity and positioning', 'Engage hospice and palliative care teams', 'Provide sensory stimulation (music, aromatherapy)', 'Emotional support for family and caretakers'] }],
    },
];

const CURRENT_STAGE = 4;

export default function CareStagePage() {
    const { user } = useSession();
    const patientFirstName = user?.patientName?.split(' ')[0] || 'The patient';
    const [selectedStage, setSelectedStage] = useState(CURRENT_STAGE - 1); // 0-indexed
    const stage = STAGES[selectedStage];
    const isCurrent = stage.level === CURRENT_STAGE;

    return (
        <div className={styles.page}>
            <GuardianHeader
                title="Alzheimer's Care Stage"
                subtitle="Global Deterioration Scale (GDS) - Current Assessment"
            />

            <main className={styles.content}>

                <div className={styles.grid}>

                    {/* Main Panel */}
                    <section className={styles.mainPanel}>
                        <div className={styles.stageHero}>
                            <span className={styles.stageLabel}>
                                {isCurrent ? 'Current Assessment (Last verified: 12 Feb 2026)' : `Exploring Stage ${stage.level}`}
                            </span>
                            <h1 className={styles.stageTitle}>
                                Stage {stage.level}: {stage.clinical}
                                {isCurrent && <span className={styles.currentBadge}>Current</span>}
                            </h1>
                            <p className={styles.stageDesc}>
                                {isCurrent
                                    ? `${patientFirstName} is in the ${stage.name.toLowerCase()} cognitive decline phase, corresponding to Stage ${stage.level} on the Global Deterioration Scale (GDS). ${stage.description}`
                                    : stage.description}
                            </p>

                            {/* Timeline - clickable stages */}
                            <div className={styles.timeline}>
                                {STAGES.map((s, i) => (
                                    <button
                                        key={s.level}
                                        className={`${styles.timelineNode} ${s.level === CURRENT_STAGE ? styles.nodeCurrent : s.level < CURRENT_STAGE ? styles.nodePast : ''} ${selectedStage === i ? styles.nodeSelected : ''}`}
                                        onClick={() => setSelectedStage(i)}
                                        aria-label={`View Stage ${s.level}: ${s.name}${s.level === CURRENT_STAGE ? ' (current)' : ''}`}
                                        aria-pressed={selectedStage === i}
                                        data-tooltip={`Stage ${s.level}: ${s.clinical}${s.level === CURRENT_STAGE ? ' - Current assessment' : ''}`}
                                        data-tooltip-pos="bottom"
                                    >
                                        <div className={styles.nodeCircle}>{s.level}</div>
                                        <span className={styles.nodeName}>{s.name}</span>
                                    </button>
                                ))}
                                <div className={styles.timelineLine} />
                            </div>
                        </div>

                        {/* Strengths & Challenges */}
                        <div className={styles.capabilities}>
                            <h2 className={styles.sectionTitle}>
                                {isCurrent ? 'Current Capabilities & Challenges' : `Stage ${stage.level} - Capabilities & Challenges`}
                            </h2>
                            <div className={styles.capGrid}>
                                <div className={styles.capCard} style={{ borderColor: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
                                    <div className={styles.capHeader}>
                                        <Brain size={16} color="var(--color-success)" />
                                        <span className={styles.capTitle}>Strengths</span>
                                    </div>
                                    <ul className={styles.list}>
                                        {stage.strengths.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                                <div className={styles.capCard} style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-bg)' }}>
                                    <div className={styles.capHeader}>
                                        <Activity size={16} color="var(--color-warning)" />
                                        <span className={styles.capTitle}>Challenges</span>
                                    </div>
                                    <ul className={styles.list}>
                                        {stage.challenges.map((s, i) => <li key={i}>{s}</li>)}
                                    </ul>
                                </div>
                            </div>
                        </div>

                        {/* Care Tips */}
                        <div className={styles.capabilities}>
                            <h2 className={styles.sectionTitle}>Care Tips for Stage {stage.level}</h2>
                            <div className={styles.capGrid}>
                                {stage.tips.map((tip, i) => (
                                    <div key={i} className={styles.capCard} style={{
                                        borderColor: i === 0 ? 'var(--color-info)' : 'var(--color-primary)',
                                        background: i === 0 ? 'var(--color-info-bg)' : 'var(--color-primary-muted)',
                                    }}>
                                        <div className={styles.capHeader}>
                                            <Shield size={16} color={i === 0 ? 'var(--color-info)' : 'var(--color-primary)'} />
                                            <span className={styles.capTitle}>{tip.title}</span>
                                        </div>
                                        <ul className={styles.list}>
                                            {tip.items.map((item, j) => <li key={j}>{item}</li>)}
                                        </ul>
                                    </div>
                                ))}
                            </div>
                        </div>
                    </section>

                    {/* Guidelines Sidebar */}
                    <aside className={styles.sidebar}>
                        <div className={styles.guideCard}>
                            <h2 className={styles.guideTitle}>
                                <Shield size={16} aria-hidden="true" /> Caretaker Guidelines for Stage {stage.level}
                            </h2>
                            <div className={styles.guideContent}>
                                <p>
                                    {isCurrent
                                        ? 'Provide structure and routine. Introduce cues for orientation but avoid correcting mistakes abruptly.'
                                        : `This is ${stage.level < CURRENT_STAGE ? 'a past' : 'an upcoming'} stage. Understanding it helps you prepare and track progression.`}
                                </p>
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
                            <a href="#" className={styles.resourceLink} data-tooltip="Evidence-based guidance on effective communication at this stage">
                                Communicating with Stage {stage.level} Patients <ArrowRight size={14} />
                            </a>
                            <a href="#" className={styles.resourceLink} data-tooltip="Practical ways to make the home environment safer and more navigable">
                                Home Safety Modifications <ArrowRight size={14} />
                            </a>
                            <a href="#" className={styles.resourceLink} data-tooltip="Understanding and managing evening confusion and agitation">
                                Managing Sundowning <ArrowRight size={14} />
                            </a>
                        </div>
                    </aside>

                </div>
            </main>
        </div>
    );
}
