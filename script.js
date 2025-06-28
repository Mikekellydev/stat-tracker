// === GLOBAL VARIABLES ===
let homePlayers = [
  "Nicholas", "Micah", "Isaiah", "Ethan", "David",
  "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick"
];
let selectedStarters = [];
let isSelectingStarters = false;
let timerInterval;
let timeRemaining = 18 * 60; // 18 minutes in seconds

// === CLOCK FUNCTIONS ===
function updateClockDisplay() {
  const minutes = Math.floor(timeRemaining / 60);
  const seconds = timeRemaining % 60;
  document.getElementById("gameClock").textContent =
    `${minutes.toString().padStart(2, '0')}:${seconds.toString().padStart(2, '0')}`;
}

function startClock() {
  if (timerInterval) return;
  timerInterval = setInterval(() => {
    if (timeRemaining > 0) {
      timeRemaining--;
      updateClockDisplay();
    } else {
      clearInterval(timerInterval);
    }
  }, 1000);
}

function stopClock() {
  clearInterval(timerInterval);
  timerInterval = null;
}

function resetClock() {
  stopClock();
  timeRemaining = 18 * 60;
  updateClockDisplay();
}

// === EVENT LOGGING ===
function logEvent(msg) {
  const li = document.createElement("li");
  const time = new Date().toLocaleTimeString();
  li.textContent = `${time} - ${msg}`;
  document.getElementById("log").appendChild(li);
}

// === PLAYER BUTTONS RENDERING ===
function renderPlayerButtons(context = "") {
  const playerButtonsDiv = document.getElementById("playerButtons");
  playerButtonsDiv.innerHTML = "";

  homePlayers.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.classList.add("player-btn");
    btn.dataset.player = name;

    // Maintain highlight for selected starters
    if (context === "starters" && selectedStarters.includes(name)) {
      btn.classList.add("selected");
    }

    btn.onclick = () => {
      if (context === "starters") {
        toggleStarter(name);
        renderPlayerButtons("starters");
      }
    };

    playerButtonsDiv.appendChild(btn);
  });

  if (context === "starters") {
    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Starters";
    submitBtn.className = "submit-btn";
    submitBtn.onclick = () => {
      if (selectedStarters.length !== 5) {
        alert("Please select exactly 5 starters.");
        return;
      }
      logEvent(`Starters set: ${selectedStarters.join(", ")}`);
      isSelectingStarters = false;
      playerButtonsDiv.innerHTML = "";
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "cancel-btn";
    cancelBtn.onclick = () => {
      selectedStarters = [];
      isSelectingStarters = false;
      playerButtonsDiv.innerHTML = "";
    };

    playerButtonsDiv.appendChild(submitBtn);
    playerButtonsDiv.appendChild(cancelBtn);
  }
}

// === STARTER TOGGLE ===
function toggleStarter(name) {
  if (selectedStarters.includes(name)) {
    selectedStarters = selectedStarters.filter(n => n !== name);
  } else {
    if (selectedStarters.length >= 5) {
      alert("Only 5 players can be starters.");
      return;
    }
    selectedStarters.push(name);
  }
}

// === THEME TOGGLE ===
function toggleTheme() {
  document.body.classList.toggle("dark-mode");
  if (isSelectingStarters) {
    renderPlayerButtons("starters");
  }
}

// === SET STARTERS BUTTON ===
function setStarters() {
  isSelectingStarters = true;
  renderPlayerButtons("starters");
}

// === DOM READY ===
document.addEventListener("DOMContentLoaded", () => {
  updateClockDisplay(); // initialize clock to 18:00
});
