import {
  isJidGroup,
  isJidUser,
  isJidStatusBroadcast,
  jidDecode,
  getContentType
} from '@whiskeysockets/baileys';
import chalk from 'chalk';

function hrmwn(teks1, teks2) {
  if (teks1.length === 0) return teks2.length;
  if (teks2.length === 0) return teks1.length;
  const matriks = Array.from(Array(teks2.length + 1), () =>
    Array(teks1.length + 1).fill(0)
  );
  for (let i = 0; i <= teks2.length; i++) matriks[i][0] = i;
  for (let j = 0; j <= teks1.length; j++) matriks[0][j] = j;
  for (let i = 1; i <= teks2.length; i++) {
    for (let j = 1; j <= teks1.length; j++) {
      const biaya = teks2.charAt(i - 1) === teks1.charAt(j - 1) ? 0 : 1;
      matriks[i][j] = Math.min(
        matriks[i - 1][j - 1] + biaya,
        matriks[i][j - 1] + 1,
        matriks[i - 1][j] + 1
      );
    }
  }
  const jarak = matriks[teks2.length][teks1.length];
  return (1 - jarak / Math.max(teks1.length, teks2.length)) * 100;
}

function colorizeJson(jsonString) {
  let coloredJson = jsonString;

  coloredJson = coloredJson.replace(
    /"isOwner": true/g,
    `"isOwner": ${chalk.green('true')}`
  );
  coloredJson = coloredJson.replace(
    /"isOwner": false/g,
    `"isOwner": ${chalk.red('false')}`
  );

  coloredJson = coloredJson.replace(
    /"(\d+@s\.whatsapp\.net)"/g,
    `"${chalk.cyan('$1')}"`
  );
  coloredJson = coloredJson.replace(
    /"pushName": "([^"]*)"/g,
    `"pushName": "${chalk.yellow('$1')}"`
  );
  coloredJson = coloredJson.replace(
    /"type": "([^"]*)"/g,
    `"type": "${chalk.blue('$1')}"`
  );
  coloredJson = coloredJson.replace(
    /"body": "([^"]*)"/g,
    `"body": "${chalk.white('$1')}"`
  );

  return coloredJson;
}

export default async function messagesUpsert(gokubot, pesan) {
  try {
    if (!pesan.message) return;

    if (global.dan.autoRead && pesan.key) {
      await gokubot.readMessages([pesan.key]);
    }

    pesan.id = pesan.key.id;
    pesan.chatId = pesan.key.remoteJid;
    pesan.isGroup = isJidGroup(pesan.chatId);
    pesan.isPrivate = isJidUser(pesan.chatId);
    pesan.isStory = isJidStatusBroadcast(pesan.chatId);
    pesan.fromMe = pesan.key.fromMe;
    pesan.senderId = pesan.isGroup
      ? pesan.key.participant
      : pesan.key.remoteJid;
    pesan.isOwner =
      pesan.senderId && jidDecode(pesan.senderId)?.user === global.owner.number;

    pesan.type = getContentType(pesan.message);
    pesan.pushName = pesan.pushName || '';
    pesan.body =
      pesan.type === 'conversation'
        ? pesan.message.conversation
        : pesan.type === 'extendedTextMessage'
        ? pesan.message.extendedTextMessage.text
        : pesan.type === 'imageMessage'
        ? pesan.message.imageMessage.caption
        : pesan.type === 'videoMessage'
        ? pesan.message.videoMessage.caption
        : '';
    pesan.reply = (teks) =>
      gokubot.sendMessage(pesan.chatId, { text: teks }, { quoted: pesan });

    console.log(chalk.bold.hex('#FF5733')('\n--- PESAN DITERIMA ---'));
    console.log('ini cuy: ', colorizeJson(JSON.stringify(pesan, null, 2)));
    console.log(chalk.bold.hex('#FF5733')('----------------------'));

    if (pesan.fromMe) return;

    const awalan = global.dan.prefix || '!';
    const adalahPerintah = pesan.body.startsWith(awalan);

    if (!adalahPerintah) return;

    const argumen = pesan.body.slice(awalan.length).trim().split(/ +/);
    pesan.perintah = argumen.shift().toLowerCase();
    pesan.args = argumen;
    pesan.text = argumen.join(' ');

    const perintahDitemukan = global.commands.get(pesan.perintah);

    if (perintahDitemukan) {
      await perintahDitemukan(gokubot, pesan);
    } else {
      const perintahTersedia = Array.from(global.commands.keys());
      const palingMirip = perintahTersedia.reduce(
        (terbaik, p) => {
          const kemiripan = hrmwn(pesan.perintah, p);
          return kemiripan > terbaik.kemiripan
            ? { perintah: p, kemiripan }
            : terbaik;
        },
        { perintah: null, kemiripan: 0 }
      );

      if (palingMirip.kemiripan > 40) {
        const teksBalasan = `Perintah *${awalan}${
          pesan.perintah
        }* tidak ada.\nMungkin maksudmu *${awalan}${
          palingMirip.perintah
        }*? (${palingMirip.kemiripan.toFixed(0)}% mirip)`;
        await gokubot.sendMessage(pesan.chatId, {
          react: { text: '🤔', key: pesan.key }
        });
        await pesan.reply(teksBalasan);
      } else {
        await gokubot.sendMessage(pesan.chatId, {
          react: { text: '?',
key: pesan.key }
        });
      }
    }
  } catch (err) {
    console.error(
      chalk.red.bold('Error di messages.upsert:'),
      chalk.red(err.message)
    );
  }
}