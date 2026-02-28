'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/ui/AppLayout';
import { todaysTasks, CaretakerTask } from '@/lib/mock-data/caretaker';
import { CheckCircle2, Circle, Clock, AlertCircle, ChevronDown, ChevronUp } from 'lucide-react';

const catColors: Record<string, string> = {
    medication: 'badge--danger',
    medicine: 'badge--danger',
    meal: 'badge--warning',
    activity: 'badge--success',
    exercise: 'badge--success',
    game: 'badge--purple',
    chore: 'badge--info',
    therapy: 'badge--success',
    hygiene: 'badge--info',
    check: 'badge--danger',
    rest: 'badge--info',
    social: 'badge--purple',
};

// Border-left accent colors per category
const catAccent: Record<string, string> = {
    medication: '#EF4444',
    medicine: '#EF4444',
    meal: '#F59E0B',
    activity: '#22C55E',
    exercise: '#22C55E',
    game: '#8B5CF6',
    chore: '#0EA5E9',
    therapy: '#10B981',
    hygiene: '#0EA5E9',
    check: '#EF4444',
    rest: '#3B82F6',
    social: '#EC4899',
};

const catLabel: Record<string, string> = {
    medication: '💊 Medicine',
    medicine: '💊 Medicine',
    meal: '🍽️ Meal',
    activity: '🏃 Exercise',
    exercise: '🏃 Exercise',
    game: '🎮 Game',
    chore: '✨ Chore',
    therapy: '🧠 Therapy',
    hygiene: '🚿 Hygiene',
    check: '🩺 Check',
    rest: '😴 Rest',
    social: '📞 Social',
};


function TaskRow({ task, onToggle }: { task: CaretakerTask; onToggle: (id: string) => void }) {
    const [open, setOpen] = useState(false);
    const [notes, setNotes] = useState(task.notes ?? '');
    const isDone = task.status === 'completed';
    const isOverdue = task.status === 'overdue';

    const accent = catAccent[task.category] ?? (isDone ? 'var(--color-success)' : isOverdue ? 'var(--color-danger)' : 'var(--border-subtle)');
    const borderColor = isDone ? 'var(--color-success)' : isOverdue ? 'var(--color-danger)' : 'var(--border-subtle)';
    const bg = isDone ? 'var(--color-success-bg)' : isOverdue ? 'var(--color-danger-bg)' : 'var(--bg-surface)';

    return (
        <article
            style={{
                background: bg,
                border: `1px solid ${borderColor}`,
                borderLeft: `4px solid ${accent}`,

                borderRadius: 14,
                overflow: 'hidden',
                transition: 'all 0.2s ease',
            }}
        >
            <div style={{ display: 'flex', alignItems: 'center', gap: 14, padding: '14px 16px' }}>
                {/* Toggle button */}
                <button
                    onClick={() => onToggle(task.id)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', padding: 0, flexShrink: 0, display: 'flex', color: isDone ? 'var(--color-success)' : isOverdue ? 'var(--color-danger)' : 'var(--text-muted)' }}
                    aria-label={isDone ? 'Mark as pending' : 'Mark as completed'}
                >
                    {isDone ? <CheckCircle2 size={24} /> : <Circle size={24} />}
                </button>

                {/* Content */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                        <p style={{
                            fontSize: 15,
                            fontWeight: isDone ? 500 : 600,
                            color: isDone ? 'var(--text-muted)' : 'var(--text-heading)',
                            textDecoration: isDone ? 'line-through' : 'none',
                        }}>
                            {task.title}
                        </p>
                        <span className={`badge ${catColors[task.category] ?? 'badge--purple'}`} style={{ fontSize: 11 }}>
                            {catLabel[task.category] ?? task.category}
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 4 }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 4, color: isOverdue ? 'var(--color-danger)' : 'var(--text-muted)', fontSize: 12 }}>
                            {isOverdue ? <AlertCircle size={12} /> : <Clock size={12} />}
                            <span>{isOverdue ? `Overdue — was ${task.time}` : task.time}</span>
                        </div>
                        {isDone && task.completedAt && (
                            <span style={{ fontSize: 11, color: 'var(--color-success)', fontWeight: 500 }}>
                                ✓ Done at {task.completedAt}
                            </span>
                        )}
                    </div>
                </div>

                {/* Expand notes */}
                <button
                    onClick={() => setOpen(o => !o)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', display: 'flex', padding: 4 }}
                    aria-label={open ? 'Collapse notes' : 'Expand notes'}
                >
                    {open ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {open && (
                <div style={{ padding: '0 16px 16px', borderTop: '1px solid rgba(124,58,237,0.08)' }}>
                    <label style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', display: 'block', marginTop: 12, marginBottom: 6 }}>
                        Notes
                    </label>
                    <textarea
                        className="form-textarea"
                        value={notes}
                        onChange={e => setNotes(e.target.value)}
                        placeholder="Add any observations or notes…"
                        style={{ minHeight: 72, fontSize: 14 }}
                    />
                </div>
            )}
        </article>
    );
}

export default function CaretakerSchedulePage() {
    const [tasks, setTasks] = useState<CaretakerTask[]>(todaysTasks);

    const toggle = (id: string) => {
        setTasks(prev => prev.map(t => {
            if (t.id !== id) return t;
            const next = t.status === 'completed' ? 'pending' : 'completed';
            return { ...t, status: next, completedAt: next === 'completed' ? new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' }) : undefined };
        }));
    };

    const done = tasks.filter(t => t.status === 'completed').length;
    const overdue = tasks.filter(t => t.status === 'overdue').length;
    const total = tasks.length;
    const pct = Math.round((done / total) * 100);

    return (
        <AppLayout role="caretaker" userName="Anita Desai" alertCount={1}>
            <div style={{ padding: '32px 32px 48px', maxWidth: 760, margin: '0 auto' }}>

                {/* Header */}
                <div style={{ marginBottom: 24 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>
                        Today's Tasks
                    </h1>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 15 }}>
                        {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })} · Shift: 8 AM–4 PM
                    </p>
                </div>

                {/* Progress bar */}
                <div className="card" style={{ padding: '20px 24px', marginBottom: 24, background: 'var(--bg-surface)' }}>
                    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 10 }}>
                        <div style={{ display: 'flex', gap: 16 }}>
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                <strong style={{ color: 'var(--color-success)', fontWeight: 700 }}>{done}</strong> completed
                            </span>
                            {overdue > 0 && (
                                <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                    <strong style={{ color: 'var(--color-danger)', fontWeight: 700 }}>{overdue}</strong> overdue
                                </span>
                            )}
                            <span style={{ fontSize: 13, color: 'var(--text-muted)' }}>
                                <strong style={{ color: 'var(--text-heading)', fontWeight: 700 }}>{total}</strong> total
                            </span>
                        </div>
                        <span style={{ fontSize: 15, fontWeight: 700, color: 'var(--color-primary)' }}>{pct}%</span>
                    </div>
                    {/* Progress bar */}
                    <div style={{ height: 8, borderRadius: 999, background: 'var(--bg-surface-soft)', overflow: 'hidden' }}>
                        <div style={{
                            height: '100%',
                            width: `${pct}%`,
                            borderRadius: 999,
                            background: 'linear-gradient(90deg, #7C3AED, #C084FC)',
                            transition: 'width 0.6s ease',
                        }} />
                    </div>
                </div>

                {/* Task list */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                    {tasks.map(task => (
                        <TaskRow key={task.id} task={task} onToggle={toggle} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
