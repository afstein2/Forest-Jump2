/**
 * PauseMenu.js — Overlay that appears when the player presses P.
 *
 * Lays a semi-transparent black rectangle over the paused gameplay scene
 * and offers keyboard shortcuts (P to resume, R to restart, F for fullscreen)
 * plus two buttons: Restart Level and Main Menu.
 *
 * We track which level scene is active via my.activeLevelKey so we can
 * correctly resume or restart the right scene.
 */
class PauseMenu extends Phaser.Scene {
    constructor() {
        super('pauseScene');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Figure out which level scene is paused so we can resume/restart it
        this.levelKey = my.activeLevelKey || 'platformerScene';

        // Dim overlay on top of the paused game
        this.add.rectangle(w / 2, h / 2, w, h, 0x000000, 0.6);

        // "Paused" text
        this.add.text(w / 2, h / 3, 'Paused', {
            fontFamily: 'Arial',
            fontSize: '72px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 3,
        }).setOrigin(0.5);

        // ── Keyboard shortcuts ───────────────────────────────────
        // P → resume
        this.input.keyboard.on('keydown-P', () => {
            this.resumeGame();
        });

        // R → restart the current level
        this.input.keyboard.on('keydown-R', () => {
            this._restartLevel();
        });

        // F → toggle fullscreen
        this.input.keyboard.on('keydown-F', () => {
            if (this.scale.isFullscreen) {
                this.scale.stopFullscreen();
            } else {
                this.scale.startFullscreen();
            }
        });

        // ── Buttons ──────────────────────────────────────────────
        ButtonFactory.create(this, w / 2, h / 2, 'Restart Level', () => {
            this._restartLevel();
        });

        // Main Menu → stop everything and go to title
        ButtonFactory.create(this, w / 2, h / 2 + 80, 'Main Menu', () => {
            this.scene.stop('pauseScene');
            this.scene.stop('platformerScene');
            this.scene.stop('platformerScene2');
            this.scene.start('startScreen');
        });
    }

    /** Resume the gameplay scene and close this overlay. */
    resumeGame() {
        this.scene.resume(this.levelKey);
        this.scene.stop('pauseScene');
    }

    /** Restart the current level from the beginning. */
    _restartLevel() {
        this.scene.stop('pauseScene');
        my.score = my.savedScore;
        this.scene.stop(this.levelKey);
        this.scene.start(this.levelKey);
    }
}
