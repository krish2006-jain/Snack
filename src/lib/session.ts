/**
 * Server-side session resolution.
 * Every API route calls getSessionUser(req) to get the logged-in user
 * and their linked patientId.
 */
import { verifyToken, type JWTPayload } from './auth';
import { getDb } from './db';

export interface SessionUser {
    userId: string;
    role: string;
    name: string;
    email: string;
    /** The patient ID this user is linked to (self for patients, linked for guardian/caretaker) */
    patientId: string;
    isDemo: boolean;
}

export const DEMO_IDS = ['patient-ravi-001', 'guardian-priya-001', 'caretaker-anita-001'];

/**
 * Extract and verify session from the Authorization header.
 * Resolves the patientId based on the user's role:
 * - patient  → userId IS the patientId
 * - guardian  → look up guardian_patient table
 * - caretaker → look up caretaker_patient table
 */
export async function getSessionUser(req: Request): Promise<SessionUser | null> {
    const authHeader = req.headers.get('Authorization');
    if (!authHeader?.startsWith('Bearer ')) return null;

    const token = authHeader.split(' ')[1];
    if (!token) return null;

    const payload = await verifyToken(token);
    if (!payload) return null;

    const isDemo = DEMO_IDS.includes(payload.userId);
    const patientId = resolvePatientId(payload);

    if (!patientId) return null;

    return {
        userId: payload.userId,
        role: payload.role,
        name: payload.name,
        email: payload.email,
        patientId,
        isDemo,
    };
}

/**
 * Resolve the patient ID from the user's role and relationships.
 */
function resolvePatientId(payload: JWTPayload): string | null {
    const db = getDb();

    if (payload.role === 'patient') {
        return payload.userId;
    }

    if (payload.role === 'guardian') {
        const row = db.prepare(
            'SELECT patient_id FROM guardian_patient WHERE guardian_id = ? LIMIT 1'
        ).get(payload.userId) as { patient_id: string } | undefined;
        return row?.patient_id ?? null;
    }

    if (payload.role === 'caretaker') {
        const row = db.prepare(
            'SELECT patient_id FROM caretaker_patient WHERE caretaker_id = ? LIMIT 1'
        ).get(payload.userId) as { patient_id: string } | undefined;
        return row?.patient_id ?? null;
    }

    return null;
}
