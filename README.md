# Agentic AI Hospital — Appointment Scheduling System

## 🚀 Live Demo

👉 **[Go Live](https://agentic-ai-hospital.onrender.com/)**

## What was wrong with the original project

1. `server.js` required `./routes/aiRoutes`, but that file (and the whole `routes/` folder)
   did not exist anywhere in the project, so the server crashed immediately on start.
   There was also no controller logic for `/api/analyze` or `/api/dashboard` anywhere.
2. `Appoinment.js`, `Patient.js`, and `server` were all empty (0 byte) files.
3. The project depended on both `mongoose` (MongoDB) and `lowdb` (a JSON file) at the same
   time, but only `lowdb` was actually wired up — `mongoose` was unused dead weight.
4. `patients` were never actually stored — patient details were just duplicated inline
   inside each appointment record.
5. `app.js` had a `refreshDashboard()` function that called itself (infinite recursion) and
   was never even invoked, so the Priority Queue / Emergency Queue sections never updated.
6. The "Symptom Duration" dropdown existed in the HTML but was never included in the data
   sent to the server.

## What this version does

- **One single database**: SQLite, stored in a single file `hospital.db`, created
  automatically the first time you start the server. It uses Node's **built-in**
  `node:sqlite` module — no `npm install` needed for the database itself, no native
  compilation, nothing to configure.
- Three tables in that one database:
  - `patients` — every person who submits the registration form
  - `doctors` — the doctor roster and slot availability
  - `appointments` — every booking, linked to a patient and a doctor
- A working `/api/analyze` and `/api/dashboard` implemented in `controllers/aiController.js`,
  routed through `routes/aiRoutes.js` (both previously missing).
- A rule-based triage engine (`controllers/triageEngine.js`) that classifies symptoms into
  a department, disease guess, critical score, and priority (Critical / High / Medium / Low)
  — no external API key required. `testLLM.js` (Gemini) is still there if you want to
  upgrade the triage engine to a real LLM call later.
- Bug fixes in `app.js` (recursion bug, missing duration field).

## Project structure

```
Ai-schedule--main/
├── server.js                     # entry point
├── database.js                   # the ONE database connection + schema
├── models/
│   ├── Patient.js
│   ├── Doctor.js
│   └── Appointment.js
├── controllers/
│   ├── aiController.js           # /api/analyze and /api/dashboard logic
│   └── triageEngine.js           # rule-based symptom analysis
├── routes/
│   └── aiRoutes.js
├── index.html / app.js / style.css   # frontend
├── testLLM.js                     # optional Gemini test script
├── migrate-dbjson-to-sqlite.js    # one-time import of your old db.json data
├── db.json.OLD_BACKUP             # your original data, kept for the migration script
└── package.json
```

## How to run it

```bash
npm install
npm start
```

Then open **http://localhost:5000** in your browser (the server now also serves the
frontend directly, so you don't need a separate static server).

If you had real data in your old `db.json` (3 appointments were in there) and want to
bring it into the new database, run this once after `npm install`:

```bash
npm run migrate
```

## Notes

- `hospital.db` is created automatically on first run and is in `.gitignore` — don't
  commit it.
- `node:sqlite` is still marked "experimental" by Node.js (you'll see a harmless warning
  in the console) but is fully functional on Node 22+.
- If you ever want to move to MongoDB or Postgres later, only `database.js` and the three
  files in `models/` need to change — the routes and controller stay the same.
