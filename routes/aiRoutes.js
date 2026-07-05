// =======================================================
// AI Routes
// This file was required by server.js in the original
// project but did not exist anywhere in the uploaded code,
// which meant the server could not start.
// =======================================================

const express = require("express");
const router = express.Router();
const { analyzePatient, getDashboard } = require("../controllers/aiController");

// POST /api/analyze  -> analyze symptoms, register patient, book appointment
router.post("/analyze", analyzePatient);

// GET /api/dashboard  -> full dashboard snapshot (patients, doctors, appointments, stats)
router.get("/dashboard", getDashboard);

module.exports = router;
