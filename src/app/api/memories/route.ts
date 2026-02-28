import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const db = getDb();
        const cards = db.prepare(
            'SELECT id, question, answer, description, category, recall_count, total_attempts FROM memory_cards WHERE patient_id = ? ORDER BY created_at'
        ).all(session.patientId);
        return NextResponse.json({ cards });
    } catch (err) {
        console.error('[API /memories GET]', err);
        return NextResponse.json({ error: 'Failed to fetch memories.' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { cardId, recalled } = await req.json();
        if (!cardId) {
            return NextResponse.json({ error: 'cardId is required.' }, { status: 400 });
        }
        const db = getDb();
        const now = Math.floor(Date.now() / 1000);
        if (recalled) {
            db.prepare(
                'UPDATE memory_cards SET recall_count = recall_count + 1, total_attempts = total_attempts + 1, last_shown = ? WHERE id = ? AND patient_id = ?'
            ).run(now, cardId, session.patientId);
        } else {
            db.prepare(
                'UPDATE memory_cards SET total_attempts = total_attempts + 1, last_shown = ? WHERE id = ? AND patient_id = ?'
            ).run(now, cardId, session.patientId);
        }
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /memories PUT]', err);
        return NextResponse.json({ error: 'Failed to update memory.' }, { status: 500 });
    }
}
