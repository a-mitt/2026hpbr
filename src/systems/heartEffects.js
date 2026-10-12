import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { CSS_COLORS } from "../theme.js";
import { t } from "./i18n.js";

export const CX = GAME_WIDTH / 2;
// れーあらの絵の中心の高さ（演出の出る位置の基準にもなる）
export const PICTURE_Y = 236;
const CONFETTI_COLORS = [0xff6b6b, 0xffd93d, 0x6bcB77, 0x4d96ff, 0xf49ac1, 0xb388eb];

// ハート画面の演出（紙吹雪・拍手・クラッカー・おめでとう・風船）。HeartView のメソッドとして混ぜ込む（this は HeartView）
export const heartEffectMethods = {
  // 一枚絵の画面なので、ぱらぱらと紙吹雪を降らせる（開いている間だけ）
  createConfettiRain() {
    const scene = this.scene;
    if (!scene.textures.exists("confetti-piece")) {
      const graphics = scene.make.graphics({ x: 0, y: 0, add: false });
      graphics.fillStyle(0xffffff, 1);
      graphics.fillRect(0, 0, 9, 14);
      graphics.generateTexture("confetti-piece", 9, 14);
      graphics.destroy();
    }
    this.rain = scene.add.particles(0, -20, "confetti-piece", {
      x: { min: 0, max: GAME_WIDTH },
      y: { min: -30, max: -10 },
      lifespan: 6500,
      frequency: 90,
      quantity: 2,
      speedX: { min: -40, max: 40 },
      speedY: { min: 80, max: 200 },
      gravityY: 55,
      rotate: { min: 0, max: 360 },
      tint: CONFETTI_COLORS,
      scale: { start: 1, end: 0.4 },
      emitting: false,
    }).setDepth(5).setVisible(false);
  },

  // ---- 演出（仮の絵） ----
  track(object, tweenConfig) {
    this.effects.add(object);
    this.scene.tweens.add({ ...tweenConfig, targets: object, onComplete: () => object.destroy() });
  },

  spawnEffect(id) {
    const scene = this.scene;
    if (id === "clap") {
      for (let i = 0; i < 5; i += 1) {
        const hand = this.addText(CX + Phaser.Math.Between(-150, 150), PICTURE_Y + 90, "👏", 34).setOrigin(0.5);
        this.track(hand, { y: PICTURE_Y - 70 - Phaser.Math.Between(0, 40), alpha: 0, duration: 800, delay: i * 60 });
      }
    } else if (id === "cracker") {
      for (let i = 0; i < 36; i += 1) {
        const fromLeft = i % 2 === 0;
        const piece = scene.add.rectangle(
          fromLeft ? 40 : GAME_WIDTH - 40,
          GAME_HEIGHT - 120,
          Phaser.Math.Between(6, 11),
          Phaser.Math.Between(10, 16),
          Phaser.Utils.Array.GetRandom(CONFETTI_COLORS),
        ).setAngle(Phaser.Math.Between(0, 180));
        const targetX = (fromLeft ? 1 : -1) * Phaser.Math.Between(80, 420) + piece.x;
        this.track(piece, {
          x: targetX,
          y: Phaser.Math.Between(60, 260),
          angle: piece.angle + Phaser.Math.Between(-360, 360),
          alpha: 0,
          duration: Phaser.Math.Between(900, 1400),
          ease: "Cubic.easeOut",
        });
      }
    } else if (id === "say") {
      const shout = this.addText(CX + Phaser.Math.Between(-60, 60), PICTURE_Y + 100, t("おめでとう！", "Happy birthday!"), 30, {
        color: CSS_COLORS.orangeLight,
      }).setOrigin(0.5);
      this.track(shout, { y: PICTURE_Y - 110, alpha: 0, duration: 1000, ease: "Sine.easeOut" });
    } else {
      const color = Phaser.Utils.Array.GetRandom(CONFETTI_COLORS);
      const x = Phaser.Math.Between(80, GAME_WIDTH - 80);
      const balloon = scene.add.container(x, GAME_HEIGHT - 100, [
        scene.add.ellipse(0, 0, 38, 48, color).setStrokeStyle(3, 0x5a3320),
        scene.add.line(0, 0, 0, 24, 4, 70, 0x5a3320).setOrigin(0).setLineWidth(2),
      ]);
      this.track(balloon, { y: -80, x: x + Phaser.Math.Between(-60, 60), duration: 2200, ease: "Sine.easeIn" });
    }
  },
};
