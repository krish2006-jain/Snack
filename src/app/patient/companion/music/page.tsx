'use client';

import { useState } from 'react';
import Link from 'next/link';
import { ArrowLeft, Play, Pause, SkipForward, SkipBack, Music2, Wind, Smile, Frown, Zap, Meh, MessageCircle } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './music.module.css';

type Mood = 'calm' | 'anxious' | 'happy' | 'sad' | 'angry';

interface MoodOption {
    id: Mood;
    label: string;
    sublabel: string;
    icon: React.ReactNode;
    playlist: string;
    tracks: string[];
    color: string;
}

const moods: MoodOption[] = [
    {
        id: 'calm',
        label: 'Calm',
        sublabel: 'Peaceful & rested',
        icon: <Wind size={28} />,
        playlist: 'Raag Bhairavi Mornings',
        tracks: ['Raag Bhairavi - Pandit Jasraj', 'Thumri in Bhairavi - Girija Devi', 'Morning Raga - Bismillah Khan', 'Bhajan - Lata Mangeshkar'],
        color: '#3B82F6',
    },
    {
        id: 'anxious',
        label: 'Anxious',
        sublabel: 'Worried or uneasy',
        icon: <Zap size={28} />,
        playlist: 'Slow & Soothing Hindostani',
        tracks: ['Dil Dhoondta Hai - Mausam', 'Lag Ja Gale - Lata Mangeshkar', 'Aye Mere Watan - Lata Mangeshkar', 'Tere Liye - Veer-Zaara'],
        color: '#F59E0B',
    },
    {
        id: 'happy',
        label: 'Happy',
        sublabel: 'Joyful & bright',
        icon: <Smile size={28} />,
        playlist: 'Old Hindi Evergreens',
        tracks: ['Mere Sapno Ki Rani - Aradhana', 'Aaja Sanam - Chori Chori', 'Dum Maro Dum - Hare Rama Hare Krishna', 'Yeh Shaam Mastani - Kati Patang'],
        color: '#22C55E',
    },
    {
        id: 'sad',
        label: 'Sad',
        sublabel: 'Low or melancholic',
        icon: <Frown size={28} />,
        playlist: 'Gentle Bhajans for Solace',
        tracks: ['Raghupati Raghav Raja Ram', 'Om Jai Jagdish Hare', 'Itni Shakti Humein Dena Daata', 'Ram Naam Satya Hai'],
        color: '#2D5A3D',
    },
    {
        id: 'angry',
        label: 'Agitated',
        sublabel: 'Restless or irritable',
        icon: <Meh size={28} />,
        playlist: 'Slow Instrumental Sitar',
        tracks: ['Raga Yaman - Ravi Shankar', 'Evening Raga - Ali Akbar Khan', 'Tilak Kamod Gat - Ravi Shankar', 'Sitar Meditation - Nikhil Banerjee'],
        color: '#EF4444',
    },
];

export default function MusicPage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const [selectedMood, setSelectedMood] = useState<Mood | null>(null);
    const [isPlaying, setIsPlaying] = useState(false);
    const [currentTrack, setCurrentTrack] = useState(0);
    const [progress, setProgress] = useState(32);
    const [postMoodAsked, setPostMoodAsked] = useState(false);
    const [postMood, setPostMood] = useState<string | null>(null);

    const activeMood = moods.find((m) => m.id === selectedMood);

    const nextTrack = () => setCurrentTrack((t) => (t + 1) % (activeMood?.tracks.length ?? 1));
    const prevTrack = () => setCurrentTrack((t) => (t - 1 + (activeMood?.tracks.length ?? 1)) % (activeMood?.tracks.length ?? 1));

    return (
        <div className={styles.page}>
            {/* Top nav with tabs */}
            <div className={styles.topNav}>
                <Link href="/patient/companion" className={styles.backBtn} aria-label="Back to chat">
                    <ArrowLeft size={20} />
                </Link>
                <div className={styles.tabs}>
                    <Link href="/patient/companion" className={styles.tab}>
                        <MessageCircle size={16} />
                        Chat
                    </Link>
                    <span className={`${styles.tab} ${styles.tabActive}`}>
                        <Music2 size={16} />
                        Music
                    </span>
                </div>
            </div>

            <div className={styles.content}>
                {!selectedMood ? (
                    /* MOOD CHECK-IN */
                    <section className={styles.moodSection}>
                        <div className={styles.moodHeader}>
                            <h1 className={styles.moodTitle}>How are you feeling right now, {userName}?</h1>
                            <p className={styles.moodSub}>We&apos;ll pick the right music for your mood.</p>
                        </div>
                        <div className={styles.moodGrid}>
                            {moods.map((mood) => (
                                <button
                                    key={mood.id}
                                    className={styles.moodCard}
                                    onClick={() => {
                                        setSelectedMood(mood.id);
                                        setCurrentTrack(0);
                                        setIsPlaying(true);
                                        fetch('/api/mood', {
                                            method: 'POST',
                                            headers: { 'Content-Type': 'application/json' },
                                            body: JSON.stringify({ mood: mood.id, source: 'music_therapy' }),
                                        }).catch(() => { });
                                    }}
                                    style={{ '--mood-color': mood.color } as React.CSSProperties}
                                    aria-label={`I feel ${mood.label}`}
                                >
                                    <span className={styles.moodIcon}>{mood.icon}</span>
                                    <span className={styles.moodLabel}>{mood.label}</span>
                                    <span className={styles.moodSublabel}>{mood.sublabel}</span>
                                </button>
                            ))}
                        </div>
                    </section>
                ) : (
                    /* NOW PLAYING */
                    <section className={styles.playerSection}>
                        <div className={styles.nowPlayingCard}>
                            {/* Album art visual */}
                            <div className={styles.albumArt} style={{ background: `linear-gradient(135deg, ${activeMood!.color}22, ${activeMood!.color}44)` }}>
                                <div className={styles.vinylRing} style={{ borderColor: activeMood!.color }}>
                                    <Music2 size={40} color={activeMood!.color} />
                                </div>
                            </div>

                            <div className={styles.trackInfo}>
                                <p className={styles.playlistLabel}>{activeMood!.playlist}</p>
                                <h2 className={styles.trackName}>{activeMood!.tracks[currentTrack]}</h2>
                                <p className={styles.trackNum}>Track {currentTrack + 1} of {activeMood!.tracks.length}</p>
                            </div>

                            {/* Progress bar */}
                            <div className={styles.progressWrap}>
                                <div className={styles.progressBar}>
                                    <div
                                        className={styles.progressFill}
                                        style={{ width: `${progress}%`, background: activeMood!.color }}
                                    />
                                </div>
                                <div className={styles.progressTimes}>
                                    <span>1:02</span>
                                    <span>3:14</span>
                                </div>
                            </div>

                            {/* Controls */}
                            <div className={styles.controls}>
                                <button className={styles.skipBtn} onClick={prevTrack} aria-label="Previous track">
                                    <SkipBack size={28} />
                                </button>
                                <button
                                    className={styles.playBtn}
                                    onClick={() => setIsPlaying((p) => !p)}
                                    style={{ background: activeMood!.color }}
                                    aria-label={isPlaying ? 'Pause' : 'Play'}
                                >
                                    {isPlaying ? <Pause size={36} fill="white" /> : <Play size={36} fill="white" />}
                                </button>
                                <button className={styles.skipBtn} onClick={nextTrack} aria-label="Next track">
                                    <SkipForward size={28} />
                                </button>
                            </div>
                        </div>

                        {/* Tracklist */}
                        <div className={styles.tracklist}>
                            {activeMood!.tracks.map((track, i) => (
                                <button
                                    key={track}
                                    className={`${styles.trackRow} ${i === currentTrack ? styles.trackRowActive : ''}`}
                                    onClick={() => { setCurrentTrack(i); setIsPlaying(true); }}
                                    style={i === currentTrack ? { '--mood-color': activeMood!.color } as React.CSSProperties : undefined}
                                >
                                    <span className={styles.trackIdx}>{i + 1}</span>
                                    <span className={styles.trackRowName}>{track}</span>
                                    {i === currentTrack && isPlaying && <span className={styles.playingDot} style={{ background: activeMood!.color }} />}
                                </button>
                            ))}
                        </div>

                        {/* Post-music check-in */}
                        {!postMoodAsked ? (
                            <button className={styles.postMoodBtn} onClick={() => setPostMoodAsked(true)}>
                                How are you feeling now?
                            </button>
                        ) : !postMood ? (
                            <div className={styles.postMoodOptions}>
                                <p className={styles.postMoodQ}>After listening, I feel…</p>
                                <div className={styles.postMoodBtns}>
                                    {['Better 😊', 'Same 😐', 'Still anxious 😟'].map((opt) => (
                                        <button key={opt} className={styles.postMoodChip} onClick={() => setPostMood(opt)}>{opt}</button>
                                    ))}
                                </div>
                            </div>
                        ) : (
                            <div className={styles.postMoodThanks}>
                                <p>Thank you, {userName}. Your caretaker has been updated. 💜</p>
                            </div>
                        )}

                        <button className={styles.changeMoodBtn} onClick={() => { setSelectedMood(null); setIsPlaying(false); setPostMoodAsked(false); setPostMood(null); }}>
                            ← Choose different mood
                        </button>
                    </section>
                )}
            </div>
        </div>
    );
}
