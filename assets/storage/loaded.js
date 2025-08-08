import fs from 'fs';
import path from 'path';

export async function mp() {
  global.commands = new Map();
  const dirPerintah = path.join(process.cwd(), 'assets', 'storage', 'commands');

  try {
    const filePerintah = fs.readdirSync(dirPerintah).filter((file) =>
      file.endsWith('.js')
    );
    console.log(`Memuat ${filePerintah.length} file perintah...`);

    for (const file of filePerintah) {
      try {
        const filePath = path.join(dirPerintah, file);
        const module = await import(`file://${filePath}`);
        const perintah = module.eksekusi;
        if (perintah && perintah.command) {
          for (const cmd of perintah.command) {
            global.commands.set(cmd, perintah);
          }
        }
      } catch (e) {
        console.error(`Gagal memuat perintah dari ${file}:`, e);
      }
    }
    console.log(
      'Semua perintah berhasil dimuat!',
      Array.from(global.commands.keys())
    );
  } catch (e) {
    console.error(
      "Folder 'assets/storage/commands' tidak ditemukan. Pastikan kamu sudah membuatnya."
    );
  }
}