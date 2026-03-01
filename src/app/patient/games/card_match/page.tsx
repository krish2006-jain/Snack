'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Timer, RotateCcw, Star } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './card-match.module.css';
import { mockPeople } from '@/lib/mock-data';

interface Card {
    uid: string;
    id: string;
    name: string;
    relation: string;
    photo: string;
    color: string;
    isFlipped: boolean;
    isMatched: boolean;
    displayMode: 'photo' | 'name';
}

const COLORS = ['#2D5A3D', '#3B82F6', '#22C55E', '#F59E0B', '#8B5CF6', '#EC4899'];

function makeCards(): Card[] {
    const pairs: Card[] = [];
    const _people = mockPeople as any[];
    // Use family members with photos (skip 'Self')
    const validPeople = _people.filter(p => (p.image || p.photo) && (p.relation || p.relationship) !== 'Self').slice(0, 4);

    validPeople.forEach((p, i) => {
        const photoUrl = p.image || p.photo;
        const relationStr = p.relation || p.relationship;
        const base = { id: p.id, name: p.name, relation: relationStr, photo: photoUrl, color: COLORS[i % COLORS.length], isFlipped: false, isMatched: false };
        // Card A shows the photo
        pairs.push({ ...base, uid: `${p.id}-photo`, displayMode: 'photo' });
        // Card B shows the name
        pairs.push({ ...base, uid: `${p.id}-name`, displayMode: 'name' });
    });
    // Shuffle cards
    return pairs.sort(() => Math.random() - 0.5);
}

function calcStars(flips: number, time: number): number {
    if (flips <= 10 && time <= 45) return 3;
    if (flips <= 16 && time <= 90) return 2;
    return 1;
}

export default function CardMatchGame() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const router = useRouter();
    const [cards, setCards] = useState<Card[]>(() => makeCards());
    const [selected, setSelected] = useState<string[]>([]);
    const [flips, setFlips] = useState(0);
    const [seconds, setSeconds] = useState(0);
    const [running, setRunning] = useState(false);
    const [won, setWon] = useState(false);
    const [stars, setStars] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    useEffect(() => {
        if (running) {
            timerRef.current = setInterval(() => setSeconds((s) => s + 1), 1000);
        } else {
            if (timerRef.current) clearInterval(timerRef.current);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
    }, [running]);

    const handleFlip = (uid: string) => {
        if (won) return;
        const card = cards.find((c) => c.uid === uid);
        if (!card || card.isFlipped || card.isMatched || selected.length === 2) return;

        if (!running) setRunning(true);

        const newSelected = [...selected, uid];
        setSelected(newSelected);
        setCards((prev) => prev.map((c) => c.uid === uid ? { ...c, isFlipped: true } : c));

        if (newSelected.length === 2) {
            setFlips((f) => f + 1);
            const [a, b] = newSelected.map((id) => cards.find((c) => c.uid === id)!);
            if (a.id === b.id) {
                // Match!
                setTimeout(() => {
                    setCards((prev) => prev.map((c) => newSelected.includes(c.uid) ? { ...c, isMatched: true } : c));
                    setSelected([]);
                    // Check win
                    setTimeout(() => {
                        setCards((prev) => {
                            const allMatched = prev.every((c) => c.isMatched || newSelected.includes(c.uid));
                            if (allMatched) {
                                setRunning(false);
                                setWon(true);
                                const s = calcStars(flips + 1, seconds);
                                setStars(s);
                                fetch('/api/games', {
                                    method: 'POST',
                                    headers: { 'Content-Type': 'application/json' },
                                    body: JSON.stringify({ gameType: 'card_match', score: Math.max(100 - (flips + 1) * 5, 10), stars: s, durationSeconds: seconds }),
                                }).catch(() => { });
                            }
                            return prev;
                        });
                    }, 50);
                }, 500);
            } else {
                // No match - flip back
                setTimeout(() => {
                    setCards((prev) => prev.map((c) => newSelected.includes(c.uid) ? { ...c, isFlipped: false } : c));
                    setSelected([]);
                }, 1000);
            }
        }
    };

    const restart = () => {
        setCards(makeCards());
        setSelected([]);
        setFlips(0);
        setSeconds(0);
        setRunning(false);
        setWon(false);
        setStars(0);
    };

    const fmt = (s: number) => `${Math.floor(s / 60)}:${(s % 60).toString().padStart(2, '0')}`;

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/patient/games')} aria-label="Back to games">
                    <ArrowLeft size={20} />
                    <span>Games</span>
                </button>
                <h1 className={styles.gameTitle}>Face to Name</h1>
                <div className={styles.stats}>
                    <div className={styles.stat}>
                        <Timer size={16} />
                        <span>{fmt(seconds)}</span>
                    </div>
                    <div className={styles.stat}>
                        <RotateCcw size={16} />
                        <span>{flips} flips</span>
                    </div>
                </div>
            </div>

            <div className={styles.content}>
                <p className={styles.hint}>Match the photo of your family member with their name, {userName}.</p>

                {/* Card grid */}
                <div className={styles.cardGrid} aria-label="Card matching game grid" role="grid">
                    {cards.map((card) => (
                        <button
                            key={card.uid}
                            className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.cardFlipped : ''} ${card.isMatched ? styles.cardMatched : ''}`}
                            onClick={() => handleFlip(card.uid)}
                            aria-label={card.isFlipped || card.isMatched ? (card.displayMode === 'photo' ? `Photo of ${card.name}` : `Name: ${card.name}`) : 'Face-down card'}
                            aria-pressed={card.isFlipped || card.isMatched}
                            disabled={card.isMatched || won}
                        >
                            <div className={styles.cardInner}>
                                {/* Back */}
                                <div className={styles.cardBack}>
                                    <div className={styles.cardBackPattern}>
                                        <span className={styles.cardBackLogo}>SC</span>
                                    </div>
                                </div>
                                {/* Front */}
                                <div className={styles.cardFront} style={{ '--card-color': card.color } as React.CSSProperties}>
                                    {card.displayMode === 'photo' ? (
                                        <div className={styles.cardAvatar}>
                                            <img src={card.photo} alt={card.name} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                                        </div>
                                    ) : (
                                        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
                                            <p className={styles.cardName} style={{ fontSize: '1.4rem' }}>{card.name}</p>
                                            <p className={styles.cardRelation}>{card.relation}</p>
                                        </div>
                                    )}
                                    {card.isMatched && <div className={styles.matchedOverlay} aria-hidden="true">✓</div>}
                                </div>
                            </div>
                        </button>
                    ))}
                </div>
            </div>

            {/* Win overlay */}
            {won && (
                <div className={styles.winOverlay} role="dialog" aria-modal="true" aria-label="You won!">
                    <div className={styles.winCard}>
                        <div className={styles.winStars}>
                            {[1, 2, 3].map((s) => (
                                <Star key={s} size={40} fill={s <= stars ? '#F59E0B' : 'transparent'} color={s <= stars ? '#F59E0B' : '#D1C4E9'} />
                            ))}
                        </div>
                        <h2 className={styles.winTitle}>Excellent, {userName}! 🎉</h2>
                        <p className={styles.winSub}>You matched all pairs in {fmt(seconds)} with {flips} flips.</p>
                        <div className={styles.winStats}>
                            <div className={styles.winStat}>
                                <span className={styles.winStatVal}>{flips}</span>
                                <span className={styles.winStatLabel}>Flips</span>
                            </div>
                            <div className={styles.winStat}>
                                <span className={styles.winStatVal}>{fmt(seconds)}</span>
                                <span className={styles.winStatLabel}>Time</span>
                            </div>
                            <div className={styles.winStat}>
                                <span className={styles.winStatVal}>{stars} ⭐</span>
                                <span className={styles.winStatLabel}>Stars</span>
                            </div>
                        </div>
                        <div className={styles.winActions}>
                            <button className={styles.playAgainBtn} onClick={restart}>Play Again</button>
                            <button className={styles.backToGamesBtn} onClick={() => router.push('/patient/games')}>Back to Games</button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
