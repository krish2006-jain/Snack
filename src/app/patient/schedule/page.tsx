'use client';

import { useState } from 'react';
import { CheckCircle, Clock, Dumbbell, Pill, BookOpen, Utensils, Moon, Phone, Check } from 'lucide-react';
import styles from './schedule.module.css';
import { mockSchedule, type ScheduleTask } from '@/lib/mock-data/patient';

const categoryIcons: Record<string, React.ReactNode> = {
    Exercise: <Dumbbell size={20} />,
    Medication: <Pill size={20} />,
    Therapy: <BookOpen size={20} />,
    Meal: <Utensils size={20} />,
    Rest: <Moon size={20} />,
    Social: <Phone size={20} />,
};

const categoryColors: Record<string, string> = {
    Exercise: '#2D7A4F',
    Medication: '#C0392B',
    Therapy: '#4A7C5C',
    Meal: '#C4841D',
    Rest: '#2B6CB0',
    Social: '#B8860B',
};

const statusLabel: Record<ScheduleTask['status'], string> = {
    done: 'Done',
    upcoming: 'Coming up',
    missed: 'Missed',
};

const statusBadge: Record<ScheduleTask['status'], string> = {
    done: 'badge--success',
    upcoming: 'badge--warning',
    missed: 'badge--danger',
};

export default function SchedulePage() {
    const [tasks, setTasks] = useState(mockSchedule);

    const markDone = (id: string) => {
        setTasks((prev) =>
            prev.map((t) => (t.id === id ? { ...t, status: 'done' as const } : t))
        );
    };

    const doneCount = tasks.filter((t) => t.status === 'done').length;
    const pct = Math.round((doneCount / tasks.length) * 100);

    return (
        <div className={styles.page}>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div>
                    <h1 className={styles.pageTitle}>Today&apos;s Schedule</h1>
                    <p className={styles.pageSubtitle}>
                        {doneCount} of {tasks.length} tasks completed
                    </p>
                </div>
                {/* Progress ring-style bar */}
                <div className={styles.progressRing}>
                    <svg viewBox="0 0 44 44" className={styles.ringSvg} aria-hidden="true">
                        <circle cx="22" cy="22" r="18" fill="none" stroke="var(--border-subtle)" strokeWidth="4" />
                        <circle
                            cx="22"
                            cy="22"
                            r="18"
                            fill="none"
                            stroke="var(--color-primary)"
                            strokeWidth="4"
                            strokeLinecap="round"
                            strokeDasharray={`${(pct / 100) * 113} 113`}
                            transform="rotate(-90 22 22)"
                        />
                    </svg>
                    <span className={styles.ringPct}>{pct}%</span>
                </div>
            </div>

            {/* Task list */}
            <ul className={styles.taskList} aria-label="Today's tasks">
                {tasks.map((task, idx) => (
                    <li
                        key={task.id}
                        className={`${styles.taskCard} card card--${task.status}`}
                        aria-label={`${task.title} at ${task.time}, status: ${statusLabel[task.status]}`}
                    >
                        {/* Left: category color bar is handled by card--status border */}
                        {/* Category photo / icon block */}
                        <div
                            className={styles.taskIconBlock}
                            style={{ background: `${categoryColors[task.category]}18` }}
                        >
                            <div style={{ color: categoryColors[task.category] }}>
                                {categoryIcons[task.category] ?? <CheckCircle size={20} />}
                            </div>
                            <span
                                className={styles.taskCategoryLabel}
                                style={{ color: categoryColors[task.category] }}
                            >
                                {task.category}
                            </span>
                        </div>

                        {/* Task info */}
                        <div className={styles.taskInfo}>
                            <div className={styles.taskMeta}>
                                <div className={styles.taskTimeRow}>
                                    <Clock size={14} color="var(--text-muted)" />
                                    <span className={styles.taskTime}>{task.time}</span>
                                    <span className={`badge ${statusBadge[task.status]}`}>
                                        {statusLabel[task.status]}
                                    </span>
                                </div>
                                <h2 className={styles.taskTitle}>{task.title}</h2>
                                <p className={styles.taskDesc}>{task.description}</p>
                            </div>

                            {/* Action button */}
                            {task.status !== 'done' && (
                                <button
                                    className={`btn btn--primary btn--patient ${styles.doneBtn}`}
                                    onClick={() => markDone(task.id)}
                                    aria-label={`Mark ${task.title} as done`}
                                >
                                    <Check size={20} strokeWidth={2.5} />
                                    Done
                                </button>
                            )}

                            {task.status === 'done' && (
                                <div className={styles.doneIndicator}>
                                    <CheckCircle size={22} color="var(--color-success)" />
                                    <span>Completed</span>
                                </div>
                            )}
                        </div>
                    </li>
                ))}
            </ul>
        </div>
    );
}
