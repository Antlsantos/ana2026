/* ============================================
   Vôlei Score — Game Logic
   ============================================ */

const POINTS_TO_WIN_SET = 25;
const POINTS_TO_WIN_TIEBREAK = 15;
const MIN_DIFF = 2;
const SETS_TO_WIN = 3;
const MAX_SETS = 5;

// ==========================================
// State
// ==========================================

let state = {
  teamA: 'Time A',
  teamB: 'Time B',
  scoreA: 0,
  scoreB: 0,
  setsA: 0,
  setsB: 0,
  currentSet: 1,
  setsHistory: [],
  serving: 'A',
  gameOver: false,
  winner: null
};

// ==========================================
// DOM References
// ==========================================

const $setupScreen = document.getElementById('setupScreen');
const $gameScreen = document.getElementById('gameScreen');
const $teamAInput = document.getElementById('teamAInput');
const $teamBInput = document.getElementById('teamBInput');
const $startBtn = document.getElementById('startBtn');

const $teamAName = document.getElementById('teamAName');
const $teamBName = document.getElementById('teamBName');
const $scoreA = document.getElementById('scoreA');
const $scoreB = document.getElementById('scoreB');
const $setsA = document.getElementById('setsA');
const $setsB = document.getElementById('setsB');
const $currentSetLabel = document.getElementById('currentSetLabel');
const $serveA = document.getElementById('serveA');
const $serveB = document.getElementById('serveB');
const $setDotsA = document.getElementById('setDotsA');
const $setDotsB = document.getElementById('setDotsB');
const $historyColA = document.getElementById('historyColA');
const $historyColB = document.getElementById('historyColB');
const $historyBody = document.getElementById('historyBody');
const $setHistory = document.getElementById('setHistory');
const $tiebreakBadge = document.getElementById('tiebreakBadge');
const $pointInfo = document.getElementById('pointInfo');

const $winnerOverlay = document.getElementById('winnerOverlay');
const $winnerName = document.getElementById('winnerName');
const $newMatchBtn = document.getElementById('newMatchBtn');
const $goHomeBtn = document.getElementById('goHomeBtn');

// ==========================================
// Helpers
// ==========================================

function getPointsToWin() {
  return state.currentSet === MAX_SETS ? POINTS_TO_WIN_TIEBREAK : POINTS_TO_WIN_SET;
}

function checkSetWinner(scoreA, scoreB, pointsToWin) {
  if (scoreA >= pointsToWin && scoreA - scoreB >= MIN_DIFF) return 'A';
  if (scoreB >= pointsToWin && scoreB - scoreA >= MIN_DIFF) return 'B';
  return null;
}

// ==========================================
// Render Functions
// ==========================================

function renderScores() {
  $scoreA.textContent = state.scoreA;
  $scoreB.textContent = state.scoreB;
}

function renderScorePop(team) {
  const el = team === 'A' ? $scoreA : $scoreB;
  el.classList.remove('pop');
  void el.offsetWidth; // reflow
  el.classList.add('pop');
}

function renderSetsHeader() {
  $setsA.textContent = state.setsA;
  $setsB.textContent = state.setsB;
  $currentSetLabel.textContent = state.currentSet;
}

function renderSetDots() {
  $setDotsA.innerHTML = '';
  $setDotsB.innerHTML = '';
  for (let i = 0; i < SETS_TO_WIN; i++) {
    const dotA = document.createElement('span');
    dotA.className = 'dot' + (i < state.setsA ? ' filled-a' : '');
    $setDotsA.appendChild(dotA);

    const dotB = document.createElement('span');
    dotB.className = 'dot' + (i < state.setsB ? ' filled-b' : '');
    $setDotsB.appendChild(dotB);
  }
}

function renderServe() {
  if (state.gameOver) {
    $serveA.classList.add('hidden');
    $serveB.classList.add('hidden');
    return;
  }
  $serveA.classList.toggle('hidden', state.serving !== 'A');
  $serveB.classList.toggle('hidden', state.serving !== 'B');
}

function renderTiebreak() {
  $tiebreakBadge.classList.toggle('hidden', !(state.currentSet === MAX_SETS && !state.gameOver));
}

function renderPointInfo() {
  const pts = getPointsToWin();
  $pointInfo.textContent = pts + ' pontos para vencer o set · Diferença mínima de ' + MIN_DIFF;
}

function renderHistory() {
  if (state.setsHistory.length === 0) {
    $setHistory.classList.add('hidden');
    return;
  }
  $setHistory.classList.remove('hidden');
  $historyColA.textContent = state.teamA;
  $historyColB.textContent = state.teamB;
  $historyBody.innerHTML = '';

  state.setsHistory.forEach((set, i) => {
    const tr = document.createElement('tr');
    const isWinnerA = set.scoreA > set.scoreB;
    const isWinnerB = set.scoreB > set.scoreA;

    tr.innerHTML = `
      <td>${i + 1}º</td>
      <td class="${isWinnerA ? 'winner-a' : ''}" style="text-align:center">${set.scoreA}</td>
      <td class="${isWinnerB ? 'winner-b' : ''}" style="text-align:center">${set.scoreB}</td>
    `;
    $historyBody.appendChild(tr);
  });
}

function renderAll() {
  renderScores();
  renderSetsHeader();
  renderSetDots();
  renderServe();
  renderTiebreak();
  renderPointInfo();
  renderHistory();
}

// ==========================================
// Actions
// ==========================================

function handleSetWon(winner, finalScoreA, finalScoreB, newSetsA, newSetsB) {
  state.setsHistory.push({ scoreA: finalScoreA, scoreB: finalScoreB });

  if (winner === 'A' && newSetsA >= SETS_TO_WIN) {
    endMatch(state.teamA);
  } else if (winner === 'B' && newSetsB >= SETS_TO_WIN) {
    endMatch(state.teamB);
  } else {
    state.scoreA = 0;
    state.scoreB = 0;
    state.currentSet++;
    state.serving = 'A';
    renderAll();
  }
}

function addPoint(team) {
  if (state.gameOver) return;

  if (team === 'A') {
    state.scoreA++;
  } else {
    state.scoreB++;
  }

  state.serving = team == 'A' ? 'A' : 'B';

  const pointsToWin = getPointsToWin();
  const setWinner = checkSetWinner(state.scoreA, state.scoreB, pointsToWin);

  if (setWinner) {
    if (setWinner === 'A') state.setsA++;
    else state.setsB++;

    renderAll();
    // Delay set transition for UX
    setTimeout(() => {
      handleSetWon(setWinner, state.scoreA, state.scoreB, state.setsA, state.setsB);
    }, 500);
  } else {
    renderAll();
    renderScorePop(team);
  }
}

function subtractPoint(team) {
  if (state.gameOver) return;
  if (team === 'A' && state.scoreA > 0) state.scoreA--;
  if (team === 'B' && state.scoreB > 0) state.scoreB--;
  renderAll();
}

function toggleServe() {
  if (state.gameOver) return;
  state.serving = state.serving === 'A' ? 'B' : 'A';
  renderServe();
}

function endMatch(winnerName) {
  state.gameOver = true;
  state.winner = winnerName;
  $winnerName.textContent = winnerName;
  $winnerOverlay.classList.remove('hidden');
  renderAll();
}

function resetMatch() {
  state.scoreA = 0;
  state.scoreB = 0;
  state.setsA = 0;
  state.setsB = 0;
  state.currentSet = 1;
  state.setsHistory = [];
  state.serving = 'A';
  state.gameOver = false;
  state.winner = null;
  $winnerOverlay.classList.add('hidden');
  renderAll();
}

function goHome() {
  $gameScreen.classList.remove('active');
  $setupScreen.classList.add('active');
  $winnerOverlay.classList.add('hidden');
  state = {
    teamA: 'Time A',
    teamB: 'Time B',
    scoreA: 0,
    scoreB: 0,
    setsA: 0,
    setsB: 0,
    currentSet: 1,
    setsHistory: [],
    serving: 'A',
    gameOver: false,
    winner: null
  };
}

function startGame() {
  const a = $teamAInput.value.trim() || 'Time A';
  const b = $teamBInput.value.trim() || 'Time B';
  state.teamA = a;
  state.teamB = b;
  state.scoreA = 0;
  state.scoreB = 0;
  state.setsA = 0;
  state.setsB = 0;
  state.currentSet = 1;
  state.setsHistory = [];
  state.serving = 'A';
  state.gameOver = false;
  state.winner = null;

  $teamAName.textContent = a;
  $teamBName.textContent = b;

  $setupScreen.classList.remove('active');
  $gameScreen.classList.add('active');
  $winnerOverlay.classList.add('hidden');
  renderAll();
}

// ==========================================
// Event Listeners
// ==========================================

$startBtn.addEventListener('click', startGame);

// Score buttons — delegated
$gameScreen.addEventListener('click', (e) => {
  const btn = e.target.closest('[data-team]');
  if (!btn) return;
  const team = btn.dataset.team;
  const action = btn.dataset.action;
  if (action === 'add') addPoint(team);
  if (action === 'sub') subtractPoint(team);
});

// Keyboard support
document.addEventListener('keydown', (e) => {
  if (!$gameScreen.classList.contains('active')) return;
  switch (e.key) {
    case 'a': case 'A': addPoint('A'); break;
    case 'l': case 'L': addPoint('B'); break;
    case 'z': case 'Z': subtractPoint('A'); break;
    case 'm': case 'M': subtractPoint('B'); break;
    case 's': case 'S': toggleServe(); break;
    case 'r': case 'R': if (!e.ctrlKey && !e.metaKey) resetMatch(); break;
    default: break;
  }
});

document.getElementById('toggleServeBtn').addEventListener('click', toggleServe);
document.getElementById('resetBtn').addEventListener('click', resetMatch);
$newMatchBtn.addEventListener('click', resetMatch);
$goHomeBtn.addEventListener('click', goHome);

// Enter key on setup
$teamAInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});
$teamBInput.addEventListener('keydown', (e) => {
  if (e.key === 'Enter') startGame();
});