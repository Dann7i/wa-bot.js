export async function eksekusi(gokubot, pesan) {
  const { pushName } = pesan;

  const prefix = global.dan.prefix || '!';
  
  const menuTeks = `
GREETINGS, *${pushName || 'User'}*!
━━━━━━━━━━⬣

父 *SAYAIAN BOT*
父 *Library:* Baileys
┗━━━━━━━━━━⬣

╭─「 *MENU UTAMA* 」
│  ◦ ${prefix}menu
│  ◦ ${prefix}owner
╰──────────

╭─「 *PERHATIAN* 」
│  ◦ Bot masih dalam tahap pengembangan.
│  ◦ Laporkan bug ke owner.
╰──────────

`;

  await gokubot.sendMessage(
    pesan.chatId,
    { text: menuTeks.trim() },
    { quoted: pesan }
  );
}

eksekusi.command = ['menu', 'help'];
eksekusi.tags = ['main'];