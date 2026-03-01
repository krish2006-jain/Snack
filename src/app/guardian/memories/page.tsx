'use client';

import { useState } from 'react';
import Image from 'next/image';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockMemories, Memory } from '@/lib/mock-data';
import { Upload, Search, Filter, ImageIcon, Mic, Video, Star, SortAsc } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './page.module.css';

type SortKey = 'date' | 'recallScore' | 'emotion';
type FilterEmotion = 'all' | 'happy' | 'neutral' | 'nostalgic';

const typeIcon = { photo: <ImageIcon size={13} />, voice: <Mic size={13} />, video: <Video size={13} /> };
const typeColor = { photo: 'var(--color-primary)', voice: 'var(--color-warning)', video: 'var(--color-success)' };
const emotionEmoji = { happy: '😊', neutral: '😐', nostalgic: '🌅' };

function RecallBar({ score }: { score: number }) {
    const color = score >= 80 ? 'var(--color-success)' : score >= 60 ? 'var(--color-warning)' : 'var(--color-danger)';
    return (
        <div className={styles.recallWrap} role="meter" aria-valuenow={score} aria-valuemin={0} aria-valuemax={100} aria-label={`${score}% recall`}>
            <div className={styles.recallBar}>
                <div className={styles.recallFill} style={{ width: `${score}%`, background: color }} />
            </div>
            <span className={styles.recallNum} style={{ color }}>{score}%</span>
        </div>
    );
}

export default function MemoriesPage() {
    const { user } = useSession();
    const patientFirstName = user?.patientName?.split(' ')[0] || 'Patient';
    const [memories, setMemories] = useState<Memory[]>(mockMemories);
    const [search, setSearch] = useState('');
    const [sort, setSort] = useState<SortKey>('date');
    const [filterEmotion, setFilterEmotion] = useState<FilterEmotion>('all');
    const [showUpload, setShowUpload] = useState(false);
    const [dragOver, setDragOver] = useState(false);

    const filtered = memories
        .filter(m => {
            const q = search.toLowerCase();
            return (
                m.title.toLowerCase().includes(q) ||
                m.description.toLowerCase().includes(q) ||
                m.tags.some(t => t.toLowerCase().includes(q))
            );
        })
        .filter(m => filterEmotion === 'all' || m.emotion === filterEmotion)
        .sort((a, b) => {
            if (sort === 'date') return new Date(b.date).getTime() - new Date(a.date).getTime();
            if (sort === 'recallScore') return b.recallScore - a.recallScore;
            return a.emotion.localeCompare(b.emotion);
        });

    const avgRecall = Math.round(memories.reduce((s, m) => s + m.recallScore, 0) / memories.length);

    return (
        <div className={styles.page}>
            <GuardianHeader title="Memory Manager" subtitle={`${patientFirstName}'s memory archive - ${memories.length} memories stored`} />
            <main className={styles.content}>
                {/* Stats row */}
                <div className={styles.statsRow}>
                    <div className={styles.statCard}>
                        <span className={styles.statNum}>{memories.length}</span>
                        <span className={styles.statLbl}>Total Memories</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNum} style={{ color: 'var(--color-success)' }}>{avgRecall}%</span>
                        <span className={styles.statLbl}>Average Recall</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNum}>{memories.filter(m => m.recallScore >= 80).length}</span>
                        <span className={styles.statLbl}>High-recall Memories</span>
                    </div>
                    <div className={styles.statCard}>
                        <span className={styles.statNum}>{memories.filter(m => m.type === 'photo').length}</span>
                        <span className={styles.statLbl}>Photos</span>
                    </div>
                </div>

                {/* Controls */}
                <div className={styles.controls}>
                    <div className={styles.searchWrap}>
                        <Search size={15} className={styles.searchIcon} aria-hidden="true" />
                        <input
                            className={styles.searchInput}
                            type="search"
                            placeholder="Search memories by title, tag..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                            aria-label="Search memories"
                        />
                    </div>
                    <div className={styles.filters}>
                        <Filter size={14} aria-hidden="true" />
                        {(['all', 'happy', 'neutral', 'nostalgic'] as FilterEmotion[]).map(e => (
                            <button
                                key={e}
                                className={`${styles.filterBtn} ${filterEmotion === e ? styles.filterActive : ''}`}
                                onClick={() => setFilterEmotion(e)}
                                aria-pressed={filterEmotion === e}
                            >
                                {e === 'all' ? 'All' : `${emotionEmoji[e]} ${e}`}
                            </button>
                        ))}
                    </div>
                    <div className={styles.sortWrap}>
                        <SortAsc size={14} aria-hidden="true" />
                        <select
                            className={styles.sortSelect}
                            value={sort}
                            onChange={e => setSort(e.target.value as SortKey)}
                            aria-label="Sort memories"
                        >
                            <option value="date">Date</option>
                            <option value="recallScore">Recall Score</option>
                            <option value="emotion">Emotion</option>
                        </select>
                    </div>
                    <button className={styles.uploadBtn} onClick={() => setShowUpload(p => !p)}>
                        <Upload size={15} aria-hidden="true" /> Upload Memory
                    </button>
                </div>

                {/* Upload panel */}
                {showUpload && (
                    <div className={styles.uploadPanel}>
                        <h3 className={styles.uploadTitle}>Add New Memory</h3>
                        <div
                            className={`${styles.dropzone} ${dragOver ? styles.dropzoneActive : ''}`}
                            onDragOver={e => { e.preventDefault(); setDragOver(true); }}
                            onDragLeave={() => setDragOver(false)}
                            onDrop={e => { e.preventDefault(); setDragOver(false); }}
                            role="region"
                            aria-label="File drop zone"
                        >
                            <Upload size={28} color="var(--text-muted)" aria-hidden="true" />
                            <span className={styles.dropzoneText}>Drop a photo or audio file here, or click to browse</span>
                            <span className={styles.dropzoneSub}>JPG, PNG, MP3, MP4 - max 50MB</span>
                        </div>
                        <div className={styles.uploadForm}>
                            <div className={styles.uploadField}>
                                <label className={styles.label} htmlFor="mem-title">Memory Title</label>
                                <input id="mem-title" type="text" className={styles.input} placeholder="e.g. Priya's Wedding Day" />
                            </div>
                            <div className={styles.uploadField}>
                                <label className={styles.label} htmlFor="mem-desc">Description</label>
                                <textarea id="mem-desc" className={styles.textarea} placeholder="Describe this memory briefly..." rows={3} />
                            </div>
                            <div className={styles.uploadField}>
                                <label className={styles.label} htmlFor="mem-tags">Tags (comma-separated)</label>
                                <input id="mem-tags" type="text" className={styles.input} placeholder="family, celebration, Priya" />
                            </div>
                            <button className={styles.saveBtn}>Save Memory</button>
                        </div>
                    </div>
                )}

                {/* Memory grid */}
                <div className={styles.grid}>
                    {filtered.map(memory => (
                        <article key={memory.id} className={styles.memCard}>
                            <div className={styles.memThumb}>
                                {memory.image ? (
                                    <Image src={memory.image} alt={memory.title} fill className={styles.thumbImage} />
                                ) : (
                                    <span className={styles.memEmoji} role="img" aria-label={memory.emotion}>{emotionEmoji[memory.emotion]}</span>
                                )}
                                <span
                                    className={styles.memTypeBadge}
                                    style={{ background: typeColor[memory.type] + '18', color: typeColor[memory.type] }}
                                >
                                    {typeIcon[memory.type]} {memory.type}
                                </span>
                            </div>
                            <div className={styles.memBody}>
                                <h3 className={styles.memTitle}>{memory.title}</h3>
                                <p className={styles.memDesc}>{memory.description}</p>
                                <div className={styles.memTags}>
                                    {memory.tags.map(tag => (
                                        <span key={tag} className={styles.tag}>{tag}</span>
                                    ))}
                                </div>
                                <div className={styles.memFooter}>
                                    <span className={styles.memDate}>{new Date(memory.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}</span>
                                    <RecallBar score={memory.recallScore} />
                                </div>
                            </div>
                        </article>
                    ))}
                </div>
            </main>
        </div>
    );
}
