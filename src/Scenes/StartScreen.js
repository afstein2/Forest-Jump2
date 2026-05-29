class StartScreen extends Phaser.Scene {
    constructor() {
        super("startScene");
    }

    create() {

        this.cameras.main.setBackgroundColor('#73bde2');

        // Title
        this.add.text(centerX, centerY - 150, 'Forest Jump', {
            fontSize: '64px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Play Button
        this.createButton(centerX, centerY, 'Play', () => {
            this.scene.start('loadScene');
        });

        // Controls Button
        this.createButton(centerX, centerY + 80, 'Controls', () => {
            this.scene.start('controlsScene');
        });

        // Settings Button
        this.createButton(centerX, centerY + 160, 'Settings', () => {
            this.scene.start('settingsScene');
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