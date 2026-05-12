const STORAGE_KEY = "typingTestBest";
const TIMED_SECONDS = 60;

const state = {
  currentDifficulty: "hard",
  currentMode: "timed",
  isStarted: false,
  isFinished: false,
  passages: null,
  currentPassage: "",
  referenceChars: [],
  charSpans: [],
  charStatuses: [],
  currentIndex: 0,
  cursorIndex: null,
  correctCount: 0,
  correctKeystrokes: 0,
  errorCount: 0,
  totalKeystrokes: 0,
  timerSeconds: TIMED_SECONDS,
  timerInterval: null,
  confettiInterval: null,
  startedAt: null,
  personalBest: null,
};

const elements = {};

document.addEventListener("DOMContentLoaded", initApp);

async function initApp() {
  cacheDomElements();
  bindEvents();
  loadPersonalBest();
  updateBestDisplay();
  updateControls();

  setLoadingState("Loading passage...");

  try {
    await loadPassage(state.currentDifficulty);
    await resetTest({ loadNewPassage: false });
  } catch {
    showLoadingError();
  }
}

function cacheDomElements() {
  elements.bestScore = document.querySelector(".best-score");
  elements.bestScoreNumber = document.querySelector("#best-score-number");
  elements.wpmNumber = document.querySelector("#wpm-number");
  elements.accuracyNumber = document.querySelector("#accuracy-number");
  elements.timeNumber = document.querySelector("#time-number");
  elements.typingScreen = document.querySelector("#typing-screen");
  elements.textContainer = document.querySelector("#text-container");
  elements.startOverlay = document.querySelector("#start-overlay");
  elements.startButton = document.querySelector("#start-button");
  elements.restartArea = document.querySelector("#restart-area");
  elements.restartButton = document.querySelector("#restart-button");
  elements.resultsScreen = document.querySelector("#results-screen");
  elements.resultIcon = document.querySelector("#result-icon");
  elements.resultHeading = document.querySelector("#result-heading");
  elements.resultSubtitle = document.querySelector("#result-subtitle");
  elements.resultWpm = document.querySelector("#result-wpm");
  elements.resultAccuracy = document.querySelector("#result-accuracy");
  elements.resultCorrect = document.querySelector("#result-correct");
  elements.resultErrors = document.querySelector("#result-errors");
  elements.resultAction = document.querySelector("#result-action");
  elements.resultActionText = document.querySelector("#result-action-text");
  elements.typingInput = document.querySelector("#typing-input");
  elements.difficultyButtons = [
    ...document.querySelectorAll("[data-difficulty].control-pill"),
  ];
  elements.modeButtons = [...document.querySelectorAll("[data-mode].control-pill")];
  elements.dropdownControls = [...document.querySelectorAll(".dropdown-control")];
  elements.dropdownTriggers = [...document.querySelectorAll(".dropdown-trigger")];
  elements.difficultyValue = document.querySelector("#difficulty-value");
  elements.modeValue = document.querySelector("#mode-value");
  elements.difficultyOptions = [
    ...document.querySelectorAll(".dropdown-option[data-difficulty]"),
  ];
  elements.modeOptions = [...document.querySelectorAll(".dropdown-option[data-mode]")];
}

function bindEvents() {
  elements.startButton.addEventListener("click", () => {
    startTest();
  });

  elements.textContainer.addEventListener("click", () => {
    if (!state.isFinished) {
      startTest();
      focusTypingInput();
    }
  });

  elements.restartButton.addEventListener("click", () => {
    void resetTest();
  });

  elements.resultAction.addEventListener("click", () => {
    void resetTest();
  });

  elements.difficultyButtons.forEach((button) => {
    button.addEventListener("click", () => {
      void setDifficulty(button.dataset.difficulty);
    });
  });

  elements.modeButtons.forEach((button) => {
    button.addEventListener("click", () => {
      void setMode(button.dataset.mode);
    });
  });

  elements.dropdownTriggers.forEach((trigger) => {
    trigger.addEventListener("click", () => {
      const control = trigger.closest(".dropdown-control");
      toggleDropdown(control);
    });
  });

  elements.difficultyOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const control = option.closest(".dropdown-control");
      closeDropdown(control);
      void setDifficulty(option.dataset.difficulty);
    });
  });

  elements.modeOptions.forEach((option) => {
    option.addEventListener("click", () => {
      const control = option.closest(".dropdown-control");
      closeDropdown(control);
      void setMode(option.dataset.mode);
    });
  });

  document.addEventListener("click", (event) => {
    if (!event.target.closest(".dropdown-control")) {
      closeDropdowns();
    }
  });

  document.addEventListener("keydown", handleKeypress);

  elements.typingInput.addEventListener("keydown", (event) => {
    if (event.key === "Backspace") {
      event.preventDefault();
      handleBackspace();
    }
  });

  elements.typingInput.addEventListener("input", () => {
    const typedValue = elements.typingInput.value;
    elements.typingInput.value = "";

    Array.from(typedValue).forEach((character) => {
      if (character !== "\n") {
        processTypedCharacter(character);
      }
    });
  });
}

async function loadPassage(difficulty) {
  if (!state.passages) {
    const response = await fetch("./data.json");

    if (!response.ok) {
      throw new Error("Passage data could not be loaded.");
    }

    state.passages = await response.json();
  }

  const passages = state.passages[difficulty] ?? [];
  const randomPassage = passages[Math.floor(Math.random() * passages.length)];

  if (!randomPassage?.text) {
    throw new Error("No passage was found for this difficulty.");
  }

  renderPassage(randomPassage.text);
}

function renderPassage(text) {
  state.currentPassage = text;
  state.referenceChars = Array.from(text);
  state.charSpans = [];
  state.charStatuses = Array(state.referenceChars.length).fill(null);

  const fragment = document.createDocumentFragment();
  let currentWord = null;

  state.referenceChars.forEach((character) => {
    const span = document.createElement("span");
    span.className = character === " " ? "char space" : "char";
    span.textContent = character;
    span.dataset.space = String(character === " ");

    if (character === " ") {
      fragment.appendChild(span);
      currentWord = null;
    } else {
      if (!currentWord) {
        currentWord = document.createElement("span");
        currentWord.className = "word";
        fragment.appendChild(currentWord);
      }

      currentWord.appendChild(span);
    }

    state.charSpans.push(span);
  });

  elements.textContainer.replaceChildren(fragment);
  elements.textContainer.classList.remove("loading", "error");
  elements.startButton.disabled = false;
}

function startTest() {
  if (state.isStarted || state.isFinished || state.referenceChars.length === 0) {
    return;
  }

  state.isStarted = true;
  state.startedAt = Date.now();
  elements.textContainer.classList.remove("blurred");
  elements.startOverlay.classList.add("hidden");
  elements.restartArea.classList.remove("hidden");
  focusTypingInput();
  updateCursor();
  updateStats();
  startTimer();
}

function handleKeypress(event) {
  if (event.key === "Escape") {
    closeDropdowns();
    return;
  }

  if (
    event.target === elements.typingInput ||
    event.target.closest("button") ||
    event.ctrlKey ||
    event.metaKey ||
    event.altKey ||
    state.isFinished
  ) {
    return;
  }

  if (event.key === "Backspace") {
    event.preventDefault();
    handleBackspace();
    return;
  }

  if (event.key.length !== 1) {
    return;
  }

  event.preventDefault();
  processTypedCharacter(event.key);
}

function processTypedCharacter(typedChar) {
  if (state.isFinished || state.referenceChars.length === 0) {
    return;
  }

  if (!state.isStarted) {
    startTest();
  }

  if (state.currentIndex >= state.referenceChars.length) {
    endTest();
    return;
  }

  const expectedChar = state.referenceChars[state.currentIndex];
  const status = typedChar === expectedChar ? "correct" : "incorrect";

  state.charStatuses[state.currentIndex] = status;
  state.totalKeystrokes += 1;

  if (status === "correct") {
    state.correctCount += 1;
    state.correctKeystrokes += 1;
  } else {
    state.errorCount += 1;
  }

  applyCharState(state.currentIndex);
  state.currentIndex += 1;
  updateCursor();
  updateStats();

  if (state.currentIndex >= state.referenceChars.length) {
    endTest();
  }
}

function handleBackspace() {
  if (!state.isStarted || state.isFinished || state.currentIndex === 0) {
    return;
  }

  const previousIndex = state.currentIndex - 1;
  const previousStatus = state.charStatuses[previousIndex];

  if (previousStatus === "correct") {
    state.correctCount = Math.max(0, state.correctCount - 1);
  }

  state.charStatuses[previousIndex] = null;
  state.currentIndex = previousIndex;
  applyCharState(previousIndex);
  updateCursor();
  updateStats();
}

function startTimer() {
  clearTimer();

  state.timerInterval = window.setInterval(() => {
    if (!state.isStarted || state.isFinished) {
      return;
    }

    if (state.currentMode === "timed") {
      state.timerSeconds = Math.max(0, state.timerSeconds - 1);
      updateStats();

      if (state.timerSeconds === 0) {
        endTest();
      }

      return;
    }

    state.timerSeconds += 1;
    updateStats();
  }, 1000);
}

function updateStats() {
  const wpm = calculateLiveWpm();
  const accuracy = calculateAccuracy();

  elements.wpmNumber.textContent = String(wpm);
  elements.accuracyNumber.textContent = `${accuracy}%`;
  elements.timeNumber.textContent = formatTime(
    state.timerSeconds,
    state.currentMode === "timed"
  );

  elements.accuracyNumber.classList.toggle("has-errors", state.errorCount > 0);
  elements.timeNumber.classList.toggle("is-active", state.isStarted);
}

function endTest() {
  if (state.isFinished) {
    return;
  }

  state.isStarted = false;
  state.isFinished = true;
  clearTimer();
  closeDropdowns();
  updateCursor();
  elements.typingInput.blur();

  showResults(
    calculateFinalWpm(),
    calculateAccuracy(),
    state.correctCount,
    state.errorCount
  );
}

function showResults(wpm, accuracy, correctChars, errorChars) {
  const previousBest = getValidPersonalBest();
  const variant = getResultVariant(wpm, previousBest);

  if (variant === "baseline" || variant === "high-score") {
    savePersonalBest(wpm, accuracy);
  }

  updateBestDisplay();

  const resultCopy = {
    normal: {
      icon: "./assets/images/icon-completed.svg",
      heading: "Test Complete!",
      subtitle: "Solid run. Keep pushing to beat your high score.",
      button: "Go Again",
    },
    baseline: {
      icon: "./assets/images/icon-completed.svg",
      heading: "Baseline Established!",
      subtitle:
        "You've set the bar. Now the real challenge begins\u2014time to beat it.",
      button: "Beat This Score",
    },
    "high-score": {
      icon: "./assets/images/icon-new-pb.svg",
      heading: "High Score Smashed!",
      subtitle: "You're getting faster. That was incredible typing.",
      button: "Beat This Score",
    },
  };

  const copy = resultCopy[variant];

  elements.resultIcon.src = copy.icon;
  elements.resultHeading.textContent = copy.heading;
  elements.resultSubtitle.textContent = copy.subtitle;
  elements.resultActionText.textContent = copy.button;
  elements.resultWpm.textContent = String(wpm);
  elements.resultAccuracy.textContent = `${accuracy}%`;
  elements.resultAccuracy.classList.toggle("is-perfect", errorChars === 0);
  elements.resultAccuracy.classList.toggle("has-errors", errorChars > 0);
  elements.resultCorrect.textContent = String(correctChars);
  elements.resultErrors.textContent = String(errorChars);
  elements.resultsScreen.classList.remove(
    "is-normal-result",
    "is-baseline-result",
    "is-high-score",
    "is-high-score-result"
  );
  elements.resultsScreen.classList.add(`is-${variant}-result`);
  elements.resultsScreen.classList.toggle(
    "is-high-score",
    variant === "high-score"
  );
  document.body.classList.add("results-active");
  elements.typingScreen.classList.add("hidden");
  elements.resultsScreen.classList.remove("hidden");

  if (variant === "high-score") {
    fireConfetti();
  }
}

function savePersonalBest(wpm, accuracy) {
  const best = {
    wpm,
    accuracy,
    date: getLocalDateString(),
  };

  state.personalBest = best;

  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(best));
  } catch {
    state.personalBest = best;
  }
}

function loadPersonalBest() {
  try {
    const storedBest = localStorage.getItem(STORAGE_KEY);
    const parsedBest = storedBest ? JSON.parse(storedBest) : null;
    state.personalBest = isValidBest(parsedBest) ? parsedBest : null;
  } catch {
    state.personalBest = null;
  }
}

async function resetTest({ loadNewPassage = true } = {}) {
  clearTimer();
  stopConfetti();

  state.isStarted = false;
  state.isFinished = false;
  state.currentIndex = 0;
  state.cursorIndex = null;
  state.correctCount = 0;
  state.correctKeystrokes = 0;
  state.errorCount = 0;
  state.totalKeystrokes = 0;
  state.timerSeconds = state.currentMode === "timed" ? TIMED_SECONDS : 0;
  state.startedAt = null;
  state.charStatuses = Array(state.referenceChars.length).fill(null);

  elements.typingInput.value = "";
  elements.typingInput.blur();
  document.body.classList.remove("results-active");
  elements.typingScreen.classList.remove("hidden");
  elements.resultsScreen.classList.add("hidden");
  elements.resultsScreen.classList.remove(
    "is-normal-result",
    "is-baseline-result",
    "is-high-score",
    "is-high-score-result"
  );
  elements.textContainer.classList.add("blurred");
  elements.startOverlay.classList.remove("hidden");
  elements.restartArea.classList.add("hidden");
  closeDropdowns();

  if (loadNewPassage) {
    setLoadingState("Loading passage...");

    try {
      await loadPassage(state.currentDifficulty);
    } catch {
      showLoadingError();
      updateStats();
      return;
    }
  } else {
    resetCharacterClasses();
  }

  resetCharacterClasses();
  updateStats();
}

function formatTime(seconds, useTimedStartFormat = false) {
  if (useTimedStartFormat && seconds === TIMED_SECONDS) {
    return "0:60";
  }

  const minutes = Math.floor(seconds / 60);
  const remainingSeconds = seconds % 60;
  return `${minutes}:${String(remainingSeconds).padStart(2, "0")}`;
}

function calculateLiveWpm() {
  if (!state.isStarted && !state.isFinished) {
    return 0;
  }

  return countCompletedWords();
}

function calculateFinalWpm() {
  const elapsedSeconds = Math.max(getElapsedSeconds(), 1);
  const minutesElapsed = elapsedSeconds / 60;

  return Math.round(state.correctCount / 5 / minutesElapsed);
}

function countCompletedWords() {
  let completedWords = 0;
  let wordStart = null;

  for (let index = 0; index <= state.referenceChars.length; index += 1) {
    const character = state.referenceChars[index];
    const isWordCharacter = character && character !== " ";

    if (isWordCharacter && wordStart === null) {
      wordStart = index;
    }

    if (
      (!isWordCharacter || index === state.referenceChars.length) &&
      wordStart !== null
    ) {
      const wordEnd = index - 1;

      if (state.currentIndex > wordEnd) {
        completedWords += 1;
      }

      wordStart = null;
    }
  }

  return completedWords;
}

function calculateAccuracy() {
  if (state.totalKeystrokes === 0) {
    return 100;
  }

  return Math.round((state.correctKeystrokes / state.totalKeystrokes) * 100);
}

function getElapsedSeconds() {
  if (!state.startedAt) {
    return state.currentMode === "timed"
      ? TIMED_SECONDS - state.timerSeconds
      : state.timerSeconds;
  }

  const clockSeconds = Math.floor((Date.now() - state.startedAt) / 1000);
  const timerSeconds =
    state.currentMode === "timed"
      ? TIMED_SECONDS - state.timerSeconds
      : state.timerSeconds;

  return Math.max(clockSeconds, timerSeconds);
}

function resetCharacterClasses() {
  state.charSpans.forEach((span, index) => {
    state.charStatuses[index] = null;
    applyCharState(index);
  });
}

function applyCharState(index) {
  const span = state.charSpans[index];

  if (!span) {
    return;
  }

  span.className = span.dataset.space === "true" ? "char space" : "char";

  const status = state.charStatuses[index];

  if (status) {
    span.classList.add(status);
  }
}

function updateCursor() {
  if (state.cursorIndex !== null && state.charSpans[state.cursorIndex]) {
    state.charSpans[state.cursorIndex].classList.remove("cursor");
  }

  const nextCursor =
    state.isStarted && !state.isFinished && state.currentIndex < state.charSpans.length
      ? state.currentIndex
      : null;

  state.cursorIndex = nextCursor;

  if (nextCursor !== null && state.charSpans[nextCursor]) {
    state.charSpans[nextCursor].classList.add("cursor");
  }
}

function updateBestDisplay() {
  if (!state.personalBest || typeof state.personalBest.wpm !== "number") {
    elements.bestScore.classList.add("hidden");
    return;
  }

  elements.bestScoreNumber.textContent = String(state.personalBest.wpm);
  elements.bestScore.classList.remove("hidden");
}

function getValidPersonalBest() {
  return isValidBest(state.personalBest) ? state.personalBest : null;
}

function getResultVariant(wpm, previousBest) {
  if (!previousBest) {
    return "baseline";
  }

  if (wpm > previousBest.wpm) {
    return "high-score";
  }

  return "normal";
}

function isValidBest(best) {
  return (
    best !== null &&
    typeof best === "object" &&
    Number.isFinite(best.wpm) &&
    Number.isFinite(best.accuracy) &&
    typeof best.date === "string"
  );
}

async function setDifficulty(difficulty) {
  if (!["easy", "medium", "hard"].includes(difficulty)) {
    return;
  }

  state.currentDifficulty = difficulty;
  updateControls();
  await resetTest();
}

async function setMode(mode) {
  if (!["timed", "passage"].includes(mode)) {
    return;
  }

  state.currentMode = mode;
  updateControls();
  await resetTest();
}

function updateControls() {
  const modeLabel = state.currentMode === "timed" ? "Timed (60s)" : "Passage";
  const difficultyLabel = capitalize(state.currentDifficulty);

  elements.difficultyValue.textContent = difficultyLabel;
  elements.modeValue.textContent = modeLabel;

  elements.difficultyButtons.forEach((button) => {
    const isSelected = button.dataset.difficulty === state.currentDifficulty;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  elements.modeButtons.forEach((button) => {
    const isSelected = button.dataset.mode === state.currentMode;
    button.classList.toggle("selected", isSelected);
    button.setAttribute("aria-pressed", String(isSelected));
  });

  elements.difficultyOptions.forEach((option) => {
    option.setAttribute(
      "aria-checked",
      String(option.dataset.difficulty === state.currentDifficulty)
    );
  });

  elements.modeOptions.forEach((option) => {
    option.setAttribute(
      "aria-checked",
      String(option.dataset.mode === state.currentMode)
    );
  });
}

function toggleDropdown(control) {
  const trigger = control.querySelector(".dropdown-trigger");
  const menu = control.querySelector(".dropdown-menu");
  const isOpen = menu.classList.toggle("open");

  trigger.setAttribute("aria-expanded", String(isOpen));
}

function closeDropdown(control) {
  const trigger = control.querySelector(".dropdown-trigger");
  const menu = control.querySelector(".dropdown-menu");

  menu.classList.remove("open");
  trigger.setAttribute("aria-expanded", "false");
}

function closeDropdowns() {
  elements.dropdownControls.forEach(closeDropdown);
}

function focusTypingInput() {
  try {
    elements.typingInput.focus({ preventScroll: true });
  } catch {
    elements.typingInput.focus();
  }
}

function setLoadingState(message) {
  elements.textContainer.replaceChildren(message);
  elements.textContainer.classList.add("loading", "blurred");
  elements.textContainer.classList.remove("error");
  elements.startButton.disabled = true;
}

function showLoadingError() {
  elements.textContainer.replaceChildren(
    "Unable to load passages. Refresh the page to try again."
  );
  elements.textContainer.classList.add("error");
  elements.textContainer.classList.remove("loading", "blurred");
  elements.startButton.disabled = true;
}

function fireConfetti() {
  stopConfetti();

  if (typeof window.confetti !== "function") {
    return;
  }

  const colors = ["#177dff", "#4dd67b", "#f4dc73", "#d64d5b"];
  const endTime = Date.now() + 4000;

  state.confettiInterval = window.setInterval(() => {
    window.confetti({
      particleCount: 28,
      spread: 70,
      startVelocity: 38,
      ticks: 220,
      gravity: 0.8,
      scalar: 0.8,
      colors,
      origin: {
        x: Math.random(),
        y: -0.05,
      },
    });

    if (Date.now() >= endTime) {
      stopConfetti();
    }
  }, 240);
}

function stopConfetti() {
  if (state.confettiInterval) {
    window.clearInterval(state.confettiInterval);
    state.confettiInterval = null;
  }
}

function clearTimer() {
  if (state.timerInterval) {
    window.clearInterval(state.timerInterval);
    state.timerInterval = null;
  }
}

function capitalize(value) {
  return value.charAt(0).toUpperCase() + value.slice(1);
}

function getLocalDateString() {
  const now = new Date();
  const timezoneOffset = now.getTimezoneOffset() * 60000;
  return new Date(now.getTime() - timezoneOffset).toISOString().slice(0, 10);
}
