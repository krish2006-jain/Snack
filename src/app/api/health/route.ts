import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const PATIENT_ID = 'patient-ravi-001';

export async function GET() {
    try {
        const db = getDb();
        const records = db.prepare(
            'SELECT id, title, record_type, doctor_name, hospital, notes, record_date, uploaded_at FROM health_records WHERE patient_id = ? ORDER BY record_date DESC'
        ).all(PATIENT_ID);
        return NextResponse.json({ records });
    } catch (err) {
        console.error('[API /health GET]', err);
        return NextResponse.json({ error: 'Failed to fetch health records.' }, { status: 500 });
    }
}
