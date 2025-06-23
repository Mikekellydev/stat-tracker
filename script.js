let clockInterval;
let timeLeft = 18 * 60;
let onCourt = new Set();
let players = ["Nicholas", "Micah", "Isaiah", "Ethan", "David", "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick"];
let currentEvent = null;
let teamScore = 0;
let oppScore = 0;
let teamFouls = 0;
let oppFouls = 0;
let foulCounts = {};
let playerStats = {};
let log = document.getElementById("log");

players.forEach(name => {
  foulCounts[name] = 0;
  playerStats[name] = { "2PT": 0, "3PT": 0, "FT": 0, "Fouls": 0 };
});

function updateClockDisplay() {
  const minutes = Math.floor(timeLeft / 60).toString().padStart(2, "0");
  const seconds = (timeLeft % 60).toString().padStart(2, "0");
  document.getElementById("gameClock").innerText = `${minutes}:${seconds}`;
}

function startClock() {
  clearInterval(clockInterval);
  clockInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateClockDisplay();
    }
  }, 1000);
}

function stopClock() {
  clearInterval(clockInterval);
}

function resetClock() {
  timeLeft = 18 * 60;
  updateClockDisplay();
}

function selectEvent(eventType) {
  currentEvent = eventType;
  showPlayerButtons();
}

function showPlayerButtons() {
  const container = document.getElementById("playerButtons");
  container.innerHTML = "";
  players.forEach(name => {
    const btn = document.createElement("button");
    btn.innerText = `${name} (${foulCounts[name]})`;
    btn.disabled = !onCourt.has(name);
    btn.onclick = () => logEvent(name);
    container.appendChild(btn);
  });
}

function logEvent(name) {
  const timestamp = new Date().toLocaleTimeString();
  let points = 0;
  if (currentEvent === "2PT") points = 2;
  else if (currentEvent === "3PT") points = 3;
  else if (currentEvent === "FT") points = 1;

  if (points > 0) {
    teamScore += points;
    playerStats[name][currentEvent]++;
  }

  if (currentEvent === "Foul") {
    foulCounts[name]++;
    playerStats[name]["Fouls"]++;
    teamFouls++;
    updateFoulAlerts();
    if (foulCounts[name] === 4) alert(`${name} is in foul trouble!`);
    if (foulCounts[name] >= 5) alert(`${name} has fouled out!`);
  }

  updateUI();
  addLogEntry(`${timestamp} - ${name} ${currentEvent}`);
  currentEvent = null;
  document.getElementById("playerButtons").innerHTML = "";
}

function logOpponentEvent(type) {
  const timestamp = new Date().toLocaleTimeString();
  let points = 0;
  if (type === "2PT") points = 2;
  else if (type === "3PT") points = 3;
  else if (type === "FT") points = 1;
  else if (type === "Foul") {
    oppFouls++;
    updateFoulAlerts();
  }

  oppScore += points;
  updateUI();
  addLogEntry(`${timestamp} - Opponent ${type}`);
}

function updateUI() {
  document.getElementById("homeScore").innerText = teamScore;
  document.getElementById("oppScore").innerText = oppScore;
  document.getElementById("teamFouls").innerText = teamFouls;
  document.getElementById("oppFouls").innerText = oppFouls;

  document.getElementById("bonusAlert").innerText =
    teamFouls >= 10 ? " (Double Bonus)" : teamFouls >= 7 ? " (Bonus)" : "";
  document.getElementById("oppBonusAlert").innerText =
    oppFouls >= 10 ? " (Double Bonus)" : oppFouls >= 7 ? " (Bonus)" : "";

  updateSummaryTable();
}

function addLogEntry(text) {
  const li = document.createElement("li");
  li.innerText = text;
  log.appendChild(li);
}

function setStarters() {
  const selected = prompt("Enter comma-separated starter names (e.g., Nicholas, Micah, Isaiah, Ethan, David):");
  if (selected) {
    onCourt.clear();
    selected.split(",").map(n => n.trim()).forEach(name => {
      if (players.includes(name)) onCourt.add(name);
    });
    alert(`Starters set: ${Array.from(onCourt).join(", ")}`);
  }
}

function makeSubstitution() {
  const selected = prompt("Enter comma-separated names to sub in (only up to 5 on court total):");
  if (selected) {
    const newPlayers = selected.split(",").map(n => n.trim()).filter(n => players.includes(n));
    if (newPlayers.length + onCourt.size > 5) {
      alert("Too many players on court!");
    } else {
      newPlayers.forEach(p => onCourt.add(p));
      alert(`Players on court: ${Array.from(onCourt).join(", ")}`);
    }
  }
}

function submitSubstitution() {
  addLogEntry(`Substitution: ${Array.from(onCourt).join(", ")}`);
}

function updateSummaryTable() {
  const tbody = document.getElementById("summaryBody");
  tbody.innerHTML = "";
  players.forEach(name => {
    const stats = playerStats[name];
    const row = `<tr>
      <td>${name}</td>
      <td>${stats["2PT"]}</td>
      <td>${stats["3PT"]}</td>
      <td>${stats["FT"]}</td>
      <td>${stats["Fouls"]}</td>
      <td>${stats["2PT"] * 2 + stats["3PT"] * 3 + stats["FT"]}</td>
    </tr>`;
    tbody.innerHTML += row;
  });
}

function exportCSV() {
  let csv = "Player,2PT,3PT,FT,Fouls,Total Points\n";
  players.forEach(name => {
    const s = playerStats[name];
    const total = s["2PT"] * 2 + s["3PT"] * 3 + s["FT"];
    csv += `${name},${s["2PT"]},${s["3PT"]},${s["FT"]},${s["Fouls"]},${total}\n`;
  });
  const blob = new Blob([csv], { type: "text/csv" });
  const a = document.createElement("a");
  a.href = URL.createObjectURL(blob);
  a.download = "game-stats.csv";
  a.click();
}

function toggleTheme() {
  document.body.classList.toggle("dark-mode");
}
function updateFoulAlerts() {
  document.getElementById("teamFouls").classList.toggle("foul-alert", teamFouls >= 5);
  document.getElementById("oppFouls").classList.toggle("foul-alert", oppFouls >= 5);
}
document.addEventListener("DOMContentLoaded", () => {
  updateClockDisplay();
  updateUI();
  showPlayerButtons();
  document.getElementById("setStarters").onclick = setStarters;
  document.getElementById("makeSubstitution").onclick = makeSubstitution;
  document.getElementById("submitSubstitution").onclick = submitSubstitution;
  document.getElementById("exportCSV").onclick = exportCSV;
  document.getElementById("toggleTheme").onclick = toggleTheme;
});
