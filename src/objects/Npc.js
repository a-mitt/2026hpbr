import { FONTS } from "../theme.js";
import { CHARACTER_SCALE, FOOT_OFFSET } from "../constants.js";
import Phaser from "phaser";

export class Npc extends Phaser.GameObjects.Container {
  constructor(scene, npcData) {
    const parts = [
      scene.add.ellipse(0, 10, 38, 48, npcData.color),
      scene.add.ellipse(0, -18, 30, 34, 0xf0bd8d),
      scene.add.ellipse(0, -34, 32, 16, 0x343038),
      scene.add.ellipse(-6, -18, 4, 5, 0x26323a),
      scene.add.ellipse(6, -18, 4, 5, 0x26323a),
      scene.add.text(0, 36, npcData.name, {
        color: "#fff0d6",
        fontFamily: FONTS.body,
        fontSize: "12px",
        stroke: "#26343a",
        strokeThickness: 3,
      }).setOrigin(0.5, 0),
      scene.add.text(0, -58, "!", {
        color: "#ffe27a",
        fontFamily: FONTS.body,
        fontSize: "30px",
        stroke: "#26343a",
        strokeThickness: 4,
      }).setOrigin(0.5).setVisible(false),
    ];

    super(scene, npcData.x, npcData.y, parts);
    this.setSize(54, 96).setInteractive(
      new Phaser.Geom.Rectangle(-27, -48, 54, 96),
      Phaser.Geom.Rectangle.Contains,
    );
    this.setScale(CHARACTER_SCALE);
    this.id = npcData.id;
    this.name = npcData.name;
    this.dialogueId = npcData.id;
    this.color = npcData.color;
    this.setDepth(npcData.y + FOOT_OFFSET);
    scene.add.existing(this);
    scene.cursorManager.bind(this, "talk", () => {
      if (this.talkAvailable) {
        scene.startConversation(this);
      }
    });

    this.talkIndicator = parts[parts.length - 1];
    this.indicatorTween = scene.tweens.add({
      targets: this.talkIndicator,
      y: -66,
      duration: 360,
      yoyo: true,
      repeat: -1,
      paused: true,
      ease: "Sine.easeInOut",
    });
    this.talkAvailable = false;
  }

  setTalkAvailable(isAvailable) {
    if (this.talkAvailable === isAvailable) {
      return;
    }

    this.talkAvailable = isAvailable;
    this.talkIndicator.setVisible(isAvailable);

    if (isAvailable) {
      this.indicatorTween.resume();
    } else {
      this.indicatorTween.pause();
    }
  }
}