/**
 * emotionDetector.ts
 *
 * Detects the dominant emotion in a text string and returns the
 * corresponding 3D avatar facial expression and body animation name.
 *
 * Facial expressions must match keys in AvatarModel.tsx `facialExpressions`.
 * Animation names must match clip names inside /models/animations.glb.
 * If a specific animation clip doesn't exist the AvatarModel gracefully
 * falls back to whatever clip is available (Idle / Talking_1).
 */

export interface EmotionResult {
    expression: string;  // key from facialExpressions map in AvatarModel
    animation: string;   // clip name from animations.glb
    emotion: string;     // human-readable label e.g. "angry"
}

/** Ordered from most-specific to least-specific so the first match wins. */
const EMOTION_RULES: Array<{
    emotion: string;
    expression: string;
    animation: string;
    patterns: RegExp;
}> = [
        // ─── ANGRY ───────────────────────────────────────────────────────────────
        {
            emotion: 'angry',
            expression: 'angry',
            animation: 'Angry',
            patterns: /\b(angry|anger|furious|mad|rage|frustrated|frustrating|hate|irritated|annoyed|outraged|livid|irate)\b/i,
        },
        // ─── SAD ─────────────────────────────────────────────────────────────────
        {
            emotion: 'sad',
            expression: 'sad',
            animation: 'Sad_Idle',
            patterns: /\b(sad|sadness|unhappy|upset|depressed|depression|miss|missing|lonely|alone|cry|crying|tears|heartbroken|pain|hurt|grief|grieve|loss|lost|difficult|hard time|mourn|mourn|sorrow|sorrowful|gloomy|hopeless)\b/i,
        },
        // ─── SURPRISED ───────────────────────────────────────────────────────────
        {
            emotion: 'surprised',
            expression: 'surprised',
            animation: 'Surprised',
            patterns: /\b(wow|amazing|incredible|unbelievable|shocked|surprise|surprised|astonished|astonishing|oh my|oh wow|really\?|can't believe|cannot believe|mind-blown|mind blown)\b/i,
        },
        // ─── ANXIOUS / SCARED ────────────────────────────────────────────────────
        {
            emotion: 'anxious',
            expression: 'surprised',   // wide eyes = anxious look
            animation: 'Terrified',
            patterns: /\b(scared|afraid|fear|fearful|anxious|anxiety|nervous|panic|panicking|terrified|terror|worry|worried|dread|dreading|nightmare|phobia)\b/i,
        },
        // ─── HAPPY / JOYFUL ──────────────────────────────────────────────────────
        {
            emotion: 'happy',
            expression: 'smile',
            animation: 'Happy_Idle',
            patterns: /\b(happy|happiness|joy|joyful|excited|exciting|thrilled|delighted|wonderful|love|glad|grateful|thankful|great|fantastic|excellent|yay|cheers|celebrate|celebrating|bliss|blessed)\b/i,
        },
        // ─── FUNNY / PLAYFUL ─────────────────────────────────────────────────────
        {
            emotion: 'funny',
            expression: 'funnyFace',
            animation: 'Talking_1',
            patterns: /\b(haha|lol|funny|joke|silly|laugh|laughing|hilarious|giggle|goofy|playful|fun|enjoy|enjoying)\b/i,
        },
        // ─── CALM / NEUTRAL (default) ────────────────────────────────────────────
        {
            emotion: 'neutral',
            expression: 'smile',
            animation: 'Talking_1',
            patterns: /(?:)/,   // always matches — must stay last
        },
    ];

/**
 * Analyse `text` and return the best matching emotion result.
 * The last rule (neutral) always matches, so this never returns undefined.
 */
export function detectEmotion(text: string): EmotionResult {
    const lower = text.toLowerCase();
    for (const rule of EMOTION_RULES) {
        if (rule.patterns.test(lower)) {
            return {
                emotion: rule.emotion,
                expression: rule.expression,
                animation: rule.animation,
            };
        }
    }
    // Unreachable — neutral rule always matches
    return { emotion: 'neutral', expression: 'smile', animation: 'Talking_1' };
}

/** Convenience: return only the expression string */
export function detectExpression(text: string): string {
    return detectEmotion(text).expression;
}

/** Convenience: return only the animation name */
export function detectAnimation(text: string): string {
    return detectEmotion(text).animation;
}
