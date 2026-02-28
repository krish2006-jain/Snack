import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';

const PATIENT_ID = 'patient-ravi-001';

export async function GET() {
    try {
        const db = getDb();
        const today = new Date().toISOString().split('T')[0];
        const tasks = db.prepare(
            'SELECT id, title, description, scheduled_time, category, image_url, is_completed, completed_at, date FROM schedule_tasks WHERE patient_id = ? AND date = ? ORDER BY scheduled_time'
        ).all(PATIENT_ID, today);
        return NextResponse.json({ tasks });
    } catch (err) {
        console.error('[API /schedule GET]', err);
        return NextResponse.json({ error: 'Failed to fetch schedule.' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const { taskId, completed } = await req.json();
        if (!taskId) {
            return NextResponse.json({ error: 'taskId is required.' }, { status: 400 });
        }
        const db = getDb();
        const now = Math.floor(Date.now() / 1000);
        db.prepare(
            'UPDATE schedule_tasks SET is_completed = ?, completed_at = ? WHERE id = ?'
        ).run(completed ? 1 : 0, completed ? now : null, taskId);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /schedule PUT]', err);
        return NextResponse.json({ error: 'Failed to update task.' }, { status: 500 });
    }
}
