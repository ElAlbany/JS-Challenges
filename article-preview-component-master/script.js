const sharePopup = document.querySelector(".share");
const shareButton = document.querySelector(".share-image");
const personalDetails = document.querySelector(".personal-details");

function toggleSharePopup(event) {
  event.stopPropagation();
  sharePopup.classList.toggle("show");

  // Mobile-specific: hide personal details when popup is open
  if (window.innerWidth <= 768) {
    if (sharePopup.classList.contains("show")) {
      // Hide the author info (but keep share button)
      personalDetails.style.display = "none";
    } else {
      personalDetails.style.display = "flex";
    }
  }
}

shareButton.addEventListener("click", toggleSharePopup);

// Close popup when clicking outside
document.addEventListener("click", function (event) {
  if (
    sharePopup.classList.contains("show") &&
    !sharePopup.contains(event.target) &&
    !shareButton.contains(event.target)
  ) {
    sharePopup.classList.remove("show");
    // Restore personal details on mobile
    if (window.innerWidth <= 768) {
      personalDetails.style.display = "flex";
    }
  }
});

// Close with Escape key
document.addEventListener("keydown", function (event) {
  if (event.key === "Escape" && sharePopup.classList.contains("show")) {
    sharePopup.classList.remove("show");
    if (window.innerWidth <= 768) {
      personalDetails.style.display = "flex";
    }
  }
});

// Handle window resize – if resizing from mobile to desktop while popup open, reset styles
window.addEventListener("resize", function () {
  if (window.innerWidth > 768) {
    personalDetails.style.display = "flex";
  } else {
    // On mobile, if popup is open, hide details
    if (sharePopup.classList.contains("show")) {
      personalDetails.style.display = "none";
    } else {
      personalDetails.style.display = "flex";
    }
  }
});
