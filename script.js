document.addEventListener("DOMContentLoaded", () => {
  let homePlayers = [
    "Nicholas", "Micah", "Isaiah", "Ethan", "David",
    "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick"
  ];
  let selectedStarters = [];
  let isSelectingStarters = false;

  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");

  function renderPlayerButtons(context = "") {
    playerButtonsDiv.innerHTML = "";

    homePlayers.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = selectedStarters.includes(name) && context === "starters"
        ? `${name} ✅`
        : name;

      btn.classList.add("player-btn");
      if (selectedStarters.includes(name)) {
        btn.classList.add("selected");
      }

      btn.dataset.player = name;

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

  function logEvent(msg) {
    const li = document.createElement("li");
    const time = new Date().toLocaleTimeString();
    li.textContent = `${time} - ${msg}`;
    log.appendChild(li);
  }

  // Theme toggle
  window.toggleTheme = function () {
    document.body.classList.toggle("dark-mode");
    if (isSelectingStarters) {
      // Delay rendering slightly to ensure CSS finishes applying
      setTimeout(() => renderPlayerButtons("starters"), 50);
    }
  };

  // Set starters
  window.setStarters = function () {
    isSelectingStarters = true;
    renderPlayerButtons("starters");
  };
});
