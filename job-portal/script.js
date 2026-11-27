const API = "http://localhost:5000/api";


// Switch between sections
function showSection(sectionId) {
    document.getElementById("studentSection").classList.add("hidden");
    document.getElementById("recruiterSection").classList.add("hidden");
    document.getElementById("applicationsSection").classList.add("hidden");

    document.getElementById(sectionId).classList.remove("hidden");

    if (sectionId === "studentSection") {
        loadJobs();
    }
}


// Load all jobs
async function loadJobs() {
    try {
        const response = await fetch(`${API}/jobs`);
        const jobs = await response.json();

        displayJobs(jobs);

    } catch (error) {
        document.getElementById("jobList").innerHTML =
            "<p>Unable to load jobs. Check the backend server.</p>";
    }
}


// Search jobs by title or location
async function searchJobs() {
    const search = document.getElementById("searchInput").value.trim();

    try {
        const response = await fetch(
            `${API}/jobs?search=${encodeURIComponent(search)}`
        );

        const jobs = await response.json();

        displayJobs(jobs);

    } catch (error) {
        alert("Error searching jobs");
    }
}


// Display job cards
function displayJobs(jobs) {
    const jobList = document.getElementById("jobList");

    jobList.innerHTML = "";

    if (jobs.length === 0) {
        jobList.innerHTML = "<p>No jobs found.</p>";
        return;
    }

    jobs.forEach(job => {
        const card = document.createElement("div");
        card.className = "job-card";

        const title = document.createElement("h3");
        title.textContent = job.title;

        const company = document.createElement("p");
        company.textContent = "Company: " + job.company;

        const location = document.createElement("p");
        location.textContent = "Location: " + job.location;

        const description = document.createElement("p");
        description.textContent = "Description: " + job.description;

        const eligibility = document.createElement("p");
        eligibility.textContent = "Eligibility: " + job.eligibility;

        const button = document.createElement("button");
        button.textContent = "Apply Now";
        button.onclick = () => openApplyForm(job._id);

        card.append(title, company, location, description, eligibility, button);
        jobList.appendChild(card);
    });
}


// Recruiter: Post a job
document.getElementById("jobForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const job = {
        title: document.getElementById("jobTitle").value.trim(),
        company: document.getElementById("company").value.trim(),
        location: document.getElementById("location").value.trim(),
        description: document.getElementById("description").value.trim(),
        eligibility: document.getElementById("eligibility").value.trim()
    };

    try {
        const response = await fetch(`${API}/jobs`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(job)
        });

        const data = await response.json();

        document.getElementById("jobMessage").textContent = data.message;

        if (response.ok) {
            this.reset();
        }

    } catch (error) {
        document.getElementById("jobMessage").textContent =
            "Unable to post job. Check the backend server.";
    }
});


// Open application form
function openApplyForm(jobId) {
    document.getElementById("selectedJobId").value = jobId;
    document.getElementById("applicationMessage").textContent = "";
    document.getElementById("applyModal").classList.remove("hidden");
}


// Close application form
function closeApplyForm() {
    document.getElementById("applyModal").classList.add("hidden");
}


// Student: Submit application
document.getElementById("applicationForm").addEventListener("submit", async function(event) {
    event.preventDefault();

    const application = {
        jobId: document.getElementById("selectedJobId").value,
        studentName: document.getElementById("studentName").value.trim(),
        email: document.getElementById("studentEmail").value.trim(),
        phone: document.getElementById("studentPhone").value.trim(),
        resumeLink: document.getElementById("resumeLink").value.trim()
    };

    try {
        const response = await fetch(`${API}/applications`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(application)
        });

        const data = await response.json();

        document.getElementById("applicationMessage").textContent = data.message;

        if (response.ok) {
            this.reset();

            setTimeout(() => {
                closeApplyForm();
            }, 1200);
        }

    } catch (error) {
        document.getElementById("applicationMessage").textContent =
            "Unable to submit application.";
    }
});


// Recruiter: View received applications
async function loadApplications() {
    const applicationList = document.getElementById("applicationList");

    try {
        const response = await fetch(`${API}/applications`);
        const applications = await response.json();

        applicationList.innerHTML = "";

        if (applications.length === 0) {
            applicationList.innerHTML = "<p>No applications received yet.</p>";
            return;
        }

        applications.forEach(application => {
            const card = document.createElement("div");
            card.className = "application-card";

            const details = [
                "Student: " + application.studentName,
                "Email: " + application.email,
                "Phone: " + application.phone,
                "Resume: " + application.resumeLink,
                "Job: " + (application.jobId ? application.jobId.title : "Job unavailable"),
                "Company: " + (application.jobId ? application.jobId.company : "N/A")
            ];

            details.forEach(detail => {
                const paragraph = document.createElement("p");
                paragraph.textContent = detail;
                card.appendChild(paragraph);
            });

            applicationList.appendChild(card);
        });

    } catch (error) {
        applicationList.textContent = "Unable to load applications.";
    }
}


// Load jobs when the page opens
loadJobs();