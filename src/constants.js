export const GAME_WIDTH = 960;
export const GAME_HEIGHT = 540;
// 旧レイアウト（800×600）の座標を新サイズへ寄せるためのずらし量
export const OFFSET_X = (GAME_WIDTH - 800) / 2;
export const OFFSET_Y = GAME_HEIGHT - 600;
export const MAP_WIDTH = 1920;
export const MAP_HEIGHT = 1080;
// キャラの表示倍率（家具と並べたときの大きさ）。元の絵は中心から足元まで36px
export const CHARACTER_SCALE = 1.7;
// キャラの中心から足元までの距離（足元で当たり判定と前後を決める）
export const FOOT_OFFSET = Math.round(36 * CHARACTER_SCALE);
// 足元の当たり判定の半幅
export const FOOT_HALF_WIDTH = 22;
export const PLAYER_SPEED = 200;
export const TALK_DISTANCE = 120;
export const TYPING_INTERVAL_MS = 30;