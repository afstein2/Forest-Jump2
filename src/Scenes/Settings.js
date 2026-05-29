class Settings extends Phaser.Scene {
    constructor() {
        super("settingsScene");
    }

    create() {


        this.cameras.main.setBackgroundColor('#73bde2');

        // State
        this.fpsEnabled = false;
        this.fullscreenEnabled = false;

        // Title
        this.add.text(centerX, centerY - 200, 'SETTINGS', {
            fontSize: '64px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Panel
        const panelWidth = 400;
        const panelHeight = 220;
        const panel = this.add.graphics();
        panel.fillStyle(0x000000, 0.5);
        panel.fillRoundedRect(
            centerX - panelWidth / 2,
            centerY - panelHeight / 2,
            panelWidth,
            panelHeight,
            24
        );

        // FPS Toggle
        this.createCheckbox(
            centerX - 80,
            centerY - 50,
            'Show FPS',
            this.fpsEnabled,
            (val) => {
                this.fpsEnabled = val;
                if (val) {
                    my.settings.fps = true;
                } else {
                    if (this.fpsText) this.fpsText.destroy();
                }
            }
        );

        // Fullscreen Toggle
        this.createCheckbox(
            centerX - 80,
            centerY + 30,
            'Fullscreen',
            this.fullscreenEnabled,
            (val) => {
                this.fullscreenEnabled = val;
                if (val) {
                    this.scale.startFullscreen();
                } else {
                    this.scale.stopFullscreen();
                }
            }
        );

        // Back Button
        this.createButton(centerX, centerY + 170, 'Back', () => {
            this.scene.start('startScene');
        });
    }

    update() {
        if (this.fpsText && this.fpsEnabled) {
            this.fpsText.setText(`FPS: ${Math.floor(this.game.loop.actualFps)}`);
        }
    }

    createCheckbox(x, y, label, initialValue, onChange) {
        const size = 28;
        const radius = 6;
        let checked = initialValue;

        // Box graphic
        const box = this.add.graphics();

        const drawBox = (isChecked) => {
            box.clear();
            box.fillStyle(isChecked ? 0x4CAF50 : 0xffffff, 0.9);
            box.fillRoundedRect(x, y, size, size, radius);
            box.lineStyle(2, 0xffffff, 1);
            box.strokeRoundedRect(x, y, size, size, radius);

            // Checkmark
            if (isChecked) {
                box.lineStyle(3, 0xffffff, 1);
                box.beginPath();
                box.moveTo(x + 6,  y + 14);
                box.lineTo(x + 12, y + 20);
                box.lineTo(x + 22, y + 8);
                box.strokePath();
            }
        };

        drawBox(checked);

        // Label
        this.add.text(x + size + 16, y + size / 2, label, {
            fontSize: '24px',
            fill: '#ffffff'
        }).setOrigin(0, 0.5);

        // Hit area
        const hitArea = this.add.rectangle(
            x + size / 2, y + size / 2,
            size + 120, size,
            0xffffff, 0
        ).setInteractive().setOrigin(0.5);

        hitArea.on('pointerdown', () => {
            checked = !checked;
            drawBox(checked);
            onChange(checked);
        });



        hitArea.on('pointerover', () => {
            box.clear();
            box.fillStyle(checked ? 0x66BB6A : 0xdddddd, 0.9);
            box.fillRoundedRect(x, y, size, size, radius);
            box.lineStyle(2, 0xffffff, 1);
            box.strokeRoundedRect(x, y, size, size, radius);
            if (checked) {
                box.lineStyle(3, 0xffffff, 1);
                box.beginPath();
                box.moveTo(x + 6,  y + 14);
                box.lineTo(x + 12, y + 20);
                box.lineTo(x + 22, y + 8);
                box.strokePath();
            }
        });

        hitArea.on('pointerout', () => drawBox(checked));
    }

    createButton(x, y, label, callback) {
        const width = 250;
        const height = 60;
        const radius = 20;

        const btn = this.add.graphics();

        const drawBtn = (color, alpha) => {
            btn.clear();
            btn.fillStyle(color, alpha);
            btn.fillRoundedRect(x - width / 2, y - height / 2, width, height, radius);
        };

        drawBtn(0x000000, 0.5);

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