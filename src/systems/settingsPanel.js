import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { CREDIT_LINES, HOWTO_LINES, REPORT_FORM_URL, TERMS_ITEMS } from "../data/notices.js";
import { createButton } from "./Button.js";
import { save } from "./save.js";
import { COLORS, CSS_COLORS } from "../theme.js";
import { t } from "./i18n.js";

const PANEL_WIDTH = GAME_WIDTH / 2;
const PANEL_X = GAME_WIDTH - PANEL_WIDTH;

// 設定パネル（右半分）の処理。HudScene のメソッドとして混ぜ込む（this は HudScene）
export const settingsMethods = {
  // ---- 設定（右半分） ----
  createSettingsPanel() {
    const children = [];
    const dim = this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.4).setOrigin(0).setInteractive();
    const panel = this.add.rectangle(PANEL_X, 0, PANEL_WIDTH, GAME_HEIGHT, COLORS.panel, 0.97)
      .setOrigin(0).setStrokeStyle(2, COLORS.orangeLight, 1).setInteractive();
    // 左側の暗い部分を押すと閉じる
    dim.on("pointerdown", () => this.setPanel(null));
    children.push(dim, panel);

    this.settingsPanel = this.add.container(0, 0, children).setDepth(5).setVisible(false);

    // 目次の画面と、規約・クレジットの画面を切り替える
    this.settingsMenu = this.add.container(0, 0);
    this.settingsDetail = this.add.container(0, 0).setVisible(false);
    this.settingsPanel.add([this.settingsMenu, this.settingsDetail]);

    const left = PANEL_X + 30;
    const buttonWidth = PANEL_WIDTH - 60;
    let top = 24;
    this.settingsMenu.add(this.addText(left, top, t("設定", "Settings"), 28));
    top += 54;

    if (this.sys.game.device.input.touch) {
      const notice = this.addText(
        left,
        top,
        t("スマホで遊ぶ場合は、画面ロック（向きの固定）を\nオフにして、横画面にしてください。", "If you play on a phone, turn off the screen\nrotation lock and use landscape orientation."),
        15,
        { color: CSS_COLORS.peach, lineSpacing: 4 },
      );
      this.settingsMenu.add(notice);
      top += notice.height + 18;
    }

    const entries = [
      { label: t("遊び方", "How to Play"), onClick: () => this.showDetail(t("遊び方", "How to Play"), HOWTO_LINES) },
      { label: t("利用規約", "Terms of Use"), onClick: () => this.showDetail(t("利用規約", "Terms of Use"), TERMS_ITEMS) },
      { label: t("クレジット", "Credits"), onClick: () => this.showDetail(t("クレジット", "Credits"), CREDIT_LINES) },
    ];
    for (const entry of entries) {
      const button = createButton(this, left + buttonWidth / 2, top + 26, buttonWidth, 52, entry.label, 24);
      this.cursorManager.bind(button, "button", entry.onClick);
      this.settingsMenu.add(button);
      top += 64;
    }

    const formReady = REPORT_FORM_URL !== "";
    const formButton = createButton(
      this,
      left + buttonWidth / 2,
      top + 28,
      buttonWidth,
      56,
      formReady ? t("バグ・感想フォーム", "Bug & Feedback Form") : t("バグ・感想フォーム（準備中）", "Bug & Feedback Form (coming soon)"),
      24,
    );
    formButton.setAlpha(formReady ? 1 : 0.5);
    if (formReady) {
      this.cursorManager.bind(formButton, "button", () => {
        window.open(REPORT_FORM_URL, "_blank", "noopener");
      });
    } else {
      formButton.disableInteractive();
    }
    this.settingsMenu.add(formButton);
    top += 66;
    this.settingsMenu.add(this.addText(left, top, t("※ Googleフォームに飛びます（別のタブで開きます）", "* Opens a Google Form (in a new tab)"), 14, {
      color: CSS_COLORS.peach,
    }));
    top += 34;

    // 全画面（iPhoneのSafariは非対応なので、ボタンは出さず説明だけ）
    if (this.scale.fullscreen.available) {
      const fullscreenButton = createButton(this, left + buttonWidth / 2, top + 22, buttonWidth, 44, t("全画面にする", "Fullscreen"), 18);
      this.cursorManager.bind(fullscreenButton, "button", () => this.scale.toggleFullscreen());
      this.settingsMenu.add(fullscreenButton);
      top += 54;
    }

    const fullscreenNote = this.addText(
      left,
      top + 6,
      t(
        "【全画面について】\nPC/Androidなどは、上の「全画面にする」ボタンで全画面にできます。\niPhoneは全画面ボタンが使えないので、Safariで開いて、下の共有ボタン →「ホーム画面に追加」を押し、追加されたアイコンから開くと、アプリのように全画面で遊べます。",
        "[About fullscreen]\nOn PC/Android and similar, use the Fullscreen button above.\nOn iPhone, open this page in Safari, tap the Share button, choose \"Add to Home Screen\", then open the new icon to play fullscreen like an app.",
      ),
      14,
      { color: CSS_COLORS.peach, lineSpacing: 4, wordWrap: { width: buttonWidth, useAdvancedWrap: true } },
    );
    this.settingsMenu.add(fullscreenNote);
    top += 6 + fullscreenNote.height + 18;

    // 押し間違い防止に、2回押したときだけ実行
    const addResetButton = (label, armedLabel, action) => {
      const button = createButton(this, left + buttonWidth / 2, top + 22, buttonWidth, 44, label, 18);
      const buttonLabel = button.list[button.list.length - 1];
      let armed = false;
      this.cursorManager.bind(button, "button", () => {
        if (!armed) {
          armed = true;
          buttonLabel.setText(armedLabel);
          this.time.delayedCall(4000, () => {
            armed = false;
            buttonLabel.setText(label);
          });
          return;
        }
        action();
        window.location.reload();
      });
      this.settingsMenu.add(button);
      top += 54;
    };
    addResetButton(
      t("セリフ・エンディングのみをリセット", "Reset dialogue & endings"),
      t("もう一度押すと実行（お祝いした記録は残る）", "Press again (celebration records kept)"),
      () => save.resetRun(),
    );
    addResetButton(
      t("すべてリセット", "Reset everything"),
      t("もう一度押すと、最初からになります", "Press again to start over"),
      () => save.reset(),
    );

    this.setupMenuScroll(top + 24);

    this.detailTitle = this.addText(left, 24, "", 28);
    this.detailBody = this.addText(left, 76, "", 15, {
      lineSpacing: 6,
      wordWrap: { width: buttonWidth, useAdvancedWrap: true },
    });
    const back = createButton(this, left + 70, GAME_HEIGHT - 44, 140, 48, t("戻る", "Back"), 22);
    this.cursorManager.bind(back, "button", () => this.showMenu());
    this.settingsDetail.add([this.detailTitle, this.detailBody, back]);

    this.uiRects.push(Object.assign(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), {
      visible: () => this.openPanel !== null,
    }));
  },

  // 設定の目次が画面に収まらないとき、ホイールかドラッグで上下にずらせるようにする
  setupMenuScroll(contentHeight) {
    const minY = Math.min(0, GAME_HEIGHT - contentHeight);
    const scrollTo = (y) => this.settingsMenu.setY(Phaser.Math.Clamp(y, minY, 0));
    if (minY === 0) {
      return;
    }
    this.input.on("wheel", (pointer, over, dx, dy) => {
      if (this.openPanel === "settings" && this.settingsMenu.visible) {
        scrollTo(this.settingsMenu.y - dy);
      }
    });
    this.input.on("pointermove", (pointer) => {
      if (pointer.isDown && this.openPanel === "settings" && this.settingsMenu.visible && pointer.x >= PANEL_X) {
        scrollTo(this.settingsMenu.y + (pointer.y - pointer.prevPosition.y));
      }
    });
  },

  showDetail(title, lines) {
    this.detailTitle.setText(title);
    this.detailBody.setText(lines.join("\n"));
    this.settingsMenu.setVisible(false);
    this.settingsDetail.setVisible(true);
  },

  showMenu() {
    this.settingsMenu.setVisible(true).setY(0);
    this.settingsDetail.setVisible(false);
  },
};
