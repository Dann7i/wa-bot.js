import * as baileys from "@whiskeysockets/baileys";
import messagesUpsert from "./messages/messages.js";
import "./config/config.js";
import qrcode from "qrcode-terminal";
import pino from "pino";
import { Boom } from "@hapi/boom";
import p from "./utils/utils.js";
import fs from "fs";
import { mp } from "./storage/loaded.js";

const { makeWASocket, useMultiFileAuthState, DisconnectReason } = baileys;

async function koneksibot() {
  await mp();
  try {
    const { state, saveCreds } = await useMultiFileAuthState("assets/sesibot");

    const gokubot = makeWASocket({
      auth: state,
      printQRInTerminal: false,
      logger: pino({ level: "silent" }).child({ level: "silent" }),
      syncFullHistory: true,
      keepAliveIntervalMs: 30000,
      defaultQueryTimeoutMs: undefined,
    });

    // Pairing / QR Mode
    if (!gokubot.authState.creds.registered) {
      const jawab = await p("Mau terhubung via pairing code? [y/n] ");

      if (jawab.toLowerCase() === "y") {
        console.log("Memulai koneksi dengan pairing code...");
        const nt = await p("Masukkan nomor WA-mu DIAWALI +62 ");
        await new Promise((r) => setTimeout(r, 2000)); // tunggu session siap
        const cp = await gokubot.requestPairingCode(nt.replace(/\D/g, ""));
        console.log("Gunakan pairing code ini di perangkatmu:");
        console.log(`PAIRING CODE: ${cp}`);
      } else {
        console.log("Oke, silakan scan QR code yang akan muncul...");
        gokubot.ev.on("connection.update", (up) => {
          if (up.qr) qrcode.generate(up.qr, { small: true });
        });
      }
    }

    // Event koneksi
    gokubot.ev.on("connection.update", async (up) => {
      const { connection, lastDisconnect } = up;

      if (connection === "open") {
        console.log("Koneksi berhasil terhubung");
        console.log("Bot terhubung dengan user", gokubot.user);
      }

      if (connection === "close") {
        const reason = new Boom(lastDisconnect?.error)?.output?.statusCode;
        console.log(`Koneksi terputus alasannya: ${reason}`);

        if (reason === DisconnectReason.loggedOut) {
          console.log(
            "Sesi tidak valid, hapus folder 'assets/sesibot' lalu jalankan ulang...",
          );
          await fs.promises.rm("assets/sesibot", {
            recursive: true,
            force: true,
          });
          process.exit(1);
        } else if (reason === DisconnectReason.restartRequired) {
          console.log(
            "Restart diperlukan, bot akan dimulai ulang oleh nodemon...",
          );
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
    console.error("function 'koneksibot':", err);
  }
}

koneksibot();
