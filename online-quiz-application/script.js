const url = "http://localhost:5000/api";

let questions = [];
let answers = [];
let currentQuestion = 0;
let timeLeft = 600; // 10 minutes
let timerInterval;
let studentName = "";

// START QUIZ
async function startQuiz() {

    studentName = document.getElementById("studentName").value.trim();

    if (studentName === "") {
        alert("Please enter your name");
        return;
    }

    let response = await fetch(url + "/questions");
    questions = await response.json();

    if (questions.length !== 10) {
        alert("Unable to load 10 questions");
        return;
    }

    answers = new Array(10).fill("");

    document.getElementById("startSection").classList.add("hidden");
    document.getElementById("quizSection").classList.remove("hidden");

    showQuestion();
    startTimer();
}

// DISPLAY ONE QUESTION
function showQuestion() {

    let q = questions[currentQuestion];

    document.getElementById("questionNumber").innerText =
        "Question " + (currentQuestion + 1) + " of 10";

    document.getElementById("question").innerText = q.question;

    let optionsDiv = document.getElementById("options");
    optionsDiv.innerHTML = "";

    q.options.forEach(function(option) {

        let label = document.createElement("label");
        label.className = "option";

        let radio = document.createElement("input");
        radio.type = "radio";
        radio.name = "answer";
        radio.value = option;
        radio.checked = answers[currentQuestion] === option;

        radio.addEventListener("change", function() {
            answers[currentQuestion] = option;
        });

        label.append(radio, document.createTextNode(option));
        optionsDiv.appendChild(label);
    });

    document.getElementById("previousBtn").style.display =
        currentQuestion === 0 ? "none" : "inline-block";

    document.getElementById("nextBtn").style.display =
        currentQuestion === 9 ? "none" : "inline-block";

    document.getElementById("submitBtn").style.display =
        currentQuestion === 9 ? "inline-block" : "none";
}

// NEXT QUESTION
function nextQuestion() {
    if (currentQuestion < 9) {
        currentQuestion++;
        showQuestion();
    }
}

// PREVIOUS QUESTION
function previousQuestion() {
    if (currentQuestion > 0) {
        currentQuestion--;
        showQuestion();
    }
}

// TIMER
function startTimer() {

    timerInterval = setInterval(function() {

        timeLeft--;

        let minutes = Math.floor(timeLeft / 60);
        let seconds = timeLeft % 60;

        document.getElementById("timer").innerText =
            minutes + ":" + String(seconds).padStart(2, "0");

        if (timeLeft <= 0) {
            clearInterval(timerInterval);
            alert("Time is over! Your quiz will be submitted.");
            submitQuiz();
        }

    }, 1000);
}

// SUBMIT QUIZ
async function submitQuiz() {

    clearInterval(timerInterval);

    document.getElementById("submitBtn").disabled = true;

    try {
        let response = await fetch(url + "/submit", {
            method: "POST",
            headers: {
                "Content-Type": "application/json"
            },
            body: JSON.stringify({
                studentName: studentName,
                answers: answers
            })
        });

        let result = await response.json();

        if (!response.ok) {
            alert(result.message);
            document.getElementById("submitBtn").disabled = false;
            return;
        }

        document.getElementById("quizSection").classList.add("hidden");
        document.getElementById("resultSection").classList.remove("hidden");

        document.getElementById("result").innerHTML =
            "<h3>Student: " + studentName + "</h3>" +
            "<h3>Score: " + result.score + " / 10</h3>" +
            "<h3>Percentage: " + result.percentage + "%</h3>" +
            "<p>" + result.message + "</p>";

    } catch (error) {
        alert("Unable to submit quiz. Please check your server.");
        document.getElementById("submitBtn").disabled = false;
    }
}