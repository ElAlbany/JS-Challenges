(function () {
  const form = document.getElementById("contact-form");
  if (!form) return;

  const emailInput = form.querySelector(".contact-input");
  const errorDiv = document.getElementById("error-message");
  const successDiv = document.getElementById("success-message");

  errorDiv.textContent = "";
  successDiv.textContent = "";

  form.addEventListener("submit", function (e) {
    e.preventDefault();

    const email = emailInput.value.trim();
    // Must end with .com exactly
    const isValid = /^[^\s@]+@[^\s@]+\.com$/.test(email);

    // Reset previous styles and messages
    errorDiv.textContent = "";
    successDiv.textContent = "";
    emailInput.style.border = "";

    if (!isValid) {
      errorDiv.textContent =
        "✖ Please enter a valid email address ending with .com (e.g., name@domain.com)";
      emailInput.style.border = "1px solid hsl(0, 100%, 63%)";
    } else {
      successDiv.textContent = "✓ Valid email address! Thank you.";
      emailInput.style.border = "1px solid hsl(176, 68%, 64%)";
    }
  });

  // Clear messages and border when user starts typing
  emailInput.addEventListener("input", function () {
    errorDiv.textContent = "";
    successDiv.textContent = "";
    emailInput.style.border = "";
  });
})();
