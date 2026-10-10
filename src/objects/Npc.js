import { FONTS } from "../theme.js";
import { CHARACTER_SCALE, FOOT_OFFSET } from "../constants.js";
import { npcSprites } from "../data/npcs.js";
import {
  FOOT_LOCAL_Y,
  HEAD_LOCAL_Y,
  addCharacterSprite,
  artToLocalY,
  makeCharacterInteractive,
} from "./characterArt.js";
import Phaser from "phaser";
import { displayName } from "../systems/i18n.js";

// 文字は大きめの解像度で描いておくと、拡大・縮小されても荒れない
const TEXT_RESOLUTION = 3;
const GHOST_FRAME_MS = 450;
// 頭の上の「!」も押せるように、クリック範囲を上に広げる高さ（コンテナ内の座標）
const MARK_HIT_EXTRA = 26;

export class Npc extends Phaser.GameObjects.Container {
  constructor(scene, npcData) {
    const frames = npcSprites[npcData.id];
    // 浮いているエクボ（絵が2枚）は、絵の上半分にいるので、名前と「!」もそこに合わせる
    const floating = frames.length > 1;
    const labelY = floating ? artToLocalY(108) : FOOT_LOCAL_Y;
    const headY = floating ? artToLocalY(14) : HEAD_LOCAL_Y;
    const sprite = addCharacterSprite(scene, frames[0]);
    const parts = [
      sprite,
      scene.add.text(0, labelY, displayName(npcData.name), {
        color: "#fff0d6",
        fontFamily: FONTS.body,
        fontSize: "20px",
        stroke: "#26343a",
        strokeThickness: 5,
        resolution: TEXT_RESOLUTION,
        // コンテナの拡大を打ち消して、文字は等倍のままくっきり描く
      }).setOrigin(0.5, 0).setScale(1 / CHARACTER_SCALE),
      scene.add.text(0, headY - 8, "!", {
        color: "#ffe27a",
        fontFamily: FONTS.body,
        fontSize: "30px",
        stroke: "#26343a",
        strokeThickness: 4,
        resolution: TEXT_RESOLUTION,
      }).setOrigin(0.5).setVisible(false),
    ];

    super(scene, npcData.x, npcData.y, parts);
    this.applyHitArea(floating);
    this.headY = headY;
    this.setScale(CHARACTER_SCALE);
    this.id = npcData.id;
    this.name = npcData.name;
    this.dialogueId = npcData.id;
    this.color = npcData.color;
    this.sprite = sprite;
    this.label = parts[1];
    this.frames = frames;
    this.setDepth(npcData.y + FOOT_OFFSET);
    scene.add.existing(this);
    scene.cursorManager.bind(this, "talk", () => {
      if (this.talkAvailable) {
        scene.startConversation(this);
      } else {
        scene.hintFar(this.x, this.y + this.headY * CHARACTER_SCALE);
      }
    });

    this.talkIndicator = parts[parts.length - 1];
    this.talkAvailable = false;
    this.startIndicatorTween(headY);

    // 絵が2枚以上（エクボの幽霊）のときは、交互に切り替えてふわふわさせる
    if (frames.length > 1) {
      this.frameIndex = 0;
      this.frameTimer = scene.time.addEvent({
        delay: GHOST_FRAME_MS,
        loop: true,
        callback: () => {
          this.frameIndex = (this.frameIndex + 1) % this.frames.length;
          this.sprite.setTexture(this.frames[this.frameIndex]);
        },
      });
      this.bobTween = scene.tweens.add({
        targets: sprite,
        y: sprite.y - 6,
        duration: 900,
        yoyo: true,
        repeat: -1,
        ease: "Sine.easeInOut",
      });
    }
  }

  startIndicatorTween(headY) {
    this.indicatorTween?.remove();
    this.talkIndicator.setY(headY - 8);
    this.indicatorTween = this.scene.tweens.add({
      targets: this.talkIndicator,
      y: headY - 16,
      duration: 360,
      yoyo: true,
      repeat: -1,
      paused: !this.talkAvailable,
      ease: "Sine.easeInOut",
    });
  }

  // 絵を差し替える（守衛エクボなど）。null で元の絵（エクボは浮いている幽霊）に戻す。
  // floating＝絵が浮いていて、キャラが絵の上半分にいる（名前・「!」・クリック範囲をそこに合わせる）
  setSkin(textureKey, floating = false) {
    const ghost = this.frames.length > 1;
    const showFrames = textureKey === null;
    const isFloating = showFrames ? ghost : floating;
    if (this.frameTimer) {
      this.frameTimer.paused = !showFrames;
    }
    if (this.bobTween) {
      if (showFrames) {
        this.bobTween.resume();
      } else {
        this.bobTween.pause();
        this.sprite.setY(FOOT_LOCAL_Y);
      }
    }
    this.sprite.setTexture(showFrames ? this.frames[this.frameIndex ?? 0] : textureKey);

    this.label.setY(isFloating ? artToLocalY(108) : FOOT_LOCAL_Y);
    this.startIndicatorTween(isFloating ? artToLocalY(14) : HEAD_LOCAL_Y);
    this.applyHitArea(isFloating);
  }

  // クリック範囲（頭の上の「!」も含める）
  applyHitArea(floating) {
    if (floating) {
      makeCharacterInteractive(this, 10, 110, MARK_HIT_EXTRA);
    } else {
      makeCharacterInteractive(this, 0, 200, MARK_HIT_EXTRA);
    }
  }

  setTalkAvailable(isAvailable) {
    if (this.talkAvailable === isAvailable) {
      return;
    }

    this.talkAvailable = isAvailable;
    this.talkIndicator.setVisible(isAvailable);

    if (isAvailable) {
      this.indicatorTween.resume();
    } else {
      this.indicatorTween.pause();
    }
  }
}
