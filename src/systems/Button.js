import { COLORS, CSS_COLORS, FONTS } from "../theme.js";

// 透過した塗り＋二重の枠＋低彩度の影。コンテナ全体がクリック範囲
export function createButton(scene, x, y, width, height, label, fontSize = 24) {
  const shadow = scene.add.rectangle(4, 5, width, height, COLORS.bgDark, 0.55);
  const body = scene.add.rectangle(0, 0, width, height, COLORS.orange, 0.25)
    .setStrokeStyle(2, COLORS.orangeLight, 1);
  const inner = scene.add.rectangle(0, 0, width - 12, height - 12)
    .setStrokeStyle(1, COLORS.peach, 0.6);
  const text = scene.add.text(0, 0, label, {
    color: CSS_COLORS.cream,
    fontFamily: FONTS.ui,
    fontSize: `${fontSize}px`,
  }).setOrigin(0.5);

  return scene.add.container(x, y, [shadow, body, inner, text])
    .setSize(width, height)
    .setInteractive({ useHandCursor: false });
}
