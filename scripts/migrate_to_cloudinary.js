// Migration script: upload all existing base64 images in MongoDB to Cloudinary
// and replace the field with the secure URL.
// Run with: node /app/scripts/migrate_to_cloudinary.js

const fs = require('fs');
const path = require('path');

// Load env vars from /app/.env
const envContent = fs.readFileSync('/app/.env', 'utf8');
envContent.split('\n').forEach((line) => {
  const m = line.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
  if (m) process.env[m[1]] = m[2];
});

const { MongoClient } = require('/app/node_modules/mongodb');
const { v2: cloudinary } = require('/app/node_modules/cloudinary');

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';

cloudinary.config({
  cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
  secure: true,
});

function looksLikeBase64Image(s) {
  return typeof s === 'string' && s.startsWith('data:image');
}

async function uploadImg(data, folder) {
  const result = await cloudinary.uploader.upload(data, {
    folder: `ubik2-yemg/${folder}`,
    resource_type: 'image',
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
  });
  return result.secure_url;
}

async function migrateCollection(db, collectionName, field, folder) {
  console.log(`\n=== Migrando ${collectionName}.${field} → ${folder}/ ===`);
  const cursor = db.collection(collectionName).find({ [field]: { $regex: '^data:image' } });
  const docs = await cursor.toArray();
  console.log(`  Encontrados ${docs.length} documentos con base64.`);

  let success = 0;
  let failed = 0;
  for (let i = 0; i < docs.length; i++) {
    const doc = docs[i];
    const base64 = doc[field];
    if (!looksLikeBase64Image(base64)) continue;
    try {
      const url = await uploadImg(base64, folder);
      await db.collection(collectionName).updateOne({ _id: doc._id }, { $set: { [field]: url } });
      success++;
      process.stdout.write(`  [${i + 1}/${docs.length}] ✓ ${doc.id || doc._id} → ${url.slice(0, 80)}...\n`);
    } catch (e) {
      failed++;
      process.stdout.write(`  [${i + 1}/${docs.length}] ✗ ${doc.id || doc._id}: ${e?.message || e}\n`);
    }
  }
  console.log(`  Resultado: ${success} OK, ${failed} fallidos.`);
  return { success, failed, total: docs.length };
}

(async () => {
  if (!MONGO_URL) { console.error('MONGO_URL no configurado'); process.exit(1); }
  if (!process.env.CLOUDINARY_CLOUD_NAME) { console.error('Cloudinary no configurado'); process.exit(1); }
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('Conectado a MongoDB:', DB_NAME);

    const startedAt = Date.now();
    const r1 = await migrateCollection(db, 'products', 'image', 'products');
    const r2 = await migrateCollection(db, 'businesses', 'logo', 'logos');

    const elapsedSec = ((Date.now() - startedAt) / 1000).toFixed(1);
    console.log('\n========================================');
    console.log('MIGRACIÓN COMPLETA en', elapsedSec, 'seg');
    console.log('========================================');
    console.log(`Productos: ${r1.success}/${r1.total} migrados (${r1.failed} fallidos)`);
    console.log(`Negocios:  ${r2.success}/${r2.total} migrados (${r2.failed} fallidos)`);
  } catch (e) {
    console.error('Error global:', e);
    process.exit(1);
  } finally {
    await client.close();
  }
})();
