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

        // Patient profile
        const profile = db.prepare(
            'SELECT care_stage, cognitive_score FROM patient_profiles WHERE user_id = ?'
        ).get(session.patientId) as { care_stage: string; cognitive_score: number } | undefined;

        // Game sessions (last 30 days)
        const thirtyDaysAgo = Math.floor(Date.now() / 1000) - 30 * 86400;
        const gameSessions = db.prepare(
            'SELECT game_type, score, stars, played_at FROM game_sessions WHERE patient_id = ? AND played_at > ? ORDER BY played_at'
        ).all(session.patientId, thirtyDaysAgo) as { game_type: string; score: number; stars: number; played_at: number }[];

        // Cognitive score trend (simulated from game data — group by day)
        const scoreByDay: Record<string, { total: number; count: number }> = {};
        gameSessions.forEach((s) => {
            const day = new Date(s.played_at * 1000).toISOString().split('T')[0];
            if (!scoreByDay[day]) scoreByDay[day] = { total: 0, count: 0 };
            scoreByDay[day].total += s.score;
            scoreByDay[day].count += 1;
        });
        const cognitiveScoreTrend = Object.entries(scoreByDay).map(([date, v]) => ({
            date,
            score: Math.round(v.total / v.count),
        }));

        // Memory recall stats
        const memoryStats = db.prepare(
            'SELECT SUM(recall_count) as totalRecalled, SUM(total_attempts) as totalAttempts FROM memory_cards WHERE patient_id = ?'
        ).get(session.patientId) as { totalRecalled: number; totalAttempts: number } | undefined;

        const recallAccuracy = memoryStats && memoryStats.totalAttempts > 0
            ? Math.round((memoryStats.totalRecalled / memoryStats.totalAttempts) * 100)
            : 0;

        // Mood distribution (last 30 days)
        const moods = db.prepare(
            'SELECT mood, COUNT(*) as count FROM mood_logs WHERE patient_id = ? GROUP BY mood'
        ).all(session.patientId) as { mood: string; count: number }[];

        // Recent alerts
        const alerts = db.prepare(
            'SELECT id, alert_type, severity, message, is_read, created_at FROM alerts WHERE patient_id = ? ORDER BY created_at DESC LIMIT 10'
        ).all(session.patientId);

        // Schedule completion rate (today)
        const today = new Date().toISOString().split('T')[0];
        const scheduleStats = db.prepare(
            'SELECT COUNT(*) as total, SUM(is_completed) as completed FROM schedule_tasks WHERE patient_id = ? AND date = ?'
        ).get(session.patientId, today) as { total: number; completed: number } | undefined;

        // Game streak
        const allGames = db.prepare(
            'SELECT played_at FROM game_sessions WHERE patient_id = ? ORDER BY played_at DESC'
        ).all(session.patientId) as { played_at: number }[];
        const daySet = new Set<string>();
        allGames.forEach((g) => {
            daySet.add(new Date(g.played_at * 1000).toISOString().split('T')[0]);
        });
        let gameStreak = 0;
        const todayDate = new Date();
        for (let i = 0; i < 60; i++) {
            const d = new Date(todayDate);
            d.setDate(d.getDate() - i);
            if (daySet.has(d.toISOString().split('T')[0])) gameStreak++;
            else if (i > 0) break;
        }

        // Average daily game score
        const avgDailyGameScore = gameSessions.length > 0
            ? Math.round(gameSessions.reduce((s, g) => s + g.score, 0) / gameSessions.length)
            : 0;

        return NextResponse.json({
            cognitiveScore: profile?.cognitive_score || 0,
            careStage: profile?.care_stage || 'moderate',
            cognitiveScoreTrend,
            recallAccuracy,
            moodDistribution: moods,
            alerts,
            scheduleCompletion: {
                total: scheduleStats?.total || 0,
                completed: scheduleStats?.completed || 0,
            },
            gameStreak,
            avgDailyGameScore,
            totalGameSessions: gameSessions.length,
        });
    } catch (err) {
        console.error('[API /analytics GET]', err);
        return NextResponse.json({ error: 'Failed to fetch analytics.' }, { status: 500 });
    }
}
