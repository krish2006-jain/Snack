'use client';

import { useState, useMemo } from 'react';
import { Heart, X, ChevronLeft, ChevronRight, MessageSquareHeart, FileText } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { mockFamilyContributions, type FamilyContribution } from '@/lib/mock-data/patient';
import styles from './family-stories.module.css';

export default function FamilyStoriesPage() {
    const { user } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';

    // Only show approved stories to the patient
    const stories = useMemo(() =>
        mockFamilyContributions.filter(c => c.status === 'approved'),
        []
    );

    const [viewingIndex, setViewingIndex] = useState<number | null>(null);

    // Group by contributor for avatar row
    const contributors = useMemo(() => {
        const map = new Map<string, { name: string; photo: string; relation: string; count: number; hasUnread: boolean }>();
        stories.forEach(c => {
            const existing = map.get(c.contributorName);
            if (existing) {
                existing.count++;
            } else {
                map.set(c.contributorName, {
                    name: c.contributorName,
                    photo: c.contributorPhoto,
                    relation: c.contributorRelation,
                    count: 1,
                    hasUnread: true, // mock: first 2 have unread
                });
            }
        });
        return Array.from(map.values());
    }, [stories]);

    const viewedStory = viewingIndex !== null ? stories[viewingIndex] : null;

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    const findFirstByContributor = (name: string) =>
        stories.findIndex(s => s.contributorName === name);

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.pageHeader}>
                <span className={styles.eyebrow}>
                    <Heart size={14} />
                    Family Stories
                </span>
                <h1 className={styles.title}>From Your Family</h1>
                <p className={styles.subtitle}>
                    Messages and memories from your loved ones, {userName}
                </p>
            </div>

            {/* Stories bubble row — family avatars */}
            <div className={styles.storiesRow}>
                {contributors.map((person, i) => (
                    <button
                        key={person.name}
                        className={styles.storyBubble}
                        onClick={() => {
                            const idx = findFirstByContributor(person.name);
                            if (idx >= 0) setViewingIndex(idx);
                        }}
                        aria-label={`View stories from ${person.name}`}
                    >
                        <div className={`${styles.storyRing} ${i > 2 ? styles.storyRingViewed : ''}`}>
                            <div className={styles.storyAvatar}>
                                {person.photo ? (
                                    <img
                                        src={person.photo}
                                        alt={person.name}
                                        className={styles.storyAvatarImg}
                                        onError={(e) => {
                                            (e.target as HTMLImageElement).style.display = 'none';
                                            (e.target as HTMLImageElement).nextElementSibling?.removeAttribute('style');
                                        }}
                                    />
                                ) : null}
                                <span className={styles.storyAvatarInitial} style={person.photo ? { display: 'none' } : {}}>
                                    {getInitials(person.name)}
                                </span>
                                {person.hasUnread && i < 3 && <span className={styles.unreadDot} />}
                            </div>
                        </div>
                        <span className={`${styles.storyLabel} ${i < 3 ? styles.storyLabelActive : ''}`}>
                            {person.name.split(' ')[0]}
                        </span>
                    </button>
                ))}
            </div>

            {/* Story cards feed */}
            <div className={styles.storiesFeed}>
                {stories.map((story, i) => (
                    <article
                        key={story.id}
                        className={styles.storyCard}
                        onClick={() => setViewingIndex(i)}
                        role="button"
                        tabIndex={0}
                        aria-label={`Story from ${story.contributorName}`}
                    >
                        <div className={styles.storyCardHeader}>
                            {story.contributorPhoto ? (
                                <img
                                    src={story.contributorPhoto}
                                    alt={story.contributorName}
                                    className={styles.storyCardPhoto}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className={styles.storyCardInitial}>
                                    {getInitials(story.contributorName)}
                                </div>
                            )}
                            <div className={styles.storyCardInfo}>
                                <div className={styles.storyCardName}>{story.contributorName}</div>
                                <div className={styles.storyCardRelation}>
                                    <Heart size={10} /> {story.contributorRelation} · {story.timeLabel}
                                </div>
                            </div>
                        </div>
                        <div className={styles.storyCardBody}>
                            <h3 className={styles.storyCardTitle}>{story.title}</h3>
                            <p className={styles.storyCardContent}>{story.content}</p>
                        </div>
                        <div className={styles.storyCardFooter}>
                            <span className={styles.typeBadge}>
                                <FileText size={11} />
                                {story.contentType === 'text' ? 'Message' : story.contentType === 'voice' ? 'Voice Note' : 'Photo'}
                            </span>
                            <span className={styles.relationBadge}>
                                {story.contributorRelation}
                            </span>
                        </div>
                    </article>
                ))}
            </div>

            {/* Fullscreen story viewer */}
            {viewedStory && viewingIndex !== null && (
                <div className={styles.storyViewer} onClick={() => setViewingIndex(null)}>
                    <div className={styles.storyViewerBg} />

                    {/* Progress segments */}
                    <div className={styles.storyViewerProgress}>
                        {stories.map((_, i) => (
                            <div
                                key={i}
                                className={`${styles.progressSegment} ${i === viewingIndex ? styles.progressSegmentActive : ''} ${i < viewingIndex ? styles.progressSegmentViewed : ''}`}
                            />
                        ))}
                    </div>

                    {/* Header */}
                    <div className={styles.storyViewerHeader}>
                        {viewedStory.contributorPhoto ? (
                            <img
                                src={viewedStory.contributorPhoto}
                                alt={viewedStory.contributorName}
                                className={styles.storyViewerPhoto}
                            />
                        ) : (
                            <div className={styles.storyViewerInitial}>
                                {getInitials(viewedStory.contributorName)}
                            </div>
                        )}
                        <div className={styles.storyViewerInfo}>
                            <div className={styles.storyViewerName}>{viewedStory.contributorName}</div>
                            <div className={styles.storyViewerRelation}>{viewedStory.contributorRelation} · {viewedStory.timeLabel}</div>
                        </div>
                        <button
                            className={styles.storyViewerClose}
                            onClick={() => setViewingIndex(null)}
                            aria-label="Close"
                        >
                            <X size={20} />
                        </button>
                    </div>

                    {/* Body */}
                    <div className={styles.storyViewerBody} onClick={e => e.stopPropagation()}>
                        <h2 className={styles.storyViewerTitle}>{viewedStory.title}</h2>
                        <p className={styles.storyViewerContent}>
                            &ldquo;{viewedStory.content}&rdquo;
                        </p>
                        <span className={styles.storyViewerFrom}>
                            <MessageSquareHeart size={14} />
                            With love from {viewedStory.contributorName.split(' ')[0]}
                        </span>
                    </div>

                    {/* Navigation */}
                    <div className={styles.storyViewerNav} onClick={e => e.stopPropagation()}>
                        <button
                            className={styles.storyNavBtn}
                            disabled={viewingIndex <= 0}
                            onClick={() => setViewingIndex(Math.max(0, viewingIndex - 1))}
                        >
                            <ChevronLeft size={16} /> Previous
                        </button>
                        <button
                            className={styles.storyNavBtn}
                            disabled={viewingIndex >= stories.length - 1}
                            onClick={() => setViewingIndex(Math.min(stories.length - 1, viewingIndex + 1))}
                        >
                            Next <ChevronRight size={16} />
                        </button>
                    </div>
                </div>
            )}
        </div>
    );
}
