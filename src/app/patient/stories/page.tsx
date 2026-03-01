'use client';

import { useState, useRef, useCallback, useMemo } from 'react';
import { Mic, Square, X, ChevronLeft, ChevronRight, Users, Clock, Pen } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { mockVoiceJournal, mockFamilyContributions, type VoiceJournalEntry, type FamilyContribution } from '@/lib/mock-data/patient';
import styles from './stories.module.css';

type ActiveTab = 'family' | 'journal';

const sentimentLabel: Record<string, string> = {
    happy: 'Happy',
    nostalgic: 'Nostalgic',
    neutral: 'Reflective',
    sad: 'Thoughtful',
};

// Colored accent per sentiment — no emojis, just clean colored bars
const sentimentColor: Record<string, string> = {
    happy: 'var(--color-success)',
    nostalgic: 'var(--color-warning)',
    neutral: 'var(--color-primary)',
    sad: 'var(--color-info)',
};

function highlightEntities(text: string, entities: string[]): React.ReactNode[] {
    if (!entities.length) return [text];
    const regex = new RegExp(`\\b(${entities.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
        const isEntity = entities.some(e => e.toLowerCase() === part.toLowerCase());
        return isEntity ? <mark key={i} className={styles.entityMark}>{part}</mark> : part;
    });
}

function getInitials(name: string) {
    return name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();
}

export default function StoriesPage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'there';

    // ── tab state
    const [tab, setTab] = useState<ActiveTab>('family');

    // ── voice journal state
    const [entries, setEntries] = useState<VoiceJournalEntry[]>(mockVoiceJournal);
    const [isRecording, setIsRecording] = useState(false);
    const [liveText, setLiveText] = useState('');
    const [recordTime, setRecordTime] = useState(0);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<any>(null);

    // ── viewer state  (shared between both tabs)
    const [viewingJournalIdx, setViewingJournalIdx] = useState<number | null>(null);
    const [viewingFamilyIdx, setViewingFamilyIdx] = useState<number | null>(null);

    // only approved stories for patient view
    const familyStories = useMemo(() =>
        mockFamilyContributions.filter(c => c.status === 'approved'), []);

    // family contributors for bubble row
    const contributors = useMemo(() => {
        const map = new Map<string, { name: string; photo: string; relation: string }>();
        familyStories.forEach(c => {
            if (!map.has(c.contributorName)) {
                map.set(c.contributorName, { name: c.contributorName, photo: c.contributorPhoto, relation: c.contributorRelation });
            }
        });
        return Array.from(map.values());
    }, [familyStories]);

    // ── Recording logic
    const startRecording = useCallback(() => {
        setIsRecording(true);
        setLiveText('');
        setRecordTime(0);
        timerRef.current = setInterval(() => setRecordTime(t => t + 1), 1000);
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const Ctor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (Ctor) {
                const rec = new Ctor();
                rec.continuous = true;
                rec.interimResults = true;
                rec.lang = 'en-IN';
                rec.onresult = (e: any) => {
                    let t = '';
                    for (let i = 0; i < e.results.length; i++) t += e.results[i][0].transcript;
                    setLiveText(t);
                };
                rec.onerror = () => { };
                rec.start();
                recognitionRef.current = rec;
            }
        }
    }, []);

    const stopRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
        const text = liveText.trim();
        if (text) {
            const known = ['Priya', 'Smita', 'Anita', 'Aarav', 'Riya', 'Mohit', 'Kamla', 'Varanasi', 'cricket', 'chai', 'garden'];
            const entities = known.filter(e => text.toLowerCase().includes(e.toLowerCase()));
            setEntries(prev => [{
                id: `vj-${Date.now()}`,
                transcription: text,
                entities,
                sentiment: 'neutral',
                durationSeconds: recordTime,
                createdAt: new Date().toISOString(),
                timeLabel: 'Just now',
            }, ...prev]);
        }
        setIsRecording(false);
        setLiveText('');
        setRecordTime(0);
    }, [liveText, recordTime]);

    const cancelRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (recognitionRef.current) { recognitionRef.current.stop(); recognitionRef.current = null; }
        setIsRecording(false);
        setLiveText('');
        setRecordTime(0);
    }, []);

    const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    const viewingJournal = viewingJournalIdx !== null ? entries[viewingJournalIdx] : null;
    const viewingFamily = viewingFamilyIdx !== null ? familyStories[viewingFamilyIdx] : null;

    return (
        <div className={styles.page}>

            {/* ── Page header */}
            <div className={styles.pageHeader}>
                <h1 className={styles.title}>Stories</h1>
                <p className={styles.subtitle}>
                    Memories from your family and your own voice journal, {userName}
                </p>
            </div>

            {/* ── Tab switcher */}
            <div className={styles.tabBar}>
                <button
                    className={`${styles.tab} ${tab === 'family' ? styles.tabActive : ''}`}
                    onClick={() => setTab('family')}
                >
                    <Users size={16} />
                    Family
                </button>
                <button
                    className={`${styles.tab} ${tab === 'journal' ? styles.tabActive : ''}`}
                    onClick={() => setTab('journal')}
                >
                    <Pen size={16} />
                    My Journal
                </button>
            </div>

            {/* ═══════════════ FAMILY TAB ═══════════════ */}
            {tab === 'family' && (
                <>
                    {/* Contributor bubbles */}
                    <div className={styles.bubblesRow}>
                        {contributors.map((p, i) => (
                            <button
                                key={p.name}
                                className={styles.bubble}
                                style={{ animationDelay: `${i * 60}ms` }}
                                onClick={() => {
                                    const idx = familyStories.findIndex(s => s.contributorName === p.name);
                                    if (idx >= 0) setViewingFamilyIdx(idx);
                                }}
                                aria-label={`View stories from ${p.name}`}
                            >
                                <div className={`${styles.bubbleRing} ${i < 3 ? styles.bubbleRingNew : styles.bubbleRingRead}`}>
                                    <div className={styles.bubbleInner}>
                                        {p.photo ? (
                                            <img
                                                src={p.photo}
                                                alt={p.name}
                                                className={styles.bubbleImg}
                                                onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                            />
                                        ) : null}
                                        <span className={styles.bubbleInitial} aria-hidden>{getInitials(p.name)}</span>
                                    </div>
                                </div>
                                <span className={styles.bubbleLabel}>{p.name.split(' ')[0]}</span>
                            </button>
                        ))}
                    </div>

                    {/* Family story cards */}
                    <div className={styles.cards}>
                        {familyStories.map((s, i) => (
                            <article
                                key={s.id}
                                className={styles.card}
                                style={{ animationDelay: `${i * 50}ms` }}
                                onClick={() => setViewingFamilyIdx(i)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles.cardMeta}>
                                    {s.contributorPhoto ? (
                                        <img
                                            src={s.contributorPhoto}
                                            alt={s.contributorName}
                                            className={styles.cardPhoto}
                                            onError={e => { (e.target as HTMLImageElement).style.display = 'none'; }}
                                        />
                                    ) : (
                                        <div className={styles.cardInitial}>{getInitials(s.contributorName)}</div>
                                    )}
                                    <div className={styles.cardMetaText}>
                                        <span className={styles.cardName}>{s.contributorName}</span>
                                        <span className={styles.cardSub}>{s.contributorRelation} · {s.timeLabel}</span>
                                    </div>
                                </div>
                                <h3 className={styles.cardTitle}>{s.title}</h3>
                                <p className={styles.cardContent}>{s.content}</p>
                                <div className={styles.cardFooter}>
                                    <span className={styles.relationTag}>{s.contributorRelation}</span>
                                </div>
                            </article>
                        ))}
                    </div>
                </>
            )}

            {/* ═══════════════ JOURNAL TAB ═══════════════ */}
            {tab === 'journal' && (
                <>
                    {/* Journal entry bubbles */}
                    <div className={styles.bubblesRow}>
                        {/* Record new */}
                        <button
                            className={styles.bubble}
                            onClick={startRecording}
                            aria-label="Record a new journal entry"
                        >
                            <div className={`${styles.bubbleRing} ${styles.bubbleRingRecord}`}>
                                <div className={styles.bubbleInner}>
                                    <Mic size={26} color="var(--color-primary)" strokeWidth={2} />
                                </div>
                            </div>
                            <span className={styles.bubbleLabel}>Record</span>
                        </button>

                        {entries.map((e, i) => (
                            <button
                                key={e.id}
                                className={styles.bubble}
                                style={{ animationDelay: `${i * 60}ms` }}
                                onClick={() => setViewingJournalIdx(i)}
                                aria-label={`View journal from ${e.timeLabel}`}
                            >
                                <div className={`${styles.bubbleRing} ${i < 2 ? styles.bubbleRingNew : styles.bubbleRingRead}`}>
                                    <div className={styles.bubbleInner}>
                                        <div className={styles.bubbleSentimentBar} style={{ background: sentimentColor[e.sentiment] }} />
                                        <span className={styles.bubbleInitial} style={{ fontSize: '11px', color: 'var(--text-muted)', fontWeight: 600 }}>
                                            {e.timeLabel.replace(' ago', '').replace('Yesterday', 'Yest.')}
                                        </span>
                                    </div>
                                </div>
                                <span className={styles.bubbleLabel}>{e.timeLabel.replace(' ago', '')}</span>
                            </button>
                        ))}
                    </div>

                    {/* Journal cards */}
                    <div className={styles.cards}>
                        {entries.map((entry, i) => (
                            <article
                                key={entry.id}
                                className={styles.card}
                                style={{ animationDelay: `${i * 50}ms` }}
                                onClick={() => setViewingJournalIdx(i)}
                                role="button"
                                tabIndex={0}
                            >
                                <div className={styles.journalAccent} style={{ background: sentimentColor[entry.sentiment] }} />
                                <div className={styles.cardMeta}>
                                    <div className={styles.journalAvatarIcon}>
                                        <Mic size={18} color={sentimentColor[entry.sentiment]} strokeWidth={2} />
                                    </div>
                                    <div className={styles.cardMetaText}>
                                        <span className={styles.cardName}>Voice Journal</span>
                                        <span className={styles.cardSub}>
                                            <Clock size={11} /> {entry.timeLabel} · {fmt(entry.durationSeconds)}
                                        </span>
                                    </div>
                                    <span className={styles.sentimentLabel} style={{ color: sentimentColor[entry.sentiment], background: `${sentimentColor[entry.sentiment]}18` }}>
                                        {sentimentLabel[entry.sentiment]}
                                    </span>
                                </div>
                                <p className={styles.cardTranscription}>
                                    {highlightEntities(entry.transcription, entry.entities)}
                                </p>
                                <div className={styles.entityTags}>
                                    {entry.entities.map(e => (
                                        <span key={e} className={styles.entityTag}>{e}</span>
                                    ))}
                                </div>
                            </article>
                        ))}
                    </div>

                    {/* Floating record FAB */}
                    {!isRecording && viewingJournalIdx === null && (
                        <button className={styles.fab} onClick={startRecording} aria-label="Record a new memory">
                            <Mic size={26} />
                        </button>
                    )}
                </>
            )}

            {/* ═══════════════ RECORDING OVERLAY ═══════════════ */}
            {isRecording && (
                <div className={styles.recordOverlay}>
                    <div className={styles.recordPulseRing} />
                    <div className={styles.recordPulseRing} style={{ animationDelay: '0.5s' }} />
                    <div className={styles.recordCore}>
                        <Mic size={36} color="white" />
                    </div>
                    <h2 className={styles.recordTitle}>
                        {liveText ? 'Listening...' : `Speak, ${userName}`}
                    </h2>
                    <p className={styles.recordLive}>
                        {liveText || 'Tell me about your day, a memory, anything...'}
                    </p>
                    <span className={styles.recordTimer}>{fmt(recordTime)}</span>
                    <div className={styles.recordActions}>
                        <button className={styles.recordCancel} onClick={cancelRecording} aria-label="Cancel">
                            <X size={18} />
                        </button>
                        <button className={styles.recordStop} onClick={stopRecording} aria-label="Save">
                            <Square size={22} fill="white" />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════ JOURNAL FULLSCREEN VIEWER ═══════════════ */}
            {viewingJournal && viewingJournalIdx !== null && (
                <div className={styles.viewer} onClick={() => setViewingJournalIdx(null)}>
                    <div className={styles.viewerBg} style={{ background: `linear-gradient(160deg, ${sentimentColor[viewingJournal.sentiment]}22, var(--bg-surface) 70%)` }} />
                    <div className={styles.viewerProgress}>
                        {entries.map((_, i) => (
                            <div key={i} className={`${styles.progSeg} ${i === viewingJournalIdx ? styles.progSegActive : i < viewingJournalIdx ? styles.progSegDone : ''}`} />
                        ))}
                    </div>
                    <div className={styles.viewerHeader}>
                        <div className={styles.viewerAvatarWrap} style={{ background: `${sentimentColor[viewingJournal.sentiment]}20` }}>
                            <Mic size={20} color={sentimentColor[viewingJournal.sentiment]} />
                        </div>
                        <div className={styles.viewerInfo}>
                            <span className={styles.viewerName}>Voice Journal</span>
                            <span className={styles.viewerSub}>{viewingJournal.timeLabel} · {fmt(viewingJournal.durationSeconds)}</span>
                        </div>
                        <button className={styles.viewerClose} onClick={() => setViewingJournalIdx(null)} aria-label="Close"><X size={20} /></button>
                    </div>
                    <div className={styles.viewerBody} onClick={e => e.stopPropagation()}>
                        <div className={styles.viewerAccent} style={{ background: sentimentColor[viewingJournal.sentiment] }} />
                        <p className={styles.viewerText}>&ldquo;{viewingJournal.transcription}&rdquo;</p>
                        <span className={styles.viewerMood} style={{ color: sentimentColor[viewingJournal.sentiment] }}>
                            {sentimentLabel[viewingJournal.sentiment]}
                        </span>
                    </div>
                    <div className={styles.viewerNav} onClick={e => e.stopPropagation()}>
                        <button className={styles.navBtn} disabled={viewingJournalIdx <= 0} onClick={() => setViewingJournalIdx(i => Math.max(0, (i ?? 0) - 1))}>
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <button className={styles.navBtn} disabled={viewingJournalIdx >= entries.length - 1} onClick={() => setViewingJournalIdx(i => Math.min(entries.length - 1, (i ?? 0) + 1))}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}

            {/* ═══════════════ FAMILY FULLSCREEN VIEWER ═══════════════ */}
            {viewingFamily && viewingFamilyIdx !== null && (
                <div className={styles.viewer} onClick={() => setViewingFamilyIdx(null)}>
                    <div className={styles.viewerBg} style={{ background: 'linear-gradient(160deg, rgba(124,58,237,0.08), var(--bg-surface) 70%)' }} />
                    <div className={styles.viewerProgress}>
                        {familyStories.map((_, i) => (
                            <div key={i} className={`${styles.progSeg} ${i === viewingFamilyIdx ? styles.progSegActive : i < viewingFamilyIdx ? styles.progSegDone : ''}`} />
                        ))}
                    </div>
                    <div className={styles.viewerHeader}>
                        {viewingFamily.contributorPhoto ? (
                            <img src={viewingFamily.contributorPhoto} alt={viewingFamily.contributorName} className={styles.viewerPhoto} />
                        ) : (
                            <div className={styles.viewerAvatarWrap}><span>{getInitials(viewingFamily.contributorName)}</span></div>
                        )}
                        <div className={styles.viewerInfo}>
                            <span className={styles.viewerName}>{viewingFamily.contributorName}</span>
                            <span className={styles.viewerSub}>{viewingFamily.contributorRelation} · {viewingFamily.timeLabel}</span>
                        </div>
                        <button className={styles.viewerClose} onClick={() => setViewingFamilyIdx(null)} aria-label="Close"><X size={20} /></button>
                    </div>
                    <div className={styles.viewerBody} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.viewerTitle}>{viewingFamily.title}</h2>
                        <p className={styles.viewerText}>&ldquo;{viewingFamily.content}&rdquo;</p>
                        <span className={styles.viewerFrom}>— {viewingFamily.contributorName.split(' ')[0]}</span>
                    </div>
                    <div className={styles.viewerNav} onClick={e => e.stopPropagation()}>
                        <button className={styles.navBtn} disabled={viewingFamilyIdx <= 0} onClick={() => setViewingFamilyIdx(i => Math.max(0, (i ?? 0) - 1))}>
                            <ChevronLeft size={16} /> Prev
                        </button>
                        <button className={styles.navBtn} disabled={viewingFamilyIdx >= familyStories.length - 1} onClick={() => setViewingFamilyIdx(i => Math.min(familyStories.length - 1, (i ?? 0) + 1))}>
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
