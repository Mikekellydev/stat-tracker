let players = [
  "Nicholas", "Micah", "Isaiah", "Ethan", "David",
  "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick"
];

let stats = {};
let onCourt = [];
let selectedEvent = null;
let clockInterval;
let clockTime = 18 * 60;
let teamFouls = 0;
let oppFouls = 0;

players.forEach(player => {
  stats[player] = { "2PT": 0, "3PT": 0, "FT": 0, "Fouls": 0 };
});

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}

function formatClock(seconds) {
  let min = Math.floor(seconds / 60);
  let sec = seconds % 60;
  return `${min}:${sec.toString().padStart(2, '0')}`;
}

function updateClockDisplay() {
  document.getElementById("gameClock").textContent = formatClock(clockTime);
}

function startClock() {
  if (clockInterval) return;
  clockInterval = setInterval(() => {
    if (clockTime > 0) {
      clockTime--;
      updateClockDisplay();
    }
  }, 1000);
}

function stopClock() {
  clearInterval(clockInterval);
  clockInterval = null;
}

function resetClock() {
  clockTime = 18 * 60;
  updateClockDisplay();
}

function updateScoreboard() {
  let homeScore = 0;
  players.forEach(p => {
    homeScore += stats[p]["2PT"] * 2 + stats[p]["3PT"] * 3 + stats[p]["FT"];
  });
  document.getElementById("homeScore").textContent = homeScore;
  document.getElementById("teamFouls").textContent = teamFouls;
  document.getElementById("oppFouls").textContent = oppFouls;

  document.getElementById("bonusAlert").textContent = teamFouls >= 7 ? (teamFouls >= 10 ? " (Double Bonus)" : " (Bonus)") : "";
  document.getElementById("oppBonusAlert").textContent = oppFouls >= 7 ? (oppFouls >= 10 ? " (Double Bonus)" : " (Bonus)") : "";
}

function logEvent(text) {
  const li = document.createElement("li");
  li.textContent = new Date().toLocaleTimeString() + " - " + text;
  document.getElementById("log").appendChild(li);
}

function showPlayerButtons(filter = () => true, includeControls = true) {
  const container = document.getElementById("playerButtons");
  container.innerHTML = "";
  players.filter(filter).forEach(player => {
    const btn = document.createElement("button");
    btn.className = "player-button";
    btn.textContent = `${player} (${stats[player]["Fouls"]})`;
    btn.onclick = () => handlePlayerEvent(player);
    container.appendChild(btn);
  });
  if (includeControls) {
    const undo = document.createElement("button");
    undo.textContent = "Cancel";
    undo.onclick = () => {
      selectedEvent = null;
      container.innerHTML = "";
    };
    container.appendChild(undo);
  }
}

function selectEvent(type) {
  if (onCourt.length === 0) {
    alert("Please set starters first.");
    return;
  }
  selectedEvent = type;
  showPlayerButtons(player => onCourt.includes(player));
}

function handlePlayerEvent(player) {
  if (!selectedEvent || !onCourt.includes(player)) return;

  if (selectedEvent === "Foul") {
    stats[player]["Fouls"]++;
    teamFouls++;

    if (stats[player]["Fouls"] === 4) {
      alert(`${player} has 4 fouls. One away from fouling out.`);
    } else if (stats[player]["Fouls"] >= 5) {
      alert(`${player} has fouled out! Please substitute.`);
    }
  } else {
    stats[player][selectedEvent]++;
  }

  logEvent(`${player} ${selectedEvent}`);
  selectedEvent = null;
  updateScoreboard();
  showSummary();
  document.getElementById("playerButtons").innerHTML = "";
}

function logOpponentEvent(type) {
  logEvent(`Opponent ${type}`);
  if (type === "Foul") {
    oppFouls++;
    updateScoreboard();
  } else {
    let oppScore = parseInt(document.getElementById("oppScore").textContent);
    oppScore += type === "3PT" ? 3 : type === "2PT" ? 2 : 1;
    document.getElementById("oppScore").textContent = oppScore;
  }
}

function setStarters() {
  selectedEvent = null;
  showPlayerButtons(() => true, false);
  document.getElementById("starterControls").style.display = "flex";
  const container = document.getElementById("playerButtons");
  Array.from(container.children).forEach(btn => {
    btn.onclick = () => {
      const name = btn.textContent.split(" ")[0];
      if (btn.classList.contains("active")) {
        btn.classList.remove("active");
        onCourt = onCourt.filter(p => p !== name);
      } else {
        if (onCourt.length >= 5) {
          alert("Only 5 players can be on the court.");
          return;
        }
        btn.classList.add("active");
        onCourt.push(name);
      }
    };
  });
}

function submitStarters() {
  if (onCourt.length !== 5) {
    alert("Please select exactly 5 players.");
    return;
  }
  logEvent("Starters: " + onCourt.join(", "));
  document.getElementById("playerButtons").innerHTML = "";
  document.getElementById("starterControls").style.display = "none";
}

function cancelStarters() {
  onCourt = [];
  document.getElementById("playerButtons").innerHTML = "";
  document.getElementById("starterControls").style.display = "none";
}

function makeSubstitution() {
  if (onCourt.length === 0) {
    alert("Set starters before making substitutions.");
    return;
  }

  selectedEvent = null;
  showPlayerButtons(() => true, false);
  document.getElementById("submitSubBtn").style.display = "inline-block";

  const container = document.getElementById("playerButtons");
  Array.from(container.children).forEach(btn => {
    const name = btn.textContent.split(" ")[0];
    if (onCourt.includes(name)) {
      btn.classList.add("sub-out");
    }
    btn.onclick = () => {
      if (onCourt.includes(name)) {
        btn.classList.toggle("sub-out");
      } else {
        btn.classList.toggle("sub-in");
      }
    };
  });
}

function submitSubstitution() {
  const container = document.getElementById("playerButtons");
  const newOnCourt = [];
  Array.from(container.children).forEach(btn => {
    const name = btn.textContent.split(" ")[0];
    if (btn.classList.contains("sub-out")) {
      // skip
    } else if (btn.classList.contains("sub-in")) {
      newOnCourt.push(name);
    } else if (onCourt.includes(name)) {
      newOnCourt.push(name);
    }
  });

  if (newOnCourt.length !== 5) {
    alert("Must have 5 players on the court.");
    return;
  }

  logEvent("Substitution: " + onCourt.join(", ") + " -> " + newOnCourt.join(", "));
  onCourt = newOnCourt;
  document.getElementById("playerButtons").innerHTML = "";
  document.getElementById("submitSubBtn").style.display = "none";
}

function showSummary() {
  const tbody = document.getElementById("summaryBody");
  tbody.innerHTML = "";
  players.forEach(player => {
    const row = document.createElement("tr");
    const total = stats[player]["2PT"] * 2 + stats[player]["3PT"] * 3 + stats[player]["FT"];
    row.innerHTML = `
      <td>${player}</td>
      <td>${stats[player]["2PT"]}</td>
      <td>${stats[player]["3PT"]}</td>
      <td>${stats[player]["FT"]}</td>
      <td>${stats[player]["Fouls"]}</td>
      <td>${total}</td>
    `;
    tbody.appendChild(row);
  });
}

function exportCSV() {
  let csv = "Player,2PT,3PT,FT,Fouls,Total Points\n";
  players.forEach(p => {
    const t = stats[p]["2PT"] * 2 + stats[p]["3PT"] * 3 + stats[p]["FT"];
    csv += `${p},${stats[p]["2PT"]},${stats[p]["3PT"]},${stats[p]["FT"]},${stats[p]["Fouls"]},${t}\n`;
  });

  const blob = new Blob([csv], { type: "text/csv" });
  const url = URL.createObjectURL(blob);
  const a = document.createElement("a");
  a.href = url;
  a.download = "game_summary.csv";
  a.click();
}

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => {
    navigator.serviceWorker.register("/sw.js").then(() => {
      console.log("Service Worker registered!");
    });
  });
}