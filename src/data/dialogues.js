import npcData from "./npcs.json";

// 会話文は npcs.json の各NPCの "lines" に書く。行数はNPCごとに自由。
export const dialogues = Object.fromEntries(
  npcData.map((npc) => [
    npc.id,
    npc.lines.map((text) => ({ speaker: npc.name, text })),
  ]),
);
