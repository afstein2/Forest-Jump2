# Forest Jump — Game Design Document

## 1. Game Overview

**Genre:** 2D side-scrolling platformer
**Title:** Forest Jump
**Perspective:** Side view, camera follows the player horizontally
**Objective:** Navigate two platforming levels from left to right, collect coins for score, avoid spikes, and reach the flag at the end of each level.
**Game completion:** Reaching the flag on Level 2 triggers a win screen. There is no fail state beyond restarting the current level — the player respawns at the level start on death.

---

## 2. Screen & Rendering Configuration

| Property | Value |
|---|---|
| Canvas width | 1920 px |
| Canvas height | 944 px |
| Scale mode | FIT (canvas scales to fit the browser window) |
| Auto-center | CENTER_BOTH |
| Renderer | CANVAS with pixelArt: true (nearest-neighbor scaling) |
| Background color | #73bde2 (sky blue) |

---

## 3. Player Avatar

### 3.1 Visuals

The player is a small humanoid character rendered from a texture atlas.

| Property | Value |
|---|---|
| Atlas key | `platformer_characters` |
| Atlas image | `tilemap-characters-packed.png` |
| Atlas data | `tilemap-characters-packed.json` |
| Idle frame | `tile_0000.png` |
| Walk animation | `tile_0000.png` → `tile_0001.png` (2 frames, 15 fps, looping) |
| Jump frame | `tile_0001.png` (single frame, no loop) |
| Display scale | 1.5× (all sprites in the game world are scaled by the global SCALE factor) |
| Flip behavior | Moving right: flip X = true. Moving left: flip X = false (reset). |

### 3.2 Movement Physics

All physics values assume Phaser Arcade Physics with a fixed timestep.

| Parameter | Value | Notes |
|---|---|---|
| Horizontal acceleration | 400 px/s² | Applied while left/right key is held |
| Horizontal drag (deceleration) | 500 px/s | Applied when no directional key is held |
| Jump velocity | -700 px/s (upward) | Instantaneous setVelocityY; only allowed when `body.blocked.down` is true |
| Normal gravity | 1500 px/s² | Applied to the physics world when the player is NOT in water |
| Water gravity | 400 px/s² | Applied to the physics world when the player IS in water |
| World bounds collision | Disabled (false) | Falling out of bounds is handled manually in the update loop |
| TILE_BIAS | 32 | Collision bias value to prevent tunneling through thin tile geometry |

**Movement feel:** Because drag (500) exceeds acceleration (400), releasing the directional key decelerates the player faster than acceleration builds speed. This produces a responsive, "snappy" stop rather than an icy slide.

**Jump input:** Only `JustDown` (single-press) triggers a jump — holding the key does not produce repeated jumps. Both Space and Up Arrow are mapped to jump.

### 3.3 Spawn Position

Both levels place the player at:

| Property | Value |
|---|---|
| X | Game width / 4 (480 px at 1920 width) |
| Y | 930 px |

---

## 4. Level Structure

### 4.1 Tilemap Specification

Both levels share the same tilemap structure:

| Property | Value |
|---|---|
| Tile width | 18 px |
| Tile height | 18 px |
| Level width | 120 tiles |
| Level height | 40 tiles |
| Pixel dimensions (pre-scale) | 2160 × 720 px |
| Pixel dimensions (post-scale ×1.5) | 3240 × 1080 px |
| Ground layer name | `Ground-n-Platforms` |
| Object layer name | `Objects` |
| Tileset name (in Tiled) | `kenny_tilemap_packed` |

### 4.2 Tileset

| Property | Value |
|---|---|
| Image file | `tilemap_packed.png` |
| Image dimensions | 360 × 162 px |
| Columns | 20 |
| Total tiles | 180 |
| Tile size | 18 × 18 px |
| Margin | 0 |
| Spacing | 0 |

**Collision tiles:** Tiles with the custom Tiled property `collides: true` are collidable. The following tile IDs (0-indexed in Tiled, +1 for GID) are marked as colliding:

0, 1, 2, 3, 20, 21, 22, 23, 29, 40, 41, 42, 43, 47, 48, 49, 50, 60, 61, 62, 63, 80, 81, 82, 83, 100, 101, 102, 103, 120, 121, 122, 123, 140, 141, 142, 143, 153, 154, 155

Tile ID 151 has the property `collectible: true` (but is not used as a colliding tile — it is the coin tile in the spritesheet).

### 4.3 Level 1

| Property | Value |
|---|---|
| Tilemap file | `platformer-level-1.tmj` |
| Tilemap key | `platformer-level-1` |
| Scene key | `platformerScene` |
| Coins | 8 |
| Flags | 1 (end of level) |
| Spikes | 20 (two clusters: 1 cluster of 2 near x:918–954, 1 cluster of 18 spanning x:1080–1188) |
| Water zones | 1 |
| Flag position | x:1998, y:630 (Tiled object coordinates, pre-scale) |
| Next scene | `platformerScene2` (Level 2) |

**Water zone 1:** x:2150, barrierY:1080, zoneY:1000, width:380, height:120

### 4.4 Level 2

| Property | Value |
|---|---|
| Tilemap file | `platformer-level-2.tmj` |
| Tilemap key | `platformer-level-2` |
| Scene key | `platformerScene2` |
| Coins | 11 |
| Flags | 1 (end of level) |
| Spikes | 2 (near x:522 and x:558) |
| Water zones | 2 |
| Flag position | x:1946, y:630 (Tiled object coordinates, pre-scale) |
| Next scene | `winScene` |

**Water zones:**
- Zone 1: x:1550, barrierY:1080, zoneY:1000, width:380, height:120
- Zone 2: x:2150, barrierY:1080, zoneY:1000, width:380, height:120

Level 2 features gaps in the ground layer (visible as 0-tile entries in the tile data) that create pit hazards, as well as one-way connections between ground segments via pipe tiles (tile IDs 133–135, 94–96, 116). The level also features a longer horizontal span with more varied platforming than Level 1.

---

## 5. Game Objects

All game objects are placed in Tiled's **Objects** object layer and loaded at runtime via `createFromObjects`. They are rendered as static physics bodies using the `tilemap_sheet` spritesheet (same image as the tileset but loaded as a spritesheet with 18×18 frame size).

### 5.1 Coins

| Property | Value |
|---|---|
| Object name (in Tiled) | `coin` |
| Spritesheet key | `tilemap_sheet` |
| Frame index | 151 (0-indexed) |
| Physics body type | STATIC_BODY |
| Collision type | Overlap (not collider — player passes through) |
| Effect on contact | +1 to score, coin is destroyed, coin sound plays |
| Scale | 1.5× (all objects are scaled and their positions multiplied by SCALE) |

### 5.2 Flags (Level Exit)

| Property | Value |
|---|---|
| Object name (in Tiled) | `flag` |
| Spritesheet key | `tilemap_sheet` |
| Frame index | 111 (0-indexed) |
| Physics body type | STATIC_BODY |
| Collision type | Overlap |
| Effect on contact | Saves current score, transitions to next level |
| Scale | 1.5× |

### 5.3 Spikes (Hazards)

| Property | Value |
|---|---|
| Object name (in Tiled) | `spike` |
| Spritesheet key | `tilemap_sheet` |
| Frame index | 68 (0-indexed) |
| Physics body type | STATIC_BODY |
| Collision type | Overlap |
| Effect on contact | Player dies: score resets to the saved score from level start, current scene restarts, death sound plays |
| Scale | 1.5× |

---

## 6. Water Zones

Water zones are not placed in Tiled — they are defined programmatically with hard-coded coordinates per level. Each water zone consists of two invisible physics bodies:

### 6.1 Water Zone Config (per zone)

| Parameter | Description |
|---|---|
| `x` | Center X position of the zone (px, pre-scale) |
| `barrierY` | Y position of the invisible solid barrier that prevents the player from falling through the water surface (px, pre-scale) |
| `zoneY` | Y position of the overlap-detection zone (px, pre-scale) |
| `width` | Horizontal extent of the zone (px, pre-scale) |
| `height` | Vertical extent of the overlap zone (px, pre-scale) |

### 6.2 Barrier Body Properties

| Property | Value |
|---|---|
| Width | Same as zone width |
| Height | 10 px |
| Allow gravity | false |
| Immovable | true |
| Moves | false |
| Collision type | Collider (solid — player stands on it) |

### 6.3 Zone Body Properties (Overlap Detection)

| Property | Value |
|---|---|
| Allow gravity | false |
| Immovable | true |
| Moves | false |
| Collision type | Overlap (non-solid — used only to detect when the player is "in water") |

### 6.4 Water Physics Effects

When the player overlaps a water zone:

| State | Gravity | VFX | Sound |
|---|---|---|---|
| Entering water | 400 px/s² | Bubble particles start | One random water splash sound |
| In water | 400 px/s² | Bubbles continue | — |
| Exiting water | 1500 px/s² (normal) | Bubble particles stop | — |

The gravity change is applied globally to the physics world (`physics.world.gravity.y`), which affects the player's fall speed dramatically. In water the player falls at ~27% of normal gravity, producing a slow-falling, swimming-like feel.

Jump is still available in water using the same key and velocity, but the reduced gravity means the player rises much higher and descends much slower.

---

## 7. Death & Respawn

The player dies and the level restarts under two conditions:

1. **Spike contact:** Any overlap with a spike object triggers an immediate scene restart. Score is reset to the saved score (the score the player had at the start of the current level).

2. **Falling out of bounds:** If the player's Y position exceeds `physics.world.bounds.height + 200` (200 px below the bottom of the world), the level restarts with the same score reset behavior.

On death: the death sound plays and `scene.restart()` is called in the same frame.

---

## 8. Score System

| Rule | Detail |
|---|---|
| Starting score | 0 (fresh game) or the score carried from the previous level |
| Coin value | 1 point per coin |
| Score on death | Resets to the score saved at the start of the current level |
| Score on level transition | The current score is saved and carried forward to the next level |
| Score on "Play Again" (win screen) | Resets to 0 |

---

## 9. Camera

| Property | Value |
|---|---|
| Follow target | Player sprite |
| Lerp (X, Y) | 0.25, 0.25 (smooth following) |
| Deadzone | 50 × 50 px (player can move within this box before camera scrolls) |
| Zoom | 1.5× (same as SCALE) |
| Bounds | (0, 0) to (map.widthInPixels × SCALE, map.heightInPixels × SCALE) |

---

## 10. Visual Effects

### 10.1 Walking Dust Particles

| Property | Value |
|---|---|
| Atlas key | `kenny-particles` (multi-atlas) |
| Frames | `smoke_03.png`, `smoke_09.png` (randomly selected) |
| Scale | Start: 0.03, End: 0.1 |
| Max alive particles | 8 |
| Lifespan | 350 ms |
| Gravity Y | -400 (particles float upward) |
| Alpha | Start: 1.0, End: 0.1 |
| Speed X | ±50 px/s (direction matches player movement direction) |
| Follow target | Player sprite, offset: (displayWidth/2 - 10, displayHeight/2 - 5) |
| Activation | Only while player is grounded and moving; stops when idle or airborne |

### 10.2 Water Bubble Particles

| Property | Value |
|---|---|
| Atlas key | `kenny-particles` |
| Frame | `bubble_01.png` |
| X range | Configured per zone (e.g., 2000–2300 for Level 1's zone) |
| Y range | min: 1200, max: 900 (pre-scale pixel coordinates) |
| Lifespan | 1200 ms |
| Speed Y | -80 to -40 px/s (upward) |
| Speed X | -10 to 10 px/s |
| Scale | Start: 0.08, End: 0 |
| Alpha | Start: 0.8, End: 0 |
| Quantity | 1 per emission |
| Frequency | 120 ms between emissions |
| Blend mode | ADD |
| Default state | Not emitting; starts when player enters water |

### 10.3 Cloud Parallax Background

| Property | Value |
|---|---|
| Image key | `clouds` |
| Source file | `Textures/clouds_small.png` |
| Render type | TileSprite (repeating) |
| Position | (0, -scale.height × 0.5) |
| Size | (scale.width, scale.height × 0.89) |
| Scroll factor | 0 (stays fixed on screen) |
| Tile scale | X: 0.4, Y: 0.4 |
| Parallax rate | tilePositionX = camera.scrollX × 0.1 (scrolls at 10% of camera speed) |

---

## 11. Audio

### 11.1 Sound Assets

| Key | File | Type | Volume |
|---|---|---|---|
| `jump` | `Audio/Jump1.mp3` | MP3 | 1.0 (default) |
| `coin` | `Audio/Coin.mp3` | MP3 | 1.0 (default) |
| `death` | `Audio/impactPunch_medium_002.ogg` | OGG | 1.0 (default) |
| `walk1` | `Audio/footstep_grass_000.ogg` | OGG | 0.4 |
| `walk2` | `Audio/footstep_grass_001.ogg` | OGG | 0.4 |
| `walk3` | `Audio/footstep_grass_002.ogg` | OGG | 0.4 |
| `walk4` | `Audio/footstep_grass_003.ogg` | OGG | 0.4 |
| `water1` | `Audio/water_splosh_movement_higher_pitched_008.mp3` | MP3 | 0.4 |
| `water2` | `Audio/water_splosh_movement_higher_pitched_009.mp3` | MP3 | 0.4 |
| `water3` | `Audio/water_splosh_movement_lower_pitched_002.mp3` | MP3 | 0.4 |
| `water4` | `Audio/water_splosh_movement_lower_pitched_003.mp3` | MP3 | 0.4 |

### 11.2 Sound Playback Rules

| Sound | Trigger | Selection |
|---|---|---|
| Jump | Player presses jump while grounded | Single sample |
| Coin collect | Player overlaps a coin | Single sample |
| Death | Player touches spike or falls out of bounds | Single sample |
| Footstep | Player is grounded and moving; throttled to 250 ms between steps | Random from walk1–walk4 |
| Water splash | Player enters a water zone (transition from not-in-water to in-water) | Random from water1–water4 |

---

## 12. UI

### 12.1 In-Game HUD

Elements are fixed to the screen (scrollFactor = 0) and drawn above all game objects (high depth values).

| Element | Position | Style | Depth |
|---|---|---|---|
| Score number | (game.width / 5.2, game.height / 5.5) | 128px white, scaled to 0.5× | 100 |
| Coin icon | (game.width / 5.5, game.height / 4.7) | Image `coin_icon` (`Textures/Coin.png`), scale 3× | 1000 |
| FPS counter (optional) | (game.width / 1.3, game.height / 5.5) | 48px white, scaled to 0.5× | 200 |

The FPS counter only appears if the player enabled it in the Settings screen.

### 12.2 Controls Text

| Key | Action |
|---|---|
| A / Left Arrow | Move left |
| D / Right Arrow | Move right |
| Space / Up Arrow | Jump (single press only) |
| P | Pause |
| R | Restart current level |
| O | Toggle physics debug rendering |
| F | Toggle fullscreen (from pause menu only) |

---

## 13. Scene Flow

```
StartScreen ──[Play]──→ Load ──→ Level1 ──[flag]──→ Level2 ──[flag]──→ WinScene
     │                     │                                       │
     ├──[Controls]──→ Controls ──[Back]──→ StartScreen             │
     │                                                            │
     ├──[Settings]──→ Settings ──[Back]──→ StartScreen            │
     │                                                            │
     └────────────────────────────────────────────────[Play Again]┘

Level1 ──[P]──→ PauseMenu ──[P]──→ resume Level
                PauseMenu ──[R]──→ restart Level
                PauseMenu ──[Main Menu]──→ StartScreen
```

### 13.1 Start Screen

Three buttons: **Play**, **Controls**, **Settings**. Title text "Forest Jump". Background color: #73bde2.

### 13.2 Controls Screen

Displays key bindings in a panel. Back button returns to Start Screen.

### 13.3 Settings Screen

Two checkboxes:
- **Show FPS** — toggles the in-game FPS counter
- **Fullscreen** — toggles browser fullscreen mode

Back button returns to Start Screen.

### 13.4 Pause Menu

Overlays a dim (60% opacity black) rectangle on top of the paused gameplay scene. Three interactions:
- **P key** — Resumes the gameplay scene and closes the pause menu
- **R key** — Restarts the gameplay scene from the beginning
- **F key** — Toggles fullscreen

Two buttons:
- **Restart Level** — Restarts the current level scene
- **Main Menu** — Stops both the pause and gameplay scenes, returns to Start Screen

### 13.5 Win Scene

Displays "You Finished!" text and a "Play Again" button. Clicking "Play Again" resets score to 0 and returns to the Start Screen.

### 13.6 Load Scene

Preloads all assets (images, tilemaps, spritesheets, audio, atlases) and defines the three player animations (walk, idle, jump). Transitions immediately to Level 1 on completion.

---

## 14. Button UI Component

All menus (Start, Controls, Pause, Settings, Win) use a consistent button style:

| Property | Value |
|---|---|
| Width | 250 px |
| Height | 60 px |
| Corner radius | 20 px |
| Default fill | Black at 50% alpha |
| Hover fill | White at 30% alpha |
| Label font size | 28px white (grows to 30px on hover) |
| Hit area | Invisible rectangle on top of the graphics, same size, interactive |

---

## 15. Asset Reference

### 15.1 Required Asset Files

All paths are relative to the `assets/` directory, which is set as the loader base path.

| Loader key | Type | File path |
|---|---|---|
| `platformer_characters` | Atlas (atlas) | `tilemap-characters-packed.png` + `tilemap-characters-packed.json` |
| `tilemap_tiles` | Image | `tilemap_packed.png` |
| `bgmap_tiles` | Image | `foliagePack_vector.svg` |
| `platformer-level-1` | Tilemap JSON | `platformer-level-1.tmj` |
| `platformer-level-2` | Tilemap JSON | `platformer-level-2.tmj` |
| `coin_icon` | Image | `Textures/Coin.png` |
| `clouds` | Image | `Textures/clouds_small.png` |
| `tilemap_sheet` | Spritesheet (18×18) | `tilemap_packed.png` |
| `kenny-particles` | Multi-atlas | `kenny-particles.json` (references kenny-particles-0.png through kenny-particles-4.png) |

### 15.2 Audio Files

| Key | Path |
|---|---|
| `jump` | `Audio/Jump1.mp3` |
| `coin` | `Audio/Coin.mp3` |
| `death` | `Audio/impactPunch_medium_002.ogg` |
| `walk1` | `Audio/footstep_grass_000.ogg` |
| `walk2` | `Audio/footstep_grass_001.ogg` |
| `walk3` | `Audio/footstep_grass_002.ogg` |
| `walk4` | `Audio/footstep_grass_003.ogg` |
| `water1` | `Audio/water_splosh_movement_higher_pitched_008.mp3` |
| `water2` | `Audio/water_splosh_movement_higher_pitched_009.mp3` |
| `water3` | `Audio/water_splosh_movement_lower_pitched_002.mp3` |
| `water4` | `Audio/water_splosh_movement_lower_pitched_003.mp3` |

### 15.3 Player Atlas Frames Used

The player atlas (`tilemap-characters-packed.json`) contains 27 frames, but only 2 are used by the player:

| Frame name | Usage |
|---|---|
| `tile_0000.png` | Idle pose and first frame of walk animation |
| `tile_0001.png` | Jump pose and second frame of walk animation |

### 15.4 Particle Atlas Frames Used

The particle multi-atlas (`kenny-particles.json`) contains many frames across 5 texture pages. Only these are used:

| Frame name | Usage |
|---|---|
| `smoke_03.png` | Walking dust particles |
| `smoke_09.png` | Walking dust particles |
| `bubble_01.png` | Water bubble particles |

### 15.5 Tiled Tileset Properties

The tileset `kenny_tilemap_packed` defines two custom boolean properties on tiles:
- **`collides`** (bool): If true, the tile is a solid collision surface. Used by `setCollisionByProperty({ collides: true })`.
- **`collectible`** (bool): If true, the tile is a collectible (currently informational only — actual collectibles are placed as Tiled objects).

### 15.6 Tiled Object GID Mapping

Objects in the `Objects` layer use global IDs (GID) that are 1-indexed relative to the tileset. The game code uses 0-indexed frame numbers:

| Object name | GID in Tiled | Frame used in code | Description |
|---|---|---|---|
| `coin` | 152 | 151 | Gold coin tile |
| `flag` | 112 | 111 | Red flag on pole |
| `spike` | 69 | 68 | Metal spike hazard |

---

## 16. Global Scale Factor

A single `SCALE = 1.5` multiplier is applied uniformly to:

- The ground tile layer (`setScale(SCALE)`)
- All Tiled objects (coins, flags, spikes) — both their display scale and their X/Y positions are multiplied by SCALE
- The player sprite (`setScale(SCALE)`)
- The camera bounds (`map.widthInPixels * SCALE`, `map.heightInPixels * SCALE`)
- The camera zoom (`setZoom(SCALE)`)
- The physics world bounds

This means all Tiled coordinates in the level files must be multiplied by 1.5 at runtime to produce the final world positions.
