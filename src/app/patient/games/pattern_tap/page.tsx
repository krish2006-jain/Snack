'use client';

import { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Star } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './pattern-tap.module.css';

const COLORS = [
    { id: 0, name: 'Dark Green', bg: '#2D5A3D', glow: 'rgba(45,90,61,0.6)' },
    { id: 1, name: 'Amber', bg: '#F59E0B', glow: 'rgba(245,158,11,0.6)' },
    { id: 2, name: 'Red', bg: '#C0392B', glow: 'rgba(192,57,43,0.6)' },
    { id: 3, name: 'Blue', bg: '#3B82F6', glow: 'rgba(59,130,246,0.6)' },
];

type GameState = 'idle' | 'showing' | 'input' | 'correct' | 'wrong' | 'won';

function calcStars(level: number): number {
    if (level >= 6) return 3;
    if (level >= 4) return 2;
    if (level >= 2) return 1;
    return 0;
}

export default function PatternTapGame() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const router = useRouter();
    const [sequence, setSequence] = useState<number[]>([]);
    const [playerSeq, setPlayerSeq] = useState<number[]>([]);
    const [active, setActive] = useState<number | null>(null);
    const [state, setState] = useState<GameState>('idle');
    const [wrongIdx, setWrongIdx] = useState<number | null>(null);
    const [level, setLevel] = useState(0);
    const [stars, setStars] = useState(0);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    const clearTO = () => { if (timeoutRef.current) clearTimeout(timeoutRef.current); };

    const showSequence = useCallback((seq: number[]) => {
        setState('showing');
        let i = 0;
        const step = () => {
            if (i >= seq.length) {
                timeoutRef.current = setTimeout(() => setState('input'), 600);
                return;
            }
            const idx = seq[i];
            setActive(idx);
            timeoutRef.current = setTimeout(() => {
                setActive(null);
                i++;
                timeoutRef.current = setTimeout(step, 250);
            }, 550);
        };
        timeoutRef.current = setTimeout(step, 500);
    }, []);

    const startGame = useCallback(() => {
        const first = Math.floor(Math.random() * 4);
        const newSeq = [first];
        setSequence(newSeq);
        setPlayerSeq([]);
        setLevel(1);
        setState('idle');
        clearTO();
        timeoutRef.current = setTimeout(() => showSequence(newSeq), 400);
    }, [showSequence]);

    useEffect(() => { return () => clearTO(); }, []);

    const handleTap = (id: number) => {
        if (state !== 'input') return;
        const newPlayer = [...playerSeq, id];
        const expected = sequence[newPlayer.length - 1];

        if (id !== expected) {
            // Wrong
            setWrongIdx(id);
            setState('wrong');
            clearTO();
            timeoutRef.current = setTimeout(() => {
                setWrongIdx(null);
                const finalStars = calcStars(level);
                setStars(finalStars);
                setState('won');
                fetch('/api/games', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ gameType: 'pattern_tap', score: Math.min(level * 15, 100), stars: finalStars, durationSeconds: 0 }),
                }).catch(() => { });
            }, 1200);
            return;
        }

        setActive(id);
        timeoutRef.current = setTimeout(() => setActive(null), 300);

        if (newPlayer.length === sequence.length) {
            // Level complete
            setState('correct');
            const nextSeq = [...sequence, Math.floor(Math.random() * 4)];
            setSequence(nextSeq);
            setLevel((l) => l + 1);
            setPlayerSeq([]);
            clearTO();
            timeoutRef.current = setTimeout(() => showSequence(nextSeq), 900);
        } else {
            setPlayerSeq(newPlayer);
        }
    };

    const s = calcStars(level);

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/patient/games')} aria-label="Back to games">
                    <ArrowLeft size={20} />
                    <span>Games</span>
                </button>
                <h1 className={styles.gameTitle}>Pattern Tap</h1>
                <div className={styles.levelBadge} aria-label={`Level ${level}`}>
                    Level {level}
                </div>
            </div>

            <div className={styles.content}>
                {state === 'idle' && level === 0 && (
                    <div className={styles.startArea}>
                        <p className={styles.instruction}>Watch the colours light up, then tap the same pattern.</p>
                        <button className={styles.startBtn} onClick={startGame}>Start Game</button>
                    </div>
                )}

                {(state !== 'idle' || level > 0) && state !== 'won' && (
                    <div className={styles.statusBar}>
                        {state === 'showing' && <span className={styles.statusShowing}>👀 Watch the pattern…</span>}
                        {state === 'input' && <span className={styles.statusInput}>👆 Your turn — tap the pattern</span>}
                        {state === 'correct' && <span className={styles.statusCorrect}>✓ Correct! Next level…</span>}
                        {state === 'wrong' && <span className={styles.statusWrong}>Not quite — good effort!</span>}
                    </div>
                )}

                {/* Grid */}
                {state !== 'idle' && state !== 'won' && (
                    <div className={styles.grid} role="group" aria-label="Pattern tap buttons">
                        {COLORS.map((col) => (
                            <button
                                key={col.id}
                                className={`${styles.pad} ${active === col.id ? styles.padActive : ''} ${wrongIdx === col.id ? styles.padWrong : ''}`}
                                style={{
                                    '--pad-bg': col.bg,
                                    '--pad-glow': col.glow,
                                } as React.CSSProperties}
                                onClick={() => handleTap(col.id)}
                                disabled={state !== 'input'}
                                aria-label={`${col.name} button`}
                            >
                                <span className={styles.padLabel}>{col.name}</span>
                            </button>
                        ))}
                    </div>
                )}

                {/* Start — compact */}
                {state === 'idle' && level === 0 && (
                    <div className={styles.grid} style={{ opacity: 0.4, pointerEvents: 'none' }} aria-hidden="true">
                        {COLORS.map((col) => (
                            <div key={col.id} className={styles.pad} style={{ '--pad-bg': col.bg, '--pad-glow': col.glow } as React.CSSProperties} />
                        ))}
                    </div>
                )}

                {/* WON */}
                {state === 'won' && (
                    <div className={styles.wonView}>
                        <div className={styles.starsRow}>
                            {[1, 2, 3].map((n) => (
                                <Star key={n} size={44} fill={n <= s ? '#F59E0B' : 'transparent'} color={n <= s ? '#F59E0B' : '#D1C4E9'} />
                            ))}
                        </div>
                        <h2 className={styles.wonTitle}>{level > 4 ? `Outstanding, ${userName}! 🎉` : `Well done, ${userName}! 👏`}</h2>
                        <p className={styles.wonSub}>You reached level {level} — sequence of {sequence.length} colours.</p>
                        <div className={styles.wonActions}>
                            <button className={styles.playAgainBtn} onClick={startGame}>Play Again</button>
                            <button className={styles.backBtn2} onClick={() => router.push('/patient/games')}>Back to Games</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
