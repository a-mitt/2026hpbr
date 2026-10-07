import { Npc } from "../objects/Npc.js";
import { Player } from "../objects/Player.js";
import { npcs } from "../data/npcs.js";
import { dialogues } from "../data/dialogues.js";
import { MAP_HEIGHT, MAP_WIDTH, TALK_DISTANCE } from "../constants.js";
import { CursorManager } from "../systems/CursorManager.js";

export class FieldScene extends Phaser.Scene {
  constructor() {
    super("FieldScene");
    this.npcCharacters = [];
    this.closestNpc = null;
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.drawRoomPlaceholder();

    this.npcCharacters = npcs.map((npcData) => new Npc(this, npcData));
    this.player = new Player(this, MAP_WIDTH / 2, MAP_HEIGHT / 2);
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.restoreNpcCursor());
    this.cameras.main
      .setBounds(0, 0, MAP_WIDTH, MAP_HEIGHT)
      .startFollow(this.player, true, 0.08, 0.08);
    this.confirmKeys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });
  }

  drawRoomPlaceholder() {
    this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH, MAP_HEIGHT, 0x18282b);
    this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH - 80, MAP_HEIGHT - 80, 0x627f72);

    const floorGrid = this.add.graphics();
    floorGrid.lineStyle(1, 0xe0d1a4, 0.12);

    for (let x = 80; x <= MAP_WIDTH - 80; x += 80) {
      floorGrid.lineBetween(x, 42, x, MAP_HEIGHT - 42);
    }
    for (let y = 60; y <= MAP_HEIGHT - 60; y += 60) {
      floorGrid.lineBetween(40, y, MAP_WIDTH - 40, y);
    }

    this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH - 78, MAP_HEIGHT - 78, 0x000000, 0)
      .setStrokeStyle(8, 0xe5c88e, 0.86);
    this.add.rectangle(MAP_WIDTH / 2, 33, MAP_WIDTH - 80, 44, 0x324d4c);
    this.add.text(MAP_WIDTH / 2, 33, "PARTY ROOM", {
      color: "#f5e3bd",
      fontFamily: "Georgia, serif",
      fontSize: "19px",
    }).setOrigin(0.5);
  }

  update(_time, delta) {
    this.player.update(delta);
    this.updateNearbyNpc();

    if (
      this.closestNpc
      && (
        Phaser.Input.Keyboard.JustDown(this.confirmKeys.space)
        || Phaser.Input.Keyboard.JustDown(this.confirmKeys.enter)
      )
    ) {
      this.startConversation(this.closestNpc);
    }
  }

  updateNearbyNpc() {
    let nearestDistance = Number.POSITIVE_INFINITY;
    this.closestNpc = null;

    for (const npc of this.npcCharacters) {
      const distance = Phaser.Math.Distance.Between(
        this.player.x,
        this.player.y,
        npc.x,
        npc.y,
      );
      const canTalk = distance <= TALK_DISTANCE;
      npc.setTalkAvailable(canTalk);

      if (canTalk && distance < nearestDistance) {
        nearestDistance = distance;
        this.closestNpc = npc;
      }
    }
  }

  startConversation(npc) {
    this.cursorManager.reset();
    this.scene.launch("DialogScene", {
      npc: { id: npc.id, name: npc.name, color: npc.color },
      lines: dialogues[npc.dialogueId],
    });
    this.scene.pause();
  }

  restoreNpcCursor() {
    const hoveredNpc = this.npcCharacters.find(
      (npc) => npc.cursorHovered && npc.talkAvailable,
    );
    this.cursorManager.set(hoveredNpc ? "talk" : "default");
  }
}