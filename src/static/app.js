document.addEventListener("DOMContentLoaded", () => {
  const activitiesList = document.getElementById("activities-list");
  const activitySelect = document.getElementById("activity");
  const signupForm = document.getElementById("signup-form");
  const messageDiv = document.getElementById("message");

  // Function to fetch activities from API
  async function fetchActivities() {
    try {
      const response = await fetch("/activities");
      const activities = await response.json();

      // Clear loading message
      activitiesList.innerHTML = "";

      // Populate activities list
      Object.entries(activities).forEach(([name, details]) => {
        const activityCard = document.createElement("div");
        activityCard.className = "activity-card";

        const spotsLeft = details.max_participants - details.participants.length;

        // Create participants list HTML with delete icon
        let participantsHTML = "";
        if (details.participants.length > 0) {
          participantsHTML = `
            <div class="participants-section">
              <strong>Participants:</strong>
              <ul class="participants-list">
                ${details.participants
                  .map(
                    (email) =>
                      `<li style="list-style:none;display:flex;align-items:center;gap:6px;">
                        <span class="participant-avatar">${email.charAt(0).toUpperCase()}</span>
                        <span class="participant-email">${email}</span>
                        <button class="delete-participant" title="Remove participant" data-activity="${encodeURIComponent(
                        name
                      )}" data-email="${encodeURIComponent(
                        email
                      )}">
                          <svg width="16" height="16" viewBox="0 0 20 20" fill="none" xmlns="http://www.w3.org/2000/svg">
                            <circle cx="10" cy="10" r="10" fill="#ff4136"/>
                            <path d="M6 6l8 8M14 6l-8 8" stroke="#fff" stroke-width="2" stroke-linecap="round"/>
                          </svg>
                        </button>
                      </li>`
                  )
                  .join("")}
              </ul>
            </div>
          `;
        } else {
          participantsHTML = `<div class="participants-section"><em>No participants yet</em></div>`;
        }

        activityCard.innerHTML = `
          <h4>${name}</h4>
          <p>${details.description}</p>
          <p><strong>Schedule:</strong> ${details.schedule}</p>
          <p><strong>Availability:</strong> ${spotsLeft} spots left</p>
          ${participantsHTML}
        `;

        activitiesList.appendChild(activityCard);

        // Add option to select dropdown
        const option = document.createElement("option");
        option.value = name;
        option.textContent = name;
        activitySelect.appendChild(option);
      });
    } catch (error) {
      activitiesList.innerHTML = "<p>Failed to load activities. Please try again later.</p>";
      console.error("Error fetching activities:", error);
    }
  }

  // Handle form submission
  signupForm.addEventListener("submit", async (event) => {
    event.preventDefault();

    const email = document.getElementById("email").value;
    const activity = document.getElementById("activity").value;

    try {
      const response = await fetch(
        `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
        {
          method: "POST",
        }
      );

      const result = await response.json();

      if (response.ok) {
        messageDiv.textContent = result.message;
        messageDiv.className = "success";
        signupForm.reset();
        fetchActivities(); // обновить список активностей и участников
      } else {
        messageDiv.textContent = result.detail || "An error occurred";
        messageDiv.className = "error";
      }

      messageDiv.classList.remove("hidden");

      // Hide message after 5 seconds
      setTimeout(() => {
        messageDiv.classList.add("hidden");
      }, 5000);
    } catch (error) {
      messageDiv.textContent = "Failed to sign up. Please try again.";
      messageDiv.className = "error";
      messageDiv.classList.remove("hidden");
      console.error("Error signing up:", error);
    }
  });

  // Initialize app
  fetchActivities();
  // Handle participant delete
  activitiesList.addEventListener("click", async (event) => {
    if (event.target.closest && event.target.closest(".delete-participant")) {
      const btn = event.target.closest(".delete-participant");
      const activity = decodeURIComponent(btn.getAttribute("data-activity"));
      const email = decodeURIComponent(btn.getAttribute("data-email"));
      if (!confirm(`Remove ${email} from ${activity}?`)) return;
      try {
        const response = await fetch(
          `/activities/${encodeURIComponent(activity)}/signup?email=${encodeURIComponent(email)}`,
          {
            method: "DELETE",
          }
        );
        if (response.ok) {
          fetchActivities();
        } else {
          const result = await response.json();
          alert(result.detail || "Failed to remove participant.");
        }
      } catch (error) {
        alert("Failed to remove participant. Please try again.");
      }
    }
  });
});
