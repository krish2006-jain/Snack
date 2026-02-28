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
        const today = new Date().toISOString().split('T')[0];
        const tasks = db.prepare(
            'SELECT id, title, description, scheduled_time, category, image_url, is_completed, completed_at, date FROM schedule_tasks WHERE patient_id = ? AND date = ? ORDER BY scheduled_time'
        ).all(session.patientId, today);
        return NextResponse.json({ tasks });
    } catch (err) {
        console.error('[API /schedule GET]', err);
        return NextResponse.json({ error: 'Failed to fetch schedule.' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { taskId, completed } = await req.json();
        if (!taskId) {
            return NextResponse.json({ error: 'taskId is required.' }, { status: 400 });
        }
        const db = getDb();
        const now = Math.floor(Date.now() / 1000);
        db.prepare(
            'UPDATE schedule_tasks SET is_completed = ?, completed_at = ? WHERE id = ? AND patient_id = ?'
        ).run(completed ? 1 : 0, completed ? now : null, taskId, session.patientId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /schedule PUT]', err);
        return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 });
    }
}
