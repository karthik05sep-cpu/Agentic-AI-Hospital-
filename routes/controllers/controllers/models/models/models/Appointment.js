// =======================================================
// Appointment model
// Every booked appointment, linked to a patient and a doctor.
// =======================================================

const { db } = require("../database");

function createAppointment({
    token,
    patientId,
    patientName,
    doctorId,
    doctorName,
    department,
    appointmentTime,
    disease,
    reason,
    priority,
    criticalScore,
    queueNumber,
    estimatedWaitingTime
}) {
    const stmt = db.prepare(`
        INSERT INTO appointments (
            token, patient_id, patient_name, doctor_id, doctor_name,
            department, appointment_time, disease, reason, priority,
            critical_score, queue_number, estimated_waiting_time
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
    `);

    const info = stmt.run(
        token, patientId, patientName, doctorId, doctorName,
        department, appointmentTime, disease, reason, priority,
        criticalScore, queueNumber, estimatedWaitingTime
    );

    return getAppointmentById(info.lastInsertRowid);
}

function getAppointmentById(id) {
    return db.prepare("SELECT * FROM appointments WHERE id = ?").get(id);
}

function getAllAppointments() {
    return db.prepare("SELECT * FROM appointments ORDER BY booked_at DESC").all();
}

function getAppointmentCount() {
    const { count } = db.prepare("SELECT COUNT(*) AS count FROM appointments").get();
    return count;
}

function getTodaysAppointments() {
    return db.prepare(`
        SELECT * FROM appointments
        WHERE date(booked_at) = date('now')
        ORDER BY booked_at DESC
    `).all();
}

function getPriorityStats() {
    const rows = db.prepare(`
        SELECT priority, COUNT(*) AS count
        FROM appointments
        GROUP BY priority
    `).all();

    const stats = { Critical: 0, High: 0, Medium: 0, Low: 0 };
    rows.forEach(row => {
        if (stats.hasOwnProperty(row.priority)) {
            stats[row.priority] = row.count;
        }
    });
    return stats;
}

module.exports = {
    createAppointment,
    getAppointmentById,
    getAllAppointments,
    getAppointmentCount,
    getTodaysAppointments,
    getPriorityStats
};
