import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { getTasks } from "../data/tasks.js";
import { CursorManager } from "../systems/CursorManager.js";
import { HeartView } from "../systems/HeartView.js";
import { LibraryView } from "../systems/LibraryView.js";
import { save } from "../systems/save.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { t } from "../systems/i18n.js";
import { applyDevQuery } from "../systems/devTools.js";
import { iconMethods } from "../systems/hudIcons.js";
import { settingsMethods } from "../systems/settingsPanel.js";

const MARGIN = 16;
const BUTTON_SIZE = 52;
const BUTTON_GAP = 10;
const TEXT_RESOLUTION = 2;

// マップ画面に重ねる画面部品。左上＝タスク、右上＝ライブラリと設定のボタン。
// 設定（右半分）かライブラリ（全画面）を開いている間は、マップ側の動きを止める。
export class HudScene extends Phaser.Scene {
  constructor() {
    super("HudScene");
  }

  // 始めの10秒だけ、操作説明の場所を知らせる
  showHowToHint() {
    const text = this.add.text(GAME_WIDTH / 2, GAME_HEIGHT - 90, t("操作説明は、右上の設定（歯車）から開けます", "You can see how to play from Settings (gear icon) at the top right"), {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: "18px",
      stroke: "#26343a",
      strokeThickness: 4,
    }).setOrigin(0.5).setDepth(3);
    this.tweens.add({ targets: text, alpha: 0, delay: 9000, duration: 1000, onComplete: () => text.destroy() });
  }

  create() {
    this.showHowToHint();
    this.cursorManager = new CursorManager(this.game);
    this.openPanel = null; // "settings" | "library" | null
    this.uiRects = [];

    this.createTaskBox();
    this.createButtons();
    this.createSettingsPanel();
    this.createLibraryPanel();
    this.heart = new HeartView(this, this.cursorManager);
    const offSave = save.onChange(() => {
      this.renderTasks();
      this.updateBadge();
    });
    const onTasksChanged = () => this.renderTasks();
    this.game.events.on("tasks-changed", onTasksChanged);
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => {
      offSave();
      this.game.events.off("tasks-changed", onTasksChanged);
      this.cursorManager.reset();
    });

    // トゥルーエンドを夜から見直したあと：ライブラリのシークレットを開いた状態で戻る
    if (this.game.registry.get("reopenLibrary")) {
      this.game.registry.set("reopenLibrary", false);
      this.setPanel("library");
      this.library.selectTab(4);
    }

    applyDevQuery(this);
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
    this.taskBackground = this.add.graphics().setDepth(-1);
    this.taskTitle = this.addText(MARGIN + 14, MARGIN + 10, t("やること", "To Do"), 16, { color: CSS_COLORS.orangeLight });
    this.taskText = this.addText(MARGIN + 14, MARGIN + 34, "", 20, { lineSpacing: 4 });
    this.renderTasks();
  }

  renderTasks() {
    this.taskText.setText(getTasks().map((task) => `${task.done() ? "✓" : "・"}${task.label}`).join("\n"));
    const width = Math.max(this.taskText.width, this.taskTitle.width) + 28;
    const height = this.taskText.height + 50;
    this.taskBackground.clear()
      .fillStyle(COLORS.bgDark, 0.6)
      .fillRoundedRect(MARGIN, MARGIN, width, height, 8);
  }

  // ---- 右上のボタン ----
  createButtons() {
    const y = MARGIN + BUTTON_SIZE / 2;
    const settingsX = GAME_WIDTH - MARGIN - BUTTON_SIZE / 2;
    const libraryX = settingsX - BUTTON_SIZE - BUTTON_GAP;

    this.settingsButton = this.createIconButton(settingsX, y, (icon) => this.drawGear(icon));
    this.libraryButton = this.createIconButton(libraryX, y, (icon) => this.drawBook(icon));
    const heartX = libraryX - BUTTON_SIZE - BUTTON_GAP;
    this.heartButton = this.createIconButton(heartX, y, (icon) => this.drawHeart(icon));
    this.heartButton.setDepth(10);
    this.settingsButton.setDepth(10);
    this.libraryButton.setDepth(10);
    // 新着があるときの赤丸（ライブラリのアイコンの右上）
    this.badge = this.add.circle(libraryX + BUTTON_SIZE / 2 - 4, y - BUTTON_SIZE / 2 + 4, 9, 0xe23b3b)
      .setStrokeStyle(2, COLORS.cream).setDepth(11);
    this.updateBadge();

    this.bindButton(this.settingsButton, () => this.togglePanel("settings"));
    this.bindButton(this.libraryButton, () => this.togglePanel("library"));
    this.bindButton(this.heartButton, () => this.togglePanel("heart"));
    for (const button of [this.settingsButton, this.libraryButton, this.heartButton]) {
      this.uiRects.push(this.rectOf(button.x - BUTTON_SIZE / 2, button.y - BUTTON_SIZE / 2, BUTTON_SIZE, BUTTON_SIZE));
    }
  }

  updateBadge() {
    this.badge.setVisible(save.hasNew());
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
      if (this.scene.isActive("DialogScene") || this.scene.isActive("ExitPromptScene")) {
        return;
      }
      onClick();
    });
  }

  rectOf(x, y, width, height) {
    const rect = new Phaser.Geom.Rectangle(x, y, width, height);
    return Object.assign(rect, { visible: () => true });
  }

  // ---- ライブラリ（全画面） ----
  createLibraryPanel() {
    this.library = new LibraryView(this, this.cursorManager);
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
    this.library.setVisible(name === "library");
    this.heart.setVisible(name === "heart");
    if (name === "settings") {
      this.showMenu();
    }
    this.settingsButton.iconClosed.setVisible(name !== "settings");
    this.settingsButton.iconOpen.setVisible(name === "settings");
    this.libraryButton.iconClosed.setVisible(name !== "library");
    this.libraryButton.iconOpen.setVisible(name === "library");
    this.heartButton.iconClosed.setVisible(name !== "heart");
    this.heartButton.iconOpen.setVisible(name === "heart");

    // パネルを開いている間は、マップ側（歩く・会話）を止める
    if (name !== null && !wasOpen) {
      this.scene.get("FieldScene").virtualStick?.reset();
      this.scene.pause("FieldScene");
    } else if (name === null && wasOpen) {
      this.scene.resume("FieldScene");
    }
  }
}

// 設定パネルとアイコン絵の処理は systems/ に分けてある。ここで HudScene のメソッドとして混ぜ込む
Object.assign(HudScene.prototype, settingsMethods, iconMethods);
