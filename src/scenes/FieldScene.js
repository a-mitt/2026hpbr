import { Npc } from "../objects/Npc.js";
import { Player } from "../objects/Player.js";
import { npcs } from "../data/npcs.js";
import { dialogues } from "../data/dialogues.js";
import {
  DARK_ALPHA,
  FURNITURE,
  MAP_IMAGES,
  PLAYER_START,
  ROOMS,
  TOILET_DOOR,
  doorState,
  roomAt,
} from "../data/mapLayout.js";
import { FOOT_OFFSET, MAP_HEIGHT, MAP_WIDTH, TALK_DISTANCE } from "../constants.js";
import { CursorManager } from "../systems/CursorManager.js";
import { DebugOverlay } from "../systems/DebugOverlay.js";
import { VirtualStick } from "../systems/VirtualStick.js";

const MAP_ASSET_DIR = `${import.meta.env.BASE_URL}assets/map/`;
const DARK_FADE_MS = 350;

export class FieldScene extends Phaser.Scene {
  constructor() {
    super("FieldScene");
    this.npcCharacters = [];
    this.closestNpc = null;
    this.currentRoomId = null;
    this.toiletDoorOpened = false;
  }

  preload() {
    this.load.setPath(MAP_ASSET_DIR);
    for (const [key, file] of Object.entries(MAP_IMAGES)) {
      this.load.image(key, file);
    }
    for (const furniture of FURNITURE) {
      this.load.image(furniture.key, furniture.file);
    }
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.toiletDoorOpened = false;
    doorState.toiletOpen = false;
    this.currentRoomId = null;
    this.buildMap();

    this.npcCharacters = npcs.map((npcData) => new Npc(this, npcData));
    // 開発中だけ：?px=..&py=.. でプレイヤーの足元位置を指定できる
    const query = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    const startX = Number(query?.get("px")) || PLAYER_START.x;
    const startY = Number(query?.get("py")) || PLAYER_START.y;
    this.player = new Player(this, startX, startY);
    this.events.on(Phaser.Scenes.Events.RESUME, () => this.restoreNpcCursor());
    // 常にキャラが画面の中心（遅れなし）。マップの端では外側の黒が見える
    this.cameras.main.startFollow(this.player, true, 1, 1);
    this.confirmKeys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });
    this.debugOverlay = new DebugOverlay(this);
    if (query?.get("debug")) {
      this.debugOverlay.toggle();
    }
    this.virtualStick = new VirtualStick(this);
    this.updateRoomDarkness(true);

    this.scene.launch("HudScene");
    this.events.once(Phaser.Scenes.Events.SHUTDOWN, () => this.scene.stop("HudScene"));
  }

  buildMap() {
    this.add.rectangle(MAP_WIDTH / 2, MAP_HEIGHT / 2, MAP_WIDTH * 3, MAP_HEIGHT * 3, 0x000000)
      .setDepth(-10);
    this.add.image(0, 0, "wall").setOrigin(0).setDepth(-5);
    this.add.image(0, 0, "stairs").setOrigin(0).setDepth(-4);

    // 家具：足元のsortYでキャラとの前後が決まる
    for (const furniture of FURNITURE) {
      this.add.image(0, 0, furniture.key).setOrigin(0).setDepth(furniture.sortY);
    }

    // トイレのドア（半透明の暗い面つき）。取り払うと中が見える
    this.toiletDoor = this.add.image(0, 0, "toiletdoor").setOrigin(0).setDepth(-3);
    const hit = TOILET_DOOR.hit;
    this.toiletDoorZone = this.add.zone(hit.x, hit.y, hit.w, hit.h).setOrigin(0)
      .setInteractive();
    this.cursorManager.bind(this.toiletDoorZone, "talk", () => this.toggleToiletDoor());

    // 完成形（デバッグ表示のときだけ重ねて位置合わせに使う）
    this.goalOverlay = this.add.image(0, 0, "goal").setOrigin(0).setDepth(99999)
      .setAlpha(0.4).setVisible(false);

    // 部屋ごとの暗さ（黒の乗算レイヤー）。キャラのいない部屋だけ暗くなる
    this.roomDarkness = new Map(ROOMS.map((room) => [
      room.id,
      this.add.rectangle(room.x, room.y, room.w, room.h, 0x000000, 1)
        .setOrigin(0).setDepth(90000).setAlpha(0).setBlendMode(Phaser.BlendModes.MULTIPLY),
    ]));
  }

  updateRoomDarkness(immediate = false) {
    const room = roomAt(this.player.x, this.player.y + FOOT_OFFSET);
    if (!room || room.id === this.currentRoomId) {
      return;
    }
    this.currentRoomId = room.id;

    for (const [id, layer] of this.roomDarkness) {
      const alpha = id === room.id ? 0 : DARK_ALPHA;
      this.tweens.killTweensOf(layer);
      if (immediate) {
        layer.setAlpha(alpha);
      } else {
        this.tweens.add({ targets: layer, alpha, duration: DARK_FADE_MS });
      }
    }
  }

  // 足元がトイレのドアの前（reach以内）にいるとき、外からだけ開け閉めできる
  canUseToiletDoor() {
    const stand = TOILET_DOOR.standPoint;
    const footY = this.player.y + FOOT_OFFSET;
    const isOutside = footY >= TOILET_DOOR.hit.y + TOILET_DOOR.hit.h;
    return isOutside && Phaser.Math.Distance.Between(
      this.player.x,
      footY,
      stand.x,
      stand.y,
    ) <= TOILET_DOOR.reach;
  }

  toggleToiletDoor() {
    if (!this.canUseToiletDoor()) {
      return;
    }
    this.toiletDoorOpened = !this.toiletDoorOpened;
    doorState.toiletOpen = this.toiletDoorOpened;
    this.cursorManager.reset();
    this.tweens.killTweensOf(this.toiletDoor);

    if (this.toiletDoorOpened) {
      this.tweens.add({
        targets: this.toiletDoor,
        alpha: 0,
        duration: 300,
        onComplete: () => this.toiletDoor.setVisible(false),
      });
    } else {
      this.toiletDoor.setVisible(true);
      this.tweens.add({ targets: this.toiletDoor, alpha: 1, duration: 300 });
    }
  }

  update(_time, delta) {
    this.player.update(delta, this.virtualStick.vector);
    this.updateNearbyNpc();
    this.updateRoomDarkness();
    this.debugOverlay.update();

    const confirmPressed = Phaser.Input.Keyboard.JustDown(this.confirmKeys.space)
      || Phaser.Input.Keyboard.JustDown(this.confirmKeys.enter);

    if (confirmPressed) {
      if (this.closestNpc) {
        this.startConversation(this.closestNpc);
      } else {
        this.toggleToiletDoor();
      }
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
    this.virtualStick.reset();
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
