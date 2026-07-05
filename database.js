// =======================================================
// AGENTIC AI HOSPITAL
// database.js
//
// This is the ONE single database for the entire project.
// It uses SQLite (via better-sqlite3) and stores everything
// in a single file: hospital.db
//
// Tables:
//   - patients      -> every person who submits the registration form
//   - doctors       -> hospital doctor roster + availability
//   - appointments  -> every appointment booked, linked to a patient + doctor
// =======================================================
const path = require("path");
const Database = require("better-sqlite3");

const DB_PATH = path.join(__dirname, "hospital.db");

// The database connection is created once and reused everywhere.
const db = new Database(DB_PATH);
db.pragma("journal_mode = WAL");
db.pragma("foreign_keys = ON");


const DEFAULT_DOCTORS = [
    { name: "Dr Raj", department: "Cardiology", availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"] },
    { name: "Dr Arun", department: "Pulmonology", availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM"] },
    { name: "Dr Priya", department: "General Medicine", availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM", "11:00 AM", "11:30 AM", "02:00 PM"] },
    { name: "Dr Kumar", department: "Neurology", availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"] },
    { name: "Dr Meena", department: "Orthopedics", availableSlots: ["09:00 AM", "09:30 AM", "10:00 AM", "10:30 AM"] }
];

function createTables() {
    db.exec(`
        CREATE TABLE IF NOT EXISTS patients (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL,
            age INTEGER,
            gender TEXT,
            phone TEXT,
            history TEXT,
            symptoms TEXT,
            created_at TEXT DEFAULT (datetime('now'))
        );

        CREATE TABLE IF NOT EXISTS doctors (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT NOT NULL UNIQUE,
            department TEXT NOT NULL,
            available_slots TEXT NOT NULL DEFAULT '[]',
            current_patients INTEGER NOT NULL DEFAULT 0
        );

        CREATE TABLE IF NOT EXISTS appointments (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            token TEXT NOT NULL UNIQUE,
            patient_id INTEGER REFERENCES patients(id),
            patient_name TEXT NOT NULL,
            doctor_id INTEGER REFERENCES doctors(id),
            doctor_name TEXT,
            department TEXT,
            appointment_time TEXT,
            disease TEXT,
            reason TEXT,
            priority TEXT,
            critical_score INTEGER,
            queue_number INTEGER,
            estimated_waiting_time TEXT,
            booked_at TEXT DEFAULT (datetime('now'))
        );
    `);
}

function seedDoctorsIfEmpty() {
    const { count } = db.prepare("SELECT COUNT(*) AS count FROM doctors").get();
    if (count > 0) return;

    const insert = db.prepare(
        "INSERT INTO doctors (name, department, available_slots, current_patients) VALUES (?, ?, ?, 0)"
    );

    const insertMany = db.transaction((doctors) => {
        for (const doc of doctors) {
            insert.run(doc.name, doc.department, JSON.stringify(doc.availableSlots));
        }
    });
    insertMany(DEFAULT_DOCTORS);

    console.log(`Seeded ${DEFAULT_DOCTORS.length} default doctors.`);
}

function connectDB() {
    createTables();
    seedDoctorsIfEmpty();
    console.log(`SQLite Database Connected Successfully -> ${DB_PATH}`);
}

module.exports = {
    db,
    connectDB
};
