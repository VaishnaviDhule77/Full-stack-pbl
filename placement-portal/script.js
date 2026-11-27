const API = "http://localhost:5000/api";


// Switch between sections
function showSection(sectionId) {
    const sections = [
        "registerSection",
        "driveSection",
        "historySection",
        "adminSection"
    ];

    sections.forEach(id => {
        document.getElementById(id).classList.add("hidden");
    });

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "driveSection") {
        loadDrives();
    }

    if (sectionId === "adminSection") {
        loadAdminDrives();
    }
}


// Display student profile
function displayProfile(student) {
    const profile = document.getElementById("profileDetails");

    profile.innerHTML = "";

    const card = document.createElement("div");
    card.className = "profile-card";

    const details = [
        "Name: " + student.name,
        "Email: " + student.email,
        "Phone: " + student.phone,
        "Department: " + student.department,
        "CGPA: " + student.cgpa,
        "Skills: " + student.skills
    ];

    const heading = document.createElement("h3");
    heading.textContent = "Student Profile";

    card.appendChild(heading);

    details.forEach(detail => {
        const paragraph = document.createElement("p");
        paragraph.textContent = detail;
        card.appendChild(paragraph);
    });

    profile.appendChild(card);

    // Use registered email in other sections
    document.getElementById("driveEmail").value = student.email;
    document.getElementById("historyEmail").value = student.email;
}


// 1. Student registration
document.getElementById("studentForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const student = {
        name: document.getElementById("name").value.trim(),
        email: document.getElementById("email").value.trim(),
        phone: document.getElementById("phone").value.trim(),
        department: document.getElementById("department").value,
        cgpa: Number(document.getElementById("cgpa").value),
        skills: document.getElementById("skills").value.trim()
    };

    try {
        const response = await fetch(`${API}/students`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(student)
        });

        const data = await response.json();

        document.getElementById("registerMessage").textContent =
            data.message;

        if (response.ok) {
            displayProfile(data.student);
            this.reset();
        }

    } catch (error) {
        document.getElementById("registerMessage").textContent =
            "Unable to register. Check the backend server.";
    }
});


// 2. Load company drives
async function loadDrives() {
    try {
        const response = await fetch(`${API}/drives`);
        const drives = await response.json();

        const driveList = document.getElementById("driveList");

        driveList.innerHTML = "";

        if (drives.length === 0) {
            driveList.textContent = "No placement drives available.";
            return;
        }

        drives.forEach(drive => {
            const card = document.createElement("div");
            card.className = "drive-card";

            const heading = document.createElement("h3");
            heading.textContent = drive.company;

            const details = [
                "Job Role: " + drive.jobRole,
                "Location: " + drive.location,
                "Package: " + drive.package,
                "Eligibility: " + drive.eligibility,
                "Last Date: " + new Date(drive.lastDate).toLocaleDateString()
            ];

            card.appendChild(heading);

            details.forEach(detail => {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                card.appendChild(paragraph);
            });

            const button = document.createElement("button");
            button.textContent = "Apply Now";
            button.onclick = () => applyForDrive(drive._id);

            card.appendChild(button);
            driveList.appendChild(card);
        });

    } catch (error) {
        document.getElementById("driveList").textContent =
            "Unable to load placement drives.";
    }
}


// 3. Apply for company drive
async function applyForDrive(driveId) {
    const studentEmail = document.getElementById("driveEmail").value.trim();

    if (!studentEmail) {
        alert("Please register and enter your student email first.");
        return;
    }

    try {
        const response = await fetch(`${API}/applications`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentEmail,
                driveId
            })
        });

        const data = await response.json();

        alert(data.message);

    } catch (error) {
        alert("Unable to submit application.");
    }
}


// 4. View student application history
async function loadStudentApplications() {
    const email = document.getElementById("historyEmail").value.trim();

    const list = document.getElementById("studentApplications");

    if (!email) {
        alert("Please enter your registered email.");
        return;
    }

    try {
        const response = await fetch(
            `${API}/applications/student/${encodeURIComponent(email)}`
        );

        const applications = await response.json();

        list.innerHTML = "";

        if (!response.ok) {
            list.textContent = applications.message;
            return;
        }

        if (applications.length === 0) {
            list.textContent = "You have not applied for any drives.";
            return;
        }

        applications.forEach(application => {
            const card = document.createElement("div");
            card.className = "applicant-card";

            const drive = application.driveId;

            const details = [
                "Company: " + (drive ? drive.company : "Unavailable"),
                "Job Role: " + (drive ? drive.jobRole : "Unavailable"),
                "Applied On: " + new Date(application.appliedAt).toLocaleDateString(),
                "Application Status: " + application.status
            ];

            details.forEach(detail => {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                card.appendChild(paragraph);
            });

            list.appendChild(card);
        });

    } catch (error) {
        list.textContent = "Unable to load application history.";
    }
}


// 5. Admin: Load company drives
async function loadAdminDrives() {
    try {
        const response = await fetch(`${API}/drives`);
        const drives = await response.json();

        const select = document.getElementById("adminDriveSelect");

        select.innerHTML = '<option value="">Select a Company Drive</option>';

        drives.forEach(drive => {
            const option = document.createElement("option");

            option.value = drive._id;
            option.textContent = drive.company + " - " + drive.jobRole;

            select.appendChild(option);
        });

        document.getElementById("applicantList").innerHTML = "";

    } catch (error) {
        document.getElementById("applicantList").textContent =
            "Unable to load company drives.";
    }
}


// 6. Admin: View applicants
async function loadApplicants() {
    const driveId = document.getElementById("adminDriveSelect").value;

    const applicantList = document.getElementById("applicantList");

    applicantList.innerHTML = "";

    if (!driveId) {
        return;
    }

    try {
        const response = await fetch(
            `${API}/applications/drive/${driveId}`
        );

        const applications = await response.json();

        if (applications.length === 0) {
            applicantList.textContent = "No students have applied yet.";
            return;
        }

        applications.forEach(application => {
            const card = document.createElement("div");
            card.className = "applicant-card";

            const student = application.studentId;

            const heading = document.createElement("h3");
            heading.textContent = student ? student.name : "Student unavailable";

            const details = [
                "Email: " + (student ? student.email : "N/A"),
                "Phone: " + (student ? student.phone : "N/A"),
                "Department: " + (student ? student.department : "N/A"),
                "CGPA: " + (student ? student.cgpa : "N/A"),
                "Skills: " + (student ? student.skills : "N/A"),
                "Current Status: " + application.status
            ];

            card.appendChild(heading);

            details.forEach(detail => {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                card.appendChild(paragraph);
            });

            const select = document.createElement("select");

            ["Applied", "Selected", "Not Selected"].forEach(status => {
                const option = document.createElement("option");

                option.value = status;
                option.textContent = status;

                if (status === application.status) {
                    option.selected = true;
                }

                select.appendChild(option);
            });

            const updateButton = document.createElement("button");
            updateButton.textContent = "Update Status";

            updateButton.onclick = () => {
                updateApplicationStatus(
                    application._id,
                    select.value
                );
            };

            card.appendChild(select);
            card.appendChild(updateButton);

            applicantList.appendChild(card);
        });

    } catch (error) {
        applicantList.textContent = "Unable to load applicants.";
    }
}


// 7. Admin: Update student selection status
async function updateApplicationStatus(id, status) {
    if (status === "Applied") {
        alert("Please select Selected or Not Selected.");
        return;
    }

    try {
        const response = await fetch(`${API}/applications/${id}`, {
            method: "PUT",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({ status })
        });

        const data = await response.json();

        alert(data.message);

        if (response.ok) {
            loadApplicants();
        }

    } catch (error) {
        alert("Unable to update application status.");
    }
}

// View existing student profile
async function loadProfile() {
    const email = document.getElementById("profileEmail").value.trim();

    if (!email) {
        alert("Please enter your registered email.");
        return;
    }

    try {
        const response = await fetch(
            `${API}/students/${encodeURIComponent(email)}`
        );

        const student = await response.json();

        if (!response.ok) {
            alert(student.message);
            return;
        }

        displayProfile(student);

    } catch (error) {
        alert("Unable to load student profile.");
    }
}