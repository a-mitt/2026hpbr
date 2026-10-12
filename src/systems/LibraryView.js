import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { npcs } from "../data/npcs.js";
import { createButton } from "./Button.js";
import { save } from "./save.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { t } from "./i18n.js";
import { CARD } from "./library/shared.js";
import { collectionMethods } from "./library/collection.js";
import { dialogueMethods } from "./library/dialogues.js";
import { giftMethods } from "./library/gifts.js";
import { koyaMethods } from "./library/koya.js";
import { objectMethods } from "./library/objects.js";
import { secretMethods } from "./library/secrets.js";

const MARGIN = 16;
const TEXT_RESOLUTION = 2;
const TABS = t(
  ["プレゼント", "セリフ", "オブジェクト", "コレクション", "シークレット"],
  ["Presents", "Dialogue", "Objects", "Collection", "Secrets"],
);

// ライブラリ（全画面）。HudScene の中に重ねて表示する部品
export class LibraryView {
  constructor(scene, cursorManager) {
    this.scene = scene;
    this.cursorManager = cursorManager;
    this.tab = 0;
    this.detail = null; // 詳細ページを開いているとき、その描画関数
    this.dialogNpcId = npcs[0].id;
    this.dialogPage = 0;
    this.tabRects = [];
    this.tabLabels = [];
    this.tabDots = [];

    this.container = scene.add.container(0, 0).setDepth(5).setVisible(false);
    this.body = scene.add.container(0, 0);
    this.build();
  }

  addText(x, y, label, fontSize, extra = {}) {
    return this.scene.add.text(x, y, label, {
      color: CSS_COLORS.cream,
      fontFamily: FONTS.ui,
      fontSize: `${fontSize}px`,
      resolution: TEXT_RESOLUTION,
      ...extra,
    });
  }

  build() {
    const scene = this.scene;
    this.container.add([
      scene.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, COLORS.bg, 0.98).setOrigin(0).setInteractive(),
      this.addText(MARGIN + 14, MARGIN + 6, t("ライブラリ", "Library"), 30),
    ]);

    // タブ（右上の設定・ライブラリボタンにかからない幅）
    const tabWidth = 124;
    TABS.forEach((label, index) => {
      const x = MARGIN + 14 + index * (tabWidth + 8);
      const rect = scene.add.rectangle(x, 78, tabWidth, 34, COLORS.bgDark, 0.7).setOrigin(0)
        .setStrokeStyle(1, COLORS.peach, 0.5).setInteractive();
      this.cursorManager.bind(rect, "button", () => this.selectTab(index));
      const text = this.addText(x + tabWidth / 2, 95, label, 16, { color: CSS_COLORS.peach }).setOrigin(0.5);
      this.tabRects.push(rect);
      this.tabLabels.push(text);
      const dot = scene.add.circle(x + tabWidth - 6, 82, 6, 0xe23b3b).setStrokeStyle(1, COLORS.cream);
      this.tabDots.push(dot);
      this.container.add([rect, text, dot]);
    });

    this.container.add(this.body);
    this.container.add(this.addText(
      GAME_WIDTH / 2,
      GAME_HEIGHT - 30,
      t(
        "記録は、お使いのブラウザの中だけに保存されます（Cookieは使いません）。別の端末・別のブラウザには引き継がれません。\nシークレットモードや、サイトデータを消したときは、消えることがあります。",
        "Your progress is saved only inside your browser (no cookies are used). It does not carry over to other devices or browsers.\nIt may be erased in private/incognito mode or when site data is cleared.",
      ),
      12,
      { color: CSS_COLORS.peach, align: "center", lineSpacing: 3, wordWrap: { width: GAME_WIDTH - 80, useAdvancedWrap: true } },
    ).setOrigin(0.5));
  }

  setVisible(isVisible) {
    this.container.setVisible(isVisible);
    if (!isVisible) {
      this.stopDetailAnimation();
    }
    if (isVisible) {
      this.detail = null;
      this.render();
    }
  }

  selectTab(index) {
    this.tab = index;
    this.detail = null;
    this.render();
  }

  // 保存が変わったときなどに、いま開いている画面を描き直す
  render() {
    this.cursorManager.reset();
    this.clearKoya();
    this.stopDetailAnimation();
    // いま見ているタブの新着は見たことにする（印は他のタブに残る）
    save.clearNew(this.tab);
    this.tabDots.forEach((dot, index) => dot.setVisible(save.hasNew(index)));
    this.body.removeAll(true);
    this.tabRects.forEach((rect, index) => {
      const active = index === this.tab;
      rect.setFillStyle(active ? COLORS.orange : COLORS.bgDark, active ? 0.55 : 0.7);
      this.tabLabels[index].setColor(active ? CSS_COLORS.cream : CSS_COLORS.peach);
    });

    this.renderKoya();
    if (this.detail) {
      this.detail();
      return;
    }
    const renderers = [
      () => this.renderGifts(),
      () => this.renderDialogues(),
      () => this.renderObjects(),
      () => this.renderCollection(),
      () => this.renderSecrets(),
    ];
    renderers[this.tab]();
  }

  // 詳細ページの絵のアニメーション（ゲーミングネクタイの色替え）を止める
  stopDetailAnimation() {
    this.detailTimer?.remove(false);
    this.detailTimer = null;
  }

  // ---- 共通部品 ----
  card(index, { title, sub = "", locked, icon, onClick, hint = "" }) {
    const col = index % CARD.cols;
    const row = Math.floor(index / CARD.cols);
    const x = CARD.x + col * (CARD.w + CARD.gap);
    const y = CARD.y + row * (CARD.h + CARD.gap);
    const rect = this.scene.add.rectangle(x, y, CARD.w, CARD.h, COLORS.bgDark, locked ? 0.45 : 0.75)
      .setOrigin(0).setStrokeStyle(1, COLORS.peach, locked ? 0.25 : 0.7);
    const iconObject = icon(x + CARD.w / 2, y + 62);
    const titleText = this.addText(x + CARD.w / 2, y + 112, title, 17, {
      align: "center",
      color: locked ? CSS_COLORS.peach : CSS_COLORS.cream,
      wordWrap: { width: CARD.w - 16, useAdvancedWrap: true },
    }).setOrigin(0.5, 0);
    this.body.add([rect, iconObject, titleText]);
    if (sub) {
      this.body.add(this.addText(x + CARD.w / 2, y + 8, sub, 13, { color: CSS_COLORS.peach }).setOrigin(0.5, 0));
    }
    if (!locked && onClick) {
      rect.setInteractive();
      this.cursorManager.bind(rect, "button", onClick);
    } else if (locked && hint) {
      // まだ解放されていないときは、押すとヒントが見られる
      rect.setInteractive();
      this.cursorManager.bind(rect, "button", () => this.openDetail(() => this.renderHint(hint)));
    }
  }

  // 未解放の項目のヒント
  renderHint(text) {
    this.body.add([
      this.addText(60, 136, t("ヒント", "Hint"), 30),
      this.addText(60, 200, text, 20, { lineSpacing: 8, wordWrap: { width: 840, useAdvancedWrap: true } }),
    ]);
  }

  // 詳細ページ。render が本文を作る。「戻る」で一覧に戻る
  openDetail(render) {
    this.detail = () => {
      render();
      const back = createButton(this.scene, 42 + 70, GAME_HEIGHT - 76, 140, 44, t("戻る", "Back"), 20);
      this.cursorManager.bind(back, "button", () => {
        this.detail = null;
        this.render();
      });
      this.body.add(back);
    };
    this.render();
  }

  placeholderBox(x, y, w, h, label) {
    return [
      this.scene.add.rectangle(x, y, w, h, COLORS.bgDark, 0.6).setStrokeStyle(1, COLORS.peach, 0.4),
      this.addText(x, y, label, 14, { color: CSS_COLORS.peach }).setOrigin(0.5),
    ];
  }

  markIcon(locked, mark = "◆") {
    return (x, y) => this.addText(x, y, locked ? "？" : mark, 44, {
      color: locked ? CSS_COLORS.peach : CSS_COLORS.orangeLight,
    }).setOrigin(0.5);
  }

}

// タブごとの処理は library/ に分けてある。ここで LibraryView のメソッドとして混ぜ込む
Object.assign(
  LibraryView.prototype,
  koyaMethods,
  giftMethods,
  dialogueMethods,
  objectMethods,
  collectionMethods,
  secretMethods,
);
