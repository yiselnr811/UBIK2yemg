import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';

const MONGO_URL = process.env.MONGO_URL;
const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';
const JWT_SECRET = process.env.JWT_SECRET || 'dev_secret';

let _client = null;
async function getDb() {
  if (!_client) {
    _client = new MongoClient(MONGO_URL);
    await _client.connect();
  }
  return _client.db(DB_NAME);
}

const CATEGORIES = [
  { id: 'comida', name: 'Comida y Bebidas', icon: '🍴' },
  { id: 'artesania', name: 'Artesanía', icon: '🎨' },
  { id: 'moda', name: 'Ropa y Moda', icon: '👕' },
  { id: 'tecnologia', name: 'Tecnología', icon: '💻' },
  { id: 'servicios', name: 'Servicios', icon: '🛠️' },
  { id: 'belleza', name: 'Belleza', icon: '💄' },
  { id: 'hogar', name: 'Hogar', icon: '🏠' },
  { id: 'vehiculos', name: 'Vehículos', icon: '🚗' },
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
      updatedAt: new Date().toISOString(),
    };
    await db.collection('settings').insertOne(s);
  }
  return s;
}

// ROUTER
async function route(request, method, path) {
  const db = await getDb();
  const url = new URL(request.url);

  // Health
  if (path.length === 0) {
    return json({ ok: true, app: 'UBIK2 YEMG API', version: '1.0' });
  }

  // Categories
  if (path[0] === 'categories' && method === 'GET') {
    return json({ categories: CATEGORIES });
  }

  // Stats
  if (path[0] === 'stats' && method === 'GET') {
    const productsCount = await db.collection('products').countDocuments();
    const businessesCount = await db.collection('businesses').countDocuments();
    const usersCount = await db.collection('users').countDocuments();
    return json({ productsCount, businessesCount, usersCount });
  }

  // ===== AUTH =====
  if (path[0] === 'auth') {
    if (path[1] === 'register' && method === 'POST') {
      const body = await request.json();
      const { email, password, businessName, whatsapp, location, description, logo, instagram, facebook } = body || {};
      if (!email || !password || !businessName || !whatsapp) {
        return json({ error: 'Faltan campos obligatorios' }, 400);
      }
      const existing = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (existing) return json({ error: 'El email ya está registrado' }, 400);

      const hashed = await bcrypt.hash(password, 10);
      const userId = uuidv4();
      const businessId = uuidv4();
      const now = new Date().toISOString();

      const business = {
        id: businessId,
        userId,
        name: businessName,
        logo: logo || '',
        description: description || '',
        whatsapp,
        location: location || '',
        instagram: instagram || '',
        facebook: facebook || '',
        createdAt: now,
      };
      const user = {
        id: userId,
        email: email.toLowerCase(),
        password: hashed,
        role: 'user',
        businessId,
        plan: 'basico',
        planExpiresAt: null,
        createdAt: now,
      };
      await db.collection('users').insertOne(user);
      await db.collection('businesses').insertOne(business);

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
      const business = await db.collection('businesses').findOne({ id: user.businessId });
      const { password: _, ...userOut } = user;
      return json({ user: userOut, business });
    }

    if (path[1] === 'forgot' && method === 'POST') {
      const body = await request.json();
      const { email } = body || {};
      if (!email) return json({ error: 'Email requerido' }, 400);
      const u = await db.collection('users').findOne({ email: email.toLowerCase() });
      if (!u) return json({ error: 'Email no registrado' }, 404);
      const resetToken = uuidv4().replace(/-/g, '').slice(0, 24);
      const resetExpires = new Date(Date.now() + 30 * 60 * 1000).toISOString();
      await db.collection('users').updateOne({ id: u.id }, { $set: { resetToken, resetExpires } });
      // MVP: returning token in response (in prod, send via email)
      return json({ message: 'Token de recuperación generado', resetToken, expiresAt: resetExpires });
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
      const allowed = ['name', 'logo', 'description', 'whatsapp', 'location', 'instagram', 'facebook'];
      const update = {};
      for (const k of allowed) if (k in body) update[k] = body[k];
      await db.collection('businesses').updateOne({ id: path[1] }, { $set: update });
      const updated = await db.collection('businesses').findOne({ id: path[1] });
      return json({ business: updated });
    }
  }

  // ===== PRODUCTS =====
  if (path[0] === 'products') {
    if (!path[1] && method === 'GET') {
      const q = url.searchParams.get('q') || '';
      const category = url.searchParams.get('category') || '';
      const featured = url.searchParams.get('featured');
      const businessId = url.searchParams.get('businessId') || '';
      const filter = { available: true };
      if (q) filter.$or = [
        { name: { $regex: q, $options: 'i' } },
        { description: { $regex: q, $options: 'i' } },
      ];
      if (category) filter.category = category;
      if (featured === 'true') filter.featured = true;
      if (businessId) filter.businessId = businessId;
      const items = await db.collection('products').find(filter).sort({ featured: -1, createdAt: -1 }).limit(60).toArray();
      // attach business info
      const bizIds = [...new Set(items.map((p) => p.businessId))];
      const businesses = await db.collection('businesses').find({ id: { $in: bizIds } }).toArray();
      const bizMap = Object.fromEntries(businesses.map((b) => [b.id, b]));
      const enriched = items.map((p) => ({ ...p, business: bizMap[p.businessId] || null }));
      return json({ products: enriched });
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
      const { name, price, description, category, stock, image, available, featured } = body || {};
      if (!name || price == null || !category) return json({ error: 'Faltan campos obligatorios' }, 400);

      const count = await db.collection('products').countDocuments({ businessId: user.businessId });
      const isPremium = user.plan === 'premium';
      if (!isPremium && count >= 10) {
        return json({ error: 'Límite del plan Básico (10 productos) alcanzado. Actualiza a Premium.' }, 403);
      }
      const product = {
        id: uuidv4(),
        businessId: user.businessId,
        name,
        price: Number(price),
        description: description || '',
        category,
        stock: stock != null ? Number(stock) : 0,
        image: image || '',
        available: available !== false,
        featured: isPremium ? !!featured : false,
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
      const allowed = ['name', 'price', 'description', 'category', 'stock', 'image', 'available', 'featured'];
      const update = {};
      for (const k of allowed) if (k in body) update[k] = body[k];
      if (update.price != null) update.price = Number(update.price);
      if (update.stock != null) update.stock = Number(update.stock);
      if (update.featured && user.plan !== 'premium' && user.role !== 'admin') update.featured = false;
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
    // safe to call multiple times - only seeds when empty
    const existing = await db.collection('products').countDocuments();
    // ensure settings + admin user exist regardless
    await getSettings(db);
    let adminExists = await db.collection('users').findOne({ email: 'admin@ubik2.com' });
    if (!adminExists) {
      const adminId = uuidv4();
      const adminBizId = uuidv4();
      await db.collection('businesses').insertOne({
        id: adminBizId, userId: adminId, name: 'UBIK2 YEMG Admin', logo: '', description: 'Administración',
        whatsapp: '+5350000000', location: 'Cuba', instagram: '', facebook: '', createdAt: new Date().toISOString(),
      });
      await db.collection('users').insertOne({
        id: adminId, email: 'admin@ubik2.com', password: await bcrypt.hash('admin123', 10),
        role: 'admin', businessId: adminBizId, plan: 'premium', planExpiresAt: null,
        createdAt: new Date().toISOString(),
      });
    }
    if (existing > 0) return json({ message: 'Ya hay datos cargados', count: existing, adminCreated: !adminExists });

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
      { biz: 0, name: 'Ropa Vieja Tradicional', price: 8, image: 'https://images.unsplash.com/photo-1544025162-d76694265947?w=600&q=80', category: 'comida', description: 'Plato típico cubano con ternera deshebrada en salsa criolla', stock: 20, featured: true },
      { biz: 0, name: 'Moros y Cristianos', price: 5, image: 'https://images.unsplash.com/photo-1546069901-ba9599a7e63c?w=600&q=80', category: 'comida', description: 'Arroz con frijoles negros, sabor de Cuba', stock: 30 },
      { biz: 0, name: 'Mojito Cubano', price: 4, image: 'https://images.unsplash.com/photo-1551538827-9c037cb4f32a?w=600&q=80', category: 'comida', description: 'El mojito original, con hierbabuena fresca', stock: 100, featured: true },
      { biz: 0, name: 'Lechón Asado', price: 12, image: 'https://images.unsplash.com/photo-1529692236671-f1f6cf9683ba?w=600&q=80', category: 'comida', description: 'Lechón asado al estilo cubano para 4 personas', stock: 5 },
      // Artesanía
      { biz: 1, name: 'Sombrero de Yarey', price: 25, image: 'https://images.unsplash.com/photo-1521369909029-2afed882baee?w=600&q=80', category: 'artesania', description: 'Sombrero tejido a mano con yarey natural', stock: 15, featured: true },
      { biz: 1, name: 'Bolso de Henequén', price: 35, image: 'https://images.unsplash.com/photo-1591561954557-26941169b49e?w=600&q=80', category: 'artesania', description: 'Bolso artesanal hecho con fibra de henequén', stock: 10 },
      { biz: 1, name: 'Tabaco Cubano (Caja)', price: 80, image: 'https://images.unsplash.com/photo-1574870111867-089730e5a72b?w=600&q=80', category: 'artesania', description: 'Caja de 10 puros premium cubanos', stock: 8 },
      // Moda
      { biz: 2, name: 'Guayabera Clásica', price: 45, image: 'https://images.unsplash.com/photo-1602810318383-e386cc2a3ccf?w=600&q=80', category: 'moda', description: 'Guayabera de lino, ideal para cualquier ocasión', stock: 25, featured: true },
      { biz: 2, name: 'Vestido Tropical', price: 38, image: 'https://images.unsplash.com/photo-1496747611176-843222e1e57c?w=600&q=80', category: 'moda', description: 'Vestido fresco con estampado caribeño', stock: 18 },
      { biz: 2, name: 'Sandalias de Cuero', price: 28, image: 'https://images.unsplash.com/photo-1603487742131-4160ec999306?w=600&q=80', category: 'moda', description: 'Sandalias hechas a mano en cuero genuino', stock: 22 },
      // Tecnología
      { biz: 3, name: 'Cargador Inalámbrico', price: 22, image: 'https://images.unsplash.com/photo-1583394838336-acd977736f90?w=600&q=80', category: 'tecnologia', description: 'Cargador rápido 15W compatible con todos los móviles', stock: 40 },
      { biz: 3, name: 'Auriculares Bluetooth', price: 35, image: 'https://images.unsplash.com/photo-1505740420928-5e560c06d30e?w=600&q=80', category: 'tecnologia', description: 'Sonido envolvente, batería 24h', stock: 30, featured: true },
      { biz: 3, name: 'Reparación de Móviles', price: 15, image: 'https://images.unsplash.com/photo-1512054502232-10a0a035d672?w=600&q=80', category: 'servicios', description: 'Servicio profesional de reparación', stock: 99 },
      // Belleza
      { biz: 4, name: 'Aceite de Coco Natural', price: 12, image: 'https://images.unsplash.com/photo-1608571423902-eed4a5ad8108?w=600&q=80', category: 'belleza', description: 'Aceite 100% natural para piel y cabello', stock: 50 },
      { biz: 4, name: 'Jabón Artesanal', price: 5, image: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&q=80', category: 'belleza', description: 'Jabón natural con miel y leche de cabra', stock: 80 },
      { biz: 4, name: 'Mascarilla Facial', price: 8, image: 'https://images.unsplash.com/photo-1556228453-efd6c1ff04f6?w=600&q=80', category: 'belleza', description: 'Mascarilla hidratante con aloe y vitamina E', stock: 60, featured: true },
    ].map((p) => ({
      id: uuidv4(),
      businessId: businessesSeed[p.biz].id,
      name: p.name,
      price: p.price,
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
    return json({
      usdcWallet: s.usdcWallet,
      usdcNetwork: s.usdcNetwork,
      transfermovilNumber: s.transfermovilNumber,
      transfermovilName: s.transfermovilName,
      premiumPriceUSD: s.premiumPriceUSD,
    });
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
      const allowed = ['usdcWallet', 'usdcNetwork', 'transfermovilNumber', 'transfermovilName', 'premiumPriceUSD'];
      const update = { updatedAt: new Date().toISOString() };
      for (const k of allowed) if (k in body) update[k] = body[k];
      await db.collection('settings').updateOne({ id: 'global' }, { $set: update }, { upsert: true });
      const s = await db.collection('settings').findOne({ id: 'global' });
      return json({ settings: s });
    }

    if (path[1] === 'payments' && method === 'GET') {
      const status = url.searchParams.get('status');
      const filter = status ? { status } : {};
      const items = await db.collection('payments').find(filter).sort({ createdAt: -1 }).limit(100).toArray();
      const uids = [...new Set(items.map((p) => p.userId))];
      const users = await db.collection('users').find({ id: { $in: uids } }).toArray();
      const businesses = await db.collection('businesses').find({ id: { $in: items.map((p) => p.businessId) } }).toArray();
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
      const users = await db.collection('users').find({}).sort({ createdAt: -1 }).limit(200).toArray();
      const out = users.map(({ password, ...u }) => u);
      const bizs = await db.collection('businesses').find({ id: { $in: out.map((u) => u.businessId) } }).toArray();
      const bm = Object.fromEntries(bizs.map((b) => [b.id, b]));
      return json({ users: out.map((u) => ({ ...u, business: bm[u.businessId] || null })) });
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

    if (path[1] === 'products' && method === 'GET') {
      const items = await db.collection('products').find({}).sort({ createdAt: -1 }).limit(200).toArray();
      const bizs = await db.collection('businesses').find({}).toArray();
      const bm = Object.fromEntries(bizs.map((b) => [b.id, b]));
      return json({ products: items.map((p) => ({ ...p, business: bm[p.businessId] || null })) });
    }

    if (path[1] === 'products' && path[2] && method === 'DELETE') {
      await db.collection('products').deleteOne({ id: path[2] });
      return json({ ok: true });
    }
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
