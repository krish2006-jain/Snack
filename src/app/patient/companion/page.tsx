'use client';

import { useState } from 'react';
import { Heart, ArrowLeft } from 'lucide-react';
import Link from 'next/link';
import { useSession } from '@/lib/useSession';
import SaathiAvatar from '@/components/avatar/SaathiAvatar';
import styles from './companion.module.css';

const warmResponses = [
    "I'm right here. What's on your mind today?",
    "That's a lovely thought. Tell me more about it.",
    "It's completely okay to feel that way. I'm listening.",
];

export default function CompanionVoicePage() {
    const { user } = useSession();
    const [hasStarted, setHasStarted] = useState(false);
    const [voiceOn, setVoiceOn] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [latestAiResponse, setLatestAiResponse] = useState('');
    const [userCaption, setUserCaption] = useState('');
    const [aiCaption, setAiCaption] = useState('Tap to start talking');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Trigger greeting once the user has tapped to start
    const handleStart = () => {
        setHasStarted(true);

        // Safari/Chrome autoplay unlock: must speak in direct response to user click
        if (typeof window !== 'undefined' && 'speechSynthesis' in window) {
            const unlockUtterance = new SpeechSynthesisUtterance('');
            unlockUtterance.volume = 0; // Silent unlock
            window.speechSynthesis.speak(unlockUtterance);
        }

        const userName = user?.name?.split(' ')[0] || 'friend';
        const greeting = `Namaste ${userName}! I'm Saathi. I'm here to listen. How are you feeling today?`;
        setLatestAiResponse(greeting);
        setAiCaption(greeting);
    };

    const handleVoiceInput = async (text: string) => {
        if (!text) return;
        setUserCaption(text);
        setAiCaption('');
        setIsTyping(true);

        try {
            const res = await fetch('/api/companion/chat', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    patientId: user?.id || 'anonymous',
                    message: text,
                    history: [{ role: 'user', content: text }],
                }),
            });
            const data = await res.json();
            const aiText = data.reply || warmResponses[Math.floor(Math.random() * warmResponses.length)];

            setLatestAiResponse(aiText);
            setAiCaption(aiText);
            setIsTyping(false);
        } catch {
            const aiText = warmResponses[Math.floor(Math.random() * warmResponses.length)];
            setLatestAiResponse(aiText);
            setAiCaption(aiText);
            setIsTyping(false);
        }
    };

    const handleSpeakingChange = (speaking: boolean) => {
        setIsSpeaking(speaking);
    };

    // Determine status for the indicator
    const statusText = isSpeaking ? 'Speaking' : isListening ? 'Listening' : isTyping ? 'Thinking' : 'Ready';
    const dotClass = isSpeaking
        ? styles.speaking
        : isListening
            ? styles.listening
            : isTyping
                ? styles.thinking
                : '';

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <Link href="/patient" className="btn btn--icon" aria-label="Go back">
                    <ArrowLeft size={24} />
                </Link>
                <div className={styles.aiAvatar}>
                    <Heart size={20} color="white" fill="white" />
                </div>
                <div className={styles.headerInfo}>
                    <h1 className={styles.aiName}>Talk to Saathi</h1>
                    <p className={styles.aiStatus}>Your AI companion</p>
                </div>
            </div>

            {/* Main content area */}
            <div className={styles.mainArea}>
                {/* Status indicator */}
                {hasStarted && (
                    <div className={styles.statusBar}>
                        <span className={`${styles.statusDot} ${dotClass}`} />
                        <span className={styles.statusLabel}>{statusText}</span>
                    </div>
                )}

                {/* Avatar taking up the main screen */}
                <div className={styles.avatarContainer}>
                    {!hasStarted ? (
                        <div className={styles.startOverlay} onClick={handleStart}>
                            <div className={styles.startPulse}>
                                <Heart size={48} color="white" fill="rgba(255,255,255,0.9)" />
                            </div>
                            <h2 className={styles.startTitle}>Tap to wake Saathi</h2>
                            <p className={styles.startDesc}>Tap anywhere to start talking with your AI companion</p>
                        </div>
                    ) : (
                        <SaathiAvatar
                            isTyping={isTyping}
                            latestResponse={latestAiResponse}
                            voiceEnabled={voiceOn}
                            onVoiceToggle={setVoiceOn}
                            onVoiceInput={handleVoiceInput}
                            collapsible={false}
                            compact={false}
                            fullscreen={true}
                            onSpeakingChange={handleSpeakingChange}
                        />
                    )}
                </div>

                {/* Captions area at the bottom */}
                <div className={styles.captionsPanel} aria-live="polite">
                    {userCaption && <p className={styles.captionUser}>You: {userCaption}</p>}
                    {isTyping ? (
                        <div className={styles.captionThinking}>
                            Thinking<span /><span /><span />
                        </div>
                    ) : (
                        <p className={styles.captionAi}>{aiCaption}</p>
                    )}
                </div>
            </div>
        </div>
    );
}
