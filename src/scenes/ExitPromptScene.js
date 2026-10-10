import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { giftCount, hasAllCollections } from "../systems/progress.js";
import { CursorManager } from "../systems/CursorManager.js";
import { createButton } from "../systems/Button.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { t } from "../systems/i18n.js";

const CX = GAME_WIDTH / 2;
const TEXT_RESOLUTION = 2;

// 階段の扉を調べたときに出る、終わりの選択。マップは一時停止して重ねて表示する
export class ExitPromptScene extends Phaser.Scene {
  constructor() {
    super("ExitPromptScene");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.65).setOrigin(0).setInteractive();

    this.choiceView = this.add.container(0, 0);
    this.noticeView = this.add.container(0, 0).setVisible(false);
    this.buildChoices();
    this.buildNotice();

    this.input.keyboard.on("keydown-ESC", () => this.close());
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cursorManager.reset());
  }

  addText(x, y, label, fontSize, extra = {}) {
    return this.add.text(x, y, label, {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: `${fontSize}px`,
      resolution: TEXT_RESOLUTION,
      ...extra,
    });
  }

  buildChoices() {
    const canStay = hasAllCollections();
    this.choiceView.add(this.addText(CX, 150, t("終わりにして帰る？", "Call it a day?"), 38).setOrigin(0.5));

    const choices = [
      { label: t("もう少し", "Stay a bit"), x: CX - 200, onClick: () => this.close() },
      { label: t("帰る", "Go home"), x: CX, onClick: () => this.goHome() },
      {
        label: t("1人で残る", "Stay alone"),
        x: CX + 200,
        locked: !canStay,
        onClick: () => (canStay
          ? this.stayAlone()
          : this.showHint(t("まだ全てのコレクションを達成していません。", "You have not completed the whole collection yet."))),
      },
    ];
    for (const choice of choices) {
      const button = createButton(this, choice.x, 270, 180, 64, choice.label, 26);
      button.setAlpha(choice.locked ? 0.4 : 1);
      this.cursorManager.bind(button, "button", choice.onClick);
      this.choiceView.add(button);
    }

    this.hintText = this.addText(CX, 350, "", 20, { color: CSS_COLORS.orangeLight }).setOrigin(0.5);
    this.choiceView.add(this.hintText);
  }

  buildNotice() {
    this.noticeText = this.addText(CX, 230, "", 30).setOrigin(0.5);
    const back = createButton(this, CX, 320, 180, 60, t("もどる", "Back"), 24);
    this.cursorManager.bind(back, "button", () => this.showChoices());
    this.noticeView.add([this.noticeText, back]);
  }

  showHint(message) {
    this.hintText.setText(message);
  }

  showNotice(message) {
    this.noticeText.setText(message);
    this.choiceView.setVisible(false);
    this.noticeView.setVisible(true);
    this.cursorManager.reset();
  }

  showChoices() {
    this.hintText.setText("");
    this.noticeView.setVisible(false);
    this.choiceView.setVisible(true);
    this.cursorManager.reset();
  }

  // 帰る → 誰からももらっていなければバッドエンド、誰かからもらっていればノーマルエンド
  goHome() {
    this.cursorManager.reset();
    this.scene.stop("HudScene");
    this.scene.stop("FieldScene");
    this.scene.start("EndingScene", { kind: giftCount() === 0 ? "bad" : "normal" });
  }

  // 1人で残る → 夜のシーン
  stayAlone() {
    const field = this.scene.get("FieldScene");
    this.close();
    field.startNight();
  }

  close() {
    this.cursorManager.reset();
    this.scene.stop();
    this.scene.resume("FieldScene");
  }
}
