import { fbdl } from "ruhend-scraper";
import axios from "axios";
import chalk from "chalk";

export async function eksekusi(gokubot, pesan) {
  try {
    const link = pesan.text;
    if (!link || (!link.includes("facebook.com") && !link.includes("fb.watch"))) {
      return pesan.reply("Kirim link video Facebook yang valid, ya!\n\nContoh: !fb [link]");
    }

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.wait, key: pesan.key },
    });

    const hasil = await fbdl(link);
    console.log("Hasil fbdl:", JSON.stringify(hasil, null, 2));

    if (!hasil || !hasil.links) {
      throw new Error("Tidak dapat menemukan link download dari hasil API.");
    }

    let linkVideo;
    if (Array.isArray(hasil.links)) {
      const hdLink = hasil.links.find((l) => l.quality === "hd")?.url;
      const sdLink = hasil.links.find((l) => l.quality === "sd")?.url;
      linkVideo = hdLink || sdLink;
    } else {
      linkVideo = hasil.links.hd || hasil.links.sd;
    }

    if (!linkVideo) {
      throw new Error("Link download HD atau SD tidak tersedia.");
    }

    const responVideo = await axios.get(linkVideo, {
      responseType: "arraybuffer",
    });
    const videoBuffer = Buffer.from(responVideo.data, "binary");

    await gokubot.sendMessage(
      pesan.chatId,
      {
        video: videoBuffer,
        caption: `*Judul:* ${hasil.title || "Tidak ada judul"}`,
      },
      { quoted: pesan }
    );

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key },
    });
  } catch (err) {
    console.error(chalk.red("[ERROR FBDL]", err));
    await pesan.reply("Duh, gagal download videonya. Coba pakai link lain atau pastikan linknya video publik ya.");
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key },
    });
  }
}

eksekusi.command = ["fb", "fbdl", "facebook"];
eksekusi.tags = ["downloader"];
