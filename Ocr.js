import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import chalk from 'chalk';

export async function eksekusi(gokubot, pesan) {
  try {
    const qmsg = pesan.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    const isQuotedImage = qmsg && getContentType(qmsg) === 'imageMessage';

    if (!isQuotedImage) {
      return pesan.reply(
        `Balas (reply) gambar yang ada tulisannya dengan perintah *${global.dan.prefix}ocr*`
      );
    }

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.wait, key: pesan.key }
    });


    const messageToDownload = {
      key: {
        remoteJid: pesan.chatId,
        id: pesan.message.extendedTextMessage.contextInfo.stanzaId,
        participant: pesan.message.extendedTextMessage.contextInfo.participant
      },
      message: qmsg
    };
    const media = await downloadMediaMessage(messageToDownload, 'buffer', {});
    // ------------------------------------

    const tempImagePath = join(tmpdir(), `${Date.now()}.jpg`);

    await fs.writeFile(tempImagePath, media);

    await new Promise((resolve, reject) => {
      const command = `tesseract ${tempImagePath} stdout`;
      exec(command, (error, stdout, stderr) => {
        if (error) {
          console.error(chalk.red('[ERROR OCR EXEC]', error));
          return reject(new Error('Gagal memproses gambar dengan Tesseract.'));
        }
        if (stderr) {
          console.error(chalk.yellow('[STDERR OCR]', stderr));
        }

        const hasilTeks = stdout.trim();

        if (!hasilTeks) {
          pesan.reply('Duh, tidak ada teks yang bisa dibaca dari gambar ini.');
        } else {
          pesan.reply(`*--- Hasil OCR ---*\n\n${hasilTeks}`);
        }
        resolve();
      });
    });

    await fs.unlink(tempImagePath);
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });
  } catch (err) {
    console.error(chalk.red(`[ERROR OCR]`, err));
    await pesan.reply(
      'Duh, gagal membaca teks dari gambar. Coba dengan gambar lain ya.'
    );
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
  }
}

eksekusi.command = ['ocr', 'totext'];
eksekusi.tags = ['tools'];
