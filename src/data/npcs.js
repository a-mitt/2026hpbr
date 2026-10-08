import npcData from "./npcs.json";

// JSONの "#rrggbb" を、Phaserで使う数値の色に変換する
export const npcs = npcData.map((npc) => ({
  id: npc.id,
  name: npc.name,
  x: npc.x,
  y: npc.y,
  color: Number.parseInt(npc.color.replace("#", ""), 16),
}));
