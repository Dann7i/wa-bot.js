import { downloadMediaMessage, getContentType } from '@whiskeysockets/baileys';
import { exec } from 'child_process';
import fs from 'fs/promises';
import { tmpdir } from 'os';
import { join } from 'path';
import chalk from 'chalk';

export async function eksekusi(gokubot, pesan) {
  try {
    const qmsg = pesan.message?.extendedTextMessage?.contextInfo?.quotedMessage;
    if (!qmsg || !/audio/.test(getContentType(qmsg))) {
      return pesan.reply(
        `Balas (reply) pesan suara atau file audio dengan perintah *${global.dan.prefix}${pesan.perintah}*`
      );
    }

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.wait, key: pesan.key }
    });

    let filter;
    const command = pesan.perintah;

    if (/bass/.test(command))
      filter = '-af equalizer=f=54:width_type=o:width=2:g=20';
    else if (/blown/.test(command)) filter = '-af acrusher=.1:1:64:0:log';
    else if (/deep/.test(command)) filter = '-af atempo=4/4,asetrate=44500*2/3';
    else if (/earrape/.test(command)) filter = '-af volume=12';
    else if (/fast/.test(command))
      filter = '-filter:a "atempo=1.63,asetrate=44100"';
    else if (/fat/.test(command))
      filter = '-filter:a "atempo=1.6,asetrate=22100"';
    else if (/nightcore/.test(command))
      filter = '-filter:a atempo=1.06,asetrate=44100*1.25';
    else if (/reverse/.test(command)) filter = '-filter_complex "areverse"';
    else if (/robot/.test(command))
      filter =
        "-filter_complex \"afftfilt=real='hypot(re,im)*sin(0)':imag='hypot(re,im)*cos(0)':win_size=512:overlap=0.75\"";
    else if (/slow/.test(command))
      filter = '-filter:a "atempo=0.7,asetrate=44100"';
    else if (/smooth/.test(command))
      filter =
        '-filter:v "minterpolate=\'mi_mode=mci:mc_mode=aobmc:vsbmc=1:fps=120\'"';
    else if (/tupai/.test(command))
      filter = '-filter:a "atempo=0.5,asetrate=65100"';
    else return pesan.reply('Filter tidak ditemukan.');


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

    const tempInputPath = join(tmpdir(), `${Date.now()}.mp3`);
    const tempOutputPath = join(tmpdir(), `${Date.now()}_filtered.mp3`);

    await fs.writeFile(tempInputPath, media);

    await new Promise((resolve, reject) => {
      exec(`ffmpeg -i ${tempInputPath} ${filter} ${tempOutputPath}`, (err) => {
        if (err) return reject(err);
        resolve();
      });
    });

    const audioBuffer = await fs.readFile(tempOutputPath);
    await gokubot.sendMessage(
      pesan.chatId,
      { audio: audioBuffer, mimetype: 'audio/mpeg' },
      { quoted: pesan }
    );

    await fs.unlink(tempInputPath);
    await fs.unlink(tempOutputPath);

    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.success, key: pesan.key }
    });
  } catch (err) {
    console.error(chalk.red(`[ERROR AUDIO FILTER: ${pesan.perintah}]`, err));
    await pesan.reply(
      'Duh, gagal menerapkan filter. Coba dengan audio lain ya.'
    );
    await gokubot.sendMessage(pesan.chatId, {
      react: { text: global.dan.emojicuy.error, key: pesan.key }
    });
  }
}

eksekusi.command = [
  'bass',
  'blown',
  'deep',
  'earrape',
  'fast',
  'fat',
  'nightcore',
  'reverse',
  'robot',
  'slow',
  'smooth',
  'tupai'
];
eksekusi.tags = ['audio'];
