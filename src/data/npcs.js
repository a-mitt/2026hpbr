import npcData from "./npcs.json";

// JSONの "#rrggbb" を、Phaserで使う数値の色に変換する
export const npcs = npcData.map((npc) => ({
  id: npc.id,
  name: npc.name,
  x: npc.x,
  y: npc.y,
  color: Number.parseInt(npc.color.replace("#", ""), 16),
}));

// マップ上のキャラ絵（public/assets/chara/ の画像。FieldScene で "chara_ファイル名" として読み込む）
// エクボは幽霊の絵が2枚（ふわふわ動く）。玄関の外では守衛の絵（guard_front）になる
export const npcSprites = {
  tome: ["chara_tome"],
  ritsu: ["chara_ritsu"],
  shou: ["chara_shou"],
  mob: ["chara_mob"],
  ekubo: ["chara_ekubo_1", "chara_ekubo_2"],
  teru: ["chara_teru"],
  serizawa: ["chara_serizawa"],
};
