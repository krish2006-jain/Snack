'use client';

import { useState } from 'react';
import { AppLayout } from '@/components/ui/AppLayout';
import { medications, Medication } from '@/lib/mock-data/caretaker';
import { CheckCircle2, Circle, AlertCircle, ChevronDown, ChevronUp, PenLine } from 'lucide-react';

const dayLabels = ['S', 'M', 'T', 'W', 'T', 'F', 'S'];

function HistoryDot({ status }: { status: 'given' | 'missed' | 'skipped' }) {
    const col = status === 'given' ? 'var(--color-success)' : status === 'missed' ? 'var(--color-danger)' : 'var(--text-muted)';
    return (
        <div title={status} style={{
            width: 10, height: 10, borderRadius: '50%',
            background: col, flexShrink: 0,
        }} aria-label={status} />
    );
}

function MedCard({ med }: { med: Medication }) {
    const [expanded, setExpanded] = useState(false);
    const [administered, setAdministered] = useState(med.administeredToday);
    const [note, setNote] = useState(med.addedNote ?? '');
    const [editingNote, setEditingNote] = useState(false);
    const [savedNote, setSavedNote] = useState(false);

    const allGiven = administered.every(Boolean);
    const missedCount = med.weeklyHistory.filter(h => h === 'missed').length;

    return (
        <article
            className="card"
            style={{
                padding: 0,
                background: 'var(--bg-surface)',
                overflow: 'hidden',
                borderLeft: allGiven ? '4px solid var(--color-success)' : missedCount > 1 ? '4px solid var(--color-danger)' : '4px solid var(--border-subtle)',
            }}
        >
            {/* Main row */}
            <div style={{ display: 'flex', alignItems: 'flex-start', gap: 16, padding: '18px 20px' }}>
                {/* Check(s) for each timing */}
                <div style={{ display: 'flex', flexDirection: 'column', gap: 6, paddingTop: 2 }}>
                    {med.timing.map((time, i) => (
                        <button
                            key={i}
                            onClick={() => setAdministered(prev => prev.map((v, j) => j === i ? !v : v))}
                            style={{ background: 'none', border: 'none', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 6, padding: 0 }}
                            aria-label={administered[i] ? `Mark ${time} dose as not given` : `Mark ${time} dose as given`}
                        >
                            {administered[i]
                                ? <CheckCircle2 size={22} color="var(--color-success)" />
                                : <Circle size={22} color="var(--text-muted)" />}
                            <span style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 500 }}>{time}</span>
                        </button>
                    ))}
                </div>

                {/* Info */}
                <div style={{ flex: 1, minWidth: 0 }}>
                    <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 8 }}>
                        <div>
                            <p style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>{med.name}</p>
                            <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 2 }}>{med.genericName} · {med.dosage}</p>
                        </div>
                        {missedCount > 0 && (
                            <span className="badge badge--danger" style={{ fontSize: 11, flexShrink: 0 }}>
                                <AlertCircle size={10} /> {missedCount} missed
                            </span>
                        )}
                    </div>

                    <div style={{ display: 'flex', gap: 8, marginTop: 8, flexWrap: 'wrap' }}>
                        <span className="badge badge--primary" style={{ fontSize: 11 }}>{med.frequency}</span>
                        {allGiven && <span className="badge badge--success" style={{ fontSize: 11 }}>All given today ✓</span>}
                    </div>

                    {/* 7-day history */}
                    <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 10 }}>
                        <span style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 500 }}>7 days:</span>
                        <div style={{ display: 'flex', gap: 4, alignItems: 'center' }}>
                            {med.weeklyHistory.map((h, i) => (
                                <div key={i} style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 3 }}>
                                    <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{dayLabels[i]}</span>
                                    <HistoryDot status={h} />
                                </div>
                            ))}
                        </div>
                    </div>
                </div>

                <button
                    onClick={() => setExpanded(e => !e)}
                    style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--text-muted)', padding: 4, flexShrink: 0 }}
                    aria-label={expanded ? 'Collapse' : 'Expand details'}
                >
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </button>
            </div>

            {/* Expanded details */}
            {expanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 16 }}>
                        <div style={{ background: 'var(--bg-surface-soft)', padding: '12px 14px', borderRadius: 12 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Purpose</p>
                            <p style={{ fontSize: 14, color: 'var(--text-body)', marginTop: 4, lineHeight: 1.5 }}>{med.purpose}</p>
                        </div>
                        <div style={{ background: 'var(--color-warning-bg)', padding: '12px 14px', borderRadius: 12 }}>
                            <p style={{ fontSize: 11, fontWeight: 700, color: '#B45309', textTransform: 'uppercase', letterSpacing: '0.05em' }}>Watch for</p>
                            <ul style={{ marginTop: 4 }}>
                                {med.sideEffectsToWatch.map((s, i) => (
                                    <li key={i} style={{ fontSize: 13, color: 'var(--text-body)' }}>· {s}</li>
                                ))}
                            </ul>
                        </div>
                    </div>

                    {/* Note */}
                    <div style={{ marginTop: 16 }}>
                        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 8 }}>
                            <p style={{ fontSize: 12, fontWeight: 700, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.05em' }}>
                                Nurse note
                            </p>
                            <button
                                onClick={() => setEditingNote(e => !e)}
                                style={{ background: 'none', border: 'none', cursor: 'pointer', color: 'var(--color-primary)', display: 'flex', alignItems: 'center', gap: 4, fontSize: 12, fontWeight: 600 }}
                            >
                                <PenLine size={13} /> Edit
                            </button>
                        </div>
                        {editingNote ? (
                            <div>
                                <textarea
                                    className="form-textarea"
                                    value={note}
                                    onChange={e => setNote(e.target.value)}
                                    style={{ minHeight: 72, fontSize: 14 }}
                                    placeholder="Add administration notes…"
                                />
                                <button
                                    onClick={() => { setEditingNote(false); setSavedNote(true); setTimeout(() => setSavedNote(false), 2000); }}
                                    className="btn btn--primary btn--sm"
                                    style={{ marginTop: 8 }}
                                >
                                    Save note
                                </button>
                                {savedNote && <span className="badge badge--success" style={{ marginLeft: 10, fontSize: 12 }}>Saved</span>}
                            </div>
                        ) : (
                            <p style={{ fontSize: 14, color: note ? 'var(--text-body)' : 'var(--text-muted)', lineHeight: 1.6, fontStyle: note ? 'normal' : 'italic' }}>
                                {note || 'No note added yet'}
                            </p>
                        )}
                    </div>
                </div>
            )}
        </article>
    );
}

export default function CaretakerMedicationsPage() {
    return (
        <AppLayout role="caretaker" userName="Anita Desai" alertCount={1}>
            <div style={{ padding: '32px 32px 48px', maxWidth: 760, margin: '0 auto' }}>

                <div style={{ marginBottom: 8 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>
                        Medications
                    </h1>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 15 }}>
                        Ravi Sharma · {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                    </p>
                </div>

                {/* Summary row */}
                <div style={{ display: 'flex', gap: 12, margin: '20px 0 24px', flexWrap: 'wrap' }}>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--color-success-bg)', borderRadius: 999 }}>
                        <CheckCircle2 size={14} color="var(--color-success)" />
                        <span style={{ fontSize: 13, color: '#15803D', fontWeight: 600 }}>
                            {medications.filter(m => m.administeredToday.every(Boolean)).length} fully given
                        </span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6, padding: '8px 14px', background: 'var(--color-danger-bg)', borderRadius: 999 }}>
                        <AlertCircle size={14} color="var(--color-danger)" />
                        <span style={{ fontSize: 13, color: 'var(--color-danger)', fontWeight: 600 }}>
                            {medications.filter(m => m.administeredToday.some(v => !v)).length} pending doses
                        </span>
                    </div>
                </div>

                {/* Legend */}
                <div style={{ display: 'flex', alignItems: 'center', gap: 16, marginBottom: 20, padding: '10px 14px', background: 'var(--bg-surface)', border: '1px solid var(--border-subtle)', borderRadius: 12 }}>
                    <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)' }}>7-day history:</span>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-success)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Given</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--color-danger)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Missed</span>
                    </div>
                    <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
                        <div style={{ width: 10, height: 10, borderRadius: '50%', background: 'var(--text-muted)' }} />
                        <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Skipped</span>
                    </div>
                </div>

                <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                    {medications.map(med => (
                        <MedCard key={med.id} med={med} />
                    ))}
                </div>
            </div>
        </AppLayout>
    );
}
