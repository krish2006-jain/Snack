'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Timer, RotateCcw, Star } from 'lucide-react';
import styles from './card-match.module.css';
import { mockPeople } from '@/lib/mock-data';

interface Card {
    uid: string;
    id: string;
    name: string;
    relation: string;
    initials: string;
    color: string;
    isFlipped: boolean;
    isMatched: boolean;
}

const COLORS = ['#2D5A3D', '#3B82F6', '#22C55E', '#F59E0B'];

// Take 2 pairs from mockPeople for moderate difficulty
const peoplePairs = mockPeople.slice(0, 2);

function makeCards(): Card[] {
    const pairs: Card[] = [];
    peoplePairs.forEach((p, i) => {
        const initials = p.name.split(' ').map((w) => w[0]).join('').slice(0, 2);
        const base = { id: p.id, name: p.name, relation: p.relation, initials, color: COLORS[i], isFlipped: false, isMatched: false };
        pairs.push({ ...base, uid: `${p.id}-a` });
        pairs.push({ ...base, uid: `${p.id}-b` });
    });
    // Shuffle
    return pairs.sort(() => Math.random() - 0.5);
}

function calcStars(flips: number, time: number): number {
    if (flips <= 6 && time <= 30) return 3;
    if (flips <= 10 && time <= 60) return 2;
    return 1;
}

export default function CardMatchGame() {
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
                // No match — flip back
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
                <h1 className={styles.gameTitle}>Card Match</h1>
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
                <p className={styles.hint}>Find the matching pairs of your family, Ravi.</p>

                {/* Card grid */}
                <div className={styles.cardGrid} aria-label="Card matching game grid" role="grid">
                    {cards.map((card) => (
                        <button
                            key={card.uid}
                            className={`${styles.card} ${card.isFlipped || card.isMatched ? styles.cardFlipped : ''} ${card.isMatched ? styles.cardMatched : ''}`}
                            onClick={() => handleFlip(card.uid)}
                            aria-label={card.isFlipped || card.isMatched ? `${card.name}, ${card.relation}` : 'Face-down card'}
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
                                    <div className={styles.cardAvatar} style={{ background: card.color }}>
                                        {card.initials}
                                    </div>
                                    <p className={styles.cardName}>{card.name}</p>
                                    <p className={styles.cardRelation}>{card.relation}</p>
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
                        <h2 className={styles.winTitle}>Excellent, Ravi! 🎉</h2>
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
