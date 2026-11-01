/**
 * Figurine Asset Normalizer & Diya Separation Tool
 * 
 * 1. Separates the 9 clay diyas from '1-9 clay diyas.glb' into 9 standalone models.
 * 2. Separates the 9 colorful diyas from '1-9 colorful diyas.glb' into 9 standalone models.
 * 3. Normalizes all figurine files to lowercase snake_case in 'public/figurines/'.
 * 4. Preserves originals in 'public/figurines/originals/'.
 */

import fs from 'fs';
import path from 'path';

const FIGURINES_DIR = path.join(process.cwd(), 'public', 'figurines');
const ORIGINALS_DIR = path.join(FIGURINES_DIR, 'originals');

if (!fs.existsSync(ORIGINALS_DIR)) {
  fs.mkdirSync(ORIGINALS_DIR, { recursive: true });
}

function parseGLB(buf) {
  const magic = buf.readUInt32LE(0);
  if (magic !== 0x46546C67) throw new Error('Not a valid GLB');
  const version = buf.readUInt32LE(4);
  const totalLength = buf.readUInt32LE(8);
  const chunk0Length = buf.readUInt32LE(12);
  const chunk0Type = buf.readUInt32LE(16);
  const jsonStr = buf.toString('utf8', 20, 20 + chunk0Length);
  const gltf = JSON.parse(jsonStr);

  const binOffset = 20 + chunk0Length;
  const binLength = buf.readUInt32LE(binOffset);
  const binData = buf.subarray(binOffset + 8, binOffset + 8 + binLength);

  return { gltf, binData };
}

function extractPositions(gltf, binData) {
  const posAcc = gltf.accessors[0];
  const posBV = gltf.bufferViews[posAcc.bufferView];
  const stride = posBV.byteStride || 6;
  const offset = (posBV.byteOffset || 0) + (posAcc.byteOffset || 0);

  // Note: in 1-9 clay diyas, node 0 has scale [0.471924, 0.471924, 0.471924] and translation [0, 0.05565, 0]
  const node = gltf.nodes[0] || {};
  const scale = node.scale || [1, 1, 1];
  const trans = node.translation || [0, 0, 0];

  const positions = new Float32Array(posAcc.count * 3);
  for (let i = 0; i < posAcc.count; i++) {
    const bytePos = offset + i * stride;
    // componentType 5122 = signed short, normalized: true (divide by 32767)
    let rawX = binData.readInt16LE(bytePos) / 32767.0;
    let rawY = binData.readInt16LE(bytePos + 2) / 32767.0;
    let rawZ = binData.readInt16LE(bytePos + 4) / 32767.0;

    // Apply node transform so coordinates are in true world/model scale
    positions[i * 3 + 0] = rawX * scale[0] + trans[0];
    positions[i * 3 + 1] = rawY * scale[1] + trans[1];
    positions[i * 3 + 2] = rawZ * scale[2] + trans[2];
  }
  return positions;
}

function extractNormals(gltf, binData) {
  const normAcc = gltf.accessors[1];
  const normBV = gltf.bufferViews[normAcc.bufferView];
  const stride = normBV.byteStride || 3;
  const offset = (normBV.byteOffset || 0) + (normAcc.byteOffset || 0);

  const normals = new Float32Array(normAcc.count * 3);
  for (let i = 0; i < normAcc.count; i++) {
    const bytePos = offset + i * stride;
    // componentType 5120 = signed byte, normalized: true (divide by 127)
    normals[i * 3 + 0] = binData.readInt8(bytePos) / 127.0;
    normals[i * 3 + 1] = binData.readInt8(bytePos + 1) / 127.0;
    normals[i * 3 + 2] = binData.readInt8(bytePos + 2) / 127.0;
  }
  return normals;
}

function extractUVs(gltf, binData) {
  const uvAcc = gltf.accessors[2];
  const uvBV = gltf.bufferViews[uvAcc.bufferView];
  const stride = uvBV.byteStride || 4;
  const offset = (uvBV.byteOffset || 0) + (uvAcc.byteOffset || 0);

  const uvs = new Float32Array(uvAcc.count * 2);
  for (let i = 0; i < uvAcc.count; i++) {
    const bytePos = offset + i * stride;
    // componentType 5123 = unsigned short, normalized: true (divide by 65535)
    uvs[i * 2 + 0] = binData.readUInt16LE(bytePos) / 65535.0;
    uvs[i * 2 + 1] = binData.readUInt16LE(bytePos + 2) / 65535.0;
  }
  return uvs;
}

function extractIndices(gltf, binData) {
  const idxAcc = gltf.accessors[3];
  const idxBV = gltf.bufferViews[idxAcc.bufferView];
  const offset = (idxBV.byteOffset || 0) + (idxAcc.byteOffset || 0);
  const count = idxAcc.count;
  const indices = new Uint16Array(count);
  for (let i = 0; i < count; i++) {
    indices[i] = binData.readUInt16LE(offset + i * 2);
  }
  return indices;
}

function findConnectedDiyas(positions, indices) {
  const vertCount = positions.length / 3;
  const triCount = indices.length / 3;

  // Position-based welding
  const posMap = new Map();
  const vertMap = new Int32Array(vertCount);
  let uniqueCount = 0;
  for (let i = 0; i < vertCount; i++) {
    const key = `${Math.round(positions[i * 3] * 1000)}_${Math.round(positions[i * 3 + 1] * 1000)}_${Math.round(positions[i * 3 + 2] * 1000)}`;
    if (!posMap.has(key)) {
      posMap.set(key, uniqueCount++);
    }
    vertMap[i] = posMap.get(key);
  }

  // Disjoint set
  const parent = new Int32Array(uniqueCount).map((_, i) => i);
  function find(i) {
    while (parent[i] !== i) { parent[i] = parent[parent[i]]; i = parent[i]; }
    return i;
  }
  function union(i, j) {
    const ri = find(i), rj = find(j);
    if (ri !== rj) parent[ri] = rj;
  }

  for (let t = 0; t < triCount; t++) {
    const u0 = vertMap[indices[t * 3]];
    const u1 = vertMap[indices[t * 3 + 1]];
    const u2 = vertMap[indices[t * 3 + 2]];
    union(u0, u1);
    union(u1, u2);
  }

  const clusters = new Map();
  for (let t = 0; t < triCount; t++) {
    const root = find(vertMap[indices[t * 3]]);
    if (!clusters.has(root)) clusters.set(root, []);
    clusters.get(root).push(t);
  }

  // Sort clusters by geometric center (Z then X) so ordering 1..9 is predictable
  const clusterList = Array.from(clusters.values()).map(tris => {
    let sumX = 0, sumY = 0, sumZ = 0;
    for (const t of tris) {
      for (let k = 0; k < 3; k++) {
        const v = indices[t * 3 + k];
        sumX += positions[v * 3];
        sumY += positions[v * 3 + 1];
        sumZ += positions[v * 3 + 2];
      }
    }
    const count = tris.length * 3;
    return { tris, centerX: sumX / count, centerY: sumY / count, centerZ: sumZ / count };
  });

  clusterList.sort((a, b) => {
    if (Math.abs(a.centerZ - b.centerZ) > 0.2) return a.centerZ - b.centerZ;
    return a.centerX - b.centerX;
  });

  return clusterList.map(c => c.tris);
}

function buildStandaloneGLB(positions, normals, uvs, indices, tris, imageBytes, imageMime) {
  // 1. Gather unique original vertices used by this diya
  const oldToNew = new Map();
  const newPositions = [];
  const newNormals = [];
  const newUVs = [];
  const newIndices = [];

  let minX = Infinity, maxX = -Infinity;
  let minY = Infinity, maxY = -Infinity;
  let minZ = Infinity, maxZ = -Infinity;

  for (const t of tris) {
    for (let k = 0; k < 3; k++) {
      const oldV = indices[t * 3 + k];
      if (!oldToNew.has(oldV)) {
        const newV = oldToNew.size;
        oldToNew.set(oldV, newV);
        const px = positions[oldV * 3 + 0];
        const py = positions[oldV * 3 + 1];
        const pz = positions[oldV * 3 + 2];
        newPositions.push(px, py, pz);
        newNormals.push(normals[oldV * 3 + 0], normals[oldV * 3 + 1], normals[oldV * 3 + 2]);
        newUVs.push(uvs[oldV * 2 + 0], uvs[oldV * 2 + 1]);

        if (px < minX) minX = px; if (px > maxX) maxX = px;
        if (py < minY) minY = py; if (py > maxY) maxY = py;
        if (pz < minZ) minZ = pz; if (pz > maxZ) maxZ = pz;
      }
      newIndices.push(oldToNew.get(oldV));
    }
  }

  // 2. Center geometry at (0, 0, 0) with base at y = 0
  const centerX = (minX + maxX) / 2;
  const baseY = minY;
  const centerZ = (minZ + maxZ) / 2;

  let postMinX = Infinity, postMaxX = -Infinity;
  let postMinY = Infinity, postMaxY = -Infinity;
  let postMinZ = Infinity, postMaxZ = -Infinity;

  for (let i = 0; i < newPositions.length / 3; i++) {
    newPositions[i * 3 + 0] -= centerX;
    newPositions[i * 3 + 1] -= baseY;
    newPositions[i * 3 + 2] -= centerZ;

    const x = newPositions[i * 3 + 0];
    const y = newPositions[i * 3 + 1];
    const z = newPositions[i * 3 + 2];
    if (x < postMinX) postMinX = x; if (x > postMaxX) postMaxX = x;
    if (y < postMinY) postMinY = y; if (y > postMaxY) postMaxY = y;
    if (z < postMinZ) postMinZ = z; if (z > postMaxZ) postMaxZ = z;
  }

  // 3. Encode buffers
  const posBuf = Buffer.from(new Float32Array(newPositions).buffer);
  const normBuf = Buffer.from(new Float32Array(newNormals).buffer);
  const uvBuf = Buffer.from(new Float32Array(newUVs).buffer);
  const idxBuf = Buffer.from(new Uint16Array(newIndices).buffer);

  // 4-byte alignment helper
  function pad4(buf) {
    const rem = buf.length % 4;
    if (rem === 0) return buf;
    return Buffer.concat([buf, Buffer.alloc(4 - rem)]);
  }

  const paddedPos = pad4(posBuf);
  const paddedNorm = pad4(normBuf);
  const paddedUV = pad4(uvBuf);
  const paddedIdx = pad4(idxBuf);
  const paddedImg = pad4(imageBytes);

  let curOffset = 0;
  const bv0Offset = curOffset; curOffset += paddedPos.length;
  const bv1Offset = curOffset; curOffset += paddedNorm.length;
  const bv2Offset = curOffset; curOffset += paddedUV.length;
  const bv3Offset = curOffset; curOffset += paddedIdx.length;
  const bv4Offset = curOffset; curOffset += paddedImg.length;

  const totalBin = Buffer.concat([paddedPos, paddedNorm, paddedUV, paddedIdx, paddedImg]);

  const gltfOut = {
    asset: { version: "2.0", generator: "Killa Diya Separator v1.0" },
    scene: 0,
    scenes: [{ nodes: [0] }],
    nodes: [{ mesh: 0, name: "diya_mesh" }],
    materials: [
      {
        name: "diya_material",
        pbrMetallicRoughness: {
          baseColorTexture: { index: 0 },
          metallicFactor: 0.05,
          roughnessFactor: 0.85
        },
        doubleSided: true
      }
    ],
    textures: [{ sampler: 0, source: 0 }],
    images: [{ name: "diya_tex", bufferView: 4, mimeType: imageMime }],
    samplers: [{ magFilter: 9729, minFilter: 9987, wrapS: 10497, wrapT: 10497 }],
    meshes: [
      {
        name: "diya_mesh",
        primitives: [
          {
            attributes: {
              POSITION: 0,
              NORMAL: 1,
              TEXCOORD_0: 2
            },
            indices: 3,
            mode: 4,
            material: 0
          }
        ]
      }
    ],
    accessors: [
      {
        bufferView: 0,
        byteOffset: 0,
        componentType: 5126,
        count: newPositions.length / 3,
        type: "VEC3",
        min: [postMinX, postMinY, postMinZ],
        max: [postMaxX, postMaxY, postMaxZ]
      },
      {
        bufferView: 1,
        byteOffset: 0,
        componentType: 5126,
        count: newNormals.length / 3,
        type: "VEC3"
      },
      {
        bufferView: 2,
        byteOffset: 0,
        componentType: 5126,
        count: newUVs.length / 2,
        type: "VEC2"
      },
      {
        bufferView: 3,
        byteOffset: 0,
        componentType: 5123,
        count: newIndices.length,
        type: "SCALAR"
      }
    ],
    bufferViews: [
      { buffer: 0, byteOffset: bv0Offset, byteLength: posBuf.length, target: 34962 },
      { buffer: 0, byteOffset: bv1Offset, byteLength: normBuf.length, target: 34962 },
      { buffer: 0, byteOffset: bv2Offset, byteLength: uvBuf.length, target: 34962 },
      { buffer: 0, byteOffset: bv3Offset, byteLength: idxBuf.length, target: 34963 },
      { buffer: 0, byteOffset: bv4Offset, byteLength: imageBytes.length }
    ],
    buffers: [{ byteLength: totalBin.length }]
  };

  const jsonStr = JSON.stringify(gltfOut);
  let jsonBuf = Buffer.from(jsonStr, 'utf8');
  // Pad JSON to 4-byte boundary with spaces
  const jsonRem = jsonBuf.length % 4;
  if (jsonRem !== 0) {
    jsonBuf = Buffer.concat([jsonBuf, Buffer.alloc(4 - jsonRem, 0x20)]);
  }

  // Header: 12 bytes + Chunk0: 8 + jsonBuf.length + Chunk1: 8 + totalBin.length
  const totalLength = 12 + 8 + jsonBuf.length + 8 + totalBin.length;
  const glb = Buffer.alloc(totalLength);

  let offset = 0;
  // GLB Header
  glb.writeUInt32LE(0x46546C67, offset); offset += 4; // Magic: 'glTF'
  glb.writeUInt32LE(2, offset); offset += 4;          // Version: 2
  glb.writeUInt32LE(totalLength, offset); offset += 4;

  // Chunk 0: JSON
  glb.writeUInt32LE(jsonBuf.length, offset); offset += 4;
  glb.writeUInt32LE(0x4E4F534A, offset); offset += 4; // 'JSON'
  jsonBuf.copy(glb, offset); offset += jsonBuf.length;

  // Chunk 1: BIN
  glb.writeUInt32LE(totalBin.length, offset); offset += 4;
  glb.writeUInt32LE(0x004E4942, offset); offset += 4; // 'BIN\0'
  totalBin.copy(glb, offset);

  return {
    glb,
    triangles: tris.length,
    dimensions: {
      width: +(postMaxX - postMinX).toFixed(3),
      height: +(postMaxY - postMinY).toFixed(3),
      depth: +(postMaxZ - postMinZ).toFixed(3)
    }
  };
}

function processDiyas(fileName, outputPrefix) {
  const filePath = path.join(FIGURINES_DIR, fileName);
  if (!fs.existsSync(filePath)) {
    console.error('File not found:', filePath);
    return;
  }
  const buf = fs.readFileSync(filePath);
  const { gltf, binData } = parseGLB(buf);

  // Extract the image texture bytes
  const imgBV = gltf.bufferViews[gltf.images[0].bufferView];
  const imageBytes = binData.subarray(imgBV.byteOffset, imgBV.byteOffset + imgBV.byteLength);
  const imageMime = gltf.images[0].mimeType || 'image/jpeg';

  const positions = extractPositions(gltf, binData);
  const normals = extractNormals(gltf, binData);
  const uvs = extractUVs(gltf, binData);
  const indices = extractIndices(gltf, binData);

  const diyas = findConnectedDiyas(positions, indices);
  console.log(`\nFound ${diyas.length} distinct diyas in ${fileName}:`);

  const results = [];
  for (let i = 0; i < diyas.length; i++) {
    const num = String(i + 1).padStart(2, '0');
    const outName = `${outputPrefix}_${num}.glb`;
    const outPath = path.join(FIGURINES_DIR, outName);
    const { glb, triangles, dimensions } = buildStandaloneGLB(
      positions,
      normals,
      uvs,
      indices,
      diyas[i],
      imageBytes,
      imageMime
    );
    fs.writeFileSync(outPath, glb);
    console.log(`  ✓ Created ${outName} (${triangles} tris, ${Math.round(glb.length / 1024)} KB) - dims: ${dimensions.width}m x ${dimensions.height}m x ${dimensions.depth}m`);
    results.push({ id: `${outputPrefix}_${num}`, outName, triangles, dimensions });
  }

  // Backup original to originals/
  fs.copyFileSync(filePath, path.join(ORIGINALS_DIR, fileName));
  return results;
}

function normalizeOtherFigurines() {
  const renames = [
    { src: 'Bullock cart.glb', dest: 'bullock_cart.glb', name: 'Bullock Cart' },
    { src: 'Dhol Drummer .glb', dest: 'dhol_drummer.glb', name: 'Dhol Drummer' },
    { src: 'Fan Blower.glb', dest: 'fan_blower.glb', name: 'Fan Blower' },
    { src: 'Flag Bearer.glb', dest: 'flag_bearer.glb', name: 'Flag Bearer' },
    { src: 'flag.glb', dest: 'saffron_flag.glb', name: 'Saffron Flag' },
    { src: 'Horn Blower.glb', dest: 'horn_blower.glb', name: 'Tutari Horn Blower' },
    { src: 'horse rider.glb', dest: 'horse_rider.glb', name: 'Horse Rider' },
    { src: 'King on throne.glb', dest: 'king_throne.glb', name: 'King on Throne' },
    { src: 'Rock Thrower.glb', dest: 'rock_thrower.glb', name: 'Rock Thrower' },
    { src: 'Spearman.glb', dest: 'spearman.glb', name: 'Spearman' },
    { src: 'warrior.glb', dest: 'warrior.glb', name: 'Warrior' }
  ];

  console.log('\nNormalizing figurine asset names:');
  for (const { src, dest, name } of renames) {
    const srcPath = path.join(FIGURINES_DIR, src);
    const destPath = path.join(FIGURINES_DIR, dest);
    if (fs.existsSync(srcPath)) {
      fs.copyFileSync(srcPath, path.join(ORIGINALS_DIR, src));
      if (src !== dest) {
        fs.copyFileSync(srcPath, destPath);
      }
      console.log(`  ✓ ${src} -> ${dest} (${name})`);
    } else if (fs.existsSync(destPath)) {
      console.log(`  ✓ ${dest} already exists`);
    } else {
      console.warn(`  ⚠ Warning: ${src} not found`);
    }
  }
}

console.log('=== Killa Figurine Asset Pipeline ===');
const clayResults = processDiyas('1-9 clay diyas.glb', 'diya_clay');
const colorResults = processDiyas('1-9 colorful diyas.glb', 'diya_color');
normalizeOtherFigurines();
console.log('\nAsset preparation complete! Total 29 figurine models ready.');

