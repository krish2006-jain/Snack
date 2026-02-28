'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, Volume2, CheckCircle, Plus, AlertTriangle, X } from 'lucide-react';
import styles from './room.module.css';

interface HotspotData {
    id: string;
    label: string;
    x: number; // % position
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
}

const ROOMS: Record<string, RoomDefinition> = {
    kitchen: {
        name: 'Kitchen',
        description: 'Your favourite chai starts here',
        bgClass: 'kitchen',
        hotspots: [
            {
                id: 'tea-cup',
                label: 'Tea Cup',
                x: 28, y: 58,
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
                x: 58, y: 62,
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
                x: 48, y: 52,
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
                x: 78, y: 50,
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
                x: 18, y: 28,
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
                x: 88, y: 35,
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
        hotspots: [
            {
                id: 'bed',
                label: 'Your Bed',
                x: 48, y: 60,
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
                x: 72, y: 45,
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
                x: 18, y: 48,
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
                x: 50, y: 18,
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
        hotspots: [
            {
                id: 'recliner',
                label: 'Recliner Chair',
                x: 22, y: 62,
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
                x: 68, y: 42,
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
                x: 48, y: 26,
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
                x: 16, y: 36,
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
        hotspots: [
            {
                id: 'bench',
                label: 'Morning Bench',
                x: 30, y: 65,
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
                x: 62, y: 72,
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
        hotspots: [
            {
                id: 'mandir',
                label: 'Mandir',
                x: 50, y: 40,
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
                x: 28, y: 65,
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

export default function RoomScenePage() {
    const params = useParams();
    const router = useRouter();
    const roomSlug = params?.room as string ?? 'kitchen';
    const room = ROOMS[roomSlug] ?? ROOMS.kitchen;

    const [activeHotspot, setActiveHotspot] = useState<HotspotData | null>(null);
    const [remembered, setRemembered] = useState<Set<string>>(new Set());

    const speak = (text: string) => {
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            window.speechSynthesis.cancel();
            const utt = new SpeechSynthesisUtterance(text);
            utt.lang = 'en-IN';
            utt.rate = 0.82;
            window.speechSynthesis.speak(utt);
        }
    };

    // Close on ESC
    useEffect(() => {
        const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') setActiveHotspot(null); };
        window.addEventListener('keydown', handler);
        return () => window.removeEventListener('keydown', handler);
    }, []);

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

            {/* Room scene */}
            <div className={`${styles.sceneWrap}`}>
                <div className={`${styles.scene} ${styles[room.bgClass]}`} aria-label={`${room.name} scene with interactive objects`}>
                    {/* Ambient orbs for depth */}
                    <div className={styles.orbA} aria-hidden="true" />
                    <div className={styles.orbB} aria-hidden="true" />

                    {/* CSS-drawn room surfaces */}
                    <div className={styles.floor} aria-hidden="true" />
                    <div className={styles.wall} aria-hidden="true" />
                    <div className={styles.wallPanel} aria-hidden="true" />

                    {/* Room-specific furniture silhouettes */}
                    {room.bgClass === 'kitchen' && <KitchenFurniture />}
                    {room.bgClass === 'bedroom' && <BedroomFurniture />}
                    {room.bgClass === 'living' && <LivingFurniture />}
                    {room.bgClass === 'garden' && <GardenFurniture />}
                    {room.bgClass === 'prayer' && <PrayerFurniture />}

                    {/* Hotspots */}
                    {room.hotspots.map((hs) => (
                        <button
                            key={hs.id}
                            className={`${styles.hotspot} ${remembered.has(hs.id) ? styles.hotspotRemembered : ''} ${hs.flashcard.isSafety ? styles.hotspotSafety : ''}`}
                            style={{ left: `${hs.x}%`, top: `${hs.y}%` }}
                            onClick={() => setActiveHotspot(hs)}
                            aria-label={`Explore ${hs.label}`}
                        >
                            <span className={styles.hotspotRing} aria-hidden="true" />
                            <span className={styles.hotspotLabel}>{hs.label}</span>
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
            </div>

            {/* Flashcard overlay */}
            {activeHotspot && (
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

                        <div className={styles.cardActions}>
                            <button
                                className={styles.readAloudBtn}
                                onClick={() => speak(`${activeHotspot.flashcard.title}. ${activeHotspot.flashcard.detail} ${activeHotspot.flashcard.tip}`)}
                                aria-label="Read aloud"
                            >
                                <Volume2 size={18} />
                                Read Aloud
                            </button>
                            <button
                                className={styles.rememberBtn}
                                onClick={() => {
                                    setRemembered((prev) => new Set([...prev, activeHotspot.id]));
                                    setActiveHotspot(null);
                                }}
                                aria-label="I remember this"
                            >
                                <CheckCircle size={18} />
                                I Remember
                            </button>
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

/* ── CSS-drawn furniture for each room ── */

function KitchenFurniture() {
    return (
        <>
            {/* Counter */}
            <div style={{ position: 'absolute', bottom: '22%', left: '10%', width: '80%', height: '8%', background: 'linear-gradient(180deg,#E8D5B7,#D4B896)', borderRadius: '8px 8px 0 0', boxShadow: '0 4px 12px rgba(0,0,0,0.15)' }} />
            {/* Stove top */}
            <div style={{ position: 'absolute', bottom: '30%', left: '38%', width: '20%', height: '6%', background: '#8B7355', borderRadius: '6px', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', padding: '4px' }}>
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #666', background: '#555' }} />
                <div style={{ width: '24px', height: '24px', borderRadius: '50%', border: '3px solid #666', background: '#555' }} />
            </div>
            {/* Fridge */}
            <div style={{ position: 'absolute', bottom: '22%', right: '12%', width: '12%', height: '38%', background: 'linear-gradient(180deg,#F0F0F0,#E0E0E0)', borderRadius: '8px', boxShadow: '2px 0 8px rgba(0,0,0,0.1)', border: '1px solid #d0d0d0' }} />
            {/* Window */}
            <div style={{ position: 'absolute', top: '12%', left: '12%', width: '18%', height: '22%', background: 'linear-gradient(135deg,rgba(135,206,235,0.5),rgba(200,230,255,0.4))', border: '3px solid #C9B48E', borderRadius: '4px' }}>
                <div style={{ position: 'absolute', top: '50%', left: 0, right: 0, height: '2px', background: '#C9B48E' }} />
                <div style={{ position: 'absolute', left: '50%', top: 0, bottom: 0, width: '2px', background: '#C9B48E' }} />
            </div>
        </>
    );
}

function BedroomFurniture() {
    return (
        <>
            {/* Bed base */}
            <div style={{ position: 'absolute', bottom: '18%', left: '20%', width: '55%', height: '32%', background: 'linear-gradient(180deg,#8B4513,#6B3310)', borderRadius: '12px 12px 0 0', boxShadow: '0 6px 20px rgba(0,0,0,0.2)' }} />
            {/* Mattress */}
            <div style={{ position: 'absolute', bottom: '30%', left: '21%', width: '53%', height: '20%', background: 'linear-gradient(180deg,#F5F5F5,#E8E8E8)', borderRadius: '8px', border: '1px solid #ddd' }} />
            {/* Pillows */}
            <div style={{ position: 'absolute', bottom: '42%', left: '24%', width: '18%', height: '10%', background: 'white', borderRadius: '8px', border: '1px solid #E8E8E8', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
            <div style={{ position: 'absolute', bottom: '42%', left: '46%', width: '18%', height: '10%', background: 'white', borderRadius: '8px', border: '1px solid #E8E8E8', boxShadow: '0 2px 6px rgba(0,0,0,0.1)' }} />
            {/* Bedside table */}
            <div style={{ position: 'absolute', bottom: '18%', right: '11%', width: '8%', height: '20%', background: 'linear-gradient(180deg,#8B7355,#6B5335)', borderRadius: '4px' }} />
            {/* Almirah */}
            <div style={{ position: 'absolute', bottom: '18%', left: '5%', width: '11%', height: '52%', background: 'linear-gradient(180deg,#C0C0C0,#A8A8A8)', borderRadius: '4px', border: '1px solid #999', display: 'flex', flexDirection: 'column', padding: '4px', gap: '2px' }}>
                <div style={{ flex: 1, background: '#B0B0B0', borderRadius: '2px' }} />
                <div style={{ flex: 1, background: '#B0B0B0', borderRadius: '2px' }} />
                <div style={{ flex: 1, background: '#B0B0B0', borderRadius: '2px' }} />
            </div>
        </>
    );
}

function LivingFurniture() {
    return (
        <>
            {/* Sofa */}
            <div style={{ position: 'absolute', bottom: '20%', left: '28%', width: '42%', height: '22%', background: 'linear-gradient(180deg,#8B7355,#6B5335)', borderRadius: '12px 12px 0 0', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }} />
            <div style={{ position: 'absolute', bottom: '32%', left: '29%', width: '40%', height: '12%', background: 'linear-gradient(180deg,#A0896A,#8B7355)', borderRadius: '8px', border: '1px solid rgba(0,0,0,0.1)' }} />
            {/* Recliner */}
            <div style={{ position: 'absolute', bottom: '20%', left: '6%', width: '18%', height: '32%', background: 'linear-gradient(180deg,#7B5E3A,#5C4225)', borderRadius: '12px 12px 0 0', boxShadow: '0 6px 16px rgba(0,0,0,0.2)' }} />
            {/* TV stand */}
            <div style={{ position: 'absolute', bottom: '22%', right: '8%', width: '22%', height: '6%', background: '#3A3A3A', borderRadius: '4px' }} />
            {/* TV screen */}
            <div style={{ position: 'absolute', bottom: '28%', right: '9%', width: '20%', height: '22%', background: 'linear-gradient(135deg,#1a1a2e,#16213e)', borderRadius: '6px', border: '3px solid #222', boxShadow: '0 4px 12px rgba(0,0,0,0.3)' }} />
            {/* Photo wall patches */}
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{ position: 'absolute', top: `${14 + Math.floor(i / 3) * 14}%`, left: `${30 + (i % 3) * 12}%`, width: '9%', height: '10%', background: `hsl(${280 + i * 20},30%,88%)`, borderRadius: '3px', border: '2px solid #C9B48E', boxShadow: '0 2px 6px rgba(0,0,0,0.15)' }} />
            ))}
        </>
    );
}

function GardenFurniture() {
    return (
        <>
            {/* Ground */}
            <div style={{ position: 'absolute', bottom: '20%', left: 0, right: 0, height: '12%', background: 'linear-gradient(180deg,#90C080,#6A9955)', borderRadius: '0' }} />
            {/* Bench */}
            <div style={{ position: 'absolute', bottom: '32%', left: '18%', width: '28%', height: '8%', background: 'linear-gradient(180deg,#8B7355,#6B5335)', borderRadius: '6px', boxShadow: '0 4px 10px rgba(0,0,0,0.2)' }} />
            {/* Bench legs */}
            <div style={{ position: 'absolute', bottom: '20%', left: '20%', width: '3%', height: '12%', background: '#6B5335', borderRadius: '3px' }} />
            <div style={{ position: 'absolute', bottom: '20%', left: '43%', width: '3%', height: '12%', background: '#6B5335', borderRadius: '3px' }} />
            {/* Marigolds */}
            {[...Array(6)].map((_, i) => (
                <div key={i} style={{ position: 'absolute', bottom: '28%', left: `${55 + i * 5}%`, display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '2px' }}>
                    <div style={{ width: '20px', height: '20px', borderRadius: '50%', background: i % 2 === 0 ? '#F59E0B' : '#EF4444', boxShadow: `0 0 10px ${i % 2 === 0 ? '#F59E0B' : '#EF4444'}44` }} />
                    <div style={{ width: '3px', height: '24px', background: '#4A7C4A', borderRadius: '2px' }} />
                </div>
            ))}
            {/* Tree */}
            <div style={{ position: 'absolute', bottom: '55%', left: '8%', width: '0', height: '0', borderLeft: '30px solid transparent', borderRight: '30px solid transparent', borderBottom: '60px solid #2D6A2D' }} />
            <div style={{ position: 'absolute', bottom: '32%', left: '14%', width: '8%', height: '24%', background: '#5C3A1E', borderRadius: '4px' }} />
        </>
    );
}

function PrayerFurniture() {
    return (
        <>
            {/* Mandir structure */}
            <div style={{ position: 'absolute', bottom: '22%', left: '30%', width: '40%', height: '50%', background: 'linear-gradient(180deg,#D4A855,#B8902A)', borderRadius: '16px 16px 4px 4px', boxShadow: '0 8px 24px rgba(0,0,0,0.2)' }} />
            {/* Arch */}
            <div style={{ position: 'absolute', bottom: '44%', left: '36%', width: '28%', height: '24%', background: 'linear-gradient(180deg,#F5E6C0,#E8D49C)', borderRadius: '50% 50% 0 0', border: '3px solid #C9A840' }} />
            {/* Idols area (simplified) */}
            <div style={{ position: 'absolute', bottom: '46%', left: '44%', width: '12%', height: '16%', background: '#FFD700', borderRadius: '50% 50% 0 0', opacity: 0.7 }} />
            {/* Diya flame */}
            <div style={{ position: 'absolute', bottom: '40%', left: '47%', width: '6%', height: '8%', background: '#F59E0B', borderRadius: '50% 50% 30% 30%', boxShadow: '0 0 15px #F59E0B88, 0 0 30px #F59E0B44', animation: 'flickerFlame 2s ease infinite' }} />
            {/* Mat */}
            <div style={{ position: 'absolute', bottom: '18%', left: '28%', width: '44%', height: '6%', background: 'linear-gradient(90deg,#DC2626,#B91C1C)', borderRadius: '6px', border: '2px solid #991B1B' }} />
        </>
    );
}
