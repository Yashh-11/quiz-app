
// ==============================
// QUIZ DATA
// ==============================
const quizData = [
    {
        question: "Which language is primarily used to style web pages?",
        options: ["HTML", "CSS", "Java", "C"],
        correctIndex: 1
    },
    {
        question: "Which of the following is NOT a JavaScript data type?",
        options: ["Number", "Boolean", "Character", "Undefined"],
        correctIndex: 2
    },
    {
        question: "Which method is used to print something in the browser console?",
        options: [
            "print()",
            "console.print()",
            "console.log()",
            "log.console()"
        ],
        correctIndex: 2
    },
    {
        question: "Which HTML tag is used to include JavaScript?",
        options: ["<js>", "<javascript>", "<script>", "<code>"],
        correctIndex: 2
    },
    {
        question: "In CSS, which symbol is used to select a class?",
        options: ["#", ".", "*", "&"],
        correctIndex: 1
    }
];

// ==============================
// DOM ELEMENTS
// ==============================
const questionText = document.getElementById("questionText");
const questionNumber = document.getElementById("questionNumber");
const optionsContainer = document.getElementById("optionsContainer");
const nextBtn = document.getElementById("nextBtn");
const restartBtn = document.getElementById("restartBtn");
const scoreInfo = document.getElementById("scoreInfo");
const scoreBadge = document.getElementById("scoreBadge");
const resultText = document.getElementById("resultText");
const consoleBox = document.getElementById("consoleBox");
const confettiContainer = document.getElementById("confettiContainer");
const timerText = document.getElementById("timerText");
const timerBadge = document.getElementById("timerBadge");

// ==============================
// STATE
// ==============================
let currentQuestionIndex = 0;
let score = 0;
let selectedOptionIndex = null;
let timerInterval = null;
let timeLeft = 30;

// ==============================
// HELPERS
// ==============================
function logToConsole(message, type = "info") {
    const line = document.createElement("div");
    line.className = "dev-console-line";
    const prefix = document.createElement("span");
    prefix.className = "prefix";
    prefix.textContent = "dev@quiz:~$ ";
    const msgSpan = document.createElement("span");

    if (type === "error") {
        msgSpan.className = "error";
    }

    msgSpan.textContent = message;
    line.appendChild(prefix);
    line.appendChild(msgSpan);
    consoleBox.appendChild(line);

    consoleBox.scrollTop = consoleBox.scrollHeight;
}

function clearTimer() {
    if (timerInterval) {
        clearInterval(timerInterval);
        timerInterval = null;
    }
}

function startTimer() {
    clearTimer();
    timeLeft = 30;
    timerText.textContent = timeLeft + "s";
    timerBadge.classList.remove("timer-danger");

    timerInterval = setInterval(() => {
        timeLeft--;
        if (timeLeft < 0) return; // safety

        timerText.textContent = timeLeft + "s";

        if (timeLeft <= 5) {
            timerBadge.classList.add("timer-danger");
        }

        if (timeLeft === 0) {
            clearTimer();
            handleTimeUp();
        }
    }, 1000);
}

// Confetti / fireworks effect
function triggerConfetti() {
    confettiContainer.innerHTML = "";
    const colors = ["#22c55e", "#38bdf8", "#eab308", "#f97316", "#f97373"];

    const pieces = 90;
    for (let i = 0; i < pieces; i++) {
        const piece = document.createElement("div");
        piece.className = "confetti-piece";

        const color = colors[Math.floor(Math.random() * colors.length)];
        piece.style.backgroundColor = color;
        piece.style.left = Math.random() * 100 + "%";
        piece.style.top = (Math.random() * 10 - 10) + "%";
        piece.style.animationDuration = (2 + Math.random() * 1.5) + "s";
        piece.style.animationDelay = (Math.random() * 0.5) + "s";

        confettiContainer.appendChild(piece);
    }

    setTimeout(() => {
        confettiContainer.innerHTML = "";
    }, 4000);

    logToConsole('console.log("Party mode: true 🧨")');
}

// ==============================
// RENDER QUESTION
// ==============================
function loadQuestion() {
    const currentQuestion = quizData[currentQuestionIndex];

    // Question + meta
    questionText.textContent = currentQuestion.question;
    questionNumber.textContent =
        currentQuestionIndex + 1 + " / " + quizData.length;

    // Reset state
    optionsContainer.innerHTML = "";
    selectedOptionIndex = null;
    nextBtn.disabled = true;

    // Hide scoreboard if visible (for restart case)
    resultText.classList.remove("show");
    resultText.style.display = "none";
    resultText.innerHTML = "";

    // Generate options
    currentQuestion.options.forEach((option, index) => {
        const btn = document.createElement("button");
        btn.className = "dev-option-btn";
        btn.textContent = option;

        const keySpan = document.createElement("span");
        keySpan.className = "dev-option-key";
        keySpan.textContent = "opt[" + index + "]";
        btn.prepend(keySpan);

        btn.addEventListener("click", () => handleOptionClick(index, btn));
        optionsContainer.appendChild(btn);
    });

    startTimer();

    logToConsole(
        `loadedQuestion(${currentQuestionIndex}) // "${currentQuestion.question}"`
    );
}

// ==============================
// TIME UP HANDLER
// ==============================
function handleTimeUp() {
    if (selectedOptionIndex !== null) return; // already answered

    const currentQuestion = quizData[currentQuestionIndex];
    const allButtons = document.querySelectorAll(".dev-option-btn");

    allButtons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === currentQuestion.correctIndex) {
            btn.classList.add("correct");
        }
    });

    logToConsole('console.error("Time up ⏱ Unattempted")', "error");

    // Mark as unattempted -> same as incorrect (no score increment)
    nextBtn.disabled = false;
}

// ==============================
// OPTION CLICK HANDLER
// ==============================
function handleOptionClick(index, button) {
    if (selectedOptionIndex !== null) return; // already answered

    selectedOptionIndex = index;
    clearTimer();

    const currentQuestion = quizData[currentQuestionIndex];
    const allButtons = document.querySelectorAll(".dev-option-btn");

    allButtons.forEach((btn, i) => {
        btn.disabled = true;
        if (i === currentQuestion.correctIndex) {
            btn.classList.add("correct");
        } else if (i === index && index !== currentQuestion.correctIndex) {
            btn.classList.add("wrong");
        }
    });

    if (index === currentQuestion.correctIndex) {
        score++;
        scoreInfo.textContent = score;

        // pulse effect on score badge
        scoreBadge.classList.remove("score-badge-pulse");
        void scoreBadge.offsetWidth; // restart animation
        scoreBadge.classList.add("score-badge-pulse");

        logToConsole('console.log("Correct ✅")');
    } else {
        logToConsole('console.error("Wrong ❌")', "error");
    }

    nextBtn.disabled = false;
}

// ==============================
// FINAL RESULT
// ==============================
function showFinalResult() {
    clearTimer();
    questionText.textContent = "Quiz Completed ✅";
    optionsContainer.innerHTML = "";

    const total = quizData.length;
    const performance =
        score === total
            ? "Perfect score. Ship it! 🚀"
            : score >= total / 2
                ? "Nice work. Keep committing code!"
                : "It's fine, even senior devs Google stuff. Try again 😉";

    const percentage = Math.round((score / total) * 100);

    resultText.innerHTML = `
        <div class="scoreboard-header">
          <div class="score-circle">
            <div>${score}/${total}</div>
            <span class="total">${percentage}%</span>
          </div>
          <div>
            <div class="score-main-text">Scoreboard ready ✅</div>
            <div class="score-sub-text">${performance}</div>
          </div>
        </div>
        <div class="score-meta-row">
          <div class="score-meta-pill">
            <span class="label">correct</span>
            <span>${score}</span>
          </div>
          <div class="score-meta-pill">
            <span class="label">incorrect+unattempted</span>
            <span>${total - score}</span>
          </div>
        </div>
      `;

    resultText.style.display = "block";
    requestAnimationFrame(() => {
        resultText.classList.add("show");
    });

    // Fireworks / confetti when scoreboard shows
    triggerConfetti();

    nextBtn.style.display = "none";
    restartBtn.style.display = "inline-block";

    logToConsole(
        `quizFinished({ score: ${score}, total: ${total}, percentage: ${percentage} })`
    );
}

// ==============================
// NEXT BUTTON HANDLER
// ==============================
function handleNext() {
    clearTimer();
    currentQuestionIndex++;
    if (currentQuestionIndex < quizData.length) {
        loadQuestion();
    } else {
        showFinalResult();
    }
}

// ==============================
// RESTART
// ==============================
function restartQuiz() {
    clearTimer();
    currentQuestionIndex = 0;
    score = 0;
    scoreInfo.textContent = "0";
    nextBtn.style.display = "inline-block";
    restartBtn.style.display = "none";
    consoleBox.innerHTML = "";
    logToConsole('console.log("Quiz reset()")');
    loadQuestion();
}

// ==============================
// EVENT LISTENERS
// ==============================
nextBtn.addEventListener("click", handleNext);
restartBtn.addEventListener("click", restartQuiz);

// ==============================
// INIT
// ==============================
loadQuestion();