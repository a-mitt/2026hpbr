import Phaser from "phaser";
import { DialogManager } from "../systems/DialogManager.js";
import { save } from "../systems/save.js";
import { COLORS, FONTS } from "../theme.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { t } from "../systems/i18n.js";

// 会話枠（画面の下）と本文：幅と行数。これを超える長さは次のページに分ける
const BOX_HEIGHT = 180;
const BOX_TOP = GAME_HEIGHT - BOX_HEIGHT;
const BODY_X = 64;
const BODY_WIDTH = 830;
const BODY_FONT_SIZE = 22;
const BODY_LINES = 3;
// 立ち絵（枠の上）：左に相手、右に霊幻。しゃべっている方が明るく、もう一方は暗くなる
const STAND_SCALE = 2.1;
// 霊幻の立ち絵（400×600、キャラは左右の中心より右にずれて描かれている）
const PLAYER_STAND_SCALE = 0.92;
const PLAYER_STAND_ORIGIN_X = 0.59;
const SPEAKING_SCALE_RATIO = 1.04;
const playerStandKey = (face) => `stand_reigen_${face}`;
const STAND_LEFT_X = 250;
const STAND_RIGHT_X = 700;
// 立ち絵は会話枠のうしろまで伸ばして、大きく見せる（枠は半透明）
const STAND_BOTTOM_Y = GAME_HEIGHT + 24;
const DIM_TINT = 0x3f3f4d;
const PLAYER_NAME = "霊幻";

// 禁則処理：行の先頭に来てはいけない文字は前の行の終わりにぶら下げ、行末に来てはいけない文字は次の行へ送る
const NO_LINE_START = "、。，．,.！？!?）」』】〕〉》〗)]ー…・：；ぁぃぅぇぉっゃゅょァィゥェォッャュョ々";
const NO_LINE_END = "（「『【〔〈《〖([";

function applyKinsoku(lines) {
  const result = lines.map((line) => line);
  for (let i = 1; i < result.length; i += 1) {
    while (result[i].length > 0 && NO_LINE_START.includes(result[i][0])) {
      result[i - 1] += result[i][0];
      result[i] = result[i].slice(1);
    }
    // 「）」だけの行のように空になった行は、なくす
    if (result[i].length === 0) {
      result.splice(i, 1);
      i -= 1;
      continue;
    }
    while (result[i - 1].length > 1 && NO_LINE_END.includes(result[i - 1].slice(-1))) {
      result[i] = result[i - 1].slice(-1) + result[i];
      result[i - 1] = result[i - 1].slice(0, -1);
    }
  }
  return result;
}

// 話者ごとの絵（public/assets/chara/）
const PORTRAIT_TEXTURES = {
  霊幻: "chara_reigen_down",
  トメ: "chara_tome",
  律: "chara_ritsu",
  ショウ: "chara_shou",
  モブ: "chara_mob",
  エクボ: "chara_ekubo_1",
  テル: "chara_teru",
  芹沢: "chara_serizawa",
};

export class DialogScene extends Phaser.Scene {
  constructor() {
    super("DialogScene");
  }

  create({ npc, lines, dialogKey, onFinish, gift = null, portraits = {} }) {
    this.onFinish = onFinish;
    this.portraitOverrides = portraits;

    // 立ち絵が見やすいよう、マップ全体を少し暗くする
    this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.5).setOrigin(0);
    this.createStands(npc);

    this.add.rectangle(GAME_WIDTH / 2, BOX_TOP + BOX_HEIGHT / 2, GAME_WIDTH, BOX_HEIGHT, COLORS.bgDark, 0.74)
      .setStrokeStyle(2, COLORS.orangeLight, 0.95);
    this.nameBox = this.add.rectangle(36, BOX_TOP + 4, 188, 34, COLORS.indigo)
      .setStrokeStyle(1, COLORS.orangeLight, 0.9)
      .setOrigin(0, 0.5);
    this.nameText = this.add.text(52, BOX_TOP + 4, "", {
      color: "#fff0d6",
      fontFamily: FONTS.ui,
      fontSize: "19px",
    }).setOrigin(0, 0.5);
    const bodyStyle = {
      color: "#fff7e8",
      fontFamily: FONTS.body,
      fontSize: `${BODY_FONT_SIZE}px`,
      lineSpacing: 8,
      // 日本語は空白がないので、advanced wrap で文字ごとに折り返す
      wordWrap: { width: BODY_WIDTH, useAdvancedWrap: true },
    };
    // 折り返しはページ分けのときに済ませてある（ぶら下げの句読点がはみ出して再び折り返されないよう、ここでは折り返さない）
    const { wordWrap, ...displayStyle } = bodyStyle;
    this.bodyText = this.add.text(BODY_X, BOX_TOP + 36, "", displayStyle);
    this.advanceHint = this.add.text(GAME_WIDTH - 36, GAME_HEIGHT - 24, "▼", {
      color: "#f3d38d",
      fontFamily: FONTS.ui,
      fontSize: "21px",
    }).setOrigin(0.5).setVisible(false);
    this.tweens.add({
      targets: this.advanceHint,
      alpha: 0.25,
      duration: 350,
      yoyo: true,
      repeat: -1,
    });

    this.dialogManager = new DialogManager(
      this,
      this.nameText,
      this.bodyText,
      this.advanceHint,
      () => this.endDialog(),
      {
        nameBox: this.nameBox,
        // 読んだ行数を保存（ライブラリの「セリフ」用）
        onLine: (index) => {
          this.focusSpeaker(pages[index].speaker, pages[index].face);
          if (dialogKey) {
            save.markSeen(dialogKey, pages[index].origIndex + 1);
          }
        },
      },
    );
    // 長いセリフは、枠に入る行数（3行）ごとに次のページへ分ける
    const pages = this.paginate(lines, bodyStyle);
    this.confirmKeys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });
    this.input.on("pointerdown", () => this.confirm());

    // プレゼントをもらう場面があるときは、先にそれを見せてから会話に入る
    this.giftPopup = gift ? this.showGift(gift) : null;
    if (!this.giftPopup) {
      this.dialogManager.start(pages);
    } else {
      this.pendingPages = pages;
    }
  }

  // 立ち絵：左に相手、右に霊幻（相手がいない＝霊幻ひとりのときは真ん中）
  createStands(npc) {
    this.stands = [];
    const alone = npc.name === PLAYER_NAME;
    if (!alone) {
      this.addStand(npc.name, STAND_LEFT_X);
    }
    this.addStand(PLAYER_NAME, alone ? GAME_WIDTH / 2 : STAND_RIGHT_X);
  }

  addStand(name, x) {
    // 霊幻は表情つきの立ち絵（stand_reigen_*）。ほかの人はマップの絵を大きくしたもの
    const isPlayer = name === PLAYER_NAME;
    const key = isPlayer && this.textures.exists(playerStandKey("normal"))
      ? playerStandKey("normal")
      : (this.portraitOverrides[name] ?? PORTRAIT_TEXTURES[name]);
    if (!key || !this.textures.exists(key)) {
      return;
    }
    const image = this.add.image(x, STAND_BOTTOM_Y, key).setOrigin(isPlayer ? PLAYER_STAND_ORIGIN_X : 0.5, 1);
    this.stands.push({ name, image, isPlayer });
    this.applyStandScale(this.stands[this.stands.length - 1], false);
  }

  // 立ち絵の大きさ（しゃべっている人は少し大きく）。霊幻の絵は大きさの基準が違う
  applyStandScale(stand, speaking) {
    const base = stand.isPlayer ? PLAYER_STAND_SCALE : STAND_SCALE;
    stand.image.setScale(base * (speaking ? SPEAKING_SCALE_RATIO : 1));
  }

  // しゃべっている人を明るく、もう一方を暗くする（誰も該当しなければ全員そのまま）。
  // 霊幻がしゃべるときは、その行の表情（face）の立ち絵にする
  focusSpeaker(speaker, face = "normal") {
    for (const stand of this.stands) {
      const speaking = stand.name === speaker;
      if (stand.isPlayer && this.textures.exists(playerStandKey(face))) {
        stand.image.setTexture(playerStandKey(face));
      }
      if (speaking) {
        stand.image.clearTint();
        stand.image.setDepth(1);
      } else {
        stand.image.setTint(DIM_TINT);
        stand.image.setDepth(0);
      }
      this.applyStandScale(stand, speaking);
    }
  }

  confirm() {
    if (this.giftPopup) {
      this.giftPopup.destroy();
      this.giftPopup = null;
      this.dialogManager.start(this.pendingPages);
      return;
    }
    this.dialogManager.confirm();
  }

  paginate(lines, style) {
    const measure = this.add.text(0, 0, "", style).setVisible(false);
    const pages = [];
    lines.forEach((line, origIndex) => {
      // 霊幻が心の中で思っている文章（地の文）は（ ）で囲む
      const text = line.narration && !line.text.startsWith("（")
        ? t(`（${line.text}）`, `(${line.text})`)
        : line.text;
      const wrapped = applyKinsoku(measure.getWrappedText(text));
      for (let start = 0; start === 0 || start < wrapped.length; start += BODY_LINES) {
        pages.push({ ...line, text: wrapped.slice(start, start + BODY_LINES).join("\n"), origIndex });
      }
    });
    measure.destroy();
    return pages;
  }

  // 半透明の窓に、プレゼントのイラストと名前を出す（クリックで会話へ）
  showGift(gift) {
    const cx = GAME_WIDTH / 2;
    const cy = 190;
    const parts = [
      this.add.rectangle(0, 0, GAME_WIDTH, GAME_HEIGHT, 0x000000, 0.45).setOrigin(0),
      this.add.rectangle(cx, cy, 420, 290, COLORS.bgDark, 0.82).setStrokeStyle(2, COLORS.orangeLight, 0.95),
      this.add.text(cx, cy - 118, t("プレゼントをもらった！", "You received a present!"), {
        color: "#f3d38d",
        fontFamily: FONTS.ui,
        fontSize: "20px",
        resolution: 2,
      }).setOrigin(0.5),
    ];
    // イラスト（絵が置かれていれば gift_{id}、無い間は仮の枠）
    const key = `gift_${gift.id}`;
    if (this.textures.exists(key)) {
      // 窓の真ん中の 260×150 に収まるように拡大・縮小する
      const picture = this.add.image(cx, cy - 22, key);
      picture.setScale(Math.min(260 / picture.width, 150 / picture.height));
      parts.push(picture);
    } else {
      parts.push(
        this.add.rectangle(cx, cy - 24, 150, 130, COLORS.panel, 0.7).setStrokeStyle(1, 0xc6c7bd, 0.7),
        this.add.text(cx, cy - 24, t("（イラスト）", "(Illustration)"), {
          color: "#c9b79c",
          fontFamily: FONTS.ui,
          fontSize: "16px",
        }).setOrigin(0.5),
      );
    }
    parts.push(this.add.text(cx, cy + 82, gift.name, {
      color: "#fff7e8",
      fontFamily: FONTS.ui,
      fontSize: "28px",
      resolution: 2,
      align: "center",
      wordWrap: { width: 390, useAdvancedWrap: true },
    }).setOrigin(0.5));
    return this.add.container(0, 0, parts).setDepth(10);
  }

  update() {
    if (
      Phaser.Input.Keyboard.JustDown(this.confirmKeys.space)
      || Phaser.Input.Keyboard.JustDown(this.confirmKeys.enter)
    ) {
      this.confirm();
    }
  }

  endDialog() {
    this.scene.stop();
    this.scene.resume("FieldScene");
    this.onFinish?.();
  }
}
