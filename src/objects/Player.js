import Phaser from "phaser";
import { MAP_HEIGHT, MAP_WIDTH, PLAYER_SPEED } from "../constants.js";

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

  update(delta) {
    const horizontalDirection = Number(this.keys.right.isDown || this.keys.d.isDown)
      - Number(this.keys.left.isDown || this.keys.a.isDown);
    const verticalDirection = Number(this.keys.down.isDown || this.keys.s.isDown)
      - Number(this.keys.up.isDown || this.keys.w.isDown);
    const diagonalScale = horizontalDirection !== 0 && verticalDirection !== 0
      ? Math.SQRT1_2
      : 1;
    const distance = this.speed * (delta / 1000) * diagonalScale;

    this.x = Phaser.Math.Clamp(
      this.x + horizontalDirection * distance,
      58,
      MAP_WIDTH - 58,
    );
    this.y = Phaser.Math.Clamp(
      this.y + verticalDirection * distance,
      82,
      MAP_HEIGHT - 82,
    );
    this.setDepth(this.y);
  }
}