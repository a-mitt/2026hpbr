import { GIFT_INFO } from "../../data/dialogues.js";
import { npcs } from "../../data/npcs.js";
import { collectionHint } from "../../data/hints.js";
import { drawChibi } from "../chibi.js";
import { save } from "../save.js";
import { CSS_COLORS } from "../../theme.js";
import { displayName, t } from "../i18n.js";
import { UNKNOWN_LABEL } from "./shared.js";

// ライブラリの絵に使うキャラ絵（FieldScene で読み込み済み）
const CHARA_TEXTURES = {
  tome: "chara_tome",
  ritsu: "chara_ritsu",
  shou: "chara_shou",
  mob: "chara_mob",
  ekubo: "chara_ekubo_1",
  teru: "chara_teru",
  serizawa: "chara_serizawa",
};

// ライブラリの「collection」まわりの処理。LibraryView のメソッドとして混ぜ込む（this は LibraryView）
export const collectionMethods = {
  // ---- コレクション（キャラ） ----
  renderCollection() {
    npcs.forEach((npc, index) => {
      const locked = !save.hasGift(npc.id);
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : displayName(npc.name),
        locked,
        icon: (x, y) => drawChibi(this.scene, x, y, CHARA_TEXTURES[npc.id], { locked, scale: 0.42 }),
        hint: collectionHint(npc.id),
        onClick: () => this.openDetail(() => {
          const info = GIFT_INFO[npc.id];
          this.body.add([
            this.addText(60, 136, displayName(npc.name), 30),
            drawChibi(this.scene, 150, 290, CHARA_TEXTURES[npc.id], { scale: 1.1 }),
            ...this.placeholderBox(330, 270, 170, 240, t("立ち絵（準備中）", "Standing art (coming soon)")),
            this.addText(520, 190, t(`プレゼント\n${info.gift}`, `Present\n${info.gift}`), 18, { color: CSS_COLORS.orangeLight, lineSpacing: 6 }),
          ]);
        }),
      });
    });
  },
};
