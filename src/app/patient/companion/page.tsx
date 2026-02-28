'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Mic, Heart, Volume2, VolumeX } from 'lucide-react';
import styles from './companion.module.css';

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    time: string;
}

const warmResponses = [
    "I'm right here, Ravi. What's on your mind today?",
    "That's a lovely thought. Tell me more about it.",
    "It's completely okay to feel that way. I'm listening.",
    "Priya called earlier — she loves you very much.",
    "Would you like me to remind you of a happy memory?",
    "You are safe and you are home. I'm here with you.",
    "Let's take it one moment at a time. No rush at all.",
    "Shall we talk about your grandchildren Aarav and Riya?",
    "You are loved by so many people, Ravi.",
    "Would you like to hear some of your favourite old songs?",
];

const initialMessages: Message[] = [
    {
        id: 'm1',
        role: 'ai',
        text: "Namaste Ravi! I'm Saathi, your companion. I'm here whenever you need to talk, remember something, or just want company. How are you feeling today?",
        time: '9:00 AM',
    },
    {
        id: 'm2',
        role: 'ai',
        text: 'Priya called this morning. She sends her love and will video call you at 5 PM today. You have a lunch at 1 PM too.',
        time: '9:01 AM',
    },
];

function formatTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function CompanionPage() {
    const [messages, setMessages] = useState<Message[]>(initialMessages);
    const [input, setInput] = useState('');
    const [voiceOn, setVoiceOn] = useState(false);
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = (text: string = input.trim()) => {
        if (!text) return;

        const userMsg: Message = {
            id: `m${Date.now()}`,
            role: 'user',
            text,
            time: formatTime(),
        };
        setMessages((prev) => [...prev, userMsg]);
        setInput('');
        setIsTyping(true);

        // Simulate AI response
        setTimeout(() => {
            const aiText = warmResponses[Math.floor(Math.random() * warmResponses.length)];
            const aiMsg: Message = {
                id: `m${Date.now() + 1}`,
                role: 'ai',
                text: aiText,
                time: formatTime(),
            };
            setMessages((prev) => [...prev, aiMsg]);
            setIsTyping(false);

            if (voiceOn && typeof window !== 'undefined' && 'speechSynthesis' in window) {
                const utterance = new SpeechSynthesisUtterance(aiText);
                utterance.lang = 'en-IN';
                utterance.rate = 0.85;
                window.speechSynthesis.speak(utterance);
            }
        }, 1200);
    };

    const handleVoiceInput = () => {
        if (typeof window === 'undefined') return;
        type SRConstructor = new () => { lang: string; start: () => void; onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null };
        const win = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
        const SpeechRecognitionCtor = win.SpeechRecognition || win.webkitSpeechRecognition;
        if (!SpeechRecognitionCtor) {
            alert('Voice input not supported on this browser.');
            return;
        }
        const recognition = new SpeechRecognitionCtor();
        recognition.lang = 'en-IN';
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            sendMessage(text);
        };
        recognition.start();
    };

    const quickReplies = [
        'I feel confused',
        'Where am I?',
        'Who are my family?',
        'Tell me a memory',
    ];

    return (
        <div className={styles.page}>
            {/* Header */}
            <div className={styles.chatHeader}>
                <div className={styles.aiAvatar}>
                    <Heart size={22} color="white" fill="white" />
                </div>
                <div>
                    <h1 className={styles.aiName}>Saathi</h1>
                    <p className={styles.aiStatus}>Your companion · Always here</p>
                </div>
                <button
                    className={styles.voiceToggle}
                    onClick={() => setVoiceOn((v) => !v)}
                    aria-label={voiceOn ? 'Turn off voice response' : 'Turn on voice response'}
                    title={voiceOn ? 'Voice ON' : 'Voice OFF'}
                >
                    {voiceOn ? <Volume2 size={22} color="var(--color-primary)" /> : <VolumeX size={22} color="var(--text-muted)" />}
                </button>
            </div>

            {/* Messages */}
            <div className={styles.messages} role="log" aria-label="Conversation with Saathi" aria-live="polite">
                {messages.map((msg) => (
                    <div
                        key={msg.id}
                        className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}
                    >
                        {msg.role === 'ai' && (
                            <div className={styles.aiDot} aria-hidden="true">
                                <Heart size={12} color="white" fill="white" />
                            </div>
                        )}
                        <div className={styles.bubbleContent}>
                            <p className={styles.bubbleText}>{msg.text}</p>
                            <span className={styles.bubbleTime}>{msg.time}</span>
                        </div>
                    </div>
                ))}

                {isTyping && (
                    <div className={`${styles.bubble} ${styles.bubbleAi}`}>
                        <div className={styles.aiDot} aria-hidden="true">
                            <Heart size={12} color="white" fill="white" />
                        </div>
                        <div className={styles.bubbleContent}>
                            <div className={styles.typingDots} aria-label="Saathi is responding">
                                <span /><span /><span />
                            </div>
                        </div>
                    </div>
                )}

                <div ref={bottomRef} />
            </div>

            {/* Quick replies */}
            <div className={styles.quickReplies} aria-label="Quick reply options">
                {quickReplies.map((r) => (
                    <button
                        key={r}
                        className={styles.quickChip}
                        onClick={() => sendMessage(r)}
                    >
                        {r}
                    </button>
                ))}
            </div>

            {/* Input area */}
            <div className={styles.inputArea}>
                <button
                    className={styles.micBtn}
                    onClick={handleVoiceInput}
                    aria-label="Use voice to speak to Saathi"
                >
                    <Mic size={22} />
                </button>
                <input
                    className={styles.textInput}
                    type="text"
                    placeholder="Type or speak to Saathi…"
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                    aria-label="Message Saathi"
                />
                <button
                    className={styles.sendBtn}
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                    aria-label="Send message"
                >
                    <Send size={20} />
                </button>
            </div>
        </div>
    );
}
