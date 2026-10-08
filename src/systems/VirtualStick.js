const STICK_RADIUS = 60;
const DEAD_ZONE = 8;

// 画面のどこでも、押した場所を中心にドラッグして歩く仮想スティック。
// マウスのクリックドラッグとスマホのタッチの両方で動く。
export class VirtualStick {
  constructor(scene) {
    this.scene = scene;
    this.vector = { x: 0, y: 0 };
    this.pointerId = null;
    this.origin = { x: 0, y: 0 };

    this.base = scene.add.circle(0, 0, STICK_RADIUS, 0xffffff, 0.1)
      .setStrokeStyle(2, 0xffffff, 0.35)
      .setScrollFactor(0)
      .setDepth(90000)
      .setVisible(false);
    this.knob = scene.add.circle(0, 0, 24, 0xffffff, 0.35)
      .setScrollFactor(0)
      .setDepth(90001)
      .setVisible(false);

    scene.input.on("pointerdown", (pointer, currentlyOver) => {
      // NPCなどクリックできる物の上では、スティックではなく通常のクリックとして扱う
      if (this.pointerId !== null || currentlyOver.length > 0) {
        return;
      }
      this.pointerId = pointer.id;
      this.origin = { x: pointer.x, y: pointer.y };
      this.base.setPosition(pointer.x, pointer.y).setVisible(true);
      this.knob.setPosition(pointer.x, pointer.y).setVisible(true);
    });
    scene.input.on("pointermove", (pointer) => {
      if (pointer.id === this.pointerId) {
        this.drag(pointer);
      }
    });
    scene.input.on("pointerup", (pointer) => {
      if (pointer.id === this.pointerId) {
        this.reset();
      }
    });
    scene.input.on("gameout", () => this.reset());
  }

  drag(pointer) {
    const dx = pointer.x - this.origin.x;
    const dy = pointer.y - this.origin.y;
    const length = Math.hypot(dx, dy);
    const clamped = Math.min(length, STICK_RADIUS);
    const angle = Math.atan2(dy, dx);

    this.knob.setPosition(
      this.origin.x + Math.cos(angle) * clamped,
      this.origin.y + Math.sin(angle) * clamped,
    );

    if (length < DEAD_ZONE) {
      this.vector = { x: 0, y: 0 };
    } else {
      const strength = clamped / STICK_RADIUS;
      this.vector = { x: Math.cos(angle) * strength, y: Math.sin(angle) * strength };
    }
  }

  // 指を離したとき、会話で中断されたときなどに止める
  reset() {
    this.pointerId = null;
    this.vector = { x: 0, y: 0 };
    this.base.setVisible(false);
    this.knob.setVisible(false);
  }
}
