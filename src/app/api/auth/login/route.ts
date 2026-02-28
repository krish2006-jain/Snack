import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const { email, password, role } = await req.json();

        if (!email || !password || !role) {
            return NextResponse.json(
                { error: 'Email, password, and role are required.' },
                { status: 400 }
            );
        }

        const db = getDb();
        const user = db.prepare(
            'SELECT id, name, email, password_hash, role FROM users WHERE email = ? AND role = ?'
        ).get(email, role) as { id: string; name: string; email: string; password_hash: string; role: string } | undefined;

        if (!user) {
            return NextResponse.json(
                { error: 'Invalid credentials or role.' },
                { status: 401 }
            );
        }

        const valid = await comparePassword(password, user.password_hash);
        if (!valid) {
            return NextResponse.json(
                { error: 'Invalid credentials or role.' },
                { status: 401 }
            );
        }

        const token = await signToken({
            userId: user.id,
            role: user.role,
            name: user.name,
            email: user.email,
        });

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
            },
        });
    } catch (err) {
        console.error('[API /auth/login]', err);
        return NextResponse.json(
            { error: 'Something went wrong. Try again?' },
            { status: 500 }
        );
    }
}
