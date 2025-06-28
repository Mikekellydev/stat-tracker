document.addEventListener("DOMContentLoaded", () => {
  let homePlayers = [
    "Nicholas", "Micah", "Isaiah", "Ethan", "David",
    "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick, Nasib"
  ];

  let selectedStarters = [];
  let onCourtPlayers = [];
  let playerStats = {};
  let teamScore = 0;
  let teamFouls = 0;
  let oppScore = 0;
  let oppFouls = 0;

  let isSelectingStarters = false;
  let currentEvent = "";
  let gameClock = 18 * 60;
  let interval;
  let playingMinutes = {};

  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");
  const homeScore = document.getElementById("homeScore");
  const oppScoreDisplay = document.getElementById("oppScore");
  const teamFoulsDisplay = document.getElementById("teamFouls");
  const oppFoulsDisplay = document.getElementById("oppFouls");
  const gameClockDisplay = document.getElementById("gameClock");
  const summaryBody = document.getElementById("summaryBody");

  homePlayers.forEach(p => {
    playerStats[p] = { "2PT": 0, "3PT": 0, "FT": 0, "Fouls": 0, "Minutes": 0 };
    playingMinutes[p] = 0;
  });

  function renderPlayerButtons(context = "") {
    playerButtonsDiv.innerHTML = "";
    homePlayers.forEach(name => {
      const btn = document.createElement("button");
      const fouls = playerStats[name].Fouls || 0;
      btn.textContent = `${name} (${fouls})`;
      btn.className = "player-btn";
      btn.dataset.player = name;

      if (context === "starters") {
        if (selectedStarters.includes(name)) btn.classList.add("selected");
        btn.onclick = () => {
          toggleStarter(name);
          renderPlayerButtons("starters");
        };
      } else if (context === "event") {
        if (onCourtPlayers.includes(name)) {
          btn.onclick = () => {
            logPlayerEvent(name, currentEvent);
            playerButtonsDiv.innerHTML = "";
          };
        } else {
          btn.disabled = true;
        }
      }

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
        onCourtPlayers = [...selectedStarters];
        logEvent(`Starters set: ${onCourtPlayers.join(", ")}`);
        playerButtonsDiv.innerHTML = "";
        selectedStarters = [];
        isSelectingStarters = false;
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

  function logPlayerEvent(player, type) {
    playerStats[player][type]++;
    let points = 0;
    if (type === "2PT") points = 2;
    if (type === "3PT") points = 3;
    if (type === "FT") points = 1;

    if (["2PT", "3PT", "FT"].includes(type)) {
      teamScore += points;
      homeScore.textContent = teamScore;
    }

    if (type === "Foul") {
      playerStats[player].Fouls++;
      teamFouls++;
      teamFoulsDisplay.textContent = teamFouls;
      if (playerStats[player].Fouls === 4) {
        alert(`${player} has 4 fouls. One away from fouling out!`);
      } else if (playerStats[player].Fouls >= 5) {
        alert(`${player} has fouled out!`);
        onCourtPlayers = onCourtPlayers.filter(p => p !== player);
      }
    }

    logEvent(`${player} - ${type}`);
    updateSummary();
  }

  function logOpponentEvent(type) {
    let points = 0;
    if (type === "2PT") points = 2;
    if (type === "3PT") points = 3;
    if (type === "FT") points = 1;

    if (["2PT", "3PT", "FT"].includes(type)) {
      oppScore += points;
      oppScoreDisplay.textContent = oppScore;
    }

    if (type === "Foul") {
      oppFouls++;
      oppFoulsDisplay.textContent = oppFouls;
    }

    logEvent(`Opponent ${type}`);
  }

  function updateSummary() {
    summaryBody.innerHTML = "";
    homePlayers.forEach(name => {
      const stats = playerStats[name];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${name}</td>
        <td>${stats["2PT"]}</td>
        <td>${stats["3PT"]}</td>
        <td>${stats["FT"]}</td>
        <td>${stats["Fouls"]}</td>
        <td>${stats["2PT"] * 2 + stats["3PT"] * 3 + stats["FT"]}</td>
        <td>${formatTime(stats["Minutes"])}</td>
      `;
      summaryBody.appendChild(row);
    });
  }

  function logEvent(msg) {
    const li = document.createElement("li");
    li.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
    log.appendChild(li);
  }

  function formatTime(seconds) {
    const m = Math.floor(seconds / 60).toString().padStart(2, '0');
    const s = (seconds % 60).toString().padStart(2, '0');
    return `${m}:${s}`;
  }

  function updatePlayerMinutes() {
    onCourtPlayers.forEach(p => playerStats[p].Minutes++);
    updateSummary();
  }

  window.selectEvent = function (type) {
    currentEvent = type;
    renderPlayerButtons("event");
  };

  window.logOpponentEvent = logOpponentEvent;

  window.setStarters = function () {
    isSelectingStarters = true;
    renderPlayerButtons("starters");
  };

  window.startClock = function () {
    if (!interval) {
      interval = setInterval(() => {
        if (gameClock > 0) {
          gameClock--;
          updateClockDisplay();
          updatePlayerMinutes();
        } else {
          clearInterval(interval);
          interval = null;
        }
      }, 1000);
    }
  };

  window.stopClock = function () {
    clearInterval(interval);
    interval = null;
  };

  window.resetClock = function () {
    gameClock = 18 * 60;
    updateClockDisplay();
    clearInterval(interval);
    interval = null;
  };

  function updateClockDisplay() {
    const min = Math.floor(gameClock / 60).toString().padStart(2, '0');
    const sec = (gameClock % 60).toString().padStart(2, '0');
    gameClockDisplay.textContent = `${min}:${sec}`;
  }
});
