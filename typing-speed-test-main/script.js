const diff1 = document.querySelector("#difficulty1");
const ccombo1 = diff1.closest(".custom-combo");
const dropdownmenu1 = ccombo1.querySelector(".dropdown-menu");
const diff2 = document.querySelector("#difficulty2");
const ccombo2 = diff2.closest(".custom-combo");
const dropdownmenu2 = ccombo2.querySelector(".dropdown-menu");

const options = document.querySelectorAll(".option");

diff1.addEventListener("click", () => {
  if (dropdownmenu2) {
    if (dropdownmenu2.classList.contains("open"))
      dropdownmenu2.classList.remove("open");
  }
  if (dropdownmenu1) {
    if (!dropdownmenu1.classList.contains("open"))
      dropdownmenu1.classList.add("open");
    else dropdownmenu1.classList.remove("open");
  }
});

diff2.addEventListener("click", () => {
  if (dropdownmenu1) {
    if (dropdownmenu1.classList.contains("open"))
      dropdownmenu1.classList.remove("open");
  }
  if (dropdownmenu2) {
    if (!dropdownmenu2.classList.contains("open"))
      dropdownmenu2.classList.add("open");
    else dropdownmenu2.classList.remove("open");
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
  });
});

document.addEventListener("click", function (event) {
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
