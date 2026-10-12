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
    pageFace: "smile", // 文章のあいだの顔
    finalFace: "happyend",
    label: "TRUE END",
    labelColor: "#ffe27a",
    pages: [
      t("一人で帰っているのに、一人じゃないみたいだ。胸が温かい。", "I'm walking home alone, yet it feels like I'm not. My heart is warm."),
      t("ふと、周りに人がいないことを確認して、\nずっと力を入れていた目元から力を抜く。", "I glance around to make sure no one is nearby,\nand finally relax my eyes, tense for so long."),
      t("頬を伝う温かい雫は、決して哀しさから出たものではない。", "The warm drops running down my cheeks are never from sadness."),
      t("どうか、幸せな日々がこれからも続きますように。", "I hope these happy days will go on and on."),
      t("ろうそくの火を吹き消す時に祈った願いを、\n神様は叶えてくれるだろうか。", "Will the gods grant the wish I made\nwhen I blew out the candles?"),
      t("叶えてくれるといいな。\n今日はなんだか、一人でも寂しくない。", "I hope they do.\nSomehow, I don't feel lonely today, even by myself."),
    ],
    final: [
      t("全員のプレゼントをもらうことができました。", "You received a present from everyone."),
      t("あなたのおかげで霊幻新隆は\n素敵な誕生日を過ごすことができたようです。", "Thanks to you, Reigen Arataka seems to have\nspent a wonderful birthday."),
      t("おめでとうございます。", "Congratulations."),
    ],
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
    final: [t("今年はいい誕生日だった。", "It was a good birthday this year."), t("また来年も、もしかしたら……。", "Maybe again next year, too......")],
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
    for (const face of ["happyend", "normalend", "alone", "alonebad", "smile"]) {
      if (!this.textures.exists(`stand_reigen_${face}`)) {
        this.load.image(`stand_reigen_${face}`, `reigen_${face}.png`);
      }
    }
  }

  // replay＝ライブラリのシークレットから見直しているとき（最後は「閉じる」で、ライブラリに戻る）
  create({ kind = new URLSearchParams(location.search).get("kind") ?? "true", replay = false, fromNight = false } = {}) {
    this.replay = replay;
    this.fromNight = fromNight; // 夜のシーンから見直したとき：閉じたらマップに戻してライブラリを開く
    this.ending = ENDINGS[kind];
    this.pageIndex = -1;
    // シーンは使い回されるので、前に見たときの「最後まで見た」を引き継がない（引き継ぐと2回目は何も出ず、何も押せない）
    this.finished = false;
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
      wordWrap: { width: 640, useAdvancedWrap: true },
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
      if (this.fromNight) {
        this.game.registry.set("reopenLibrary", true);
        this.scene.start("FieldScene");
      } else if (this.replay) {
        this.scene.stop();
      } else {
        this.scene.start("IntroScene");
      }
    });
    this.tweens.add({ targets: [label, message], alpha: 1, duration: 900 });
    this.tweens.add({ targets: button, alpha: 1, duration: 900, delay: 1200 });
  }
}
