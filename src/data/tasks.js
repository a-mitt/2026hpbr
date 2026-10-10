import { hasAllCollections, session } from "../systems/progress.js";
import { save } from "../systems/save.js";
import { t } from "../systems/i18n.js";

// 画面左上に出すタスク。上から順に表示する。done が true になると ✓ が付く
const DAY_TASKS = [
  { label: t("みんなに話しかけよう！", "Talk to everyone!"), done: () => hasAllCollections() },
  { label: t("プレゼントを開けよう！", "Open the presents!"), done: () => save.hasObject("giftpile") },
];

const NIGHT_TASKS = [
  { label: t("机を調べよう", "Check the desk"), done: () => session.photo },
  { label: t("金庫に写真をしまおう", "Put the photo in the safe"), done: () => session.safeDone },
];

export const getTasks = () => (session.night ? NIGHT_TASKS : DAY_TASKS);
