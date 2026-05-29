/**
 * ButtonFactory.js — Shared utility for creating styled menu buttons.
 *
 * All menu screens (Start, Controls, Settings, Pause, Win) use the same
 * visual style: rounded-rectangle buttons with hover effects. This class
 * centralises that logic so we don't repeat it in every scene.
 */
class ButtonFactory {
    /**
     * Create a menu button at the given position.
     *
     * @param {Phaser.Scene} scene      - The scene that owns this button.
     * @param {number}        x         - Center X position.
     * @param {number}        y         - Center Y position.
     * @param {string}        label     - Text displayed on the button.
     * @param {Function}      onClick   - Callback invoked on pointerdown.
     * @param {number}        [width]   - Button width (default 250).
     * @param {number}        [height]  - Button height (default 60).
     * @returns {{ graphics: Phaser.GameObjects.Graphics, text: Phaser.GameObjects.Text }}
     */
    static create(scene, x, y, label, onClick, width = 250, height = 60) {
        const cornerRadius = 20;

        // Draw the rounded-rectangle background
        const graphics = scene.add.graphics();
        ButtonFactory._drawRoundedRect(graphics, width, height, cornerRadius, 0x000000, 0.5);
        graphics.setPosition(x - width / 2, y - height / 2);

        // Create the label text centred on the button
        const text = scene.add.text(x, y, label, {
            fontFamily: 'Arial',
            fontSize: '28px',
            color: '#ffffff',
        }).setOrigin(0.5);

        // Invisible hit-area so pointer events are clean
        const hitArea = scene.add.rectangle(x, y, width, height, 0x000000, 0);
        hitArea.setInteractive({ useHandCursor: true });

        // Click handler
        hitArea.on('pointerdown', onClick);

        // Hover effects: lighten background and grow font on enter, revert on exit
        hitArea.on('pointerover', () => {
            ButtonFactory._drawRoundedRect(graphics, width, height, cornerRadius, 0xffffff, 0.3);
            text.setFontSize(30);
        });
        hitArea.on('pointerout', () => {
            ButtonFactory._drawRoundedRect(graphics, width, height, cornerRadius, 0x000000, 0.5);
            text.setFontSize(28);
        });

        return { graphics, text };
    }

    /**
     * Redraw a rounded rectangle on the given Graphics object.
     * Clears previous drawings first so hover redraws look correct.
     */
    static _drawRoundedRect(graphics, w, h, r, color, alpha) {
        graphics.clear();
        graphics.fillStyle(color, alpha);
        graphics.fillRoundedRect(0, 0, w, h, r);
    }
}
