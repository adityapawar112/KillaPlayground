const sharp = require('sharp');
const fs = require('fs');
const path = require('path');

async function packArm(dir) {
  const items = fs.readdirSync(dir);
  const basePrefix = items.find(f => f.endsWith('_basecolor.png'))?.replace('_basecolor.png', '');
  if (!basePrefix) return;

  const aoFile = path.join(dir, `${basePrefix}_ambientocclusion.png`);
  const roughFile = path.join(dir, `${basePrefix}_roughness.png`);
  const metalFile = path.join(dir, `${basePrefix}_metallic.png`);
  const heightFile = path.join(dir, `${basePrefix}_height.png`);

  if (!fs.existsSync(aoFile) || !fs.existsSync(roughFile)) return;

  // CRITICAL: Must use .raw() so sharp returns raw uncompressed pixel bytes (16384 bytes for 128x128),
  // rather than an encoded PNG buffer with compressed zlib chunks!
  const aoBuf = await sharp(aoFile).resize(128, 128).extractChannel(0).raw().toBuffer();
  const roughBuf = await sharp(roughFile).resize(128, 128).extractChannel(0).raw().toBuffer();
  
  let metalBuf;
  if (fs.existsSync(metalFile)) {
    metalBuf = await sharp(metalFile).resize(128, 128).extractChannel(0).raw().toBuffer();
  } else {
    metalBuf = Buffer.alloc(128 * 128, 0);
  }

  let heightBuf;
  if (fs.existsSync(heightFile)) {
    heightBuf = await sharp(heightFile).resize(128, 128).extractChannel(0).raw().toBuffer();
  } else {
    heightBuf = Buffer.alloc(128 * 128, 128);
  }

  // Interleave R=AO, G=Roughness, B=Metallic, A=Height
  const rgba = Buffer.alloc(128 * 128 * 4);
  for (let i = 0; i < 128 * 128; i++) {
    rgba[i * 4 + 0] = aoBuf[i];
    rgba[i * 4 + 1] = roughBuf[i];
    rgba[i * 4 + 2] = metalBuf[i];
    rgba[i * 4 + 3] = heightBuf[i];
  }

  const outFile = path.join(dir, `${basePrefix}_arm.png`);
  await sharp(rgba, { raw: { width: 128, height: 128, channels: 4 } })
    .png()
    .toFile(outFile);

  console.log(`Packed ARM for: ${basePrefix}`);
}

async function run() {
  const baseDir = path.join('public', 'textures');
  const categories = ['Dirt', 'Grass', 'Gravel', 'Rock', 'Rocky', 'Sand'];
  for (const cat of categories) {
    const catPath = path.join(baseDir, cat);
    if (!fs.existsSync(catPath)) continue;
    const subs = fs.readdirSync(catPath);
    for (const sub of subs) {
      const subDir = path.join(catPath, sub);
      if (fs.statSync(subDir).isDirectory()) {
        await packArm(subDir);
      }
    }
  }
}

run().catch(console.error);
