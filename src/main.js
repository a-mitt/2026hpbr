import Phaser from "phaser";
import "./style.css";
import { gameConfig } from "./config.js";

// カスタムフォントを先に読み込む（未配置でも最大1.5秒で起動）
const loadFonts = Promise.all([
  document.fonts.load('24px "Yomosugara"'),
  document.fonts.load('24px "Mushin"'),
  document.fonts.load('24px "851MakaPop"'),
]).catch(() => {});
const timeout = new Promise((resolve) => setTimeout(resolve, 1500));

Promise.race([loadFonts, timeout]).then(() => new Phaser.Game(gameConfig));
