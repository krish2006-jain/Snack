import { NextResponse } from 'next/server';
import { requireAuth } from '@/lib/auth';

export async function GET(req: Request) {
    try {
        const payload = await requireAuth(req);
        if (!payload) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        return NextResponse.json({
            user: {
                id: payload.userId,
                name: payload.name,
                email: payload.email,
                role: payload.role,
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
