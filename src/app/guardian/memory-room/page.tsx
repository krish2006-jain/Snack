'use client';

import { useState } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockMemoryRooms, MemoryRoom, MemoryObject } from '@/lib/mock-data';
import { Plus, Pencil, Trash2, Sparkles, ChevronRight, ChevronDown } from 'lucide-react';
import MemoryRoomSVG from '@/components/ui/MemoryRoomSVG';
import styles from './page.module.css';

const CATEGORY_COLORS: Record<string, string> = {
    furniture: 'var(--color-info)',
    appliance: 'var(--color-warning)',
    personal: 'var(--color-primary)',
    decor: '#EC4899',
};

function RecallBar({ score }: { score: number }) {
    const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
    return (
        <div className={styles.recallWrap}>
            <div className={styles.recallTrack}>
                <div className={styles.recallFill} style={{ width: `${score}%`, background: color }} />
            </div>
            <span className={styles.recallNum} style={{ color }}>{score}%</span>
        </div>
    );
}

export default function MemoryRoomPage() {
    const [rooms, setRooms] = useState<MemoryRoom[]>(mockMemoryRooms);
    const [expandedRoom, setExpandedRoom] = useState<string>(mockMemoryRooms[0].id);
    const [editingObject, setEditingObject] = useState<string | null>(null);
    const [aiLoading, setAiLoading] = useState<string | null>(null);
    const [showAddObj, setShowAddObj] = useState<string | null>(null);
    const [newObj, setNewObj] = useState({ name: '', description: '', location: '' });
    const [toast, setToast] = useState<string | null>(null);

    const showToast = (msg: string) => { setToast(msg); setTimeout(() => setToast(null), 3000); };

    const deleteObject = (roomId: string, objId: string) => {
        setRooms(prev => prev.map(r => r.id === roomId
            ? { ...r, objects: r.objects.filter(o => o.id !== objId), objectCount: r.objectCount - 1 }
            : r));
        showToast('Object removed from room');
    };

    const addObject = (roomId: string) => {
        if (!newObj.name.trim()) return;
        const obj: MemoryObject = {
            id: `o-${Date.now()}`, name: newObj.name, description: newObj.description,
            location: newObj.location, recallScore: 70, category: 'furniture',
        };
        setRooms(prev => prev.map(r => r.id === roomId
            ? { ...r, objects: [...r.objects, obj], objectCount: r.objectCount + 1 }
            : r));
        setNewObj({ name: '', description: '', location: '' });
        setShowAddObj(null);
        showToast('Object added to room');
    };

    const handleAiGenerate = async (roomId: string) => {
        setAiLoading(roomId);
        await new Promise(resolve => setTimeout(resolve, 1800));
        setAiLoading(null);
        showToast('AI descriptions refreshed for this room');
    };

    return (
        <div className={styles.page}>
            <GuardianHeader title="Memory Room Manager" subtitle="Ravi's home mapped for cognitive recall training" />
            <div className={styles.roomMapWrap}>
                <MemoryRoomSVG className={styles.roomMap} />
            </div>
            <main className={styles.content}>
                {/* Room overview */}
                <div className={styles.roomOverview}>
                    {rooms.map(room => (
                        <div key={room.id} className={`${styles.roomStat} ${expandedRoom === room.id ? styles.roomStatActive : ''}`}
                            onClick={() => setExpandedRoom(prev => prev === room.id ? '' : room.id)}>
                            <span className={styles.roomName}>{room.name}</span>
                            <span className={styles.roomAvg} style={{
                                color: room.recallAvg >= 80 ? 'var(--color-success)' : room.recallAvg >= 65 ? 'var(--color-warning)' : 'var(--color-danger)'
                            }}>{room.recallAvg}% recall</span>
                            <span className={styles.roomObjCount}>{room.objectCount} objects</span>
                        </div>
                    ))}
                </div>

                {/* Room sections */}
                {rooms.map(room => (
                    <section key={room.id} className={styles.roomSection}>
                        <button
                            className={styles.roomHeader}
                            onClick={() => setExpandedRoom(prev => prev === room.id ? '' : room.id)}
                            aria-expanded={expandedRoom === room.id}
                        >
                            <div className={styles.roomHeaderLeft}>
                                <span className={styles.roomTitle}>{room.name}</span>
                                <span className={styles.roomDesc}>{room.description}</span>
                            </div>
                            <div className={styles.roomHeaderRight}>
                                <button
                                    className={styles.aiBtn}
                                    onClick={e => { e.stopPropagation(); handleAiGenerate(room.id); }}
                                    disabled={aiLoading === room.id}
                                    aria-label="AI generate descriptions"
                                >
                                    <Sparkles size={13} aria-hidden="true" />
                                    {aiLoading === room.id ? 'Generating…' : 'AI Enhance'}
                                </button>
                                <button
                                    className={styles.addObjBtn}
                                    onClick={e => { e.stopPropagation(); setShowAddObj(prev => prev === room.id ? null : room.id); }}
                                    aria-label="Add object"
                                >
                                    <Plus size={13} aria-hidden="true" /> Add Object
                                </button>
                                {expandedRoom === room.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                            </div>
                        </button>

                        {expandedRoom === room.id && (
                            <div className={styles.roomBody}>
                                {/* Add object form */}
                                {showAddObj === room.id && (
                                    <div className={styles.addForm}>
                                        <input className={styles.input} placeholder="Object name (e.g. Reading Glasses)"
                                            value={newObj.name} onChange={e => setNewObj(p => ({ ...p, name: e.target.value }))} />
                                        <input className={styles.input} placeholder="Description"
                                            value={newObj.description} onChange={e => setNewObj(p => ({ ...p, description: e.target.value }))} />
                                        <input className={styles.input} placeholder="Location in room"
                                            value={newObj.location} onChange={e => setNewObj(p => ({ ...p, location: e.target.value }))} />
                                        <div className={styles.addFormActions}>
                                            <button className={styles.cancelBtn} onClick={() => setShowAddObj(null)}>Cancel</button>
                                            <button className={styles.saveBtn} onClick={() => addObject(room.id)}>Add Object</button>
                                        </div>
                                    </div>
                                )}

                                {/* Object list */}
                                <div className={styles.objectGrid}>
                                    {room.objects.map(obj => (
                                        <article key={obj.id} className={styles.objectCard}>
                                            <div className={styles.objectTop}>
                                                <div>
                                                    <span className={styles.objectName}>{obj.name}</span>
                                                    <span
                                                        className={styles.categoryBadge}
                                                        style={{ background: CATEGORY_COLORS[obj.category] + '18', color: CATEGORY_COLORS[obj.category] }}
                                                    >
                                                        {obj.category}
                                                    </span>
                                                </div>
                                                <div className={styles.objectActions}>
                                                    <button className={styles.iconBtn} onClick={() => setEditingObject(obj.id === editingObject ? null : obj.id)} aria-label={`Edit ${obj.name}`}>
                                                        <Pencil size={13} />
                                                    </button>
                                                    <button className={styles.iconBtnDanger} onClick={() => deleteObject(room.id, obj.id)} aria-label={`Delete ${obj.name}`}>
                                                        <Trash2 size={13} />
                                                    </button>
                                                </div>
                                            </div>
                                            <p className={styles.objectDesc}>{obj.description}</p>
                                            <span className={styles.objectLocation}>📍 {obj.location}</span>
                                            <RecallBar score={obj.recallScore} />
                                        </article>
                                    ))}
                                </div>

                                {/* Recall heatmap for this room */}
                                <div className={styles.roomHeatmap}>
                                    <span className={styles.heatTitle}>Recall Heatmap</span>
                                    <div className={styles.heatRow}>
                                        {room.objects.map(obj => {
                                            const intensity = obj.recallScore / 100;
                                            const color = obj.recallScore >= 80 ? `rgba(34,197,94,${intensity})` : obj.recallScore >= 60 ? `rgba(245,158,11,${intensity})` : `rgba(239,68,68,${intensity})`;
                                            return (
                                                <div key={obj.id} className={styles.heatCell} title={`${obj.name}: ${obj.recallScore}%`}>
                                                    <div className={styles.heatBlock} style={{ background: color }} aria-hidden="true" />
                                                    <span className={styles.heatLabel}>{obj.name.split(' ')[0]}</span>
                                                </div>
                                            );
                                        })}
                                    </div>
                                </div>
                            </div>
                        )}
                    </section>
                ))}
            </main>
            {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
        </div>
    );
}
