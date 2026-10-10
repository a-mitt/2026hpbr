import { isEnglish } from "./systems/i18n.js";

// 温かみのあるレトロ配色（濃いオレンジ・茶が主体、差し色は藍）
export const COLORS = {
  bg: 0x3a2418,
  bgDark: 0x1e0f08,
  panel: 0x5a3320,
  orange: 0xc8641e,
  orangeLight: 0xf0b070,
  peach: 0xf6d9b0,
  cream: 0xfff0d6,
  indigo: 0x233a63,
};

export const CSS_COLORS = {
  cream: "#fff0d6",
  peach: "#f6d9b0",
  orangeLight: "#f0b070",
  indigo: "#233a63",
  brownDark: "#1e0f08",
};

// 1枚目の注意書き＝IBM Plex Sans JP（npmの@fontsourceから同梱。OFL）
const PLEX = '"IBM Plex Sans JP", Meiryo, "Hiragino Sans", "Yu Gothic", sans-serif';

// 英語のときは、無心フォントの英字（gなどが読みにくい）の代わりに IBM Plex を使う
const MUSHIN = '"Mushin", "IBM Plex Sans JP", Meiryo, sans-serif';
const HANDWRITING = isEnglish ? PLEX : MUSHIN;

export const FONTS = {
  // 見出し・ボタン・ろうそく画面＝無心
  ui: HANDWRITING,
  // キャラのセリフ・マップ上の文字＝無心
  body: HANDWRITING,
  // 1枚目の注意書き本文
  intro: PLEX,
  // 「霊幻新隆」の文字だけ少し大きく表示する用（フォントは無心）
  name: HANDWRITING,
  // HAPPY BIRTHDAY！専用（851マカポップ）
  title: '"851MakaPop", "IBM Plex Sans JP", Meiryo, sans-serif',
};
