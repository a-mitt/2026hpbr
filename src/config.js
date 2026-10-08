import Phaser from "phaser";
import { BirthdayScene } from "./scenes/BirthdayScene.js";
import { DialogScene } from "./scenes/DialogScene.js";
import { FieldScene } from "./scenes/FieldScene.js";
import { HudScene } from "./scenes/HudScene.js";
import { IntroScene } from "./scenes/IntroScene.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants.js";

export const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#18282b",
  transparent: true,
  scene: [IntroScene, BirthdayScene, FieldScene, HudScene, DialogScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};