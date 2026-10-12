import { GIFT_INFO, ekuboGiftLines } from "../data/dialogues.js";
import { DARK_ALPHA, EKUBO_DOOR_POS, SPOTS } from "../data/mapLayout.js";
import { FOOT_OFFSET } from "../constants.js";
import { save } from "./save.js";

// 暗い階段に立つ守衛のエクボの色味（乗算の幕は使わず、絵に直接かける）
const GUARD_DIM_TINT = 0x8f8fa8;
const DARK_FADE_MS = 350;

// エクボのイベント（幽霊 → 玄関の外の守衛 → プレゼント → たこ焼き）。FieldScene が持つ。
// 状態: 0＝まだ話していない／1＝1回目のあと（近くにいる）／2＝玄関の外で待っている／3＝プレゼントのあと（元の場所）
export class EkuboEvent {
  constructor(scene) {
    this.scene = scene;
    this.npc = scene.npcCharacters.find((npc) => npc.id === "ekubo");
    this.home = { x: this.npc.x, y: this.npc.y };
    this.takoyakiSprite = null;

    const state = this.state();
    if (state === 2) {
      this.placeGuardAtDoor();
    } else if (state === 3) {
      // 玄関から戻ったあとは、守衛の姿（正面）のまま
      this.npc.setSkin("chara_guard_front");
      this.showTakoyaki();
    }
  }

  state() {
    return save.flag("ekuboState") ?? 0;
  }

  // 玄関の外（階段側）に、守衛のエクボ（横向き）が立つ。触る（話しかける）とプレゼントの場面
  placeGuardAtDoor() {
    this.npc.setSkin("chara_guard_side");
    // 暗い階段の中でも見えるよう、部屋の暗さ（乗算）より手前に出す
    this.npc.setPosition(EKUBO_DOOR_POS.x, EKUBO_DOOR_POS.y).setDepth(90001).setVisible(true);
    // 暗い階段にいるので、乗算の幕の代わりに少し暗くする（話しかけて階段が明るくなったら戻す）
    this.npc.sprite.setTint(GUARD_DIM_TINT);
  }

  // 1回目のあと、幽霊のエクボが画面の外に出たら消えて、玄関の外に守衛のエクボが立つ
  updateLeaving() {
    if (this.state() !== 1) {
      return;
    }
    const view = this.scene.cameras.main.worldView;
    const margin = 80;
    const isOutside = (x, y) => x < view.x - margin || x > view.right + margin
      || y < view.y - margin || y > view.bottom + margin;
    // 玄関側が画面に映っているときは、目の前で現れないよう待つ
    if (isOutside(this.npc.x, this.npc.y) && isOutside(EKUBO_DOOR_POS.x, EKUBO_DOOR_POS.y)) {
      save.setFlag("ekuboState", 2);
      this.placeGuardAtDoor();
    }
  }

  lightStairs(isLit) {
    const { scene } = this;
    const layer = scene.roomDarkness.get("stairs");
    scene.tweens.killTweensOf(layer);
    if (isLit) {
      // このあとマップは一時停止する（アニメが止まる）ので、すぐ明るくする
      layer.setAlpha(0);
      return;
    }
    scene.tweens.add({ targets: layer, alpha: DARK_ALPHA, duration: DARK_FADE_MS });
  }

  startGift() {
    const { scene, npc } = this;
    scene.freezeInput();
    this.lightStairs(true);
    npc.sprite.clearTint();
    scene.launchOverlay("DialogScene", {
      npc: { id: npc.id, name: npc.name, color: npc.color },
      lines: ekuboGiftLines,
      dialogKey: "ekubo2",
      gift: { id: "ekubo", name: GIFT_INFO.ekubo.gift },
      portraits: { エクボ: "chara_guard_side" },
      onFinish: () => this.finishGift(),
    });
  }

  // 暗転して、エクボを元の場所（エアコンの下）へ移す
  finishGift() {
    this.scene.fadeThrough(500, 500, () => {
      this.npc.setSkin("chara_guard_front");
      this.npc.setPosition(this.home.x, this.home.y).setDepth(this.home.y + FOOT_OFFSET);
      this.lightStairs(false);
      save.giveGift("ekubo");
      save.setFlag("ekuboState", 3);
      this.showTakoyaki();
    });
  }

  // エクボのプレゼント（たこ焼き）。絵ができるまでは仮の丸
  showTakoyaki() {
    if (this.takoyakiSprite) {
      return;
    }
    const { hit } = SPOTS.takoyaki;
    // 小さなテーブルの上のたこ焼き（絵の幅を60pxに合わせる）
    const image = this.scene.add.image(hit.x + hit.w / 2, hit.y + hit.h / 2, "gift_ekubo_s").setDepth(1005);
    image.setScale(64 / image.width);
    this.takoyakiSprite = image;
  }

  hideTakoyaki() {
    this.takoyakiSprite?.setVisible(false);
  }
}
