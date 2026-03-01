// ── SaathiCare Mock-Data barrel ───────────────────────────── //
// Re-exports everything from the domain-specific files so any
// page can do:  import { ... } from '@/lib/mock-data'

export * from './patient'
export * from './caretaker'

// ── QR Profile (used by /scan pages) ──────────────────────── //
import { mockPatient } from './patient'
import type { QRProfile } from '@/types'

export const mockEmergencyContacts = [
    {
        id: 'ec-001',
        name: 'Priya Sharma',
        relation: 'Daughter',
        phone: '+91 98765 12345',
        isPrimary: true,
    },
    {
        id: 'ec-002',
        name: 'Nurse Anita',
        relation: 'Caretaker',
        phone: '+91 98765 67890',
        isPrimary: false,
    },
    {
        id: 'ec-003',
        name: 'Dr. Sunita Patel',
        relation: 'Neurologist',
        phone: '+91 98765 99999',
        isPrimary: false,
    },
]

const qrPatient = {
    id: mockPatient.id,
    name: mockPatient.name,
    age: mockPatient.age,
    photo: mockPatient.photo,
    bloodType: mockPatient.bloodType,
    allergies: mockPatient.allergies,
    conditions: [mockPatient.condition],
    medications: mockPatient.medications,
    careStage: mockPatient.stage,
    guardianId: 'priya-sharma',
    caretakerId: 'nurse-anita',
    qrToken: 'ravi-sharma-2024',
    address: mockPatient.location,
    language: 'Hindi/English',
} as const

export const mockQRProfiles: Record<string, QRProfile> = {
    'ravi-sharma-2024': {
        token: 'ravi-sharma-2024',
        // @ts-expect-error: inline shape compatible with QRProfile.patient
        patient: qrPatient,
        emergencyContacts: mockEmergencyContacts,
        careInstructions:
            "Ravi has moderate Alzheimer's. He may be confused and disoriented. " +
            'Speak slowly and calmly in Hindi or English. Do not leave him alone. ' +
            `He lives at ${mockPatient.location}. Call his daughter Priya first. ` +
            'He cannot remember recent events but responds to familiar songs and his family name.',
    },
}

// ── Chat messages (Good Samaritan chat) ───────────────────── //
export const mockChatMessages = [
    {
        id: 'msg-001',
        sender: 'Priya Sharma',
        senderRole: 'guardian',
        content: 'Hello! Thank you so much for helping my father. Where did you find him?',
        timestamp: new Date(Date.now() - 5 * 60000).toISOString(),
        isOwn: false,
    },
    {
        id: 'msg-002',
        sender: 'You',
        senderRole: 'samaritan',
        content: 'I found him near Sector 15 market. He seems a little confused but is safe.',
        timestamp: new Date(Date.now() - 3 * 60000).toISOString(),
        isOwn: true,
    },
    {
        id: 'msg-003',
        sender: 'Priya Sharma',
        senderRole: 'guardian',
        content:
            "Oh thank God! I'm 10 minutes away. Can you stay with him? He might respond if you say \"Ravi ji, beta aa rahi hai.\"",
        timestamp: new Date(Date.now() - 1 * 60000).toISOString(),
        isOwn: false,
    },
]

// ── Demo accounts ─────────────────────────────────────────── //
export const demoAccounts = [
    { email: 'ravi@saathi.care', password: 'demo123', role: 'patient' as const, name: 'Ravi Sharma' },
    { email: 'priya@saathi.care', password: 'demo123', role: 'guardian' as const, name: 'Priya Sharma', patientName: 'Ravi Sharma' },
    { email: 'anita@saathi.care', password: 'demo123', role: 'caretaker' as const, name: 'Nurse Anita', patientName: 'Ravi Sharma' },
]

// ── Guardian-specific mock data ───────────────────────────── //

export interface Alert {
    id: string
    title: string
    description: string
    type: 'danger' | 'warning' | 'info' | 'success'
    timestamp: string
    read: boolean
    source?: string
}

export const mockAlerts: Alert[] = [
    {
        id: 'a-01',
        title: 'Medication missed',
        description: 'Evening Memantine dose was not logged',
        type: 'danger',
        timestamp: new Date(Date.now() - 3 * 60 * 60000).toISOString(),
        read: false,
    },
    {
        id: 'a-02',
        title: 'QR Scanned by stranger',
        description: 'Ravi\'s QR was scanned near Sector 15 Market',
        type: 'warning',
        timestamp: new Date(Date.now() - 22 * 60 * 60000).toISOString(),
        read: false,
    },
    {
        id: 'a-03',
        title: 'Memory session completed',
        description: '12 of 14 flashcards recalled correctly',
        type: 'success',
        timestamp: new Date(Date.now() - 5 * 60 * 60000).toISOString(),
        read: true,
    },
    {
        id: 'a-04',
        title: 'Mood: Anxious noted',
        description: 'Caretaker observed agitation before walk',
        type: 'warning',
        timestamp: new Date(Date.now() - 48 * 60 * 60000).toISOString(),
        read: true,
    },
]

export interface QRScan {
    id: string
    location: string
    timestamp: string
    scannerNote?: string
    scannerType?: string
}

export const mockQRScans: QRScan[] = [
    {
        id: 'qs-01',
        location: 'Near Sector 15 Market, Noida',
        timestamp: new Date(Date.now() - 22 * 60 * 60000).toISOString(),
        scannerNote: 'Good Samaritan chat initiated',
    },
    {
        id: 'qs-02',
        location: 'Fortis Hospital, Main Gate, Noida',
        timestamp: new Date(Date.now() - 7 * 24 * 60 * 60000).toISOString(),
    },
    {
        id: 'qs-03',
        location: 'Sector 12 Metro Station, Noida',
        timestamp: new Date(Date.now() - 18 * 24 * 60 * 60000).toISOString(),
    },
]

export interface GameScore {
    id: string
    game: string
    score: number
    date: string
    stars: number
}

export const mockGameScores: GameScore[] = [
    { id: 'gs-01', game: 'Card Match', score: 88, date: '2026-02-28', stars: 3 },
    { id: 'gs-02', game: 'Word Recall', score: 76, date: '2026-02-27', stars: 2 },
    { id: 'gs-03', game: 'Pattern Tap', score: 64, date: '2026-02-26', stars: 2 },
    { id: 'gs-04', game: 'Card Match', score: 92, date: '2026-02-25', stars: 3 },
    { id: 'gs-05', game: 'Word Recall', score: 58, date: '2026-02-24', stars: 1 },
]

export interface Analytics {
    cognitiveScores: { date: string; score: number }[]
    moodTrend: { date: string; mood: string }[]
    gameStreak: number
    avgDailyGameScore: number
    medicationAdherence: number   // percentage
    averageRecall: number         // percentage
    wanderingIncidents: number    // count in 30 days
    qrScansLast30: number
}

export const mockAnalytics: Analytics = {
    cognitiveScores: [
        { date: '2026-01-29', score: 66 },
        { date: '2026-02-05', score: 69 },
        { date: '2026-02-12', score: 70 },
        { date: '2026-02-19', score: 71 },
        { date: '2026-02-28', score: 72 },
    ],
    moodTrend: [
        { date: '2026-02-22', mood: 'calm' },
        { date: '2026-02-23', mood: 'anxious' },
        { date: '2026-02-24', mood: 'calm' },
        { date: '2026-02-25', mood: 'happy' },
        { date: '2026-02-26', mood: 'happy' },
        { date: '2026-02-27', mood: 'neutral' },
        { date: '2026-02-28', mood: 'calm' },
    ],
    gameStreak: 5,
    avgDailyGameScore: 76,
    medicationAdherence: 87,
    averageRecall: 78,
    wanderingIncidents: 2,
    qrScansLast30: 3,
}

// ── Memory (Guardian Memory Manager) ──────────────────────── //

export interface Memory {
    id: string
    title: string
    description: string
    date: string
    type: 'photo' | 'voice' | 'video'
    emotion: 'happy' | 'neutral' | 'nostalgic'
    tags: string[]
    recallScore: number  // 0-100
    image?: string  // path to image
}

export const mockMemories: Memory[] = [
    {
        id: 'mem-01', title: "Ravi and Smita's Wedding Day",
        description: "A beautiful moment from Ravi and Smita's wedding celebration - a day filled with joy, family, and the beginning of their beautiful shared journey together. Smita in her bridal ensemble, Ravi in his finest attire, surrounded by the warmth of their loved ones.",
        date: '1985-06-15', type: 'photo', emotion: 'happy', tags: ['Smita', 'wedding', 'love', 'family'],
        recallScore: 98,
        image: '/images/Wedding Day.png',
    },
    {
        id: 'mem-02', title: 'Family Picnic - Childhood Memories',
        description: "A joyful family picnic from their younger days - Ravi, Smita, and the children enjoying outdoor games, laughter, and delicious homemade food under the open sky. These moments of togetherness shaped the foundation of the family's strongest bonds.",
        date: '1995-03-20', type: 'photo', emotion: 'nostalgic', tags: ['family', 'picnic', 'childhood', 'outdoor'],
        recallScore: 85,
        image: '/images/Family Picnic (Childhood).png',
    },
    {
        id: 'mem-03', title: 'Childhood Home',
        description: "The cherished home where Ravi and Smita raised their family - the walls that held countless celebrations, quiet moments, and everyday routines. This house became the heart of their family's world, filled with memories of growth and togetherness.",
        date: '1988-01-10', type: 'photo', emotion: 'nostalgic', tags: ['home', 'childhood', 'family', 'memories'],
        recallScore: 80,
        image: '/images/Childhood Home.png',
    },
]

// ── Guardian Weekly Schedule ───────────────────────────────── //
// NOTE: This ScheduleTask is DIFFERENT from patient.ts's ScheduleTask.
// Guardian needs weekly (multi-day) tasks with `completed` & `day` fields.
// Import guard: we rename the patient's type to avoid collisions.

export type Day = 'Mon' | 'Tue' | 'Wed' | 'Thu' | 'Fri' | 'Sat' | 'Sun'
export const DAYS: Day[] = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

export interface ScheduleTask {
    id: string
    title: string
    time: string
    category: string
    description: string
    completed: boolean
    day: Day
}

export const mockSchedule: ScheduleTask[] = [
    // MON
    { id: 'gs-m1', day: 'Mon', time: '08:00', category: 'medication', title: 'Morning medication', description: 'Donepezil 10mg with warm water', completed: true },
    { id: 'gs-m2', day: 'Mon', time: '09:00', category: 'exercise', title: 'Morning walk', description: '20 minutes in the garden', completed: true },
    { id: 'gs-m3', day: 'Mon', time: '10:30', category: 'game', title: 'Memory Flashcards Game', description: 'Family photo recall session', completed: false },
    { id: 'gs-m4', day: 'Mon', time: '13:00', category: 'meal', title: 'Lunch', description: 'Dal chawal + seasonal sabzi', completed: false },
    { id: 'gs-m5', day: 'Mon', time: '15:00', category: 'medication', title: 'Evening medication', description: 'Memantine 10mg', completed: false },
    // TUE
    { id: 'gs-t1', day: 'Tue', time: '08:00', category: 'medication', title: 'Morning medication', description: 'Donepezil 10mg', completed: false },
    { id: 'gs-t2', day: 'Tue', time: '09:15', category: 'exercise', title: 'Chair yoga', description: '15 minutes gentle stretching', completed: false },
    { id: 'gs-t3', day: 'Tue', time: '11:00', category: 'therapy', title: 'Music therapy', description: 'Old Hindi songs playlist', completed: false },
    { id: 'gs-t4', day: 'Tue', time: '14:00', category: 'social', title: 'Video call with Priya', description: 'Weekly family check-in', completed: false },
    // WED
    { id: 'gs-w1', day: 'Wed', time: '08:00', category: 'medication', title: 'Morning medication', description: 'Donepezil 10mg', completed: false },
    { id: 'gs-w2', day: 'Wed', time: '10:00', category: 'hygiene', title: 'Bath & grooming', description: 'Assisted bath with Anita', completed: false },
    { id: 'gs-w3', day: 'Wed', time: '13:00', category: 'meal', title: 'Lunch', description: 'Light soup + roti', completed: false },
    // THU–SUN: minimal tasks
    { id: 'gs-th1', day: 'Thu', time: '08:00', category: 'medication', title: 'Morning medication', description: 'Donepezil 10mg', completed: false },
    { id: 'gs-th2', day: 'Thu', time: '10:30', category: 'game', title: 'Card Match Game', description: 'Card matching on tablet', completed: false },
    { id: 'gs-th3', day: 'Thu', time: '11:30', category: 'chore', title: 'Organise bookshelf', description: 'Arrange books and personal items on the shelf', completed: false },
    { id: 'gs-f1', day: 'Fri', time: '08:00', category: 'medication', title: 'Morning medication', description: 'Donepezil 10mg', completed: false },
    { id: 'gs-f2', day: 'Fri', time: '15:00', category: 'social', title: 'Rajesh calls', description: 'Weekly call from son-in-law', completed: false },
    { id: 'gs-sa1', day: 'Sat', time: '08:00', category: 'medication', title: 'Morning medication', description: 'Donepezil 10mg', completed: false },
    { id: 'gs-sa2', day: 'Sat', time: '11:00', category: 'exercise', title: 'Outdoor walk', description: 'Sector 15 park with Anita', completed: false },
    { id: 'gs-sa3', day: 'Sat', time: '15:00', category: 'game', title: 'Word Recall Game', description: 'Word recall brain exercise on tablet', completed: false },
    { id: 'gs-sa4', day: 'Sat', time: '16:00', category: 'chore', title: 'Water the Plants', description: 'Water balcony plants - tulsi, marigold, money plant', completed: false },
    { id: 'gs-su1', day: 'Sun', time: '08:00', category: 'medication', title: 'Morning medication', description: 'Donepezil 10mg', completed: false },
    { id: 'gs-su2', day: 'Sun', time: '17:00', category: 'social', title: 'Priya visits', description: 'Weekly family visit', completed: false },
]

// ── Guardian People Wallet ─────────────────────────────────── //

export interface Person {
    id: string
    name: string
    relation: string
    nickname?: string
    phone?: string
    description: string
    visits: string
    recognitionRate: number // 0-100
    image?: string  // path to image
}

export const mockPeople: Person[] = [
    { id: 'p-00', name: 'Smita Sharma', relation: 'Wife', nickname: 'Smita', phone: '', description: 'Ravi\'s beloved wife of 40 years. Her love and care keeps the family bonds strong. Always ensures Ravi takes his medications on time.', visits: 'Daily', recognitionRate: 99, image: '/images/smita.png' },
    { id: 'p-01', name: 'Priya Sharma', relation: 'Daughter', nickname: 'Priya beti', phone: '+91 98765 12345', description: "Ravi's eldest daughter. Calls every Sunday. Lives in Gurugram with Rajesh, Aarav and Riya. Works as a project manager.", visits: 'Weekly', recognitionRate: 96, image: '/images/priya.png' },
    { id: 'p-02', name: 'Nurse Anita', relation: 'Caretaker', nickname: 'Anita baai', phone: '+91 98765 67890', description: 'Daytime caretaker 8 AM–4 PM. With Ravi for 2 years. Gives morning medication and accompanies walks. Patient and compassionate.', visits: 'Daily', recognitionRate: 90, image: '/images/anita.png' },
    { id: 'p-03', name: 'Aarav', relation: 'Grandson', nickname: 'Aarav', phone: '', description: "Priya's 8-year-old son. Loves cricket and calls Ravi \"Dadu\". Visits during school holidays and plays board games with Ravi.", visits: 'Monthly', recognitionRate: 82, image: '/images/aarav.png' },
    { id: 'p-04', name: 'Riya', relation: 'Granddaughter', nickname: 'Riya mini', phone: '', description: "Priya's 5-year-old daughter. Loves drawing and painting. Made a colorful painting of Ravi on his bedroom wall. Very affectionate.", visits: 'Monthly', recognitionRate: 78, image: '/images/riya.png' },
    { id: 'p-05', name: 'Mohit Sharma', relation: 'Son', nickname: 'Mohit', phone: '+91 98765 54321', description: 'Ravi\'s younger son. Works in Mumbai as a software engineer. Visits during major festivals and holidays. Very supportive of family decisions.', visits: 'Bi-weekly', recognitionRate: 88, image: '/images/mohit.png' },
    { id: 'p-06', name: 'Patient (Ravi)', relation: 'Self', nickname: 'Ravi', phone: '', description: 'The patient. A retired LIC officer with a warm heart and sharp memory in his prime days. Enjoys music, family stories, and his daily routine.', visits: 'Self', recognitionRate: 100, image: '/images/ravi.png' },
]

// ── Guardian Memory Rooms ──────────────────────────────────── //

export interface MemoryObject {
    id: string
    name: string
    description: string
    location: string
    recallScore: number
    category: 'furniture' | 'appliance' | 'personal' | 'decor' | string
}

export interface MemoryRoom {
    id: string
    name: string
    description: string
    objectCount: number
    recallAvg: number
    objects: MemoryObject[]
}

export const mockMemoryRooms: MemoryRoom[] = [
    {
        id: 'mr-1',
        name: 'Living Room',
        description: 'Main social area of the house',
        objectCount: 3,
        recallAvg: 85,
        objects: [
            { id: 'mo-1', name: 'Sofa', description: 'Beige three-seater sofa', location: 'Center', recallScore: 90, category: 'furniture' },
            { id: 'mo-2', name: 'TV', description: 'Samsung smart TV', location: 'North wall', recallScore: 80, category: 'appliance' },
        ],
    },
]

// ── Guardian Health Records ────────────────────────────────── //

export interface HealthRecord {
    id: string
    title: string
    type: 'prescription' | 'lab' | 'note'
    date: string
    doctorName: string
    facility: string
}

export const mockHealthRecords: HealthRecord[] = [
    {
        id: 'hr-1',
        title: 'Neurology Follow-up & MMSE',
        type: 'note',
        date: '2026-02-15',
        doctorName: 'Sunita Patel',
        facility: 'Fortis Hospital Noida',
    },
    {
        id: 'hr-2',
        title: 'Complete Blood Count (CBC)',
        type: 'lab',
        date: '2026-01-20',
        doctorName: 'A. Gupta',
        facility: 'Max Lab Sec 18',
    },
    {
        id: 'hr-3',
        title: 'Donepezil Prescription Update',
        type: 'prescription',
        date: '2025-11-10',
        doctorName: 'Sunita Patel',
        facility: 'Fortis Hospital Noida',
    },
]

export interface Report {
    id: string
    title: string
    type: string
    date: string
    summary?: string
}

export const mockReports: Report[] = [
    { id: 'r-1', title: 'Monthly Cognitive Summary - Feb 2026', type: 'Clinical', date: '28-02-2026', summary: 'Cognitive scores show mild fluctuations; no acute decline.' },
    { id: 'r-2', title: 'Medication Adherence Report', type: 'Pharmacy', date: '15-02-2026', summary: 'Adherence 92% for prescribed medications this month.' },
    { id: 'r-3', title: 'Quarterly Geofence & Wandering Log', type: 'Safety', date: '01-01-2026', summary: 'No high-risk wandering events recorded during the quarter.' },
]
