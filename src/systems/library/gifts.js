import { GIFT_INFO } from "../../data/dialogues.js";
import { npcs } from "../../data/npcs.js";
import { giftHint } from "../../data/hints.js";
import { save } from "../save.js";
import { CSS_COLORS } from "../../theme.js";
import { displayName, t } from "../i18n.js";
import { UNKNOWN_LABEL } from "./shared.js";

// ライブラリの「gifts」まわりの処理。LibraryView のメソッドとして混ぜ込む（this は LibraryView）
export const giftMethods = {
  // ---- プレゼント ----
  renderGifts() {
    npcs.forEach((npc, index) => {
      const locked = !save.hasGift(npc.id);
      const info = GIFT_INFO[npc.id];
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : info.gift,
        sub: locked ? "" : t(`${npc.name}から`, `From ${displayName(npc.name)}`),
        locked,
        icon: (x, y) => this.giftImage(npc.id, x, y + 4, 112, 76, locked, true),
        hint: giftHint(npc.id),
        onClick: () => this.openDetail(() => {
          this.body.add([
            this.giftImage(npc.id, 730, 290, 300, 260, false),
            this.addText(60, 136, info.gift, 30),
            this.addText(60, 180, t(`${npc.name}からのプレゼント`, `Present from ${displayName(npc.name)}`), 18, { color: CSS_COLORS.orangeLight }),
            this.addText(60, 214, info.note, 17, { color: CSS_COLORS.peach, wordWrap: { width: 520, useAdvancedWrap: true } }),
            this.addText(60, 256, info.episode || t("（この人の想いやエピソードは準備中です）", "(This person's thoughts and episode are coming soon.)"), 18, {
              lineSpacing: 6,
              wordWrap: { width: 520, useAdvancedWrap: true },
            }),
            this.addText(60, 400, this.meaningText(info), 16, {
              color: CSS_COLORS.peach,
              wordWrap: { width: 520, useAdvancedWrap: true },
            }).setAlpha(0.55),
          ]);
        }),
      });
    });
  },

  // 意味は、タイトル画面で「恋愛的表現に抵抗が無い」にチェックした人にだけ見せる
  meaningText(info) {
    if (!info.meaning) {
      return "";
    }
    return save.flag("romanceOk")
      ? info.meaning
      : t("（この項目は、タイトル画面のチェックを入れると表示されます）", "(Shown if you tick the box on the title screen.)");
  },

  // プレゼントの絵を、maxW×maxH に収まる大きさで置く（locked ならシルエット）
  // small＝カードなど小さく出すとき（縮小済みの絵を使う）
  giftImage(npcId, x, y, maxW, maxH, locked, small = false) {
    const image = this.scene.add.image(x, y, small ? `gift_${npcId}_s` : `gift_${npcId}`);
    image.setScale(Math.min(maxW / image.width, maxH / image.height));
    if (locked) {
      image.setTintFill(0x1b0f0a);
    }
    return image;
  },
};
