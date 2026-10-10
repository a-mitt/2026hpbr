import Phaser from "phaser";
import { BirthdayScene } from "./scenes/BirthdayScene.js";
import { DialogScene } from "./scenes/DialogScene.js";
import { EndingScene } from "./scenes/EndingScene.js";
import { ExitPromptScene } from "./scenes/ExitPromptScene.js";
import { FieldScene } from "./scenes/FieldScene.js";
import { HudScene } from "./scenes/HudScene.js";
import { IntroScene } from "./scenes/IntroScene.js";
import { GAME_HEIGHT, GAME_WIDTH } from "./constants.js";

// 文字は、特に指定がなければ高めの解像度で描く（拡大して表示してもくっきり）
const TEXT_RESOLUTION = Math.min(3, Math.max(2, Math.ceil(window.devicePixelRatio || 1)));
const createText = Phaser.GameObjects.GameObjectFactory.prototype.text;
Phaser.GameObjects.GameObjectFactory.prototype.text = function text(x, y, content, style) {
  return createText.call(this, x, y, content, { resolution: TEXT_RESOLUTION, ...style });
};

export const gameConfig = {
  type: Phaser.AUTO,
  width: GAME_WIDTH,
  height: GAME_HEIGHT,
  parent: "game-container",
  backgroundColor: "#18282b",
  transparent: true,
  scene: [IntroScene, BirthdayScene, FieldScene, HudScene, DialogScene, ExitPromptScene, EndingScene],
  scale: {
    mode: Phaser.Scale.FIT,
    autoCenter: Phaser.Scale.CENTER_BOTH,
  },
};