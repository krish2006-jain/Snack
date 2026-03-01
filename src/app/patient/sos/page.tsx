'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { Phone, MapPin, X } from 'lucide-react';
import styles from './sos.module.css';
import { useSession } from '@/lib/useSession';
import { apiFetch } from '@/lib/api';

interface SOSData {
    patient: { name: string; condition: string; address: string };
    guardian: { name: string; relationship: string; phone: string } | null;
    caretaker: { name: string; role: string; phone: string } | null;
}

function getInitials(name: string): string {
    return name
        .split(' ')
        .filter(Boolean)
        .slice(0, 2)
        .map((n) => n[0].toUpperCase())
        .join('');
}

export default function SOSPage() {
    const router = useRouter();
    const { user, token } = useSession();
    const [sosData, setSosData] = useState<SOSData | null>(null);

    useEffect(() => {
        if (!token) return;
        apiFetch<SOSData>('/api/sos-contacts')
            .then(setSosData)
            .catch(() => {
                // Fallback: use session name if API fails
                if (user) {
                    setSosData({
                        patient: { name: user.name ?? 'Patient', condition: "Alzheimer's Care", address: '' },
                        guardian: null,
                        caretaker: null,
                    });
                }
            });
    }, [token, user]);

    const handleCall = (phone: string) => {
        window.location.href = `tel:${phone}`;
    };

    const patientName = sosData?.patient?.name ?? user?.name ?? 'Patient';
    const patientCondition = sosData?.patient?.condition ?? "Alzheimer's Care";
    const patientAddress = sosData?.patient?.address ?? '';
    const initials = getInitials(patientName);

    return (
        <div className={styles.page} role="main" aria-label="SOS Emergency page">
            {/* Red ambient orb */}
            <div className={styles.redOrb} aria-hidden="true" />

            {/* Patient identity - so responder knows who they are helping */}
            <div className={styles.identityBlock}>
                <div className={styles.patientAvatar} aria-hidden="true">
                    <span className={styles.avatarInitials}>{initials}</span>
                </div>
                <h1 className={styles.patientName}>{patientName}</h1>
                <p className={styles.patientAge}>{patientCondition}</p>
            </div>

            {/* Location */}
            {patientAddress && (
                <div className={styles.locationBadge}>
                    <MapPin size={18} color="rgba(255,255,255,0.7)" aria-hidden="true" />
                    <span>{patientAddress}</span>
                </div>
            )}

            {/* CALL BUTTONS */}
            <section className={styles.callSection} aria-label="Emergency contacts">
                {sosData?.guardian && (
                    <button
                        className={styles.callBtn}
                        data-variant="primary"
                        onClick={() => handleCall(sosData.guardian!.phone)}
                        aria-label={`Call ${sosData.guardian.name}, ${sosData.guardian.relationship}`}
                    >
                        <Phone size={26} strokeWidth={2} aria-hidden="true" />
                        <span className={styles.callBtnContent}>
                            <span className={styles.callBtnName}>Call {sosData.guardian.name}</span>
                            <span className={styles.callBtnPhone}>
                                {sosData.guardian.phone || sosData.guardian.relationship}
                            </span>
                        </span>
                    </button>
                )}

                {sosData?.caretaker && (
                    <button
                        className={styles.callBtn}
                        data-variant="secondary"
                        onClick={() => handleCall(sosData.caretaker!.phone)}
                        aria-label={`Call ${sosData.caretaker.name}, ${sosData.caretaker.role}`}
                    >
                        <Phone size={26} strokeWidth={2} aria-hidden="true" />
                        <span className={styles.callBtnContent}>
                            <span className={styles.callBtnName}>Call {sosData.caretaker.name}</span>
                            <span className={styles.callBtnPhone}>{sosData.caretaker.role}</span>
                        </span>
                    </button>
                )}

                <button
                    className={styles.callBtn}
                    data-variant="emergency"
                    onClick={() => handleCall('112')}
                    aria-label="Call Emergency Services at 112"
                >
                    <Phone size={26} strokeWidth={2} aria-hidden="true" />
                    <span className={styles.callBtnContent}>
                        <span className={styles.callBtnName}>Call Emergency (112)</span>
                        <span className={styles.callBtnPhone}>National Emergency Line</span>
                    </span>
                </button>
            </section>

            {/* Cancel - I'm okay */}
            <button
                className={styles.cancelBtn}
                onClick={() => router.back()}
                aria-label="I am okay - go back"
            >
                <X size={20} aria-hidden="true" />
                I&apos;m okay - go back
            </button>
        </div>
    );
}
