document.addEventListener("DOMContentLoaded", () => {
  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");
  const homeScoreEl = document.getElementById("homeScore");
  const oppScoreEl = document.getElementById("oppScore");
  const teamFoulsEl = document.getElementById("teamFouls");
  const oppFoulsEl = document.getElementById("oppFouls");
  const summaryBody = document.getElementById("summaryBody");

  const homePlayers = [
    "Nicholas", "Micah", "Isaiah", "Ethan", "David",
    "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick", "Nasib", "Dylan"
  ];

  let onCourtPlayers = [];
  let selectedStarters = [];
  let selectingSub = false;
  let subOut = [];
  let subIn = [];
  let gameClock, clockInterval;
  let homeScore = 0, oppScore = 0;
  let teamFouls = 0, oppFouls = 0;

  const playerStats = {};
  const playerTime = {};
  homePlayers.forEach(p => {
    playerStats[p] = { "2PT": 0, "3PT": 0, "FT": 0, "Fouls": 0 };
    playerTime[p] = { seconds: 0, active: false };
  });

  function updateClockDisplay() {
    const minutes = Math.floor(gameClock / 60).toString().padStart(2, '0');
    const seconds = (gameClock % 60).toString().padStart(2, '0');
    document.getElementById("gameClock").textContent = `${minutes}:${seconds}`;
  }

  function updatePlayTime() {
    onCourtPlayers.forEach(p => {
      if (playerTime[p].active) playerTime[p].seconds++;
    });
  }

  window.startClock = () => {
    if (!clockInterval) {
      clockInterval = setInterval(() => {
        if (gameClock > 0) {
          gameClock--;
          updateClockDisplay();
          updatePlayTime();
        } else {
          stopClock();
        }
      }, 1000);
    }
  };

  window.stopClock = () => {
    clearInterval(clockInterval);
    clockInterval = null;
  };

  window.resetClock = () => {
    stopClock();
    gameClock = 18 * 60;
    updateClockDisplay();
  };

  resetClock();

  function logEvent(text) {
    const time = new Date().toLocaleTimeString();
    const li = document.createElement("li");
    li.textContent = `${time} - ${text}`;
    log.appendChild(li);
  }

  function updateSummary() {
    summaryBody.innerHTML = "";
    homePlayers.forEach(player => {
      const { "2PT": t2, "3PT": t3, "FT": ft, "Fouls": fl } = playerStats[player];
      const pts = t2 * 2 + t3 * 3 + ft;
      const min = Math.floor(playerTime[player].seconds / 60);
      const sec = playerTime[player].seconds % 60;
      const tr = document.createElement("tr");
      tr.innerHTML = `<td>${player}</td><td>${t2}</td><td>${t3}</td><td>${ft}</td><td>${fl}</td><td>${pts}</td><td>${min}:${sec.toString().padStart(2, '0')}</td>`;
      summaryBody.appendChild(tr);
    });
  }

  function updateScores() {
    homeScoreEl.textContent = homeScore;
    oppScoreEl.textContent = oppScore;
    teamFoulsEl.textContent = teamFouls;
    oppFoulsEl.textContent = oppFouls;

    document.getElementById("bonusAlert").textContent =
      teamFouls >= 10 ? " (Double Bonus)" : teamFouls >= 7 ? " (Bonus)" : "";

    document.getElementById("oppBonusAlert").textContent =
      oppFouls >= 10 ? " (Double Bonus)" : oppFouls >= 7 ? " (Bonus)" : "";
  }

  function showPlayerButtons(eventType) {
    playerButtonsDiv.innerHTML = "";
    onCourtPlayers.forEach(player => {
      const btn = document.createElement("button");
      const foulCount = playerStats[player]["Fouls"];
      btn.textContent = `${player} (${foulCount})`;
      btn.classList.add("player-btn");
      btn.onclick = () => {
        if (eventType === "2PT") {
          playerStats[player]["2PT"]++;
          homeScore += 2;
        } else if (eventType === "3PT") {
          playerStats[player]["3PT"]++;
          homeScore += 3;
        } else if (eventType === "FT") {
          playerStats[player]["FT"]++;
          homeScore += 1;
        } else if (eventType === "Foul") {
          playerStats[player]["Fouls"]++;
          teamFouls++;
          if (playerStats[player]["Fouls"] === 4) {
            alert(`${player} has 4 fouls (one away from fouling out).`);
          }
          if (playerStats[player]["Fouls"] === 5) {
            alert(`${player} has fouled out!`);
          }
        }

        logEvent(`${eventType} by ${player}`);
        updateScores();
        updateSummary();
        playerButtonsDiv.innerHTML = "";
      };
      playerButtonsDiv.appendChild(btn);
    });

    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.className = "cancel-btn";
    cancel.onclick = () => (playerButtonsDiv.innerHTML = "");
    playerButtonsDiv.appendChild(cancel);
  }

  window.selectEvent = type => showPlayerButtons(type);

  window.logOpponentEvent = type => {
    if (type === "2PT") oppScore += 2;
    else if (type === "3PT") oppScore += 3;
    else if (type === "FT") oppScore += 1;
    else if (type === "Foul") oppFouls++;

    logEvent(`Opponent ${type}`);
    updateScores();
    updateSummary();
  };

  window.setStarters = () => {
    playerButtonsDiv.innerHTML = "";
    selectedStarters = [];

    homePlayers.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.classList.add("player-btn");
      btn.onclick = () => {
        if (selectedStarters.includes(name)) {
          selectedStarters = selectedStarters.filter(p => p !== name);
          btn.classList.remove("selected");
        } else {
          if (selectedStarters.length >= 5) {
            alert("Only 5 starters allowed.");
            return;
          }
          selectedStarters.push(name);
          btn.classList.add("selected");
        }
      };
      playerButtonsDiv.appendChild(btn);
    });

    const submitBtn = document.createElement("button");
    submitBtn.textContent = "Submit Starters";
    submitBtn.className = "submit-btn";
    submitBtn.onclick = () => {
      if (selectedStarters.length !== 5) {
        alert("You must select exactly 5 starters.");
        return;
      }
      onCourtPlayers = [...selectedStarters];
      selectedStarters.forEach(p => (playerTime[p].active = true));
      logEvent(`Starters: ${selectedStarters.join(", ")}`);
      playerButtonsDiv.innerHTML = "";
      updateSummary();
    };

    const cancelBtn = document.createElement("button");
    cancelBtn.textContent = "Cancel";
    cancelBtn.className = "cancel-btn";
    cancelBtn.onclick = () => {
      selectedStarters = [];
      playerButtonsDiv.innerHTML = "";
    };

    playerButtonsDiv.appendChild(submitBtn);
    playerButtonsDiv.appendChild(cancelBtn);
  };

  window.makeSubstitution = () => {
    playerButtonsDiv.innerHTML = "";
    subOut = [];
    subIn = [];
    selectingSub = true;

    homePlayers.forEach(name => {
      const btn = document.createElement("button");
      btn.textContent = name;
      btn.classList.add("player-btn");

      if (onCourtPlayers.includes(name)) {
        btn.classList.add("sub-out");
        btn.onclick = () => {
          subOut.push(name);
          btn.classList.add("selected");
        };
      } else {
        btn.classList.add("sub-in");
        btn.onclick = () => {
          subIn.push(name);
          btn.classList.add("selected");
        };
      }

      playerButtonsDiv.appendChild(btn);
    });

    const submit = document.createElement("button");
    submit.textContent = "Confirm Subs";
    submit.className = "submit-btn";
    submit.onclick = () => {
      subOut.forEach(p => {
        const idx = onCourtPlayers.indexOf(p);
        if (idx > -1) {
          onCourtPlayers.splice(idx, 1);
          playerTime[p].active = false;
        }
      });

      subIn.forEach(p => {
        if (onCourtPlayers.length < 5) {
          onCourtPlayers.push(p);
          playerTime[p].active = true;
        }
      });

      logEvent(`Substitutions: OUT - ${subOut.join(", ")}, IN - ${subIn.join(", ")}`);
      playerButtonsDiv.innerHTML = "";
      updateSummary();
    };

    const cancel = document.createElement("button");
    cancel.textContent = "Cancel";
    cancel.className = "cancel-btn";
    cancel.onclick = () => {
      selectingSub = false;
      playerButtonsDiv.innerHTML = "";
    };

    playerButtonsDiv.appendChild(submit);
    playerButtonsDiv.appendChild(cancel);
  };

  window.exportCSV = () => {
    let csv = "Player,2PT,3PT,FT,Fouls,Total Points,Minutes\n";
    homePlayers.forEach(p => {
      const s = playerStats[p];
      const total = s["2PT"] * 2 + s["3PT"] * 3 + s["FT"];
      const min = Math.floor(playerTime[p].seconds / 60);
      const sec = playerTime[p].seconds % 60;
      csv += `${p},${s["2PT"]},${s["3PT"]},${s["FT"]},${s["Fouls"]},${total},${min}:${sec
        .toString()
        .padStart(2, "0")}\n`;
    });

    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const a = document.createElement("a");
    a.href = url;
    a.download = "game_summary.csv";
    a.click();
    URL.revokeObjectURL(url);
  };

  window.toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
  };
});