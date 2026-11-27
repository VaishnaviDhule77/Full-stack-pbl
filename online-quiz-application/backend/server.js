const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const Question = require("./models/Question");
const Result = require("./models/Result");

const app = express();

app.use(cors());
app.use(express.json());

// SAMPLE QUESTIONS
const sampleQuestions = [
    {
        question: "Which language is used for web page structure?",
        options: ["CSS", "HTML", "Python", "Java"],
        correctAnswer: "HTML"
    },
    {
        question: "Which language is used for styling web pages?",
        options: ["HTML", "CSS", "C", "PHP"],
        correctAnswer: "CSS"
    },
    {
        question: "Which company developed Java?",
        options: ["Microsoft", "Google", "Sun Microsystems", "Apple"],
        correctAnswer: "Sun Microsystems"
    },
    {
        question: "Which database is a NoSQL database?",
        options: ["MySQL", "MongoDB", "Oracle", "PostgreSQL"],
        correctAnswer: "MongoDB"
    },
    {
        question: "What does CPU stand for?",
        options: [
            "Central Processing Unit",
            "Computer Personal Unit",
            "Central Program Utility",
            "Control Processing User"
        ],
        correctAnswer: "Central Processing Unit"
    },
    {
        question: "Which symbol is used for comments in JavaScript single-line code?",
        options: ["<!--", "//", "**", "##"],
        correctAnswer: "//"
    },
    {
        question: "Which HTML tag is used to create a hyperlink?",
        options: ["<link>", "<a>", "<p>", "<h1>"],
        correctAnswer: "<a>"
    },
    {
        question: "Which method converts JSON text into a JavaScript object?",
        options: [
            "JSON.stringify()",
            "JSON.parse()",
            "JSON.convert()",
            "JSON.object()"
        ],
        correctAnswer: "JSON.parse()"
    },
    {
        question: "Which protocol is used for secure web communication?",
        options: ["HTTP", "FTP", "HTTPS", "SMTP"],
        correctAnswer: "HTTPS"
    },
    {
        question: "Which command starts a Node.js application?",
        options: ["npm start", "npm stop", "npm delete", "npm close"],
        correctAnswer: "npm start"
    }
];

// ADD SAMPLE QUESTIONS IF DATABASE IS EMPTY
async function addQuestions() {
    const count = await Question.countDocuments();

    if (count === 0) {
        await Question.insertMany(sampleQuestions);
        console.log("10 sample questions added");
    }
}

// FETCH 10 QUESTIONS
app.get("/api/questions", async (req, res) => {
    try {
        const questions = await Question.find()
            .limit(10)
            .select("-correctAnswer");

        res.json(questions);
    } catch (error) {
        res.status(500).json({ message: "Unable to fetch questions" });
    }
});

// SUBMIT QUIZ AND CALCULATE SCORE
app.post("/api/submit", async (req, res) => {
    try {
        const { studentName, answers } = req.body;

        if (!studentName || !Array.isArray(answers) ||
            answers.length !== 10) {
            return res.status(400).json({
                message: "Please submit your name and all 10 answers"
            });
        }

        const questions = await Question.find().limit(10);

        if (questions.length !== 10) {
            return res.status(500).json({
                message: "Quiz questions are not available"
            });
        }

        let score = 0;

        for (let i = 0; i < questions.length; i++) {
            if (answers[i] === questions[i].correctAnswer) {
                score++;
            }
        }

        let percentage = (score / 10) * 100;

        const result = new Result({
            studentName,
            score,
            totalQuestions: 10,
            percentage
        });

        await result.save();

        res.json({
            message: "Quiz submitted successfully!",
            score,
            totalQuestions: 10,
            percentage
        });

    } catch (error) {
        res.status(500).json({ message: "Unable to submit quiz" });
    }
});

// DISPLAY QUIZ RESULTS
app.get("/api/results", async (req, res) => {
    try {
        const results = await Result.find().sort({ submittedAt: -1 });
        res.json(results);
    } catch (error) {
        res.status(500).json({ message: "Unable to fetch results" });
    }
});

// CONNECT DATABASE AND START SERVER
mongoose.connect(process.env.MONGO_URI)
.then(async () => {
    console.log("MongoDB Connected");
    await addQuestions();

    app.listen(process.env.PORT || 5000, () => {
        console.log("Server running on port 5000");
    });
})
.catch(error => console.log(error));