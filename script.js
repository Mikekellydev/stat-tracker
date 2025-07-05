let players = [];
let homeScore = 0;
let oppScore = 0;
let teamFouls = 0;
let oppFouls = 0;
let timer;
let totalSeconds = 18 * 60;

function updateClock() {
  const minutes = Math.floor(totalSeconds / 60);
  const seconds = totalSeconds % 60;
  document.getElementById("clock").textContent =
    `${minutes.toString().padStart(2, "0")}:${seconds.toString().padStart(2, "0")}`;
}

function startClock() {
  if (!timer) {
    timer = setInterval(() => {
      if (totalSeconds > 0) {
        totalSeconds--;
        updateClock();
      } else {
        clearInterval(timer);
        timer = null;
      }
    }, 1000);
  }
}

function stopClock() {
  clearInterval(timer);
  timer = null;
}

function resetClock() {
  totalSeconds = 18 * 60;
  updateClock();
}

function addPlayer() {
  const name = document.getElementById("playerNameInput").value.trim();
  if (name && !players.includes(name)) {
    players.push(name);
    renderPlayerButtons();
    document.getElementById("playerNameInput").value = "";
  }
}

function renderPlayerButtons() {
  const container = document.getElementById("playerButtons");
  container.innerHTML = "";
  players.forEach(name => {
    const btn = document.createElement("button");
    btn.textContent = name;
    btn.onclick = () => logEvent(`Action by ${name}`);
    container.appendChild(btn);
  });
}

function logEvent(type) {
  const log = document.getElementById("log");
  const entry = document.createElement("li");

  let msg = "";
  if (type === "2PT") {
    homeScore += 2;
    msg = "PA HORNETS 2PT scored.";
  } else if (type === "3PT") {
    homeScore += 3;
    msg = "PA HORNETS 3PT scored.";
  } else if (type === "FT") {
    homeScore += 1;
    msg = "PA HORNETS Free Throw.";
  } else if (type === "Foul") {
    teamFouls++;
    msg = "PA HORNETS committed a foul.";
  } else {
    msg = type; // fallback for player selection
  }

  document.getElementById("homeScore").textContent = homeScore;
  document.getElementById("teamFouls").textContent = teamFouls;
  entry.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
  log.appendChild(entry);
}

function logOpponent(type) {
  const log = document.getElementById("log");
  const entry = document.createElement("li");

  let msg = "";
  if (type === "2PT") {
    oppScore += 2;
    msg = "Opponent 2PT scored.";
  } else if (type === "3PT") {
    oppScore += 3;
    msg = "Opponent 3PT scored.";
  } else if (type === "FT") {
    oppScore += 1;
    msg = "Opponent Free Throw.";
  } else if (type === "Foul") {
    oppFouls++;
    msg = "Opponent committed a foul.";
  }

  document.getElementById("oppScore").textContent = oppScore;
  document.getElementById("oppFouls").textContent = oppFouls;
  entry.textContent = `${new Date().toLocaleTimeString()} - ${msg}`;
  log.appendChild(entry);
}

window.onload = updateClock;