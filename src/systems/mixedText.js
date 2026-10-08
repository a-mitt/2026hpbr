// フォントやサイズが違う文字を横に並べる（下端をそろえる）。
// parts: [{ text, fontFamily?, fontSize? }]。左上基準で並べ、Containerを返す
export function addMixedText(scene, x, y, parts, style) {
  const container = scene.add.container(x, y);
  const texts = parts.map((part) =>
    scene.add.text(0, 0, part.text, {
      ...style,
      fontFamily: part.fontFamily ?? style.fontFamily,
      fontSize: part.fontSize ?? style.fontSize,
    }).setOrigin(0, 1),
  );
  const height = Math.max(...texts.map((text) => text.height));
  let offset = 0;
  for (const text of texts) {
    text.setPosition(offset, height);
    offset += text.width;
    container.add(text);
  }
  container.setSize(offset, height);
  return container;
}
