'use client';

import { useState, useEffect } from 'react';
import { AppLayout } from '@/components/ui/AppLayout';
import { journalEntries, JournalEntry } from '@/lib/mock-data/caretaker';
import { BookOpen, Save, ChevronDown, ChevronUp } from 'lucide-react';

const moodEmoji = ['😔', '😟', '😐', '😊', '😄'];
const moodLabels = ['Very low', 'Low', 'Fair', 'Good', 'Great'];
const moodColors = ['var(--color-danger)', '#F97316', 'var(--color-warning)', 'var(--color-success)', '#16A34A'];

const selectOptions = {
    appetite: ['poor', 'fair', 'good', 'excellent'],
    sleep: ['poor', 'fair', 'good', 'excellent'],
};

function JournalEntryCard({ entry, index }: { entry: JournalEntry; index: number }) {
    const [expanded, setExpanded] = useState(index === 0);
    const date = new Date(entry.date);
    const dateStr = date.toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });

    return (
        <article
            className="card"
            style={{ padding: 0, background: 'var(--bg-surface)', overflow: 'hidden' }}
        >
            <button
                onClick={() => setExpanded(e => !e)}
                style={{
                    width: '100%', padding: '16px 20px', background: 'none', border: 'none',
                    cursor: 'pointer', display: 'flex', alignItems: 'center', gap: 14, textAlign: 'left',
                }}
                aria-expanded={expanded}
            >
                {/* Mood indicator */}
                <div style={{
                    width: 44, height: 44, borderRadius: 12,
                    background: `${moodColors[entry.mood - 1]}20`,
                    display: 'flex', alignItems: 'center', justifyContent: 'center',
                    fontSize: 22, flexShrink: 0,
                }}>
                    {moodEmoji[entry.mood - 1]}
                </div>
                <div style={{ flex: 1, minWidth: 0 }}>
                    <p style={{ fontSize: 14, fontWeight: 700, color: 'var(--text-heading)' }}>{dateStr}</p>
                    <div style={{ display: 'flex', gap: 10, marginTop: 4, flexWrap: 'wrap' }}>
                        <span className="badge badge--purple" style={{ fontSize: 11 }}>
                            Mood: {moodLabels[entry.mood - 1]}
                        </span>
                        <span className={`badge ${entry.appetite === 'good' || entry.appetite === 'excellent' ? 'badge--success' : 'badge--warning'}`} style={{ fontSize: 11 }}>
                            Appetite: {entry.appetite}
                        </span>
                        {entry.incidents && (
                            <span className="badge badge--danger" style={{ fontSize: 11 }}>Incident</span>
                        )}
                    </div>
                </div>
                <span style={{ color: 'var(--text-muted)', flexShrink: 0 }}>
                    {expanded ? <ChevronUp size={18} /> : <ChevronDown size={18} />}
                </span>
            </button>

            {expanded && (
                <div style={{ padding: '0 20px 20px', borderTop: '1px solid var(--border-subtle)' }}>
                    <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12, marginTop: 14 }}>
                        <Field label="Sleep" value={entry.sleep} />
                        <Field label="Appetite" value={entry.appetite} />
                    </div>
                    {entry.incidents && (
                        <div style={{ marginTop: 14 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--color-danger)', marginBottom: 6 }}>⚠ Incident</p>
                            <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6, background: 'var(--color-danger-bg)', padding: '10px 14px', borderRadius: 10 }}>
                                {entry.incidents}
                            </p>
                        </div>
                    )}
                    {entry.notes && (
                        <div style={{ marginTop: 14 }}>
                            <p style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', marginBottom: 6 }}>Notes</p>
                            <p style={{ fontSize: 14, color: 'var(--text-body)', lineHeight: 1.6 }}>{entry.notes}</p>
                        </div>
                    )}
                </div>
            )}
        </article>
    );
}

function Field({ label, value }: { label: string; value: string }) {
    return (
        <div style={{ background: 'var(--bg-surface-soft)', padding: '10px 14px', borderRadius: 10 }}>
            <p style={{ fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em' }}>{label}</p>
            <p style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-heading)', marginTop: 2, textTransform: 'capitalize' }}>{value}</p>
        </div>
    );
}

export default function CaretakerJournalPage() {
    const [entries, setEntries] = useState<JournalEntry[]>(journalEntries);

    const [mood, setMood] = useState<number>(3);
    const [appetite, setAppetite] = useState('good');
    const [sleep, setSleep] = useState('good');
    const [incidents, setIncidents] = useState('');
    const [notes, setNotes] = useState('');
    const [saved, setSaved] = useState(false);

    useEffect(() => {
        fetch('/api/journal')
            .then(r => r.json())
            .then(data => {
                if (data.entries && data.entries.length > 0) {
                    const mapped: JournalEntry[] = data.entries.map((e: { id: string; mood_score: number; appetite: string; sleep_quality: string; incidents: string; notes: string; date: string }) => ({
                        id: e.id,
                        date: e.date,
                        mood: (e.mood_score || 3) as 1 | 2 | 3 | 4 | 5,
                        appetite: (e.appetite || 'fair') as 'poor' | 'fair' | 'good' | 'excellent',
                        sleep: (e.sleep_quality || 'fair') as 'poor' | 'fair' | 'good' | 'excellent',
                        incidents: e.incidents || '',
                        notes: e.notes || '',
                        caretakerId: 'ct-001',
                    }));
                    setEntries(mapped);
                }
            })
            .catch(() => { });
    }, []);

    const handleSave = (e: React.FormEvent) => {
        e.preventDefault();
        const newEntry: JournalEntry = {
            id: `j-${Date.now()}`,
            date: new Date().toISOString(),
            mood: mood as 1 | 2 | 3 | 4 | 5,
            appetite: appetite as 'poor' | 'fair' | 'good' | 'excellent',
            sleep: sleep as 'poor' | 'fair' | 'good' | 'excellent',
            incidents,
            notes,
            caretakerId: 'ct-001',
        };

        setEntries(prev => [newEntry, ...prev]);
        setSaved(true);
        setTimeout(() => setSaved(false), 3000);

        fetch('/api/journal', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                moodScore: mood,
                moodLabel: ['Very low', 'Low', 'Fair', 'Good', 'Great'][mood - 1],
                appetite,
                sleepQuality: sleep,
                incidents: incidents || null,
                notes,
            }),
        }).catch(() => { });

        setMood(3);
        setAppetite('good');
        setSleep('good');
        setIncidents('');
        setNotes('');
    };

    return (
        <AppLayout role="caretaker" userName="Anita Desai" alertCount={1}>
            <div style={{ padding: '32px 32px 48px', maxWidth: 760, margin: '0 auto' }}>

                <div style={{ marginBottom: 28 }}>
                    <h1 style={{ fontSize: 28, fontWeight: 700, color: 'var(--text-heading)', letterSpacing: '-0.01em' }}>
                        Daily Journal
                    </h1>
                    <p style={{ marginTop: 4, color: 'var(--text-muted)', fontSize: 15 }}>
                        Log today's observations for Ravi Sharma
                    </p>
                </div>

                {/* ── Entry Form ────────────────────────────────────── */}
                <form onSubmit={handleSave}>
                    <div className="card" style={{ padding: '24px', marginBottom: 28, background: 'var(--bg-surface)' }}>
                        <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 24 }}>
                            <BookOpen size={18} color="var(--color-primary)" />
                            <h2 style={{ fontSize: 16, fontWeight: 700, color: 'var(--text-heading)' }}>
                                {new Date().toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long', year: 'numeric' })}
                            </h2>
                        </div>

                        {/* Mood selector */}
                        <div style={{ marginBottom: 24 }}>
                            <p className="form-label" style={{ marginBottom: 10 }}>Patient mood today</p>
                            <div style={{ display: 'flex', gap: 10 }}>
                                {moodEmoji.map((emoji, i) => (
                                    <button
                                        key={i}
                                        type="button"
                                        onClick={() => setMood(i + 1)}
                                        aria-label={moodLabels[i]}
                                        aria-pressed={mood === i + 1}
                                        style={{
                                            width: 52, height: 52, borderRadius: 14,
                                            border: mood === i + 1 ? `2px solid ${moodColors[i]}` : '2px solid var(--border-subtle)',
                                            background: mood === i + 1 ? `${moodColors[i]}15` : 'var(--bg-surface-soft)',
                                            fontSize: 22, cursor: 'pointer',
                                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                                            transition: 'all 0.15s ease',
                                            transform: mood === i + 1 ? 'scale(1.1)' : 'scale(1)',
                                        }}
                                    >
                                        {emoji}
                                    </button>
                                ))}
                            </div>
                            {mood && (
                                <p style={{ fontSize: 13, color: moodColors[mood - 1], fontWeight: 600, marginTop: 8 }}>
                                    {moodLabels[mood - 1]}
                                </p>
                            )}
                        </div>

                        {/* Appetite + Sleep */}
                        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20, background: 'var(--bg-surface-soft)', padding: 16, borderRadius: 14 }}>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="appetite" className="form-label">Appetite</label>
                                <select id="appetite" className="form-select" value={appetite} onChange={e => setAppetite(e.target.value)}>
                                    {selectOptions.appetite.map(o => (
                                        <option key={o} value={o} style={{ textTransform: 'capitalize' }}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                            <div className="form-group" style={{ marginBottom: 0 }}>
                                <label htmlFor="sleep" className="form-label">Sleep quality</label>
                                <select id="sleep" className="form-select" value={sleep} onChange={e => setSleep(e.target.value)}>
                                    {selectOptions.sleep.map(o => (
                                        <option key={o} value={o}>{o.charAt(0).toUpperCase() + o.slice(1)}</option>
                                    ))}
                                </select>
                            </div>
                        </div>

                        {/* Incidents */}
                        <div className="form-group">
                            <label htmlFor="incidents" className="form-label">Incidents or concerns <span style={{ color: 'var(--text-muted)', fontWeight: 400 }}>(leave blank if none)</span></label>
                            <textarea
                                id="incidents"
                                className="form-textarea"
                                value={incidents}
                                onChange={e => setIncidents(e.target.value)}
                                placeholder="e.g. Patient became disoriented at 2 PM, tried to leave room…"
                                style={{ minHeight: 80 }}
                            />
                        </div>

                        {/* Notes */}
                        <div className="form-group" style={{ marginBottom: 0 }}>
                            <label htmlFor="notes" className="form-label">Shift notes</label>
                            <textarea
                                id="notes"
                                className="form-textarea"
                                value={notes}
                                onChange={e => setNotes(e.target.value)}
                                placeholder="How did the day go? Observations, behaviours, wins…"
                                style={{ minHeight: 110 }}
                            />
                        </div>

                        <div style={{ marginTop: 20, display: 'flex', alignItems: 'center', gap: 12 }}>
                            <button type="submit" className="btn btn--primary" style={{ gap: 8 }}>
                                <Save size={16} />
                                Save Entry
                            </button>
                            {saved && (
                                <span className="badge badge--success" style={{ fontSize: 13 }}>Entry saved ✓</span>
                            )}
                        </div>
                    </div>
                </form>

                {/* ── Past Entries ────────────────────────────────────── */}
                <div>
                    <h2 style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-heading)', marginBottom: 16 }}>
                        Previous entries
                    </h2>
                    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
                        {entries.map((entry, i) => (
                            <JournalEntryCard key={entry.id} entry={entry} index={i} />
                        ))}
                    </div>
                </div>
            </div>
        </AppLayout>
    );
}
