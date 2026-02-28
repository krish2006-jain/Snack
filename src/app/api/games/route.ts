import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { calculateStreak } from '@/lib/streaks';
import { v4 as uuid } from 'uuid';

export async function GET(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const db = getDb();

        // Recent game sessions (last 30)
        const sessions = db.prepare(
            'SELECT id, game_type, score, stars, duration_seconds, played_at FROM game_sessions WHERE patient_id = ? ORDER BY played_at DESC LIMIT 30'
        ).all(session.patientId) as { game_type: string; score: number; stars: number; played_at: number }[];

        // Calculate streak
        const playedAtSeconds = sessions.map(s => s.played_at);
        const streak = calculateStreak(playedAtSeconds);

        // Average score
        const avgScore = sessions.length > 0
            ? Math.round(sessions.reduce((sum, s) => sum + s.score, 0) / sessions.length)
            : 0;

        return NextResponse.json({ sessions, streak, avgScore });
    } catch (err) {
        console.error('[API /games GET]', err);
        return NextResponse.json({ error: 'Failed to fetch games data.' }, { status: 500 });
    }
}

export async function POST(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { gameType, score, stars, durationSeconds } = await req.json();
        if (!gameType || score === undefined) {
            return NextResponse.json({ error: 'gameType and score are required.' }, { status: 400 });
        }
        const db = getDb();
        const now = Math.floor(Date.now() / 1000);
        db.prepare(
            'INSERT INTO game_sessions (id, patient_id, game_type, score, stars, duration_seconds, played_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(uuid(), session.patientId, gameType, score, stars || 0, durationSeconds || 0, now);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /games POST]', err);
        return NextResponse.json({ error: 'Failed to log game session.' }, { status: 500 });
    }
}
