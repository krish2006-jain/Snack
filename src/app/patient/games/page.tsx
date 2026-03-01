'use client';

import Link from 'next/link';
import { Layers, Type, Grid2x2, Star, Flame, Zap, Trophy } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './games.module.css';
import { mockAnalytics } from '@/lib/mock-data';

interface GameCard {
    id: string;
    slug: string;
    name: string;
    description: string;
    icon: React.ReactNode;
    difficulty: 'Easy' | 'Medium' | 'Moderate';
    stars: number;
    streak: number;
    featured: boolean;
    color: string;
}

const games: GameCard[] = [
    {
        id: 'card_match',
        slug: 'card_match',
        name: 'Card Match',
        description: 'Flip matching pairs of your family\'s photos. Keep Priya, Sunita, and Arjun in your heart.',
        icon: <Layers size={32} />,
        difficulty: 'Easy',
        stars: 3,
        streak: 9,
        featured: true,
        color: '#2D5A3D',
    },
    {
        id: 'word_recall',
        slug: 'word_recall',
        name: 'Word Recall',
        description: 'Remember words about your life - then see how many come back.',
        icon: <Type size={28} />,
        difficulty: 'Moderate',
        stars: 2,
        streak: 4,
        featured: false,
        color: '#3B82F6',
    },
    {
        id: 'pattern_tap',
        slug: 'pattern_tap',
        name: 'Pattern Tap',
        description: 'Watch the colour sequence light up, then repeat it. Your reflexes staying sharp.',
        icon: <Grid2x2 size={28} />,
        difficulty: 'Medium',
        stars: 2,
        streak: 5,
        featured: false,
        color: '#F59E0B',
    },
];

function CircularScore({ score }: { score: number }) {
    const r = 38;
    const circ = 2 * Math.PI * r;
    const filled = (score / 100) * circ;
    return (
        <svg width="96" height="96" viewBox="0 0 96 96" aria-label={`Brain score: ${score} out of 100`}>
            <circle cx="48" cy="48" r={r} fill="none" stroke="rgba(45,90,61,0.12)" strokeWidth="8" />
            <circle
                cx="48" cy="48" r={r}
                fill="none"
                stroke="#2D5A3D"
                strokeWidth="8"
                strokeDasharray={`${filled} ${circ - filled}`}
                strokeDashoffset={circ * 0.25}
                strokeLinecap="round"
                style={{ transition: 'stroke-dasharray 1s ease' }}
            />
            <text x="48" y="46" textAnchor="middle" dominantBaseline="middle" fontSize="18" fontWeight="800" fill="#1F1135">{score}</text>
            <text x="48" y="62" textAnchor="middle" dominantBaseline="middle" fontSize="11" fontWeight="500" fill="#8B7FA8">/100</text>
        </svg>
    );
}

export default function GamesPage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const brainScore = mockAnalytics.avgDailyGameScore;
    const streak = mockAnalytics.gameStreak;

    return (
        <div className={styles.page}>
            {/* Page header */}
            <div className={styles.pageHeader}>
                <div className={styles.headerText}>
                    <h1 className={styles.title}>Brain Games</h1>
                    <p className={styles.subtitle}>Keep your mind active, {userName}. A little practice each day.</p>
                </div>

                {/* Brain score card */}
                <div className={styles.scoreCard} data-tooltip="Your overall brain health score based on recent game performance">
                    <CircularScore score={brainScore} />
                    <div className={styles.scoreInfo}>
                        <p className={styles.scoreLabel}>Brain Score</p>
                        <div className={styles.streakRow} data-tooltip="Number of consecutive days you've played brain games">
                            <Flame size={16} color="var(--color-warning)" />
                            <span className={styles.streakText}>{streak} day streak</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats row */}
            <div className={styles.statsRow}>
                <div className={styles.statChip} data-tooltip="Your highest single game score this week">
                    <Trophy size={15} color="var(--color-warning)" />
                    <span>Best score this week: <strong>85</strong></span>
                </div>
                <div className={styles.statChip} data-tooltip="How many brain games you've completed today out of today's goal">
                    <Zap size={15} color="var(--color-success)" />
                    <span>Games today: <strong>2 / 3</strong></span>
                </div>
            </div>

            {/* Game cards */}
            <div className={styles.gameGrid}>
                {games.map((game) => (
                    <div
                        key={game.id}
                        className={`${styles.gameCard} ${game.featured ? styles.gameCardFeatured : ''}`}
                        style={{ '--game-color': game.color } as React.CSSProperties}
                    >
                        {game.featured && (
                            <span className={styles.featuredPill}>Most Popular</span>
                        )}
                        <div className={styles.cardTop}>
                            <div className={styles.gameIcon} style={{ color: game.color, background: `${game.color}16` }}>
                                {game.icon}
                            </div>
                            <div className={styles.gameStreak}>
                                <Flame size={14} color="var(--color-warning)" />
                                <span>{game.streak}d</span>
                            </div>
                        </div>

                        <div className={styles.cardMid}>
                            <h2 className={styles.gameName}>{game.name}</h2>
                            <p className={styles.gameDesc}>{game.description}</p>
                        </div>

                        <div className={styles.cardBottom}>
                            <div className={styles.starsRow}>
                                {[1, 2, 3].map((s) => (
                                    <Star
                                        key={s}
                                        size={16}
                                        fill={s <= game.stars ? '#F59E0B' : 'transparent'}
                                        color={s <= game.stars ? '#F59E0B' : '#D1C4E9'}
                                    />
                                ))}
                                <span className={styles.difficulty}>{game.difficulty}</span>
                            </div>
                            <Link
                                href={`/patient/games/${game.slug}`}
                                className={styles.playBtn}
                                style={{ background: game.color, boxShadow: `0 6px 20px ${game.color}44` }}
                                aria-label={`Play ${game.name}`}
                                data-tooltip={`Start playing ${game.name}`}
                            >
                                Play
                            </Link>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    );
}
