"use strict";

/* =========================================================
   UPSC MCQ REVISION APP — FINAL
   Compatible with the current index.html
   ========================================================= */

const QUESTIONS_KEY = "upsc_mcq_questions";
const ATTEMPTS_KEY = "upsc_mcq_attempts";

let questions = [];
let attempts = {};
let quizList = [];
let currentQuestion = 0;
let score = 0;
let answered = false;


/* =========================================================
   DEFAULT QUESTIONS
   ========================================================= */

const defaultQuestions = [
    {
        id: "POL-001",
        subject: "Polity",
        topic: "Constitution",
        question:
            "Which Article of the Constitution of India deals with equality before law?",
        options: [
            "Article 12",
            "Article 14",
            "Article 19",
            "Article 21"
        ],
        answer: 1,
        explanation:
            "Article 14 guarantees equality before law and equal protection of the laws."
    },
    {
        id: "ECO-001",
        subject: "Economy",
        topic: "Monetary Policy",
        question:
            "Which institution is responsible for conducting monetary policy in India?",
        options: [
            "Ministry of Finance",
            "SEBI",
            "Reserve Bank of India",
            "NITI Aayog"
        ],
        answer: 2,
        explanation:
            "The Reserve Bank of India is responsible for monetary policy."
    },
    {
        id: "GEO-001",
        subject: "Geography",
        topic: "Physical Geography",
        question:
            "The Coriolis force is caused primarily by:",
        options: [
            "Revolution of the Earth",
            "Rotation of the Earth",
            "Tilt of the Earth's axis",
            "Gravitational force of the Moon"
        ],
        answer: 1,
        explanation:
            "The Coriolis effect results from Earth's rotation."
    }
];


/* =========================================================
   START
   ========================================================= */

document.addEventListener("DOMContentLoaded", function () {

    loadQuestions();
    loadAttempts();

    setupNavigation();
    setupQuiz();
    setupImport();
    setupSearch();
    setupBackup();
    setupInstall();

    /* IMPORTANT:
       The HTML screen is called "dashboard", NOT "home".
    */
    showScreen("dashboard");

    updateDashboard();

    console.log("UPSC MCQ App loaded successfully.");

});


/* =========================================================
   STORAGE
   ========================================================= */

function loadQuestions() {

    try {

        const saved =
            localStorage.getItem(QUESTIONS_KEY);

        if (saved) {
            questions = JSON.parse(saved);
        }

        if (
            !Array.isArray(questions) ||
            questions.length === 0
        ) {
            questions = defaultQuestions;
            saveQuestions();
        }

    } catch (error) {

        console.error(
            "Question loading error:",
            error
        );

        questions = defaultQuestions;
    }

    updateQuestionCount();
}


function saveQuestions() {

    try {

        localStorage.setItem(
            QUESTIONS_KEY,
            JSON.stringify(questions)
        );

    } catch (error) {

        console.error(
            "Could not save questions:",
            error
        );
    }

    updateQuestionCount();
}


function loadAttempts() {

    try {

        const saved =
            localStorage.getItem(ATTEMPTS_KEY);

        attempts =
            saved
                ? JSON.parse(saved)
                : {};

        if (
            !attempts ||
            typeof attempts !== "object"
        ) {
            attempts = {};
        }

    } catch (error) {

        console.error(
            "Attempt history error:",
            error
        );

        attempts = {};
    }
}


function saveAttempts() {

    try {

        localStorage.setItem(
            ATTEMPTS_KEY,
            JSON.stringify(attempts)
        );

    } catch (error) {

        console.error(
            "Could not save attempts:",
            error
        );
    }
}


/* =========================================================
   NAVIGATION
   ========================================================= */

function setupNavigation() {

    document.addEventListener(
        "click",
        function (event) {

            const button =
                event.target.closest(
                    "[data-action]"
                );

            if (!button) return;

            event.preventDefault();

            const action =
                button.getAttribute(
                    "data-action"
                );

            handleAction(action);
        }
    );
}


function handleAction(action) {

    console.log(
        "Action:",
        action
    );

    switch (action) {

        /* Dashboard / Home */
        case "home":
            showScreen("dashboard");
            updateDashboard();
            break;


        /* Start Quiz */
        case "start":
        case "quiz":
        case "startQuiz":
            startQuiz("all");
            break;


        /* Unseen Questions */
        case "unseen":
            startQuiz("unseen");
            break;


        /* Wrong Questions */
        case "wrong":
            startQuiz("wrong");
            break;


        /* Question Bank */
        case "bank":
            showScreen("bank");
            renderQuestionBank();
            break;


        /* Import */
        case "import":
            showScreen("import");
            break;


        /* Backup */
        case "backup":
            showScreen("backup");
            break;


        default:
            console.warn(
                "Unknown action:",
                action
            );
    }
}


/* =========================================================
   SCREEN MANAGEMENT
   ========================================================= */

function showScreen(screenName) {

    const screens =
        document.querySelectorAll(
            ".screen"
        );

    screens.forEach(
        function (screen) {

            screen.classList.remove(
                "active"
            );

            screen.style.display =
                "none";
        }
    );


    const target =
        document.getElementById(
            screenName
        );


    if (!target) {

        console.error(
            "Screen not found:",
            screenName
        );

        return;
    }


    target.classList.add(
        "active"
    );

    target.style.display =
        "block";

    window.scrollTo(
        0,
        0
    );
}


/* =========================================================
   DASHBOARD
   ========================================================= */

function updateDashboard() {

    const total =
        questions.length;

    let correct = 0;
    let wrong = 0;
    let attempted = 0;


    questions.forEach(
        function (question) {

            const record =
                attempts[
                    question.id
                ];

            if (!record) return;

            attempted++;

            if (record.correct) {
                correct++;
            } else {
                wrong++;
            }
        }
    );


    const unseen =
        total - attempted;


    const accuracy =
        attempted > 0
            ? Math.round(
                (correct / attempted) *
                100
            )
            : 0;


    setText(
        "totalStat",
        total
    );

    setText(
        "unseenStat",
        unseen
    );

    setText(
        "wrongStat",
        wrong
    );

    setText(
        "accuracyStat",
        accuracy + "%"
    );


    const summary =
        document.getElementById(
            "bankSummary"
        );


    if (summary) {

        summary.textContent =
            total +
            " question" +
            (total === 1 ? "" : "s") +
            " available for revision.";
    }
}


/* =========================================================
   QUIZ
   ========================================================= */

function setupQuiz() {

    const nextButton =
        document.getElementById(
            "nextBtn"
        );


    if (!nextButton) {
        return;
    }


    nextButton.addEventListener(
        "click",
        function () {

            if (!answered) {
                return;
            }


            if (
                currentQuestion <
                quizList.length - 1
            ) {

                currentQuestion++;

                renderQuestion();

            } else {

                showQuizResult();
            }
        }
    );
}


function startQuiz(mode) {

    let list =
        questions.slice();


    /* Unseen */
    if (mode === "unseen") {

        list =
            list.filter(
                function (question) {

                    return !attempts[
                        question.id
                    ];
                }
            );
    }


    /* Wrong */
    if (mode === "wrong") {

        list =
            list.filter(
                function (question) {

                    return (
                        attempts[
                            question.id
                        ] &&
                        attempts[
                            question.id
                        ].correct === false
                    );
                }
            );
    }


    if (list.length === 0) {

        if (mode === "unseen") {

            alert(
                "There are no unseen questions."
            );

        } else if (mode === "wrong") {

            alert(
                "There are no wrong questions."
            );

        } else {

            alert(
                "No questions are available."
            );
        }

        return;
    }


    /* Shuffle */
    list.sort(
        function () {
            return Math.random() - 0.5;
        }
    );


    quizList = list;

    currentQuestion = 0;

    score = 0;

    answered = false;


    showScreen("quiz");

    renderQuestion();
}


/* =========================================================
   DISPLAY QUESTION
   ========================================================= */

function renderQuestion() {

    if (
        !quizList ||
        quizList.length === 0
    ) {
        return;
    }


    const q =
        quizList[
            currentQuestion
        ];


    if (!q) {
        return;
    }


    answered = false;


    /* Counter */

    const counter =
        document.getElementById(
            "quizCounter"
        );


    if (counter) {

        counter.textContent =
            "Question " +
            (currentQuestion + 1) +
            " of " +
            quizList.length;
    }


    /* Progress */

    const progress =
        document.getElementById(
            "progressBar"
        );


    if (progress) {

        const percentage =
            (
                (currentQuestion + 1) /
                quizList.length
            ) * 100;

        progress.style.width =
            percentage + "%";
    }


    /* Subject */

    setText(
        "qSubject",
        q.subject || ""
    );


    /* Topic */

    setText(
        "qTopic",
        q.topic || ""
    );


    /* Question */

    setText(
        "questionText",
        q.question || ""
    );


    /* Options */

    const options =
        document.getElementById(
            "options"
        );


    if (options) {

        options.innerHTML = "";


        q.options.forEach(
            function (
                option,
                index
            ) {

                const button =
                    document.createElement(
                        "button"
                    );


                button.type =
                    "button";

                button.className =
                    "option";


                button.textContent =
                    String.fromCharCode(
                        65 + index
                    ) +
                    ". " +
                    option;


                button.addEventListener(
                    "click",
                    function () {

                        selectAnswer(
                            index
                        );
                    }
                );


                options.appendChild(
                    button
                );
            }
        );
    }


    /* Feedback */

    const feedback =
        document.getElementById(
            "feedback"
        );


    if (feedback) {

        feedback.hidden =
            true;

        feedback.innerHTML =
            "";
    }


    /* Next button */

    const nextButton =
        document.getElementById(
            "nextBtn"
        );


    if (nextButton) {

        nextButton.hidden =
            true;

        nextButton.textContent =
            currentQuestion ===
            quizList.length - 1
                ? "Finish Quiz"
                : "Next Question →";
    }
}


/* =========================================================
   ANSWER
   ========================================================= */

function selectAnswer(
    selectedIndex
) {

    if (answered) {
        return;
    }


    const q =
        quizList[
            currentQuestion
        ];


    if (!q) {
        return;
    }


    answered = true;


    const isCorrect =
        selectedIndex ===
        q.answer;


    if (isCorrect) {
        score++;
    }


    /* Save attempt */

    attempts[q.id] = {

        correct:
            isCorrect,

        selected:
            selectedIndex,

        date:
            new Date().toISOString()
    };


    saveAttempts();


    /* Colour answers */

    const buttons =
        document.querySelectorAll(
            "#options .option"
        );


    buttons.forEach(
        function (
            button,
            index
        ) {

            button.disabled =
                true;


            if (
                index ===
                q.answer
            ) {

                button.classList.add(
                    "correct"
                );
            }


            if (
                index ===
                    selectedIndex &&
                !isCorrect
            ) {

                button.classList.add(
                    "wrong"
                );
            }
        }
    );


    /* Feedback */

    const feedback =
        document.getElementById(
            "feedback"
        );


    if (feedback) {

        feedback.hidden =
            false;


        if (isCorrect) {

            feedback.innerHTML =
                "<strong>Correct!</strong><br>" +
                escapeHTML(
                    q.explanation ||
                    ""
                );

        } else {

            feedback.innerHTML =
                "<strong>Incorrect.</strong><br>" +
                "Correct answer: " +
                escapeHTML(
                    q.options[
                        q.answer
                    ]
                ) +
                "<br>" +
                escapeHTML(
                    q.explanation ||
                    ""
                );
        }
    }


    /* Show next */

    const nextButton =
        document.getElementById(
            "nextBtn"
        );


    if (nextButton) {

        nextButton.hidden =
            false;


        nextButton.textContent =
            currentQuestion ===
            quizList.length - 1
                ? "Finish Quiz"
                : "Next Question →";
    }


    updateDashboard();
}


/* =========================================================
   QUIZ RESULT
   ========================================================= */

function showQuizResult() {

    const quiz =
        document.getElementById(
            "quiz"
        );


    if (!quiz) {
        return;
    }


    const total =
        quizList.length;


    const percentage =
        total > 0
            ? Math.round(
                (score / total) *
                100
            )
            : 0;


    quiz.innerHTML = `

        <div class="card">

            <h2>Quiz Complete</h2>

            <p>
                Score:
                <strong>
                    ${score} / ${total}
                </strong>
            </p>

            <p>
                Accuracy:
                <strong>
                    ${percentage}%
                </strong>
            </p>

            <button
                id="restartQuiz"
                class="primary full">
                Restart Quiz
            </button>

            <button
                class="back"
                data-action="home">
                ‹ Dashboard
            </button>

        </div>
    `;


    const restart =
        document.getElementById(
            "restartQuiz"
        );


    if (restart) {

        restart.addEventListener(
            "click",
            function () {

                startQuiz("all");
            }
        );
    }
}


/* =========================================================
   QUESTION BANK
   ========================================================= */

function renderQuestionBank() {

    const list =
        document.getElementById(
            "bankList"
        );


    if (!list) {
        return;
    }


    const search =
        document.getElementById(
            "bankSearch"
        );


    const term =
        search
            ? search.value
                .trim()
                .toLowerCase()
            : "";


    const filtered =
        questions.filter(
            function (q) {

                return (

                    String(
                        q.id || ""
                    )
                        .toLowerCase()
                        .includes(term)

                    ||

                    String(
                        q.subject || ""
                    )
                        .toLowerCase()
                        .includes(term)

                    ||

                    String(
                        q.topic || ""
                    )
                        .toLowerCase()
                        .includes(term)

                    ||

                    String(
                        q.question || ""
                    )
                        .toLowerCase()
                        .includes(term)
                );
            }
        );


    list.innerHTML = "";


    if (filtered.length === 0) {

        list.innerHTML =
            "<p>No matching questions.</p>";

        return;
    }


    filtered.forEach(
        function (
            q,
            index
        ) {

            const card =
                document.createElement(
                    "div"
                );


            card.className =
                "card";


            let status =
                "Unseen";


            if (attempts[q.id]) {

                status =
                    attempts[q.id].correct
                        ? "Correct"
                        : "Wrong";
            }


            card.innerHTML = `

                <h3>
                    ${escapeHTML(
                        q.id ||
                        "Question " +
                        (index + 1)
                    )}
                </h3>

                <p>
                    <strong>
                        ${escapeHTML(
                            q.subject || ""
                        )}
                    </strong>
                    —
                    ${escapeHTML(
                        q.topic || ""
                    )}
                </p>

                <p>
                    ${escapeHTML(
                        q.question || ""
                    )}
                </p>

                <p>
                    <strong>Status:</strong>
                    ${status}
                </p>
            `;


            list.appendChild(
                card
            );
        }
    );
}


/* =========================================================
   SEARCH
   ========================================================= */

function setupSearch() {

    const search =
        document.getElementById(
            "bankSearch"
        );


    if (!search) {
        return;
    }


    search.addEventListener(
        "input",
        function () {

            renderQuestionBank();
        }
    );
}


/* =========================================================
   IMPORT
   ========================================================= */

function setupImport() {

    const button =
        document.getElementById(
            "importRun"
        );


    if (!button) {
        return;
    }


    button.addEventListener(
        "click",
        function () {

            const box =
                document.getElementById(
                    "importBox"
                );


            const message =
                document.getElementById(
                    "importMsg"
                );


            if (!box) {
                return;
            }


            try {

                const imported =
                    JSON.parse(
                        box.value
                    );


                if (
                    !Array.isArray(
                        imported
                    )
                ) {

                    throw new Error(
                        "JSON must contain an array."
                    );
                }


                const valid =
                    imported.filter(
                        isValidQuestion
                    );


                if (
                    valid.length === 0
                ) {

                    throw new Error(
                        "No valid questions found."
                    );
                }


                const map =
                    new Map();


                questions.forEach(
                    function (q) {

                        map.set(
                            q.id,
                            q
                        );
                    }
                );


                valid.forEach(
                    function (
                        q,
                        index
                    ) {

                        if (!q.id) {

                            q.id =
                                "IMPORTED-" +
                                Date.now() +
                                "-" +
                                index;
                        }


                        map.set(
                            q.id,
                            q
                        );
                    }
                );


                questions =
                    Array.from(
                        map.values()
                    );


                saveQuestions();

                updateDashboard();


                if (message) {

                    message.hidden =
                        false;

                    message.textContent =
                        valid.length +
                        " question(s) imported successfully. Total: " +
                        questions.length +
                        ".";
                }


            } catch (error) {

                console.error(
                    "Import error:",
                    error
                );


                if (message) {

                    message.hidden =
                        false;

                    message.textContent =
                        "Import error: " +
                        error.message;
                }
            }
        }
    );
}


function isValidQuestion(q) {

    return (

        q &&

        typeof q.question ===
            "string" &&

        Array.isArray(
            q.options
        ) &&

        q.options.length >= 2 &&

        Number.isInteger(
            q.answer
        ) &&

        q.answer >= 0 &&

        q.answer <
            q.options.length
    );
}


/* =========================================================
   BACKUP / RESTORE
   ========================================================= */

function setupBackup() {

    const exportButton =
        document.getElementById(
            "exportBtn"
        );


    if (exportButton) {

        exportButton.addEventListener(
            "click",
            exportBackup
        );
    }


    const restoreInput =
        document.getElementById(
            "restoreFile"
        );


    if (restoreInput) {

        restoreInput.addEventListener(
            "change",
            restoreBackup
        );
    }


    const resetButton =
        document.getElementById(
            "resetBtn"
        );


    if (resetButton) {

        resetButton.addEventListener(
            "click",
            function () {

                if (
                    !confirm(
                        "Reset all attempt history?"
                    )
                ) {
                    return;
                }


                attempts = {};

                saveAttempts();

                updateDashboard();


                const message =
                    document.getElementById(
                        "restoreMsg"
                    );


                if (message) {

                    message.hidden =
                        false;

                    message.textContent =
                        "Attempt history reset.";
                }
            }
        );
    }
}


function exportBackup() {

    const backup = {

        questions:
            questions,

        attempts:
            attempts
    };


    const blob =
        new Blob(
            [
                JSON.stringify(
                    backup,
                    null,
                    2
                )
            ],
            {
                type:
                    "application/json"
            }
        );


    const url =
        URL.createObjectURL(
            blob
        );


    const link =
        document.createElement(
            "a"
        );


    link.href =
        url;


    link.download =
        "upsc-mcq-backup.json";


    document.body.appendChild(
        link
    );


    link.click();


    link.remove();


    URL.revokeObjectURL(
        url
    );
}


async function restoreBackup(
    event
) {

    const file =
        event.target.files &&
        event.target.files[0];


    if (!file) {
        return;
    }


    const message =
        document.getElementById(
            "restoreMsg"
        );


    try {

        const data =
            JSON.parse(
                await file.text()
            );


        if (
            !data ||
            !Array.isArray(
                data.questions
            )
        ) {

            throw new Error(
                "Invalid backup file."
            );
        }


        questions =
            data.questions.filter(
                isValidQuestion
            );


        attempts =
            data.attempts &&
            typeof data.attempts ===
                "object"
                ? data.attempts
                : {};


        saveQuestions();

        saveAttempts();

        updateDashboard();


        if (message) {

            message.hidden =
                false;

            message.textContent =
                "Backup restored successfully. " +
                questions.length +
                " question(s) loaded.";
        }


    } catch (error) {

        console.error(
            "Restore error:",
            error
        );


        if (message) {

            message.hidden =
                false;

            message.textContent =
                "Restore error: " +
                error.message;
        }
    }


    event.target.value = "";
}


/* =========================================================
   INSTALL
   ========================================================= */

let deferredPrompt = null;


function setupInstall() {

    const installButton =
        document.getElementById(
            "installBtn"
        );


    window.addEventListener(
        "beforeinstallprompt",
        function (event) {

            event.preventDefault();

            deferredPrompt =
                event;


            if (installButton) {

                installButton.hidden =
                    false;
            }
        }
    );


    if (installButton) {

        installButton.addEventListener(
            "click",
            async function () {

                if (
                    !deferredPrompt
                ) {
                    return;
                }


                deferredPrompt.prompt();


                await deferredPrompt.userChoice;


                deferredPrompt =
                    null;


                installButton.hidden =
                    true;
            }
        );
    }
}


/* =========================================================
   HELPERS
   ========================================================= */

function updateQuestionCount() {

    document
        .querySelectorAll(
            "[data-question-count]"
        )
        .forEach(
            function (element) {

                element.textContent =
                    questions.length;
            }
        );
}


function setText(
    id,
    value
) {

    const element =
        document.getElementById(
            id
        );


    if (element) {

        element.textContent =
            value;
    }
}


function escapeHTML(value) {

    return String(value)

        .replace(
            /&/g,
            "&amp;"
        )

        .replace(
            /</g,
            "&lt;"
        )

        .replace(
            />/g,
            "&gt;"
        )

        .replace(
            /"/g,
            "&quot;"
        )

        .replace(
            /'/g,
            "&#039;"
        );
}


/* =========================================================
   ERROR REPORTING
   ========================================================= */

window.addEventListener(
    "error",
    function (event) {

        console.error(
            "UPSC MCQ JavaScript error:",
            event.error ||
            event.message
        );
    }
);


console.log(
    "UPSC MCQ Revision App — FINAL JS loaded."
);
