import Phaser from "phaser";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_MARGIN_X,
  PLAYER_MARGIN_Y,
  TALK_DISTANCE,
} from "../constants.js";

// F2キーで表示を切り替える開発用の補助表示。
// マップ座標のマウス位置と、クリック範囲・歩ける範囲・会話距離の枠を重ねて見せる。
export class DebugOverlay {
  constructor(scene) {
    this.scene = scene;
    this.visible = false;
    this.lastClick = null;

    this.graphics = scene.add.graphics().setDepth(100000).setVisible(false);
    this.label = scene.add.text(8, 8, "", {
      color: "#ffffff",
      backgroundColor: "#000000b3",
      fontFamily: "monospace",
      fontSize: "14px",
      padding: { x: 6, y: 4 },
    }).setScrollFactor(0).setDepth(100001).setVisible(false);

    scene.input.keyboard.on("keydown-F2", () => this.toggle());
    scene.input.on("pointerdown", (pointer) => {
      pointer.updateWorldPoint(scene.cameras.main);
      this.lastClick = { x: Math.round(pointer.worldX), y: Math.round(pointer.worldY) };
    });
  }

  toggle() {
    this.visible = !this.visible;
    this.graphics.setVisible(this.visible);
    this.label.setVisible(this.visible);
    if (!this.visible) {
      this.graphics.clear();
    }
  }

  update() {
    if (!this.visible) {
      return;
    }

    const scene = this.scene;
    const pointer = scene.input.activePointer;
    pointer.updateWorldPoint(scene.cameras.main);

    const g = this.graphics;
    g.clear();

    // 歩ける範囲（プレイヤーの中心が動ける四角）
    g.lineStyle(2, 0xff5555, 1).strokeRect(
      PLAYER_MARGIN_X,
      PLAYER_MARGIN_Y,
      MAP_WIDTH - PLAYER_MARGIN_X * 2,
      MAP_HEIGHT - PLAYER_MARGIN_Y * 2,
    );

    // NPCのクリック範囲と会話距離
    for (const npc of scene.npcCharacters) {
      g.lineStyle(2, 0x55ff88, 1).strokeRect(npc.x - 27, npc.y - 48, 54, 96);
      g.lineStyle(1, 0xffe27a, 0.7).strokeCircle(npc.x, npc.y, TALK_DISTANCE);
    }

    // プレイヤーの位置
    g.lineStyle(2, 0x55aaff, 1).strokeCircle(scene.player.x, scene.player.y, 6);

    const click = this.lastClick
      ? `最後のクリック: x=${this.lastClick.x} y=${this.lastClick.y}`
      : "最後のクリック: -";
    this.label.setText([
      "DEBUG (F2で切替)",
      `マウス: x=${Math.round(pointer.worldX)} y=${Math.round(pointer.worldY)}`,
      click,
      `プレイヤー: x=${Math.round(scene.player.x)} y=${Math.round(scene.player.y)}`,
      "赤=歩ける範囲 緑=NPCクリック範囲 黄=会話距離",
    ]);
  }
}
