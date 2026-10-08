import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";

const CX = GAME_WIDTH / 2;
const LEFT = 70;
const SMALL_NOTES = [
  "・公式様とは一切関係ありません。ファンゲームのため、バグや不具合が残っている場合があります。恐れ入りますが、自己責任でのプレイをお願いいたします。",
  "・不具合を見つけた場合は、「設定」画面の【報告フォーム】から教えていただけると嬉しいです！",
  "・スクショ・SNS投稿・配信などは全てOKです。二次創作のため、公式様や他の方のご迷惑にならないようご配慮ください。これらによって生じた損害等について、製作者は責任を負いません。",
  "・推奨環境：最新版のChrome / Safari / Edge。本作は個人情報の取得・保存を行いません。",
  "・「同意して始める」を押すと、上記の注意・規約を読み、同意したものとみなします。",
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

    this.add.text(CX, 46, "2026霊幻新隆おたおめ同人Webゲーム", {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.ui,
      fontSize: "36px",
    }).setOrigin(0.5);

    // 大きく見せる重要事項
    const important = (y, text, size, color) => this.add.text(CX, y, text, {
      color,
      fontFamily: FONTS.ui,
      fontSize: `${size}px`,
    }).setOrigin(0.5);
    important(94, "⚠️ 本作は非公式の二次創作ゲームです", 28, CSS_COLORS.orangeLight);
    important(130, "⚠️ 光の明滅表現があります。ご注意ください", 24, CSS_COLORS.orangeLight);
    important(164, "📱 スマホで遊ぶ場合は【横画面推奨】です！", 22, CSS_COLORS.cream);

    // 小さく読ませる注意・規約
    this.add.text(LEFT, 194, SMALL_NOTES.join("\n"), {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.body,
      fontSize: "13px",
      lineSpacing: 5,
      wordWrap: { width: GAME_WIDTH - LEFT * 2, useAdvancedWrap: true },
    });

    this.add.text(CX, 352, "最後に...", {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.body,
      fontSize: "15px",
    }).setOrigin(0.5);
    this.add.text(CX, 384, "霊幻新隆、お誕生日おめでとう！🎉", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "30px",
    }).setOrigin(0.5);

    const startButton = this.add.rectangle(CX, 436, 240, 46, COLORS.orangeLight)
      .setStrokeStyle(2, COLORS.cream)
      .setInteractive({ useHandCursor: false });
    this.add.text(CX, 436, "同意して始める", {
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
