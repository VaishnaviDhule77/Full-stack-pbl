const url = "http://localhost:5000/api";

// Set minimum appointment date to today
let dateInput = document.getElementById("date");

let now = new Date();
let today = now.getFullYear() + "-" +
    String(now.getMonth() + 1).padStart(2, "0") + "-" +
    String(now.getDate()).padStart(2, "0");

dateInput.min = today;

// BOOK APPOINTMENT
document.getElementById("appointmentForm").addEventListener("submit",
    async function(event) {

    event.preventDefault();

    let patientName = document.getElementById("patientName").value.trim();
    let doctorName = document.getElementById("doctorName").value;
    let date = dateInput.value;
    let timeSlot = document.getElementById("timeSlot").value;
    let message = document.getElementById("message");

    if (date < today) {
        message.style.color = "red";
        message.innerText = "Please select a valid date.";
        return;
    }

    let response = await fetch(url + "/appointments", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            patientName,
            doctorName,
            date,
            timeSlot
        })
    });

    let result = await response.json();

    message.style.color = response.ok ? "green" : "red";
    message.innerText = result.message;

    if (response.ok) {
        document.getElementById("appointmentForm").reset();
        dateInput.min = today;
        loadAppointments();
    }
});

// LOAD UPCOMING APPOINTMENTS
async function loadAppointments() {

    let response = await fetch(url + "/appointments");
    let appointments = await response.json();

    let list = document.getElementById("appointmentList");

    list.innerHTML = "";

    if (appointments.length === 0) {
        list.innerHTML = '<p class="empty">No upcoming appointments.</p>';
        return;
    }

    appointments.forEach(function(appointment) {

        let card = document.createElement("div");
        card.className = "appointment-card";

        let heading = document.createElement("h3");
        heading.innerText = appointment.patientName;

        let doctor = document.createElement("p");
        doctor.innerText = "Doctor: " + appointment.doctorName;

        let date = document.createElement("p");
        date.innerText = "Date: " + appointment.date;

        let time = document.createElement("p");
        time.innerText = "Time: " + appointment.timeSlot;

        card.append(heading, doctor, date, time);
        list.appendChild(card);
    });
}

// LOAD APPOINTMENTS WHEN PAGE OPENS
loadAppointments();