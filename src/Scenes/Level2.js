/**
 * Level2.js — Second (and final) platforming level.
 *
 * Similar to Level1 but loads a different tilemap, has two water zones,
 * different bubble VFX positions, and transitions to the Win scene when
 * the player reaches the flag.
 */
class Level2 extends Platformer {
    constructor() {
        super('platformerScene2');
    }

    setupMap() {
        this.map = this.add.tilemap('platformer-level-2');
        this.tileset = this.map.addTilesetImage('kenny_tilemap_packed', 'tilemap_tiles');

        this.groundLayer = this.map.createLayer('Ground-n-Platforms', this.tileset, 0, 0);
        this.groundLayer.setScale(SCALE);
        this.groundLayer.setCollisionByProperty({ collides: true });

        this.physics.world.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
    }

    setupObjects() {
        this.coins = this.createObjectGroup('coin', 151);
        this.spikes = this.createObjectGroup('spike', 68);
        this.flags = this.createObjectGroup('flag', 111);
    }

    setupWaterZones() {
        // Level 2 has two water zones:
        //   Zone 1: x:1550, barrierY:1080, zoneY:1000, width:380, height:120
        //   Zone 2: x:2150, barrierY:1080, zoneY:1000, width:380, height:120
        this.addWaterZone(1550, 1080, 1000, 380, 120);
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
            emitting: false,
        });
        my.vfx.dustEmitter.setDepth(1);

        // ── Water bubbles ────────────────────────────────────────
        // Position over Level 2's water zones (first zone: 1500-1900, second: 2150-2550)
        my.vfx.bubbleEmitter = this.add.particles(0, 0, 'kenny-particles', {
            frame: 'light_02.png',
            x: { min: 1500, max: 2550 },
            y: { min: 1200, max: 900 },
            lifespan: 1200,
            speedY: { min: -80, max: -40 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.08, end: 0 },
            alpha: { start: 0.8, end: 0 },
            quantity: 1,
            frequency: 120,
            blendMode: 'ADD',
            emitting: false,
        });
        my.vfx.bubbleEmitter.setDepth(1);
    }

    onLevelComplete() {
        // Level 2 is the final level → show the win screen
        this.scene.start('winScene');
    }
}
