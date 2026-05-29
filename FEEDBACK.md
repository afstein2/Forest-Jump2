# Forest Jump — Code Review Feedback

## Overall Impression

This is a solid first platformer. The scene inheritance pattern (`Level1`/`Level2` extending `Platformer`) shows good object-oriented thinking, and the game is functionally complete with multiple levels, a menu system, pause functionality, and water physics. The feedback below focuses on areas where targeted improvements will sharpen your skills as a gameplay programmer.

---

## 1. Phaser Framework & Arcade Physics

### What's working well
- Correct use of `setCollisionByProperty({ collides: true })` to drive collisions from Tiled data — this is the idiomatic Phaser/Tiled workflow.
- `TILE_BIAS = 32` at `Platformer.js:64` is a smart fix for tunneling through thin tiles.
- Camera setup with `startFollow`, `setDeadzone`, and `setBounds` is properly sequenced.
- Using `setDragX` for horizontal deceleration is the right approach for a responsive-feeling platformer.

### Issues to address

**Global gravity mutation is fragile.** At `Platformer.js:452` and `:458`, you flip `this.physics.world.gravity.y` between 400 and 1500 for water. This changes gravity for *every* physics body in the world — if you later add enemies, projectiles, or destructible objects, they will all float in water too. A better approach is to adjust only the player's gravity scale or apply a custom force in `update()`:

```js
// Instead of changing world gravity:
if (touchingWater) {
    my.sprite.player.body.gravity.y = 400;
} else {
    my.sprite.player.body.gravity.y = 1500;
}
```

Even better, use `setGravityY()` on the player body directly and leave the world gravity at 0 (set it per-body instead of globally). This is how arcade physics is designed to be used — each body owns its own gravity multiplier.

**Coin overlap destroys immediately — no collection feedback.** At `Platformer.js:239`, `obj2.destroy()` is called the instant the overlap fires. In a polished platformer you'd want a brief "collected" animation (scale up + fade out, or a particle burst at the coin's position *before* destroying it). This is a common pattern:

```js
this.physics.add.overlap(my.sprite.player, this.coinGroup, (player, coin) => {
    this.score += 1;
    this.scoreText.setText(`${this.score}`);
    // Play a small collect animation before destroying
    this.tweens.add({
        targets: coin,
        scaleX: 2, scaleY: 2, alpha: 0,
        duration: 200,
        onComplete: () => coin.destroy()
    });
    this.playCoin();
});
```

**`setCollideWorldBounds(false)` at `Platformer.js:212`** disables world-bound collision, which is fine since you're doing manual bounds checking in `update()`. But the manual check at `:425` uses a magic number (`+ 200`) and restarts the scene *after* playing death sound — the sound will cut out immediately because `scene.restart()` resets everything. Play the sound *before* restarting, or better, use a brief death animation/screen-shake with a delayed restart via `this.time.delayedCall()`.

**Spike overlap has the same sound-cutting problem** (`Platformer.js:251-254`). `scene.restart()` fires in the same frame as `playDeath()`.

---

## 2. JavaScript Language & Idioms

### What's working well
- `const`/`let` are used appropriately in most places.
- Arrow functions in callbacks (`forEach`, overlap handlers) keep `this` binding clean.
- `Phaser.Utils.Array.GetRandom()` at `Platformer.js:383` is a nice use of Phaser's utility — idiomatic.
- `Array.map()` in `setupWaterZones` (`Platformer.js:170`) is the correct functional approach.

### Issues to address

**`var` vs `let`/`const`.** `main.js:46` uses `var cursors` as a global. Since you're in `"use strict"` mode (good!), `var` still hoists to function scope and can be re-declared accidentally. Use `let` or `const` consistently. Also, `cursors` is only used in `Platformer.js` — there's no reason for it to be global. It should be `this.cursors` on the scene instance, like you do with `this.rKey`, `this.aKey`, etc.

**Magic numbers throughout.** Values like `game.config.width / 5.2` (`Platformer.js:94`), `game.config.height / 4.7` (`Platformer.js:98`), `128` (font size), `3` (coin icon scale) are scattered inline. These make the UI layout very hard to tune and impossible to understand on re-reading. Extract them into named constants or a UI layout config object:

```js
const UI = {
    score: { x: W * 0.19, y: H * 0.18, fontSize: 128, scale: 0.5 },
    coinIcon: { x: W * 0.18, y: H * 0.21, scale: 3 },
};
```

**Duplicate left/right movement logic.** `Platformer.js:481-516` has nearly identical blocks for left and right movement — the only differences are the sign of acceleration, the flip direction, and the particle velocity sign. This is the #1 place where a loop or extracted function would reduce duplication and bugs:

```js
const direction = (this.aKey.isDown || cursors.left.isDown) ? -1
                 : (this.dKey.isDown || cursors.right.isDown) ? 1
                 : 0;

if (direction !== 0) {
    my.sprite.player.setAccelerationX(direction * this.ACCELERATION);
    if (direction < 0) my.sprite.player.resetFlip();
    else my.sprite.player.setFlip(true, false);

    my.sprite.player.anims.play('walk', true);
    my.vfx.walking.startFollow(my.sprite.player, ...);
    my.vfx.walking.setParticleSpeed(direction * this.PARTICLE_VELOCITY, 0);

    if (my.sprite.player.body.blocked.down) {
        my.vfx.walking.start();
        if (this.time.now > this.lastStepTime + this.stepDelay) {
            this.playFootstep();
            this.lastStepTime = this.time.now;
        }
    }
} else {
    // idle
}
```

This reduces ~30 lines to ~15 and makes it impossible for a bug to exist in one direction but not the other.

**`console.log` calls left in production code.** `Platformer.js:48-51` and `Level2.js:14` have debug logs. These should be removed or gated behind a debug flag before submission.

---

## 3. Modularity, Functions & Classes

### What's working well
- The `Platformer` base class with overridable `setupMap()`, `setupObjects()`, `setupVFX()`, and `onLevelComplete()` is a clean template-method pattern. `Level1` and `Level2` extend it with only the level-specific details — this is well-structured.
- Breaking `create()` into focused `setup*()` methods makes the initialization sequence readable.
- `createBubbleEmitter()` is a good factory method for the water VFX.

### Issues to address

**`createButton()` is copy-pasted across four scenes** (`StartScreen`, `Controls`, `PauseMenu`, `Settings`). This is the biggest modularity issue in the project. All four implementations are identical. Extract it into a shared base class or a utility mixin:

```js
class UIScene extends Phaser.Scene {
    createButton(x, y, label, callback) {
        // ... the shared implementation
    }
}

class StartScreen extends UIScene { ... }
class Controls extends UIScene { ... }
class PauseMenu extends UIScene { ... }
class Settings extends UIScene { ... }
```

This is the exact same inheritance technique you already used for `Platformer` → `Level1`/`Level2`. Apply it here too.

**The global `my` object is a fragile communication mechanism.** `main.js:47-52` defines `my` as a global bag for sprites, text, VFX, settings, and score. This works for a small project but has problems:
- It's unclear *which scenes* read vs. write each property.
- `my.score`, `my.savedScore`, and `my.scoreCarryOver` form an ad-hoc state machine for score persistence that's hard to follow. The logic in `setupUI()` at `Platformer.js:80-87` reads like it was patched multiple times.
- `my.vfx.water` is sometimes a single emitter and sometimes an array — `startWaterVFX()`/`stopWaterVFX()` at `Platformer.js:332-346` must check `Array.isArray()` to handle both cases.

A cleaner approach for score: pass data explicitly between scenes using Phaser's `Scene.start(key, data)`:

```js
// Level transition:
this.scene.start('platformerScene2', { score: this.score });

// In the next scene's init():
init(data) {
    this.score = data.score || 0;
}
```

This eliminates `my.savedScore`, `my.scoreCarryOver`, and the confusing conditional in `setupUI()`.

For `my.vfx.water`, always store it as an array (even a single-element one) so you don't need the `Array.isArray` check:

```js
my.vfx.water = [this.createBubbleEmitter(xMin, xMax)];
// Then startWaterVFX is always:
my.vfx.water.forEach(e => e.start());
```

**`Level1` and `Level2` are near-identical.** Their `setupMap()` implementations are copy-pasted with only the tilemap key differing. Consider parameterizing this:

```js
class Level1 extends Platformer {
    constructor() {
        super("platformerScene");
        this.mapKey = "platformer-level-1";
        this.waterConfigs = [
            { x: 2150, barrierY: 1080, zoneY: 1000, width: 380, height: 120 }
        ];
        this.bubbleConfigs = [{ xMin: 2000, xMax: 2300 }];
    }

    setupMap() {
        this.map = this.add.tilemap(this.mapKey, 18, 18, 45, 25);
        // ... shared setup
    }
}
```

Even if you keep the two classes (which is fine for level-specific overrides), extracting the shared map-setup logic into a method on `Platformer` that takes a key parameter would eliminate the duplication.

---

## 4. Variables & Data Structures for the Game World

### What's working well
- Using Tiled object layers for coin, flag, and spike placement (`Platformer.js:125-158`) is the right approach — data-driven level design is a professional pattern.
- `this.playerStart = { x, y }` is a clean, explicit data structure for spawn points.
- The water zone config objects in `Level1`/`Level2` (`setupWaterZones` calls) are well-structured.

### Issues to address

**Object scale+position loop is duplicated three times.** At `Platformer.js:128-132`, `140-144`, and `152-156`, the same pattern is repeated for coins, flags, and spikes:

```js
this.things.forEach((thing) => {
    thing.setScale(this.SCALE);
    thing.x *= this.SCALE;
    thing.y *= this.SCALE;
});
this.physics.world.enable(this.things, Phaser.Physics.Arcade.STATIC_BODY);
this.thingGroup = this.add.group(this.things);
```

This is a perfect candidate for a helper that takes an object name, key, and frame and returns the group:

```js
createObjectGroup(objectName, key, frame) {
    const objects = this.map.createFromObjects("Objects", { name: objectName, key, frame });
    objects.forEach(obj => { obj.setScale(this.SCALE); obj.x *= this.SCALE; obj.y *= this.SCALE; });
    this.physics.world.enable(objects, Phaser.Physics.Arcade.STATIC_BODY);
    return this.add.group(objects);
}

// Then in setupObjects:
this.coinGroup = this.createObjectGroup("coin", "tilemap_sheet", 151);
this.flagGroup = this.createObjectGroup("flag", "tilemap_sheet", 111);
this.spikeGroup = this.createObjectGroup("spike", "tilemap_sheet", 68);
```

This reduces ~30 lines to ~6 and makes adding new object types trivial.

**Hard-coded water zone coordinates.** `Level1.js:24` and `Level2.js:25` have pixel-precise positions baked into code. If you resize or rearrange the level in Tiled, you have to manually update these numbers. A more robust approach: place invisible "water" objects in Tiled's object layer (like you do for coins/flags/spikes) and read their positions from the map data at runtime. This keeps level layout in the level editor where it belongs.

**`my.sprite.player` is accessed globally but only exists after `setupPlayer()`.** If any code in `setupObjects()` or elsewhere tried to reference `my.sprite.player` before `setupPlayer()` runs, you'd get a silent `undefined` error. Consider storing the player as `this.player` (scene-local) rather than in the global `my` object. The player only needs to be referenced within `Platformer` and its subclasses, not across unrelated scenes.

---

## 5. Visual Effects, Particles & Sound

### What's working well
- Walking particle emitter that follows the player with directional speed is a nice touch — it communicates movement direction visually.
- Bubble particle emitters for water zones add atmosphere.
- Footstep and water sound variety (randomized from arrays) avoids the "machine gun" effect of identical repeated sounds — this is a professional audio technique.
- Parallax cloud scrolling (`Platformer.js:467`) adds depth.
- `Phaser.Utils.Array.GetRandom()` for sound selection is the idiomatic way to do this in Phaser.

### Issues to address

**No jump VFX.** The walking emitter emits dust when grounded, but jumping has no visual feedback at all. A small dust puff at the player's feet on takeoff and a landing impact particle on touchdown would make the jump feel weighty and satisfying. This is one of the highest-impact VFX additions you can make in a platformer:

```js
// On jump:
if (JustDown(cursors.space)) {
    my.sprite.player.body.setVelocityY(this.JUMP_VELOCITY);
    this.playJump();
    // Jump dust puff at player's feet
    my.vfx.jumpDust.emitParticleAt(my.sprite.player.x, my.sprite.player.y + my.sprite.player.displayHeight/2);
}
```

**No coin collection particle burst.** When coins are collected, they just vanish. A small sparkle or confetti burst at the coin's position would make collection feel rewarding.

**No screen shake on death.** The player falls off-screen and the scene restarts with no visual punctuation. A camera shake (`this.cameras.main.shake(200, 0.01)`) before restarting adds impact.

**The placeholder water emitter pattern is a code smell.** `Platformer.js:303-305` creates a dummy `my.vfx.water` emitter that is immediately destroyed and replaced by `Level1`/`Level2`. This "create-then-destroy" pattern exists only so `update()` doesn't crash on `my.vfx.water` being undefined. Instead, simply check for existence:

```js
// In startWaterVFX/stopWaterVFX:
if (!my.vfx.water) return;
// ... rest of logic
```

And don't create the placeholder at all. This is cleaner and avoids the wasted particle emitter creation.

**Water VFX hardcoded Y range.** `Platformer.js:316` hardcodes `y: { min: 1200, max: 900 }` in `createBubbleEmitter`. This only works for your current level layout. Pass the Y range as parameters (like you do for X) so different water zones at different heights can have correctly positioned bubbles.

**Jump and coin sounds are single samples with no variation.** You invested in variety for footsteps (4 variants) and water (4 variants), but jump and coin are single audio files played identically every time. Even 2-3 variants for each would reduce listener fatigue. You could also add slight random pitch variation:

```js
playJump() {
    this.sound.play('jump', { rate: 0.9 + Math.random() * 0.2 }); // 0.9-1.1x pitch
}
```

**No background music or ambient soundscape.** The game world is silent between interactions. Even a simple ambient loop (wind, birds, water) would make the forest setting feel alive.

**WinScene has no celebration feedback.** `WinScene.js` displays text and a button but no particles, animations, or sound. A firework particle burst and a victory jingle would make completing the game feel like an achievement.

---

## Summary of Highest-Impact Improvements

| Priority | Change | Category |
|----------|--------|----------|
| **1** | Extract `createButton()` into a shared `UIScene` base class | Modularity |
| **2** | Extract `createObjectGroup()` helper to eliminate 3× duplicated object setup | Data structures |
| **3** | Unify left/right movement into a single direction-based block | JS idioms |
| **4** | Use `Scene.start(key, data)` for score passing instead of global `my` | Modularity |
| **5** | Change player gravity instead of world gravity for water physics | Physics |
| **6** | Add jump dust + landing impact particles | VFX |
| **7** | Add screen shake on death, coin collection sparkle | VFX |
| **8** | Remove `var cursors` global; use `this.cursors` | JS idioms |
| **9** | Move water zone positions into Tiled object layers | Data structures |
| **10** | Add pitch variation or alternate samples for jump/coin sounds | Sound |

Each of these is a small, focused change. Together they would significantly raise the quality bar of the codebase and the player experience.
