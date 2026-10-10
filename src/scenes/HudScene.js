import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { CREDIT_LINES, REPORT_FORM_URL, TERMS_ITEMS } from "../data/notices.js";
import { getTasks } from "../data/tasks.js";
import { dialogues, ekuboGiftLines } from "../data/dialogues.js";
import { npcs } from "../data/npcs.js";
import { OBJECTS } from "../data/objects.js";
import { CursorManager } from "../systems/CursorManager.js";
import { createButton } from "../systems/Button.js";
import { HeartView } from "../systems/HeartView.js";
import { LibraryView } from "../systems/LibraryView.js";
import { save } from "../systems/save.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { t } from "../systems/i18n.js";

const MARGIN = 16;
const BUTTON_SIZE = 52;
const BUTTON_GAP = 10;
const PANEL_WIDTH = GAME_WIDTH / 2;
const PANEL_X = GAME_WIDTH - PANEL_WIDTH;
const TEXT_RESOLUTION = 2;

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

    // 開発中だけ：?panel=settings / library / terms / credits で最初から開く
    const devQuery = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    const devPanel = devQuery?.get("panel");
    // 開発中だけ：?unlock=1 で全部解放、?tab=0〜4 でライブラリのタブを指定
    // ?koya=1 でこやの解放後、?count=99 で4つのお祝いを99回にしておく
    if (devQuery?.get("koya")) {
      save.unlockSecret("koya");
    }
    // ?heart=reia0|reia25|reia50|reia75|left|takashi|bath でハート画面をその段階にする
    this.applyHeartPresetForDev(devQuery?.get("heart"));
    for (let i = 0; i < Number(devQuery?.get("count") ?? 0); i += 1) {
      ["clap", "cracker", "say", "balloon"].forEach((id) => save.count(id) < 1000 && save.addCount(id));
    }
    if (devQuery?.get("unlock")) {
      this.unlockEverythingForDev();
    }
    if (devPanel === "settings" || devPanel === "library" || devPanel === "heart") {
      this.setPanel(devPanel);
      if (devQuery.get("tab")) {
        this.library.selectTab(Number(devQuery.get("tab")));
      }
    } else if (devPanel === "terms") {
      this.setPanel("settings");
      this.showDetail(t("利用規約", "Terms of Use"), TERMS_ITEMS);
    } else if (devPanel === "credits") {
      this.setPanel("settings");
      this.showDetail(t("クレジット", "Credits"), CREDIT_LINES);
    }
  }

  applyHeartPresetForDev(preset) {
    const presets = {
      reia0: [0, 0, 0, 0],
      reia25: [7, 6, 6, 6],
      reia50: [13, 13, 12, 12],
      reia75: [19, 19, 19, 18],
      left: [100, 100, 100, 100],
      takashi: [1000, 1000, 1000, 1000],
      bath: [4000, 4000, 4000, 4000],
    };
    if (!presets[preset]) {
      return;
    }
    ["clap", "cracker", "say", "balloon"].forEach((id, index) => save.setCount(id, presets[preset][index]));
    for (const [flag, on] of [["secret_koya", ["left", "takashi", "bath"]], ["secret_takashi", ["takashi", "bath"]], ["secret_takashi_bath", ["bath"]]]) {
      save.setFlag(flag, on.includes(preset));
    }
  }

  unlockEverythingForDev() {
    for (const npc of npcs) {
      save.giveGift(npc.id);
      save.markSeen(npc.id, dialogues[npc.id].length);
    }
    save.markSeen("ekubo2", ekuboGiftLines.length);
    for (const object of OBJECTS) {
      save.foundObject(object.id);
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

  drawHeart(icon) {
    icon.add(this.add.text(0, 1, "♥", {
      color: "#f49ac1",
      fontFamily: FONTS.ui,
      fontSize: "34px",
      resolution: TEXT_RESOLUTION,
    }).setOrigin(0.5));
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
      { label: t("利用規約", "Terms of Use"), onClick: () => this.showDetail(t("利用規約", "Terms of Use"), TERMS_ITEMS) },
      { label: t("クレジット", "Credits"), onClick: () => this.showDetail(t("クレジット", "Credits"), CREDIT_LINES) },
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
      formReady ? t("バグ報告フォーム", "Bug Report Form") : t("バグ報告フォーム（準備中）", "Bug Report Form (coming soon)"),
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
    this.settingsMenu.add(this.addText(left, top, t("※ Googleフォームに飛びます（別のタブで開きます）", "* Opens a Google Form (in a new tab)"), 14, {
      color: CSS_COLORS.peach,
    }));
    top += 40;

    // 進み具合を消して最初からやり直す（押し間違い防止に、2回押したときだけ実行）
    const resetButton = createButton(this, left + buttonWidth / 2, top + 24, buttonWidth, 48, t("進み具合をリセット", "Reset progress"), 20);
    const resetLabel = resetButton.list[resetButton.list.length - 1];
    let armed = false;
    this.cursorManager.bind(resetButton, "button", () => {
      if (!armed) {
        armed = true;
        resetLabel.setText(t("もう一度押すと、最初からになります", "Press again to start over"));
        this.time.delayedCall(4000, () => {
          armed = false;
          resetLabel.setText(t("進み具合をリセット", "Reset progress"));
        });
        return;
      }
      save.reset();
      window.location.reload();
    });
    this.settingsMenu.add(resetButton);

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
