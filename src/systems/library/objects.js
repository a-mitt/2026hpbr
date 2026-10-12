import { GAMING_TIE } from "../../data/mapLayout.js";
import { OBJECTS, objectPictureKey } from "../../data/objects.js";
import { objectHint } from "../../data/hints.js";
import { save } from "../save.js";
import { UNKNOWN_LABEL } from "./shared.js";

// 絵を説明文の下の真ん中に大きく出すもの（無いものは右側に出す）
const OBJECT_PICTURE_CENTER = { gamingtie: { x: 480, y: 350, maxW: 300, maxH: 190, maxScale: 5 } };

// ライブラリの「objects」まわりの処理。LibraryView のメソッドとして混ぜ込む（this は LibraryView）
export const objectMethods = {
  // ---- オブジェクト ----
  renderObjects() {
    OBJECTS.forEach((object, index) => {
      const locked = !save.hasObject(object.id);
      this.card(index, {
        title: locked ? UNKNOWN_LABEL : object.name,
        locked,
        icon: this.markIcon(locked),
        hint: objectHint(object.id),
        onClick: () => this.openDetail(() => {
          // 絵があるときは右に出して、説明文は左の細い幅にする
          const key = objectPictureKey(object.id);
          const hasPicture = this.scene.textures.exists(key);
          const center = OBJECT_PICTURE_CENTER[object.id];
          this.body.add([
            this.addText(60, 136, object.name, 30),
            this.addText(60, 190, object.text, 19, {
              lineSpacing: 8,
              wordWrap: { width: hasPicture && !center ? 560 : 840, useAdvancedWrap: true },
            }),
          ]);
          if (hasPicture) {
            const picture = center
              ? this.scene.add.image(center.x, center.y, key)
              : this.scene.add.image(770, 255, key);
            if (object.id === "gamingtie") {
              this.animateTie(picture);
            }
            picture.setScale(center
              ? Math.min(center.maxW / picture.width, center.maxH / picture.height, center.maxScale)
              : Math.min(240 / picture.width, 190 / picture.height, 1.6));
            this.body.add(picture);
          }
        }),
      });
    });
  },

  // マップと同じように、ゲーミングネクタイの色を順番に切り替えて光らせる
  animateTie(picture) {
    const keys = GAMING_TIE.files.map((file) => file.key).filter((key) => this.scene.textures.exists(key));
    let index = 0;
    this.detailTimer = this.scene.time.addEvent({
      delay: GAMING_TIE.intervalMs,
      loop: true,
      callback: () => {
        if (!picture.active) {
          return;
        }
        index = (index + 1) % keys.length;
        picture.setTexture(keys[index]);
      },
    });
  },
};
