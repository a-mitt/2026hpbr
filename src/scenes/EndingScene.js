import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { createButton } from "../systems/Button.js";
import { CursorManager } from "../systems/CursorManager.js";
import { save } from "../systems/save.js";
import { CSS_COLORS, FONTS } from "../theme.js";
import { t } from "../systems/i18n.js";

const CX = GAME_WIDTH / 2;

// エンディングごとの文面。pages＝1枚ずつクリックで進む地の文、final＝最後の札に出す文
const ENDINGS = {
  true: {
    secret: "true_end",
    pageFace: null, // 文章のページがないので使わない
    finalFace: "happyend",
    label: "TRUE END",
    labelColor: "#ffe27a",
    pages: [],
    final: [t("霊幻新隆を幸せな誕生日にすることができました。", "You made Reigen Arataka's birthday a happy one."), t("おめでとう！", "Congratulations!")],
  },
  // 誰かからプレゼントをもらって帰ったとき
  normal: {
    secret: "normal_end",
    pageFace: "alone", // 文章のあいだの顔
    finalFace: "normalend", // 最後の札の顔
    label: "NORMAL END",
    labelColor: "#f6d9b0",
    pages: [
      t("みんなに祝ってもらって、帰り道を歩く。", "He walks home after being celebrated by everyone."),
      t("もらったプレゼントを、そっと思い浮かべる。", "He quietly thinks of the presents he received."),
    ],
    final: [t("今日はいい誕生日だった。", "It was a good birthday."), t("また来年も、もしかしたら……。", "Maybe again next year, too......")],
  },
  bad: {
    secret: "bad_end",
    pageFace: "alone",
    pageFaces: { 4: "alonebad" }, // 「そのまま床に倒れ込んだ」のページだけ
    finalFace: "alonebad", // 最後の「BAD END」の画面
    label: "BAD END",
    labelColor: "#b9c2d6",
    pages: [
      t("部屋に着いて、パソコンを開く。", "Back in his room, he opens his computer."),
      t("……メッセージは、来ていない。", "......No new messages."),
      t("何で帰っちゃったんだろう…", "Why did I go home...?"),
      t("幸せすぎたのかな…", "Was I too happy...?"),
      t("霊幻は1人、そのまま床に倒れ込んだ。", "Alone, Reigen collapsed onto the floor."),
    ],
    final: [t("あーあ、霊幻は幸せになれませんでした。", "Oh dear, Reigen couldn't be happy."), t("貴方のせいです。", "It's all your fault.")],
  },
};

// 終わりの画面（トゥルーエンド／バッドエンド）。最後に「タイトルに戻る」
export class EndingScene extends Phaser.Scene {
  constructor() {
    super("EndingScene");
  }

  preload() {
    // 霊幻の立ち絵（ここから直接始めたときのために、無ければ読み込む）
    this.load.setPath(`${import.meta.env.BASE_URL}assets/stand/`);
    for (const face of ["happyend", "normalend", "alone", "alonebad"]) {
      if (!this.textures.exists(`stand_reigen_${face}`)) {
        this.load.image(`stand_reigen_${face}`, `reigen_${face}.png`);
      }
    }
  }

  // replay＝ライブラリのシークレットから見直しているとき（最後は「閉じる」で、ライブラリに戻る）
  create({ kind = new URLSearchParams(location.search).get("kind") ?? "true", replay = false } = {}) {
    this.replay = replay;
    this.ending = ENDINGS[kind];
    this.pageIndex = -1;
    this.cursorManager = new CursorManager(this.game);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cursorManager.reset());
    save.unlockSecret(this.ending.secret);

    // 黒い背景。押せる物にしておくと、下にあるライブラリのボタンに押した操作が届かない
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000).setOrigin(0).setInteractive();
    // 霊幻の立ち絵（左）。文章のあいだは pageFace（ページごとに pageFaces で変えられる）、最後の札では finalFace
    const firstFace = this.ending.pageFace ?? this.ending.finalFace;
    this.stand = this.add.image(190, GAME_HEIGHT, `stand_reigen_${firstFace}`)
      .setOrigin(0.59, 1).setScale(0.5).setVisible(Boolean(this.ending.pageFace));
    this.body = this.add.text(CX, GAME_HEIGHT / 2, "", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.body,
      fontSize: "28px",
      align: "center",
      lineSpacing: 12,
      resolution: 2,
    }).setOrigin(0.5).setAlpha(0);

    const advance = () => this.advance();
    this.input.on("pointerdown", advance);
    this.input.keyboard.on("keydown-SPACE", advance);
    this.input.keyboard.on("keydown-ENTER", advance);
    this.cameras.main.fadeIn(800, 0, 0, 0);
    this.advance();
  }

  setFace(face) {
    this.stand.setTexture(`stand_reigen_${face}`);
  }

  showText(text) {
    this.tweens.killTweensOf(this.body);
    this.body.setText(text).setAlpha(0);
    this.tweens.add({ targets: this.body, alpha: 1, duration: 600 });
  }

  advance() {
    if (this.finished) {
      return;
    }
    this.pageIndex += 1;
    if (this.pageIndex < this.ending.pages.length) {
      this.setFace(this.ending.pageFaces?.[this.pageIndex] ?? this.ending.pageFace);
      this.showText(this.ending.pages[this.pageIndex]);
      return;
    }
    this.showFinal();
  }

  showFinal() {
    this.finished = true;
    this.setFace(this.ending.finalFace);
    this.stand.setVisible(true);
    this.body.setText("").setAlpha(0);
    const label = this.add.text(CX, 150, this.ending.label, {
      color: this.ending.labelColor,
      fontFamily: FONTS.title,
      fontSize: "64px",
      resolution: 2,
    }).setOrigin(0.5).setAlpha(0);
    const message = this.add.text(CX, 270, this.ending.final.join("\n"), {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.body,
      fontSize: "28px",
      align: "center",
      lineSpacing: 14,
      resolution: 2,
    }).setOrigin(0.5).setAlpha(0);
    const buttonLabel = this.replay ? t("閉じる", "Close") : t("タイトルに戻る", "Back to Title");
    const button = createButton(this, CX, 400, 260, 64, buttonLabel, 26).setAlpha(0);
    this.cursorManager.bind(button, "button", () => {
      this.cursorManager.reset();
      if (this.replay) {
        this.scene.stop();
      } else {
        this.scene.start("IntroScene");
      }
    });
    this.tweens.add({ targets: [label, message], alpha: 1, duration: 900 });
    this.tweens.add({ targets: button, alpha: 1, duration: 900, delay: 1200 });
  }
}
