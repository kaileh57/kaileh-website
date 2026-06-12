// js/ui/gameover.js - end screen: result, winner, stats table.
//
// Contract:
//   initGameOver({ onBack })           wire the BACK TO TITLE button (call once at boot)
//   showGameOver({ won, winnerName, stats })
//     won: bool (did I win)
//     winnerName: string
//     stats: [{name, roundsSurvived, popped}]
//   showGameOver fills the screen content and removes .hidden from #screen-gameover.
//   Hiding it again (on BACK) is owned by main.js via the onBack callback.

export function initGameOver({ onBack }) {
  document.getElementById('btn-back').onclick = () => onBack();
}

export function showGameOver({ won, winnerName, stats }) {
  const result = document.getElementById('over-result');
  result.textContent = won ? 'VICTORY' : 'DEFEAT';
  result.classList.toggle('won', !!won);
  result.classList.toggle('lost', !won);

  document.getElementById('over-winner').textContent =
    winnerName ? 'WINNER: ' + winnerName : '';

  const body = document.getElementById('over-stats');
  body.innerHTML = '';
  for (const s of stats || []) {
    const tr = document.createElement('tr');
    const name = document.createElement('td');
    name.textContent = s.name;
    const rounds = document.createElement('td');
    rounds.textContent = String(s.roundsSurvived != null ? s.roundsSurvived : '-');
    const popped = document.createElement('td');
    popped.textContent = String(s.popped != null ? s.popped : '-');
    tr.append(name, rounds, popped);
    body.appendChild(tr);
  }

  document.getElementById('screen-gameover').classList.remove('hidden');
}
