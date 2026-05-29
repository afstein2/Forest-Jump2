/**
 * globals.js — Shared game state accessible across all scenes.
 *
 * Since we use plain <script> tags (no bundler), we attach shared state
 * to a global `my` object. Any scene can read or write these properties.
 */
const my = {
    // Player sprite reference (set by Platformer scene)
    sprite: null,

    // Score tracking across levels and deaths
    score: 0,           // Current live score
    savedScore: 0,      // Score saved at the start of each level (restored on death)
    scoreCarryOver: false, // True when transitioning levels to carry score forward

    // Visual effects emitters (set by Platformer / level scenes)
    vfx: {
        dustEmitter: null,   // Walking dust particle emitter
        bubbleEmitter: null, // Water bubble particle emitter
    },

    // Player settings toggled from the Settings screen
    settings: {
        showFPS: false,  // Whether the in-game FPS counter is visible
    },

    // Audio keys for randomized footstep and water sounds
    walkSounds: ['walk1', 'walk2', 'walk3', 'walk4'],
    waterSounds: ['water1', 'water2', 'water3', 'water4'],
};

// Arrow-key / WASD cursor reference (set once by Platformer scene)
let cursors = null;

// Shared physics constants (used by Platformer and level scenes)
const SCALE = 1.5;
const ACCELERATION = 400;
const DRAG = 500;
const JUMP_VELOCITY = -700;
const NORMAL_GRAVITY = 1500;
const WATER_GRAVITY = 400;
const TILE_BIAS = 32;
const PARTICLE_VELOCITY = 50;
