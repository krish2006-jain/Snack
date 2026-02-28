import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { v4 as uuid } from 'uuid';

interface Params {
    params: Promise<{ token: string }>;
}

export async function GET(_req: Request, { params }: Params) {
    try {
        const { token } = await params;
        const db = getDb();

        // Look up patient profile by QR token
        const profile = db.prepare(`
      SELECT pp.*, u.name, u.email, u.avatar_url
      FROM patient_profiles pp
      JOIN users u ON u.id = pp.user_id
      WHERE pp.qr_token = ?
    `).get(token) as Record<string, unknown> | undefined;

        if (!profile) {
            return NextResponse.json({ error: 'Invalid QR code.' }, { status: 404 });
        }

        // Get guardian info
        const guardian = db.prepare(`
      SELECT u.id, u.name, u.email, gp.relationship
      FROM guardian_patient gp
      JOIN users u ON u.id = gp.guardian_id
      WHERE gp.patient_id = ?
    `).get(profile.user_id) as Record<string, unknown> | undefined;

        // Get caretaker info
        const caretaker = db.prepare(`
      SELECT u.id, u.name, u.email, cp.shift
      FROM caretaker_patient cp
      JOIN users u ON u.id = cp.caretaker_id
      WHERE cp.patient_id = ?
    `).get(profile.user_id) as Record<string, unknown> | undefined;

        // Log the scan
        db.prepare(
            'INSERT INTO qr_scans (id, qr_token, scanned_at) VALUES (?, ?, ?)'
        ).run(uuid(), token, Math.floor(Date.now() / 1000));

        // Build response
        const dob = profile.dob as string;
        const age = dob
            ? Math.floor((Date.now() - new Date(dob).getTime()) / (365.25 * 24 * 3600 * 1000))
            : null;

        return NextResponse.json({
            patient: {
                name: profile.name,
                age,
                photo: profile.photo_url || null,
                bloodType: profile.blood_type,
                allergies: JSON.parse((profile.allergies as string) || '[]'),
                conditions: JSON.parse((profile.conditions as string) || '[]'),
                medications: JSON.parse((profile.medications as string) || '[]'),
                address: profile.address,
                preferredName: profile.preferred_name,
                language: profile.preferred_language,
                careStage: profile.care_stage,
            },
            emergencyContacts: [
                guardian && {
                    name: guardian.name,
                    relation: guardian.relationship || 'Guardian',
                    phone: '+91 98765 43210', // Demo phone
                },
                caretaker && {
                    name: caretaker.name,
                    relation: 'Caretaker',
                    phone: '+91 98765 67890',
                },
                {
                    name: 'Dr. Sunita Patel',
                    relation: 'Neurologist',
                    phone: '+91 98765 99999',
                },
            ].filter(Boolean),
            careInstructions: profile.emergency_instructions || '',
            sessionToken: uuid(), // For chat session
        });
    } catch (err) {
        console.error('[API /scan/:token]', err);
        return NextResponse.json(
            { error: 'Something went wrong.' },
            { status: 500 }
        );
    }
}
