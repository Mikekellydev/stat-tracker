document.addEventListener("DOMContentLoaded", () => {
  
  let selectedStarters = [];
  let playersOnCourt = [];
  let playerStats = {};
  let isSelectingStarters = false;
  let isSubstituting = false;
  let currentEvent = null;
  let gameClock = 18 * 60;
  let clockInterval = null;
  let playingTimeTrackers = {};

// Season Tracker: Player Name Handling
document.addEventListener("DOMContentLoaded", () => {
  const playerForm = document.getElementById("playerForm");
  const playerInput = document.getElementById("playerNameInput");
  const playerList = document.getElementById("playerList");

  // Load saved players
  let savedPlayers = JSON.parse(localStorage.getItem("seasonPlayers")) || [];
  renderPlayerList(savedPlayers);

  playerForm.addEventListener("submit", function (e) {
    e.preventDefault();
    const name = playerInput.value.trim();
    if (name && !savedPlayers.includes(name)) {
      savedPlayers.push(name);
      localStorage.setItem("seasonPlayers", JSON.stringify(savedPlayers));
      renderPlayerList(savedPlayers);
      playerInput.value = "";
    }
  });

  function renderPlayerList(players) {
    playerList.innerHTML = "";
    players.forEach(name => {
      const li = document.createElement("li");
      li.textContent = name;
      playerList.appendChild(li);
    });
  }
});
  // End of Season Tracker: Player Name Handling
  


  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");
  const homeScore = document.getElementById("homeScore");
  const oppScore = document.getElementById("oppScore");
  const teamFouls = document.getElementById("teamFouls");
  const oppFouls = document.getElementById("oppFouls");
  const bonusAlert = document.getElementById("bonusAlert");
  const oppBonusAlert = document.getElementById("oppBonusAlert");
  const summaryBody = document.getElementById("summaryBody");
  const gameClockDisplay = document.getElementById("gameClock");

  function updateClockDisplay() {
    let min = Math.floor(gameClock / 60);
    let sec = gameClock % 60;
    gameClockDisplay.textContent = `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function startClock() {
    if (!clockInterval) {
      clockInterval = setInterval(() => {
        if (gameClock > 0) {
          gameClock--;
          updateClockDisplay();
          updatePlayerTime();
        } else {
          stopClock();
        }
      }, 1000);
    }
  }

  function stopClock() {
    clearInterval(clockInterval);
    clockInterval = null;
  }

  function resetClock() {
    stopClock();
    gameClock = 18 * 60;
    updateClockDisplay();
  }

  function updatePlayerTime() {
    playersOnCourt.forEach(name => {
      if (!playerStats[name]) initStats(name);
      playerStats[name].seconds++;
      updateSummaryTable();
    });
  }

  function toggleTheme() {
    document.body.classList.toggle("dark-mode");
    if (isSelectingStarters) renderPlayerButtons("starters");
    if (isSubstituting) renderPlayerButtons("subs");
  }

  function initStats(name) {
    playerStats[name] = {
      "2PT": 0, "3PT": 0, "FT": 0, "Fouls": 0, seconds: 0
    };
  }

  function formatTime(seconds) {
    const min = Math.floor(seconds / 60);
    const sec = seconds % 60;
    return `${String(min).padStart(2, '0')}:${String(sec).padStart(2, '0')}`;
  }

  function updateSummaryTable() {
    summaryBody.innerHTML = "";
    homePlayers.forEach(name => {
      const stats = playerStats[name] || { "2PT": 0, "3PT": 0, "FT": 0, "Fouls": 0, seconds: 0 };
      const total = stats["2PT"] * 2 + stats["3PT"] * 3 + stats["FT"];
      const row = `<tr>
        <td>${name}</td>
        <td>${stats["2PT"]}</td>
        <td>${stats["3PT"]}</td>
        <td>${stats["FT"]}</td>
        <td>${stats["Fouls"]}</td>
        <td>${total}</td>
        <td>${formatTime(stats.seconds)}</td>
      </tr>`;
      summaryBody.innerHTML += row;
    });
  }

  function logEvent(msg) {
    const li = document.createElement("li");
    const time = new Date().toLocaleTimeString();
    li.textContent = `${time} - ${msg}`;
    log.appendChild(li);
  }

  function selectEvent(type) {
    currentEvent = type;
    renderPlayerButtons("event");
  }

  function handlePlayerEvent(name) {
    if (!playersOnCourt.includes(name)) return;
    initStats(name);
    if (currentEvent === "Foul") {
      playerStats[name]["Fouls"]++;
      teamFouls.textContent = parseInt(teamFouls.textContent) + 1;
      logEvent(`${name} committed a foul. (${playerStats[name]["Fouls"]})`);

      if (parseInt(teamFouls.textContent) === 7) {
        bonusAlert.textContent = " - Bonus!";
      } else if (parseInt(teamFouls.textContent) === 10) {
        bonusAlert.textContent = " - Double Bonus!";
      }

      if (playerStats[name]["Fouls"] === 4) {
        alert(`${name} has 4 fouls. One more and they're out!`);
      } else if (playerStats[name]["Fouls"] === 5) {
        alert(`${name} has fouled out!`);
        playersOnCourt = playersOnCourt.filter(p => p !== name);
      }
    } else {
      playerStats[name][currentEvent]++;
      let points = currentEvent === "2PT" ? 2 : currentEvent === "3PT" ? 3 : 1;
      homeScore.textContent = parseInt(homeScore.textContent) + points;
      logEvent(`${name} scored ${points} points (${currentEvent})`);
    }
    updateSummaryTable();
    playerButtonsDiv.innerHTML = "";
  }

  function logOpponentEvent(type) {
    let points = 0;
    if (type === "2PT") points = 2;
    if (type === "3PT") points = 3;
    if (type === "FT") points = 1;
    if (type === "Foul") {
      oppFouls.textContent = parseInt(oppFouls.textContent) + 1;
      if (parseInt(oppFouls.textContent) === 7) {
        oppBonusAlert.textContent = " - Bonus!";
      } else if (parseInt(oppFouls.textContent) === 10) {
        oppBonusAlert.textContent = " - Double Bonus!";
      }
      logEvent(`Opponent committed a foul.`);
      return;
    }
    oppScore.textContent = parseInt(oppScore.textContent) + points;
    logEvent(`Opponent scored ${points} points (${type})`);
  }

  function renderPlayerButtons(context = "") {
    playerButtonsDiv.innerHTML = "";
    homePlayers.forEach(name => {
      const stats = playerStats[name] || {};
      const foulCount = stats["Fouls"] || 0;

      const btn = document.createElement("button");
      btn.textContent = `${name} (${foulCount})`;
      btn.classList.add("player-btn");

      if (playersOnCourt.includes(name)) {
        btn.classList.add("active");
      }

      if (context === "starters" && selectedStarters.includes(name)) {
        btn.classList.add("selected");
      }

      if (context === "subs") {
        btn.onclick = () => toggleSub(name, btn);
      } else if (context === "event") {
        btn.onclick = () => handlePlayerEvent(name);
      } else if (context === "starters") {
        btn.onclick = () => {
          toggleStarter(name);
          renderPlayerButtons("starters");
        };
      }

      playerButtonsDiv.appendChild(btn);
    });

    if (context === "starters") {
      const submit = document.createElement("button");
      submit.textContent = "Submit Starters";
      submit.onclick = () => {
        if (selectedStarters.length !== 5) {
          alert("Select exactly 5 starters.");
          return;
        }
        playersOnCourt = [...selectedStarters];
        selectedStarters.forEach(name => initStats(name));
        logEvent(`Starters set: ${playersOnCourt.join(", ")}`);
        updateSummaryTable();
        renderPlayerButtons();
      };
      playerButtonsDiv.appendChild(submit);
    }

    if (context === "subs") {
      const submit = document.createElement("button");
      submit.textContent = "Submit Substitution";
      submit.onclick = () => {
        playersOnCourt = [...subIn];
        logEvent(`Substitution: Now on court: ${playersOnCourt.join(", ")}`);
        updateSummaryTable();
        renderPlayerButtons();
      };
      playerButtonsDiv.appendChild(submit);
    }
  }

  let subIn = [];

  function toggleSub(name, btn) {
    if (playersOnCourt.includes(name)) {
      btn.classList.toggle("onCourt");
    } else {
      btn.classList.toggle("subIn");
      if (!subIn.includes(name)) {
        subIn.push(name);
      } else {
        subIn = subIn.filter(n => n !== name);
      }
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

  window.startClock = startClock;
  window.stopClock = stopClock;
  window.resetClock = resetClock;
  window.toggleTheme = toggleTheme;
  window.setStarters = () => {
    selectedStarters = [];
    isSelectingStarters = true;
    renderPlayerButtons("starters");
  };
  window.makeSubstitution = () => {
    isSubstituting = true;
    subIn = [...playersOnCourt];
    renderPlayerButtons("subs");
  };
  window.selectEvent = selectEvent;
  window.logOpponentEvent = logOpponentEvent;
});