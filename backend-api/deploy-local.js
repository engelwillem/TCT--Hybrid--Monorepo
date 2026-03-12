import 'dotenv/config';
import ftp from 'basic-ftp';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { execSync } from 'child_process';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ==========================================
// PANDUAN PENGATURAN LOKAL - ANTIGRAVITY 🚀
// ==========================================
// Supaya AMAN, jangan simpan password/token di file ini.
// Isi semua variable di file `.env` lokal kamu.
// ==========================================

const FTP_HOST = process.env.FTP_HOST; // contoh: 209.42.27.90
const FTP_USER = process.env.FTP_USER; // contoh: deploy@thechoosentalks.org
const FTP_PASS = process.env.FTP_PASS; // password FTP
const SERVER_URL = process.env.SERVER_URL ?? "https://thechoosentalks.org";

// Optional: trigger deploy via SSH instead of HTTP webhook (recommended).
const SSH_HOST = process.env.SSH_HOST ?? FTP_HOST;
const SSH_USER = process.env.SSH_USER ?? 'thechoosentalks';
const SSH_PORT = Number(process.env.SSH_PORT ?? '22');
const SSH_KEY_PATH = process.env.SSH_KEY_PATH; // contoh: C:\\Users\\you\\.ssh\\cpanel_key

const ARCHIVE_NAME = 'build.tar.gz';
const SCRIPT_NAME = 'deploy.sh';
const HEALTHCHECK_SCRIPT_NAME = 'healthcheck.sh';
const ROLLBACK_SCRIPT_NAME = 'rollback.sh';

async function deploy() {
    if (!FTP_HOST || !FTP_USER || !FTP_PASS) {
        console.error('❌ Missing FTP env vars. Please set FTP_HOST, FTP_USER, FTP_PASS in your .env');
        process.exit(1);
    }

    console.log("🚀 [1/4] Memulai Proses Local Deployment...");

    // 1. Build Frontend
    console.log("📦 [2/4] Melakukan build aset (npm run build)...");
    try {
        execSync('npm run build', { stdio: 'inherit' });
    } catch (e) {
        console.error("❌ Gagal melakukan build frontend.");
        process.exit(1);
    }

    // 1b. Install production PHP dependencies into vendor (required by server deploy.sh)
    console.log("📦 [2b/4] Menyiapkan dependency PHP production (composer install --no-dev)...");
    try {
        execSync('composer install --no-dev --optimize-autoloader', { stdio: 'inherit' });
    } catch (e) {
        console.error("❌ Gagal menyiapkan vendor production. Pastikan composer tersedia di mesin build.");
        process.exit(1);
    }

    // 2. Membuat file Tar.gz
    console.log(`📦 [3/4] Sedang membungkus seluruh kodingan ke dalam ${ARCHIVE_NAME}...`);
    try {
        // Hapus archive lama jika ada
        if (fs.existsSync(ARCHIVE_NAME)) {
            fs.unlinkSync(ARCHIVE_NAME);
        }

        // Komando tar Windows (menggunakan tar bawaan Windows 10/11)
        execSync(`tar.exe -czf ${ARCHIVE_NAME} --exclude=.git --exclude=node_modules --exclude=tests --exclude=.github --exclude=storage/logs --exclude=storage/framework/cache --exclude=*.vsix --exclude=*.zip .`, { stdio: 'inherit' });
    } catch (e) {
        console.error("❌ Gagal membungkus file:", e);
        process.exit(1);
    }

    // 3. Upload via FTP
    console.log(`📡 [4/4] Mengirim ${ARCHIVE_NAME}, ${SCRIPT_NAME}, ${HEALTHCHECK_SCRIPT_NAME}, ${ROLLBACK_SCRIPT_NAME} ke cPanel via FTP...`);
    const client = new ftp.Client();
    client.ftp.verbose = true;

    try {
        await client.access({
            host: FTP_HOST,
            user: FTP_USER,
            password: FTP_PASS,
            port: 990,
            secure: "implicit",
            secureOptions: { rejectUnauthorized: false }
        });

        // Upload build.tar.gz
        console.log(`Uploading ${ARCHIVE_NAME}...`);
        await client.uploadFrom(path.join(__dirname, ARCHIVE_NAME), ARCHIVE_NAME);

        // Upload deploy scripts
        console.log(`Uploading ${SCRIPT_NAME}...`);
        await client.uploadFrom(path.join(__dirname, SCRIPT_NAME), SCRIPT_NAME);
        console.log(`Uploading ${HEALTHCHECK_SCRIPT_NAME}...`);
        await client.uploadFrom(path.join(__dirname, HEALTHCHECK_SCRIPT_NAME), HEALTHCHECK_SCRIPT_NAME);
        console.log(`Uploading ${ROLLBACK_SCRIPT_NAME}...`);
        await client.uploadFrom(path.join(__dirname, ROLLBACK_SCRIPT_NAME), ROLLBACK_SCRIPT_NAME);

        console.log("✅ Berhasil mengunggah file ke cPanel!");
    } catch (err) {
        console.error("❌ FTP Error:", err);
        process.exit(1);
    } finally {
        client.close();
    }

    // 4. Trigger deploy script on the server.
    // Webhook HTTP route is now hardened by token + IP allowlist, so local machine will likely be blocked.
    // Recommended: trigger via SSH.
    if (!SSH_HOST || !SSH_KEY_PATH) {
        console.log('ℹ️ Skip trigger step: set SSH_HOST + SSH_KEY_PATH in .env if you want to auto-run deploy.sh via SSH.');
        console.log('✅ Upload selesai. Sekarang jalankan deploy.sh dari server (SSH/cPanel terminal) jika perlu.');
        return;
    }

    console.log(`🔐 [5/5] Memicu deploy.sh via SSH ke ${SSH_USER}@${SSH_HOST}:${SSH_PORT} ...`);
    try {
        const remoteCommand = 'bash ~/deploy/apps/thechoosentalks/deploy.sh';

        execSync(
            `ssh -p ${SSH_PORT} -o StrictHostKeyChecking=no -i "${SSH_KEY_PATH}" ${SSH_USER}@${SSH_HOST} "${remoteCommand}"`,
            { stdio: 'inherit' },
        );
        console.log("\n🎉 SELAMAT! DEPLOYMENT (UPLOAD + TRIGGER) BERHASIL!");
        console.log("🌐 Silakan cek web: " + SERVER_URL);
    } catch (e) {
        console.error("❌ Gagal trigger deploy via SSH:", e);
        console.log('ℹ️ Kamu masih bisa jalankan deploy.sh manual di server.');
    }
}

deploy();
