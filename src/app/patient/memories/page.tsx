'use client';

import { useState, useEffect } from 'react';
import { CheckCircle, HelpCircle, ChevronLeft, ChevronRight, Lightbulb } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './memories.module.css';
import { mockFlashcards, type Flashcard } from '@/lib/mock-data/patient';

type Category = 'all' | 'family' | 'places' | 'memories' | 'objects';

const categories: { id: Category; label: string }[] = [
    { id: 'all', label: 'All' },
    { id: 'family', label: 'Family' },
    { id: 'places', label: 'Places' },
    { id: 'memories', label: 'Memories' },
    { id: 'objects', label: 'Objects' },
];

const categoryEmoji: Record<string, string> = {
    family: '👨‍👩‍👧',
    places: '🏠',
    memories: '📖',
    objects: '📦',
};

const categoryMap: Record<string, string> = {
    home: 'places',
    events: 'memories',
    general: 'objects',
};

export default function MemoriesPage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const [allCards, setAllCards] = useState<Flashcard[]>(mockFlashcards);
    const [activeCategory, setActiveCategory] = useState<Category>('all');
    const [currentIndex, setCurrentIndex] = useState(0);
    const [revealed, setRevealed] = useState(false);
    const [remembered, setRemembered] = useState<Record<string, boolean | null>>({});

    useEffect(() => {
        fetch('/api/memories')
            .then(r => r.json())
            .then(data => {
                if (data.cards && data.cards.length > 0) {
                    const mapped: Flashcard[] = data.cards.map((c: { id: string; question: string; answer: string; description: string; category: string }) => ({
                        id: c.id,
                        question: c.question,
                        answer: c.answer,
                        description: c.description || '',
                        category: (categoryMap[c.category] || c.category) as Flashcard['category'],
                        tip: 'Try to recall associated feelings and sensory details.',
                    }));
                    setAllCards(mapped);
                }
            })
            .catch(() => { /* keep mock data */ });
    }, []);

    const filtered =
        activeCategory === 'all'
            ? allCards
            : allCards.filter((f) => f.category === activeCategory);

    const card: Flashcard = filtered[currentIndex];
    const total = filtered.length;

    const goNext = () => {
        setCurrentIndex((i) => (i + 1) % total);
        setRevealed(false);
    };

    const goPrev = () => {
        setCurrentIndex((i) => (i - 1 + total) % total);
        setRevealed(false);
    };

    const handleRemember = () => {
        setRemembered((r) => ({ ...r, [card.id]: true }));
        fetch('/api/memories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: card.id, recalled: true }),
        }).catch(() => { });
        setTimeout(goNext, 600);
    };

    const handleHelp = () => {
        setRemembered((r) => ({ ...r, [card.id]: false }));
        fetch('/api/memories', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ cardId: card.id, recalled: false }),
        }).catch(() => { });
        setRevealed(true);
    };

    const changeCategory = (cat: Category) => {
        setActiveCategory(cat);
        setCurrentIndex(0);
        setRevealed(false);
    };

    const cardState = remembered[card?.id];

    return (
        <div className={styles.page}>
            {/* Category tabs */}
            <div className={styles.categoryRow} role="tablist" aria-label="Memory categories">
                {categories.map((cat) => (
                    <button
                        key={cat.id}
                        role="tab"
                        aria-selected={activeCategory === cat.id}
                        className={`${styles.categoryTab} ${activeCategory === cat.id ? styles.categoryTabActive : ''}`}
                        onClick={() => changeCategory(cat.id)}
                    >
                        {cat.label}
                    </button>
                ))}
            </div>

            {/* Progress */}
            <p className={styles.progress} aria-live="polite">
                Card {currentIndex + 1} of {total}
            </p>

            {/* FLASHCARD */}
            {card && (
                <article className={styles.flashcard} aria-label={`Memory card: ${card.question}`}>
                    {/* Photo placeholder - colorful illustrated placeholder */}
                    <div
                        className={styles.cardPhoto}
                        style={{
                            background: card.photo ? 'var(--bg-surface)' :
                                card.category === 'family'
                                    ? 'linear-gradient(135deg, #F0EBE3 0%, #E8E0D4 100%)'
                                    : card.category === 'places'
                                        ? 'linear-gradient(135deg, #E6EADD 0%, #D4DCDB 100%)'
                                        : card.category === 'memories'
                                            ? 'linear-gradient(135deg, #FDF7E5 0%, #F5ECC9 100%)'
                                            : 'linear-gradient(135deg, #FDEBE5 0%, #F5D3C9 100%)',
                        }}
                        aria-hidden="true"
                    >
                        {card.photo ? (
                            <img src={card.photo} alt={card.question} style={{ width: '100%', height: '100%', objectFit: 'cover' }} />
                        ) : (
                            <span className={styles.cardEmoji}>
                                {categoryEmoji[card.category] ?? '🧠'}
                            </span>
                        )}
                    </div>

                    {/* Question */}
                    <div className={styles.cardBody}>
                        <span className={styles.cardCategory}>{card.category}</span>
                        <h2 className={styles.cardQuestion}>{card.question}</h2>

                        {/* Revealed answer */}
                        {revealed && (
                            <div className={styles.revealPanel} role="region" aria-label="Answer revealed">
                                <div className={styles.answer}>{card.answer}</div>
                                <p className={styles.description}>{card.description}</p>
                                <div className={styles.tipRow}>
                                    <Lightbulb size={16} color="var(--color-warning)" />
                                    <span className={styles.tip}>{card.tip}</span>
                                </div>
                            </div>
                        )}

                        {/* Action buttons */}
                        <div className={styles.actionRow}>
                            {cardState === true ? (
                                <div className={styles.successMsg}>
                                    <CheckCircle size={28} color="var(--color-success)" />
                                    <span>Great remembering, {userName}!</span>
                                </div>
                            ) : (
                                <>
                                    <button
                                        className={`btn btn--success btn--patient ${styles.actionBtn}`}
                                        onClick={handleRemember}
                                        aria-label="I remember this"
                                    >
                                        <CheckCircle size={22} />
                                        I Remember
                                    </button>
                                    <button
                                        className={`btn btn--secondary btn--patient ${styles.actionBtn}`}
                                        onClick={handleHelp}
                                        aria-label="Help me remember"
                                    >
                                        <HelpCircle size={22} />
                                        Help Me Remember
                                    </button>
                                </>
                            )}
                        </div>
                    </div>
                </article>
            )}

            {/* Navigation arrows */}
            <div className={styles.navRow} aria-label="Navigate between cards">
                <button
                    className={`btn btn--secondary ${styles.navBtn}`}
                    onClick={goPrev}
                    aria-label="Previous card"
                    disabled={total <= 1}
                >
                    <ChevronLeft size={24} />
                    Previous
                </button>
                <button
                    className={`btn btn--primary ${styles.navBtn}`}
                    onClick={goNext}
                    aria-label="Next card"
                    disabled={total <= 1}
                >
                    Next
                    <ChevronRight size={24} />
                </button>
            </div>
        </div>
    );
}
