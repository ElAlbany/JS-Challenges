// Select all the question rows
const questions = document.querySelectorAll(".question");

questions.forEach((question) => {
  question.addEventListener("click", () => {
    const parentSection = question.closest(".section");
    const icon = question.querySelector(".toggle-icon");

    parentSection.classList.toggle("active");

    if (parentSection.classList.contains("active")) {
      icon.src = "assets/images/icon-minus.svg";
    } else {
      icon.src = "assets/images/icon-plus.svg";
    }
  });
});
