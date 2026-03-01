'use client';

import { useState, useEffect } from 'react';
import Link from 'next/link';
import { UtensilsCrossed, BedDouble, Sofa, Flower2, FlameKindling, Home } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './memory-room.module.css';

interface RoomCard {
    id: string;
    slug: string;
    name: string;
    subtitle: string;
    memoryCount: number;
    recallAvg: number;
    icon: React.ReactNode;
    featured: boolean;
    hue: string; // subtle bg tint
}

const rooms: RoomCard[] = [
    {
        id: 'kitchen',
        slug: 'kitchen',
        name: 'Kitchen',
        subtitle: 'Your favourite chai starts here',
        memoryCount: 6,
        recallAvg: 78,
        icon: <UtensilsCrossed size={36} />,
        featured: true,
        hue: 'hsl(270,80%,97%)',
    },
    {
        id: 'bedroom',
        slug: 'bedroom',
        name: 'Bedroom',
        subtitle: 'Where each day begins and ends',
        memoryCount: 4,
        recallAvg: 76,
        icon: <BedDouble size={28} />,
        featured: false,
        hue: 'hsl(250,60%,97%)',
    },
    {
        id: 'living',
        slug: 'living',
        name: 'Living Room',
        subtitle: 'Family evenings on the recliner',
        memoryCount: 5,
        recallAvg: 82,
        icon: <Sofa size={28} />,
        featured: false,
        hue: 'hsl(285,50%,97%)',
    },
    {
        id: 'garden',
        slug: 'garden',
        name: 'Garden',
        subtitle: 'Morning sunlight and marigolds',
        memoryCount: 3,
        recallAvg: 85,
        icon: <Flower2 size={28} />,
        featured: false,
        hue: 'hsl(260,40%,97%)',
    },
    {
        id: 'prayer',
        slug: 'prayer',
        name: 'Prayer Room',
        subtitle: 'Agarbatti and daily peace',
        memoryCount: 4,
        recallAvg: 91,
        icon: <FlameKindling size={28} />,
        featured: false,
        hue: 'hsl(300,50%,97%)',
    },
];

export default function MemoryRoomPage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const [customRooms, setCustomRooms] = useState<any[]>([]);

    useEffect(() => {
        try {
            const raw = localStorage.getItem('saathi_custom_rooms');
            if (raw) {
                const parsed = JSON.parse(raw);
                setCustomRooms(parsed);
            }
        } catch (e) {
            console.error(e);
        }
    }, []);

    const allRooms = [
        ...rooms,
        ...customRooms.map((cr: any) => ({
            id: cr.id,
            slug: cr.slug,
            name: cr.name,
            subtitle: cr.description,
            memoryCount: cr.hotspots?.length || 0,
            recallAvg: 0,
            icon: cr.bgImage ? (
                // eslint-disable-next-line @next/next/no-img-element
                <img src={cr.bgImage} alt="" style={{ width: '36px', height: '36px', borderRadius: '50%', objectFit: 'cover' }} />
            ) : <Home size={28} />,
            featured: false,
            hue: 'hsl(210,40%,97%)',
        }))
    ];

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <span className={styles.eyebrow}>
                    <Home size={16} />
                    Memory Room
                </span>
                <h1 className={styles.title}>Explore Your Home</h1>
                <p className={styles.subtitle}>
                    Tap a room to see familiar objects and remember their stories, {userName}.
                </p>
            </div>

            <div className={styles.roomGrid}>
                {allRooms.map((room) => (
                    <Link
                        key={room.id}
                        href={`/patient/memory-room/${room.slug}`}
                        className={`${styles.roomCard} ${room.featured ? styles.roomCardFeatured : ''}`}
                        style={{ '--room-hue': room.hue } as React.CSSProperties}
                        aria-label={`Explore ${room.name} - ${room.memoryCount} memories`}
                    >
                        <div className={styles.cardInner}>
                            <div className={styles.roomIcon}>{room.icon}</div>
                            <div className={styles.roomText}>
                                <h2 className={styles.roomName}>{room.name}</h2>
                                <p className={styles.roomSubtitle}>{room.subtitle}</p>
                                <div className={styles.roomMeta}>
                                    <span className={styles.memCount}>{room.memoryCount} objects</span>
                                    <span className={styles.recallScore}>
                                        <span className={styles.recallDot} style={{ background: room.recallAvg >= 80 ? 'var(--color-success)' : 'var(--color-warning)' }} />
                                        {room.recallAvg}% recall
                                    </span>
                                </div>
                            </div>
                            {room.featured && (
                                <span className={styles.featuredBadge}>Most Visited</span>
                            )}
                        </div>
                    </Link>
                ))}
            </div>
        </div>
    );
}
