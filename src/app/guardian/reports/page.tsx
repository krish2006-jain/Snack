'use client';

import { useState } from 'react';
import { jsPDF } from 'jspdf';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { Download, FileText, Calendar, Filter, FileCheck2, BarChart3 } from 'lucide-react';
import styles from './page.module.css';

import { mockReports } from '@/lib/mock-data';


export default function ReportsPage() {
    const [activeTab, setActiveTab] = useState('clinical');
    const [timeRange, setTimeRange] = useState('Last 7 Days');
    const [includeCognitive, setIncludeCognitive] = useState(true);
    const [includeMedication, setIncludeMedication] = useState(true);
    const [includeJournal, setIncludeJournal] = useState(false);
    const [includeSafety, setIncludeSafety] = useState(true);

    const downloadReport = (rep: { id: string; title: string; type: string; date: string }) => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text(rep.title, 14, 20);
        doc.setFontSize(10);
        doc.text(`Type: ${rep.type}`, 14, 30);
        doc.text(`Date: ${rep.date}`, 14, 36);
        doc.text('This PDF is a mock/generated file for demo purposes.', 14, 50);
        doc.save(`${rep.title.replace(/[^a-z0-9]/gi, '_')}.pdf`);
    };

    const generateCustom = () => {
        const doc = new jsPDF();
        doc.setFontSize(14);
        doc.text('Custom Report', 14, 20);
        doc.setFontSize(10);
        doc.text(`Range: ${timeRange}`, 14, 30);
        const includes = [];
        if (includeCognitive) includes.push('Cognitive Scores');
        if (includeMedication) includes.push('Medication Data');
        if (includeJournal) includes.push('Patient Journal');
        if (includeSafety) includes.push('Safety Incidents');
        doc.text(`Includes: ${includes.join(', ')}`, 14, 40);
        doc.text('Mock summary data follows...', 14, 60);
        doc.save('custom_report.pdf');
    };

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
                            {mockReports.map(rep => (
                                <div key={rep.id} className={styles.reportCard}>
                                    <div className={styles.reportIcon}><FileText size={18} /></div>
                                    <div className={styles.reportInfo}>
                                        <h3 className={styles.reportTitle}>{rep.title}</h3>
                                        <span className={styles.reportMeta}>{rep.type} • Generated <Calendar size={11} /> {rep.date}</span>
                                    </div>
                                    <button className={styles.downloadBtn} aria-label={`Download ${rep.title} PDF`} onClick={() => downloadReport(rep)}>
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
                            <select aria-label="Time range" className={styles.select} value={timeRange} onChange={e => setTimeRange(e.target.value)}>
                                <option>Last 7 Days</option>
                                <option>Last 30 Days</option>
                                <option>Year to Date</option>
                            </select>
                        </div>

                        <div className={styles.formGroup}>
                            <label className={styles.label}>Include</label>
                            <label className={styles.checkbox}><input type="checkbox" checked={includeCognitive} onChange={e => setIncludeCognitive(e.target.checked)} /> Cognitive Scores</label>
                            <label className={styles.checkbox}><input type="checkbox" checked={includeMedication} onChange={e => setIncludeMedication(e.target.checked)} /> Medication Data</label>
                            <label className={styles.checkbox}><input type="checkbox" checked={includeJournal} onChange={e => setIncludeJournal(e.target.checked)} /> Patient Journal Entries</label>
                            <label className={styles.checkbox}><input type="checkbox" checked={includeSafety} onChange={e => setIncludeSafety(e.target.checked)} /> Safety Incidents</label>
                        </div>

                        <button className={styles.generateBtn} onClick={generateCustom}>
                            <FileCheck2 size={15} /> Generate PDF
                        </button>
                    </aside>
                </div>

            </main>
        </div>
    );
}
