'use client';

import { useState } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockHealthRecords } from '@/lib/mock-data';
import { FileText, Download, Pill, Activity, Stethoscope, Search, Calendar } from 'lucide-react';
import styles from './page.module.css';

const TYPE_ICONS = {
    prescription: <Pill size={15} />,
    lab: <Activity size={15} />,
    note: <Stethoscope size={15} />
};

export default function HealthRecordsPage() {
    const [search, setSearch] = useState('');

    const filtered = mockHealthRecords.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(search.toLowerCase())
    );

    return (
        <div className={styles.page}>
            <GuardianHeader
                title="Health Records"
                subtitle="Ravi's digital medical vault. Accessible anytime, securely stored."
            />
            <main className={styles.content}>

                {/* Search & Actions */}
                <div className={styles.actionBar}>
                    <div className={styles.searchBox}>
                        <Search size={16} className={styles.searchIcon} aria-hidden="true" />
                        <input
                            type="text"
                            className={styles.searchInput}
                            placeholder="Search by doctor, lab, or title..."
                            value={search}
                            onChange={e => setSearch(e.target.value)}
                        />
                    </div>
                    <button className={styles.uploadBtn}>Upload Document</button>
                </div>

                {/* Current Medications Snapshot */}
                <section className={styles.medSection}>
                    <h2 className={styles.sectionTitle}>Active Medications</h2>
                    <div className={styles.medGrid}>
                        <div className={styles.medCard}>
                            <div className={styles.medIcon}><Pill size={18} /></div>
                            <div>
                                <h3 className={styles.medName}>Donepezil (Aricept)</h3>
                                <span className={styles.medDosage}>5mg • 1x Morning</span>
                            </div>
                        </div>
                        <div className={styles.medCard}>
                            <div className={styles.medIcon}><Pill size={18} /></div>
                            <div>
                                <h3 className={styles.medName}>Memantine</h3>
                                <span className={styles.medDosage}>10mg • 1x Evening</span>
                            </div>
                        </div>
                        <div className={styles.medCard}>
                            <div className={styles.medIcon}><Pill size={18} /></div>
                            <div>
                                <h3 className={styles.medName}>Vitamin B-12</h3>
                                <span className={styles.medDosage}>500mcg • 1x Daily</span>
                            </div>
                        </div>
                    </div>
                </section>

                {/* Record List */}
                <section className={styles.recordSection}>
                    <h2 className={styles.sectionTitle}>Document History</h2>

                    <div className={styles.recordList}>
                        {filtered.map(record => (
                            <article key={record.id} className={styles.recordCard}>
                                <div className={styles.recordLeft}>
                                    <div className={styles.typeIcon} data-type={record.type}>
                                        {TYPE_ICONS[record.type as keyof typeof TYPE_ICONS] || <FileText size={15} />}
                                    </div>
                                    <div className={styles.recordInfo}>
                                        <h3 className={styles.recordTitle}>{record.title}</h3>
                                        <div className={styles.recordMeta}>
                                            <span>Dr. {record.doctorName} • {record.facility}</span>
                                        </div>
                                    </div>
                                </div>

                                <div className={styles.recordRight}>
                                    <span className={styles.recordDate}>
                                        <Calendar size={13} aria-hidden="true" />
                                        {new Date(record.date).toLocaleDateString('en-IN', { year: 'numeric', month: 'short', day: 'numeric' })}
                                    </span>
                                    <button className={styles.downloadBtn} aria-label={`Download ${record.title}`}>
                                        <Download size={15} aria-hidden="true" />
                                    </button>
                                </div>
                            </article>
                        ))}

                        {filtered.length === 0 && (
                            <div className={styles.emptyState}>No health records found matching "{search}"</div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}
