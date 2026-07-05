// =======================================================
// Triage Engine
//
// This is the "AI analysis" logic that was missing from the
// original project (server.js pointed at it but it never
// existed in the uploaded files). It is a deterministic,
// keyword + risk-factor based triage engine, so it works
// immediately with no external API key required.
//
// If you later want to swap this for a real LLM call (e.g. the
// Gemini setup already in testLLM.js), replace analyzeSymptoms()
// with a call to the model and keep the same return shape.
// =======================================================

const RULES = [
    {
        department: "Cardiology",
        disease: "Suspected Cardiac Distress",
        baseScore: 70,
        keywords: ["chest pain", "chest tightness", "palpitation", "heart", "chest discomfort"]
    },
    {
        department: "Pulmonology",
        disease: "Suspected Respiratory Distress",
        baseScore: 60,
        keywords: ["breath", "breathing", "shortness of breath", "wheeze", "asthma"]
    },
    {
        department: "Neurology",
        disease: "Suspected Neurological Symptoms",
        baseScore: 50,
        keywords: ["headache", "migraine", "dizziness", "seizure", "numbness", "vision", "fainting"]
    },
    {
        department: "Orthopedics",
        disease: "Suspected Musculoskeletal Injury",
        baseScore: 40,
        keywords: ["fracture", "joint pain", "back pain", "swelling", "sprain", "bone"]
    },
    {
        department: "General Medicine",
        disease: "Suspected Viral / Infectious Illness",
        baseScore: 30,
        keywords: ["fever", "vomiting", "cold", "cough", "stomach", "diarrhea", "body pain", "nausea"]
    }
];

const DURATION_WEIGHT = {
    "Less than 1 Hour": 20,
    "1-6 Hours": 15,
    "1 Day": 10,
    "More than 2 Days": 5
};

const HISTORY_WEIGHT = {
    "Diabetes": 10,
    "Hypertension": 10,
    "Heart Disease": 15,
    "Asthma": 10,
    "None": 0
};

function pickRule(symptomsText) {
    const text = symptomsText.toLowerCase();

    let best = null;
    let bestMatches = 0;

    for (const rule of RULES) {
        const matches = rule.keywords.filter(k => text.includes(k)).length;
        if (matches > bestMatches) {
            bestMatches = matches;
            best = rule;
        }
    }

    if (!best) {
        return {
            department: "General Medicine",
            disease: "Unspecified Illness",
            baseScore: 25
        };
    }

    return best;
}

function scoreToPriority(score) {
    if (score >= 75) return "Critical";
    if (score >= 55) return "High";
    if (score >= 35) return "Medium";
    return "Low";
}

function analyzeSymptoms({ age, symptoms, duration, history }) {
    const rule = pickRule(symptoms || "");

    let score = rule.baseScore;

    // Age risk factor
    const numericAge = Number(age);
    if (!Number.isNaN(numericAge)) {
        if (numericAge >= 60) score += 10;
        else if (numericAge <= 5) score += 10;
    }

    // Duration risk factor (sudden/acute onset is weighted higher)
    if (duration && DURATION_WEIGHT.hasOwnProperty(duration)) {
        score += DURATION_WEIGHT[duration];
    }

    // Pre-existing condition risk factor
    if (history && HISTORY_WEIGHT.hasOwnProperty(history)) {
        score += HISTORY_WEIGHT[history];
    }

    // Cap the score at 100
    score = Math.min(score, 100);

    const priority = scoreToPriority(score);

    const reason =
        `Based on the reported symptoms, the patient shows signs consistent with ${rule.disease.toLowerCase()}. ` +
        `Age (${age || "unknown"}), symptom duration (${duration || "not specified"}), and medical history ` +
        `(${history || "none reported"}) were factored in, resulting in a critical score of ${score} and a ` +
        `${priority} priority classification. Recommended department: ${rule.department}.`;

    return {
        disease: rule.disease,
        department: rule.department,
        criticalScore: score,
        priority,
        reason
    };
}

module.exports = {
    analyzeSymptoms
};
