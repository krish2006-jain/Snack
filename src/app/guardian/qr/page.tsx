'use client';

import { useState, useEffect, useRef } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockPatient, mockGuardian, mockQRScans, mockEmergencyContacts } from '@/lib/mock-data';
import { Download, Printer, ShieldCheck, ShieldOff, RefreshCw, Eye, EyeOff } from 'lucide-react';
import styles from './page.module.css';

declare global {
    interface Window { QRCode: unknown }
}

type PrivacyField = 'name' | 'address' | 'phone' | 'bloodGroup' | 'diagnosis' | 'guardianName' | 'guardianPhone';

const PRIVACY_FIELDS: { key: PrivacyField; label: string; description: string }[] = [
    { key: 'name', label: "Patient's Full Name", description: "Ravi Sharma — visible to finder" },
    { key: 'address', label: "Home Address", description: "Sector 12, Gurugram — helps return home" },
    { key: 'phone', label: "Emergency Phone", description: "+91 98765 43210 — direct call" },
    { key: 'bloodGroup', label: "Blood Group", description: "B+ — for medical emergencies" },
    { key: 'diagnosis', label: "Diagnosis", description: "Alzheimer's Disease — context for finder" },
    { key: 'guardianName', label: "Guardian Name", description: "Priya Sharma — who to contact" },
    { key: 'guardianPhone', label: "Guardian Phone", description: "+91 99887 76655 — guardian contact" },
];

export default function QRPage() {
    const canvasRef = useRef<HTMLCanvasElement>(null);
    const [privacy, setPrivacy] = useState<Record<PrivacyField, boolean>>({
        name: true, address: true, phone: true, bloodGroup: true,
        diagnosis: false, guardianName: true, guardianPhone: true,
    });
    const [isActive, setIsActive] = useState(true);
    const [toast, setToast] = useState<string | null>(null);
    const [qrGenerated, setQrGenerated] = useState(false);

    const showToast = (msg: string) => {
        setToast(msg);
        setTimeout(() => setToast(null), 3000);
    };

    useEffect(() => {
        // Draw a visual QR placeholder since we use qrcode lib
        const canvas = canvasRef.current;
        if (!canvas) return;
        const ctx = canvas.getContext('2d');
        if (!ctx) return;

        const size = 220;
        canvas.width = size;
        canvas.height = size;

        // Draw QR-like pattern
        ctx.fillStyle = '#ffffff';
        ctx.fillRect(0, 0, size, size);

        ctx.fillStyle = '#1F1135';
        const blockSize = 8;
        const pattern = [
            [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 0, 1],
            [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 0, 0, 0, 1],
            [1, 1, 1, 1, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1, 1, 1, 1, 1, 1, 1, 1, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1],
            [0, 1, 0, 0, 1, 0, 0, 1, 1, 0, 0, 1, 0, 0, 1, 1, 0, 1, 0, 1, 1, 0, 1, 1, 0],
            [1, 0, 1, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 1, 0, 0, 1, 0, 0, 0, 0, 1, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 1, 0, 1, 0, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 1, 1, 0, 0, 0, 0, 1, 1, 0, 1, 0, 1, 0, 0, 1],
            [0, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 1, 1, 1, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1, 0, 0, 1, 0, 1, 1, 0, 0, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0],
            [1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0, 0, 1, 0],
            [1, 0, 1, 1, 1, 0, 1, 1, 1, 0, 1, 0, 1, 1, 1, 0, 1, 0, 1, 0, 1, 0, 1, 0, 1],
            [1, 0, 1, 1, 1, 0, 1, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0, 1, 0, 0, 0, 0, 0, 0, 0],
            [1, 0, 0, 0, 0, 0, 1, 0, 1, 0, 1, 1, 1, 0, 0, 1, 1, 0, 0, 1, 0, 1, 0, 1, 0],
            [1, 1, 1, 1, 1, 1, 1, 0, 0, 0, 0, 1, 0, 0, 1, 0, 0, 0, 1, 0, 0, 0, 1, 0, 1],
        ];

        const xOffset = (size - pattern[0].length * blockSize) / 2;
        const yOffset = (size - pattern.length * blockSize) / 2;

        pattern.forEach((row, r) => {
            row.forEach((cell, c) => {
                if (cell) {
                    ctx.fillRect(xOffset + c * blockSize, yOffset + r * blockSize, blockSize - 1, blockSize - 1);
                }
            });
        });

        // SaathiCare watermark center
        ctx.fillStyle = '#7C3AED';
        ctx.fillRect(size / 2 - 20, size / 2 - 20, 40, 40);
        ctx.fillStyle = '#fff';
        ctx.font = 'bold 11px Inter, sans-serif';
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        ctx.fillText('SC', size / 2, size / 2);

        setQrGenerated(true);
    }, []);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `saathicare-qr-ravi-sharma.png`;
        link.href = canvas.toDataURL();
        link.click();
        showToast('QR code downloaded');
    };

    const handlePrint = () => {
        showToast('Print dialog opening...');
        setTimeout(() => window.print(), 300);
    };

    const handleRegenerate = () => {
        showToast('QR code regenerated with updated settings');
    };

    return (
        <div className={styles.page}>
            <GuardianHeader title="QR Code Manager" subtitle="Ravi's SaathiCare identity card — SAATHI-RAVI-SHARMA-001" />
            <main className={styles.content}>
                <div className={styles.layout}>
                    {/* QR display */}
                    <section className={styles.qrSection}>
                        <div className={`${styles.qrCard} ${!isActive ? styles.qrInactive : ''}`}>
                            <div className={styles.qrHeader}>
                                <span className={styles.qrBrand}>SaathiCare ID</span>
                                <span className={`${styles.statusBadge} ${isActive ? styles.statusActive : styles.statusInactive}`}>
                                    {isActive ? <><ShieldCheck size={12} /> Active</> : <><ShieldOff size={12} /> Inactive</>}
                                </span>
                            </div>

                            <div className={styles.qrCanvas}>
                                <canvas ref={canvasRef} className={styles.canvas} aria-label="QR code for Ravi Sharma SaathiCare ID" />
                                {!isActive && (
                                    <div className={styles.inactiveOverlay}>
                                        <ShieldOff size={36} />
                                        <span>QR Deactivated</span>
                                    </div>
                                )}
                            </div>

                            <div className={styles.qrPatientInfo}>
                                {privacy.name && <span className={styles.qrName}>{mockPatient.name}</span>}
                                {privacy.bloodGroup && (
                                    <span className={styles.qrBlood}>Blood Group: {mockPatient.bloodType}</span>
                                )}
                                <span className={styles.qrId}>ID: {mockPatient.id}</span>
                            </div>

                            <div className={styles.qrActions}>
                                <button className={styles.actionBtn} onClick={handleDownload} aria-label="Download QR code">
                                    <Download size={16} aria-hidden="true" /> Download
                                </button>
                                <button className={styles.actionBtn} onClick={handlePrint} aria-label="Print QR code">
                                    <Printer size={16} aria-hidden="true" /> Print
                                </button>
                                <button className={styles.actionBtnSecondary} onClick={handleRegenerate} aria-label="Regenerate QR code">
                                    <RefreshCw size={16} aria-hidden="true" /> Regenerate
                                </button>
                            </div>

                            <button
                                className={`${styles.deactivateBtn} ${!isActive ? styles.activateBtn : ''}`}
                                onClick={() => { setIsActive(p => !p); showToast(isActive ? 'QR code deactivated' : 'QR code activated'); }}
                            >
                                {isActive ? <><ShieldOff size={14} /> Deactivate QR</> : <><ShieldCheck size={14} /> Activate QR</>}
                            </button>
                        </div>

                        {/* Scan log */}
                        <div className={styles.scanLog}>
                            <h3 className={styles.scanLogTitle}>Recent Scans</h3>
                            {mockQRScans.length === 0 ? (
                                <p className={styles.scanEmpty}>No scans yet</p>
                            ) : (
                                <ul className={styles.scanList}>
                                    {mockQRScans.map(scan => (
                                        <li key={scan.id} className={styles.scanItem}>
                                            <div className={styles.scanMeta}>
                                                <span className={styles.scanLoc}>{scan.location}</span>
                                                <span className={styles.scanType}>{scan.scannerNote || 'Unknown'}</span>
                                            </div>
                                            <div className={styles.scanDetails}>
                                                {scan.scannerNote && <p className={styles.scanNote}>{scan.scannerNote}</p>}
                                                <span className={styles.scanTime}>
                                                    {new Date(scan.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                                </span>
                                            </div>
                                        </li>
                                    ))}
                                </ul>
                            )}
                        </div>
                    </section>

                    {/* Privacy toggles */}
                    <section className={styles.privacySection}>
                        <h2 className={styles.privacyTitle}>Privacy Settings</h2>
                        <p className={styles.privacyDesc}>Control what a Good Samaritan sees when they scan Ravi's QR code.</p>

                        <div className={styles.toggleList}>
                            {PRIVACY_FIELDS.map(field => (
                                <div key={field.key} className={styles.toggleRow}>
                                    <div className={styles.toggleInfo}>
                                        <span className={styles.toggleLabel}>{field.label}</span>
                                        <span className={styles.toggleDesc}>{field.description}</span>
                                    </div>
                                    <button
                                        className={`${styles.toggle} ${privacy[field.key] ? styles.toggleOn : ''}`}
                                        onClick={() => setPrivacy(p => ({ ...p, [field.key]: !p[field.key] }))}
                                        aria-pressed={privacy[field.key]}
                                        aria-label={`${privacy[field.key] ? 'Hide' : 'Show'} ${field.label}`}
                                    >
                                        <span className={styles.toggleKnob} />
                                    </button>
                                    {privacy[field.key]
                                        ? <Eye size={14} className={styles.eyeIcon} style={{ color: 'var(--color-success)' }} aria-hidden="true" />
                                        : <EyeOff size={14} className={styles.eyeIcon} style={{ color: 'var(--text-muted)' }} aria-hidden="true" />
                                    }
                                </div>
                            ))}
                        </div>

                        <div className={styles.previewBox}>
                            <h4 className={styles.previewTitle}>What the finder sees:</h4>
                            <div className={styles.previewContent}>
                                {privacy.name && <p><strong>Name:</strong> {mockPatient.name}</p>}
                                {privacy.address && <p><strong>Address:</strong> {mockPatient.location}</p>}
                                {privacy.bloodGroup && <p><strong>Blood Group:</strong> {mockPatient.bloodType}</p>}
                                {privacy.phone && <p><strong>Emergency:</strong> {mockEmergencyContacts[0].phone}</p>}
                                {privacy.diagnosis && <p><strong>Condition:</strong> {mockPatient.condition}</p>}
                                {privacy.guardianName && <p><strong>Guardian:</strong> {mockGuardian.name} (Primary Caregiver)</p>}
                                {privacy.guardianPhone && <p><strong>Guardian Phone:</strong> {mockGuardian.phone}</p>}
                            </div>
                        </div>
                    </section>
                </div>

                {/* Toast */}
                {toast && (
                    <div className={styles.toast} role="status" aria-live="polite">{toast}</div>
                )}
            </main>
        </div>
    );
}
