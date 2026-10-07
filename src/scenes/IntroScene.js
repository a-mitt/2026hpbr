import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";

export class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.events.once("shutdown", () => this.cursorManager.reset());

    this.add.rectangle(400, 300, 800, 600, 0x18282b);
    this.add.rectangle(400, 300, 652, 484, 0x263a3d)
      .setStrokeStyle(2, 0xe5c88e, 0.9);
    this.add.text(400, 120, "HAPPY BIRTHDAY", {
      color: "#f3d7a2",
      fontFamily: "Georgia, serif",
      fontSize: "36px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(400, 171, "お誕生日お祝いミニRPG", {
      color: "#fff0d6",
      fontFamily: "sans-serif",
      fontSize: "23px",
    }).setOrigin(0.5);
    this.add.text(400, 230, "ろうそくに火を灯したら、会場を歩いてゲストとお話しします。", {
      color: "#f5e9d2",
      fontFamily: "sans-serif",
      fontSize: "17px",
      wordWrap: { width: 560 },
      align: "center",
    }).setOrigin(0.5);

    this.add.text(140, 292, "この作品は個人制作の非公式作品で、公式とは関係ありません。", {
      color: "#f5dcae",
      fontFamily: "sans-serif",
      fontSize: "16px",
      wordWrap: { width: 520 },
    });
    this.add.text(140, 334, "制作中のため、不具合や未完成の箇所が残っている場合があります。", {
      color: "#f5dcae",
      fontFamily: "sans-serif",
      fontSize: "16px",
      wordWrap: { width: 520 },
    });
    this.add.text(140, 390, "制作者：後で記入", {
      color: "#d5ded5",
      fontFamily: "sans-serif",
      fontSize: "16px",
    });

    const startButton = this.add.rectangle(400, 474, 260, 54, 0xe5c88e)
      .setStrokeStyle(2, 0xfff0d6)
      .setInteractive({ useHandCursor: false });
    this.add.text(400, 474, "同意して始める", {
      color: "#1c3034",
      fontFamily: "sans-serif",
      fontSize: "20px",
      fontStyle: "bold",
    }).setOrigin(0.5);

    this.cursorManager.bind(startButton, "button", () => {
      this.scene.start("BirthdayScene");
    });
  }
}