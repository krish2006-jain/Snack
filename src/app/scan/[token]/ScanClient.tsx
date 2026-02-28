'use client'

import Link from 'next/link'
import {
    Phone, MessageCircle, MapPin, AlertTriangle, ShieldAlert,
    Droplet, Pill, HeartPulse, ChevronLeft, ExternalLink
} from 'lucide-react'
import type { QRProfile } from '@/types'
import styles from './scan.module.css'

interface Props {
    profile: QRProfile | null
    token: string
}

export default function ScanClient({ profile, token }: Props) {
    if (!profile) {
        return (
            <div className={styles.page}>
                <div className={styles.notFound}>
                    <ShieldAlert size={48} className={styles.notFoundIcon} aria-hidden="true" />
                    <h1 className={styles.notFoundTitle}>QR code not found</h1>
                    <p className={styles.notFoundDesc}>
                        This QR code may be inactive or invalid. If you found a person in distress,
                        please call emergency services immediately.
                    </p>
                    <a href="tel:112" className={`btn btn--danger btn--pill btn--lg ${styles.emergencyBtn}`}>
                        <Phone size={18} aria-hidden="true" />
                        Call Emergency (112)
                    </a>
                </div>
            </div>
        )
    }

    const { patient, emergencyContacts, careInstructions } = profile
    const primaryContact = emergencyContacts.find((c) => c.isPrimary)
    const secondaryContacts = emergencyContacts.filter((c) => !c.isPrimary)

    function shareLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    const url = `https://maps.google.com/?q=${latitude},${longitude}`
                    if (navigator.share) {
                        navigator.share({ title: `Location of ${patient.name}`, url })
                    } else {
                        window.open(url, '_blank')
                    }
                },
                () => alert('Location access denied. Please enable location permissions.')
            )
        }
    }

    return (
        <div className={styles.page}>
            {/* bg orbs */}
            <div className="orb orb--bg-top-left" aria-hidden="true" />

            <main className={styles.card} role="main">
                {/* Header */}
                <div className={styles.cardHeader}>
                    <div className={styles.saathiBranding}>
                        <span className={styles.brandSaathi}>SAATHI</span>
                        <span className={styles.brandCare}>Care</span>
                        <span className={styles.brandTag}>Emergency Profile</span>
                    </div>
                </div>

                {/* Patient identity */}
                <section className={styles.identity} aria-labelledby="patient-name">
                    <div className={styles.patientPhoto} aria-hidden="true">
                        {patient.name.split(' ').map((n) => n[0]).join('')}
                    </div>
                    <div className={styles.identityInfo}>
                        <h1 id="patient-name" className={styles.patientName}>{patient.name}</h1>
                        <p className={styles.patientMeta}>
                            {patient.age} years old · {patient.address.split(',')[0]}
                        </p>
                        <div className={styles.conditionBadge}>
                            <HeartPulse size={13} aria-hidden="true" />
                            {patient.careStage.charAt(0).toUpperCase() + patient.careStage.slice(1)} Alzheimer's
                        </div>
                    </div>
                </section>

                {/* Medical summary */}
                <section className={styles.medSection} aria-labelledby="medical-heading">
                    <h2 id="medical-heading" className={styles.sectionHeading}>
                        Medical Information
                    </h2>
                    <div className={styles.medGrid}>
                        <div className={styles.medField}>
                            <div className={styles.medLabel}>
                                <Droplet size={12} aria-hidden="true" /> Blood Type
                            </div>
                            <div className={styles.medValue}>{patient.bloodType}</div>
                        </div>
                        <div className={styles.medField}>
                            <div className={styles.medLabel}>
                                <AlertTriangle size={12} aria-hidden="true" /> Allergies
                            </div>
                            <div className={styles.medValue}>
                                {patient.allergies.length > 0
                                    ? patient.allergies.join(', ')
                                    : 'None known'}
                            </div>
                        </div>
                        <div className={`${styles.medField} ${styles.medFieldFull}`}>
                            <div className={styles.medLabel}>
                                <HeartPulse size={12} aria-hidden="true" /> Conditions
                            </div>
                            <div className={styles.medValue}>{patient.conditions.join(' · ')}</div>
                        </div>
                        <div className={`${styles.medField} ${styles.medFieldFull}`}>
                            <div className={styles.medLabel}>
                                <Pill size={12} aria-hidden="true" /> Current Medications
                            </div>
                            <div className={styles.medValue}>{patient.medications.join(', ')}</div>
                        </div>
                    </div>
                </section>

                {/* Care instructions */}
                <section className={styles.careSection} aria-labelledby="care-heading">
                    <h2 id="care-heading" className={styles.sectionHeading}>
                        <ShieldAlert size={16} aria-hidden="true" />
                        How to help right now
                    </h2>
                    <div className={styles.careCard}>
                        <p className={styles.careText}>{careInstructions}</p>
                    </div>
                </section>

                {/* Emergency contacts */}
                <section className={styles.contactSection} aria-labelledby="contacts-heading">
                    <h2 id="contacts-heading" className={styles.sectionHeading}>
                        Emergency Contacts
                    </h2>
                    {primaryContact && (
                        <a
                            href={`tel:${primaryContact.phone}`}
                            className={styles.callButtonPrimary}
                            aria-label={`Call ${primaryContact.name}, ${primaryContact.relation}`}
                        >
                            <span className={styles.contactInfo}>
                                <span className={styles.contactName}>{primaryContact.name}</span>
                                <span className={styles.contactRel}>{primaryContact.relation} · Primary</span>
                            </span>
                            <span className={styles.callIcon}>
                                <Phone size={20} aria-hidden="true" />
                            </span>
                        </a>
                    )}
                    {secondaryContacts.map((c) => (
                        <a
                            key={c.id}
                            href={`tel:${c.phone}`}
                            className={styles.callButtonSecondary}
                            aria-label={`Call ${c.name}, ${c.relation}`}
                        >
                            <span className={styles.contactInfo}>
                                <span className={styles.contactName}>{c.name}</span>
                                <span className={styles.contactRel}>{c.relation}</span>
                            </span>
                            <Phone size={18} className={styles.callIconSecondary} aria-hidden="true" />
                        </a>
                    ))}
                </section>

                {/* Location */}
                <div className={styles.locationRow}>
                    <MapPin size={15} className={styles.locationIcon} aria-hidden="true" />
                    <span className={styles.locationText}>{patient.address}</span>
                </div>

                {/* Action buttons */}
                <div className={styles.actionButtons}>
                    <Link
                        href={`/scan/${token}/chat`}
                        className={`btn btn--primary btn--full ${styles.actionBtn}`}
                        id="scan-chat-btn"
                    >
                        <MessageCircle size={18} aria-hidden="true" />
                        Chat with Family
                    </Link>

                    <button
                        type="button"
                        className={`btn btn--secondary btn--full ${styles.actionBtn}`}
                        onClick={shareLocation}
                        id="scan-location-btn"
                    >
                        <MapPin size={18} aria-hidden="true" />
                        Share My Location
                    </button>

                    <a
                        href="tel:112"
                        className={`btn btn--danger btn--full ${styles.actionBtn}`}
                        id="scan-emergency-btn"
                    >
                        <AlertTriangle size={18} aria-hidden="true" />
                        Call Emergency (112)
                    </a>
                </div>

                <p className={styles.scanFooter}>
                    <ExternalLink size={12} aria-hidden="true" />
                    Powered by SaathiCare · This information is shown only when this QR code is scanned
                </p>
            </main>
        </div>
    )
}
