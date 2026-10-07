import Phaser from "phaser";
import { DialogManager } from "../systems/DialogManager.js";

export class DialogScene extends Phaser.Scene {
  constructor() {
    super("DialogScene");
  }

  create({ npc, lines }) {
    this.add.rectangle(400, 510, 800, 180, 0x111b20, 0.94)
      .setStrokeStyle(2, 0xe7ca92, 0.95);
    this.add.rectangle(106, 506, 98, 140, 0x666a6b)
      .setStrokeStyle(2, 0xc6c7bd, 0.9);
    this.add.ellipse(106, 486, 36, 42, 0xf0bd8d);
    this.add.ellipse(106, 476, 39, 18, 0x343038);
    this.add.ellipse(106, 548, 58, 62, npc.color);

    this.add.rectangle(218, 439, 188, 34, 0x23363a)
      .setStrokeStyle(1, 0xe7ca92, 0.9)
      .setOrigin(0, 0.5);
    this.nameText = this.add.text(234, 439, "", {
      color: "#fff0d6",
      fontFamily: "sans-serif",
      fontSize: "19px",
    }).setOrigin(0, 0.5);
    this.bodyText = this.add.text(232, 474, "", {
      color: "#fff7e8",
      fontFamily: "sans-serif",
      fontSize: "24px",
      lineSpacing: 10,
      wordWrap: { width: 530 },
    });
    this.advanceHint = this.add.text(756, 570, "▼", {
      color: "#f3d38d",
      fontFamily: "sans-serif",
      fontSize: "21px",
    }).setOrigin(0.5).setVisible(false);
    this.tweens.add({
      targets: this.advanceHint,
      alpha: 0.25,
      duration: 350,
      yoyo: true,
      repeat: -1,
    });

    this.dialogManager = new DialogManager(
      this,
      this.nameText,
      this.bodyText,
      this.advanceHint,
      () => this.endDialog(),
    );
    this.dialogManager.start(lines);
    this.confirmKeys = this.input.keyboard.addKeys({
      space: Phaser.Input.Keyboard.KeyCodes.SPACE,
      enter: Phaser.Input.Keyboard.KeyCodes.ENTER,
    });
    this.input.on("pointerdown", () => this.dialogManager.confirm());
  }

  update() {
    if (
      Phaser.Input.Keyboard.JustDown(this.confirmKeys.space)
      || Phaser.Input.Keyboard.JustDown(this.confirmKeys.enter)
    ) {
      this.dialogManager.confirm();
    }
  }

  endDialog() {
    this.scene.stop();
    this.scene.resume("FieldScene");
  }
}