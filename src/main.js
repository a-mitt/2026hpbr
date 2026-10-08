import Phaser from "phaser";
import "@fontsource/ibm-plex-sans-jp/400.css";
import "@fontsource/ibm-plex-sans-jp/700.css";
import "./style.css";
import { gameConfig } from "./config.js";

// フォントを先に読み込む（失敗・遅延しても最大1.5秒で起動）
const loadFonts = Promise.all([
  document.fonts.load('400 24px "IBM Plex Sans JP"', "あ"),
  document.fonts.load('700 24px "IBM Plex Sans JP"', "あ"),
  document.fonts.load('24px "851MakaPop"'),
  document.fonts.load('24px "Mushin"', "あ"),
]).catch(() => {});
const timeout = new Promise((resolve) => setTimeout(resolve, 1500));

Promise.race([loadFonts, timeout]).then(() => {
  const game = new Phaser.Game(gameConfig);

  // 開発中だけ：?scene=FieldScene で途中の画面から始める（本番ビルドでは無効）
  const startScene = import.meta.env.DEV && new URLSearchParams(location.search).get("scene");
  if (startScene) {
    game.events.once("ready", () => {
      game.scene.stop("IntroScene");
      game.scene.start(startScene);
    });
  }
});
