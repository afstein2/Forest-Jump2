/**
 * WinScene.js — Victory screen shown after completing Level 2.
 *
 * Displays "You Finished!" and a "Play Again" button that resets the
 * score to 0 and returns to the Start Screen.
 */
class WinScene extends Phaser.Scene {
    constructor() {
        super('winScene');
    }

    create() {
        const w = this.scale.width;
        const h = this.scale.height;

        // Victory message
        this.add.text(w / 2, h / 3, 'You Finished!', {
            fontFamily: 'Arial',
            fontSize: '96px',
            color: '#ffffff',
            stroke: '#000000',
            strokeThickness: 4,
        }).setOrigin(0.5);

        // Show final score
        this.add.text(w / 2, h / 2 - 30, 'Score: ' + my.score, {
            fontFamily: 'Arial',
            fontSize: '48px',
            color: '#ffff88',
        }).setOrigin(0.5);

        // Play Again → reset score and go back to title
        ButtonFactory.create(this, w / 2, h / 2 + 60, 'Play Again', () => {
            my.score = 0;
            my.savedScore = 0;
            my.scoreCarryOver = false;
            this.scene.start('startScreen');
        });
    }
}
