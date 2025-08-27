import { TelegraPH } from '../../utils/TelegraPH.js';
import fs from 'fs';
import { getContentType } from '@whiskeysockets/baileys';

export async function eksekusi(gokubot, pesan) {
  const prefix = global.dan.prefix || '!';
  let mediaMessage = pesan.quoted || pesan;
  let mediaType = getContentType(mediaMessage.message);

  if (mediaType !== 'imageMessage' && mediaType !== 'videoMessage') {
    pesan.reply(`Gunakan perintah ini dengan membalas gambar/video atau mengirim gambar/video dengan caption! Contoh: ${prefix}upload`);
    return;
  }

  await gokubot.sendMessage(pesan.chatId, { react: { text: global.dan.emojicuy.wait, key: pesan.key } });

  const tempFilePath = `./temp-${pesan.key.id}.jpg`;
  const stream = await gokubot.downloadMediaMessage(mediaMessage);
  
  try {
    fs.writeFileSync(tempFilePath, stream);
    
    const imageUrl = await TelegraPH(tempFilePath);
    
    fs.unlinkSync(tempFilePath);
    
    await gokubot.sendMessage(pesan.chatId, { react: { text: global.dan.emojicuy.success, key: pesan.key } });
    pesan.reply(`Gambar berhasil diunggah ke Telegra.ph!\nURL: ${imageUrl}`);
  } catch (err) {
    console.error('Error mengunggah gambar:', err);
    pesan.reply(`Gagal mengunggah gambar! ${global.dan.emojicuy.error}`);
  }
}

eksekusi.command = ['upload', 'telegraph'];
eksekusi.tags = ['media'];
