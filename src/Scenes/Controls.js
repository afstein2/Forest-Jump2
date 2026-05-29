class Controls extends Phaser.Scene {
    constructor() {
        super("controlsScene");
    }

    create() {

        this.cameras.main.setBackgroundColor('#73bde2');

        // Title
        this.add.text(centerX, centerY - 250, 'CONTROLS', {
            fontSize: '64px',
            fill: '#ffffff',
            fontStyle: 'bold'
        }).setOrigin(0.5);

        // Panel
        const panelWidth = 650;
        const panelHeight = 420;

        const panel = this.add.graphics();

        panel.fillStyle(0x000000, 0.5);

        panel.fillRoundedRect(
            centerX - panelWidth / 2,
            centerY - panelHeight / 2,
            panelWidth,
            panelHeight,
            24
        );

        // Controls text
        const controlsText = [

            'A / LEFT ARROW  -  Move Left',
            'D / RIGHT ARROW -  Move Right',
            'SPACE / UP      -  Jump',
            'P                -  Pause',
            'R                -  Restart Level'

        ];

        controlsText.forEach((text, index) => {

            this.add.text(
                centerX - 300,
                centerY - 160 + index * 60,
                text,
                {
                    fontSize: '28px',
                    fill: '#ffffff'
                }
            )

        });

        // Back button
        this.createButton(
            centerX,
            centerY + 280,
            'Back',
            () => {
                this.scene.start('startScene');
            }
        );
    }

    createButton(x, y, label, callback) {

        const width = 250;
        const height = 60;
        const radius = 20;

        const btn = this.add.graphics();

        const drawBtn = (color, alpha) => {

            btn.clear();

            btn.fillStyle(color, alpha);

            btn.fillRoundedRect(
                x - width / 2,
                y - height / 2,
                width,
                height,
                radius
            );
        };

        drawBtn(0x000000, 0.5);

        const hitArea = this.add.rectangle(
            x,
            y,
            width,
            height,
            0xffffff,
            0
        )
        .setInteractive()
        .setOrigin(0.5);

        const text = this.add.text(x, y, label, {
            fontSize: '28px',
            fill: '#ffffff'
        }).setOrigin(0.5);

        hitArea.on('pointerover', () => {

            drawBtn(0xffffff, 0.3);

            text.setStyle({
                fontSize: '30px'
            });

        });

        hitArea.on('pointerout', () => {

            drawBtn(0x000000, 0.5);

            text.setStyle({
                fontSize: '28px'
            });

        });

        hitArea.on('pointerdown', callback);
    }
}