
const API = "http://localhost:5000/api/registrations";

const registrationTable =
    document.getElementById("registrationTable");

const totalCount =
    document.getElementById("totalCount");

// Escape text before displaying it in the table
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

// Fetch all registrations
async function loadRegistrations() {
    try {
        const response = await fetch(API);

        if (!response.ok) {
            throw new Error("Could not fetch registrations");
        }

        const registrations = await response.json();

        // Display total registrations
        totalCount.textContent = registrations.length;

        registrationTable.innerHTML = "";

        if (registrations.length === 0) {
            registrationTable.innerHTML = `
                <tr>
                    <td colspan="6">No registrations found.</td>
                </tr>
            `;
            return;
        }

        // Display participants in table
        registrations.forEach((item, index) => {
            const row = document.createElement("tr");

            const date = new Date(item.registeredAt)
                .toLocaleDateString("en-IN");

            row.innerHTML = `
                <td>${index + 1}</td>
                <td>${escapeHTML(item.name)}</td>
                <td>${escapeHTML(item.email)}</td>
                <td>${escapeHTML(item.mobile)}</td>
                <td>${escapeHTML(item.event)}</td>
                <td>${date}</td>
            `;

            registrationTable.appendChild(row);
        });

    } catch (error) {
        registrationTable.innerHTML = `
            <tr>
                <td colspan="6">
                    Unable to load registrations. Check the backend server.
                </td>
            </tr>
        `;
    }
}

// Load registrations when admin page opens
loadRegistrations();
