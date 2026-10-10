import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { createButton } from "../systems/Button.js";
import { addMixedText } from "../systems/mixedText.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { NOTICE_LINES } from "../data/notices.js";
import { save } from "../systems/save.js";
import { isEnglish, switchLanguage, t } from "../systems/i18n.js";

// レイアウト：左揃えの1カラム。大事な警告は札、規約は小さく読ませる
const MARGIN = 56;
const CONTENT_WIDTH = GAME_WIDTH - MARGIN * 2;

export class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.events.once("shutdown", () => this.cursorManager.reset());

    this.add.rectangle(GAME_WIDTH / 2, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, COLORS.bg);

    addMixedText(this, MARGIN, 34, [
      { text: t("2026", "2026 ") },
      { text: t("霊幻新隆", "Reigen Arataka"), fontFamily: FONTS.name, fontSize: "37px" },
      { text: t("おたおめ同人Webゲーム", " Birthday Fan Game") },
    ], {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.ui,
      fontSize: "32px",
    });

    const cardWidth = (CONTENT_WIDTH - 24) / 2;
    this.createWarningCard(MARGIN, 88, cardWidth, t("非公式の二次創作ゲームです", "Unofficial fan game"), t("公式様とは一切関係ありません。", "Not affiliated with the official creators."));
    this.createWarningCard(MARGIN + cardWidth + 24, 88, cardWidth, t("光の明滅表現があります", "Flashing lights"), t("光に敏感な方はご注意ください。", "Please take care if you are light-sensitive."));

    this.createPill(MARGIN, 184, t("スマホで遊ぶ場合は【横画面推奨】です", "On mobile, landscape orientation is recommended"));

    this.add.text(MARGIN, 230, NOTICE_LINES.join("\n"), {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "13px",
      lineSpacing: 5,
    }).setAlpha(0.9);

    this.add.text(MARGIN, 400, t("最後に...", "Finally..."), {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "14px",
    });
    addMixedText(this, MARGIN, 420, [
      { text: t("", "Happy birthday, ") },
      { text: t("霊幻新隆", "Reigen Arataka"), fontFamily: FONTS.name, fontSize: "31px" },
      { text: t("、お誕生日おめでとう！🎉", "! 🎉") },
    ], {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "27px",
    });

    // 英語はラベルが長いので、チェックを少し左に置く
    this.createOptIn(GAME_WIDTH - MARGIN - (isEnglish ? 480 : 350), 386);
    this.createLanguageButton();

    const startButton = createButton(this, GAME_WIDTH - MARGIN - 175, 450, 350, 70, t("同意して始める", "I Agree & Start"), 30);

    const creditStyle = {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "12px",
    };
    this.add.text(GAME_WIDTH - MARGIN, 500, t("by製作者:裏世界(旧:理の目) X:@NLisei_kotowari", "by Urasekai (formerly Kotowari no Me)  X:@NLisei_kotowari"), creditStyle)
      .setOrigin(1, 1).setAlpha(0.85);
    this.add.text(GAME_WIDTH - MARGIN, 518, t("ゲームコード:AI使用、絵:裏世界、Ver1.0-2026.10.10", "Game code: AI-assisted, Art: Urasekai, Ver1.0-2026.10.10"), creditStyle)
      .setOrigin(1, 1).setAlpha(0.85);

    this.cursorManager.bind(startButton, "button", () => {
      this.scene.start("BirthdayScene");
    });
  }

  // 右上の言語切り替え（押すとページを読み込み直して、もう一方の言語で始まる）
  createLanguageButton() {
    const button = createButton(this, GAME_WIDTH - MARGIN - 48, 44, 96, 36, isEnglish ? "日本語" : "English", 18);
    this.cursorManager.bind(button, "button", () => switchLanguage());
  }

  // 任意のチェック：入れると、ライブラリのプレゼントの「意味」が見られる（保存される）
  createOptIn(x, y) {
    const box = this.add.rectangle(x + 11, y, 22, 22, COLORS.bgDark, 0.7)
      .setStrokeStyle(2, COLORS.orangeLight, 1);
    const mark = this.add.text(x + 11, y - 1, "✓", {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "20px",
    }).setOrigin(0.5);
    const label = this.add.text(x + 32, y - 11, t("非公式の恋愛的表現に抵抗が無い", "I am okay with unofficial romantic expressions"), {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "19px",
    });
    this.add.text(x + 32, y + 12, t("（チェックすると、プレゼントの「意味」が見られます）", "(Tick this to see the \"meaning\" of each present)"), {
      color: CSS_COLORS.peach,
      fontFamily: FONTS.intro,
      fontSize: "11px",
    }).setAlpha(0.85);

    const refresh = () => mark.setVisible(Boolean(save.flag("romanceOk")));
    refresh();
    const zone = this.add.zone(x - 4, y - 14, 340, 40).setOrigin(0).setInteractive();
    this.cursorManager.bind(zone, "button", () => {
      save.setFlag("romanceOk", !save.flag("romanceOk"));
      refresh();
    });
    return [box, mark, label];
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
