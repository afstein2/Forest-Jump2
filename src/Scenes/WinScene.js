// WinScene.js - shown after completing the final level
class WinScene extends Phaser.Scene {
    constructor() {
        super("winScene");
    }

    create() {

        const titleText = this.add.text(centerX, centerY, 'You Finished!', {
            fontSize: '32px',
            fill: '#ffffff',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5);

        const playAgainButton = this.add.text(centerX, centerY + 100, 'Play Again', {
            fontSize: '32px',
            fill: '#00ffcc',
            backgroundColor: '#000000',
            padding: { x: 10, y: 5 }
        })
        .setOrigin(0.5)
        .setInteractive({ useHandCursor: true })
        .on('pointerdown', () => {

            my.score = 0;
            my.savedScore = 0;

            this.scene.start('startScene');
        });

    }
}