import axios from 'axios';

export async function eksekusi(gokubot, pesan) {
  try {
    const userQuest = pesan.text;
    if (!userQuest) {
      return pesan.reply('ketik !ai halo');
    }
    
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.wait, key: pesan.key }
    });

    const danAi = encodeURIComponent(userQuest);
    const url = `https://api.siputzx.my.id/api/ai/luminai?content=${danAi}`;

    const res = await axios.get(url);
    const jawabanAI = res.data.data;
    await pesan.reply(jawabanAI);
  } catch (err) {
    console.error('error cuy', err);
    await pesan.reply('apinya error');
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
  }
}



eksekusi.command = ['ai', 'luminai'];
eksekusi.tags = ['ai'];
