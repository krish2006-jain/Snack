import { NextResponse } from 'next/server';
import { getSessionUser, DEMO_IDS } from '@/lib/session';

export async function GET(req: Request) {
    try {
        const payload = await getSessionUser(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: payload.userId,
                name: payload.name,
                email: payload.email,
                role: payload.role,
                isDemo: DEMO_IDS.includes(payload.userId),
            },
        });
    } catch (err) {
        console.error('[API /auth/me]', err);
        return NextResponse.json(
            { error: 'Something went wrong.' },
            { status: 500 }
        );
    }
}
