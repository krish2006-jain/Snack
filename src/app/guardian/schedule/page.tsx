'use client';

import { useState } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockSchedule, ScheduleTask, DAYS, type Day } from '@/lib/mock-data';
import { Plus, Trash2, CheckCircle2, Circle, Clock, Pill, Dumbbell, Brain, UtensilsCrossed, Bath, Users } from 'lucide-react';
import styles from './page.module.css';

const CATEGORY_META: Record<string, { label: string; color: string; icon: React.ReactNode }> = {
    medication: { label: '💊 Medicine', color: '#B91C1C', icon: <Pill size={13} /> },
    medicine: { label: '💊 Medicine', color: '#B91C1C', icon: <Pill size={13} /> },
    exercise: { label: '🏃 Exercise', color: '#15803D', icon: <Dumbbell size={13} /> },
    game: { label: '🎮 Game', color: '#6D28D9', icon: <Brain size={13} /> },
    chore: { label: '✨ Chore', color: '#0369A1', icon: <Bath size={13} /> },
    therapy: { label: '🧠 Therapy', color: '#065F46', icon: <Brain size={13} /> },
    meal: { label: '🍽️ Meal', color: '#B45309', icon: <UtensilsCrossed size={13} /> },
    hygiene: { label: '🚿 Hygiene', color: '#0369A1', icon: <Bath size={13} /> },
    social: { label: '📞 Social', color: '#9D174D', icon: <Users size={13} /> },
    rest: { label: '😴 Rest', color: '#1E3A5F', icon: <Users size={13} /> },
};

type Category = ScheduleTask['category'];

const EMPTY_TASK: Omit<ScheduleTask, 'id'> = {
    time: '09:00', title: '', description: '', completed: false, day: 'Mon', category: 'medication',
};

export default function SchedulePage() {
    const [tasks, setTasks] = useState<ScheduleTask[]>(mockSchedule);
    const [activeDay, setActiveDay] = useState<Day>('Mon');
    const [showForm, setShowForm] = useState(false);
    const [form, setForm] = useState({ ...EMPTY_TASK });

    const dayTasks = tasks.filter(t => t.day === activeDay).sort((a, b) => a.time.localeCompare(b.time));
    const completedCount = dayTasks.filter(t => t.completed).length;

    const toggleComplete = (id: string) => {
        setTasks(prev => prev.map(t => t.id === id ? { ...t, completed: !t.completed } : t));
    };

    const deleteTask = (id: string) => {
        setTasks(prev => prev.filter(t => t.id !== id));
    };

    const addTask = () => {
        if (!form.title.trim()) return;
        const newTask: ScheduleTask = { ...form, id: `t-${Date.now()}` };
        setTasks(prev => [...prev, newTask]);
        setForm({ ...EMPTY_TASK, day: activeDay as Day });
        setShowForm(false);
    };

    const weekStats = DAYS.map(day => {
        const dayT = tasks.filter(t => t.day === day);
        return { day, total: dayT.length, completed: dayT.filter(t => t.completed).length };
    });

    return (
        <div className={styles.page}>
            <GuardianHeader title="Schedule Editor" subtitle="Weekly care plan - Monday, 28 Feb 2026" />
            <main className={styles.content}>
                {/* Week overview bar */}
                <section className={styles.weekBar} aria-label="Week completion overview">
                    {weekStats.map(({ day, total, completed }) => (
                        <button
                            key={day}
                            className={`${styles.dayTab} ${activeDay === day ? styles.dayTabActive : ''}`}
                            onClick={() => setActiveDay(day)}
                            aria-pressed={activeDay === day}
                            data-tooltip={`${day}: ${completed}/${total} tasks completed`}
                        >
                            <span className={styles.dayName}>{day}</span>
                            <span className={styles.dayCount}>{completed}/{total}</span>
                            <div className={styles.dayProgress}>
                                <div
                                    className={styles.dayFill}
                                    style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0%' }}
                                />
                            </div>
                        </button>
                    ))}
                </section>

                <div className={styles.layout}>
                    {/* Task list */}
                    <section className={styles.taskSection}>
                        <div className={styles.sectionHeader}>
                            <div>
                                <h2 className={styles.sectionTitle}>{activeDay}&#39;s Tasks</h2>
                                <p className={styles.sectionSub}>{completedCount} of {dayTasks.length} completed</p>
                            </div>
                            <button className={styles.addBtn} onClick={() => { setForm({ ...EMPTY_TASK, day: activeDay }); setShowForm(true); }} data-tooltip="Add a new care task to this day's schedule">
                                <Plus size={16} aria-hidden="true" /> Add Task
                            </button>
                        </div>

                        {showForm && (
                            <div className={styles.formCard}>
                                <h3 className={styles.formTitle}>New Task</h3>
                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="task-time">Time</label>
                                        <input id="task-time" type="time" className={styles.input} value={form.time}
                                            onChange={e => setForm(p => ({ ...p, time: e.target.value }))} />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label className={styles.label} htmlFor="task-cat">Category</label>
                                        <select id="task-cat" className={styles.input} value={form.category}
                                            onChange={e => setForm(p => ({ ...p, category: e.target.value as Category }))}>
                                            {Object.entries(CATEGORY_META).map(([k, v]) => (
                                                <option key={k} value={k}>{v.label}</option>
                                            ))}
                                        </select>
                                    </div>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                        <label className={styles.label} htmlFor="task-title">Title</label>
                                        <input id="task-title" type="text" className={styles.input} placeholder="Task title..."
                                            value={form.title} onChange={e => setForm(p => ({ ...p, title: e.target.value }))} />
                                    </div>
                                    <div className={styles.formGroup} style={{ gridColumn: '1 / -1' }}>
                                        <label className={styles.label} htmlFor="task-desc">Description</label>
                                        <input id="task-desc" type="text" className={styles.input} placeholder="Optional details..."
                                            value={form.description} onChange={e => setForm(p => ({ ...p, description: e.target.value }))} />
                                    </div>
                                </div>
                                <div className={styles.formActions}>
                                    <button className={styles.cancelBtn} onClick={() => setShowForm(false)}>Cancel</button>
                                    <button className={styles.saveBtn} onClick={addTask}>Add Task</button>
                                </div>
                            </div>
                        )}

                        <ul className={styles.taskList}>
                            {dayTasks.length === 0 && (
                                <li className={styles.emptyState}>No tasks for {activeDay}. Add one above.</li>
                            )}
                            {dayTasks.map(task => {
                                const meta = CATEGORY_META[task.category];
                                return (
                                    <li key={task.id} className={`${styles.taskCard} ${task.completed ? styles.taskDone : ''}`}>
                                        <button
                                            className={styles.checkBtn}
                                            onClick={() => toggleComplete(task.id)}
                                            aria-label={task.completed ? `Mark ${task.title} incomplete` : `Mark ${task.title} complete`}
                                            data-tooltip={task.completed ? 'Mark as not yet done' : 'Mark this task as completed'}
                                        >
                                            {task.completed
                                                ? <CheckCircle2 size={22} color="var(--color-success)" />
                                                : <Circle size={22} color="var(--text-muted)" />}
                                        </button>
                                        <div className={styles.taskBody}>
                                            <div className={styles.taskTop}>
                                                <span className={styles.taskTitle}>{task.title}</span>
                                                <span className={styles.taskBadge} style={{ background: meta.color + '18', color: meta.color }}>
                                                    {meta.icon} {meta.label}
                                                </span>
                                            </div>
                                            {task.description && <p className={styles.taskDesc}>{task.description}</p>}
                                            <span className={styles.taskTime}><Clock size={11} aria-hidden="true" /> {task.time}</span>
                                        </div>
                                        <button
                                            className={styles.deleteBtn}
                                            onClick={() => deleteTask(task.id)}
                                            aria-label={`Delete ${task.title}`}
                                            data-tooltip="Permanently remove this task from the schedule"
                                        >
                                            <Trash2 size={15} aria-hidden="true" />
                                        </button>
                                    </li>
                                );
                            })}
                        </ul>
                    </section>

                    {/* Stats panel */}
                    <aside className={styles.statsPanel}>
                        <h3 className={styles.statsTitle}>Week Statistics</h3>
                        {weekStats.map(({ day, total, completed }) => (
                            <div key={day} className={styles.statRow} data-tooltip={`${day}: ${completed} of ${total} tasks completed`}>
                                <span className={styles.statDay}>{day}</span>
                                <div className={styles.statBarWrap}>
                                    <div className={styles.statBar}>
                                        <div className={styles.statFill} style={{ width: total > 0 ? `${(completed / total) * 100}%` : '0' }} />
                                    </div>
                                    <span className={styles.statFrac}>{completed}/{total}</span>
                                </div>
                            </div>
                        ))}
                        <div className={styles.statsDivider} />
                        <div className={styles.categoryKey}>
                            <h4 className={styles.keyTitle}>Categories</h4>
                            {Object.entries(CATEGORY_META).map(([k, v]) => (
                                <div key={k} className={styles.keyItem}>
                                    <span className={styles.keyDot} style={{ background: v.color }} aria-hidden="true" />
                                    <span>{v.label}</span>
                                </div>
                            ))}
                        </div>
                    </aside>
                </div>
            </main>
        </div>
    );
}
