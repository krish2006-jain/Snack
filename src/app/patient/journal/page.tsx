'use client';

import { useState, useRef, useCallback, useEffect } from 'react';
import { Mic, MicOff, Square, X, ChevronLeft, ChevronRight, BookOpen, Clock } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { mockVoiceJournal, type VoiceJournalEntry } from '@/lib/mock-data/patient';
import styles from './journal.module.css';

const sentimentEmoji: Record<string, string> = {
    happy: '😊',
    nostalgic: '🌅',
    neutral: '💭',
    sad: '😢',
};

const sentimentLabel: Record<string, string> = {
    happy: 'Happy',
    nostalgic: 'Nostalgic',
    neutral: 'Reflective',
    sad: 'Thoughtful',
};

function highlightEntities(text: string, entities: string[]): React.ReactNode[] {
    if (!entities.length) return [text];
    const regex = new RegExp(`\\b(${entities.map(e => e.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')).join('|')})\\b`, 'gi');
    const parts = text.split(regex);
    return parts.map((part, i) => {
        const isEntity = entities.some(e => e.toLowerCase() === part.toLowerCase());
        if (isEntity) {
            return <span key={i} className={styles.entityHighlight}>{part}</span>;
        }
        return part;
    });
}

export default function VoiceJournalPage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const [entries, setEntries] = useState<VoiceJournalEntry[]>(mockVoiceJournal);
    const [isRecording, setIsRecording] = useState(false);
    const [liveText, setLiveText] = useState('');
    const [recordTime, setRecordTime] = useState(0);
    const [viewingIndex, setViewingIndex] = useState<number | null>(null);
    const timerRef = useRef<NodeJS.Timeout | null>(null);
    const recognitionRef = useRef<any>(null);

    // Start recording
    const startRecording = useCallback(() => {
        setIsRecording(true);
        setLiveText('');
        setRecordTime(0);

        timerRef.current = setInterval(() => {
            setRecordTime(t => t + 1);
        }, 1000);

        // Web Speech API
        if (typeof window !== 'undefined' && ('SpeechRecognition' in window || 'webkitSpeechRecognition' in window)) {
            const SpeechRecognitionCtor = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
            if (SpeechRecognitionCtor) {
                const recognition = new SpeechRecognitionCtor();
                recognition.continuous = true;
                recognition.interimResults = true;
                recognition.lang = 'en-IN';
                recognition.onresult = (event: any) => {
                    let transcript = '';
                    for (let i = 0; i < event.results.length; i++) {
                        transcript += event.results[i][0].transcript;
                    }
                    setLiveText(transcript);
                };
                recognition.onerror = () => { /* ignore errors */ };
                recognition.start();
                recognitionRef.current = recognition;
            }
        }
    }, []);

    // Stop recording
    const stopRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }

        const text = liveText.trim();
        if (text) {
            // Simple entity extraction - match against known names
            const knownEntities = ['Priya', 'Smita', 'Anita', 'Aarav', 'Riya', 'Mohit', 'Kamla', 'Varanasi', 'cricket', 'chai', 'garden'];
            const entities = knownEntities.filter(e => text.toLowerCase().includes(e.toLowerCase()));

            const newEntry: VoiceJournalEntry = {
                id: `vj-${Date.now()}`,
                transcription: text,
                entities,
                sentiment: 'neutral',
                durationSeconds: recordTime,
                createdAt: new Date().toISOString(),
                timeLabel: 'Just now',
            };
            setEntries(prev => [newEntry, ...prev]);
        }

        setIsRecording(false);
        setLiveText('');
        setRecordTime(0);
    }, [liveText, recordTime]);

    const cancelRecording = useCallback(() => {
        if (timerRef.current) clearInterval(timerRef.current);
        if (recognitionRef.current) {
            recognitionRef.current.stop();
            recognitionRef.current = null;
        }
        setIsRecording(false);
        setLiveText('');
        setRecordTime(0);
    }, []);

    const formatDuration = (seconds: number) => {
        const m = Math.floor(seconds / 60);
        const s = seconds % 60;
        return `${m}:${s.toString().padStart(2, '0')}`;
    };

    const viewedEntry = viewingIndex !== null ? entries[viewingIndex] : null;

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <span className={styles.eyebrow}>
                    <BookOpen size={14} />
                    Voice Journal
                </span>
                <h1 className={styles.title}>My Stories</h1>
                <p className={styles.subtitle}>
                    Record your thoughts and memories, {userName}. Your family can see them too.
                </p>
            </div>

            {/* Stories bubble row */}
            <div className={styles.storiesRow}>
                {/* Record new story bubble */}
                <button className={styles.storyBubble} onClick={startRecording} aria-label="Record a new story">
                    <div className={`${styles.storyRing} ${styles.storyRingRecord}`}>
                        <div className={styles.storyAvatar}>
                            <Mic size={28} color="#EF4444" />
                        </div>
                    </div>
                    <span className={`${styles.storyLabel} ${styles.storyLabelActive}`}>Record</span>
                </button>

                {/* Existing story bubbles */}
                {entries.map((entry, i) => (
                    <button
                        key={entry.id}
                        className={styles.storyBubble}
                        onClick={() => setViewingIndex(i)}
                        aria-label={`View story from ${entry.timeLabel}`}
                    >
                        <div className={`${styles.storyRing} ${i > 2 ? styles.storyRingViewed : ''}`}>
                            <div className={styles.storyAvatar}>
                                <span style={{ fontSize: '28px' }}>{sentimentEmoji[entry.sentiment]}</span>
                                <span className={styles.sentimentDot}>{sentimentEmoji[entry.sentiment]}</span>
                            </div>
                        </div>
                        <span className={styles.storyLabel}>{entry.timeLabel}</span>
                    </button>
                ))}
            </div>

            {/* Story cards feed */}
            <div className={styles.storiesFeed}>
                {entries.map((entry, i) => (
                    <article
                        key={entry.id}
                        className={styles.storyCard}
                        onClick={() => setViewingIndex(i)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Story from ${entry.timeLabel}`}
                    >
                        <div className={styles.storyCardHeader}>
                            <div className={styles.storyCardAvatar}>
                                <span style={{ fontSize: '18px' }}>{sentimentEmoji[entry.sentiment]}</span>
                            </div>
                            <div className={styles.storyCardInfo}>
                                <div className={styles.storyCardName}>
                                    {userName}&apos;s Journal
                                </div>
                                <div className={styles.storyCardTime}>{entry.timeLabel}</div>
                            </div>
                            <span className={styles.storyCardDuration}>
                                <Clock size={12} />
                                {formatDuration(entry.durationSeconds)}
                            </span>
                        </div>
                        <div className={styles.storyCardBody}>
                            <p className={styles.storyCardTranscription}>
                                {highlightEntities(entry.transcription, entry.entities)}
                            </p>
                            <div className={styles.storyCardFooter}>
                                <span className={`${styles.sentimentBadge} ${styles[`sentiment${entry.sentiment.charAt(0).toUpperCase() + entry.sentiment.slice(1)}` as keyof typeof styles]}`}>
                                    {sentimentEmoji[entry.sentiment]} {sentimentLabel[entry.sentiment]}
                                </span>
                                {entry.entities.map(e => (
                                    <span key={e} className={styles.entityTag}>{e}</span>
                                ))}
                            </div>
                        </div>
                    </article>
                ))}
            </div>

            {/* Floating record button */}
            {!isRecording && viewingIndex === null && (
                <button className={styles.recordFab} onClick={startRecording} aria-label="Record a new story">
                    <Mic size={28} />
                </button>
            )}

            {/* Recording overlay */}
            {isRecording && (
                <div className={styles.recordOverlay}>
                    <div className={styles.recordVisual}>
                        <div className={styles.recordWaveRing} />
                        <div className={styles.recordWaveRing} />
                        <div className={styles.recordWaveRing} />
                        <div className={styles.recordVisualInner}>
                            <Mic size={40} color="white" />
                        </div>
                    </div>

                    <h2 className={styles.recordTitle}>
                        {liveText ? 'Listening...' : 'Start speaking, ' + userName}
                    </h2>

                    <p className={styles.recordLiveText}>
                        {liveText || 'Tell me about your day, a memory, or anything on your mind...'}
                    </p>

                    <span className={styles.recordTimer}>{formatDuration(recordTime)}</span>

                    <div className={styles.recordActions}>
                        <button className={styles.recordCancelBtn} onClick={cancelRecording} aria-label="Cancel">
                            <X size={20} />
                        </button>
                        <button className={styles.recordStopBtn} onClick={stopRecording} aria-label="Stop recording">
                            <Square size={24} fill="white" />
                        </button>
                    </div>
                </div>
            )}

            {/* Fullscreen story viewer */}
            {viewedEntry && viewingIndex !== null && (
                <div className={styles.storyViewer} onClick={() => setViewingIndex(null)}>
                    <div className={`${styles.storyViewerBg} ${styles[`storyViewerBg${viewedEntry.sentiment.charAt(0).toUpperCase() + viewedEntry.sentiment.slice(1)}` as keyof typeof styles]}`} />

                    {/* Progress segments */}
                    <div className={styles.storyViewerProgress}>
                        {entries.map((_, i) => (
                            <div
                                key={i}
                                className={`${styles.progressSegment} ${i === viewingIndex ? styles.progressSegmentActive : ''} ${i < viewingIndex ? styles.progressSegmentViewed : ''}`}
                            />
                        ))}
                    </div>

                    {/* Header */}
                    <div className={styles.storyViewerHeader}>
                        <div className={styles.storyViewerAvatar}>
                            <span style={{ fontSize: '18px' }}>{sentimentEmoji[viewedEntry.sentiment]}</span>
                        </div>
                        <div className={styles.storyViewerInfo}>
                            <div className={styles.storyViewerName}>{userName}&apos;s Journal</div>
                            <div className={styles.storyViewerTime}>{viewedEntry.timeLabel} · {formatDuration(viewedEntry.durationSeconds)}</div>
                        </div>
                        <button className={styles.storyViewerClose} onClick={() => setViewingIndex(null)} aria-label="Close">
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className={styles.storyViewerBody} onClick={e => e.stopPropagation()}>
                        <p className={styles.storyViewerText}>
                            &ldquo;{viewedEntry.transcription}&rdquo;
                        </p>
                        <div className={styles.storyViewerSentiment}>
                            {sentimentEmoji[viewedEntry.sentiment]} Feeling {sentimentLabel[viewedEntry.sentiment].toLowerCase()}
                        </div>
                    </div>

                    {/* Navigation */}
                    <div className={styles.storyViewerNav} onClick={e => e.stopPropagation()}>
                        <button
                            className={styles.storyNavBtn}
                            disabled={viewingIndex <= 0}
                            onClick={() => setViewingIndex(Math.max(0, viewingIndex - 1))}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button
                            className={styles.storyNavBtn}
                            disabled={viewingIndex >= entries.length - 1}
                            onClick={() => setViewingIndex(Math.min(entries.length - 1, viewingIndex + 1))}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
