import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';

const PATIENT_ID = 'patient-ravi-001';

export async function GET() {
    try {
        const db = getDb();

        // Recent game sessions (last 30)
        const sessions = db.prepare(
            'SELECT id, game_type, score, stars, duration_seconds, played_at FROM game_sessions WHERE patient_id = ? ORDER BY played_at DESC LIMIT 30'
        ).all(PATIENT_ID) as { game_type: string; score: number; stars: number; played_at: number }[];

        // Calculate streak (consecutive days with at least one game)
        const daySet = new Set<string>();
        sessions.forEach((s) => {
            const d = new Date(s.played_at * 1000).toISOString().split('T')[0];
            daySet.add(d);
        });
        let streak = 0;
        const today = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(today);
            d.setDate(d.getDate() - i);
            const key = d.toISOString().split('T')[0];
            if (daySet.has(key)) {
                streak++;
            } else if (i > 0) {
                break;
            }
        }

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
        const { gameType, score, stars, durationSeconds } = await req.json();
        if (!gameType || score === undefined) {
            return NextResponse.json({ error: 'gameType and score are required.' }, { status: 400 });
        }
        const db = getDb();
        const now = Math.floor(Date.now() / 1000);
        db.prepare(
            'INSERT INTO game_sessions (id, patient_id, game_type, score, stars, duration_seconds, played_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
        ).run(uuid(), PATIENT_ID, gameType, score, stars || 0, durationSeconds || 0, now);
        return NextResponse.json({ success: true });
    } catch (err) {
        console.error('[API /games POST]', err);
        return NextResponse.json({ error: 'Failed to log game session.' }, { status: 500 });
    }
}
