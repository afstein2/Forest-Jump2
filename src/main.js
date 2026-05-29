/**
 * main.js — Phaser game configuration and boot.
 *
 * Creates the Phaser.Game instance with all scene classes and the
 * rendering / scaling settings described in the design document.
 */

const game = new Phaser.Game({
    type: Phaser.CANVAS,
    pixelArt: true,
    scale: {
        parent: 'phaser-game',
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH,
        width: 1920,
        height: 944,
    },
    backgroundColor: '#73bde2',
    physics: {
        default: 'arcade',
        arcade: {
            gravity: { y: NORMAL_GRAVITY },
            debug: false,
        },
    },
    scene: [
        Load,
        StartScreen,
        Controls,
        Settings,
        Level1,
        Level2,
        PauseMenu,
        WinScene,
    ],
});
