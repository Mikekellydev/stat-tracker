document.addEventListener("DOMContentLoaded", () => {
  const homePlayers = [
    "Nicholas", "Micah", "Isaiah", "Ethan", "David",
    "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick", "Nasib"
  ];
  let starters = [];
  let onCourtPlayers = [];
  let fouls = {};
  let stats = {};
  let playerTime = {};
  let substitutionMode = false;
  let clockInterval;
  let clockSeconds = 18 * 60;

  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");
  const summaryBody = document.getElementById("summaryBody");
  const homeScoreEl = document.getElementById("homeScore");
  const oppScoreEl = document.getElementById("oppScore");

  homePlayers.forEach(name => {
    stats[name] = { "2PT": 0, "3PT": 0, "FT": 0, "Fouls": 0, "Minutes": 0 };
    fouls[name] = 0;
    playerTime[name] = { seconds: 0, active: false };
  });

  function formatTime(sec) {
    const m = String(Math.floor(sec / 60)).padStart(2, '0');
    const s = String(sec % 60).padStart(2, '0');
    return `${m}:${s}`;
  }

  function updateClockDisplay() {
    document.getElementById("gameClock").textContent = formatTime(clockSeconds);
  }

  function tickClock() {
    if (clockSeconds > 0) {
      clockSeconds--;
      onCourtPlayers.forEach(p => {
        if (playerTime[p]) playerTime[p].seconds++;
      });
      updateClockDisplay();
    } else {
      clearInterval(clockInterval);
    }
  }

  window.startClock = function () {
    if (!clockInterval) {
      clockInterval = setInterval(tickClock, 1000);
    }
  };

  window.stopClock = function () {
    clearInterval(clockInterval);
    clockInterval = null;
  };

  window.resetClock = function () {
    stopClock();
    clockSeconds = 18 * 60;
    updateClockDisplay();
  };

  function logEvent(msg) {
    const time = new Date().toLocaleTimeString();
    const li = document.createElement("li");
    li.textContent = `${time} - ${msg}`;
    log.appendChild(li);
  }

  function renderPlayerButtons(context) {
    playerButtonsDiv.innerHTML = "";
    homePlayers.forEach(name => {
      const btn = document.createElement("button");
      const foulCount = stats[name].Fouls;
      btn.textContent = `${name} (${foulCount})`;
      btn.className = "player-btn";
      if (onCourtPlayers.includes(name)) btn.classList.add("on-court");

      if (context === "event") {
        if (onCourtPlayers.includes(name)) {
          btn.onclick = () => {
            applyStat(name, selectedEvent);
            playerButtonsDiv.innerHTML = "";
          };
        } else {
          btn.disabled = true;
        }
      }

      if (context === "sub") {
        if (onCourtPlayers.includes(name)) {
          btn.classList.add("sub-out");
          btn.onclick = () => {
            btn.classList.toggle("selected");
            btn.dataset.action = btn.classList.contains("selected") ? "off" : "";
          };
        } else {
          btn.classList.add("sub-in");
          btn.onclick = () => {
            btn.classList.toggle("selected");
            btn.dataset.action = btn.classList.contains("selected") ? "on" : "";
          };
        }
      }

      playerButtonsDiv.appendChild(btn);
    });

    if (context === "sub") {
      const submitBtn = document.createElement("button");
      submitBtn.textContent = "Submit Subs";
      submitBtn.className = "submit-btn";
      submitBtn.onclick = () => {
        const subsOut = [...document.querySelectorAll(".sub-out.selected")].map(btn => btn.textContent.split(" (")[0]);
        const subsIn = [...document.querySelectorAll(".sub-in.selected")].map(btn => btn.textContent.split(" (")[0]);

        if (onCourtPlayers.length - subsOut.length + subsIn.length > 5) {
          alert("Cannot have more than 5 players on court.");
          return;
        }

        onCourtPlayers = onCourtPlayers.filter(p => !subsOut.includes(p)).concat(subsIn);
        logEvent(`Substitution: Out - ${subsOut.join(", ")}, In - ${subsIn.join(", ")}`);
        playerButtonsDiv.innerHTML = "";
        updateSummary();
      };
      playerButtonsDiv.appendChild(submitBtn);
    }
  }

  function applyStat(player, event) {
    if (event === "Foul") {
      stats[player].Fouls++;
      if (stats[player].Fouls === 4) {
        alert(`${player} is close to fouling out!`);
      }
      if (stats[player].Fouls === 5) {
        alert(`${player} has fouled out!`);
        onCourtPlayers = onCourtPlayers.filter(p => p !== player);
      }
    } else {
      stats[player][event]++;
    }

    updateScoreboard();
    updateSummary();
    logEvent(`${player} - ${event}`);
  }

  function updateScoreboard() {
    const total = (player) => stats[player]["2PT"] * 2 + stats[player]["3PT"] * 3 + stats[player]["FT"];
    const homeTotal = homePlayers.reduce((sum, p) => sum + total(p), 0);
    homeScoreEl.textContent = homeTotal;
  }

  function updateSummary() {
    summaryBody.innerHTML = "";
    homePlayers.forEach(player => {
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${player}</td>
        <td>${stats[player]["2PT"]}</td>
        <td>${stats[player]["3PT"]}</td>
        <td>${stats[player]["FT"]}</td>
        <td>${stats[player]["Fouls"]}</td>
        <td>${stats[player]["2PT"] * 2 + stats[player]["3PT"] * 3 + stats[player]["FT"]}</td>
        <td>${formatTime(playerTime[player].seconds)}</td>
      `;
      summaryBody.appendChild(row);
    });
  }

  let selectedEvent = null;

  window.selectEvent = function (eventType) {
    selectedEvent = eventType;
    renderPlayerButtons("event");
  };

  window.logOpponentEvent = function (type) {
    const pts = type === "2PT" ? 2 : type === "3PT" ? 3 : type === "FT" ? 1 : 0;
    if (pts > 0) {
      oppScoreEl.textContent = parseInt(oppScoreEl.textContent) + pts;
    }
    logEvent(`Opponent ${type}`);
  };

  window.setStarters = function () {
    renderPlayerButtons("sub");
    alert("Select 5 players as starters and click Submit Subs.");
  };

  window.makeSubstitution = function () {
    renderPlayerButtons("sub");
  };

  window.exportCSV = function () {
    let csv = "Player,2PT,3PT,FT,Fouls,Total Points,Minutes\n";
    homePlayers.forEach(p => {
      const stat = stats[p];
      const total = stat["2PT"] * 2 + stat["3PT"] * 3 + stat["FT"];
      csv += `${p},${stat["2PT"]},${stat["3PT"]},${stat["FT"]},${stat["Fouls"]},${total},${formatTime(playerTime[p].seconds)}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "game_summary.csv";
    a.click();
  };

  updateClockDisplay();
});