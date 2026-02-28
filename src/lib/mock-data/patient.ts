// Mock data for SaathiCare — Ravi Sharma, 72, Moderate Alzheimer's

export interface Patient {
    id: string;
    name: string;
    age: number;
    condition: string;
    stage: 'early' | 'moderate' | 'severe';
    bloodType: string;
    allergies: string[];
    medications: string[];
    photo: string;
    location: string;
    phone: string;
    bloodGroup?: string;
    qrCode?: string;
    address?: string;
    emergencyNumber?: string;
    diagnosis?: string;
}

export interface Guardian {
    id: string;
    name: string;
    relationship: string;
    relation?: string;
    phone: string;
    email: string;
    photo: string;
}

export interface Caretaker {
    id: string;
    name: string;
    role: string;
    phone: string;
    photo: string;
    shiftStart: string;
    shiftEnd: string;
}

export type TaskCategory =
    | 'Medicine'
    | 'Meal'
    | 'Game'
    | 'Chore'
    | 'Therapy'
    | 'Exercise'
    | 'Rest'
    | 'Social';

export interface ScheduleTask {
    id: string;
    title: string;
    time: string;
    status: 'done' | 'upcoming' | 'missed';
    category: TaskCategory | string;
    description: string;
    photo?: string;
}

export interface Flashcard {
    id: string;
    category: 'family' | 'places' | 'memories' | 'objects';
    question: string;
    answer: string;
    description: string;
    photo?: string;
    tip: string;
}

export interface PersonCard {
    id: string;
    name: string;
    relationship: string;
    photo: string;
    bio: string;
    lastVisited: string;
    phone: string;
    voiceNote?: string;
}

// PATIENT
export const mockPatient: Patient = {
    id: 'ravi-sharma-2024',
    name: 'Ravi Sharma',
    age: 72,
    condition: 'Moderate Alzheimer\'s Disease',
    stage: 'moderate',
    bloodType: 'B+',
    allergies: ['Penicillin', 'Sulfa drugs'],
    medications: ['Donepezil 10mg', 'Memantine 20mg', 'Vitamin D3'],
    photo: '',
    location: 'Sector 15, Noida, UP',
    phone: '+91 98765 43210',
};

// GUARDIAN
export const mockGuardian: Guardian = {
    id: 'priya-sharma',
    name: 'Priya Sharma',
    relationship: 'Daughter',
    phone: '+91 98765 12345',
    email: 'priya@saathi.care',
    photo: '',
};

// CARETAKER
export const mockCaretaker: Caretaker = {
    id: 'nurse-anita',
    name: 'Nurse Anita',
    role: 'Day Caretaker',
    phone: '+91 98765 67890',
    photo: '',
    shiftStart: '8:00 AM',
    shiftEnd: '4:00 PM',
};

// TODAY'S SCHEDULE — 9 tasks across all categories
export const mockSchedule: ScheduleTask[] = [
    {
        id: 'task-1',
        title: 'Morning Walk',
        time: '7:00 AM',
        status: 'done',
        category: 'Exercise',
        description: '20-minute walk around Sector 15 park with Anita',
        photo: '',
    },
    {
        id: 'task-2',
        title: 'Morning Medicine',
        time: '8:30 AM',
        status: 'done',
        category: 'Medicine',
        description: 'Donepezil 10mg tablet with a glass of water after breakfast',
        photo: '',
    },
    {
        id: 'task-3',
        title: 'Breakfast',
        time: '8:00 AM',
        status: 'done',
        category: 'Meal',
        description: 'Idli sabzi + warm milk — no spicy food today',
        photo: '',
    },
    {
        id: 'task-4',
        title: 'Card Match Game',
        time: '10:00 AM',
        status: 'done',
        category: 'Game',
        description: 'Play the memory card match game for 15 minutes with Anita',
        photo: '',
    },
    {
        id: 'task-5',
        title: 'Tidy Bedroom',
        time: '11:30 AM',
        status: 'upcoming',
        category: 'Chore',
        description: 'Fold the blanket, arrange the bedside table, open the curtains',
        photo: '',
    },
    {
        id: 'task-6',
        title: 'Lunch',
        time: '1:00 PM',
        status: 'upcoming',
        category: 'Meal',
        description: 'Dal chawal + seasonal sabzi — no spicy food',
        photo: '',
    },
    {
        id: 'task-7',
        title: 'Afternoon Rest',
        time: '2:30 PM',
        status: 'upcoming',
        category: 'Rest',
        description: 'Rest in bed — keep blinds half-closed, no screen time',
        photo: '',
    },
    {
        id: 'task-8',
        title: 'Word Recall Game',
        time: '4:00 PM',
        status: 'upcoming',
        category: 'Game',
        description: 'Play the word recall game for 10 minutes — good for memory!',
        photo: '',
    },
    {
        id: 'task-9',
        title: 'Water the Plants',
        time: '5:30 PM',
        status: 'upcoming',
        category: 'Chore',
        description: 'Water the balcony plants — tulsi, marigold, and the money plant',
        photo: '',
    },
    {
        id: 'task-10',
        title: 'Video Call with Priya',
        time: '6:00 PM',
        status: 'upcoming',
        category: 'Social',
        description: 'Weekly video call with daughter Priya on the tablet',
        photo: '',
    },
    {
        id: 'task-11',
        title: 'Evening Medicine',
        time: '8:00 PM',
        status: 'upcoming',
        category: 'Medicine',
        description: 'Memantine 20mg + Vitamin D3 capsule with dinner',
        photo: '',
    },
];


// FLASHCARDS — 14 cards
export const mockFlashcards: Flashcard[] = [
    {
        id: 'fc-1',
        category: 'family',
        question: 'Who is this smiling woman calling you every Sunday?',
        answer: 'Priya — your daughter',
        description: 'Priya is your eldest daughter. She lives in Gurugram with her husband Rajesh and your grandchildren Aarav (8) and Riya (5). She calls you every Sunday evening.',
        tip: 'Think of the name that starts with P — like your favourite puri!',
    },
    {
        id: 'fc-2',
        category: 'family',
        question: 'Who is the young woman who brings you medicine every morning?',
        answer: 'Nurse Anita — your caretaker',
        description: 'Anita has been your daytime caretaker for two years. She joins you on morning walks and makes sure your medicines are taken on time.',
        tip: 'She wears white and is always carrying a small bag.',
    },
    {
        id: 'fc-3',
        category: 'family',
        question: 'What is the name of Priya\'s son — your grandson?',
        answer: 'Aarav — 8 years old',
        description: 'Aarav loves cricket and is in Class 3. He calls you "Dadu" and loves when you tell him stories.',
        tip: 'Aarav — like "Aarav Shah" the singer. He is 8 years old.',
    },
    {
        id: 'fc-4',
        category: 'places',
        question: 'Which area of Noida do you live in?',
        answer: 'Sector 15, Noida',
        description: 'Your home is in Sector 15, Noida. It is a two-bedroom flat on the 3rd floor. The park nearby is where you take your morning walk.',
        tip: 'You have lived here for 22 years after retiring from LIC.',
    },
    {
        id: 'fc-5',
        category: 'places',
        question: 'In which city did you work for 30 years?',
        answer: 'Delhi — at LIC Connaught Place office',
        description: 'You worked as a Branch Manager at Life Insurance Corporation\'s Connaught Place office for 30 years before retiring in 2018.',
        tip: 'The office had a big circular park nearby — Connaught Place.',
    },
    {
        id: 'fc-6',
        category: 'memories',
        question: 'What is the special dish your wife Kamla made every Sunday?',
        answer: 'Chole bhature — from her grandmother\'s recipe',
        description: 'Every Sunday morning, Kamla made chole bhature using her grandmother\'s recipe. The whole colony knew the smell. You still make it sometimes.',
        tip: 'Think of Sunday mornings — the sound of puris frying.',
    },
    {
        id: 'fc-7',
        category: 'memories',
        question: 'In which year did you get married?',
        answer: '1978 — in Varanasi',
        description: 'You married Kamla in 1978 in a traditional ceremony in Varanasi at the Dashashwamedh Ghat. You have been together for 45 wonderful years.',
        tip: '1978 — India was playing cricket against West Indies that year!',
    },
    {
        id: 'fc-8',
        category: 'memories',
        question: 'What sport did you love playing in your youth?',
        answer: 'Cricket — opening batsman for your colony team',
        description: 'You played cricket as an opening batsman for the Sector 7 colony team in Delhi from age 18 to 35. Your highest score was 84 not out.',
        tip: 'You always had your bat oiled and ready by the door.',
    },
    {
        id: 'fc-9',
        category: 'family',
        question: 'Who is Priya\'s husband\'s name?',
        answer: 'Rajesh Khanna — works in IT',
        description: 'Rajesh is Priya\'s husband. He works as a software engineer in Gurugram. He calls you every Friday evening and visits on festivals.',
        tip: 'Rajesh — same name as the famous actor, but different person!',
    },
    {
        id: 'fc-10',
        category: 'objects',
        question: 'What is this orange-and-blue box near your bed?',
        answer: 'Your medicine box — opened every morning and evening',
        description: 'This is your weekly medicine organiser. The morning slot has Donepezil (white tablet). Evening slot has Memantine (pink tablet) and Vitamin D capsule.',
        tip: 'Orange lid = morning, blue lid = evening.',
    },
    {
        id: 'fc-11',
        category: 'objects',
        question: 'What does the red button on your bracelet do?',
        answer: 'Calls Priya and Anita for help — press if you need anything',
        description: 'Your QR bracelet has a red button. Pressing it sends an alert to Priya and Anita immediately. You can also use it to scan and see your information.',
        tip: 'Red = help. Like a red traffic light — means stop and ask for help.',
    },
    {
        id: 'fc-12',
        category: 'places',
        question: 'Where is your favourite chai shop?',
        answer: 'Ram\'s tea stall — outside Sector 15 market',
        description: 'Ram\'s stall near the Sector 15 market gate has your favourite cutting chai with extra elaichi. You went there every morning before retirement.',
        tip: 'The tea shop with the old wooden bench outside the market.',
    },
    {
        id: 'fc-13',
        category: 'family',
        question: 'What is Priya\'s daughter\'s name — your granddaughter?',
        answer: 'Riya — 5 years old, loves drawing',
        description: 'Little Riya is 5 years old and already loves drawing and painting. She made a picture of you and it is on your bedroom wall.',
        tip: 'Riya — like "Riya" the actress. She always has colours on her hands.',
    },
    {
        id: 'fc-14',
        category: 'memories',
        question: 'What was your favourite film that you watched in cinema?',
        answer: 'Sholay — watched it 7 times in Regal Cinema, Delhi',
        description: 'Sholay was your all-time favourite film. You watched it 7 times in Regal Cinema in Connaught Place. You still remember all of Gabbar\'s dialogues.',
        tip: 'Kitne aadmi the? — you never forget that dialogue!',
    },
];

// PEOPLE WALLET — 6 people
export const mockPeople: PersonCard[] = [
    {
        id: 'person-1',
        name: 'Priya Sharma',
        relationship: 'Daughter',
        photo: '',
        bio: 'Your daughter who calls every Sunday. She lives in Gurugram with Rajesh and your grandchildren Aarav and Riya. She manages your care schedule.',
        lastVisited: '5 days ago',
        phone: '+91 98765 12345',
    },
    {
        id: 'person-2',
        name: 'Nurse Anita',
        relationship: 'Your Day Caretaker',
        photo: '',
        bio: 'Anita is with you every day from 8 AM to 4 PM. She gives you medication, goes on walks with you, and helps with daily activities.',
        lastVisited: 'Today',
        phone: '+91 98765 67890',
    },
    {
        id: 'person-3',
        name: 'Aarav',
        relationship: 'Grandson (Priya\'s son)',
        photo: '',
        bio: 'Aarav is 8 years old and loves cricket just like you! He calls you "Dadu" and loves your stories. He is in Class 3.',
        lastVisited: '2 weeks ago',
        phone: '',
    },
    {
        id: 'person-4',
        name: 'Riya',
        relationship: 'Granddaughter (Priya\'s daughter)',
        photo: '',
        bio: 'Riya is 5 years old and loves drawing. She made a painting of you and it is on your bedroom wall. She calls you "Dadu ji".',
        lastVisited: '2 weeks ago',
        phone: '',
    },
    {
        id: 'person-5',
        name: 'Rajesh Khanna',
        relationship: 'Son-in-law (Priya\'s husband)',
        photo: '',
        bio: 'Rajesh works in software in Gurugram. He visits on festivals and calls you every Friday evening. He respects you greatly.',
        lastVisited: '2 weeks ago',
        phone: '+91 98765 55555',
    },
    {
        id: 'person-6',
        name: 'Dr. Sunita Patel',
        relationship: 'Your Doctor',
        photo: '',
        bio: 'Dr. Sunita is a neurologist at Fortis Hospital, Noida. You visit her once a month. She is kind and always explains things slowly.',
        lastVisited: '22 days ago',
        phone: '+91 98765 99999',
    },
];
