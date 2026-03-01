'use client';

import { useState, useEffect, useRef } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockHealthRecords, HealthRecord } from '@/lib/mock-data';
import { FileText, Download, Pill, Activity, Stethoscope, Search, Calendar } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import { apiFetch } from '@/lib/api';
import styles from './page.module.css';

const TYPE_ICONS = {
    prescription: <Pill size={15} />,
    lab: <Activity size={15} />,
    note: <Stethoscope size={15} />
};

interface Medication {
    id: string;
    name: string;
    dosage: string;
    frequency: string;
    time_of_day: string;
    instructions?: string;
}

interface DbHealthRecord {
    id: string;
    title: string;
    record_type: string;
    doctor_name: string;
    hospital: string;
    notes: string;
    record_date: string;
    uploaded_at: number;
}

type DisplayRecord = {
    id: string;
    title: string;
    type: string;
    date: string;
    doctorName: string;
    facility: string;
    fileUrl?: string;
};

export default function HealthRecordsPage() {
    const { user, isDemo } = useSession();
    const patientFirstName = user?.patientName?.split(' ')[0] || 'your patient';

    const [search, setSearch] = useState('');
    const [records, setRecords] = useState<DisplayRecord[]>([]);
    const [medications, setMedications] = useState<Medication[]>([]);
    const fileInputRef = useRef<HTMLInputElement | null>(null);

    useEffect(() => {
        if (isDemo) {
            // Use mock data for demo
            setRecords(mockHealthRecords.map(r => ({
                id: r.id,
                title: r.title,
                type: r.type,
                date: r.date,
                doctorName: r.doctorName,
                facility: r.facility,
            })));
            setMedications([]);
            return;
        }

        // Live data
        apiFetch<{ records: DbHealthRecord[] }>('/api/health')
            .then(d => {
                const mapped: DisplayRecord[] = (d.records || []).map(r => ({
                    id: r.id,
                    title: r.title,
                    type: r.record_type || 'note',
                    date: r.record_date || new Date(r.uploaded_at * 1000).toISOString().split('T')[0],
                    doctorName: r.doctor_name || 'Unknown',
                    facility: r.hospital || '—',
                }));
                setRecords(mapped);
            })
            .catch(() => { });

        apiFetch<{ medications: Medication[] }>('/api/medications')
            .then(d => setMedications(d.medications || []))
            .catch(() => { });
    }, [isDemo]);

    // Demo download blob
    useEffect(() => {
        if (!isDemo) return;
        const patientName = user?.patientName || 'Patient';
        const demoContent = `Demo Health Summary\n\nPatient: ${patientName}\nNote: This is a demo file for the Document History.`;
        const blob = new Blob([demoContent], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const demoRec: DisplayRecord = {
            id: 'hr-demo',
            title: 'Clinic Summary (Demo).txt',
            type: 'note',
            date: new Date().toISOString().split('T')[0],
            doctorName: 'Demo Clinic',
            facility: 'Demo Facility',
            fileUrl: url,
        };
        setRecords(prev => prev.some(r => r.id === 'hr-demo') ? prev : [demoRec, ...prev]);
        return () => URL.revokeObjectURL(url);
    }, [isDemo, user?.patientName]);

    const filtered = records.filter(r =>
        r.title.toLowerCase().includes(search.toLowerCase()) ||
        r.doctorName.toLowerCase().includes(search.toLowerCase())
    );

    const handleUploadClick = () => fileInputRef.current?.click();

    const handleFileChange: React.ChangeEventHandler<HTMLInputElement> = (e) => {
        const f = e.currentTarget.files?.[0];
        if (!f) return;
        const url = URL.createObjectURL(f);
        const newRec: DisplayRecord = {
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

    const handleDownload = (record: DisplayRecord) => {
        if (record.fileUrl) {
            const a = document.createElement('a');
            a.href = record.fileUrl;
            a.download = record.title;
            document.body.appendChild(a);
            a.click();
            a.remove();
            return;
        }
        const blob = new Blob([`Document:\n${record.title}\nDoctor: ${record.doctorName}\nFacility: ${record.facility}`], { type: 'text/plain' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${record.title}.txt`;
        document.body.appendChild(a);
        a.click();
        a.remove();
        URL.revokeObjectURL(url);
    };

    // Demo medications fallback
    const displayMedications: Medication[] = isDemo
        ? [
            { id: 'dm1', name: 'Donepezil (Aricept)', dosage: '10mg', frequency: '1x Daily', time_of_day: 'morning', instructions: 'With water after breakfast' },
            { id: 'dm2', name: 'Memantine', dosage: '20mg', frequency: '1x Daily', time_of_day: 'evening', instructions: 'With dinner' },
            { id: 'dm3', name: 'Vitamin D3', dosage: '60K IU', frequency: 'Weekly', time_of_day: 'morning', instructions: 'Every Sunday' },
        ]
        : medications;

    return (
        <div className={styles.page}>
            <GuardianHeader
                title="Health Records"
                subtitle={`${patientFirstName}'s digital medical vault. Accessible anytime, securely stored.`}
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

                {/* Active Medications */}
                <section className={styles.medSection}>
                    <h2 className={styles.sectionTitle}>Active Medications</h2>
                    {displayMedications.length === 0 ? (
                        <p style={{ color: 'var(--text-muted)', fontSize: '0.85rem', marginTop: '8px' }}>No active medications found.</p>
                    ) : (
                        <div className={styles.medGrid}>
                            {displayMedications.map(m => (
                                <div key={m.id} className={styles.medCard}>
                                    <div className={styles.medIcon}><Pill size={18} /></div>
                                    <div>
                                        <h3 className={styles.medName}>{m.name}</h3>
                                        <span className={styles.medDosage}>
                                            {m.dosage} • {m.frequency || m.time_of_day}
                                            {m.instructions && ` — ${m.instructions}`}
                                        </span>
                                    </div>
                                </div>
                            ))}
                        </div>
                    )}
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
                            <div className={styles.emptyState}>
                                {search ? `No health records found matching "${search}"` : 'No health records uploaded yet.'}
                            </div>
                        )}
                    </div>
                </section>

            </main>
        </div>
    );
}
