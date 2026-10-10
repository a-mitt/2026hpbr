import { isEnglish, t } from "../systems/i18n.js";

// 1枚目の注意書きと、設定画面の利用規約で共通に使う文面
export const NOTICE_LINES = t(
  [
    "・公式様とは一切関係ありません。ファンゲームのため、バグや不具合が残っている場合があります。",
    "　恐れ入りますが、自己責任でのプレイをお願いいたします。",
    "・不具合を見つけた場合は、「設定」画面の【報告フォーム】から教えていただけると嬉しいです！",
    "・スクショ・SNS投稿・配信などは全てOKです。二次創作のため、公式様や他の方のご迷惑にならないようご配慮ください。",
    "　これらによって生じた損害等について、製作者は責任を負いません。",
    "・推奨環境：最新版のChrome / Safari / Edge。個人情報は取得せず、進み具合のみブラウザ内に保存します。",
    "・「同意して始める」を押すと、上記の注意・規約を読み、同意したものとみなします。",
  ],
  [
    "- This is unofficial and has no connection to the official creators. As a fan game, it may still contain bugs.",
    "  Please play at your own risk.",
    "- If you find a bug, please let us know via [Report Form] in the Settings screen!",
    "- Screenshots, social media posts and streaming are all OK. As a fan work, please be considerate of the official creators and others.",
    "  The creator is not responsible for any damage resulting from these.",
    "- Recommended: latest Chrome / Safari / Edge. No personal information is collected; only your progress is saved in your browser.",
    "- By pressing \"I Agree & Start\", you are deemed to have read and agreed to the above notes and terms.",
  ],
);

// 設定画面用：1枚目の手動改行（次の行が空白で始まる）をつなげて、1項目1行にする
export const TERMS_ITEMS = NOTICE_LINES.join("\n")
  .replace(isEnglish ? /\n {2}/g : /\n　/g, isEnglish ? " " : "")
  .split("\n");

export const CREDIT_LINES = t(
  [
    "【制作】",
    "製作者：裏世界(旧:理の目)　X:@NLisei_kotowari",
    "ゲームコード：AI使用　絵：裏世界",
    "Ver1.0-2026.10.10",
    "※一部のオブジェクトは、原作者様のイラストを元ネタに描写しています。",
    "",
    "【フォント】",
    "無心（MODI工房 http://modi.jpn.org/）",
    "IBM Plex Sans JP（IBM / SIL Open Font License）",
    "851マカポップ",
    "",
    "【ゲームエンジン】",
    "Phaser 3",
  ],
  [
    "[Credits]",
    "Created by: Urasekai (formerly Kotowari no Me)  X: @NLisei_kotowari",
    "Game code: AI-assisted   Art: Urasekai",
    "Ver1.0-2026.10.10",
    "* Some objects are drawn with the original author's illustrations as reference.",
    "",
    "[Fonts]",
    "Mushin (MODI Studio http://modi.jpn.org/)",
    "IBM Plex Sans JP (IBM / SIL Open Font License)",
    "851 MakaPop",
    "",
    "[Game Engine]",
    "Phaser 3",
  ],
);

// バグ報告フォーム（Googleフォーム）のURL。フォームを作ったらここに入れる
export const REPORT_FORM_URL = "https://forms.gle/RL7cyUeD4p7vVHjD8";
