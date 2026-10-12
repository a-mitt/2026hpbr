import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH, OFFSET_Y } from "../constants.js";
import { createButton } from "../systems/Button.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { t } from "../systems/i18n.js";
import { celebrationMethods } from "../systems/birthdayCelebration.js";

const CX = GAME_WIDTH / 2;
const BIRTHDAY_ASSET_DIR = `${import.meta.env.BASE_URL}assets/birthday/`;
// 絵は 1280×720。画面（960×540）に合わせて 0.75 倍で置く
const ART_SCALE = 0.75;
// ケーキの絵に描かれているろうそく（絵の中の座標：中心x、上端y）。火はその上に重ねる
const CANDLES = [
  { x: 336, top: 238 },
  { x: 449, top: 202 },
  { x: 515, top: 311 },
  { x: 762, top: 315 },
  { x: 803, top: 209 },
  { x: 919, top: 247 },
];
const CANDLE_COUNT = CANDLES.length;
// 口の絵（1280×720）の中の口の中心。ここを中心に小さくする
const MOUTH_CENTER = { x: 650, y: 34 };
const MOUTH_BLOW_MS = 700; // 開いた口から、小さく閉じるまで
const MOUTH_END_SCALE = 0.45; // 最後の大きさ（元の絵に対する倍率）

export class BirthdayScene extends Phaser.Scene {
  constructor() {
    super("BirthdayScene");
  }

  preload() {
    this.load.setPath(BIRTHDAY_ASSET_DIR);
    this.load.image("cake", "cake.png");
    this.load.image("mouth_open", "mouth_open.png");
    this.load.image("mouth_closed", "mouth_closed.png");
    this.load.image("birthday_picture", "birthday.png");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.events.once("shutdown", () => this.cursorManager.reset());
    this.candles = [];
    this.introObjects = [];
    this.litCandleCount = 0;
    this.sceneState = "lighting";
    this.blowButton = null;
    this.venueButton = null;

    this.createGlowTexture();
    this.addIntroObject(
      this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bg),
    );
    this.createCake();
    this.createCandles();
    this.createDarkness();
    this.createInstructions();
    this.createSkipButton();
  }

  // 演出をとばして、お祝い画面へ進む
  createSkipButton() {
    this.skipButton = createButton(this, GAME_WIDTH - 82, 36, 130, 44, t("スキップ", "Skip"), 20).setDepth(90);
    this.cursorManager.bind(this.skipButton, "button", () => this.skipToCelebration());
  }

  skipToCelebration() {
    if (this.sceneState === "celebration") {
      return;
    }
    this.skipButton.destroy();
    this.tweens.killAll();
    this.time.removeAllEvents();
    this.cursorManager.reset();
    this.showCelebration();
  }

  createGlowTexture() {
    if (this.textures.exists("warm-candle-glow")) {
      return;
    }
    const texture = this.textures.createCanvas("warm-candle-glow", 128, 128);
    const context = texture.getContext();
    const gradient = context.createRadialGradient(64, 64, 0, 64, 64, 64);

    gradient.addColorStop(0, "rgba(255, 208, 132, 0.9)");
    gradient.addColorStop(0.28, "rgba(255, 150, 59, 0.44)");
    gradient.addColorStop(1, "rgba(255, 100, 20, 0)");
    context.fillStyle = gradient;
    context.fillRect(0, 0, 128, 128);
    texture.refresh();
  }

  addIntroObject(object, depth = 0) {
    object.setDepth(depth);
    this.introObjects.push(object);
    return object;
  }

  createCake() {
    this.addIntroObject(this.add.image(0, 0, "cake").setOrigin(0).setScale(ART_SCALE), 10);
    // 息を吹きかける口（全部に火がついたら出る）
    this.mouth = this.add.image(MOUTH_CENTER.x * ART_SCALE, MOUTH_CENTER.y * ART_SCALE, "mouth_open")
      .setOrigin(MOUTH_CENTER.x / 1280, MOUTH_CENTER.y / 720).setScale(ART_SCALE).setVisible(false);
    this.addIntroObject(this.mouth, 70);
  }

  createCandles() {
    for (const spec of CANDLES) {
      const x = spec.x * ART_SCALE;
      const top = spec.top * ART_SCALE;
      const flameY = top - 14;
      const clickArea = this.add.zone(x, top + 46, 46, 110)
        .setInteractive({ useHandCursor: false });
      const flame = this.add.ellipse(x, flameY, 15, 22, 0xffc45e).setVisible(false);
      const glow = this.add.image(x, flameY, "warm-candle-glow")
        .setBlendMode(Phaser.BlendModes.SCREEN)
        .setScale(0.95)
        .setAlpha(0)
        .setVisible(false);

      this.addIntroObject(clickArea, 20);
      this.addIntroObject(flame, 61);
      this.addIntroObject(glow, 60);

      const candle = { clickArea, flame, glow, lit: false };
      this.cursorManager.bind(clickArea, "match", () => this.lightCandle(candle));
      this.candles.push(candle);
    }
  }

  createDarkness() {
    this.darkness = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.bgDark, 1)
      .setOrigin(0)
      .setAlpha(0.76)
      .setDepth(50);
  }

  createInstructions() {
    this.statusText = this.add.text(CX, 62, t("ろうそくに火を付けよう", "Light the candles"), {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "34px",
      stroke: CSS_COLORS.brownDark,
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(80);
    this.hintText = this.add.text(CX, 108, t("(クリック/タップ)", "(Click / Tap)"), {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.ui,
      fontSize: "22px",
      stroke: CSS_COLORS.brownDark,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(80);
    this.counterText = this.add.text(CX, GAME_HEIGHT - 42, `0 / ${CANDLE_COUNT}`, {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.ui,
      fontSize: "18px",
      stroke: CSS_COLORS.brownDark,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(80);

    this.introObjects.push(this.statusText, this.hintText, this.counterText);
  }

  lightCandle(candle) {
    if (this.sceneState !== "lighting" || candle.lit) {
      return;
    }

    candle.lit = true;
    // 点いたろうそくは押せなくする（マッチのカーソルも出さない）
    candle.clickArea.disableInteractive();
    this.cursorManager.set("default");
    this.litCandleCount += 1;
    candle.flame.setVisible(true);
    candle.glow.setVisible(true);

    this.tweens.add({
      targets: candle.flame,
      scaleX: { from: 0.9, to: 1.12 },
      scaleY: { from: 1.08, to: 0.92 },
      duration: 180,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });
    this.tweens.add({ targets: candle.glow, alpha: 0.96, duration: 300, ease: "Sine.easeOut" });

    this.darkness.setAlpha(0.76 * (1 - this.litCandleCount / CANDLE_COUNT));
    this.counterText.setText(`${this.litCandleCount} / ${CANDLE_COUNT}`);

    if (this.litCandleCount === CANDLE_COUNT) {
      this.sceneState = "breathing";
      this.statusText.setVisible(false);
      this.hintText.setVisible(false);
      this.showBlowButton();
    }
  }

  showBlowButton() {
    this.blowButton = createButton(this, CX, GAME_HEIGHT - 46, 300, 60, t("火を吹き消す", "Blow out the candles"), 26)
      .setDepth(85);

    this.addIntroObject(this.blowButton, 85);
    this.counterText.setVisible(false);
    this.mouth.setVisible(true);
    this.cursorManager.bind(this.blowButton, "button", () => {
      if (this.sceneState === "breathing") {
        this.playBlowOut();
      }
    });
  }

  playBlowOut() {
    this.sceneState = "blowing";
    this.blowButton.disableInteractive();
    this.blowButton.setVisible(false);
    this.cursorManager.reset();

    // 開いた口から、小さくしながら閉じた口に変えていく（ふわふわさせない）。小さくなりきったら火を消す
    let switched = false;
    this.tweens.add({
      targets: this.mouth,
      scale: ART_SCALE * MOUTH_END_SCALE,
      duration: MOUTH_BLOW_MS,
      ease: "Sine.easeIn",
      onUpdate: (tween) => {
        if (!switched && tween.progress > 0.4) {
          switched = true;
          this.mouth.setTexture("mouth_closed");
        }
      },
      onComplete: () => this.extinguishCandles(),
    });
  }

  extinguishCandles() {
    for (const candle of this.candles) {
      candle.flame.setVisible(false);
      this.tweens.killTweensOf(candle.flame);
      this.tweens.add({
        targets: candle.glow,
        alpha: 0,
        duration: 180,
        onComplete: () => candle.glow.setVisible(false),
      });
    }

    this.time.delayedCall(500, () => this.startBlackout());
  }

  startBlackout() {
    this.sceneState = "blackout";
    this.darkness.setDepth(100);
    this.tweens.add({
      targets: this.darkness,
      alpha: 1,
      duration: 350,
      ease: "Sine.easeIn",
      onComplete: () => this.time.delayedCall(2000, () => this.showCelebration()),
    });
  }

}

// お祝い画面は birthdayCelebration.js に分けてある。ここで BirthdayScene のメソッドとして混ぜ込む
Object.assign(BirthdayScene.prototype, celebrationMethods);
