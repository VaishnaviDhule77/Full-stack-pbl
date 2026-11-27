
const API = "http://localhost:5000/api";

let token = "";
let userName = "";

// HTML elements
const authSection = document.getElementById("authSection");
const notesSection = document.getElementById("notesSection");

const loginForm = document.getElementById("loginForm");
const signupForm = document.getElementById("signupForm");

const loginTab = document.getElementById("loginTab");
const signupTab = document.getElementById("signupTab");

const authMessage = document.getElementById("authMessage");
const noteForm = document.getElementById("noteForm");
const notesList = document.getElementById("notesList");

// Show login form
loginTab.addEventListener("click", function() {
    loginForm.hidden = false;
    signupForm.hidden = true;

    loginTab.classList.add("active");
    signupTab.classList.remove("active");

    authMessage.textContent = "";
});

// Show signup form
signupTab.addEventListener("click", function() {
    signupForm.hidden = false;
    loginForm.hidden = true;

    signupTab.classList.add("active");
    loginTab.classList.remove("active");

    authMessage.textContent = "";
});

// Signup
signupForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        name: document.getElementById("signupName").value.trim(),
        email: document.getElementById("signupEmail").value.trim(),
        password: document.getElementById("signupPassword").value
    };

    try {
        const response = await fetch(`${API}/signup`, {
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

        authMessage.style.color = "green";
        authMessage.textContent = result.message;

        signupForm.reset();

        loginForm.hidden = false;
        signupForm.hidden = true;

        loginTab.classList.add("active");
        signupTab.classList.remove("active");

    } catch (error) {
        authMessage.style.color = "red";
        authMessage.textContent = error.message;
    }
});

// Login
loginForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const data = {
        email: document.getElementById("loginEmail").value.trim(),
        password: document.getElementById("loginPassword").value
    };

    try {
        const response = await fetch(`${API}/login`, {
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

        token = result.token;
        userName = result.name;

        showNotesPage();

    } catch (error) {
        authMessage.style.color = "red";
        authMessage.textContent = error.message;
    }
});

// Show notes page after login
function showNotesPage() {
    authSection.hidden = true;
    notesSection.hidden = false;

    document.getElementById("userName").textContent = userName;

    loadNotes();
}

// Load only logged-in user's notes
async function loadNotes() {
    try {
        const response = await fetch(`${API}/notes`, {
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const notes = await response.json();

        if (!response.ok) {
            throw new Error(notes.message);
        }

        displayNotes(notes);

    } catch (error) {
        notesList.textContent = error.message;
    }
}

// Escape note text before displaying it as HTML
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

// Display notes
function displayNotes(notes) {
    notesList.innerHTML = "";

    if (notes.length === 0) {
        notesList.innerHTML =
            '<p class="empty-message">No notes available. Create your first note!</p>';
        return;
    }

    notes.forEach(note => {
        const card = document.createElement("div");
        card.className = "note-card";

        card.innerHTML = `
            <h3>${escapeHTML(note.title)}</h3>
            <p>${escapeHTML(note.content)}</p>

            <div class="note-actions">
                <button class="edit-btn"
                    onclick="editNote('${note._id}',
                    this.closest('.note-card'))">
                    Edit
                </button>

                <button class="delete-btn"
                    onclick="deleteNote('${note._id}')">
                    Delete
                </button>
            </div>
        `;

        notesList.appendChild(card);
    });
}

// Create or update note
noteForm.addEventListener("submit", async function(event) {
    event.preventDefault();

    const id = document.getElementById("noteId").value;

    const data = {
        title: document.getElementById("noteTitle").value.trim(),
        content: document.getElementById("noteContent").value.trim()
    };

    const url = id ? `${API}/notes/${id}` : `${API}/notes`;
    const method = id ? "PUT" : "POST";

    try {
        const response = await fetch(url, {
            method: method,
            headers: {
                "Content-Type": "application/json",
                "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify(data)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);

        resetNoteForm();
        loadNotes();

    } catch (error) {
        alert(error.message);
    }
});

// Edit note
function editNote(id, card) {
    document.getElementById("noteId").value = id;

    document.getElementById("noteTitle").value =
        card.querySelector("h3").textContent;

    document.getElementById("noteContent").value =
        card.querySelector("p").textContent;

    document.getElementById("formHeading").textContent =
        "Edit Note";

    document.getElementById("saveButton").textContent =
        "Update Note";

    document.getElementById("cancelButton").hidden = false;

    window.scrollTo({
        top: 0,
        behavior: "smooth"
    });
}

// Delete note
async function deleteNote(id) {
    if (!confirm("Are you sure you want to delete this note?")) {
        return;
    }

    try {
        const response = await fetch(`${API}/notes/${id}`, {
            method: "DELETE",
            headers: {
                "Authorization": `Bearer ${token}`
            }
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        alert(result.message);
        loadNotes();

    } catch (error) {
        alert(error.message);
    }
}

// Reset note form
function resetNoteForm() {
    noteForm.reset();

    document.getElementById("noteId").value = "";

    document.getElementById("formHeading").textContent =
        "Create New Note";

    document.getElementById("saveButton").textContent =
        "Save Note";

    document.getElementById("cancelButton").hidden = true;
}

// Cancel editing
document.getElementById("cancelButton")
    .addEventListener("click", resetNoteForm);

// Logout
document.getElementById("logoutButton")
    .addEventListener("click", function() {
        token = "";
        userName = "";

        notesSection.hidden = true;
        authSection.hidden = false;

        loginForm.reset();
        signupForm.reset();
        noteForm.reset();
        resetNoteForm();

        authMessage.textContent = "You have logged out.";
        authMessage.style.color = "green";
    });
