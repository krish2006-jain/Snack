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
            'SELECT qr_token, preferred_name FROM patient_profiles WHERE user_id = ?'
        ).get(session.patientId) as { qr_token: string; preferred_name: string } | undefined;

        const scanCount = db.prepare(
            'SELECT COUNT(*) as count FROM qr_scans WHERE qr_token = ?'
        ).get(profile?.qr_token || '') as { count: number } | undefined;

        const recentScans = db.prepare(
            'SELECT id, scanner_name, location, scanned_at FROM qr_scans WHERE qr_token = ? ORDER BY scanned_at DESC LIMIT 10'
        ).all(profile?.qr_token || '');

        return NextResponse.json({
            qrToken: profile?.qr_token || '',
            patientName: profile?.preferred_name || '',
            totalScans: scanCount?.count || 0,
            recentScans,
        });
    } catch (err) {
        console.error('[API /qr GET]', err);
        return NextResponse.json({ error: 'Failed to fetch QR data.' }, { status: 500 });
    }
}
