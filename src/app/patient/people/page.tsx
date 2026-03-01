'use client';

import { useState, useEffect } from 'react';
import Image from 'next/image';
import { ChevronLeft, ChevronRight, Phone, Calendar, Play, Volume2 } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './people.module.css';
import { mockPeople, type PersonCard } from '@/lib/mock-data/patient';

const personColors = [
    { bg: 'linear-gradient(135deg, #F0EBE3 0%, #E8E0D4 100%)', text: '#2D5A3D' },
    { bg: 'linear-gradient(135deg, #E6EADD 0%, #D4DCDB 100%)', text: '#1E4A2F' },
    { bg: 'linear-gradient(135deg, #FDF7E5 0%, #F5ECC9 100%)', text: '#B8860B' },
    { bg: 'linear-gradient(135deg, #FDEBE5 0%, #F5D3C9 100%)', text: '#C0392B' },
    { bg: 'linear-gradient(135deg, #E6F1F1 0%, #C9E5E5 100%)', text: '#2B6CB0' },
    { bg: 'linear-gradient(135deg, #E8E0D4 0%, #DBCBBA 100%)', text: '#4A4A4A' },
];

const personInitials = (name: string) => {
    return name
        .split(' ')
        .map((n) => n[0])
        .join('')
        .slice(0, 2)
        .toUpperCase();
};

export default function PeoplePage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const [allPeople, setAllPeople] = useState<PersonCard[]>(mockPeople);
    const [currentIndex, setCurrentIndex] = useState(0);
    const [playing, setPlaying] = useState(false);

    // API fetch disabled for now – using mock data directly so names/images stay in sync.
    // useEffect(() => {
    //     fetch('/api/people')
    //         .then(r => r.json())
    //         .then(data => {
    //             if (data.people && data.people.length > 0) {
    //                 const mapped: PersonCard[] = data.people.map((p: { id: string; name: string; relationship: string; bio: string; photo_url: string; last_visited: string; phone: string }) => ({
    //                     id: p.id,
    //                     name: p.name,
    //                     relationship: p.relationship,
    //                     photo: p.photo_url || '',
    //                     bio: p.bio || '',
    //                     lastVisited: p.last_visited || '',
    //                     phone: p.phone || '',
    //                 }));
    //                 setAllPeople(mapped);
    //             }
    //         })
    //         .catch(() => { /* keep mock data */ });
    // }, []);

    const person = allPeople[currentIndex];
    const color = personColors[currentIndex % personColors.length];
    const total = allPeople.length;

    const goNext = () => {
        setCurrentIndex((i) => (i + 1) % total);
        setPlaying(false);
    };

    const goPrev = () => {
        setCurrentIndex((i) => (i - 1 + total) % total);
        setPlaying(false);
    };

    const handleVoiceNote = () => {
        setPlaying(!playing);
        // In production: play real audio
        if (!playing) {
            setTimeout(() => setPlaying(false), 5000);
        }
    };

    return (
        <div className={styles.page}>
            <h1 className={styles.pageTitle}>My People</h1>
            <p className={styles.pageSubtitle}>People who love you, {userName}</p>

            {/* CARD DECK */}
            <div className={styles.deckWrapper} aria-live="polite" aria-atomic="true">
                <article
                    className={styles.personCard}
                    aria-label={`${person.name}, ${person.relationship}`}
                >
                    {/* Photo / avatar area */}
                    <div className={styles.photoArea} style={{ background: color.bg }}>
                        {person.photo ? (
                            <Image src={person.photo} alt={person.name} fill className={styles.photoImage} />
                        ) : (
                            <div className={styles.avatarInitials} style={{ color: color.text }}>
                                {personInitials(person.name)}
                            </div>
                        )}
                        <span className={styles.photoHint}>(Photo of {person.name.split(' ')[0]})</span>
                    </div>

                    {/* Card info */}
                    <div className={styles.cardBody}>
                        <div className={styles.nameRow}>
                            <div>
                                <h2 className={styles.personName}>{person.name}</h2>
                                <p className={styles.personRelationship}>{person.relationship}</p>
                            </div>

                            {/* Voice note button */}
                            <button
                                className={`${styles.voiceBtn} ${playing ? styles.voiceBtnPlaying : ''}`}
                                onClick={handleVoiceNote}
                                aria-label={playing ? 'Pause voice note' : `Play voice note from ${person.name.split(' ')[0]}`}
                                data-tooltip={playing ? 'Pause the voice message' : `Play a personal voice message from ${person.name.split(' ')[0]}`}
                            >
                                {playing ? (
                                    <Volume2 size={26} />
                                ) : (
                                    <Play size={26} />
                                )}
                            </button>
                        </div>

                        {playing && (
                            <div className={styles.playingBar} aria-live="polite">
                                <div className={styles.playingWave}>
                                    {[...Array(5)].map((_, i) => (
                                        <span key={i} className={styles.wavebar} style={{ animationDelay: `${i * 100}ms` }} />
                                    ))}
                                </div>
                                <span className={styles.playingText}>Playing voice note from {person.name.split(' ')[0]}…</span>
                            </div>
                        )}

                        <p className={styles.personBio}>{person.bio}</p>

                        {/* Meta */}
                        <div className={styles.metaRow}>
                            <div className={styles.metaItem}>
                                <Calendar size={16} color="var(--text-muted)" />
                                <span>Last visit: {person.lastVisited}</span>
                            </div>
                            {person.phone && (
                                <a
                                    href={`tel:${person.phone}`}
                                    className={`btn btn--primary btn--patient ${styles.callBtn}`}
                                    aria-label={`Call ${person.name.split(' ')[0]}`}
                                    data-tooltip={`Call ${person.name.split(' ')[0]} right now`}
                                >
                                    <Phone size={20} />
                                    Call {person.name.split(' ')[0]}
                                </a>
                            )}
                        </div>
                    </div>
                </article>
            </div>

            {/* Dot indicators */}
            <div className={styles.dotRow} role="tablist" aria-label="People navigation">
                {allPeople.map((p, i) => (
                    <button
                        key={p.id}
                        role="tab"
                        aria-selected={i === currentIndex}
                        aria-label={`Go to ${p.name}`}
                        className={`${styles.dot} ${i === currentIndex ? styles.dotActive : ''}`}
                        onClick={() => { setCurrentIndex(i); setPlaying(false); }}
                    />
                ))}
            </div>

            {/* Navigation buttons */}
            <div className={styles.navRow}>
                <button
                    className={`btn btn--secondary ${styles.navBtn}`}
                    onClick={goPrev}
                    aria-label="Previous person"
                    data-tooltip="See the previous person in your people wallet"
                >
                    <ChevronLeft size={24} />
                    Previous
                </button>
                <span className={styles.navCount}>{currentIndex + 1} / {total}</span>
                <button
                    className={`btn btn--primary ${styles.navBtn}`}
                    onClick={goNext}
                    aria-label="Next person"
                    data-tooltip="See the next person in your people wallet"
                >
                    Next
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}
