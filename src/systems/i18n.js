// 日本語／英語の切り替え。選んだ言語はブラウザに覚え、切り替えるときはページを読み込み直す。
// 文字列は t("日本語", "English") で書く（読み込み時に今の言語のほうが選ばれる）。
const STORAGE_KEY = "2026hpbr-lang";

function detectLanguage() {
  try {
    const fromUrl = new URLSearchParams(window.location.search).get("lang");
    if (fromUrl === "ja" || fromUrl === "en") {
      return fromUrl;
    }
  } catch {
    // 使えなければ次へ
  }
  try {
    const saved = window.localStorage.getItem(STORAGE_KEY);
    if (saved === "ja" || saved === "en") {
      return saved;
    }
  } catch {
    // シークレットモードなどでは覚えられない
  }
  // 初めての人は、ブラウザの言語が日本語なら日本語、それ以外は英語
  return String(window.navigator.language).toLowerCase().startsWith("ja") ? "ja" : "en";
}

export const lang = detectLanguage();
export const isEnglish = lang === "en";

export const t = (ja, en) => (isEnglish ? en : ja);

// 言語を切り替える（URLの ?lang= は外して、読み込み直す）
export function switchLanguage() {
  const next = isEnglish ? "ja" : "en";
  try {
    window.localStorage.setItem(STORAGE_KEY, next);
  } catch {
    // 覚えられないときは、URLで指定して読み込み直す
  }
  const url = new URL(window.location.href);
  url.searchParams.set("lang", next);
  window.location.href = url.toString();
}

// 会話の話者などは内部では日本語名で扱い、表示のときだけ言語に合わせる
const DISPLAY_NAMES = {
  霊幻: t("霊幻", "Reigen"),
  トメ: t("トメ", "Tome"),
  律: t("律", "Ritsu"),
  ショウ: t("ショウ", "Shou"),
  モブ: t("モブ", "Mob"),
  エクボ: t("エクボ", "Ekubo"),
  テル: t("テル", "Teru"),
  芹沢: t("芹沢", "Serizawa"),
};

export const displayName = (name) => DISPLAY_NAMES[name] ?? name;

export const PAGE_TITLE = t("2026霊幻新隆おたおめ同人Webゲーム", "2026 Reigen Arataka Birthday Fan Game");
