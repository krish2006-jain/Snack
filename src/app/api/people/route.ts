import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const PATIENT_ID = 'patient-ravi-001';

export async function GET() {
    try {
        const db = getDb();
        const people = db.prepare(
            'SELECT id, name, relationship, bio, photo_url, voice_note_url, last_visited, phone, display_order FROM people_cards WHERE patient_id = ? ORDER BY display_order'
        ).all(PATIENT_ID);
        return NextResponse.json({ people });
    } catch (err) {
        console.error('[API /people GET]', err);
        return NextResponse.json({ error: 'Failed to fetch people.' }, { status: 500 });
    }
}
