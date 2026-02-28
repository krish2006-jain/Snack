'use client'

import { useState, useRef, useEffect } from 'react'
import Link from 'next/link'
import {
    Send, MapPin, Image, ChevronLeft, Circle, Phone
} from 'lucide-react'
import { mockQRProfiles, mockChatMessages } from '@/lib/mock-data'
import type { ChatMessage } from '@/types'
import styles from './chat.module.css'

interface Props {
    params: { token: string }
}

const QUICK_REPLIES = [
    'I found Ravi',
    'They seem confused',
    'They are safe',
    'I\'m staying with them',
    'Where are you?',
]

export default function ChatPage({ params }: Props) {
    const profile = mockQRProfiles[params.token]
    const patient = profile?.patient

    const [messages, setMessages] = useState<ChatMessage[]>(mockChatMessages)
    const [input, setInput] = useState('')
    const [sending, setSending] = useState(false)
    const bottomRef = useRef<HTMLDivElement>(null)
    const inputRef = useRef<HTMLInputElement>(null)

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' })
    }, [messages])

    function formatTime(iso: string) {
        const d = new Date(iso)
        return d.toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true })
    }

    async function sendMessage(content: string) {
        if (!content.trim() || sending) return
        setSending(true)
        setInput('')

        const newMsg: ChatMessage = {
            id: `msg-${Date.now()}`,
            sender: 'You',
            senderRole: 'samaritan',
            content: content.trim(),
            timestamp: new Date().toISOString(),
            isOwn: true,
        }
        setMessages((prev) => [...prev, newMsg])

        // Simulate guardian reply after delay
        await new Promise((r) => setTimeout(r, 1800))
        const autoReply: ChatMessage = {
            id: `msg-${Date.now()}-reply`,
            sender: patient ? 'Priya Sharma' : 'Family',
            senderRole: 'guardian',
            content: 'Thank you for being there. I\'m on my way — should be there in about 10 minutes.',
            timestamp: new Date().toISOString(),
            isOwn: false,
        }
        setMessages((prev) => [...prev, autoReply])
        setSending(false)
    }

    function handleSend() { sendMessage(input) }
    function handleKey(e: React.KeyboardEvent) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); handleSend() }
    }

    function shareLocation() {
        if (navigator.geolocation) {
            navigator.geolocation.getCurrentPosition(
                (pos) => {
                    const { latitude, longitude } = pos.coords
                    sendMessage(`📍 My location: https://maps.google.com/?q=${latitude},${longitude}`)
                },
                () => sendMessage('I tried to share my location but it was denied.')
            )
        }
    }

    return (
        <div className={styles.page}>
            {/* Header */}
            <header className={styles.header} role="banner">
                <Link
                    href={`/scan/${params.token}`}
                    className={styles.backBtn}
                    aria-label="Back to patient profile"
                >
                    <ChevronLeft size={20} aria-hidden="true" />
                </Link>
                <div className={styles.headerInfo}>
                    <div className={styles.headerAvatar} aria-hidden="true">
                        {patient ? patient.name.split(' ').map((n) => n[0]).join('') : '?'}
                    </div>
                    <div className={styles.headerText}>
                        <span className={styles.headerName}>
                            {patient ? patient.name : 'Patient'}
                        </span>
                        <span className={styles.headerStatus}>
                            <Circle size={8} className={styles.onlineDot} aria-hidden="true" />
                            Chatting with family
                        </span>
                    </div>
                </div>
                {patient && (
                    <a
                        href={`tel:${mockQRProfiles[params.token]?.emergencyContacts[0]?.phone}`}
                        className={styles.callBtn}
                        aria-label="Call primary contact"
                    >
                        <Phone size={18} aria-hidden="true" />
                    </a>
                )}
            </header>

            {/* Chat messages */}
            <main className={styles.chatArea} role="log" aria-live="polite" aria-label="Chat messages">
                <div className={styles.chatIntro}>
                    <p className={styles.chatIntroText}>
                        This is a live chat with {patient?.name ?? 'the patient'}'s family.
                        They can see your messages immediately.
                    </p>
                </div>

                {messages.map((msg) => (
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

                {sending && (
                    <div className={`${styles.messageBubble} ${styles.bubbleOther}`}>
                        <div className={styles.senderAvatar} aria-hidden="true">P</div>
                        <div className={styles.bubbleContent}>
                            <div className={styles.typingDots} aria-label="Family is typing">
                                <span />
                                <span />
                                <span />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </main>

            {/* Input area */}
            <footer className={styles.inputArea} role="form" aria-label="Send a message">
                {/* Quick actions */}
                <div className={styles.quickActions}>
                    <button
                        type="button"
                        className={styles.iconAction}
                        onClick={shareLocation}
                        aria-label="Share your location"
                    >
                        <MapPin size={18} aria-hidden="true" />
                        <span>Location</span>
                    </button>
                    <button
                        type="button"
                        className={styles.iconAction}
                        aria-label="Send a photo"
                        onClick={() => sendMessage('[Photo shared]')}
                    >
                        <Image size={18} aria-hidden="true" />
                        <span>Photo</span>
                    </button>
                </div>

                {/* Quick replies */}
                <div className={styles.quickReplies} role="list" aria-label="Quick reply options">
                    {QUICK_REPLIES.map((qr) => (
                        <button
                            key={qr}
                            type="button"
                            role="listitem"
                            className={styles.quickReply}
                            onClick={() => sendMessage(qr)}
                            disabled={sending}
                        >
                            {qr}
                        </button>
                    ))}
                </div>

                {/* Text input */}
                <div className={styles.inputRow}>
                    <input
                        ref={inputRef}
                        type="text"
                        className={styles.textInput}
                        placeholder="Type a message…"
                        value={input}
                        onChange={(e) => setInput(e.target.value)}
                        onKeyDown={handleKey}
                        disabled={sending}
                        aria-label="Message input"
                        id="chat-input"
                    />
                    <button
                        type="button"
                        className={styles.sendBtn}
                        onClick={handleSend}
                        disabled={!input.trim() || sending}
                        aria-label="Send message"
                        id="chat-send"
                    >
                        <Send size={18} aria-hidden="true" />
                    </button>
                </div>
            </footer>
        </div>
    )
}
