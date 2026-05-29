/**
 * Controls.js — Displays the keyboard controls for the game.
 *
 * Shows all key bindings in a centred panel with a Back button
 * that returns to the Start Screen.
 */
class Controls extends Phaser.Scene {
    constructor() {
        super('controlsScreen');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Title
        this.add.text(w / 2, h / 4, 'Controls', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Key binding list
        const bindings = [
            ['A / ←', 'Move left'],
            ['D / →', 'Move right'],
            ['Space / ↑ / W', 'Jump'],
            ['P', 'Pause'],
            ['R', 'Restart level'],
            ['O', 'Debug physics'],
            ['F', 'Fullscreen (pause menu)'],
        ];

        const startY = h / 3 + 20;
        bindings.forEach((binding, i) => {
            const y = startY + i * 50;
            // Key name (left column)
            this.add.text(w / 2 - 200, y, binding[0], {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffff88',
            }).setOrigin(0.5);
            // Description (right column)
            this.add.text(w / 2 + 100, y, binding[1], {
                fontFamily: 'Arial',
                fontSize: '32px',
                color: '#ffffff',
            }).setOrigin(0.5);
        });

        // Back button → return to title
        ButtonFactory.create(this, w / 2, h - 120, 'Back', () => {
            this.scene.start('startScreen');
        });
    }
}
