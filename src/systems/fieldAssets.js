import { BALLOONS, DECORATION, FURNITURE, GAMING_TIE, GIFT_PILE, MAP_IMAGES } from "../data/mapLayout.js";
import { npcs } from "../data/npcs.js";

const assetDir = (name) => `${import.meta.env.BASE_URL}assets/${name}/`;

// 霊幻の立ち絵の表情（会話・エンディングで使う）。キーは stand_reigen_表情
export const REIGEN_FACES = ["normal", "happy", "surprise", "littlesad", "smile", "angry", "alone", "alonebad", "happyend", "normalend"];
// キャラ絵（public/assets/chara/）。キーは "chara_" + ファイル名
const CHARA_FILES = [
  "tome", "ritsu", "shou", "mob", "teru", "serizawa", "ekubo_1", "ekubo_2", "guard_front", "guard_side",
  "reigen_down", "reigen_up", "reigen_left", "reigen_right",
];

// 指定フォルダの画像を一括で読み込む。files は [キー, ファイル名] の並び
function loadImages(loader, dir, files) {
  loader.setPath(assetDir(dir));
  for (const [key, file] of files) {
    loader.image(key, file);
  }
}

// FieldScene の preload で使う、マップ・キャラ・ライブラリ用の絵をすべて読み込む
export function loadFieldAssets(scene) {
  const { load } = scene;
  loadImages(load, "map", [
    ...Object.entries(MAP_IMAGES),
    ...FURNITURE.map((furniture) => [furniture.key, furniture.file]),
    ...[DECORATION, GIFT_PILE, ...BALLOONS, ...GAMING_TIE.files].map((overlay) => [overlay.key, overlay.file]),
  ]);
  loadImages(load, "chara", CHARA_FILES.map((name) => [`chara_${name}`, `${name}.png`]));
  // ハート画面のれーあら（合計の節目ごと・帰ったあと）と、ライブラリのこや（通常・しっぽ左右）
  loadImages(load, "heart", ["reia_0", "reia_25", "reia_50", "reia_75", "reia_left", "takashi", "takashi_bath"]
    .map((name) => [name, `${name}.png`]));
  // ライブラリのシークレットで見直す、お祝いの一枚絵
  loadImages(load, "birthday", [["birthday_picture", "birthday.png"]]);
  // ライブラリの「オブジェクト」の詳細に出す絵（絵ができたものから追加。名前は objects.js の id）
  loadImages(load, "objects", ["sash", "planter"].map((id) => [`object_${id}`, `${id}.png`]));
  loadImages(load, "koya", ["idle", "wag_left", "wag_right", "mini_idle", "mini_wag_left", "mini_wag_right"]
    .map((name) => [`koya_${name}`, `${name}.png`]));
  loadImages(load, "stand", REIGEN_FACES.map((face) => [`stand_reigen_${face}`, `reigen_${face}.png`]));
  // プレゼントの絵（キーは gift_キャラのid）。会話の前の窓・ライブラリ・マップ上のたこ焼きで使う
  // _s は小さく表示する用（マップ上・カードの絵）。大きい絵を小さく縮めて出すと、ギザギザになるため
  loadImages(load, "gifts", npcs.flatMap((npc) => [
    [`gift_${npc.id}`, `${npc.id}.png`],
    [`gift_${npc.id}_s`, `${npc.id}_s.png`],
  ]));
}
