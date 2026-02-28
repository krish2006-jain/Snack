'use client';

import { useState, useMemo } from 'react';
import { Heart, CheckCircle, XCircle, Clock, Inbox, Filter } from 'lucide-react';
import { mockFamilyContributions, type FamilyContribution } from '@/lib/mock-data/patient';
import styles from './page.module.css';

type FilterStatus = 'all' | 'pending' | 'approved' | 'rejected';

export default function GuardianContributionsPage() {
    const [contributions, setContributions] = useState<FamilyContribution[]>(mockFamilyContributions);
    const [filter, setFilter] = useState<FilterStatus>('all');

    const filtered = useMemo(() => {
        if (filter === 'all') return contributions;
        return contributions.filter(c => c.status === filter);
    }, [contributions, filter]);

    const counts = useMemo(() => ({
        all: contributions.length,
        pending: contributions.filter(c => c.status === 'pending').length,
        approved: contributions.filter(c => c.status === 'approved').length,
        rejected: contributions.filter(c => c.status === 'rejected').length,
    }), [contributions]);

    const updateStatus = (id: string, status: 'approved' | 'rejected') => {
        setContributions(prev => prev.map(c =>
            c.id === id ? { ...c, status } : c
        ));
    };

    const getInitials = (name: string) =>
        name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase();

    return (
        <div className={styles.page}>
            <div className={styles.pageHeader}>
                <span className={styles.eyebrow}>
                    <Heart size={14} />
                    Family Contributions
                </span>
                <h1 className={styles.title}>Review Family Stories</h1>
                <p className={styles.subtitle}>
                    Approve or decline memories shared by family members
                </p>
            </div>

            {/* Filter tabs */}
            <div className={styles.filterRow}>
                {(['all', 'pending', 'approved', 'rejected'] as FilterStatus[]).map(status => (
                    <button
                        key={status}
                        className={`${styles.filterBtn} ${filter === status ? styles.filterBtnActive : ''}`}
                        onClick={() => setFilter(status)}
                    >
                        {status === 'all' && <Filter size={13} />}
                        {status === 'pending' && <Clock size={13} />}
                        {status === 'approved' && <CheckCircle size={13} />}
                        {status === 'rejected' && <XCircle size={13} />}
                        {status.charAt(0).toUpperCase() + status.slice(1)}
                        <span className={styles.filterCount}>{counts[status]}</span>
                    </button>
                ))}
            </div>

            {/* Cards grid */}
            <div className={styles.grid}>
                {filtered.length === 0 && (
                    <div className={styles.empty}>
                        <div className={styles.emptyIcon}>
                            <Inbox size={28} />
                        </div>
                        <h3 className={styles.emptyTitle}>No contributions here</h3>
                        <p className={styles.emptyDesc}>
                            {filter === 'pending' ? 'All caught up! No pending reviews.' : `No ${filter} contributions yet.`}
                        </p>
                    </div>
                )}

                {filtered.map(c => (
                    <div
                        key={c.id}
                        className={`${styles.card} ${c.status === 'pending' ? styles.cardPending :
                                c.status === 'approved' ? styles.cardApproved :
                                    styles.cardRejected
                            }`}
                    >
                        <div className={styles.cardHeader}>
                            {c.contributorPhoto ? (
                                <img
                                    src={c.contributorPhoto}
                                    alt={c.contributorName}
                                    className={styles.cardPhoto}
                                    onError={(e) => {
                                        (e.target as HTMLImageElement).style.display = 'none';
                                    }}
                                />
                            ) : (
                                <div className={styles.cardInitial}>
                                    {getInitials(c.contributorName)}
                                </div>
                            )}
                            <div className={styles.cardInfo}>
                                <div className={styles.cardName}>{c.contributorName}</div>
                                <div className={styles.cardRelation}>{c.contributorRelation}</div>
                            </div>
                            <span className={`${styles.statusBadge} ${c.status === 'pending' ? styles.statusPending :
                                    c.status === 'approved' ? styles.statusApproved :
                                        styles.statusRejected
                                }`}>
                                {c.status}
                            </span>
                        </div>

                        <div className={styles.cardBody}>
                            <h3 className={styles.cardTitle}>{c.title}</h3>
                            <p className={styles.cardContent}>{c.content}</p>
                        </div>

                        <div className={styles.cardTime}>{c.timeLabel}</div>

                        {c.status === 'pending' && (
                            <div className={styles.cardActions}>
                                <button
                                    className={styles.approveBtn}
                                    onClick={() => updateStatus(c.id, 'approved')}
                                >
                                    <CheckCircle size={15} />
                                    Approve
                                </button>
                                <button
                                    className={styles.rejectBtn}
                                    onClick={() => updateStatus(c.id, 'rejected')}
                                >
                                    <XCircle size={15} />
                                    Decline
                                </button>
                            </div>
                        )}
                    </div>
                ))}
            </div>
        </div>
    );
}
