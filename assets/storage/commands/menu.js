import { join } from 'path';
import fs from 'fs';

export async function eksekusi(gokubot, pesan) {
  const { pushName } = pesan;

  const totalPerintah = global.commands.size;
  const prefix = global.dan.prefix || '!';

  const menuByCategory = {};

  for (const cmd of new Set(global.commands.values())) {
    if (!cmd.tags || cmd.tags.length === 0) continue;
    const category = cmd.tags[0].toUpperCase();
    if (!menuByCategory[category]) {
      menuByCategory[category] = [];
    }
    menuByCategory[category].push(cmd.command[0]);
  }
  let menuTeks = `
GREETINGS, SUPER SAIYAN *${pushName || 'User'}*! ⚡
━━━━━━━━━━⬣
父 *Total Perintah:* ${totalPerintah}
父 *Library:* Baileys
┗━━━━━━━━━━⬣
`;

  for (const category in menuByCategory) {
    menuTeks += `\n╭─「 *MENU ${category}* 」\n`;
    menuTeks += menuByCategory[category]
      .map((cmd) => `│  ◦ ${prefix}${cmd}`)
      .join('\n');
    menuTeks += `\n╰──────────\n`;
  }
  
  await gokubot.sendMessage(
    pesan.chatId,
    { text: menuTeks.trim() },
    { quoted: pesan }
  );
}

eksekusi.command = ['menu', 'help'];
eksekusi.tags = ['main'];