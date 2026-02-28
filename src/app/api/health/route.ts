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
        const records = db.prepare(
            'SELECT id, title, record_type, doctor_name, hospital, notes, record_date, uploaded_at FROM health_records WHERE patient_id = ? ORDER BY record_date DESC'
        ).all(session.patientId);
        return NextResponse.json({ records });
    } catch (err) {
        console.error('[API /health GET]', err);
        return NextResponse.json({ error: 'Failed to fetch health records.' }, { status: 500 });
    }
}
