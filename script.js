// Replace this with your full finalized script logic
document.addEventListener("DOMContentLoaded", () => {
  let homeScore = 0;
  let oppScore = 0;
  let teamFouls = 0;
  let oppFouls = 0;

  // Placeholder players (you can dynamically update this)
  const players = ['Nicholas', 'Micah', 'Isaiah', 'Ethan', 'David'];
  const playerStats = {};
  let selectedEvent = null;
  let onCourtPlayers = [];

  players.forEach(name => {
    playerStats[name] = { "2PT": 0, "3PT": 0, "FT": 0, "Foul": 0 };
  });

  const playerButtonsDiv = document.getElementById("playerButtons");
  const log = document.getElementById("log");

  function updateFoulsUI() {
    document.getElementById("teamFouls").textContent = teamFouls;
    document.getElementById("oppFouls").textContent = oppFouls;
    document.getElementById("bonusAlert").textContent = teamFouls >= 7 ? (teamFouls >= 10 ? " (Double Bonus!)" : " (Bonus)") : "";
    document.getElementById("oppBonusAlert").textContent = oppFouls >= 7 ? (oppFouls >= 10 ? " (Double Bonus!)" : " (Bonus)") : "";
  }

  window.selectEvent = (type) => {
    selectedEvent = type;
    playerButtonsDiv.innerHTML = '';
    onCourtPlayers.forEach(name => {
      const btn = document.createElement('button');
      btn.textContent = `${name} (${playerStats[name]["Foul"]})`;
      btn.onclick = () => logPlayerEvent(name);
      playerButtonsDiv.appendChild(btn);
    });
  };

  window.logOpponentEvent = (type) => {
    if (type === "Foul") {
      oppFouls++;
      updateFoulsUI();
    }
    if (["2PT", "3PT", "FT"].includes(type)) {
      oppScore += type === "3PT" ? 3 : type === "2PT" ? 2 : 1;
      document.getElementById("oppScore").textContent = oppScore;
    }
    const time = new Date().toLocaleTimeString();
    log.innerHTML += `<li>${time} - Opponent ${type}</li>`;
  };

  function logPlayerEvent(name) {
    const time = new Date().toLocaleTimeString();
    const type = selectedEvent;
    playerStats[name][type]++;
    if (type === "Foul") {
      teamFouls++;
      if (playerStats[name][type] === 4) alert(`${name} has 4 fouls!`);
      if (playerStats[name][type] === 5) alert(`${name} has fouled out!`);
    }
    updateFoulsUI();
    document.getElementById("homeScore").textContent = homeScore += type === "3PT" ? 3 : type === "2PT" ? 2 : type === "FT" ? 1 : 0;
    log.innerHTML += `<li>${time} - ${name} ${type}</li>`;
    updateSummary();
  }

  function updateSummary() {
    const tbody = document.getElementById("summaryBody");
    tbody.innerHTML = "";
    players.forEach(name => {
      const stats = playerStats[name];
      const total = stats["2PT"] * 2 + stats["3PT"] * 3 + stats["FT"];
      tbody.innerHTML += `<tr><td>${name}</td><td>${stats["2PT"]}</td><td>${stats["3PT"]}</td><td>${stats["FT"]}</td><td>${stats["Foul"]}</td><td>${total}</td></tr>`;
    });
  }

  window.setStarters = () => {
    playerButtonsDiv.innerHTML = '';
    onCourtPlayers = [];
    players.forEach(name => {
      const btn = document.createElement('button');
      btn.textContent = name;
      btn.onclick = () => {
        btn.classList.toggle('on-court');
        if (btn.classList.contains('on-court')) {
          if (onCourtPlayers.length < 5) onCourtPlayers.push(name);
          else alert("Only 5 players allowed on the court.");
        } else {
          onCourtPlayers = onCourtPlayers.filter(p => p !== name);
        }
      };
      playerButtonsDiv.appendChild(btn);
    });
  };

  window.toggleTheme = () => {
    document.body.classList.toggle("dark-mode");
  };

  // Timer
  let interval = null;
  let timeRemaining = 18 * 60;

  window.startClock = () => {
    if (!interval) {
      interval = setInterval(() => {
        if (timeRemaining > 0) {
          timeRemaining--;
          document.getElementById("gameClock").textContent = formatTime(timeRemaining);
        }
      }, 1000);
    }
  };

  window.stopClock = () => {
    clearInterval(interval);
    interval = null;
  };

  window.resetClock = () => {
    stopClock();
    timeRemaining = 18 * 60;
    document.getElementById("gameClock").textContent = formatTime(timeRemaining);
  };

  function formatTime(seconds) {
    const mins = Math.floor(seconds / 60).toString().padStart(2, "0");
    const secs = (seconds % 60).toString().padStart(2, "0");
    return `${mins}:${secs}`;
  }

  window.exportCSV = () => {
    let csv = "Player,2PT,3PT,FT,Fouls,Total Points\n";
    players.forEach(name => {
      const s = playerStats[name];
      const total = s["2PT"] * 2 + s["3PT"] * 3 + s["FT"];
      csv += `${name},${s["2PT"]},${s["3PT"]},${s["FT"]},${s["Foul"]},${total}\n`;
    });
    const blob = new Blob([csv], { type: "text/csv" });
    const a = document.createElement("a");
    a.href = URL.createObjectURL(blob);
    a.download = "game_summary.csv";
    a.click();
  };
});
