'use client';

import { useState, useRef, useEffect } from 'react';
import Link from 'next/link';
import { ChevronLeft, Play, Pause, SkipForward, SkipBack, Music, Volume2 } from 'lucide-react';
import { apiFetch } from '@/lib/api';
import styles from './radio.module.css';
import { mockRadioSongs, type RadioSong } from '@/lib/mock-data/patient';

export default function PatientRadio() {
    const [songs, setSongs] = useState<RadioSong[]>([]);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [isPlaying, setIsPlaying] = useState(false);
    const [loaded, setLoaded] = useState(false);

    const audioRef = useRef<HTMLAudioElement | null>(null);

    useEffect(() => {
        // Fetch from API, fallback to mock data
        apiFetch<{ songs: RadioSong[] }>('/api/radio')
            .then(data => {
                setSongs(data.songs || mockRadioSongs);
                setLoaded(true);
            })
            .catch(() => {
                setSongs(mockRadioSongs);
                setLoaded(true);
            });

        return () => {
            if (audioRef.current) {
                audioRef.current.pause();
                audioRef.current.src = '';
            }
        };
    }, []);

    const currentSong = songs[currentIndex];

    useEffect(() => {
        if (!currentSong) return;

        if (audioRef.current) {
            audioRef.current.pause();
        }

        if (currentSong.audioUrl) {
            audioRef.current = new Audio(currentSong.audioUrl);
            audioRef.current.addEventListener('ended', handleNext);

            if (isPlaying) {
                audioRef.current.play().catch(e => console.error("Audio playback failed:", e));
            }
        } else {
            audioRef.current = null;
        }

        return () => {
            if (audioRef.current) {
                audioRef.current.removeEventListener('ended', handleNext);
            }
        };
    }, [currentIndex, currentSong]); // eslint-disable-next-line react-hooks/exhaustive-deps

    const handlePlayPause = () => {
        if (!audioRef.current && currentSong?.audioUrl) {
            audioRef.current = new Audio(currentSong.audioUrl);
            audioRef.current.addEventListener('ended', handleNext);
        }

        if (isPlaying) {
            audioRef.current?.pause();
            setIsPlaying(false);
        } else {
            audioRef.current?.play().catch(e => console.error(e));
            setIsPlaying(true);
        }
    };

    const handleNext = () => {
        if (songs.length === 0) return;
        setCurrentIndex((prev) => (prev + 1) % songs.length);
        setIsPlaying(true);
    };

    const handlePrev = () => {
        if (songs.length === 0) return;
        setCurrentIndex((prev) => (prev - 1 + songs.length) % songs.length);
        setIsPlaying(true);
    };

    if (!loaded) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <div className={styles.skTitle} />
                </header>
                <main className={styles.main}>
                    <div className={styles.skDisc} />
                    <div className={styles.skBar} />
                </main>
            </div>
        );
    }

    if (songs.length === 0) {
        return (
            <div className={styles.page}>
                <header className={styles.header}>
                    <Link href="/patient" className={`btn btn--ghost ${styles.backBtn}`}>
                        <ChevronLeft size={28} />
                        <span>Back</span>
                    </Link>
                    <h1 className={styles.pageTitle}>Nostalgia Radio</h1>
                </header>
                <main className={styles.mainEmpty}>
                    <Music size={64} color="var(--text-muted)" />
                    <h2>No songs available</h2>
                    <p>Ask your family to add your favorite songs.</p>
                </main>
            </div>
        );
    }

    return (
        <div className={styles.page}>
            <header className={styles.header}>
                <Link href="/patient" className={`btn btn--ghost ${styles.backBtn}`} aria-label="Go back to Home">
                    <ChevronLeft size={32} />
                    <span>Home</span>
                </Link>
                <div className={styles.headerTitleWrap}>
                    <h1 className={styles.pageTitle}>Nostalgia Radio</h1>
                </div>
            </header>

            <main className={styles.main}>
                <div className={styles.playerCard}>
                    <div
                        className={`${styles.disc} ${isPlaying && currentSong.audioUrl ? styles.spinning : ''}`}
                        style={{ background: currentSong.coverColor || 'var(--color-primary)' }}
                    >
                        <div className={styles.discInner}>
                            <Music size={48} color="rgba(255,255,255,0.8)" />
                        </div>
                    </div>

                    <div className={styles.songInfo}>
                        <h2 className={styles.songTitle}>{currentSong.title}</h2>
                        <p className={styles.songArtist}>{currentSong.artist}</p>
                        <span className={styles.songPill}>Added by {currentSong.addedBy}</span>
                    </div>

                    {!currentSong.audioUrl && (
                        <div style={{ color: 'var(--color-warning)', fontSize: '0.85rem', marginTop: '-16px' }}>
                            Audio stream unavailable for this track
                        </div>
                    )}

                    <div className={styles.controls}>
                        <button
                            className={styles.secondaryBtn}
                            onClick={handlePrev}
                            aria-label="Previous song"
                        >
                            <SkipBack size={40} />
                        </button>

                        <button
                            className={`${styles.playBtn} ${isPlaying ? styles.playing : ''}`}
                            onClick={handlePlayPause}
                            aria-label={isPlaying ? "Pause" : "Play"}
                            disabled={!currentSong.audioUrl}
                            style={{ opacity: currentSong.audioUrl ? 1 : 0.5 }}
                        >
                            {isPlaying ? <Pause size={56} /> : <Play size={56} style={{ marginLeft: '8px' }} />}
                        </button>

                        <button
                            className={styles.secondaryBtn}
                            onClick={handleNext}
                            aria-label="Next song"
                        >
                            <SkipForward size={40} />
                        </button>
                    </div>

                    {isPlaying && currentSong.audioUrl && (
                        <div className={styles.playingIndicator}>
                            <Volume2 size={24} className={styles.pulseIcon} />
                            <span>Playing...</span>
                        </div>
                    )}
                </div>
            </main>
        </div>
    );
}
