import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';

interface Params {
    params: Promise<{ token: string }>;
}

export async function POST(req: Request, { params }: Params) {
    try {
        const { token } = await params;
        const body = await req.json();
        const { name, latitude, longitude } = body;

        const db = getDb();

        // Verify token exists
        const profile = db.prepare(
            'SELECT user_id FROM patient_profiles WHERE qr_token = ?'
        ).get(token) as { user_id: string } | undefined;

        if (!profile) {
            return NextResponse.json({ error: 'Invalid QR code.' }, { status: 404 });
        }

        // Build location string
        let location = '';
        if (latitude && longitude) {
            location = `${latitude},${longitude}`;
        }

        // Update or create a scan record with samaritan details
        const scanId = uuid();
        db.prepare(
            'INSERT INTO qr_scans (id, qr_token, scanner_name, location, scanned_at, session_id) VALUES (?, ?, ?, ?, ?, ?)'
        ).run(scanId, token, name || 'Anonymous', location, Math.floor(Date.now() / 1000), scanId);

        return NextResponse.json({
            success: true,
            scanId,
            message: 'Thank you for helping! Your information has been shared with the family.',
        });
    } catch (err) {
        console.error('[API /scan/:token/samaritan]', err);
        return NextResponse.json(
            { error: 'Something went wrong.' },
            { status: 500 }
        );
    }
}
