'use client';

import { useState, useEffect } from 'react';
import {
    Pill,
    Utensils,
    Gamepad2,
    Sparkles,
    Brain,
    Dumbbell,
    Moon,
    Phone,
    CheckCircle,
    Clock,
    Check,
} from 'lucide-react';
import styles from './schedule.module.css';
import { mockSchedule, type ScheduleTask } from '@/lib/mock-data/patient';

// ─── Category configuration ────────────────────────────────────────────────────
interface CategoryConfig {
    label: string;
    icon: React.ReactNode;
    color: string;      // text / icon colour
    bg: string;         // subtle tinted background
    accent: string;     // button / active-tab colour
    emoji: string;
}

const CATEGORY: Record<string, CategoryConfig> = {
    Medicine: {
        label: 'Medicine',
        icon: <Pill size={20} strokeWidth={2} />,
        color: '#B91C1C',
        bg: '#FEF2F2',
        accent: '#EF4444',
        emoji: '💊',
    },
    Medication: {
        label: 'Medicine',
        icon: <Pill size={20} strokeWidth={2} />,
        color: '#B91C1C',
        bg: '#FEF2F2',
        accent: '#EF4444',
        emoji: '💊',
    },
    Meal: {
        label: 'Meal',
        icon: <Utensils size={20} strokeWidth={2} />,
        color: '#B45309',
        bg: '#FFFBEB',
        accent: '#F59E0B',
        emoji: '🍽️',
    },
    Game: {
        label: 'Game',
        icon: <Gamepad2 size={20} strokeWidth={2} />,
        color: '#6D28D9',
        bg: '#F5F3FF',
        accent: '#8B5CF6',
        emoji: '🎮',
    },
    Chore: {
        label: 'Chore',
        icon: <Sparkles size={20} strokeWidth={2} />,
        color: '#0369A1',
        bg: '#F0F9FF',
        accent: '#0EA5E9',
        emoji: '✨',
    },
    Therapy: {
        label: 'Therapy',
        icon: <Brain size={20} strokeWidth={2} />,
        color: '#065F46',
        bg: '#ECFDF5',
        accent: '#10B981',
        emoji: '🧠',
    },
    Exercise: {
        label: 'Exercise',
        icon: <Dumbbell size={20} strokeWidth={2} />,
        color: '#14532D',
        bg: '#F0FDF4',
        accent: '#22C55E',
        emoji: '🏃',
    },
    Rest: {
        label: 'Rest',
        icon: <Moon size={20} strokeWidth={2} />,
        color: '#1E3A5F',
        bg: '#EFF6FF',
        accent: '#3B82F6',
        emoji: '😴',
    },
    Social: {
        label: 'Social',
        icon: <Phone size={20} strokeWidth={2} />,
        color: '#9D174D',
        bg: '#FDF2F8',
        accent: '#EC4899',
        emoji: '📞',
    },
};

const DEFAULT_CONFIG: CategoryConfig = {
    label: 'Task',
    icon: <CheckCircle size={20} strokeWidth={2} />,
    color: '#374151',
    bg: '#F9FAFB',
    accent: '#6B7280',
    emoji: '📋',
};

function getCat(category: string): CategoryConfig {
    return CATEGORY[category] ?? DEFAULT_CONFIG;
}

// Group categories into sections for visual separation
const SECTION_ORDER = ['Medicine', 'Meal', 'Game', 'Chore', 'Exercise', 'Therapy', 'Rest', 'Social'];

const statusLabel: Record<ScheduleTask['status'], string> = {
    done: 'Done',
    upcoming: 'Up next',
    missed: 'Missed',
};

function mapCategory(cat: string): string {
    const map: Record<string, string> = {
        medication: 'Medicine',
        meal: 'Meal',
        activity: 'Exercise',
        therapy: 'Therapy',
        rest: 'Rest',
        general: 'Social',
        game: 'Game',
        chore: 'Chore',
    };
    return map[cat.toLowerCase()] || cat;
}

export default function SchedulePage() {
    const [tasks, setTasks] = useState(mockSchedule);
    const [filter, setFilter] = useState<string>('All');

    useEffect(() => {
        fetch('/api/schedule')
            .then(r => r.json())
            .then(data => {
                if (data.tasks && data.tasks.length > 0) {
                    const mapped: ScheduleTask[] = data.tasks.map((t: {
                        id: string; title: string; scheduled_time: string;
                        is_completed: number; category: string; description: string; image_url: string;
                    }) => ({
                        id: t.id,
                        title: t.title,
                        time: t.scheduled_time,
                        status: t.is_completed ? 'done' as const : 'upcoming' as const,
                        category: mapCategory(t.category),
                        description: t.description || '',
                        photo: t.image_url || '',
                    }));
                    setTasks(mapped);
                }
            })
            .catch(() => { /* keep mock data */ });
    }, []);

    const markDone = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, status: 'done' as const } : t));
        fetch('/api/schedule', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ taskId: id, completed: true }),
        }).catch(() => { });
    };

    // Stats
    const doneCount = tasks.filter(t => t.status === 'done').length;
    const pct = tasks.length ? Math.round((doneCount / tasks.length) * 100) : 0;

    // Category filter tabs
    const presentCategories = Array.from(new Set(tasks.map(t => t.category)))
        .sort((a, b) => SECTION_ORDER.indexOf(a) - SECTION_ORDER.indexOf(b));

    const filtered = filter === 'All' ? tasks : tasks.filter(t => t.category === filter);

    // Group filtered tasks by category for the "All" view
    const grouped: Record<string, ScheduleTask[]> = {};
    if (filter === 'All') {
        SECTION_ORDER.forEach(cat => {
            const items = tasks.filter(t => t.category === cat || (cat === 'Medicine' && t.category === 'Medication'));
            if (items.length) grouped[cat] = items;
        });
        // catch any uncategorised
        tasks.forEach(t => {
            const norm = t.category === 'Medication' ? 'Medicine' : t.category;
            if (!SECTION_ORDER.includes(norm) && !grouped[norm]) grouped[norm] = [];
            if (!SECTION_ORDER.includes(norm)) grouped[norm].push(t);
        });
    }

    const circumference = 2 * Math.PI * 18;

    return (
        <div className={styles.page}>
            {/* ── Hero Banner ── */}
            <div className={styles.heroBanner}>
                <div className={styles.heroContent}>
                    <div className={styles.heroTextBlock}>
                        <h1 className={styles.pageTitle}>Today&apos;s Schedule</h1>
                        <p className={styles.pageSubtitle}>
                            {doneCount} of {tasks.length} tasks complete
                        </p>
                    </div>
                    <div className={styles.progressRing} aria-label={`${pct}% complete`}>
                        <svg viewBox="0 0 44 44" className={styles.ringSvg} aria-hidden="true">
                            <circle cx="22" cy="22" r="18" className={styles.ringTrack} />
                            <circle
                                cx="22" cy="22" r="18"
                                className={styles.ringProgress}
                                strokeDasharray={`${(pct / 100) * circumference} ${circumference}`}
                                transform="rotate(-90 22 22)"
                            />
                        </svg>
                        <span className={styles.ringPct}>{pct}%</span>
                    </div>
                </div>
            </div>

            {/* ── Body ── */}
            <div className={styles.bodyContent}>
                {/* ── Filter tabs ── */}
                <div className={styles.filterRow} role="tablist" aria-label="Filter tasks by category">
                    {['All', ...presentCategories].map(cat => {
                        const cfg = cat === 'All' ? null : getCat(cat);
                        const isActive = filter === cat;
                        return (
                            <button
                                key={cat}
                                role="tab"
                                aria-selected={isActive}
                                className={`${styles.filterTab} ${isActive ? styles.filterTabActive : ''}`}
                                style={isActive && cfg
                                    ? { background: cfg.accent, borderColor: cfg.accent, color: '#fff' }
                                    : isActive
                                        ? { background: 'var(--color-primary)', borderColor: 'var(--color-primary)', color: '#fff' }
                                        : undefined}
                                onClick={() => setFilter(cat)}
                                data-tooltip={cat === 'All' ? 'Show all tasks for today' : `Filter to show only ${cfg?.label} tasks`}
                            >
                                {cfg && <span className={styles.filterTabIcon}>{cfg.emoji}</span>}
                                {cfg?.label ?? 'All'}
                            </button>
                        );
                    })}
                </div>

                {/* ── Task list ── */}
                {filter === 'All' ? (
                    // Grouped view
                    <div className={styles.groupedList}>
                        {Object.entries(grouped).map(([cat, items]) => {
                            const cfg = getCat(cat);
                            return (
                                <section key={cat} className={styles.categorySection}>
                                    <div className={styles.sectionHeading}>
                                        <div className={styles.sectionIcon} style={{ background: cfg.bg }}>
                                            <span style={{ color: cfg.color }}>{cfg.icon}</span>
                                        </div>
                                        <h2 className={styles.sectionTitle} style={{ color: cfg.color }}>
                                            {cfg.label}
                                        </h2>
                                        <span className={styles.sectionCount}>
                                            {items.filter(t => t.status === 'done').length}/{items.length}
                                        </span>
                                    </div>
                                    <ul className={styles.taskList} aria-label={`${cfg.label} tasks`}>
                                        {items.map(task => (
                                            <TaskCard key={task.id} task={task} cfg={cfg} onDone={markDone} />
                                        ))}
                                    </ul>
                                </section>
                            );
                        })}
                    </div>
                ) : (
                    <ul className={styles.taskList} aria-label={`${filter} tasks`}>
                        {filtered.map(task => (
                            <TaskCard key={task.id} task={task} cfg={getCat(task.category)} onDone={markDone} />
                        ))}
                        {filtered.length === 0 && (
                            <li className={styles.emptyState}>No tasks in this category today.</li>
                        )}
                    </ul>
                )}
            </div>
        </div>
    );
}

function TaskCard({ task, cfg, onDone }: {
    task: ScheduleTask;
    cfg: CategoryConfig;
    onDone: (id: string) => void;
}) {
    const isDone = task.status === 'done';
    const isMissed = task.status === 'missed';

    return (
        <li
            className={`${styles.taskCard} ${isDone ? styles.taskDone : ''} ${isMissed ? styles.taskMissed : ''}`}
            aria-label={`${task.title} at ${task.time}, ${statusLabel[task.status]}`}
        >
            {/* Category icon badge */}
            <div className={styles.catIconBadge} style={{ background: cfg.bg }}>
                <span style={{ color: isDone ? 'var(--text-muted)' : cfg.color }}>
                    {cfg.icon}
                </span>
            </div>

            {/* Main content */}
            <div className={styles.taskContent}>
                <div className={styles.taskTopRow}>
                    <Clock size={12} color="var(--text-muted)" />
                    <span className={styles.taskTime}>{task.time}</span>
                    <span
                        className={styles.statusBadge}
                        style={{
                            background: isDone ? '#DCFCE7' : isMissed ? '#FEE2E2' : cfg.bg,
                            color: isDone ? '#166534' : isMissed ? '#B91C1C' : cfg.color,
                        }}
                    >
                        {statusLabel[task.status]}
                    </span>
                </div>
                <h2 className={`${styles.taskTitle} ${isDone ? styles.taskTitleDone : ''}`}>{task.title}</h2>
                {task.description && (
                    <p className={styles.taskDesc}>{task.description}</p>
                )}
            </div>

            {/* Action area */}
            <div className={styles.actionArea}>
                {!isDone && !isMissed && (
                    <button
                        className={styles.doneBtn}
                        style={{ background: cfg.accent }}
                        onClick={() => onDone(task.id)}
                        aria-label={`Mark ${task.title} as done`}
                        data-tooltip="Tap to mark this task as completed"
                    >
                        <Check size={16} strokeWidth={2.5} />
                        Done
                    </button>
                )}

                {isDone && (
                    <div className={styles.doneIndicator}>
                        <CheckCircle size={20} />
                        <span>Done</span>
                    </div>
                )}
            </div>
        </li>
    );
}
