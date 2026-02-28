'use client'

import { useState } from 'react'
import Link from 'next/link'
import { useRouter } from 'next/navigation'
import { User, Shield, Stethoscope, Eye, EyeOff, ChevronRight, AlertCircle } from 'lucide-react'
import { demoAccounts } from '@/lib/mock-data'
import type { CareRole } from '@/types'
import styles from './login.module.css'

const ROLES: {
    id: CareRole
    label: string
    desc: string
    icon: React.ReactNode
}[] = [
        {
            id: 'patient',
            label: 'Patient',
            desc: 'Access your schedule, memories, and companion',
            icon: <User size={20} aria-hidden="true" />,
        },
        {
            id: 'guardian',
            label: 'Guardian',
            desc: 'Manage care, view analytics, and QR identity',
            icon: <Shield size={20} aria-hidden="true" />,
        },
        {
            id: 'caretaker',
            label: 'Caretaker',
            desc: 'Log tasks, journal, and coordinate care',
            icon: <Stethoscope size={20} aria-hidden="true" />,
        },
    ]

const ROLE_REDIRECTS: Record<CareRole, string> = {
    patient: '/patient',
    guardian: '/guardian',
    caretaker: '/caretaker',
}

export default function LoginPage() {
    const router = useRouter()
    const [role, setRole] = useState<CareRole>('guardian')
    const [email, setEmail] = useState('')
    const [password, setPassword] = useState('')
    const [showPw, setShowPw] = useState(false)
    const [error, setError] = useState('')
    const [loading, setLoading] = useState(false)

    function fillDemo(selectedRole: CareRole) {
        const account = demoAccounts.find((a) => a.role === selectedRole)
        if (account) {
            setEmail(account.email)
            setPassword(account.password)
        }
        setRole(selectedRole)
        setError('')
    }

    async function handleSubmit(e: React.FormEvent) {
        e.preventDefault()
        setLoading(true)
        setError('')

        // Simulate auth delay
        await new Promise((r) => setTimeout(r, 700))

        const match = demoAccounts.find(
            (a) => a.email === email && a.password === password && a.role === role
        )

        if (!match) {
            setError('Incorrect email, password, or role. Try a demo account below.')
            setLoading(false)
            return
        }

        router.push(ROLE_REDIRECTS[role])
    }

    return (
        <div className={styles.page}>
            {/* bg orbs */}
            <div className="orb orb--bg-top-left" aria-hidden="true" />
            <div className="orb orb--bg-bottom-right" aria-hidden="true" />

            <div className={styles.container}>
                {/* Logo */}
                <Link href="/" className={styles.logo} aria-label="Back to homepage">
                    <span className={styles.logoSaathi}>SAATHI</span>
                    <span className={styles.logoCare}>Care</span>
                </Link>

                <main className={styles.card}>
                    <header className={styles.cardHeader}>
                        <h1 className={styles.cardTitle}>Sign in</h1>
                        <p className={styles.cardSubtitle}>Choose your role to continue</p>
                    </header>

                    {/* Role selector */}
                    <div className={styles.roleSelector} role="radiogroup" aria-label="Select your role">
                        {ROLES.map((r) => (
                            <button
                                key={r.id}
                                type="button"
                                role="radio"
                                aria-checked={role === r.id}
                                className={`${styles.roleCard} ${role === r.id ? styles.roleCardActive : ''}`}
                                onClick={() => fillDemo(r.id)}
                                id={`role-${r.id}`}
                            >
                                <span className={styles.roleIcon}>{r.icon}</span>
                                <span className={styles.roleInfo}>
                                    <span className={styles.roleLabel}>{r.label}</span>
                                    <span className={styles.roleDesc}>{r.desc}</span>
                                </span>
                                {role === r.id && (
                                    <span className={styles.roleCheck} aria-hidden="true">✓</span>
                                )}
                            </button>
                        ))}
                    </div>

                    {/* Form */}
                    <form onSubmit={handleSubmit} className={styles.form} noValidate>
                        <div className="form-group">
                            <label htmlFor="login-email" className="form-label">Email address</label>
                            <input
                                id="login-email"
                                type="email"
                                className="form-input"
                                placeholder="you@example.com"
                                value={email}
                                onChange={(e) => { setEmail(e.target.value); setError('') }}
                                required
                                autoComplete="email"
                            />
                        </div>

                        <div className="form-group">
                            <label htmlFor="login-password" className="form-label">Password</label>
                            <div className={styles.passwordWrap}>
                                <input
                                    id="login-password"
                                    type={showPw ? 'text' : 'password'}
                                    className={`form-input ${styles.passwordInput}`}
                                    placeholder="••••••••"
                                    value={password}
                                    onChange={(e) => { setPassword(e.target.value); setError('') }}
                                    required
                                    autoComplete="current-password"
                                />
                                <button
                                    type="button"
                                    className={styles.togglePw}
                                    onClick={() => setShowPw((v) => !v)}
                                    aria-label={showPw ? 'Hide password' : 'Show password'}
                                >
                                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                                </button>
                            </div>
                        </div>

                        {error && (
                            <div className={styles.errorBox} role="alert">
                                <AlertCircle size={15} aria-hidden="true" />
                                {error}
                            </div>
                        )}

                        <button
                            type="submit"
                            className={`btn btn--primary btn--full ${styles.submitBtn}`}
                            disabled={loading}
                            id="login-submit"
                        >
                            {loading ? (
                                <span className={styles.spinner} aria-label="Signing in…" />
                            ) : (
                                <>
                                    Sign in as {ROLES.find((r) => r.id === role)?.label}
                                    <ChevronRight size={18} aria-hidden="true" />
                                </>
                            )}
                        </button>
                    </form>

                    {/* Demo accounts */}
                    <section className={styles.demoSection} aria-labelledby="demo-heading">
                        <h2 id="demo-heading" className={styles.demoTitle}>Demo accounts</h2>
                        <div className={styles.demoAccounts}>
                            {demoAccounts.map((acc) => (
                                <button
                                    key={acc.role}
                                    type="button"
                                    className={styles.demoAccount}
                                    onClick={() => fillDemo(acc.role)}
                                    aria-label={`Fill ${acc.role} demo credentials`}
                                >
                                    <span className={styles.demoRole}>{acc.role}</span>
                                    <span className={styles.demoEmail}>{acc.email}</span>
                                </button>
                            ))}
                        </div>
                        <p className={styles.demoPassword}>All passwords: <code>demo123</code></p>
                    </section>

                    {/* Register link */}
                    <p className={styles.registerLink}>
                        New to SaathiCare?{' '}
                        <Link href="/register" className={styles.link} id="login-register-link">
                            Create an account
                        </Link>
                    </p>
                </main>
            </div>
        </div>
    )
}
