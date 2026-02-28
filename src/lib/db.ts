import Database from 'better-sqlite3';
import path from 'path';

let _db: Database.Database | null = null;

export function getDb(): Database.Database {
    if (!_db) {
        _db = new Database(path.join(process.cwd(), 'saathicare.db'));
        _db.pragma('journal_mode = WAL');
        _db.pragma('foreign_keys = ON');
        initSchema(_db);

        // Auto-seed if empty
        const count = _db.prepare('SELECT COUNT(*) as c FROM users').get() as { c: number };
        if (count.c === 0) {
            const { seedDatabase } = require('./seed');
            seedDatabase(_db);
        }
    }
    return _db;
}

function initSchema(db: Database.Database) {
    db.exec(`
    CREATE TABLE IF NOT EXISTS users (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      email TEXT UNIQUE NOT NULL,
      password_hash TEXT NOT NULL,
      role TEXT NOT NULL CHECK(role IN ('patient','guardian','caretaker')),
      avatar_url TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS patient_profiles (
      id TEXT PRIMARY KEY,
      user_id TEXT UNIQUE REFERENCES users(id),
      dob TEXT,
      blood_type TEXT,
      allergies TEXT,
      conditions TEXT,
      medications TEXT,
      address TEXT,
      preferred_name TEXT,
      preferred_language TEXT DEFAULT 'en',
      photo_url TEXT,
      qr_token TEXT UNIQUE NOT NULL,
      care_stage TEXT DEFAULT 'moderate' CHECK(care_stage IN ('early','moderate','severe')),
      cognitive_score INTEGER DEFAULT 72,
      emergency_instructions TEXT
    );

    CREATE TABLE IF NOT EXISTS guardian_patient (
      guardian_id TEXT REFERENCES users(id),
      patient_id TEXT REFERENCES users(id),
      relationship TEXT DEFAULT 'family',
      PRIMARY KEY (guardian_id, patient_id)
    );

    CREATE TABLE IF NOT EXISTS caretaker_patient (
      caretaker_id TEXT REFERENCES users(id),
      patient_id TEXT REFERENCES users(id),
      shift TEXT DEFAULT 'day',
      PRIMARY KEY (caretaker_id, patient_id)
    );

    CREATE TABLE IF NOT EXISTS schedule_tasks (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      title TEXT NOT NULL,
      description TEXT,
      scheduled_time TEXT NOT NULL,
      category TEXT DEFAULT 'general',
      image_url TEXT,
      is_completed INTEGER DEFAULT 0,
      completed_at INTEGER,
      date TEXT NOT NULL,
      created_by TEXT REFERENCES users(id)
    );

    CREATE TABLE IF NOT EXISTS memory_cards (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      description TEXT,
      image_url TEXT,
      category TEXT DEFAULT 'general',
      recall_count INTEGER DEFAULT 0,
      total_attempts INTEGER DEFAULT 0,
      last_shown INTEGER,
      created_by TEXT REFERENCES users(id),
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS people_cards (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      name TEXT NOT NULL,
      relationship TEXT NOT NULL,
      bio TEXT,
      photo_url TEXT,
      voice_note_url TEXT,
      last_visited TEXT,
      phone TEXT,
      display_order INTEGER DEFAULT 0
    );

    CREATE TABLE IF NOT EXISTS memory_room_objects (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      room TEXT NOT NULL,
      object_name TEXT NOT NULL,
      position_x REAL NOT NULL,
      position_y REAL NOT NULL,
      question TEXT NOT NULL,
      answer TEXT NOT NULL,
      description TEXT,
      memory_tip TEXT,
      is_safety_item INTEGER DEFAULT 0,
      image_url TEXT
    );

    CREATE TABLE IF NOT EXISTS qr_scans (
      id TEXT PRIMARY KEY,
      qr_token TEXT NOT NULL,
      scanner_name TEXT,
      location TEXT,
      scanned_at INTEGER DEFAULT (unixepoch()),
      session_id TEXT
    );

    CREATE TABLE IF NOT EXISTS chat_messages (
      id TEXT PRIMARY KEY,
      session_id TEXT NOT NULL,
      sender_type TEXT NOT NULL,
      sender_name TEXT,
      content TEXT NOT NULL,
      sent_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS internal_messages (
      id TEXT PRIMARY KEY,
      room_id TEXT NOT NULL,
      sender_id TEXT REFERENCES users(id),
      content TEXT NOT NULL,
      sent_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS journal_entries (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      caretaker_id TEXT REFERENCES users(id),
      mood_score INTEGER,
      mood_label TEXT,
      appetite TEXT,
      sleep_quality TEXT,
      incidents TEXT,
      notes TEXT,
      created_at INTEGER DEFAULT (unixepoch()),
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS medications (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      name TEXT NOT NULL,
      dosage TEXT NOT NULL,
      frequency TEXT NOT NULL,
      time_of_day TEXT,
      instructions TEXT,
      photo_url TEXT,
      is_active INTEGER DEFAULT 1
    );

    CREATE TABLE IF NOT EXISTS medication_logs (
      id TEXT PRIMARY KEY,
      medication_id TEXT REFERENCES medications(id),
      patient_id TEXT REFERENCES users(id),
      administered_at INTEGER DEFAULT (unixepoch()),
      administered_by TEXT REFERENCES users(id),
      notes TEXT,
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS health_records (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      title TEXT NOT NULL,
      record_type TEXT,
      file_url TEXT,
      doctor_name TEXT,
      hospital TEXT,
      notes TEXT,
      record_date TEXT,
      uploaded_by TEXT REFERENCES users(id),
      uploaded_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS game_sessions (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      game_type TEXT NOT NULL,
      score INTEGER,
      stars INTEGER,
      duration_seconds INTEGER,
      played_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS alerts (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      alert_type TEXT NOT NULL,
      severity TEXT CHECK(severity IN ('low','medium','high','critical')),
      message TEXT NOT NULL,
      is_read INTEGER DEFAULT 0,
      created_at INTEGER DEFAULT (unixepoch())
    );

    CREATE TABLE IF NOT EXISTS mood_logs (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      mood TEXT NOT NULL,
      source TEXT DEFAULT 'music_therapy',
      logged_at INTEGER DEFAULT (unixepoch()),
      date TEXT NOT NULL
    );

    CREATE TABLE IF NOT EXISTS companion_conversations (
      id TEXT PRIMARY KEY,
      patient_id TEXT REFERENCES users(id),
      messages TEXT,
      mood_detected TEXT,
      alert_triggered INTEGER DEFAULT 0,
      session_date TEXT,
      created_at INTEGER DEFAULT (unixepoch())
    );
  `);
}
