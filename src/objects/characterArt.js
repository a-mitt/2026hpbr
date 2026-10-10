import Phaser from "phaser";
import { CHARACTER_SCALE } from "../constants.js";

// キャラ絵は 140×200 で、足元が下端。コンテナは CHARACTER_SCALE 倍で表示されるので、
// 絵はその分を打ち消して「画面で 140×200 の ART_SCALE 倍」に見せる
export const ART_SCALE = 0.9;
const ART_WIDTH = 140;
const ART_HEIGHT = 200;
const LOCAL_SCALE = ART_SCALE / CHARACTER_SCALE;
// コンテナの中心から足元までの距離（コンテナ内の座標）
export const FOOT_LOCAL_Y = 36;
const HIT_WIDTH = Math.round(ART_WIDTH * LOCAL_SCALE);
const HIT_HEIGHT = Math.round(ART_HEIGHT * LOCAL_SCALE);
// 頭の上の位置（「!」などを置く高さ）
export const HEAD_LOCAL_Y = FOOT_LOCAL_Y - HIT_HEIGHT;

// 足元が (0, FOOT_LOCAL_Y) にくるようにキャラ絵を置く
export function addCharacterSprite(scene, textureKey) {
  return scene.add.image(0, FOOT_LOCAL_Y, textureKey).setOrigin(0.5, 1).setScale(LOCAL_SCALE);
}

// 絵の大きさのクリック範囲をつける。コンテナの当たり判定は左上が原点（中心ではない）。
// artTop〜artBottom（絵の中の縦の範囲）だけを範囲にできる（浮いているエクボ用）。
// extraTop＝頭の上にさらに足す高さ（頭上の「!」マークも押せるように）
export function makeCharacterInteractive(container, artTop = 0, artBottom = ART_HEIGHT, extraTop = 0) {
  const height = Math.round((artBottom - artTop) * LOCAL_SCALE) + extraTop;
  const top = FOOT_LOCAL_Y - (ART_HEIGHT - artTop) * LOCAL_SCALE - extraTop;
  const area = new Phaser.Geom.Rectangle(0, top + height / 2, HIT_WIDTH, height);
  container.setSize(HIT_WIDTH, height);
  if (container.input) {
    // すでに押せる状態なら、範囲だけ差し替える（外して付け直すと、付け直しが消えてしまう）
    container.input.hitArea = area;
  } else {
    container.setInteractive(area, Phaser.Geom.Rectangle.Contains);
  }
}

// 絵の中の高さ（artY）に当たる、コンテナ内の座標
export function artToLocalY(artY) {
  return FOOT_LOCAL_Y - (ART_HEIGHT - artY) * LOCAL_SCALE;
}
