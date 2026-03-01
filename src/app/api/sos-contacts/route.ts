import { NextResponse } from 'next/server';
import { getDb } from '@/lib/db';
import { getSessionUser } from '@/lib/session';
import { DEMO_IDS } from '@/lib/session';

// ── Demo fallback - only used for the demo patient account ──────────────────
const DEMO_SOS = {
    patient: {
        name: 'Ravi Sharma',
        condition: "Moderate Alzheimer's Disease",
        address: 'Sector 15, Noida, UP',
    },
    guardian: {
        name: 'Priya Sharma',
        relationship: 'Daughter',
        phone: '+91 98765 12345',
    },
    caretaker: {
        name: 'Nurse Anita',
        role: 'Day Caretaker',
        phone: '+91 98765 67890',
    },
};

export async function GET(req: Request) {
    try {
        const session = await getSessionUser(req);
        if (!session) {
            return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
        }

        // Return demo data for demo accounts - keeps demo persona intact
        if (session.isDemo) {
            return NextResponse.json(DEMO_SOS);
        }

        const db = getDb();
        const patientId = session.patientId;

        // ── Patient basic info ──
        const patientUser = db.prepare(
            'SELECT u.name FROM users u WHERE u.id = ?'
        ).get(patientId) as { name: string } | undefined;

        const patientProfile = db.prepare(
            `SELECT conditions, address, care_stage FROM patient_profiles WHERE user_id = ?`
        ).get(patientId) as { conditions: string; address: string; care_stage: string } | undefined;

        let conditionLabel = "Alzheimer's Care";
        if (patientProfile?.care_stage) {
            const stage = patientProfile.care_stage.charAt(0).toUpperCase() + patientProfile.care_stage.slice(1);
            conditionLabel = `${stage} Stage Alzheimer's`;
        }
        if (patientProfile?.conditions) {
            try {
                const parsed = JSON.parse(patientProfile.conditions);
                if (Array.isArray(parsed) && parsed.length > 0) {
                    conditionLabel = parsed[0];
                }
            } catch { /* ignore parse error */ }
        }

        // ── Guardian contact ──
        const guardianRow = db.prepare(
            `SELECT u.name, gp.relationship, u.email
             FROM guardian_patient gp
             JOIN users u ON u.id = gp.guardian_id
             WHERE gp.patient_id = ?
             LIMIT 1`
        ).get(patientId) as { name: string; relationship: string; email: string } | undefined;

        // Try to get guardian phone from people_cards (guardian creates their own card)
        let guardianPhone = '';
        if (guardianRow) {
            // Look for a people card that matches the guardian's name (created during registration)
            const card = db.prepare(
                `SELECT phone FROM people_cards WHERE patient_id = ? AND name = ? AND relationship NOT IN ('Self') LIMIT 1`
            ).get(patientId, guardianRow.name) as { phone: string } | undefined;
            if (card?.phone) guardianPhone = card.phone;
        }

        // ── Caretaker contact ──
        const caretakerRow = db.prepare(
            `SELECT u.name, cp.relationship
             FROM caretaker_patient cp
             JOIN users u ON u.id = cp.caretaker_id
             WHERE cp.patient_id = ?
             LIMIT 1`
        ).get(patientId) as { name: string; relationship: string } | undefined;

        return NextResponse.json({
            patient: {
                name: patientUser?.name ?? 'Patient',
                condition: conditionLabel,
                address: patientProfile?.address ?? '',
            },
            guardian: guardianRow ? {
                name: guardianRow.name,
                relationship: guardianRow.relationship || 'Guardian',
                phone: guardianPhone,
            } : null,
            caretaker: caretakerRow ? {
                name: caretakerRow.name,
                role: caretakerRow.relationship || 'Caretaker',
                phone: '',
            } : null,
        });
    } catch (err) {
        console.error('[API /sos-contacts]', err);
        return NextResponse.json({ error: 'Failed to fetch SOS contacts.' }, { status: 500 });
    }
}
