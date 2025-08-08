import * as baileys from "@whiskeysockets/baileys";
import messagesUpsert from "./messages/messages.js";
import pino from "pino";
import { Boom } from "@hapi/boom";
import p from "./utils/utils.js";
import fs from "fs";
const { makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;

async function koneksibot() {
  try {
    const { state, saveCreds } = await useMultiFileAuthState("assets/sesibot");

    const gokubot = makeWASocket({
      auth: state,
      printQRInTerminal: true,
      logger: pino({ level: "silent" }).child({ level: "silent" }),
      syncFullHistory: true,
      keepAliveIntervalMs: 30000,
      defaultQueryTimeoutMs: undefined,
    });
    if (!gokubot.authState.creds.registered) {
      const jawab = await p("mau terhubung via pairing code? [y/n]");
      if (jawab.toLowerCase() === "y") {
        console.log("memulai koneksi dgn pairing code...");
        const nt = await p("masukan nomor-WA muu diawali +62:");
        const cp = await gokubot.requestPairingCode(nt.replace(/\D/g, ""));

        const paringkkooode = `PAIRING CODE: ${cp}`;
        console.log("gunakan pairing codeini di perangkatmuu ");
        console.log(paringkkooode);
      } else {
        const kooodeeeqr = "oke, silahkan sqan QR code yg akan muncul...";
        console.log(kooodeeeqr);
      }
    }

    gokubot.ev.on("connection.update", async (up) => {
      const { connection, lastDisconnect, qr } = up;
      if (qr) {
        qrcode.generate(qr, { small: true });
      }
      if (connection === "open") {
        const opn = "koneksi berhasil terhubung";
        const botUser = "gokuuuuusaaa berhasil terhubung dengan user";
        console.log(opn + "\n" + botUser, ":", gokubot.user);
      }
      if (connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(`koneksi terputus alasanyaa: ${reason}`);
        if (reason === DisconnectReason.loggedOut) {
          const sesitidakvalid = " hapus folder 'sesibot' dan jalankan ulang...";
          console.log(sesitidakvalid);
          await fs.promises.rm("sesibot", { recursive: true, force: true });
          process.exit(1);
        } else if (reason === DisconnectReason.restartRequired) {
          console.log("WhatsApp meminta restart, gokuusaaaa akan dimulaiulang oleh nodemon...");
          process.exit(1);
        }
      }
    });
    gokubot.ev.on("creds.update", saveCreds);
    gokubot.ev.on("messages.upsert", ({ messages }) => {
      console.log("Pesan masuk:", messages);
      messagesUpsert(gokubot, messages[0]);
    });
  } catch (err) {
    console.error("function 'koneksibot': ", err);
  }
}

koneksibot();
