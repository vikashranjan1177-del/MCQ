/* =========================================================
   UPSC MCQ REVISION APP
   Clean working JavaScript
   ========================================================= */

"use strict";

/* ---------- STORAGE ---------- */

const STORAGE_KEY = "upsc_mcq_questions";

let questions = [];
let currentQuestion = 0;
let score = 0;
let answered = false;


/* ---------- DEFAULT QUESTIONS ---------- */

const defaultQuestions = [
    {
        id: "POL-001",
        subject: "Polity",
        topic: "Constitution",
        question: "Which Article of the Constitution of India deals with equality before law?",
        options: [
            "Article 12",
            "Article 14",
            "Article 19",
            "Article 21"
        ],
        answer: 1,
        explanation: "Article 14 guarantees equality before law and equal protection of the laws."
    },

    {
        id: "ECO-001",
        subject: "Economy",
        topic: "Monetary Policy",
        question: "Which institution is responsible for conducting monetary policy in India?",
        options: [
            "Ministry of Finance",
            "SEBI",
            "Reserve Bank of India",
            "NITI Aayog"
        ],
        answer: 2,
        explanation: "The Reserve Bank of India is responsible for monetary policy."
    },

    {
        id: "GEO-001",
        subject: "Geography",
        topic: "Physical Geography",
        question: "The Coriolis force is caused primarily by:",
        options: [
            "Revolution of the Earth",
            "Rotation of the Earth",
            "Tilt of the Earth's axis",
            "Gravitational force of the Moon"
        ],
        answer: 1,
        explanation: "The Coriolis effect results from Earth's rotation."
    }
];


/* ---------- INITIALIZATION ---------- */

document.addEventListener("DOMContentLoaded", function () {

    loadQuestions();

    setupNavigation();
    setupQuiz();
    setupImport();
    setupSearch();

    showScreen("home");

    console.log("UPSC MCQ App loaded successfully.");
});


/* ---------- LOAD QUESTIONS ---------- */

function loadQuestions() {

    try {

        const saved = localStorage.getItem(STORAGE_KEY);

        if (saved) {
            questions = JSON.parse(saved);
        }

        if (!Array.isArray(questions) || questions.length === 0) {
            questions = defaultQuestions;
            saveQuestions();
        }

    } catch (error) {

        console.error("Question loading error:", error);

        questions = defaultQuestions;
    }

    updateQuestionCount();
}


/* ---------- SAVE QUESTIONS ---------- */

function saveQuestions() {

    try {
        localStorage.setItem(
            STORAGE_KEY,
            JSON.stringify(questions)
        );
    } catch (error) {
        console.error("Could not save questions:", error);
    }

    updateQuestionCount();
}


/* ---------- NAVIGATION ---------- */

function setupNavigation() {

    /*
       Event delegation:
       Any button containing data-action will work,
       even if the button was created dynamically.
    */

    document.addEventListener("click", function (event) {

        const button = event.target.closest("[data-action]");

        if (!button) return;

        const action = button.dataset.action;

        handleAction(action);
    });
}


function handleAction(action) {

    console.log("Action:", action);

    switch (action) {

        case "home":
            showScreen("home");
            break;

        case "quiz":
        case "startQuiz":
            startQuiz();
            break;

        case "bank":
            showScreen("bank");
            renderQuestionBank();
            break;

        case "import":
            showScreen("import");
            break;

        case "backup":
            showScreen("backup");
            renderBackup();
            break;

        default:
            console.warn("Unknown action:", action);
    }
}


/* ---------- SCREEN MANAGEMENT ---------- */

function showScreen(screenName) {

    const screens = document.querySelectorAll(".screen");

    screens.forEach(function (screen) {
        screen.classList.remove("active");
        screen.style.display = "none";
    });


    const target = document.getElementById(screenName);

    if (target) {

        target.classList.add("active");
        target.style.display = "block";

    } else {

        console.warn("Screen not found:", screenName);
    }
}


/* ---------- QUIZ ---------- */

function setupQuiz() {

    const nextButton = document.getElementById("nextBtn");

    if (nextButton) {

        nextButton.addEventListener("click", function () {

            currentQuestion++;

            if (currentQuestion >= questions.length) {

                showQuizResult();

            } else {

                renderQuestion();
            }

        });
    }
}


function startQuiz() {

    if (questions.length === 0) {

        alert("No questions are available.");

        return;
    }

    currentQuestion = 0;
    score = 0;
    answered = false;

    showScreen("quiz");

    renderQuestion();
}


function renderQuestion() {

    if (!questions.length) return;

    const q = questions[currentQuestion];

    answered = false;


    /* Counter */

    const counter = document.getElementById("quizCounter");

    if (counter) {

        counter.textContent =
            "Question " +
            (currentQuestion + 1) +
            " of " +
            questions.length;
    }


    /* Progress */

    const progress = document.getElementById("progressBar");

    if (progress) {

        const percent =
            ((currentQuestion) / questions.length) * 100;

        progress.style.width = percent + "%";
    }


    /* Subject */

    const subject = document.getElementById("qSubject");

    if (subject) {
        subject.textContent = q.subject || "";
    }


    /* Topic */

    const topic = document.getElementById("qTopic");

    if (topic) {
        topic.textContent = q.topic || "";
    }


    /* Question */

    const questionText =
        document.getElementById("questionText");

    if (questionText) {
        questionText.textContent = q.question || "";
    }


    /* Options */

    const optionsContainer =
        document.getElementById("options");

    if (optionsContainer) {

        optionsContainer.innerHTML = "";

        q.options.forEach(function (option, index) {

            const button =
                document.createElement("button");

            button.className = "option";

            button.textContent =
                String.fromCharCode(65 + index) +
                ". " +
                option;

            button.addEventListener(
                "click",
                function () {

                    selectAnswer(index);
                }
            );

            optionsContainer.appendChild(button);
        });
    }


    /* Feedback */

    const feedback =
        document.getElementById("feedback");

    if (feedback) {

        feedback.hidden = true;
        feedback.innerHTML = "";
    }


    /* Next */

    const nextButton =
        document.getElementById("nextBtn");

    if (nextButton) {

        nextButton.hidden = true;
    }
}


/* ---------- ANSWER ---------- */

function selectAnswer(selectedIndex) {

    if (answered) return;

    answered = true;

    const q = questions[currentQuestion];

    const optionButtons =
        document.querySelectorAll("#options .option");


    optionButtons.forEach(function (button, index) {

        button.disabled = true;

        if (index === q.answer) {
            button.classList.add("correct");
        }

        if (
            index === selectedIndex &&
            selectedIndex !== q.answer
        ) {
            button.classList.add("wrong");
        }
    });


    if (selectedIndex === q.answer) {
        score++;
    }


    const feedback =
        document.getElementById("feedback");

    if (feedback) {

        feedback.hidden = false;

        if (selectedIndex === q.answer) {

            feedback.innerHTML =
                "<strong>Correct!</strong><br>" +
                (q.explanation || "");

        } else {

            feedback.innerHTML =
                "<strong>Incorrect.</strong><br>" +
                "Correct answer: " +
                q.options[q.answer] +
                "<br>" +
                (q.explanation || "");
        }
    }


    const nextButton =
        document.getElementById("nextBtn");

    if (nextButton) {

        nextButton.hidden = false;

        if (currentQuestion === questions.length - 1) {
            nextButton.textContent = "Finish Quiz";
        } else {
            nextButton.textContent = "Next Question →";
        }
    }
}


/* ---------- QUIZ RESULT ---------- */

function showQuizResult() {

    const quiz =
        document.getElementById("quiz");

    if (!quiz) return;


    const percentage =
        questions.length
            ? Math.round(
                (score / questions.length) * 100
              )
            : 0;


    quiz.innerHTML = `

        <div class="card">

            <h2>Quiz Complete</h2>

            <p>
                Score:
                <strong>
                    ${score} / ${questions.length}
                </strong>
            </p>

            <p>
                Accuracy:
                <strong>
                    ${percentage}%
                </strong>
            </p>

            <button
                class="primary full"
                onclick="startQuiz()">
                Restart Quiz
            </button>

            <button
                class="back"
                data-action="home">
                ← Dashboard
            </button>

        </div>
    `;
}


/* ---------- QUESTION BANK ---------- */

function renderQuestionBank() {

    const list =
        document.getElementById("bankList");

    if (!list) return;


    if (questions.length === 0) {

        list.innerHTML =
            "<p>No questions available.</p>";

        return;
    }


    list.innerHTML = "";


    questions.forEach(function (q, index) {

        const item =
            document.createElement("div");

        item.className = "card";

        item.innerHTML = `

            <h3>
                ${escapeHTML(q.id || "Question " + (index + 1))}
            </h3>

            <p>
                <strong>
                    ${escapeHTML(q.subject || "")}
                </strong>
                —
                ${escapeHTML(q.topic || "")}
            </p>

            <p>
                ${escapeHTML(q.question || "")}
            </p>

        `;

        list.appendChild(item);
    });
}


/* ---------- SEARCH ---------- */

function setupSearch() {

    const search =
        document.getElementById("bankSearch");

    if (!search) return;


    search.addEventListener("input", function () {

        const term =
            search.value.trim().toLowerCase();

        const list =
            document.getElementById("bankList");

        if (!list) return;


        const filtered =
            questions.filter(function (q) {

                return (
                    String(q.subject || "")
                        .toLowerCase()
                        .includes(term) ||

                    String(q.topic || "")
                        .toLowerCase()
                        .includes(term) ||

                    String(q.question || "")
                        .toLowerCase()
                        .includes(term)
                );
            });


        list.innerHTML = "";


        filtered.forEach(function (q) {

            const item =
                document.createElement("div");

            item.className = "card";

            item.innerHTML = `
                <h3>
                    ${escapeHTML(q.id || "")}
                </h3>

                <p>
                    <strong>
                        ${escapeHTML(q.subject || "")}
                    </strong>
                    —
                    ${escapeHTML(q.topic || "")}
                </p>

                <p>
                    ${escapeHTML(q.question || "")}
                </p>
            `;

            list.appendChild(item);
        });
    });
}


/* ---------- IMPORT ---------- */

function setupImport() {

    const importButton =
        document.getElementById("importRun");

    if (!importButton) return;


    importButton.addEventListener(
        "click",
        function () {

            const box =
                document.getElementById("importBox");

            const message =
                document.getElementById("importMsg");


            if (!box) return;


            try {

                const imported =
                    JSON.parse(box.value);


                if (!Array.isArray(imported)) {

                    throw new Error(
                        "JSON must contain an array."
                    );
                }


                const valid =
                    imported.filter(function (q) {

                        return (
                            q &&
                            typeof q.question === "string" &&
                            Array.isArray(q.options) &&
                            q.options.length >= 2 &&
                            typeof q.answer === "number"
                        );
                    });


                if (valid.length === 0) {

                    throw new Error(
                        "No valid questions found."
                    );
                }


                questions = valid;

                saveQuestions();


                if (message) {

                    message.hidden = false;

                    message.textContent =
                        valid.length +
                        " question(s) imported successfully.";
                }


                renderQuestionBank();


            } catch (error) {

                if (message) {

                    message.hidden = false;

                    message.textContent =
                        "Import error: " +
                        error.message;
                }

                console.error(error);
            }
        }
    );
}


/* ---------- BACKUP ---------- */

function renderBackup() {

    const backupScreen =
        document.getElementById("backup");

    if (!backupScreen) return;


    const old =
        backupScreen.querySelector(".backup-content");

    if (old) old.remove();


    const container =
        document.createElement("div");

    container.className =
        "card backup-content";


    container.innerHTML = `

        <h3>Question Bank Backup</h3>

        <p>
            ${questions.length}
            question(s) currently stored.
        </p>

        <button
            class="primary"
            id="downloadBackup">
            Download Backup
        </button>

    `;


    backupScreen.appendChild(container);


    document
        .getElementById("downloadBackup")
        .addEventListener(
            "click",
            downloadBackup
        );
}


function downloadBackup() {

    const data =
        JSON.stringify(
            questions,
            null,
            2
        );


    const blob =
        new Blob(
            [data],
            {
                type: "application/json"
            }
        );


    const url =
        URL.createObjectURL(blob);


    const link =
        document.createElement("a");

    link.href = url;

    link.download =
        "upsc-question-bank.json";

    document.body.appendChild(link);

    link.click();

    link.remove();

    URL.revokeObjectURL(url);
}


/* ---------- COUNT ---------- */

function updateQuestionCount() {

    const elements =
        document.querySelectorAll(
            "[data-question-count]"
        );


    elements.forEach(function (element) {

        element.textContent =
            questions.length;
    });
}


/* ---------- HTML SAFETY ---------- */

function escapeHTML(value) {

    return String(value)
        .replace(/&/g, "&amp;")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/"/g, "&quot;")
        .replace(/'/g, "&#039;");
}


/* ---------- DEBUG ---------- */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "JavaScript error:",
            event.error || event.message
        );
    }
);

console.log(
    "UPSC MCQ Revision App JavaScript ready."
);
