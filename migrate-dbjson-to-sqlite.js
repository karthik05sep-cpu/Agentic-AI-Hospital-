// =======================================================
// One-time migration: old db.json (lowdb) -> new SQLite DB
//
// Run once with: npm run migrate
// Safe to run multiple times — it skips appointments whose
// token already exists in the SQLite database.
// =======================================================

const fs = require("fs");
const path = require("path");
const { connectDB, db } = require("./database");
const Doctor = require("./models/Doctor");

const OLD_DB_PATH = path.join(__dirname, "db.json.OLD_BACKUP");

function run() {
    connectDB();

    if (!fs.existsSync(OLD_DB_PATH)) {
        console.log("No db.json.OLD_BACKUP found — nothing to migrate.");
        return;
    }

    const old = JSON.parse(fs.readFileSync(OLD_DB_PATH, "utf-8"));
    const oldAppointments = old.appointments || [];

    let migrated = 0;
    let skipped = 0;

    for (const appt of oldAppointments) {
        const exists = db.prepare("SELECT id FROM appointments WHERE token = ?").get(appt.token);
        if (exists) {
            skipped++;
            continue;
        }

        // Create a matching patient record
        const patientInfo = db.prepare(`
            INSERT INTO patients (name, age, gender, phone, history, symptoms)
            VALUES (?, ?, ?, ?, ?, ?)
        `).run(appt.patientName, appt.age, appt.gender, "", "", "");

        // Find the doctor by name (already seeded)
        const doctor = db.prepare("SELECT * FROM doctors WHERE name = ?").get(appt.doctor);

        db.prepare(`
            INSERT INTO appointments (
                token, patient_id, patient_name, doctor_id, doctor_name,
                department, appointment_time, disease, reason, priority,
                critical_score, queue_number, estimated_waiting_time, booked_at
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `).run(
            appt.token,
            patientInfo.lastInsertRowid,
            appt.patientName,
            doctor ? doctor.id : null,
            appt.doctor,
            appt.department,
            appt.appointmentTime,
            "Migrated Record",
            "Migrated from previous JSON database.",
            appt.priority,
            appt.criticalScore,
            appt.queueNumber,
            appt.estimatedWaitingTime,
            appt.bookedAt
        );

        migrated++;
    }

    console.log(`Migration complete. Migrated: ${migrated}, Skipped (already present): ${skipped}`);
}

run();
