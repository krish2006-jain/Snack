'use client';

import { useState, useEffect, useRef } from 'react';
import { useRouter } from 'next/navigation';
import { ArrowLeft, Eye, EyeOff, Star } from 'lucide-react';
import styles from './word-recall.module.css';

// Personal fact words drawn from Ravi's life
const WORD_SETS = [
    ['Priya', 'Gurugram', 'Donepezil', 'Arjun'],
    ['Sunita', 'AIIMS', 'Diwali', 'Shimla'],
    ['Memantine', 'Anita', 'Punjab', 'Recliner'],
    ['Doordarshan', 'Amit', 'Marigold', 'Bhairavi'],
];

type Phase = 'memorise' | 'recall' | 'result';

function calcStars(correct: number, total: number): number {
    const ratio = correct / total;
    if (ratio === 1) return 3;
    if (ratio >= 0.66) return 2;
    if (ratio >= 0.33) return 1;
    return 0;
}

export default function WordRecallGame() {
    const router = useRouter();
    const [round, setRound] = useState(0);
    const words = WORD_SETS[round % WORD_SETS.length];

    const [phase, setPhase] = useState<Phase>('memorise');
    const [timeLeft, setTimeLeft] = useState(10);
    const [selected, setSelected] = useState<string[]>([]);
    const [inputVal, setInputVal] = useState('');
    const [results, setResults] = useState<{ word: string; correct: boolean }[]>([]);
    const [stars, setStars] = useState(0);
    const timerRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // Distractors (words NOT in the set)
    const distractors = ['Delhi', 'Mango', 'Monday', 'Clock', 'Bengaluru', 'Laptop'];
    const allChips = [...words, ...distractors.slice(0, 4)].sort(() => Math.random() - 0.5);

    useEffect(() => {
        if (phase === 'memorise') {
            setTimeLeft(10);
            timerRef.current = setInterval(() => {
                setTimeLeft((t) => {
                    if (t <= 1) {
                        clearInterval(timerRef.current!);
                        setPhase('recall');
                        return 0;
                    }
                    return t - 1;
                });
            }, 1000);
        }
        return () => { if (timerRef.current) clearInterval(timerRef.current); };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [phase, round]);

    const toggleChip = (word: string) => {
        setSelected((prev) => prev.includes(word) ? prev.filter((w) => w !== word) : [...prev, word]);
    };

    const handleSubmit = () => {
        const res = words.map((w) => ({ word: w, correct: selected.includes(w) }));
        const s = calcStars(res.filter((r) => r.correct).length, words.length);
        setResults(res);
        setStars(s);
        setPhase('result');
    };

    const restart = () => {
        setRound((r) => (r + 1) % WORD_SETS.length);
        setPhase('memorise');
        setSelected([]);
        setResults([]);
        setStars(0);
    };

    return (
        <div className={styles.page}>
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/patient/games')} aria-label="Back to games">
                    <ArrowLeft size={20} />
                    <span>Games</span>
                </button>
                <h1 className={styles.gameTitle}>Word Recall</h1>
                <div className={styles.phaseIndicator}>
                    {phase === 'memorise' ? (
                        <span className={styles.phaseMemo}><Eye size={15} /> Memorise</span>
                    ) : phase === 'recall' ? (
                        <span className={styles.phaseRecall}><EyeOff size={15} /> Recall</span>
                    ) : (
                        <span className={styles.phaseResult}>Results</span>
                    )}
                </div>
            </div>

            <div className={styles.content}>
                {/* MEMORISE PHASE */}
                {phase === 'memorise' && (
                    <div className={styles.memoriseView}>
                        <div className={styles.timerRing} role="timer" aria-label={`${timeLeft} seconds to memorise`}>
                            <svg viewBox="0 0 80 80" className={styles.timerSvg}>
                                <circle cx="40" cy="40" r="34" fill="none" stroke="rgba(45,90,61,0.12)" strokeWidth="6" />
                                <circle
                                    cx="40" cy="40" r="34"
                                    fill="none"
                                    stroke="#2D5A3D"
                                    strokeWidth="6"
                                    strokeDasharray={`${(timeLeft / 10) * 213} 213`}
                                    strokeDashoffset="53"
                                    strokeLinecap="round"
                                    style={{ transition: 'stroke-dasharray 1s linear' }}
                                />
                                <text x="40" y="44" textAnchor="middle" dominantBaseline="middle" fontSize="22" fontWeight="800" fill="#1F1135">{timeLeft}</text>
                            </svg>
                        </div>
                        <p className={styles.memoriseInstruction}>Memorise these words from your life</p>
                        <div className={styles.wordList}>
                            {words.map((word, i) => (
                                <div
                                    key={word}
                                    className={styles.wordItem}
                                    style={{ animationDelay: `${i * 120}ms` }}
                                >
                                    {word}
                                </div>
                            ))}
                        </div>
                    </div>
                )}

                {/* RECALL PHASE */}
                {phase === 'recall' && (
                    <div className={styles.recallView}>
                        <p className={styles.recallInstruction}>Which words did you see? Tap all that you remember.</p>

                        <div className={styles.chipGrid}>
                            {allChips.map((word) => (
                                <button
                                    key={word}
                                    className={`${styles.chip} ${selected.includes(word) ? styles.chipSelected : ''}`}
                                    onClick={() => toggleChip(word)}
                                    aria-pressed={selected.includes(word)}
                                >
                                    {word}
                                </button>
                            ))}
                        </div>

                        <p className={styles.selectedCount}>{selected.length} word{selected.length !== 1 ? 's' : ''} selected</p>

                        <button
                            className={styles.submitBtn}
                            onClick={handleSubmit}
                            disabled={selected.length === 0}
                        >
                            Check Answers
                        </button>
                    </div>
                )}

                {/* RESULT PHASE */}
                {phase === 'result' && (
                    <div className={styles.resultView}>
                        <div className={styles.starsRow}>
                            {[1, 2, 3].map((s) => (
                                <Star key={s} size={44} fill={s <= stars ? '#F59E0B' : 'transparent'} color={s <= stars ? '#F59E0B' : '#D1C4E9'} />
                            ))}
                        </div>
                        <h2 className={styles.resultTitle}>
                            {stars === 3 ? 'Perfect, Ravi! 🎉' : stars >= 2 ? 'Well done! 👏' : 'Good try, Ravi 💙'}
                        </h2>
                        <p className={styles.resultSub}>
                            You remembered {results.filter((r) => r.correct).length} of {words.length} words.
                        </p>

                        <div className={styles.wordResults}>
                            {results.map((r) => (
                                <div key={r.word} className={`${styles.resultWord} ${r.correct ? styles.resultWordCorrect : styles.resultWordMiss}`}>
                                    <span>{r.correct ? '✓' : '○'}</span>
                                    <span>{r.word}</span>
                                    <span className={styles.resultWordTag}>{r.correct ? 'Remembered' : 'Missed'}</span>
                                </div>
                            ))}
                        </div>

                        <div className={styles.resultActions}>
                            <button className={styles.playAgainBtn} onClick={restart}>Next Round</button>
                            <button className={styles.backBtn2} onClick={() => router.push('/patient/games')}>Back to Games</button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}
