// js/ui/title.js - title screen wiring.
// Contract:
//   initTitle({ onHost(name), onJoin(name, code) })
// Reads and persists the player name under localStorage key "rushtd_name".
// Screen visibility (.hidden on #screen-title) is owned by main.js.

const NAME_KEY = 'rushtd_name';

export function initTitle({ onHost, onJoin }) {
  const nameEl = document.getElementById('title-name');
  const codeEl = document.getElementById('title-code');
  const hostBtn = document.getElementById('btn-host');
  const joinBtn = document.getElementById('btn-join');
  const msgEl = document.getElementById('title-msg');

  try {
    const saved = localStorage.getItem(NAME_KEY);
    if (saved) nameEl.value = saved;
  } catch (e) { /* storage unavailable, ignore */ }

  function persistName() {
    try { localStorage.setItem(NAME_KEY, nameEl.value.trim()); } catch (e) { /* ignore */ }
  }
  nameEl.addEventListener('input', persistName);

  codeEl.addEventListener('input', () => {
    codeEl.value = codeEl.value.toUpperCase().replace(/[^A-Z2-9]/g, '');
  });

  function getName() {
    const name = nameEl.value.trim().slice(0, 12);
    if (!name) {
      msgEl.textContent = 'ENTER A NAME FIRST';
      nameEl.focus();
      return null;
    }
    msgEl.textContent = '';
    persistName();
    return name;
  }

  hostBtn.addEventListener('click', () => {
    const name = getName();
    if (name) onHost(name);
  });

  joinBtn.addEventListener('click', () => {
    const name = getName();
    if (!name) return;
    const code = codeEl.value.trim().toUpperCase();
    if (code.length !== 4) {
      msgEl.textContent = 'CODE IS 4 CHARACTERS';
      codeEl.focus();
      return;
    }
    onJoin(name, code);
  });

  codeEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') joinBtn.click();
  });
  nameEl.addEventListener('keydown', (e) => {
    if (e.key === 'Enter') hostBtn.click();
  });
}

// Optional helper for main.js: surface a connection error on the title screen.
export function titleError(text) {
  const msgEl = document.getElementById('title-msg');
  if (msgEl) msgEl.textContent = String(text).toUpperCase();
}
