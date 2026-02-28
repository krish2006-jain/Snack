'use client';

import { useRouter } from 'next/navigation';
import { Phone, MapPin, X } from 'lucide-react';
import styles from './sos.module.css';
import { mockPatient, mockGuardian, mockCaretaker } from '@/lib/mock-data/patient';

export default function SOSPage() {
    const router = useRouter();

    const handleCall = (name: string, phone: string) => {
        // In production: initiate call via tel: URI
        window.location.href = `tel:${phone}`;
    };

    return (
        <div className={styles.page} role="main" aria-label="SOS Emergency page">
            {/* Red ambient orb */}
            <div className={styles.redOrb} aria-hidden="true" />

            {/* Patient identity — so responder knows who they are helping */}
            <div className={styles.identityBlock}>
                <div className={styles.patientAvatar} aria-hidden="true">
                    <span className={styles.avatarInitials}>RS</span>
                </div>
                <h1 className={styles.patientName}>{mockPatient.name}</h1>
                <p className={styles.patientAge}>Age {mockPatient.age} — {mockPatient.condition}</p>
            </div>

            {/* Location */}
            <div className={styles.locationBadge}>
                <MapPin size={18} color="rgba(255,255,255,0.7)" aria-hidden="true" />
                <span>{mockPatient.location}</span>
            </div>

            {/* CALL BUTTONS */}
            <section className={styles.callSection} aria-label="Emergency contacts">
                <button
                    className={styles.callBtn}
                    data-variant="primary"
                    onClick={() => handleCall(mockGuardian.name, mockGuardian.phone)}
                    aria-label={`Call ${mockGuardian.name}, ${mockGuardian.relationship}`}
                >
                    <Phone size={26} strokeWidth={2} aria-hidden="true" />
                    <span className={styles.callBtnContent}>
                        <span className={styles.callBtnName}>Call Priya (Daughter)</span>
                        <span className={styles.callBtnPhone}>{mockGuardian.phone}</span>
                    </span>
                </button>

                <button
                    className={styles.callBtn}
                    data-variant="secondary"
                    onClick={() => handleCall(mockCaretaker.name, mockCaretaker.phone)}
                    aria-label={`Call ${mockCaretaker.name}, ${mockCaretaker.role}`}
                >
                    <Phone size={26} strokeWidth={2} aria-hidden="true" />
                    <span className={styles.callBtnContent}>
                        <span className={styles.callBtnName}>Call Nurse Anita</span>
                        <span className={styles.callBtnPhone}>{mockCaretaker.phone}</span>
                    </span>
                </button>

                <button
                    className={styles.callBtn}
                    data-variant="emergency"
                    onClick={() => handleCall('Emergency', '112')}
                    aria-label="Call Emergency Services at 112"
                >
                    <Phone size={26} strokeWidth={2} aria-hidden="true" />
                    <span className={styles.callBtnContent}>
                        <span className={styles.callBtnName}>Call Emergency (112)</span>
                        <span className={styles.callBtnPhone}>National Emergency Line</span>
                    </span>
                </button>
            </section>

            {/* Cancel — I'm okay */}
            <button
                className={styles.cancelBtn}
                onClick={() => router.back()}
                aria-label="I am okay — go back"
            >
                <X size={20} aria-hidden="true" />
                I&apos;m okay — go back
            </button>
        </div>
    );
}
