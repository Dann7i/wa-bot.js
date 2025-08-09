import { ttdl } from 'ruhend-scraper';
import axios from 'axios';
import chalk from 'chalk';

export async function eksekusi(gokubot, pesan) {
  try {
    const link = pesan.text?.trim();
    if (!link) {
      return pesan.reply('Masukin linknya, contoh:\n!ttdl https://linkvideo');
    }

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.wait, key: pesan.key }
    });

    const hasil = await ttdl(link);
    const linkVideo = hasil.video;

    if (!linkVideo) throw new Error('Video gak ketemu');

    const res = await axios.get(linkVideo, { responseType: 'arraybuffer' });
    const videoBuffer = Buffer.from(res.data, 'binary');

    await gokubot.sendMessage(
      pesan.chatId,
      {
        video: videoBuffer,
        caption: `*Judul:* ${hasil.title}\n*Uploader:* ${hasil.author}`
      },
      { quoted: pesan }
    );

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });

  } catch (err) {
    console.error(chalk.red('error ttdl'), err);

    await pesan.reply('Error pas download, coba cek linknya lagi ya');
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
  }
}

eksekusi.command = ['ttdl'];
eksekusi.tags = ['downloader'];