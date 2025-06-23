let homeScore = 0;
let oppScore = 0;
let teamFouls = 0;
let oppFouls = 0;
let playerStats = {};
let startersSet = false;
let currentEvent = null;
let onCourt = new Set();
let selectingStarters = false;
let selectingSubs = false;
let gameInterval;
let totalSeconds = 18 * 60;
let lastPlayerInTime = {};
let undoStack = [];

const players = [
  'Nicholas', 'Micah', 'Isaiah', 'Ethan', 'David',
  'Ashton', 'Evan', 'Jackson', 'Josiah', 'Christopher', 'Kinnick'
];

players.forEach(name => {
  playerStats[name] = { '2PT': 0, '3PT': 0, 'FT': 0, 'Foul': 0, minutes: 0 };
});

function toggleTheme() {
  document.body.classList.toggle('dark-mode');
}

function updateClockDisplay() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  document.getElementById('gameClock').textContent =
    `${String(minutes).padStart(2, '0')}:${String(seconds).padStart(2, '0')}`;
}

function startClock() {
  if (gameInterval) return;
  gameInterval = setInterval(() => {
    if (totalSeconds > 0) {
      totalSeconds--;
      updateClockDisplay();
    } else {
      stopClock();
    }
  }, 1000);
}

function stopClock() {
  clearInterval(gameInterval);
  gameInterval = null;
}

function resetClock() {
  stopClock();
  totalSeconds = 18 * 60;
  updateClockDisplay();
}

function selectEvent(type) {
  if (!startersSet) return alert("Set starters first!");
  currentEvent = type;
  renderPlayerButtons();
  showActionButtons();
}

function logOpponentEvent(type) {
  let points = (type === '2PT') ? 2 : (type === '3PT') ? 3 : (type === 'FT') ? 1 : 0;
  if (type !== 'Foul') oppScore += points;
  else {
    oppFouls++;
    checkBonus('opp');
  }
  updateScoreboard();
  logPlay(`Opponent ${type}`);
}

function updateScoreboard() {
  document.getElementById('homeScore').textContent = homeScore;
  document.getElementById('oppScore').textContent = oppScore;
  document.getElementById('teamFouls').textContent = teamFouls;
  document.getElementById('oppFouls').textContent = oppFouls;
}

function renderPlayerButtons(filter = () => true) {
  const container = document.getElementById('playerButtons');
  container.innerHTML = '';
  players.filter(filter).forEach(name => {
    const btn = document.createElement('button');
    btn.textContent = `${name} (${playerStats[name].Foul})`;
    btn.className = 'player-button';
    if (selectingStarters && onCourt.has(name)) btn.classList.add('active');
    if (selectingSubs) {
      btn.classList.add(onCourt.has(name) ? 'sub-out' : 'sub-in');
    }
    btn.onclick = () => handlePlayerClick(name);
    container.appendChild(btn);
  });
}

function handlePlayerClick(name) {
  if (selectingStarters) {
    if (onCourt.has(name)) {
      onCourt.delete(name);
    } else {
      if (onCourt.size >= 5) {
        alert("Only 5 players allowed on court.");
        return;
      }
      onCourt.add(name);
      lastPlayerInTime[name] = totalSeconds;
    }
    renderPlayerButtons();
  } else if (selectingSubs) {
    if (onCourt.has(name)) {
      onCourt.delete(name);
    } else {
      if (onCourt.size >= 5) {
        alert("Only 5 players allowed on court.");
        return;
      }
      onCourt.add(name);
      lastPlayerInTime[name] = totalSeconds;
    }
    renderPlayerButtons();
  } else if (currentEvent) {
    if (!onCourt.has(name)) return;
    playerStats[name][currentEvent]++;
    if (currentEvent === '2PT') homeScore += 2;
    if (currentEvent === '3PT') homeScore += 3;
    if (currentEvent === 'FT') homeScore += 1;
    if (currentEvent === 'Foul') {
      teamFouls++;
      if (playerStats[name].Foul === 4) alert(`${name} is one foul from fouling out!`);
      if (playerStats[name].Foul === 5) alert(`${name} has fouled out!`);
      checkBonus('home');
    }
    undoStack.push({ type: currentEvent, player: name });
    updateScoreboard();
    logPlay(`${name} ${currentEvent}`);
    renderSummary();
    clearPlayerButtons();
  }
}

function checkBonus(team) {
  if (team === 'home') {
    if (teamFouls === 7) document.getElementById('bonusAlert').textContent = ' (Bonus)';
    if (teamFouls === 10) document.getElementById('bonusAlert').textContent = ' (Double Bonus)';
  } else {
    if (oppFouls === 7) document.getElementById('oppBonusAlert').textContent = ' (Bonus)';
    if (oppFouls === 10) document.getElementById('oppBonusAlert').textContent = ' (Double Bonus)';
  }
}

function setStarters() {
  selectingStarters = true;
  renderPlayerButtons();
  showActionButtons();
}

function makeSubstitution() {
  selectingSubs = true;
  renderPlayerButtons();
  showActionButtons();
}

function submitSubstitution() {
  selectingStarters = false;
  selectingSubs = false;
  logPlay(`Players on court: ${[...onCourt].join(', ')}`);
  clearPlayerButtons();
  hideActionButtons();
}

function cancelSelection() {
  selectingStarters = false;
  selectingSubs = false;
  clearPlayerButtons();
  hideActionButtons();
}

function clearPlayerButtons() {
  document.getElementById('playerButtons').innerHTML = '';
  currentEvent = null;
}

function showActionButtons() {
  document.getElementById('submitSubBtn').style.display = 'inline-block';
  document.getElementById('cancelBtn').style.display = 'inline-block';
}

function hideActionButtons() {
  document.getElementById('submitSubBtn').style.display = 'none';
  document.getElementById('cancelBtn').style.display = 'none';
}

function logPlay(text) {
  const li = document.createElement('li');
  const time = new Date().toLocaleTimeString();
  li.textContent = `${time} - ${text}`;
  document.getElementById('log').appendChild(li);
}

function renderSummary() {
  const tbody = document.getElementById('summaryBody');
  tbody.innerHTML = '';
  players.forEach(name => {
    const row = document.createElement('tr');
    const stats = playerStats[name];
    const points = stats['2PT'] * 2 + stats['3PT'] * 3 + stats['FT'];
    row.innerHTML = `
      <td>${name}</td>
      <td>${stats['2PT']}</td>
      <td>${stats['3PT']}</td>
      <td>${stats['FT']}</td>
      <td>${stats['Foul']}</td>
      <td>${points}</td>
      <td>${(stats.minutes / 60).toFixed(1)} min</td>
    `;
    tbody.appendChild(row);
  });
}

function exportCSV() {
  let csv = 'Player,2PT,3PT,FT,Fouls,Total Points,Minutes\n';
  players.forEach(name => {
    const s = playerStats[name];
    const total = s['2PT'] * 2 + s['3PT'] * 3 + s['FT'];
    csv += `${name},${s['2PT']},${s['3PT']},${s['FT']},${s['Foul']},${total},${(s.minutes / 60).toFixed(1)}\n`;
  });

  const blob = new Blob([csv], { type: 'text/csv' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = 'game-stats.csv';
  link.click();
}

setInterval(() => {
  if (!gameInterval) return;
  const now = totalSeconds;
  onCourt.forEach(name => {
    const inTime = lastPlayerInTime[name] || now;
    playerStats[name].minutes += 1;
    lastPlayerInTime[name] = now;
  });
}, 1000);
