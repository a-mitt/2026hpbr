import { npcs } from "../data/npcs.js";
import { save } from "./save.js";

// プレゼントをもらった人数（「帰る」のエンディングの分かれ目）
export function giftCount() {
  return npcs.filter((npc) => save.hasGift(npc.id)).length;
}

// 全員からプレゼントをもらったか（「1人で残る」を選べる条件）
export function hasAllCollections() {
  return npcs.every((npc) => save.hasGift(npc.id));
}

// 夜のシーン（1人で残る）の途中経過。保存しない（リロードすると昼に戻る）
export const session = { night: false, photo: false, safeDone: false };

export function resetSession() {
  Object.assign(session, { night: false, photo: false, safeDone: false });
}
