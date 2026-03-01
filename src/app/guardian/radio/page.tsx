'use client';

import { useState, useEffect } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { Music, Plus, PlayCircle } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import styles from './radio.module.css';
import { mockRadioSongs, type RadioSong } from '@/lib/mock-data/patient';

export default function GuardianRadioAdmin() {
    const [songs, setSongs] = useState<RadioSong[]>([]);
    const [loaded, setLoaded] = useState(false);

    // Add song form state
    const [isAdding, setIsAdding] = useState(false);
    const [newTitle, setNewTitle] = useState('');
    const [newArtist, setNewArtist] = useState('');
    const [newEra, setNewEra] = useState('1970s');
    const [isSubmitting, setIsSubmitting] = useState(false);

    useEffect(() => {
        apiFetch<{ songs: RadioSong[] }>('/api/radio')
            .then(data => {
                setSongs(data.songs || mockRadioSongs);
                setLoaded(true);
            })
            .catch(() => {
                setSongs(mockRadioSongs);
                setLoaded(true);
            });
    }, []);

    const handleAddSong = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!newTitle.trim() || !newArtist.trim()) return;

        setIsSubmitting(true);
        try {
            const res = await apiFetch<{ success: boolean, song: RadioSong }>('/api/radio', {
                method: 'POST',
                body: JSON.stringify({
                    title: newTitle,
                    artist: newArtist,
                    era: newEra,
                    addedBy: 'Guardian (You)',
                    coverColor: ['#6D28D9', '#0369A1', '#9D174D', '#14532D'][Math.floor(Math.random() * 4)]
                })
            });

            if (res.success && res.song) {
                setSongs([res.song, ...songs]);
                setNewTitle('');
                setNewArtist('');
                setIsAdding(false);
            }
        } catch (error) {
            console.error('Failed to add song:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <div className={styles.page}>
            <GuardianHeader title="Nostalgia Radio Management" />

            <main className={styles.content}>
                {!loaded ? (
                    <div className={styles.skeletonArea}>
                        <div className={styles.skTitle} />
                        <div className={styles.skGrid}>
                            {[1, 2, 3].map(i => <div key={i} className={styles.skCard} />)}
                        </div>
                    </div>
                ) : (
                    <>
                        <div className={styles.headerArea}>
                            <div>
                                <h1 className={styles.pageTitle}>Patient's Playlist</h1>
                                <p className={styles.pageSub}>Add era-appropriate music to automatically sync to the patient's radio.</p>
                            </div>

                            {!isAdding && (
                                <button className={`btn btn--primary ${styles.addBtn}`} onClick={() => setIsAdding(true)}>
                                    <Plus size={18} />
                                    Add Favorite Song
                                </button>
                            )}
                        </div>

                        {isAdding && (
                            <form className={styles.addForm} onSubmit={handleAddSong}>
                                <div className={styles.formHeader}>
                                    <div className={styles.formIcon}>
                                        <Music size={20} />
                                    </div>
                                    <h3>Add New Song</h3>
                                </div>

                                <div className={styles.formGrid}>
                                    <div className={styles.formGroup}>
                                        <label>Song Title</label>
                                        <input
                                            type="text"
                                            value={newTitle}
                                            onChange={(e) => setNewTitle(e.target.value)}
                                            placeholder="e.g. Lag Jaa Gale"
                                            required
                                            autoFocus
                                            className="app-input"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Artist</label>
                                        <input
                                            type="text"
                                            value={newArtist}
                                            onChange={(e) => setNewArtist(e.target.value)}
                                            placeholder="e.g. Lata Mangeshkar"
                                            required
                                            className="app-input"
                                        />
                                    </div>
                                    <div className={styles.formGroup}>
                                        <label>Era / Year</label>
                                        <select
                                            value={newEra}
                                            onChange={(e) => setNewEra(e.target.value)}
                                            className="app-input"
                                        >
                                            <option value="1950s">1950s</option>
                                            <option value="1960s">1960s</option>
                                            <option value="1970s">1970s</option>
                                            <option value="1980s">1980s</option>
                                            <option value="1990s">1990s</option>
                                        </select>
                                    </div>
                                </div>

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        className="btn btn--outline"
                                        onClick={() => setIsAdding(false)}
                                        disabled={isSubmitting}
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn--primary"
                                        disabled={isSubmitting || !newTitle || !newArtist}
                                    >
                                        {isSubmitting ? 'Adding...' : 'Save to Playlist'}
                                    </button>
                                </div>
                            </form>
                        )}

                        <div className={styles.songGrid}>
                            {songs.length === 0 ? (
                                <div className={styles.emptyState}>
                                    <Music size={40} color="var(--text-muted)" />
                                    <h3>No songs in the playlist</h3>
                                    <p>Add some music your loved one enjoys.</p>
                                </div>
                            ) : (
                                songs.map(song => (
                                    <div key={song.id} className={styles.songCard}>
                                        <div
                                            className={styles.songCover}
                                            style={{ background: song.coverColor || 'var(--color-primary)' }}
                                        >
                                            <Music size={24} color="rgba(255,255,255,0.7)" />
                                        </div>
                                        <div className={styles.songDetails}>
                                            <h4>{song.title}</h4>
                                            <p>{song.artist}</p>
                                            <div className={styles.songMeta}>
                                                <span className={styles.eraBadge}>{song.era}</span>
                                                <span className={styles.addedBy}>Added by {song.addedBy}</span>
                                            </div>
                                        </div>
                                    </div>
                                ))
                            )}
                        </div>
                    </>
                )}
            </main>
        </div>
    );
}
