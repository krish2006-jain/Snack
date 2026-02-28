'use client';

import { useState, useRef, useEffect } from 'react';
import { AppLayout } from '@/components/ui/AppLayout';
import { chatHistory, quickMessages, ChatMessageData } from '@/lib/mock-data/caretaker';
import { Send, Circle } from 'lucide-react';

function formatTime(iso: string) {
    return new Date(iso).toLocaleTimeString('en-IN', { hour: '2-digit', minute: '2-digit' });
}
function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('en-IN', { weekday: 'long', day: 'numeric', month: 'long' });
}

export default function CaretakerChatPage() {
    const [messages, setMessages] = useState<ChatMessageData[]>(chatHistory);
    const [input, setInput] = useState('');
    const bottomRef = useRef<HTMLDivElement>(null);

    useEffect(() => {
        bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
    }, [messages]);

    const send = (text: string) => {
        if (!text.trim()) return;
        const msg: ChatMessageData = {
            id: `msg-${Date.now()}`,
            senderId: 'ct-001',
            senderName: 'Anita Desai',
            senderRole: 'caretaker',
            content: text.trim(),
            timestamp: new Date().toISOString(),
            isOwn: true,
            status: 'sent',
        };
        setMessages(prev => [...prev, msg]);
        setInput('');
    };

    const handleSubmit = (e: React.FormEvent) => {
        e.preventDefault();
        send(input);
    };

    const currentDate = formatDate(chatHistory[0].timestamp);

    return (
        <AppLayout role="caretaker" userName="Anita Desai" alertCount={1}>
            <div style={{
                height: 'calc(100vh - var(--header-height))',
                display: 'flex',
                flexDirection: 'column',
                maxWidth: 680,
                margin: '0 auto',
            }}>

                {/* Chat header */}
                <div style={{
                    padding: '16px 24px',
                    background: 'var(--bg-surface)',
                    borderBottom: '1px solid var(--border-subtle)',
                    display: 'flex',
                    alignItems: 'center',
                    gap: 14,
                    flexShrink: 0,
                }}>
                    {/* Avatar */}
                    <div style={{ position: 'relative' }}>
                        <div style={{
                            width: 44, height: 44, borderRadius: '50%',
                            background: 'linear-gradient(135deg, #7C3AED, #E9D5FF)',
                            display: 'flex', alignItems: 'center', justifyContent: 'center',
                            fontSize: 18, fontWeight: 700, color: '#fff',
                        }}>
                            P
                        </div>
                        {/* Online dot */}
                        <div style={{
                            position: 'absolute', bottom: 1, right: 1,
                            width: 12, height: 12, borderRadius: '50%',
                            background: 'var(--color-success)',
                            border: '2px solid var(--bg-surface)',
                        }} />
                    </div>
                    <div>
                        <p style={{ fontSize: 15, fontWeight: 700, color: 'var(--text-heading)' }}>Priya Sharma</p>
                        <p style={{ fontSize: 12, color: 'var(--color-success)', display: 'flex', alignItems: 'center', gap: 4, fontWeight: 500 }}>
                            <Circle size={7} fill="var(--color-success)" /> Online
                        </p>
                    </div>
                    <div style={{ marginLeft: 'auto' }}>
                        <span className="badge badge--purple" style={{ fontSize: 11 }}>Guardian · Ravi's daughter</span>
                    </div>
                </div>

                {/* Messages area */}
                <div style={{
                    flex: 1,
                    overflowY: 'auto',
                    padding: '20px 24px',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                    background: 'var(--bg-surface-soft)',
                }}>
                    {/* Date divider */}
                    <div style={{ textAlign: 'center', margin: '8px 0 16px' }}>
                        <span style={{ fontSize: 12, color: 'var(--text-muted)', background: 'var(--bg-surface)', padding: '4px 12px', borderRadius: 999, border: '1px solid var(--border-subtle)' }}>
                            {currentDate}
                        </span>
                    </div>

                    {messages.map((msg, i) => {
                        const isOwn = msg.isOwn;
                        const prevMsg = messages[i - 1];
                        const showSender = !prevMsg || prevMsg.senderRole !== msg.senderRole;

                        return (
                            <div key={msg.id} style={{
                                display: 'flex',
                                flexDirection: 'column',
                                alignItems: isOwn ? 'flex-end' : 'flex-start',
                                marginTop: showSender ? 12 : 3,
                            }}>
                                {showSender && !isOwn && (
                                    <p style={{ fontSize: 11, color: 'var(--text-muted)', fontWeight: 600, marginBottom: 4, paddingLeft: 4 }}>
                                        {msg.senderName}
                                    </p>
                                )}
                                <div style={{
                                    maxWidth: '75%',
                                    padding: '10px 14px',
                                    borderRadius: isOwn ? '18px 18px 4px 18px' : '18px 18px 18px 4px',
                                    background: isOwn ? 'var(--color-primary)' : 'var(--bg-surface)',
                                    color: isOwn ? '#fff' : 'var(--text-heading)',
                                    fontSize: 14,
                                    lineHeight: 1.6,
                                    border: isOwn ? 'none' : '1px solid var(--border-subtle)',
                                    boxShadow: isOwn ? '0 2px 12px rgba(124,58,237,0.2)' : '0 1px 4px rgba(0,0,0,0.06)',
                                }}>
                                    {msg.content}
                                </div>
                                <p style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, paddingLeft: isOwn ? 0 : 4, paddingRight: isOwn ? 4 : 0 }}>
                                    {formatTime(msg.timestamp)}
                                    {isOwn && <span style={{ marginLeft: 6 }}>{msg.status === 'read' ? '✓✓' : '✓'}</span>}
                                </p>
                            </div>
                        );
                    })}
                    <div ref={bottomRef} />
                </div>

                {/* Quick messages */}
                <div style={{
                    padding: '10px 24px 0',
                    background: 'var(--bg-surface)',
                    borderTop: '1px solid var(--border-subtle)',
                    flexShrink: 0,
                }}>
                    <div style={{ display: 'flex', gap: 8, overflowX: 'auto', paddingBottom: 10 }}>
                        {quickMessages.map(qm => (
                            <button
                                key={qm}
                                onClick={() => send(qm)}
                                style={{
                                    flexShrink: 0,
                                    padding: '6px 14px',
                                    background: 'var(--bg-surface-soft)',
                                    border: '1px solid var(--border-subtle)',
                                    borderRadius: 999,
                                    fontSize: 13,
                                    fontWeight: 500,
                                    color: 'var(--text-heading)',
                                    cursor: 'pointer',
                                    whiteSpace: 'nowrap',
                                    transition: 'all 0.15s',
                                }}
                                onMouseOver={e => { (e.target as HTMLElement).style.borderColor = 'var(--color-primary)'; (e.target as HTMLElement).style.color = 'var(--color-primary)'; }}
                                onMouseOut={e => { (e.target as HTMLElement).style.borderColor = 'var(--border-subtle)'; (e.target as HTMLElement).style.color = 'var(--text-heading)'; }}
                            >
                                {qm}
                            </button>
                        ))}
                    </div>
                </div>

                {/* Input */}
                <form
                    onSubmit={handleSubmit}
                    style={{
                        padding: '12px 24px 16px',
                        background: 'var(--bg-surface)',
                        display: 'flex',
                        gap: 10,
                        alignItems: 'center',
                        flexShrink: 0,
                    }}
                >
                    <input
                        type="text"
                        className="form-input"
                        value={input}
                        onChange={e => setInput(e.target.value)}
                        placeholder="Type a message to Priya…"
                        style={{ flex: 1, minHeight: 44 }}
                        aria-label="Message input"
                    />
                    <button
                        type="submit"
                        className="btn btn--primary"
                        style={{ width: 44, height: 44, padding: 0, borderRadius: 12, flexShrink: 0 }}
                        aria-label="Send message"
                        disabled={!input.trim()}
                    >
                        <Send size={18} />
                    </button>
                </form>
            </div>
        </AppLayout>
    );
}
