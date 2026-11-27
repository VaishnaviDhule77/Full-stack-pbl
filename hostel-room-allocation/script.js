
const API = "http://localhost:5000/api";

const roomForm = document.getElementById("roomForm");
const studentForm = document.getElementById("studentForm");

const roomList = document.getElementById("roomList");
const studentList = document.getElementById("studentList");
const studentRoom = document.getElementById("studentRoom");

const message = document.getElementById("message");

let rooms = [];

// Show messages
function showMessage(text, color) {
    message.textContent = text;
    message.style.color = color;
}

// Escape text before displaying it as HTML
function escapeHTML(value) {
    return String(value).replace(/[&<>"']/g, character => {
        const entities = {
            "&": "&amp;",
            "<": "&lt;",
            ">": "&gt;",
            '"': "&quot;",
            "'": "&#39;"
        };

        return entities[character];
    });
}

// Add a new room
roomForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        roomNumber: document.getElementById("roomNumber").value.trim(),
        capacity: Number(document.getElementById("capacity").value),
        roomType: document.getElementById("roomType").value
    };

    try {
        const response = await fetch(`${API}/rooms`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        showMessage(result.message, "green");
        roomForm.reset();

        loadRooms();

    } catch (error) {
        showMessage(error.message, "red");
    }
});

// Load rooms
async function loadRooms() {
    try {
        const response = await fetch(`${API}/rooms`);

        if (!response.ok) {
            throw new Error("Unable to load rooms");
        }

        rooms = await response.json();

        displayRooms();
        updateRoomDropdown();
        updateDashboard();

    } catch (error) {
        roomList.innerHTML =
            '<p class="empty">Unable to load rooms. Check backend server.</p>';
    }
}

// Display room cards
function displayRooms() {
    roomList.innerHTML = "";

    if (rooms.length === 0) {
        roomList.innerHTML =
            '<p class="empty">No rooms added yet.</p>';
        return;
    }

    rooms.forEach(room => {
        const card = document.createElement("div");
        card.className = "room-card";

        let statusClass = "partial";

        if (room.status === "Vacant") {
            statusClass = "vacant";
        } else if (room.status === "Full") {
            statusClass = "full";
        }

        card.innerHTML = `
            <h3>Room ${escapeHTML(room.roomNumber)}</h3>

            <p>Room Type: ${escapeHTML(room.roomType)}</p>

            <p>Capacity: ${room.capacity}</p>

            <p>Occupied Beds: ${room.occupied}</p>

            <p>Vacant Beds: ${room.vacant}</p>

            <span class="status ${statusClass}">
                ${escapeHTML(room.status)}
            </span>
        `;

        roomList.appendChild(card);
    });
}

// Show available rooms in dropdown
function updateRoomDropdown() {
    studentRoom.innerHTML =
        '<option value="">Select Available Room</option>';

    rooms.forEach(room => {
        if (room.vacant > 0) {
            const option = document.createElement("option");

            option.value = room._id;
            option.textContent =
                `${room.roomNumber} (${room.vacant} beds available)`;

            studentRoom.appendChild(option);
        }
    });
}

// Update dashboard
function updateDashboard() {
    let occupied = 0;
    let vacant = 0;

    rooms.forEach(room => {
        occupied += room.occupied;
        vacant += room.vacant;
    });

    document.getElementById("totalRooms").textContent = rooms.length;
    document.getElementById("occupiedBeds").textContent = occupied;
    document.getElementById("vacantBeds").textContent = vacant;
}

// Allocate student
studentForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById("studentName").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        roomId: studentRoom.value
    };

    try {
        const response = await fetch(`${API}/allocate`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        showMessage(result.message, "green");
        studentForm.reset();

        await loadRooms();
        await loadStudents();

    } catch (error) {
        showMessage(error.message, "red");
    }
});

// Load allocated students
async function loadStudents() {
    try {
        const response = await fetch(`${API}/students`);

        if (!response.ok) {
            throw new Error("Unable to load students");
        }

        const students = await response.json();

        studentList.innerHTML = "";

        if (students.length === 0) {
            studentList.innerHTML = `
                <tr>
                    <td colspan="4">No students allocated yet.</td>
                </tr>
            `;
            return;
        }

        students.forEach(student => {
            const row = document.createElement("tr");

            row.innerHTML = `
                <td>${escapeHTML(student.name)}</td>
                <td>${escapeHTML(student.email)}</td>
                <td>${escapeHTML(student.roomId.roomNumber)}</td>
                <td>${escapeHTML(student.roomId.roomType)}</td>
            `;

            studentList.appendChild(row);
        });

    } catch (error) {
        studentList.innerHTML = `
            <tr>
                <td colspan="4">Unable to load students.</td>
            </tr>
        `;
    }
}

// Load data when page opens
loadRooms();
loadStudents();
