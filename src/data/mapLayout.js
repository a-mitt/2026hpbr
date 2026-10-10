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
  // 丸椅子（マッサージ台の横）。ベッドとは別に、椅子の足元の高さで前後を決める。x,y＝絵の左上
  { key: "stool", file: "stool.png", x: 1666, y: 318, sortY: 425 },
  { key: "sofas", file: "sofas.png", sortY: 900 },
  { key: "smalltable", file: "smalltable.png", sortY: 1004 },
  { key: "longsofa", file: "longsofa.png", sortY: 1069 },
  { key: "tv", file: "tv.png", sortY: 1005 },
];

// 重ねて置く絵（元の1920×1080の絵を、描かれている範囲だけに切り詰めたもの。x,y＝その左上）
// sortY：足元がこれより上にいるとき、絵が手前に見える（後ろを歩ける）
export const DECORATION = { key: "decoration", file: "decoration.png", x: 801, y: 24, depth: -4.5 };
export const GIFT_PILE = { key: "present", file: "present.png", x: 1152, y: 626, sortY: 793 };
// ゲーミングネクタイ（スツールの上）。色違いを順番に切り替えて光らせる
export const GAMING_TIE = {
  files: ["red", "orange", "yellow", "green", "lightblue", "blue", "purple"].map((color) => ({
    key: `tie_${color}`,
    file: `${color}tie.png`,
  })),
  x: 1687,
  y: 315,
  sortY: 425.5, // 丸椅子の上
  intervalMs: 260,
};
// バルーン：sortY＝ひもの先の高さ。ひもの先に小さな当たり判定がある（BLOCKED）
export const BALLOONS = [
  { key: "balloon_pink", file: "balloon_pink.png", x: 782, y: 736, sortY: 881 },
  { key: "balloon_green", file: "balloon_green.png", x: 1431, y: 585, sortY: 681 },
  { key: "balloon_yellow", file: "balloon_yellow.png", x: 1686, y: 182, sortY: 318 },
  { key: "balloon_redblue", file: "balloon_redblue.png", x: 1295, y: 145, sortY: 304 },
];

// 歩ける範囲（足元の点が動ける四角）。左上x, 左上y, 幅, 高さ
export const WALKABLE = [
  { x: 790, y: 305, w: 606, h: 753 }, // メイン
  { x: 446, y: 820, w: 354, h: 238 }, // キッチン前の床
  { x: 330, y: 905, w: 116, h: 153 }, // 玄関（階段は通れない。扉の向こう）
  { x: 1432, y: 305, w: 306, h: 445 }, // 奥の部屋
  { x: 1390, y: 415, w: 50, h: 80 }, // メインと奥の部屋の出入口
];

// 通れない範囲＝家具の「足元」だけ。斜め上から見た絵なので、机・ベッド・テーブルの天板の下や
// ソファの後ろ側の床は空いている（通れる。手前に重なって描かれるだけ）
export const BLOCKED = [
  { x: 940, y: 335, w: 110, h: 195 }, // デスク横の棚の足元
  { x: 1050, y: 340, w: 210, h: 210 }, // デスク（天板の下・椅子・右脚まで全部。下にも入れない）
  { x: 1255, y: 450, w: 50, h: 62 }, // ゴミ箱
  { x: 1515, y: 300, w: 150, h: 268 }, // マッサージ台（天板の下にも入れない。左右の脚の間も含む）
  { x: 1690, y: 345, w: 60, h: 60 }, // スツール
  { x: 1080, y: 840, w: 255, h: 60 }, // 一人掛けソファ
  { x: 1125, y: 955, w: 180, h: 48 }, // 小さなテーブル（脚の間の下も埋める。ソファとの隙間は空けたまま）
  { x: 1065, y: 1000, w: 265, h: 62 }, // ロングソファ
  { x: 1360, y: 900, w: 55, h: 104 }, // テレビ台
  { x: 775, y: 470, w: 70, h: 136 }, // 冷蔵庫
  { x: 1200, y: 735, w: 200, h: 55 }, // プレゼントの山
  { x: 795, y: 868, w: 32, h: 16 }, // バルーン（ピンク）のひも
  { x: 1445, y: 667, w: 32, h: 16 }, // バルーン（緑）のひも
  { x: 1703, y: 305, w: 32, h: 16 }, // バルーン（黄）のひも
  { x: 1325, y: 288, w: 45, h: 22 }, // バルーン（赤・青）のひも
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
  reach: 110, // 足元から扉の四角までの距離がこれ以内なら、開け閉めできる
};

// 玄関と階段の間の扉（横の壁なので絵はない）。調べると「終わりにして帰る？」が出る
export const EXIT_DOOR = {
  hit: { x: 300, y: 895, w: 40, h: 163 },
  standPoint: { x: 352, y: 985 },
  reach: 120,
};

// 調べられる場所。hit＝クリック範囲。足元から hit（四角）までの距離が reach 以内なら調べられる
export const SPOTS = {
  planter: { hit: { x: 785, y: 160, w: 95, h: 200 }, standPoint: { x: 880, y: 385 }, reach: 90 },
  deskPapers: { hit: { x: 955, y: 285, w: 90, h: 70 }, standPoint: { x: 1000, y: 545 }, reach: 140 },
  giftPile: { hit: { x: 1152, y: 626, w: 258, h: 167 }, standPoint: { x: 1290, y: 815 }, reach: 45 },
  gamingTie: { hit: { x: 1687, y: 315, w: 52, h: 57 }, standPoint: { x: 1715, y: 440 }, reach: 90 },
  takoyaki: { hit: { x: 1190, y: 885, w: 50, h: 40 }, standPoint: { x: 1215, y: 930 }, reach: 60 },
};

// エクボが玄関のドアの外（階段側）に立つ位置
export const EKUBO_DOOR_POS = { x: 262, y: 965 };

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
