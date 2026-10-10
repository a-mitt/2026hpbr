import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { createButton } from "./Button.js";
import { save } from "./save.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { t } from "./i18n.js";

const CX = GAME_WIDTH / 2;
const LEAVE_EACH = 100; // 4つのお祝いが、それぞれ100回（合計400回）になると、れーあらはこやを置いて帰る
const LIMIT = 1000; // 帰ったあと、4つとも1000回で、原作の隆が出てくる
const LIMIT_TAKASHI = 4000; // 隆が出たあと、4つとも4000回で、風呂上がりの隆になる
const TEXT_RESOLUTION = 2;
// れーあらの絵（中心）。大きさは PICTURE_MAX の中に収める
const PICTURE_Y = 236;
const PICTURE_MAX = { width: 600, height: 332 };
// 絵の下（ボタンの上）に言葉を出す場所
const CAPTION_Y = 427;
const FACE_Y = PICTURE_Y;
// 合計回数で絵が変わる節目（絵の名前は reia_0／reia_25／reia_50／reia_75。75のあとは、帰るまでそのまま）
const STAGES = [75, 50, 25, 0];

const ACTIONS = [
  { id: "clap", label: t("拍手を送る", "Applaud") },
  { id: "cracker", label: t("クラッカーを鳴らす", "Pop a party popper") },
  { id: "say", label: t("おめでとうと伝える", "Say congratulations") },
  { id: "balloon", label: t("風船を飛ばす", "Release balloons") },
];
const CONFETTI_COLORS = [0xff6b6b, 0xffd93d, 0x6bcB77, 0x4d96ff, 0xf49ac1, 0xb388eb];

// ハート画面（全画面）。れーあらに、4つのお祝いを送る。
// 4つのお祝いの回数の合計で、れーあらの絵が変わる（25／50／75）。4つとも100回（合計400回）で「こや」を置いて帰る（こやはライブラリにいる）。
// 帰ったあともボタンは押せる（反応なし）。4つとも1000回で上限になり、原作の隆が出てくる
export class HeartView {
  constructor(scene, cursorManager) {
    this.scene = scene;
    this.cursorManager = cursorManager;
    this.container = scene.add.container(0, 0).setDepth(5).setVisible(false);
    this.effects = scene.add.container(0, 0);
    this.build();
  }

  addText(x, y, label, fontSize, extra = {}) {
    return this.scene.add.text(x, y, label, {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: `${fontSize}px`,
      resolution: TEXT_RESOLUTION,
      ...extra,
    });
  }

  build() {
    const scene = this.scene;
    this.container.add([
      scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.bg, 0.98).setOrigin(0).setInteractive(),
      scene.add.text(CX, 36, t("HAPPY BIRTHDAY！", "HAPPY BIRTHDAY!"), {
        color: CSS_COLORS.orangeLight,
        fontFamily: FONTS.title,
        fontSize: "46px",
        resolution: TEXT_RESOLUTION,
      }).setOrigin(0.5),
    ]);

    // れーあら（や、帰ったあとの絵）を出す場所。絵は差し替わるので、中身は都度つくり直す
    this.stage = scene.add.container(CX, PICTURE_Y);

    this.buttons = ACTIONS.map((action, index) => {
      const x = 62 + 100 + index * 212;
      const button = createButton(scene, x, 477, 200, 52, action.label, 19);
      this.cursorManager.bind(button, "button", () => this.celebrate(action));
      const counter = this.addText(x, 514, "", 16, { color: CSS_COLORS.peach }).setOrigin(0.5);
      this.container.add([button, counter]);
      return { action, button, counter };
    });
    this.container.add([this.stage, this.effects]);
    this.createConfettiRain();
  }

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
  }

  setVisible(isVisible) {
    this.container.setVisible(isVisible);
    this.rain.setVisible(isVisible);
    if (isVisible) {
      this.refresh();
      this.rain.start();
    } else {
      this.rain.stop();
      this.rain.killAll();
      this.effects.removeAll(true);
    }
  }

  // reia（れーあらがいる）／left（こやを置いて帰った）／takashi（原作の隆）／bath（風呂上がりの隆）
  phase() {
    if (save.flag("secret_takashi_bath")) {
      return "bath";
    }
    if (save.flag("secret_takashi")) {
      return "takashi";
    }
    return save.flag("secret_koya") ? "left" : "reia";
  }

  goal() {
    const goals = { reia: LEAVE_EACH, left: LIMIT, takashi: LIMIT_TAKASHI, bath: LIMIT_TAKASHI };
    return goals[this.phase()];
  }

  total() {
    return ACTIONS.reduce((sum, action) => sum + save.count(action.id), 0);
  }

  refresh() {
    this.updateCounters();
    this.showPicture();
  }

  updateCounters() {
    // 帰るまでは「n / 100」、帰ったあとは「n / 1000」、隆が出たあとは「n / 4000」
    const goal = this.goal();
    for (const { action, counter } of this.buttons) {
      counter.setText(`${Math.min(save.count(action.id), goal)} / ${goal}`);
    }
  }

  // れーあらの絵の段階：合計25／50／75で変わる（75のあとは、帰るまでそのまま）
  stageKey() {
    const total = this.total();
    const stage = STAGES.find((threshold) => total >= threshold) ?? 0;
    return `reia_${stage}`;
  }

  // 絵を出す。帰ったあとは reia_left、上限のあとは takashi（アニメーション待ち）。
  // 絵（textures）が無い間は、仮の枠を出す
  showPicture() {
    const scene = this.scene;
    const phase = this.phase();
    const keys = { left: "reia_left", takashi: "takashi", bath: "takashi_bath" };
    const key = phase === "reia" ? this.stageKey() : keys[phase];
    this.stage.removeAll(true);
    this.showCaption(phase);
    if (scene.textures.exists(key)) {
      const picture = scene.add.image(0, 0, key);
      picture.setScale(Math.min(PICTURE_MAX.width / picture.width, PICTURE_MAX.height / picture.height));
      this.stage.add(picture);
      return;
    }
    this.stage.add([
      scene.add.rectangle(0, 0, 360, 220, COLORS.bgDark, 0.5).setStrokeStyle(2, COLORS.peach, 0.5),
      this.addText(0, 0, t("（絵は準備中です）", "(Illustration coming soon)"), 18, {
        color: CSS_COLORS.peach,
      }).setOrigin(0.5),
    ]);
  }

  // 絵の下（ボタンの上）の言葉（帰ったあと／隆のせりふ）。れーあらがいる間は出さない
  showCaption(phase) {
    const lines = {
      left: t(
        "霊幻新隆は照れすぎて、こやを置いてその場を去ってしまいました",
        "Reigen Arataka was so embarrassed that he left Koya behind and walked away.",
      ),
      takashi: t(
        "よう、たくさんお祝いしてくれてありがとうな。\n（※模写です）",
        "Yo, thanks for celebrating me so much.\n(* This is a copy of the original art.)",
      ),
      bath: t(
        "何だ？お前まだ遊んでたのか？暇なんだな",
        "What? You're still playing? You must have nothing better to do.",
      ),
    };
    this.caption?.destroy();
    this.caption = null;
    if (!lines[phase]) {
      return;
    }
    // 絵の外（絵とボタンのあいだ）に、2行まで出す
    const text = this.addText(CX, CAPTION_Y, lines[phase], 17, {
      align: "center",
      lineSpacing: 4,
      wordWrap: { width: 720, useAdvancedWrap: true },
    }).setOrigin(0.5);
    this.caption = this.scene.add.container(0, 0, [text]);
    this.container.add(this.caption);
  }

  // ボタンを押す。れーあらがいる間だけ、演出と絵の変化がある（帰ったあとは数えるだけ）
  celebrate(action) {
    const phase = this.phase();
    // 数えるのは、帰るまでは100回まで、帰ったあとは1000回まで
    if (save.count(action.id) < this.goal()) {
      save.addCount(action.id);
    }
    if (phase === "reia") {
      this.spawnEffect(action.id);
      this.showPicture();
    }
    this.updateCounters();

    if (phase === "reia" && ACTIONS.every((entry) => save.count(entry.id) >= LEAVE_EACH)) {
      this.scene.time.delayedCall(1400, () => this.leaveKoya());
    } else if (phase === "left" && ACTIONS.every((entry) => save.count(entry.id) >= LIMIT)) {
      save.unlockSecret("takashi");
      this.refresh();
    } else if (phase === "takashi" && ACTIONS.every((entry) => save.count(entry.id) >= LIMIT_TAKASHI)) {
      save.unlockSecret("takashi_bath");
      this.refresh();
    }
  }

  // 4つとも100回（合計400回）になった：こやを置いて帰る
  leaveKoya() {
    if (this.phase() !== "reia") {
      return;
    }
    save.unlockSecret("koya");
    this.refresh();
  }

  // ---- 演出（仮の絵） ----
  track(object, tweenConfig) {
    this.effects.add(object);
    this.scene.tweens.add({ ...tweenConfig, targets: object, onComplete: () => object.destroy() });
  }

  spawnEffect(id) {
    const scene = this.scene;
    if (id === "clap") {
      for (let i = 0; i < 5; i += 1) {
        const hand = this.addText(CX + Phaser.Math.Between(-150, 150), FACE_Y + 90, "👏", 34).setOrigin(0.5);
        this.track(hand, { y: FACE_Y - 70 - Phaser.Math.Between(0, 40), alpha: 0, duration: 800, delay: i * 60 });
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
      const shout = this.addText(CX + Phaser.Math.Between(-60, 60), FACE_Y + 100, t("おめでとう！", "Happy birthday!"), 30, {
        color: CSS_COLORS.orangeLight,
      }).setOrigin(0.5);
      this.track(shout, { y: FACE_Y - 110, alpha: 0, duration: 1000, ease: "Sine.easeOut" });
    } else {
      const color = Phaser.Utils.Array.GetRandom(CONFETTI_COLORS);
      const x = Phaser.Math.Between(80, GAME_WIDTH - 80);
      const balloon = scene.add.container(x, GAME_HEIGHT - 100, [
        scene.add.ellipse(0, 0, 38, 48, color).setStrokeStyle(3, 0x5a3320),
        scene.add.line(0, 0, 0, 24, 4, 70, 0x5a3320).setOrigin(0).setLineWidth(2),
      ]);
      this.track(balloon, { y: -80, x: x + Phaser.Math.Between(-60, 60), duration: 2200, ease: "Sine.easeIn" });
    }
  }
}
