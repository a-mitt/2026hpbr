import Phaser from "phaser";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { GIFT_INFO, dialogues, ekuboGiftLines } from "../data/dialogues.js";
import { npcs } from "../data/npcs.js";
import { OBJECTS, SECRETS } from "../data/objects.js";
import { createButton } from "../systems/Button.js";
import { drawChibi } from "../systems/chibi.js";
import { save } from "../systems/save.js";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";
import { displayName, t } from "./i18n.js";

// ライブラリの絵に使うキャラ絵（FieldScene で読み込み済み）
const CHARA_TEXTURES = {
  tome: "chara_tome",
  ritsu: "chara_ritsu",
  shou: "chara_shou",
  mob: "chara_mob",
  ekubo: "chara_ekubo_1",
  teru: "chara_teru",
  serizawa: "chara_serizawa",
};
// こやの大きさ（絵は392×408）としっぽを振る速さ
const KOYA_SCALE = 0.36;
const KOYA_WAG_MS = 220;
const MARGIN = 16;
// 未解放の項目の名前
const UNKNOWN_LABEL = t("？？？", "???");
const TEXT_RESOLUTION = 2;
const TABS = t(
  ["プレゼント", "セリフ", "オブジェクト", "コレクション", "シークレット"],
  ["Presents", "Dialogue", "Objects", "Collection", "Secrets"],
);
const CARD = { w: 210, h: 150, gap: 12, cols: 4, x: 42, y: 132 };
const PAGE_VISUAL_LINES = 9;
const CHARS_PER_VISUAL_LINE = 36;

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

  // ---- こや（ハート画面で合計400になると、ライブラリに居る） ----
  // クリック・ドラッグ・指でこすると、しっぽを振って（左右の絵を交互に出して）、まわりにハートがぴろぴろ出る。
  // 絵は koya_idle／koya_wag_left／koya_wag_right（無い間は仮の丸）
  renderKoya() {
    if (!save.flag("secret_koya")) {
      return;
    }
    const scene = this.scene;
    const koya = scene.add.container(840, 418).setSize(150, 150).setInteractive();
    koya.lastHeartAt = 0;
    koya.wagLeft = true;
    if (scene.textures.exists("koya_idle")) {
      koya.sprite = scene.add.image(0, 0, "koya_idle").setScale(KOYA_SCALE);
    } else {
      koya.sprite = scene.add.circle(0, 0, 50, 0xf6d9b0).setStrokeStyle(3, 0x5a3320);
    }
    koya.add(koya.sprite);
    this.cursorManager.bind(koya, "button");
    koya.on("pointerdown", () => this.petKoya(koya));
    koya.on("pointermove", (pointer) => {
      if (pointer.isDown) {
        this.petKoya(koya);
      }
    });
    this.body.add(koya);
  }

  petKoya(koya) {
    const scene = this.scene;
    // 撫でている間は、しっぽを左右に振る
    if (!koya.wagEvent && scene.textures.exists("koya_wag_left")) {
      const wag = () => {
        koya.sprite.setTexture(koya.wagLeft ? "koya_wag_left" : "koya_wag_right");
        koya.wagLeft = !koya.wagLeft;
      };
      wag();
      koya.wagEvent = scene.time.addEvent({ delay: KOYA_WAG_MS, loop: true, callback: wag });
    }
    koya.restTimer?.remove(false);
    koya.restTimer = scene.time.delayedCall(450, () => {
      koya.wagEvent?.remove(false);
      koya.wagEvent = null;
      if (koya.active && scene.textures.exists("koya_idle")) {
        koya.sprite.setTexture("koya_idle");
      }
    });

    // こすっている間、ハートを次々に出す
    const now = scene.time.now;
    if (now - koya.lastHeartAt < 70) {
      return;
    }
    koya.lastHeartAt = now;
    const colors = ["#f49ac1", "#ff7fa8", "#ffb3c8"];
    const heart = this.addText(
      koya.x + Phaser.Math.Between(-70, 70),
      koya.y + Phaser.Math.Between(-70, 20),
      "♥",
      Phaser.Math.Between(18, 34),
      { color: Phaser.Utils.Array.GetRandom(colors) },
    ).setOrigin(0.5).setAngle(Phaser.Math.Between(-25, 25));
    this.body.add(heart);
    scene.tweens.add({
      targets: heart,
      y: heart.y - Phaser.Math.Between(40, 90),
      alpha: 0,
      duration: Phaser.Math.Between(600, 1000),
      onComplete: () => heart.destroy(),
    });
  }

  // ---- 共通部品 ----
  card(index, { title, sub = "", locked, icon, onClick }) {
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
    }
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

  // ---- プレゼント ----
  renderGifts() {
    npcs.forEach((npc, index) => {
      const locked = !save.hasGift(npc.id);
      const info = GIFT_INFO[npc.id];
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : info.gift,
        sub: locked ? "" : t(`${npc.name}から`, `From ${displayName(npc.name)}`),
        locked,
        icon: (x, y) => this.giftImage(npc.id, x, y + 4, 112, 76, locked),
        onClick: () => this.openDetail(() => {
          this.body.add([
            this.giftImage(npc.id, 730, 290, 300, 260, false),
            this.addText(60, 136, info.gift, 30),
            this.addText(60, 180, t(`${npc.name}からのプレゼント`, `Present from ${displayName(npc.name)}`), 18, { color: CSS_COLORS.orangeLight }),
            this.addText(60, 214, info.note, 17, { color: CSS_COLORS.peach, wordWrap: { width: 520, useAdvancedWrap: true } }),
            this.addText(60, 256, info.episode || t("（この人の想いやエピソードは準備中です）", "(This person's thoughts and episode are coming soon.)"), 18, {
              lineSpacing: 6,
              wordWrap: { width: 520, useAdvancedWrap: true },
            }),
            this.addText(60, 400, this.meaningText(info), 16, {
              color: CSS_COLORS.peach,
              wordWrap: { width: 520, useAdvancedWrap: true },
            }).setAlpha(0.55),
          ]);
        }),
      });
    });
  }

  // 意味は、タイトル画面で「恋愛的表現に抵抗が無い」にチェックした人にだけ見せる
  meaningText(info) {
    if (!info.meaning) {
      return "";
    }
    return save.flag("romanceOk")
      ? info.meaning
      : t("（この項目は、タイトル画面のチェックを入れると表示されます）", "(Shown if you tick the box on the title screen.)");
  }

  // プレゼントの絵を、maxW×maxH に収まる大きさで置く（locked ならシルエット）
  giftImage(npcId, x, y, maxW, maxH, locked) {
    const image = this.scene.add.image(x, y, `gift_${npcId}`);
    image.setScale(Math.min(maxW / image.width, maxH / image.height));
    if (locked) {
      image.setTintFill(0x1b0f0a);
    }
    return image;
  }

  // ---- セリフ ----
  dialogSources(npcId) {
    const sources = [{ key: npcId, lines: dialogues[npcId] }];
    if (npcId === "ekubo") {
      sources.push({ key: "ekubo2", lines: ekuboGiftLines });
    }
    return sources;
  }

  // 読んだところまでのセリフを、1行ずつの文字列にする
  seenLines(npcId) {
    const result = [];
    for (const { key, lines } of this.dialogSources(npcId)) {
      for (const line of lines.slice(0, save.seenCount(key))) {
        const who = displayName(line.speaker);
        result.push(line.narration ? t(`${who}：（${line.text}）`, `${who}: (${line.text})`) : t(`${who}：${line.text}`, `${who}: ${line.text}`));
      }
    }
    return result;
  }

  paginate(lines) {
    const pages = [];
    let current = [];
    let used = 0;
    for (const line of lines) {
      const visual = Math.ceil(line.length / CHARS_PER_VISUAL_LINE);
      if (current.length > 0 && used + visual > PAGE_VISUAL_LINES) {
        pages.push(current);
        current = [];
        used = 0;
      }
      current.push(line);
      used += visual;
    }
    if (current.length > 0) {
      pages.push(current);
    }
    return pages;
  }

  renderDialogues() {
    npcs.forEach((npc, index) => {
      const locked = this.seenLines(npc.id).length === 0;
      const y = CARD.y + index * 46;
      const button = createButton(this.scene, 42 + 80, y + 20, 160, 38, locked ? UNKNOWN_LABEL : displayName(npc.name), 18);
      const selected = npc.id === this.dialogNpcId;
      button.setAlpha(locked ? 0.4 : (selected ? 1 : 0.7));
      if (!locked) {
        this.cursorManager.bind(button, "button", () => {
          this.dialogNpcId = npc.id;
          this.dialogPage = 0;
          this.render();
        });
      }
      this.body.add(button);
    });

    const pages = this.paginate(this.seenLines(this.dialogNpcId));
    if (pages.length === 0) {
      this.body.add(this.addText(250, CARD.y + 4, t("話しかけると、ここにセリフが残ります。", "Talk to someone and their lines will be kept here."), 18, { color: CSS_COLORS.peach }));
      return;
    }
    this.dialogPage = Phaser.Math.Clamp(this.dialogPage, 0, pages.length - 1);
    this.body.add(this.addText(250, CARD.y + 4, pages[this.dialogPage].join("\n"), 17, {
      lineSpacing: 8,
      wordWrap: { width: 660, useAdvancedWrap: true },
    }));

    if (pages.length > 1) {
      const prev = createButton(this.scene, 520, 436, 90, 38, "◀", 18);
      const next = createButton(this.scene, 740, 436, 90, 38, "▶", 18);
      prev.setAlpha(this.dialogPage > 0 ? 1 : 0.35);
      next.setAlpha(this.dialogPage < pages.length - 1 ? 1 : 0.35);
      this.cursorManager.bind(prev, "button", () => this.turnPage(-1, pages.length));
      this.cursorManager.bind(next, "button", () => this.turnPage(1, pages.length));
      this.body.add([
        prev,
        next,
        this.addText(630, 436, `${this.dialogPage + 1} / ${pages.length}`, 16, { color: CSS_COLORS.peach }).setOrigin(0.5),
      ]);
    }
  }

  turnPage(step, pageCount) {
    const next = this.dialogPage + step;
    if (next >= 0 && next < pageCount) {
      this.dialogPage = next;
      this.render();
    }
  }

  // ---- オブジェクト ----
  renderObjects() {
    OBJECTS.forEach((object, index) => {
      const locked = !save.hasObject(object.id);
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : object.name,
        locked,
        icon: this.markIcon(locked),
        onClick: () => this.openDetail(() => {
          this.body.add([
            this.addText(60, 136, object.name, 30),
            this.addText(60, 190, object.text, 19, { lineSpacing: 8, wordWrap: { width: 840, useAdvancedWrap: true } }),
          ]);
        }),
      });
    });
  }

  // ---- コレクション（キャラ） ----
  renderCollection() {
    npcs.forEach((npc, index) => {
      const locked = !save.hasGift(npc.id);
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : displayName(npc.name),
        locked,
        icon: (x, y) => drawChibi(this.scene, x, y, CHARA_TEXTURES[npc.id], { locked, scale: 0.42 }),
        onClick: () => this.openDetail(() => {
          const info = GIFT_INFO[npc.id];
          this.body.add([
            this.addText(60, 136, displayName(npc.name), 30),
            drawChibi(this.scene, 150, 290, CHARA_TEXTURES[npc.id], { scale: 1.1 }),
            ...this.placeholderBox(330, 270, 170, 240, t("立ち絵（準備中）", "Standing art (coming soon)")),
            this.addText(520, 190, t(`プレゼント\n${info.gift}`, `Present\n${info.gift}`), 18, { color: CSS_COLORS.orangeLight, lineSpacing: 6 }),
          ]);
        }),
      });
    });
  }

  // ---- シークレット ----
  renderSecrets() {
    SECRETS.forEach((secret, index) => {
      const locked = !save.flag(`secret_${secret.id}`);
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : secret.name,
        locked,
        icon: this.markIcon(locked, "★"),
        onClick: () => this.openDetail(() => this.renderSecretDetail(secret)),
      });
    });
  }

  // シークレットの詳細：エンディングは「もう一度見る」、絵は大きく見せる
  renderSecretDetail(secret) {
    const scene = this.scene;
    this.body.add(this.addText(60, 136, secret.name, 30));

    const endings = { true_end: "true", normal_end: "normal", bad_end: "bad" };
    if (endings[secret.id]) {
      this.body.add(this.addText(60, 190, t("このエンディングを、もう一度見られます。", "You can watch this ending again."), 18, {
        color: CSS_COLORS.peach,
      }));
      const watch = createButton(scene, 60 + 130, 270, 260, 60, t("もう一度見る", "Watch again"), 24);
      this.cursorManager.bind(watch, "button", () => {
        this.cursorManager.reset();
        scene.scene.launch("EndingScene", { kind: endings[secret.id], replay: true });
      });
      this.body.add(watch);
      return;
    }

    // 絵のシークレット（お祝いの一枚絵・こや・原作の隆）
    const pictures = {
      happy_picture: "birthday_picture",
      koya: "reia_left",
      takashi: "takashi",
      takashi_bath: "takashi_bath",
    };
    const key = pictures[secret.id];
    if (key && scene.textures.exists(key)) {
      const picture = scene.add.image(GAME_WIDTH / 2, 316, key);
      picture.setScale(Math.min(560 / picture.width, 270 / picture.height));
      this.body.add(picture);
    }
  }
}
