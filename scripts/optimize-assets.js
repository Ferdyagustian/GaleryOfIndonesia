import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sharp from 'sharp';
import ffmpeg from 'fluent-ffmpeg';
import ffmpegStatic from 'ffmpeg-static';

// Setup ffmpeg path
ffmpeg.setFfmpegPath(ffmpegStatic);

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const PUBLIC_DIR = path.join(__dirname, '..', 'public');

// Direktori yang akan dipindai
const directoriesToScan = [
  'images',
  'gallery',
  'cardimg',
  'audio'
];

async function optimizeImages(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await optimizeImages(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (['.jpg', '.jpeg', '.png'].includes(ext)) {
        const outPath = fullPath.replace(new RegExp(`\\${ext}$`, 'i'), '.webp');
        
        // Lewati jika file webp sudah ada
        if (fs.existsSync(outPath)) {
          console.log(`[SKIP] ${file} -> .webp sudah ada`);
          continue;
        }

        try {
          console.log(`[PROSES] Mengonversi ${file} ke WebP...`);
          await sharp(fullPath)
            .webp({ quality: 80 })
            .toFile(outPath);
          console.log(`[SUKSES] -> ${outPath}`);
        } catch (err) {
          console.error(`[GAGAL] Mengonversi ${file}:`, err);
        }
      }
    }
  }
}

async function optimizeAudio(dir) {
  const files = fs.readdirSync(dir);
  for (const file of files) {
    const fullPath = path.join(dir, file);
    const stat = fs.statSync(fullPath);
    
    if (stat.isDirectory()) {
      await optimizeAudio(fullPath);
    } else {
      const ext = path.extname(file).toLowerCase();
      if (ext === '.wav') {
        const outPath = fullPath.replace(/\.wav$/i, '.mp3');
        
        if (fs.existsSync(outPath)) {
          console.log(`[SKIP] ${file} -> .mp3 sudah ada`);
          continue;
        }

        console.log(`[PROSES] Mengonversi ${file} ke MP3...`);
        await new Promise((resolve, reject) => {
          ffmpeg(fullPath)
            .toFormat('mp3')
            .audioBitrate(128)
            .on('end', () => {
              console.log(`[SUKSES] -> ${outPath}`);
              resolve();
            })
            .on('error', (err) => {
              console.error(`[GAGAL] Mengonversi ${file}:`, err);
              reject(err);
            })
            .save(outPath);
        });
      }
    }
  }
}

async function run() {
  console.log("=== Memulai Optimasi Aset (Images -> WebP, Audio -> MP3) ===");
  for (const dir of directoriesToScan) {
    const targetDir = path.join(PUBLIC_DIR, dir);
    if (fs.existsSync(targetDir)) {
      if (dir === 'audio') {
        await optimizeAudio(targetDir);
      } else {
        await optimizeImages(targetDir);
      }
    }
  }
  console.log("=== Optimasi Aset Selesai! ===");
}

run();
