import { t } from "../systems/i18n.js";

// 調べられるもの（ライブラリの「オブジェクト」に載る）。text＝調べたときの地の文
export const OBJECTS = [
  {
    id: "giftpile",
    name: t("大量のプレゼント", "Piles of Presents"),
    text: t(
      "これは一旦どこから届いたんだ？ありがたく受け取っとくが、ちょっと怖いな。てかありすぎだろ。",
      "Where did all of these come from, anyway? I'll gladly accept them, but it's a little creepy. And there's just way too many.",
    ),
  },
  {
    id: "gamingtie",
    name: t("ゲーミングネクタイ", "Gaming Necktie"),
    text: t(
      "……？？なんだこれ？何でここにある？何で……？？いつ着けろと？今か？今なのか？",
      "......?? What is this? Why is it here? Why...?? When am I supposed to wear it? Now? Is it now?",
    ),
  },
  {
    id: "sash",
    name: t("本日の主役たすき", "Guest of Honor Sash"),
    text: t(
      "急に着せられてびっくりしたが悪くないな。もらっていいのかなこれ。",
      "I was startled when it was suddenly put on me, but it's not bad. Am I really allowed to keep this?",
    ),
  },
  {
    id: "planter",
    name: t("植木鉢", "Potted Plant"),
    text: t(
      "！……金庫のパスワードのメモが出てきた。そういえばこの下に隠したんだった。もし俺が急に居なくなることが起こっても片付けの時に気付いて金庫が開けられるようにだ。",
      "!...A memo with the safe's combination turned up. Right, I hid it under here. So that if I ever suddenly disappear, someone would notice it while cleaning up and be able to open the safe.",
    ),
  },
  {
    id: "safe",
    name: t("金庫", "Safe"),
    text: t(
      "デスクの下には金庫がある。だが、みんながいる間は開けられない。",
      "There's a safe under the desk. But I can't open it while everyone's here.",
    ),
  },
];

// ライブラリの「シークレット」
export const SECRETS = [
  { id: "happy_picture", name: t("HAPPY BIRTHDAY！の一枚絵", "HAPPY BIRTHDAY! Illustration") },
  { id: "koya", name: t("こや", "Koya") },
  { id: "takashi", name: t("原作の隆", "Takashi (Original)") },
  { id: "takashi_bath", name: t("原作の隆（風呂上がり）", "Takashi (After the Bath)") },
  { id: "true_end", name: t("トゥルーエンド", "True Ending") },
  { id: "normal_end", name: t("ノーマルエンド", "Normal Ending") },
  { id: "bad_end", name: t("バッドエンド", "Bad Ending") },
];
