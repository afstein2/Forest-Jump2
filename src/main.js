
//
// An example of putting sprites on the screen using Phaser
// 
// Art assets from Kenny Assets "Shape Characters" set:
// https://kenney.nl/assets/shape-characters

// debug with extreme prejudice
"use strict"

// game config
let config = {
    parent: 'phaser-game',
    type: Phaser.CANVAS,
    render: {
        pixelArt: true  // prevent pixel art from getting blurred when scaled
    },
    physics: {
        default: 'arcade',
        arcade: {
            debug: false,
            gravity: {
                x: 0,
                y: 0
            }
        }
    },

    width: 1920, // (Default: 1920, 944), (1420, 944), (1280, 944)
    height: 944,
    scale: {
        mode: Phaser.Scale.FIT,
        autoCenter: Phaser.Scale.CENTER_BOTH
    },
    scene: [StartScreen, Load, Platformer, Level1, Level2, WinScene, PauseMenu, Settings, Controls]
}

const game = new Phaser.Game(config);

// globals
const centerX = game.config.width / 2;
const centerY = game.config.height / 2;
const W = game.config.width;
const H = game.config.height;

var cursors;
var my = {
    sprite: {},
    text: {},
    vfx: {},
    settings: { fps: false }, 
    savedScore: 0 
};