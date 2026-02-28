'use client';

import { useState } from 'react';
import GuardianHeader from '@/components/guardian/GuardianHeader';
import { mockAlerts, mockQRScans, Alert } from '@/lib/mock-data';
import { AlertTriangle, Info, CheckCircle2, ShieldAlert, Filter, Bell, QrCode, MailOpen } from 'lucide-react';
import styles from './page.module.css';

type FilterType = 'all' | 'danger' | 'warning' | 'info' | 'success';

const SOURCE_LABELS: Record<string, string> = {
    system: 'System', caretaker: 'Caretaker', geofence: 'Geofence', vitals: 'Vitals', medication: 'Medication'
};

const TYPE_META: Record<string, { label: string; color: string; bg: string; icon: React.ReactNode }> = {
    danger: { label: 'Critical', color: 'var(--color-danger)', bg: 'var(--color-danger-bg)', icon: <ShieldAlert size={14} /> },
    warning: { label: 'Warning', color: 'var(--color-warning)', bg: 'var(--color-warning-bg)', icon: <AlertTriangle size={14} /> },
    info: { label: 'Info', color: 'var(--color-info)', bg: 'var(--color-info-bg)', icon: <Info size={14} /> },
    success: { label: 'Good', color: 'var(--color-success)', bg: 'var(--color-success-bg)', icon: <CheckCircle2 size={14} /> },
};

export default function AlertsPage() {
    const [alerts, setAlerts] = useState<Alert[]>(mockAlerts);
    const [filter, setFilter] = useState<FilterType>('all');
    const [tab, setTab] = useState<'alerts' | 'qr'>('alerts');

    const markAllRead = () => setAlerts(prev => prev.map(a => ({ ...a, read: true })));
    const markRead = (id: string) => setAlerts(prev => prev.map(a => a.id === id ? { ...a, read: true } : a));

    const filtered = alerts.filter(a => filter === 'all' || a.type === filter);
    const unreadCount = alerts.filter(a => !a.read).length;

    const counts = {
        all: alerts.length,
        danger: alerts.filter(a => a.type === 'danger').length,
        warning: alerts.filter(a => a.type === 'warning').length,
        info: alerts.filter(a => a.type === 'info').length,
        success: alerts.filter(a => a.type === 'success').length,
    };

    return (
        <div className={styles.page}>
            <GuardianHeader title="Alerts & Scan Log" subtitle="Ravi's safety monitoring feed" />
            <main className={styles.content}>
                {/* Summary chips */}
                <div className={styles.summaryRow}>
                    <div className={styles.summaryChip} style={{ borderColor: 'var(--color-danger)', background: 'var(--color-danger-bg)' }}>
                        <ShieldAlert size={16} color="var(--color-danger)" aria-hidden="true" />
                        <div>
                            <span className={styles.chipNum} style={{ color: 'var(--color-danger)' }}>{counts.danger}</span>
                            <span className={styles.chipLbl}>Critical</span>
                        </div>
                    </div>
                    <div className={styles.summaryChip} style={{ borderColor: 'var(--color-warning)', background: 'var(--color-warning-bg)' }}>
                        <AlertTriangle size={16} color="var(--color-warning)" aria-hidden="true" />
                        <div>
                            <span className={styles.chipNum} style={{ color: 'var(--color-warning)' }}>{counts.warning}</span>
                            <span className={styles.chipLbl}>Warnings</span>
                        </div>
                    </div>
                    <div className={styles.summaryChip} style={{ borderColor: 'var(--color-info)', background: 'var(--color-info-bg)' }}>
                        <Info size={16} color="var(--color-info)" aria-hidden="true" />
                        <div>
                            <span className={styles.chipNum} style={{ color: 'var(--color-info)' }}>{counts.info}</span>
                            <span className={styles.chipLbl}>Info</span>
                        </div>
                    </div>
                    <div className={styles.summaryChip} style={{ borderColor: 'var(--color-success)', background: 'var(--color-success-bg)' }}>
                        <CheckCircle2 size={16} color="var(--color-success)" aria-hidden="true" />
                        <div>
                            <span className={styles.chipNum} style={{ color: 'var(--color-success)' }}>{counts.success}</span>
                            <span className={styles.chipLbl}>Positive</span>
                        </div>
                    </div>
                    {unreadCount > 0 && (
                        <button className={styles.markAllBtn} onClick={markAllRead}>
                            <MailOpen size={14} aria-hidden="true" /> Mark all read
                        </button>
                    )}
                </div>

                {/* Tabs */}
                <div className={styles.tabs} role="tablist">
                    <button
                        className={`${styles.tab} ${tab === 'alerts' ? styles.tabActive : ''}`}
                        onClick={() => setTab('alerts')}
                        role="tab"
                        aria-selected={tab === 'alerts'}
                    >
                        <Bell size={14} aria-hidden="true" /> Alerts {unreadCount > 0 && <span className={styles.tabBadge}>{unreadCount}</span>}
                    </button>
                    <button
                        className={`${styles.tab} ${tab === 'qr' ? styles.tabActive : ''}`}
                        onClick={() => setTab('qr')}
                        role="tab"
                        aria-selected={tab === 'qr'}
                    >
                        <QrCode size={14} aria-hidden="true" /> QR Scan Log
                    </button>
                </div>

                {tab === 'alerts' && (
                    <>
                        {/* Filter bar */}
                        <div className={styles.filterBar}>
                            <Filter size={14} color="var(--text-muted)" aria-hidden="true" />
                            {(['all', 'danger', 'warning', 'info', 'success'] as FilterType[]).map(f => (
                                <button
                                    key={f}
                                    className={`${styles.filterBtn} ${filter === f ? styles.filterActive : ''}`}
                                    onClick={() => setFilter(f)}
                                    aria-pressed={filter === f}
                                    style={filter === f && f !== 'all' ? { background: TYPE_META[f]?.bg, color: TYPE_META[f]?.color, borderColor: 'transparent' } : {}}
                                >
                                    {f === 'all' ? `All (${counts.all})` : `${TYPE_META[f].label} (${counts[f]})`}
                                </button>
                            ))}
                        </div>

                        {/* Alerts list */}
                        <ul className={styles.alertsList} aria-label="Alerts list">
                            {filtered.map(alert => {
                                const meta = TYPE_META[alert.type];
                                return (
                                    <li
                                        key={alert.id}
                                        className={`${styles.alertItem} ${!alert.read ? styles.alertUnread : ''}`}
                                        style={{ borderLeft: `3px solid ${meta.color}` }}
                                    >
                                        <div className={styles.alertIcon} style={{ background: meta.bg, color: meta.color }}>
                                            {meta.icon}
                                        </div>
                                        <div className={styles.alertBody}>
                                            <div className={styles.alertTop}>
                                                <h3 className={styles.alertTitle}>{alert.title}</h3>
                                                <span className={styles.alertBadge} style={{ background: meta.bg, color: meta.color }}>
                                                    {meta.label}
                                                </span>
                                                {alert.source && <span className={styles.sourceBadge}>{SOURCE_LABELS[alert.source as keyof typeof SOURCE_LABELS]}</span>}
                                            </div>
                                            <p className={styles.alertDesc}>{alert.description}</p>
                                            <div className={styles.alertFooter}>
                                                <span className={styles.alertTime}>
                                                    {new Date(alert.timestamp).toLocaleString('en-IN', {
                                                        weekday: 'short', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit'
                                                    })}
                                                </span>
                                                {!alert.read && (
                                                    <button className={styles.readBtn} onClick={() => markRead(alert.id)}>
                                                        Mark read
                                                    </button>
                                                )}
                                            </div>
                                        </div>
                                        {!alert.read && <span className={styles.unreadDot} aria-label="Unread" />}
                                    </li>
                                );
                            })}
                        </ul>
                    </>
                )}

                {tab === 'qr' && (
                    <div className={styles.qrSection}>
                        <h2 className={styles.qrTitle}>QR Code Scan History</h2>
                        <p className={styles.qrDesc}>Every time Ravi's SaathiCare QR is scanned by a Good Samaritan or hospital.</p>
                        <div className={styles.qrTable}>
                            <div className={styles.qrTableHead}>
                                <span>Date & Time</span>
                                <span>Location</span>
                                <span>Scanned by</span>
                                <span>Note</span>
                            </div>
                            {mockQRScans.map(scan => (
                                <div key={scan.id} className={styles.qrTableRow}>
                                    <span className={styles.qrDate}>
                                        {new Date(scan.timestamp).toLocaleString('en-IN', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' })}
                                    </span>
                                    <span className={styles.qrLoc}>{scan.location}</span>
                                    <span className={styles.qrType}>{scan.scannerNote ? scan.scannerNote.slice(0, 15) + '...' : 'Unknown'}</span>
                                    <span className={styles.qrNote}>{scan.scannerNote || '—'}</span>
                                </div>
                            ))}
                        </div>
                    </div>
                )}
            </main>
        </div>
    );
}
