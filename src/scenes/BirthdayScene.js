import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH, OFFSET_Y } from "../constants.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";

const CX = GAME_WIDTH / 2;
const CANDLE_COUNT = 8;
const CANDLE_SPACING = 40;
const CAKE_Y = 420 + OFFSET_Y;

export class BirthdayScene extends Phaser.Scene {
  constructor() {
    super("BirthdayScene");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.events.once("shutdown", () => this.cursorManager.reset());
    this.candles = [];
    this.introObjects = [];
    this.litCandleCount = 0;
    this.sceneState = "lighting";
    this.blowButton = null;
    this.blowButtonText = null;
    this.venueButton = null;

    this.createGlowTexture();
    this.addIntroObject(
      this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bg),
    );
    this.createCake();
    this.createCandles();
    this.createDarkness();
    this.createInstructions();
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
    this.addIntroObject(this.add.rectangle(CX, CAKE_Y + 62, 428, 126, COLORS.orange), 10);
    this.addIntroObject(this.add.rectangle(CX, CAKE_Y, 440, 24, COLORS.peach), 11);
    this.addIntroObject(this.add.rectangle(CX, CAKE_Y + 96, 452, 14, COLORS.orangeLight), 12);
    this.addIntroObject(this.add.ellipse(CX, CAKE_Y, 438, 24, COLORS.cream), 13);
    this.addIntroObject(
      this.add.text(CX, CAKE_Y + 44, "HAPPY DAY", {
        color: CSS_COLORS.cream,
        fontFamily: FONTS.title,
        fontSize: "22px",
      }).setOrigin(0.5),
      14,
    );
  }

  createCandles() {
    const firstCandleX = CX - ((CANDLE_COUNT - 1) * CANDLE_SPACING) / 2;
    const flameY = CAKE_Y - 45;

    for (let index = 0; index < CANDLE_COUNT; index += 1) {
      const x = firstCandleX + index * CANDLE_SPACING;
      const candleBody = this.add.rectangle(x, CAKE_Y - 21, 14, 44, COLORS.peach);
      const clickArea = this.add.zone(x, CAKE_Y - 21, 36, 74)
        .setInteractive({ useHandCursor: false });
      const flame = this.add.ellipse(x, flameY, 15, 22, 0xffc45e).setVisible(false);
      const glow = this.add.image(x, flameY, "warm-candle-glow")
        .setBlendMode(Phaser.BlendModes.SCREEN)
        .setScale(0.95)
        .setAlpha(0)
        .setVisible(false);

      this.addIntroObject(candleBody, 20);
      this.addIntroObject(clickArea, 20);
      this.addIntroObject(flame, 61);
      this.addIntroObject(glow, 60);

      const candle = { body: candleBody, clickArea, flame, glow, lit: false };
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
    this.statusText = this.add.text(CX, 62, "ろうそくに火を付けよう", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "34px",
      stroke: CSS_COLORS.brownDark,
      strokeThickness: 5,
    }).setOrigin(0.5).setDepth(80);
    this.hintText = this.add.text(CX, 108, "(クリック/タップ)", {
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
    this.cursorManager.set("default");
    this.litCandleCount += 1;
    candle.body.setFillStyle(0xffe6b8);
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
    this.blowButton = this.add.rectangle(CX, GAME_HEIGHT - 42, 240, 48, COLORS.orangeLight)
      .setStrokeStyle(2, COLORS.cream)
      .setDepth(85)
      .setInteractive({ useHandCursor: false });
    this.blowButtonText = this.add.text(CX, GAME_HEIGHT - 42, "火を吹き消す", {
      color: CSS_COLORS.indigo,
      fontFamily: FONTS.ui,
      fontSize: "22px",
    }).setOrigin(0.5).setDepth(86);

    this.addIntroObject(this.blowButton, 85);
    this.addIntroObject(this.blowButtonText, 86);
    this.counterText.setVisible(false);
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
    this.blowButtonText.setVisible(false);
    this.cursorManager.reset();
    this.time.delayedCall(500, () => this.extinguishCandles());
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

  showCelebration() {
    this.sceneState = "celebration";
    for (const object of this.introObjects) {
      object.setVisible(false);
    }

    this.createCelebrationCard();
    this.createConfetti();
    this.darkness.setDepth(100);
    this.tweens.add({ targets: this.darkness, alpha: 0, duration: 420, ease: "Cubic.easeOut" });
  }

  createCelebrationCard() {
    // 一枚絵（仮）。画像が決まったら this.add.image に差し替える
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.panel).setDepth(30);
    this.add.text(CX, GAME_HEIGHT / 2, "お祝いのイラストをここに入れる", {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.ui,
      fontSize: "26px",
    }).setOrigin(0.5).setDepth(31);

    this.add.text(CX, 62, "HAPPY BIRTHDAY！", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.title,
      fontSize: "64px",
      stroke: CSS_COLORS.indigo,
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(40);

    this.pressText = this.add.text(CX, GAME_HEIGHT - 50, "Press any button / Tap the screen", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "24px",
      stroke: CSS_COLORS.brownDark,
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(41);
    this.tweens.add({
      targets: this.pressText,
      alpha: 0.25,
      duration: 700,
      yoyo: true,
      repeat: -1,
    });

    // 誤タップで飛ばないよう、少し待ってから入力を受け付ける
    this.time.delayedCall(700, () => {
      const onPress = () => this.showVenueButton();
      this.input.once("pointerdown", onPress);
      this.input.keyboard.once("keydown", onPress);
    });
  }

  showVenueButton() {
    if (this.venueButton) {
      return;
    }
    this.input.removeAllListeners("pointerdown");
    this.input.keyboard.removeAllListeners("keydown");
    this.tweens.killTweensOf(this.pressText);
    this.pressText.setVisible(false);

    this.venueButton = this.add.rectangle(CX, GAME_HEIGHT - 60, 320, 60, COLORS.orange)
      .setStrokeStyle(3, COLORS.cream)
      .setDepth(41);
    this.add.text(CX, GAME_HEIGHT - 60, "誕生日会場に行く", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "28px",
    }).setOrigin(0.5).setDepth(42);

    // 同じ押下で即遷移しないよう、少し待ってから押せるようにする
    this.time.delayedCall(300, () => {
      this.venueButton.setInteractive({ useHandCursor: false });
      this.cursorManager.bind(this.venueButton, "button", () => {
        this.scene.start("FieldScene");
      });
    });
  }

  createConfetti() {
    if (!this.textures.exists("confetti-piece")) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 9, 14);
      graphics.generateTexture("confetti-piece", 9, 14);
      graphics.destroy();
    }

    this.confetti = this.add.particles(0, -20, "confetti-piece", {
      x: { min: 0, max: GAME_WIDTH },
      y: -20,
      lifespan: 6500,
      frequency: 75,
      quantity: 2,
      speedX: { min: -28, max: 28 },
      speedY: { min: 100, max: 230 },
      gravityY: 65,
      rotate: { min: 0, max: 360 },
      tint: [COLORS.orange, COLORS.orangeLight, COLORS.peach, COLORS.indigo],
      scale: { start: 1, end: 0.35 },
    }).setDepth(60);
  }
}
