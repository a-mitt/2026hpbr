// ライブラリ用のキャラ絵（マップのキャラ絵 140×200）。locked ならシルエット
const SILHOUETTE = 0x1b0f0a;

export function drawChibi(scene, x, y, textureKey, { locked = false, scale = 1 } = {}) {
  const image = scene.add.image(0, 0, textureKey).setScale(scale);
  if (locked) {
    image.setTintFill(SILHOUETTE);
  }
  return scene.add.container(x, y, [image]);
}
