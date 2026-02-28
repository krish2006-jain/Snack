import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getNextFallback } from '@/lib/companion-fallbacks';

interface Params {
    params: Promise<{ token: string }>;
}

const GUARDIAN_REPLIES = [
    "Thank you so much for being there. I'm on my way — should be there in about 10 minutes.",
    "Please stay with him. He responds well to calm, slow speech in Hindi.",
    "Can you describe where exactly you are? I'll share with the caretaker too.",
    "Thank you! His favourite phrase is 'Sab theek hai' — it calms him down.",
    "I've alerted Nurse Anita as well. She might reach before me.",
    "You're an angel. Please don't leave him alone. I'm coming as fast as I can.",
];

const CARETAKER_REPLIES = [
    "Thank you for contacting me. I'm his daily caretaker. Is he responsive?",
    "Please check if he seems dehydrated — offer him water if possible.",
    "I'm 15 minutes away. Please keep him seated if you can.",
    "Does he have his ID bracelet on? It's brown leather with his name.",
    "Thank you so much. I know his routine well — I'll be there shortly.",
    "If he seems agitated, try speaking softly and saying 'Ravi ji, Anita aa rahi hai'.",
];

let guardianIdx = 0;
let caretakerIdx = 0;

export async function POST(req: Request, { params }: Params) {
    try {
        const { token } = await params;
        const body = await req.json();
        const { channel, message, history } = body;

        if (!message || !channel) {
            return NextResponse.json({ error: 'Message and channel required.' }, { status: 400 });
        }

        const db = getDb();

        // Verify token
        const profile = db.prepare(`
            SELECT pp.*, u.name
            FROM patient_profiles pp
            JOIN users u ON u.id = pp.user_id
            WHERE pp.qr_token = ?
        `).get(token) as Record<string, unknown> | undefined;

        if (!profile) {
            return NextResponse.json({ error: 'Invalid QR code.' }, { status: 404 });
        }

        // AI Channel — use companion logic with emergency context
        if (channel === 'ai') {
            const patientName = (profile.preferred_name || profile.name || 'Ravi') as string;
            const careStage = (profile.care_stage || 'moderate') as string;
            const allergies = profile.allergies ? JSON.parse(profile.allergies as string) : [];
            const conditions = profile.conditions ? JSON.parse(profile.conditions as string) : [];
            const medications = profile.medications ? JSON.parse(profile.medications as string) : [];

            const systemPrompt = `You are Saathi, an AI emergency assistant for ${patientName}'s care network. A Good Samaritan has found ${patientName} and is communicating with you via a QR code scan.

PATIENT MEDICAL CONTEXT:
- Name: ${patientName} (full: ${profile.name})
- Care stage: ${careStage} Alzheimer's
- Blood type: ${profile.blood_type || 'B+'}
- Allergies: ${allergies.join(', ') || 'Penicillin, Shellfish'}
- Conditions: ${conditions.join(', ') || "Moderate Alzheimer's, Hypertension, Diabetes"}
- Medications: ${medications.join(', ') || 'Donepezil 10mg, Amlodipine 5mg, Metformin 500mg'}
- Address: ${profile.address || 'Sector 15, Noida'}
- Emergency Instructions: ${profile.emergency_instructions || 'Speak slowly, keep calm, do not leave alone'}

YOUR ROLE:
- Help the Good Samaritan understand the patient's condition
- Provide relevant medical info when asked (allergies, medications, conditions)
- Give calming instructions: speak slowly, use Hindi/English, say familiar names
- If asked about medication timing or dosages, share what's on file
- Reassure the samaritan that family has been notified
- Keep responses clear, concise (under 80 words), and helpful
- NEVER diagnose or give new medical advice — only share existing records
- If the situation sounds dangerous, advise calling 112 immediately`;

            const apiKey = process.env.GEMINI_API_KEY;
            if (apiKey) {
                try {
                    const { GoogleGenerativeAI } = await import('@google/generative-ai');
                    const genAI = new GoogleGenerativeAI(apiKey);
                    const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' });

                    const chatHistory = (history || []).slice(-10).map((m: { role: string; content: string }) => ({
                        role: m.role === 'user' ? 'user' : 'model',
                        parts: [{ text: m.content }],
                    }));

                    const chat = model.startChat({
                        history: chatHistory,
                        systemInstruction: systemPrompt,
                    });

                    const result = await chat.sendMessage(message);
                    const reply = result.response.text();

                    return NextResponse.json({
                        reply,
                        sender: 'Saathi AI',
                        channel: 'ai',
                    });
                } catch (aiErr) {
                    console.warn('[Scan Chat] Gemini failed, using fallback:', aiErr);
                }
            }

            // Fallback
            const fallback = getNextFallback();
            return NextResponse.json({
                reply: fallback,
                sender: 'Saathi AI',
                channel: 'ai',
                fallback: true,
            });
        }

        // Guardian Channel — simulated replies
        if (channel === 'guardian') {
            const reply = GUARDIAN_REPLIES[guardianIdx % GUARDIAN_REPLIES.length];
            guardianIdx++;
            return NextResponse.json({
                reply,
                sender: 'Priya Sharma',
                channel: 'guardian',
            });
        }

        // Caretaker Channel — simulated replies
        if (channel === 'caretaker') {
            const reply = CARETAKER_REPLIES[caretakerIdx % CARETAKER_REPLIES.length];
            caretakerIdx++;
            return NextResponse.json({
                reply,
                sender: 'Nurse Anita',
                channel: 'caretaker',
            });
        }

        return NextResponse.json({ error: 'Invalid channel.' }, { status: 400 });
    } catch (err) {
        console.error('[API /scan/:token/chat]', err);
        return NextResponse.json(
            { error: 'Something went wrong.' },
            { status: 500 }
        );
    }
}
