/**
 * StartScreen.js — Title screen with Play, Controls, and Settings buttons.
 *
 * This is the first screen the player sees after assets finish loading.
 * Background colour matches the sky-blue used in-game (#73bde2).
 */
class StartScreen extends Phaser.Scene {
    constructor() {
        super('startScreen');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Game title
        this.add.text(w / 2, h / 3, 'Forest Jump', {
            fontFamily: 'Arial',
            fontSize: '96px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Play → starts the game at Level 1
        ButtonFactory.create(this, w / 2, h / 2, 'Play', () => {
            this.scene.start('platformerScene');
        });

        // Controls → shows the key bindings screen
        ButtonFactory.create(this, w / 2, h / 2 + 80, 'Controls', () => {
            this.scene.start('controlsScreen');
        });

        // Settings → FPS toggle and fullscreen
        ButtonFactory.create(this, w / 2, h / 2 + 160, 'Settings', () => {
            this.scene.start('settingsScreen');
        });
    }
}
