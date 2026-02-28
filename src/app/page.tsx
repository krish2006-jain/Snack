'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  QrCode, Brain, Layers, Users, ScanLine, HeartHandshake,
  Stethoscope, Shield, Play, ChevronRight, Heart, MapPin,
  Smartphone, Clock
} from 'lucide-react'
import styles from './landing.module.css'

function useScrollReveal() {
  useEffect(() => {
    const observer = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('revealed')
            observer.unobserve(entry.target)
          }
        })
      },
      { threshold: 0.1, rootMargin: '0px 0px -50px 0px' }
    )

    document.querySelectorAll('.reveal, .reveal-left, .reveal-right, .reveal-scale').forEach((el) => {
      observer.observe(el)
    })

    return () => observer.disconnect()
  }, [])
}

export default function LandingPage() {
  const [scrolled, setScrolled] = useState(false)

  // Apply scroll reveals
  useScrollReveal()

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 40)
    window.addEventListener('scroll', handleScroll, { passive: true })
    return () => window.removeEventListener('scroll', handleScroll)
  }, [])

  return (
    <div className={styles.page}>
      {/* ── Floating Nav ── */}
      <nav
        className={`${styles.nav} ${scrolled ? styles.navScrolled : ''}`}
        role="navigation"
        aria-label="Main navigation"
      >
        <div className={styles.navInner}>
          <Link href="/" className={styles.navLogo} aria-label="SaathiCare home">
            <Image src="/images/Logo.png" alt="SaathiCare logo" width={24} height={24} className={styles.navLogoImage} />
            <span className={styles.navLogoSaathi}>SAATHI</span>
            <span className={styles.navLogoCare}>Care</span>
          </Link>
          <div className={styles.navLinks}>
            <a href="#how-it-works" className={styles.navLink}>How It Works</a>
            <a href="#features" className={styles.navLink}>Platform</a>
            <a href="#about" className={styles.navLink}>About</a>
          </div>
          <Link href="/login" className={`btn btn--secondary btn--pill btn--sm ${styles.navCta}`}>
            See the Demo
          </Link>
        </div>
      </nav>

      {/* ── Main canvas ── */}
      <div className={styles.pageInner}>
        <div className={`${styles.canvas} page-enter`}>

          {/* ── HERO ── */}
          <section className={styles.hero} aria-labelledby="hero-heading">
            <div className={styles.heroBackground}>
              <Image 
                src="/images/Hero Section Background.png" 
                alt="Hero background" 
                fill 
                className={styles.heroBgImage}
                priority
              />
            </div>
            <div className={styles.heroLeft}>
                <h1 id="hero-heading" className={`${styles.heroHeading} reveal`}>
                <span className={styles.heroLine1}>When Ravi forgets</span>
                <span className={styles.heroLine1}>the way home—</span>
                <span className={styles.heroLine2}>
                  anyone with a phone can help.
                </span>
              </h1>
              <p className={`${styles.heroLead} reveal animate-delay-1`}>
                A wearable QR bracelet that turns any stranger into a first responder.
                AI-powered memory therapy that learns from your family&apos;s real history.
              </p>
              <div className={`${styles.heroCtas} reveal animate-delay-2`}>
                <Link
                  href="#how-it-works"
                  className="btn btn--primary btn--pill btn--lg"
                  id="hero-cta-primary"
                >
                  See How It Works
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="btn btn--secondary btn--pill btn--lg"
                  id="hero-cta-demo"
                >
                  <Play size={16} aria-hidden="true" />
                  Watch Demo
                </Link>
              </div>
            </div>

            <div className={`${styles.heroRight} reveal-right`}>
              <div className={styles.statCard}>
                <div className={styles.statCardTop}>
                  <div className={styles.statNumber}>200+</div>
                  <div className={styles.statLabel}>Families Protected</div>
                </div>
                <div className={styles.avatarStack} aria-label="5 sample families protected">
                  {['P', 'R', 'A', 'S', 'V'].map((initial, i) => (
                    <div key={i} className={styles.avatar} style={{ zIndex: 5 - i }}>
                      {initial}
                    </div>
                  ))}
                  <span className={styles.avatarMore}>+195</span>
                </div>
                <div className={styles.statNote}>
                  <Heart size={14} color="var(--color-danger)" fill="var(--color-danger)" aria-hidden="true" />
                  Active QR bracelets across India
                </div>
              </div>

              <div className={styles.miniStatsContainer}>
                <div className={`${styles.miniStat} animate-slide-up animate-delay-3`}>
                  <MapPin size={16} className={styles.miniStatIcon} aria-hidden="true" />
                  <div>
                    <div className={styles.miniStatValue}>48hr</div>
                    <div className={styles.miniStatLabel}>Setup time</div>
                  </div>
                </div>

                <div className={`${styles.miniStat} animate-slide-up animate-delay-4`}>
                  <Smartphone size={16} className={styles.miniStatIcon} aria-hidden="true" />
                  <div>
                    <div className={styles.miniStatValue}>0 apps</div>
                    <div className={styles.miniStatLabel}>Needed to scan</div>
                  </div>
                </div>
              </div>
            </div>
          </section>

          {/* ── Trust Rules ── */}
          <div className={`${styles.trustRow} reveal`} role="list" aria-label="Key platform features">
            {[
              'Free for Indian Families',
              'No Cloud Lock-in',
              'Voice-First Elderly Design',
              'QR Works on Any phone',
            ].map((label) => (
              <div key={label} className={styles.trustPill} role="listitem">
                {label}
              </div>
            ))}
          </div>

          {/* ── VALUE SECTION ── */}
          <section id="features" className={styles.valueSection} aria-labelledby="value-heading">
            <div className={styles.valueLeft}>
              <div className="reveal">
                <p className={styles.sectionLabel}>Why SaathiCare</p>
                <h2 id="value-heading" className={styles.sectionTitle}>
                  Built for emergencies,<br />
                  <span className={styles.sectionTitleSerif}>
                    not just metrics.
                  </span>
                </h2>
              </div>

              <div className={styles.featureGrid}>
                <article className={`${styles.featureCardFeatured} reveal-scale`}>
                  <QrCode size={28} className={styles.featureIcon} aria-hidden="true" />
                  <h3 className={styles.featureCardTitle}>QR Emergency Identity</h3>
                  <p className={styles.featureCardDesc}>
                    Any phone, any stranger, zero app install. A simple scan of Ravi&apos;s bracelet
                    opens his full medical profile and shares Priya&apos;s contact number.
                  </p>
                  <div>
                    <span className={styles.featureCardTag}>Core Architecture</span>
                  </div>
                </article>

                <article className={`${styles.featureCard} reveal-left`}>
                  <Brain size={24} className={styles.featureIcon} aria-hidden="true" />
                  <h3 className={styles.featureCardTitle}>AI Memory Companion</h3>
                  <p className={styles.featureCardDesc}>
                    Saathi learns from your family&apos;s real stories — gently helping
                    Ravi remember them, one photo and voice note at a time.
                  </p>
                </article>

                <article className={`${styles.featureCard} reveal-left animate-delay-1`}>
                  <Layers size={24} className={styles.featureIcon} aria-hidden="true" />
                  <h3 className={styles.featureCardTitle}>Spatial Memory Therapy</h3>
                  <p className={styles.featureCardDesc}>
                    An interactive 2D home setting Ravi can explore — each object holds a
                    memory, anchored to a familiar physical location.
                  </p>
                </article>
              </div>
            </div>

            {/* Stats panel */}
            <aside className={`${styles.statsPanel} reveal-right`} aria-label="Platform statistics">
              <div className={styles.statsPanelHeader}>
                <h3 className={styles.statsPanelTitle}>Real outcomes</h3>
              </div>

              <div className={styles.statsPanelList}>
                {[
                  { value: '500+', label: 'Successful stranger scans', accent: 'primary' },
                  { value: '92%', label: 'Memory therapy completion', accent: 'success' },
                  { value: '48hr', label: 'Average family setup time', accent: 'warning' },
                ].map(({ value, label, accent }) => (
                  <div key={value} className={styles.statRow}>
                    <span className={styles.statRowValue} data-accent={accent}>{value}</span>
                    <span className={styles.statRowLabel}>{label}</span>
                  </div>
                ))}
              </div>

              <div className={styles.statsPanelFooter}>
                <Shield size={14} aria-hidden="true" />
                Local-first architecture. No tracking.
              </div>
            </aside>
          </section>

          {/* ── SPECIALIZATIONS ── */}
          <section
            id="how-it-works"
            className={`${styles.rolesSection} reveal`}
            aria-labelledby="roles-heading"
          >
            <div className="reveal">
              <p className={styles.sectionLabel}>Care Ecosystem</p>
              <h2 id="roles-heading" className={styles.sectionTitle}>
                Four roles.<br />
                <span className={styles.sectionTitleSerif}>One unified platform.</span>
              </h2>
            </div>

            <div className={styles.rolesGrid}>
              {[
                {
                  icon: <HeartHandshake size={22} aria-hidden="true" />,
                  title: 'Patient Interface',
                  desc: 'Large typography, simple high-contrast navigation, and voice-first interaction models. Designed to be accessible, never confusing.',
                  delay: '',
                },
                {
                  icon: <ScanLine size={22} aria-hidden="true" />,
                  title: 'Guardian Command',
                  desc: 'Full oversight dashboard. Track Ravi\'s cognitive score, edit his curated memories, set his schedule, and manage alerts.',
                  delay: 'stagger-2',
                },
                {
                  icon: <Stethoscope size={22} aria-hidden="true" />,
                  title: 'Caretaker Mobile',
                  desc: 'Shift-ready mobile view. Log medications accurately, write observation notes, and seamlessly hand off to the next shift.',
                  delay: 'stagger-3',
                },
                {
                  icon: <Users size={22} aria-hidden="true" />,
                  title: 'Good Samaritan',
                  desc: 'No account. No app. Just scan the emergency QR code, securely view who to call, and chat live with the family.',
                  delay: 'stagger-4',
                },
              ].map((role) => (
                <article
                  key={role.title}
                  className={`${styles.roleCard} reveal-scale ${role.delay}`}
                >
                  <div className={styles.roleIconWrap}>
                    {role.icon}
                    <span className={styles.roleTitle}>{role.title}</span>
                  </div>
                  <p className={styles.roleDesc}>{role.desc}</p>
                </article>
              ))}
            </div>
          </section>

          {/* ── FINAL CTA ── */}
          <section className={`${styles.ctaSection} reveal`} aria-labelledby="cta-heading">
            <div className={styles.ctaGlass}>
              <h2 id="cta-heading" className={styles.ctaTitle}>
                Protect your family.
              </h2>
              <p className={styles.ctaSubtitle}>
                Set up QR identity protection and memory therapy in under 5 minutes.
                Running locally for complete privacy.
              </p>
              <div className={styles.ctaButtons}>
                <Link
                  href="/register"
                  className="btn btn--primary btn--xl btn--pill"
                >
                  Start Configuration
                  <ChevronRight size={20} aria-hidden="true" />
                </Link>
                <Link
                  href="/scan/ravi-sharma-2024"
                  className="btn btn--secondary btn--pill btn--lg"
                >
                  <QrCode size={18} aria-hidden="true" />
                  Try Demo Scan
                </Link>
              </div>
              <p className={styles.ctaNote}>
                <Clock size={13} aria-hidden="true" />
                Requires zero technical knowledge · Works on iOS & Android
              </p>
            </div>
          </section>
        </div>

        {/* ── FOOTER ── */}
        <footer className={`${styles.footer} reveal`} role="contentinfo">
          <div className={styles.footerInner}>
            <div className={styles.footerLogo}>
              <span className={styles.footerLogoSaathi}>Saathi</span>
              <span className={styles.footerLogoCare}>Care</span>
            </div>
            <p className={styles.footerTagline}>
              Because every elder deserves to be found.
            </p>
            <nav className={styles.footerLinks} aria-label="Footer navigation">
              <Link href="/login" className={styles.footerLink}>Login</Link>
              <Link href="/register" className={styles.footerLink}>Register</Link>
              <Link href="/scan/ravi-sharma-2024" className={styles.footerLink}>Demo QR Scan</Link>
            </nav>
            <p className={styles.footerCopy}>
              © 2026 SaathiCare Platform · Built with care
            </p>
          </div>
        </footer>
      </div>
    </div>
  )
}
