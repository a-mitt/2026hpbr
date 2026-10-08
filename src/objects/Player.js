import Phaser from "phaser";
import {
  MAP_HEIGHT,
  MAP_WIDTH,
  PLAYER_MARGIN_X,
  PLAYER_MARGIN_Y,
  PLAYER_SPEED,
} from "../constants.js";

export class Player extends Phaser.GameObjects.Container {
  constructor(scene, x, y) {
    const parts = [
      scene.add.ellipse(0, 10, 40, 52, 0x397cca),
      scene.add.ellipse(0, -18, 32, 34, 0xf0bd8d),
      scene.add.ellipse(0, -34, 34, 16, 0x29303a),
      scene.add.ellipse(-6, -18, 4, 5, 0x26323a),
      scene.add.ellipse(6, -18, 4, 5, 0x26323a),
    ];

    super(scene, x, y, parts);
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
    this.setDepth(y);
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

    this.x = Phaser.Math.Clamp(
      this.x + horizontalDirection * distance,
      PLAYER_MARGIN_X,
      MAP_WIDTH - PLAYER_MARGIN_X,
    );
    this.y = Phaser.Math.Clamp(
      this.y + verticalDirection * distance,
      PLAYER_MARGIN_Y,
      MAP_HEIGHT - PLAYER_MARGIN_Y,
    );
    this.setDepth(this.y);
  }
}