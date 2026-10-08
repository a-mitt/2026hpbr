import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";

const CX = GAME_WIDTH / 2;
const LEFT = 70;
const BULLETS = [
  "・本作は非公式の二次創作ゲームです。公式様とは一切関係ありません。",
  "・ファンゲームのため、バグや不具合が残っている場合があります。恐れ入りますが、自己責任でのプレイをお願いいたします。",
  "・もし不具合などを見つけた場合は、「設定」画面の【報告フォーム】から教えていただけると嬉しいです！",
  "・📱👉スマホで遊ぶ場合は【横画面推奨】です！",
];

export class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.events.once("shutdown", () => this.cursorManager.reset());

    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bg);
    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH - 40, GAME_HEIGHT - 40, COLORS.panel)
      .setStrokeStyle(2, COLORS.orangeLight, 0.9);

    this.add.text(CX, 52, "2026霊幻新隆おたおめ同人Webゲーム", {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.ui,
      fontSize: "38px",
    }).setOrigin(0.5);

    this.add.text(CX, 106, "⚠️！プレイする前に！", {
      color: CSS_COLORS.orangeLight,
      fontFamily: FONTS.ui,
      fontSize: "26px",
    }).setOrigin(0.5);

    this.add.text(LEFT, 136, BULLETS.join("\n"), {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.body,
      fontSize: "16px",
      lineSpacing: 8,
      wordWrap: { width: GAME_WIDTH - LEFT * 2, useAdvancedWrap: true },
    });

    this.add.text(CX, 318, "最後に...", {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.body,
      fontSize: "17px",
    }).setOrigin(0.5);
    this.add.text(CX, 352, "霊幻新隆、お誕生日おめでとう！🎉", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "30px",
    }).setOrigin(0.5);

    const startButton = this.add.rectangle(CX, 425, 260, 54, COLORS.orangeLight)
      .setStrokeStyle(2, COLORS.cream)
      .setInteractive({ useHandCursor: false });
    this.add.text(CX, 425, "同意して始める", {
      color: CSS_COLORS.indigo,
      fontFamily: FONTS.ui,
      fontSize: "24px",
    }).setOrigin(0.5);

    const creditStyle = {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.body,
      fontSize: "12px",
    };
    this.add.text(GAME_WIDTH - 40, 478, "by製作者:裏世界(旧:理の目) X:@NLisei_kotowari", creditStyle)
      .setOrigin(1, 1);
    this.add.text(GAME_WIDTH - 40, 496, "ゲームコード:AI使用、絵:裏世界、Ver1.0-2026.10.10", creditStyle)
      .setOrigin(1, 1);

    this.cursorManager.bind(startButton, "button", () => {
      this.scene.start("BirthdayScene");
    });
  }
}
