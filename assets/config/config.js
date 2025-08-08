import fs from "fs";

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"));

global.dan = {
  name: "Wildan Hermawan",
  number: "6283849695767",
  versi: pkg.version,
  prefix: "!",
  splitArgs: "|",
  locale: "en",
  timezone: "Asia/Jakarta",
  github: "https://github.com/Dann7i",
  autoRead: true,
  sticker: {
    packname: "@Wildan",
    author: "pack",
  },
  emojicuy: {
    wait: "🤔",
    success: "✅",
    error: "❌",
    owner: "🫡",
    sticker: "🖼️",
    downloader: "📥",
    ai: "🤖",
    wave: "👋",
  },
};

global.owner = {
  name: "Wildan Hermawan",
  number: "6282129955815",
};
