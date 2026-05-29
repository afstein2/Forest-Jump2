class PauseMenu extends Phaser.Scene {
    constructor() {
        super("pauseScene");
    }

    create() {

        // Dim overlay
        this.add.rectangle(
            centerX, centerY,
            game.config.width, game.config.height,
            0x000000, 0.6
        );


        // Restart Level Button
        this.createButton(centerX, centerY, 'Restart Level', () => {
            this.scene.stop();
            this.scene.start('platformerScene');
        });

        // Play Button
        this.createButton(centerX, centerY + 80, 'Main Menu', () => {
            this.scene.stop('pauseScene');
            this.scene.stop('platformerScene');
            this.scene.start('startScene');
        });

        // Pause title
        this.add.text(centerX, centerY - 100, 'PAUSED', {
            fontSize: '48px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Resume
        this.input.keyboard.once('keydown-P', () => {
            this.scene.resume('platformerScene');
            this.scene.stop();
        });

        // Restart
        this.input.keyboard.once('keydown-R', () => {
            this.scene.stop('pauseScene');
            this.scene.stop('platformerScene');
            this.scene.start('platformerScene');
        });

        // Toggle Fullscreen
        this.input.keyboard.once('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });
    }

    createButton(x, y, label, callback) {
        const width = 250;
        const height = 60;
        const radius = 20;

        const btn = this.add.graphics();

        const drawBtn = (color, alpha) => {
            btn.clear();
            btn.fillStyle(color, alpha);
            btn.fillRoundedRect(x - width/2, y - height/2, width, height, radius);
        };

        drawBtn(0x000000, 0.5);

        // Invisible interactive zone on top
        const hitArea = this.add.rectangle(x, y, width, height, 0xffffff, 0)
            .setInteractive()
            .setOrigin(0.5);

        const text = this.add.text(x, y, label, {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        hitArea.on('pointerover', () => {
            drawBtn(0xffffff, 0.3);
            text.setStyle({ fontSize: '30px' });
        });

        hitArea.on('pointerout', () => {
            drawBtn(0x000000, 0.5);
            text.setStyle({ fontSize: '28px' });
        });

        hitArea.on('pointerdown', callback);
    }
}