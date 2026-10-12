import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../../constants.js";
import { save } from "../save.js";

// こやの大きさ（絵は392×408）としっぽを振る速さ
const KOYA_SCALE = 0.36;
const KOYA_WAG_MS = 220;
const HEART_POOL_SIZE = 14;
// ミニこやの位置（セリフの「▶」ボタンの右）と、触れる範囲
const MINI_KOYA = { x: 880, y: 432, w: 110, h: 130 };
const MINI_KOYA_ART = { x: 703, y: 428 }; // 絵の中のこやの中心（画面全体に敷いたときの座標）

// ライブラリの「koya」まわりの処理。LibraryView のメソッドとして混ぜ込む（this は LibraryView）
export const koyaMethods = {
  // ---- こや（ハート画面で合計400になると、ライブラリに居る） ----
  // クリック・ドラッグ・指でこすると、しっぽを振って（左右の絵を交互に出して）、まわりにハートがぴろぴろ出る。
  // 絵は koya_idle／koya_wag_left／koya_wag_right（無い間は仮の丸）
  renderKoya() {
    if (!save.flag("secret_koya")) {
      return;
    }
    const scene = this.scene;
    // プレゼント／セリフのタブでは、文字や絵に被らない「ミニこや」（1280×720の絵の右下に描いてあるので、画面全体に敷いて位置を合わせる）
    const mini = this.tab === 0 || this.tab === 1;
    const koya = mini
      ? scene.add.container(MINI_KOYA.x, MINI_KOYA.y).setSize(MINI_KOYA.w, MINI_KOYA.h).setInteractive()
      : scene.add.container(840, 418).setSize(150, 150).setInteractive();
    this.koya = koya;
    koya.lastHeartAt = 0;
    koya.wagLeft = true;
    koya.hearts = []; // ハートの文字は使い回す（撫でるたびに作ると重くなる）
    koya.keys = mini
      ? { idle: "koya_mini_idle", left: "koya_mini_wag_left", right: "koya_mini_wag_right" }
      : { idle: "koya_idle", left: "koya_wag_left", right: "koya_wag_right" };
    if (scene.textures.exists(koya.keys.idle)) {
      koya.sprite = scene.add.image(0, 0, koya.keys.idle);
      if (mini) {
        koya.sprite.setOrigin(0).setPosition(-MINI_KOYA_ART.x, -MINI_KOYA_ART.y).setDisplaySize(GAME_WIDTH, GAME_HEIGHT);
      } else {
        koya.sprite.setScale(KOYA_SCALE);
      }
    } else {
      koya.sprite = scene.add.circle(0, 0, 50, 0xf6d9b0).setStrokeStyle(3, 0x5a3320);
    }
    koya.add(koya.sprite);
    this.cursorManager.bind(koya, "button");
    koya.on("pointerdown", () => this.petKoya(koya));
    koya.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        this.petKoya(koya);
      }
    });
    this.body.add(koya);
  },

  // 描き直す前に、こやのタイマーとハートの動きを止める（消えた絵に触って止まるのを防ぐ）
  clearKoya() {
    const koya = this.koya;
    if (!koya) {
      return;
    }
    this.koya = null;
    koya.wagEvent?.remove(false);
    koya.restTimer?.remove(false);
    koya.wagEvent = null;
    koya.restTimer = null;
    this.scene.tweens.killTweensOf(koya.hearts);
  },

  petKoya(koya) {
    const scene = this.scene;
    // 撫でている間は、しっぽを左右に振る
    if (!koya.wagEvent && scene.textures.exists(koya.keys.left)) {
      const wag = () => {
        if (!koya.active) {
          return;
        }
        koya.sprite.setTexture(koya.wagLeft ? koya.keys.left : koya.keys.right);
        koya.wagLeft = !koya.wagLeft;
      };
      wag();
      koya.wagEvent = scene.time.addEvent({ delay: KOYA_WAG_MS, loop: true, callback: wag });
    }
    koya.restTimer?.remove(false);
    koya.restTimer = scene.time.delayedCall(450, () => {
      koya.wagEvent?.remove(false);
      koya.wagEvent = null;
      if (koya.active && scene.textures.exists(koya.keys.idle)) {
        koya.sprite.setTexture(koya.keys.idle);
      }
    });

    // こすっている間、ハートを次々に出す
    const now = scene.time.now;
    if (now - koya.lastHeartAt < 70) {
      return;
    }
    koya.lastHeartAt = now;
    const colors = ["#f49ac1", "#ff7fa8", "#ffb3c8"];
    let heart = koya.hearts.find((h) => !h.visible);
    if (!heart && koya.hearts.length < HEART_POOL_SIZE) {
      heart = this.addText(0, 0, "♥", 32).setOrigin(0.5);
      this.body.add(heart);
      koya.hearts.push(heart);
    }
    if (!heart) {
      return;
    }
    heart.setPosition(koya.x + Phaser.Math.Between(-70, 70), koya.y + Phaser.Math.Between(-70, 20))
      .setScale(Phaser.Math.Between(18, 34) / 32)
      .setColor(Phaser.Utils.Array.GetRandom(colors))
      .setAngle(Phaser.Math.Between(-25, 25))
      .setAlpha(1)
      .setVisible(true);
    scene.tweens.add({
      targets: heart,
      y: heart.y - Phaser.Math.Between(40, 90),
      alpha: 0,
      duration: Phaser.Math.Between(600, 1000),
      onComplete: () => heart.setVisible(false),
    });
  },
};
