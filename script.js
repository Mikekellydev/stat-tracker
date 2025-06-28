document.addEventListener("DOMContentLoaded", () => {
  let homePlayers = [
    "Nicholas", "Micah", "Isaiah", "Ethan", "David",
    "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick"
  ];

  let selectedStarters = [];
  let isSelectingStarters = false;
  let gameClock = 1080; // 18 minutes
  let clockInterval;
  let playerStats = {};
  let onCourtPlayers = [];

  const gameClockDisplay = document.getElementById("gameClock");
  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");
  const summaryBody = document.getElementById("summaryBody");

  homePlayers.forEach(name => {
    playerStats[name] = {
      points2: 0,
      points3: 0,
      ft: 0,
      fouls: 0,
      minutes: 0,
      timeOn: null
    };
  });

  function updateClockDisplay() {
    const minutes = Math.floor(gameClock / 60);
    const seconds = gameClock % 60;
    gameClockDisplay.textContent = `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
  }

  window.startClock = function () {
    if (clockInterval) return;
    clockInterval = setInterval(() => {
      if (gameClock > 0) {
        gameClock--;
        updateClockDisplay();
        updatePlayerMinutes();
      } else {
        clearInterval(clockInterval);
      }
    }, 1000);
  };

  window.stopClock = function () {
    clearInterval(clockInterval);
    clockInterval = null;
  };

  window.resetClock = function () {
    gameClock = 1080;
    updateClockDisplay();
    stopClock();
  };

  function updatePlayerMinutes() {
    onCourtPlayers.forEach(name => {
      if (playerStats[name].timeOn !== null) {
        playerStats[name].minutes++;
      }
    });
  }

  function renderPlayerButtons(context = "") {
    playerButtonsDiv.innerHTML = "";
    homePlayers.forEach(name => {
      const btn = document.createElement("button");
      btn.className = "player-btn";
      btn.textContent = `${name} (${playerStats[name].fouls})`;
      btn.dataset.player = name;

      if (context === "starters") {
        if (selectedStarters.includes(name)) btn.classList.add("selected");
        btn.onclick = () => toggleStarter(name);
      }

      playerButtonsDiv.appendChild(btn);
    });

    if (context === "starters") {
      const submitBtn = document.createElement("button");
      submitBtn.textContent = "Submit Starters";
      submitBtn.onclick = () => {
        if (selectedStarters.length !== 5) {
          alert("Please select exactly 5 starters.");
          return;
        }
        onCourtPlayers = [...selectedStarters];
        onCourtPlayers.forEach(name => playerStats[name].timeOn = Date.now());
        logEvent(`Starters: ${selectedStarters.join(", ")}`);
        renderSummary();
        playerButtonsDiv.innerHTML = "";
        isSelectingStarters = false;
      };
      const cancelBtn = document.createElement("button");
      cancelBtn.textContent = "Cancel";
      cancelBtn.onclick = () => {
        selectedStarters = [];
        playerButtonsDiv.innerHTML = "";
        isSelectingStarters = false;
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
        alert("Only 5 starters allowed.");
        return;
      }
      selectedStarters.push(name);
    }
    renderPlayerButtons("starters");
  }

  function logEvent(msg) {
    const li = document.createElement("li");
    const time = new Date().toLocaleTimeString();
    li.textContent = `${time} - ${msg}`;
    log.appendChild(li);
  }

  window.setStarters = function () {
    isSelectingStarters = true;
    renderPlayerButtons("starters");
  };

  window.selectEvent = function (type) {
    playerButtonsDiv.innerHTML = "";
    onCourtPlayers.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = `${name} (${playerStats[name].fouls})`;
      btn.className = "player-btn";
      btn.onclick = () => {
        if (type === "2PT") playerStats[name].points2 += 2;
        if (type === "3PT") playerStats[name].points3 += 3;
        if (type === "FT") playerStats[name].ft += 1;
        if (type === "Foul") {
          playerStats[name].fouls += 1;
          if (playerStats[name].fouls === 4) alert(`${name} has 4 fouls.`);
          if (playerStats[name].fouls === 5) alert(`${name} has fouled out.`);
        }
        logEvent(`${name} - ${type}`);
        renderSummary();
        playerButtonsDiv.innerHTML = "";
      };
      playerButtonsDiv.appendChild(btn);
    });
  };

  window.logOpponentEvent = function (type) {
    logEvent(`Opponent - ${type}`);
  };

  function formatMinutes(mins) {
    const mm = Math.floor(mins / 60);
    const ss = mins % 60;
    return `${String(mm).padStart(2, '0')}:${String(ss).padStart(2, '0')}`;
  }

  function renderSummary() {
    summaryBody.innerHTML = "";
    homePlayers.forEach(name => {
      const stats = playerStats[name];
      const tr = document.createElement("tr");
      tr.innerHTML = `
        <td>${name}</td>
        <td>${stats.points2 / 2}</td>
        <td>${stats.points3 / 3}</td>
        <td>${stats.ft}</td>
        <td>${stats.fouls}</td>
        <td>${stats.points2 + stats.points3 + stats.ft}</td>
        <td>${formatMinutes(stats.minutes)}</td>
      `;
      summaryBody.appendChild(tr);
    });
  }

  window.toggleTheme = function () {
    document.body.classList.toggle("dark-mode");
    if (isSelectingStarters) renderPlayerButtons("starters");
  };
});
