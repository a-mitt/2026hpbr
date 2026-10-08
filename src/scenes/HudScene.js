import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { CREDIT_LINES, REPORT_FORM_URL, TERMS_ITEMS } from "../data/notices.js";
import { TASKS } from "../data/tasks.js";
import { CursorManager } from "../systems/CursorManager.js";
import { createButton } from "../systems/Button.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";

const MARGIN = 16;
const BUTTON_SIZE = 52;
const BUTTON_GAP = 10;
const PANEL_WIDTH = GAME_WIDTH / 2;
const PANEL_X = GAME_WIDTH - PANEL_WIDTH;
const TEXT_RESOLUTION = 2;
const LIBRARY_TABS = ["プレゼント", "セリフ", "オブジェクト", "コレクション", "シークレット"];

// マップ画面に重ねる画面部品。左上＝タスク、右上＝ライブラリと設定のボタン。
// 設定（右半分）かライブラリ（全画面）を開いている間は、マップ側の動きを止める。
export class HudScene extends Phaser.Scene {
  constructor() {
    super("HudScene");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.openPanel = null; // "settings" | "library" | null
    this.uiRects = [];

    this.createTaskBox();
    this.createButtons();
    this.createSettingsPanel();
    this.createLibraryPanel();
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.cursorManager.reset());

    // 開発中だけ：?panel=settings / library / terms / credits で最初から開く
    const devPanel = import.meta.env.DEV ? new URLSearchParams(location.search).get("panel") : null;
    if (devPanel === "settings" || devPanel === "library") {
      this.setPanel(devPanel);
    } else if (devPanel === "terms") {
      this.setPanel("settings");
      this.showDetail("利用規約", TERMS_ITEMS);
    } else if (devPanel === "credits") {
      this.setPanel("settings");
      this.showDetail("クレジット", CREDIT_LINES);
    }
  }

  // 画面上のボタン・パネルの上かどうか（歩くスティックを始めないための判定）
  isOverUi(pointer) {
    return this.uiRects.some((rect) => rect.visible() && rect.contains(pointer.x, pointer.y));
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

  // ---- 左上のタスク ----
  createTaskBox() {
    const title = this.addText(MARGIN + 14, MARGIN + 10, "やること", 16, { color: CSS_COLORS.orangeLight });
    const tasks = this.addText(MARGIN + 14, MARGIN + 34, TASKS.map((task) => `・${task}`).join("\n"), 20, {
      lineSpacing: 4,
    });
    const width = Math.max(tasks.width, title.width) + 28;
    const height = tasks.height + 50;
    this.add.graphics()
      .fillStyle(COLORS.bgDark, 0.6)
      .fillRoundedRect(MARGIN, MARGIN, width, height, 8)
      .setDepth(-1);
  }

  // ---- 右上のボタン ----
  createButtons() {
    const y = MARGIN + BUTTON_SIZE / 2;
    const settingsX = GAME_WIDTH - MARGIN - BUTTON_SIZE / 2;
    const libraryX = settingsX - BUTTON_SIZE - BUTTON_GAP;

    this.settingsButton = this.createIconButton(settingsX, y, (icon) => this.drawGear(icon));
    this.libraryButton = this.createIconButton(libraryX, y, (icon) => this.drawBook(icon));
    this.settingsButton.setDepth(10);
    this.libraryButton.setDepth(10);

    this.bindButton(this.settingsButton, () => this.togglePanel("settings"));
    this.bindButton(this.libraryButton, () => this.togglePanel("library"));
    for (const button of [this.settingsButton, this.libraryButton]) {
      this.uiRects.push(this.rectOf(button.x - BUTTON_SIZE / 2, button.y - BUTTON_SIZE / 2, BUTTON_SIZE, BUTTON_SIZE));
    }
  }

  // アイコン絵を描く関数を受け取り、閉じた状態の絵とバツの絵を重ねて持つボタン
  createIconButton(x, y, drawIcon) {
    const body = this.add.rectangle(0, 0, BUTTON_SIZE, BUTTON_SIZE, COLORS.bgDark, 0.7)
      .setStrokeStyle(2, COLORS.orangeLight, 1);
    const inner = this.add.rectangle(0, 0, BUTTON_SIZE - 10, BUTTON_SIZE - 10)
      .setStrokeStyle(1, COLORS.peach, 0.6);
    const icon = this.add.container(0, 0);
    drawIcon(icon);
    const close = this.add.container(0, 0);
    this.drawCross(close);
    close.setVisible(false);

    const button = this.add.container(x, y, [body, inner, icon, close])
      .setSize(BUTTON_SIZE, BUTTON_SIZE)
      .setInteractive();
    button.iconClosed = icon;
    button.iconOpen = close;
    return button;
  }

  bindButton(button, onClick) {
    this.cursorManager.bind(button, "button", () => {
      if (this.scene.isActive("DialogScene")) {
        return;
      }
      onClick();
    });
  }

  drawGear(icon) {
    const cream = Phaser.Display.Color.HexStringToColor(CSS_COLORS.cream).color;
    for (let i = 0; i < 4; i += 1) {
      icon.add(this.add.rectangle(0, 0, 8, 33, cream).setAngle(i * 45));
    }
    icon.add(this.add.circle(0, 0, 12, cream));
    icon.add(this.add.circle(0, 0, 5, COLORS.bgDark));
  }

  drawBook(icon) {
    const cream = Phaser.Display.Color.HexStringToColor(CSS_COLORS.cream).color;
    icon.add(this.add.rectangle(-8, 0, 15, 22, cream));
    icon.add(this.add.rectangle(8, 0, 15, 22, cream));
    icon.add(this.add.rectangle(0, 0, 2, 24, COLORS.bgDark));
    icon.add(this.add.rectangle(-8, -3, 9, 2, COLORS.orange));
    icon.add(this.add.rectangle(8, -3, 9, 2, COLORS.orange));
    icon.add(this.add.rectangle(-8, 3, 9, 2, COLORS.orange));
    icon.add(this.add.rectangle(8, 3, 9, 2, COLORS.orange));
  }

  drawCross(icon) {
    const cream = Phaser.Display.Color.HexStringToColor(CSS_COLORS.cream).color;
    icon.add(this.add.rectangle(0, 0, 6, 28, cream).setAngle(45));
    icon.add(this.add.rectangle(0, 0, 6, 28, cream).setAngle(-45));
  }

  rectOf(x, y, width, height) {
    const rect = new Phaser.Geom.Rectangle(x, y, width, height);
    return Object.assign(rect, { visible: () => true });
  }

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
    this.settingsMenu.add(this.addText(left, top, "設定", 28));
    top += 54;

    if (this.sys.game.device.input.touch) {
      const notice = this.addText(
        left,
        top,
        "スマホで遊ぶ場合は、画面ロック（向きの固定）を\nオフにして、横画面にしてください。",
        15,
        { color: CSS_COLORS.peach, lineSpacing: 4 },
      );
      this.settingsMenu.add(notice);
      top += notice.height + 18;
    }

    const entries = [
      { label: "利用規約", onClick: () => this.showDetail("利用規約", TERMS_ITEMS) },
      { label: "クレジット", onClick: () => this.showDetail("クレジット", CREDIT_LINES) },
    ];
    for (const entry of entries) {
      const button = createButton(this, left + buttonWidth / 2, top + 28, buttonWidth, 56, entry.label, 24);
      this.cursorManager.bind(button, "button", entry.onClick);
      this.settingsMenu.add(button);
      top += 72;
    }

    const formReady = REPORT_FORM_URL !== "";
    const formButton = createButton(
      this,
      left + buttonWidth / 2,
      top + 28,
      buttonWidth,
      56,
      formReady ? "バグ報告フォーム" : "バグ報告フォーム（準備中）",
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
    top += 70;
    this.settingsMenu.add(this.addText(left, top, "※ Googleフォームに飛びます（別のタブで開きます）", 14, {
      color: CSS_COLORS.peach,
    }));

    this.detailTitle = this.addText(left, 24, "", 28);
    this.detailBody = this.addText(left, 76, "", 15, {
      lineSpacing: 6,
      wordWrap: { width: buttonWidth, useAdvancedWrap: true },
    });
    const back = createButton(this, left + 70, GAME_HEIGHT - 44, 140, 48, "戻る", 22);
    this.cursorManager.bind(back, "button", () => this.showMenu());
    this.settingsDetail.add([this.detailTitle, this.detailBody, back]);

    this.uiRects.push(Object.assign(new Phaser.Geom.Rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT), {
      visible: () => this.openPanel !== null,
    }));
  }

  showDetail(title, lines) {
    this.detailTitle.setText(title);
    this.detailBody.setText(lines.join("\n"));
    this.settingsMenu.setVisible(false);
    this.settingsDetail.setVisible(true);
  }

  showMenu() {
    this.settingsMenu.setVisible(true);
    this.settingsDetail.setVisible(false);
  }

  // ---- ライブラリ（全画面） ----
  createLibraryPanel() {
    const children = [];
    children.push(
      this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.bg, 0.98).setOrigin(0).setInteractive(),
    );
    children.push(this.addText(MARGIN + 14, MARGIN + 6, "ライブラリ", 30));

    // タブ（中身ができるまでは並べるだけ）。ボタンのぶん右を空ける
    const tabWidth = 124;
    LIBRARY_TABS.forEach((label, index) => {
      const x = MARGIN + 14 + index * (tabWidth + 8);
      children.push(
        this.add.rectangle(x, 78, tabWidth, 34, COLORS.bgDark, 0.7).setOrigin(0)
          .setStrokeStyle(1, COLORS.peach, 0.5),
        this.addText(x + tabWidth / 2, 95, label, 16, { color: CSS_COLORS.peach }).setOrigin(0.5),
      );
    });

    children.push(
      this.addText(GAME_WIDTH / 2, GAME_HEIGHT / 2 - 10, "まだ何もありません。\n話しかけたり、見つけたりすると、ここに集まります。", 20, {
        align: "center",
        lineSpacing: 8,
      }).setOrigin(0.5),
      this.addText(
        GAME_WIDTH / 2,
        GAME_HEIGHT - 52,
        "記録は、お使いのブラウザの中だけに保存されます（Cookieは使いません）。別の端末・別のブラウザには引き継がれません。\nシークレットモードや、サイトデータを消したときは、消えることがあります。",
        13,
        { color: CSS_COLORS.peach, align: "center", lineSpacing: 4, wordWrap: { width: GAME_WIDTH - 80, useAdvancedWrap: true } },
      ).setOrigin(0.5),
    );

    this.libraryPanel = this.add.container(0, 0, children).setDepth(5).setVisible(false);
  }

  // ---- 開け閉め ----
  togglePanel(name) {
    this.setPanel(this.openPanel === name ? null : name);
  }

  setPanel(name) {
    const wasOpen = this.openPanel !== null;
    this.openPanel = name;
    this.cursorManager.reset();

    this.settingsPanel.setVisible(name === "settings");
    this.libraryPanel.setVisible(name === "library");
    if (name === "settings") {
      this.showMenu();
    }
    this.settingsButton.iconClosed.setVisible(name !== "settings");
    this.settingsButton.iconOpen.setVisible(name === "settings");
    this.libraryButton.iconClosed.setVisible(name !== "library");
    this.libraryButton.iconOpen.setVisible(name === "library");

    // パネルを開いている間は、マップ側（歩く・会話）を止める
    if (name !== null && !wasOpen) {
      this.scene.get("FieldScene").virtualStick?.reset();
      this.scene.pause("FieldScene");
    } else if (name === null && wasOpen) {
      this.scene.resume("FieldScene");
    }
  }
}
