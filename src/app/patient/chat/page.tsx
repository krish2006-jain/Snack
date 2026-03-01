'use client';

import { useState, useRef, useEffect } from 'react';
import { Send, Heart, ArrowLeft } from 'lucide-react';
import { useSession } from '@/lib/useSession';
import Link from 'next/link';
import styles from './chat.module.css';

interface Message {
    id: string;
    role: 'user' | 'ai';
    text: string;
    time: string;
}

const warmResponses = [
    "I'm right here. What's on your mind today?",
    "That's a lovely thought. Tell me more about it.",
    "It's completely okay to feel that way. I'm listening.",
    "Your family called earlier - they love you very much.",
    "Would you like me to remind you of a happy memory?",
    "You are safe and you are home. I'm here with you.",
    "Let's take it one moment at a time. No rush at all.",
    "Shall we talk about your family?",
];

function formatTime() {
    return new Date().toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit', hour12: true });
}

export default function ChatPage() {
    const { user, token } = useSession();
    const userName = user?.name?.split(' ')[0] || 'friend';
    const [messages, setMessages] = useState<Message[]>([
        {
            id: 'm1',
            role: 'ai',
            text: `Namaste ${userName}! I'm Saathi, your companion. I'm here whenever you need to talk, remember something, or just want company. How are you feeling today?`,
            time: '9:00 AM',
        },
    ]);
    const [input, setInput] = useState('');
    const [isTyping, setIsTyping] = useState(false);
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages, isTyping]);

    const sendMessage = async (text: string = input.trim()) => {
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

        try {
            const history = messages.map(m => ({
                role: m.role === 'user' ? 'user' : 'assistant',
                content: m.text,
            }));

            const headers: Record<string, string> = {
                'Content-Type': 'application/json',
            };
            if (token) {
                headers['Authorization'] = `Bearer ${token}`;
            }

            const res = await fetch('/api/companion/chat', {
                method: 'POST',
                headers,
                body: JSON.stringify({
                    patientId: user?.id || 'anonymous',
                    message: text,
                    history,
                }),
            });

            const data = await res.json();
            const aiText = data.reply || warmResponses[Math.floor(Math.random() * warmResponses.length)];

            setMessages((prev) => [...prev, {
                id: `m${Date.now() + 1}`,
                role: 'ai',
                text: aiText,
                time: formatTime(),
            }]);
            setIsTyping(false);
        } catch {
            const aiText = warmResponses[Math.floor(Math.random() * warmResponses.length)];
            setMessages((prev) => [...prev, {
                id: `m${Date.now() + 1}`,
                role: 'ai',
                text: aiText,
                time: formatTime(),
            }]);
            setIsTyping(false);
        }
    };

    const quickReplies = [
        'I feel confused',
        'Where am I?',
        'Who are my family?',
        'Tell me a memory',
    ];

    return (
        <div className={styles.page}>
            <div className={styles.chatHeader}>
                <Link href="/patient" className="btn btn--icon" aria-label="Go back">
                    <ArrowLeft size={24} />
                </Link>
                <div className={styles.aiAvatar}>
                    <Heart size={20} color="white" fill="white" />
                </div>
                <div>
                    <h1 className={styles.aiName}>Chat with Saathi</h1>
                    <p className={styles.aiStatus}>Always here to listen</p>
                </div>
            </div>

            <div className={styles.messages} role="log" aria-live="polite">
                {messages.map((msg) => (
                    <div key={msg.id} className={`${styles.bubble} ${msg.role === 'user' ? styles.bubbleUser : styles.bubbleAi}`}>
                        {msg.role === 'ai' && (
                            <div className={styles.aiDot} aria-hidden="true">
                                <Heart size={11} color="white" fill="white" />
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
                        <div className={styles.aiDot} aria-hidden="true"><Heart size={11} color="white" fill="white" /></div>
                        <div className={styles.bubbleContent}>
                            <div className={styles.typingDots}>
                                <span /><span /><span />
                            </div>
                        </div>
                    </div>
                )}
                <div ref={bottomRef} />
            </div>

            <div className={styles.quickReplies}>
                {quickReplies.map((r) => (
                    <button key={r} onClick={() => sendMessage(r)} className={styles.quickChip}>
                        {r}
                    </button>
                ))}
            </div>

            <div className={styles.inputArea}>
                <input
                    className={styles.textInput}
                    type="text"
                    placeholder="Type a message..."
                    value={input}
                    onChange={(e) => setInput(e.target.value)}
                    onKeyDown={(e) => e.key === 'Enter' && sendMessage()}
                />
                <button
                    className={styles.sendBtn}
                    onClick={() => sendMessage()}
                    disabled={!input.trim()}
                >
                    <Send size={18} />
                </button>
            </div>
        </div>
    );
}
