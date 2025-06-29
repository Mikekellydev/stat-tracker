let gameState = {
  homeScore: 0,
  oppScore: 0,
  teamFouls: 0,
  oppFouls: 0,
  log: [],
  players: {}  // keyed by player name
};

const homeScoreEl = document.getElementById("homeScore");
const oppScoreEl = document.getElementById("oppScore");
const teamFoulsEl = document.getElementById("teamFouls");
const oppFoulsEl = document.getElementById("oppFouls");
const logEl = document.getElementById("log");
const summaryBody = document.getElementById("summaryBody");

function updateUI() {
  homeScoreEl.textContent = gameState.homeScore;
  oppScoreEl.textContent = gameState.oppScore;
  teamFoulsEl.textContent = gameState.teamFouls;
  oppFoulsEl.textContent = gameState.oppFouls;
  renderLog();
  renderSummary();
}

function renderLog() {
  logEl.innerHTML = "";
  gameState.log.forEach(entry => {
    const li = document.createElement("li");
    li.textContent = `${entry.time} - ${entry.text}`;
    logEl.appendChild(li);
  });
}

function renderSummary() {
  summaryBody.innerHTML = "";
  for (const player in gameState.players) {
    const p = gameState.players[player];
    const tr = document.createElement("tr");
    tr.innerHTML = `
      <td>${player}</td>
      <td>${p["2PT"] || 0}</td>
      <td>${p["3PT"] || 0}</td>
      <td>${p["FT"] || 0}</td>
      <td>${p["Foul"] || 0}</td>
      <td>${(p["2PT"] || 0) * 2 + (p["3PT"] || 0) * 3 + (p["FT"] || 0)}</td>
      <td>${p.minutes || "00:00"}</td>
    `;
    summaryBody.appendChild(tr);
  }
}

function addLog(text) {
  const time = new Date().toLocaleTimeString();
  gameState.log.push({ time, text });
  updateUI();
}

function selectEvent(type) {
  const player = prompt("Enter player name:");
  if (!player) return;

  if (!gameState.players[player]) gameState.players[player] = {};
  gameState.players[player][type] = (gameState.players[player][type] || 0) + 1;

  if (type === "2PT") gameState.homeScore += 2;
  if (type === "3PT") gameState.homeScore += 3;
  if (type === "FT") gameState.homeScore += 1;
  if (type === "Foul") gameState.teamFouls += 1;

  addLog(`${player} ${type}`);
}

function logOpponentEvent(type) {
  if (type === "2PT") gameState.oppScore += 2;
  if (type === "3PT") gameState.oppScore += 3;
  if (type === "FT") gameState.oppScore += 1;
  if (type === "Foul") gameState.oppFouls += 1;

  addLog(`Opponent ${type}`);
}

// Game persistence
function saveGame() {
  localStorage.setItem("basketballGame", JSON.stringify(gameState));
  alert("Game saved to local storage.");
}

function loadGame() {
  const saved = localStorage.getItem("basketballGame");
  if (saved) {
    gameState = JSON.parse(saved);
    updateUI();
    alert("Game loaded.");
  } else {
    alert("No saved game found.");
  }
}

function exportGame() {
  const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(gameState));
  const dlAnchor = document.createElement("a");
  dlAnchor.setAttribute("href", dataStr);
  dlAnchor.setAttribute("download", "game-stats.json");
  dlAnchor.click();
}

function importGame() {
  const fileInput = document.getElementById("importFile");
  const file = fileInput.files[0];
  if (!file) return;

  const reader = new FileReader();
  reader.onload = e => {
    gameState = JSON.parse(e.target.result);
    updateUI();
    alert("Game data imported.");
  };
  reader.readAsText(file);
}

// Dummy starter/sub functions
function setStarters() {
  alert("Set starters - future feature.");
}

function makeSubstitution() {
  alert("Substitution - future feature.");
}

updateUI();
