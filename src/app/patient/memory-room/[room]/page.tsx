'use client';

import { useState, useEffect, useCallback } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, CheckCircle, Plus, AlertTriangle, X, Trophy, Star, Clock, Lightbulb, Sparkles, RotateCcw } from 'lucide-react';
import { KitchenRoomSVG, BedroomRoomSVG, LivingRoomSVG, GardenRoomSVG, PrayerRoomSVG } from '@/components/rooms';
import styles from './room.module.css';

interface HotspotData {
    id: string;
    label: string;
    x: number;
    y: number;
    flashcard: {
        title: string;
        subtitle: string;
        detail: string;
        tip: string;
        isSafety?: boolean;
        safetyNote?: string;
    };
}

interface RoomDefinition {
    name: string;
    description: string;
    bgClass: string;
    hotspots: HotspotData[];
    SvgComponent: React.ComponentType<{ className?: string }>;
}

const ROOMS: Record<string, RoomDefinition> = {
    kitchen: {
        name: 'Kitchen',
        description: 'Your favourite chai starts here',
        bgClass: 'kitchen',
        SvgComponent: KitchenRoomSVG,
        hotspots: [
            {
                id: 'tea-cup',
                label: 'Tea Cup',
                x: 38, y: 46,
                flashcard: {
                    title: 'Your Chai Cup',
                    subtitle: 'The brown ceramic mug from Priya',
                    detail: 'Your favourite cup — the wide brown ceramic one Priya brought from Haridwar. You always hold it with both hands in the morning. Sunita makes your chai at 7:30 AM sharp: two spoons of sugar, cardamom, and a little ginger.',
                    tip: 'Try to remember: what does your chai smell like in the morning?',
                }
            },
            {
                id: 'spice-box',
                label: 'Spice Box',
                x: 62, y: 48,
                flashcard: {
                    title: 'Masala Dabba',
                    subtitle: 'Silver box with 7 compartments',
                    detail: 'The round dabba with the silver lid — Sunita\'s masala dabba. It has 7 small compartments: jeera, haldi, dhaniya, mirchi, hing, ajwain, and garam masala in the center. It lives on the counter left of the stove.',
                    tip: 'Touch the lid carefully. Do you recognise the smell from inside?',
                }
            },
            {
                id: 'stove',
                label: 'Gas Stove',
                x: 58, y: 46,
                flashcard: {
                    title: 'Gas Stove — Safety',
                    subtitle: 'Always ask Sunita or Nurse Anita before using',
                    detail: 'This is the gas stove where chai and meals are cooked. For your safety, please do not use the stove alone. If you smell gas, leave the kitchen and call Sunita or Nurse Anita immediately.',
                    tip: 'Remember the rule: cooking is always with company.',
                    isSafety: true,
                    safetyNote: 'Do not use the stove without Sunita or Nurse Anita present.',
                }
            },
            {
                id: 'fridge',
                label: 'Refrigerator',
                x: 89, y: 42,
                flashcard: {
                    title: 'The LG Fridge',
                    subtitle: 'Medicines on top shelf — labelled by Priya',
                    detail: 'This is the LG fridge — 260 litres, bought in 2019 during Diwali. The top shelf holds your medications, all labelled clearly by Priya with the time and dose on sticky notes. Reach it carefully to avoid losing your balance.',
                    tip: 'Priya labelled everything in big blue letters so you can always find what you need.',
                }
            },
            {
                id: 'clock',
                label: 'Wall Clock',
                x: 46, y: 14,
                flashcard: {
                    title: 'Kitchen Clock',
                    subtitle: 'Round white clock above the window',
                    detail: 'The round white clock hung above the kitchen window. It was bought from Connaught Place in 2003 — you picked it during a Saturday market trip with Sunita. It runs on a single AA battery. It shows the right time.',
                    tip: 'Look at the clock now — can you tell what time it is?',
                }
            },
            {
                id: 'medicine-box',
                label: 'Medicine Box',
                x: 78, y: 22,
                flashcard: {
                    title: 'Medicine Box — Important',
                    subtitle: 'Only take medicine when Nurse Anita confirms',
                    detail: 'This white lockable cabinet sits above your bedside table and has all your medicines. Donepezil in the morning at 7 AM, Vitamin D on Sundays, Memantine at 7 PM. Always wait for Nurse Anita to confirm before taking any.',
                    tip: 'Never take extra medicine if you forget. Just tell Anita.',
                    isSafety: true,
                    safetyNote: 'Take medicines ONLY as confirmed by Nurse Anita. Never double-dose.',
                }
            },
        ],
    },
    bedroom: {
        name: 'Bedroom',
        description: 'Where each day begins and ends',
        bgClass: 'bedroom',
        SvgComponent: BedroomRoomSVG,
        hotspots: [
            {
                id: 'bed',
                label: 'Your Bed',
                x: 45, y: 58,
                flashcard: {
                    title: 'The Rosewood Bed',
                    subtitle: 'You sleep on the right side',
                    detail: 'Your bed — a solid rosewood double bed bought from a furniture shop in Sector 18, Gurugram, in 2004. You always sleep on the right side (when lying down). Sunita takes the left. The white cotton bedsheet is changed every Sunday.',
                    tip: 'If you wake up at night confused, stay calm — you are in your own bedroom at home.',
                }
            },
            {
                id: 'medicine-cabinet',
                label: 'Medicine Cabinet',
                x: 78, y: 30,
                flashcard: {
                    title: 'Medicine Cabinet — Safety',
                    subtitle: 'Everything labelled — only take as told',
                    detail: 'The white wall-mounted cabinet above your right bedside table. All medicines are inside, labelled with time and dose by Priya. Do not open and take medicines on your own. Nurse Anita handles all doses.',
                    tip: 'The cabinet door has a lock. Nurse Anita has the key.',
                    isSafety: true,
                    safetyNote: 'Medicines only with Nurse Anita. NEVER take extras.',
                }
            },
            {
                id: 'almirah',
                label: 'Almirah',
                x: 10, y: 46,
                flashcard: {
                    title: 'Steel Almirah',
                    subtitle: 'Clothes left door, documents right door',
                    detail: 'Your large Godrej steel almirah — three doors. Left side holds your kurtas, pyjamas, and Sunita\'s sarees. Middle holds folded bedsheets and towels. The right door has your important documents: Aadhaar, bank papers, land records.',
                    tip: 'Your blue and white kurta for pooja is in the second rack on the left.',
                }
            },
            {
                id: 'wall-clock',
                label: 'Ajanta Clock',
                x: 45, y: 14,
                flashcard: {
                    title: 'Ajanta Wall Clock',
                    subtitle: 'Gifted by Priya on your 65th birthday',
                    detail: 'This circular Ajanta clock was a birthday gift from Priya on your 65th birthday — 2018. It has a wooden frame and a quiet tick. It hangs above the bedroom door. The time shown is always correct — check it when you wake up.',
                    tip: 'Look at this clock first thing every morning to orient yourself.',
                }
            },
        ],
    },
    living: {
        name: 'Living Room',
        description: 'Family evenings on the recliner',
        bgClass: 'living',
        SvgComponent: LivingRoomSVG,
        hotspots: [
            {
                id: 'recliner',
                label: 'Recliner Chair',
                x: 14, y: 58,
                flashcard: {
                    title: 'Your Recliner',
                    subtitle: 'Brown leather — your favourite spot',
                    detail: 'The brown leather recliner chair near the east window — this is YOUR chair. You\'ve sat here for morning newspapers, afternoon naps, and evening chai for seven years. The footrest lever is on the right armrest.',
                    tip: 'This is the safest, most familiar seat in the house. Come here when you feel overwhelmed.',
                }
            },
            {
                id: 'tv',
                label: 'Television',
                x: 82, y: 42,
                flashcard: {
                    title: 'Samsung Television',
                    subtitle: '43 inch — Doordarshan News at 9 PM',
                    detail: 'Your Samsung 43-inch TV. The remote is always kept on the right armrest of the recliner. Press the red power button to turn on. Channel 101 is Doordarshan News for your 9 PM bulletin. Volume up/down on the right side of the remote.',
                    tip: 'If the TV shows a black screen, try pressing the red button on the remote twice.',
                }
            },
            {
                id: 'photos',
                label: 'Photo Wall',
                x: 50, y: 16,
                flashcard: {
                    title: 'Family Photo Wall',
                    subtitle: '12 framed photos from 1980 to 2019',
                    detail: 'Twelve framed photographs on the north wall — your family\'s story. Top row: your wedding (1980), Amit\'s birth (1985), Priya\'s birth (1987). Middle: family picnics, Shimla trip 2009, Amit\'s IIT result. Bottom: Priya\'s wedding (2012), Arjun\'s birth (2019).',
                    tip: 'Look at each photo and try to name the people. Can you name three?',
                }
            },
            {
                id: 'prayer-corner',
                label: 'Prayer Corner',
                x: 10, y: 26,
                flashcard: {
                    title: 'Prayer Corner',
                    subtitle: 'Ram, Ganesh, and Durga idols',
                    detail: 'Your small mandir in the northwest corner of the living room. Ram, Ganesh, and Durga idols on a marble shelf. The agarbatti holder is brass — you do pooja at 7:00 AM every morning. Sunita lights the diya at 6:50 AM.',
                    tip: 'The pooja routine helps your memory — try to say the Gayatri Mantra during pooja.',
                }
            },
        ],
    },
    garden: {
        name: 'Garden',
        description: 'Morning sunlight and marigolds',
        bgClass: 'garden',
        SvgComponent: GardenRoomSVG,
        hotspots: [
            {
                id: 'bench',
                label: 'Morning Bench',
                x: 33, y: 62,
                flashcard: {
                    title: 'Your Morning Bench',
                    subtitle: 'Sunlight, chai, and newspaper by 8 AM',
                    detail: 'The iron bench near the marigold patch — your morning spot. You sit here at 8 AM after breakfast, facing the sun. Vitamin D from morning light is part of your health routine. Nurse Anita sits nearby.',
                    tip: 'Spending 20 minutes in morning sun helps your brain and your mood.',
                }
            },
            {
                id: 'marigolds',
                label: 'Marigolds',
                x: 68, y: 62,
                flashcard: {
                    title: 'Marigold Patch',
                    subtitle: 'You planted these in October 2023',
                    detail: 'The bright orange and yellow marigolds in the left corner of the garden. You planted the seeds in October 2023 with Arjun. They bloom every winter. You water them with a red plastic can every Tuesday and Friday.',
                    tip: 'Arjun calls them "Nana\'s flowers". Can you smell them?',
                }
            },
        ],
    },
    prayer: {
        name: 'Prayer Room',
        description: 'Agarbatti and daily peace',
        bgClass: 'prayer',
        SvgComponent: PrayerRoomSVG,
        hotspots: [
            {
                id: 'mandir',
                label: 'Mandir',
                x: 50, y: 35,
                flashcard: {
                    title: 'Your Home Mandir',
                    subtitle: 'Ram, Ganesh, Durga — pooja at 7 AM',
                    detail: 'The teak wood mandir in the prayer room. Ram, Ganesh, and Durga idols on the upper shelf. The brass diya, agarbatti stand, and a small bell are always here. Pooja at 7:00 AM every day — Sunita prepares the flowers.',
                    tip: 'The Gayatri Mantra centres your mind. Try saying it slowly once.',
                }
            },
            {
                id: 'bhajan-book',
                label: 'Bhajan Book',
                x: 40, y: 78,
                flashcard: {
                    title: 'Bhajan Sangrah',
                    subtitle: 'Tulsidas Ramcharitmanas + personal notes',
                    detail: 'Your old bhajan book — a green-covered notebook combining Tulsidas verses and bhajans you\'ve written down since 1992. It has 86 pages. Some bhajans are in your handwriting in black ink. The book lives on the right shelf of the mandir.',
                    tip: 'Reading one bhajan aloud — even haltingly — brings mental calm.',
                }
            },
        ],
    },
};

/* ── Score helpers ── */
const POINTS_PER_OBJECT = 100;
const HINT_PENALTY = 30;
const TIME_BONUS_THRESHOLD = 120; // seconds — bonus if completed within this

function formatTimer(seconds: number): string {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m}:${s.toString().padStart(2, '0')}`;
}

export default function RoomScenePage() {
    const params = useParams();
    const router = useRouter();
    const roomSlug = params?.room as string ?? 'kitchen';
    const room = ROOMS[roomSlug] ?? ROOMS.kitchen;
    const RoomSVG = room.SvgComponent;

    const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);
    const [remembered, setRemembered] = useState<Set<string>>(new Set());
    const [score, setScore] = useState(0);
    const [hintsUsed, setHintsUsed] = useState(0);
    const [showHint, setShowHint] = useState(false);
    const [hintTarget, setHintTarget] = useState<HotspotData | null>(null);
    const [timer, setTimer] = useState(0);
    const [isComplete, setIsComplete] = useState(false);
    const [streak, setStreak] = useState(0);
    const [bestScore, setBestScore] = useState(0);

    // Load best score from localStorage
    useEffect(() => {
        try {
            const saved = localStorage.getItem(`saathi_room_best_${roomSlug}`);
            if (saved) setBestScore(parseInt(saved, 10));
        } catch { }
    }, [roomSlug]);

    // Timer
    useEffect(() => {
        if (isComplete) return;
        const interval = setInterval(() => setTimer((t) => t + 1), 1000);
        return () => clearInterval(interval);
    }, [isComplete]);

    // Check completion
    useEffect(() => {
        if (remembered.size === room.hotspots.length && room.hotspots.length > 0 && !isComplete) {
            const timeBonus = timer <= TIME_BONUS_THRESHOLD ? Math.max(0, (TIME_BONUS_THRESHOLD - timer) * 2) : 0;
            const finalScore = score + timeBonus;
            setScore(finalScore);
            setIsComplete(true);
            // Save best
            if (finalScore > bestScore) {
                setBestScore(finalScore);
                try {
                    localStorage.setItem(`saathi_room_best_${roomSlug}`, finalScore.toString());
                } catch { }
            }
        }
    }, [remembered, room.hotspots.length, isComplete, score, timer, bestScore, roomSlug]);

    const speak = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = 'en-IN';
            utt.rate = 0.82;
            window.speechSynthesis.speak(utt);
        }
    };

    const handleRemember = useCallback((hotspot: HotspotData) => {
        if (remembered.has(hotspot.id)) return;
        const newRemembered = new Set([...remembered, hotspot.id]);
        setRemembered(newRemembered);
        setStreak((s) => s + 1);
        setScore((prev) => prev + POINTS_PER_OBJECT + (streak >= 2 ? 25 : 0)); // streak bonus
        setActiveHotspot(null);
    }, [remembered, streak]);

    const handleHint = () => {
        const unrevealed = room.hotspots.filter((hs) => !remembered.has(hs.id));
        if (unrevealed.length === 0) return;
        const target = unrevealed[Math.floor(Math.random() * unrevealed.length)];
        setHintTarget(target);
        setShowHint(true);
        setHintsUsed((h) => h + 1);
        setScore((prev) => Math.max(0, prev - HINT_PENALTY));
        setTimeout(() => setShowHint(false), 3000);
    };

    const handleRestart = () => {
        setRemembered(new Set());
        setScore(0);
        setHintsUsed(0);
        setTimer(0);
        setStreak(0);
        setIsComplete(false);
        setActiveHotspot(null);
        setShowHint(false);
        setHintTarget(null);
    };

    // ESC to close
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveHotspot(null); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

    const remaining = room.hotspots.length - remembered.size;

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.header}>
                <button className={styles.backBtn} onClick={() => router.push('/patient/memory-room')} aria-label="Back to rooms">
                    <ArrowLeft size={20} />
                    <span>All Rooms</span>
                </button>
                <div className={styles.roomTitle}>
                    <h1>{room.name}</h1>
                    <p>{room.description}</p>
                </div>
                <div className={styles.hotspotHint}>
                    <span>{room.hotspots.length} objects to explore</span>
                </div>
            </div>

            {/* Game Stats Bar */}
            <div className={styles.gameBar}>
                <div className={styles.gameStat}>
                    <Star size={16} color="var(--color-warning)" />
                    <span className={styles.gameStatValue}>{score}</span>
                    <span className={styles.gameStatLabel}>Points</span>
                </div>
                <div className={styles.gameStat}>
                    <Clock size={16} color="var(--color-primary)" />
                    <span className={styles.gameStatValue}>{formatTimer(timer)}</span>
                    <span className={styles.gameStatLabel}>Time</span>
                </div>
                <div className={styles.gameStat}>
                    <Sparkles size={16} color="var(--color-success)" />
                    <span className={styles.gameStatValue}>{streak}x</span>
                    <span className={styles.gameStatLabel}>Streak</span>
                </div>
                <div className={styles.gameStat}>
                    <CheckCircle size={16} color="var(--color-success)" />
                    <span className={styles.gameStatValue}>{remembered.size}/{room.hotspots.length}</span>
                    <span className={styles.gameStatLabel}>Found</span>
                </div>
                {bestScore > 0 && (
                    <div className={styles.gameStat}>
                        <Trophy size={16} color="var(--color-warning)" />
                        <span className={styles.gameStatValue}>{bestScore}</span>
                        <span className={styles.gameStatLabel}>Best</span>
                    </div>
                )}
                <button
                    className={styles.hintBtn}
                    onClick={handleHint}
                    disabled={remaining === 0}
                    aria-label="Get a hint"
                >
                    <Lightbulb size={16} />
                    Hint {hintsUsed > 0 && <span>({hintsUsed})</span>}
                </button>
            </div>

            {/* Room scene */}
            <div className={styles.sceneWrap}>
                <div className={`${styles.scene} ${styles[room.bgClass]}`} aria-label={`${room.name} scene with interactive objects`}>
                    {/* SVG Room Illustration */}
                    <RoomSVG className={styles.roomSvg} />

                    {/* Hotspots */}
                    {room.hotspots.map((hs) => (
                        <button
                            key={hs.id}
                            className={`${styles.hotspot} ${remembered.has(hs.id) ? styles.hotspotRemembered : ''} ${hs.flashcard.isSafety ? styles.hotspotSafety : ''} ${showHint && hintTarget?.id === hs.id ? styles.hotspotHinted : ''}`}
                            style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                            onClick={() => setActiveHotspot(hs)}
                            aria-label={`Explore ${hs.label}`}
                        >
                            <span className={styles.hotspotRing} aria-hidden="true" />
                            <span className={styles.hotspotLabel}>{hs.label}</span>
                            {remembered.has(hs.id) && (
                                <CheckCircle size={20} color="white" style={{ position: 'absolute' }} />
                            )}
                        </button>
                    ))}
                </div>
            </div>

            {/* Progress */}
            <div className={styles.progressRow}>
                {room.hotspots.map((hs) => (
                    <div
                        key={hs.id}
                        className={`${styles.progressDot} ${remembered.has(hs.id) ? styles.progressDotDone : ''}`}
                        title={hs.label}
                    />
                ))}
                <span className={styles.progressText}>
                    {remembered.size} of {room.hotspots.length} remembered
                </span>
                <button
                    className={styles.restartBtn}
                    onClick={handleRestart}
                    aria-label="Restart room"
                    title="Restart room exploration"
                >
                    <RotateCcw size={16} />
                </button>
            </div>

            {/* Completion celebration */}
            {isComplete && (
                <div className={styles.overlay} onClick={() => setIsComplete(false)} role="dialog" aria-modal="true" aria-label="Room completed!">
                    <div className={styles.flashcard} onClick={(e) => e.stopPropagation()} style={{ textAlign: 'center' }}>
                        <button className={styles.closeBtn} onClick={() => setIsComplete(false)} aria-label="Close">
                            <X size={20} />
                        </button>
                        <div style={{ fontSize: 64, marginBottom: 8 }}>🎉</div>
                        <h2 className={styles.cardTitle} style={{ paddingRight: 0, textAlign: 'center' }}>
                            Room Complete!
                        </h2>
                        <p className={styles.cardSubtitle}>
                            You remembered all {room.hotspots.length} objects in {room.name}
                        </p>

                        <div style={{
                            display: 'grid',
                            gridTemplateColumns: 'repeat(3, 1fr)',
                            gap: '16px',
                            margin: '24px 0',
                            padding: '20px',
                            background: 'var(--bg-surface-soft)',
                            borderRadius: 'var(--radius-card-sm)',
                        }}>
                            <div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-warning)' }}>{score}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Total Score</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-primary)' }}>{formatTimer(timer)}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Time Taken</div>
                            </div>
                            <div>
                                <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--color-success)' }}>{hintsUsed}</div>
                                <div style={{ fontSize: 12, color: 'var(--text-muted)', fontWeight: 600 }}>Hints Used</div>
                            </div>
                        </div>

                        {timer <= TIME_BONUS_THRESHOLD && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                justifyContent: 'center',
                                color: 'var(--color-success)',
                                fontWeight: 600,
                                fontSize: 14,
                                marginBottom: 16,
                            }}>
                                <Sparkles size={16} />
                                Speed bonus earned! +{Math.max(0, (TIME_BONUS_THRESHOLD - timer) * 2)} points
                            </div>
                        )}

                        <div className={styles.cardActions} style={{ justifyContent: 'center' }}>
                            <button className={styles.rememberBtn} onClick={handleRestart}>
                                <RotateCcw size={18} />
                                Play Again
                            </button>
                            <button className={styles.moreBtn} onClick={() => router.push('/patient/memory-room')}>
                                <ArrowLeft size={18} />
                                Other Rooms
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Flashcard overlay */}
            {activeHotspot && !isComplete && (
                <div className={styles.overlay} onClick={() => setActiveHotspot(null)} role="dialog" aria-modal="true" aria-label={`Flashcard for ${activeHotspot.label}`}>
                    <div className={styles.flashcard} onClick={(e) => e.stopPropagation()}>
                        {/* Close */}
                        <button className={styles.closeBtn} onClick={() => setActiveHotspot(null)} aria-label="Close flashcard">
                            <X size={20} />
                        </button>

                        {activeHotspot.flashcard.isSafety && (
                            <div className={styles.safetyBanner} role="alert">
                                <AlertTriangle size={18} />
                                <span>{activeHotspot.flashcard.safetyNote}</span>
                            </div>
                        )}

                        <h2 className={styles.cardTitle}>{activeHotspot.flashcard.title}</h2>
                        <p className={styles.cardSubtitle}>{activeHotspot.flashcard.subtitle}</p>
                        <p className={styles.cardDetail}>{activeHotspot.flashcard.detail}</p>

                        <div className={styles.tipBox}>
                            <span className={styles.tipLabel}>Memory Tip</span>
                            <p className={styles.tipText}>{activeHotspot.flashcard.tip}</p>
                        </div>

                        {/* Points preview */}
                        {!remembered.has(activeHotspot.id) && (
                            <div style={{
                                display: 'flex',
                                alignItems: 'center',
                                gap: 8,
                                marginBottom: 16,
                                padding: '8px 12px',
                                background: 'var(--bg-surface-soft)',
                                borderRadius: 'var(--radius-button)',
                                fontSize: 13,
                                fontWeight: 600,
                                color: 'var(--text-muted)',
                            }}>
                                <Star size={14} color="var(--color-warning)" />
                                +{POINTS_PER_OBJECT + (streak >= 2 ? 25 : 0)} points
                                {streak >= 2 && (
                                    <span style={{ color: 'var(--color-success)', marginLeft: 4 }}>
                                        (includes {streak}x streak bonus!)
                                    </span>
                                )}
                            </div>
                        )}

                        <div className={styles.cardActions}>
                            <button
                                className={styles.readAloudBtn}
                                onClick={() => speak(`${activeHotspot.flashcard.title}. ${activeHotspot.flashcard.detail} ${activeHotspot.flashcard.tip}`)}
                                aria-label="Read aloud"
                            >
                                <Volume2 size={18} />
                                Read Aloud
                            </button>
                            {!remembered.has(activeHotspot.id) ? (
                                <button
                                    className={styles.rememberBtn}
                                    onClick={() => handleRemember(activeHotspot)}
                                    aria-label="I remember this"
                                >
                                    <CheckCircle size={18} />
                                    I Remember
                                </button>
                            ) : (
                                <div style={{
                                    display: 'flex',
                                    alignItems: 'center',
                                    gap: 8,
                                    padding: '12px 20px',
                                    color: 'var(--color-success)',
                                    fontWeight: 700,
                                    fontSize: 15,
                                }}>
                                    <CheckCircle size={18} />
                                    Already Remembered
                                </div>
                            )}
                            <button
                                className={styles.moreBtn}
                                onClick={() => speak(`Tell me more about: ${activeHotspot.flashcard.detail}`)}
                                aria-label="Tell me more"
                            >
                                <Plus size={18} />
                                Tell Me More
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
