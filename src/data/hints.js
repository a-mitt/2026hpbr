import { t } from "../systems/i18n.js";

// ライブラリの、まだ解放されていない項目のヒント（「？？？」を押すと出る）。文面はここで書き換えられる。
// キーは、プレゼント／コレクション／セリフ＝NPCのid、オブジェクト＝オブジェクトのid、シークレット＝シークレットのid
const NPC_HINT_JA = (who) => `${who}に話しかけてみよう。マップのどこかにいるよ。`;
const NPC_HINT_EN = (who) => `Try talking to ${who}. They're somewhere on the map.`;

const npcHints = (id, ja, en, giftJa, giftEn) => ({ id, ja, en, giftJa, giftEn });

// 人ごとのヒント。presents＝プレゼント／コレクション、dialogue＝セリフ
const PEOPLE = [
  npcHints("tome", NPC_HINT_JA("トメ"), NPC_HINT_EN("Tome"), "トメに話しかけると、もらえるかも。", "Talk to Tome and you might receive something."),
  npcHints("ritsu", NPC_HINT_JA("律"), NPC_HINT_EN("Ritsu"), "律に話しかけると、もらえるかも。", "Talk to Ritsu and you might receive something."),
  npcHints("shou", NPC_HINT_JA("ショウ"), NPC_HINT_EN("Shou"), "ショウに話しかけると、もらえるかも。", "Talk to Shou and you might receive something."),
  npcHints("mob", NPC_HINT_JA("モブ"), NPC_HINT_EN("Mob"), "モブに話しかけると、もらえるかも。", "Talk to Mob and you might receive something."),
  npcHints("ekubo", NPC_HINT_JA("エクボ"), NPC_HINT_EN("Ekubo"), "エクボに話しかけると、もらえるかも。奥の部屋も見てみよう。", "Talk to Ekubo and you might receive something. Check the back room, too."),
  npcHints("teru", NPC_HINT_JA("テル"), NPC_HINT_EN("Teru"), "テルに話しかけると、もらえるかも。", "Talk to Teru and you might receive something."),
  npcHints("serizawa", NPC_HINT_JA("芹沢"), NPC_HINT_EN("Serizawa"), "芹沢に話しかけると、もらえるかも。", "Talk to Serizawa and you might receive something."),
];

const byId = (id) => PEOPLE.find((entry) => entry.id === id);

export const dialogueHint = (npcId) => t(byId(npcId)?.ja ?? "", byId(npcId)?.en ?? "");
export const giftHint = (npcId) => t(byId(npcId)?.giftJa ?? "", byId(npcId)?.giftEn ?? "");
// コレクション（立ち絵）は、プレゼントと同じ条件で解放される
export const collectionHint = (npcId) => t(
  "プレゼントをもらうと、この人の情報が見られるようになるよ。",
  "Receive this person's present to see their picture here.",
);

const OBJECT_HINTS = {
  giftpile: t("部屋のすみに、プレゼントが山になっている。近づいて調べてみよう。", "There's a pile of presents in a corner of the room. Get close and check it out."),
  gamingtie: t("奥の部屋に、変わった光り方をするものがある。", "Something in the back room glows in an unusual way."),
  sash: t("自分の体を調べてみよう。そこにも何かあるかも。", "Try examining yourself. There might be something there, too."),
  planter: t("緑の植物をよく調べてみよう。足元がポイント。モブと被らない場所を調べよう。", "Look closely at the green plant. Check around its base."),
  safe: t("デスクのまわりを調べてみよう。下に何かあるみたい。", "Examine around the desk. There seems to be something underneath."),
};
export const objectHint = (id) => OBJECT_HINTS[id] ?? t("マップのいろいろな場所を調べてみよう。", "Try examining various places on the map.");

const SECRET_HINTS = {
  happy_picture: t("ろうそくに火をつけて、お祝いの画面まで進んでみよう。", "Light the candles and go through to the celebration screen."),
  koya: t("右上のハート欄で、お祝いをたくさん繰り返してみよう。", "Repeat the celebrations many times on the heart screen at the top right."),
  takashi: t("こやが居なくなったあとも、ハート欄でお祝いを続けてみよう。", "Keep celebrating on the heart screen even after Koya is gone."),
  takashi_bath: t("あの人が来たあとも、ハート欄でお祝いを続けてみよう。", "Keep celebrating on the heart screen even after that person shows up."),
  true_end: t("みんなと話してプレゼントを集めたあと、そのまま夜まで残ってみよう。", "After talking to everyone and collecting presents, stay until night."),
  normal_end: t("プレゼントを何かもらってから、階段の扉で「帰る」を選ぼう。", "Receive at least one present, then choose to leave at the stairs door."),
  bad_end: t("誰からもプレゼントをもらわずに、階段の扉で「帰る」を選ぼう。", "Without receiving any present, choose to leave at the stairs door."),
};
export const secretHint = (id) => SECRET_HINTS[id] ?? "";
