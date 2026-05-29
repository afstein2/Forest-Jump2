/**
 * Load.js — Asset preloading scene.
 *
 * Loads every image, tilemap, spritesheet, atlas, and audio file that the
 * game needs, then defines the player sprite animations (walk, idle, jump).
 * Transitions immediately to the Start Screen when loading is complete.
 */
class Load extends Phaser.Scene {
    constructor() {
        super('loadScene');
    }

    preload() {
        // Set the base path so all asset URLs are relative to assets/
        this.load.setPath('./assets');

        this._loadTilemaps();
        this._loadImages();
        this._loadSpritesheets();
        this._loadAtlases();
        this._loadAudio();
    }

    create() {
        this._createAnimations();
        // Jump straight to the title screen
        this.scene.start('startScreen');
    }

    // ── Tilemaps ──────────────────────────────────────────────────
    _loadTilemaps() {
        this.load.tilemapTiledJSON('platformer-level-1', 'platformer-level-1.tmj');
        this.load.tilemapTiledJSON('platformer-level-2', 'platformer-level-2.tmj');
    }

    // ── Standalone images ─────────────────────────────────────────
    _loadImages() {
        // Tileset image used for the ground layer rendering
        this.load.image('tilemap_tiles', 'tilemap_packed.png');
        // Coin icon shown in the HUD
        this.load.image('coin_icon', 'Textures/Coin.png');
        // Cloud parallax background
        this.load.image('clouds', 'Textures/clouds_small.png');
    }

    // ── Spritesheets (frame-based, not atlas) ─────────────────────
    _loadSpritesheets() {
        // Same tileset image loaded again as a spritesheet so we can
        // reference individual frames by index for Tiled objects.
        this.load.spritesheet('tilemap_sheet', 'tilemap_packed.png', {
            frameWidth: 18,
            frameHeight: 18,
        });
    }

    // ── Texture atlases (named-frame lookups) ─────────────────────
    _loadAtlases() {
        // Player character atlas (idle + walk + jump frames)
        this.load.atlas('platformer_characters', 'tilemap-characters-packed.png', 'tilemap-characters-packed.json');
        // Particle effects atlas (multi-atlas with 5 texture pages)
        this.load.multiatlas('kenny-particles', 'kenny-particles.json');
    }

    // ── Audio ─────────────────────────────────────────────────────
    _loadAudio() {
        // Single-shot SFX
        this.load.audio('jump', 'Audio/Jump1.mp3');
        this.load.audio('coin', 'Audio/Coin.mp3');
        this.load.audio('death', 'Audio/impactPunch_medium_002.ogg');

        // Footstep variations (random selection while walking)
        this.load.audio('walk1', 'Audio/footstep_grass_000.ogg');
        this.load.audio('walk2', 'Audio/footstep_grass_001.ogg');
        this.load.audio('walk3', 'Audio/footstep_grass_002.ogg');
        this.load.audio('walk4', 'Audio/footstep_grass_003.ogg');

        // Water splash variations (random selection on water entry)
        this.load.audio('water1', 'Audio/water_splosh_movement_higher_pitched_008.mp3');
        this.load.audio('water2', 'Audio/water_splosh_movement_higher_pitched_009.mp3');
        this.load.audio('water3', 'Audio/water_splosh_movement_lower_pitched_002.mp3');
        this.load.audio('water4', 'Audio/water_splosh_movement_lower_pitched_003.mp3');
    }

    // ── Player animations ─────────────────────────────────────────
    _createAnimations() {
        // Walk: 2 frames at 15 fps, looping
        this.anims.create({
            key: 'walk',
            frames: [
                { key: 'platformer_characters', frame: 'tile_0000.png' },
                { key: 'platformer_characters', frame: 'tile_0001.png' },
            ],
            frameRate: 15,
            repeat: -1,
        });

        // Idle: single frame, no loop
        this.anims.create({
            key: 'idle',
            frames: [{ key: 'platformer_characters', frame: 'tile_0000.png' }],
            repeat: -1,
        });

        // Jump: single frame, no loop
        this.anims.create({
            key: 'jump',
            frames: [{ key: 'platformer_characters', frame: 'tile_0001.png' }],
        });
    }
}
