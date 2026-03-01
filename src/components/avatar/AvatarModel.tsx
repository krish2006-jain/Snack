'use client';

/**
 * 3D Avatar Model - loads the GLB model with morph targets,
 * viseme lip-sync, facial expressions, and animations.
 * Ported from Haven/frontend/src/components/Avatar.jsx
 */

import { useEffect, useRef, useState } from 'react';
import { useAnimations, useGLTF } from '@react-three/drei';
import { useFrame } from '@react-three/fiber';
import * as THREE from 'three';

/* ═══ Facial Expressions ═══ */
const facialExpressions: Record<string, Record<string, number>> = {
    default: {},
    smile: {
        browInnerUp: 0.17,
        eyeSquintLeft: 0.4,
        eyeSquintRight: 0.44,
        noseSneerLeft: 0.17,
        noseSneerRight: 0.14,
        mouthPressLeft: 0.61,
        mouthPressRight: 0.41,
    },
    sad: {
        mouthFrownLeft: 1,
        mouthFrownRight: 1,
        mouthShrugLower: 0.78,
        browInnerUp: 0.45,
        eyeSquintLeft: 0.72,
        eyeSquintRight: 0.75,
        eyeLookDownLeft: 0.5,
        eyeLookDownRight: 0.5,
        jawForward: 1,
    },
    surprised: {
        eyeWideLeft: 0.5,
        eyeWideRight: 0.5,
        jawOpen: 0.35,
        mouthFunnel: 1,
        browInnerUp: 1,
    },
    angry: {
        browDownLeft: 1,
        browDownRight: 1,
        eyeSquintLeft: 1,
        eyeSquintRight: 1,
        jawForward: 1,
        jawLeft: 1,
        mouthShrugLower: 1,
        noseSneerLeft: 1,
        noseSneerRight: 0.42,
        eyeLookDownLeft: 0.16,
        eyeLookDownRight: 0.16,
        cheekSquintLeft: 1,
        cheekSquintRight: 1,
        mouthClose: 0.23,
        mouthFunnel: 0.63,
        mouthDimpleRight: 1,
    },
    funnyFace: {
        jawLeft: 0.63,
        mouthPucker: 0.53,
        noseSneerLeft: 1,
        noseSneerRight: 0.39,
        mouthLeft: 1,
        eyeLookUpLeft: 1,
        eyeLookUpRight: 1,
        cheekPuff: 1,
        mouthDimpleLeft: 0.41,
        mouthRollLower: 0.32,
        mouthSmileLeft: 0.35,
        mouthSmileRight: 0.35,
    },
    crazy: {
        browInnerUp: 0.9,
        jawForward: 1,
        noseSneerLeft: 0.57,
        noseSneerRight: 0.51,
        eyeLookDownLeft: 0.39,
        eyeLookUpRight: 0.40,
        eyeLookInLeft: 0.96,
        eyeLookInRight: 0.96,
        jawOpen: 0.96,
        mouthDimpleLeft: 0.96,
        mouthDimpleRight: 0.96,
        mouthStretchLeft: 0.28,
        mouthStretchRight: 0.29,
        mouthSmileLeft: 0.56,
        mouthSmileRight: 0.38,
        tongueOut: 0.96,
    },
};

/* ═══ Viseme Mapping ═══ */
const corresponding: Record<string, string> = {
    A: 'viseme_PP',
    B: 'viseme_kk',
    C: 'viseme_I',
    D: 'viseme_AA',
    E: 'viseme_O',
    F: 'viseme_U',
    G: 'viseme_FF',
    H: 'viseme_TH',
    X: 'viseme_PP',
};

/* ═══ Types ═══ */
export interface LipSyncCue {
    start: number;
    end: number;
    value: string;
}

export interface AvatarMessage {
    text: string;
    lipsync: { mouthCues: LipSyncCue[] };
    facialExpression: string;
    animation: string;
    audio: { currentTime: number; duration: number };
}

interface AvatarModelProps {
    message: AvatarMessage | null;
    onMessagePlayed?: () => void;
}

/* ═══ Component ═══ */
export function AvatarModel({ message, onMessagePlayed }: AvatarModelProps) {
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const { nodes, materials, scene } = useGLTF('/models/6732180e5415f67e067badca.glb') as any;
    const { animations } = useGLTF('/models/animations.glb');

    const group = useRef<THREE.Group>(null);
    const { actions, mixer } = useAnimations(animations, group);

    const [animation, setAnimation] = useState(
        animations.find((a) => a.name === 'Idle') ? 'Idle' : animations[0]?.name || 'Idle'
    );

    const [lipsync, setLipsync] = useState<{ mouthCues: LipSyncCue[] } | null>(null);
    const [blink, setBlink] = useState(false);
    const [facialExpression, setFacialExpression] = useState('default');
    const [audio, setAudio] = useState<{ currentTime: number; duration: number } | null>(null);

    // React to message changes
    useEffect(() => {
        if (!message) {
            setAnimation('Idle');
            setFacialExpression('default');
            setLipsync(null);
            setAudio(null);
            return;
        }
        setAnimation(message.animation || 'Talking_1');
        setFacialExpression(message.facialExpression || 'smile');
        setLipsync(message.lipsync);
        if (message.audio) {
            setAudio(message.audio);
        }
    }, [message]);

    // Play current animation
    useEffect(() => {
        if (!actions[animation]) return;
        actions[animation]
            .reset()
            .fadeIn(mixer.stats.actions.inUse === 0 ? 0 : 0.5)
            .play();
        return () => { actions[animation]?.fadeOut(0.5); };
    }, [animation, actions, mixer]);

    // Lerp morph targets toward a value
    const lerpMorphTarget = (target: string, value: number, speed = 0.1) => {
        scene.traverse((child: THREE.Object3D) => {
            const mesh = child as THREE.SkinnedMesh;
            if (mesh.isSkinnedMesh && mesh.morphTargetDictionary && mesh.morphTargetInfluences) {
                const index = mesh.morphTargetDictionary[target];
                if (index === undefined || mesh.morphTargetInfluences[index] === undefined) return;
                mesh.morphTargetInfluences[index] = THREE.MathUtils.lerp(
                    mesh.morphTargetInfluences[index],
                    value,
                    speed
                );
            }
        });
    };

    // Per-frame updates: expressions + lip-sync
    useFrame(() => {
        if (!nodes.EyeLeft?.morphTargetDictionary) return;

        // Apply facial expression morph targets
        Object.keys(nodes.EyeLeft.morphTargetDictionary).forEach((key) => {
            if (key === 'eyeBlinkLeft' || key === 'eyeBlinkRight') return;
            const mapping = facialExpressions[facialExpression];
            if (mapping && mapping[key]) {
                lerpMorphTarget(key, mapping[key], 0.1);
            } else {
                lerpMorphTarget(key, 0, 0.1);
            }
        });

        // Blink
        lerpMorphTarget('eyeBlinkLeft', blink ? 1 : 0, 0.5);
        lerpMorphTarget('eyeBlinkRight', blink ? 1 : 0, 0.5);

        // Lip-sync
        const appliedMorphTargets: string[] = [];
        if (message && lipsync && audio) {
            const currentAudioTime = audio.currentTime;
            for (let i = 0; i < lipsync.mouthCues.length; i++) {
                const cue = lipsync.mouthCues[i];
                if (currentAudioTime >= cue.start && currentAudioTime <= cue.end) {
                    const viseme = corresponding[cue.value];
                    if (viseme) {
                        appliedMorphTargets.push(viseme);
                        lerpMorphTarget(viseme, 1, 0.2);
                    }
                    break;
                }
            }
        }

        Object.values(corresponding).forEach((viseme) => {
            if (!appliedMorphTargets.includes(viseme)) {
                lerpMorphTarget(viseme, 0, 0.1);
            }
        });
    });

    // Random blink
    useEffect(() => {
        let blinkTimeout: ReturnType<typeof setTimeout>;
        const nextBlink = () => {
            blinkTimeout = setTimeout(() => {
                setBlink(true);
                setTimeout(() => {
                    setBlink(false);
                    nextBlink();
                }, 200);
            }, THREE.MathUtils.randInt(1000, 5000));
        };
        nextBlink();
        return () => clearTimeout(blinkTimeout);
    }, []);

    return (
        <group dispose={null} ref={group}>
            <primitive object={nodes.Hips} />
            <skinnedMesh name="Wolf3D_Body" geometry={nodes.Wolf3D_Body.geometry} material={materials.Wolf3D_Body} skeleton={nodes.Wolf3D_Body.skeleton} />
            <skinnedMesh name="Wolf3D_Outfit_Bottom" geometry={nodes.Wolf3D_Outfit_Bottom.geometry} material={materials.Wolf3D_Outfit_Bottom} skeleton={nodes.Wolf3D_Outfit_Bottom.skeleton} />
            <skinnedMesh name="Wolf3D_Outfit_Footwear" geometry={nodes.Wolf3D_Outfit_Footwear.geometry} material={materials.Wolf3D_Outfit_Footwear} skeleton={nodes.Wolf3D_Outfit_Footwear.skeleton} />
            <skinnedMesh name="Wolf3D_Outfit_Top" geometry={nodes.Wolf3D_Outfit_Top.geometry} material={materials.Wolf3D_Outfit_Top} skeleton={nodes.Wolf3D_Outfit_Top.skeleton} />
            <skinnedMesh name="Wolf3D_Hair" geometry={nodes.Wolf3D_Hair.geometry} material={materials.Wolf3D_Hair} skeleton={nodes.Wolf3D_Hair.skeleton} />
            <skinnedMesh name="EyeLeft" geometry={nodes.EyeLeft.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeLeft.skeleton} morphTargetDictionary={nodes.EyeLeft.morphTargetDictionary} morphTargetInfluences={nodes.EyeLeft.morphTargetInfluences} />
            <skinnedMesh name="EyeRight" geometry={nodes.EyeRight.geometry} material={materials.Wolf3D_Eye} skeleton={nodes.EyeRight.skeleton} morphTargetDictionary={nodes.EyeRight.morphTargetDictionary} morphTargetInfluences={nodes.EyeRight.morphTargetInfluences} />
            <skinnedMesh name="Wolf3D_Head" geometry={nodes.Wolf3D_Head.geometry} material={materials.Wolf3D_Skin} skeleton={nodes.Wolf3D_Head.skeleton} morphTargetDictionary={nodes.Wolf3D_Head.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Head.morphTargetInfluences} />
            <skinnedMesh name="Wolf3D_Teeth" geometry={nodes.Wolf3D_Teeth.geometry} material={materials.Wolf3D_Teeth} skeleton={nodes.Wolf3D_Teeth.skeleton} morphTargetDictionary={nodes.Wolf3D_Teeth.morphTargetDictionary} morphTargetInfluences={nodes.Wolf3D_Teeth.morphTargetInfluences} />
        </group>
    );
}

useGLTF.preload('/models/6732180e5415f67e067badca.glb');
useGLTF.preload('/models/animations.glb');
