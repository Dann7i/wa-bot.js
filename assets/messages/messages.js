import { isJidGroup, isJidUser, isJidStatusBroadcast, isJidNewsLetter, jidDecode, getContentType, DEFAULT_CACHE_TTLS } from "lily-baileys";

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
    pesan.senderId = pesan.isGroup ? pesan.key.participant : pesan.key.remoteJid;
    pesan.isOwner = pesan.senderId && jidDecode(pesan.senderId)?.user === global.owner.number;
    pesan.isSenderPremium = global.db?.premiumUsers?.includes(pesan.senderId) ?? false;

    pesan.type = getContentType(pesan.message);
    pesan.pushName = pesan.pushName || "";
    pesan.body =
      pesan.type === "conversation"
        ? pesan.message.conversation
        : pesan.type === "extendedTextMessage"
        ? pesan.message.extendedTextMessage.text
        : pesan.type === "imageMessage"
        ? pesan.message.imageMessage.caption
        : pesan.type === "videoMessage"
        ? pesan.message.videoMessage.caption
        : "";

    pesan.reply = (teks) => gokubot.sendMessage(pesan.chatId, { text: teks }, { quoted: pesan });

    if (pesan.body.startsWith(global.dan.prefix)) {
      const command = pesan.body.slice(1).trim().split(" ")[0].toLowerCase();

      switch (command) {
        case "ping":
          pesan.reply("Pong!");
          break;
        case "owner":
          pesan.reply(`Ini nomor owner: wa.me/${global.owner.number}`);
          break;
        default:
          pesan.reply("Perintah tidak dikenal.");
      }
    }
  } catch (err) {
    console.error("Error di messagesUpsert:", err);
  }
}
