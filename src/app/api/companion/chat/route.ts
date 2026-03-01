import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getNextFallback } from '@/lib/companion-fallbacks';
import { getSessionUser } from '@/lib/session';
import { mockPeople, mockPatient } from '@/lib/mock-data/patient';

const LYZR_AGENT_ID = '69a3d18272ae16298991c2ed';
const LYZR_API_KEY = 'sk-default-LOAJucbt33x48yhM6raYUTCbektTHAyu';
const LYZR_ENDPOINT = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';

/**
 * Build the full People Wallet context string from DB or mock data.
 * This is sent on EVERY turn so the Lyzr agent always has relationship data.
 */
function buildPeopleWalletContext(
    dbPeople: { name: string; relationship: string; bio: string | null }[]
): string {
    // Use DB data if available, otherwise fall back to mock People Wallet
    const peopleList = dbPeople.length > 0
        ? dbPeople
        : mockPeople.map(p => ({ name: p.name, relationship: p.relationship, bio: p.bio }));

    if (peopleList.length === 0) return 'No people wallet data provided.';

    return peopleList.map(p =>
        `- ${p.name} (${p.relationship}): ${p.bio || 'No details available.'}`
    ).join('\n');
}

/**
 * Build full patient context block for the Lyzr Memory Companion agent.
 * Includes patient profile, schedule, and complete People Wallet.
 */
function buildPatientContext(
    profile: Record<string, unknown> | undefined,
    scheduleStr: string,
    peopleWalletContext: string,
): string {
    const patientName = (profile?.preferred_name || profile?.name || mockPatient.name) as string;
    const careStage = (profile?.care_stage || mockPatient.stage) as string;

    const allergies: string[] = profile?.allergies
        ? JSON.parse(profile.allergies as string)
        : mockPatient.allergies;
    const conditions: string[] = profile?.conditions
        ? JSON.parse(profile.conditions as string)
        : [mockPatient.condition];
    const medications: string[] = profile?.medications
        ? JSON.parse(profile.medications as string)
        : mockPatient.medications;

    const age = profile?.dob
        ? Math.floor((Date.now() - new Date(profile.dob as string).getTime()) / (365.25 * 24 * 3600 * 1000))
        : mockPatient.age;

    const lines = [
        `[PATIENT PROFILE - ${patientName.toUpperCase()}]`,
        `Full name: ${(profile?.name as string) || mockPatient.name}`,
        `Preferred name / nickname: ${patientName}`,
        `Age: ${age}`,
        `Cognitive stage: ${careStage} Alzheimer's`,
        `Known allergies: ${allergies.join(', ')}`,
        `Medical conditions: ${conditions.join(', ')}`,
        `Current medications: ${medications.join(', ')}`,
        `Today's schedule: ${scheduleStr}`,
        `Location: ${(profile?.address as string) || mockPatient.location}`,
        `Favourite food: Dal chawal with mango pickle`,
        `Hobbies: Cricket, morning prayer, chai, listening to old Hindi songs`,
        '',
        `[PEOPLE WALLET - RELATIONSHIPS & MEMORIES]`,
        `The following people are part of the patient's life. Use ONLY this information when responding about family, relationships, or people. Never invent details not listed here:`,
        '',
        peopleWalletContext,
        '',
        `[IMPORTANT INSTRUCTIONS]`,
        `- ALWAYS reference the People Wallet data above when the patient asks about family, people, or relationships.`,
        `- When the patient feels sad, lonely, confused, or low - provide warm emotional support, validate their emotions, and gently reference positive memories involving the people listed above.`,
        `- Keep responses warm, simple (2-4 sentences), and reassuring.`,
        `- Never fabricate names, relationships, or memories not listed in the People Wallet.`,
        `- If asked about someone not in the wallet, gently say you don't have that information yet.`,
        `- You are Saathi, a caring memory companion - not a doctor. Do not diagnose or prescribe.`,
        `[END OF CONTEXT]`,
    ];

    return lines.join('\n');
}

export async function POST(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
        }

        const pid = session.patientId;

        // ── Fetch patient profile from DB ──
        const db = getDb();
        const profile = db.prepare(`
            SELECT pp.*, u.name
            FROM patient_profiles pp
            JOIN users u ON u.id = pp.user_id
            WHERE pp.user_id = ?
        `).get(pid) as Record<string, unknown> | undefined;

        // ── Fetch today's schedule ──
        const today = new Date().toISOString().split('T')[0];
        const tasks = db.prepare(
            'SELECT title, scheduled_time, is_completed FROM schedule_tasks WHERE patient_id = ? AND date = ? ORDER BY scheduled_time'
        ).all(pid, today) as { title: string; scheduled_time: string; is_completed: number }[];

        const scheduleStr = tasks.length > 0
            ? tasks.map(t => `${t.scheduled_time} - ${t.title} (${t.is_completed ? 'done' : 'pending'})`).join(', ')
            : 'Morning Medicine at 8:00, Breakfast at 8:30, Walking at 9:30, Lunch at 12:30, Evening Medicine at 18:00';

        // ── Fetch People Wallet (critical for memory/relationship queries) ──
        const people = db.prepare(
            'SELECT name, relationship, bio FROM people_cards WHERE patient_id = ? ORDER BY display_order'
        ).all(pid) as { name: string; relationship: string; bio: string | null }[];

        const peopleWalletContext = buildPeopleWalletContext(people);
        const patientContext = buildPatientContext(profile, scheduleStr, peopleWalletContext);

        const sessionId = `companion-${pid}`;

        // ── Always prepend context on EVERY message ──
        // The Lyzr agent's instructions say: "Use ONLY the patient data provided in the current prompt context."
        // and "Treat each interaction as dependent only on the provided context."
        // So we MUST send context every turn for the agent to work correctly.
        const lyzrMessage = `${patientContext}\n\nPatient says: ${message}`;

        try {
            console.log('[Companion Chat] Sending message to Lyzr agent with People Wallet context (%d people)', people.length || mockPeople.length);

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
                    user_id: pid,
                }),
            });

            if (!lyzrRes.ok) {
                const errText = await lyzrRes.text();
                console.warn('[Companion Chat] Lyzr API error:', lyzrRes.status, errText);
                throw new Error(`Lyzr API returned ${lyzrRes.status}`);
            }

            const lyzrData = await lyzrRes.json() as {
                response?: string;
                message?: string;
                output?: string;
            };

            const reply = lyzrData.response || lyzrData.message || lyzrData.output || getNextFallback();
            const hasAlert = reply.includes('[ALERT');

            console.log('[Companion Chat] Lyzr agent replied successfully. Alert:', hasAlert);
            return NextResponse.json({ reply, alert: hasAlert });

        } catch (lyzrErr) {
            console.warn('[Companion Chat] Lyzr Agent failed, using fallback:', lyzrErr);
            const fallbackReply = getNextFallback();
            return NextResponse.json({ reply: fallbackReply, alert: false, fallback: true });
        }

    } catch (err) {
        console.error('[API /companion/chat]', err);
        return NextResponse.json(
            { error: 'Something went wrong. Try again?' },
            { status: 500 }
        );
    }
}
