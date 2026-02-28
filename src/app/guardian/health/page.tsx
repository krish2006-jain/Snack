'use client';

import { useState, useRef, useEffect } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockHealthRecords, HealthRecord } from '@/lib/mock-data';
import { FileText, Download, Pill, Activity, Stethoscope, Search, Calendar } from 'lucide-react';
import styles from './page.module.css';

const TYPE_ICONS = {
    prescription: <Pill size={15} />,
    lab: <Activity size={15} />,
    note: <Stethoscope size={15} />
};

export default function HealthRecordsPage() {
    const [search, setSearch] = useState('');
    const [records, setRecords] = useState<Array<HealthRecord & { fileUrl?: string }>>(mockHealthRecords);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        // create a small demo file and prepend to records so users can try Download
        const demoContent = 'Demo Health Summary\n\nPatient: Ravi Sharma\nNote: This is a demo file for the Document History.';
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const demoRec: HealthRecord & { fileUrl?: string } = {
            id: 'hr-demo',
            title: 'Clinic Summary (Demo).txt',
            type: 'note',
            date: new Date().toISOString().split('T')[0],
            doctorName: 'Demo Clinic',
            facility: 'Demo Facility',
            fileUrl: url,
        };
        setRecords(prev => [demoRec, ...prev]);
        return () => URL.revokeObjectURL(url);
    }, []);

    const filtered = records.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(search.toLowerCase())
    );

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.currentTarget.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        const newRec: HealthRecord & { fileUrl?: string } = {
            id: `hr-${Date.now()}`,
            title: f.name,
            type: f.type.includes('pdf') ? 'lab' : 'note',
            date: new Date().toISOString().split('T')[0],
            doctorName: 'Uploader',
            facility: 'Local Upload',
            fileUrl: url,
        };
        setRecords(prev => [newRec, ...prev]);
        e.currentTarget.value = '';
    };

    const handleDownload = (record: HealthRecord & { fileUrl?: string }) => {
        if (record.fileUrl) {
            const a = document.createElement('a');
            a.href = record.fileUrl;
            a.download = record.title;
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        }
        const blob = new Blob([`Mock document:\n${record.title}\nDoctor: ${record.doctorName}\nFacility: ${record.facility}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.title}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

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
                    <div>
                        <input ref={fileInputRef} type="file" style={{ display: 'none' }} onChange={handleFileChange} />
                        <button className={styles.uploadBtn} onClick={handleUploadClick}>Upload Document</button>
                    </div>
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
                                    <button className={styles.downloadBtn} aria-label={`Download ${record.title}`} onClick={() => handleDownload(record)}>
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
