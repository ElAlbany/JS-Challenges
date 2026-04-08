const ratePage = document.querySelector(".rate-page");
const submittedPage = document.querySelector(".after-submit-page");
const btnSubmit = document.querySelector(".btn-submit");

document.querySelectorAll(".rating-btn").forEach((btn) => {
  btn.addEventListener("click", () => {
    document
      .querySelectorAll(".rating-btn")
      .forEach((b) => b.classList.remove("selected"));
    btn.classList.add("selected");
    document.getElementById("rate-number").innerHTML = btn.innerHTML;
  });
});

btnSubmit.addEventListener("click", () => {
  const selectedRating = document.querySelector(".rating-btn.selected");
  if (!selectedRating) {
    alert("Please select a rating (1–5) before submitting.");
    return;
  }
  ratePage.style.display = "none";
  submittedPage.style.display = "flex";
});
