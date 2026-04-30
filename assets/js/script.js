// --- Game configuration ---
const TIMER_START    = 60;   // starting seconds for each game
const TIMER_PENALTY  = 5;    // seconds deducted for a wrong answer
const TIMER_INTERVAL = 1000; // ms between each timer tick (was incorrectly 3000)

// --- DOM references ---
const startButton           = document.getElementById("startButton");
const starterText           = document.getElementById("starterText");
const questionTextEl        = document.getElementById("questionText");
const optionA               = document.getElementById("optionA");
const optionB               = document.getElementById("optionB");
const optionC               = document.getElementById("optionC");
const optionD               = document.getElementById("optionD");
const timeEl                = document.getElementById("timeLeft");
const gameContentEl         = document.getElementById("gameContent");
const scorecardEl           = document.getElementById("scorecard");
const finalScoreEl          = document.getElementById("finalScoreText");
const logButtonEl           = document.getElementById("logButton");
const usersInitialsArea     = document.getElementById("userInitials");
const highScoresContainerEl      = document.getElementById("highScoresContainer");
const highScoresEl               = document.getElementById("highScores");
const questionCounterEl          = document.getElementById("questionCounter");
const missedQuestionsContainerEl = document.getElementById("missedQuestionsContainer");
const missedQuestionsListEl      = document.getElementById("missedQuestionsList");

// --- Question bank (JLPT N3 kanji — select the correct On-yomi) ---
const questionSet = [
    {
        questionText: "運",
        optionA: "ウン",
        optionB: "エン",
        optionC: "アン",
        optionD: "ウ",
        rightAnswer: "ウン"
    },
    {
        questionText: "感",
        optionA: "ケン",
        optionB: "カン",
        optionC: "コン",
        optionD: "キン",
        rightAnswer: "カン"
    },
    {
        questionText: "決",
        optionA: "ケン",
        optionB: "ゲツ",
        optionC: "ケツ",
        optionD: "キン",
        rightAnswer: "ケツ"
    },
    {
        questionText: "始",
        optionA: "ジ",
        optionB: "チ",
        optionC: "サ",
        optionD: "シ",
        rightAnswer: "シ"
    },
    {
        questionText: "形",
        optionA: "コウ",
        optionB: "カイ",
        optionC: "キョウ",
        optionD: "ケイ",
        rightAnswer: "ケイ"
    },
    {
        questionText: "号",
        optionA: "ゴウ",
        optionB: "コウ",
        optionC: "ガイ",
        optionD: "ゲン",
        rightAnswer: "ゴウ"
    },
    {
        questionText: "祭",
        optionA: "セイ",
        optionB: "ソウ",
        optionC: "サイ",
        optionD: "シ",
        rightAnswer: "サイ"
    },
    {
        questionText: "写",
        optionA: "ジャ",
        optionB: "シャ",
        optionC: "サ",
        optionD: "ショ",
        rightAnswer: "シャ"
    },
    {
        questionText: "勝",
        optionA: "シン",
        optionB: "ジョウ",
        optionC: "ソウ",
        optionD: "ショウ",
        rightAnswer: "ショウ"
    },
    {
        questionText: "集",
        optionA: "シュ",
        optionB: "シュウ",
        optionC: "ジュウ",
        optionD: "サン",
        rightAnswer: "シュウ"
    }
];

// --- Mutable game state ---
let rightAnswer;
let correctAnswers;
let userAnswer;
let secondsLeft;
let questionIndex = 0;
let timerInterval;
// Prevents endQuiz from firing twice when the timer expires mid-feedback-delay
let gameActive = false;
let missedQuestions = []; // questions the player answered incorrectly this game

// --- Answer button references (shared by the loop listener and checkAnswer) ---
const answerButtons = [optionA, optionB, optionC, optionD];
const optionKeys    = ["optionA", "optionB", "optionC", "optionD"];


// Starts the countdown timer and updates the display each second.
function countdown() {
    timeEl.textContent = "残り時間: " + secondsLeft + " 秒";
    timerInterval = setInterval(function() {
        secondsLeft--;
        timeEl.textContent = "残り時間: " + secondsLeft + " 秒";
        if (secondsLeft <= 0) {
            endQuiz();
        }
    }, TIMER_INTERVAL);
}

// Renders the current question and its options onto the page.
function askAQuestion() {
    const q = questionSet[questionIndex];
    questionTextEl.textContent    = q.questionText;
    optionA.textContent           = q.optionA;
    optionB.textContent           = q.optionB;
    optionC.textContent           = q.optionC;
    optionD.textContent           = q.optionD;
    rightAnswer                   = q.rightAnswer;
    questionCounterEl.textContent = "問題 " + (questionIndex + 1) + " / " + questionSet.length;
}

// Evaluates the selected answer, flashes green/red on the button, then advances or ends the quiz.
// Buttons are disabled for 400ms so the feedback is visible before the next question loads.
function checkAnswer(btn) {
    answerButtons.forEach(b => b.disabled = true);

    const isCorrect = userAnswer === rightAnswer;
    btn.classList.add(isCorrect ? "correct" : "wrong");

    if (isCorrect) {
        correctAnswers++;
    } else {
        // Deduct time as a penalty for a wrong answer
        secondsLeft -= TIMER_PENALTY;
        missedQuestions.push({
            questionText:  questionSet[questionIndex].questionText,
            correctAnswer: rightAnswer
        });
    }

    scorecardEl.textContent = "正解数: " + correctAnswers;

    setTimeout(() => {
        if (!gameActive) return; // timer may have ended the game during the delay
        btn.classList.remove("correct", "wrong");
        answerButtons.forEach(b => b.disabled = false);

        if (questionIndex === questionSet.length - 1) {
            endQuiz();
        } else {
            questionIndex++;
            askAQuestion();
        }
    }, 400);
}

// Initializes game state and shows the quiz UI.
function startQuiz() {
    clearInterval(timerInterval); // clear any timer left over from a previous game
    secondsLeft    = TIMER_START;
    correctAnswers = 0;
    questionIndex  = 0;
    gameActive      = true;
    missedQuestions = [];

    scorecardEl.textContent = "正解数: 0";
    answerButtons.forEach(b => b.disabled = false);

    startButton.classList.add("hidden");
    starterText.classList.add("hidden");
    gameContentEl.classList.remove("hidden");
    highScoresContainerEl.classList.add("hidden");
    logButtonEl.classList.add("hidden");
    usersInitialsArea.classList.add("hidden");
    finalScoreEl.classList.add("hidden");
    missedQuestionsContainerEl.classList.add("hidden");

    countdown();
    askAQuestion();
}

// Stops the timer and transitions to the final score screen.
function endQuiz() {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(timerInterval);
    // Reset index so the next game starts from question 1
    questionIndex = 0;

    finalScoreEl.textContent = "最終スコア：" + correctAnswers + " 問正解！";

    // Populate the missed-questions review, or hide the section if everything was correct
    missedQuestionsListEl.innerHTML = "";
    if (missedQuestions.length > 0) {
        missedQuestions.forEach(item => {
            const li = document.createElement("li");
            li.innerHTML = "<strong>" + item.questionText + "</strong><br>正解：" + item.correctAnswer;
            missedQuestionsListEl.append(li);
        });
        missedQuestionsContainerEl.classList.remove("hidden");
    }

    starterText.classList.remove("hidden");
    startButton.classList.remove("hidden");
    gameContentEl.classList.add("hidden");
    finalScoreEl.classList.remove("hidden");
    logButtonEl.classList.remove("hidden");
    usersInitialsArea.classList.remove("hidden");
}


// --- Event listeners ---

startButton.addEventListener("click", startQuiz);

// A single loop registers click handlers for all four answer buttons.
answerButtons.forEach((btn, i) => {
    btn.addEventListener("click", () => {
        userAnswer = questionSet[questionIndex][optionKeys[i]];
        checkAnswer(btn);
    });
});

// Saves the player's initials and score to localStorage, then shows the leaderboard.
logButtonEl.addEventListener("click", function() {
    const userInitials = usersInitialsArea.value.trim();
    if (userInitials.length === 0) return; // don't save blank entries

    const userLog = JSON.parse(localStorage.getItem("userScores")) || [];
    userLog.push({ initials: userInitials, score: correctAnswers });
    localStorage.setItem("userScores", JSON.stringify(userLog));

    displayHighScores();
});

// Renders the saved leaderboard from localStorage.
function displayHighScores() {
    logButtonEl.classList.add("hidden");
    usersInitialsArea.classList.add("hidden");
    highScoresContainerEl.classList.remove("hidden");

    // Clear existing list items to prevent duplicates on repeat calls
    highScoresEl.innerHTML = "";

    const userLog = JSON.parse(localStorage.getItem("userScores")) || [];
    userLog.forEach(entry => {
        const listItem = document.createElement("li");
        listItem.innerText = entry.initials + " : " + entry.score;
        highScoresEl.append(listItem);
    });
}
