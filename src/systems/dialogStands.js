import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";
import { objectPictureKey } from "../data/objects.js";
import { GAMING_TIE } from "../data/mapLayout.js";

// 立ち絵（枠の上）：左に相手、右に霊幻。しゃべっている方が明るく、もう一方は暗くなる
export const STAND_SCALE = 2.1;
// 霊幻の立ち絵（400×600、キャラは左右の中心より右にずれて描かれている）
export const PLAYER_STAND_SCALE = 0.92;
export const PLAYER_STAND_ORIGIN_X = 0.59;
export const SPEAKING_SCALE_RATIO = 1.04;
export const playerStandKey = (face) => `stand_reigen_${face}`;
export const STAND_LEFT_X = 250;
export const STAND_RIGHT_X = 700;
// 立ち絵は会話枠のうしろまで伸ばして、大きく見せる（枠は半透明）
export const STAND_BOTTOM_Y = GAME_HEIGHT + 24;
export const DIM_TINT = 0x3f3f4d;
// 重なり順：暗くする幕 ＜ 立ち絵 ＜ 会話枠（半透明）。立ち絵は、しゃべっている方も枠の後ろ
export const DEPTH_DIM = -3;
export const DEPTH_STAND = -2;
export const DEPTH_STAND_SPEAKING = -1;
export const PLAYER_NAME = "霊幻";
// 物を調べるときの絵：左〜真ん中（会話枠の上）に大きく出す
// 小さい絵が大きくなりすぎないよう、物ごとの拡大の上限
export const OBJECT_PICTURE_MAX_SCALE = { gamingtie: 3.4 };
// 絵だけ指定されたもの（たこ焼きなど）の大きさの上限
export const SMALL_PICTURE_AREA = { maxW: 220, maxH: 150 };
export const OBJECT_PICTURE_AREA = { x: 330, y: 190, maxW: 520, maxH: 280, maxScale: 5 };

// 話者ごとの絵（public/assets/chara/）
export const PORTRAIT_TEXTURES = {
  霊幻: "chara_reigen_down",
  トメ: "chara_tome",
  律: "chara_ritsu",
  ショウ: "chara_shou",
  モブ: "chara_mob",
  エクボ: "chara_ekubo_1",
  テル: "chara_teru",
  芹沢: "chara_serizawa",
};

// 会話画面の立ち絵と、調べた物の絵。DialogScene のメソッドとして混ぜ込む（this は DialogScene）
export const standMethods = {
  // 立ち絵：左に相手、右に霊幻（相手がいない＝霊幻ひとりのときは真ん中）
  createStands(npc, withPicture = false) {
    this.stands = [];
    // 物の絵があるときは、霊幻は右側（相手と話すときと同じ位置）
    const alone = npc.name === PLAYER_NAME && !withPicture;
    if (!alone && npc.name !== PLAYER_NAME) {
      this.addStand(npc.name, STAND_LEFT_X);
    }
    this.addStand(PLAYER_NAME, alone ? GAME_WIDTH / 2 : STAND_RIGHT_X);
  },

  // 調べた物の絵（あれば）を真ん中に出す。ゲーミングネクタイは色が変わり続ける
  showObjectPicture(objectId, pictureKey = null) {
    const key = pictureKey ?? objectPictureKey(objectId);
    if (!this.textures.exists(key)) {
      return null;
    }
    const area = OBJECT_PICTURE_AREA;
    const picture = this.add.image(area.x, area.y, key).setDepth(DEPTH_STAND);
    const fit = pictureKey ? SMALL_PICTURE_AREA : area;
    picture.setScale(Math.min(fit.maxW / picture.width, fit.maxH / picture.height, OBJECT_PICTURE_MAX_SCALE[objectId] ?? area.maxScale));
    if (objectId === "gamingtie") {
      const keys = GAMING_TIE.files.map((file) => file.key).filter((tieKey) => this.textures.exists(tieKey));
      let index = 0;
      this.time.addEvent({
        delay: GAMING_TIE.intervalMs,
        loop: true,
        callback: () => {
          index = (index + 1) % keys.length;
          picture.setTexture(keys[index]);
        },
      });
    }
    return picture;
  },

  addStand(name, x) {
    // 霊幻は表情つきの立ち絵（stand_reigen_*）。ほかの人はマップの絵を大きくしたもの
    const isPlayer = name === PLAYER_NAME;
    const key = isPlayer && this.textures.exists(playerStandKey("normal"))
      ? playerStandKey("normal")
      : (this.portraitOverrides[name] ?? PORTRAIT_TEXTURES[name]);
    if (!key || !this.textures.exists(key)) {
      return;
    }
    const image = this.add.image(x, STAND_BOTTOM_Y, key).setOrigin(isPlayer ? PLAYER_STAND_ORIGIN_X : 0.5, 1)
      .setDepth(DEPTH_STAND);
    this.stands.push({ name, image, isPlayer });
    this.applyStandScale(this.stands[this.stands.length - 1], false);
  },

  // 立ち絵の大きさ（しゃべっている人は少し大きく）。霊幻の絵は大きさの基準が違う
  applyStandScale(stand, speaking) {
    const base = stand.isPlayer ? PLAYER_STAND_SCALE : STAND_SCALE;
    stand.image.setScale(base * (speaking ? SPEAKING_SCALE_RATIO : 1));
  },

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
        stand.image.setDepth(DEPTH_STAND_SPEAKING);
      } else {
        stand.image.setTint(DIM_TINT);
        stand.image.setDepth(DEPTH_STAND);
      }
      this.applyStandScale(stand, speaking);
    }
  },
};
