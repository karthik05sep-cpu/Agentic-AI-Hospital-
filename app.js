// =======================================================
// AGENTIC AI HOSPITAL
// app.js
// PART 1
// =======================================================

const API_URL = "http://localhost:5000/api";

let dashboardData = {};
let currentAppointment = null;

// =============================
// DOM ELEMENTS
// =============================

const patientName = document.getElementById("patientName");
const age = document.getElementById("age");
const gender = document.getElementById("gender");
const phone = document.getElementById("phone");
const history = document.getElementById("history");
const duration = document.getElementById("duration");
const symptoms = document.getElementById("symptoms");

const analyzeButton = document.getElementById("analyzeButton");
const clearButton = document.getElementById("clearButton");
const scheduleButton = document.getElementById("scheduleButton");
const confirmButton = document.getElementById("confirmButton");

// Dashboard

const totalPatients = document.getElementById("totalPatients");
const emergencyCount = document.getElementById("emergencyCount");
const appointmentCount = document.getElementById("appointmentCount");
const doctorCount = document.getElementById("doctorCount");

// AI Panel

const detectedDisease = document.getElementById("detectedDisease");
const criticalScore = document.getElementById("criticalScore");
const priorityLevel = document.getElementById("priorityLevel");
const department = document.getElementById("department");
const aiRecommendation = document.getElementById("aiRecommendation");

// Scheduler

const doctorSelect = document.getElementById("doctorSelect");
const appointmentDate = document.getElementById("appointmentDate");
const appointmentTime = document.getElementById("appointmentTime");
const waitingTime = document.getElementById("waitingTime");

// Tables

const appointmentBody = document.getElementById("appointmentBody");
const doctorTable = document.getElementById("doctorTable");


// ======================================================
// CHARTS
// ======================================================

const priorityChart = new Chart(

document.getElementById("priorityChart"),

{

type:"doughnut",

data:{

labels:["Critical","High","Medium","Low"],

datasets:[{

data:[0,0,0,0]

}]

}

}

);

const doctorChart = new Chart(

document.getElementById("doctorChart"),

{

type:"bar",

data:{

labels:[],

datasets:[{

label:"Patients",

data:[]

}]

}

}

);


// ======================================================
// ANALYZE PATIENT
// ======================================================

async function analyzePatient(){

try{

const patient={

name:patientName.value,

age:Number(age.value),

gender:gender.value,

phone:phone.value,

history:history.value,

duration:duration.value,

symptoms:symptoms.value

};

const response=await fetch(

`${API_URL}/analyze`,

{

method:"POST",

headers:{

"Content-Type":"application/json"

},

body:JSON.stringify(patient)

}

);

const data=await response.json();

if(!data.success){

alert(data.message);

return;

}

displayAIResult(data);

await loadDashboard();

}

catch(error){

console.log(error);

alert("Server Error");

}

}



// ======================================================
// DISPLAY AI RESULT
// ======================================================

function displayAIResult(data){

const report=data.report;

const appointment=data.schedule.appointment;

currentAppointment=appointment;

detectedDisease.innerHTML=report.disease;

criticalScore.innerHTML=report.criticalScore;

priorityLevel.innerHTML=report.priority;

department.innerHTML=report.department;

aiRecommendation.innerHTML=report.reason;

doctorSelect.innerHTML=

`<option>${appointment.doctor}</option>`;

appointmentDate.value=

new Date().toISOString().split("T")[0];

appointmentTime.innerHTML=

`<option>${appointment.appointmentTime}</option>`;

waitingTime.value=

appointment.estimatedWaitingTime;

}
// ======================================================
// LOAD DASHBOARD
// ======================================================

async function loadDashboard() {

    try {

        const response = await fetch(`${API_URL}/dashboard`);

        dashboardData = await response.json();

        if (!dashboardData.success) {

            console.log("Dashboard API Error");

            return;

        }

        updateDashboardCards();

        updateAppointmentTable();

        updateDoctorTable();

        updateCharts();

        updatePriorityStatistics();

        refreshDashboard();

    }

    catch (error) {

        console.log(error);

    }

}



// ======================================================
// DASHBOARD CARDS
// ======================================================

function updateDashboardCards() {

    totalPatients.innerHTML =
        dashboardData.totalPatients;

    appointmentCount.innerHTML =
        dashboardData.appointmentsToday;

    emergencyCount.innerHTML =
        dashboardData.criticalPatients;

    doctorCount.innerHTML =
        dashboardData.availableDoctors;

}



// ======================================================
// APPOINTMENT TABLE
// ======================================================

function updateAppointmentTable() {

    appointmentBody.innerHTML = "";

    dashboardData.appointments.forEach(app => {

        appointmentBody.innerHTML += `

<tr>

<td>${app.token}</td>

<td>${app.patientName}</td>

<td>${app.doctor}</td>

<td>${app.department}</td>

<td>${new Date(app.bookedAt).toLocaleDateString()}</td>

<td>${app.appointmentTime}</td>

<td>${app.priority}</td>

</tr>

`;

    });

}



// ======================================================
// DOCTOR TABLE
// ======================================================

function updateDoctorTable() {

    doctorTable.innerHTML = "";

    dashboardData.doctors.forEach(doctor => {

        doctorTable.innerHTML += `

<tr>

<td>${doctor.name}</td>

<td>${doctor.department}</td>

<td>${doctor.currentPatients}</td>

<td>${doctor.availableSlots.length}</td>

<td>

${doctor.availableSlots.length > 0

? "<span style='color:green'>Available</span>"

: "<span style='color:red'>Busy</span>"}

</td>

</tr>

`;

    });

}



// ======================================================
// PRIORITY STATISTICS
// ======================================================

function updatePriorityStatistics() {

    document.getElementById("criticalPatients").innerHTML =
        dashboardData.priorityStats.Critical;

    document.getElementById("highPatients").innerHTML =
        dashboardData.priorityStats.High;

    document.getElementById("mediumPatients").innerHTML =
        dashboardData.priorityStats.Medium;

    document.getElementById("lowPatients").innerHTML =
        dashboardData.priorityStats.Low;

}
// ======================================================
// UPDATE CHARTS
// ======================================================

function updateCharts() {

    // -----------------------------
    // Priority Chart
    // -----------------------------

    priorityChart.data.datasets[0].data = [

        dashboardData.priorityStats.Critical || 0,

        dashboardData.priorityStats.High || 0,

        dashboardData.priorityStats.Medium || 0,

        dashboardData.priorityStats.Low || 0

    ];

    priorityChart.update();

    // -----------------------------
    // Doctor Workload Chart
    // -----------------------------

    doctorChart.data.labels = [];

    doctorChart.data.datasets[0].data = [];

    dashboardData.doctors.forEach(doctor => {

        doctorChart.data.labels.push(doctor.name);

        doctorChart.data.datasets[0].data.push(

            doctor.currentPatients

        );

    });

    doctorChart.update();

}



// ======================================================
// PRIORITY QUEUE
// ======================================================

function updatePriorityQueue() {

    const queue = document.getElementById("priorityQueue");

    queue.innerHTML = "";

    const sortedPatients = [...dashboardData.appointments].sort(

        (a, b) => b.criticalScore - a.criticalScore

    );

    sortedPatients.forEach((patient, index) => {

        queue.innerHTML += `

<tr>

<td>${index + 1}</td>

<td>${patient.patientName}</td>

<td>${patient.criticalScore}</td>

<td>${patient.priority}</td>

<td>${patient.department}</td>

</tr>

`;

    });

}



// ======================================================
// EMERGENCY QUEUE
// ======================================================

function updateEmergencyQueue() {

    const emergencyDiv = document.getElementById("emergencyQueue");

    emergencyDiv.innerHTML = "";

    const emergencyPatients = dashboardData.appointments.filter(

        patient => patient.priority === "Critical"

    );

    if (emergencyPatients.length === 0) {

        emergencyDiv.innerHTML =

        "<p>No Emergency Patients</p>";

        return;

    }

    emergencyPatients.forEach(patient => {

        emergencyDiv.innerHTML += `

<div class="emergency-item">

<strong>${patient.patientName}</strong>

<br>

Department : ${patient.department}

<br>

Doctor : ${patient.doctor}

<br>

Critical Score : ${patient.criticalScore}

</div>

<hr>

`;

    });

}



// ======================================================
// ACTIVITY LOG
// ======================================================

function addActivity(message) {

    const log = document.getElementById("activityLog");

    const time = new Date().toLocaleTimeString();

    log.innerHTML =

    `<p>[${time}] ${message}</p>`

    + log.innerHTML;

}



// ======================================================
// REFRESH EVERYTHING
// ======================================================

function refreshDashboard() {

    updatePriorityQueue();

    updatePriorityStatistics();

    updateEmergencyQueue();

}
// ======================================================
// GENERATE APPOINTMENT
// ======================================================

function generateAppointment() {

    if (!currentAppointment) {

        alert("Please analyze the patient first.");

        return;

    }

    alert(

`Appointment Generated

Doctor : ${currentAppointment.doctor}

Department : ${currentAppointment.department}

Time : ${currentAppointment.appointmentTime}

Queue Number : ${currentAppointment.queueNumber}

Estimated Waiting Time : ${currentAppointment.estimatedWaitingTime}`

    );

    addActivity(

        `Appointment generated for ${currentAppointment.patientName}`

    );

}



// ======================================================
// CONFIRM APPOINTMENT
// ======================================================

function confirmAppointment() {

    if (!currentAppointment) {

        alert("Please analyze the patient first.");

        return;

    }

    alert(

`Appointment Confirmed Successfully

Token : ${currentAppointment.token}

Patient : ${currentAppointment.patientName}

Doctor : ${currentAppointment.doctor}

Department : ${currentAppointment.department}

Time : ${currentAppointment.appointmentTime}

Priority : ${currentAppointment.priority}`

    );

    addActivity(

        `Appointment confirmed for ${currentAppointment.patientName}`

    );

}



// ======================================================
// CLEAR FORM
// ======================================================

function clearPatientForm() {

    patientName.value = "";

    age.value = "";

    gender.selectedIndex = 0;

    phone.value = "";

    history.selectedIndex = 0;

    symptoms.value = "";

    detectedDisease.innerHTML = "Waiting for Analysis";

    criticalScore.innerHTML = "0";

    priorityLevel.innerHTML = "Low";

    department.innerHTML = "Not Assigned";

    aiRecommendation.innerHTML =

        "AI recommendation will appear here after symptom analysis.";

    doctorSelect.selectedIndex = 0;

    appointmentTime.selectedIndex = 0;

    waitingTime.value = "--";

    currentAppointment = null;

}



// ======================================================
// BUTTON EVENTS
// ======================================================

analyzeButton.addEventListener(

    "click",

    analyzePatient

);

scheduleButton.addEventListener(

    "click",

    generateAppointment

);

confirmButton.addEventListener(

    "click",

    confirmAppointment

);

clearButton.addEventListener(

    "click",

    clearPatientForm

);



// ======================================================
// INITIAL LOAD
// ======================================================

window.onload = async () => {

    await loadDashboard();

    addActivity(

        "Agentic AI Hospital System Started."

    );

};



// ======================================================
// AUTO REFRESH
// ======================================================

setInterval(async () => {

    await loadDashboard();

}, 5000);