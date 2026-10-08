import { FOOT_OFFSET } from "../constants.js";

// マップ画像（1920×1080）上の座標。値は map_parts の完成形(goal.png)を見て決めた概算。
// F2のデバッグ表示で枠を見ながら調整する。
// 画像は public/assets/map/ に置く。順番は背景→パーツ。
export const MAP_IMAGES = {
  wall: "wallonly.png",
  stairs: "stairs.png",
  toiletdoor: "toiletdoor.png",
  goal: "goal.png",
};

// 家具のパーツ。sortY：プレイヤーの足がこれより上にいると、家具が手前に見える（後ろに回り込む）
export const FURNITURE = [
  { key: "shelfandplanter", file: "shelfandplanter.png", sortY: 606 },
  { key: "desk", file: "desk.png", sortY: 530 },
  { key: "massagebed", file: "massagebed.png", sortY: 566 },
  { key: "sofas", file: "sofas.png", sortY: 900 },
  { key: "smalltable", file: "smalltable.png", sortY: 1004 },
  { key: "longsofa", file: "longsofa.png", sortY: 1069 },
  { key: "tv", file: "tv.png", sortY: 1005 },
];

// 歩ける範囲（足元の点が動ける四角）。左上x, 左上y, 幅, 高さ
export const WALKABLE = [
  { x: 790, y: 305, w: 606, h: 753 }, // メイン
  { x: 446, y: 820, w: 354, h: 238 }, // キッチン前の床
  { x: 190, y: 300, w: 100, h: 758 }, // 階段
  { x: 190, y: 905, w: 256, h: 153 }, // 階段下〜玄関
  { x: 1432, y: 305, w: 306, h: 445 }, // 奥の部屋
  { x: 1390, y: 415, w: 50, h: 80 }, // メインと奥の部屋の出入口
];

// 通れない範囲（家具の足元・トイレ）。家具の上のほうは入れる＝後ろに回り込める
export const BLOCKED = [
  { x: 940, y: 285, w: 110, h: 245 }, // デスク横の棚
  { x: 1050, y: 380, w: 205, h: 150 }, // デスク
  { x: 1255, y: 450, w: 50, h: 62 }, // ゴミ箱
  { x: 1515, y: 295, w: 145, h: 270 }, // マッサージ台
  { x: 1690, y: 320, w: 60, h: 85 }, // スツール
  { x: 1080, y: 830, w: 255, h: 70 }, // 一人掛けソファ
  { x: 1115, y: 900, w: 190, h: 100 }, // 小さなテーブル
  { x: 1065, y: 1000, w: 265, h: 62 }, // ロングソファ
  { x: 1360, y: 830, w: 55, h: 174 }, // テレビ台
  { x: 775, y: 295, w: 70, h: 311 }, // 冷蔵庫・棚
  { x: 645, y: 450, w: 127, h: 445 }, // トイレ（ドア含む）
];

// 部屋ごとの暗さ。いない部屋は暗くなる
export const ROOMS = [
  { id: "stairs", x: 170, y: 283, w: 133, h: 785 },
  { id: "small", x: 303, y: 444, w: 472, h: 624 }, // 玄関・キッチン・トイレ
  { id: "main", x: 775, y: 19, w: 640, h: 1049 },
  { id: "back", x: 1415, y: 19, w: 347, h: 751 },
];
export const DARK_ALPHA = 0.7;

// トイレのドア：近づいて決定/クリックで取り払われて中が見える
export const TOILET_DOOR = {
  hit: { x: 645, y: 620, w: 127, h: 275 },
  standPoint: { x: 708, y: 925 },
  reach: 110,
};

export const PLAYER_START = { x: 1000, y: 720 };

const insideRect = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// 足元の位置(x,y)に立てるか。左右に少し幅を持たせて判定する
export function canStand(footX, footY) {
  return [-14, 0, 14].every((dx) => {
    const x = footX + dx;
    return WALKABLE.some((r) => insideRect(r, x, footY))
      && !BLOCKED.some((r) => insideRect(r, x, footY));
  });
}

export function roomAt(footX, footY) {
  return ROOMS.find((r) => insideRect(r, footX, footY)) ?? null;
}

// プレイヤーの中心座標からroomAtを呼ぶ補助
export const footOf = (x, y) => ({ x, y: y + FOOT_OFFSET });
