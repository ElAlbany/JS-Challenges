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
    // Must contain @, have something before @, have domain that ends with .com
    // Regex: ^[^\s@]+@[^\s@]+\.com$
    const isValid = /^[^\s@]+@[^\s@]+\.com$/.test(email);

    errorDiv.textContent = "";
    successDiv.textContent = "";
    emailInput.style.border = "";

    if (!isValid) {
      errorDiv.textContent =
        "Please enter a valid email address ending with .com (e.g., name@domain.com)";
      emailInput.style.border = "1px solid hsl(0, 100%, 63%)";
    } else {
      successDiv.textContent = "✓ Valid email address! Thank you.";
      emailInput.style.border = "1px solid hsl(176, 68%, 64%)";
      setTimeout(() => {
        emailInput.value = "";
        successDiv.textContent = "";
        emailInput.style.border = "";
      }, 3000);
    }
  });

  emailInput.addEventListener("input", function () {
    errorDiv.textContent = "";
    successDiv.textContent = "";
    emailInput.style.border = "";
  });
})();
