import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getNextFallback } from '@/lib/companion-fallbacks';

interface Params {
    params: Promise<{ token: string }>;
}

const GUARDIAN_REPLIES = [
    "Thank you so much for being there. I'm on my way - should be there in about 10 minutes.",
    "Please stay with him. He responds well to calm, slow speech in Hindi.",
    "Can you describe where exactly you are? I'll share with the caretaker too.",
    "Thank you! His favourite phrase is 'Sab theek hai' - it calms him down.",
    "I've alerted Nurse Anita as well. She might reach before me.",
    "You're an angel. Please don't leave him alone. I'm coming as fast as I can.",
];

const CARETAKER_REPLIES = [
    "Thank you for contacting me. I'm his daily caretaker. Is he responsive?",
    "Please check if he seems dehydrated - offer him water if possible.",
    "I'm 15 minutes away. Please keep him seated if you can.",
    "Does he have his ID bracelet on? It's brown leather with his name.",
    "Thank you so much. I know his routine well - I'll be there shortly.",
    "If he seems agitated, try speaking softly and saying 'Ravi ji, Anita aa rahi hai'.",
];

const LYZR_AGENT_ID = '69a32cba675a8bc0688d0ce8';
const LYZR_API_KEY = 'sk-default-Eo8gWWPsUcfUtXwqinR4sPSPqb1vCIk5';
const LYZR_ENDPOINT = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';

export async function POST(req: Request, { params }: Params) {
    try {
        const { token } = await params;
        const body = await req.json();
        const { channel, message, history } = body;

        if (!message || !channel) {
            return NextResponse.json({ error: 'Message and channel required.' }, { status: 400 });
        }

        const db = getDb();

        // Verify token and fetch patient profile from SQLite
        const profile = db.prepare(`
            SELECT pp.*, u.name
            FROM patient_profiles pp
            JOIN users u ON u.id = pp.user_id
            WHERE pp.qr_token = ?
        `).get(token) as Record<string, unknown> | undefined;

        if (!profile) {
            return NextResponse.json({ error: 'Invalid QR code.' }, { status: 404 });
        }

        // ─── AI Channel - Lyzr Agent (Saathi AI) ─────────────────────────────
        if (channel === 'ai') {
            const patientName = (profile.preferred_name || profile.name || 'the patient') as string;
            const careStage = (profile.care_stage || 'moderate') as string;

            // Parse JSONified arrays stored in SQLite, fall back to demo defaults
            const allergies: string[] = profile.allergies
                ? JSON.parse(profile.allergies as string)
                : ['Penicillin', 'Shellfish'];
            const conditions: string[] = profile.conditions
                ? JSON.parse(profile.conditions as string)
                : ["Moderate Alzheimer's", 'Hypertension', 'Diabetes'];
            const medications: string[] = profile.medications
                ? JSON.parse(profile.medications as string)
                : ['Donepezil 10mg', 'Amlodipine 5mg', 'Metformin 500mg'];

            // ── Build the patient context block ────────────────────────────
            // Lyzr has the agent role & instructions pre-configured in Studio.
            // We embed the patient record at the start of the FIRST message so
            // the agent can reason over it immediately.
            const medicalContext = [
                `[PATIENT MEDICAL RECORD - ${patientName}]`,
                `Full name: ${profile.name as string}`,
                `Care stage: ${careStage} Alzheimer's`,
                `Blood type: ${(profile.blood_type as string) || 'B+'}`,
                `Known allergies: ${allergies.join(', ')}`,
                `Medical conditions: ${conditions.join(', ')}`,
                `Current medications: ${medications.join(', ')}`,
                `Emergency instructions: ${(profile.emergency_instructions as string) || 'Speak slowly, keep calm, do not leave alone'}`,
                `Address: ${(profile.address as string) || 'Sector 15, Noida'}`,
                `[END OF RECORD]`,
                '',
                `A Good Samaritan has found ${patientName} and is asking for help:`,
            ].join('\n');

            // Session ID is scoped to this token so Lyzr's memory carries across turns
            const sessionId = `scan-${token}-ai`;

            // Prepend medical context only on the first turn
            const isFirstTurn = !history || (history as unknown[]).length === 0;
            const lyzrMessage = isFirstTurn ? `${medicalContext}\n${message}` : message;

            try {
                const lyzrRes = await fetch(LYZR_ENDPOINT, {
                    method: 'POST',
                    headers: {
                        'Content-Type': 'application/json',
                        'x-api-key': LYZR_API_KEY,
                    },
                    body: JSON.stringify({
                        agent_id: LYZR_AGENT_ID,
                        session_id: sessionId,
                        message: lyzrMessage,
                        user_id: `samaritan-${token}`,
                    }),
                });

                if (!lyzrRes.ok) {
                    const errText = await lyzrRes.text();
                    console.warn('[Scan Chat] Lyzr API error:', lyzrRes.status, errText);
                    throw new Error(`Lyzr API returned ${lyzrRes.status}`);
                }

                // Lyzr v3 response shape: { response: string, ... }
                const lyzrData = await lyzrRes.json() as {
                    response?: string;
                    message?: string;
                    output?: string;
                };

                const reply =
                    lyzrData.response ||
                    lyzrData.message ||
                    lyzrData.output ||
                    'I received your message but could not form a response. Please call 112 if this is an emergency.';

                return NextResponse.json({
                    reply,
                    sender: 'Saathi AI',
                    channel: 'ai',
                });
            } catch (lyzrErr) {
                console.warn('[Scan Chat] Lyzr Agent failed, using fallback:', lyzrErr);
                const fallback = getNextFallback();
                return NextResponse.json({
                    reply: fallback,
                    sender: 'Saathi AI',
                    channel: 'ai',
                    fallback: true,
                });
            }
        }

        // ─── Guardian Channel - simulated replies ─────────────────────────────
        if (channel === 'guardian') {
            const reply = GUARDIAN_REPLIES[Math.floor(Math.random() * GUARDIAN_REPLIES.length)];
            return NextResponse.json({ reply, sender: 'Priya Sharma', channel: 'guardian' });
        }

        // ─── Caretaker Channel - simulated replies ────────────────────────────
        if (channel === 'caretaker') {
            const reply = CARETAKER_REPLIES[Math.floor(Math.random() * CARETAKER_REPLIES.length)];
            return NextResponse.json({ reply, sender: 'Nurse Anita', channel: 'caretaker' });
        }

        return NextResponse.json({ error: 'Invalid channel.' }, { status: 400 });
    } catch (err) {
        console.error('[API /scan/:token/chat]', err);
        return NextResponse.json({ error: 'Something went wrong.' }, { status: 500 });
    }
}
