import { TYPING_INTERVAL_MS } from "../constants.js";
import { displayName } from "./i18n.js";

export class DialogManager {
  constructor(scene, nameText, bodyText, advanceHint, onEnd, { nameBox = null, onLine = null } = {}) {
    this.nameBox = nameBox;
    this.onLine = onLine;
    this.scene = scene;
    this.nameText = nameText;
    this.bodyText = bodyText;
    this.advanceHint = advanceHint;
    this.onEnd = onEnd;
    this.lines = [];
    this.lineIndex = 0;
    this.state = "IDLE";
    this.typingTimer = null;
  }

  start(lines) {
    this.lines = lines;
    this.lineIndex = 0;
    this.showCurrentLine();
  }

  showCurrentLine() {
    const line = this.lines[this.lineIndex];
    this.nameText.setText(displayName(line.speaker));
    // 地の文（話者なし）のときは名前の札を出さない
    this.nameBox?.setVisible(line.speaker !== "");
    this.onLine?.(this.lineIndex);
    this.bodyText.setText("");
    this.advanceHint.setVisible(false);
    this.state = "TYPING";
    this.visibleCharacters = 0;

    if (line.text.length === 0) {
      this.finishTyping();
      return;
    }

    this.typingTimer = this.scene.time.addEvent({
      delay: TYPING_INTERVAL_MS,
      loop: true,
      callback: () => {
        this.visibleCharacters += 1;
        this.bodyText.setText(line.text.slice(0, this.visibleCharacters));

        if (this.visibleCharacters >= line.text.length) {
          this.typingTimer.remove(false);
          this.finishTyping();
        }
      },
    });
  }

  finishTyping() {
    this.state = "WAITING";
    this.advanceHint.setVisible(true);
  }

  confirm() {
    if (this.state === "TYPING") {
      this.typingTimer?.remove(false);
      this.bodyText.setText(this.lines[this.lineIndex].text);
      this.finishTyping();
      return;
    }

    if (this.state !== "WAITING") {
      return;
    }

    if (this.lineIndex < this.lines.length - 1) {
      this.lineIndex += 1;
      this.showCurrentLine();
      return;
    }

    this.state = "END";
    this.onEnd();
  }
}