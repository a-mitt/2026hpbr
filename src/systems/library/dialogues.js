import Phaser from "phaser";
import { dialogues, ekuboGiftLines } from "../../data/dialogues.js";
import { npcs } from "../../data/npcs.js";
import { dialogueHint } from "../../data/hints.js";
import { createButton } from "../Button.js";
import { save } from "../save.js";
import { CSS_COLORS } from "../../theme.js";
import { displayName, t } from "../i18n.js";
import { CARD, UNKNOWN_LABEL } from "./shared.js";

const PAGE_VISUAL_LINES = 9;
const CHARS_PER_VISUAL_LINE = 36;

// ライブラリの「dialogues」まわりの処理。LibraryView のメソッドとして混ぜ込む（this は LibraryView）
export const dialogueMethods = {
  // ---- セリフ ----
  dialogSources(npcId) {
    const sources = [{ key: npcId, lines: dialogues[npcId] }];
    if (npcId === "ekubo") {
      sources.push({ key: "ekubo2", lines: ekuboGiftLines });
    }
    return sources;
  },

  // 読んだところまでのセリフを、1行ずつの文字列にする
  seenLines(npcId) {
    const result = [];
    for (const { key, lines } of this.dialogSources(npcId)) {
      for (const line of lines.slice(0, save.seenCount(key))) {
        const who = displayName(line.speaker);
        result.push(line.narration ? t(`${who}：（${line.text}）`, `${who}: (${line.text})`) : t(`${who}：${line.text}`, `${who}: ${line.text}`));
      }
    }
    return result;
  },

  paginate(lines) {
    const pages = [];
    let current = [];
    let used = 0;
    for (const line of lines) {
      const visual = Math.ceil(line.length / CHARS_PER_VISUAL_LINE);
      if (current.length > 0 && used + visual > PAGE_VISUAL_LINES) {
        pages.push(current);
        current = [];
        used = 0;
      }
      current.push(line);
      used += visual;
    }
    if (current.length > 0) {
      pages.push(current);
    }
    return pages;
  },

  renderDialogues() {
    npcs.forEach((npc, index) => {
      const locked = this.seenLines(npc.id).length === 0;
      const y = CARD.y + index * 46;
      const button = createButton(this.scene, 42 + 80, y + 20, 160, 38, locked ? UNKNOWN_LABEL : displayName(npc.name), 18);
      const selected = npc.id === this.dialogNpcId;
      button.setAlpha(locked ? 0.4 : (selected ? 1 : 0.7));
      // まだ読んでいない人も選べる（右にヒントが出る）
      this.cursorManager.bind(button, "button", () => {
        this.dialogNpcId = npc.id;
        this.dialogPage = 0;
        this.render();
      });
      this.body.add(button);
    });

    const pages = this.paginate(this.seenLines(this.dialogNpcId));
    if (pages.length === 0) {
      this.body.add(this.addText(250, CARD.y + 4, `${t("話しかけると、ここにセリフが残ります。", "Talk to someone and their lines will be kept here.")}

${t("ヒント", "Hint")}：${dialogueHint(this.dialogNpcId)}`, 18, {
        color: CSS_COLORS.peach,
        lineSpacing: 6,
        wordWrap: { width: 660, useAdvancedWrap: true },
      }));
      return;
    }
    this.dialogPage = Phaser.Math.Clamp(this.dialogPage, 0, pages.length - 1);
    this.body.add(this.addText(250, CARD.y + 4, pages[this.dialogPage].join("\n"), 17, {
      lineSpacing: 8,
      wordWrap: { width: 660, useAdvancedWrap: true },
    }));

    if (pages.length > 1) {
      const prev = createButton(this.scene, 520, 436, 90, 38, "◀", 18);
      const next = createButton(this.scene, 740, 436, 90, 38, "▶", 18);
      prev.setAlpha(this.dialogPage > 0 ? 1 : 0.35);
      next.setAlpha(this.dialogPage < pages.length - 1 ? 1 : 0.35);
      this.cursorManager.bind(prev, "button", () => this.turnPage(-1, pages.length));
      this.cursorManager.bind(next, "button", () => this.turnPage(1, pages.length));
      this.body.add([
        prev,
        next,
        this.addText(630, 436, `${this.dialogPage + 1} / ${pages.length}`, 16, { color: CSS_COLORS.peach }).setOrigin(0.5),
      ]);
    }
  },

  turnPage(step, pageCount) {
    const next = this.dialogPage + step;
    if (next >= 0 && next < pageCount) {
      this.dialogPage = next;
      this.render();
    }
  },
};
