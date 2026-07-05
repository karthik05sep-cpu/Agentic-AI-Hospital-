const { db } = require("../database");

function rowToPatient(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        age: row.age,
        gender: row.gender,
        phone: row.phone,
        history: row.history ? JSON.parse(row.history) : null,
        symptoms: row.symptoms ? JSON.parse(row.symptoms) : null,
        createdAt: row.created_at
    };
}

function createPatient({ name, age, gender, phone, history, symptoms }) {
    const insert = db.prepare(`
        INSERT INTO patients (name, age, gender, phone, history, symptoms)
        VALUES (?, ?, ?, ?, ?, ?)
    `);
    const result = insert.run(
        name,
        age,
        gender,
        phone || null,
        JSON.stringify(history || []),
        JSON.stringify(symptoms || [])
    );
    return getPatientById(result.lastInsertRowid);
}

function getPatientById(id) {
    const row = db.prepare("SELECT * FROM patients WHERE id = ?").get(id);
    return rowToPatient(row);
}

function getAllPatients() {
    const rows = db.prepare("SELECT * FROM patients ORDER BY id ASC").all();
    return rows.map(rowToPatient);
}

module.exports = {
    createPatient,
    getPatientById,
    getAllPatients
};
