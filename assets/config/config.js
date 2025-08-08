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
  newsletterJid: "",
  setting: JSON.parse(fs.readFileSync("./storage/setting.json", "utf-8")),
  saveSetting: function () {
    fs.writeFileSync("./storage/setting.json", JSON.stringify(global.dan.setting, null, 2));
    return global.dan.setting;
  },
  saveSettingAsync: async function () {
    await fs.promises.writeFile("./storage/setting.json", JSON.stringify(global.dan.setting, null, 2));
    return global.dan.setting;
  },
};

global.owner = {
  name: "Wildan Hermawan",
  number: "6282129955815",
};
