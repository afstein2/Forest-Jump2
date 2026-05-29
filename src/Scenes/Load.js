class Load extends Phaser.Scene {
    constructor() {
        super("loadScene");
    }

    preload() {
        this.load.setPath("./assets/");

        // Load characters spritesheet
        this.load.atlas("platformer_characters", "tilemap-characters-packed.png", "tilemap-characters-packed.json");

        // Load tilemap information
        this.load.image("tilemap_tiles", "tilemap_packed.png");                       // Packed tilemap
        this.load.image("bgmap_tiles", "foliagePack_vector.svg");
        this.load.tilemapTiledJSON("platformer-level-1", "platformer-level-1.tmj");   // Lvl 1 Tilemap in JSON
        this.load.tilemapTiledJSON("platformer-level-2", "platformer-level-2.tmj");   // Lvl 2 Tilemap in JSON
        this.load.image("coin_icon", "Textures/Coin.png");

        this.load.image('clouds', 'Textures/clouds_small.png');


        // Load audio
        this.load.audio("jump", "Audio/Jump1.mp3");
        this.load.audio("coin", "Audio/Coin.mp3");
        this.load.audio("death", "Audio/impactPunch_medium_002.ogg");

        this.load.audio("walk1", "Audio/footstep_grass_000.ogg");
        this.load.audio("walk2", "Audio/footstep_grass_001.ogg");
        this.load.audio("walk3", "Audio/footstep_grass_002.ogg");
        this.load.audio("walk4", "Audio/footstep_grass_003.ogg");

        this.load.audio("water1", "Audio/water_splosh_movement_higher_pitched_008.mp3");
        this.load.audio("water2", "Audio/water_splosh_movement_higher_pitched_009.mp3");
        this.load.audio("water3", "Audio/water_splosh_movement_lower_pitched_002.mp3");
        this.load.audio("water4", "Audio/water_splosh_movement_lower_pitched_003.mp3");


        // Load the tilemap as a spritesheet
        this.load.spritesheet("tilemap_sheet", "tilemap_packed.png", {
            frameWidth: 18,
            frameHeight: 18
        });

        this.load.multiatlas("kenny-particles", "kenny-particles.json");
    }

    create() {
        this.anims.create({
            key: 'walk',
            frames: this.anims.generateFrameNames('platformer_characters', {
                prefix: "tile_",
                start: 0,
                end: 1,
                suffix: ".png",
                zeroPad: 4
            }),
            frameRate: 15,
            repeat: -1
        });

        this.anims.create({
            key: 'idle',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0000.png" }
            ],
            repeat: -1
        });

        this.anims.create({
            key: 'jump',
            defaultTextureKey: "platformer_characters",
            frames: [
                { frame: "tile_0001.png" }
            ],
        });

         // ...and pass to the next Scene
         this.scene.start("platformerScene");
    }

    // Never get here since a new scene is started in create()
    update() {
    }
}