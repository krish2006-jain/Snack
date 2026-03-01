// Mock data for SaathiCare - Ravi Sharma, 72, Moderate Alzheimer's

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

// TODAY'S SCHEDULE - 9 tasks across all categories
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
        description: 'Idli sabzi + warm milk - no spicy food today',
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
        description: 'Dal chawal + seasonal sabzi - no spicy food',
        photo: '',
    },
    {
        id: 'task-7',
        title: 'Afternoon Rest',
        time: '2:30 PM',
        status: 'upcoming',
        category: 'Rest',
        description: 'Rest in bed - keep blinds half-closed, no screen time',
        photo: '',
    },
    {
        id: 'task-8',
        title: 'Word Recall Game',
        time: '4:00 PM',
        status: 'upcoming',
        category: 'Game',
        description: 'Play the word recall game for 10 minutes - good for memory!',
        photo: '',
    },
    {
        id: 'task-9',
        title: 'Water the Plants',
        time: '5:30 PM',
        status: 'upcoming',
        category: 'Chore',
        description: 'Water the balcony plants - tulsi, marigold, and the money plant',
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


// FLASHCARDS - 14 cards
export const mockFlashcards: Flashcard[] = [
    {
        id: 'fc-1',
        category: 'family',
        question: 'Who is this smiling woman calling you every Sunday?',
        answer: 'Priya - your daughter',
        description: 'Priya is your eldest daughter. She lives in Gurugram with her husband Rajesh and your grandchildren Aarav (8) and Riya (5). She calls you every Sunday evening.',
        photo: '/images/priya.png',
        tip: 'Think of the name that starts with P - like your favourite puri!',
    },
    {
        id: 'fc-2',
        category: 'family',
        question: 'Who is the young woman who brings you medicine every morning?',
        answer: 'Nurse Anita - your caretaker',
        description: 'Anita has been your daytime caretaker for two years. She joins you on morning walks and makes sure your medicines are taken on time.',
        photo: '/images/anita.png',
        tip: 'She wears white and is always carrying a small bag.',
    },
    {
        id: 'fc-3',
        category: 'family',
        question: 'What is the name of Priya\'s son - your grandson?',
        answer: 'Aarav - 8 years old',
        description: 'Aarav loves cricket and is in Class 3. He calls you "Dadu" and loves when you tell him stories.',
        photo: '/images/aarav.png',
        tip: 'Aarav - like "Aarav Shah" the singer. He is 8 years old.',
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
        answer: 'Delhi - at LIC Connaught Place office',
        description: 'You worked as a Branch Manager at Life Insurance Corporation\'s Connaught Place office for 30 years before retiring in 2018.',
        tip: 'The office had a big circular park nearby - Connaught Place.',
    },
    {
        id: 'fc-6',
        category: 'memories',
        question: 'What is the special dish your wife Kamla made every Sunday?',
        answer: 'Chole bhature - from her grandmother\'s recipe',
        description: 'Every Sunday morning, Kamla made chole bhature using her grandmother\'s recipe. The whole colony knew the smell. You still make it sometimes.',
        tip: 'Think of Sunday mornings - the sound of puris frying.',
    },
    {
        id: 'fc-7',
        category: 'memories',
        question: 'In which year did you get married?',
        answer: '1978 - in Varanasi',
        description: 'You married Kamla in 1978 in a traditional ceremony in Varanasi at the Dashashwamedh Ghat. You have been together for 45 wonderful years.',
        tip: '1978 - India was playing cricket against West Indies that year!',
    },
    {
        id: 'fc-8',
        category: 'memories',
        question: 'What sport did you love playing in your youth?',
        answer: 'Cricket - opening batsman for your colony team',
        description: 'You played cricket as an opening batsman for the Sector 7 colony team in Delhi from age 18 to 35. Your highest score was 84 not out.',
        tip: 'You always had your bat oiled and ready by the door.',
    },
    {
        id: 'fc-9',
        category: 'family',
        question: 'Who is Priya\'s husband\'s name?',
        answer: 'Rajesh Khanna - works in IT',
        description: 'Rajesh is Priya\'s husband. He works as a software engineer in Gurugram. He calls you every Friday evening and visits on festivals.',
        tip: 'Rajesh - same name as the famous actor, but different person!',
    },
    {
        id: 'fc-10',
        category: 'objects',
        question: 'What is this orange-and-blue box near your bed?',
        answer: 'Your medicine box - opened every morning and evening',
        description: 'This is your weekly medicine organiser. The morning slot has Donepezil (white tablet). Evening slot has Memantine (pink tablet) and Vitamin D capsule.',
        tip: 'Orange lid = morning, blue lid = evening.',
    },
    {
        id: 'fc-11',
        category: 'objects',
        question: 'What does the red button on your bracelet do?',
        answer: 'Calls Priya and Anita for help - press if you need anything',
        description: 'Your QR bracelet has a red button. Pressing it sends an alert to Priya and Anita immediately. You can also use it to scan and see your information.',
        tip: 'Red = help. Like a red traffic light - means stop and ask for help.',
    },
    {
        id: 'fc-12',
        category: 'places',
        question: 'Where is your favourite chai shop?',
        answer: 'Ram\'s tea stall - outside Sector 15 market',
        description: 'Ram\'s stall near the Sector 15 market gate has your favourite cutting chai with extra elaichi. You went there every morning before retirement.',
        tip: 'The tea shop with the old wooden bench outside the market.',
    },
    {
        id: 'fc-13',
        category: 'family',
        question: 'What is Priya\'s daughter\'s name - your granddaughter?',
        answer: 'Riya - 5 years old, loves drawing',
        description: 'Little Riya is 5 years old and already loves drawing and painting. She made a picture of you and it is on your bedroom wall.',
        tip: 'Riya - like "Riya" the actress. She always has colours on her hands.',
    },
    {
        id: 'fc-14',
        category: 'memories',
        question: 'What was your favourite film that you watched in cinema?',
        answer: 'Sholay - watched it 7 times in Regal Cinema, Delhi',
        description: 'Sholay was your all-time favourite film. You watched it 7 times in Regal Cinema in Connaught Place. You still remember all of Gabbar\'s dialogues.',
        tip: 'Kitne aadmi the? - you never forget that dialogue!',
    },
];

// PEOPLE WALLET - 7 people
export const mockPeople: PersonCard[] = [
    {
        id: 'person-0',
        name: 'Ravi Sharma (You)',
        relationship: 'Self',
        photo: '/images/ravi.png',
        bio: 'This is you. A retired LIC officer with a warm heart, you enjoy music and stories from the past.',
        lastVisited: 'Today',
        phone: '',
    },
    {
        id: 'person-1',
        name: 'Smita Sharma',
        relationship: 'Wife',
        photo: '/images/smita.png',
        bio: 'Your beloved wife of over 40 years. She takes care of you every day and keeps the household running smoothly. Her gentle presence comforts you.',
        lastVisited: 'Today',
        phone: '',
    },
    {
        id: 'person-2',
        name: 'Priya Sharma',
        relationship: 'Daughter',
        photo: '/images/priya.png',
        bio: 'Your eldest daughter. Calls every Sunday and visits weekly with her husband Rajesh and the kids. She manages your medication schedule and health appointments.',
        lastVisited: '3 days ago',
        phone: '+91 98765 12345',
    },
    {
        id: 'person-3',
        name: 'Nurse Anita',
        relationship: 'Caretaker',
        photo: '/images/anita.png',
        bio: 'Anita is with you every day from 8 AM–4 PM. She helps with medication, walks, and everyday tasks. You trust her deeply.',
        lastVisited: 'Today',
        phone: '+91 98765 67890',
    },
    {
        id: 'person-4',
        name: 'Aarav Sharma',
        relationship: 'Grandson',
        photo: '/images/aarav.png',
        bio: 'Priya’s 8‑year‑old son. Loves cricket and always runs to give you a hug when he visits during school holidays.',
        lastVisited: '2 weeks ago',
        phone: '',
    },
    {
        id: 'person-5',
        name: 'Riya Sharma',
        relationship: 'Granddaughter',
        photo: '/images/riya.png',
        bio: 'Priya’s 5‑year‑old daughter. She adores drawing and painted a picture of you that hangs in your room.',
        lastVisited: '2 weeks ago',
        phone: '',
    },
    {
        id: 'person-6',
        name: 'Mohit Sharma',
        relationship: 'Son',
        photo: '/images/mohit.png',
        bio: 'Your younger son working in Mumbai as a software engineer. Visits during festivals and calls frequently to check on you.',
        lastVisited: '1 week ago',
        phone: '+91 98765 54321',
    },
];

// VOICE JOURNAL - Patient-recorded stories
export interface VoiceJournalEntry {
    id: string;
    transcription: string;
    entities: string[];
    sentiment: 'happy' | 'neutral' | 'nostalgic' | 'sad';
    durationSeconds: number;
    createdAt: string; // ISO date
    timeLabel: string; // "Today", "Yesterday", etc.
}

export const mockVoiceJournal: VoiceJournalEntry[] = [
    {
        id: 'vj-1',
        transcription: 'Today Priya came to visit me. She brought Aarav and Riya. Aarav showed me his cricket trophy - he won at school! We had chai together and I told them about the time I scored 84 runs in the colony match.',
        entities: ['Priya', 'Aarav', 'Riya', 'cricket', 'chai'],
        sentiment: 'happy',
        durationSeconds: 32,
        createdAt: new Date().toISOString(),
        timeLabel: 'Today',
    },
    {
        id: 'vj-2',
        transcription: 'Anita took me for a walk this morning. The marigolds in the garden are blooming so beautifully. I remembered that Smita planted them last spring. The air smelled just like our old house in Varanasi.',
        entities: ['Anita', 'Smita', 'garden', 'Varanasi'],
        sentiment: 'nostalgic',
        durationSeconds: 28,
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        timeLabel: 'Yesterday',
    },
    {
        id: 'vj-3',
        transcription: 'I had dal chawal for lunch today. It was good but I miss the way Kamla used to make it with extra ghee. Mohit called in the evening, he said he will come for Holi.',
        entities: ['Mohit', 'Kamla', 'dal chawal', 'Holi'],
        sentiment: 'neutral',
        durationSeconds: 22,
        createdAt: new Date(Date.now() - 2 * 24 * 3600 * 1000).toISOString(),
        timeLabel: '2 days ago',
    },
    {
        id: 'vj-4',
        transcription: 'I was looking at the old photo of our wedding. Such a beautiful day it was in Varanasi. I can still remember the sound of the shehnai and the smell of the marigold garlands. Smita looked so beautiful that day.',
        entities: ['Smita', 'Varanasi', 'wedding'],
        sentiment: 'nostalgic',
        durationSeconds: 35,
        createdAt: new Date(Date.now() - 4 * 24 * 3600 * 1000).toISOString(),
        timeLabel: '4 days ago',
    },
    {
        id: 'vj-5',
        transcription: 'Played the card match game today and scored 88! Anita said I am getting better. I remembered all the photos - Priya, Smita, Aarav, everyone. Feeling good today.',
        entities: ['Anita', 'Priya', 'Smita', 'Aarav'],
        sentiment: 'happy',
        durationSeconds: 18,
        createdAt: new Date(Date.now() - 6 * 24 * 3600 * 1000).toISOString(),
        timeLabel: '6 days ago',
    },
];

// FAMILY CONTRIBUTIONS - Stories from family
export interface FamilyContribution {
    id: string;
    contributorName: string;
    contributorRelation: string;
    contributorPhoto: string;
    contentType: 'text' | 'voice' | 'photo';
    title: string;
    content: string;
    photoUrl?: string;
    status: 'pending' | 'approved' | 'rejected';
    createdAt: string;
    timeLabel: string;
}

export const mockFamilyContributions: FamilyContribution[] = [
    {
        id: 'fc-1',
        contributorName: 'Priya Sharma',
        contributorRelation: 'Daughter',
        contributorPhoto: '/images/priya.png',
        contentType: 'text',
        title: 'Remember our Sunday Picnic?',
        content: 'Papa, remember when we went to India Gate for a picnic? You bought us all ice cream - butterscotch for me and chocolate for Mohit. You said "Ice cream is the best medicine!" We sat on the grass and watched the sunset. That was the most peaceful evening. I still think about it whenever I eat butterscotch ice cream. Love you, Papa!',
        status: 'approved',
        createdAt: new Date(Date.now() - 2 * 3600 * 1000).toISOString(),
        timeLabel: '2 hours ago',
    },
    {
        id: 'fc-2',
        contributorName: 'Mohit Sharma',
        contributorRelation: 'Son',
        contributorPhoto: '/images/mohit.png',
        contentType: 'text',
        title: 'Your Cricket Stories',
        content: 'Papa, I told my friends about your 84 not out in the colony match. They could not believe it! You always said "Cricket teaches patience" - I use that advice every day at work. Missing you in Mumbai. Will come soon for Holi. Keep playing those brain games - your grandson Aarav says he wants to challenge you!',
        status: 'approved',
        createdAt: new Date(Date.now() - 24 * 3600 * 1000).toISOString(),
        timeLabel: 'Yesterday',
    },
    {
        id: 'fc-3',
        contributorName: 'Aarav Sharma',
        contributorRelation: 'Grandson',
        contributorPhoto: '/images/aarav.png',
        contentType: 'text',
        title: 'I Won a Trophy, Dadu!',
        content: 'Dadu! I won the cricket trophy at school! 🏆 I scored 42 runs just like you taught me. Opening batsman! My coach said I play like a champion. I am going to bring the trophy to show you next time. I want to play the card game with you too! Love you Dadu!',
        status: 'approved',
        createdAt: new Date(Date.now() - 3 * 24 * 3600 * 1000).toISOString(),
        timeLabel: '3 days ago',
    },
    {
        id: 'fc-4',
        contributorName: 'Riya Sharma',
        contributorRelation: 'Granddaughter',
        contributorPhoto: '/images/riya.png',
        contentType: 'text',
        title: 'I Drew You, Dadu!',
        content: 'Dadu, I drew a picture of you and me in the garden! You are watering the marigolds and I am painting. Mummy said she will bring it when we visit. I used your favourite colour - orange like the marigolds! I love you Dadu. 🌸🎨',
        status: 'approved',
        createdAt: new Date(Date.now() - 5 * 24 * 3600 * 1000).toISOString(),
        timeLabel: '5 days ago',
    },
    {
        id: 'fc-5',
        contributorName: 'Smita Sharma',
        contributorRelation: 'Wife',
        contributorPhoto: '/images/smita.png',
        contentType: 'text',
        title: 'Our Evening Chai Routine',
        content: 'My dear Ravi, every evening we sit together on the balcony with chai. You always ask for extra ginger and two spoons of sugar. We watch the birds come home to the neem tree. These small moments are everything. I am always right here beside you. Always.',
        status: 'approved',
        createdAt: new Date(Date.now() - 7 * 24 * 3600 * 1000).toISOString(),
        timeLabel: '1 week ago',
    },
    {
        id: 'fc-6',
        contributorName: 'Mohit Sharma',
        contributorRelation: 'Son',
        contributorPhoto: '/images/mohit.png',
        contentType: 'text',
        title: 'Your Favourite Sholay Dialogue',
        content: 'Papa, at the office party I quoted your favourite dialogue - "Kitne aadmi the?" Everyone laughed! You would have loved it. Remember how we watched Sholay together 7 times? I think the next time I visit we should watch it again. Regal Cinema style, at home!',
        status: 'pending',
        createdAt: new Date(Date.now() - 1 * 3600 * 1000).toISOString(),
        timeLabel: '1 hour ago',
    },
];
