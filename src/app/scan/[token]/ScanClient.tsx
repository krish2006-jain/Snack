'use client'

import { useState, useRef, useEffect, useCallback } from 'react'
import {
    Phone, MessageCircle, MapPin, AlertTriangle, ShieldAlert,
    Droplet, Pill, HeartPulse, ExternalLink, User, Camera,
    Send, Bot, Users, Stethoscope, CheckCircle2, Image, ChevronRight,
    Mic, MicOff, Navigation2
} from 'lucide-react'
import type { QRProfile } from '@/types'
import SaathiAvatar from '@/components/avatar/SaathiAvatar'
import dynamic from 'next/dynamic'
import styles from './scan.module.css'

const LocationMap = dynamic(() => import('@/components/map/LocationMap'), { ssr: false })

// Hardcoded coordinates for Sector 15, Noida (patient home location for demo)
const PATIENT_HOME_COORDS = { lat: 28.5855, lng: 77.3100 }

type TabId = 'card' | 'info' | 'map' | 'chat' | 'talk'
type ChatChannel = 'ai' | 'guardian' | 'caretaker'

interface ChatMsg {
    id: string
    sender: string
    content: string
    isOwn: boolean
    timestamp: string
    channel: ChatChannel
}

interface Props {
    profile: QRProfile | null
    token: string
    defaultTab?: TabId
}

const TABS: { id: TabId; label: string; icon: React.ReactNode }[] = [
    { id: 'card', label: 'Patient ID', icon: <ShieldAlert size={16} /> },
    { id: 'info', label: 'Your Info', icon: <User size={16} /> },
    { id: 'map', label: 'Map', icon: <Navigation2 size={16} /> },
    { id: 'chat', label: 'Chat', icon: <MessageCircle size={16} /> },
    { id: 'talk', label: 'Talk to Saathi', icon: <Bot size={16} /> },
]

const CHANNELS: { id: ChatChannel; label: string; icon: React.ReactNode; name: string; desc: string }[] = [
    { id: 'ai', label: 'Saathi AI', icon: <Bot size={16} />, name: 'Saathi', desc: 'AI with medical access' },
    { id: 'guardian', label: 'Guardian', icon: <Users size={16} />, name: 'Priya Sharma', desc: 'Daughter' },
    { id: 'caretaker', label: 'Caretaker', icon: <Stethoscope size={16} />, name: 'Nurse Anita', desc: 'Daily caretaker' },
]

const QUICK_REPLIES: Record<ChatChannel, string[]> = {
    ai: [
        'What are their allergies?',
        'What medications do they take?',
        'How should I calm them?',
        'Is this an emergency?',
    ],
    guardian: [
        'I found them',
        'They seem confused',
        'They are safe',
        "I'm staying with them",
    ],
    caretaker: [
        'Are you nearby?',
        'They need assistance',
        'They are calm now',
        'Should I call 112?',
    ],
}

export default function ScanClient({ profile, token, defaultTab }: Props) {
    const [activeTab, setActiveTab] = useState<TabId>(defaultTab || 'card')

    // ── Samaritan form state ──
    const [samName, setSamName] = useState('')
    const [samPhone, setSamPhone] = useState('')
    const [samPhoto, setSamPhoto] = useState<string | null>(null)
    const [samLocation, setSamLocation] = useState<{ lat: number; lng: number } | null>(null)
    const [samLocationLoading, setSamLocationLoading] = useState(false)
    const [samSubmitted, setSamSubmitted] = useState(false)
    const [samSubmitting, setSamSubmitting] = useState(false)
    const fileInputRef = useRef<HTMLInputElement>(null)

    // ── Chat state ──
    const [chatChannel, setChatChannel] = useState<ChatChannel>('ai')
    const [messages, setMessages] = useState<Record<ChatChannel, ChatMsg[]>>({
        ai: [], guardian: [], caretaker: [],
    })
    const [chatInput, setChatInput] = useState('')
    const [chatSending, setChatSending] = useState(false)
    const chatBottomRef = useRef<HTMLDivElement>(null)
    const chatInputRef = useRef<HTMLInputElement>(null)
    const [latestAiResponse, setLatestAiResponse] = useState('')

    // ── Talk tab state ──
    interface TalkEntry { role: 'user' | 'ai'; text: string }
    const [talkHistory, setTalkHistory] = useState<TalkEntry[]>([])
    const [talkListening, setTalkListening] = useState(false)
    const [talkSending, setTalkSending] = useState(false)
    const [talkSpeaking, setTalkSpeaking] = useState(false)
    const [talkLatestResponse, setTalkLatestResponse] = useState('')
    const talkResponseCounter = useRef(0)
    const talkScrollRef = useRef<HTMLDivElement>(null)
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const talkRecRef = useRef<any>(null)
    // Chat history for LLM context (separate from the text chat)
    const talkLlmHistory = useRef<{ role: string; content: string }[]>([])

    // Scroll talk transcript to bottom
    useEffect(() => {
        talkScrollRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [talkHistory])

    // ── Talk: send voice transcript to LLM and get avatar to speak the reply ──
    const sendTalkMessage = useCallback(async (text: string) => {
        if (!text.trim() || talkSending) return
        setTalkSending(true)
        setTalkHistory(prev => [...prev, { role: 'user', text: text.trim() }])

        try {
            const res = await fetch(`/api/scan/${token}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel: 'ai',
                    message: text.trim(),
                    history: talkLlmHistory.current,
                }),
            })
            const data = await res.json()
            const reply = data.reply || 'I could not respond. Please try again.'

            talkLlmHistory.current.push({ role: 'user', content: text.trim() })
            talkLlmHistory.current.push({ role: 'assistant', content: reply })

            setTalkHistory(prev => [...prev, { role: 'ai', text: reply }])
            // Force SaathiAvatar to re-trigger speech even if reply text is identical
            talkResponseCounter.current += 1
            setTalkLatestResponse(reply + '\u200B'.repeat(talkResponseCounter.current % 3))
        } catch {
            setTalkHistory(prev => [...prev, { role: 'ai', text: 'Sorry, something went wrong. Please try again.' }])
        } finally {
            setTalkSending(false)
        }
    }, [talkSending, token])

    // ── Talk: speech recognition ──
    const toggleTalkListening = useCallback(() => {
        // Unlock Safari/Chrome TTS autoplay context
        if (typeof window !== 'undefined' && 'speechSynthesis' in window && !talkListening) {
            const unlockUtterance = new SpeechSynthesisUtterance('');
            unlockUtterance.volume = 0;
            window.speechSynthesis.speak(unlockUtterance);
        }

        if (talkListening && talkRecRef.current) {
            talkRecRef.current.stop()
            setTalkListening(false)
            return
        }
        if (typeof window === 'undefined') return
        type SRCtor = new () => {
            lang: string; start: () => void; stop: () => void;
            onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
            onend: (() => void) | null;
            onerror: ((e: { error: string }) => void) | null;
        }
        const win = window as unknown as { SpeechRecognition?: SRCtor; webkitSpeechRecognition?: SRCtor }
        const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition
        if (!Ctor) return
        const rec = new Ctor()
        talkRecRef.current = rec
        rec.lang = 'en-IN'
        rec.onresult = (e) => {
            const transcript = e.results[0][0].transcript
            if (transcript) sendTalkMessage(transcript)
            setTalkListening(false)
        }
        rec.onend = () => setTalkListening(false)
        rec.onerror = () => setTalkListening(false)
        rec.start()
        setTalkListening(true)
    }, [talkListening, sendTalkMessage])

    const talkStatus = talkListening ? 'Listening…' : talkSending ? 'Thinking…' : talkSpeaking ? 'Speaking…' : 'Tap the mic to talk'
    const talkDotClass = talkListening ? styles.listening : talkSending ? styles.thinking : talkSpeaking ? styles.speaking : ''

    useEffect(() => {
        chatBottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages, chatChannel])

    // ── Not found ──
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

    // ── Samaritan form handlers ──
    function handlePhotoChange(e: React.ChangeEvent<HTMLInputElement>) {
        const file = e.target.files?.[0]
        if (!file) return
        const reader = new FileReader()
        reader.onload = () => setSamPhoto(reader.result as string)
        reader.readAsDataURL(file)
    }

    function detectLocation() {
        if (!navigator.geolocation) return
        setSamLocationLoading(true)
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                setSamLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude })
                setSamLocationLoading(false)
            },
            () => {
                alert('Location access denied.')
                setSamLocationLoading(false)
            }
        )
    }

    async function submitSamaritanInfo() {
        setSamSubmitting(true)
        try {
            await fetch(`/api/scan/${token}/samaritan`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    name: samName || undefined,
                    phone: samPhone || undefined,
                    photoBase64: samPhoto || undefined,
                    latitude: samLocation?.lat,
                    longitude: samLocation?.lng,
                }),
            })
            setSamSubmitted(true)
        } catch {
            alert('Failed to submit. Please try again.')
        } finally {
            setSamSubmitting(false)
        }
    }

    // ── Chat handlers ──
    function formatTime(iso: string) {
        return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    async function sendChatMessage(content: string) {
        if (!content.trim() || chatSending) return
        setChatSending(true)
        setChatInput('')

        const newMsg: ChatMsg = {
            id: `msg-${Date.now()}`,
            sender: 'You',
            content: content.trim(),
            isOwn: true,
            timestamp: new Date().toISOString(),
            channel: chatChannel,
        }

        setMessages(prev => ({
            ...prev,
            [chatChannel]: [...prev[chatChannel], newMsg],
        }))

        try {
            const historyForAI = chatChannel === 'ai'
                ? messages.ai.map(m => ({ role: m.isOwn ? 'user' : 'assistant', content: m.content }))
                : undefined

            const res = await fetch(`/api/scan/${token}/chat`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    channel: chatChannel,
                    message: content.trim(),
                    history: historyForAI,
                }),
            })

            const data = await res.json()

            if (data.reply) {
                const replyMsg: ChatMsg = {
                    id: `msg-${Date.now()}-reply`,
                    sender: data.sender || 'Unknown',
                    content: data.reply,
                    isOwn: false,
                    timestamp: new Date().toISOString(),
                    channel: chatChannel,
                }
                setMessages(prev => ({
                    ...prev,
                    [chatChannel]: [...prev[chatChannel], replyMsg],
                }))
                if (chatChannel === 'ai') {
                    setLatestAiResponse(data.reply)
                }
            }
        } catch {
            const errorMsg: ChatMsg = {
                id: `msg-${Date.now()}-err`,
                sender: 'System',
                content: 'Failed to send. Please try again.',
                isOwn: false,
                timestamp: new Date().toISOString(),
                channel: chatChannel,
            }
            setMessages(prev => ({
                ...prev,
                [chatChannel]: [...prev[chatChannel], errorMsg],
            }))
        } finally {
            setChatSending(false)
        }
    }

    function handleChatKey(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) {
            e.preventDefault()
            sendChatMessage(chatInput)
        }
    }

    function shareLocationInChat() {
        if (!navigator.geolocation) return
        navigator.geolocation.getCurrentPosition(
            (pos) => {
                sendChatMessage(`📍 My location: https://maps.google.com/?q=${pos.coords.latitude},${pos.coords.longitude}`)
            },
            () => sendChatMessage('I tried to share my location but it was denied.')
        )
    }

    const currentChannel = CHANNELS.find(c => c.id === chatChannel)!
    const channelMessages = messages[chatChannel]

    return (
        <div className={styles.page}>
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

                {/* Tab Navigation */}
                <nav className={styles.tabNav} role="tablist" aria-label="Page sections">
                    {TABS.map((tab) => (
                        <button
                            key={tab.id}
                            role="tab"
                            className={`${styles.tab} ${activeTab === tab.id ? styles.tabActive : ''}`}
                            aria-selected={activeTab === tab.id}
                            onClick={() => setActiveTab(tab.id)}
                            id={`tab-${tab.id}`}
                        >
                            {tab.icon}
                            <span>{tab.label}</span>
                        </button>
                    ))}
                </nav>

                {/* ══════════ SECTION 1: PATIENT ID CARD ══════════ */}
                {activeTab === 'card' && (
                    <div className={styles.tabContent} role="tabpanel" aria-labelledby="tab-card">
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
                                    {patient.careStage.charAt(0).toUpperCase() + patient.careStage.slice(1)} Alzheimer&apos;s
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

                        {/* Action buttons pointing to info & chat tabs */}
                        <div className={styles.actionButtons}>
                            <button
                                type="button"
                                onClick={() => setActiveTab('info')}
                                className={`btn btn--secondary btn--full ${styles.actionBtn}`}
                                id="scan-share-info-btn"
                            >
                                <User size={18} aria-hidden="true" />
                                Share Your Info
                                <ChevronRight size={16} aria-hidden="true" />
                            </button>

                            <button
                                type="button"
                                onClick={() => setActiveTab('chat')}
                                className={`btn btn--primary btn--full ${styles.actionBtn}`}
                                id="scan-chat-btn"
                            >
                                <MessageCircle size={18} aria-hidden="true" />
                                Chat with Family / AI
                                <ChevronRight size={16} aria-hidden="true" />
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
                    </div>
                )}

                {/* ══════════ SECTION 2: SAMARITAN INFO ══════════ */}
                {activeTab === 'info' && (
                    <div className={styles.tabContent} role="tabpanel" aria-labelledby="tab-info">
                        {samSubmitted ? (
                            <div className={styles.thankYou}>
                                <div className={styles.thankYouIcon}>
                                    <CheckCircle2 size={48} />
                                </div>
                                <h2 className={styles.thankYouTitle}>Thank You!</h2>
                                <p className={styles.thankYouDesc}>
                                    Your information has been shared with {patient.name}&apos;s family.
                                    They will be able to reach you.
                                </p>
                                <div className={styles.sharedInfo}>
                                    <h3 className={styles.sharedInfoTitle}>You shared:</h3>
                                    {samName && <p>📛 Name: {samName}</p>}
                                    {samPhone && <p>📞 Phone: {samPhone}</p>}
                                    {samPhoto && <p>📷 Photo: Attached</p>}
                                    {samLocation && <p>📍 Location: Shared</p>}
                                    {!samName && !samPhone && !samPhoto && !samLocation && (
                                        <p className={styles.sharedNone}>No details were shared (anonymous scan).</p>
                                    )}
                                </div>
                                <button
                                    type="button"
                                    onClick={() => setActiveTab('chat')}
                                    className={`btn btn--primary btn--full ${styles.actionBtn}`}
                                >
                                    <MessageCircle size={18} aria-hidden="true" />
                                    Start Chatting
                                </button>
                            </div>
                        ) : (
                            <div className={styles.samForm}>
                                <div className={styles.samFormHeader}>
                                    <h2 className={styles.samFormTitle}>Your Information</h2>
                                    <p className={styles.samFormDesc}>
                                        Help {patient.name}&apos;s family reach you. All fields are optional —
                                        share only what you&apos;re comfortable with.
                                    </p>
                                </div>

                                {/* Name */}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="sam-name">
                                        <User size={14} aria-hidden="true" />
                                        Your Name
                                    </label>
                                    <input
                                        id="sam-name"
                                        type="text"
                                        className={styles.formInput}
                                        placeholder="e.g. Amit Kumar"
                                        value={samName}
                                        onChange={(e) => setSamName(e.target.value)}
                                    />
                                </div>

                                {/* Phone */}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel} htmlFor="sam-phone">
                                        <Phone size={14} aria-hidden="true" />
                                        Phone Number
                                    </label>
                                    <input
                                        id="sam-phone"
                                        type="tel"
                                        className={styles.formInput}
                                        placeholder="+91 98765 43210"
                                        value={samPhone}
                                        onChange={(e) => setSamPhone(e.target.value)}
                                    />
                                </div>

                                {/* Photo */}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <Camera size={14} aria-hidden="true" />
                                        Your Photo
                                    </label>
                                    <input
                                        ref={fileInputRef}
                                        type="file"
                                        accept="image/*"
                                        capture="environment"
                                        className={styles.fileInputHidden}
                                        onChange={handlePhotoChange}
                                    />
                                    {samPhoto ? (
                                        <div className={styles.photoPreview}>
                                            <img src={samPhoto} alt="Your photo" className={styles.photoImg} />
                                            <button
                                                type="button"
                                                className={styles.photoRemove}
                                                onClick={() => setSamPhoto(null)}
                                            >
                                                Remove
                                            </button>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.photoCapture}
                                            onClick={() => fileInputRef.current?.click()}
                                        >
                                            <Camera size={20} aria-hidden="true" />
                                            <span>Take or Choose Photo</span>
                                        </button>
                                    )}
                                </div>

                                {/* Location */}
                                <div className={styles.formGroup}>
                                    <label className={styles.formLabel}>
                                        <MapPin size={14} aria-hidden="true" />
                                        Current Location
                                    </label>
                                    {samLocation ? (
                                        <div className={styles.locationDetected}>
                                            <CheckCircle2 size={16} className={styles.locationCheckIcon} />
                                            <span>Location detected ({samLocation.lat.toFixed(4)}, {samLocation.lng.toFixed(4)})</span>
                                        </div>
                                    ) : (
                                        <button
                                            type="button"
                                            className={styles.locationBtn}
                                            onClick={detectLocation}
                                            disabled={samLocationLoading}
                                        >
                                            <MapPin size={16} aria-hidden="true" />
                                            {samLocationLoading ? 'Detecting…' : 'Detect My Location'}
                                        </button>
                                    )}
                                </div>

                                {/* Submit */}
                                <button
                                    type="button"
                                    className={`btn btn--primary btn--full btn--lg ${styles.submitBtn}`}
                                    onClick={submitSamaritanInfo}
                                    disabled={samSubmitting}
                                    id="sam-submit"
                                >
                                    {samSubmitting ? 'Sending…' : 'Share Information'}
                                </button>

                                <p className={styles.privacyNote}>
                                    🔒 Your data is only shared with the patient&apos;s registered family and care team.
                                </p>
                            </div>
                        )}
                    </div>
                )}

                {/* ══════════ SECTION 3: MAP VIEW ══════════ */}
                {activeTab === 'map' && (
                    <div className={styles.tabContent} role="tabpanel" aria-labelledby="tab-map">
                        <div className={styles.mapPanel}>
                            <div className={styles.mapHeader}>
                                <Navigation2 size={18} className={styles.mapHeaderIcon} />
                                <div>
                                    <h2 className={styles.mapTitle}>Live Location Map</h2>
                                    <p className={styles.mapSubtitle}>
                                        See where {patient.name} lives and share your location
                                    </p>
                                </div>
                            </div>
                            <LocationMap
                                samaritanLocation={samLocation}
                                patientLocation={PATIENT_HOME_COORDS}
                                patientName={patient.name}
                                onDetectLocation={detectLocation}
                                locationLoading={samLocationLoading}
                            />
                        </div>
                    </div>
                )}

                {/* ══════════ SECTION 4: CHAT HUB ══════════ */}
                {activeTab === 'chat' && (
                    <div className={styles.tabContent} role="tabpanel" aria-labelledby="tab-chat">
                        {/* Channel selector */}
                        <div className={styles.channelSelector}>
                            {CHANNELS.map((ch) => (
                                <button
                                    key={ch.id}
                                    type="button"
                                    className={`${styles.channelBtn} ${chatChannel === ch.id ? styles.channelActive : ''}`}
                                    onClick={() => setChatChannel(ch.id)}
                                >
                                    <span className={styles.channelIcon}>{ch.icon}</span>
                                    <span className={styles.channelLabel}>{ch.label}</span>
                                    {messages[ch.id].length > 0 && (
                                        <span className={styles.channelBadge}>
                                            {messages[ch.id].filter(m => !m.isOwn).length}
                                        </span>
                                    )}
                                </button>
                            ))}
                        </div>

                        {/* Channel header */}
                        <div className={styles.chatHeader}>
                            <div className={styles.chatHeaderAvatar}>
                                {currentChannel.icon}
                            </div>
                            <div className={styles.chatHeaderInfo}>
                                <span className={styles.chatHeaderName}>{currentChannel.name}</span>
                                <span className={styles.chatHeaderDesc}>{currentChannel.desc}</span>
                            </div>
                            {chatChannel !== 'ai' && (
                                <a
                                    href={`tel:${chatChannel === 'guardian' ? '+91 98765 12345' : '+91 98765 67890'}`}
                                    className={styles.chatCallBtn}
                                    aria-label="Call"
                                >
                                    <Phone size={16} aria-hidden="true" />
                                </a>
                            )}
                        </div>

                        {/* Chat messages */}
                        <div className={styles.chatArea}>
                            <div className={styles.chatIntro}>
                                <p className={styles.chatIntroText}>
                                    {chatChannel === 'ai'
                                        ? `Saathi AI has access to ${patient.name}'s medical records and can help answer emergency questions.`
                                        : `You're chatting with ${currentChannel.name}. They can see your messages immediately.`
                                    }
                                </p>
                            </div>

                            {channelMessages.map((msg) => (
                                <article
                                    key={msg.id}
                                    className={`${styles.messageBubble} ${msg.isOwn ? styles.bubbleOwn : styles.bubbleOther}`}
                                >
                                    {!msg.isOwn && (
                                        <div className={styles.senderAvatar} aria-hidden="true">
                                            {msg.sender[0]}
                                        </div>
                                    )}
                                    <div className={styles.bubbleContent}>
                                        {!msg.isOwn && (
                                            <span className={styles.senderName}>{msg.sender}</span>
                                        )}
                                        <div className={styles.bubbleText}>{msg.content}</div>
                                        <time className={styles.bubbleTime} dateTime={msg.timestamp}>
                                            {formatTime(msg.timestamp)}
                                        </time>
                                    </div>
                                </article>
                            ))}

                            {chatSending && (
                                <div className={`${styles.messageBubble} ${styles.bubbleOther}`}>
                                    <div className={styles.senderAvatar} aria-hidden="true">
                                        {currentChannel.name[0]}
                                    </div>
                                    <div className={styles.bubbleContent}>
                                        <div className={styles.typingDots} aria-label={`${currentChannel.name} is typing`}>
                                            <span /><span /><span />
                                        </div>
                                    </div>
                                </div>
                            )}

                            <div ref={chatBottomRef} />
                        </div>

                        {/* Chat input */}
                        <div className={styles.chatInputArea}>
                            {/* Quick actions */}
                            <div className={styles.quickActions}>
                                <button
                                    type="button"
                                    className={styles.iconAction}
                                    onClick={shareLocationInChat}
                                    aria-label="Share your location"
                                >
                                    <MapPin size={14} aria-hidden="true" />
                                    <span>Location</span>
                                </button>
                                <button
                                    type="button"
                                    className={styles.iconAction}
                                    onClick={() => sendChatMessage('[Photo shared]')}
                                    aria-label="Send a photo"
                                >
                                    <Image size={14} aria-hidden="true" />
                                    <span>Photo</span>
                                </button>
                            </div>

                            {/* Quick replies */}
                            <div className={styles.quickReplies} role="list" aria-label="Quick replies">
                                {QUICK_REPLIES[chatChannel].map((qr) => (
                                    <button
                                        key={qr}
                                        type="button"
                                        role="listitem"
                                        className={styles.quickReply}
                                        onClick={() => sendChatMessage(qr)}
                                        disabled={chatSending}
                                    >
                                        {qr}
                                    </button>
                                ))}
                            </div>

                            {/* Text input */}
                            <div className={styles.inputRow}>
                                <input
                                    ref={chatInputRef}
                                    type="text"
                                    className={styles.textInput}
                                    placeholder="Type a message…"
                                    value={chatInput}
                                    onChange={(e) => setChatInput(e.target.value)}
                                    onKeyDown={handleChatKey}
                                    disabled={chatSending}
                                    aria-label="Message input"
                                    id="chat-input"
                                />
                                <button
                                    type="button"
                                    className={styles.sendBtn}
                                    onClick={() => sendChatMessage(chatInput)}
                                    disabled={!chatInput.trim() || chatSending}
                                    aria-label="Send message"
                                    id="chat-send"
                                >
                                    <Send size={18} aria-hidden="true" />
                                </button>
                            </div>
                        </div>
                    </div>
                )}

                {/* ══════════ SECTION 4: TALK TO SAATHI ══════════ */}
                {activeTab === 'talk' && (
                    <div className={styles.talkPanel} role="tabpanel" aria-labelledby="tab-talk">
                        {/* Status bar */}
                        <div className={styles.talkStatusRow}>
                            <span className={`${styles.talkStatusDot} ${talkDotClass}`} />
                            <span className={styles.talkStatusLabel}>{talkStatus}</span>
                        </div>

                        {/* 3D Avatar — fullscreen mode */}
                        <div className={styles.talkAvatarContainer}>
                            <SaathiAvatar
                                isTyping={talkSending}
                                latestResponse={talkLatestResponse}
                                voiceEnabled={true}
                                fullscreen={true}
                                onSpeakingChange={setTalkSpeaking}
                            />
                        </div>

                        {/* Conversation transcript */}
                        {talkHistory.length > 0 && (
                            <div className={styles.talkTranscript}>
                                {talkHistory.map((entry, i) => (
                                    <div
                                        key={i}
                                        className={`${styles.talkBubble} ${entry.role === 'user' ? styles.talkBubbleUser : styles.talkBubbleAi}`}
                                    >
                                        <span className={styles.talkBubbleTag}>
                                            {entry.role === 'user' ? 'You' : 'Saathi'}
                                        </span>
                                        <span className={styles.talkBubbleText}>{entry.text}</span>
                                    </div>
                                ))}
                                <div ref={talkScrollRef} />
                            </div>
                        )}

                        {talkHistory.length === 0 && (
                            <div className={styles.talkIntro}>
                                <p className={styles.talkIntroText}>
                                    Saathi AI has access to {patient.name}&apos;s medical records.
                                    Tap the mic and ask anything — allergies, medications, how to help.
                                </p>
                            </div>
                        )}

                        {/* Mic button */}
                        <div className={styles.talkControls}>
                            <button
                                type="button"
                                className={`${styles.talkMicBtn} ${talkListening ? styles.recording : ''}`}
                                onClick={toggleTalkListening}
                                disabled={talkSending || talkSpeaking}
                                aria-label={talkListening ? 'Stop listening' : 'Start talking'}
                                id="talk-mic-btn"
                            >
                                {talkListening ? <MicOff size={28} /> : <Mic size={28} />}
                            </button>
                            <span className={styles.talkHint}>
                                {talkListening ? 'Listening… tap to stop' : talkSpeaking ? 'Saathi is responding…' : 'Tap to speak'}
                            </span>
                        </div>
                    </div>
                )}

                <p className={styles.scanFooter}>
                    <ExternalLink size={12} aria-hidden="true" />
                    Powered by SaathiCare · This information is shown only when this QR code is scanned
                </p>
            </main>
        </div>
    )
}
