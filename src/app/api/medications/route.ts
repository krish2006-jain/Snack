import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';

const PATIENT_ID = 'patient-ravi-001';
const CARETAKER_ID = 'caretaker-anita-001';

export async function GET() {
    try {
        const db = getDb();
        const medications = db.prepare(
            'SELECT id, name, dosage, frequency, time_of_day, instructions, photo_url, is_active FROM medications WHERE patient_id = ? AND is_active = 1 ORDER BY time_of_day'
        ).all(PATIENT_ID);

        // Get today's logs
        const today = new Date().toISOString().split('T')[0];
        const logs = db.prepare(
            'SELECT medication_id, administered_at, administered_by, notes FROM medication_logs WHERE patient_id = ? AND date = ?'
        ).all(PATIENT_ID, today);

        return NextResponse.json({ medications, todayLogs: logs });
    } catch (err) {
        console.error('[API /medications GET]', err);
        return NextResponse.json({ error: 'Failed to fetch medications.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const { medicationId, notes } = await req.json();
        if (!medicationId) {
            return NextResponse.json({ error: 'medicationId is required.' }, { status: 400 });
        }
        const db = getDb();
        const today = new Date().toISOString().split('T')[0];
        db.prepare(
            'INSERT INTO medication_logs (id, medication_id, patient_id, administered_by, notes, date) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(uuid(), medicationId, PATIENT_ID, CARETAKER_ID, notes || '', today);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /medications POST]', err);
        return NextResponse.json({ error: 'Failed to log medication.' }, { status: 500 });
    }
}
