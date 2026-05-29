/**
 * Settings.js — Toggle game settings: FPS display and fullscreen.
 *
 * Uses simple checkbox-style buttons that toggle between ON/OFF states.
 * Back button returns to the Start Screen.
 */
class Settings extends Phaser.Scene {
    constructor() {
        super('settingsScreen');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Title
        this.add.text(w / 2, h / 4, 'Settings', {
            fontFamily: 'Arial',
            fontSize: '64px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // Show FPS toggle
        const fpsLabel = my.settings.showFPS ? 'Show FPS: ON' : 'Show FPS: OFF';
        ButtonFactory.create(this, w / 2, h / 2, fpsLabel, () => {
            my.settings.showFPS = !my.settings.showFPS;
            this.scene.restart(); // Re-render the button label
        });

        // Fullscreen toggle
        const fsLabel = this.scale.isFullscreen ? 'Fullscreen: ON' : 'Fullscreen: OFF';
        ButtonFactory.create(this, w / 2, h / 2 + 80, fsLabel, () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
            this.scene.restart();
        });

        // Back button
        ButtonFactory.create(this, w / 2, h - 120, 'Back', () => {
            this.scene.start('startScreen');
        });
    }
}
