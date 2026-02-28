import { NextResponse } from 'next/server';
import { v4 as uuid } from 'uuid';
import { getDb } from '@/lib/db';
import { hashPassword, signToken } from '@/lib/auth';

export async function POST(req: Request) {
    try {
        const body = await req.json();
        const {
            // Guardian info (step 1)
            name,
            email,
            phone,
            password,
            relation,
            // Patient info (step 2)
            patientName,
            patientAge,
            address,
            bloodType,
            conditions,
            medications,
            allergies,
            // Care plan (step 3)
            preferredName,
            preferredLanguage,
            careStage,
            emergencyInstructions,
            emergencyContactName,
            emergencyContactPhone,
        } = body;

        // ── Validate required fields ──
        if (!name || !email || !password) {
            return NextResponse.json({ error: 'Name, email and password are required.' }, { status: 400 });
        }
        if (!patientName || !patientAge || !address) {
            return NextResponse.json({ error: 'Patient name, age and address are required.' }, { status: 400 });
        }

        const db = getDb();

        // ── Check if email already exists ──
        const existing = db.prepare('SELECT id FROM users WHERE email = ?').get(email);
        if (existing) {
            return NextResponse.json({ error: 'An account with this email already exists.' }, { status: 409 });
        }

        // ── Create IDs ──
        const guardianId = `guardian-${uuid().slice(0, 8)}`;
        const patientId = `patient-${uuid().slice(0, 8)}`;
        const qrToken = `${patientName.toLowerCase().replace(/\s+/g, '-')}-${Date.now().toString(36)}`;
        const passwordHash = await hashPassword(password);

        // ── Create patient email (auto-generated, not used for login typically) ──
        const patientEmail = `patient-${patientId}@saathi.local`;
        const patientPasswordHash = await hashPassword(uuid()); // random password

        // ── Build emergency instructions text ──
        let fullEmergency = emergencyInstructions || '';
        if (emergencyContactName) {
            fullEmergency += `\nEmergency Contact: ${emergencyContactName}`;
            if (emergencyContactPhone) fullEmergency += ` (${emergencyContactPhone})`;
        }

        const insertAll = db.transaction(() => {
            // ── Insert guardian user ──
            db.prepare(
                'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
            ).run(guardianId, name, email, passwordHash, 'guardian');

            // ── Insert patient user ──
            db.prepare(
                'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
            ).run(patientId, patientName, patientEmail, patientPasswordHash, 'patient');

            // ── Insert patient profile with all step 3 fields ──
            const dob = patientAge
                ? `${new Date().getFullYear() - parseInt(patientAge)}-01-01`
                : null;

            db.prepare(`INSERT INTO patient_profiles
                (id, user_id, dob, blood_type, allergies, conditions, medications, address,
                 preferred_name, preferred_language, qr_token, care_stage, cognitive_score,
                 emergency_instructions)
                VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`
            ).run(
                uuid(),
                patientId,
                dob,
                bloodType || 'Unknown',
                JSON.stringify(allergies ? allergies.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                JSON.stringify(conditions ? conditions.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                JSON.stringify(medications ? medications.split(',').map((s: string) => s.trim()).filter(Boolean) : []),
                address,
                preferredName || patientName.split(' ')[0],
                preferredLanguage || 'en',
                qrToken,
                careStage || 'moderate',
                0, // cognitive score starts at 0 for real users
                fullEmergency.trim()
            );

            // ── Create guardian-patient relationship ──
            db.prepare(
                'INSERT INTO guardian_patient (guardian_id, patient_id, relationship) VALUES (?, ?, ?)'
            ).run(guardianId, patientId, relation || 'family');

            // ── Create a people card for the guardian so the patient sees them ──
            db.prepare(
                'INSERT INTO people_cards (id, patient_id, name, relationship, bio, last_visited, phone, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
            ).run(uuid(), patientId, name, relation || 'Guardian', 'Your guardian on SaathiCare.', 'Today', phone || '', 0);
        });

        insertAll();

        // ── Sign JWT ──
        const token = await signToken({
            userId: guardianId,
            role: 'guardian',
            name,
            email,
        });

        return NextResponse.json({
            token,
            user: {
                id: guardianId,
                name,
                email,
                role: 'guardian',
                patientName,
                isDemo: false,
            },
        });
    } catch (err) {
        console.error('[API /auth/register]', err);
        return NextResponse.json(
            { error: 'Registration failed. Please try again.' },
            { status: 500 }
        );
    }
}
