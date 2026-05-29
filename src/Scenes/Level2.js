// Level2.js
class Level2 extends Platformer {
    constructor() {
        super("platformerScene2");
    }

    setupMap() {
        this.map = this.add.tilemap("platformer-level-2", 18, 18, 45, 25);
        this.tileset = this.map.addTilesetImage("kenny_tilemap_packed", "tilemap_tiles");
        this.cameras.main.setBackgroundColor('#73bde2');

        this.groundLayer = this.map.createLayer("Ground-n-Platforms", this.tileset, 0, 0);
        
        console.log(this.map.getObjectLayer("Objects"));
        this.groundLayer.setCollisionByProperty({ collides: true });
        this.groundLayer.setScale(this.SCALE);

        this.playerStart = { x: game.config.width / 4, y: 930 };

    }

    setupObjects() {
        super.setupObjects();
        this.setupWaterZones([
            { x: 1550, barrierY: 1080, zoneY: 1000, width: 380, height: 120 },
            { x: 2150, barrierY: 1080, zoneY: 1000, width: 380, height: 120 }
        ]);
    }

    setupVFX() {
        super.setupVFX();
        my.vfx.water.destroy();
        my.vfx.water = [
            this.createBubbleEmitter(1400, 1700),
            this.createBubbleEmitter(2000, 2300)
        ];
    }


    onLevelComplete() {
        my.scoreCarryOver = true;
        my.score = this.score;
        this.scene.start("winScene");
    }
}