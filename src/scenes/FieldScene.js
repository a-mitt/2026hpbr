import { Npc } from "../objects/Npc.js";
import { Player } from "../objects/Player.js";
import { npcs } from "../data/npcs.js";
import {
  GIFT_INFO,
  afterGiftLines,
  dialogues,
  ekuboAfterLines,
  ekuboGiftLines,
  ekuboWaitingLines,
  nightDeskLines,
  nightDoorLines,
  nightIntroLines,
  nightSafeNoMemoLines,
  nightSafeOpenLines,
  thinkLines,
} from "../data/dialogues.js";
import { resetSession, session } from "../systems/progress.js";
import { OBJECTS } from "../data/objects.js";
import { makeCharacterInteractive } from "../objects/characterArt.js";
import { save } from "../systems/save.js";
import {
  DARK_ALPHA,
  BALLOONS,
  DECORATION,
  EKUBO_DOOR_POS,
  EXIT_DOOR,
  FURNITURE,
  GAMING_TIE,
  GIFT_PILE,
  MAP_IMAGES,
  PLAYER_START,
  ROOMS,
  SPOTS,
  TOILET_DOOR,
  doorState,
  roomAt,
} from "../data/mapLayout.js";
import { FOOT_OFFSET, MAP_HEIGHT, MAP_WIDTH, TALK_DISTANCE } from "../constants.js";
import { FONTS } from "../theme.js";
import { CursorManager } from "../systems/CursorManager.js";
import { DebugOverlay } from "../systems/DebugOverlay.js";
import { VirtualStick } from "../systems/VirtualStick.js";
import { t } from "../systems/i18n.js";

const MAP_ASSET_DIR = `${import.meta.env.BASE_URL}assets/map/`;
const CHARA_ASSET_DIR = `${import.meta.env.BASE_URL}assets/chara/`;
const GIFT_ASSET_DIR = `${import.meta.env.BASE_URL}assets/gifts/`;
const STAND_ASSET_DIR = `${import.meta.env.BASE_URL}assets/stand/`;
const HEART_ASSET_DIR = `${import.meta.env.BASE_URL}assets/heart/`;
const BIRTHDAY_ASSET_DIR = `${import.meta.env.BASE_URL}assets/birthday/`;
const KOYA_ASSET_DIR = `${import.meta.env.BASE_URL}assets/koya/`;
// 霊幻の立ち絵の表情（会話・エンディングで使う）。キーは stand_reigen_表情
export const REIGEN_FACES = ["normal", "happy", "surprise", "littlesad", "smile", "angry", "alone", "alonebad", "happyend", "normalend"];
// キャラ絵（public/assets/chara/）。キーは "chara_" + ファイル名
const CHARA_FILES = [
  "tome", "ritsu", "shou", "mob", "teru", "serizawa", "ekubo_1", "ekubo_2", "guard_front", "guard_side",
  "reigen_down", "reigen_up", "reigen_left", "reigen_right",
];
const DARK_FADE_MS = 350;

export class FieldScene extends Phaser.Scene {
  constructor() {
    super("FieldScene");
    this.npcCharacters = [];
    this.closestNpc = null;
    this.currentRoomId = null;
    this.toiletDoorOpened = false;
    this.inputLocked = false;
  }

  preload() {
    this.load.setPath(MAP_ASSET_DIR);
    for (const [key, file] of Object.entries(MAP_IMAGES)) {
      this.load.image(key, file);
    }
    for (const furniture of FURNITURE) {
      this.load.image(furniture.key, furniture.file);
    }
    for (const overlay of [DECORATION, GIFT_PILE, ...BALLOONS, ...GAMING_TIE.files]) {
      this.load.image(overlay.key, overlay.file);
    }
    this.load.setPath(CHARA_ASSET_DIR);
    for (const name of CHARA_FILES) {
      this.load.image(`chara_${name}`, `${name}.png`);
    }
    // ハート画面のれーあら（合計の節目ごと・帰ったあと）と、ライブラリのこや（通常・しっぽ左右）
    this.load.setPath(HEART_ASSET_DIR);
    for (const name of ["reia_0", "reia_25", "reia_50", "reia_75", "reia_left", "takashi", "takashi_bath"]) {
      this.load.image(name, `${name}.png`);
    }
    // ライブラリのシークレットで見直す、お祝いの一枚絵
    this.load.setPath(BIRTHDAY_ASSET_DIR);
    this.load.image("birthday_picture", "birthday.png");
    this.load.setPath(KOYA_ASSET_DIR);
    for (const name of ["idle", "wag_left", "wag_right"]) {
      this.load.image(`koya_${name}`, `${name}.png`);
    }
    this.load.setPath(STAND_ASSET_DIR);
    for (const face of REIGEN_FACES) {
      this.load.image(`stand_reigen_${face}`, `reigen_${face}.png`);
    }
    // プレゼントの絵（キーは gift_キャラのid）。会話の前の窓・ライブラリ・マップ上のたこ焼きで使う
    this.load.setPath(GIFT_ASSET_DIR);
    for (const npc of npcs) {
      this.load.image(`gift_${npc.id}`, `${npc.id}.png`);
      // 小さく表示する用（マップ上・カードの絵）。大きい絵を小さく縮めて出すと、ギザギザになるため
      this.load.image(`gift_${npc.id}_s`, `${npc.id}_s.png`);
    }
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    resetSession();
    this.toiletDoorOpened = false;
    this.inputLocked = false;
    doorState.toiletOpen = false;
    this.currentRoomId = null;
    this.buildMap();

    this.npcCharacters = npcs.map((npcData) => new Npc(this, npcData));
    // 開発中だけ：?px=..&py=.. でプレイヤーの足元位置を指定できる
    const query = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
    const startX = Number(query?.get("px")) || PLAYER_START.x;
    const startY = Number(query?.get("py")) || PLAYER_START.y;
    this.player = new Player(this, startX, startY);
    this.setupSelfClick();
    this.setupEkubo();
    this.buildSpots();
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
    // 開発中だけ：?night=1 で夜のシーンを始める、?night=2 で演出なしに夜の状態から始める
    if (query?.get("night") === "2") {
      this.applyNight();
    } else if (query?.get("night")) {
      this.time.delayedCall(100, () => this.startNight());
    }
    if (query?.get("exit")) {
      this.scene.launch("ExitPromptScene");
      this.scene.pause();
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
      this.add.image(furniture.x ?? 0, furniture.y ?? 0, furniture.key).setOrigin(0)
        .setDepth(furniture.sortY);
    }

    // 飾り（壁のすぐ上）・プレゼントの山・バルーン・ゲーミングネクタイ
    this.add.image(DECORATION.x, DECORATION.y, DECORATION.key).setOrigin(0).setDepth(DECORATION.depth);
    this.add.image(GIFT_PILE.x, GIFT_PILE.y, GIFT_PILE.key).setOrigin(0).setDepth(GIFT_PILE.sortY);
    for (const balloon of BALLOONS) {
      this.add.image(balloon.x, balloon.y, balloon.key).setOrigin(0).setDepth(balloon.sortY);
    }
    this.gamingTies = GAMING_TIE.files.map((tie, index) => this.add
      .image(GAMING_TIE.x, GAMING_TIE.y, tie.key).setOrigin(0).setDepth(GAMING_TIE.sortY)
      .setVisible(index === 0));
    this.gamingTieIndex = 0;
    this.time.addEvent({
      delay: GAMING_TIE.intervalMs,
      loop: true,
      callback: () => {
        this.gamingTies[this.gamingTieIndex].setVisible(false);
        this.gamingTieIndex = (this.gamingTieIndex + 1) % this.gamingTies.length;
        this.gamingTies[this.gamingTieIndex].setVisible(true);
      },
    });

    // トイレのドア（半透明の暗い面つき）。取り払うと中が見える
    this.toiletDoor = this.add.image(0, 0, "toiletdoor").setOrigin(0).setDepth(-3);
    const hit = TOILET_DOOR.hit;
    this.toiletDoorZone = this.add.zone(hit.x, hit.y, hit.w, hit.h).setOrigin(0)
      .setInteractive();
    this.cursorManager.bind(this.toiletDoorZone, "talk", () => this.toggleToiletDoor(true));

    // 階段の扉（絵はない）。近づくと「!」が出て、押すと終わりの選択が出る
    const exit = EXIT_DOOR.hit;
    this.exitDoorZone = this.add.zone(exit.x, exit.y, exit.w, exit.h).setOrigin(0).setInteractive();
    this.cursorManager.bind(this.exitDoorZone, "talk", () => this.tryOpenExitPrompt(true));
    this.exitHint = this.add.text(exit.x + 22, exit.y + 18, "!", {
      color: "#ffe27a",
      fontFamily: FONTS.body,
      fontSize: "34px",
      stroke: "#26343a",
      strokeThickness: 5,
      resolution: 3,
    }).setOrigin(0.5).setDepth(80000).setVisible(false).setInteractive();
    this.cursorManager.bind(this.exitHint, "talk", () => this.tryOpenExitPrompt(true));
    this.tweens.add({
      targets: this.exitHint,
      y: exit.y + 8,
      duration: 360,
      yoyo: true,
      repeat: -1,
      ease: "Sine.easeInOut",
    });

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
    if (session.night) {
      return;
    }
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
  // トイレの中（扉の内側）にいるか。開けたあとに中へ入っているときは、中から閉められない
  isInsideToilet() {
    const { hit } = TOILET_DOOR;
    const footY = this.player.y + FOOT_OFFSET;
    return this.player.x > hit.x && this.player.x < hit.x + hit.w
      && footY > hit.y && footY < hit.y + hit.h;
  }

  // 足元から扉の四角までの距離
  toiletDoorDistance() {
    const { hit } = TOILET_DOOR;
    const footX = this.player.x;
    const footY = this.player.y + FOOT_OFFSET;
    return Math.hypot(
      Math.max(hit.x - footX, 0, footX - (hit.x + hit.w)),
      Math.max(hit.y - footY, 0, footY - (hit.y + hit.h)),
    );
  }

  // 扉のまわり（外側）にいれば開け閉めできる。横や斜めからでもよい
  canUseToiletDoor() {
    return !this.isInsideToilet() && this.toiletDoorDistance() <= TOILET_DOOR.reach;
  }

  toggleToiletDoor(fromClick = false) {
    if (!this.canUseToiletDoor()) {
      // 中にいるときは何も言わない（「近づいてね」は、遠いときだけ）
      if (fromClick && !this.isInsideToilet()) {
        this.hintFar(TOILET_DOOR.hit.x + TOILET_DOOR.hit.w / 2, TOILET_DOOR.hit.y + 40);
      }
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

  nearExitDoor() {
    const stand = EXIT_DOOR.standPoint;
    return Phaser.Math.Distance.Between(
      this.player.x,
      this.player.y + FOOT_OFFSET,
      stand.x,
      stand.y,
    ) <= EXIT_DOOR.reach;
  }

  tryOpenExitPrompt(fromClick = false) {
    if (this.inputLocked) {
      return;
    }
    if (!this.nearExitDoor()) {
      if (fromClick) {
        this.hintFar(EXIT_DOOR.hit.x + EXIT_DOOR.hit.w / 2, EXIT_DOOR.hit.y + 20);
      }
      return;
    }
    if (session.night) {
      this.sayLines(nightDoorLines);
      return;
    }
    this.cursorManager.reset();
    this.virtualStick.reset();
    this.scene.launch("ExitPromptScene");
    this.scene.pause();
  }

  // 遠いところを押したときの案内（その場所の上に一瞬だけ出る）
  hintFar(x, y) {
    const text = this.add.text(x, y - 10, t("近づいてね", "Get closer"), {
      color: "#fff0d6",
      fontFamily: FONTS.body,
      fontSize: "20px",
      stroke: "#26343a",
      strokeThickness: 5,
      resolution: 3,
    }).setOrigin(0.5, 1).setDepth(80001);
    this.tweens.add({
      targets: text,
      y: y - 36,
      alpha: 0,
      delay: 500,
      duration: 700,
      onComplete: () => text.destroy(),
    });
  }

  // マウスを乗せているものが、いま操作できるときだけ、操作できるカーソルにする
  updateHoverCursors() {
    const targets = [
      ...this.npcCharacters.map((npc) => ({ object: npc, usable: npc.talkAvailable, cursor: "talk" })),
      ...this.spots.map((spot) => ({ object: spot.zone, usable: this.spotInReach(spot), cursor: "inspect" })),
      { object: this.toiletDoorZone, usable: this.canUseToiletDoor(), cursor: "talk" },
      { object: this.exitDoorZone, usable: this.nearExitDoor(), cursor: "talk" },
    ];
    const hovered = targets.find((target) => target.object.cursorHovered && target.object.visible !== false);
    if (hovered) {
      this.cursorManager.set(hovered.usable ? hovered.cursor : "default");
    }
  }

  update(_time, delta) {
    if (this.inputLocked) {
      return;
    }
    this.player.update(delta, this.virtualStick.vector);
    this.updateNearbyNpc();
    this.updateRoomDarkness();
    this.updateEkuboLeaving();
    this.updateSpotHint();
    this.updateHoverCursors();
    // 近くに話せる人や調べられる物があるときは、自分のクリック（たすき）を止める（そちらを押せなくなるため）
    if (this.player.input) {
      this.player.input.enabled = !(this.closestNpc || this.nearestSpot() || this.nearExitDoor());
    }
    this.exitHint.setVisible(this.nearExitDoor());
    this.debugOverlay.update();

    const confirmPressed = Phaser.Input.Keyboard.JustDown(this.confirmKeys.space)
      || Phaser.Input.Keyboard.JustDown(this.confirmKeys.enter);

    if (confirmPressed) {
      if (this.closestNpc) {
        this.startConversation(this.closestNpc);
      } else if (this.nearestSpot()) {
        this.nearestSpot().use();
      } else if (this.nearExitDoor()) {
        this.tryOpenExitPrompt();
      } else {
        this.toggleToiletDoor();
      }
    }
  }

  updateNearbyNpc() {
    let nearestDistance = Number.POSITIVE_INFINITY;
    this.closestNpc = null;

    for (const npc of this.npcCharacters) {
      if (!npc.visible) {
        npc.setTalkAvailable(false);
        continue;
      }
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
    if (this.inputLocked) {
      return;
    }
    this.cursorManager.reset();
    this.virtualStick.reset();
    const id = npc.dialogueId;
    let lines;
    let dialogKey = null;
    let onFinish = null;
    let gift = null;
    let portraits = {};

    if (id === "ekubo") {
      const state = this.ekuboState();
      if (state === 2) {
        // 玄関の外に立っている守衛のエクボに話しかけた：プレゼントの場面
        this.startEkuboGift();
        return;
      }
      if (state === 0) {
        lines = dialogues.ekubo;
        dialogKey = "ekubo";
        onFinish = () => save.setFlag("ekuboState", 1);
      } else if (state === 1) {
        lines = ekuboWaitingLines;
      } else {
        const talks = save.flag("ekuboTalks") ?? 0;
        lines = ekuboAfterLines[Math.min(talks, ekuboAfterLines.length - 1)];
        onFinish = () => save.setFlag("ekuboTalks", talks + 1);
        portraits = { エクボ: "chara_guard_front" };
      }
    } else if (save.hasGift(id)) {
      lines = afterGiftLines[id];
    } else {
      lines = dialogues[id];
      dialogKey = id;
      gift = { id, name: GIFT_INFO[id].gift };
      onFinish = () => save.giveGift(id);
    }

    this.scene.launch("DialogScene", {
      npc: { id: npc.id, name: npc.name, color: npc.color },
      lines,
      dialogKey,
      onFinish,
      gift,
      portraits,
    });
    this.scene.pause();
  }

  // ---- エクボ ----
  // 0＝まだ話していない／1＝1回目のあと（近くにいる）／2＝玄関の外で待っている／3＝プレゼントのあと（元の場所）
  ekuboState() {
    return save.flag("ekuboState") ?? 0;
  }

  setupEkubo() {
    this.ekubo = this.npcCharacters.find((npc) => npc.id === "ekubo");
    this.ekuboHome = { x: this.ekubo.x, y: this.ekubo.y };
    const state = this.ekuboState();
    if (state === 2) {
      this.placeGuardAtDoor();
    } else if (state === 3) {
      // 玄関から戻ったあとは、守衛の姿（正面）のまま
      this.ekubo.setSkin("chara_guard_front");
      this.showTakoyaki();
    }
  }

  // 玄関の外（階段側）に、守衛のエクボ（横向き）が立つ。触る（話しかける）とプレゼントの場面
  placeGuardAtDoor() {
    this.ekubo.setSkin("chara_guard_side");
    // 暗い階段の中でも見えるよう、部屋の暗さ（乗算）より手前に出す
    this.ekubo.setPosition(EKUBO_DOOR_POS.x, EKUBO_DOOR_POS.y).setDepth(90001).setVisible(true);
  }

  // 1回目のあと、幽霊のエクボが画面の外に出たら消えて、玄関の外に守衛のエクボが立つ
  updateEkuboLeaving() {
    if (this.ekuboState() !== 1) {
      return;
    }
    const view = this.cameras.main.worldView;
    const margin = 80;
    const isOutside = (x, y) => x < view.x - margin || x > view.right + margin
      || y < view.y - margin || y > view.bottom + margin;
    // 玄関側が画面に映っているときは、目の前で現れないよう待つ
    if (isOutside(this.ekubo.x, this.ekubo.y) && isOutside(EKUBO_DOOR_POS.x, EKUBO_DOOR_POS.y)) {
      save.setFlag("ekuboState", 2);
      this.placeGuardAtDoor();
    }
  }

  lightStairs(isLit) {
    const layer = this.roomDarkness.get("stairs");
    this.tweens.killTweensOf(layer);
    if (isLit) {
      // このあとマップは一時停止する（アニメが止まる）ので、すぐ明るくする
      layer.setAlpha(0);
      return;
    }
    this.tweens.add({ targets: layer, alpha: DARK_ALPHA, duration: DARK_FADE_MS });
  }

  startEkuboGift() {
    this.cursorManager.reset();
    this.virtualStick.reset();
    this.lightStairs(true);
    this.scene.launch("DialogScene", {
      npc: { id: this.ekubo.id, name: this.ekubo.name, color: this.ekubo.color },
      lines: ekuboGiftLines,
      dialogKey: "ekubo2",
      gift: { id: "ekubo", name: GIFT_INFO.ekubo.gift },
      portraits: { エクボ: "chara_guard_side" },
      onFinish: () => this.finishEkuboGift(),
    });
    this.scene.pause();
  }

  // 暗転して、エクボを元の場所（エアコンの下）へ移す
  finishEkuboGift() {
    const camera = this.cameras.main;
    this.inputLocked = true;
    camera.fadeOut(500, 0, 0, 0);
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.ekubo.setSkin("chara_guard_front");
      this.ekubo.setPosition(this.ekuboHome.x, this.ekuboHome.y)
        .setDepth(this.ekuboHome.y + FOOT_OFFSET);
      this.lightStairs(false);
      save.giveGift("ekubo");
      save.setFlag("ekuboState", 3);
      this.showTakoyaki();
      camera.fadeIn(500, 0, 0, 0);
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.inputLocked = false;
      });
    });
  }

  // ---- 調べる ----
  // 調べたときの文章を霊幻の地の文で出し、終わったらライブラリに登録する
  examine(objectId, after = null) {
    const object = OBJECTS.find((entry) => entry.id === objectId);
    this.sayLines(thinkLines(object.text), () => {
      save.foundObject(objectId);
      after?.();
    });
  }

  // 霊幻の地の文を出す（終わったら onFinish）
  sayLines(lines, onFinish = null) {
    this.cursorManager.reset();
    this.virtualStick.reset();
    this.scene.launch("DialogScene", {
      npc: { id: "reigen", name: "霊幻", color: 0x397cca },
      lines,
      dialogKey: null,
      onFinish,
    });
    this.scene.pause();
  }

  // ---- 夜（エンディング：1人で残る） ----
  startNight() {
    const camera = this.cameras.main;
    this.inputLocked = true;
    camera.fadeOut(800, 0, 0, 0);
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.applyNight();
      camera.fadeIn(800, 0, 0, 0);
      camera.once(Phaser.Cameras.Scene2D.Events.FADE_IN_COMPLETE, () => {
        this.inputLocked = false;
        this.sayLines(nightIntroLines);
      });
    });
  }

  // 夜の状態にする（NPCを消し、全体を暗くする）
  applyNight() {
    Object.assign(session, { night: true, photo: false, safeDone: false });
    for (const npc of this.npcCharacters) {
      npc.setVisible(false);
      npc.setTalkAvailable(false);
    }
    this.takoyakiSprite?.setVisible(false);
    for (const layer of this.roomDarkness.values()) {
      layer.setAlpha(0);
    }
    // 全体を暗く（青みのある乗算）
    this.add.rectangle(0, 0, MAP_WIDTH, MAP_HEIGHT, 0x4b5385, 1).setOrigin(0).setDepth(95000)
      .setBlendMode(Phaser.BlendModes.MULTIPLY);
    this.player.setPosition(PLAYER_START.x, PLAYER_START.y);
    this.game.events.emit("tasks-changed");
  }

  // 夜のデスク：写真 → 金庫（メモが必要）→ トゥルーエンド
  useNightDesk() {
    if (!session.photo) {
      this.sayLines(nightDeskLines, () => {
        session.photo = true;
        this.game.events.emit("tasks-changed");
      });
    } else if (!save.flag("safeMemo")) {
      this.sayLines(nightSafeNoMemoLines);
    } else {
      this.sayLines(nightSafeOpenLines, () => {
        session.safeDone = true;
        this.game.events.emit("tasks-changed");
        this.time.delayedCall(1500, () => this.finishTrueEnd());
      });
    }
  }

  finishTrueEnd() {
    const camera = this.cameras.main;
    this.inputLocked = true;
    camera.fadeOut(1000, 0, 0, 0);
    camera.once(Phaser.Cameras.Scene2D.Events.FADE_OUT_COMPLETE, () => {
      this.scene.stop("HudScene");
      this.scene.start("EndingScene", { kind: "true" });
    });
  }

  // 自分をクリックすると「本日の主役たすき」を調べる。1回調べたら、クリックは効かなくなる
  // （たすきは霊幻のキャラ絵に最初から描かれている）
  setupSelfClick() {
    if (save.hasObject("sash")) {
      return;
    }
    makeCharacterInteractive(this.player);
    this.cursorManager.bind(this.player, "inspect", () => {
      if (this.inputLocked) {
        return;
      }
      this.player.disableInteractive();
      this.examine("sash");
    });
  }

  // 調べられる場所（植木鉢・デスクの書類・たこ焼き）。近づくと「!」、決定かクリックで調べる
  buildSpots() {
    this.spots = [
      // seen＝もう調べたか（調べたあとは「!」を出さない。押せば何度でも読める）
      {
        key: "planter",
        seen: () => save.hasObject("planter"),
        use: () => this.examine("planter", () => save.setFlag("safeMemo")),
      },
      {
        key: "deskPapers",
        seen: () => (session.night ? session.safeDone : save.hasObject("safe")),
        use: () => (session.night ? this.useNightDesk() : this.examine("safe")),
      },
      { key: "giftPile", seen: () => save.hasObject("giftpile"), use: () => this.examine("giftpile") },
      { key: "gamingTie", seen: () => save.hasObject("gamingtie"), use: () => this.examine("gamingtie") },
      {
        key: "takoyaki",
        enabled: () => this.ekuboState() === 3 && !session.night,
        seen: () => Boolean(save.flag("takoyakiSeen")),
        // たこ焼きの中身（シロツメクサ）は、ライブラリのプレゼントの文章と同じ
        use: () => this.sayLines(thinkLines(GIFT_INFO.ekubo.episode), () => save.setFlag("takoyakiSeen")),
      },
    ].map((spot) => ({ ...SPOTS[spot.key], ...spot }));

    for (const spot of this.spots) {
      const { hit } = spot;
      spot.zone = this.add.zone(hit.x, hit.y, hit.w, hit.h).setOrigin(0).setInteractive();
      this.cursorManager.bind(spot.zone, "inspect", () => {
        if (this.inputLocked) {
          return;
        }
        if (this.spotInReach(spot)) {
          spot.use();
        } else if (!spot.enabled || spot.enabled()) {
          this.hintFar(hit.x + hit.w / 2, hit.y);
        }
      });
    }
    this.spotHint = this.add.text(0, 0, "!", {
      color: "#ffe27a",
      fontFamily: FONTS.body,
      fontSize: "34px",
      stroke: "#26343a",
      strokeThickness: 5,
      resolution: 3,
    }).setOrigin(0.5).setDepth(80000).setVisible(false).setInteractive();
    // 「!」を押しても調べられる
    this.cursorManager.bind(this.spotHint, "inspect", () => this.nearestSpot(true)?.use());
  }

  // 足元から、調べる場所（四角）までの距離
  spotDistance(spot) {
    const { hit } = spot;
    const footX = this.player.x;
    const footY = this.player.y + FOOT_OFFSET;
    const dx = Math.max(hit.x - footX, 0, footX - (hit.x + hit.w));
    const dy = Math.max(hit.y - footY, 0, footY - (hit.y + hit.h));
    return Math.hypot(dx, dy);
  }

  spotInReach(spot) {
    if (spot.enabled && !spot.enabled()) {
      return false;
    }
    return this.spotDistance(spot) <= spot.reach;
  }

  // onlyUnseen＝まだ調べていない場所だけ（「!」の表示用）
  nearestSpot(onlyUnseen = false) {
    let best = null;
    let bestDistance = Number.POSITIVE_INFINITY;
    for (const spot of this.spots) {
      if (!this.spotInReach(spot) || (onlyUnseen && spot.seen?.())) {
        continue;
      }
      const distance = this.spotDistance(spot);
      if (distance < bestDistance) {
        best = spot;
        bestDistance = distance;
      }
    }
    return best;
  }

  updateSpotHint() {
    const spot = this.nearestSpot(true);
    this.spotHint.setVisible(Boolean(spot));
    if (spot) {
      // 大きい物は、近い側の端の上に「!」を出す（中央だと遠く見える）
      const { hit } = spot;
      const x = Phaser.Math.Clamp(this.player.x, hit.x + 20, hit.x + hit.w - 20);
      this.spotHint.setPosition(x, hit.y - 12);
    }
  }

  // エクボのプレゼント（たこ焼き）。絵ができるまでは仮の丸
  showTakoyaki() {
    if (this.takoyakiSprite) {
      return;
    }
    const hit = SPOTS.takoyaki.hit;
    // 小さなテーブルの上のたこ焼き（絵の幅を60pxに合わせる）
    const image = this.add.image(hit.x + hit.w / 2, hit.y + hit.h / 2, "gift_ekubo_s").setDepth(1005);
    image.setScale(64 / image.width);
    this.takoyakiSprite = image;
  }

  restoreNpcCursor() {
    const hoveredNpc = this.npcCharacters.find(
      (npc) => npc.cursorHovered && npc.talkAvailable,
    );
    this.cursorManager.set(hoveredNpc ? "talk" : "default");
  }
}
