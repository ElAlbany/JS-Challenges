const diff1 = document.querySelector("#difficulty1");
const ccombo1 = diff1.closest(".custom-combo");
const dropdownmenu1 = ccombo1.querySelector(".dropdown-menu");
const diff2 = document.querySelector("#difficulty2");
const ccombo2 = diff2.closest(".custom-combo");
const dropdownmenu2 = ccombo2.querySelector(".dropdown-menu");
const options = document.querySelectorAll(".option");
const restartBtn = document.querySelector(".restart");
const textContainer = document.querySelector(".text-container");
const text = document.querySelector(".text");
const start = document.querySelector(".start-test");
const bestScoreNumber = document.querySelector("#best-score-number");

let easyTexts = [];
let mediumTexts = [];
let hardTexts = [];
let easyNum = 1;
let mediumNum = 1;
let hardNum = 1;

diff1.addEventListener("click", () => {
  if (restartBtn.classList.contains("hide")) {
    if (dropdownmenu2) {
      if (dropdownmenu2.classList.contains("open"))
        dropdownmenu2.classList.remove("open");
    }
    if (dropdownmenu1) {
      if (!dropdownmenu1.classList.contains("open"))
        dropdownmenu1.classList.add("open");
      else dropdownmenu1.classList.remove("open");
    }
  }
});

diff2.addEventListener("click", () => {
  if (restartBtn.classList.contains("hide")) {
    if (dropdownmenu1) {
      if (dropdownmenu1.classList.contains("open"))
        dropdownmenu1.classList.remove("open");
    }
    if (dropdownmenu2) {
      if (!dropdownmenu2.classList.contains("open"))
        dropdownmenu2.classList.add("open");
      else dropdownmenu2.classList.remove("open");
    }
  }
});

options.forEach((option) => {
  option.addEventListener("click", () => {
    const optionValue = option.querySelector(".option-value");
    const parentCombo = option.closest(".custom-combo");
    const difficultyText = parentCombo.querySelector(".difficulty-value");
    const dropdownmenu = parentCombo.querySelector(".dropdown-menu");

    const currentOptions = dropdownmenu.querySelectorAll(".option");

    currentOptions.forEach((current) => {
      const radio = current.querySelector(".radio-style");
      const value = current.querySelector(".option-value");

      if (value.innerHTML.trim() === difficultyText.innerHTML.trim()) {
        if (current.classList.contains("selected"))
          current.classList.remove("selected");
      }
    });
    if (!option.classList.contains("selected"))
      option.classList.add("selected");
    difficultyText.innerHTML = optionValue.innerHTML.trim();
    dropdownmenu.classList.remove("open");
    //update the text
    updateText(difficultyText.textContent.toLowerCase());
  });
});

window.onload = function () {
  fetch("data.json")
    .then((response) => response.json())
    .then((data) => {
      easyTexts = data.easy.map((item) => item.text);
      mediumTexts = data.medium.map((item) => item.text);
      hardTexts = data.hard.map((item) => item.text);

      updateText("easy");
    });
};

function updateText(text) {
  const textElement = document.querySelector(".text");
  if (text === "easy") textElement.innerHTML = easyTexts[easyNum];
  else if (text === "medium") textElement.innerHTML = mediumTexts[mediumNum];
  else if (text === "hard") textElement.innerHTML = hardTexts[hardNum];
}

document.addEventListener("click", function (event) {
  //  1- drop down menus
  const insideCCombo1 = event.target.closest(".custom-combo");

  if (!insideCCombo1) {
    if (dropdownmenu1) {
      if (dropdownmenu1.classList.contains("open"))
        dropdownmenu1.classList.remove("open");
    }
    if (dropdownmenu2) {
      if (dropdownmenu2.classList.contains("open"))
        dropdownmenu2.classList.remove("open");
    }
  }
});
textContainer.addEventListener("click", () => {
  if (
    !dropdownmenu1.classList.contains("open") &&
    !dropdownmenu2.classList.contains("open")
  ) {
    start.classList.add("hide");
    text.classList.remove("filter");
    restartBtn.classList.remove("hide");
  }
});

restartBtn.addEventListener("click", () => {
  start.classList.remove("hide");
  text.classList.add("filter");
  restartBtn.classList.add("hide");
});
