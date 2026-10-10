// 進み具合の保存（ブラウザのlocalStorage。使えない環境ではこのタブの間だけ覚える）
const KEY = "2026hpbr-save-v1";

const emptyData = () => ({ seen: {}, gifts: {}, objects: {}, flags: {}, news: {}, counts: {} });

function load() {
  try {
    const raw = window.localStorage.getItem(KEY);
    if (raw) {
      return { ...emptyData(), ...JSON.parse(raw) };
    }
  } catch {
    // シークレットモードなどで使えないときは、何もせず空で始める
  }
  return emptyData();
}

let data = load();
const listeners = new Set();

function commit() {
  try {
    window.localStorage.setItem(KEY, JSON.stringify(data));
  } catch {
    // 保存できなくても遊べる
  }
  for (const listener of listeners) {
    listener();
  }
}

export const save = {
  // 変更されたら呼ばれる。戻り値の関数を呼ぶと解除
  onChange(listener) {
    listeners.add(listener);
    return () => listeners.delete(listener);
  },

  // 会話（dialogKey）を、何行目まで読んだか
  seenCount(dialogKey) {
    return data.seen[dialogKey] ?? 0;
  },
  markSeen(dialogKey, count) {
    if (count > this.seenCount(dialogKey)) {
      data.seen[dialogKey] = count;
      commit();
    }
  },

  hasGift(npcId) {
    return Boolean(data.gifts[npcId]);
  },
  // 初めて受け取ったときだけ true を返す
  giveGift(npcId) {
    if (data.gifts[npcId]) {
      return false;
    }
    data.gifts[npcId] = true;
    // ライブラリの「プレゼント」「セリフ」「コレクション」に新着の印
    Object.assign(data.news, { 0: true, 1: true, 3: true });
    commit();
    return true;
  },

  hasObject(objectId) {
    return Boolean(data.objects[objectId]);
  },
  foundObject(objectId) {
    if (data.objects[objectId]) {
      return false;
    }
    data.objects[objectId] = true;
    data.news[2] = true;
    commit();
    return true;
  },

  // ハート画面のお祝いの回数
  count(id) {
    return data.counts[id] ?? 0;
  },
  // 開発用：回数を直接決める
  setCount(id, value) {
    data.counts[id] = value;
    commit();
  },
  addCount(id) {
    data.counts[id] = this.count(id) + 1;
    commit();
  },

  // ライブラリのタブ（0〜4）の新着。見たら消す
  hasNew(tab) {
    return tab === undefined ? Object.keys(data.news).length > 0 : Boolean(data.news[tab]);
  },
  clearNew(tab) {
    if (data.news[tab]) {
      delete data.news[tab];
      commit();
    }
  },

  flag(name) {
    return data.flags[name];
  },
  setFlag(name, value = true) {
    if (data.flags[name] !== value) {
      data.flags[name] = value;
      commit();
    }
  },

  // シークレット（エンディングなど）を解放。ライブラリの「シークレット」に新着の印
  unlockSecret(id) {
    if (data.flags[`secret_${id}`]) {
      return;
    }
    data.flags[`secret_${id}`] = true;
    data.news[4] = true;
    commit();
  },

  reset() {
    data = emptyData();
    commit();
  },
};
