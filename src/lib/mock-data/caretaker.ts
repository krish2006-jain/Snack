// ── Caretaker Mock Data ─────────────────────────────────────── //

export const caretakerProfile = {
    id: 'ct-001',
    name: 'Anita Desai',
    firstName: 'Anita',
    role: 'Senior Care Nurse',
    shift: '8 AM – 4 PM',
    shiftStart: '08:00',
    shiftEnd: '16:00',
    email: 'anita.desai@saathicare.in',
    phone: '+91 98204 55321',
    patientId: 'p-001',
    avatar: null,
    yearsExperience: 8,
    certifications: ['Dementia Care Specialist', 'First Aid', 'Medication Management'],
};

export type CaretakerTaskCategory = 'medication' | 'meal' | 'activity' | 'hygiene' | 'therapy' | 'check' | 'rest' | 'game' | 'chore' | 'social' | 'exercise';
export type TaskStatus = 'completed' | 'pending' | 'overdue' | 'skipped';

export interface CaretakerTask {
    id: string;
    title: string;
    time: string; // HH:MM
    category: CaretakerTaskCategory;
    status: TaskStatus;
    notes?: string;
    completedAt?: string;
}

export const todaysTasks: CaretakerTask[] = [
    {
        id: 't-01',
        title: 'Morning medication — Donepezil 10mg',
        time: '08:00',
        category: 'medication',
        status: 'completed',
        notes: 'Gave with warm milk. No issues.',
        completedAt: '08:07',
    },
    {
        id: 't-02',
        title: 'Assisted bath & morning hygiene',
        time: '08:30',
        category: 'hygiene',
        status: 'completed',
        completedAt: '08:55',
    },
    {
        id: 't-03',
        title: 'Breakfast — idli, sambar, fruit',
        time: '09:15',
        category: 'meal',
        status: 'completed',
        notes: 'Ate around 60% of the meal. Appetite seemed low.',
        completedAt: '09:45',
    },
    {
        id: 't-04',
        title: 'Memory flashcard session (15 min)',
        time: '10:30',
        category: 'therapy',
        status: 'completed',
        notes: 'Recognized Priya and Meera. Could not recall garden photo.',
        completedAt: '10:48',
    },
    {
        id: 't-05',
        title: 'Walk in the garden (20 min)',
        time: '11:00',
        category: 'activity',
        status: 'completed',
        completedAt: '11:24',
    },
    {
        id: 't-06',
        title: 'Mid-morning vitals check',
        time: '11:30',
        category: 'check',
        status: 'overdue',
        notes: '',
    },
    {
        id: 't-07',
        title: 'Lunch — dal khichdi, vegetables',
        time: '13:00',
        category: 'meal',
        status: 'completed',
        notes: 'Good appetite. Finished most of the plate.',
        completedAt: '13:35',
    },
    {
        id: 't-08',
        title: 'Afternoon nap',
        time: '14:00',
        category: 'rest',
        status: 'completed',
        completedAt: '15:02',
    },
    {
        id: 't-09',
        title: 'Evening medication — Memantine 10mg',
        time: '15:00',
        category: 'medication',
        status: 'pending',
    },
    {
        id: 't-10',
        title: 'Companion AI session (music)',
        time: '15:30',
        category: 'therapy',
        status: 'pending',
    },
    {
        id: 't-11',
        title: 'Evening snack — biscuits & tea',
        time: '16:00',
        category: 'meal',
        status: 'pending',
    },
    {
        id: 't-12',
        title: 'Handover notes to night shift',
        time: '16:00',
        category: 'check',
        status: 'pending',
    },
];

export interface JournalEntry {
    id: string;
    date: string; // ISO
    mood: 1 | 2 | 3 | 4 | 5;
    appetite: 'poor' | 'fair' | 'good' | 'excellent';
    sleep: 'poor' | 'fair' | 'good' | 'excellent';
    incidents: string;
    notes: string;
    caretakerId: string;
}

export const journalEntries: JournalEntry[] = [
    {
        id: 'j-01',
        date: '2026-02-28',
        mood: 4,
        appetite: 'fair',
        sleep: 'good',
        incidents: '',
        notes: 'Ravi was in a calm mood today. Recognized Priya in the photo session, which was a good sign. Repeated a story about his college days twice during the walk.',
        caretakerId: 'ct-001',
    },
    {
        id: 'j-02',
        date: '2026-02-27',
        mood: 3,
        appetite: 'poor',
        sleep: 'fair',
        incidents: 'Minor: Ravi became disoriented around 2 PM, thinking he was in his old office. Reassured him with music and the photo album. Calmed down within 20 minutes.',
        notes: 'Low energy all day. Ate very little at lunch. Pushed fluids throughout the shift.',
        caretakerId: 'ct-001',
    },
    {
        id: 'j-03',
        date: '2026-02-26',
        mood: 5,
        appetite: 'good',
        sleep: 'excellent',
        incidents: '',
        notes: 'Best day this week. Ravi sang along to old Hindi songs during the music session. Priya visited for 2 hours — patient was clearly happy. Finished entire lunch.',
        caretakerId: 'ct-001',
    },
    {
        id: 'j-04',
        date: '2026-02-25',
        mood: 2,
        appetite: 'poor',
        sleep: 'poor',
        incidents: 'Nighttime agitation reported by night shift. Kept trying to leave the room around 3 AM saying he needed to "go to work". Used weighted blanket.',
        notes: 'Visibly tired and irritable. Tried distraction techniques. Limited activity today to avoid overstimulation.',
        caretakerId: 'ct-001',
    },
    {
        id: 'j-05',
        date: '2026-02-24',
        mood: 4,
        appetite: 'good',
        sleep: 'good',
        incidents: '',
        notes: 'Engaged well with the memory game. Scored 7/10 on family recognition. Enjoyed apple slices with peanut butter for snack.',
        caretakerId: 'ct-001',
    },
    {
        id: 'j-06',
        date: '2026-02-23',
        mood: 3,
        appetite: 'fair',
        sleep: 'fair',
        incidents: 'Asked for wife (Savitri) repeatedly. Showed him the family photo book. Settled after seeing her picture.',
        notes: 'Sunday visits from family help. Priya called twice to check in. Reminded him about his granddaughter Meera\'s drawing on the fridge.',
        caretakerId: 'ct-001',
    },
    {
        id: 'j-07',
        date: '2026-02-22',
        mood: 4,
        appetite: 'excellent',
        sleep: 'good',
        incidents: '',
        notes: 'Very good day. Completed all therapy sessions. Walked 1800 steps. Ate everything at every meal. Told a new joke at dinner — memory fragments from earlier life are appearing more frequently.',
        caretakerId: 'ct-001',
    },
];

export interface Medication {
    id: string;
    name: string;
    genericName: string;
    dosage: string;
    frequency: string;
    timing: string[];
    purpose: string;
    sideEffectsToWatch: string[];
    administeredToday: boolean[];
    weeklyHistory: ('given' | 'missed' | 'skipped')[]; // last 7 days
    addedNote?: string;
}

export const medications: Medication[] = [
    {
        id: 'm-01',
        name: 'Donepezil (Aricept)',
        genericName: 'Donepezil HCl',
        dosage: '10mg tablet',
        frequency: 'Once daily',
        timing: ['08:00'],
        purpose: 'Improves memory and thinking',
        sideEffectsToWatch: ['Nausea', 'Loss of appetite', 'Vivid dreams'],
        administeredToday: [true],
        weeklyHistory: ['given', 'given', 'given', 'missed', 'given', 'given', 'given'],
        addedNote: 'Always give with food. If vomiting occurs, hold next dose and call Dr. Mehta.',
    },
    {
        id: 'm-02',
        name: 'Memantine (Namenda)',
        genericName: 'Memantine HCl',
        dosage: '10mg tablet',
        frequency: 'Twice daily',
        timing: ['08:00', '15:00'],
        purpose: 'Slows progression of moderate Alzheimer\'s',
        sideEffectsToWatch: ['Dizziness', 'Headache', 'Confusion'],
        administeredToday: [true, false],
        weeklyHistory: ['given', 'given', 'missed', 'given', 'given', 'given', 'given'],
    },
    {
        id: 'm-03',
        name: 'Amlodipine (Norvasc)',
        genericName: 'Amlodipine besylate',
        dosage: '5mg tablet',
        frequency: 'Once daily (morning)',
        timing: ['09:00'],
        purpose: 'Blood pressure control',
        sideEffectsToWatch: ['Swelling in ankles', 'Flushing', 'Palpitations'],
        administeredToday: [true],
        weeklyHistory: ['given', 'given', 'given', 'given', 'given', 'given', 'given'],
    },
    {
        id: 'm-04',
        name: 'Pantoprazole (Pantop)',
        genericName: 'Pantoprazole sodium',
        dosage: '40mg tablet',
        frequency: 'Once daily (before breakfast)',
        timing: ['07:45'],
        purpose: 'Prevents stomach upset from other medications',
        sideEffectsToWatch: ['Diarrhoea', 'Headache'],
        administeredToday: [true],
        weeklyHistory: ['given', 'given', 'given', 'given', 'given', 'given', 'given'],
    },
    {
        id: 'm-05',
        name: 'Vitamin D3 + B12',
        genericName: 'Cholecalciferol + Methylcobalamin',
        dosage: '1 sachet in water',
        frequency: 'Once weekly (Sundays)',
        timing: ['10:00'],
        purpose: 'Bone density and nerve health',
        sideEffectsToWatch: ['Nausea if not given with food'],
        administeredToday: [false],
        weeklyHistory: ['given', 'skipped', 'given', 'given', 'given', 'given', 'given'],
        addedNote: 'Sunday only. Mix with 200ml warm water.',
    },
];

export interface ChatMessageData {
    id: string;
    senderId: string;
    senderName: string;
    senderRole: 'caretaker' | 'guardian';
    content: string;
    timestamp: string;
    isOwn: boolean;
    status: 'sent' | 'delivered' | 'read';
}

export const chatHistory: ChatMessageData[] = [
    {
        id: 'msg-01',
        senderId: 'g-001',
        senderName: 'Priya Sharma',
        senderRole: 'guardian',
        content: 'Anita ji, namaskar 🙏 How was Papa\'s night? Shift team mentioned he was restless?',
        timestamp: '2026-02-28T08:15:00',
        isOwn: false,
        status: 'read',
    },
    {
        id: 'msg-02',
        senderId: 'ct-001',
        senderName: 'Anita Desai',
        senderRole: 'caretaker',
        content: 'Good morning, Priya ji. Yes, a little restless around 3 AM but calmed down quickly. This morning he\'s doing well — had breakfast and is now walking in the garden.',
        timestamp: '2026-02-28T08:22:00',
        isOwn: true,
        status: 'read',
    },
    {
        id: 'msg-03',
        senderId: 'g-001',
        senderName: 'Priya Sharma',
        senderRole: 'guardian',
        content: 'Thank you so much. Did he recognize you today? And did he take his Donepezil?',
        timestamp: '2026-02-28T08:25:00',
        isOwn: false,
        status: 'read',
    },
    {
        id: 'msg-04',
        senderId: 'ct-001',
        senderName: 'Anita Desai',
        senderRole: 'caretaker',
        content: 'Yes, he called me "baai" — he remembers me 😊 Donepezil given at 8:07 AM with warm milk as usual. I\'ll update the medication log now.',
        timestamp: '2026-02-28T08:31:00',
        isOwn: true,
        status: 'read',
    },
    {
        id: 'msg-05',
        senderId: 'g-001',
        senderName: 'Priya Sharma',
        senderRole: 'guardian',
        content: 'That\'s wonderful. I\'ll try to visit this evening around 6 PM. Please tell him Meera drew a picture for him — it\'s on the fridge.',
        timestamp: '2026-02-28T08:35:00',
        isOwn: false,
        status: 'read',
    },
];

export const quickMessages = [
    'Medication given ✅',
    'All good, resting now',
    'Appetite is low today',
    'Please call when free',
    'Vitals are normal',
    'Incident to report',
];
