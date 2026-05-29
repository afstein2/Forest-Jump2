/**
 * Platformer.js — Base gameplay scene for all platforming levels.
 *
 * This class contains the complete game loop: tilemap rendering, player
 * physics, object collision, water zones, camera, VFX, audio, HUD, and
 * pause / restart handling.
 *
 * Level-specific subclasses (Level1, Level2) override the template methods:
 *   - setupMap()        → which tilemap and tileset to load
 *   - setupObjects()    → Tiled object → physics group mappings
 *   - setupVFX()        → per-level VFX emitter configurations
 *   - setupWaterZones() → water zone positions for this level
 *   - onLevelComplete() → what happens when the player reaches the flag
 *
 * Keeping per-level data in subclasses keeps create() and update() clean.
 */
class Platformer extends Phaser.Scene {
    constructor(sceneKey) {
        super(sceneKey);
    }

    // ── CREATE ────────────────────────────────────────────────────
    create() {
        // Reset world gravity to normal at the start of every level
        this.physics.world.gravity.y = NORMAL_GRAVITY;
        this.physics.world.TILE_BIAS = TILE_BIAS;

        // Defer to subclass for level-specific map, objects, and water
        this.setupMap();
        this.setupObjects();
        this.setupWaterZones();

        // Player must exist before VFX setup (emitters follow the player sprite)
        this._createPlayer();

        // Now VFX can reference my.sprite
        this.setupVFX();
        this._setupCollisions();
        this._setupCamera();
        this._setupClouds();
        this._setupHUD();
        this._setupInput();

        // Score: either start fresh or carry over from the previous level
        if (my.scoreCarryOver) {
            my.score = my.savedScore;
            my.scoreCarryOver = false;
        } else {
            my.score = 0;
        }
        my.savedScore = my.score;

        // Track whether the player is currently in a water zone
        this._inWater = false;

        // Remember which level scene is active (used by PauseMenu)
        my.activeLevelKey = this.scene.key;

        // Throttle footstep sounds to one every 250 ms
        this._lastFootstepTime = 0;

        // Prevent multiple death/restart triggers in the same frame
        this._dying = false;
    }

    // ── UPDATE ────────────────────────────────────────────────────
    update() {
        this._handleMovement();
        this._handleJump();
        this._handleAnimations();
        this._handleFootsteps();
        this._updateClouds();
        this._updateHUD();
        this._checkOutOfBounds();
        this._updateVFX();
    }

    // ──────────────────────────────────────────────────────────────
    //  Template methods — subclasses MUST override these
    // ──────────────────────────────────────────────────────────────

    /** Load the tilemap, add the tileset image, render the ground layer. */
    setupMap() {
        // Subclass responsibility
    }

    /** Create physics groups from Tiled object layer (coins, spikes, flags). */
    setupObjects() {
        // Subclass responsibility
    }

    /** Set up water zones for this level (barriers + overlap zones). */
    setupWaterZones() {
        // Subclass responsibility
    }

    /** Configure particle emitters (dust, bubbles) with level-specific values. */
    setupVFX() {
        // Subclass responsibility
    }

    /** Called when the player reaches the flag. */
    onLevelComplete() {
        // Subclass responsibility
    }

    // ──────────────────────────────────────────────────────────────
    //  Player creation
    // ──────────────────────────────────────────────────────────────

    _createPlayer() {
        // Spawn near the left side of the level, just above the ground
        const spawnX = this.scale.width / 4;
        const spawnY = 930;

        my.sprite = this.physics.add.sprite(spawnX, spawnY, 'platformer_characters', 'tile_0000.png');
        my.sprite.setScale(SCALE);
        my.sprite.setCollideWorldBounds(false); // We handle OOB manually
        my.sprite.setDragX(DRAG);
        my.sprite.setDepth(1);
    }

    // ──────────────────────────────────────────────────────────────
    //  Collisions & overlaps
    // ──────────────────────────────────────────────────────────────

    _setupCollisions() {
        // Player collides with the solid ground tile layer
        this.physics.add.collider(my.sprite, this.groundLayer);

        // Player collides with water zone barriers (invisible solid platforms)
        if (this.waterBarriers) {
            this.waterBarriers.forEach((b) => {
                this.physics.add.collider(my.sprite, b);
            });
        }

        // Coins: overlap → collect
        if (this.coins) {
            this.physics.add.overlap(my.sprite, this.coins, this._collectCoin, null, this);
        }

        // Spikes: overlap → die
        if (this.spikes) {
            this.physics.add.overlap(my.sprite, this.spikes, this._hitSpike, null, this);
        }

        // Flag: overlap → level complete
        if (this.flags) {
            this.physics.add.overlap(my.sprite, this.flags, this._reachFlag, null, this);
        }

        // Water zones: overlap → gravity change
        if (this.waterZones) {
            this.waterZones.forEach((z) => {
                this.physics.add.overlap(my.sprite, z, this._enterWater, null, this);
            });
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Camera
    // ──────────────────────────────────────────────────────────────

    _setupCamera() {
        const cam = this.cameras.main;
        cam.setBounds(0, 0, this.map.widthInPixels * SCALE, this.map.heightInPixels * SCALE);
        cam.setZoom(SCALE);
        cam.startFollow(my.sprite, true, 0.25, 0.25);
        cam.setDeadzone(50, 50);
    }

    // ──────────────────────────────────────────────────────────────
    //  Parallax cloud background
    // ──────────────────────────────────────────────────────────────

    _setupClouds() {
        this.clouds = this.add.tileSprite(
            0, -this.scale.height * 0.5,
            this.scale.width, this.scale.height * 0.89,
            'clouds'
        );
        this.clouds.setOrigin(0);
        this.clouds.setScale(0.4);
        this.clouds.setScrollFactor(0); // Fixed on screen
        this.clouds.setDepth(0);
    }

    _updateClouds() {
        // Scroll clouds at 10 % of camera speed for a parallax feel
        this.clouds.tilePositionX = this.cameras.main.scrollX * 0.1;
    }

    // ──────────────────────────────────────────────────────────────
    //  HUD (score, coin icon, optional FPS)
    // ──────────────────────────────────────────────────────────────

    _setupHUD() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Score text
        this.scoreText = this.add.text(w / 5.2, h / 5.5, '0', {
            fontFamily: 'Arial',
            fontSize: '128px',
            color: '#ffffff',
        }).setOrigin(0.5).setScale(0.5).setScrollFactor(0).setDepth(100);

        // Coin icon next to score
        this.add.image(w / 5.5, h / 4.7, 'coin_icon')
            .setScale(3)
            .setScrollFactor(0)
            .setDepth(1000);

        // FPS counter (hidden by default, toggled in Settings)
        this.fpsText = this.add.text(w / 1.3, h / 5.5, 'FPS: 60', {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffffff',
        }).setOrigin(0.5).setScale(0.5).setScrollFactor(0).setDepth(200);
        this.fpsText.setVisible(my.settings.showFPS);
    }

    _updateHUD() {
        this.scoreText.setText(my.score);
        if (my.settings.showFPS) {
            this.fpsText.setVisible(true);
            this.fpsText.setText('FPS: ' + Math.round(this.game.loop.actualFps));
        } else {
            this.fpsText.setVisible(false);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Input
    // ──────────────────────────────────────────────────────────────

    _setupInput() {
        cursors = this.input.keyboard.createCursorKeys();

        // WASD also moves the player
        this.wasd = this.input.keyboard.addKeys({
            left: Phaser.Input.Keyboard.KeyCodes.A,
            right: Phaser.Input.Keyboard.KeyCodes.D,
            up: Phaser.Input.Keyboard.KeyCodes.W,
        });

        // Space bar as an additional jump key
        this.spaceKey = this.input.keyboard.addKey(Phaser.Input.Keyboard.KeyCodes.SPACE);

        // Pause toggle
        this.input.keyboard.on('keydown-P', () => {
            this.scene.launch('pauseScene');
            this.scene.pause();
        });

        // Quick restart
        this.input.keyboard.on('keydown-R', () => {
            my.score = my.savedScore;
            this.scene.restart();
        });

        // Toggle physics debug overlay
        this.input.keyboard.on('keydown-O', () => {
            const world = this.physics.world;
            if (!world.debugGraphic) {
                world.createDebugGraphic();
            }
            world.drawDebug = !world.drawDebug;
            world.debugGraphic.setVisible(world.drawDebug);
        });
    }

    // ──────────────────────────────────────────────────────────────
    //  Movement & jumping
    // ──────────────────────────────────────────────────────────────

    _handleMovement() {
        const left = cursors.left.isDown || this.wasd.left.isDown;
        const right = cursors.right.isDown || this.wasd.right.isDown;

        if (left) {
            my.sprite.setAccelerationX(-ACCELERATION);
            my.sprite.setFlipX(false);
            my.sprite.body.setDragX(0); // No drag while accelerating
        } else if (right) {
            my.sprite.setAccelerationX(ACCELERATION);
            my.sprite.setFlipX(true);
            my.sprite.body.setDragX(0);
        } else {
            // No directional key: apply drag for a snappy stop
            my.sprite.setAccelerationX(0);
            my.sprite.setDragX(DRAG);
        }
    }

    _handleJump() {
        // Jump on single press (JustDown), only when grounded
        const jumpPressed = Phaser.Input.Keyboard.JustDown(cursors.up) ||
                            Phaser.Input.Keyboard.JustDown(this.wasd.up) ||
                            Phaser.Input.Keyboard.JustDown(this.spaceKey);

        if (jumpPressed && my.sprite.body.blocked.down) {
            my.sprite.setVelocityY(JUMP_VELOCITY);
            this.sound.play('jump');
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Animations
    // ──────────────────────────────────────────────────────────────

    _handleAnimations() {
        const isGrounded = my.sprite.body.blocked.down;
        const isMoving = Math.abs(my.sprite.body.velocity.x) > 10;

        if (!isGrounded) {
            my.sprite.anims.play('jump', true);
        } else if (isMoving) {
            my.sprite.anims.play('walk', true);
        } else {
            my.sprite.anims.play('idle', true);
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Footstep audio (throttled to 250 ms between steps)
    // ──────────────────────────────────────────────────────────────

    _handleFootsteps() {
        const now = this.time.now;
        const isGrounded = my.sprite.body.blocked.down;
        const isMoving = Math.abs(my.sprite.body.velocity.x) > 10;

        if (isGrounded && isMoving && now - this._lastFootstepTime > 250) {
            const key = Phaser.Utils.Array.GetRandom(my.walkSounds);
            this.sound.play(key, { volume: 0.4 });
            this._lastFootstepTime = now;
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Object interactions
    // ──────────────────────────────────────────────────────────────

    _collectCoin(player, coin) {
        if (!coin.active) return; // Already collected this frame
        coin.setActive(false);
        this.time.delayedCall(0, () => {
            coin.destroy();
        });
        my.score += 1;
        this.sound.play('coin');
    }

    _hitSpike(player, spike) {
        if (this._dying) return; // Already dying this frame
        this._dying = true;
        this.time.delayedCall(0, () => {
            this.sound.play('death');
            my.score = my.savedScore;
            this.scene.restart();
        });
    }

    _reachFlag(player, flag) {
        // Save score, then let the subclass decide what happens next
        my.savedScore = my.score;
        my.scoreCarryOver = true;
        this.onLevelComplete();
    }

    // ──────────────────────────────────────────────────────────────
    //  Water zones
    // ──────────────────────────────────────────────────────────────

    /**
     * Helper for subclasses: creates a water zone with an invisible
     * solid barrier at the surface and an overlap zone below it.
     *
     * @param {number} x         - Center X (pre-scale)
     * @param {number} barrierY  - Y position of the solid barrier (pre-scale)
     * @param {number} zoneY     - Y position of the overlap zone (pre-scale)
     * @param {number} width     - Horizontal extent (pre-scale)
     * @param {number} height    - Vertical extent of overlap zone (pre-scale)
     */
    addWaterZone(x, barrierY, zoneY, width, height) {
        if (!this.waterBarriers) {
            this.waterBarriers = [];
            this.waterZones = [];
        }

        const s = SCALE;

        // Solid invisible barrier that the player stands on at the water surface.
        // physics.add.existing(rect, true) gives it a static body.
        const barrierRect = this.add.rectangle(
            x * s + (width * s) / 2,
            barrierY * s,
            width * s, 10,
            0x000000, 0
        );
        this.physics.add.existing(barrierRect, true);
        barrierRect.setVisible(false);

        // Overlap zone below the barrier for detecting "in water" state.
        const zoneRect = this.add.rectangle(
            x * s + (width * s) / 2,
            zoneY * s + (height * s) / 2,
            width * s, height * s,
            0x000000, 0
        );
        this.physics.add.existing(zoneRect, true);
        zoneRect.setVisible(false);

        this.waterBarriers.push(barrierRect);
        this.waterZones.push(zoneRect);
    }

    _enterWater(player, zone) {
        if (!this._inWater) {
            // First frame of water entry: reduce gravity, play splash
            this._inWater = true;
            this.physics.world.gravity.y = WATER_GRAVITY;
            const key = Phaser.Utils.Array.GetRandom(my.waterSounds);
            this.sound.play(key, { volume: 0.4 });
            if (my.vfx.bubbleEmitter) {
                my.vfx.bubbleEmitter.start();
            }
        }
    }

    _updateVFX() {
        // Check if the player has left the water zone
        if (this._inWater && this.waterZones) {
            let anyOverlap = false;
            for (const z of this.waterZones) {
                if (this.physics.world.overlap(my.sprite, z)) {
                    anyOverlap = true;
                    break;
                }
            }
            if (!anyOverlap) {
                this._inWater = false;
                this.physics.world.gravity.y = NORMAL_GRAVITY;
                if (my.vfx.bubbleEmitter) {
                    my.vfx.bubbleEmitter.stop();
                }
            }
        }

        // Dust particles: emit only when grounded and moving
        if (my.vfx.dustEmitter) {
            const isGrounded = my.sprite.body.blocked.down;
            const isMoving = Math.abs(my.sprite.body.velocity.x) > 10;
            if (isGrounded && isMoving) {
                my.vfx.dustEmitter.start();
            } else {
                my.vfx.dustEmitter.stop();
            }
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Out-of-bounds death
    // ──────────────────────────────────────────────────────────────

    _checkOutOfBounds() {
        const worldBottom = this.physics.world.bounds.height + 200;
        if (my.sprite.y > worldBottom && !this._dying) {
            this._dying = true;
            this.time.delayedCall(0, () => {
                this.sound.play('death');
                my.score = my.savedScore;
                this.scene.restart();
            });
        }
    }

    // ──────────────────────────────────────────────────────────────
    //  Shared helper: create physics groups from Tiled object layer
    // ──────────────────────────────────────────────────────────────

    /**
     * Reads named objects from the Tiled "Objects" layer and converts them
     * into a static physics group of sprites using the tilemap spritesheet.
     *
     * @param {string} objectName - The Tiled object `name` to match.
     * @param {number} frame      - 0-indexed frame in `tilemap_sheet`.
     * @returns {Phaser.Physics.Arcade.StaticGroup}
     */
    createObjectGroup(objectName, frame) {
        const group = this.map.createFromObjects('Objects', {
            name: objectName,
            key: 'tilemap_sheet',
            frame: frame,
        });

        // Scale positions and sprite display for the global SCALE factor
        group.forEach((obj) => {
            obj.x *= SCALE;
            obj.y *= SCALE;
            obj.setScale(SCALE);
        });

        // Convert to a static physics group (bodies auto-sized to sprite bounds)
        const physicsGroup = this.physics.add.staticGroup(group);

        // Refresh each body so the physics size matches the scaled display size
        physicsGroup.getChildren().forEach((child) => {
            child.body.updateFromGameObject();
        });

        return physicsGroup;
    }
}
