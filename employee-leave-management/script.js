
// API URL
let url = "http://localhost:5000/api";

// SET MINIMUM DATE
let today = new Date();
let minDate = today.getFullYear() + "-" +
    String(today.getMonth() + 1).padStart(2, "0") + "-" +
    String(today.getDate()).padStart(2, "0");

document.getElementById("startDate").min = minDate;
document.getElementById("endDate").min = minDate;

// UPDATE END DATE MINIMUM
document.getElementById("startDate").addEventListener("change", function() {
    document.getElementById("endDate").min = this.value;

    if (document.getElementById("endDate").value < this.value) {
        document.getElementById("endDate").value = "";
    }
});

// SHOW MESSAGE
function showMessage(message, type) {
    let msg = document.getElementById("message");

    msg.innerText = message;
    msg.className = type;
}

// APPLY FOR LEAVE
document.getElementById("leaveForm").addEventListener("submit", function(e) {
    e.preventDefault();

    let employeeName = document.getElementById("employeeName").value.trim();
    let leaveType = document.getElementById("leaveType").value;
    let startDate = document.getElementById("startDate").value;
    let endDate = document.getElementById("endDate").value;
    let reason = document.getElementById("reason").value.trim();

    // DATE VALIDATION
    if (startDate < minDate || endDate < startDate) {
        showMessage("Please select valid dates!", "error");
        return;
    }

    // SEND REQUEST
    fetch(url + "/leaves", {
        method: "POST",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({
            employeeName,
            leaveType,
            startDate,
            endDate,
            reason
        })
    })
    .then(res => res.json())
    .then(data => {
        if (!data.message) {
            throw new Error("Unable to submit request");
        }

        showMessage(data.message, "success");

        document.getElementById("leaveForm").reset();

        // RESET MINIMUM DATES
        document.getElementById("startDate").min = minDate;
        document.getElementById("endDate").min = minDate;

        loadLeaves();
    })
    .catch(() => showMessage("Unable to submit leave!", "error"));
});

// DISPLAY LEAVE REQUESTS
function loadLeaves() {
    fetch(url + "/leaves")
    .then(res => res.json())
    .then(leaves => {
        let output = "";

        leaves.forEach(leave => {
            output += `
                <div class="leave-card">

                    <h3>${leave.employeeName}</h3>

                    <p>Leave Type: ${leave.leaveType}</p>

                    <p>Start Date: ${leave.startDate}</p>

                    <p>End Date: ${leave.endDate}</p>

                    <p>Reason: ${leave.reason}</p>

                    <p>Status:
                        <span class="${leave.status}">
                            ${leave.status}
                        </span>
                    </p>

                    ${leave.status === "Pending" ? `
                        <button onclick="updateStatus('${leave._id}', 'Approved')">
                            Approve
                        </button>

                        <button onclick="updateStatus('${leave._id}', 'Rejected')">
                            Reject
                        </button>
                    ` : ""}

                </div>
            `;
        });

        document.getElementById("leaveList").innerHTML =
            output || "<p>No leave requests found.</p>";

        // UPDATE DASHBOARD
        document.getElementById("total").innerText = leaves.length;

        document.getElementById("pending").innerText =
            leaves.filter(l => l.status === "Pending").length;

        document.getElementById("approved").innerText =
            leaves.filter(l => l.status === "Approved").length;

        document.getElementById("rejected").innerText =
            leaves.filter(l => l.status === "Rejected").length;
    })
    .catch(() => showMessage("Unable to load leave requests!", "error"));
}

// APPROVE OR REJECT LEAVE
function updateStatus(id, status) {
    fetch(url + "/leaves/" + id, {
        method: "PATCH",
        headers: {
            "Content-Type": "application/json"
        },
        body: JSON.stringify({ status: status })
    })
    .then(res => res.json())
    .then(data => {
        showMessage(data.message, "success");
        loadLeaves();
    })
    .catch(() => showMessage("Unable to update status!", "error"));
}

// LOAD REQUESTS WHEN PAGE OPENS
loadLeaves();
