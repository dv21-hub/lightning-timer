const circle = document.getElementById("circle");
const panel = document.getElementById("panel");
let actual = 0;
let mode = "1player";

function closeness(d) {
  if (d < 0.1) return "Incredible!";
  if (d < 0.3) return "Very close!";
  if (d < 0.7) return "Not bad.";
  if (d < 1.5) return "You can do better.";
  return "Way off!";
}

function showIdle() {
  panel.innerHTML = `
    <form id="modeForm">
      <label for="modeSelect">Game mode</label>
      <select id="modeSelect">
        <option value="1player" ${mode === "1player" ? "selected" : ""}>1 Player</option>
        <option value="2player" ${mode === "2player" ? "selected" : ""}>2 Player</option>
      </select>
      <button id="startBtn" type="button">Start</button>
    </form>
    <p class="rules">Watch the circle turn green, then estimate how long it stayed green. In 2-player mode, both players submit guesses and the closest one wins.</p>`;

  document.getElementById("modeSelect").onchange = (e) => {
    mode = e.target.value;
  };
  document.getElementById("startBtn").onclick = start;
}

function start() {
  mode = document.getElementById("modeSelect")?.value || mode;
  panel.innerHTML = '<p class="muted">Get ready... watch the circle.</p>';

  const waitMs = 800 + Math.random() * 1500;
  setTimeout(() => {
    const greenSeconds = 1 + Math.random() * 4;
    const roundedSeconds = Math.round(greenSeconds * 10) / 10;
    const t0 = performance.now();
    circle.classList.add("green");
    panel.innerHTML = '<p class="muted">Count the seconds!</p>';

    setTimeout(() => {
      actual = (performance.now() - t0) / 1000;
      circle.classList.remove("green");
      showGuess();
    }, roundedSeconds * 1000);
  }, waitMs);
}

function showGuess() {
  if (mode === "2player") {
    panel.innerHTML = `
      <form id="guessForm">
        <label>Player 1 guess (seconds)</label>
        <input id="player1Guess" type="number" step="0.01" autofocus />
        <label>Player 2 guess (seconds)</label>
        <input id="player2Guess" type="number" step="0.01" />
        <button type="submit">Submit guesses</button>
      </form>`;

    document.getElementById("guessForm").onsubmit = (e) => {
      e.preventDefault();
      const p1 = parseFloat(document.getElementById("player1Guess").value);
      const p2 = parseFloat(document.getElementById("player2Guess").value);
      if (isNaN(p1) || isNaN(p2)) return;
      showTwoPlayerResult(p1, p2);
    };
    return;
  }

  panel.innerHTML = `
    <form id="guessForm">
      <label>How long was it green (seconds)?</label>
      <input id="guess" type="number" step="0.01" autofocus />
      <button type="submit">Submit</button>
    </form>`;

  document.getElementById("guessForm").onsubmit = (e) => {
    e.preventDefault();
    const g = parseFloat(document.getElementById("guess").value);
    if (isNaN(g)) return;
    showResult(Math.abs(g - actual));
  };
}

function showResult(diff) {
  panel.innerHTML = `
    <p>Actual: <strong>${actual.toFixed(2)}s</strong></p>
    <p>You were off by <strong>${diff.toFixed(2)}s</strong></p>
    <p class="muted">${closeness(diff)}</p>
    <div class="buttonRow">
      <button id="again">Play again</button>
      <button id="home" type="button">Return home</button>
    </div>`;

  document.getElementById("again").onclick = start;
  document.getElementById("home").onclick = showIdle;
}

function showTwoPlayerResult(p1, p2) {
  const diff1 = Math.abs(p1 - actual);
  const diff2 = Math.abs(p2 - actual);
  let winnerText = "It's a tie!";

  if (diff1 < diff2) {
    winnerText = "Player 1 wins!";
  } else if (diff2 < diff1) {
    winnerText = "Player 2 wins!";
  }

  panel.innerHTML = `
    <p>Actual: <strong>${actual.toFixed(2)}s</strong></p>
    <p>Player 1 was off by <strong>${diff1.toFixed(2)}s</strong> (${closeness(diff1)})</p>
    <p>Player 2 was off by <strong>${diff2.toFixed(2)}s</strong> (${closeness(diff2)})</p>
    <p><strong>${winnerText}</strong></p>
    <div class="buttonRow">
      <button id="again">Play again</button>
      <button id="home" type="button">Return home</button>
    </div>`;

  document.getElementById("again").onclick = start;
  document.getElementById("home").onclick = showIdle;
}

showIdle();
