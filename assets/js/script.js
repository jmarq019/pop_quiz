// ============================================================
// N3 漢字クイズ — Genkō Yōshi Edition
// ============================================================

// --- Game configuration ---
const TIMER_START    = 60;
const TIMER_PENALTY  = 5;
const TIMER_INTERVAL = 1000;
const TIMER_CIRC     = 226.19;            // 2π·36 (full circle for r=36)
const FEEDBACK_DELAY = 800;
const STORAGE_KEY    = "n3_kanji_scores_v2";
const TWEAKS_KEY     = "n3_kanji_tweaks";

// --- Question bank ---
const questionSet = [
    { kanji: "運", options: ["ウン","エン","アン","ウ"],       answer: "ウン"  },
    { kanji: "感", options: ["ケン","カン","コン","キン"],     answer: "カン"  },
    { kanji: "決", options: ["ケン","ゲツ","ケツ","キン"],     answer: "ケツ"  },
    { kanji: "始", options: ["ジ","チ","サ","シ"],            answer: "シ"    },
    { kanji: "形", options: ["コウ","カイ","キョウ","ケイ"],   answer: "ケイ"  },
    { kanji: "号", options: ["ゴウ","コウ","ガイ","ゲン"],     answer: "ゴウ"  },
    { kanji: "祭", options: ["セイ","ソウ","サイ","シ"],       answer: "サイ"  },
    { kanji: "写", options: ["ジャ","シャ","サ","ショ"],       answer: "シャ"  },
    { kanji: "勝", options: ["シン","ジョウ","ソウ","ショウ"], answer: "ショウ" },
    { kanji: "集", options: ["シュ","シュウ","ジュウ","サン"],    answer: "シュウ" },
    { kanji: "港", options: ["ゴウ","ホウ","ソウ","コウ"],       answer: "コウ"   },
    { kanji: "式", options: ["ジキ","セキ","チキ","シキ"],       answer: "シキ"   },
    { kanji: "役", options: ["ガク","ラク","バク","ヤク"],       answer: "ヤク"   },
    { kanji: "末", options: ["バツ","ハツ","サツ","マツ"],       answer: "マツ"   },
    { kanji: "橋", options: ["コウ","ギョウ","ケイ","キョウ"],   answer: "キョウ" }
];

// --- DOM refs ---
const $ = (id) => document.getElementById(id);
const startScreen    = $("startScreen");
const startButton    = $("startButton");
const game           = $("game");
const endSection     = $("end");
const kanjiEl        = $("kanji");
const hankoEl        = $("hanko");
const answersEl      = $("answers");
const answerBtns     = () => Array.from(answersEl.querySelectorAll(".answer"));
const scoreNum       = $("scoreNum");
const timerNum       = $("timerNum");
const timerFill      = $("timerFill");
const timerEl        = $("timer");
const progressEl     = $("progress");
const counterEl      = $("questionCounter");
const questionRegion = $("questionRegion");
const finalScore     = $("finalScore");
const endTitle       = $("endTitle");
const missedSection  = $("missedSection");
const missedList     = $("missedList");
const logSection     = $("logSection");
const logButton      = $("logButton");
const userInitials   = $("userInitials");
const scoresSection  = $("scoresSection");
const scoresBody     = $("scoresBody");
const restartButton  = $("restartButton");
const pageNumEl      = $("pageNum");

// --- State ---
let secondsLeft, correctAnswers, questionIndex, timerInterval, gameActive;
let missedQuestions = [];
let answeredFlags   = []; // per-question result: 'done' | 'miss' | null

// =========================================================
// Progress dots
// =========================================================
function buildProgress() {
    progressEl.innerHTML = "";
    for (let i = 0; i < questionSet.length; i++) {
        const dot = document.createElement("span");
        dot.className = "dot";
        progressEl.appendChild(dot);
    }
}
function updateProgress() {
    const dots = progressEl.children;
    for (let i = 0; i < dots.length; i++) {
        const d = dots[i];
        d.className = "dot";
        if (answeredFlags[i] === "done") d.classList.add("done");
        else if (answeredFlags[i] === "miss") d.classList.add("miss");
        if (i === questionIndex && gameActive) d.classList.add("current");
    }
}

// =========================================================
// Timer
// =========================================================
function paintTimer() {
    timerNum.textContent = secondsLeft;
    const pct = Math.max(0, secondsLeft) / TIMER_START;
    timerFill.style.strokeDashoffset = TIMER_CIRC * (1 - pct);
    if (secondsLeft <= 10) timerEl.classList.add("warn");
    else timerEl.classList.remove("warn");
}
function startTimer() {
    paintTimer();
    timerInterval = setInterval(() => {
        secondsLeft--;
        paintTimer();
        if (secondsLeft <= 0) {
            secondsLeft = 0;
            paintTimer();
            endQuiz();
        }
    }, TIMER_INTERVAL);
}

// =========================================================
// Question rendering
// =========================================================
const KEY_GLYPHS = ["甲","乙","丙","丁"]; // traditional A/B/C/D

function renderQuestion() {
    const q = questionSet[questionIndex];
    kanjiEl.textContent = q.kanji;
    counterEl.textContent = `Q ${String(questionIndex + 1).padStart(2,"0")} / ${String(questionSet.length).padStart(2,"0")}`;

    const btns = answerBtns();
    btns.forEach((btn, i) => {
        btn.disabled = false;
        btn.classList.remove("correct","wrong","reveal");
        btn.querySelector('[data-role="reading"]').textContent = q.options[i];
        btn.querySelector(".key").textContent = KEY_GLYPHS[i];
        btn.dataset.value = q.options[i];
    });

    // Re-trigger ink-reveal animation on each new question
    kanjiEl.style.animation = "none";
    void kanjiEl.offsetWidth;
    kanjiEl.style.animation = "";

    updateProgress();
}

function flipToNext() {
    questionRegion.classList.add("flipping");
    setTimeout(() => {
        questionIndex++;
        renderQuestion();
        questionRegion.classList.remove("flipping");
    }, 275);
}

// =========================================================
// Answer handling
// =========================================================
function handleAnswer(btn) {
    if (!gameActive) return;
    const btns = answerBtns();
    btns.forEach(b => b.disabled = true);

    const q = questionSet[questionIndex];
    const chosen = btn.dataset.value;
    const isCorrect = chosen === q.answer;

    if (isCorrect) {
        btn.classList.add("correct");
        correctAnswers++;
        answeredFlags[questionIndex] = "done";
        scoreNum.textContent = correctAnswers;
        // Hanko stamp animation
        hankoEl.classList.remove("stamped");
        void hankoEl.offsetWidth;
        hankoEl.classList.add("stamped");
        setTimeout(() => hankoEl.classList.remove("stamped"), 1200);
    } else {
        btn.classList.add("wrong");
        answeredFlags[questionIndex] = "miss";
        secondsLeft = Math.max(0, secondsLeft - TIMER_PENALTY);
        paintTimer();
        missedQuestions.push({ kanji: q.kanji, answer: q.answer });
        // Reveal the correct answer
        btns.forEach(b => {
            if (b.dataset.value === q.answer) b.classList.add("reveal");
        });
    }

    updateProgress();

    setTimeout(() => {
        if (!gameActive) return;
        if (questionIndex === questionSet.length - 1) {
            endQuiz();
        } else {
            flipToNext();
        }
    }, FEEDBACK_DELAY);
}

answersEl.addEventListener("click", (e) => {
    const btn = e.target.closest(".answer");
    if (btn && !btn.disabled) handleAnswer(btn);
});

// =========================================================
// Lifecycle
// =========================================================
function startQuiz() {
    clearInterval(timerInterval);
    secondsLeft     = TIMER_START;
    correctAnswers  = 0;
    questionIndex   = 0;
    gameActive      = true;
    missedQuestions = [];
    answeredFlags   = new Array(questionSet.length).fill(null);

    scoreNum.textContent = "0";
    timerEl.classList.remove("warn");

    startScreen.classList.add("hidden");
    endSection.classList.remove("active");
    game.classList.add("active");
    scoresSection.classList.add("hidden");

    buildProgress();
    paintTimer();
    renderQuestion();
    startTimer();
}

function endQuiz() {
    if (!gameActive) return;
    gameActive = false;
    clearInterval(timerInterval);

    game.classList.remove("active");
    endSection.classList.add("active");

    finalScore.textContent = correctAnswers;
    endTitle.textContent =
        correctAnswers === questionSet.length ? "満点！見事です。" :
        correctAnswers >= 7  ? "よく出来ました。"      :
        correctAnswers >= 4  ? "もう一歩。"            :
                                "練習を続けましょう。";

    // Missed questions review
    missedList.innerHTML = "";
    if (missedQuestions.length > 0) {
        missedQuestions.forEach(m => {
            const li = document.createElement("li");
            li.innerHTML = `
                <span class="m-label">Correct</span>
                <span class="m-kanji">${m.kanji}</span>
                <span class="m-reading">${m.answer}</span>`;
            missedList.appendChild(li);
        });
        missedSection.classList.remove("hidden");
    } else {
        missedSection.classList.add("hidden");
    }

    logSection.classList.remove("hidden");
    userInitials.value = "";
    userInitials.focus();
}

// =========================================================
// Leaderboard
// =========================================================
function fmtDate(ts) {
    const d = new Date(ts);
    const m = String(d.getMonth() + 1).padStart(2,"0");
    const day = String(d.getDate()).padStart(2,"0");
    return `${d.getFullYear()}.${m}.${day}`;
}

function loadScores() {
    try {
        const raw = JSON.parse(localStorage.getItem(STORAGE_KEY)) || [];
        return raw.map(e => ({
            initials: e.initials || "???",
            score:    Number(e.score) || 0,
            total:    Number(e.total) || 10,
            date:     Number(e.date)  || Date.now()
        }));
    } catch(e) { return []; }
}

function saveScore(initials) {
    const log = loadScores();
    log.push({
        initials: initials.toUpperCase().slice(0,3),
        score:    correctAnswers,
        total:    questionSet.length,
        date:     Date.now()
    });
    localStorage.setItem(STORAGE_KEY, JSON.stringify(log));
}

function renderScores() {
    const log = loadScores()
        .sort((a, b) => b.score - a.score || a.date - b.date)
        .slice(0, 10);

    scoresBody.innerHTML = "";
    if (log.length === 0) {
        const tr = document.createElement("tr");
        tr.innerHTML = `<td colspan="4" class="scores-empty">まだ記録がありません。</td>`;
        scoresBody.appendChild(tr);
    } else {
        log.forEach((entry, i) => {
            const tr = document.createElement("tr");
            tr.innerHTML = `
                <td class="rank">${i + 1}</td>
                <td class="initials">${entry.initials}</td>
                <td class="score">${entry.score}<span style="color:var(--sumi-soft);font-size:.7em">/${entry.total}</span></td>
                <td class="date">${fmtDate(entry.date)}</td>`;
            scoresBody.appendChild(tr);
        });
    }
    scoresSection.classList.remove("hidden");
}

logButton.addEventListener("click", () => {
    const v = userInitials.value.trim();
    if (!v) { userInitials.focus(); return; }
    saveScore(v);
    logSection.classList.add("hidden");
    renderScores();
});

userInitials.addEventListener("keydown", (e) => {
    if (e.key === "Enter") logButton.click();
});

restartButton.addEventListener("click", () => {
    endSection.classList.remove("active");
    startScreen.classList.remove("hidden");
});

startButton.addEventListener("click", startQuiz);

// =========================================================
// Tweaks panel
// =========================================================
const tweaksFab   = $("tweaksFab");
const tweaksPanel = $("tweaksPanel");
const tweaksClose = $("tweaksClose");

function loadTweaks() {
    try { return JSON.parse(localStorage.getItem(TWEAKS_KEY)) || {}; }
    catch(e) { return {}; }
}
function saveTweaks(t) {
    localStorage.setItem(TWEAKS_KEY, JSON.stringify(t));
}
function applyTweak(key, value) {
    const attr = ({ aesthetic: "data-aesthetic", theme: "data-theme", ornaments: "data-ornaments" })[key];
    if (!attr) return;
    document.documentElement.setAttribute(attr, value);
    document.querySelectorAll(`.tweak-segment[data-tweak="${key}"] button`).forEach(b => {
        b.classList.toggle("active", b.dataset.value === value);
    });
}
function initTweaks() {
    const t = loadTweaks();
    if (t.aesthetic) applyTweak("aesthetic", t.aesthetic);
    if (t.theme)     applyTweak("theme", t.theme);
    if (t.ornaments) applyTweak("ornaments", t.ornaments);
}

document.querySelectorAll(".tweak-segment").forEach(seg => {
    seg.addEventListener("click", (e) => {
        const btn = e.target.closest("button");
        if (!btn) return;
        const key   = seg.dataset.tweak;
        const value = btn.dataset.value;
        applyTweak(key, value);
        const t = loadTweaks();
        t[key] = value;
        saveTweaks(t);
    });
});

tweaksFab.addEventListener("click", () => {
    tweaksPanel.classList.add("open");
    tweaksFab.style.display = "none";
});
tweaksClose.addEventListener("click", () => {
    tweaksPanel.classList.remove("open");
    tweaksFab.style.display = "";
});

initTweaks();
buildProgress();
