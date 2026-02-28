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
        const profile = db.prepare(
            'SELECT care_stage, cognitive_score FROM patient_profiles WHERE user_id = ?'
        ).get(session.patientId) as { care_stage: string; cognitive_score: number } | undefined;

        const stage = profile?.care_stage || 'moderate';

        // Stage-specific configuration
        const stageConfig: Record<string, object> = {
            early: {
                aiMode: 'full_conversation',
                musicMode: 'patient_choice',
                flashcardMode: 'complex_questions',
                gameMode: 'full_difficulty',
                scheduleMode: 'text_descriptions',
                sosSize: 'standard',
                memoryRoomObjects: 8,
                gameCards: 12,
            },
            moderate: {
                aiMode: 'shorter_sentences',
                musicMode: 'mood_auto_selection',
                flashcardMode: 'simple_recognition',
                gameMode: 'simplified',
                scheduleMode: 'photos_mandatory',
                sosSize: 'larger',
                memoryRoomObjects: 6,
                gameCards: 8,
            },
            severe: {
                aiMode: 'yes_no_questions',
                musicMode: 'auto_play_calming',
                flashcardMode: 'auto_read_answer',
                gameMode: 'card_match_only',
                scheduleMode: 'fullscreen_photo_voice',
                sosSize: 'floating_always_visible',
                memoryRoomObjects: 4,
                gameCards: 4,
            },
        };

        return NextResponse.json({
            stage,
            cognitiveScore: profile?.cognitive_score || 0,
            config: stageConfig[stage] || stageConfig['moderate'],
        });
    } catch (err) {
        console.error('[API /stage GET]', err);
        return NextResponse.json({ error: 'Failed to fetch stage data.' }, { status: 500 });
    }
}

export async function PUT(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }
        const { stage } = await req.json();
        if (!stage || !['early', 'moderate', 'severe'].includes(stage)) {
            return NextResponse.json({ error: 'Valid stage (early/moderate/severe) is required.' }, { status: 400 });
        }
        const db = getDb();
        db.prepare('UPDATE patient_profiles SET care_stage = ? WHERE user_id = ?').run(stage, session.patientId);
        return NextResponse.json({ success: true, stage });
    } catch (err) {
        console.error('[API /stage PUT]', err);
        return NextResponse.json({ error: 'Failed to update stage.' }, { status: 500 });
    }
}
