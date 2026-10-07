const cursorPlaceholders = {
  match: {
    hotspot: "7 25",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M7 27 20 14" stroke="#d28a4e" stroke-width="4" stroke-linecap="round"/><ellipse cx="23" cy="11" rx="4" ry="6" transform="rotate(40 23 11)" fill="#ef603e"/></svg>',
  },
  talk: {
    hotspot: "16 8",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M5 6h22v16H16l-7 5v-5H5z" fill="#fff0d6" stroke="#25383d" stroke-width="2"/><circle cx="11" cy="14" r="1.5" fill="#25383d"/><circle cx="16" cy="14" r="1.5" fill="#25383d"/><circle cx="21" cy="14" r="1.5" fill="#25383d"/></svg>',
  },
  inspect: {
    hotspot: "16 16",
    svg: '<svg xmlns="http://www.w3.org/2000/svg" width="32" height="32" viewBox="0 0 32 32"><path d="M3 16s4.5-8 13-8 13 8 13 8-4.5 8-13 8S3 16 3 16z" fill="#fff0d6" stroke="#25383d" stroke-width="2"/><circle cx="16" cy="16" r="4" fill="#e5b957" stroke="#25383d" stroke-width="2"/></svg>',
  },
};

function createCursorUrl(svg) {
  return `url("data:image/svg+xml,${encodeURIComponent(svg)}")`;
}

export class CursorManager {
  constructor(game) {
    this.canvas = game.canvas;
    this.cursorValues = {
      default: "default",
      button: "pointer",
      match: `${createCursorUrl(cursorPlaceholders.match.svg)} ${cursorPlaceholders.match.hotspot}, default`,
      talk: `${createCursorUrl(cursorPlaceholders.talk.svg)} ${cursorPlaceholders.talk.hotspot}, pointer`,
      inspect: `${createCursorUrl(cursorPlaceholders.inspect.svg)} ${cursorPlaceholders.inspect.hotspot}, help`,
    };
    this.currentCursor = "";
    this.set("default");
  }

  set(cursorName) {
    const cursorValue = this.cursorValues[cursorName] ?? this.cursorValues.default;

    if (this.currentCursor !== cursorValue) {
      this.canvas.style.cursor = cursorValue;
      this.currentCursor = cursorValue;
    }
  }

  bind(gameObject, cursorName, onClick) {
    gameObject.on("pointerover", () => {
      gameObject.cursorHovered = true;
      this.set(cursorName);
    });
    gameObject.on("pointerout", () => {
      gameObject.cursorHovered = false;
      this.set("default");
    });

    if (onClick) {
      gameObject.on("pointerdown", onClick);
    }
  }

  reset() {
    this.set("default");
  }
}