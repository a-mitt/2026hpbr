import Phaser from "phaser";
import { COLORS, CSS_COLORS, FONTS } from "../theme.js";

const TEXT_RESOLUTION = 2;

// 右上ボタンのアイコン絵。HudScene のメソッドとして混ぜ込む（this は HudScene）
export const iconMethods = {
  drawGear(icon) {
    const cream = Phaser.Display.Color.HexStringToColor(CSS_COLORS.cream).color;
    for (let i = 0; i < 4; i += 1) {
      icon.add(this.add.rectangle(0, 0, 8, 33, cream).setAngle(i * 45));
    }
    icon.add(this.add.circle(0, 0, 12, cream));
    icon.add(this.add.circle(0, 0, 5, COLORS.bgDark));
  },

  drawBook(icon) {
    const cream = Phaser.Display.Color.HexStringToColor(CSS_COLORS.cream).color;
    icon.add(this.add.rectangle(-8, 0, 15, 22, cream));
    icon.add(this.add.rectangle(8, 0, 15, 22, cream));
    icon.add(this.add.rectangle(0, 0, 2, 24, COLORS.bgDark));
    icon.add(this.add.rectangle(-8, -3, 9, 2, COLORS.orange));
    icon.add(this.add.rectangle(8, -3, 9, 2, COLORS.orange));
    icon.add(this.add.rectangle(-8, 3, 9, 2, COLORS.orange));
    icon.add(this.add.rectangle(8, 3, 9, 2, COLORS.orange));
  },

  drawHeart(icon) {
    icon.add(this.add.text(0, 1, "♥", {
      color: "#f49ac1",
      fontFamily: FONTS.ui,
      fontSize: "34px",
      resolution: TEXT_RESOLUTION,
    }).setOrigin(0.5));
  },

  drawCross(icon) {
    const cream = Phaser.Display.Color.HexStringToColor(CSS_COLORS.cream).color;
    icon.add(this.add.rectangle(0, 0, 6, 28, cream).setAngle(45));
    icon.add(this.add.rectangle(0, 0, 6, 28, cream).setAngle(-45));
  },
};
