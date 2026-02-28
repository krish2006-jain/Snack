import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getNextFallback } from '@/lib/companion-fallbacks';
import { getSessionUser } from '@/lib/session';

const LYZR_AGENT_ID = '69a3425868ac87eb486672ac';
const LYZR_API_KEY = 'sk-default-Eo8gWWPsUcfUtXwqinR4sPSPqb1vCIk5';
const LYZR_ENDPOINT = 'https://agent-prod.studio.lyzr.ai/v3/inference/chat/';

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

        // Get patient context from DB
        const db = getDb();
        const profile = db.prepare(`
            SELECT pp.*, u.name
            FROM patient_profiles pp
            JOIN users u ON u.id = pp.user_id
            WHERE pp.user_id = ?
        `).get(pid) as Record<string, unknown> | undefined;

        const patientName = (profile?.preferred_name || profile?.name || 'Ravi') as string;
        const careStage = (profile?.care_stage || 'moderate') as string;
        const allergies = profile?.allergies ? JSON.parse(profile.allergies as string) : [];
        const conditions = profile?.conditions ? JSON.parse(profile.conditions as string) : [];
        const medications = profile?.medications ? JSON.parse(profile.medications as string) : [];

        // Get today's schedule
        const today = new Date().toISOString().split('T')[0];
        const tasks = db.prepare(
            'SELECT title, scheduled_time, is_completed FROM schedule_tasks WHERE patient_id = ? AND date = ? ORDER BY scheduled_time'
        ).all(pid, today) as { title: string; scheduled_time: string; is_completed: number }[];

        const scheduleStr = tasks.length > 0
            ? tasks.map(t => `${t.scheduled_time} — ${t.title} (${t.is_completed ? 'done' : 'pending'})`).join(', ')
            : 'Morning Medicine at 8:00, Breakfast at 8:30, Walking at 9:30, Lunch at 12:30, Evening Medicine at 18:00';

        // Get people wallet (Crucial for Lyzr Agent memory rules)
        const people = db.prepare(
            'SELECT name, relationship, bio FROM people_cards WHERE patient_id = ? ORDER BY display_order'
        ).all(pid) as { name: string; relationship: string; bio: string | null }[];

        let peopleWalletContext = 'No people wallet data provided.';
        if (people.length > 0) {
            peopleWalletContext = people.map(p => `- ${p.name} (${p.relationship}): ${p.bio || 'No details available.'}`).join('\\n');
        }

        const age = profile?.dob
            ? Math.floor((Date.now() - new Date(profile.dob as string).getTime()) / (365.25 * 24 * 3600 * 1000))
            : 'Unknown';

        // Build context block to append to the message (context dependency rule)
        const medicalContext = [
            `[PATIENT PROFILE - ${patientName.toUpperCase()}]`,
            `Full name: ${profile?.name || 'Ravi Sharma'}`,
            `Age: ${age}`,
            `Cognitive stage: ${careStage} Alzheimer's`,
            `Known allergies: ${allergies.join(', ') || 'Penicillin, Shellfish'}`,
            `Medical conditions: ${conditions.join(', ') || "Moderate Alzheimer's, Hypertension, Diabetes"}`,
            `Current medications: ${medications.join(', ') || 'Donepezil 10mg, Amlodipine 5mg, Metformin 500mg'}`,
            `Today's schedule: ${scheduleStr}`,
            `Favourite food: Dal chawal with mango pickle`,
            `Hobbies: Cricket, morning prayer, chai, teaching`,
            '',
            `[PEOPLE WALLET - MEMORIES & RELATIONSHIPS]`,
            peopleWalletContext,
            `[END OF CONTEXT]`
        ].join('\\n');

        const sessionId = `companion-${pid}`;

        // Prepend contextual instruction + context on the latest message to ensure adherence
        const isFirstTurn = !history || history.length <= 1;
        const lyzrMessage = isFirstTurn ? `${medicalContext}\\n\\nPatient says: ${message}` : message;

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
