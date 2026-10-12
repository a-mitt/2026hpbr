import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { t } from "./i18n.js";
import { save } from "./save.js";
import { createButton } from "./Button.js";

const CX = GAME_WIDTH / 2;
// お祝いの一枚絵は小さめに置く（見出しの下）
const PICTURE_SCALE = 0.5;

// お祝い画面（一枚絵・紙吹雪・会場へ進むボタン）。BirthdayScene のメソッドとして混ぜ込む（this は BirthdayScene）
export const celebrationMethods = {
  showCelebration() {
    this.sceneState = "celebration";
    this.skipButton?.destroy();
    for (const object of this.introObjects) {
      object.setVisible(false);
    }

    this.createCelebrationCard();
    this.createConfetti();
    this.darkness.setDepth(100);
    this.tweens.add({ targets: this.darkness, alpha: 0, duration: 420, ease: "Cubic.easeOut" });
  },

  createCelebrationCard() {
    // ライブラリのシークレット「HAPPY BIRTHDAY！の一枚絵」を解放
    save.unlockSecret("happy_picture");
    // 一枚絵（仮）。画像が決まったら this.add.image に差し替える
    // 見出しは上、一枚絵はその下に小さめ（全画面ではない）に置く
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.panel).setDepth(30);
    this.add.text(CX, 50, t("HAPPY BIRTHDAY！", "HAPPY BIRTHDAY!"), {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.title,
      fontSize: "60px",
      stroke: CSS_COLORS.indigo,
      strokeThickness: 10,
    }).setOrigin(0.5).setDepth(40);
    const pictureWidth = 1280 * PICTURE_SCALE;
    const pictureHeight = 720 * PICTURE_SCALE;
    const pictureY = 276;
    this.add.rectangle(CX, pictureY, pictureWidth + 8, pictureHeight + 8, COLORS.orangeLight)
      .setDepth(30.5);
    this.add.image(CX, pictureY, "birthday_picture").setScale(PICTURE_SCALE).setDepth(31);

    // 絵の上でも読めるように、うしろに暗い帯を敷く
    this.pressBg = this.add.rectangle(CX, GAME_HEIGHT - 26, 420, 34, COLORS.bgDark, 0.6).setDepth(40);
    this.pressText = this.add.text(CX, GAME_HEIGHT - 26, "Press any button / Tap the screen", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "20px",
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
  },

  showVenueButton() {
    if (this.venueButton) {
      return;
    }
    this.input.removeAllListeners("pointerdown");
    this.input.keyboard.removeAllListeners("keydown");
    this.tweens.killTweensOf(this.pressText);
    this.pressText.setVisible(false);
    this.pressBg.setVisible(false);

    this.venueButton = createButton(this, CX, GAME_HEIGHT - 40, 380, 64, t("誕生日会場に行く", "Go to the party"), 28)
      .setDepth(41)
      .disableInteractive();

    // 同じ押下で即遷移しないよう、少し待ってから押せるようにする
    this.time.delayedCall(300, () => {
      this.venueButton.setInteractive({ useHandCursor: false });
      this.cursorManager.bind(this.venueButton, "button", () => {
        this.scene.start("FieldScene");
      });
    });
  },

  createConfetti() {
    if (!this.textures.exists("confetti-piece")) {
      const graphics = this.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 9, 14);
      graphics.generateTexture("confetti-piece", 9, 14);
      graphics.destroy();
    }

    // ぱらぱらと降り続ける紙吹雪（カラフル）
    this.confetti = this.add.particles(0, -20, "confetti-piece", {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: -30, max: -10 },
      lifespan: 6500,
      frequency: 55,
      quantity: 3,
      speedX: { min: -45, max: 45 },
      speedY: { min: 90, max: 240 },
      gravityY: 60,
      rotate: { min: 0, max: 360 },
      angle: { min: 0, max: 360 },
      tint: [0xff6b6b, 0xffd93d, 0x6bcb77, 0x4d96ff, 0xf49ac1, 0xb388eb, COLORS.orangeLight],
      scale: { start: 1.1, end: 0.4 },
    }).setDepth(60);
  },
};
