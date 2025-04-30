// --- GET ELEMENTS ---
const canvas = document.getElementById('simulationCanvas');
const ctx = canvas.getContext('2d', { alpha: false });
const uiMaterialText = document.getElementById('material-text');
const uiFPSText = document.getElementById('fps-text');
const uiCoordsText = document.getElementById('coords-text');
const paletteDiv = document.getElementById('palette');
const clearButton = document.getElementById('clear-button');
const faviconCanvas = document.getElementById('faviconCanvas');
const faviconCtx = faviconCanvas.getContext('2d');
const faviconLink = document.getElementById('favicon');

// --- FAVICON VARS ---
let faviconUpdateCounter = 0;
const faviconColors = ['#ff0000', '#ffff00', '#00ff00', '#00ffff', '#0000ff', '#ff00ff'];
let faviconColorIndex = 0;


// --- CONSTANTS ---
const GRID_WIDTH = 200;
const GRID_HEIGHT = 150;
const CELL_SIZE = 4;

const WIDTH = GRID_WIDTH * CELL_SIZE;
const HEIGHT = GRID_HEIGHT * CELL_SIZE;

canvas.width = WIDTH;
canvas.height = HEIGHT;
ctx.imageSmoothingEnabled = false;


// --- PARTICLE TYPES ---
const EMPTY = 0; const SAND = 1; const WATER = 2; const STONE = 3;
const PLANT = 4; const FIRE = 5; const LAVA = 6; const GLASS = 7;
const STEAM = 8; const OIL = 9; const ACID = 10; const COAL = 11;
const GUNPOWDER = 12; const ICE = 13; const WOOD = 14; const SMOKE = 15;
const TOXIC_GAS = 16; const SLIME = 17; const GASOLINE = 18; const GENERATOR = 19;
const FUSE = 20; const ASH = 21; const ERASER = 99;

// --- COLORS ---
const C_EMPTY = [0, 0, 0]; const C_SAND = [194, 178, 128]; const C_WATER = [50, 100, 200];
const C_STONE = [100, 100, 100]; const C_PLANT = [50, 150, 50]; const C_FIRE = [255, 69, 0];
const C_LAVA = [200, 50, 0]; const C_GLASS = [210, 230, 240]; const C_STEAM = [180, 180, 190];
const C_OIL = [80, 70, 20]; const C_ACID = [100, 255, 100]; const C_COAL = [40, 40, 40];
const C_GUNPOWDER = [60, 60, 70]; const C_ICE = [170, 200, 255]; const C_WOOD = [139, 69, 19];
const C_SMOKE = [150, 150, 150]; const C_TOXIC_GAS = [150, 200, 150]; const C_SLIME = [100, 200, 100];
const C_GASOLINE = [255, 223, 186]; const C_GENERATOR = [255, 0, 0]; const C_FUSE = [100, 80, 60];
const C_ASH = [90, 90, 90]; const C_ERASER = [255,0,255];


// --- MATERIAL PROPERTIES ---
// Lifespans are now in approx seconds
// Index:    0       1         2           3         4        5           6              7           8       9(life_sec) 10       11                12             13
//        [density, conduct, flammability, melt_temp, boil_temp, freeze_temp, base_color_arr, name, viscosity, life, corrosive_pwr, explosive_yield, heatGeneration, ignite_temp]
const MATERIALS = {
    //                 Dens Cond Flam Melt Boil Frze Color        Name         Visc Life Corr Expl Heat IgnTemp
    [EMPTY]:     [   0, 0.1, 0.0, null, null, null, C_EMPTY,     "Empty",      1, null, 0.0, null, 0.0, null ],
    [SAND]:      [   5, 0.3, 0.0, 1500, null, null, C_SAND,      "Sand",       1, null, 0.0, null, 0.0, null ],
    [WATER]:     [   3, 0.6, 0.0, null,  100,    0, C_WATER,     "Water",      1, null, 0.0, null, 0.0, null ],
    [STONE]:     [  10, 0.2, 0.0, null, null, null, C_STONE,     "Stone",      1, null, 0.0, null, 0.0, null ],
    [PLANT]:     [ 0.1, 0.1, 0.4,  200, null, null, C_PLANT,     "Plant",      1, null, 0.0, null, 0.0, 150  ],
    [FIRE]:      [  -2, 0.9, 0.0, null, null, null, C_FIRE,      "Fire",       1,  1.0, 0.0, null, 0.0, null ], // ~1 sec
    [LAVA]:      [   8, 0.8, 0.0, 1800, null, 1000, C_LAVA,      "Lava",       5, null, 0.0, null, 0.0, null ],
    [GLASS]:     [   9, 0.4, 0.0, 1800, null, null, C_GLASS,     "Glass",      1, null, 0.0, null, 0.0, null ],
    [STEAM]:     [  -5, 0.7, 0.0, null, null,   99, C_STEAM,     "Steam",      1, 10.0, 0.0, null, 0.0, null ], // ~10 sec
    [OIL]:       [   2, 0.4, 0.9, null,  300, null, C_OIL,       "Oil",        3, null, 0.0, null, 0.0, 200  ],
    [ACID]:      [ 3.5, 0.5, 0.0, null,  200, null, C_ACID,      "Acid",       1, null, 0.15,null, 0.0, null ],
    [COAL]:      [   4, 0.2, 1.0,  800, null, null, C_COAL,      "Coal",       1, null, 0.0, null, 0.0, 250  ], // Lowered ignition temp further
    [GUNPOWDER]: [ 4.5, 0.1, 1.0,  null, null, null, C_GUNPOWDER, "Gunpowder",  1, null, 0.0, 4,    0.0, 150  ],
    [ICE]:       [ 2.9, 0.01, 0.0,   1, null, null, C_ICE,       "Ice",        1, null, 0.0, null, 0.0, null ], // Very low conductivity
    [WOOD]:      [   0.7, 0.2, 0.6,  400, null, null, C_WOOD,    "Wood",       1, null, 0.0, null, 0.0, 200  ], // Lowered ignition temp further
    [SMOKE]:     [  -3, 0.1, 0.0, null, null, null, C_SMOKE,     "Smoke",      1,  3.0, 0.0, null, 0.0, null ], // ~3 sec
    [TOXIC_GAS]: [  -4, 0.1, 0.1, null, null, null, C_TOXIC_GAS, "Toxic Gas",  1,  5.0, 0.02,null, 0.0, null ], // ~5 sec
    [SLIME]:     [ 3.2, 0.3, 0.1, null,  150, null, C_SLIME,     "Slime",     10, null, 0.0, null, 0.0, null ],
    [GASOLINE]:  [ 0.8, 0.5, 1.0, null,   80, null, C_GASOLINE,  "Gasoline",   2, null, 0.0, null, 0.0, 100  ],
    [GENERATOR]: [ 100, 0.9, 0.0, null, null, null, C_GENERATOR, "Generator",  1, null, 0.0, null, 5.0, null ],
    [FUSE]:      [   5, 0.2, 1.0,  150, null, null, C_FUSE,      "Fuse",       1, null, 0.0, null, 0.0, 150  ],
    [ASH]:       [ 4.8, 0.2, 0.0, null, null, null, C_ASH,       "Ash",        1, null, 0.0, null, 0.0, null ],
    [ERASER]:    [   0, 0.0, 0.0, null, null, null, C_ERASER,    "Eraser",     1, null, 0.0, null, 0.0, null ],
};

// --- SIMULATION PARAMETERS ---
const AMBIENT_TEMP = 20.0; const COOLING_RATE = 0.005; const FIRE_HEAT_TRANSFER = 60.0;
const WATER_COOLING_FACTOR = 80.0; const PLANT_GROWTH_CHANCE_PER_SEC = 0.09; // = 0.0015 * 60
const MAX_TEMP = 3000;
const DEFAULT_FIRE_LIFESPAN_SEC = MATERIALS[FIRE][9];
const FUSE_BURN_LIFESPAN_SEC = 4.0; // ~4 sec
const CONDENSATION_Y_LIMIT = 5; const CONDENSATION_CHANCE_ANYWHERE_PER_SEC = 0.006; // = 0.0001 * 60
const PHASE_CHANGE_TEMP_BUFFER = 5.0; const HIGH_INERTIA_DAMPING = 0.2;
const MIN_STATE_SECONDS = 10.0; // Min time for Lava/Steam state
const TARGET_DT_SCALING = 60.0; // Factor to scale rates based on 60fps baseline
const ACID_GAS_TEMP_FACTOR = 0.8; // Temperature factor for gas created by acid

// Helper function to check if a type is liquid
function isLiquid(type) {
    // Only true fluids should flow like liquids
    return type === WATER || type === OIL || type === ACID || type === GASOLINE || type === LAVA;
}

// Helper function to check if a type behaves like a powder/granular solid
function isPowder(type) {
    return type === SAND || type === ASH || type === GUNPOWDER || type === COAL; // Maybe add PLANT?
}

// Helper function to check if a type is a generally rigid solid
function isRigidSolid(type) {
    return type === STONE || type === GLASS || type === WOOD || type === ICE;
}

// --- PARTICLE CLASS ---
class Particle {
    constructor(x, y, type = EMPTY, temp = AMBIENT_TEMP) {
        this.x = x; this.y = y; this.type = type;
        this.initialTemp = temp; this.temp = temp; this.processed = false;
        this.life = null; // Life is now in seconds
        this.timeInState = 0.0; // Tracks time in current state (for Lava/Steam)
        this.movedThisStep = false; // For wave/splash logic
        this.burning = false;
        this.initProperties();
    }
    initProperties() {
         const props = this.getProperties();
         let targetTemp = this.temp;
         // Initial temp boosts
         if (this.type === FIRE) targetTemp = Math.max(this.temp, 800);
         else if (this.type === LAVA) targetTemp = Math.max(this.temp, 1800);
         else if (this.type === STEAM) targetTemp = Math.max(this.temp, 101);
         else if (this.type === GENERATOR) targetTemp = Math.max(this.temp, 300);
         else if (this.type === ICE) targetTemp = Math.min(this.temp, -5);
         // Temp retention for phase changes
         else if (this.type === SAND && this.temp > 1500) targetTemp = Math.max(this.temp, 1500);
         else if (this.type === STONE && this.temp > 1000) targetTemp = Math.max(this.temp, 1000);

         this.temp = Math.max(-273.15, Math.min(MAX_TEMP, targetTemp));
         this.life = props[9] ?? null; // Assign lifespan from materials (now in seconds)
         this.timeInState = 0.0; // Reset time in state when properties re-initialized
         this.invalidateColorCache();
     }
    getProperties() { return MATERIALS[this.type] || MATERIALS[EMPTY]; }
    invalidateColorCache() { this._colorCache = null; }
    getColor() { if (this._colorCache) return this._colorCache; const props = this.getProperties(); const baseColorArr = props[6]; let r = baseColorArr[0], g = baseColorArr[1], b = baseColorArr[2]; const type = this.type; if (type !== EMPTY) { let tempFactor = 0; if (type !== FIRE && type !== LAVA && type !== STEAM && type !== SMOKE && type !== TOXIC_GAS && type !== GENERATOR) { tempFactor = Math.max(-0.5, Math.min(1.5, (this.temp - AMBIENT_TEMP) / 150)); r = Math.max(0, Math.min(255, r + tempFactor * 25)); g = Math.max(0, Math.min(255, g + tempFactor * 15)); b = Math.max(0, Math.min(255, b + tempFactor * 10 - Math.abs(tempFactor) * 15)); } else if (type === FIRE) { const flicker = Math.random() * 0.3 + 0.85; tempFactor = Math.max(0, Math.min(1, (this.temp - 500) / 600)); r = Math.min(255, baseColorArr[0] * flicker + tempFactor * 60); g = Math.min(255, baseColorArr[1] * flicker * (1.0 - tempFactor * 0.6)); b = Math.max(0, baseColorArr[2] * flicker * (1.0 - tempFactor)); } else if (type === LAVA) { tempFactor = Math.max(0, Math.min(1, (this.temp - 1000) / 800)); r = Math.min(255, baseColorArr[0] + tempFactor * 50); g = Math.min(255, baseColorArr[1] + tempFactor * 70); b = Math.max(0, baseColorArr[2] * (1 - tempFactor * 0.5)); } else if (type === GENERATOR) { tempFactor = Math.max(0, Math.min(1, (this.temp - 300) / 1000)); r = Math.min(255, baseColorArr[0] + tempFactor * 50); g = Math.max(0, baseColorArr[1] * (1 - tempFactor * 0.8)); b = Math.max(0, baseColorArr[2] * (1 - tempFactor * 0.8)); } else if (type === STEAM || type === SMOKE || type === TOXIC_GAS) { const maxLife = props[9]; if (this.life !== null && maxLife !== null && maxLife > 0) { const lifeFactor = Math.max(0, this.life / maxLife); const fade = 0.6 * (1 - lifeFactor); const gray = 80; r = Math.floor(r * lifeFactor + gray * fade); g = Math.floor(g * lifeFactor + gray * fade); b = Math.floor(b * lifeFactor + gray * fade); } } else if (type === FUSE && this.burning) { r = Math.min(255, r + 100); g = Math.min(255, g + 50); b = Math.max(0, b - 20); } } this._colorCache = `rgb(${Math.floor(r)}, ${Math.floor(g)}, ${Math.floor(b)})`; return this._colorCache; }
    changeType(newType, newTemp = null) {
        const oldType = this.type;
        const oldTemp = this.temp;
        const currentX = this.x;
        const currentY = this.y;

        this.type = newType;
        if (newTemp !== null) {
            this.temp = newTemp;
        }
        // Re-init properties *before* position potentially changes
        this.initProperties(); // This now resets timeInState and sets new lifespan

        // Restore position (important if initProperties modifies them, though it shouldn't)
        this.x = currentX;
        this.y = currentY;

        // Apply specific temperature adjustments based on phase change
        if (newTemp === null) { // Only adjust if no specific temp was provided
            let needsPhaseTempAdjust = true;
            if (newType === FIRE || newType === LAVA || newType === STEAM || newType === GENERATOR || newType === ICE) {
                needsPhaseTempAdjust = false; // These types have temps set/maintained in initProperties
            }
            if (needsPhaseTempAdjust) {
                 if (newType === WATER && oldType === STEAM) this.temp = Math.min(99, Math.max(AMBIENT_TEMP, oldTemp - 20));
                 else if (newType === WATER && oldType === ICE) this.temp = Math.max(1, Math.min(AMBIENT_TEMP, oldTemp + 5));
                 else if (newType === LAVA && oldType === GLASS) this.temp = Math.max(1800, oldTemp + 50);
                 else if (newType === STONE && oldType === LAVA) this.temp = Math.min(999, oldTemp - 100);
                 else if (newType === GLASS && oldType === SAND) this.temp = Math.max(1500, oldTemp + 20);
                 else if (newType === ASH && oldType === FUSE) this.temp = Math.max(AMBIENT_TEMP, oldTemp * 0.5);
                 else if (newType === SMOKE && oldType === FIRE) this.temp = Math.max(AMBIENT_TEMP, oldTemp * 0.6);
                 else {
                     this.temp = oldTemp; // Default: keep old temperature
                 }
                 // Clamp temperature after adjustment
                 this.temp = Math.max(-273.15, Math.min(MAX_TEMP, this.temp));
            }
        }
        // Reset timeInState explicitly here as well for clarity (though initProperties does it)
        this.timeInState = 0.0;

        this.invalidateColorCache();
    }
} // --- END OF PARTICLE CLASS ---


// --- SIMULATION CLASS ---
class Simulation {
    constructor(width, height) { this.width = width; this.height = height; this.grid = []; this.colOrder = Array.from(Array(width).keys()); this.initGrid(); }
    initGrid() { this.grid = Array.from({ length: this.height }, (_, y) => Array.from({ length: this.width }, (_, x) => new Particle(x, y, EMPTY)) ); console.log("Grid initialized/cleared."); }
    isValid(x, y) { return x >= 0 && x < this.width && y >= 0 && y < this.height; }
    getParticle(x, y) { return this.isValid(x, y) ? this.grid[y][x] : null; }
    setParticle(x, y, particle) { if (this.isValid(x, y)) { const oldParticle = this.grid[y][x]; particle.x = x; particle.y = y; particle.invalidateColorCache(); this.grid[y][x] = particle; return oldParticle; } return null; }
    swapParticles(x1, y1, x2, y2) { if (!this.isValid(x1, y1) || !this.isValid(x2, y2)) return; const p1 = this.grid[y1][x1]; const p2 = this.grid[y2][x2]; this.grid[y1][x1] = p2; this.grid[y2][x2] = p1; if (p1) { p1.x = x2; p1.y = y2; p1.invalidateColorCache(); } if (p2) { p2.x = x1; p2.y = y1; p2.invalidateColorCache(); } }
    shuffleArray(array) { for (let i = array.length - 1; i > 0; i--) { const j = Math.floor(Math.random() * (i + 1)); [array[i], array[j]] = [array[j], array[i]]; } }

    // --- Main Update Loop --- Takes deltaTime in seconds ---
    update(deltaTime) {
        // Reset processed flag and movedThisStep flag
        for (let y = 0; y < this.height; y++) { for (let x = 0; x < this.width; x++) {
            const p = this.grid[y][x];
            if (p) {
                 p.processed = false;
                 p.movedThisStep = false;
            }
        }}
        // Shuffle column processing order
        this.shuffleArray(this.colOrder);
        // Process particles bottom-up, using shuffled column order
        for (let y = this.height - 1; y >= 0; y--) {
             for (const x of this.colOrder) {
                 const particle = this.grid[y][x];
                 if (particle && !particle.processed && particle.type !== EMPTY) {
                     this.updateParticle(particle, deltaTime);
                 }
             }
        }
    }

    // --- Individual Particle Update --- Takes deltaTime in seconds ---
    updateParticle(particle, deltaTime) {
        particle.processed = true; const { x, y } = particle;

        // 1. Handle Lifespan & Burnout
        this.handleLifespanAndBurnout(particle, deltaTime);
        // Re-get particle in case it was removed by lifespan burnout
        const p1 = this.getParticle(x, y); if (!p1 || p1 !== particle || p1.type === EMPTY) return;

        // 2. Update Temperature
        this.updateTemperature(particle, deltaTime);
        // Re-get particle, temp change doesn't remove but good practice
        const p2 = this.getParticle(x, y); if (!p2 || p2 !== particle || p2.type === EMPTY) return;

        // 3. Handle State Changes & Special Effects
        this.handleStateChangesAndEffects(particle, deltaTime);
        // Re-get particle in case state change removed or replaced it
        const p3 = this.getParticle(x, y); if (!p3 || p3 !== particle || p3.type === EMPTY) return;

        // 4. Increment timeInState (for Lava/Steam duration check)
         // Increment regardless of type, reset happens on changeType/initProperties
         particle.timeInState += deltaTime;

        // 5. Handle Movement
        const currentProps = particle.getProperties();
        this.handleMovement(particle, currentProps); // Movement doesn't use deltaTime directly
    }

    // --- Helper: Lifespan & Burnout --- Takes deltaTime ---
     handleLifespanAndBurnout(particle, deltaTime) {
         let needsCheck = false;
         let isBurningFuse = false;

         if (particle.type === FUSE && particle.burning) {
             needsCheck = true;
             isBurningFuse = true;
             if (particle.life === null) { // Start fuse burn timer if not already
                 particle.life = FUSE_BURN_LIFESPAN_SEC;
             }
         } else if (particle.life !== null) { // Check other timed-life particles
             needsCheck = true;
         }

         if (needsCheck) {
             particle.life -= deltaTime; // Decrease life by elapsed time
             if (isBurningFuse) {
                 particle.temp = Math.min(MAX_TEMP, particle.temp + 5 * deltaTime * TARGET_DT_SCALING);
             }
             particle.invalidateColorCache();

             // Check if lifespan ended
             if (particle.life !== null && particle.life <= 0) {
                 const cX = particle.x; const cY = particle.y; const cT = particle.temp;
                 const oT = particle.type; let rT = EMPTY; let rTp = AMBIENT_TEMP;

                 if (oT === FIRE) { rT = SMOKE; rTp = Math.min(400, cT * 0.6); }
                 else if (oT === FUSE) { rT = ASH; rTp = Math.max(AMBIENT_TEMP, cT * 0.5); }
                 else if (oT === STEAM || oT === SMOKE || oT === TOXIC_GAS) { rT = EMPTY; }
                 // Set the new particle (removes the old one)
                 this.setParticle(cX, cY, new Particle(cX, cY, rT, rTp));
                 // Important: Return here because the original particle is gone
                 return;
             }
         }
     }

    // --- Helper: State Changes & Special Effects --- Takes deltaTime ---
    handleStateChangesAndEffects(particle, deltaTime) {
         const { x, y } = particle; let ptype = particle.type; let temp = particle.temp;
         const props = particle.getProperties(); let stateChanged = false;
         const mT = props[3]; const bT = props[4]; const fT = props[5]; const iT = props[13];
         const dtScale = deltaTime * TARGET_DT_SCALING; // Scale factor for probabilities/rates

         // --- Ignition Check ---
         if (!stateChanged && iT !== null && temp >= iT && props[2] > 0) {
             let nS = -1; let iST = temp; let externalIgnition = false;
             // Check neighbors for existing fire/lava/burning fuse
             for (let dx = -1; dx <= 1; dx++) { for (let dy = -1; dy <= 1; dy++) { if (dx === 0 && dy === 0) continue; const n = this.getParticle(x + dx, y + dy); if (n && (n.type === FIRE || n.type === LAVA || (n.type === FUSE && n.burning))) { externalIgnition = true; iST = Math.max(iST, n.temp); break; } } if(externalIgnition) break; }

             if (ptype === PLANT || ptype === WOOD || ptype === COAL || ptype === OIL || ptype === GASOLINE) {
                 // Needs external ignition source or very high temp
                 if (externalIgnition || temp > iT + 100) { // Slightly reduced extra temp requirement
                    nS = FIRE;
                 }
             } else if (ptype === GUNPOWDER) {
                 // Gunpowder ignites easily if temp threshold met
                 this.explode(x, y, props[11] || 4);
                 return; // Explosion replaces particle
             } else if (ptype === FUSE && !particle.burning) {
                 // Fuse needs external ignition to start burning flag
                 if (externalIgnition) {
                      particle.burning = true;
                      particle.life = FUSE_BURN_LIFESPAN_SEC; // Start countdown
                      particle.temp = Math.max(temp, iT + 50);
                      particle.invalidateColorCache();
                      stateChanged = true;
                 }
             }
             if (nS !== -1 && nS !== ptype) {
                 // Set high initial temp and longer lifespan for Wood/Coal fire
                 const initialFireTemp = Math.max(800, iST); // Ensure high temp
                 let initialFireLife = DEFAULT_FIRE_LIFESPAN_SEC;
                 if (ptype === WOOD) initialFireLife = 3.0;
                 if (ptype === COAL) initialFireLife = 4.0;

                 particle.changeType(nS, initialFireTemp);
                 particle.life = initialFireLife; // Set lifespan *after* changeType
                 return; // Type changed
             }
         }

         // --- Melting Check ---
         if (!stateChanged && mT !== null && temp >= mT + PHASE_CHANGE_TEMP_BUFFER) {
             let nS = -1;
             if (ptype === SAND) nS = GLASS;
             else if (ptype === GLASS) nS = LAVA;
             else if (ptype === ICE) nS = WATER;
             if (nS !== -1 && nS !== ptype) { particle.changeType(nS); return; }
         }

         // --- Boiling Check ---
         if (!stateChanged && bT !== null && temp >= bT + PHASE_CHANGE_TEMP_BUFFER) {
             let nS = -1;
             if (ptype === WATER) nS = STEAM;
             else if (ptype === ACID) nS = TOXIC_GAS;
             else if (ptype === SLIME) nS = TOXIC_GAS;
             if (nS !== -1 && nS !== ptype) { particle.changeType(nS); return; }
         }

         // --- Freezing/Condensation Check ---
         if (!stateChanged && fT !== null && temp <= fT - PHASE_CHANGE_TEMP_BUFFER) {
             let nS = -1;
             // Check minimum time in state for Steam, but allow Lava to cool based on temp
             if (ptype === LAVA) { // Lava can turn to stone if cold enough, regardless of time
                 nS = STONE;
             } else if (ptype === WATER) {
                 nS = ICE;
             } else if (ptype === STEAM && particle.timeInState >= MIN_STATE_SECONDS) {
                  // Condensation check
                  const condensationChance = (y < CONDENSATION_Y_LIMIT)
                      ? 1.0 // Always condense if cool enough and high up
                      : CONDENSATION_CHANCE_ANYWHERE_PER_SEC * deltaTime;
                  if (Math.random() < condensationChance) {
                     nS = WATER;
                  }
             }
             if (nS !== -1 && nS !== ptype) { particle.changeType(nS); return; }
         }

         ptype = particle.type; // Re-check type in case it changed
         const cP = particle.getProperties();

         // --- Specific Material Effects ---
         if (ptype === FIRE) {
             let fuelFound = false; let extinguish = false;
             for (let dx = -1; dx <= 1; dx++) {
                 for (let dy = -1; dy <= 1; dy++) {
                     if (dx === 0 && dy === 0) continue;
                     const n = this.getParticle(x + dx, y + dy);
                     if (n) {
                         const nP = n.getProperties();
                         const nT = n.type;
                         // Heat transfer (already happens in updateTemperature, maybe adjust here?)
                         // if (nT !== EMPTY) { n.temp = Math.min(MAX_TEMP, n.temp + (FIRE_HEAT_TRANSFER * dtScale) / (1 + Math.abs(dx) + Math.abs(dy))); n.invalidateColorCache(); }
                         // Check for extinguishing materials
                         if (nT === WATER || nT === ICE) { particle.temp -= WATER_COOLING_FACTOR * dtScale; particle.life = Math.max(0.01, (particle.life ?? DEFAULT_FIRE_LIFESPAN_SEC) - 10 * deltaTime); if (Math.random() < 0.5 * dtScale) { if (nT === WATER) n.changeType(STEAM); else if (nT === ICE) n.changeType(WATER); } if (particle.temp < 300) extinguish = true; particle.invalidateColorCache(); }
                         // Check for fuel & ignition (more reliable ignition)
                         const fl = nP[2]; const nIT = nP[13];
                         if (nT !== FIRE && fl > 0) {
                             fuelFound = true;
                             if (nIT !== null && n.temp >= nIT ) {
                                 // Removed random chance
                                 if (nT === GUNPOWDER) {
                                     this.explode(n.x, n.y, nP[11] || 4);
                                 } else if (nT === FUSE && !n.burning) {
                                     n.burning = true;
                                     n.life = FUSE_BURN_LIFESPAN_SEC;
                                     n.temp = Math.max(n.temp, nIT + 50);
                                     n.invalidateColorCache();
                                 } else if (nT !== FIRE) {
                                     // When fire spreads to Wood/Coal, give it longer life
                                     const neighborIsWood = (nT === WOOD);
                                     const neighborIsCoal = (nT === COAL);
                                     const initialFireTemp = Math.max(800, n.temp); // Ensure high temp
                                     let initialFireLife = DEFAULT_FIRE_LIFESPAN_SEC;
                                     if (neighborIsWood) initialFireLife = 3.0;
                                     if (neighborIsCoal) initialFireLife = 4.0;

                                     n.changeType(FIRE, initialFireTemp);
                                     n.life = initialFireLife; // Set lifespan *after* changeType
                                 }
                             }
                         }
                     } // End if(n)
                 } // End inner loop (dy)
             } // End outer loop (dx)
             // Extend fire life if fuel nearby
             if (fuelFound && particle.life !== null) { particle.life = Math.max(particle.life, DEFAULT_FIRE_LIFESPAN_SEC); }
             // Spawn smoke randomly
             if (!extinguish && Math.random() < 0.1 * dtScale) { const sX = x + (Math.random() < 0.5 ? -1 : 1); const sY = y - 1; const t = this.getParticle(sX, sY); if (t && t.type === EMPTY) { this.setParticle(sX, sY, new Particle(sX, sY, SMOKE, particle.temp * 0.5)); } }
             // Extinguish fire
             if (extinguish) { this.setParticle(x, y, new Particle(x, y, SMOKE, particle.temp)); return; }
         }
         else if (ptype === FUSE && particle.burning) {
             for (let dx = -1; dx <= 1; dx++) {
                 for (let dy = -1; dy <= 1; dy++) {
                     if (dx === 0 && dy === 0) continue;
                     const n = this.getParticle(x + dx, y + dy);
                     if (n) {
                         const nP = n.getProperties();
                         const nT = n.type;
                         const nIT = nP[13]; // Heat neighbours slightly
                         n.temp = Math.min(MAX_TEMP, n.temp + 20 * dtScale);
                         n.invalidateColorCache(); // Check ignition
                         if (nIT !== null && n.temp >= nIT) {
                             // Removed random chance
                             if (nT === FUSE && !n.burning /*&& Math.random() < 0.8 * dtScale*/) {
                                 n.burning = true;
                                 n.life = FUSE_BURN_LIFESPAN_SEC;
                                 n.temp = Math.max(n.temp, nIT + 50);
                                 n.invalidateColorCache();
                             } else if (nT === GUNPOWDER /*&& Math.random() < 0.9 * dtScale*/) {
                                 this.explode(n.x, n.y, nP[11] || 4);
                             } else if (nP[2] > 0 && nT !== FIRE /*&& Math.random() < (nP[2] * 0.2 * dtScale)*/) {
                                 // When fuse ignites Wood/Coal
                                 const neighborIsWood = (nT === WOOD);
                                 const neighborIsCoal = (nT === COAL);
                                 const initialFireTemp = Math.max(800, n.temp); // Ensure high temp
                                 let initialFireLife = DEFAULT_FIRE_LIFESPAN_SEC;
                                 if (neighborIsWood) initialFireLife = 3.0;
                                 if (neighborIsCoal) initialFireLife = 4.0;

                                 n.changeType(FIRE, initialFireTemp);
                                 n.life = initialFireLife; // Set lifespan *after* changeType
                             }
                         }
                     } // End if(n)
                 } // End inner loop (dy)
             } // End outer loop (dx)
         }
         else if (ptype === LAVA) {
             for (let dx = -1; dx <= 1; dx++) {
                 for (let dy = -1; dy <= 1; dy++) {
                     if (dx === 0 && dy === 0) continue;
                     const n = this.getParticle(x + dx, y + dy);
                     if(n){
                         const nP = n.getProperties();
                         const nT = n.type;
                         const nIT = nP[13];
                         if(nIT !== null && nP[2] > 0 && nT !== FIRE){ // Heat neighbours strongly
                             // n.temp = Math.min(MAX_TEMP, n.temp + FIRE_HEAT_TRANSFER * dtScale); // Temp transfer handled globally
                             // Check ignition
                             if(n.temp >= nIT){
                                 // Removed random chance
                                 if (nT === GUNPOWDER) {
                                     this.explode(n.x, n.y, nP[11] || 4);
                                 } else if (nT === FUSE && !n.burning) {
                                     n.burning = true; n.life = FUSE_BURN_LIFESPAN_SEC; n.temp = Math.max(n.temp, nIT + 50); n.invalidateColorCache();
                                 } else if (nT !== FIRE /*&& Math.random() < 0.5 * dtScale*/) { // High chance to ignite flammable
                                     // When lava ignites Wood/Coal
                                     const neighborIsWood = (nT === WOOD);
                                     const neighborIsCoal = (nT === COAL);
                                     const initialFireTemp = Math.max(1000, n.temp); // Lava makes hotter fire
                                     let initialFireLife = DEFAULT_FIRE_LIFESPAN_SEC;
                                     if (neighborIsWood) initialFireLife = 3.0;
                                     if (neighborIsCoal) initialFireLife = 4.0;

                                     n.changeType(FIRE, initialFireTemp);
                                     n.life = initialFireLife; // Set lifespan *after* changeType
                                 }
                             }
                             n.invalidateColorCache();
                         }
                     }
                 }
             }
         }
         else if (ptype === ACID) {
             const cPow = cP[10] || 0.0; if (cPow > 0) { let consumed = false; for (let dx = -1; dx <= 1; dx++) { for (let dy = -1; dy <= 1; dy++) { if (Math.abs(dx) + Math.abs(dy) !== 1) continue; const n = this.getParticle(x + dx, y + dy); const immune = [EMPTY, ACID, GLASS, GENERATOR]; if (n && !immune.includes(n.type)) { if (Math.random() < cPow * dtScale) { const tX = n.x; const tY = n.y; let dissolve = true; if (n.type === STONE && Math.random() < 0.3) { n.changeType(SAND); dissolve = false; } if (dissolve) { this.setParticle(tX, tY, new Particle(tX, tY, EMPTY)); const gasSpawnTemp = particle.temp * ACID_GAS_TEMP_FACTOR; const gX1 = tX; const gY1 = tY - 1; const target1 = this.getParticle(gX1, gY1); if (target1 && target1.type === EMPTY) { this.setParticle(gX1, gY1, new Particle(gX1, gY1, TOXIC_GAS, gasSpawnTemp)); } else { const gX2 = x; const gY2 = y - 1; const target2 = this.getParticle(gX2, gY2); if(target2 && target2.type === EMPTY){ this.setParticle(gX2, gY2, new Particle(gX2, gY2, TOXIC_GAS, gasSpawnTemp)); } } } if(Math.random() < 0.05 * dtScale) { this.setParticle(x, y, new Particle(x,y, EMPTY)); consumed = true; } if (consumed) return; break; } } } } }; // Added semicolon
         }
         else if (ptype === PLANT) {
              // --- Revised Plant Growth/Spread Logic ---
              // console.log(`Plant at (${x},${y}) update. Temp: ${particle.temp.toFixed(1)}`); // Basic check
              let hasAdjacentWater = false;
              let emptyNeighbors = [];
              const currentTemp = particle.temp;

              // 1. Scan neighbors for water and empty spots
              for (let dx = -1; dx <= 1; dx++) {
                  for (let dy = -1; dy <= 1; dy++) {
                      if (Math.abs(dx) + Math.abs(dy) !== 1) continue; // Cardinal only
                      const n = this.getParticle(x + dx, y + dy);
                      if (n) {
                          if (n.type === WATER) {
                              hasAdjacentWater = true;
                          } else if (n.type === EMPTY) {
                              emptyNeighbors.push(n);
                          }
                      }
                  }
              }

              // console.log(`Plant at (${x},${y}) - Adjacent Water: ${hasAdjacentWater}, Empty Neighbors: ${emptyNeighbors.length}`); // Check neighbors

              // 2. Try to grow into an empty neighbor if water is adjacent and temp is right
              if (hasAdjacentWater && emptyNeighbors.length > 0 && AMBIENT_TEMP < currentTemp && currentTemp < 50) {
                  // console.log(`Plant at (${x},${y}) - Conditions met for empty space growth.`); // Check conditions
                  if (Math.random() < PLANT_GROWTH_CHANCE_PER_SEC * deltaTime) {
                      console.log(`Plant at (${x},${y}) - RND check PASSED for empty space growth.`); // Check random pass
                      // Pick a random empty neighbor to grow into
                      const target = emptyNeighbors[Math.floor(Math.random() * emptyNeighbors.length)];
                      this.setParticle(target.x, target.y, new Particle(target.x, target.y, PLANT, currentTemp));
                      console.log(`Plant at (${x},${y}) - Grew into empty at (${target.x},${target.y})`); // Confirm growth
                      // Don't 'return' or 'break' here, allow water conversion attempt too in the same step if chance allows
                  }
              }

              // 3. Try to convert adjacent water directly into plant (lower chance?)
              //    This allows plants to slowly take over water bodies even without empty space nearby
              if (hasAdjacentWater && AMBIENT_TEMP < currentTemp && currentTemp < 50) {
                  // console.log(`Plant at (${x},${y}) - Conditions met for water conversion.`); // Check conditions
                    if (Math.random() < PLANT_GROWTH_CHANCE_PER_SEC * deltaTime * 0.5) { // Lower chance for direct conversion
                        console.log(`Plant at (${x},${y}) - RND check PASSED for water conversion.`); // Check random pass
                        let convertedWater = false;
                        for (let dx = -1; dx <= 1; dx++) {
                            for (let dy = -1; dy <= 1; dy++) {
                                if (Math.abs(dx) + Math.abs(dy) !== 1) continue;
                                const n = this.getParticle(x + dx, y + dy);
                                if (n && n.type === WATER) {
                                     n.changeType(PLANT, currentTemp);
                                     console.log(`Plant at (${x},${y}) - Converted water at (${n.x},${n.y})`); // Confirm conversion
                                     convertedWater = true;
                                     break; // Limit to one conversion per step
                                }
                            }
                            if (convertedWater) break;
                        }
                    }
              }
              // ------------------------------------

              // Toxic Gas Check (Keep this)
              for (let dx = -1; dx <= 1; dx++) { for (let dy = -1; dy <= 1; dy++) { const n = this.getParticle(x+dx, y+dy); if(n && n.type === TOXIC_GAS){ const tC = n.getProperties()[10] || 0.01; if(Math.random() < tC * 5 * dtScale) { this.setParticle(x, y, new Particle(x, y, EMPTY)); return; } } } };
         }
    } // End handleStateChangesAndEffects

    // --- Helper: Temperature Calculation --- Takes deltaTime ---
    updateTemperature(particle, deltaTime) {
         const { x, y } = particle; const pT = particle.type; if (pT === EMPTY) return;
         const p = particle.getProperties(); let c = p[1]; // Base conductivity
         const cT = particle.temp; const hG = p[12] || 0.0; // Heat generation
         const dtScale = deltaTime * TARGET_DT_SCALING; // Scale factor

         // Adjust conductivity for specific materials
         if (pT === GENERATOR) { c *= 0.1; }
         if (pT === STONE || pT === GLASS) { c *= 0.3; }

         let neighborTempSum = 0; let neighborConductivitySum = 0; let neighborCount = 0;

         // Accumulate temp/conductivity from neighbors
         for (let dX = -1; dX <= 1; dX++) { for (let dY = -1; dY <= 1; dY++) { if (dX === 0 && dY === 0) continue; const n = this.getParticle(x + dX, y + dY); let nTemp = AMBIENT_TEMP; let nCond = MATERIALS[EMPTY][1]; // Default to ambient/empty
             if (n) { nTemp = n.temp; nCond = n.getProperties()[1] || 0; }
             const distFactor = (dX === 0 || dY === 0) ? 1.0 : 0.707; // Closer neighbors transfer more
             neighborTempSum += nTemp * nCond * distFactor;
             neighborConductivitySum += nCond * distFactor;
             neighborCount++; } }

         let newTemp = cT;
         // Calculate temperature change based on neighbors
         if (neighborCount > 0 && (c > 0 || neighborConductivitySum > 0)) {
             const totalConductivity = c + neighborConductivitySum;
             if (totalConductivity > 0.001) {
                 const weightedAvgTemp = (cT * c + neighborTempSum) / totalConductivity;
                 let deltaTemp = (weightedAvgTemp - cT) * Math.min(0.5, c * 0.8); // Base delta

                 // Apply inertia damping for specific materials
                 if (pT === LAVA || pT === STONE || pT === GLASS || pT === ICE) {
                      deltaTemp *= HIGH_INERTIA_DAMPING;
                 }
                 // Scale delta by time and clamp magnitude
                 deltaTemp = Math.max(-50, Math.min(50, deltaTemp)) * dtScale;
                 newTemp = cT + deltaTemp;
             }
         }

         // Apply ambient cooling and heat generation, scaled by time
         newTemp += (AMBIENT_TEMP - newTemp) * COOLING_RATE * c * dtScale;
         if (hG > 0) {
             newTemp += hG * dtScale;
         }

         // Clamp temperature and update particle if changed
         newTemp = Math.max(-273.15, Math.min(MAX_TEMP, newTemp));
         if (Math.abs(newTemp - cT) > 0.01) {
             particle.temp = newTemp;
             particle.invalidateColorCache();
         }
     }


    // --- Helper: Physics and Movement (Prioritizes Empty Space & Density Swap) ---
     handleMovement(particle, props) {
        const { x, y } = particle; const type = particle.type;
        if (type === GENERATOR) { particle.processed = true; return; } // Generators immovable

        const density = props[0]; const isGas = density < 0;
        const isCurrentLiquid = isLiquid(type);
        const isSolid = !isGas && !isCurrentLiquid;
        let moved = false;

        // --- 0. Splash Check (Solid falling onto Liquid) ---
        const vertDir = isGas ? -1 : 1;
        const ny = y + vertDir;
        if (isSolid && vertDir === 1 && this.isValid(x, ny)) {
            const targetBelow = this.getParticle(x, ny);
            if (targetBelow && isLiquid(targetBelow.type)) { // Use isLiquid helper
                // Try to splash the liquid sideways/up
                const splashDir = (Math.random() < 0.5) ? -1 : 1;
                let splashed = false;

                // Check diagonal up-left/right from the target liquid's spot (relative to falling solid)
                const splashX1 = x + splashDir;
                const splashY1 = y; // Splash target is level with the falling solid
                if (!splashed && this.isValid(splashX1, splashY1)) {
                    const splashTarget1 = this.getParticle(splashX1, splashY1);
                    if (splashTarget1 && splashTarget1.type === EMPTY) {
                        this.setParticle(splashX1, splashY1, targetBelow); // Move liquid
                        this.setParticle(x, ny, particle); // Move solid down
                        this.setParticle(x, y, new Particle(x, y, EMPTY)); // Empty original spot
                        moved = true;
                        splashed = true;
                        // Mark both moved particles
                        if (this.grid[splashX1]?.[splashY1]) this.grid[splashX1][splashY1].movedThisStep = true;
                        if (this.grid[x]?.[ny]) this.grid[x][ny].movedThisStep = true;
                    }
                }
                // Check other diagonal direction if first failed
                const splashX2 = x - splashDir;
                const splashY2 = y;
                if (!splashed && this.isValid(splashX2, splashY2)) {
                   const splashTarget2 = this.getParticle(splashX2, splashY2);
                   if (splashTarget2 && splashTarget2.type === EMPTY) {
                       this.setParticle(splashX2, splashY2, targetBelow); // Move liquid
                       this.setParticle(x, ny, particle); // Move solid down
                       this.setParticle(x, y, new Particle(x, y, EMPTY)); // Empty original spot
                       moved = true;
                       splashed = true;
                       // Mark both moved particles
                       if (this.grid[splashX2]?.[splashY2]) this.grid[splashX2][splashY2].movedThisStep = true;
                       if (this.grid[x]?.[ny]) this.grid[x][ny].movedThisStep = true;
                   }
               }
            }
        }
        // If splashed, particle processing is done for this step
        if (moved) { particle.processed = true; return; }

        // --- 1. Vertical Movement: Check below (or above for gas) ---
        if (!this.isValid(x, ny)) { particle.processed = true; return; } // Boundary check

        const target = this.getParticle(x, ny);
        if (target && target.type !== GENERATOR) { // Check target exists and isn't generator

            // --- Priority 1: Move into EMPTY space ---
            if (target.type === EMPTY) {
                this.swapParticles(x, y, x, ny);
                moved = true;
            }
            // --- Priority 2: Sideways Displacement (Pushing) ---
            else if (target.type !== EMPTY) { // Only consider pushing if target is not empty
                const targetProps = target.getProperties();
                const targetDensity = targetProps[0];
                let shouldPush = false;
                if (isGas && targetDensity > density) { // Gas trying to rise through denser
                    shouldPush = true;
                } else if (!isGas && density > targetDensity) { // Non-gas trying to fall through lighter
                     shouldPush = true;
                }

                if (shouldPush) {
                    // Check horizontal neighbors of the *target* cell (x, ny) for an EMPTY spot
                    const pushDir = (Math.random() < 0.5) ? -1 : 1; // Randomize push direction check
                    let pushed = false;

                    // Check first direction
                    const pushX1 = x + pushDir;
                    if (this.isValid(pushX1, ny)) {
                        const pushTarget1 = this.getParticle(pushX1, ny);
                        if (pushTarget1 && pushTarget1.type === EMPTY) {
                            this.setParticle(pushX1, ny, target); // Move target sideways
                            this.setParticle(x, ny, particle); // Move original particle down/up
                            this.setParticle(x, y, new Particle(x, y, EMPTY)); // Empty original spot
                            moved = true;
                            pushed = true;
                            // Mark moved particles
                            if (this.grid[pushX1]?.[ny]) this.grid[pushX1][ny].movedThisStep = true;
                            if (this.grid[x]?.[ny]) this.grid[x][ny].movedThisStep = true;
                        }
                    }

                    // Check second direction if first failed
                    if (!pushed) {
                        const pushX2 = x - pushDir;
                        if (this.isValid(pushX2, ny)) {
                            const pushTarget2 = this.getParticle(pushX2, ny);
                            if (pushTarget2 && pushTarget2.type === EMPTY) {
                                this.setParticle(pushX2, ny, target); // Move target sideways
                                this.setParticle(x, ny, particle); // Move original particle down/up
                                this.setParticle(x, y, new Particle(x, y, EMPTY)); // Empty original spot
                                moved = true;
                                pushed = true;
                                // Mark moved particles
                                if (this.grid[pushX2]?.[ny]) this.grid[pushX2][ny].movedThisStep = true;
                                if (this.grid[x]?.[ny]) this.grid[x][ny].movedThisStep = true;
                            }
                        }
                    }
                } // end shouldPush

                // --- Priority 3: Density-based SWAP (if pushing failed) ---
                if (!moved) { // Only try density swap if not already moved by pushing
                    let densityAllowsSwap = false;
                    if (isGas) { // Gas moving up
                        if (targetDensity > density) densityAllowsSwap = true; // Move into denser gas or any non-gas
                    } else { // Non-gas moving down
                        if (density > targetDensity) densityAllowsSwap = true; // Move into less dense (solid, liquid, gas)
                    }

                    if (densityAllowsSwap) {
                        this.swapParticles(x, y, x, ny);
                        moved = true;
                        particle.movedThisStep = true;
                        // Also mark the particle it swapped with if it exists
                        const swappedWith = this.getParticle(x, y); // Now the other particle is here
                        if (swappedWith) swappedWith.movedThisStep = true;
                    }
                }
            } // End target.type !== EMPTY block
        } // End target check

        if (moved) { particle.processed = true; return; }

        // --- Check if Powder is blocked by Rigid Solid Below --- NEW STEP
        if (!moved && vertDir === 1 && isPowder(type)) { // Only check if falling down and is powder
            const particleBelow = this.getParticle(x, y + 1);
            if (particleBelow && isRigidSolid(particleBelow.type)) {
                // Powder is directly above a rigid solid it couldn't displace vertically.
                // Stop further movement attempts (diagonal/piling) for this step.
                particle.processed = true;
                return;
            }
        }

        // --- 2. Diagonal Movement (if vertical/splash/powder-on-solid failed, only into EMPTY) ---
        // Restrict rigid solids from easy diagonal movement
         if (!isRigidSolid(type)) {
              if (this.tryDiagonalMove(particle, x, y, vertDir, density, isGas)) {
                  particle.processed = true; return;
              }
         }

        // --- 3. Sideways/Piling Movement (if vertical/diagonal failed) ---
         const amPowder = isPowder(type);
         const amLiquidOrGas = isCurrentLiquid || isGas;

         if (amLiquidOrGas) { // Liquid/Gas Spreading
              const viscosity = props[8] || 1;
              // Significantly increase base spread chance for liquids/gas into empty
              const baseSpreadChance = 1.0; //isCurrentLiquid ? (1.0 / viscosity) : 1.0;

              // Randomize check order
              const dx1 = (Math.random() < 0.5) ? -1 : 1;
              const dx2 = -dx1;

              const trySideMove = (dx) => {
                  // Removed base spread chance check for moving into EMPTY
                  // if (Math.random() >= baseSpreadChance) return false;

                  const checkX = x + dx;
                  if (!this.isValid(checkX, y)) return false;

                  const sideTarget = this.getParticle(checkX, y);

                  // Priority 1: Move into EMPTY (Higher Priority/Chance)
                  if (sideTarget && sideTarget.type === EMPTY) {
                      // Add back a small viscosity check? Or just let low viscosity liquids flow fast?
                      const moveChance = isCurrentLiquid ? Math.max(0.1, 1.0 - viscosity * 0.1) : 1.0; // Gases always move, liquids slowed by high viscosity
                      if (Math.random() < moveChance) {
                          this.swapParticles(x, y, checkX, y);
                          particle.movedThisStep = true; // Mark as moved
                          return true;
                      }
                  }
                  // Priority 2: Push adjacent liquid (Wave/Momentum effect)
                  else if (isCurrentLiquid && sideTarget && isLiquid(sideTarget.type) && particle.movedThisStep) {
                      // Check if cell beyond the target liquid is empty
                      const pushX = checkX + dx;
                      if (this.isValid(pushX, y)) {
                          const pushTarget = this.getParticle(pushX, y);
                          if (pushTarget && pushTarget.type === EMPTY) {
                              // Probability based on viscosity (less chance for viscous liquids)
                              const pushChance = (0.5 / viscosity);
                              if (Math.random() < pushChance) {
                                  this.setParticle(pushX, y, sideTarget); // Push neighbor
                                  this.setParticle(checkX, y, particle); // Move current particle
                                  this.setParticle(x, y, new Particle(x, y, EMPTY));
                                  // Mark moved particles
                                  if (this.grid[pushX]?.[y]) this.grid[pushX][y].movedThisStep = true;
                                  if (this.grid[checkX]?.[y]) this.grid[checkX][y].movedThisStep = true;
                                  return true;
                              }
                          }
                      }
                  }
                  return false; // Didn't move into empty or push
              };

              if (trySideMove(dx1)) { particle.processed = true; return; }
              if (trySideMove(dx2)) { particle.processed = true; return; }

         } else if (amPowder && vertDir === 1) { // Powder Piling (only applies when falling down)
              const below = this.getParticle(x, y + 1);
              // Check if resting on something (not empty, not generator)
              if (below && below.type !== EMPTY && below.type !== GENERATOR) {
                   const dx1 = (Math.random() < 0.5) ? -1 : 1;
                   const dx2 = -dx1;

                   const tryPile = (dx) => {
                        const pileX = x + dx;
                        const pileY = y + 1; // Below and to the side
                        if (this.isValid(pileX, pileY)) {
                             const pileTarget = this.getParticle(pileX, pileY);
                             // If the diagonal-down spot is empty, move there
                             if (pileTarget && pileTarget.type === EMPTY) {
                                  this.swapParticles(x, y, pileX, pileY);
                                  particle.movedThisStep = true;
                                  return true;
                             }
                        }
                        return false;
                   };

                   if (tryPile(dx1)) { particle.processed = true; return; }
                   if (tryPile(dx2)) { particle.processed = true; return; }
              }
         } // End Liquid/Gas/Powder horizontal/piling logic


    } // End handleMovement


    // Helper for diagonal movement check (Modified: Still only into Empty, but checks vertical block correctly)
    tryDiagonalMove(particle, x, y, vertDir, density, isGas) {
         const dx1 = (Math.random() < 0.5) ? -1 : 1; const dx2 = -dx1;

         const checkDiag = (checkX) => {
              const diagY = y + vertDir; if (!this.isValid(checkX, diagY)) return false; // Boundary check
              const diagTarget = this.getParticle(checkX, diagY);

              // Condition: Can move diagonally only if the diagonal target is EMPTY.
              if (diagTarget && diagTarget.type === EMPTY && diagTarget.type !== GENERATOR) {
                   // AND the vertical path must be blocked by something denser (if falling) or less dense (if rising)
                   // OR blocked by an immovable generator
                   const verticalNeighbor = this.getParticle(x, diagY);
                   const verticalBlocked = verticalNeighbor && verticalNeighbor.type !== EMPTY &&
                                           (verticalNeighbor.type === GENERATOR ||
                                           (isGas ? verticalNeighbor.getProperties()[0] <= density : verticalNeighbor.getProperties()[0] >= density));

                   if (verticalBlocked) {
                       this.swapParticles(x, y, checkX, diagY); // Perform the diagonal move
                       particle.movedThisStep = true; // Mark as moved
                       // Mark the particle it swapped with (which is now EMPTY)
                       const swappedWith = this.getParticle(x, y); // Should be null or EMPTY now
                       // No need to mark the swapped particle as it's empty or gone
                       return true;
                   }
              } return false;
         };
         if (checkDiag(x + dx1)) return true; if (checkDiag(x + dx2)) return true; return false;
    }


    // --- Helper: Explosion ---
    explode(cx, cy, radius) { const fL = MATERIALS[FIRE]?.[9] ?? DEFAULT_FIRE_LIFESPAN_SEC; this.setParticle(cx, cy, new Particle(cx, cy, EMPTY)); const pTP = []; for (let dx = -radius; dx <= radius; dx++) { for (let dy = -radius; dy <= radius; dy++) { const dS = dx * dx + dy * dy; if (dS <= radius * radius) { const pX = cx + dx; const pY = cy + dy; const t = this.getParticle(pX, pY); if (t && t.type !== EMPTY) { pTP.push({ particle: t, distSq: dS }); } } } } for (const i of pTP) { const t = i.particle; const d = Math.sqrt(i.distSq); const eS = Math.max(0, 1 - (d / radius)); t.temp = Math.min(MAX_TEMP, t.temp + 1500 * eS); const dC = eS * 0.95; const tT = t.type; const r = [EMPTY, GENERATOR]; if (!r.includes(tT) && Math.random() < dC) { if (Math.random() < 0.6 * eS && tT !== WATER && tT !== ICE) { t.changeType(FIRE); t.life = Math.max(t.life ?? 0, Math.floor(fL * eS * 0.5)); } else { t.changeType(SMOKE); t.life = Math.max(t.life ?? 0, Math.floor(100 * eS)); } } else if ((tT === STONE || tT === GLASS) && Math.random() < eS * 0.3) { t.changeType(SAND); } else if (tT === WOOD && Math.random() < eS * 0.5) { t.changeType(ASH); } t.invalidateColorCache(); t.processed = true; } }

    // --- Drawing ---
    draw() { const iD = ctx.createImageData(WIDTH, HEIGHT); const d = iD.data; for (let y = 0; y < this.height; y++) { for (let x = 0; x < this.width; x++) { const p = this.grid[y][x]; let r = 0, g = 0, b = 0; if (p && p.type !== EMPTY) { const cS = p.getColor(); const c = cS.substring(4, cS.length - 1).split(',').map(s => parseInt(s.trim())); r = c[0]; g = c[1]; b = c[2]; } for (let pY = 0; pY < CELL_SIZE; pY++) { for (let pX = 0; pX < CELL_SIZE; pX++) { const cX = x * CELL_SIZE + pX; const cY = y * CELL_SIZE + pY; const i = (cY * WIDTH + cX) * 4; d[i] = r; d[i + 1] = g; d[i + 2] = b; d[i + 3] = 255; } } } } ctx.putImageData(iD, 0, 0); }
} // End Simulation Class

// --- GLOBAL STATE ---
const simulation = new Simulation(GRID_WIDTH, GRID_HEIGHT);
let isDrawing = false; let currentMaterial = SAND; let brushSize = 3;
let lastTime = 0;

// --- UI UPDATE FUNCTIONS ---
function updateUIText() {
     const mN = MATERIALS[currentMaterial] ? MATERIALS[currentMaterial][7] : "Unknown";
     uiMaterialText.textContent = `Brush: ${mN} (Size: ${brushSize})`;
     document.querySelectorAll('#palette button').forEach(b => {
         b.classList.toggle('selected', parseInt(b.dataset.materialId) === currentMaterial);
     });
     faviconLink.href = faviconCanvas.toDataURL('image/png');
}

function updateCoordsText(cx, cy) { if (simulation.isValid(cx,cy)) { const p = simulation.getParticle(cx,cy); if (p && p.type !== EMPTY) { const pN = p.getProperties()[7]; const pT = p.temp.toFixed(1); const pL = p.life !== null ? ` | Life: ${p.life.toFixed(1)}s` : ''; const pB = p.burning ? ' (Burning!)' : ''; uiCoordsText.textContent = `Coords: (${cx}, ${cy}) | ${pN}${pB} | ${pT}°C${pL}`; } else { uiCoordsText.textContent = `Coords: (${cx}, ${cy}) | Empty`; } } else { uiCoordsText.textContent = `Coords: (${cx}, ${cy}) | OOB`; } }

// --- FAVICON UPDATE ---
function updateFavicon() {
    faviconCtx.fillStyle = 'black'; // Background
    faviconCtx.fillRect(0, 0, 16, 16);

    // Sample 4 pixels from the grid: top-left, top-right, bottom-left, center
    const coordsToSample = [
        {x: 0, y: 0},
        {x: GRID_WIDTH - 1, y: 0},
        {x: 0, y: GRID_HEIGHT - 1},
        {x: Math.floor(GRID_WIDTH / 2), y: Math.floor(GRID_HEIGHT / 2)}
    ];

    // Draw 4 squares (8x8 each) on the 16x16 canvas
    const positions = [
        {fx: 0, fy: 0},  // Top-left square
        {fx: 8, fy: 0},  // Top-right square
        {fx: 0, fy: 8},  // Bottom-left square
        {fx: 8, fy: 8}   // Bottom-right square
    ];

    for (let i = 0; i < coordsToSample.length; i++) {
        const gridCoord = coordsToSample[i];
        const favCoord = positions[i];
        const particle = simulation.getParticle(gridCoord.x, gridCoord.y);
        if (particle) {
            faviconCtx.fillStyle = particle.getColor();
        } else {
            faviconCtx.fillStyle = 'black'; // Default if out of bounds somehow
        }
        faviconCtx.fillRect(favCoord.fx, favCoord.fy, 8, 8);
    }

    faviconLink.href = faviconCanvas.toDataURL('image/png');
}

// --- GAME LOOP --- Now uses Delta Time ---
function gameLoop(timestamp) {
    // Calculate deltaTime in seconds
    const deltaTime = (timestamp - lastTime) / 1000;
    lastTime = timestamp;

    // Clamp deltaTime to avoid large jumps if tab loses focus
    const dtClamped = Math.min(deltaTime, 0.1); // Max 100ms step

    // Update UI text (only if needed, maybe less frequently?)
    // Example: Update UI only every ~100ms
    if (!window.uiUpdateTimer || window.uiUpdateTimer <= 0) {
        updateUIText();
        window.uiUpdateTimer = 0.1;
    } else {
        window.uiUpdateTimer -= dtClamped;
    }

    // Update simulation with clamped delta time
    simulation.update(dtClamped);
    // Draw simulation state
    simulation.draw();
    // Update favicon
    updateFavicon();

    // Request next frame
    requestAnimationFrame(gameLoop);
}

// --- EVENT HANDLERS ---
function getMousePos(canvas, evt) { const rect = canvas.getBoundingClientRect(); return { x: evt.clientX - rect.left, y: evt.clientY - rect.top }; }
function handleDraw(event) {
    const pos = getMousePos(canvas, event);
    const gX = Math.floor(pos.x / CELL_SIZE);
    const gY = Math.floor(pos.y / CELL_SIZE);
    updateCoordsText(gX, gY);
    if (!isDrawing) return;

    const sX = Math.max(0, gX - brushSize);
    const eX = Math.min(GRID_WIDTH - 1, gX + brushSize);
    const sY = Math.max(0, gY - brushSize);
    const eY = Math.min(GRID_HEIGHT - 1, gY + brushSize);
    const bSS = brushSize * brushSize;

    for (let pX = sX; pX <= eX; pX++) {
        for (let pY = sY; pY <= eY; pY++) {
            const dX = pX - gX;
            const dY = pY - gY;
            if (dX * dX + dY * dY <= bSS) {
                if (simulation.isValid(pX, pY)) {
                    const eP = simulation.getParticle(pX, pY);
                    if (eP && eP.type === GENERATOR && currentMaterial !== ERASER) {
                        continue; // Don't overwrite generators unless erasing
                    }
                    if (currentMaterial !== ERASER) {
                        // Set high initial temp when painting Lava
                        const initialTemp = (currentMaterial === LAVA) ? 2500 : AMBIENT_TEMP;
                        simulation.setParticle(pX, pY, new Particle(pX, pY, currentMaterial, initialTemp));
                    } else {
                        // Eraser just creates empty particles
                        simulation.setParticle(pX, pY, new Particle(pX, pY, EMPTY));
                    }
                }
            }
        }
    }
}
canvas.addEventListener('mousedown', (e) => { if (e.button === 0) { isDrawing = true; handleDraw(e); } });
canvas.addEventListener('mousemove', (e) => { if(isDrawing) handleDraw(e); else { const pos = getMousePos(canvas, e); const gX = Math.floor(pos.x / CELL_SIZE); const gY = Math.floor(pos.y / CELL_SIZE); updateCoordsText(gX, gY); } });
canvas.addEventListener('mouseup', (e) => { if (e.button === 0) { isDrawing = false; } });
canvas.addEventListener('mouseleave', () => { isDrawing = false; updateCoordsText(-1,-1); });
canvas.addEventListener('contextmenu', (e) => e.preventDefault());
canvas.addEventListener('wheel', (e) => { e.preventDefault(); if (e.deltaY < 0) brushSize = Math.min(20, brushSize + 1); else brushSize = Math.max(0, brushSize - 1); updateUIText(); });
window.addEventListener('keydown', (e) => { if (e.key === 'c' || e.key === 'C') { simulation.initGrid(); console.log("Grid cleared by keypress."); } });
clearButton.addEventListener('click', () => { simulation.initGrid(); console.log("Grid cleared by button."); });

// --- PALETTE GENERATION ---
function populatePalette() { paletteDiv.innerHTML = ''; const eB = document.createElement('button'); eB.textContent = MATERIALS[ERASER][7]; eB.dataset.materialId = ERASER; eB.style.backgroundColor = `rgb(${C_ERASER.join(',')})`; eB.style.color = 'white'; eB.title = "Eraser Tool [E]"; eB.addEventListener('click', () => { currentMaterial = ERASER; updateUIText(); }); paletteDiv.appendChild(eB); const sM = Object.entries(MATERIALS).map(([id, props]) => ({ id: parseInt(id), name: props[7], props: props })).filter(m => m.id !== EMPTY && m.id !== ERASER).sort((a, b) => a.name.localeCompare(b.name)); for (const mat of sM) { const id = mat.id; const p = mat.props; const b = document.createElement('button'); b.textContent = p[7]; b.dataset.materialId = id; const cA = p[6]; b.style.backgroundColor = `rgb(${cA.join(',')})`; const br = (cA[0] * 299 + cA[1] * 587 + cA[2] * 114) / 1000; b.style.color = br < 128 ? 'white' : '#111'; b.title = `Select ${p[7]}`; b.addEventListener('click', () => { currentMaterial = id; updateUIText(); }); paletteDiv.appendChild(b); } }

// --- START SIMULATION ---
populatePalette();
// Initial UI setup
const fpsP = document.getElementById('fps-text');
if (fpsP) fpsP.style.display = 'none'; // Hide FPS paragraph
updateUIText();
updateFavicon();
lastTime = performance.now(); // Initialize lastTime
requestAnimationFrame(gameLoop); 