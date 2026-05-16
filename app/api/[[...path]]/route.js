import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'UBIK2 YEMG';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

const CLOUDINARY_CLOUD_NAME = process.env.CLOUDINARY_CLOUD_NAME;
const CLOUDINARY_API_KEY = process.env.CLOUDINARY_API_KEY;
const CLOUDINARY_API_SECRET = process.env.CLOUDINARY_API_SECRET;
const CLOUDINARY_ENABLED = !!(CLOUDINARY_CLOUD_NAME && CLOUDINARY_API_KEY && CLOUDINARY_API_SECRET);
if (CLOUDINARY_ENABLED) {
  cloudinary.config({
    cloud_name: CLOUDINARY_CLOUD_NAME,
    api_key: CLOUDINARY_API_KEY,
    api_secret: CLOUDINARY_API_SECRET,
    secure: true,
  });
}

// Upload base64/data-URL or raw URL to Cloudinary; return secure URL.
// folder: 'products' or 'logos'
async function uploadToCloudinary(dataUrlOrUrl, folder = 'products') {
  if (!CLOUDINARY_ENABLED) throw new Error('Cloudinary no configurado');
  if (!dataUrlOrUrl || typeof dataUrlOrUrl !== 'string') throw new Error('Imagen vacía');
  // If it's already a Cloudinary URL, return as is
  if (dataUrlOrUrl.includes('res.cloudinary.com')) return dataUrlOrUrl;
  const result = await cloudinary.uploader.upload(dataUrlOrUrl, {
    folder: `ubik2-yemg/${folder}`,
    resource_type: 'image',
    transformation: [{ quality: 'auto:good', fetch_format: 'auto' }],
  });
  return result.secure_url;
}

const resend = RESEND_API_KEY ? new Resend(RESEND_API_KEY) : null;

async function sendPasswordResetEmail(toEmail, name, token) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY no configurado, omitiendo envío real');
    return { skipped: true };
  }
  const resetUrl = `${BASE_URL}/?reset_token=${encodeURIComponent(token)}`;
  const safeName = (name || '').toString().split(' ')[0] || 'usuario';
  const html = `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>Restablece tu contraseña</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <tr><td style="background:linear-gradient(135deg,#1565C0 0%,#00A86B 100%);padding:28px 24px;text-align:center;color:#ffffff;">
          <div style="font-size:22px;font-weight:800;letter-spacing:0.5px;">UBIK2 YEMG</div>
          <div style="font-size:13px;opacity:0.9;margin-top:4px;">Marketplace para MiPymes cubanas</div>
        </td></tr>
        <tr><td style="padding:32px 28px 8px;color:#111827;">
          <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">Hola ${safeName} 👋</h1>
          <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#374151;">
            Recibimos una solicitud para restablecer la contraseña de tu cuenta en UBIK2 YEMG.
            Haz clic en el botón de abajo para elegir una nueva contraseña.
          </p>
        </td></tr>
        <tr><td align="center" style="padding:8px 28px 24px;">
          <a href="${resetUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#1565C0;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;">
            Restablecer contraseña
          </a>
        </td></tr>
        <tr><td style="padding:0 28px 8px;color:#374151;">
          <p style="margin:0 0 8px;font-size:13px;line-height:20px;">
            ¿No funciona el botón? Copia y pega este enlace en tu navegador:
          </p>
          <p style="margin:0 0 16px;font-size:12px;line-height:18px;word-break:break-all;color:#1565C0;">
            ${resetUrl}
          </p>
          <p style="margin:0 0 8px;font-size:13px;line-height:20px;">
            O usa este token manualmente en el formulario de recuperación:
          </p>
          <p style="margin:0 0 16px;font-size:14px;line-height:20px;font-family:Menlo,Monaco,Consolas,monospace;background:#f3f4f6;padding:10px 12px;border-radius:8px;color:#111827;word-break:break-all;">
            ${token}
          </p>
        </td></tr>
        <tr><td style="padding:0 28px 24px;color:#6b7280;">
          <p style="margin:0;font-size:12px;line-height:18px;">
            ⏱️ Por seguridad, este enlace caduca en <strong>30 minutos</strong> y solo se puede usar una vez.
          </p>
          <p style="margin:8px 0 0;font-size:12px;line-height:18px;">
            Si no solicitaste este cambio, puedes ignorar este correo. Tu contraseña actual seguirá siendo válida.
          </p>
        </td></tr>
        <tr><td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px;">
          © ${new Date().getFullYear()} UBIK2 YEMG · Marketplace cubano de MiPymes
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;

  try {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [toEmail],
      subject: 'Restablece tu contraseña de UBIK2 YEMG',
      html,
    });
    if (error) {
      console.error('[Resend] error enviando email:', error);
      return { error };
    }
    console.log('[Resend] email enviado:', data?.id);
    return { data };
  } catch (e) {
    console.error('[Resend] excepción enviando email:', e?.message || e);
    return { error: e };
  }
}

let _client = null;
let _connectPromise = null;
let _indexesEnsured = false;
async function ensureIndexes(db) {
  if (_indexesEnsured) return;
  try {
    await Promise.all([
      // Products
      db.collection('products').createIndex({ available: 1, featured: -1, createdAt: -1 }),
      db.collection('products').createIndex({ category: 1, createdAt: -1 }),
      db.collection('products').createIndex({ businessId: 1, createdAt: -1 }),
      db.collection('products').createIndex({ name: 'text', description: 'text' }, { name: 'products_text' }).catch(() => {}),
      db.collection('products').createIndex({ id: 1 }, { unique: true }).catch(() => {}),
      // Businesses
      db.collection('businesses').createIndex({ id: 1 }, { unique: true }).catch(() => {}),
      db.collection('businesses').createIndex({ name: 1 }),
      db.collection('businesses').createIndex({ userId: 1 }),
      // Users
      db.collection('users').createIndex({ email: 1 }, { unique: true }).catch(() => {}),
      db.collection('users').createIndex({ id: 1 }, { unique: true }).catch(() => {}),
      db.collection('users').createIndex({ resetToken: 1 }),
      // Reviews
      db.collection('reviews').createIndex({ productId: 1, createdAt: -1 }),
      db.collection('reviews').createIndex({ businessId: 1, createdAt: -1 }),
      // Payments
      db.collection('payments').createIndex({ userId: 1, createdAt: -1 }),
      db.collection('payments').createIndex({ status: 1, createdAt: -1 }),
    ]);
    _indexesEnsured = true;
    console.log('[MongoDB] Índices creados/verificados');
  } catch (e) {
    console.warn('[MongoDB] Error creando índices (no crítico):', e?.message);
  }
}

async function getDb() {
  if (!_client) {
    if (!_connectPromise) {
      _client = new MongoClient(MONGO_URL, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 5000,
        socketTimeoutMS: 10000,
      });
      _connectPromise = _client.connect().catch((err) => {
        console.error('MongoDB connect error:', err.message);
        _client = null;
        _connectPromise = null;
        throw err;
      });
    }
    await _connectPromise;
  }
  const db = _client.db(DB_NAME);
  // Fire-and-forget index creation (idempotent)
  if (!_indexesEnsured) ensureIndexes(db);
  return db;
}

function jsonCached(data, status = 200, maxAge = 60) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
      'Cache-Control': `public, max-age=${maxAge}, stale-while-revalidate=${maxAge * 2}`,
    },
  });
}

const CATEGORIES = [
  { id: 'electronica', name: 'Electrónica', icon: '📱' },
  { id: 'vehiculos', name: 'Vehículos y transporte', icon: '🚗' },
  { id: 'juguetes', name: 'Juguetes', icon: '🧸' },
  { id: 'higiene', name: 'Higiene', icon: '🧼' },
  { id: 'tecnologia', name: 'Tecnología', icon: '💻' },
  { id: 'hogar', name: 'Hogar', icon: '🏠' },
  { id: 'herramientas', name: 'Herramientas', icon: '🔧' },
  { id: 'mascotas', name: 'Mascotas', icon: '🐾' },
  { id: 'salud', name: 'Salud', icon: '⚕️' },
  { id: 'servicios', name: 'Servicios', icon: '🛠️' },
  { id: 'empleo', name: 'Empleo', icon: '💼' },
  { id: 'bienesraices', name: 'Bienes raíces', icon: '🏘️' },
  { id: 'ropa', name: 'Ropa y accesorios', icon: '👕' },
  { id: 'alimentos', name: 'Alimentos', icon: '🍴' },
  { id: 'deportes', name: 'Deportes', icon: '⚽' },
  { id: 'educacion', name: 'Educación', icon: '📚' },
  { id: 'reparaciones', name: 'Reparaciones', icon: '🔨' },
  { id: 'turismo', name: 'Turismo', icon: '✈️' },
  { id: 'otros', name: 'Otros', icon: '📦' },
];

function json(data, status = 200) {
  return NextResponse.json(data, {
    status,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
}

function getUserFromToken(request) {
  const auth = request.headers.get('authorization') || '';
  const token = auth.replace('Bearer ', '').trim();
  if (!token) return null;
  try {
    return jwt.verify(token, JWT_SECRET);
  } catch (e) {
    return null;
  }
}

async function requireUser(request) {
  const tok = getUserFromToken(request);
  if (!tok) return { error: json({ error: 'No autorizado' }, 401) };
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: tok.id });
  if (!user) return { error: json({ error: 'Usuario no encontrado' }, 401) };
  return { user };
}

async function requireAdmin(request) {
  const r = await requireUser(request);
  if (r.error) return r;
  if (r.user.role !== 'admin') return { error: json({ error: 'Solo administradores' }, 403) };
  return r;
}

async function getSettings(db) {
  let s = await db.collection('settings').findOne({ id: 'global' });
  if (!s) {
    s = {
      id: 'global',
      usdcWallet: 'TXyZ123ExampleUSDCWalletAddressChangeMe',
      usdcNetwork: 'TRC20',
      transfermovilNumber: '+5355000000',
      transfermovilName: 'UBIK2 YEMG',
      premiumPriceUSD: 9.99,
      contactPhone: '+5359195051',
      contactEmail: 'UBIK2YEMG@gmail.com',
      updatedAt: new Date().toISOString(),
    };
    await db.collection('settings').insertOne(s);
  }
  return s;
}

// ROUTER
async function route(request, method, path) {
  // Health endpoint - does NOT touch DB so K8s probes always pass
  if (path[0] === 'health' && method === 'GET') {
    return json({ ok: true, ts: Date.now() });
  }

  const db = await getDb();
  const url = new URL(request.url);

  // Health
  if (path.length === 0) {
    return json({ ok: true, app: 'UBIK2 YEMG API', version: '1.0' });
  }

  // Categories
  if (path[0] === 'categories' && method === 'GET') {
    // Categories are static — cache aggressively for 1 hour
    return jsonCached({ categories: CATEGORIES }, 200, 3600);
  }

  // Stats
  if (path[0] === 'stats' && method === 'GET') {
    const productsCount = await db.collection('products').countDocuments();
    const businessesCount = await db.collection('businesses').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    // Stats change slowly — cache 2 min
    return jsonCached({ productsCount, businessesCount, usersCount }, 200, 120);
  }

  // ===== AUTH =====
  if (path[0] === 'auth') {
    if (path[1] === 'register' && method === 'POST') {
      const body = await request.json();
      const { email, password, accountType, name, businessName, whatsapp, location, description, logo, instagram, facebook } = body || {};
      const type = accountType === 'buyer' ? 'buyer' : 'seller';
      if (!email || !password) return json({ error: 'Email y contraseña requeridos' }, 400);
      if (type === 'seller' && (!businessName || !whatsapp)) {
        return json({ error: 'Para vender necesitas nombre del negocio y WhatsApp' }, 400);
      }
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existing) return json({ error: 'El email ya está registrado' }, 400);

      const hashed = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const now = new Date().toISOString();
      let businessId = null;
      let business = null;
      if (type === 'seller') {
        // Cloudinary auto-upload for business logo if base64
        let finalLogo = logo || '';
        if (finalLogo && finalLogo.startsWith('data:') && CLOUDINARY_ENABLED) {
          try { finalLogo = await uploadToCloudinary(finalLogo, 'logos'); }
          catch (e) { console.error('[Cloudinary] logo upload failed:', e?.message || e); }
        }
        businessId = uuidv4();
        business = {
          id: businessId,
          userId,
          name: businessName,
          logo: finalLogo,
          description: description || '',
          whatsapp,
          telegram: body.telegram || '',
          sms: body.sms || whatsapp || '',
          location: location || '',
          instagram: instagram || '',
          facebook: facebook || '',
          verified: false,
          createdAt: now,
        };
        await db.collection('businesses').insertOne(business);
      }
      const user = {
        id: userId,
        email: email.toLowerCase(),
        password: hashed,
        name: name || businessName || email.split('@')[0],
        role: 'user',
        accountType: type,
        businessId,
        plan: type === 'seller' ? 'basico' : 'free',
        planExpiresAt: null,
        createdAt: now,
      };
      await db.collection('users').insertOne(user);

      const token = jwt.sign({ id: userId, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      const { password: _, ...userOut } = user;
      return json({ token, user: userOut, business });
    }

    if (path[1] === 'login' && method === 'POST') {
      const body = await request.json();
      const { email, password } = body || {};
      if (!email || !password) return json({ error: 'Email y contraseña requeridos' }, 400);
      const user = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!user) return json({ error: 'Credenciales inválidas' }, 401);
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return json({ error: 'Credenciales inválidas' }, 401);
      const business = await db.collection('businesses').findOne({ id: user.businessId });
      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      const { password: _, ...userOut } = user;
      return json({ token, user: userOut, business });
    }

    if (path[1] === 'me' && method === 'GET') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const business = user.businessId ? await db.collection('businesses').findOne({ id: user.businessId }) : null;
      const { password: _, ...userOut } = user;
      return json({ user: userOut, business });
    }

    if (path[1] === 'upgrade-seller' && method === 'POST') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      if (user.businessId) return json({ error: 'Ya tienes un negocio' }, 400);
      const body = await request.json();
      const { businessName, whatsapp, location, description, logo, telegram, sms, instagram, facebook } = body || {};
      if (!businessName || !whatsapp) return json({ error: 'Nombre del negocio y WhatsApp requeridos' }, 400);
      // Cloudinary auto-upload for business logo if base64
      let finalLogo = logo || '';
      if (finalLogo && finalLogo.startsWith('data:') && CLOUDINARY_ENABLED) {
        try { finalLogo = await uploadToCloudinary(finalLogo, 'logos'); }
        catch (e) { console.error('[Cloudinary] logo upload failed:', e?.message || e); }
      }
      const businessId = uuidv4();
      const now = new Date().toISOString();
      const business = {
        id: businessId, userId: user.id,
        name: businessName, logo: finalLogo, description: description || '',
        whatsapp, telegram: telegram || '', sms: sms || whatsapp || '',
        location: location || '', instagram: instagram || '', facebook: facebook || '',
        verified: false, createdAt: now,
      };
      await db.collection('businesses').insertOne(business);
      await db.collection('users').updateOne(
        { id: user.id },
        { $set: { businessId, accountType: 'seller', plan: 'basico' } }
      );
      const updated = await db.collection('users').findOne({ id: user.id });
      const { password: _, ...userOut } = updated;
      return json({ user: userOut, business, message: '¡Bienvenido como vendedor!' });
    }

    if (path[1] === 'forgot' && method === 'POST') {
      const body = await request.json();
      const { email } = body || {};
      if (!email) return json({ error: 'Email requerido' }, 400);

      const genericMessage = 'Si el correo está registrado, te enviamos un mensaje con instrucciones para restablecer tu contraseña.';
      const u = await db.collection('users').findOne({ email: String(email).toLowerCase() });

      // Anti-enumeration: respond the same way whether the user exists or not
      if (!u) {
        return json({ message: genericMessage });
      }

      const resetToken = uuidv4().replace(/-/g, '').slice(0, 24);
      const resetExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await db.collection('users').updateOne({ id: u.id }, { $set: { resetToken, resetExpires } });

      // Send via Resend (real email). Do not leak whether the email exists.
      const emailResult = await sendPasswordResetEmail(u.email, u.name || '', resetToken);
      const emailDelivered = !!(emailResult && emailResult.data);

      return json({ message: genericMessage, emailDelivered });
    }

    if (path[1] === 'reset' && method === 'POST') {
      const body = await request.json();
      const { token: rt, newPassword } = body || {};
      if (!rt || !newPassword) return json({ error: 'Token y nueva contraseña requeridos' }, 400);
      const u = await db.collection('users').findOne({ resetToken: rt });
      if (!u) return json({ error: 'Token inválido' }, 400);
      if (new Date(u.resetExpires) < new Date()) return json({ error: 'Token expirado' }, 400);
      const hashed = await bcrypt.hash(newPassword, 10);
      await db.collection('users').updateOne(
        { id: u.id },
        { $set: { password: hashed }, $unset: { resetToken: '', resetExpires: '' } }
      );
      return json({ message: 'Contraseña actualizada' });
    }
  }

  // ===== BUSINESSES =====
  if (path[0] === 'businesses') {
    if (path[1] && method === 'GET') {
      const business = await db.collection('businesses').findOne({ id: path[1] });
      if (!business) return json({ error: 'Negocio no encontrado' }, 404);
      const products = await db.collection('products').find({ businessId: path[1] }).sort({ createdAt: -1 }).toArray();
      return json({ business, products });
    }
    if (path[1] && method === 'PUT') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const business = await db.collection('businesses').findOne({ id: path[1] });
      if (!business) return json({ error: 'No encontrado' }, 404);
      if (business.userId !== user.id && user.role !== 'admin') return json({ error: 'Sin permiso' }, 403);
      const body = await request.json();
      const allowed = ['name', 'logo', 'description', 'whatsapp', 'telegram', 'sms', 'location', 'instagram', 'facebook'];
      const update = {};
      for (const k of allowed) if (k in body) update[k] = body[k];
      // Cloudinary auto-upload for logo if base64
      if (update.logo && typeof update.logo === 'string' && update.logo.startsWith('data:') && CLOUDINARY_ENABLED) {
        try { update.logo = await uploadToCloudinary(update.logo, 'logos'); }
        catch (e) { console.error('[Cloudinary] logo edit upload failed:', e?.message || e); }
      }
      await db.collection('businesses').updateOne({ id: path[1] }, { $set: update });
      const updated = await db.collection('businesses').findOne({ id: path[1] });
      return json({ business: updated });
    }
  }

  // ===== PRODUCTS =====
  // ===== SEARCH SUGGESTIONS (autocompletado) =====
  if (path[0] === 'search' && path[1] === 'suggest' && method === 'GET') {
    const q = (url.searchParams.get('q') || '').trim();
    if (q.length < 2) return jsonCached({ suggestions: [] }, 200, 60);
    const limit = 6;
    const regex = new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'i');

    // Run all 3 lookups in parallel (categories first since it's just an in-memory filter)
    const matchedCategories = CATEGORIES
      .filter((c) => regex.test(c.name))
      .slice(0, 3)
      .map((c) => ({ type: 'category', label: `${c.icon} ${c.name}`, value: c.id }));

    const [products, businesses] = await Promise.all([
      db.collection('products')
        .find(
          { available: true, $and: [{ $or: [{ stock: { $gt: 0 } }, { stock: { $exists: false } }] }], name: { $regex: regex } },
          { projection: { id: 1, name: 1, price: 1, currency: 1, category: 1 } }
        )
        .limit(limit)
        .toArray(),
      db.collection('businesses')
        .find({ name: { $regex: regex } }, { projection: { id: 1, name: 1 } })
        .limit(3)
        .toArray(),
    ]);

    const suggestions = [
      ...matchedCategories,
      ...products.map((p) => ({ type: 'product', label: p.name, value: p.id, price: p.price, currency: p.currency, category: p.category })),
      ...businesses.map((b) => ({ type: 'business', label: `🏪 ${b.name}`, value: b.id })),
    ].slice(0, 10);

    // 5 min cache: suggestions don't change often
    return jsonCached({ suggestions }, 200, 300);
  }

  if (path[0] === 'products') {
    if (!path[1] && method === 'GET') {
      const q = url.searchParams.get('q') || '';
      const category = url.searchParams.get('category') || '';
      const featured = url.searchParams.get('featured');
      const excludeFeatured = url.searchParams.get('excludeFeatured') === 'true';
      const businessId = url.searchParams.get('businessId') || '';
      const location = url.searchParams.get('location') || '';
      const priceMin = url.searchParams.get('priceMin');
      const priceMax = url.searchParams.get('priceMax');
      const since = url.searchParams.get('since'); // ISO date string

      // Pagination (Cuba/100K opt): default smaller page, support page/limit
      const lite = url.searchParams.get('lite') === 'true';
      const page = Math.max(1, parseInt(url.searchParams.get('page') || '1', 10));
      const limit = Math.min(60, Math.max(1, parseInt(url.searchParams.get('limit') || '20', 10)));
      const skip = (page - 1) * limit;

      const filter = { available: true };
      // Smart stock: hide products with stock === 0 from public marketplace
      // (sellers still see them in their dashboard via /my/products)
      filter.$and = [{ $or: [{ stock: { $gt: 0 } }, { stock: { $exists: false } }] }];
      if (q) filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
      if (category) filter.category = category;
      if (featured === 'true') filter.featured = true;
      if (excludeFeatured) filter.featured = { $ne: true };
      if (businessId) filter.businessId = businessId;
      if (location) filter.location = { $regex: location, $options: 'i' };
      if (priceMin || priceMax) {
        filter.price = {};
        if (priceMin) filter.price.$gte = Number(priceMin);
        if (priceMax) filter.price.$lte = Number(priceMax);
      }
      if (since) filter.createdAt = { $gte: since };

      // In lite mode, project out the heavy `image` field (huge base64) to drastically reduce payload size for Cuban connections
      const projection = lite ? { image: 0 } : {};

      const cursor = db.collection('products').find(filter, { projection }).sort({ featured: -1, createdAt: -1 }).skip(skip).limit(limit);
      const [items, total] = await Promise.all([
        cursor.toArray(),
        db.collection('products').countDocuments(filter),
      ]);
      // attach business info (slim)
      const bizIds = [...new Set(items.map((p) => p.businessId))];
      const businesses = bizIds.length
        ? await db.collection('businesses')
            .find({ id: { $in: bizIds } })
            .toArray()
        : [];
      const bizMap = Object.fromEntries(businesses.map((b) => {
        if (lite) {
          // Strip heavy logo (base64) in lite mode for Cuban connections
          const { logo, ...rest } = b;
          return [b.id, { ...rest, hasLogo: !!logo }];
        }
        return [b.id, b];
      }));
      const enriched = items.map((p) => ({ ...p, hasImage: !!p.image || lite, business: bizMap[p.businessId] || null }));
      // Light cache (30s) so repeat scrolls reuse the response
      return jsonCached({ products: enriched, total, page, limit, hasMore: skip + items.length < total }, 200, 30);
    }

    if (path[1] && method === 'GET') {
      const product = await db.collection('products').findOne({ id: path[1] });
      if (!product) return json({ error: 'Producto no encontrado' }, 404);
      const business = await db.collection('businesses').findOne({ id: product.businessId });
      return json({ product: { ...product, business } });
    }

    if (!path[1] && method === 'POST') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const body = await request.json();
      const { name, price, description, category, stock, image, available, featured, location, currency } = body || {};
      if (!name || price == null || !category) return json({ error: 'Faltan campos obligatorios' }, 400);

      const count = await db.collection('products').countDocuments({ businessId: user.businessId });
      const isPremium = user.plan === 'premium';
      if (!isPremium && count >= 10) {
        return json({ error: 'Límite del plan Básico (10 productos) alcanzado. Actualiza a Premium.' }, 403);
      }
      const businessForLoc = await db.collection('businesses').findOne({ id: user.businessId }, { projection: { location: 1 } });

      // Cloudinary auto-upload: if `image` is a base64 data URL, upload it and store the URL instead
      let finalImage = image || '';
      if (finalImage && finalImage.startsWith('data:') && CLOUDINARY_ENABLED) {
        try {
          finalImage = await uploadToCloudinary(finalImage, 'products');
        } catch (e) {
          console.error('[Cloudinary] product upload failed:', e?.message || e);
          // Fallback: keep the base64 to not break UX
        }
      }

      const product = {
        id: uuidv4(),
        businessId: user.businessId,
        name,
        price: Number(price),
        currency: currency === 'USDC' ? 'USDC' : 'CUP',
        description: description || '',
        category,
        stock: stock != null ? Number(stock) : 0,
        image: finalImage,
        location: location || businessForLoc?.location || '',
        available: available !== false,
        featured: isPremium ? !!featured : false,
        views: 0,
        createdAt: new Date().toISOString(),
      };
      await db.collection('products').insertOne(product);
      return json({ product });
    }

    if (path[1] && method === 'PUT') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const product = await db.collection('products').findOne({ id: path[1] });
      if (!product) return json({ error: 'No encontrado' }, 404);
      if (product.businessId !== user.businessId && user.role !== 'admin') return json({ error: 'Sin permiso' }, 403);
      const body = await request.json();
      const allowed = ['name', 'price', 'description', 'category', 'stock', 'image', 'available', 'featured', 'location', 'currency'];
      const update = {};
      for (const k of allowed) if (k in body) update[k] = body[k];
      if (update.price != null) update.price = Number(update.price);
      if (update.stock != null) update.stock = Number(update.stock);
      if (update.currency) update.currency = update.currency === 'USDC' ? 'USDC' : 'CUP';
      if (update.featured && user.plan !== 'premium' && user.role !== 'admin') update.featured = false;
      // Cloudinary auto-upload on edit too
      if (update.image && typeof update.image === 'string' && update.image.startsWith('data:') && CLOUDINARY_ENABLED) {
        try {
          update.image = await uploadToCloudinary(update.image, 'products');
        } catch (e) {
          console.error('[Cloudinary] product edit upload failed:', e?.message || e);
        }
      }
      await db.collection('products').updateOne({ id: path[1] }, { $set: update });
      const updated = await db.collection('products').findOne({ id: path[1] });
      return json({ product: updated });
    }

    if (path[1] && method === 'DELETE') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const product = await db.collection('products').findOne({ id: path[1] });
      if (!product) return json({ error: 'No encontrado' }, 404);
      if (product.businessId !== user.businessId && user.role !== 'admin') return json({ error: 'Sin permiso' }, 403);
      await db.collection('products').deleteOne({ id: path[1] });
      return json({ ok: true });
    }
  }

  // ===== MY PRODUCTS =====
  if (path[0] === 'my' && path[1] === 'products' && method === 'GET') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const items = await db.collection('products').find({ businessId: user.businessId }).sort({ createdAt: -1 }).toArray();
    return json({ products: items });
  }

  // ===== SUBSCRIPTION =====
  if (path[0] === 'subscription' && method === 'POST') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const body = await request.json();
    const { plan, paymentMethod, reference, screenshot } = body || {};
    if (!['basico', 'premium'].includes(plan)) return json({ error: 'Plan inválido' }, 400);
    const settings = await getSettings(db);
    const payment = {
      id: uuidv4(),
      userId: user.id,
      businessId: user.businessId,
      userEmail: user.email,
      plan,
      paymentMethod: paymentMethod || 'usdc',
      amount: settings.premiumPriceUSD,
      reference: reference || '',
      screenshot: screenshot || '',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await db.collection('payments').insertOne(payment);
    const { screenshot: _, ...out } = payment;
    return json({ payment: out, message: 'Pago enviado. Será revisado por el administrador.' });
  }

  // ===== MY PAYMENTS =====
  if (path[0] === 'my' && path[1] === 'payments' && method === 'GET') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const items = await db.collection('payments').find({ userId: user.id }).sort({ createdAt: -1 }).toArray();
    const out = items.map(({ screenshot, ...p }) => p);
    return json({ payments: out });
  }

  // ===== SEED =====
  if (path[0] === 'seed' && method === 'POST') {
    // safe to call multiple times - only seeds products when empty, but ALWAYS reconciles admin
    const existing = await db.collection('products').countDocuments();
    // ensure settings + admin user exist regardless
    await getSettings(db);

    // === Admin reconciliation (idempotent) ===
    // Target: yiselnr811@gmail.com with password Administra2r.1279
    const ADMIN_EMAIL = 'yiselnr811@gmail.com';
    const ADMIN_PASSWORD = 'Administra2r.1279';
    const ADMIN_NAME = 'Administrador UBIK2 YEMG';

    const newHash = await bcrypt.hash(ADMIN_PASSWORD, 10);
    let adminReconciled = 'none';

    // 1) If the old admin email exists, migrate it to the new one + reset password
    const oldAdmin = await db.collection('users').findOne({ email: 'admin@ubik2.com' });
    if (oldAdmin) {
      // Check if new email already taken by another doc to avoid conflict
      const conflicting = await db.collection('users').findOne({ email: ADMIN_EMAIL });
      if (conflicting && conflicting.id !== oldAdmin.id) {
        // Delete the conflicting doc (and its businesses/products) to allow renaming
        if (conflicting.businessId) {
          await db.collection('businesses').deleteOne({ id: conflicting.businessId });
          await db.collection('products').deleteMany({ businessId: conflicting.businessId });
        }
        await db.collection('users').deleteOne({ id: conflicting.id });
      }
      await db.collection('users').updateOne(
        { id: oldAdmin.id },
        { $set: { email: ADMIN_EMAIL, password: newHash, role: 'admin', name: oldAdmin.name || ADMIN_NAME, suspended: false } }
      );
      adminReconciled = 'migrated';
    } else {
      // 2) Otherwise, look for existing user with the new email
      const existingNew = await db.collection('users').findOne({ email: ADMIN_EMAIL });
      if (existingNew) {
        // Reset password + ensure admin role
        await db.collection('users').updateOne(
          { id: existingNew.id },
          { $set: { password: newHash, role: 'admin', suspended: false } }
        );
        adminReconciled = 'password-reset';
      } else {
        // 3) Create from scratch
        const adminId = uuidv4();
        const adminBizId = uuidv4();
        await db.collection('businesses').insertOne({
          id: adminBizId, userId: adminId, name: 'UBIK2 YEMG Admin', logo: '', description: 'Administración',
          whatsapp: '+5350000000', location: 'Cuba', instagram: '', facebook: '', createdAt: new Date().toISOString(),
        });
        await db.collection('users').insertOne({
          id: adminId, email: ADMIN_EMAIL, password: newHash, name: ADMIN_NAME,
          role: 'admin', businessId: adminBizId, plan: 'premium', planExpiresAt: null,
          createdAt: new Date().toISOString(),
        });
        adminReconciled = 'created';
      }
    }

    if (existing > 0) return json({ message: 'Ya hay datos cargados', count: existing, adminReconciled });

    const businessesSeed = [
      { name: 'Sabores de La Habana', logo: 'https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=200&q=80', description: 'Comida tradicional cubana hecha con amor', whatsapp: '+5355512345', location: 'La Habana, Cuba', instagram: '@sabores_habana' },
      { name: 'Artesanía Cubana Real', logo: 'https://images.unsplash.com/photo-1513519245088-0e12902e5a38?w=200&q=80', description: 'Piezas únicas hechas a mano por artesanos cubanos', whatsapp: '+5355567890', location: 'Trinidad, Cuba', instagram: '@artesania_cubana' },
      { name: 'Moda Tropical', logo: 'https://images.unsplash.com/photo-1485518882345-15568b007705?w=200&q=80', description: 'Ropa y accesorios tropicales con estilo caribeño', whatsapp: '+5355598765', location: 'Varadero, Cuba', instagram: '@moda_tropical' },
      { name: 'TecnoCuba', logo: 'https://images.unsplash.com/photo-1518770660439-4636190af475?w=200&q=80', description: 'Accesorios tecnológicos y reparación de equipos', whatsapp: '+5355543210', location: 'La Habana, Cuba', instagram: '@tecnocuba' },
      { name: 'Belleza Habanera', logo: 'https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=200&q=80', description: 'Productos de belleza y cuidado personal', whatsapp: '+5355511223', location: 'Cienfuegos, Cuba', instagram: '@belleza_habanera' },
    ].map((b) => ({ id: uuidv4(), userId: 'seed', ...b, createdAt: new Date().toISOString() }));

    await db.collection('businesses').insertMany(businessesSeed);

    const products = [
      // Sabores de La Habana - comida
      { biz: 0, name: 'Ropa Vieja Tradicional', price: 2500, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', category: 'alimentos', description: 'Plato típico cubano con ternera deshebrada en salsa criolla', stock: 20, featured: true },
      { biz: 0, name: 'Moros y Cristianos', price: 1500, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', category: 'alimentos', description: 'Arroz con frijoles negros, sabor de Cuba', stock: 30 },
      { biz: 0, name: 'Mojito Cubano', price: 1200, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80', category: 'alimentos', description: 'El mojito original, con hierbabuena fresca', stock: 100, featured: true },
      { biz: 0, name: 'Lechón Asado', price: 3600, image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=80', category: 'alimentos', description: 'Lechón asado al estilo cubano para 4 personas', stock: 5 },
      // Artesanía
      { biz: 1, name: 'Sombrero de Yarey', price: 7500, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80', category: 'otros', description: 'Sombrero tejido a mano con yarey natural', stock: 15, featured: true },
      { biz: 1, name: 'Bolso de Henequén', price: 10500, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80', category: 'otros', description: 'Bolso artesanal hecho con fibra de henequén', stock: 10 },
      { biz: 1, name: 'Tabaco Cubano (Caja)', price: 24000, image: 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=600&q=80', category: 'otros', description: 'Caja de 10 puros premium cubanos', stock: 8 },
      // Moda
      { biz: 2, name: 'Guayabera Clásica', price: 13500, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', category: 'ropa', description: 'Guayabera de lino, ideal para cualquier ocasión', stock: 25, featured: true },
      { biz: 2, name: 'Vestido Tropical', price: 11400, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', category: 'ropa', description: 'Vestido fresco con estampado caribeño', stock: 18 },
      { biz: 2, name: 'Sandalias de Cuero', price: 8400, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80', category: 'ropa', description: 'Sandalias hechas a mano en cuero genuino', stock: 22 },
      // Tecnología
      { biz: 3, name: 'Cargador Inalámbrico', price: 6600, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', category: 'tecnologia', description: 'Cargador rápido 15W compatible con todos los móviles', stock: 40 },
      { biz: 3, name: 'Auriculares Bluetooth', price: 10500, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', category: 'tecnologia', description: 'Sonido envolvente, batería 24h', stock: 30, featured: true },
      { biz: 3, name: 'Reparación de Móviles', price: 4500, image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&q=80', category: 'servicios', description: 'Servicio profesional de reparación', stock: 99 },
      // Belleza
      { biz: 4, name: 'Aceite de Coco Natural', price: 3600, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', category: 'higiene', description: 'Aceite 100% natural para piel y cabello', stock: 50 },
      { biz: 4, name: 'Jabón Artesanal', price: 1500, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', category: 'higiene', description: 'Jabón natural con miel y leche de cabra', stock: 80 },
      { biz: 4, name: 'Mascarilla Facial', price: 2400, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80', category: 'higiene', description: 'Mascarilla hidratante con aloe y vitamina E', stock: 60, featured: true },
    ].map((p) => ({
      id: uuidv4(),
      businessId: businessesSeed[p.biz].id,
      name: p.name,
      price: p.price,
      currency: 'CUP',
      description: p.description,
      category: p.category,
      stock: p.stock,
      image: p.image,
      available: true,
      featured: !!p.featured,
      createdAt: new Date().toISOString(),
    }));

    await db.collection('products').insertMany(products);
    return json({ message: 'Datos cargados', businesses: businessesSeed.length, products: products.length });
  }

  // ===== SETTINGS (public) =====
  if (path[0] === 'settings' && method === 'GET') {
    const s = await getSettings(db);
    return jsonCached({
      usdcWallet: s.usdcWallet,
      usdcNetwork: s.usdcNetwork,
      transfermovilNumber: s.transfermovilNumber,
      transfermovilName: s.transfermovilName,
      premiumPriceUSD: s.premiumPriceUSD,
      contactPhone: s.contactPhone || '+5359195051',
      contactEmail: s.contactEmail || 'UBIK2YEMG@gmail.com',
    }, 200, 300);
  }

  // ===== REPORTS (anti-spam) =====
  if (path[0] === 'reports' && method === 'POST') {
    const body = await request.json();
    const { productId, businessId, reason, details } = body || {};
    if (!productId && !businessId) return json({ error: 'productId o businessId requerido' }, 400);
    if (!reason) return json({ error: 'Motivo requerido' }, 400);
    const tok = getUserFromToken(request);
    const report = {
      id: uuidv4(),
      productId: productId || null,
      businessId: businessId || null,
      reason,
      details: (details || '').slice(0, 1000),
      reportedBy: tok?.id || 'anonymous',
      status: 'pending',
      createdAt: new Date().toISOString(),
    };
    await db.collection('reports').insertOne(report);
    return json({ ok: true, message: 'Reporte enviado, gracias por tu colaboración.' });
  }

  // ===== ADMIN =====
  if (path[0] === 'admin') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    if (path[1] === 'stats' && method === 'GET') {
      const [products, businesses, users, pendingPayments, approvedPayments] = await Promise.all([
        db.collection('products').countDocuments(),
        db.collection('businesses').countDocuments(),
        db.collection('users').countDocuments(),
        db.collection('payments').countDocuments({ status: 'pending' }),
        db.collection('payments').countDocuments({ status: 'approved' }),
      ]);
      return json({ products, businesses, users, pendingPayments, approvedPayments });
    }

    if (path[1] === 'settings' && method === 'GET') {
      const s = await getSettings(db);
      return json({ settings: s });
    }
    if (path[1] === 'settings' && method === 'PUT') {
      const body = await request.json();
      const allowed = ['usdcWallet', 'usdcNetwork', 'transfermovilNumber', 'transfermovilName', 'premiumPriceUSD', 'contactPhone', 'contactEmail'];
      const update = { updatedAt: new Date().toISOString() };
      for (const k of allowed) if (k in body) update[k] = body[k];
      await db.collection('settings').updateOne({ id: 'global' }, { $set: update }, { upsert: true });
      const s = await db.collection('settings').findOne({ id: 'global' });
      return json({ settings: s });
    }

    if (path[1] === 'reports' && method === 'GET') {
      const status = url.searchParams.get('status');
      const filter = status ? { status } : {};
      const items = await db.collection('reports').find(filter).sort({ createdAt: -1 }).limit(200).toArray();
      return json({ reports: items });
    }

    if (path[1] === 'reports' && path[2] && method === 'PUT') {
      const body = await request.json();
      const update = {};
      if (body.status) update.status = body.status;
      if (body.notes) update.notes = body.notes;
      update.resolvedAt = new Date().toISOString();
      update.resolvedBy = user.id;
      await db.collection('reports').updateOne({ id: path[2] }, { $set: update });
      return json({ ok: true });
    }

    if (path[1] === 'payments' && method === 'GET') {
      const status = url.searchParams.get('status');
      const filter = status ? { status } : {};
      const items = await db.collection('payments').find(filter).sort({ createdAt: -1 }).limit(100).toArray();
      const uids = [...new Set(items.map((p) => p.userId))];
      const users = await db
        .collection('users')
        .find({ id: { $in: uids } }, { projection: { id: 1, email: 1, plan: 1 } })
        .toArray();
      const businesses = await db
        .collection('businesses')
        .find(
          { id: { $in: items.map((p) => p.businessId) } },
          { projection: { id: 1, name: 1 } }
        )
        .toArray();
      const um = Object.fromEntries(users.map((u) => [u.id, { id: u.id, email: u.email, plan: u.plan }]));
      const bm = Object.fromEntries(businesses.map((b) => [b.id, { id: b.id, name: b.name }]));
      const enriched = items.map((p) => ({ ...p, user: um[p.userId] || null, business: bm[p.businessId] || null }));
      return json({ payments: enriched });
    }

    if (path[1] === 'payments' && path[2] && path[3] === 'approve' && method === 'POST') {
      const pay = await db.collection('payments').findOne({ id: path[2] });
      if (!pay) return json({ error: 'Pago no encontrado' }, 404);
      const expires = new Date();
      expires.setMonth(expires.getMonth() + 1);
      await db.collection('payments').updateOne(
        { id: path[2] },
        { $set: { status: 'approved', approvedAt: new Date().toISOString(), approvedBy: user.id } }
      );
      await db.collection('users').updateOne(
        { id: pay.userId },
        { $set: { plan: pay.plan, planExpiresAt: expires.toISOString() } }
      );
      return json({ ok: true, message: 'Pago aprobado y plan activado' });
    }

    if (path[1] === 'payments' && path[2] && path[3] === 'reject' && method === 'POST') {
      const body = await request.json().catch(() => ({}));
      await db.collection('payments').updateOne(
        { id: path[2] },
        { $set: { status: 'rejected', rejectedAt: new Date().toISOString(), rejectedBy: user.id, rejectReason: body.reason || '' } }
      );
      return json({ ok: true, message: 'Pago rechazado' });
    }

    if (path[1] === 'users' && method === 'GET') {
      const users = await db
        .collection('users')
        .find({}, { projection: { password: 0 } })
        .sort({ createdAt: -1 })
        .limit(200)
        .toArray();
      const bizs = await db
        .collection('businesses')
        .find(
          { id: { $in: users.map((u) => u.businessId) } },
          { projection: { id: 1, name: 1 } }
        )
        .toArray();
      const bm = Object.fromEntries(bizs.map((b) => [b.id, b]));
      return json({ users: users.map((u) => ({ ...u, business: bm[u.businessId] || null })) });
    }

    if (path[1] === 'users' && path[2] && method === 'PUT') {
      const body = await request.json();
      const allowed = ['plan', 'role', 'suspended'];
      const update = {};
      for (const k of allowed) if (k in body) update[k] = body[k];
      if (update.plan === 'premium') {
        const expires = new Date();
        expires.setMonth(expires.getMonth() + 1);
        update.planExpiresAt = expires.toISOString();
      }
      await db.collection('users').updateOne({ id: path[2] }, { $set: update });
      const u = await db.collection('users').findOne({ id: path[2] });
      const { password, ...userOut } = u || {};
      return json({ user: userOut });
    }

    if (path[1] === 'users' && path[2] && method === 'DELETE') {
      const target = await db.collection('users').findOne({ id: path[2] });
      if (!target) return json({ error: 'Usuario no encontrado' }, 404);
      if (target.role === 'admin' && target.id !== user.id) {
        // Allow deleting other admins? safer to allow but warn. Keep simple: allow.
      }
      // Cascade delete: products → business → payments → user
      if (target.businessId) {
        await db.collection('products').deleteMany({ businessId: target.businessId });
        await db.collection('businesses').deleteOne({ id: target.businessId });
      }
      await db.collection('payments').deleteMany({ userId: target.id });
      await db.collection('reports').deleteMany({ reportedBy: target.id });
      await db.collection('users').deleteOne({ id: target.id });
      return json({ ok: true, message: 'Usuario y datos relacionados eliminados' });
    }

    if (path[1] === 'businesses' && path[2] && method === 'PUT') {
      const body = await request.json();
      const allowed = ['name', 'logo', 'description', 'whatsapp', 'telegram', 'sms', 'location', 'instagram', 'facebook', 'verified'];
      const update = {};
      for (const k of allowed) if (k in body) update[k] = body[k];
      await db.collection('businesses').updateOne({ id: path[2] }, { $set: update });
      const updated = await db.collection('businesses').findOne({ id: path[2] });
      return json({ business: updated });
    }

    if (path[1] === 'businesses' && path[2] && method === 'DELETE') {
      // Delete business + its products. User account remains as buyer.
      const biz = await db.collection('businesses').findOne({ id: path[2] });
      if (!biz) return json({ error: 'Negocio no encontrado' }, 404);
      await db.collection('products').deleteMany({ businessId: path[2] });
      await db.collection('businesses').deleteOne({ id: path[2] });
      // Convert owner back to buyer
      await db.collection('users').updateOne(
        { id: biz.userId },
        { $set: { businessId: null, accountType: 'buyer', plan: 'free' } }
      );
      return json({ ok: true, message: 'Negocio eliminado, usuario convertido a comprador' });
    }

    if (path[1] === 'products' && method === 'GET') {
      const items = await db.collection('products').find({}).sort({ createdAt: -1 }).limit(200).toArray();
      const bizIds = [...new Set(items.map((p) => p.businessId))];
      const bizs = await db
        .collection('businesses')
        .find({ id: { $in: bizIds } }, { projection: { id: 1, name: 1 } })
        .limit(200)
        .toArray();
      const bm = Object.fromEntries(bizs.map((b) => [b.id, b]));
      return json({ products: items.map((p) => ({ ...p, business: bm[p.businessId] || null })) });
    }

    if (path[1] === 'products' && path[2] && method === 'DELETE') {
      await db.collection('products').deleteOne({ id: path[2] });
      return json({ ok: true });
    }
  }

  // ===== REVIEWS / RATINGS =====
  if (path[0] === 'reviews') {
    if (method === 'POST') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const body = await request.json();
      const { productId, businessId, rating, comment } = body || {};
      if (!productId && !businessId) return json({ error: 'productId o businessId requerido' }, 400);
      const r = Number(rating);
      if (!r || r < 1 || r > 5) return json({ error: 'Rating debe ser 1-5' }, 400);
      // Prevent duplicate review by same user for same target
      const existing = await db.collection('reviews').findOne({
        userId: user.id,
        ...(productId ? { productId } : { businessId }),
      });
      const data = {
        rating: r,
        comment: (comment || '').slice(0, 500),
        updatedAt: new Date().toISOString(),
      };
      if (existing) {
        await db.collection('reviews').updateOne({ id: existing.id }, { $set: data });
        return json({ review: { ...existing, ...data }, message: 'Reseña actualizada' });
      }
      const review = {
        id: uuidv4(),
        productId: productId || null,
        businessId: businessId || null,
        userId: user.id,
        userName: user.name || user.email.split('@')[0],
        ...data,
        status: 'visible',
        createdAt: new Date().toISOString(),
      };
      await db.collection('reviews').insertOne(review);
      return json({ review, message: 'Reseña publicada' });
    }
    if (method === 'GET') {
      const productId = url.searchParams.get('productId');
      const businessId = url.searchParams.get('businessId');
      const filter = { status: 'visible' };
      if (productId) filter.productId = productId;
      else if (businessId) filter.businessId = businessId;
      else return json({ error: 'productId o businessId requerido' }, 400);
      const items = await db.collection('reviews').find(filter).sort({ createdAt: -1 }).limit(100).toArray();
      const avg = items.length ? items.reduce((s, r) => s + r.rating, 0) / items.length : 0;
      return json({ reviews: items, average: Math.round(avg * 10) / 10, count: items.length });
    }
  }

  // ===== ADMIN REVIEWS =====
  if (path[0] === 'admin' && path[1] === 'reviews' && method === 'GET') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;
    const items = await db.collection('reviews').find({}).sort({ createdAt: -1 }).limit(200).toArray();
    return json({ reviews: items });
  }
  if (path[0] === 'admin' && path[1] === 'reviews' && path[2] && method === 'DELETE') {
    const { error } = await requireAdmin(request);
    if (error) return error;
    await db.collection('reviews').deleteOne({ id: path[2] });
    return json({ ok: true });
  }

  return json({ error: 'Ruta no encontrada' }, 404);
}

async function handler(request, { params }) {
  try {
    const path = (params?.path || []).filter(Boolean);
    const method = request.method;
    return await route(request, method, path);
  } catch (e) {
    console.error('API error:', e);
    return json({ error: e.message || 'Error interno' }, 500);
  }
}

export const GET = handler;
export const POST = handler;
export const PUT = handler;
export const DELETE = handler;
export const OPTIONS = async () =>
  new NextResponse(null, {
    status: 204,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET,POST,PUT,DELETE,OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type,Authorization',
    },
  });
