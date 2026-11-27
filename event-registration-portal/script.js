
const API = "http://localhost:5000/api/register";

const form = document.getElementById("registrationForm");

const nameInput = document.getElementById("name");
const emailInput = document.getElementById("email");
const mobileInput = document.getElementById("mobile");
const eventInput = document.getElementById("event");

const message = document.getElementById("message");
const registerButton = document.getElementById("registerButton");

// Clear error messages
function clearErrors() {
    document.getElementById("nameError").textContent = "";
    document.getElementById("emailError").textContent = "";
    document.getElementById("mobileError").textContent = "";
    document.getElementById("eventError").textContent = "";

    message.textContent = "";
}

// Validate registration form
function validateForm() {
    clearErrors();

    let valid = true;

    const name = nameInput.value.trim();
    const email = emailInput.value.trim();
    const mobile = mobileInput.value.trim();
    const event = eventInput.value;

    if (name.length < 3) {
        document.getElementById("nameError").textContent =
            "Name must contain at least 3 characters";
        valid = false;
    }

    const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    if (!emailPattern.test(email)) {
        document.getElementById("emailError").textContent =
            "Enter a valid email address";
        valid = false;
    }

    if (!/^[0-9]{10}$/.test(mobile)) {
        document.getElementById("mobileError").textContent =
            "Enter a valid 10-digit mobile number";
        valid = false;
    }

    if (event === "") {
        document.getElementById("eventError").textContent =
            "Please select an event";
        valid = false;
    }

    return valid;
}

// Submit registration
form.addEventListener("submit", async function(event) {
    event.preventDefault();

    if (!validateForm()) {
        return;
    }

    const registrationData = {
        name: nameInput.value.trim(),
        email: emailInput.value.trim(),
        mobile: mobileInput.value.trim(),
        event: eventInput.value
    };

    registerButton.disabled = true;
    registerButton.textContent = "Registering...";

    try {
        const response = await fetch(API, {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify(registrationData)
        });

        const result = await response.json();

        if (!response.ok) {
            throw new Error(result.message);
        }

        message.style.color = "green";
        message.textContent = result.message;

        form.reset();

    } catch (error) {
        message.style.color = "red";
        message.textContent = error.message ||
            "Something went wrong. Please try again.";
    } finally {
        registerButton.disabled = false;
        registerButton.textContent = "Register Now";
    }
});
