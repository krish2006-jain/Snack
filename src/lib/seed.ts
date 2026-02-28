import type Database from 'better-sqlite3';
import { v4 as uuid } from 'uuid';
import bcrypt from 'bcryptjs';

const PATIENT_ID = 'patient-ravi-001';
const GUARDIAN_ID = 'guardian-priya-001';
const CARETAKER_ID = 'caretaker-anita-001';
const QR_TOKEN = 'ravi-sharma-2024';

export function seedDatabase(db: Database.Database) {
    console.log('[Seed] Seeding demo data...');

    const passwordHash = bcrypt.hashSync('demo123', 10);

    // ── Users ──
    const insertUser = db.prepare(
        'INSERT INTO users (id, name, email, password_hash, role) VALUES (?, ?, ?, ?, ?)'
    );
    insertUser.run(PATIENT_ID, 'Ravi Sharma', 'ravi@saathi.care', passwordHash, 'patient');
    insertUser.run(GUARDIAN_ID, 'Priya Sharma', 'priya@saathi.care', passwordHash, 'guardian');
    insertUser.run(CARETAKER_ID, 'Nurse Anita', 'anita@saathi.care', passwordHash, 'caretaker');

    // ── Patient Profile ──
    db.prepare(`INSERT INTO patient_profiles
    (id, user_id, dob, blood_type, allergies, conditions, medications, address,
     preferred_name, preferred_language, qr_token, care_stage, cognitive_score,
     emergency_instructions)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)`)
        .run(
            uuid(), PATIENT_ID, '1954-03-15', 'B+',
            JSON.stringify(['Penicillin', 'Shellfish']),
            JSON.stringify(['Moderate Alzheimer\'s Disease', 'Hypertension', 'Type 2 Diabetes']),
            JSON.stringify(['Donepezil 10mg', 'Amlodipine 5mg', 'Metformin 500mg']),
            '42, Sector 15, Noida, UP 201301',
            'Baba', 'hi', QR_TOKEN, 'moderate', 72,
            'Speak slowly and clearly. He responds to the name "Baba". Prefers Hindi but understands English. Do not give any food containing shellfish.'
        );

    // ── Relationships ──
    db.prepare('INSERT INTO guardian_patient (guardian_id, patient_id, relationship) VALUES (?, ?, ?)')
        .run(GUARDIAN_ID, PATIENT_ID, 'daughter');
    db.prepare('INSERT INTO caretaker_patient (caretaker_id, patient_id, shift) VALUES (?, ?, ?)')
        .run(CARETAKER_ID, PATIENT_ID, 'day');

    // ── Schedule Tasks (7 tasks for today) ──
    const today = new Date().toISOString().split('T')[0];
    const insertTask = db.prepare(
        'INSERT INTO schedule_tasks (id, patient_id, title, description, scheduled_time, category, is_completed, date, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const tasks = [
        ['Morning Medicine', 'Take Donepezil 10mg with water', '08:00', 'medication', 1],
        ['Breakfast', 'Oatmeal with honey and banana', '08:30', 'meal', 1],
        ['Morning Walk', '20 minutes in the garden with Anita', '09:30', 'activity', 1],
        ['Memory Game Session', 'Card Match — 15 minutes', '10:30', 'therapy', 0],
        ['Lunch', 'Dal chawal with salad', '12:30', 'meal', 0],
        ['Afternoon Rest', 'Nap time with calming music', '14:00', 'rest', 0],
        ['Evening Medicine', 'Amlodipine 5mg + Metformin 500mg', '18:00', 'medication', 0],
    ];
    for (const [title, desc, time, cat, completed] of tasks) {
        insertTask.run(uuid(), PATIENT_ID, title, desc, time, cat, completed, today, GUARDIAN_ID);
    }

    // ── Memory Flashcards (12 cards) ──
    const insertMemory = db.prepare(
        'INSERT INTO memory_cards (id, patient_id, question, answer, description, category, recall_count, total_attempts, created_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const memories = [
        ['Who is this woman?', 'Meera Sharma — your wife', 'You married Meera on March 15, 1985 in Jaipur. She loves gardening.', 'family', 8, 10],
        ['Who is this young woman?', 'Priya Sharma — your daughter', 'Priya is your first daughter. She lives in Gurugram and visits every Sunday.', 'family', 7, 10],
        ['What is this place?', 'Your childhood home in Jaipur', 'You grew up in a haveli near Hawa Mahal. Your mother made the best dal batti.', 'home', 5, 10],
        ['What happened here?', 'Your wedding day — March 15, 1985', 'You married Meera at Jai Mahal Palace. 300 guests attended.', 'events', 6, 10],
        ['Who is this boy?', 'Rahul — your grandson', 'Rahul is Priya\'s son. He is 8 years old and loves cricket, just like you.', 'family', 4, 10],
        ['What is this building?', 'St. Xavier\'s School, Jaipur', 'You were a mathematics teacher here for 35 years. You retired in 2014.', 'events', 6, 10],
        ['Who is this person?', 'Dr. Sunita Patel — your neurologist', 'She has been your doctor for 3 years. Appointments every 6 weeks.', 'family', 3, 8],
        ['What is your favourite food?', 'Dal Chawal with mango pickle', 'Meera makes it every Wednesday. You add extra ghee.', 'home', 9, 10],
        ['What is this song?', 'Your favourite bhajan — Om Jai Jagdish Hare', 'You used to sing this every morning during pooja.', 'events', 7, 10],
        ['Who is this woman?', 'Sunita — your sister', 'She lives in Delhi. You call her every Sunday evening.', 'family', 5, 10],
        ['What is this room?', 'Your kitchen at Sector 15', 'You love making chai with ginger here every morning.', 'home', 8, 10],
        ['What did you teach?', 'Mathematics at St. Xavier\'s', 'You were known as "Sharma Sir". Students still visit you.', 'events', 6, 10],
    ];
    for (const [q, a, desc, cat, recall, total] of memories) {
        insertMemory.run(uuid(), PATIENT_ID, q, a, desc, cat, recall, total, GUARDIAN_ID);
    }

    // ── People Wallet (6 people) ──
    const insertPerson = db.prepare(
        'INSERT INTO people_cards (id, patient_id, name, relationship, bio, last_visited, phone, display_order) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const people = [
        ['Priya Sharma', 'Daughter', 'Your first daughter. Lives in Gurugram with her husband. Visits every Sunday with Rahul.', '2 days ago', '+91 98765 43210', 1],
        ['Meera Sharma', 'Wife', 'Your wife of 41 years. She loves gardening and makes the best chai.', 'Lives with you', '+91 98765 12345', 0],
        ['Rahul Sharma', 'Grandson', 'Priya\'s son, 8 years old. Loves cricket and drawing. Calls you "Dadu".', '2 days ago', null, 2],
        ['Dr. Sunita Patel', 'Neurologist', 'Your doctor for 3 years. Appointments every 6 weeks at Fortis Hospital.', '2 weeks ago', '+91 98765 99999', 3],
        ['Nurse Anita', 'Caretaker', 'Your daily caretaker. She comes at 8 AM and helps with medicines and walks.', 'Today', '+91 98765 67890', 4],
        ['Arjun Sharma', 'Son', 'Your second child. Lives in Bangalore. Software engineer at Infosys.', '3 weeks ago', '+91 98765 55555', 5],
    ];
    for (const [name, rel, bio, visited, phone, order] of people) {
        insertPerson.run(uuid(), PATIENT_ID, name, rel, bio, visited, phone, order);
    }

    // ── Memory Room Objects — Kitchen (6 objects) ──
    const insertRoomObj = db.prepare(
        'INSERT INTO memory_room_objects (id, patient_id, room, object_name, position_x, position_y, question, answer, description, memory_tip, is_safety_item) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const kitchenObjects = [
        ['Tea Cup', 35, 60, 'What do you drink every morning?', 'Your morning chai with ginger', 'You love your chai with two spoons of sugar and a little ginger. Priya makes it for you every morning.', 'Picture the warmth of the cup in your hands.', 0],
        ['Spice Box', 55, 45, 'What is in this box?', 'Your masala dabba', 'Meera keeps it on the kitchen shelf. It has haldi, jeera, mirchi, dhaniya, garam masala, and hing.', 'Try to recall the smell of each spice.', 0],
        ['Stove', 40, 35, 'What do you use this for?', 'Cooking meals', 'Meera uses this to make your dal chawal every day. Please ask for help before using it.', 'Remember the sound of the pressure cooker.', 1],
        ['Fridge', 70, 40, 'What is kept inside?', 'Food and medicines', 'Your afternoon fruit is in the top shelf. Your insulin is in the door compartment.', 'Check with Anita before taking anything from the fridge.', 1],
        ['Clock', 20, 25, 'What time is it usually when you come here?', 'Morning — around 8 AM', 'You come to the kitchen for chai at 8 AM. Lunch is at 12:30 PM.', 'Routines help you feel safe.', 0],
        ['Medicine Box', 80, 55, 'What is in this box?', 'Your daily medicines', 'Donepezil in the morning, Amlodipine and Metformin in the evening. Anita helps you take them.', 'Never take medicines without Anita or Priya.', 1],
    ];
    for (const [name, x, y, q, a, desc, tip, safety] of kitchenObjects) {
        insertRoomObj.run(uuid(), PATIENT_ID, 'kitchen', name, x, y, q, a, desc, tip, safety);
    }

    // ── Memory Room Objects — Bedroom (5 objects) ──
    const bedroomObjects = [
        ['Photo Frame', 30, 30, 'Who is in this photo?', 'Meera and you on your wedding day', 'This was taken at Jai Mahal Palace in 1985. Meera is wearing a red sari.', 'Look at this photo every night before sleeping.', 0],
        ['Alarm Clock', 60, 25, 'What time do you wake up?', '7 AM every morning', 'Anita arrives at 8 AM. You have 1 hour to freshen up.', 'Routine keeps your day steady.', 0],
        ['Pillow', 45, 55, 'Where do you rest?', 'This is your bed', 'You sleep on the right side. Meera sleeps on the left.', 'A good night\'s sleep helps your memory.', 0],
        ['Wardrobe', 80, 40, 'Where are your clothes?', 'In this wardrobe', 'Priya organized it: everyday clothes on the left, prayer clothes on the right.', 'Ask Anita if you cannot find something.', 0],
        ['Prayer Beads', 15, 50, 'What do you use these for?', 'Morning prayer', 'You recite the Hanuman Chalisa every morning at 7:15 AM.', 'Prayer beads can calm your mind.', 0],
    ];
    for (const [name, x, y, q, a, desc, tip, safety] of bedroomObjects) {
        insertRoomObj.run(uuid(), PATIENT_ID, 'bedroom', name, x, y, q, a, desc, tip, safety);
    }

    // ── Medications (5) ──
    const insertMed = db.prepare(
        'INSERT INTO medications (id, patient_id, name, dosage, frequency, time_of_day, instructions, is_active) VALUES (?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const meds = [
        ['Donepezil', '10mg', 'Once daily', 'Morning', 'Take with breakfast. For Alzheimer\'s management.'],
        ['Amlodipine', '5mg', 'Once daily', 'Evening', 'For blood pressure. Take after dinner.'],
        ['Metformin', '500mg', 'Twice daily', 'Morning, Evening', 'For diabetes. Take with meals.'],
        ['Melatonin', '3mg', 'Once daily', 'Bedtime', 'For sleep. Take 30 minutes before bed.'],
        ['Vitamin D3', '1000 IU', 'Once daily', 'Morning', 'Take with breakfast. For bone health.'],
    ];
    for (const [name, dosage, freq, time, instr] of meds) {
        insertMed.run(uuid(), PATIENT_ID, name, dosage, freq, time, instr, 1);
    }

    // ── Journal Entries (5) ──
    const insertJournal = db.prepare(
        'INSERT INTO journal_entries (id, patient_id, caretaker_id, mood_score, mood_label, appetite, sleep_quality, incidents, notes, date) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const journalDates = Array.from({ length: 5 }, (_, i) => {
        const d = new Date();
        d.setDate(d.getDate() - i);
        return d.toISOString().split('T')[0];
    });
    const journals = [
        [4, 'Good', 'good', 'good', null, 'Patient had a calm morning. Enjoyed card match game.'],
        [3, 'Okay', 'moderate', 'fair', 'Patient became confused about the time around 3 PM', 'Required extra reassurance in the afternoon. Music therapy helped.'],
        [4, 'Good', 'good', 'good', null, 'Great day. Recognized Priya in People Wallet without help.'],
        [2, 'Low', 'poor', 'restless', 'Patient tried to leave the house at 2 AM', 'Restless night. Increased sundowning. Dr. Patel consulted.'],
        [3, 'Okay', 'moderate', 'fair', null, 'Average day. Completed 5 of 7 schedule tasks.'],
    ];
    for (let i = 0; i < journals.length; i++) {
        const [mood, label, appetite, sleep, incidents, notes] = journals[i];
        insertJournal.run(uuid(), PATIENT_ID, CARETAKER_ID, mood, label, appetite, sleep, incidents, notes, journalDates[i]);
    }

    // ── Game Sessions (30 days) ──
    const insertGame = db.prepare(
        'INSERT INTO game_sessions (id, patient_id, game_type, score, stars, duration_seconds, played_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const gameTypes = ['card_match', 'word_recall', 'pattern_tap'];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const ts = Math.floor(d.getTime() / 1000);
        const gameType = gameTypes[i % 3];
        const baseScore = 60 + Math.floor(Math.random() * 30);
        const stars = baseScore > 80 ? 3 : baseScore > 60 ? 2 : 1;
        insertGame.run(uuid(), PATIENT_ID, gameType, baseScore, stars, 120 + Math.floor(Math.random() * 180), ts);
    }

    // ── Alerts (6) ──
    const insertAlert = db.prepare(
        'INSERT INTO alerts (id, patient_id, alert_type, severity, message, is_read, created_at) VALUES (?, ?, ?, ?, ?, ?, ?)'
    );
    const now = Math.floor(Date.now() / 1000);
    const alertData = [
        ['medication_missed', 'high', 'Evening Memantine dose was not logged by caretaker', 0, now - 3600],
        ['recall_decline', 'medium', 'Memory recall accuracy dropped 12% this week', 0, now - 7200],
        ['qr_scan', 'low', 'QR code scanned near Sector 15 Market, Noida', 1, now - 22 * 3600],
        ['mood_change', 'medium', 'Caretaker observed agitation before walk', 1, now - 48 * 3600],
        ['game_decline', 'low', 'Card Match average score fell for 3 consecutive sessions', 1, now - 72 * 3600],
        ['geofence', 'critical', 'Patient left safe zone at 3:42 PM — resolved by caretaker', 1, now - 7 * 24 * 3600],
    ];
    for (const [type, sev, msg, read, ts] of alertData) {
        insertAlert.run(uuid(), PATIENT_ID, type, sev, msg, read, ts);
    }

    // ── Mood Logs (30 days) ──
    const insertMood = db.prepare(
        'INSERT INTO mood_logs (id, patient_id, mood, source, date) VALUES (?, ?, ?, ?, ?)'
    );
    const moods = ['calm', 'calm', 'anxious', 'happy', 'sad', 'calm', 'happy'];
    for (let i = 29; i >= 0; i--) {
        const d = new Date();
        d.setDate(d.getDate() - i);
        const dateStr = d.toISOString().split('T')[0];
        insertMood.run(uuid(), PATIENT_ID, moods[i % moods.length], 'music_therapy', dateStr);
    }

    // ── Health Records (3) ──
    const insertRecord = db.prepare(
        'INSERT INTO health_records (id, patient_id, title, record_type, doctor_name, hospital, notes, record_date, uploaded_by) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?)'
    );
    const records = [
        ['Neurological Assessment — Feb 2026', 'doctor_note', 'Dr. Sunita Patel', 'Fortis Hospital, Noida', 'Moderate cognitive decline. MMSE score: 18/30. Continue Donepezil.', '2026-02-15'],
        ['Complete Blood Count', 'lab_report', 'PathCare Labs', 'PathCare Diagnostics', 'All values within normal range. HbA1c: 6.8%', '2026-02-01'],
        ['Prescription Renewal', 'prescription', 'Dr. Sunita Patel', 'Fortis Hospital, Noida', 'Donepezil 10mg (continued), Amlodipine 5mg (continued), Metformin 500mg (continued)', '2026-02-15'],
    ];
    for (const [title, type, doctor, hospital, notes, date] of records) {
        insertRecord.run(uuid(), PATIENT_ID, title, type, doctor, hospital, notes, date, GUARDIAN_ID);
    }

    console.log('[Seed] Demo data seeded successfully.');
}
