'use client';

import { useState } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { Download, FileText, Calendar, Filter, FileCheck2, BarChart3 } from 'lucide-react';
import styles from './page.module.css';

const REPORTS = [
    { id: '1', title: 'Monthly Cognitive Summary - Feb 2026', type: 'Clinical', date: '28-02-2026', icon: <BarChart3 size={15} /> },
    { id: '2', title: 'Medication Adherence Report', type: 'Pharmacy', date: '15-02-2026', icon: <FileCheck2 size={15} /> },
    { id: '3', title: 'Quarterly Geofence & Wandering Log', type: 'Safety', date: '01-01-2026', icon: <FileText size={15} /> },
];

export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('clinical');

    return (
        <div className={styles.page}>
            <GuardianHeader
                title="Reports & Logs"
                subtitle="Automated summaries of Ravi's platform interactions"
            />
            <main className={styles.content}>

                <div className={styles.grid}>
                    {/* Main List */}
                    <section className={styles.listSection}>
                        <div className={styles.filters}>
                            <div className={styles.tabs}>
                                <button className={`${styles.tab} ${activeTab === 'clinical' ? styles.tabActive : ''}`} onClick={() => setActiveTab('clinical')}>Clinical</button>
                                <button className={`${styles.tab} ${activeTab === 'safety' ? styles.tabActive : ''}`} onClick={() => setActiveTab('safety')}>Safety Logs</button>
                                <button className={`${styles.tab} ${activeTab === 'behavior' ? styles.tabActive : ''}`} onClick={() => setActiveTab('behavior')}>Behavior</button>
                            </div>
                            <button className={styles.filterBtn}><Filter size={14} /> Filter</button>
                        </div>

                        <div className={styles.reportList}>
                            {REPORTS.map(rep => (
                                <div key={rep.id} className={styles.reportCard}>
                                    <div className={styles.reportIcon}>{rep.icon}</div>
                                    <div className={styles.reportInfo}>
                                        <h3 className={styles.reportTitle}>{rep.title}</h3>
                                        <span className={styles.reportMeta}>{rep.type} • Generated <Calendar size={11} /> {rep.date}</span>
                                    </div>
                                    <button className={styles.downloadBtn} aria-label="Download PDF">
                                        <Download size={14} /> Download PDF
                                    </button>
                                </div>
                            ))}
                        </div>
                    </section>

                    {/* Quick Generate Panel */}
                    <aside className={styles.genPanel}>
                        <h2 className={styles.genTitle}>Generate Custom Report</h2>
                        <p className={styles.genDesc}>Compile a fresh PDF summary to share with doctors or family members.</p>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Time Range</label>
                            <select className={styles.select}>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Year to Date</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Include</label>
                            <label className={styles.checkbox}><input type="checkbox" defaultChecked /> Cognitive Scores</label>
                            <label className={styles.checkbox}><input type="checkbox" defaultChecked /> Medication Data</label>
                            <label className={styles.checkbox}><input type="checkbox" /> Patient Journal Entries</label>
                            <label className={styles.checkbox}><input type="checkbox" defaultChecked /> Safety Incidents</label>
                        </div>

                        <button className={styles.generateBtn}>
                            <FileCheck2 size={15} /> Generate PDF
                        </button>
                    </aside>
                </div>

            </main>
        </div>
    );
}
