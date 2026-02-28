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
        const people = db.prepare(
            'SELECT id, name, relationship, bio, photo_url, voice_note_url, last_visited, phone, display_order FROM people_cards WHERE patient_id = ? ORDER BY display_order'
        ).all(session.patientId);
        return NextResponse.json({ people });
    } catch (err) {
        console.error('[API /people GET]', err);
        return NextResponse.json({ error: 'Failed to fetch people.' }, { status: 500 });
    }
}
