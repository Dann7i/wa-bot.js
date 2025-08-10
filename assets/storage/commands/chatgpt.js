import axios from "axios";

export async function eksekusi(gokubot, pesan) {
  try {
    const bebasAj = pesan.text;
    if (!bebasAj) {
      return pesan.reply("maasukan contoh !ai lol");
    }
    const dan = encodeURIComponent(bebasAj);
    const url = `https://api.siputzx.my.id/api/ai/gpt3?prompt=kamu%20adalah%20ai%20yang%20ceria&content=${dan}`;
    const res = await axios.get(url);
    const jawaban = res.data.data;
    await pesan.reply(jawaban);
  } catch (err) {
    console.error("error cuy hahaha..", err);
    await pesan.reply("error cuy ");
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key },
    });
  }
}

eksekusi.command = ["gpt"];
eksekusi.tags = ["main"];
