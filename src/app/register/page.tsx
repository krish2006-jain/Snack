'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { Check, ChevronRight, User, Phone, MapPin, Heart, AlertCircle } from 'lucide-react'
import styles from './register.module.css'

interface Step1Data {
    name: string
    email: string
    phone: string
    password: string
    relation: string
}

interface Step2Data {
    patientName: string
    patientAge: string
    address: string
    bloodType: string
    conditions: string
    medications: string
    allergies: string
}

const BLOOD_TYPES = ['A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-']
const RELATIONS = ['Daughter', 'Son', 'Spouse', 'Parent', 'Sibling', 'Other']

export default function RegisterPage() {
    const router = useRouter()
    const [step, setStep] = useState(1)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    const [step1, setStep1] = useState<Step1Data>({
        name: '',
        email: '',
        phone: '',
        password: '',
        relation: 'Daughter',
    })

    const [step2, setStep2] = useState<Step2Data>({
        patientName: '',
        patientAge: '',
        address: '',
        bloodType: 'B+',
        conditions: '',
        medications: '',
        allergies: '',
    })

    function update1(field: keyof Step1Data, value: string) {
        setStep1((s) => ({ ...s, [field]: value }))
        setError('')
    }

    function update2(field: keyof Step2Data, value: string) {
        setStep2((s) => ({ ...s, [field]: value }))
        setError('')
    }

    function validateStep1() {
        if (!step1.name.trim()) return 'Please enter your name'
        if (!step1.email.includes('@')) return 'Enter a valid email'
        if (step1.phone.length < 10) return 'Enter a valid phone number'
        if (step1.password.length < 6) return 'Password must be at least 6 characters'
        return ''
    }

    function validateStep2() {
        if (!step2.patientName.trim()) return "Enter the patient's name"
        if (!step2.patientAge || +step2.patientAge < 1) return 'Enter a valid age'
        if (!step2.address.trim()) return 'Enter an address'
        return ''
    }

    function handleStep1(e: React.FormEvent) {
        e.preventDefault()
        const err = validateStep1()
        if (err) { setError(err); return }
        setStep(2)
        setError('')
    }

    async function handleStep2(e: React.FormEvent) {
        e.preventDefault()
        const err = validateStep2()
        if (err) { setError(err); return }
        setLoading(true)
        await new Promise((r) => setTimeout(r, 900))
        // mock success
        router.push('/guardian')
    }

    const stepDefs = [
        { num: 1, label: 'Your info' },
        { num: 2, label: 'Patient profile' },
    ]

    return (
        <div className={styles.page}>
            <div className="orb orb--bg-top-left" aria-hidden="true" />
            <div className="orb orb--bg-bottom-right" aria-hidden="true" />

            <div className={styles.container}>
                <Link href="/" className={styles.logo} aria-label="Back to homepage">
                    <span className={styles.logoSaathi}>SAATHI</span>
                    <span className={styles.logoCare}>Care</span>
                </Link>

                <main className={styles.card}>
                    {/* Step indicator */}
                    <div className={styles.stepIndicator} role="progressbar" aria-valuenow={step} aria-valuemin={1} aria-valuemax={2} aria-label={`Step ${step} of 2`}>
                        {stepDefs.map((s, i) => (
                            <div key={s.num} className={styles.stepGroup}>
                                <div className={`${styles.stepCircle} ${step > s.num ? styles.stepDone : step === s.num ? styles.stepActive : styles.stepFuture}`}>
                                    {step > s.num ? <Check size={14} aria-hidden="true" /> : s.num}
                                </div>
                                <span className={`${styles.stepLabel} ${step === s.num ? styles.stepLabelActive : ''}`}>
                                    {s.label}
                                </span>
                                {i < stepDefs.length - 1 && (
                                    <div className={`${styles.stepLine} ${step > s.num ? styles.stepLineDone : ''}`} aria-hidden="true" />
                                )}
                            </div>
                        ))}
                    </div>

                    {step === 1 && (
                        <>
                            <header className={styles.cardHeader}>
                                <h1 className={styles.cardTitle}>Create your account</h1>
                                <p className={styles.cardSubtitle}>
                                    You're the guardian — the person managing Ravi's care.
                                </p>
                            </header>

                            <form onSubmit={handleStep1} className={styles.form} noValidate>
                                <div className={styles.formRow}>
                                    <div className="form-group">
                                        <label htmlFor="reg-name" className="form-label">
                                            <User size={13} aria-hidden="true" /> Your full name
                                        </label>
                                        <input
                                            id="reg-name"
                                            type="text"
                                            className="form-input"
                                            placeholder="Priya Sharma"
                                            value={step1.name}
                                            onChange={(e) => update1('name', e.target.value)}
                                            required
                                            autoComplete="name"
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reg-relation" className="form-label">
                                            Relation to patient
                                        </label>
                                        <select
                                            id="reg-relation"
                                            className="form-select"
                                            value={step1.relation}
                                            onChange={(e) => update1('relation', e.target.value)}
                                        >
                                            {RELATIONS.map((r) => (
                                                <option key={r} value={r}>{r}</option>
                                            ))}
                                        </select>
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-email" className="form-label">Email address</label>
                                    <input
                                        id="reg-email"
                                        type="email"
                                        className="form-input"
                                        placeholder="priya@example.com"
                                        value={step1.email}
                                        onChange={(e) => update1('email', e.target.value)}
                                        required
                                        autoComplete="email"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-phone" className="form-label">
                                        <Phone size={13} aria-hidden="true" /> Phone number
                                    </label>
                                    <input
                                        id="reg-phone"
                                        type="tel"
                                        className="form-input"
                                        placeholder="+91 98765 43210"
                                        value={step1.phone}
                                        onChange={(e) => update1('phone', e.target.value)}
                                        required
                                        autoComplete="tel"
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-password" className="form-label">Create a password</label>
                                    <input
                                        id="reg-password"
                                        type="password"
                                        className="form-input"
                                        placeholder="Min. 6 characters"
                                        value={step1.password}
                                        onChange={(e) => update1('password', e.target.value)}
                                        required
                                        autoComplete="new-password"
                                    />
                                </div>

                                {error && (
                                    <div className={styles.errorBox} role="alert">
                                        <AlertCircle size={15} aria-hidden="true" />
                                        {error}
                                    </div>
                                )}

                                <button
                                    type="submit"
                                    className="btn btn--primary btn--full"
                                    style={{ height: 50 }}
                                    id="reg-step1-submit"
                                >
                                    Continue
                                    <ChevronRight size={18} aria-hidden="true" />
                                </button>
                            </form>
                        </>
                    )}

                    {step === 2 && (
                        <>
                            <header className={styles.cardHeader}>
                                <h1 className={styles.cardTitle}>Patient profile</h1>
                                <p className={styles.cardSubtitle}>
                                    Help us understand who you're caring for. This powers the QR identity.
                                </p>
                            </header>

                            <form onSubmit={handleStep2} className={styles.form} noValidate>
                                <div className={styles.formRow}>
                                    <div className="form-group">
                                        <label htmlFor="reg-pname" className="form-label">
                                            <Heart size={13} aria-hidden="true" /> Patient's full name
                                        </label>
                                        <input
                                            id="reg-pname"
                                            type="text"
                                            className="form-input"
                                            placeholder="Ravi Sharma"
                                            value={step2.patientName}
                                            onChange={(e) => update2('patientName', e.target.value)}
                                            required
                                        />
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reg-page" className="form-label">Age</label>
                                        <input
                                            id="reg-page"
                                            type="number"
                                            className="form-input"
                                            placeholder="72"
                                            min="1"
                                            max="120"
                                            value={step2.patientAge}
                                            onChange={(e) => update2('patientAge', e.target.value)}
                                            required
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-address" className="form-label">
                                        <MapPin size={13} aria-hidden="true" /> Home address
                                    </label>
                                    <input
                                        id="reg-address"
                                        type="text"
                                        className="form-input"
                                        placeholder="Sector 15, Noida, UP 201301"
                                        value={step2.address}
                                        onChange={(e) => update2('address', e.target.value)}
                                        required
                                    />
                                </div>

                                <div className={styles.formRow}>
                                    <div className="form-group">
                                        <label htmlFor="reg-blood" className="form-label">Blood type</label>
                                        <select
                                            id="reg-blood"
                                            className="form-select"
                                            value={step2.bloodType}
                                            onChange={(e) => update2('bloodType', e.target.value)}
                                        >
                                            {BLOOD_TYPES.map((b) => <option key={b} value={b}>{b}</option>)}
                                        </select>
                                    </div>
                                    <div className="form-group">
                                        <label htmlFor="reg-allergies" className="form-label">Allergies</label>
                                        <input
                                            id="reg-allergies"
                                            type="text"
                                            className="form-input"
                                            placeholder="Penicillin, Sulfa drugs…"
                                            value={step2.allergies}
                                            onChange={(e) => update2('allergies', e.target.value)}
                                        />
                                    </div>
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-conditions" className="form-label">Medical conditions</label>
                                    <input
                                        id="reg-conditions"
                                        type="text"
                                        className="form-input"
                                        placeholder="Alzheimer's, Hypertension…"
                                        value={step2.conditions}
                                        onChange={(e) => update2('conditions', e.target.value)}
                                    />
                                </div>

                                <div className="form-group">
                                    <label htmlFor="reg-meds" className="form-label">Current medications</label>
                                    <input
                                        id="reg-meds"
                                        type="text"
                                        className="form-input"
                                        placeholder="Donepezil 10mg, Amlodipine 5mg…"
                                        value={step2.medications}
                                        onChange={(e) => update2('medications', e.target.value)}
                                    />
                                </div>

                                {error && (
                                    <div className={styles.errorBox} role="alert">
                                        <AlertCircle size={15} aria-hidden="true" />
                                        {error}
                                    </div>
                                )}

                                <div className={styles.formActions}>
                                    <button
                                        type="button"
                                        className="btn btn--ghost"
                                        onClick={() => { setStep(1); setError('') }}
                                        id="reg-back"
                                    >
                                        Back
                                    </button>
                                    <button
                                        type="submit"
                                        className="btn btn--primary"
                                        disabled={loading}
                                        style={{ flex: 1, height: 50 }}
                                        id="reg-step2-submit"
                                    >
                                        {loading ? (
                                            <span className={styles.spinner} aria-label="Creating account…" />
                                        ) : (
                                            <>
                                                Create account
                                                <ChevronRight size={18} aria-hidden="true" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}

                    <p className={styles.loginLink}>
                        Already have an account?{' '}
                        <Link href="/login" className={styles.link} id="reg-login-link">
                            Sign in
                        </Link>
                    </p>
                </main>
            </div>
        </div>
    )
}
