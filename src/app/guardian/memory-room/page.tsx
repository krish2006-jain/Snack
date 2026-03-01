"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import MemoryRoomSVG from '@/components/ui/MemoryRoomSVG';
import { mockMemoryRooms, MemoryRoom, MemoryObject } from '@/lib/mock-data';
import { Plus, Pencil, Trash2, Sparkles, ChevronRight, ChevronDown, Eye } from 'lucide-react';
import { useSession } from '@/lib/useSession';
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
    const { user } = useSession();
    const patientFirstName = user?.patientName?.split(' ')[0] || 'Patient';
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

    const [customRooms, setCustomRooms] = useState<any[]>([]);
    const [mode, setMode] = useState<'list' | 'create_custom' | 'edit_custom'>('list');
    const [currentCustomRoom, setCurrentCustomRoom] = useState<any>(null);
    const [roomName, setRoomName] = useState('');
    const [roomDesc, setRoomDesc] = useState('');
    const [bgImage, setBgImage] = useState('');
    const [editingHotspot, setEditingHotspot] = useState<any>(null);

    // Using simple ref access would require useRef, we'll fetch coordinates by simple event properties
    const handleImageUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
        const file = e.target.files?.[0];
        if (!file) return;
        const reader = new FileReader();
        reader.onload = (event) => {
            if (event.target?.result) setBgImage(event.target.result as string);
        };
        reader.readAsDataURL(file);
    };

    useEffect(() => {
        try {
            const raw = localStorage.getItem('saathi_custom_rooms');
            if (raw) setCustomRooms(JSON.parse(raw));
        } catch (e) { }
    }, []);

    const saveCustomRooms = (newRooms: any[]) => {
        setCustomRooms(newRooms);
        localStorage.setItem('saathi_custom_rooms', JSON.stringify(newRooms));
    };

    const saveCustomRoom = () => {
        if (!roomName || !bgImage) return showToast('Name and image required');
        let newRoom: any;
        if (mode === 'create_custom') {
            newRoom = {
                id: 'cr-' + Date.now(),
                slug: roomName.toLowerCase().replace(/\s+/g, '-'),
                name: roomName,
                description: roomDesc,
                bgImage,
                hotspots: []
            };
            saveCustomRooms([...customRooms, newRoom]);
        } else if (mode === 'edit_custom' && currentCustomRoom) {
            newRoom = { ...currentCustomRoom, name: roomName, description: roomDesc, bgImage };
            saveCustomRooms(customRooms.map(r => r.id === newRoom.id ? newRoom : r));
        }
        setMode('list');
        setCurrentCustomRoom(null);
        showToast('Familiar space saved');
    };

    const startEditCustom = (r: any) => {
        setCurrentCustomRoom(r);
        setRoomName(r.name);
        setRoomDesc(r.description);
        setBgImage(r.bgImage);
        setMode('edit_custom');
    };

    const handleImageClick = (e: React.MouseEvent<HTMLImageElement>) => {
        if (mode !== 'edit_custom' || !currentCustomRoom) return;
        const rect = e.currentTarget.getBoundingClientRect();
        const xPercent = ((e.clientX - rect.left) / rect.width) * 100;
        const yPercent = ((e.clientY - rect.top) / rect.height) * 100;

        setEditingHotspot({
            id: 'hs-' + Date.now(),
            label: 'New Object',
            x: xPercent, y: yPercent,
            flashcard: { title: '', subtitle: '', detail: '', tip: '' }
        });
    };

    const saveHotspot = (e: React.FormEvent) => {
        e.preventDefault();
        if (!editingHotspot || !currentCustomRoom) return;
        const updatedRoom = {
            ...currentCustomRoom,
            hotspots: [...currentCustomRoom.hotspots.filter((h: any) => h.id !== editingHotspot.id), editingHotspot]
        };
        saveCustomRooms(customRooms.map(r => r.id === updatedRoom.id ? updatedRoom : r));
        setCurrentCustomRoom(updatedRoom);
        setEditingHotspot(null);
        showToast('Memory object saved');
    };

    return (
        <div className={styles.page}>
            <GuardianHeader title="Memory Room Manager" subtitle={`${patientFirstName}'s home mapped for cognitive recall training`} />

            {mode === 'list' && (
                <>
                    <div className={styles.roomMapWrap}>
                        <MemoryRoomSVG className={styles.roomMap} />
                    </div>
                    <main className={styles.content}>
                        {/* Custom Rooms Section */}
                        <div className={styles.editorHeader} style={{ justifyContent: 'space-between', marginBottom: 'var(--space-4)' }}>
                            <h2 className={styles.editorTitle}>Custom Familiar Spaces</h2>
                            <button className={styles.addObjBtn} onClick={() => {
                                setRoomName(''); setRoomDesc(''); setBgImage(''); setMode('create_custom'); setCurrentCustomRoom(null);
                            }}>
                                <Plus size={16} /> Add Space
                            </button>
                        </div>

                        <div className={styles.customRoomsGrid}>
                            {/* Demo box / CTA */}
                            <button
                                className={styles.addSpaceCard}
                                onClick={() => {
                                    setRoomName(''); setRoomDesc(''); setBgImage(''); setMode('create_custom'); setCurrentCustomRoom(null);
                                }}
                            >
                                <div className={styles.addSpaceIcon}>
                                    <Plus size={24} />
                                </div>
                                <div>
                                    <h3 className={styles.addSpaceText}>Add New Space</h3>
                                    <p className={styles.addSpaceSubtext}>Upload a photo of a familiar room</p>
                                </div>
                            </button>

                            {/* Custom Rooms */}
                            {customRooms.map(r => (
                                <article key={r.id} className={styles.customRoomCard}>
                                    <div className={styles.customRoomThumb} onClick={() => startEditCustom(r)}>
                                        <img src={r.bgImage} alt={r.name} className={styles.customRoomThumbImg} />
                                    </div>
                                    <div className={styles.customRoomInfo}>
                                        <h3 className={styles.customRoomTitle}>{r.name}</h3>
                                        <p className={styles.customRoomDesc}>{r.description}</p>

                                        <div className={styles.customRoomActions}>
                                            <button className={styles.viewRoomBtn} onClick={() => startEditCustom(r)}>
                                                <Pencil size={13} /> Edit
                                            </button>
                                            <Link href={`/patient/memory-room/${r.slug}`} className={styles.viewRoomBtn}>
                                                <Eye size={13} /> View Layout
                                            </Link>
                                        </div>
                                    </div>
                                </article>
                            ))}
                        </div>

                        <hr style={{ margin: '24px 0', border: '1px solid var(--border-subtle)' }} />
                        <h2 style={{ fontSize: '1.25rem', fontWeight: 600, marginBottom: 16 }}>Pre-mapped Areas</h2>

                        {/* Room sections */}
                        {rooms.map(room => (
                            <section key={room.id} className={styles.roomSection}>
                                <div
                                    className={styles.roomHeader}
                                    onClick={() => setExpandedRoom(prev => prev === room.id ? '' : room.id)}
                                >
                                    <div className={styles.roomHeaderLeft}>
                                        <span className={styles.roomTitle}>{room.name}</span>
                                        <span className={styles.roomDesc}>{room.description}</span>
                                    </div>
                                    <div className={styles.roomHeaderRight}>
                                        <Link href={`/patient/memory-room/${room.name.toLowerCase().replace(/ room$/i, '').replace(/\s+/g, '')}`} className={styles.viewRoomBtn} onClick={e => e.stopPropagation()}>
                                            <Eye size={13} /> View Patient Room
                                        </Link>
                                        {expandedRoom === room.id ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
                                    </div>
                                </div>

                                {expandedRoom === room.id && (
                                    <div className={styles.roomBody}>
                                        <div className={styles.objectGrid}>
                                            {room.objects.map(obj => (
                                                <article key={obj.id} className={styles.objectCard}>
                                                    <div className={styles.objectTop}>
                                                        <div><span className={styles.objectName}>{obj.name}</span></div>
                                                    </div>
                                                    <p className={styles.objectDesc}>{obj.description}</p>
                                                    <span className={styles.objectLocation}>📍 {obj.location}</span>
                                                    <RecallBar score={obj.recallScore} />
                                                </article>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </section>
                        ))}
                    </main>
                </>
            )}

            {(mode === 'create_custom' || mode === 'edit_custom') && (
                <main className={styles.content}>
                    <div className={styles.editorHeader}>
                        <button className={styles.viewRoomBtn} onClick={() => setMode('list')}>Cancel</button>
                        <h2 className={styles.editorTitle}>{mode === 'create_custom' ? 'Create Custom Space' : 'Edit Custom Space'}</h2>
                        <button className={styles.addObjBtn} onClick={saveCustomRoom}>Save Space</button>
                    </div>

                    <div className={styles.editorMain}>
                        <div className={styles.editorLeft}>
                            <input className={styles.editorInput} placeholder="Space Name (e.g. Garden)" value={roomName} onChange={e => setRoomName(e.target.value)} />
                            <textarea className={styles.editorInput} style={{ resize: 'vertical' }} rows={3} placeholder="Description..." value={roomDesc} onChange={e => setRoomDesc(e.target.value)} />
                            <div className={styles.uploadBox}>
                                <label className={styles.uploadLabel}>Background Image</label>
                                <input type="file" accept="image/*" onChange={handleImageUpload} />
                            </div>

                            {bgImage && (
                                <div className={styles.previewWrap}>
                                    <p className={styles.previewHint}>
                                        {mode === 'edit_custom' ? "Click anywhere on the image to add an object" : "Save this space first to add objects"}
                                    </p>
                                    <img
                                        src={bgImage}
                                        alt="Preview"
                                        className={mode === 'edit_custom' ? styles.previewImgEdit : styles.previewImgCreate}
                                        style={{ width: '100%', display: 'block' }}
                                        onClick={mode === 'edit_custom' ? handleImageClick : undefined}
                                    />
                                    {mode === 'edit_custom' && currentCustomRoom?.hotspots?.map((hs: any) => (
                                        <div key={hs.id} className={styles.hotspotTarget} style={{ left: `${hs.x}%`, top: `${hs.y}%` }} onClick={(e) => { e.stopPropagation(); setEditingHotspot(hs); }}>
                                            {hs.label}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>

                        <div className={styles.editorRight}>
                            {editingHotspot && (
                                <form onSubmit={saveHotspot} className={styles.hotspotForm}>
                                    <h3 className={styles.formTitle}>Editing Object</h3>
                                    <div className={styles.fieldGroup}>
                                        <div>
                                            <label className={styles.fieldLabel}>Short Label</label>
                                            <input required className={styles.input} value={editingHotspot.label} onChange={e => setEditingHotspot({ ...editingHotspot, label: e.target.value })} />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Flashcard Title</label>
                                            <input required className={styles.input} value={editingHotspot.flashcard.title} onChange={e => setEditingHotspot({ ...editingHotspot, flashcard: { ...editingHotspot.flashcard, title: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Subtitle</label>
                                            <input className={styles.input} value={editingHotspot.flashcard.subtitle} onChange={e => setEditingHotspot({ ...editingHotspot, flashcard: { ...editingHotspot.flashcard, subtitle: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Story / Detail</label>
                                            <textarea required rows={4} className={styles.input} style={{ resize: 'vertical' }} value={editingHotspot.flashcard.detail} onChange={e => setEditingHotspot({ ...editingHotspot, flashcard: { ...editingHotspot.flashcard, detail: e.target.value } })} />
                                        </div>
                                        <div>
                                            <label className={styles.fieldLabel}>Recall Tip</label>
                                            <input className={styles.input} value={editingHotspot.flashcard.tip} onChange={e => setEditingHotspot({ ...editingHotspot, flashcard: { ...editingHotspot.flashcard, tip: e.target.value } })} />
                                        </div>
                                        <div className={styles.btnGroup}>
                                            <button type="button" className={styles.cancelBtn} onClick={() => {
                                                const updated = { ...currentCustomRoom, hotspots: currentCustomRoom.hotspots.filter((h: any) => h.id !== editingHotspot.id) };
                                                saveCustomRooms(customRooms.map(r => r.id === updated.id ? updated : r));
                                                setCurrentCustomRoom(updated);
                                                setEditingHotspot(null);
                                            }}>Delete</button>
                                            <button type="submit" className={styles.addObjBtn}>Save</button>
                                        </div>
                                    </div>
                                </form>
                            )}
                            {!editingHotspot && mode === 'edit_custom' && currentCustomRoom?.hotspots?.length > 0 && (
                                <div className={styles.savedObjectsCard}>
                                    <h3 className={styles.formTitle}>Saved Objects</h3>
                                    <ul className={styles.savedObjectsList}>
                                        {currentCustomRoom.hotspots.map((hs: any) => (
                                            <li key={hs.id} className={styles.savedObjectItem}>
                                                {hs.label}
                                                <button className={styles.editObjBtn} onClick={() => setEditingHotspot(hs)}>Edit</button>
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </main>
            )}

            {toast && <div className={styles.toast} role="status" aria-live="polite">{toast}</div>}
        </div>
    );
}
