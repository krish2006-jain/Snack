import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const PATIENT_ID = 'patient-ravi-001';

export async function GET() {
    try {
        const db = getDb();
        const alerts = db.prepare(
            'SELECT id, alert_type, severity, message, is_read, created_at FROM alerts WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20'
        ).all(PATIENT_ID);
        return NextResponse.json({ alerts });
    } catch (err) {
        console.error('[API /alerts GET]', err);
        return NextResponse.json({ error: 'Failed to fetch alerts.' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { alertId } = await req.json();
        if (!alertId) {
            return NextResponse.json({ error: 'alertId is required.' }, { status: 400 });
        }
        const db = getDb();
        db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ?').run(alertId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /alerts PUT]', err);
        return NextResponse.json({ error: 'Failed to update alert.' }, { status: 500 });
    }
}
