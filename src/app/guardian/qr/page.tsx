'use client';

import { useState, useEffect, useRef } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockQRScans, mockEmergencyContacts } from '@/lib/mock-data';
import { Download, Printer, ShieldCheck, ShieldOff, RefreshCw, Eye, EyeOff } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import styles from './page.module.css';

type PrivacyField = 'name' | 'address' | 'phone' | 'bloodGroup' | 'diagnosis' | 'guardianName' | 'guardianPhone';

const PRIVACY_FIELDS_STATIC = [
    { key: 'name' as PrivacyField, label: "Patient's Full Name", description: 'Visible to finder' },
    { key: 'address' as PrivacyField, label: "Home Address", description: 'Sector 12, Gurugram - helps return home' },
    { key: 'phone' as PrivacyField, label: "Emergency Phone", description: 'Direct call on emergency' },
    { key: 'bloodGroup' as PrivacyField, label: "Blood Group", description: 'For medical emergencies' },
    { key: 'diagnosis' as PrivacyField, label: "Diagnosis", description: "Alzheimer's Disease - context for finder" },
    { key: 'guardianName' as PrivacyField, label: "Guardian Name", description: 'Who to contact' },
    { key: 'guardianPhone' as PrivacyField, label: "Guardian Phone", description: 'Guardian contact number' },
];

// Live emergency profile URL - scanning this opens the patient's full emergency page
const QR_TARGET_URL = 'https://snack-production-ca02.up.railway.app/scan/ravi-sharma-2024';

export default function QRPage() {
    const { user } = useSession();
    const patientName = user?.patientName || 'Your Patient';
    const guardianName = user?.name || 'Guardian';
    const patientSlug = patientName.toLowerCase().replace(/\s+/g, '-');
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
        const canvas = canvasRef.current;
        if (!canvas) return;

        // Dynamically import qrcode to avoid SSR issues
        import('qrcode').then((QRCode) => {
            QRCode.toCanvas(canvas, QR_TARGET_URL, {
                width: 220,
                margin: 2,
                color: {
                    dark: '#1A1A1A',
                    light: '#FFFFFF',
                },
                errorCorrectionLevel: 'H', // High - allows logo overlay
            }, (err) => {
                if (err) {
                    console.error('[QR] Generation failed:', err);
                    return;
                }

                // Overlay a branded "SC" logo in the center
                const ctx = canvas.getContext('2d');
                if (ctx) {
                    const s = canvas.width;
                    const logoSize = 38;
                    const x = (s - logoSize) / 2;
                    const y = (s - logoSize) / 2;

                    // White padding
                    ctx.fillStyle = '#FFFFFF';
                    ctx.beginPath();
                    ctx.roundRect(x - 3, y - 3, logoSize + 6, logoSize + 6, 6);
                    ctx.fill();

                    // Green square
                    ctx.fillStyle = '#2D5A3D';
                    ctx.beginPath();
                    ctx.roundRect(x, y, logoSize, logoSize, 5);
                    ctx.fill();

                    // "SC" label
                    ctx.fillStyle = '#FFFFFF';
                    ctx.font = 'bold 13px system-ui, sans-serif';
                    ctx.textAlign = 'center';
                    ctx.textBaseline = 'middle';
                    ctx.fillText('SC', x + logoSize / 2, y + logoSize / 2);
                }

                setQrGenerated(true);
            });
        });
    }, []);

    const handleDownload = () => {
        const canvas = canvasRef.current;
        if (!canvas) return;
        const link = document.createElement('a');
        link.download = `saathicare-qr-${patientSlug}.png`;
        link.href = canvas.toDataURL('image/png');
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
            <GuardianHeader title="QR Code Manager" subtitle={`${patientName}'s SaathiCare identity card`} />
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
                                <canvas
                                    ref={canvasRef}
                                    className={styles.canvas}
                                    aria-label={`Scannable QR code for ${patientName} - opens emergency profile`}
                                />
                                {!isActive && (
                                    <div className={styles.inactiveOverlay}>
                                        <ShieldOff size={36} />
                                        <span>QR Deactivated</span>
                                    </div>
                                )}
                            </div>

                            {/* Live URL info badge */}
                            {qrGenerated && (
                                <div style={{
                                    fontSize: 11,
                                    color: 'var(--color-success)',
                                    background: 'var(--color-success-bg)',
                                    border: '1px solid rgba(45,122,79,0.2)',
                                    borderRadius: 8,
                                    padding: '6px 12px',
                                    textAlign: 'center',
                                    fontWeight: 600,
                                    lineHeight: 1.5,
                                }}>
                                    ✅ Scan with any phone - opens live emergency profile
                                </div>
                            )}

                            <div className={styles.qrPatientInfo}>
                                {privacy.name && <span className={styles.qrName}>{patientName}</span>}
                                {privacy.bloodGroup && (
                                    <span className={styles.qrBlood}>Blood Group: B+</span>
                                )}
                                <span className={styles.qrId}>SaathiCare ID</span>
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
                        <p className={styles.privacyDesc}>Control what a Good Samaritan sees when they scan {patientName}&apos;s QR code.</p>

                        <div className={styles.toggleList}>
                            {PRIVACY_FIELDS_STATIC.map(field => (
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
                                {privacy.name && <p><strong>Name:</strong> {patientName}</p>}
                                {privacy.address && <p><strong>Address:</strong> Sector 12, Gurugram</p>}
                                {privacy.bloodGroup && <p><strong>Blood Group:</strong> B+</p>}
                                {privacy.phone && <p><strong>Emergency:</strong> {mockEmergencyContacts[0].phone}</p>}
                                {privacy.diagnosis && <p><strong>Condition:</strong> Alzheimer&apos;s Disease</p>}
                                {privacy.guardianName && <p><strong>Guardian:</strong> {guardianName} (Primary Caregiver)</p>}
                                {privacy.guardianPhone && <p><strong>Guardian Phone:</strong> Contact via SaathiCare</p>}
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
