const form = document.getElementById("signup-form");
const firstName = document.getElementById("first-name");
const lastName = document.getElementById("last-name");
const email = document.getElementById("email");
const password = document.getElementById("password");

const firstNameError = document.getElementById("first-name-error");
const lastNameError = document.getElementById("last-name-error");
const emailError = document.getElementById("email-error");
const passwordError = document.getElementById("password-error");

const successMsg = document.getElementById("success-message");

function showError(input, errorElement, message) {
  input.classList.add("error-border");
  const icon = input.parentElement.querySelector(".error-icon");
  if (icon) icon.classList.add("show");
  errorElement.textContent = message;
  errorElement.classList.add("show");
}

function clearError(input, errorElement) {
  input.classList.remove("error-border");
  const icon = input.parentElement.querySelector(".error-icon");
  if (icon) icon.classList.remove("show");
  errorElement.classList.remove("show");
  errorElement.textContent = "";
}

function isValidEmail(emailStr) {
  const re = /^[^\s@]+@([^\s@.,]+\.)+[^\s@.,]{2,}$/;
  return re.test(emailStr);
}

function validateFirstNameField() {
  const value = firstName.value.trim();
  if (value === "") {
    showError(firstName, firstNameError, "First Name cannot be empty");
    return false;
  } else {
    clearError(firstName, firstNameError);
    return true;
  }
}

function validateLastNameField() {
  const value = lastName.value.trim();
  if (value === "") {
    showError(lastName, lastNameError, "Last Name cannot be empty");
    return false;
  } else {
    clearError(lastName, lastNameError);
    return true;
  }
}

function validateEmailField() {
  const value = email.value.trim();
  if (value === "") {
    showError(email, emailError, "Email cannot be empty");
    return false;
  } else if (!isValidEmail(value)) {
    showError(email, emailError, "Looks like this is not an email");
    return false;
  } else {
    clearError(email, emailError);
    return true;
  }
}

function validatePasswordField() {
  const value = password.value.trim();
  if (value === "") {
    showError(password, passwordError, "Password cannot be empty");
    return false;
  } else {
    clearError(password, passwordError);
    return true;
  }
}

// Validate all fields
function validateAll() {
  const isFirstNameValid = validateFirstNameField();
  const isLastNameValid = validateLastNameField();
  const isEmailValid = validateEmailField();
  const isPasswordValid = validatePasswordField();

  return isFirstNameValid && isLastNameValid && isEmailValid && isPasswordValid;
}

// Show success green message
function showSuccessMessage() {
  successMsg.textContent = "✓ All fields are correct! You're ready to go.";
  successMsg.classList.add("show");

  // Optional: hide after 4 seconds
  setTimeout(() => {
    if (successMsg.classList.contains("show")) {
      successMsg.classList.remove("show");
    }
  }, 4000);
}

// Form submit handler
form.addEventListener("submit", function (event) {
  event.preventDefault();

  const isValid = validateAll();

  if (isValid) {
    showSuccessMessage();
  } else {
    successMsg.classList.remove("show");
  }
});

const inputs = [firstName, lastName, email, password];
const errorElements = [
  firstNameError,
  lastNameError,
  emailError,
  passwordError,
];
const validators = [
  validateFirstNameField,
  validateLastNameField,
  validateEmailField,
  validatePasswordField,
];

inputs.forEach((input, index) => {
  input.addEventListener("input", () => {
    validators[index]();
    if (successMsg.classList.contains("show")) {
      successMsg.classList.remove("show");
    }
  });
});
