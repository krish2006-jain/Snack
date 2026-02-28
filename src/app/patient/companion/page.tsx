'use client';

import { useState, useRef, useCallback } from 'react';
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

interface ChatMessage {
    role: 'user' | 'assistant';
    content: string;
}

export default function CompanionVoicePage() {
    const { user, token } = useSession();
    const [hasStarted, setHasStarted] = useState(false);
    const [voiceOn, setVoiceOn] = useState(true);
    const [isTyping, setIsTyping] = useState(false);
    const [latestAiResponse, setLatestAiResponse] = useState('');
    const [userCaption, setUserCaption] = useState('');
    const [aiCaption, setAiCaption] = useState('Tap to start talking');
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);

    // Full conversation history for context-aware Lyzr agent responses
    const conversationHistory = useRef<ChatMessage[]>([]);

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
        const greeting = `Namaste ${userName}! I'm Saathi, your memory companion. I know all about your family and the people who love you. How are you feeling today?`;
        setLatestAiResponse(greeting);
        setAiCaption(greeting);

        // Record the greeting in conversation history
        conversationHistory.current.push({ role: 'assistant', content: greeting });
    };

    const handleVoiceInput = useCallback(async (text: string) => {
        if (!text) return;
        setUserCaption(text);
        setAiCaption('');
        setIsTyping(true);

        // Add user message to history
        conversationHistory.current.push({ role: 'user', content: text });

        try {
            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            // Attach auth token for session validation on the server
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('/api/companion/chat', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    patientId: user?.id || 'anonymous',
                    message: text,
                    history: conversationHistory.current,
                }),
            });
            const data = await res.json();
            const aiText = data.reply || warmResponses[Math.floor(Math.random() * warmResponses.length)];

            // Record AI response in history
            conversationHistory.current.push({ role: 'assistant', content: aiText });

            setLatestAiResponse(aiText);
            setAiCaption(aiText);
            setIsTyping(false);

            // If the API flagged an alert (emotional distress detected), log it
            if (data.alert) {
                console.log('[Companion] Alert triggered — emotional distress detected in conversation');
            }
        } catch (err) {
            console.warn('[Companion] API call failed, using warm fallback:', err);
            const aiText = warmResponses[Math.floor(Math.random() * warmResponses.length)];
            conversationHistory.current.push({ role: 'assistant', content: aiText });
            setLatestAiResponse(aiText);
            setAiCaption(aiText);
            setIsTyping(false);
        }
    }, [user?.id, token]);

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
