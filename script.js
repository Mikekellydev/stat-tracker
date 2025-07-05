document.addEventListener("DOMContentLoaded", () => {
  let homePlayers = [];
  let onCourtPlayers = [];
  let selectedStarters = [];
  let isSelectingStarters = false;
  let currentEvent = "";
  let playerStats = {};
  let gameClock = 18 * 60;
  let clockInterval = null;

  const playerForm = document.getElementById("playerForm");
  const playerInput = document.getElementById("playerInput");
  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");
  const summaryBody = document.getElementById("summaryBody");

  // Clock controls
  window.startClock = () => {
    if (!clockInterval) {
      clockInterval = setInterval(() => {
        if (gameClock > 0) {
          gameClock--;
          updateClockDisplay();
        }
      }, 1000);
    }
  };

  window.stopClock = () => clearInterval(clockInterval);
  window.resetClock = () => {
    stopClock();
    gameClock = 18 * 60;
    updateClockDisplay();
  };

  function updateClockDisplay() {
    const minutes = Math.floor(gameClock / 60).toString().padStart(2, "0");
    const seconds = (gameClock % 60).toString().padStart(2, "0");
    document.getElementById("gameClock").textContent = `${minutes}:${seconds}`;
  }

  function renderPlayerButtons(context = "") {
    playerButtonsDiv.innerHTML = "";
    homePlayers.forEach(player => {
      const btn = document.createElement("button");
      btn.textContent = `${player}${getFoulDisplay(player)}`;
      btn.classList.add("player-btn");
      if (onCourtPlayers.includes(player)) btn.classList.add("on-court");

      btn.onclick = () => {
        if (isSelectingStarters) {
          toggleStarter(player);
          renderPlayerButtons("starters");
        } else if (currentEvent && onCourtPlayers.includes(player)) {
          logPlayerEvent(player, currentEvent);
          currentEvent = "";
          playerButtonsDiv.innerHTML = "";
        }
      };

      playerButtonsDiv.appendChild(btn);
    });

    if (context === "starters") {
      const submitBtn = document.createElement("button");
      submitBtn.textContent = "Submit Starters";
      submitBtn.onclick = () => {
        if (selectedStarters.length !== 5) {
          alert("Select exactly 5 starters.");
          return;
        }
        onCourtPlayers = [...selectedStarters];
        selectedStarters.forEach(p => initStats(p));
        logEvent(`Starters set: ${selectedStarters.join(", ")}`);
        selectedStarters = [];
        isSelectingStarters = false;
        renderSummary();
        playerButtonsDiv.innerHTML = "";
      };

      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = () => {
        selectedStarters = [];
        isSelectingStarters = false;
        playerButtonsDiv.innerHTML = "";
      };

      playerButtonsDiv.appendChild(submitBtn);
      playerButtonsDiv.appendChild(cancelBtn);
    }
  }

  function toggleStarter(player) {
    if (selectedStarters.includes(player)) {
      selectedStarters = selectedStarters.filter(p => p !== player);
    } else if (selectedStarters.length < 5) {
      selectedStarters.push(player);
    } else {
      alert("Only 5 players can be selected.");
    }
  }

  function initStats(player) {
    if (!playerStats[player]) {
      playerStats[player] = { "2PT": 0, "3PT": 0, "FT": 0, Foul: 0, Minutes: 0 };
    }
  }

  function getFoulDisplay(player) {
    const fouls = playerStats[player]?.Foul || 0;
    return fouls > 0 ? ` (${fouls})` : "";
  }

  function logPlayerEvent(player, type) {
    initStats(player);
    playerStats[player][type]++;
    const points = type === "2PT" ? 2 : type === "3PT" ? 3 : type === "FT" ? 1 : 0;
    if (points) {
      document.getElementById("homeScore").textContent =
        parseInt(document.getElementById("homeScore").textContent) + points;
    }

    if (type === "Foul") {
      document.getElementById("teamFouls").textContent =
        parseInt(document.getElementById("teamFouls").textContent) + 1;
    }

    checkBonus();
    renderSummary();
    logEvent(`${player} - ${type}`);
  }

  function checkBonus() {
    const fouls = parseInt(document.getElementById("teamFouls").textContent);
    const bonusText = document.getElementById("bonusAlert");
    bonusText.textContent = fouls >= 10 ? " (Double Bonus)" : fouls >= 7 ? " (Bonus)" : "";
  }

  function logEvent(msg) {
    const li = document.createElement("li");
    const time = new Date().toLocaleTimeString();
    li.textContent = `${time} - ${msg}`;
    log.appendChild(li);
  }

  function renderSummary() {
    summaryBody.innerHTML = "";
    Object.keys(playerStats).forEach(player => {
      const s = playerStats[player];
      const total = s["2PT"] * 2 + s["3PT"] * 3 + s["FT"];
      const row = `
        <tr>
          <td>${player}</td>
          <td>${s["2PT"]}</td>
          <td>${s["3PT"]}</td>
          <td>${s["FT"]}</td>
          <td>${s["Foul"]}</td>
          <td>${total}</td>
          <td>${formatMinutes(s.Minutes || 0)}</td>
        </tr>
      `;
      summaryBody.insertAdjacentHTML("beforeend", row);
    });
  }

  function formatMinutes(seconds) {
    const min = Math.floor(seconds / 60).toString().padStart(2, "0");
    const sec = (seconds % 60).toString().padStart(2, "0");
    return `${min}:${sec}`;
  }

  // Player form handler
  playerForm.addEventListener("submit", e => {
    e.preventDefault();
    const name = playerInput.value.trim();
    if (name && !homePlayers.includes(name)) {
      homePlayers.push(name);
      playerInput.value = "";
      renderPlayerButtons();
    }
  });

  // Opponent event logging
  window.logOpponentEvent = function (type) {
    const points = type === "2PT" ? 2 : type === "3PT" ? 3 : type === "FT" ? 1 : 0;
    if (points) {
      document.getElementById("oppScore").textContent =
        parseInt(document.getElementById("oppScore").textContent) + points;
    }
    if (type === "Foul") {
      const oppFouls = document.getElementById("oppFouls");
      let count = parseInt(oppFouls.textContent) + 1;
      oppFouls.textContent = count;
      const oppBonus = document.getElementById("bonusAlert");
      oppBonus.textContent = count >= 10 ? " (Double Bonus)" : count >= 7 ? " (Bonus)" : "";
    }
    logEvent(`Opponent ${type}`);
  };

  // Event selector
  window.selectEvent = function (type) {
    currentEvent = type;
    renderPlayerButtons("event");
  };

  window.setStarters = function () {
    isSelectingStarters = true;
    renderPlayerButtons("starters");
  };

  window.toggleTheme = function () {
    document.body.classList.toggle("dark-mode");
    if (isSelectingStarters) renderPlayerButtons("starters");
  };
});