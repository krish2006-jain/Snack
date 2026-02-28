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
        const alerts = db.prepare(
            'SELECT id, alert_type, severity, message, is_read, created_at FROM alerts WHERE patient_id = ? ORDER BY created_at DESC LIMIT 20'
        ).all(session.patientId);
        return NextResponse.json({ alerts });
    } catch (err) {
        console.error('[API /alerts GET]', err);
        return NextResponse.json({ error: 'Failed to fetch alerts.' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { alertId } = await req.json();
        if (!alertId) {
            return NextResponse.json({ error: 'alertId is required.' }, { status: 400 });
        }
        const db = getDb();
        db.prepare('UPDATE alerts SET is_read = 1 WHERE id = ? AND patient_id = ?').run(alertId, session.patientId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /alerts PUT]', err);
        return NextResponse.json({ error: 'Failed to update alert.' }, { status: 500 });
    }
}
