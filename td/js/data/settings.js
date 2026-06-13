// Host-tweakable match settings. Ranges go to absurd values on purpose.
const SETTINGS = [
  { key: 'startCash', label: 'START CASH', def: 600, min: 0, max: 10000000, step: 50 },
  { key: 'startLives', label: 'START LIVES', def: 150, min: 1, max: 10000000, step: 10 },
  { key: 'startEco', label: 'START ECO', def: 150, min: 0, max: 1000000, step: 25 },
  { key: 'ecoMult', label: 'ECO PAYOUT X', def: 1, min: 0, max: 1000, step: 0.1 },
  { key: 'enemyHpMult', label: 'ENEMY HP X', def: 1, min: 0.1, max: 1000, step: 0.1 },
  { key: 'enemySpeedMult', label: 'ENEMY SPEED X', def: 1, min: 0.1, max: 50, step: 0.1 },
  { key: 'towerCostMult', label: 'TOWER COST X', def: 1, min: 0, max: 100, step: 0.1 },
  { key: 'upgradeCostMult', label: 'UPGRADE COST X', def: 0.85, min: 0, max: 100, step: 0.05 },
  { key: 'sendCostMult', label: 'SEND COST X', def: 1, min: 0, max: 100, step: 0.1 },
  { key: 'bountyMult', label: 'POP BOUNTY X', def: 1, min: 0, max: 1000, step: 0.1 },
  { key: 'roundBonusMult', label: 'ROUND BONUS X', def: 1, min: 0, max: 1000, step: 0.1 },
  { key: 'powerCdMult', label: 'POWER CD X', def: 1, min: 0, max: 100, step: 0.1 },
  { key: 'powerUsesMult', label: 'POWER USES X', def: 1, min: 0, max: 1000, step: 1 },
  { key: 'abilityCdMult', label: 'ABILITY CD X', def: 1, min: 0, max: 100, step: 0.1 },
  { key: 'startRound', label: 'START ROUND', def: 1, min: 1, max: 100, step: 1 },
  { key: 'roundCap', label: 'ROUND CAP (S)', def: 75, min: 5, max: 3600, step: 5 },
  { key: 'sellRefundPct', label: 'SELL REFUND %', def: 70, min: 0, max: 1000, step: 5 },
];

export default SETTINGS;

export function defaultSettings() {
  const out = {};
  for (const s of SETTINGS) out[s.key] = s.def;
  return out;
}

// Clamp and sanitize a possibly hostile/garbage settings object.
export function cleanSettings(raw) {
  const out = defaultSettings();
  if (!raw || typeof raw !== 'object') return out;
  for (const s of SETTINGS) {
    const v = Number(raw[s.key]);
    if (Number.isFinite(v)) out[s.key] = Math.min(s.max, Math.max(s.min, v));
  }
  return out;
}
