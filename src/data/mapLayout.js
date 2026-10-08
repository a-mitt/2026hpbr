import { FOOT_HALF_WIDTH, FOOT_OFFSET } from "../constants.js";

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

// 通れない範囲＝家具の「足元」だけ。斜め上から見た絵なので、机・ベッド・テーブルの天板の下や
// ソファの後ろ側の床は空いている（通れる。手前に重なって描かれるだけ）
export const BLOCKED = [
  { x: 940, y: 335, w: 110, h: 195 }, // デスク横の棚の足元
  { x: 1095, y: 440, w: 95, h: 55 }, // デスクの椅子
  { x: 1228, y: 420, w: 30, h: 110 }, // デスクの右脚
  { x: 1255, y: 450, w: 50, h: 62 }, // ゴミ箱
  { x: 1530, y: 500, w: 30, h: 68 }, // マッサージ台の左脚
  { x: 1620, y: 500, w: 30, h: 68 }, // マッサージ台の右脚
  { x: 1690, y: 345, w: 60, h: 60 }, // スツール
  { x: 1080, y: 840, w: 255, h: 60 }, // 一人掛けソファ
  { x: 1125, y: 955, w: 35, h: 48 }, // 小さなテーブルの左脚
  { x: 1270, y: 955, w: 35, h: 48 }, // 小さなテーブルの右脚
  { x: 1065, y: 1000, w: 265, h: 62 }, // ロングソファ
  { x: 1360, y: 900, w: 55, h: 104 }, // テレビ台
  { x: 775, y: 470, w: 70, h: 136 }, // 冷蔵庫
  { x: 625, y: 815, w: 25, h: 80 }, // トイレの左の壁
  { x: 767, y: 815, w: 25, h: 80 }, // トイレの右の壁
];

// トイレのドアが閉まっている間だけ通れない範囲（開けると中に入れる）
export const TOILET_DOOR_BLOCK = { x: 650, y: 815, w: 117, h: 80 };
export const doorState = { toiletOpen: false };

// 部屋ごとの暗さ。いない部屋は暗くなる
export const ROOMS = [
  { id: "stairs", x: 170, y: 283, w: 133, h: 785 },
  { id: "small", x: 303, y: 444, w: 472, h: 624 }, // 玄関・キッチン・トイレ
  { id: "main", x: 775, y: 19, w: 640, h: 1049 },
  { id: "back", x: 1415, y: 19, w: 347, h: 751 },
];
export const DARK_ALPHA = 0.7;

// トイレのドア：外から近づいて決定/クリックで開け閉めできる（開けると中に入れる）
export const TOILET_DOOR = {
  hit: { x: 645, y: 620, w: 127, h: 275 },
  standPoint: { x: 708, y: 925 },
  reach: 110,
};

export const PLAYER_START = { x: 1000, y: 720 };

const insideRect = (r, x, y) => x >= r.x && x <= r.x + r.w && y >= r.y && y <= r.y + r.h;

// 足元の位置(x,y)に立てるか。左右に少し幅を持たせて判定する
export function canStand(footX, footY) {
  return [-FOOT_HALF_WIDTH, 0, FOOT_HALF_WIDTH].every((dx) => {
    const x = footX + dx;
    return WALKABLE.some((r) => insideRect(r, x, footY))
      && !BLOCKED.some((r) => insideRect(r, x, footY))
      && (doorState.toiletOpen || !insideRect(TOILET_DOOR_BLOCK, x, footY));
  });
}

export function roomAt(footX, footY) {
  return ROOMS.find((r) => insideRect(r, footX, footY)) ?? null;
}

// プレイヤーの中心座標からroomAtを呼ぶ補助
export const footOf = (x, y) => ({ x, y: y + FOOT_OFFSET });
