'use client';

/**
 * SaathiAvatar - 3D avatar wrapper that renders the GLB model
 * in a Three.js canvas, with Web Speech API for TTS/STT,
 * and connects to the existing LLM APIs.
 *
 * Emotion-aware: detects emotions from both the user's spoken words
 * and the AI's response text, animating the avatar accordingly.
 */

import { Suspense, useState, useEffect, useRef, useCallback } from 'react';
import { Canvas } from '@react-three/fiber';
import { CameraControls, ContactShadows, Environment, Loader } from '@react-three/drei';
import { Mic, MicOff, Volume2, VolumeX, ChevronDown, ChevronUp, Maximize2, Minimize2 } from 'lucide-react';
import { AvatarModel, type AvatarMessage, type LipSyncCue } from './AvatarModel';
import { detectEmotion } from './emotionDetector';
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
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const recognitionRef = useRef<any>(null);
    const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
    const utteranceRef = useRef<SpeechSynthesisUtterance | null>(null);
    const userEmotionTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    // ─── Stable ref for the reactToUserEmotion fn so closures are never stale ───
    const reactToUserEmotionRef = useRef<(text: string) => void>(() => { });

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

    // Helper: pick the best available voice
    const pickVoice = useCallback(() => {
        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) return null;
        return (
            voices.find(v => v.lang === 'en-IN') ||
            voices.find(v => v.lang === 'en-US') ||
            voices.find(v => v.lang.startsWith('en')) ||
            voices[0]
        );
    }, []);

    // ALWAYS speak + animate when a new AI response arrives
    useEffect(() => {
        if (!latestResponse) return;
        if (typeof window === 'undefined' || !('speechSynthesis' in window)) return;

        let isActive = true;
        let startTimeout: ReturnType<typeof setTimeout> | null = null;
        if (intervalRef.current) clearInterval(intervalRef.current);

        const estimatedDuration = Math.max(2, latestResponse.split(/\s+/).length * 0.35);
        const lipsync = generateLipSync(latestResponse, estimatedDuration);

        // 🎭 Detect emotion from AI response → drives expression AND body animation
        const { expression, animation } = detectEmotion(latestResponse);

        const audioObj = { currentTime: 0, duration: estimatedDuration };

        const avatarMsg: AvatarMessage = {
            text: latestResponse,
            lipsync,
            facialExpression: expression,
            animation,
            audio: audioObj,
        };

        setMessage(avatarMsg);
        setIsSpeaking(true);
        onSpeakingChange?.(true);

        const doSpeak = () => {
            if (!isActive) return;

            // Give the browser engine a tiny breather after cancel() to avoid the Chrome freeze bug
            const utterance = new SpeechSynthesisUtterance(latestResponse);
            utterance.lang = 'en-IN';
            utterance.rate = 0.9;
            utterance.pitch = 1.05;
            utterance.volume = voiceEnabled ? 1 : 0;

            const voice = pickVoice();
            if (voice) utterance.voice = voice;

            utteranceRef.current = utterance;

            utterance.onstart = () => {
                if (!isActive) return;
                window.speechSynthesis.resume(); // Safari/Chrome lock workaround
            };

            utterance.onend = () => {
                if (!isActive) return;
                setIsSpeaking(false);
                onSpeakingChange?.(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
                setMessage({
                    text: '',
                    lipsync: { mouthCues: [] },
                    facialExpression: expression,
                    animation: 'Idle',
                    audio: { currentTime: 0, duration: 0 },
                });
                // Auto-listen after speaking finishes
                if (onVoiceInput) {
                    startTimeout = setTimeout(() => {
                        if (!isActive) return;
                        const rec = createRecognitionFn();
                        if (rec) {
                            recognitionRef.current = rec;
                            rec.lang = 'en-IN';
                            rec.onresult = (e: { results: { [k: number]: { [k: number]: { transcript: string } } } }) => {
                                const text = e.results[0][0].transcript;
                                if (text) {
                                    reactToUserEmotionRef.current(text);
                                    onVoiceInput(text);
                                }
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
                if (!isActive) return;
                setIsSpeaking(false);
                onSpeakingChange?.(false);
                if (intervalRef.current) clearInterval(intervalRef.current);
            };

            window.speechSynthesis.speak(utterance);
        };

        const voices = window.speechSynthesis.getVoices();
        if (voices.length === 0) {
            const onVoicesReady = () => {
                window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady);
                if (isActive) startTimeout = setTimeout(doSpeak, 150);
            };
            window.speechSynthesis.addEventListener('voiceschanged', onVoicesReady);
            startTimeout = setTimeout(() => {
                window.speechSynthesis.removeEventListener('voiceschanged', onVoicesReady);
                if (isActive) doSpeak();
            }, 500);
        } else {
            startTimeout = setTimeout(doSpeak, 150);
        }

        // Drive the simulated audio timer for lip-sync
        intervalRef.current = setInterval(() => {
            audioObj.currentTime += 0.1;
            if (audioObj.currentTime >= estimatedDuration) {
                if (intervalRef.current) clearInterval(intervalRef.current);
            }
        }, 100);

        return () => {
            isActive = false;
            if (startTimeout) clearTimeout(startTimeout);
            if (intervalRef.current) clearInterval(intervalRef.current);
            setIsSpeaking(false);
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [latestResponse]);

    // When voiceEnabled toggles while speaking, cancel and re-speak with updated volume
    useEffect(() => {
        if (utteranceRef.current && isSpeaking && latestResponse) {
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

    // Speech recognition factory (pure, no deps on state)
    const createRecognitionFn = useCallback(() => {
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

    /**
     * 🎭 Detect emotion from user's spoken words and show an empathetic
     * avatar reaction for 3 seconds, then return to Idle.
     * The AI response that follows will override this with its own emotion.
     */
    const reactToUserEmotion = useCallback((text: string) => {
        if (isSpeaking) return; // don't interrupt ongoing AI speech

        const { expression, animation, emotion } = detectEmotion(text);
        if (emotion === 'neutral') return; // no special reaction for neutral speech

        console.log(`[SaathiAvatar] User emotion: ${emotion} → expression=${expression}, animation=${animation}`);

        if (userEmotionTimerRef.current) clearTimeout(userEmotionTimerRef.current);

        // Show empathetic expression immediately
        setMessage({
            text: '',
            lipsync: { mouthCues: [] },
            facialExpression: expression,
            animation,
            audio: { currentTime: 0, duration: 0 },
        });

        // Return to Idle after 3 s (AI response will naturally override sooner)
        userEmotionTimerRef.current = setTimeout(() => {
            setMessage(prev => {
                if (prev && prev.text === '') {
                    return {
                        text: '',
                        lipsync: { mouthCues: [] },
                        facialExpression: 'default',
                        animation: 'Idle',
                        audio: { currentTime: 0, duration: 0 },
                    };
                }
                return prev;
            });
        }, 3000);
    }, [isSpeaking]);

    // Keep the ref in sync with the latest version of the callback
    useEffect(() => {
        reactToUserEmotionRef.current = reactToUserEmotion;
    }, [reactToUserEmotion]);

    const toggleListening = useCallback(() => {
        if (isListening && recognitionRef.current) {
            recognitionRef.current.stop();
            setIsListening(false);
            return;
        }
        const recognition = createRecognitionFn();
        if (!recognition) { setStatusText('Voice not supported'); return; }
        recognitionRef.current = recognition;
        recognition.lang = 'en-IN';
        recognition.onresult = (e) => {
            const text = e.results[0][0].transcript;
            if (text) {
                reactToUserEmotion(text); // 🎭 react to user's emotional words
                if (onVoiceInput) onVoiceInput(text);
            }
            setIsListening(false);
        };
        recognition.onend = () => setIsListening(false);
        recognition.onerror = () => { setIsListening(false); setStatusText('Could not hear you'); };
        recognition.start();
        setIsListening(true);
    }, [isListening, createRecognitionFn, onVoiceInput, reactToUserEmotion]);

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
            {/* Controls row - hidden in fullscreen mode */}
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

            {/* Voice controls - in fullscreen they overlay the bottom of the canvas */}
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
