// =======================================================
// Patient model
// Every person who submits the "Patient Registration" form
// gets stored here in the patients table.
// =======================================================

const { db } = require("../database");

function createPatient({ name, age, gender, phone, history, symptoms }) {
    const stmt = db.prepare(`
        INSERT INTO patients (name, age, gender, phone, history, symptoms)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const info = stmt.run(name, age, gender, phone, history, symptoms);
    return getPatientById(info.lastInsertRowid);
}

function getPatientById(id) {
    return db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
}

function getAllPatients() {
    return db.prepare("SELECT * FROM patients ORDER BY created_at DESC").all();
}

function getPatientCount() {
    const { count } = db.prepare("SELECT COUNT(*) AS count FROM patients").get();
    return count;
}

module.exports = {
    createPatient,
    getPatientById,
    getAllPatients,
    getPatientCount
};
