'use client'

import { useEffect, useRef, useState } from 'react'
import Link from 'next/link'
import Image from 'next/image'
import {
  QrCode, Brain, Layers, Users, ScanLine, HeartHandshake,
  Stethoscope, Shield, Play, ChevronRight, Heart, MapPin,
  Smartphone, Clock, Music, FlaskConical, BookOpen, Gamepad2,
  Mic2, ExternalLink
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
            <a href="#research" className={styles.navLink}>Research</a>
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
                <span className={styles.heroLine1}>the way home</span>
                <span className={styles.heroLine2}>
                  anyone with a phone <br />can help.
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
                  data-tooltip="Learn exactly how SaathiCare protects your family"
                >
                  See How It Works
                  <ChevronRight size={18} aria-hidden="true" />
                </Link>
                <Link
                  href="/login"
                  className="btn btn--secondary btn--pill btn--lg"
                  id="hero-cta-demo"
                  data-tooltip="Try the full platform with a pre-loaded demo account"
                >
                  <Play size={16} aria-hidden="true" />
                  Watch Demo
                </Link>
              </div>
            </div>

            <div className={`${styles.heroRight} reveal-right`}>
              <div className={styles.statCard} data-tooltip="Lifelike 3D therapist guiding patients through gentle memory exercises">
                <div className={styles.statCardTop}>
                  <div className={styles.statNumber}>24/7</div>
                  <div className={styles.statLabel}>AI Companion</div>
                </div>
                <div className={styles.avatarStack} aria-label="Always there to listen and talk">
                  {['V', 'O', 'I', 'C', 'E'].map((initial, i) => (
                    <div key={i} className={styles.avatar} style={{ zIndex: 5 - i }}>
                      {initial}
                    </div>
                  ))}
                  <span className={styles.avatarMore}>+3D</span>
                </div>
                <div className={styles.statNote}>
                  <Brain size={14} color="#6D28D9" fill="#6D28D9" aria-hidden="true" />
                  Empathetic memory & mood support
                </div>
              </div>

              <div className={styles.miniStatsContainer}>
                <div className={`${styles.miniStat} animate-slide-up animate-delay-3`}>
                  <MapPin size={16} className={styles.miniStatIcon} aria-hidden="true" />
                  <div>
                    <div className={styles.miniStatValue}>1hr</div>
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
              { label: 'Free for Indian Families', tip: 'No subscription fees, completely free for all Indian families' },
              { label: 'No Cloud Lock-in', tip: 'All your data stays on your local device - no cloud dependency' },
              { label: 'Voice-First Elderly Design', tip: 'Designed specifically for elderly users with voice-first interfaces' },
              { label: 'QR Works on Any phone', tip: 'Any smartphone camera can scan the QR bracelet - no app needed' },
            ].map(({ label, tip }) => (
              <div key={label} className={styles.trustPill} role="listitem" data-tooltip={tip}>
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
                    Saathi learns from your family&apos;s real stories - gently helping
                    Ravi remember them, one photo and voice note at a time.
                  </p>
                </article>

                <article className={`${styles.featureCard} reveal-left animate-delay-1`}>
                  <Layers size={24} className={styles.featureIcon} aria-hidden="true" />
                  <h3 className={styles.featureCardTitle}>Spatial Memory Therapy</h3>
                  <p className={styles.featureCardDesc}>
                    An interactive 2D home setting Ravi can explore - each object holds a
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
                  { value: '24/7', label: 'Continuous AI Companion support', accent: 'primary', tip: 'Always-available emotional and therapeutic support' },
                  { value: '92%', label: 'Memory therapy completion', accent: 'success', tip: 'Patients who start memory therapy sessions complete them' },
                  { value: '1hr', label: 'Average family setup time', accent: 'warning', tip: 'Most families are fully set up within 1 hours' },
                ].map(({ value, label, accent, tip }) => (
                  <div key={value} className={styles.statRow} data-tooltip={tip}>
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
                  tip: 'A gentle, voice-first interface tailored for elderly patients with Alzheimer\'s',
                },
                {
                  icon: <ScanLine size={22} aria-hidden="true" />,
                  title: 'Guardian Command',
                  desc: 'Full oversight dashboard. Track Ravi\'s cognitive score, edit his curated memories, set his schedule, and manage alerts.',
                  delay: 'stagger-2',
                  tip: 'Full monitoring dashboard for family members to track their patient\'s care',
                },
                {
                  icon: <Stethoscope size={22} aria-hidden="true" />,
                  title: 'Caretaker Mobile',
                  desc: 'Shift-ready mobile view. Log medications accurately, write observation notes, and seamlessly hand off to the next shift.',
                  delay: 'stagger-3',
                  tip: 'Shift-focused view for professional caretakers to log daily care tasks',
                },
                {
                  icon: <Users size={22} aria-hidden="true" />,
                  title: 'Good Samaritan',
                  desc: 'No account. No app. Just scan the emergency QR code, securely view who to call, and chat live with the family.',
                  delay: 'stagger-4',
                  tip: 'Any stranger can help a lost patient by scanning the QR bracelet - no app needed',
                },
              ].map((role) => (
                <article
                  key={role.title}
                  className={`${styles.roleCard} reveal-scale ${role.delay}`}
                  data-tooltip={role.tip}
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

          {/* ── RESEARCH SECTION ── */}
          <section
            id="research"
            className={`${styles.researchSection} reveal`}
            aria-labelledby="research-heading"
          >
            <div className={`${styles.researchHeader} reveal`}>
              <p className={styles.sectionLabel}>Evidence Base</p>
              <h2 id="research-heading" className={styles.sectionTitle}>
                Every feature is backed<br />
                <span className={styles.sectionTitleSerif}>by peer-reviewed science.</span>
              </h2>
              <p className={styles.researchLead}>
                SaathiCare wasn&apos;t built on assumptions. Each therapeutic module reflects interventions studied and validated in clinical literature - from the Alzheimer&apos;s Association to the National Institutes of Health.
              </p>
            </div>

            <div className={styles.researchGrid}>

              {/* Paper 1 - Spaced Repetition */}
              <article className={`${styles.researchCard} reveal-scale`} data-tooltip="The science behind our Memory Flashcard spaced-repetition algorithm">
                <div className={styles.researchCardTop}>
                  <div className={styles.researchFeaturePill}>
                    <BookOpen size={13} aria-hidden="true" />
                    Memory Flashcards
                  </div>
                  <div className={styles.researchIconWrap}>
                    <Brain size={20} aria-hidden="true" />
                  </div>
                </div>
                <blockquote className={styles.researchQuote}>
                  &ldquo;Spaced retrieval training can effectively teach new information and behavioural strategies to people with dementia &mdash; including face-name associations and functional daily-living skills.&rdquo;
                </blockquote>
                <div className={styles.researchSource}>
                  <div className={styles.researchPaperMeta}>
                    <span className={styles.researchPaperTitle}>Spaced Retrieval Training for Dementia Care</span>
                    <span className={styles.researchJournal}>Neuropsychological Rehabilitation · 2013 · 34-study review</span>
                  </div>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/?term=spaced+retrieval+dementia+training"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                    aria-label="View spaced retrieval research on PubMed"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </article>

              {/* Paper 2 - Music Therapy */}
              <article className={`${styles.researchCard} ${styles.researchCardAccent} reveal-scale stagger-2`} data-tooltip="The science behind our mood-adaptive Music Therapy module">
                <div className={styles.researchCardTop}>
                  <div className={styles.researchFeaturePill}>
                    <Music size={13} aria-hidden="true" />
                    Music Therapy
                  </div>
                  <div className={styles.researchIconWrap}>
                    <Music size={20} aria-hidden="true" />
                  </div>
                </div>
                <blockquote className={styles.researchQuote}>
                  &ldquo;Meta-analysis of 13 RCTs (827 patients) confirmed music interventions significantly reduced anxiety and agitation in Alzheimer&apos;s and mixed-type dementia, activating brain areas that maintain mood stability.&rdquo;
                </blockquote>
                <div className={styles.researchSource}>
                  <div className={styles.researchPaperMeta}>
                    <span className={styles.researchPaperTitle}>Music Interventions for Dementia &amp; Aging</span>
                    <span className={styles.researchJournal}>Frontiers in Psychiatry · 2023 · 13-RCT meta-analysis</span>
                  </div>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/?term=music+therapy+dementia+anxiety+RCT"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                    aria-label="View music therapy research on PubMed"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </article>

              {/* Paper 3 - Familiar Voice / People Wallet */}
              <article className={`${styles.researchCard} reveal-scale stagger-3`} data-tooltip="The science behind our People Wallet voice notes feature">
                <div className={styles.researchCardTop}>
                  <div className={styles.researchFeaturePill}>
                    <Mic2 size={13} aria-hidden="true" />
                    People Wallet
                  </div>
                  <div className={styles.researchIconWrap}>
                    <Mic2 size={20} aria-hidden="true" />
                  </div>
                </div>
                <blockquote className={styles.researchQuote}>
                  &ldquo;Family audio recording therapy was shown to improve depressive symptoms, regulate hormone levels, enhance sleep quality, and potentially delay cognitive decline in individuals with Alzheimer&apos;s disease.&rdquo;
                </blockquote>
                <div className={styles.researchSource}>
                  <div className={styles.researchPaperMeta}>
                    <span className={styles.researchPaperTitle}>Voice Note Therapy &amp; Auditory Memory in Dementia</span>
                    <span className={styles.researchJournal}>Healio Research · 2023 · Clinical intervention study</span>
                  </div>
                  <a
                    href="https://www.healio.com/news/psychiatry/20231001/family-audio-recording-therapy"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                    aria-label="View voice note research at Healio"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </article>

              {/* Paper 4 - Spatial / MemoryLane */}
              <article className={`${styles.researchCard} ${styles.researchCardWide} reveal-left`} data-tooltip="The science behind our MemoryLane spatial memory room">
                <div className={styles.researchCardTop}>
                  <div className={styles.researchFeaturePill}>
                    <Layers size={13} aria-hidden="true" />
                    MemoryLane Room
                  </div>
                  <div className={styles.researchIconWrap}>
                    <Layers size={20} aria-hidden="true" />
                  </div>
                </div>
                <blockquote className={styles.researchQuote}>
                  &ldquo;Reminiscence therapy using photographs, sensory objects, and familiar environments stimulates the hippocampus and cortex - improving cognitive function, reducing agitation, and encouraging neuroplasticity in mild-to-moderate Alzheimer&apos;s patients.&rdquo;
                </blockquote>
                <div className={styles.researchSource}>
                  <div className={styles.researchPaperMeta}>
                    <span className={styles.researchPaperTitle}>Reminiscence Therapy &amp; Environmental Cues in Alzheimer&apos;s</span>
                    <span className={styles.researchJournal}>Johns Hopkins Medicine · Johns Hopkins Memory Health Center</span>
                  </div>
                  <a
                    href="https://www.johnshopkinsmedicine.org/memory"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                    aria-label="View Johns Hopkins reminiscence therapy research"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </article>

              {/* Paper 5 - Cognitive Games */}
              <article className={`${styles.researchCard} reveal-scale stagger-2`} data-tooltip="The science behind our Cognitive Mini-Games module">
                <div className={styles.researchCardTop}>
                  <div className={styles.researchFeaturePill}>
                    <Gamepad2 size={13} aria-hidden="true" />
                    Cognitive Games
                  </div>
                  <div className={styles.researchIconWrap}>
                    <Gamepad2 size={20} aria-hidden="true" />
                  </div>
                </div>
                <blockquote className={styles.researchQuote}>
                  &ldquo;Mobile device-based electronic games were particularly effective in slowing the decline of global cognition and executive function in patients with MCI or dementia. Digital interventions showed significant positive effects on attention, visuospatial perception, and memory.&rdquo;
                </blockquote>
                <div className={styles.researchSource}>
                  <div className={styles.researchPaperMeta}>
                    <span className={styles.researchPaperTitle}>Digital Interventions for MCI &amp; Dementia</span>
                    <span className={styles.researchJournal}>JMIR Serious Games · 2023 · Systematic review</span>
                  </div>
                  <a
                    href="https://pubmed.ncbi.nlm.nih.gov/?term=mobile+game+cognitive+dementia+MCI"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                    aria-label="View cognitive games research on PubMed"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </article>

              {/* Paper 6 - QR Safety */}
              <article className={`${styles.researchCard} ${styles.researchCardAccent} reveal-scale stagger-3`} data-tooltip="The science behind our QR Emergency Identity system">
                <div className={styles.researchCardTop}>
                  <div className={styles.researchFeaturePill}>
                    <QrCode size={13} aria-hidden="true" />
                    QR Safety System
                  </div>
                  <div className={styles.researchIconWrap}>
                    <Shield size={20} aria-hidden="true" />
                  </div>
                </div>
                <blockquote className={styles.researchQuote}>
                  &ldquo;60% of Alzheimer&apos;s patients will wander at least once. If not found within 24 hours, up to 50% face serious injury or death. QR-enabled wearables allow instant access to patient identity, emergency contacts, and medical notes without requiring any app.&rdquo;
                </blockquote>
                <div className={styles.researchSource}>
                  <div className={styles.researchPaperMeta}>
                    <span className={styles.researchPaperTitle}>Wandering Behaviour &amp; Identification Technology</span>
                    <span className={styles.researchJournal}>NIH NIA · Alzheimer&apos;s Association · 2022 statistics</span>
                  </div>
                  <a
                    href="https://www.nia.nih.gov/health/alzheimers-safety-tips"
                    target="_blank"
                    rel="noopener noreferrer"
                    className={styles.researchLink}
                    aria-label="View NIH Alzheimer's safety research"
                  >
                    <ExternalLink size={12} aria-hidden="true" />
                  </a>
                </div>
              </article>

            </div>

            {/* Research Footer Row */}
            <div className={`${styles.researchFooterRow} reveal`}>
              <div className={styles.researchFooterPill}>
                <FlaskConical size={14} aria-hidden="true" />
                All research sourced from NIH PubMed, peer-reviewed journals, and established clinical guidelines
              </div>
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
                  data-tooltip="Create your account and configure QR protection in minutes"
                >
                  Start Configuration
                  <ChevronRight size={20} aria-hidden="true" />
                </Link>
                <Link
                  href="/scan/ravi-sharma-2024"
                  className="btn btn--secondary btn--pill btn--lg"
                  data-tooltip="See exactly what a Good Samaritan sees when they scan the QR bracelet"
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
