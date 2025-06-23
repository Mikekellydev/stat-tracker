let homeScore = 0;
let oppScore = 0;
let teamFouls = 0;
let oppFouls = 0;
let clockInterval = null;
let timeLeft = 1080; // 18 minutes
let selectedEvent = null;
let activePlayers = [];
let playerStats = {};
let selectedPlayers = [];
let substitutionMode = false;
let startersSelected = false;
const MAX_FOULS = 5;

const players = [
  "Nicholas", "Micah", "Isaiah", "Ethan", "David",
  "Ashton", "Evan", "Jackson", "Josiah", "Christopher", "Kinnick"
];

// Theme toggle
function toggleTheme() {
  document.body.classList.toggle("theme-dark");
}

// Clock
function updateClockDisplay() {
  const minutes = Math.floor(timeLeft / 60);
  const seconds = timeLeft % 60;
  document.getElementById("gameClock").innerText = `${minutes}:${seconds.toString().padStart(2, '0')}`;
}

function startClock() {
  if (clockInterval) return;
  clockInterval = setInterval(() => {
    if (timeLeft > 0) {
      timeLeft--;
      updateClockDisplay();
    } else {
      stopClock();
    }
  }, 1000);
}

function stopClock() {
  clearInterval(clockInterval);
  clockInterval = null;
}

function resetClock() {
  timeLeft = 1080;
  updateClockDisplay();
}

// Score and Event Handling
function selectEvent(eventType) {
  selectedEvent = eventType;
  selectedPlayers = [];
  substitutionMode = false;
  showPlayerButtons();
}

function showPlayerButtons() {
  const container = document.getElementById("playerButtons");
  container.innerHTML = '';
  players.forEach(player => {
    if (startersSelected && !activePlayers.includes(player)) return;
    const btn = document.createElement("button");
    const fouls = (playerStats[player]?.Fouls || 0);
    btn.innerText = `${player} (${fouls})`;
    btn.onclick = () => handlePlayerEvent(player);
    container.appendChild(btn);
  });
  document.getElementById("playerActionBtns").style.display = "block";
}

function handlePlayerEvent(player) {
  if (!playerStats[player]) {
    playerStats[player] = { '2PT': 0, '3PT': 0, 'FT': 0, 'Fouls': 0 };
  }

  const now = new Date().toLocaleTimeString();
  if (selectedEvent === '2PT') {
    playerStats[player]['2PT']++;
    homeScore += 2;
  } else if (selectedEvent === '3PT') {
    playerStats[player]['3PT']++;
    homeScore += 3;
  } else if (selectedEvent === 'FT') {
    playerStats[player]['FT']++;
    homeScore += 1;
  } else if (selectedEvent === 'Foul') {
    playerStats[player]['Fouls']++;
    teamFouls++;
    if (playerStats[player]['Fouls'] === 4) {
      alert(`${player} has 4 fouls!`);
    }
    if (playerStats[player]['Fouls'] === MAX_FOULS) {
      alert(`${player} has fouled out!`);
    }
  }

  updateScoreboard();
  updateSummary();
  logEvent(`${now} - ${player} ${selectedEvent}`);
  cancelPlayerAction();
}

function logOpponentEvent(type) {
  const now = new Date().toLocaleTimeString();
  if (type === '2PT') oppScore += 2;
  if (type === '3PT') oppScore += 3;
  if (type === 'FT') oppScore += 1;
  if (type === 'Foul') oppFouls++;
  updateScoreboard();
  logEvent(`${now} - Opponent ${type}`);
}

function updateScoreboard() {
  document.getElementById("homeScore").innerText = homeScore;
  document.getElementById("oppScore").innerText = oppScore;
  document.getElementById("teamFouls").innerText = teamFouls;
  document.getElementById("oppFouls").innerText = oppFouls;
  document.getElementById("bonusAlert").innerText = teamFouls >= 7 && teamFouls < 10 ? 'Bonus!' : teamFouls >= 10 ? 'Double Bonus!' : '';
  document.getElementById("oppBonusAlert").innerText = oppFouls >= 7 && oppFouls < 10 ? 'Bonus!' : oppFouls >= 10 ? 'Double Bonus!' : '';
}

function logEvent(text) {
  const log = document.getElementById("log");
  const entry = document.createElement("li");
  entry.innerText = text;
  log.appendChild(entry);
}

function cancelPlayerAction() {
  document.getElementById("playerButtons").innerHTML = '';
  document.getElementById("playerActionBtns").style.display = "none";
  selectedEvent = null;
}

// Set Starters and Substitution
function setStarters() {
  substitutionMode = false;
  selectedPlayers = [];
  const container = document.getElementById("playerButtons");
  container.innerHTML = '';
  players.forEach(player => {
    const btn = document.createElement("button");
    btn.innerText = player;
    btn.onclick = () => {
      if (selectedPlayers.includes(player)) {
        selectedPlayers = selectedPlayers.filter(p => p !== player);
        btn.classList.remove('on-court');
      } else {
        if (selectedPlayers.length >= 5) {
          alert("Only 5 players can be selected as starters.");
          return;
        }
        selectedPlayers.push(player);
        btn.classList.add('on-court');
      }
    };
    container.appendChild(btn);
  });

  const actionDiv = document.getElementById("playerActionBtns");
  actionDiv.innerHTML = `
    <button onclick="submitStarters()">Submit</button>
    <button onclick="cancelPlayerAction()">Cancel</button>
  `;
  actionDiv.style.display = "block";
}

function submitStarters() {
  if (selectedPlayers.length !== 5) {
    alert("You must select 5 starters.");
    return;
  }
  activePlayers = [...selectedPlayers];
  startersSelected = true;
  selectedPlayers = [];
  logEvent(`${new Date().toLocaleTimeString()} - Starters: ${activePlayers.join(', ')}`);
  cancelPlayerAction();
}

function makeSubstitution() {
  substitutionMode = true;
  selectedPlayers = [];
  const container = document.getElementById("playerButtons");
  container.innerHTML = '';
  players.forEach(player => {
    const btn = document.createElement("button");
    btn.innerText = player;
    if (activePlayers.includes(player)) {
      btn.classList.add('sub-out');
    }
    btn.onclick = () => {
      if (selectedPlayers.includes(player)) {
        selectedPlayers = selectedPlayers.filter(p => p !== player);
        btn.classList.remove('sub-in', 'sub-out');
      } else {
        selectedPlayers.push(player);
        btn.classList.add(activePlayers.includes(player) ? 'sub-out' : 'sub-in');
      }
    };
    container.appendChild(btn);
  });

  const actionDiv = document.getElementById("playerActionBtns");
  actionDiv.innerHTML = `
    <button onclick="submitSubstitution()">Submit</button>
    <button onclick="cancelPlayerAction()">Cancel</button>
  `;
  actionDiv.style.display = "block";
}

function submitSubstitution() {
  const newActive = [...activePlayers];
  selectedPlayers.forEach(p => {
    if (newActive.includes(p)) {
      const index = newActive.indexOf(p);
      if (index !== -1) newActive.splice(index, 1);
    } else {
      if (newActive.length < 5) {
        newActive.push(p);
      }
    }
  });
  if (newActive.length !== 5) {
    alert("You must have 5 players on the court.");
    return;
  }
  activePlayers = [...newActive];
  logEvent(`${new Date().toLocaleTimeString()} - Subbed to: ${activePlayers.join(', ')}`);
  cancelPlayerAction();
}

// Summary and Export
function updateSummary() {
  const tbody = document.getElementById("summaryBody");
  tbody.innerHTML = '';
  for (const player of players) {
    const stats = playerStats[player] || { '2PT': 0, '3PT': 0, 'FT': 0, 'Fouls': 0 };
    const row = document.createElement("tr");
    const totalPoints = stats['2PT'] * 2 + stats['3PT'] * 3 + stats['FT'];
    row.innerHTML = `
      <td>${player}</td>
      <td>${stats['2PT']}</td>
      <td>${stats['3PT']}</td>
      <td>${stats['FT']}</td>
      <td>${stats['Fouls']}</td>
      <td>${totalPoints}</td>
    `;
    tbody.appendChild(row);
  }
}

function exportCSV() {
  let csv = "Player,2PT,3PT,FT,Fouls,Total Points\n";
  for (const player of players) {
    const stats = playerStats[player] || { '2PT': 0, '3PT': 0, 'FT': 0, 'Fouls': 0 };
    const totalPoints = stats['2PT'] * 2 + stats['3PT'] * 3 + stats['FT'];
    csv += `${player},${stats['2PT']},${stats['3PT']},${stats['FT']},${stats['Fouls']},${totalPoints}\n`;
  }
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const link = document.createElement("a");
  link.href = URL.createObjectURL(blob);
  link.download = "game_summary.csv";
  link.click();
}
