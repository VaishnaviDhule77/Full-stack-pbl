const API = "http://localhost:5000/api";


// Switch between sections
function showSection(sectionId) {
    document.getElementById("complaintSection").classList.add("hidden");
    document.getElementById("adminSection").classList.add("hidden");

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "adminSection") {
        loadComplaints();
    }
}


// Submit complaint
document.getElementById("complaintForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const complaint = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        category: document.getElementById("category").value,
        priority: document.getElementById("priority").value,
        description: document.getElementById("description").value.trim()
    };

    try {
        const response = await fetch(`${API}/complaints`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(complaint)
        });

        const data = await response.json();

        document.getElementById("formMessage").textContent = data.message;

        if (response.ok) {
            this.reset();
        }

    } catch (error) {
        document.getElementById("formMessage").textContent =
            "Unable to submit complaint. Check the server.";
    }
});


// Load complaints and apply status filter
async function loadComplaints() {
    const filter = document.getElementById("statusFilter").value;

    try {
        // Get all complaints for dashboard statistics
        const allResponse = await fetch(`${API}/complaints`);
        const allComplaints = await allResponse.json();

        updateDashboard(allComplaints);

        // Get filtered complaints
        const response = await fetch(
            `${API}/complaints?status=${encodeURIComponent(filter)}`
        );

        const complaints = await response.json();

        displayComplaints(complaints);

    } catch (error) {
        document.getElementById("complaintList").textContent =
            "Unable to load complaints. Check the backend server.";
    }
}


// Update dashboard statistics
function updateDashboard(complaints) {
    document.getElementById("totalCount").textContent =
        complaints.length;

    document.getElementById("openCount").textContent =
        complaints.filter(c => c.status === "Open").length;

    document.getElementById("progressCount").textContent =
        complaints.filter(c => c.status === "In Progress").length;

    document.getElementById("resolvedCount").textContent =
        complaints.filter(c => c.status === "Resolved").length;
}


// Display complaint cards
function displayComplaints(complaints) {
    const complaintList = document.getElementById("complaintList");

    complaintList.innerHTML = "";

    if (complaints.length === 0) {
        complaintList.textContent = "No complaints found.";
        return;
    }

    complaints.forEach(complaint => {
        const card = document.createElement("div");
        card.className = "complaint-card";

        const title = document.createElement("h3");
        title.textContent = complaint.category + " Complaint";

        const name = document.createElement("p");
        name.textContent = "Name: " + complaint.name;

        const email = document.createElement("p");
        email.textContent = "Email: " + complaint.email;

        const priority = document.createElement("p");
        priority.className = "priority " + complaint.priority.toLowerCase();
        priority.textContent = "Priority: " + complaint.priority;

        const description = document.createElement("p");
        description.textContent = "Description: " + complaint.description;

        const status = document.createElement("p");
        status.className = "status";
        status.textContent = "Current Status: " + complaint.status;

        const date = document.createElement("p");
        date.textContent = "Submitted: " +
            new Date(complaint.createdAt).toLocaleString();

        // Status dropdown
        const select = document.createElement("select");

        ["Open", "In Progress", "Resolved"].forEach(value => {
            const option = document.createElement("option");
            option.value = value;
            option.textContent = value;

            if (value === complaint.status) {
                option.selected = true;
            }

            select.appendChild(option);
        });

        // Update status when selection changes
        select.addEventListener("change", () => {
            updateStatus(complaint._id, select.value);
        });

        card.append(
            title,
            name,
            email,
            priority,
            description,
            status,
            date
        );

        const label = document.createElement("p");
        label.textContent = "Update Status:";

        card.append(label, select);

        complaintList.appendChild(card);
    });
}


// Update complaint status
async function updateStatus(id, status) {
    try {
        const response = await fetch(`${API}/complaints/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        if (response.ok) {
            alert(data.message);
            loadComplaints();
        } else {
            alert(data.message);
        }

    } catch (error) {
        alert("Unable to update complaint status.");
    }
}