document.addEventListener("DOMContentLoaded", () => {
  let homePlayers = [];
  let selectedStarters = [];
  let onCourt = [];
  let gameLog = [];
  let gameClock = 1080; // 18 minutes in seconds
  let clockInterval = null;
  let currentEvent = null;

  const elements = {
    playerList: document.getElementById("playerList"),
    playerButtons: document.getElementById("playerButtons"),
    log: document.getElementById("log"),
    homeScore: document.getElementById("homeScore"),
    oppScore: document.getElementById("oppScore"),
    teamFouls: document.getElementById("teamFouls"),
    oppFouls: document.getElementById("oppFouls"),
    bonusAlert: document.getElementById("bonusAlert"),
    oppBonusAlert: document.getElementById("oppBonusAlert"),
    gameClock: document.getElementById("gameClock"),
    summaryBody: document.getElementById("summaryBody")
  };

  function renderPlayerList() {
    elements.playerList.innerHTML = homePlayers.map(name => `<span>${name}</span>`).join(", ");
  }

  window.addPlayer = function () {
    const input = document.getElementById("newPlayerName");
    const name = input.value.trim();
    if (name && !homePlayers.includes(name)) {
      homePlayers.push(name);
      renderPlayerList();
      input.value = "";
    }
  };

  window.confirmRoster = function () {
    alert("Roster confirmed. Ready to set starters.");
  };

  function updateClockDisplay() {
    const min = Math.floor(gameClock / 60).toString().padStart(2, "0");
    const sec = (gameClock % 60).toString().padStart(2, "0");
    elements.gameClock.textContent = `${min}:${sec}`;
  }

  window.startClock = function () {
    if (!clockInterval) {
      clockInterval = setInterval(() => {
        if (gameClock > 0) {
          gameClock--;
          updateClockDisplay();
        } else {
          clearInterval(clockInterval);
        }
      }, 1000);
    }
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

  function renderPlayerButtons(context) {
    elements.playerButtons.innerHTML = "";
    const pool = context === "starters" ? homePlayers : onCourt;
    pool.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = `${name}`;
      btn.onclick = () => handlePlayerAction(name, context);
      elements.playerButtons.appendChild(btn);
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit";
    submitBtn.onclick = () => {
      if (context === "starters" && selectedStarters.length === 5) {
        onCourt = [...selectedStarters];
        logEvent(`Starters set: ${onCourt.join(", ")}`);
        elements.playerButtons.innerHTML = "";
      } else if (context === "event") {
        elements.playerButtons.innerHTML = "";
      } else {
        alert("Select 5 players.");
      }
    };
    elements.playerButtons.appendChild(submitBtn);

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.onclick = () => {
      selectedStarters = [];
      currentEvent = null;
      elements.playerButtons.innerHTML = "";
    };
    elements.playerButtons.appendChild(cancelBtn);
  }

  function handlePlayerAction(name, context) {
    if (context === "starters") {
      if (selectedStarters.includes(name)) {
        selectedStarters = selectedStarters.filter(n => n !== name);
      } else {
        if (selectedStarters.length >= 5) {
          alert("Only 5 starters allowed.");
          return;
        }
        selectedStarters.push(name);
      }
    } else if (context === "event") {
      logEvent(`${name} ${currentEvent}`);
      updateScoreOrFoul(name, currentEvent);
      updateSummary();
    }
  }

  window.setStarters = function () {
    selectedStarters = [];
    renderPlayerButtons("starters");
  };

  window.makeSubstitution = function () {
    renderPlayerButtons("starters");
  };

  window.selectEvent = function (eventType) {
    currentEvent = eventType;
    renderPlayerButtons("event");
  };

  function updateScoreOrFoul(player, type) {
    if (!playerStats[player]) playerStats[player] = { "2PT": 0, "3PT": 0, "FT": 0, Fouls: 0 };

    if (["2PT", "3PT", "FT"].includes(type)) {
      playerStats[player][type]++;
      let score = parseInt(elements.homeScore.textContent);
      score += type === "2PT" ? 2 : type === "3PT" ? 3 : 1;
      elements.homeScore.textContent = score;
    } else if (type === "Foul") {
      playerStats[player].Fouls++;
      let fouls = parseInt(elements.teamFouls.textContent) + 1;
      elements.teamFouls.textContent = fouls;
      checkBonus(fouls, "team");
    }
  }

  window.logOpponentEvent = function (type) {
    logEvent(`Opponent ${type}`);
    if (["2PT", "3PT", "FT"].includes(type)) {
      let score = parseInt(elements.oppScore.textContent);
      score += type === "2PT" ? 2 : type === "3PT" ? 3 : 1;
      elements.oppScore.textContent = score;
    } else if (type === "Foul") {
      let fouls = parseInt(elements.oppFouls.textContent) + 1;
      elements.oppFouls.textContent = fouls;
      checkBonus(fouls, "opp");
    }
  };

  function checkBonus(fouls, team) {
    const alertBox = team === "team" ? elements.bonusAlert : elements.oppBonusAlert;
    if (fouls === 7) {
      alertBox.textContent = "Bonus!";
    } else if (fouls === 10) {
      alertBox.textContent = "Double Bonus!";
    }
  }

  function logEvent(text) {
    const li = document.createElement("li");
    li.textContent = `${new Date().toLocaleTimeString()} - ${text}`;
    elements.log.appendChild(li);
  }

  let playerStats = {};

  function updateSummary() {
    elements.summaryBody.innerHTML = "";
    for (const player in playerStats) {
      const stats = playerStats[player];
      const row = document.createElement("tr");
      row.innerHTML = `
        <td>${player}</td>
        <td>${stats["2PT"]}</td>
        <td>${stats["3PT"]}</td>
        <td>${stats["FT"]}</td>
        <td>${stats.Fouls}</td>
        <td>${(2 * stats["2PT"]) + (3 * stats["3PT"]) + stats["FT"]}</td>
        <td>–</td>
      `;
      elements.summaryBody.appendChild(row);
    }
  }

  window.exportCSV = function () {
    let csv = "Player,2PT,3PT,FT,Fouls,Total Points\n";
    for (const player in playerStats) {
      const s = playerStats[player];
      const total = (2 * s["2PT"]) + (3 * s["3PT"]) + s["FT"];
      csv += `${player},${s["2PT"]},${s["3PT"]},${s["FT"]},${s.Fouls},${total}\n`;
    }
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "game_stats.csv";
    a.click();
  };

  window.saveGame = function () {
    const data = {
      playerStats,
      gameLog,
      score: {
        home: elements.homeScore.textContent,
        opp: elements.oppScore.textContent
      },
      fouls: {
        team: elements.teamFouls.textContent,
        opp: elements.oppFouls.textContent
      }
    };
    localStorage.setItem("savedGame", JSON.stringify(data));
    alert("Game saved.");
  };

  window.loadGame = function () {
    const data = JSON.parse(localStorage.getItem("savedGame"));
    if (!data) return alert("No saved game found.");
    playerStats = data.playerStats;
    elements.homeScore.textContent = data.score.home;
    elements.oppScore.textContent = data.score.opp;
    elements.teamFouls.textContent = data.fouls.team;
    elements.oppFouls.textContent = data.fouls.opp;
    updateSummary();
  };
});