import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';

const PATIENT_ID = 'patient-ravi-001';
const CARETAKER_ID = 'caretaker-anita-001';

export async function GET() {
    try {
        const db = getDb();
        const entries = db.prepare(
            'SELECT id, mood_score, mood_label, appetite, sleep_quality, incidents, notes, date, created_at FROM journal_entries WHERE patient_id = ? ORDER BY date DESC LIMIT 30'
        ).all(PATIENT_ID);
        return NextResponse.json({ entries });
    } catch (err) {
        console.error('[API /journal GET]', err);
        return NextResponse.json({ error: 'Failed to fetch journal.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { moodScore, moodLabel, appetite, sleepQuality, incidents, notes } = await req.json();
        const db = getDb();
        const today = new Date().toISOString().split('T')[0];
        db.prepare(
            'INSERT INTO journal_entries (id, patient_id, caretaker_id, mood_score, mood_label, appetite, sleep_quality, incidents, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
        ).run(uuid(), PATIENT_ID, CARETAKER_ID, moodScore || 3, moodLabel || 'Okay', appetite || 'moderate', sleepQuality || 'fair', incidents || null, notes || '', today);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /journal POST]', err);
        return NextResponse.json({ error: 'Failed to create journal entry.' }, { status: 500 });
    }
}
