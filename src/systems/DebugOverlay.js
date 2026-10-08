import Phaser from "phaser";
import { FOOT_OFFSET, TALK_DISTANCE } from "../constants.js";
import { BLOCKED, ROOMS, EXIT_DOOR, TOILET_DOOR_BLOCK, WALKABLE, doorState } from "../data/mapLayout.js";

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
    this.scene.goalOverlay?.setVisible(this.visible);
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

    // 歩ける範囲(赤)・通れない範囲(水色)・部屋の暗さの範囲(紫)
    for (const r of WALKABLE) {
      g.lineStyle(2, 0xff5555, 1).strokeRect(r.x, r.y, r.w, r.h);
    }
    for (const r of BLOCKED) {
      g.lineStyle(2, 0x55e5ff, 1).strokeRect(r.x, r.y, r.w, r.h);
    }
    if (!doorState.toiletOpen) {
      const r = TOILET_DOOR_BLOCK;
      g.lineStyle(2, 0x55e5ff, 1).strokeRect(r.x, r.y, r.w, r.h);
    }
    g.lineStyle(2, 0xffe27a, 1).strokeRect(EXIT_DOOR.hit.x, EXIT_DOOR.hit.y, EXIT_DOOR.hit.w, EXIT_DOOR.hit.h);
    for (const r of ROOMS) {
      g.lineStyle(2, 0xc07aff, 0.8).strokeRect(r.x, r.y, r.w, r.h);
    }

    // NPCのクリック範囲と会話距離
    for (const npc of scene.npcCharacters) {
      g.lineStyle(2, 0x55ff88, 1).strokeRect(
        npc.x - npc.displayWidth / 2,
        npc.y - npc.displayHeight / 2,
        npc.displayWidth,
        npc.displayHeight,
      );
      g.lineStyle(1, 0xffe27a, 0.7).strokeCircle(npc.x, npc.y, TALK_DISTANCE);
    }

    // プレイヤーの足元（当たり判定の点）
    g.lineStyle(2, 0x55aaff, 1).strokeCircle(scene.player.x, scene.player.y + FOOT_OFFSET, 6);

    const click = this.lastClick
      ? `最後のクリック: x=${this.lastClick.x} y=${this.lastClick.y}`
      : "最後のクリック: -";
    this.label.setText([
      "DEBUG (F2で切替)",
      `マウス: x=${Math.round(pointer.worldX)} y=${Math.round(pointer.worldY)}`,
      click,
      `プレイヤー: x=${Math.round(scene.player.x)} y=${Math.round(scene.player.y)}`,
      "赤=歩ける 水色=通れない 紫=部屋 緑=NPC 黄=会話距離 / 薄い絵=完成形",
    ]);
  }
}
