'use client';

import { useState } from 'react';
import Image from 'next/image';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockPeople, Person } from '@/lib/mock-data';
import { Plus, Pencil, Trash2, Phone, Mic, X, Check } from 'lucide-react';
import styles from './page.module.css';

const getInitials = (name: string) => name.split(' ').map(p => p[0]).join('').toUpperCase().slice(0, 2);
const getRecallColor = (score: number) =>
    score >= 85 ? 'var(--color-success)' : score >= 65 ? 'var(--color-warning)' : 'var(--color-danger)';

const COLORS = ['#7C3AED', '#9333EA', '#EC4899', '#3B82F6', '#F59E0B', '#22C55E'];

type FormState = Omit<Person, 'id' | 'recognitionRate'>;

const EMPTY_FORM: FormState = {
    name: '', relation: '', nickname: '', phone: '', description: '', visits: 'Weekly',
};

export default function PeoplePage() {
    const [people, setPeople] = useState<Person[]>(mockPeople);
    const [editingId, setEditingId] = useState<string | null>(null);
    const [showAdd, setShowAdd] = useState(false);
    const [form, setForm] = useState<FormState>({ ...EMPTY_FORM });
    const [deleteConfirm, setDeleteConfirm] = useState<string | null>(null);

    const startEdit = (person: Person) => {
        setEditingId(person.id);
        setForm({ name: person.name, relation: person.relation, nickname: person.nickname || '', phone: person.phone || '', description: person.description, visits: person.visits });
    };

    const saveEdit = (id: string) => {
        setPeople(prev => prev.map(p => p.id === id ? { ...p, ...form } : p));
        setEditingId(null);
    };

    const addPerson = () => {
        if (!form.name.trim()) return;
        const newPerson: Person = { ...form, id: `p-${Date.now()}`, recognitionRate: 75 };
        setPeople(prev => [...prev, newPerson]);
        setForm({ ...EMPTY_FORM });
        setShowAdd(false);
    };

    const deletePerson = (id: string) => {
        setPeople(prev => prev.filter(p => p.id !== id));
        setDeleteConfirm(null);
    };

    const avgRecognition = Math.round(people.reduce((s, p) => s + p.recognitionRate, 0) / people.length);

    return (
        <div className={styles.page}>
            <GuardianHeader title="People Wallet" subtitle="Who Ravi should remember — 6 faces in his wallet" />
            <main className={styles.content}>
                {/* Stats */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statNum}>{people.length}</span>
                        <span className={styles.statLbl}>People in wallet</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNum} style={{ color: getRecallColor(avgRecognition) }}>{avgRecognition}%</span>
                        <span className={styles.statLbl}>Avg recognition rate</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNum}>{people.filter(p => p.recognitionRate >= 85).length}</span>
                        <span className={styles.statLbl}>Recognises well (&ge;85%)</span>
                    </div>
                    <button className={styles.addBtn} onClick={() => { setShowAdd(true); setForm({ ...EMPTY_FORM }); }}>
                        <Plus size={18} aria-hidden="true" /> Add Person
                    </button>
                </div>

                {/* Add form */}
                {showAdd && (
                    <div className={styles.formCard}>
                        <div className={styles.formHeadRow}>
                            <h3 className={styles.formTitle}>Add New Person</h3>
                            <button className={styles.closeBtn} onClick={() => setShowAdd(false)} aria-label="Close"><X size={18} /></button>
                        </div>
                        <div className={styles.formGrid}>
                            <Field label="Full Name" id="pn-name" value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} placeholder="Priya Sharma" />
                            <Field label="Relation" id="pn-rel" value={form.relation} onChange={v => setForm(p => ({ ...p, relation: v }))} placeholder="Daughter" />
                            <Field label="Nickname" id="pn-nick" value={form.nickname || ''} onChange={v => setForm(p => ({ ...p, nickname: v }))} placeholder="Priya beti" />
                            <Field label="Phone" id="pn-phone" value={form.phone || ''} onChange={v => setForm(p => ({ ...p, phone: v }))} placeholder="+91 99887 76655" />
                            <div style={{ gridColumn: '1 / -1' }}>
                                <Field label="Description / Context" id="pn-desc" value={form.description} onChange={v => setForm(p => ({ ...p, description: v }))} placeholder="First daughter, lives in Gurugram, visits every Sunday" />
                            </div>
                            <div>
                                <label className={styles.label} htmlFor="pn-visits">Visit Frequency</label>
                                <select id="pn-visits" className={styles.input} value={form.visits} onChange={e => setForm(p => ({ ...p, visits: e.target.value }))}>
                                    {['Daily', 'Weekly', 'Bi-weekly', 'Monthly', 'Rarely'].map(v => <option key={v}>{v}</option>)}
                                </select>
                            </div>
                        </div>
                        <div className={styles.formActions}>
                            <button className={styles.cancelBtn} onClick={() => setShowAdd(false)}>Cancel</button>
                            <button className={styles.saveBtn} onClick={addPerson}>Add to Wallet</button>
                        </div>
                    </div>
                )}

                {/* People grid */}
                <div className={styles.grid}>
                    {people.map((person, idx) => {
                        const color = COLORS[idx % COLORS.length];
                        const isEditing = editingId === person.id;
                        const isDeleting = deleteConfirm === person.id;

                        return (
                            <article key={person.id} className={`${styles.personCard} ${isEditing ? styles.cardEditing : ''}`}>
                                {/* Avatar */}
                                <div className={styles.avatar} style={{ background: person.image ? 'transparent' : color + '20', color }} aria-hidden="true">
                                    {person.image ? (
                                        <Image src={person.image} alt={person.name} fill className={styles.avatarImage} />
                                    ) : (
                                        getInitials(person.name)
                                    )}
                                </div>

                                {isEditing ? (
                                    <div className={styles.editBody}>
                                        <div className={styles.editGrid}>
                                            <Field label="Name" id={`edit-name-${person.id}`} value={form.name} onChange={v => setForm(p => ({ ...p, name: v }))} />
                                            <Field label="Relation" id={`edit-rel-${person.id}`} value={form.relation} onChange={v => setForm(p => ({ ...p, relation: v }))} />
                                            <Field label="Nickname" id={`edit-nick-${person.id}`} value={form.nickname || ''} onChange={v => setForm(p => ({ ...p, nickname: v }))} />
                                            <Field label="Phone" id={`edit-phone-${person.id}`} value={form.phone || ''} onChange={v => setForm(p => ({ ...p, phone: v }))} />
                                        </div>
                                        <div className={styles.editActions}>
                                            <button className={styles.cancelBtn} onClick={() => setEditingId(null)}>Cancel</button>
                                            <button className={styles.saveBtn} onClick={() => saveEdit(person.id)}>
                                                <Check size={13} /> Save
                                            </button>
                                        </div>
                                    </div>
                                ) : (
                                    <div className={styles.personBody}>
                                        <div className={styles.personHead}>
                                            <div>
                                                <h3 className={styles.personName}>{person.name}</h3>
                                                <span className={styles.personRelation}>{person.relation}</span>
                                                {person.nickname && <span className={styles.personNick}>"{person.nickname}"</span>}
                                            </div>
                                            <div className={styles.cardActions}>
                                                <button className={styles.iconBtn} onClick={() => startEdit(person)} aria-label={`Edit ${person.name}`}><Pencil size={14} /></button>
                                                {isDeleting ? (
                                                    <>
                                                        <button className={styles.iconBtnDanger} onClick={() => deletePerson(person.id)} aria-label="Confirm delete"><Check size={14} /></button>
                                                        <button className={styles.iconBtn} onClick={() => setDeleteConfirm(null)} aria-label="Cancel"><X size={14} /></button>
                                                    </>
                                                ) : (
                                                    <button className={styles.iconBtn} onClick={() => setDeleteConfirm(person.id)} aria-label={`Delete ${person.name}`}><Trash2 size={14} /></button>
                                                )}
                                            </div>
                                        </div>

                                        <p className={styles.personDesc}>{person.description}</p>

                                        <div className={styles.personMeta}>
                                            {person.phone && (
                                                <span className={styles.metaItem}><Phone size={11} aria-hidden="true" /> {person.phone}</span>
                                            )}
                                            <span className={styles.metaItem}>Visits: <strong>{person.visits}</strong></span>
                                        </div>

                                        <div className={styles.recognitionRow}>
                                            <span className={styles.recognitionLabel}>Recognition rate</span>
                                            <div className={styles.recognitionBar}>
                                                <div className={styles.recognitionFill}
                                                    style={{ width: `${person.recognitionRate}%`, background: getRecallColor(person.recognitionRate) }} />
                                            </div>
                                            <span className={styles.recognitionNum} style={{ color: getRecallColor(person.recognitionRate) }}>
                                                {person.recognitionRate}%
                                            </span>
                                        </div>

                                        <button className={styles.voiceBtn} aria-label={`Add voice note for ${person.name}`}>
                                            <Mic size={13} aria-hidden="true" /> Voice Note
                                        </button>
                                    </div>
                                )}
                            </article>
                        );
                    })}
                </div>
            </main>
        </div>
    );
}

function Field({ label, id, value, onChange, placeholder }: {
    label: string; id: string; value: string;
    onChange: (v: string) => void; placeholder?: string;
}) {
    return (
        <div className={styles.formGroup}>
            <label className={styles.label} htmlFor={id}>{label}</label>
            <input id={id} type="text" className={styles.input} value={value}
                onChange={e => onChange(e.target.value)} placeholder={placeholder} />
        </div>
    );
}
