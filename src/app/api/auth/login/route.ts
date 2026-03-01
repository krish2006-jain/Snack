import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { comparePassword, signToken } from '@/lib/auth';
import { DEMO_IDS } from '@/lib/session';

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

        const isDemo = DEMO_IDS.includes(user.id);

        // Look up patient name for guardian or caretaker users
        let patientName: string | undefined;
        if (user.role === 'guardian') {
            const gp = db.prepare(
                'SELECT u.name FROM guardian_patient gp JOIN users u ON u.id = gp.patient_id WHERE gp.guardian_id = ? LIMIT 1'
            ).get(user.id) as { name: string } | undefined;
            if (gp) patientName = gp.name;
        } else if (user.role === 'caretaker') {
            const cp = db.prepare(
                'SELECT u.name FROM caretaker_patient cp JOIN users u ON u.id = cp.patient_id WHERE cp.caretaker_id = ? LIMIT 1'
            ).get(user.id) as { name: string } | undefined;
            if (cp) patientName = cp.name;
        }

        return NextResponse.json({
            token,
            user: {
                id: user.id,
                name: user.name,
                email: user.email,
                role: user.role,
                isDemo,
                ...(patientName && { patientName }),
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
