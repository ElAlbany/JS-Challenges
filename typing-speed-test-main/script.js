// DOM elements
const diff1 = document.querySelector("#difficulty1");
const ccombo1 = diff1.closest(".custom-combo");
const dropdownmenu1 = ccombo1.querySelector(".dropdown-menu");
const diff2 = document.querySelector("#difficulty2");
const ccombo2 = diff2.closest(".custom-combo");
const dropdownmenu2 = ccombo2.querySelector(".dropdown-menu");
const options = document.querySelectorAll(".option");
const restartBtn = document.querySelector(".restart");
const textContainer = document.querySelector(".text-container");
const textDiv = document.querySelector(".text");
const startOverlay = document.querySelector(".start-test");
const bestScoreSpan = document.querySelector("#best-score-number");
const wpmSpan = document.querySelector("#wpn-number");
const accuracySpan = document.querySelector("#accuracy");
const timeSpan = document.querySelector("#time");

// Data storage
let easyTexts = [];
let mediumTexts = [];
let hardTexts = [];
let easyIndex = 0;
let mediumIndex = 0;
let hardIndex = 0;
let currentDifficulty = "easy";

// Typing test state
let referenceChars = [];
let charSpans = [];
let currentIndex = 0;
let testActive = false;
let timerInterval = null;
let startTime = null;
let timerMode = "timed";
let timeLimit = 60;
let timeRemaining = 60;
let bestScore = null;
let correctCount = 0;
let totalTyped = 0;
let totalCompletedWords = 0;
let wordBoundaries = [];

let hiddenInput = null;
let testCompletedSuccess = false;

bestScoreSpan.textContent = "";

function computeWordBoundaries() {
  wordBoundaries = [];
  let wordStart = 0;
  for (let i = 0; i < referenceChars.length; i++) {
    if (referenceChars[i] === " ") {
      wordBoundaries.push({ start: wordStart, end: i - 1 });
      wordStart = i + 1;
    }
  }
  if (wordStart < referenceChars.length) {
    wordBoundaries.push({ start: wordStart, end: referenceChars.length - 1 });
  }
}

function updateTotalCompletedWords() {
  let completed = 0;
  for (let word of wordBoundaries) {
    const isLastWord = word.end === referenceChars.length - 1;
    if (isLastWord) {
      if (currentIndex > word.end) completed++;
    } else {
      if (currentIndex > word.end + 1) completed++;
    }
  }
  totalCompletedWords = completed;
}

function resetStatsColors() {
  accuracySpan.style.color = "white";
  timeSpan.style.color = "white";
}

function updateColorStats() {
  if (!testActive) return;
  const accuracy = totalTyped > 0 ? (correctCount / totalTyped) * 100 : 100;
  if (accuracy >= 90) {
    accuracySpan.style.color = "hsl(140, 63%, 57%)";
  } else if (accuracy >= 70) {
    accuracySpan.style.color = "hsl(49, 85%, 70%)";
  } else {
    accuracySpan.style.color = "hsl(354, 63%, 57%)";
  }
  if (timerMode === "timed" && timeRemaining <= 10) {
    timeSpan.style.color = "hsl(354, 63%, 57%)";
  } else {
    timeSpan.style.color = "hsl(49, 85%, 70%)";
  }
}

function updateStats() {
  if (!testActive) return;

  let elapsedSeconds = 0;
  if (timerMode === "timed") {
    elapsedSeconds = timeLimit - timeRemaining;
  } else {
    if (startTime) elapsedSeconds = Math.floor((Date.now() - startTime) / 1000);
  }

  if (timerMode === "timed") {
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
    if (timeRemaining <= 0) {
      endTest(false);
      return;
    }
  } else {
    const minutes = Math.floor(elapsedSeconds / 60);
    const seconds = elapsedSeconds % 60;
    timeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  }

  const accuracy = totalTyped > 0 ? (correctCount / totalTyped) * 100 : 100;
  accuracySpan.textContent = `${Math.floor(accuracy)}%`;
  wpmSpan.textContent = totalCompletedWords;

  updateColorStats();

  if (currentIndex >= referenceChars.length) {
    endTest(true);
  }
}

function endTest(success) {
  if (!testActive) return;
  testActive = false;
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  if (hiddenInput) {
    hiddenInput.blur();
    hiddenInput.disabled = true;
  }

  let finalWPM = totalCompletedWords;
  if (success) {
    if (bestScore === null || finalWPM > bestScore) {
      bestScore = finalWPM;
      bestScoreSpan.textContent = bestScore;
    }
    testCompletedSuccess = true;
  }

  restartBtn.classList.remove("hide");
  startOverlay.classList.add("hide");
  textDiv.classList.remove("filter");
}

function loadNextPassageAndReset() {
  if (currentDifficulty === "easy" && easyTexts.length) {
    easyIndex = (easyIndex + 1) % easyTexts.length;
    buildCharacterSpans(easyTexts[easyIndex]);
  } else if (currentDifficulty === "medium" && mediumTexts.length) {
    mediumIndex = (mediumIndex + 1) % mediumTexts.length;
    buildCharacterSpans(mediumTexts[mediumIndex]);
  } else if (currentDifficulty === "hard" && hardTexts.length) {
    hardIndex = (hardIndex + 1) % hardTexts.length;
    buildCharacterSpans(hardTexts[hardIndex]);
  }
  fullReset();
}

function fullReset() {
  if (timerInterval) clearInterval(timerInterval);
  timerInterval = null;
  testActive = false;
  currentIndex = 0;
  correctCount = 0;
  totalTyped = 0;
  totalCompletedWords = 0;
  testCompletedSuccess = false;

  if (charSpans.length > 0) {
    charSpans.forEach((span, idx) => {
      span.className = "char pending";
      span.textContent =
        referenceChars[idx] === " " ? "\u00A0" : referenceChars[idx];
    });
  }

  wpmSpan.textContent = "0";
  accuracySpan.textContent = "100%";
  resetStatsColors();

  if (timerMode === "timed") {
    timeRemaining = timeLimit;
    const minutes = Math.floor(timeRemaining / 60);
    const seconds = timeRemaining % 60;
    timeSpan.textContent = `${minutes}:${seconds.toString().padStart(2, "0")}`;
  } else {
    timeSpan.textContent = "0:00";
  }
  timeSpan.style.color = "white";

  textDiv.classList.add("filter");
  startOverlay.classList.remove("hide");
  restartBtn.classList.add("hide");

  if (hiddenInput) {
    hiddenInput.value = "";
    hiddenInput.disabled = false;
  }
}

// SIMPLIFIED RESTART: ALWAYS LOAD NEXT PASSAGE
function handleRestart() {
  loadNextPassageAndReset();
}

function startTest() {
  if (testActive) return;
  testActive = true;
  startTime = Date.now();
  currentIndex = 0;
  correctCount = 0;
  totalTyped = 0;
  totalCompletedWords = 0;

  charSpans.forEach((span) => (span.className = "char pending"));

  if (timerMode === "timed") {
    timeRemaining = timeLimit;
    timerInterval = setInterval(() => {
      if (!testActive) return;
      if (timeRemaining > 0) {
        timeRemaining--;
        updateStats();
      } else {
        endTest(false);
      }
    }, 1000);
  } else {
    timerInterval = setInterval(() => {
      if (testActive) updateStats();
    }, 1000);
  }

  updateStats();
  textDiv.classList.remove("filter");
  startOverlay.classList.add("hide");
  restartBtn.classList.remove("hide");

  if (hiddenInput) {
    hiddenInput.value = "";
    hiddenInput.disabled = false;
    hiddenInput.focus();
  }
}

function processChar(typedChar) {
  if (!testActive) return false;
  if (currentIndex >= referenceChars.length) return false;

  const expectedChar = referenceChars[currentIndex];
  const isCorrect = typedChar === expectedChar;

  if (isCorrect) {
    charSpans[currentIndex].className = "char correct";
    correctCount++;
  } else {
    charSpans[currentIndex].className = "char incorrect";
  }

  totalTyped++;
  currentIndex++;
  updateTotalCompletedWords();
  updateStats();
  return true;
}

function handleBackspace() {
  if (!testActive) return;
  if (currentIndex <= 0) return;

  currentIndex--;
  charSpans[currentIndex].className = "char pending";
  updateTotalCompletedWords();
  updateStats();
}

function buildCharacterSpans(passage) {
  if (!passage || passage.length === 0) {
    textDiv.innerHTML = "<p>Error loading text. Please refresh.</p>";
    return;
  }

  textDiv.innerHTML = "";
  referenceChars = passage.split("");
  charSpans = [];

  const tokens = passage.split(/(\s+)/);
  for (let token of tokens) {
    if (token.match(/\s/)) {
      for (let ch of token) {
        const span = document.createElement("span");
        span.className = "char pending";
        span.textContent = ch === " " ? "\u00A0" : ch;
        textDiv.appendChild(span);
        charSpans.push(span);
      }
    } else {
      const wordSpan = document.createElement("span");
      wordSpan.className = "word";
      for (let ch of token) {
        const charSpan = document.createElement("span");
        charSpan.className = "char pending";
        charSpan.textContent = ch;
        wordSpan.appendChild(charSpan);
        charSpans.push(charSpan);
      }
      textDiv.appendChild(wordSpan);
    }
  }

  computeWordBoundaries();
  fullReset();
}

function updateText(difficulty) {
  currentDifficulty = difficulty;
  let passage = "";
  if (difficulty === "easy" && easyTexts.length) {
    passage = easyTexts[easyIndex % easyTexts.length];
  } else if (difficulty === "medium" && mediumTexts.length) {
    passage = mediumTexts[mediumIndex % mediumTexts.length];
  } else if (difficulty === "hard" && hardTexts.length) {
    passage = hardTexts[hardIndex % hardTexts.length];
  } else {
    return;
  }
  buildCharacterSpans(passage);
}

function createHiddenInput() {
  if (hiddenInput) return;
  hiddenInput = document.createElement("input");
  hiddenInput.type = "text";
  hiddenInput.style.position = "fixed";
  hiddenInput.style.top = "-100px";
  hiddenInput.style.left = "-100px";
  hiddenInput.style.opacity = "0";
  hiddenInput.style.pointerEvents = "none";
  document.body.appendChild(hiddenInput);

  hiddenInput.addEventListener("input", (e) => {
    if (!testActive) return;
    const value = hiddenInput.value;
    if (value.length > 0) {
      const lastChar = value[value.length - 1];
      processChar(lastChar);
      hiddenInput.value = "";
    }
  });

  hiddenInput.addEventListener("keydown", (e) => {
    if (!testActive) return;
    if (e.key === "Backspace" || e.key === "Delete") {
      e.preventDefault();
      handleBackspace();
    }
  });
}

window.onload = function () {
  createHiddenInput();
  textDiv.contentEditable = "false";
  textDiv.setAttribute("contenteditable", "false");

  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      easyTexts = data.easy.map((item) => item.text);
      mediumTexts = data.medium.map((item) => item.text);
      hardTexts = data.hard.map((item) => item.text);
      updateText("easy");
    })
    .catch((err) => {
      console.error("Failed to load data.json", err);
      textDiv.innerHTML = "<p>Error loading texts. Check console.</p>";
    });
};

// Dropdown and UI listeners
diff1.addEventListener("click", () => {
  if (restartBtn.classList.contains("hide")) {
    if (dropdownmenu2.classList.contains("open"))
      dropdownmenu2.classList.remove("open");
    dropdownmenu1.classList.toggle("open");
  }
});
diff2.addEventListener("click", () => {
  if (restartBtn.classList.contains("hide")) {
    if (dropdownmenu1.classList.contains("open"))
      dropdownmenu1.classList.remove("open");
    dropdownmenu2.classList.toggle("open");
  }
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    const optionValue = option.querySelector(".option-value");
    const parentCombo = option.closest(".custom-combo");
    const difficultyText = parentCombo.querySelector(".difficulty-value");
    const dropdownmenu = parentCombo.querySelector(".dropdown-menu");
    const currentOptions = dropdownmenu.querySelectorAll(".option");
    currentOptions.forEach((opt) => opt.classList.remove("selected"));
    option.classList.add("selected");
    const newValue = optionValue.textContent.trim();
    difficultyText.textContent = newValue;
    dropdownmenu.classList.remove("open");
    if (parentCombo.id === "combo1") {
      if (newValue.toLowerCase() === "easy") {
        currentDifficulty = "easy";
        updateText("easy");
      } else if (newValue.toLowerCase() === "medium") {
        currentDifficulty = "medium";
        updateText("medium");
      } else if (newValue.toLowerCase() === "hard") {
        currentDifficulty = "hard";
        updateText("hard");
      }
    } else if (parentCombo.id === "combo2") {
      if (newValue === "Timed (60s)") {
        timerMode = "timed";
        timeLimit = 60;
        timeRemaining = 60;
      } else {
        timerMode = "passage";
      }
      fullReset();
    }
  });
});

document.addEventListener("click", (event) => {
  if (!event.target.closest(".custom-combo")) {
    if (dropdownmenu1.classList.contains("open"))
      dropdownmenu1.classList.remove("open");
    if (dropdownmenu2.classList.contains("open"))
      dropdownmenu2.classList.remove("open");
  }
});

const startBtn = document.querySelector(".start-btn");
startBtn.addEventListener("click", () => {
  if (restartBtn.classList.contains("hide")) startTest();
});

textContainer.addEventListener("click", () => {
  if (!testActive && startOverlay && !startOverlay.classList.contains("hide")) {
    startTest();
  } else if (testActive && hiddenInput) {
    hiddenInput.focus();
  }
});

restartBtn.addEventListener("click", handleRestart);
