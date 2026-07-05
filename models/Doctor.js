// =======================================================
// Doctor model
// Hospital doctor roster, department, and slot availability.
// =======================================================

const { db } = require("../database");

function rowToDoctor(row) {
    if (!row) return null;
    return {
        id: row.id,
        name: row.name,
        department: row.department,
        availableSlots: JSON.parse(row.available_slots),
        currentPatients: row.current_patients
    };
}

function getAllDoctors() {
    const rows = db.prepare("SELECT * FROM doctors ORDER BY id ASC").all();
    return rows.map(rowToDoctor);
}

function getDoctorsByDepartment(department) {
    const rows = db.prepare("SELECT * FROM doctors WHERE department = ? ORDER BY id ASC").all(department);
    return rows.map(rowToDoctor);
}

function getDoctorById(id) {
    const row = db.prepare("SELECT * FROM doctors WHERE id = ?").get(id);
    return rowToDoctor(row);
}

// Finds the doctor in the given department with the most free capacity
// and books the next available slot for them.
// Returns { doctor, slot } or null if nobody in that department has a free slot.
function bookNextAvailableSlot(department) {
    const doctors = getDoctorsByDepartment(department)
        .filter(d => d.availableSlots.length > 0)
        .sort((a, b) => a.currentPatients - b.currentPatients);

    if (doctors.length === 0) return null;

    const chosen = doctors[0];
    const slot = chosen.availableSlots[0];
    const remainingSlots = chosen.availableSlots.slice(1);

    db.prepare(`
        UPDATE doctors
        SET available_slots = ?, current_patients = current_patients + 1
        WHERE id = ?
    `).run(JSON.stringify(remainingSlots), chosen.id);

    return {
        doctor: getDoctorById(chosen.id),
        slot
    };
}

module.exports = {
    getAllDoctors,
    getDoctorsByDepartment,
    getDoctorById,
    bookNextAvailableSlot
};
