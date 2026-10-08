import Phaser from "phaser";
import { CursorManager } from "../systems/CursorManager.js";
import { GAME_HEIGHT, GAME_WIDTH } from "../constants.js";

const CX = GAME_WIDTH / 2;

export class IntroScene extends Phaser.Scene {
  constructor() {
    super("IntroScene");
  }

  create() {
    this.cursorManager = new CursorManager(this.game);
    this.events.once("shutdown", () => this.cursorManager.reset());

    this.add.rectangle(CX, GAME_HEIGHT / 2, GAME_WIDTH, GAME_HEIGHT, 0x18282b);
    this.add.rectangle(CX, GAME_HEIGHT / 2, 652, 484, 0x263a3d)
      .setStrokeStyle(2, 0xe5c88e, 0.9);
    this.add.text(CX, 90, "HAPPY BIRTHDAY", {
      color: "#f3d7a2",
      fontFamily: "Georgia, serif",
      fontSize: "36px",
      fontStyle: "bold",
    }).setOrigin(0.5);
    this.add.text(CX, 141, "お誕生日お祝いミニRPG", {
      color: "#fff0d6",
      fontFamily: "sans-serif",
      fontSize: "23px",
    }).setOrigin(0.5);
    this.add.text(CX, 200, "ろうそくに火を灯したら、会場を歩いてゲストとお話しします。", {
      color: "#f5e9d2",
      fontFamily: "sans-serif",
      fontSize: "17px",
      wordWrap: { width: 560 },
      align: "center",
    }).setOrigin(0.5);

    this.add.text(CX - 260, 262, "この作品は個人制作の非公式作品で、公式とは関係ありません。", {
      color: "#f5dcae",
      fontFamily: "sans-serif",
      fontSize: "16px",
      wordWrap: { width: 520 },
    });
    this.add.text(CX - 260, 304, "制作中のため、不具合や未完成の箇所が残っている場合があります。", {
      color: "#f5dcae",
      fontFamily: "sans-serif",
      fontSize: "16px",
      wordWrap: { width: 520 },
    });
    this.add.text(CX - 260, 360, "制作者：後で記入", {
      color: "#d5ded5",
      fontFamily: "sans-serif",
      fontSize: "16px",
    });
    this.add.text(CX, 404, "横向きでのプレイを推奨します", {
      color: "#e5c88e",
      fontFamily: "sans-serif",
      fontSize: "16px",
    }).setOrigin(0.5);

    const startButton = this.add.rectangle(CX, 450, 260, 54, 0xe5c88e)
      .setStrokeStyle(2, 0xfff0d6)
      .setInteractive({ useHandCursor: false });
    this.add.text(CX, 450, "同意して始める", {
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