// ── Patient / User Types ─────────────────────────────────── //
export type CareRole = 'patient' | 'guardian' | 'caretaker';
export type CareStage = 'early' | 'moderate' | 'severe';

export interface Patient {
    id: string;
    name: string;
    age: number;
    photo: string;
    bloodType: string;
    allergies: string[];
    conditions: string[];
    medications: string[];
    careStage: CareStage;
    guardianId: string;
    caretakerId: string;
    qrToken: string;
    address: string;
    language: string;
}

export interface Guardian {
    id: string;
    name: string;
    email: string;
    phone: string;
    relation: string;
    patientId: string;
}

export interface Caretaker {
    id: string;
    name: string;
    email: string;
    phone: string;
    shift: string;
    patientId: string;
}

export interface EmergencyContact {
    id: string;
    name: string;
    relation: string;
    phone: string;
    isPrimary: boolean;
}

export interface ScheduleTask {
    id: string;
    title: string;
    time: string;
    category: 'medication' | 'meal' | 'activity' | 'therapy' | 'hygiene' | 'rest';
    status: 'completed' | 'upcoming' | 'missed';
    photo?: string;
    notes?: string;
}

export interface Memory {
    id: string;
    title: string;
    question: string;
    answer: string;
    description: string;
    photo?: string;
    category: 'family' | 'home' | 'childhood' | 'events';
    recallScore?: number;
}

export interface Person {
    id: string;
    name: string;
    relation: string;
    photo?: string;
    bio: string;
    lastVisited: string;
    phone?: string;
}

export interface QRProfile {
    token: string;
    patient: Patient;
    emergencyContacts: EmergencyContact[];
    careInstructions: string;
}

export interface ChatMessage {
    id: string;
    sender: string;
    senderRole: string;
    content: string;
    timestamp: string;
    isOwn: boolean;
}

export interface DemoAccount {
    email: string;
    password: string;
    role: CareRole;
    name: string;
}
