import axios from "axios";
import chalk from "chalk";

export async function eksekusi(gokubot, pesan) {
  try {
    const code = pesan.text.trim();

    if (!code) {
      return pesan.reply("Kirim kode yang mau dijadikan gambar, ya!\n\nContoh: !toimg console.log('Halo Dunia');");
    }

    await gokubot.sendMessage(pesan.chatId, { react: { text: global.dan.emojicuy.wait, key: pesan.key } });

    const response = await axios.post(
      "https://carbonara.solopov.dev/api/cook",
      {
        code: code,
        backgroundColor: "#1F2937",
        theme: "night-owl",
      },
      { responseType: "arraybuffer" }
    );

    const imageBuffer = Buffer.from(response.data, "binary");

    await gokubot.sendMessage(pesan.chatId, { image: imageBuffer, caption: "Nih hasilnya, keren kan? " }, { quoted: pesan });
  } catch (error) {
    console.error(chalk.red("[ERROR TOIMG]", error));

    await gokubot.sendMessage(pesan.chatId, { react: { text: global.dan.emojicuy.error, key: pesan.key } });

    await gokubot.sendMessage(pesan.chatId, { text: "inimah erronya pas bikin gambar, coba lagi yaa bro.." }, { quoted: pesan });
  }
}

eksekusi.command = ["toimg", "carbon"];
eksekusi.tags = ["tools"];

