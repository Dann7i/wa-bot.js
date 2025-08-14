import axios from 'axios';
import { tmpdir } from 'os';
import { join } from 'path';
import fs from 'fs/promises';
import { exec } from 'child_process';

export async function eksekusi(gokubot, pesan) {
  try {
    const ownerTeks = pesan.text;

    if (!ownerTeks) {
      return pesan.reply(
        'Kirim teks yang mau dijadikan brat.\nContoh: !brat halo cuy'
      );
    }

    const teksQuery = ownerTeks.replace(/ /g, '+');
    const url = `https://api.siputzx.my.id/api/m/brat?text=${teksQuery}&isAnimated=false&delay=500`;

    const res = await axios.get(url, {
      responseType: 'arraybuffer'
    });

    const media = Buffer.from(res.data, 'binary');
    const tempInputPath = join(tmpdir(), `${Date.now()}.gif`);
    const tempOutputPath = join(tmpdir(), `${Date.now()}.webp`);

    await fs.writeFile(tempInputPath, media);

    await new Promise((resolve, reject) => {
      exec(
        `ffmpeg -i ${tempInputPath} -vcodec libwebp -vf "scale='min(512,iw)':'min(512,ih)':force_original_aspect_ratio=decrease,fps=15" -loop 0 -preset default -an -vsync 0 -s 512:512 ${tempOutputPath}`,
        (error) => {
          if (error) return reject(error);
          resolve();
        }
      );
    });

    await gokubot.sendMessage(
      pesan.chatId,
      { sticker: { url: tempOutputPath } },
      { quoted: pesan }
    );

    await fs.unlink(tempInputPath);
    await fs.unlink(tempOutputPath);

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });
  } catch (error) {
    console.error('Error di perintah brat:', error);

    await pesan.reply('Duh, gagal membuat stiker brat. Coba lagi nanti ya.');

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
  }
}

eksekusi.command = ['brat'];
eksekusi.tags = ['main'];
/* 
import axios from 'axios';

async function tesAPI() {
  try {
    const res = await axios.get('https://api.siputzx.my.id/api/m/brat?text=hai&isAnimated=false&delay=500');
    console.log(res.data);
  } catch (err) {
    console.error('Error:', err);
  }
}

tesAPI(); 
*/
