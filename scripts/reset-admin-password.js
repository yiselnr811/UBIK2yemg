// Reset admin password — utility script
// Run from the server terminal (where MONGO_URL points to the right DB):
//   node /app/scripts/reset-admin-password.js
//
// Defaults:
//   - Admin email: yiselnr811@gmail.com (fallback to admin@ubik2.com if it exists)
//   - New password: Administra2r.1279
//   - Ensures role='admin' and suspended=false
//
// Optionally override via env vars:
//   ADMIN_EMAIL=otro@email.com NEW_PASSWORD=NuevaPass123 node reset-admin-password.js

const fs = require('fs');

// Load /app/.env into process.env
try {
  fs.readFileSync('/app/.env', 'utf8').split('\n').forEach((l) => {
    const m = l.match(/^([A-Z_][A-Z0-9_]*)=(.*)$/);
    if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
  });
} catch {}

const { MongoClient } = require('/app/node_modules/mongodb');
const bcrypt = require('/app/node_modules/bcryptjs');
const { v4: uuidv4 } = require('/app/node_modules/uuid');

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';
const TARGET_EMAIL = (process.env.ADMIN_EMAIL || 'yiselnr811@gmail.com').toLowerCase();
const NEW_PASSWORD = process.env.NEW_PASSWORD || 'Administra2r.1279';

(async () => {
  if (!MONGO_URL) { console.error('❌ MONGO_URL no configurado en .env'); process.exit(1); }
  const client = new MongoClient(MONGO_URL);
  try {
    await client.connect();
    const db = client.db(DB_NAME);
    console.log('🔗 Conectado a MongoDB:', DB_NAME);

    const hash = await bcrypt.hash(NEW_PASSWORD, 10);

    // Look for an admin by target email OR by the old email
    let user = await db.collection('users').findOne({ email: TARGET_EMAIL });
    let oldAdmin = !user ? await db.collection('users').findOne({ email: 'admin@ubik2.com' }) : null;

    if (user) {
      // Update existing user with target email — ensure admin role + reset password
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { password: hash, role: 'admin', suspended: false } }
      );
      console.log(`✅ Password de '${TARGET_EMAIL}' reseteado y rol admin garantizado.`);
    } else if (oldAdmin) {
      // Migrate old admin email to new email + reset password
      await db.collection('users').updateOne(
        { id: oldAdmin.id },
        { $set: { email: TARGET_EMAIL, password: hash, role: 'admin', suspended: false } }
      );
      console.log(`✅ Admin migrado: admin@ubik2.com → ${TARGET_EMAIL} (password reseteada).`);
    } else {
      // Create a new admin from scratch
      const adminId = uuidv4();
      const bizId = uuidv4();
      await db.collection('businesses').insertOne({
        id: bizId, userId: adminId, name: 'UBIK2 YEMG Admin', logo: '', description: 'Administración',
        whatsapp: '+5350000000', location: 'Cuba', instagram: '', facebook: '', createdAt: new Date().toISOString(),
      });
      await db.collection('users').insertOne({
        id: adminId, email: TARGET_EMAIL, password: hash, name: 'Administrador UBIK2 YEMG',
        role: 'admin', businessId: bizId, plan: 'premium', planExpiresAt: null, suspended: false,
        createdAt: new Date().toISOString(),
      });
      console.log(`✅ Admin creado desde cero: ${TARGET_EMAIL}`);
    }

    // Verify
    const verify = await db.collection('users').findOne({ email: TARGET_EMAIL });
    const ok = await bcrypt.compare(NEW_PASSWORD, verify.password);
    console.log('🔍 Verificación → email:', verify.email, '| role:', verify.role, '| suspended:', !!verify.suspended, '| password match:', ok);
    console.log('\n📋 Usa estas credenciales para entrar:');
    console.log('   Email:    ', TARGET_EMAIL);
    console.log('   Password: ', NEW_PASSWORD);
  } catch (e) {
    console.error('❌ Error:', e?.message || e);
    process.exit(1);
  } finally {
    await client.close();
  }
})();
