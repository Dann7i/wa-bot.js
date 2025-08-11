import axios from 'axios';
import chalk from 'chalk';

export async function eksekusi(gokubot, pesan) {
  try {
    const teks = pesan.text;
    if (!teks) {
      return pesan.reply(
        'Kirim teks yang mau diubah jadi suara, ya!\n\nContoh: !tts halo nama saya wildan'
      );
    }

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.wait, key: pesan.key }
    });

    const response = await axios.post(
      'https://gesserit.co/api/tiktok-tts',
      { text: teks, voice: 'id_001' }, 
      { headers: { 'User-Agent': 'Mozilla/5.0' } }
    );

    const dataAudio = response.data;
    if (!dataAudio || !dataAudio.audioUrl) {
      throw new Error('API tidak mengembalikan link audio.');
    }

  
    const audioBuffer = Buffer.from(
      dataAudio.audioUrl.split('base64,')[1],
      'base64'
    );

    await gokubot.sendMessage(
      pesan.chatId,
      {
        audio: audioBuffer,
        mimetype: 'audio/mpeg'
      },
      { quoted: pesan }
    );

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });
  } catch (err) {
    console.error(chalk.red('[ERROR TTS]', err));
    await pesan.reply(
      'Duh, gagal mengubah teks jadi suara. Coba lagi nanti ya.'
    );
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
  }
}

eksekusi.command = ['tts', 'tiktoktts'];
eksekusi.tags = ['tools'];
