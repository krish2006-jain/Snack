import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { searchParams } = new URL(req.url);
        const room = searchParams.get('room');
        const db = getDb();

        if (room) {
            const objects = db.prepare(
                'SELECT id, object_name, position_x, position_y, question, answer, description, memory_tip, is_safety_item, image_url FROM memory_room_objects WHERE patient_id = ? AND room = ? ORDER BY position_x'
            ).all(session.patientId, room);
            return NextResponse.json({ objects });
        }

        // Return all rooms with object counts
        const rooms = db.prepare(
            'SELECT room, COUNT(*) as objectCount FROM memory_room_objects WHERE patient_id = ? GROUP BY room ORDER BY room'
        ).all(session.patientId);
        return NextResponse.json({ rooms });
    } catch (err) {
        console.error('[API /memory-room GET]', err);
        return NextResponse.json({ error: 'Failed to fetch memory room data.' }, { status: 500 });
    }
}
