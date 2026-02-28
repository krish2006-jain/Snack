import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { v4 as uuid } from 'uuid';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const db = getDb();
        const moods = db.prepare(
            'SELECT id, mood, source, date, logged_at FROM mood_logs WHERE patient_id = ? ORDER BY logged_at DESC LIMIT 60'
        ).all(session.patientId);
        return NextResponse.json({ moods });
    } catch (err) {
        console.error('[API /mood GET]', err);
        return NextResponse.json({ error: 'Failed to fetch moods.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { mood, source } = await req.json();
        if (!mood) {
            return NextResponse.json({ error: 'mood is required.' }, { status: 400 });
        }
        const db = getDb();
        const today = new Date().toISOString().split('T')[0];
        db.prepare(
            'INSERT INTO mood_logs (id, patient_id, mood, source, date) VALUES (?, ?, ?, ?, ?)'
        ).run(uuid(), session.patientId, mood, source || 'music_therapy', today);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /mood POST]', err);
        return NextResponse.json({ error: 'Failed to log mood.' }, { status: 500 });
    }
}
