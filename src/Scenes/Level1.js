/**
 * Level1.js — First platforming level.
 *
 * Extends the Platformer base scene and fills in the template methods
 * with Level 1 specific data: which tilemap to load, what objects exist,
 * where water zones are, and VFX emitter positions.
 *
 * When the player reaches the flag, the game transitions to Level 2.
 */
class Level1 extends Platformer {
    constructor() {
        super('platformerScene');
    }

    setupMap() {
        // Load the Level 1 tilemap
        this.map = this.add.tilemap('platformer-level-1');

        // Attach the tileset image (name must match the Tiled tileset name)
        this.tileset = this.map.addTilesetImage('kenny_tilemap_packed', 'tilemap_tiles');

        // Render the ground layer and enable collision on tiles marked "collides"
        this.groundLayer = this.map.createLayer('Ground-n-Platforms', this.tileset, 0, 0);
        this.groundLayer.setScale(SCALE);
        this.groundLayer.setCollisionByProperty({ collides: true });

        // Update the physics world bounds to match the scaled map
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
    }

    setupObjects() {
        // Create physics groups from the Tiled "Objects" layer.
        // Frame indices are 0-based (GID − 1).
        this.coins = this.createObjectGroup('coin', 151);
        this.spikes = this.createObjectGroup('spike', 68);
        this.flags = this.createObjectGroup('flag', 111);
    }

    setupWaterZones() {
        // Level 1 has one water zone:
        //   x:2150, barrierY:1080, zoneY:1000, width:380, height:120
        this.addWaterZone(2150, 1080, 1000, 380, 120);
    }

    setupVFX() {
        // ── Walking dust ──────────────────────────────────────────
        my.vfx.dustEmitter = this.add.particles(0, 0, 'kenny-particles', {
            frame: ['smoke_03.png', 'smoke_09.png'],
            follow: my.sprite,
            followOffset: {
                x: my.sprite.displayWidth / 2 - 10,
                y: my.sprite.displayHeight / 2 - 5,
            },
            scale: { start: 0.03, end: 0.1 },
            alpha: { start: 1.0, end: 0.1 },
            lifespan: 350,
            gravityY: -400,
            speedX: { min: -PARTICLE_VELOCITY, max: PARTICLE_VELOCITY },
            maxAliveParticles: 8,
            emitting: false, // Toggled in _updateVFX
        });
        my.vfx.dustEmitter.setDepth(1);

        // ── Water bubbles ────────────────────────────────────────
        // Positioned over Level 1's water zone
        my.vfx.bubbleEmitter = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'light_02.png',
            x: { min: 2000, max: 2300 },
            y: { min: 1200, max: 900 },
            lifespan: 1200,
            speedY: { min: -80, max: -40 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.08, end: 0 },
            alpha: { start: 0.8, end: 0 },
            quantity: 1,
            frequency: 120,
            blendMode: 'ADD',
            emitting: false, // Starts when player enters water
        });
        my.vfx.bubbleEmitter.setDepth(1);
    }

    onLevelComplete() {
        this.scene.start('platformerScene2');
    }
}
