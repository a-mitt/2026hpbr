import Phaser from "phaser";
import { CHARACTER_SCALE, FOOT_OFFSET, PLAYER_SPEED } from "../constants.js";
import { canStand } from "../data/mapLayout.js";
import { FOOT_LOCAL_Y, addCharacterSprite } from "./characterArt.js";

// 歩いているように見せる動き（絵は立ち姿の1枚なので、跳ねと左右の揺れでそれらしく見せる）
const WALK_HOP = 3; // 跳ねる高さ（コンテナ内の座標）
const WALK_TILT_DEGREES = 3.5; // 左右に傾く角度
const WALK_STEPS_PER_SECOND = 4;

// 向きごとのキャラ絵（FieldScene で読み込む）
const FACING_TEXTURES = {
  down: "chara_reigen_down",
  up: "chara_reigen_up",
  left: "chara_reigen_left",
  right: "chara_reigen_right",
};

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    const sprite = addCharacterSprite(scene, FACING_TEXTURES.down);

    super(scene, x, y, [sprite]);
    this.sprite = sprite;
    this.facing = "down";
    this.walkPhase = 0;
    this.setScale(CHARACTER_SCALE);
    scene.add.existing(this);

    this.speed = PLAYER_SPEED;
    this.keys = scene.input.keyboard.addKeys({
      up: Phaser.Input.Keyboard.KeyCodes.UP,
      left: Phaser.Input.Keyboard.KeyCodes.LEFT,
      down: Phaser.Input.Keyboard.KeyCodes.DOWN,
      right: Phaser.Input.Keyboard.KeyCodes.RIGHT,
      w: Phaser.Input.Keyboard.KeyCodes.W,
      a: Phaser.Input.Keyboard.KeyCodes.A,
      s: Phaser.Input.Keyboard.KeyCodes.S,
      d: Phaser.Input.Keyboard.KeyCodes.D,
    });
    this.setDepth(y + FOOT_OFFSET);
  }

  // stickVector: 仮想スティックの向き（x, yとも -1〜1）。キー入力があればキーを優先する
  update(delta, stickVector = { x: 0, y: 0 }) {
    let horizontalDirection = Number(this.keys.right.isDown || this.keys.d.isDown)
      - Number(this.keys.left.isDown || this.keys.a.isDown);
    let verticalDirection = Number(this.keys.down.isDown || this.keys.s.isDown)
      - Number(this.keys.up.isDown || this.keys.w.isDown);

    if (horizontalDirection === 0 && verticalDirection === 0) {
      horizontalDirection = stickVector.x;
      verticalDirection = stickVector.y;
    }

    const length = Math.hypot(horizontalDirection, verticalDirection);
    const diagonalScale = length > 1 ? 1 / length : 1;
    const distance = this.speed * (delta / 1000) * diagonalScale;

    // 足元の位置で当たり判定。x・yを別々に試すので、壁や家具に沿って滑れる
    const nextX = this.x + horizontalDirection * distance;
    if (canStand(nextX, this.y + FOOT_OFFSET)) {
      this.x = nextX;
    }
    const nextY = this.y + verticalDirection * distance;
    if (canStand(this.x, nextY + FOOT_OFFSET)) {
      this.y = nextY;
    }
    this.setDepth(this.y + FOOT_OFFSET);
    this.updateFacing(horizontalDirection, verticalDirection);
    this.updateWalkAnimation(delta, length > 0);
  }

  // 歩いている間は、足元を軸に跳ねて左右に揺れる。止まったら立ち姿に戻る
  updateWalkAnimation(delta, moving) {
    if (!moving) {
      this.walkPhase = 0;
      this.sprite.setY(FOOT_LOCAL_Y).setAngle(0);
      return;
    }
    this.walkPhase += (delta / 1000) * Math.PI * WALK_STEPS_PER_SECOND;
    this.sprite.setY(FOOT_LOCAL_Y - Math.abs(Math.sin(this.walkPhase)) * WALK_HOP);
    this.sprite.setAngle(Math.sin(this.walkPhase) * WALK_TILT_DEGREES);
  }

  // 動いている向きに合わせて絵を切り替える（止まったら向きはそのまま）
  updateFacing(horizontal, vertical) {
    if (horizontal === 0 && vertical === 0) {
      return;
    }
    const facing = Math.abs(horizontal) > Math.abs(vertical)
      ? (horizontal > 0 ? "right" : "left")
      : (vertical > 0 ? "down" : "up");
    if (facing !== this.facing) {
      this.facing = facing;
      this.sprite.setTexture(FACING_TEXTURES[facing]);
    }
  }
}