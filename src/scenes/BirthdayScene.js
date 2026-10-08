import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH, OFFSET_X, OFFSET_Y } from "../constants.js";

const CX = GAME_WIDTH / 2;
const CANDLE_COUNT = 8;

export class BirthdayScene extends Phaser.Scene {
  constructor() {
    super("BirthdayScene");
    this.candles = [];
    this.introObjects = [];
    this.litCandleCount = 0;
    this.sceneState = "lighting";
    this.blowButton = null;
    this.blowButtonText = null;
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

    this.createGlowTexture();
    this.createRoom();
    this.createCharacter();
    this.createCake();
    this.createCandles();
    this.createDarkness();
    this.createInstructions();
  }

  createGlowTexture() {
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

  createRoom() {
    this.addIntroObject(
      this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x24363a),
    );
    this.addIntroObject(
      this.add.rectangle(CX, 165, GAME_WIDTH, 2, 0x496064, 0.6),
    );
    this.addIntroObject(
      this.add.rectangle(115, GAME_HEIGHT / 2, 132, GAME_HEIGHT, 0x8d5548, 0.46),
    );
    this.addIntroObject(
      this.add.rectangle(GAME_WIDTH - 115, GAME_HEIGHT / 2, 132, GAME_HEIGHT, 0x8d5548, 0.46),
    );
    this.addIntroObject(
      this.add.rectangle(CX, GAME_HEIGHT - 45, GAME_WIDTH, 90, 0x18272b),
    );
    this.addIntroObject(
      this.add.text(CX, 54, "今夜の主役はあなた", {
        color: "#f4d6a0",
        fontFamily: "Georgia, serif",
        fontSize: "24px",
      }).setOrigin(0.5),
      10,
    );
  }

  createCharacter() {
    const parts = [
      this.add.ellipse(0, 104, 132, 164, 0x47766e),
      this.add.ellipse(0, 0, 94, 104, 0x332b2c),
      this.add.ellipse(0, 8, 76, 84, 0xf0bd8d),
      this.add.ellipse(0, -22, 92, 48, 0x332b2c),
      this.add.ellipse(-17, 8, 7, 10, 0x25252a),
      this.add.ellipse(17, 8, 7, 10, 0x25252a),
      this.add.ellipse(-27, 24, 13, 7, 0xe78c76, 0.58),
      this.add.ellipse(27, 24, 13, 7, 0xe78c76, 0.58),
      this.add.arc(0, 27, 22, 15, 15, 165, false, 0x8c433f),
    ];

    this.character = this.add.container(650 + OFFSET_X, 326 + OFFSET_Y, parts);
    this.addIntroObject(this.character, 15);
    this.faceGlow = this.add.image(650 + OFFSET_X, 336 + OFFSET_Y, "warm-candle-glow")
      .setBlendMode(Phaser.BlendModes.SCREEN)
      .setScale(1.28)
      .setAlpha(0);
    this.addIntroObject(this.faceGlow, 18);
  }

  createCake() {
    this.addIntroObject(
      this.add.rectangle(CX, 482 + OFFSET_Y, 428, 126, 0xc76f62),
      10,
    );
    this.addIntroObject(
      this.add.rectangle(CX, 420 + OFFSET_Y, 440, 24, 0xf3d5b1),
      11,
    );
    this.addIntroObject(
      this.add.rectangle(CX, 516 + OFFSET_Y, 452, 14, 0xe9bd8c),
      12,
    );
    this.addIntroObject(
      this.add.ellipse(CX, 420 + OFFSET_Y, 438, 24, 0xffe8c9),
      13,
    );
    this.addIntroObject(
      this.add.text(CX, 464 + OFFSET_Y, "HAPPY DAY", {
        color: "#fff0d6",
        fontFamily: "Georgia, serif",
        fontSize: "19px",
        fontStyle: "bold",
      }).setOrigin(0.5),
      14,
    );
  }

  createCandles() {
    const firstCandleX = 260 + OFFSET_X;
    const candleSpacing = 40;

    for (let index = 0; index < CANDLE_COUNT; index += 1) {
      const x = firstCandleX + index * candleSpacing;
      const flameY = 375 + OFFSET_Y;
      const candleBody = this.add.rectangle(x, 399 + OFFSET_Y, 14, 44, 0xf6d99f);
      const clickArea = this.add.zone(x, 399 + OFFSET_Y, 36, 74)
        .setInteractive({ useHandCursor: false });
      const flame = this.add.ellipse(x, flameY, 15, 22, 0xffc45e)
        .setVisible(false);
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
    this.darkness = this.add.rectangle(
      0,
      0,
      GAME_WIDTH,
      GAME_HEIGHT,
      0x000000,
      1,
    ).setOrigin(0).setAlpha(0.76).setDepth(50);
  }

  createInstructions() {
    this.statusText = this.add.text(CX, 91, "ろうそくをクリックして火を灯してね", {
      color: "#fff0d6",
      fontFamily: "sans-serif",
      fontSize: "19px",
      stroke: "#18272b",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(80);
    this.counterText = this.add.text(CX, GAME_HEIGHT - 42, `0 / ${CANDLE_COUNT}`, {
      color: "#ffe5bd",
      fontFamily: "sans-serif",
      fontSize: "17px",
      stroke: "#18272b",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(80);

    this.introObjects.push(this.statusText, this.counterText);
  }

  lightCandle(candle) {
    if (this.sceneState !== "lighting" || candle.lit) {
      return;
    }

    candle.lit = true;
    this.cursorManager.set("default");
    this.litCandleCount += 1;
    candle.body.setFillStyle(0xffdf9f);
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
    this.tweens.add({
      targets: candle.glow,
      alpha: 0.96,
      duration: 300,
      ease: "Sine.easeOut",
    });

    const lightProgress = this.litCandleCount / CANDLE_COUNT;
    this.darkness.setAlpha(0.76 * (1 - lightProgress));
    this.faceGlow.setAlpha(lightProgress * 0.92);
    this.counterText.setText(`${this.litCandleCount} / ${CANDLE_COUNT}`);

    if (this.litCandleCount === CANDLE_COUNT) {
      this.sceneState = "breathing";
      this.statusText.setText("ふーっと吹き消すボタンを押してね");
      this.showBlowButton();
    }
  }

  showBlowButton() {
    if (this.blowButton) {
      this.blowButton.setVisible(true);
      this.blowButtonText.setVisible(true);
      return;
    }

    this.blowButton = this.add.rectangle(CX, GAME_HEIGHT - 42, 224, 46, 0xe6c77a)
      .setStrokeStyle(2, 0xfff0d6)
      .setDepth(85)
      .setInteractive({ useHandCursor: false });
    this.blowButtonText = this.add.text(CX, GAME_HEIGHT - 42, "ふーっと吹き消す", {
      color: "#1c3034",
      fontFamily: "sans-serif",
      fontSize: "18px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(86);

    this.addIntroObject(this.blowButton, 85);
    this.addIntroObject(this.blowButtonText, 86);
    this.cursorManager.bind(this.blowButton, "button", () => {
      if (this.sceneState === "breathing") {
        this.playBlowOut();
      }
    });
  }

  playBlowOut() {
    if (this.sceneState !== "breathing") {
      return;
    }

    this.sceneState = "blowing";
    if (this.blowButton) {
      this.blowButton.disableInteractive();
      this.blowButton.setVisible(false);
    }
    if (this.blowButtonText) {
      this.blowButtonText.setVisible(false);
    }

    this.tweens.add({
      targets: this.character,
      scaleX: 1.08,
      scaleY: 1.1,
      duration: 480,
      ease: "Sine.easeInOut",
      onComplete: () => {
        this.tweens.add({
          targets: this.character,
          scaleX: 1.23,
          scaleY: 0.94,
          duration: 230,
          ease: "Sine.easeIn",
          onComplete: () => this.extinguishCandles(),
        });
      },
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

    this.tweens.add({
      targets: this.character,
      scaleX: 1,
      scaleY: 1,
      duration: 380,
      ease: "Sine.easeOut",
      onComplete: () => this.startBlackout(),
    });
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
    this.tweens.add({
      targets: this.darkness,
      alpha: 0,
      duration: 420,
      ease: "Cubic.easeOut",
    });
  }

  createCelebrationCard() {
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x26535a)
      .setDepth(30);
    this.add.text(CX, 60, "おめでとう！", {
      color: "#fff0d1",
      fontFamily: "Georgia, serif",
      fontSize: "52px",
      fontStyle: "bold",
      stroke: "#9a5143",
      strokeThickness: 7,
    }).setOrigin(0.5).setDepth(40);

    this.add.rectangle(CX, 275, 626, 300, 0x193a40)
      .setStrokeStyle(4, 0xf2cc8f)
      .setDepth(40);
    this.add.text(CX, 275, "お祝いのイラストをここに入れる", {
      color: "#f4d6a0",
      fontFamily: "sans-serif",
      fontSize: "22px",
    }).setOrigin(0.5).setDepth(41);
    this.add.text(CX, 462, "今日はあなたが主役", {
      color: "#fff0d1",
      fontFamily: "sans-serif",
      fontSize: "22px",
    }).setOrigin(0.5).setDepth(40);

    const continueButton = this.add.rectangle(CX, GAME_HEIGHT - 32, 232, 42, 0xe5c88e)
      .setStrokeStyle(2, 0xfff0d6)
      .setDepth(41)
      .setInteractive({ useHandCursor: false });
    this.add.text(CX, GAME_HEIGHT - 32, "クリックして会場へ", {
      color: "#1c3034",
      fontFamily: "sans-serif",
      fontSize: "17px",
      fontStyle: "bold",
    }).setOrigin(0.5).setDepth(42);
    this.cursorManager.bind(continueButton, "button", () => {
      this.scene.start("FieldScene");
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
      tint: [0xf5c96b, 0xe87f69, 0x91c9ae, 0xf4e5cb],
      scale: { start: 1, end: 0.35 },
    }).setDepth(60);
  }
}