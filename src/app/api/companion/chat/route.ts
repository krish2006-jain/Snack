import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getNextFallback } from '@/lib/companion-fallbacks';

export async function POST(req: Request) {
    try {
        const { patientId, message, history } = await req.json();

        if (!message) {
            return NextResponse.json({ error: 'Message is required.' }, { status: 400 });
        }

        const pid = patientId || 'patient-ravi-001';

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
        ).all(pid) as { title: string; scheduled_time: string; is_completed: number }[];

        const scheduleStr = tasks.length > 0
            ? tasks.map(t => `${t.scheduled_time} — ${t.title} (${t.is_completed ? 'done' : 'pending'})`).join(', ')
            : 'Morning Medicine at 8:00, Breakfast at 8:30, Walking at 9:30, Lunch at 12:30, Evening Medicine at 18:00';

        // Get people
        const people = db.prepare(
            'SELECT name, relationship FROM people_cards WHERE patient_id = ? ORDER BY display_order'
        ).all(pid) as { name: string; relationship: string }[];

        const familyStr = people.length > 0
            ? people.map(p => `${p.name} (${p.relationship})`).join(', ')
            : 'Priya Sharma (daughter), Meera Sharma (wife), Rahul (grandson), Arjun (son)';

        // Build system prompt
        const systemPrompt = `You are Saathi, a warm and compassionate AI companion for ${patientName}, an elderly person with ${careStage}-stage Alzheimer's disease.

PATIENT CONTEXT:
- Name: ${patientName} (full name: ${profile?.name || 'Ravi Sharma'})
- Age: 72 years old, retired mathematics teacher from Jaipur
- Cognitive stage: ${careStage}
- Known allergies: ${allergies.join(', ') || 'Penicillin, Shellfish'}
- Conditions: ${conditions.join(', ') || "Moderate Alzheimer's, Hypertension, Diabetes"}
- Medications: ${medications.join(', ') || 'Donepezil 10mg, Amlodipine 5mg, Metformin 500mg'}
- Family: ${familyStr}
- Today's schedule: ${scheduleStr}
- Favourite food: Dal chawal with mango pickle
- Hobbies: Cricket, morning prayer, chai, teaching
- Location: Sector 15, Noida

COMMUNICATION RULES FOR ${careStage.toUpperCase()} STAGE:
${careStage === 'early' ? '- Normal vocabulary, gentle prompts, encourage independence' : ''}${careStage === 'moderate' ? '- Short sentences, simple words, patient with repetition, frequent check-ins' : ''}${careStage === 'severe' ? '- Very short phrases, yes/no questions only, maximum patience, soothing tone' : ''}

GUARDRAILS:
- NEVER give medical advice. Only remind about scheduled medications.
- NEVER contradict caretaker or family instructions.
- Keep responses under 60 words. Use simple, warm language.
- Use present tense. Say "you have" not "you used to have".
- If the patient expresses fear, confusion, or distress, respond with comfort and include [ALERT: patient needs attention] in your response.
- Reference real names (Priya, Meera, Rahul) and real routines.
- Be warm, patient, and reassuring. You are a companion, not a doctor.`;

        // Try Gemini API
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

                // Check for distress alert
                const hasAlert = reply.includes('[ALERT');

                return NextResponse.json({ reply, alert: hasAlert });
            } catch (aiErr) {
                console.warn('[Companion] Gemini API failed, using fallback:', aiErr);
            }
        }

        // Fallback if no API key or API failed
        const fallbackReply = getNextFallback();
        return NextResponse.json({ reply: fallbackReply, alert: false, fallback: true });

    } catch (err) {
        console.error('[API /companion/chat]', err);
        return NextResponse.json(
            { error: 'Something went wrong. Try again?' },
            { status: 500 }
        );
    }
}
