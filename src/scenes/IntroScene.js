import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { createButton } from "../systems/Button.js";
import { addMixedText } from "../systems/mixedText.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";

// レイアウト：左揃えの1カラム。大事な警告は札、規約は小さく読ませる
const MARGIN = 56;
const CONTENT_WIDTH = GAME_WIDTH - MARGIN * 2;
const SMALL_NOTES = [
  "・公式様とは一切関係ありません。ファンゲームのため、バグや不具合が残っている場合があります。",
  "　恐れ入りますが、自己責任でのプレイをお願いいたします。",
  "・不具合を見つけた場合は、「設定」画面の【報告フォーム】から教えていただけると嬉しいです！",
  "・スクショ・SNS投稿・配信などは全てOKです。二次創作のため、公式様や他の方のご迷惑にならないようご配慮ください。",
  "　これらによって生じた損害等について、製作者は責任を負いません。",
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

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bg);

    addMixedText(this, MARGIN, 34, [
      { text: "2026" },
      { text: "霊幻新隆", fontFamily: FONTS.name, fontSize: "37px" },
      { text: "おたおめ同人Webゲーム" },
    ], {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.ui,
      fontSize: "32px",
    });

    const cardWidth = (CONTENT_WIDTH - 24) / 2;
    this.createWarningCard(MARGIN, 88, cardWidth, "非公式の二次創作ゲームです", "公式様とは一切関係ありません。");
    this.createWarningCard(MARGIN + cardWidth + 24, 88, cardWidth, "光の明滅表現があります", "光に敏感な方はご注意ください。");

    this.createPill(MARGIN, 184, "スマホで遊ぶ場合は【横画面推奨】です");

    this.add.text(MARGIN, 238, SMALL_NOTES.join("\n"), {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "13px",
      lineSpacing: 5,
    }).setAlpha(0.9);

    this.add.text(MARGIN, 400, "最後に...", {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "14px",
    });
    addMixedText(this, MARGIN, 420, [
      { text: "霊幻新隆", fontFamily: FONTS.name, fontSize: "31px" },
      { text: "、お誕生日おめでとう！🎉" },
    ], {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "27px",
    });

    const startButton = createButton(this, GAME_WIDTH - MARGIN - 175, 432, 350, 72, "同意して始める", 30);

    const creditStyle = {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "12px",
    };
    this.add.text(GAME_WIDTH - MARGIN, 488, "by製作者:裏世界(旧:理の目) X:@NLisei_kotowari", creditStyle)
      .setOrigin(1, 1).setAlpha(0.85);
    this.add.text(GAME_WIDTH - MARGIN, 506, "ゲームコード:AI使用、絵:裏世界、Ver1.0-2026.10.10", creditStyle)
      .setOrigin(1, 1).setAlpha(0.85);

    this.cursorManager.bind(startButton, "button", () => {
      this.scene.start("BirthdayScene");
    });
  }

  // 警告札：丸バッジ＋見出し＋一言
  createWarningCard(x, y, width, heading, sub) {
    const height = 80;
    this.add.graphics()
      .fillStyle(COLORS.bgDark, 0.6)
      .fillRoundedRect(x, y, width, height, 8);
    const cx = x + 38;
    const cy = y + height / 2;
    this.add.graphics()
      .fillStyle(COLORS.orange, 1)
      .fillTriangle(cx, cy - 22, cx - 25, cy + 18, cx + 25, cy + 18);
    this.add.text(cx, cy + 4, "!", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "24px",
    }).setOrigin(0.5);
    this.add.text(x + 76, y + 16, heading, {
      color: CSS_COLORS.orangeLight,
      fontFamily: FONTS.ui,
      fontSize: "24px",
    });
    this.add.text(x + 76, y + 50, sub, {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "14px",
    });
  }

  // 補足の札（藍の差し色）
  createPill(x, y, label) {
    const text = this.add.text(x + 18, y + 6, label, {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "20px",
    }).setDepth(2);
    this.add.graphics()
      .fillStyle(COLORS.indigo, 1)
      .fillRoundedRect(x, y, text.width + 36, 36, 18)
      .setDepth(1);
  }
}
