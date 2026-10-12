import { CREDIT_LINES, TERMS_ITEMS } from "../data/notices.js";
import { dialogues, ekuboGiftLines } from "../data/dialogues.js";
import { npcs } from "../data/npcs.js";
import { OBJECTS } from "../data/objects.js";
import { save } from "./save.js";
import { t } from "./i18n.js";

function applyHeartPreset(preset) {
  const presets = {
    reia0: [0, 0, 0, 0],
    reia25: [7, 6, 6, 6],
    reia50: [13, 13, 12, 12],
    reia75: [19, 19, 19, 18],
    left: [100, 100, 100, 100],
    takashi: [1000, 1000, 1000, 1000],
    bath: [4000, 4000, 4000, 4000],
  };
  if (!presets[preset]) {
    return;
  }
  ["clap", "cracker", "say", "balloon"].forEach((id, index) => save.setCount(id, presets[preset][index]));
  for (const [flag, on] of [["secret_koya", ["left", "takashi", "bath"]], ["secret_takashi", ["takashi", "bath"]], ["secret_takashi_bath", ["bath"]]]) {
    save.setFlag(flag, on.includes(preset));
  }
}

function unlockEverything() {
  for (const npc of npcs) {
    save.giveGift(npc.id);
    save.markSeen(npc.id, dialogues[npc.id].length);
  }
  save.markSeen("ekubo2", ekuboGiftLines.length);
  for (const object of OBJECTS) {
    save.foundObject(object.id);
  }
}

// 開発中だけ：URLの ?panel= ?unlock= ?koya= ?heart= ?count= ?tab= で、画面を途中の状態から始める（本番では何もしない）
export function applyDevQuery(scene) {
  // 開発中だけ：?panel=settings / library / terms / credits で最初から開く
  const devQuery = import.meta.env.DEV ? new URLSearchParams(location.search) : null;
  const devPanel = devQuery?.get("panel");
  // 開発中だけ：?unlock=1 で全部解放、?tab=0〜4 でライブラリのタブを指定
  // ?koya=1 でこやの解放後、?count=99 で4つのお祝いを99回にしておく
  if (devQuery?.get("koya")) {
    save.unlockSecret("koya");
  }
  // ?heart=reia0|reia25|reia50|reia75|left|takashi|bath でハート画面をその段階にする
  applyHeartPreset(devQuery?.get("heart"));
  for (let i = 0; i < Number(devQuery?.get("count") ?? 0); i += 1) {
    ["clap", "cracker", "say", "balloon"].forEach((id) => save.count(id) < 1000 && save.addCount(id));
  }
  if (devQuery?.get("unlock")) {
    unlockEverything();
  }
  if (devPanel === "settings" || devPanel === "library" || devPanel === "heart") {
    scene.setPanel(devPanel);
    if (devQuery.get("tab")) {
      scene.library.selectTab(Number(devQuery.get("tab")));
    }
  } else if (devPanel === "terms") {
    scene.setPanel("settings");
    scene.showDetail(t("利用規約", "Terms of Use"), TERMS_ITEMS);
  } else if (devPanel === "credits") {
    scene.setPanel("settings");
    scene.showDetail(t("クレジット", "Credits"), CREDIT_LINES);
  }
}
