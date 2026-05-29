/**
 * Allie Stein
 * 
 * Platformer implementation - Game 3b 
 * 
 * Forest Jump
 * 
 */

class Platformer extends Phaser.Scene {

    init() {

        // variables and settings
        this.ACCELERATION = 400;
        this.DRAG = 500;    // DRAG < ACCELERATION = icy slide
        this.physics.world.gravity.y = 1500;
        this.JUMP_VELOCITY = -700;
        this.inWater = false;

        // particles
        this.PARTICLE_VELOCITY = 50;

        // world scaling
        this.SCALE = 1.5;
    }

    create() {
        this.setupPhysics();
        this.setupUI();
        this.setupMap();

        this.clouds = this.add.tileSprite(
            0,
            -this.scale.height * 0.5,
            this.scale.width,
            this.scale.height * 0.89,
            'clouds'
        )
        .setOrigin(0, 0)
        .setScrollFactor(0)
        .setScale(1);

        this.clouds.tileScaleX = 0.4;
        this.clouds.tileScaleY = 0.4;

        // Print Screen Size
        console.log("Scale width:", this.scale.width, "Scale height:", this.scale.height);
        console.log("Game size width:", this.scale.gameSize.width, "Game size height:", this.scale.gameSize.height);
        console.log("Camera width:", this.cameras.main.width, "Camera height:", this.cameras.main.height);
        console.log("Window width:", window.innerWidth, "Window height:", window.innerHeight);

        this.setupObjects();
        this.setupPlayer();   // player created here, AFTER setupObjects
        this.setupInput();
        this.setupVFX();
        this.setupAudio();
        this.setupCamera();
    }

    setupPhysics() {

        // Fix Collison clipping
        this.physics.world.TILE_BIAS = 32;
    }


    // Subclasses override this to load their own map
    setupMap() {}


    // UI  -----------------------------------------------

    setupUI() {

        
        /* ==================================================
        * Coin Score
        * ================================================= */
        if (my.score) {
            this.score = my.score;
        } else {
            this.score = my.savedScore;
        }

        my.scoreCarryOver = false;
        my.score = this.score;


        
        /* ==================================================
        * UI Text
        * ================================================= */
        this.scoreText = this.add.text(game.config.width / 5.2, game.config.height / 5.5, `${this.score}`, {
            fontSize: '128px', fill: '#ffffff'
        }).setScrollFactor(0).setDepth(100).setScale(0.5);

        this.coinIcon = this.add.image(game.config.width / 5.5, game.config.height / 4.7, "coin_icon");
        this.coinIcon.setScrollFactor(0).setScale(3).setDepth(1000);

        if (my.settings.fps) {
            this.fpsText = this.add.text(game.config.width / 1.3, game.config.height / 5.5, '', {
                fontSize: '48px',
                fill: '#ffffff'
            }).setScrollFactor(0).setDepth(200).setScale(0.5);
        }
    }


    // OBJECTS  -----------------------------------------------

    setupObjects() {

        // Defaults - subclasses populate via setupWaterZones()
        this.waterZone = null;
        this.waterBarriers = [];



        /* ==================================================
        * Create Objects
        * ================================================= */

        // Coins ------------------------------------------------
        this.coins = this.map.createFromObjects("Objects", {
            name: "coin", key: "tilemap_sheet", frame: 151
        });
        this.coins.forEach((coin) => {
            coin.setScale(this.SCALE);
            coin.x *= this.SCALE;
            coin.y *= this.SCALE;
        });
        this.physics.world.enable(this.coins, Phaser.Physics.Arcade.STATIC_BODY);
        this.coinGroup = this.add.group(this.coins);

        // Flags ------------------------------------------------
        this.flags = this.map.createFromObjects("Objects", {
            name: "flag", key: "tilemap_sheet", frame: 111
        });
        this.flags.forEach((flag) => {
            flag.setScale(this.SCALE);
            flag.x *= this.SCALE;
            flag.y *= this.SCALE;
        });
        this.physics.world.enable(this.flags, Phaser.Physics.Arcade.STATIC_BODY);
        this.flagGroup = this.add.group(this.flags);

        // Spikes ------------------------------------------------
        this.spikes = this.map.createFromObjects("Objects", {
            name: "spike", key: "tilemap_sheet", frame: 68
        });
        this.spikes.forEach((spike) => {
            spike.setScale(this.SCALE);
            spike.x *= this.SCALE;
            spike.y *= this.SCALE;
        });
        this.physics.world.enable(this.spikes, Phaser.Physics.Arcade.STATIC_BODY);
        this.spikeGroup = this.add.group(this.spikes);
    }



    /* ==================================================
    * Create Water Zones
    * ================================================= */
    // Called by subclasses inside their setupObjects()
    // Barriers are stored and wired to the player later in setupPlayer()
    setupWaterZones(configs) {

        const zoneObjects = configs.map(cfg => {

            const barrier = this.add.zone(cfg.x, cfg.barrierY, cfg.width, 10);
            this.physics.world.enable(barrier);
            barrier.body.setAllowGravity(false);
            barrier.body.setImmovable(true);
            barrier.body.moves = false;
            this.waterBarriers.push(barrier); // collider added later in setupPlayer

            const zone = this.add.zone(cfg.x, cfg.zoneY, cfg.width, cfg.height);
            this.physics.world.enable(zone);
            zone.body.setAllowGravity(false);
            zone.body.setImmovable(true);
            zone.body.moves = false;

            return zone;
        });

        if (zoneObjects.length === 1) {
            this.waterZone = zoneObjects[0];
        } 
        
        else {
            this.waterZone = this.add.group(zoneObjects);
        }
    }


    // PLAYER  ---------------------------------------------------------

    setupPlayer() {

        /* ==================================================
        * Create Player
        * ================================================= */
        my.sprite.player = this.physics.add.sprite(
            this.playerStart.x,
            this.playerStart.y,
            "platformer_characters",
            "tile_0000.png"
        );
        my.sprite.player.setScale(this.SCALE);         // Player Scale
        my.sprite.player.setCollideWorldBounds(false); // Player World bounds



        /* ==================================================
        * Fixed Colliders/Barriers
        * ================================================= */

        // Ground Collison 
        this.physics.add.collider(my.sprite.player, this.groundLayer);

        // Water barrier colliders - now safe because player exists
        this.waterBarriers.forEach(barrier => {
            this.physics.add.collider(my.sprite.player, barrier);
        });



        /* ==================================================
        * Collidable Objects
        * ================================================= */

        // Coin overlap
        this.physics.add.overlap(my.sprite.player, this.coinGroup, (obj1, obj2) => {
            this.score += 1;
            my.score = this.score;
            this.scoreText.setText(`${this.score}`);
            obj2.destroy();
            this.playCoin();
        });

        // Flag overlap
        this.physics.add.overlap(my.sprite.player, this.flagGroup, () => {
            my.savedScore = this.score;
            this.onLevelComplete();
        });

        // Spike overlap
        this.physics.add.overlap(my.sprite.player, this.spikeGroup, () => {
            this.scene.restart();
            my.score = this.savedScore;
            this.playDeath();
        });


    }


    // OVERRIDE
    onLevelComplete() {}


    // INPUT ---------------------------------------------------------

    setupInput() {
        cursors = this.input.keyboard.createCursorKeys();
        this.rKey = this.input.keyboard.addKey('R');
        this.pKey = this.input.keyboard.addKey('P');
        this.aKey = this.input.keyboard.addKey('A');
        this.dKey = this.input.keyboard.addKey('D');

        this.input.keyboard.on('keydown-O', () => {
            this.physics.world.drawDebug = !this.physics.world.drawDebug;
            this.physics.world.debugGraphic.clear();
        }, this);
    }


    // VFX/Particles ---------------------------------------------------------

    setupVFX() {

    /* ==================================================
    * Create Walking Particles 
    * ================================================= */
        my.vfx.walking = this.add.particles(0, 0, "kenny-particles", {
            frame: ['smoke_03.png', 'smoke_09.png'],
            random: true,
            scale: { start: 0.03, end: 0.1 },
            maxAliveParticles: 8,
            lifespan: 350,
            gravityY: -400,
            alpha: { start: 1, end: 0.1 },
        });
        my.vfx.walking.stop();


    /* ==================================================
    * Create Bubble Particles (Overrides)
    * ================================================= */
        // Placeholder water emitter - subclasses destroy and replace this
        my.vfx.water = this.add.particles(0, 0, "kenny-particles", {
            frame: "bubble_01.png",
        });
    }

    /* ==================================================
    * Create Bubble Particles
    * ================================================= */
    createBubbleEmitter(xMin, xMax) {
        return this.add.particles(0, 0, "kenny-particles", {
            frame: "bubble_01.png",
            x: { min: xMin, max: xMax },
            y: { min: 1200, max: 900 },
            lifespan: 1200,
            speedY: { min: -80, max: -40 },
            speedX: { min: -10, max: 10 },
            scale: { start: 0.08, end: 0 },
            alpha: { start: 0.8, end: 0 },
            quantity: 1,
            frequency: 120,
            blendMode: 'ADD',
            emitting: false
        });
    }


    /* ==================================================
    *  Start/Stop Water VFX
    * ================================================= */
    startWaterVFX() {
        if (Array.isArray(my.vfx.water)) {
            my.vfx.water.forEach(emitter => emitter.start());
        } else {
            my.vfx.water.start();
        }
    }

    stopWaterVFX() {
        if (Array.isArray(my.vfx.water)) {
            my.vfx.water.forEach(emitter => emitter.stop());
        } else {
            my.vfx.water.stop();
        }
    }


    // AUDIO ---------------------------------------------------------


    /* ==================================================
    * Create Audio 
    * ================================================= */
    setupAudio() {

        this.sound.add('jump');
        this.sound.add('coin');
        this.sound.add('death');

        this.walkSounds = [
            this.sound.add('walk1', { volume: 0.4 }),
            this.sound.add('walk2', { volume: 0.4 }),
            this.sound.add('walk3', { volume: 0.4 }),
            this.sound.add('walk4', { volume: 0.4 })
        ];

        this.waterSounds = [
            this.sound.add('water1', { volume: 0.4 }),
            this.sound.add('water2', { volume: 0.4 }),
            this.sound.add('water3', { volume: 0.4 }),
            this.sound.add('water4', { volume: 0.4 })
        ];

        this.lastStepTime = 0;
        this.stepDelay = 250;
    }

    /* ==================================================
    * Play Audio 
    * ================================================= */
    playFootstep() {
        Phaser.Utils.Array.GetRandom(this.walkSounds).play();
    }

    playJump() {
        this.sound.play('jump');
    }

    playCoin() {
        this.sound.play('coin');
    }

    playDeath() {
        this.sound.play('death');
    }

    playWater() {
        Phaser.Utils.Array.GetRandom(this.waterSounds).play();
    }


    // CAMERA ---------------------------------------------------------

    /* ==================================================
    * Create Camera
    * ================================================= */
    setupCamera() {
        this.cameras.main.startFollow(my.sprite.player, true, 0.25, 0.25);
        this.cameras.main.setBounds(0, 0, this.map.widthInPixels * this.SCALE, this.map.heightInPixels * this.SCALE);
        this.physics.world.setBounds(0, 0, this.map.widthInPixels * this.SCALE, this.map.heightInPixels * this.SCALE);
        this.cameras.main.setDeadzone(50, 50);
        this.cameras.main.setZoom(this.SCALE);
    }


    update() {



        /* ==================================================
        * World Bounds
        * ================================================= */
        // If out of bounds, kill player
        if (my.sprite.player.y > this.physics.world.bounds.height + 200) {
            my.score = this.savedScore;
            this.playDeath();
            this.scene.restart();
        }


        /* ==================================================
        * Water Updates
        * ================================================= */

        // Water check
        let touchingWater = false;

        if (this.waterZone) {
            touchingWater = this.physics.overlap(my.sprite.player, this.waterZone);
        }

        if (!touchingWater) {
            this.stopWaterVFX();
        }

        // Enter water
        if (touchingWater && !this.inWater) {
            this.inWater = true;
            this.playWater();
            this.startWaterVFX();
            this.physics.world.gravity.y = 400;
        }
        // Exit water
        else if (!touchingWater && this.inWater) {
            this.inWater = false;
            this.stopWaterVFX();
            this.physics.world.gravity.y = 1500;
        }




        /* ==================================================
        * UI/Cloud Updates
        * ================================================= */
        this.clouds.tilePositionX = this.cameras.main.scrollX * 0.1;

        if (my.settings.fps && this.fpsText) {
            this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
        }

        if (Phaser.Input.Keyboard.JustDown(this.pKey)) {
            this.scene.pause();
            this.scene.launch('pauseScene');
        }

        /* ==================================================
        * Player Movement Updates
        * ================================================= */
        if (this.aKey.isDown || cursors.left.isDown) {
            my.sprite.player.setAccelerationX(-this.ACCELERATION);
            my.sprite.player.resetFlip();
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (this.time.now > this.lastStepTime + this.stepDelay) {
                    this.playFootstep();
                    this.lastStepTime = this.time.now;
                }
            }

        } else if (this.dKey.isDown || cursors.right.isDown) {
            my.sprite.player.setAccelerationX(this.ACCELERATION);
            my.sprite.player.setFlip(true, false);
            my.sprite.player.anims.play('walk', true);
            my.vfx.walking.startFollow(my.sprite.player, my.sprite.player.displayWidth / 2 - 10, my.sprite.player.displayHeight / 2 - 5, false);
            my.vfx.walking.setParticleSpeed(this.PARTICLE_VELOCITY, 0);

            if (my.sprite.player.body.blocked.down) {
                my.vfx.walking.start();
                if (this.time.now > this.lastStepTime + this.stepDelay) {
                    this.playFootstep();
                    this.lastStepTime = this.time.now;
                }
            }

        } else {
            my.sprite.player.setAccelerationX(0);
            my.sprite.player.setDragX(this.DRAG);
            my.sprite.player.anims.play('idle');
            my.vfx.walking.stop();
        }

        if (!my.sprite.player.body.blocked.down) {
            my.sprite.player.anims.play('jump');
        }

        if (my.sprite.player.body.blocked.down &&
            (Phaser.Input.Keyboard.JustDown(cursors.space) || Phaser.Input.Keyboard.JustDown(cursors.up))) {
            my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
            this.playJump();
        }

        // Restart Level
        if (Phaser.Input.Keyboard.JustDown(this.rKey)) {
            my.score = this.savedScore;
            this.scene.restart();
        }
    }
}