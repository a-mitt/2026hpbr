import { GAME_WIDTH } from "../../constants.js";
import { SECRETS } from "../../data/objects.js";
import { secretHint } from "../../data/hints.js";
import { createButton } from "../Button.js";
import { save } from "../save.js";
import { CSS_COLORS } from "../../theme.js";
import { t } from "../i18n.js";
import { UNKNOWN_LABEL } from "./shared.js";

// ライブラリの「secrets」まわりの処理。LibraryView のメソッドとして混ぜ込む（this は LibraryView）
export const secretMethods = {
  // ---- シークレット ----
  renderSecrets() {
    SECRETS.forEach((secret, index) => {
      const locked = !save.flag(`secret_${secret.id}`);
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : secret.name,
        locked,
        icon: this.markIcon(locked, "★"),
        hint: secretHint(secret.id),
        onClick: () => this.openDetail(() => this.renderSecretDetail(secret)),
      });
    });
  },

  // シークレットの詳細：エンディングは「もう一度見る」、絵は大きく見せる
  renderSecretDetail(secret) {
    const scene = this.scene;
    this.body.add(this.addText(60, 136, secret.name, 30));

    const endings = { true_end: "true", normal_end: "normal", bad_end: "bad" };
    if (endings[secret.id]) {
      this.body.add(this.addText(60, 190, t("このエンディングを、もう一度見られます。", "You can watch this ending again."), 18, {
        color: CSS_COLORS.peach,
      }));
      const watch = createButton(scene, 60 + 130, 270, 260, 60, t("もう一度見る", "Watch again"), 24);
      this.cursorManager.bind(watch, "button", () => {
        this.cursorManager.reset();
        if (secret.id === "true_end") {
          // トゥルーエンドは夜のシーンから見直す（終わったらライブラリに戻る）
          scene.setPanel(null);
          scene.scene.get("FieldScene").startNight(true);
          return;
        }
        scene.scene.launch("EndingScene", { kind: endings[secret.id], replay: true });
      });
      this.body.add(watch);
      return;
    }

    // 絵のシークレット（お祝いの一枚絵・こや・原作の隆）
    const pictures = {
      happy_picture: "birthday_picture",
      koya: "reia_left",
      takashi: "takashi",
      takashi_bath: "takashi_bath",
    };
    const key = pictures[secret.id];
    if (key && scene.textures.exists(key)) {
      const picture = scene.add.image(GAME_WIDTH / 2, 316, key);
      picture.setScale(Math.min(560 / picture.width, 270 / picture.height));
      this.body.add(picture);
    }
  },
};
