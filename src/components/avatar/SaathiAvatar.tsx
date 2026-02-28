'use client';

/**
 * SaathiAvatar — 3D avatar wrapper that renders the GLB model
 * in a Three.js canvas, with Web Speech API for TTS/STT,
 * and connects to the existing LLM APIs.
 */

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Loader } from '@react-three/drei';
import { Mic, MicOff, Volume2, VolumeX, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { AvatarModel, type AvatarMessage, type LipSyncCue } from './AvatarModel';
import styles from './avatar.module.css';

/* ═══ Lip-sync generator ═══ */
function generateLipSync(text: string, duration: number): { mouthCues: LipSyncCue[] } {
    const words = text.trim().split(/\s+/);
    const cues: LipSyncCue[] = [];
    if (words.length === 0) return { mouthCues: [] };
    const interval = duration / words.length;
    const visemeKeys = ['A', 'B', 'C', 'D', 'E', 'F', 'G', 'H'];
    let t = 0;
    for (let i = 0; i < words.length; i++) {
        cues.push({ start: t, end: t + interval, value: visemeKeys[i % visemeKeys.length] });
        t += interval;
    }
    return { mouthCues: cues };
}

/* ═══ Sentiment → expression ═══ */
function detectExpression(text: string): string {
    const lower = text.toLowerCase();
    if (/\b(sorry|sad|miss|pain|hurt|cry|loss|lost|difficult|hard time)\b/.test(lower)) return 'sad';
    if (/\b(wow|amazing|great news|wonderful|fantastic|oh!|really)\b/.test(lower)) return 'surprised';
    if (/\b(haha|laugh|funny|joke|smile|happy|joy|love|glad|wonderful)\b/.test(lower)) return 'smile';
    return 'smile';
}

/* ═══ 3D Scene (ported from Experience.jsx) ═══ */
function AvatarScene({ message }: { message: AvatarMessage | null }) {
    const cameraControls = useRef<ReturnType<typeof CameraControls> | null>(null);

    useEffect(() => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const ctrl = cameraControls.current as any;
        if (ctrl?.setLookAt) {
            ctrl.setLookAt(0, 1.5, 1.5, 0, 1.5, 0);
        }
    }, []);

    return (
        <>
            {/* @ts-expect-error - CameraControls ref typing */}
            <CameraControls ref={cameraControls} />
            <Environment preset="sunset" />
            <AvatarModel message={message} />
            <ContactShadows opacity={0.7} />
        </>
    );
}

/* ═══ Props ═══ */
interface SaathiAvatarProps {
    isTyping?: boolean;
    latestResponse?: string;
    voiceEnabled?: boolean;
    onVoiceToggle?: (enabled: boolean) => void;
    onVoiceInput?: (text: string) => void;
    compact?: boolean;
    collapsible?: boolean;
    statusText?: string;
    fullscreen?: boolean;
    onSpeakingChange?: (isSpeaking: boolean) => void;
}

/* ═══ Main Component ═══ */
export default function SaathiAvatar({
    isTyping = false,
    latestResponse,
    voiceEnabled = false,
    onVoiceToggle,
    onVoiceInput,
    compact = false,
    collapsible = true,
    statusText: externalStatus,
    fullscreen = false,
    onSpeakingChange,
}: SaathiAvatarProps) {
    const [collapsed, setCollapsed] = useState(false);
    const [expanded, setExpanded] = useState(false);
    const [isSpeaking, setIsSpeaking] = useState(false);
    const [isListening, setIsListening] = useState(false);
    const [message, setMessage] = useState<AvatarMessage | null>(null);
    const [statusText, setStatusText] = useState('');
    const lastSpokenIdRef = useRef<number>(0);
    const responseIdRef = useRef<number>(0);
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);

    // Status text
    useEffect(() => {
        if (externalStatus) setStatusText(externalStatus);
        else if (isSpeaking) setStatusText('Speaking…');
        else if (isListening) setStatusText('Listening…');
        else if (isTyping) setStatusText('Thinking…');
        else setStatusText('Ready to help');
    }, [externalStatus, isSpeaking, isListening, isTyping]);

    // When isTyping → show thinking animation
    useEffect(() => {
        if (isTyping) {
            setMessage({
                text: '',
                lipsync: { mouthCues: [] },
                facialExpression: 'default',
                animation: 'Idle',
                audio: { currentTime: 0, duration: 0 },
            });
        }
    }, [isTyping]);

    // Track response changes with an ID counter so repeated text still triggers
    useEffect(() => {
        if (latestResponse) {
            responseIdRef.current += 1;
        }
    }, [latestResponse]);

    // Helper: pick the best available voice
    const pickVoice = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return null;
        // Prefer en-IN, then en-US, then any English, then default
        return (
            voices.find(v => v.lang === 'en-IN') ||
            voices.find(v => v.lang === 'en-US') ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0]
        );
    }, []);

    // Chrome keepalive ref — Chrome pauses long utterances after ~15s
    const keepAliveRef = useRef<ReturnType<typeof setInterval> | null>(null);

    // ALWAYS speak + animate when a new AI response arrives
    useEffect(() => {
        if (!latestResponse) return;
        const currentId = responseIdRef.current;
        if (currentId === lastSpokenIdRef.current) return;
        lastSpokenIdRef.current = currentId;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        // Only cancel if there is something in the queue or speaking, to avoid cancelling any unlock sequence
        if (window.speechSynthesis.speaking || window.speechSynthesis.pending) {
            console.log('[SaathiAvatar] Cancelling stuck/previous speech queue');
            window.speechSynthesis.cancel();
        }
        if (intervalRef.current) clearInterval(intervalRef.current);
        if (keepAliveRef.current) clearInterval(keepAliveRef.current);

        const estimatedDuration = Math.max(2, latestResponse.split(/\s+/).length * 0.35);
        const lipsync = generateLipSync(latestResponse, estimatedDuration);
        const expression = detectExpression(latestResponse);

        const audioObj = { currentTime: 0, duration: estimatedDuration };

        // Set avatar to talking animation with lip-sync
        const avatarMsg: AvatarMessage = {
            text: latestResponse,
            lipsync,
            facialExpression: expression,
            animation: 'Talking_1',
            audio: audioObj,
        };
        setMessage(avatarMsg);
        setIsSpeaking(true);
        onSpeakingChange?.(true);

        // Function to actually speak — called after a delay (Chrome bug workaround)
        const doSpeak = () => {
            const utterance = new SpeechSynthesisUtterance(latestResponse);
            utterance.lang = 'en-IN';
            utterance.rate = 0.9;
            utterance.pitch = 1.05;
            utterance.volume = voiceEnabled ? 1 : 0;

            // Try to pick a real voice
            const voice = pickVoice();
            if (voice) utterance.voice = voice;

            utteranceRef.current = utterance;

            utterance.onstart = () => {
                console.log('[SaathiAvatar] TTS onstart fired');
            };

            utterance.onend = () => {
                console.log('[SaathiAvatar] TTS onend fired');
                setIsSpeaking(false);
                onSpeakingChange?.(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (keepAliveRef.current) clearInterval(keepAliveRef.current);
                setMessage({
                    text: '',
                    lipsync: { mouthCues: [] },
                    facialExpression: expression,
                    animation: 'Idle',
                    audio: { currentTime: 0, duration: 0 },
                });
                // Auto-listen after speaking finishes (natural conversation flow)
                if (onVoiceInput && !isListening) {
                    setTimeout(() => {
                        const rec = createRecognition();
                        if (rec) {
                            recognitionRef.current = rec;
                            rec.lang = 'en-IN';
                            rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
                                const text = e.results[0][0].transcript;
                                if (text && onVoiceInput) onVoiceInput(text);
                                setIsListening(false);
                            };
                            rec.onend = () => setIsListening(false);
                            rec.onerror = () => { setIsListening(false); };
                            rec.start();
                            setIsListening(true);
                        }
                    }, 500);
                }
            };
            utterance.onerror = (e) => {
                console.warn('[SaathiAvatar] TTS onerror fired. Error details:', e);
                setIsSpeaking(false);
                onSpeakingChange?.(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                if (keepAliveRef.current) clearInterval(keepAliveRef.current);
            };

            console.log('[SaathiAvatar] Calling speechSynthesis.speak() with voice:', voice?.name || 'default');
            window.speechSynthesis.speak(utterance);

            // Chrome keepalive: resume every 5s to prevent Chrome from pausing
            keepAliveRef.current = setInterval(() => {
                if (window.speechSynthesis.speaking) {
                    window.speechSynthesis.pause();
                    window.speechSynthesis.resume();
                }
            }, 5000);
        };

        // CHROME BUG WORKAROUND: speechSynthesis.cancel() followed immediately by
        // speak() causes the speech to be silently dropped. Add a 150ms delay.
        // Also wait for voices to load if they haven't yet.
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            // Voices not loaded yet — wait for voiceschanged event
            const onVoicesReady = () => {
                window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady);
                setTimeout(doSpeak, 150);
            };
            window.speechSynthesis.addEventListener('voiceschanged', onVoicesReady);
            // Fallback: if voiceschanged never fires (some browsers), try after 500ms
            setTimeout(() => {
                window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady);
                doSpeak();
            }, 500);
        } else {
            // Voices ready — just delay after cancel
            setTimeout(doSpeak, 150);
        }

        // Drive the simulated audio timer for lip-sync
        intervalRef.current = setInterval(() => {
            audioObj.currentTime += 0.1;
            if (audioObj.currentTime >= estimatedDuration) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }, 100);

        return () => {
            console.log('[SaathiAvatar] Cleanup: cancelling TTS');
            if (window.speechSynthesis.speaking) window.speechSynthesis.cancel();
            if (intervalRef.current) clearInterval(intervalRef.current);
            if (keepAliveRef.current) clearInterval(keepAliveRef.current);
            setIsSpeaking(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestResponse, responseIdRef.current]);

    // When voiceEnabled toggles while speaking, cancel and re-speak with updated volume
    useEffect(() => {
        if (utteranceRef.current && isSpeaking && latestResponse) {
            // Cancel current speech and restart with new volume (with Chrome delay)
            window.speechSynthesis.cancel();
            setTimeout(() => {
                const newUtterance = new SpeechSynthesisUtterance(latestResponse);
                newUtterance.lang = 'en-IN';
                newUtterance.rate = 0.9;
                newUtterance.pitch = 1.05;
                newUtterance.volume = voiceEnabled ? 1 : 0;
                const voice = pickVoice();
                if (voice) newUtterance.voice = voice;
                newUtterance.onend = utteranceRef.current!.onend;
                newUtterance.onerror = utteranceRef.current!.onerror;
                utteranceRef.current = newUtterance;
                window.speechSynthesis.speak(newUtterance);
            }, 150);
        }
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [voiceEnabled]);

    // Speech recognition
    const createRecognition = useCallback(() => {
        if (typeof window === 'undefined') return null;
        type SRConstructor = new () => {
            lang: string; start: () => void; stop: () => void;
            onresult: ((e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => void) | null;
            onend: (() => void) | null;
            onerror: ((e: { error: string }) => void) | null;
        };
        const win = window as unknown as { SpeechRecognition?: SRConstructor; webkitSpeechRecognition?: SRConstructor };
        const Ctor = win.SpeechRecognition || win.webkitSpeechRecognition;
        if (!Ctor) return null;
        return new Ctor();
    }, []);

    const toggleListening = useCallback(() => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }
        const recognition = createRecognition();
        if (!recognition) { setStatusText('Voice not supported'); return; }
        recognitionRef.current = recognition;
        recognition.lang = 'en-IN';
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            if (text && onVoiceInput) onVoiceInput(text);
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => { setIsListening(false); setStatusText('Could not hear you'); };
        recognition.start();
        setIsListening(true);
    }, [isListening, createRecognition, onVoiceInput]);

    // Canvas height based on mode
    const canvasHeight = fullscreen ? '100%' : collapsed ? 0 : expanded ? 500 : compact ? 200 : 300;

    if (!fullscreen && collapsed) {
        return (
            <div className={`${styles.avatarWrapper} ${styles.collapsedBar}`}>
                <div className={styles.collapsedContent} onClick={() => setCollapsed(false)}>
                    <span className={styles.collapsedDot} />
                    <span className={styles.collapsedLabel}>Saathi is here</span>
                </div>
                <button className={styles.toggleBtn} onClick={() => setCollapsed(false)} aria-label="Expand avatar">
                    <ChevronDown size={14} />
                </button>
            </div>
        );
    }

    const wrapperClasses = [
        styles.avatarWrapper,
        compact ? styles.compact : '',
        fullscreen ? styles.fullscreenWrapper : '',
    ].filter(Boolean).join(' ');

    return (
        <div className={wrapperClasses}>
            {/* Controls row — hidden in fullscreen mode */}
            {!fullscreen && (
                <div className={styles.controlsRow}>
                    {collapsible && (
                        <button className={styles.toggleBtn} onClick={() => setCollapsed(true)} aria-label="Collapse avatar">
                            <ChevronUp size={14} />
                        </button>
                    )}
                    <span className={`${styles.statusLabel} ${isSpeaking ? styles.speaking : ''}`}>{statusText}</span>
                    <div className={styles.controlsRight}>
                        <button
                            className={styles.toggleBtn}
                            onClick={() => setExpanded(!expanded)}
                            aria-label={expanded ? 'Shrink avatar' : 'Expand avatar'}
                        >
                            {expanded ? <Minimize2 size={14} /> : <Maximize2 size={14} />}
                        </button>
                    </div>
                </div>
            )}

            {/* 3D Canvas */}
            <div
                className={`${styles.canvasContainer} ${fullscreen ? styles.fullscreenCanvas : ''}`}
                style={fullscreen ? { height: '100%' } : { height: canvasHeight }}
            >
                <Canvas
                    shadows
                    camera={{ position: [0, 0, 1], fov: 30 }}
                    style={{ background: 'transparent' }}
                >
                    <Suspense fallback={null}>
                        <AvatarScene message={message} />
                    </Suspense>
                </Canvas>
                <Loader />
            </div>

            {/* Voice controls — in fullscreen they overlay the bottom of the canvas */}
            <div className={`${styles.voiceControls} ${fullscreen ? styles.voiceControlsOverlay : ''}`}>
                {onVoiceInput && (
                    <button
                        className={`${styles.voiceBtn} ${isListening ? styles.active : ''}`}
                        onClick={toggleListening}
                        aria-label={isListening ? 'Stop listening' : 'Start voice input'}
                        title={isListening ? 'Tap to stop' : 'Tap to speak'}
                    >
                        {isListening ? <MicOff size={18} /> : <Mic size={18} />}
                    </button>
                )}
                {onVoiceToggle && (
                    <button
                        className={`${styles.voiceBtnMute} ${voiceEnabled ? styles.active : ''}`}
                        onClick={() => onVoiceToggle(!voiceEnabled)}
                        aria-label={voiceEnabled ? 'Mute voice' : 'Enable voice'}
                        title={voiceEnabled ? 'Voice ON' : 'Voice OFF'}
                    >
                        {voiceEnabled ? <Volume2 size={16} /> : <VolumeX size={16} />}
                    </button>
                )}
            </div>
        </div>
    );
}
