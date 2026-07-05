// =======================================================
// AI Controller
// Implements the logic behind POST /api/analyze and
// GET /api/dashboard. This was completely missing from the
// original uploaded project (server.js required it, but the
// file/folder never existed).
// =======================================================

const { analyzeSymptoms } = require("./triageEngine");
const Patient = require("../models/Patient");
const Doctor = require("../models/Doctor");
const Appointment = require("../models/Appointment");

function generateToken() {
    return "A" + Date.now();
}

async function analyzePatient(req, res) {
    try {
        const { name, age, gender, phone, history, symptoms, duration } = req.body;

        if (!name || !age || !gender || !symptoms) {
            return res.status(400).json({
                success: false,
                message: "Name, age, gender and symptoms are required."
            });
        }

        // 1. Run AI triage on the symptoms
        const report = analyzeSymptoms({ age, symptoms, duration, history });

        // 2. Store the patient in the single database
        const patient = Patient.createPatient({
            name,
            age,
            gender,
            phone,
            history,
            symptoms
        });

        // 3. Find the next available doctor + slot in the recommended department
        let booking = Doctor.bookNextAvailableSlot(report.department);

        // Fallback to General Medicine if nobody is free in the recommended department
        if (!booking && report.department !== "General Medicine") {
            booking = Doctor.bookNextAvailableSlot("General Medicine");
        }

        if (!booking) {
            return res.status(503).json({
                success: false,
                message: "No doctors currently available. Please try again shortly."
            });
        }

        const { doctor, slot } = booking;
        const queueNumber = doctor.currentPatients; // already incremented by bookNextAvailableSlot
        const estimatedWaitingTime = `${queueNumber * 15} Minutes`;
        const token = generateToken();

        // 4. Store the appointment in the single database
        const appointment = Appointment.createAppointment({
            token,
            patientId: patient.id,
            patientName: patient.name,
            doctorId: doctor.id,
            doctorName: doctor.name,
            department: report.department,
            appointmentTime: slot,
            disease: report.disease,
            reason: report.reason,
            priority: report.priority,
            criticalScore: report.criticalScore,
            queueNumber,
            estimatedWaitingTime
        });

        return res.json({
            success: true,
            report,
            schedule: {
                appointment: {
                    token: appointment.token,
                    patientName: appointment.patient_name,
                    doctor: appointment.doctor_name,
                    department: appointment.department,
                    appointmentTime: appointment.appointment_time,
                    priority: appointment.priority,
                    criticalScore: appointment.critical_score,
                    queueNumber: appointment.queue_number,
                    estimatedWaitingTime: appointment.estimated_waiting_time
                }
            }
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while analyzing patient."
        });
    }
}

async function getDashboard(req, res) {
    try {
        const patients = Patient.getAllPatients();
        const appointmentsRaw = Appointment.getAllAppointments();
        const doctors = Doctor.getAllDoctors();
        const priorityStats = Appointment.getPriorityStats();
        const todaysAppointments = Appointment.getTodaysAppointments();

        const appointments = appointmentsRaw.map(a => ({
            token: a.token,
            patientName: a.patient_name,
            doctor: a.doctor_name,
            department: a.department,
            appointmentTime: a.appointment_time,
            priority: a.priority,
            criticalScore: a.critical_score,
            estimatedWaitingTime: a.estimated_waiting_time,
            bookedAt: a.booked_at
        }));

        return res.json({
            success: true,
            totalPatients: patients.length,
            appointmentsToday: todaysAppointments.length,
            criticalPatients: priorityStats.Critical,
            availableDoctors: doctors.filter(d => d.availableSlots.length > 0).length,
            appointments,
            doctors,
            priorityStats
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            success: false,
            message: "Server error while loading dashboard."
        });
    }
}

module.exports = {
    analyzePatient,
    getDashboard
};
