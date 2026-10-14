import { NextResponse } from 'next/server';
import { MongoClient } from 'mongodb';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { v4 as uuidv4 } from 'uuid';
import { Resend } from 'resend';
import { v2 as cloudinary } from 'cloudinary';
import { z } from 'zod';

import { verifyCryptoInvoice, verifyPendingInvoices } from '@/lib/crypto-verify';

// Defensive: an undefined MONGO_URL makes the Mongo driver throw the cryptic
// "Cannot read properties of undefined (reading 'startsWith')". Fallback + warn.
const MONGO_URL = process.env.MONGO_URL || 'mongodb://localhost:27017';
if (!process.env.MONGO_URL) {
  console.warn('[Config] MONGO_URL no está definida en las variables de entorno. Usando mongodb://localhost:27017 como respaldo.');
}
const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';
// JWT_SECRET es obligatorio en producción. Sin fallback inseguro.
const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  console.error('[Config] JWT_SECRET no está definida. La autenticación fallará.');
}
const RESEND_API_KEY = process.env.RESEND_API_KEY;
const RESEND_FROM_EMAIL = process.env.RESEND_FROM_EMAIL || 'onboarding@resend.dev';
const RESEND_FROM_NAME = process.env.RESEND_FROM_NAME || 'UBIK2 YEMG';
// BASE_URL: validate it's a proper absolute URL
let BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';
try {
  const u = new URL(BASE_URL);
  BASE_URL = u.origin; // strip any path
} catch {
  console.warn('[Config] NEXT_PUBLIC_BASE_URL inválido, usando default');
  BASE_URL = 'http://localhost:3000';
}

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

// ===== CRYPTO PAYMENTS CONFIG (Self-custody wallets) =====
// Token contracts (mainnet verified)
const CRYPTO_TOKEN_CONTRACTS = {
  TRC20_USDT: 'TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t',
  ERC20_USDT: '0xdAC17F958D2ee523a2206206994597C13D831ec7',
  ERC20_USDC: '0xA0b86991c6218b36c1d19d4a2e9eb0ce3606eb48',
  POLYGON_USDT: '0xc2132D05D31c914a87C6611C10748AEb04B58e8F',
  POLYGON_USDC: '0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174',
  BASE_USDT: '0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2',
  BASE_USDC: '0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913',
  ARBITRUM_USDT: '0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9',
  ARBITRUM_USDC: '0xaf88d065e77c8cC2239327C5EDb3A432268e5831',
};

const CRYPTO_DECIMALS = {
  USDT: 6,
  USDC: 6,
};

const CRYPTO_MIN_CONFIRMATIONS = {
  TRC20: 1,
  ERC20: 12,
  POLYGON: 20,
  BASE: 2,
  ARBITRUM: 20,
};

// Parse enabled networks from env
function getEnabledCryptoNetworks() {
  const env = process.env.CRYPTO_ENABLED_NETWORKS || '';
  const enabled = env.split(',').map(s => s.trim()).filter(Boolean);
  const networks = [];
  for (const key of enabled) {
    const [network, currency] = key.split('_');
    if (!network || !currency) continue;
    const contractKey = `${network}_${currency}`;
    const contract = CRYPTO_TOKEN_CONTRACTS[contractKey];
    const receiverEnvKey = `CRYPTO_WALLET_${contractKey}`;
    const receiverAddress = process.env[receiverEnvKey];
    if (!contract || !receiverAddress) {
      console.warn(`[Crypto] Config incompleta para ${key}: contract=${!!contract}, wallet=${!!receiverAddress}`);
      continue;
    }
    networks.push({
      key,
      network,
      currency,
      contract,
      decimals: CRYPTO_DECIMALS[currency] || 6,
      receiverAddress,
      minConfirmations: CRYPTO_MIN_CONFIRMATIONS[network] || 1,
      label: `${currency} (${network === 'TRC20' ? 'Tron' : network})`,
    });
  }
  return networks;
}

function getCryptoConfig() {
  const networks = getEnabledCryptoNetworks();
  return {
    enabled: networks,
    expiryMinutes: Number(process.env.CRYPTO_INVOICE_EXPIRY_MINUTES) || 30,
    underpayTolerancePct: Number(process.env.CRYPTO_UNDERPAY_TOLERANCE_PCT) || 0.5,
    overpayTolerancePct: Number(process.env.CRYPTO_OVERPAY_TOLERANCE_PCT) || 5,
  };
}

function normalizeTxHash(txHash) {
  if (!txHash) return '';
  return txHash.toLowerCase().replace(/^0x/, '');
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

// ===== RATE LIMITING (in-memory, per-IP) =====
const rateLimitMap = new Map();
function rateLimit(ip, key, maxRequests = 10, windowMs = 60000) {
  const now = Date.now();
  const mapKey = `${ip}:${key}`;
  const entry = rateLimitMap.get(mapKey);
  if (!entry || now - entry.windowStart > windowMs) {
    rateLimitMap.set(mapKey, { count: 1, windowStart: now });
    return { allowed: true, remaining: maxRequests - 1 };
  }
  if (entry.count >= maxRequests) {
    return { allowed: false, remaining: 0, retryAfter: Math.ceil((entry.windowStart + windowMs - now) / 1000) };
  }
  entry.count++;
  return { allowed: true, remaining: maxRequests - entry.count };
}
function getClientIP(request) {
  return request.headers.get('x-forwarded-for')?.split(',')[0]?.trim()
    || request.headers.get('x-real-ip')
    || 'unknown';
}

// ===== ZOD SCHEMAS =====
const registerSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
  accountType: z.enum(['buyer', 'seller']).default('buyer'),
  name: z.string().min(1).max(100).optional(),
  businessName: z.string().min(1).max(100).optional(),
  whatsapp: z.string().min(8).max(20).optional(),
  location: z.string().max(200).optional(),
  description: z.string().max(1000).optional(),
  logo: z.string().url().or(z.string().startsWith('data:')).optional(),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  businessType: z.string().max(50).optional(),
  country: z.string().max(50).optional(),
});

const loginSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
  password: z.string().min(1).max(128),
});

const forgotSchema = z.object({
  email: z.string().email('Email inválido').toLowerCase(),
});

const resetSchema = z.object({
  token: z.string().min(10).max(100),
  password: z.string().min(8, 'Mínimo 8 caracteres').max(128),
});

const productSchema = z.object({
  name: z.string().min(1).max(200),
  price: z.number().positive().or(z.string().regex(/^\d+(\.\d+)?$/).transform(Number)),
  description: z.string().max(5000).optional(),
  category: z.string().min(1).max(50),
  subcategory: z.string().max(50).optional(),
  stock: z.number().int().min(0).optional(),
  image: z.string().url().or(z.string().startsWith('data:')).optional(),
  available: z.boolean().optional(),
  featured: z.boolean().optional(),
  location: z.string().max(200).optional(),
  currency: z.enum(['CUP','MLC','USD','EUR','GBP','CAD','MXN','USDT','USDC']).default('CUP'),
  showPublicContact: z.boolean().optional(),
  province: z.string().max(100).optional(),
  municipality: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  openingHours: z.string().max(50).optional(),
  closingHours: z.string().max(50).optional(),
});

const businessSchema = z.object({
  name: z.string().min(1).max(100),
  logo: z.string().url().or(z.string().startsWith('data:')).optional(),
  description: z.string().max(1000).optional(),
  whatsapp: z.string().min(8).max(20),
  telegram: z.string().max(100).optional(),
  sms: z.string().max(20).optional(),
  location: z.string().max(200).optional(),
  instagram: z.string().max(100).optional(),
  facebook: z.string().max(100).optional(),
  businessType: z.string().max(50).optional(),
  country: z.string().max(50).optional(),
  showContactsPublicly: z.boolean().optional(),
  province: z.string().max(100).optional(),
  municipality: z.string().max(100).optional(),
  address: z.string().max(300).optional(),
  openingHours: z.string().max(50).optional(),
  closingHours: z.string().max(50).optional(),
});

const subscriptionSchema = z.object({
  plan: z.enum(['basico', 'premium']),
  paymentMethod: z.enum(['usdc', 'transfermovil']).default('usdc'),
  reference: z.string().max(200).optional(),
  screenshot: z.string().url().optional(),
});

const settingsSchema = z.object({
  usdcWallet: z.string().max(100).optional(),
  usdcNetwork: z.string().max(50).optional(),
  transfermovilNumber: z.string().max(20).optional(),
  transfermovilName: z.string().max(100).optional(),
  premiumPriceUSD: z.number().min(0).optional(),
  premiumPriceCUP: z.number().min(0).optional(),
  plansEnabled: z.boolean().optional(),
  contactPhone: z.string().max(30).optional(),
  contactEmail: z.string().email().optional(),
  usdRate: z.number().min(0.01).max(10000).optional(), // CUP per USD
});

// ===== ORDER SCHEMAS =====
const orderItemSchema = z.object({
  productId: z.string().min(1),
  quantity: z.number().int().positive(),
});

const createOrderSchema = z.object({
  items: z.array(orderItemSchema).min(1, 'Al menos un producto requerido'),
  shippingName: z.string().min(1).max(100),
  shippingPhone: z.string().min(8).max(20),
  shippingAddress: z.string().min(5).max(500),
  shippingNotes: z.string().max(1000).optional(),
  idempotencyKey: z.string().min(10).max(100).optional(), // for duplicate prevention
});

const updateOrderStatusSchema = z.object({
  status: z.enum(['pending_payment', 'paid', 'processing', 'shipped', 'delivered', 'cancelled', 'payment_failed']),
  trackingNumber: z.string().max(100).optional(),
  trackingCarrier: z.string().max(50).optional(),
  adminNotes: z.string().max(1000).optional(),
});

// ===== CRYPTO INVOICE SCHEMAS =====
const createOrderCryptoSchema = createOrderSchema.extend({
  shippingPhone: z.string().min(1).max(20),
  paymentMethod: z.literal('crypto'),
  cryptoCurrency: z.enum(['USDT', 'USDC']),
  cryptoNetwork: z.enum(['TRC20', 'ERC20', 'POLYGON', 'BASE', 'ARBITRUM']),
});

const submitTxSchema = z.object({
  txHash: z.string().min(32).max(130), // hex with or without 0x
});

const approveInvoiceSchema = z.object({
  notes: z.string().max(1000).optional(),
});

const rejectInvoiceSchema = z.object({
  reason: z.string().min(1).max(1000),
});

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

// ===== EMAIL TEMPLATE HELPERS =====
function emailWrapper({ title, preheader, content, footerNote }) {
  const year = new Date().getFullYear();
  return `<!DOCTYPE html>
<html lang="es">
<head><meta charset="UTF-8"><meta name="viewport" content="width=device-width,initial-scale=1.0"><title>${title}</title></head>
<body style="margin:0;padding:0;background:#f4f6f9;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;">
  <div style="display:none;max-height:0;overflow:hidden;color:transparent;">${preheader}</div>
  <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="background:#f4f6f9;padding:32px 16px;">
    <tr><td align="center">
      <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="max-width:560px;background:#ffffff;border-radius:14px;overflow:hidden;box-shadow:0 1px 4px rgba(0,0,0,0.05);">
        <tr><td style="background:linear-gradient(135deg,#1565C0 0%,#00A86B 100%);padding:28px 24px;text-align:center;color:#ffffff;">
          <div style="font-size:22px;font-weight:800;letter-spacing:0.5px;">UBIK2 YEMG</div>
          <div style="font-size:13px;opacity:0.9;margin-top:4px;">Marketplace para MiPymes cubanas</div>
        </td></tr>
        <tr><td style="padding:32px 28px 8px;color:#111827;">
          ${content}
        </td></tr>
        ${footerNote ? `<tr><td style="padding:0 28px 24px;color:#6b7280;font-size:12px;line-height:18px;">${footerNote}</td></tr>` : ''}
        <tr><td style="padding:18px 28px;background:#f9fafb;border-top:1px solid #e5e7eb;text-align:center;color:#9ca3af;font-size:12px;">
          © ${year} UBIK2 YEMG · Marketplace cubano de MiPymes
        </td></tr>
      </table>
    </td></tr>
  </table>
</body></html>`;
}

function orderItemsHtml(items) {
  return items.map((item) => `
    <tr>
      <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;">
        <div style="font-weight:600;color:#111827;">${item.productName}</div>
        <div style="font-size:13px;color:#6b7280;">${item.quantity} × ${Number(item.unitPrice).toLocaleString('es-ES')} ${item.currency}</div>
      </td>
      <td style="padding:12px 8px;border-bottom:1px solid #e5e7eb;text-align:right;color:#111827;font-weight:600;">
        ${Number(item.lineTotal).toLocaleString('es-ES')} ${item.currency}
      </td>
    </tr>
  `).join('');
}

function shippingHtml(shipping) {
  if (!shipping) return '';
  return `
    <div style="margin-top:24px;padding:16px;background:#f9fafb;border-radius:8px;">
      <div style="font-weight:700;color:#111827;margin-bottom:8px;">📦 Dirección de envío</div>
      <div style="font-size:14px;color:#374151;line-height:20px;">
        <strong>${shipping.name}</strong><br/>
        ${shipping.phone}<br/>
        ${shipping.address}
        ${shipping.notes ? `<br/><em>Notas: ${shipping.notes}</em>` : ''}
      </div>
    </div>
  `;
}

// ===== TRANSACTIONAL EMAILS =====

// 1. Order Confirmation (created, pending_payment)
async function sendOrderConfirmationEmail(toEmail, name, order) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY no configurado, omitiendo envío real');
    return { skipped: true };
  }
  const safeName = (name || '').toString().split(' ')[0] || 'usuario';
  const orderUrl = `${BASE_URL}/?order=${order.id}`;
  const itemsHtml = orderItemsHtml(order.items);
  const shipping = shippingHtml(order.shipping);

  const content = `
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">Hola ${safeName} 👋</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#374151;">
      Gracias por tu pedido <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> en <strong>${order.businessName}</strong>.
      Lo hemos recibido y está <span style="color:#1565C0;font-weight:600;">pendiente de pago</span>.
    </p>
    <table role="presentation" width="100%" cellspacing="0" cellpadding="0" border="0" style="border:1px solid #e5e7eb;border-radius:8px;overflow:hidden;">
      <thead>
        <tr style="background:#f9fafb;">
          <th style="padding:12px 8px;text-align:left;color:#374151;font-weight:600;font-size:13px;">Producto</th>
          <th style="padding:12px 8px;text-align:right;color:#374151;font-weight:600;font-size:13px;">Total</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
      <tfoot>
        <tr style="background:#f9fafb;">
          <td style="padding:12px 8px;text-align:left;color:#111827;font-weight:700;font-size:15px;">Total</td>
          <td style="padding:12px 8px;text-align:right;color:#111827;font-weight:700;font-size:15px;">${Number(order.total).toLocaleString('es-ES')} ${order.currency}</td>
        </tr>
      </tfoot>
    </table>
    ${shipping}
    <div style="margin-top:24px;text-align:center;">
      <a href="${orderUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#1565C0;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;">
        Ver mi pedido
      </a>
    </div>
    <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6b7280;">
      Para completar tu compra, realiza el pago usando la opción de criptomonedas (USDT, USDC, XLM) desde la página del pedido.
      El pedido se mantendrá reservado por 30 minutos.
    </p>
  `;

  const html = emailWrapper({
    title: `Pedido confirmado #${order.id.slice(0, 8)}`,
    preheader: `Tu pedido en ${order.businessName} por ${Number(order.total).toLocaleString('es-ES')} ${order.currency} está pendiente de pago.`,
    content,
    footerNote: 'Si no realizaste este pedido, por favor contacta a soporte.',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [toEmail],
      subject: `✅ Pedido confirmado #${order.id.slice(0, 8).toUpperCase()} - ${order.businessName}`,
      html,
    });
    if (error) {
      console.error('[Resend] error enviando confirmación de pedido:', error);
      return { error };
    }
    console.log('[Resend] confirmación de pedido enviada:', data?.id);
    return { data };
  } catch (e) {
    console.error('[Resend] excepción enviando confirmación:', e?.message || e);
    return { error: e };
  }
}

// 2. Payment Confirmed (webhook detects 'finished')
async function sendPaymentConfirmedEmail(toEmail, name, order, paymentRef) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY no configurado, omitiendo envío real');
    return { skipped: true };
  }
  const safeName = (name || '').toString().split(' ')[0] || 'usuario';
  const orderUrl = `${BASE_URL}/?order=${order.id}`;
  const cryptoInfo = paymentRef ? `
    <div style="margin-top:16px;padding:12px;background:#f0fdf4;border:1px solid #bbf7d0;border-radius:8px;">
      <div style="font-weight:600;color:#166534;">💎 Pago con ${paymentRef.payCurrency?.toUpperCase() || 'cripto'}</div>
      <div style="font-size:13px;color:#166534;margin-top:4px;">
        Monto: ${paymentRef.payAmount} ${paymentRef.payCurrency?.toUpperCase()}<br/>
        ${paymentRef.payNetwork ? `Red: ${paymentRef.payNetwork}` : ''}
        ${paymentRef.payinExtraId ? `<br/>Memo/Tag: ${paymentRef.payinExtraId}` : ''}
      </div>
    </div>
  ` : '';

  const content = `
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">Hola ${safeName} 🎉</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#374151;">
      ¡Excelente noticia! Tu pago para el pedido <strong>#${order.id.slice(0, 8).toUpperCase()}</strong>
      ha sido <span style="color:#166534;font-weight:700;">confirmado</span>.
    </p>
    ${cryptoInfo}
    <p style="margin:16px 0 0;font-size:15px;line-height:22px;color:#374151;">
      El vendedor (<strong>${order.businessName}</strong>) ya ha sido notificado y comenzará a preparar tu pedido.
      Te avisaremos cuando esté en camino.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${orderUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#166534;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;">
        Ver estado del pedido
      </a>
    </div>
  `;

  const html = emailWrapper({
    title: `Pago confirmado #${order.id.slice(0, 8)}`,
    preheader: `Tu pago para el pedido #${order.id.slice(0, 8)} en ${order.businessName} ha sido confirmado.`,
    content,
    footerNote: 'Guarda este correo como comprobante de pago.',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [toEmail],
      subject: `💎 Pago confirmado - Pedido #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    });
    if (error) {
      console.error('[Resend] error enviando pago confirmado:', error);
      return { error };
    }
    console.log('[Resend] pago confirmado enviado:', data?.id);
    return { data };
  } catch (e) {
    console.error('[Resend] excepción enviando pago confirmado:', e?.message || e);
    return { error: e };
  }
}

// 3. Order Shipped (admin marks shipped with tracking)
async function sendOrderShippedEmail(toEmail, name, order, tracking) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY no configurado, omitiendo envío real');
    return { skipped: true };
  }
  const safeName = (name || '').toString().split(' ')[0] || 'usuario';
  const orderUrl = `${BASE_URL}/?order=${order.id}`;
  const trackingHtml = tracking ? `
    <div style="margin-top:16px;padding:16px;background:#eff6ff;border:1px solid #bfdbfe;border-radius:8px;">
      <div style="font-weight:700;color:#1e40af;margin-bottom:8px;">📦 Tu pedido está en camino</div>
      <div style="font-size:14px;color:#1e40af;line-height:22px;">
        ${tracking.carrier ? `<strong>Transportista:</strong> ${tracking.carrier}<br/>` : ''}
        ${tracking.number ? `<strong>Número de seguimiento:</strong> ${tracking.number}` : ''}
      </div>
    </div>
  ` : '';

  const content = `
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">Hola ${safeName} 📦</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#374151;">
      Tu pedido <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> de <strong>${order.businessName}</strong>
      ha sido <span style="color:#1e40af;font-weight:700;">enviado</span>.
    </p>
    ${trackingHtml}
    <p style="margin:16px 0 0;font-size:15px;line-height:22px;color:#374151;">
      Puedes hacer seguimiento de tu envío desde la página del pedido.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${orderUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#1e40af;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;">
        Rastrear envío
      </a>
    </div>
  `;

  const html = emailWrapper({
    title: `Pedido enviado #${order.id.slice(0, 8)}`,
    preheader: `Tu pedido #${order.id.slice(0, 8)} de ${order.businessName} ha sido enviado.${tracking?.number ? ` Tracking: ${tracking.number}` : ''}`,
    content,
    footerNote: 'Si tienes dudas sobre la entrega, contacta al vendedor desde la página del pedido.',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [toEmail],
      subject: `📦 Pedido enviado #${order.id.slice(0, 8).toUpperCase()} - ${order.businessName}`,
      html,
    });
    if (error) {
      console.error('[Resend] error enviando envío:', error);
      return { error };
    }
    console.log('[Resend] envío confirmado:', data?.id);
    return { data };
  } catch (e) {
    console.error('[Resend] excepción enviando envío:', e?.message || e);
    return { error: e };
  }
}

// 4. Order Delivered (admin marks delivered)
async function sendOrderDeliveredEmail(toEmail, name, order) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY no configurado, omitiendo envío real');
    return { skipped: true };
  }
  const safeName = (name || '').toString().split(' ')[0] || 'usuario';
  const orderUrl = `${BASE_URL}/?order=${order.id}`;

  const content = `
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">Hola ${safeName} ✅</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#374151;">
      ¡Tu pedido <strong>#${order.id.slice(0, 8).toUpperCase()}</strong> de <strong>${order.businessName}</strong>
      ha sido <span style="color:#166534;font-weight:700;">entregado</span>!
    </p>
    <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#374151;">
      Esperamos que disfrutes tu compra. Tu opinión nos ayuda a mejorar.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${orderUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#166534;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;">
        Ver pedido y valorar
      </a>
    </div>
    <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6b7280;">
      ¿Todo bien? Deja una reseña para ayudar a otros compradores.
    </p>
  `;

  const html = emailWrapper({
    title: `Pedido entregado #${order.id.slice(0, 8)}`,
    preheader: `Tu pedido #${order.id.slice(0, 8)} de ${order.businessName} ha sido entregado.`,
    content,
    footerNote: 'Gracias por confiar en UBIK2 YEMG. ¡Vuelve pronto!',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [toEmail],
      subject: `✅ Pedido entregado #${order.id.slice(0, 8).toUpperCase()} - ${order.businessName}`,
      html,
    });
    if (error) {
      console.error('[Resend] error enviando entrega:', error);
      return { error };
    }
    console.log('[Resend] entrega confirmada:', data?.id);
    return { data };
  } catch (e) {
    console.error('[Resend] excepción enviando entrega:', e?.message || e);
    return { error: e };
  }
}

// 5. Payment Failed (webhook detects failed/expired)
async function sendPaymentFailedEmail(toEmail, name, order, reason) {
  if (!resend) {
    console.warn('[Resend] RESEND_API_KEY no configurado, omitiendo envío real');
    return { skipped: true };
  }
  const safeName = (name || '').toString().split(' ')[0] || 'usuario';
  const orderUrl = `${BASE_URL}/?order=${order.id}`;

  const content = `
    <h1 style="margin:0 0 12px;font-size:20px;font-weight:700;">Hola ${safeName} ⚠️</h1>
    <p style="margin:0 0 16px;font-size:15px;line-height:22px;color:#374151;">
      Lamentablemente, el pago para tu pedido <strong>#${order.id.slice(0, 8).toUpperCase()}</strong>
      de <strong>${order.businessName}</strong> <span style="color:#dc2626;font-weight:600;">no se pudo completar</span>.
    </p>
    ${reason ? `
    <div style="margin:16px 0;padding:12px;background:#fef2f2;border:1px solid #fecaca;border-radius:8px;">
      <div style="font-size:13px;color:#991b1b;"><strong>Motivo:</strong> ${reason}</div>
    </div>
    ` : ''}
    <p style="margin:16px 0 0;font-size:15px;line-height:22px;color:#374151;">
      El pedido ha sido <strong>cancelado</strong> y los productos devueltos al stock.
      Puedes crear un nuevo pedido cuando quieras.
    </p>
    <div style="margin-top:24px;text-align:center;">
      <a href="${orderUrl}" target="_blank" style="display:inline-block;padding:14px 28px;background:#dc2626;color:#ffffff;text-decoration:none;border-radius:9999px;font-weight:700;font-size:15px;">
        Ver detalles
      </a>
    </div>
    <p style="margin:24px 0 0;font-size:13px;line-height:20px;color:#6b7280;">
      Si crees que es un error, contacta a soporte respondiendo a este correo.
    </p>
  `;

  const html = emailWrapper({
    title: `Pago fallido #${order.id.slice(0, 8)}`,
    preheader: `El pago para tu pedido #${order.id.slice(0, 8)} en ${order.businessName} no se completó.`,
    content,
    footerNote: 'Los fondos no han sido cargados. Puedes reintentar el pago en un nuevo pedido.',
  });

  try {
    const { data, error } = await resend.emails.send({
      from: `${RESEND_FROM_NAME} <${RESEND_FROM_EMAIL}>`,
      to: [toEmail],
      subject: `⚠️ Pago no completado - Pedido #${order.id.slice(0, 8).toUpperCase()}`,
      html,
    });
    if (error) {
      console.error('[Resend] error enviando fallo de pago:', error);
      return { error };
    }
    console.log('[Resend] fallo de pago enviado:', data?.id);
    return { data };
  } catch (e) {
    console.error('[Resend] excepción enviando fallo de pago:', e?.message || e);
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
      // Orders
      db.collection('orders').createIndex({ id: 1 }, { unique: true }).catch(() => {}),
      db.collection('orders').createIndex({ buyerId: 1, createdAt: -1 }),
      db.collection('orders').createIndex({ businessId: 1, createdAt: -1 }),
      db.collection('orders').createIndex({ status: 1, createdAt: -1 }),
      db.collection('orders').createIndex({ idempotencyKey: 1 }, { unique: true, sparse: true }).catch(() => {}),
      // Crypto Invoices (own wallet payments)
      db.collection('crypto_invoices').createIndex({ id: 1 }, { unique: true }).catch(() => {}),
      db.collection('crypto_invoices').createIndex({ orderId: 1 }, { unique: true }).catch(() => {}),
      db.collection('crypto_invoices').createIndex({ txHashNormalized: 1 }, { unique: true, partialFilterExpression: { txHashNormalized: { $type: 'string' } } }).catch((err) => { console.error('[MongoDB] Error creando índice txHashNormalized:', err); throw err; }),
      db.collection('crypto_invoices').createIndex({ buyerId: 1, createdAt: -1 }),
      db.collection('crypto_invoices').createIndex({ businessId: 1, status: 1 }),
      db.collection('crypto_invoices').createIndex({ status: 1, expiresAt: 1 }),
    ]);
    _indexesEnsured = true;
    console.log('[MongoDB] Índices creados/verificados');

    // === One-time soft migration: backfill businessType + country on existing businesses ===
    // Only sets values where missing; safe to re-run.
    try {
      const m1 = await db.collection('businesses').updateMany(
        { businessType: { $exists: false } },
        { $set: { businessType: 'tienda' } },
      );
      const m2 = await db.collection('businesses').updateMany(
        { country: { $exists: false } },
        { $set: { country: 'Cuba' } },
      );
      if (m1.modifiedCount || m2.modifiedCount) {
        console.log(`[MongoDB] Backfill negocios: businessType=${m1.modifiedCount}, country=${m2.modifiedCount}`);
      }
    } catch (e) {
      console.warn('[MongoDB] Backfill negocios falló (no crítico):', e?.message);
    }
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
        console.error('[MongoDB] connect error:', err?.message || err);
        _client = null;
        _connectPromise = null;

        throw new Error(
          'No se pudo conectar a la base de datos. Verifica la variable de entorno MONGO_URL.'
        );
      });
    }

    await _connectPromise;
  }

  const db = _client.db(DB_NAME);

  if (!_indexesEnsured) {
    ensureIndexes(db).catch((err) => {
      console.warn(
        '[MongoDB] Error asegurando índices:',
        err?.message
      );
    });
  }

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
  { id: 'electronica', name: 'Electrónica', icon: '📱', children: [
    { id: 'smartphones', name: 'Smartphones' },
    { id: 'audio', name: 'Audio y sonido' },
    { id: 'tv-video', name: 'TV y video' },
    { id: 'consolas', name: 'Consolas y videojuegos' },
    { id: 'accesorios-electronica', name: 'Accesorios' },
  ]},
  { id: 'vehiculos', name: 'Vehículos y transporte', icon: '🚗', children: [
    { id: 'autos', name: 'Autos' },
    { id: 'motos', name: 'Motos' },
    { id: 'bicicletas', name: 'Bicicletas' },
    { id: 'repuestos', name: 'Repuestos y accesorios' },
    { id: 'camiones', name: 'Camiones y maquinaria' },
  ]},
  { id: 'juguetes', name: 'Juguetes', icon: '🧸', children: [
    { id: 'juguetes-ninos', name: 'Para niños' },
    { id: 'juguetes-ninas', name: 'Para niñas' },
    { id: 'didacticos', name: 'Didácticos' },
    { id: 'peluches', name: 'Peluches' },
  ]},
  { id: 'higiene', name: 'Higiene', icon: '🧼', children: [
    { id: 'higiene-personal', name: 'Personal' },
    { id: 'limpieza-hogar', name: 'Limpieza del hogar' },
    { id: 'cosmetica', name: 'Cosmética' },
  ]},
  { id: 'tecnologia', name: 'Tecnología', icon: '💻', children: [
    { id: 'computadoras', name: 'Computadoras' },
    { id: 'laptops', name: 'Laptops' },
    { id: 'tablets', name: 'Tablets' },
    { id: 'componentes', name: 'Componentes y partes' },
    { id: 'accesorios-tec', name: 'Accesorios' },
  ]},
  { id: 'hogar', name: 'Hogar', icon: '🏠', children: [
    { id: 'muebles', name: 'Muebles' },
    { id: 'decoracion', name: 'Decoración' },
    { id: 'electrodomesticos', name: 'Electrodomésticos' },
    { id: 'cocina', name: 'Cocina y vajilla' },
    { id: 'iluminacion', name: 'Iluminación' },
  ]},
  { id: 'herramientas', name: 'Herramientas', icon: '🔧', children: [
    { id: 'manuales', name: 'Manuales' },
    { id: 'electricas', name: 'Eléctricas' },
    { id: 'industriales', name: 'Industriales' },
    { id: 'jardineria', name: 'Jardinería' },
  ]},
  { id: 'mascotas', name: 'Mascotas', icon: '🐾', children: [
    { id: 'perros', name: 'Perros' },
    { id: 'gatos', name: 'Gatos' },
    { id: 'aves', name: 'Aves' },
    { id: 'accesorios-mascotas', name: 'Accesorios y alimentos' },
  ]},
  { id: 'salud', name: 'Salud', icon: '⚕️', children: [
    { id: 'medicamentos', name: 'Medicamentos' },
    { id: 'suplementos', name: 'Suplementos' },
    { id: 'equipos-medicos', name: 'Equipos médicos' },
  ]},
  { id: 'servicios', name: 'Servicios', icon: '🛠️', children: [
    { id: 'diseno', name: 'Diseño' },
    { id: 'marketing', name: 'Marketing' },
    { id: 'reparaciones-serv', name: 'Reparaciones' },
    { id: 'consultoria', name: 'Consultoría' },
    { id: 'eventos', name: 'Eventos y catering' },
    { id: 'transporte-serv', name: 'Transporte' },
  ]},
  { id: 'empleo', name: 'Empleo', icon: '💼', children: [
    { id: 'oferta-empleo', name: 'Ofertas de trabajo' },
    { id: 'busco-empleo', name: 'Busco empleo' },
    { id: 'freelance', name: 'Freelance / Por proyecto' },
  ]},
  { id: 'bienesraices', name: 'Bienes raíces', icon: '🏘️', children: [
    { id: 'venta-casas', name: 'Venta de casas' },
    { id: 'alquiler', name: 'Alquileres' },
    { id: 'terrenos', name: 'Terrenos' },
    { id: 'locales', name: 'Locales comerciales' },
  ]},
  { id: 'ropa', name: 'Ropa y accesorios', icon: '👕', children: [
    { id: 'mujer', name: 'Mujer' },
    { id: 'hombre', name: 'Hombre' },
    { id: 'ninos', name: 'Niños' },
    { id: 'calzado', name: 'Calzado' },
    { id: 'accesorios-ropa', name: 'Accesorios' },
  ]},
  { id: 'alimentos', name: 'Alimentos', icon: '🍴', children: [
    { id: 'restaurantes', name: 'Restaurantes' },
    { id: 'cafeterias', name: 'Cafeterías' },
    { id: 'comida-rapida', name: 'Comida rápida' },
    { id: 'reposteria', name: 'Repostería y panadería' },
    { id: 'productos-alimenticios', name: 'Productos alimenticios' },
  ]},
  { id: 'deportes', name: 'Deportes', icon: '⚽', children: [
    { id: 'futbol', name: 'Fútbol' },
    { id: 'baseball', name: 'Béisbol' },
    { id: 'gym', name: 'Gimnasio y fitness' },
    { id: 'outdoor', name: 'Aire libre' },
  ]},
  { id: 'educacion', name: 'Educación', icon: '📚', children: [
    { id: 'clases-particulares', name: 'Clases particulares' },
    { id: 'cursos', name: 'Cursos online' },
    { id: 'libros', name: 'Libros' },
    { id: 'idiomas', name: 'Idiomas' },
  ]},
  { id: 'reparaciones', name: 'Reparaciones', icon: '🔨', children: [
    { id: 'rep-electronica', name: 'Electrónica' },
    { id: 'rep-electrodomesticos', name: 'Electrodomésticos' },
    { id: 'rep-vehiculos', name: 'Vehículos' },
    { id: 'rep-hogar', name: 'Plomería / Electricidad' },
  ]},
  { id: 'turismo', name: 'Turismo', icon: '✈️', children: [
    { id: 'hospedaje', name: 'Hospedaje' },
    { id: 'tours', name: 'Tours y excursiones' },
    { id: 'transporte-turismo', name: 'Transporte turístico' },
  ]},
  { id: 'otros', name: 'Otros', icon: '📦', children: [] },
];

// Business types (visible on biz cards & filters; never required for legacy biz).
const BUSINESS_TYPES = [
  { id: 'tienda', name: 'Tienda física', icon: '🏬' },
  { id: 'online', name: 'Tienda online', icon: '🛒' },
  { id: 'servicio', name: 'Servicio profesional', icon: '🛠️' },
  { id: 'restaurante', name: 'Restaurante / Cafetería', icon: '🍴' },
  { id: 'mayorista', name: 'Mayorista', icon: '📦' },
  { id: 'particular', name: 'Particular / Persona', icon: '👤' },
];

// Allowed currencies (display labels only — no FX conversion in phase 1).
const CURRENCIES = [
  { id: 'CUP', name: 'CUP — Peso cubano', flag: '🇨🇺' },
  { id: 'MLC', name: 'MLC — Moneda libremente convertible', flag: '💳' },
  { id: 'USD', name: 'USD — Dólar', flag: '🇺🇸' },
  { id: 'EUR', name: 'EUR — Euro', flag: '🇪🇺' },
  { id: 'GBP', name: 'GBP — Libra', flag: '🇬🇧' },
  { id: 'CAD', name: 'CAD — Dólar canadiense', flag: '🇨🇦' },
  { id: 'MXN', name: 'MXN — Peso mexicano', flag: '🇲🇽' },
  { id: 'USDT', name: 'USDT — Tether (cripto)', flag: '💎' },
  { id: 'USDC', name: 'USDC — Dólar digital (cripto)', flag: '💠' },
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

function isConfiguredAdmin(user) {
  const configuredEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(configuredEmail && user?.email?.trim().toLowerCase() === configuredEmail);
}

async function requireUser(request) {
  const tok = getUserFromToken(request);
  if (!tok) return { error: json({ error: 'No autorizado' }, 401) };
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: tok.id });
  if (!user) return { error: json({ error: 'Usuario no encontrado' }, 401) };
  // ADMIN_EMAIL is a server-side allowlist; normal password authentication is still required.
  return { user: isConfiguredAdmin(user) ? { ...user, role: 'admin' } : user };
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
      usdRate: 120, // CUP per USD for crypto payment conversion
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
    return jsonCached({ categories: CATEGORIES, businessTypes: BUSINESS_TYPES, currencies: CURRENCIES }, 200, 3600);
  }

  // Stats
  if (path[0] === 'stats' && method === 'GET') {
    const [productsCount, businessesCount, usersCount, servicesCount, activeBusinessesAgg] = await Promise.all([
      db.collection('products').countDocuments({ available: true, $or: [{ stock: { $gt: 0 } }, { stock: { $exists: false } }] }),
      db.collection('businesses').countDocuments(),
      db.collection('users').countDocuments(),
      db.collection('products').countDocuments({ category: 'servicios', available: true }),
      db.collection('products').aggregate([
        { $match: { available: true, $or: [{ stock: { $gt: 0 } }, { stock: { $exists: false } }] } },
        { $group: { _id: '$businessId' } },
        { $count: 'n' },
      ]).toArray(),
    ]);
    const activeBusinessesCount = activeBusinessesAgg[0]?.n || 0;
    // Cache shorter (15s) so business/user/product counts feel near-real-time
    return jsonCached({ productsCount, businessesCount, usersCount, servicesCount, activeBusinessesCount }, 200, 15);
  }

  // ===== AUTH =====
  if (path[0] === 'auth') {
    if (path[1] === 'register' && method === 'POST') {
      const body = await request.json();
      const { email, password, accountType, name, businessName, whatsapp, location, description, logo, instagram, facebook, businessType, country } = body || {};
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
          businessType: businessType || 'tienda',
          country: country || 'Cuba',
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
      if (typeof email !== 'string' || !email.trim() || typeof password !== 'string' || !password) return json({ error: 'Email y contraseña requeridos' }, 400);
      const normalizedEmail = email.trim().toLowerCase();
      const user = await db.collection('users').findOne({ email: normalizedEmail });
      if (!user || typeof user.password !== 'string' || !user.password) return json({ error: 'Credenciales inválidas' }, 401);
      const ok = await bcrypt.compare(password, user.password);
      if (!ok) return json({ error: 'Credenciales inválidas' }, 401);
      const business = await db.collection('businesses').findOne({ id: user.businessId });
      const effectiveUser = isConfiguredAdmin(user) ? { ...user, role: 'admin' } : user;
      const token = jwt.sign({ id: effectiveUser.id, email: effectiveUser.email, role: effectiveUser.role }, JWT_SECRET, { expiresIn: '30d' });
      const { password: _, ...userOut } = effectiveUser;
      return json({ token, user: userOut, business });
    }

    if (path[1] === 'me' && method === 'GET') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const business = user.businessId ? await db.collection('businesses').findOne({ id: user.businessId }) : null;
      const effectiveUser = isConfiguredAdmin(user) ? { ...user, role: 'admin' } : user;
      const { password: _, ...userOut } = effectiveUser;
      return json({ user: userOut, business });
    }

    if (path[1] === 'upgrade-seller' && method === 'POST') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      if (user.businessId) return json({ error: 'Ya tienes un negocio' }, 400);
      const body = await request.json();
      // The upgrade form sends businessName but businessSchema requires name.
      const parsed = businessSchema.safeParse({ ...body, name: body?.name || body?.businessName });
      if (!parsed.success) {
        return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
      }
      const { name: businessName, whatsapp, location, description, logo, telegram, sms, instagram, facebook, businessType, country } = parsed.data;
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
        businessType: businessType || 'tienda', country: country || 'Cuba',
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
      // Rate limiting
      const ip = getClientIP(request);
      const rl = rateLimit(ip, 'reset', 5, 60000);
      if (!rl.allowed) return json({ error: 'Demasiados intentos. Intenta más tarde.', retryAfter: rl.retryAfter }, 429);

      const body = await request.json();
      const parsed = resetSchema.safeParse(body);
      if (!parsed.success) {
        return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
      }
      const { token: rt, password: newPassword } = parsed.data;
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
    // Helper: strip private contact fields when business has showContactsPublicly === false
    const sanitizeBusiness = (biz, viewerUser) => {
      if (!biz) return biz;
      const isOwner = viewerUser && (viewerUser.id === biz.userId || viewerUser.role === 'admin');
      if (biz.showContactsPublicly === false && !isOwner) {
        return { ...biz, whatsapp: '', telegram: '', sms: '', messenger: '', instagram: '', facebook: '', contactsHidden: true };
      }
      return biz;
    };
    if (path[1] && method === 'GET') {
      const business = await db.collection('businesses').findOne({ id: path[1] });
      if (!business) return json({ error: 'Negocio no encontrado' }, 404);
      const products = await db.collection('products').find({ businessId: path[1] }).sort({ createdAt: -1 }).toArray();
      // Try to identify viewer (optional auth) so owners still see their own contacts
      let viewer = null;
      try { const r = await requireUser(request); if (!r.error) viewer = r.user; } catch {}
      const safeBiz = sanitizeBusiness(business, viewer);
      // Also strip business field from products that include nested business contact info
      return json({ business: safeBiz, products });
    }

    // Public list endpoint — slim, cached. Powers home "Negocios destacados".
    if (!path[1] && method === 'GET') {
      const limit = Math.min(40, Math.max(1, parseInt(url.searchParams.get('limit') || '12', 10)));
      const country = url.searchParams.get('country') || '';
      const businessType = url.searchParams.get('businessType') || '';
      const verifiedOnly = url.searchParams.get('verified') === 'true';
      const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      // 1) First, find businesses that HAVE active products (with counts).
      const counts = await db.collection('products').aggregate([
        { $match: { available: true, $or: [{ stock: { $gt: 0 } }, { stock: { $exists: false } }] } },
        { $group: { _id: '$businessId', n: { $sum: 1 }, latest: { $max: '$createdAt' } } },
        { $sort: { n: -1, latest: -1 } },
        { $limit: limit * 3 },
      ]).toArray();
      const activeIds = counts.map((c) => c._id);
      const countMap = Object.fromEntries(counts.map((c) => [c._id, c.n]));
      if (activeIds.length === 0) {
        return jsonCached({ businesses: [], total: 0 }, 200, 30);
      }
      // 2) Then fetch the actual business docs filtered by country/type/verified.
      const f = { id: { $in: activeIds } };
      if (country) f.country = { $regex: escapeRe(country), $options: 'i' };
      if (businessType) f.businessType = businessType;
      if (verifiedOnly) f.verified = true;
      const docs = await db.collection('businesses')
        .find(f, { projection: { name: 1, logo: 1, description: 1, location: 1, country: 1, businessType: 1, verified: 1, id: 1, showContactsPublicly: 1, createdAt: 1 } })
        .toArray();
      // 3) Preserve aggregation ordering (most products first) + boost verified to top.
      const orderIndex = Object.fromEntries(activeIds.map((id, i) => [id, i]));
      docs.sort((a, b) => {
        if (a.verified !== b.verified) return a.verified ? -1 : 1;
        return (orderIndex[a.id] ?? 999) - (orderIndex[b.id] ?? 999);
      });
      const enriched = docs
        .map((b) => ({ ...b, productsCount: countMap[b.id] || 0 }))
        .slice(0, limit);
      return jsonCached({ businesses: enriched, total: enriched.length }, 200, 30);
    }

    if (path[1] && method === 'PUT') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const business = await db.collection('businesses').findOne({ id: path[1] });
      if (!business) return json({ error: 'No encontrado' }, 404);
      if (business.userId !== user.id && user.role !== 'admin') return json({ error: 'Sin permiso' }, 403);
      const body = await request.json();
      const allowed = ['name', 'logo', 'description', 'whatsapp', 'telegram', 'sms', 'location', 'instagram', 'facebook',
        'showContactsPublicly', 'province', 'municipality', 'address', 'openingHours', 'closingHours', 'messenger',
        'businessType', 'country'];
      const update = {};
      for (const k of allowed) if (k in body) update[k] = body[k];

      // Validation: if hiding contacts, require physical presence info
      const merged = { ...business, ...update };
      if (merged.showContactsPublicly === false) {
        const missing = [];
        if (!merged.province) missing.push('provincia');
        if (!merged.municipality) missing.push('municipio');
        if (!merged.address) missing.push('dirección');
        if (!merged.openingHours) missing.push('horario apertura');
        if (!merged.closingHours) missing.push('horario cierre');
        if (missing.length) {
          return json({
            error: `Si ocultas los contactos debes agregar dirección física y horarios. Faltan: ${missing.join(', ')}.`,
            missing,
          }, 400);
        }
      }

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
      const subcategory = url.searchParams.get('subcategory') || '';
      const featured = url.searchParams.get('featured');
      const excludeFeatured = url.searchParams.get('excludeFeatured') === 'true';
      const businessId = url.searchParams.get('businessId') || '';
      const businessName = url.searchParams.get('businessName') || '';
      const businessType = url.searchParams.get('businessType') || '';
      const country = url.searchParams.get('country') || '';
      const location = url.searchParams.get('location') || '';
      const province = url.searchParams.get('province') || '';
      const municipality = url.searchParams.get('municipality') || '';
      const physicalOnly = url.searchParams.get('physicalOnly') === 'true'; // only products with hidden contacts
      const priceMin = url.searchParams.get('priceMin');
      const priceMax = url.searchParams.get('priceMax');
      const currency = url.searchParams.get('currency') || '';
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
      // Escape regex special chars so users can search with parens, dots, dashes, etc.
      const escapeRe = (s) => String(s).replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
      if (q) {
        const safeQ = escapeRe(q.trim());
        filter.$or = [
          { name: { $regex: safeQ, $options: 'i' } },
          { description: { $regex: safeQ, $options: 'i' } },
          { category: { $regex: safeQ, $options: 'i' } },
        ];
      }
      if (category) filter.category = category;
      if (subcategory) filter.subcategory = subcategory;
      if (currency) filter.currency = currency;
      if (featured === 'true') filter.featured = true;
      if (excludeFeatured) filter.featured = { $ne: true };
      if (businessId) filter.businessId = businessId;
      // Filter by business name OR by business type / country (regex on businesses, then narrow by businessId)
      if (businessName || businessType || country) {
        const bizFilter = {};
        if (businessName) bizFilter.name = { $regex: escapeRe(businessName), $options: 'i' };
        if (businessType) bizFilter.businessType = businessType;
        if (country) bizFilter.country = { $regex: escapeRe(country), $options: 'i' };
        const matchingBiz = await db.collection('businesses')
          .find(bizFilter, { projection: { id: 1 } })
          .limit(500)
          .toArray();
        const ids = matchingBiz.map((b) => b.id);
        if (ids.length === 0) {
          return jsonCached({ products: [], total: 0, page, limit, hasMore: false }, 200, 30);
        }
        filter.businessId = filter.businessId
          ? (ids.includes(filter.businessId) ? filter.businessId : '__no_match__')
          : { $in: ids };
      }
      if (location) filter.location = { $regex: escapeRe(location), $options: 'i' };
      if (province) filter.$and.push({ $or: [{ province: { $regex: escapeRe(province), $options: 'i' } }, { location: { $regex: escapeRe(province), $options: 'i' } }] });
      if (municipality) filter.$and.push({ $or: [{ municipality: { $regex: escapeRe(municipality), $options: 'i' } }, { location: { $regex: escapeRe(municipality), $options: 'i' } }] });
      if (physicalOnly) filter.showPublicContact = false;
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
        // Strip private contacts when business opted out of public contacts
        let safe = b;
        if (b.showContactsPublicly === false) {
          const { whatsapp, telegram, sms, messenger, instagram, facebook, ...rest } = b;
          safe = { ...rest, contactsHidden: true };
        }
        if (lite) {
          // Strip heavy logo (base64) in lite mode for Cuban connections
          const { logo, ...rest } = safe;
          return [b.id, { ...rest, hasLogo: !!logo }];
        }
        return [b.id, safe];
      }));
      const enriched = items.map((p) => {
        const biz = bizMap[p.businessId] || null;
        // Per-product privacy: if showPublicContact === false on the product, hide business contacts
        // for THIS product (regardless of business-level setting).
        const productHidesContacts = p.showPublicContact === false;
        let safeBiz = biz;
        if (biz && productHidesContacts) {
          const { whatsapp, telegram, sms, messenger, instagram, facebook, ...rest } = biz;
          safeBiz = { ...rest, contactsHidden: true };
        }
        return { ...p, hasImage: !!p.image || lite, contactsHidden: productHidesContacts || biz?.contactsHidden === true, business: safeBiz };
      });
      // Light cache (30s) so repeat scrolls reuse the response
      return jsonCached({ products: enriched, total, page, limit, hasMore: skip + items.length < total }, 200, 30);
    }

    if (path[1] && method === 'GET') {
      const product = await db.collection('products').findOne({ id: path[1] });
      if (!product) return json({ error: 'Producto no encontrado' }, 404);
      const business = await db.collection('businesses').findOne({ id: product.businessId });
      // Per-product privacy: optionally hide business contacts for THIS product
      const productHidesContacts = product.showPublicContact === false;
      let safeBiz = business;
      if (business && productHidesContacts) {
        const { whatsapp, telegram, sms, messenger, instagram, facebook, ...rest } = business;
        safeBiz = { ...rest, contactsHidden: true };
      } else if (business && business.showContactsPublicly === false) {
        // business-level privacy still respected
        const { whatsapp, telegram, sms, messenger, instagram, facebook, ...rest } = business;
        safeBiz = { ...rest, contactsHidden: true };
      }
      return json({
        product: {
          ...product,
          contactsHidden: productHidesContacts || (business && business.showContactsPublicly === false),
          business: safeBiz,
        },
      });
    }

    if (!path[1] && method === 'POST') {
      const { user, error } = await requireUser(request);
      if (error) return error;
      const body = await request.json();
      const parsed = productSchema.safeParse(body);
      if (!parsed.success) {
        return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
      }
      const { name, price, description, category, subcategory, stock, image, available, featured, location, currency,
        showPublicContact, province, municipality, address, openingHours, closingHours } = parsed.data;

      const count = await db.collection('products').countDocuments({ businessId: user.businessId });
      const isPremium = user.plan === 'premium';
      if (!isPremium && count >= 10) {
        return json({ error: 'Límite del plan Básico (10 productos) alcanzado. Actualiza a Premium.' }, 403);
      }
      const businessForLoc = await db.collection('businesses').findOne({ id: user.businessId });

      // Per-product privacy validation: if hiding contacts, require physical info (product OR business)
      if (showPublicContact === false) {
        const eff = (k) => body[k] || (businessForLoc && businessForLoc[k]);
        const missing = [];
        if (!eff('province')) missing.push('provincia');
        if (!eff('municipality')) missing.push('municipio');
        if (!eff('address')) missing.push('dirección');
        if (!eff('openingHours')) missing.push('horario apertura');
        if (!eff('closingHours')) missing.push('horario cierre');
        if (missing.length) {
          return json({
            error: `Si ocultas los contactos debes agregar dirección física y horarios del negocio. Faltan: ${missing.join(', ')}.`,
            missing,
          }, 400);
        }
      }

      // Cloudinary auto-upload
      let finalImage = image || '';
      if (finalImage && finalImage.startsWith('data:') && CLOUDINARY_ENABLED) {
        try { finalImage = await uploadToCloudinary(finalImage, 'products'); }
        catch (e) { console.error('[Cloudinary] product upload failed:', e?.message || e); }
      }

      const product = {
        id: uuidv4(),
        businessId: user.businessId,
        name,
        price: Number(price),
        currency: ['CUP','MLC','USD','EUR','GBP','CAD','MXN','USDT','USDC'].includes(currency) ? currency : 'CUP',
        description: description || '',
        category,
        subcategory: subcategory || '',
        stock: stock != null ? Number(stock) : 0,
        image: finalImage,
        location: location || businessForLoc?.location || '',
        available: available !== false,
        featured: isPremium ? !!featured : false,
        // Per-product privacy
        showPublicContact: showPublicContact !== false,
        province: province || '',
        municipality: municipality || '',
        address: address || '',
        openingHours: openingHours || '',
        closingHours: closingHours || '',
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
      const parsed = productSchema.partial().safeParse(body);
      if (!parsed.success) {
        return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
      }
      const update = parsed.data;
      if (update.price != null) update.price = Number(update.price);
      if (update.stock != null) update.stock = Number(update.stock);
      if (update.currency) update.currency = ['CUP','MLC','USD','EUR','GBP','CAD','MXN','USDT','USDC'].includes(update.currency) ? update.currency : 'CUP';
      if (update.featured && user.plan !== 'premium' && user.role !== 'admin') update.featured = false;

      // Validation when hiding contacts (merge of existing product + business fallback)
      const merged = { ...product, ...update };
      if (merged.showPublicContact === false) {
        const biz = await db.collection('businesses').findOne({ id: product.businessId });
        const eff = (k) => merged[k] || (biz && biz[k]);
        const missing = [];
        if (!eff('province')) missing.push('provincia');
        if (!eff('municipality')) missing.push('municipio');
        if (!eff('address')) missing.push('dirección');
        if (!eff('openingHours')) missing.push('horario apertura');
        if (!eff('closingHours')) missing.push('horario cierre');
        if (missing.length) {
          return json({
            error: `Si ocultas los contactos debes agregar dirección física y horarios del negocio. Faltan: ${missing.join(', ')}.`,
            missing,
          }, 400);
        }
      }

      if (update.image && typeof update.image === 'string' && update.image.startsWith('data:') && CLOUDINARY_ENABLED) {
        try { update.image = await uploadToCloudinary(update.image, 'products'); }
        catch (e) { console.error('[Cloudinary] product edit upload failed:', e?.message || e); }
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
    const parsed = subscriptionSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { plan, paymentMethod, reference, screenshot } = parsed.data;
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

  // ===== ORDERS =====
  // POST /api/orders - Create order (validates prices server-side, prevents duplicates)
  if (path[0] === 'orders' && !path[1] && method === 'POST') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const body = await request.json();
    const orderSchema = body.paymentMethod === 'crypto'
      ? createOrderCryptoSchema
      : createOrderSchema;
    const parsed = orderSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { items, shippingName, shippingPhone, shippingAddress, shippingNotes, idempotencyKey } = parsed.data;

    // Idempotency: if key provided and order exists, return existing
    if (idempotencyKey) {
      const existing = await db.collection('orders').findOne({ idempotencyKey, buyerId: user.id });
      if (existing) {
        return json({ order: existing, duplicate: true });
      }
    }

    // Fetch products and validate prices server-side
    const productIds = items.map((i) => i.productId);
    const products = await db.collection('products')
      .find({ id: { $in: productIds }, available: true })
      .toArray();
    const productMap = Object.fromEntries(products.map((p) => [p.id, p]));

    let subtotal = 0;
    const currency = 'CUP'; // single currency per order for now; could be per-item
    const orderItems = [];
    for (const item of items) {
      const product = productMap[item.productId];
      if (!product) {
        return json({ error: `Producto no encontrado o no disponible: ${item.productId}` }, 400);
      }
      // Validate stock
      if (product.stock != null && product.stock < item.quantity) {
        return json({ error: `Stock insuficiente para ${product.name} (disponible: ${product.stock})` }, 400);
      }
      // Use server-side price (not client-provided)
      const lineTotal = Number(product.price) * item.quantity;
      subtotal += lineTotal;
      orderItems.push({
        productId: product.id,
        productName: product.name,
        quantity: item.quantity,
        unitPrice: Number(product.price),
        lineTotal,
        currency: product.currency,
        businessId: product.businessId,
      });
    }

    // For now, single-business orders only (simplifies shipping/payment)
    const businessIds = [...new Set(orderItems.map((i) => i.businessId))];
    if (businessIds.length > 1) {
      return json({ error: 'Por ahora solo se permite un negocio por pedido. Haz pedidos separados.' }, 400);
    }
    const businessId = businessIds[0];
    const business = await db.collection('businesses').findOne({ id: businessId });

    const now = new Date().toISOString();
    const order = {
      id: uuidv4(),
      buyerId: user.id,
      buyerEmail: user.email,
      businessId,
      businessName: business?.name || '',
      items: orderItems,
      subtotal,
      total: subtotal, // no tax/shipping for now
      currency,
      shipping: {
        name: shippingName,
        phone: shippingPhone,
        address: shippingAddress,
        notes: shippingNotes || '',
      },
      paymentStatus: 'pending_payment',
      shippingStatus: 'pending',
      status: 'pending_payment', // legacy alias
      statusHistory: [{ status: 'pending_payment', at: now, by: user.id }],
      idempotencyKey: idempotencyKey || null,
      createdAt: now,
      updatedAt: now,
    };

    // Decrement stock atomically
    for (const item of orderItems) {
      await db.collection('products').updateOne(
        { id: item.productId },
        { $inc: { stock: -item.quantity } }
      );
    }

    // If paymentMethod is crypto, create crypto_invoice
    let invoice = null;
    const paymentMethod = body.paymentMethod || 'crypto'; // default to crypto for now
    if (paymentMethod === 'crypto') {
      const cryptoCurrency = body.cryptoCurrency;
      const cryptoNetwork = body.cryptoNetwork;

      if (!cryptoCurrency || !cryptoNetwork) {
        return json({ error: 'cryptoCurrency y cryptoNetwork requeridos para pago crypto' }, 400);
      }

      // Validate network/currency combination is enabled
      const config = getCryptoConfig();
      const networkConfig = config.enabled.find(n => n.currency === cryptoCurrency && n.network === cryptoNetwork);
      if (!networkConfig) {
        return json({ error: `Combinación no habilitada: ${cryptoCurrency} en ${cryptoNetwork}` }, 400);
      }

      // Convert order total (CUP) to crypto amount using USD rate from settings
      const settings = await getSettings(db);
      const configuredUsdRate = Number(settings.usdRate);
      const usdRate = Number.isFinite(configuredUsdRate) && configuredUsdRate > 0 ? configuredUsdRate : 120; // CUP per USD
      const totalUSD = Number(order.total) / usdRate;

      // Calculate expected amount in token (with 6 decimals for USDT/USDC)
      const expectedAmount = Number(totalUSD.toFixed(2));
      const expectedAmountRaw = Math.round(expectedAmount * Math.pow(10, networkConfig.decimals)).toString();

      const expiresAt = new Date();
      expiresAt.setMinutes(expiresAt.getMinutes() + config.expiryMinutes);

      invoice = {
        id: uuidv4(),
        orderId: order.id,
        buyerId: user.id,
        businessId: order.businessId,
        currency: cryptoCurrency,
        network: cryptoNetwork,
        tokenContract: networkConfig.contract,
        decimals: networkConfig.decimals,
        expectedAmount,
        expectedAmountRaw,
        receiverAddress: networkConfig.receiverAddress,
        status: 'pending',
        expiresAt: expiresAt.toISOString(),
        submittedAt: null,
        confirmedAt: null,
        txHash: null,
        txHashNormalized: null,
        senderAddress: null,
        approvedBy: null,
        approvedAt: null,
        rejectReason: null,
        rejectedBy: null,
        rejectedAt: null,
        verification: {
          lastCheckedAt: null,
          confirmations: 0,
          requiredConfirmations: networkConfig.minConfirmations,
          txData: null,
          error: null,
          retryCount: 0,
        },
        createdAt: now,
        updatedAt: now,
      };

      await db.collection('crypto_invoices').insertOne(invoice);

      // Save the invoice reference before inserting the order; updating before insert lost it.
      order.paymentMethod = 'crypto';
      order.cryptoInvoiceId = invoice.id;
    }

    await db.collection('orders').insertOne(order);

    // Send order confirmation email (async, don't block response)
    sendOrderConfirmationEmail(user.email, user.name || '', order).catch((e) =>
      console.error('[Email] failed to send order confirmation:', e?.message || e)
    );

    return json({ order, invoice, message: 'Pedido creado. Pendiente de pago.' }, 201);
  }

  // GET /api/my/orders - List buyer's orders
  if (path[0] === 'my' && path[1] === 'orders' && method === 'GET') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const orders = await db.collection('orders')
      .find({ buyerId: user.id })
      .sort({ createdAt: -1 })
      .toArray();
    return json({ orders });
  }

  // GET /api/orders/:id - Get order detail (buyer or admin)
  if (path[0] === 'orders' && path[1] && method === 'GET') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const order = await db.collection('orders').findOne({ id: path[1] });
    if (!order) return json({ error: 'Pedido no encontrado' }, 404);
    // Authorization: buyer owns it OR admin
    if (order.buyerId !== user.id && user.role !== 'admin') {
      return json({ error: 'Sin permiso' }, 403);
    }
    return json({ order });
  }

  // PUT /api/admin/orders/:id - Admin update order status (with history)
  if (path[0] === 'admin' && path[1] === 'orders' && path[2] && method === 'PUT') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;
    const body = await request.json();
    const parsed = updateOrderStatusSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { status, trackingNumber, trackingCarrier, adminNotes } = parsed.data;

    const order = await db.collection('orders').findOne({ id: path[2] });
    if (!order) return json({ error: 'Pedido no encontrado' }, 404);

    const now = new Date().toISOString();
    const historyEntry = { status, at: now, by: user.id };
    if (adminNotes) historyEntry.notes = adminNotes;
    if (trackingNumber) historyEntry.trackingNumber = trackingNumber;
    if (trackingCarrier) historyEntry.trackingCarrier = trackingCarrier;

    const update = {
      $set: {
        status,
        paymentStatus: status,
        shippingStatus: ['shipped', 'delivered'].includes(status) ? status : order.shippingStatus,
        updatedAt: now,
      },
      $push: { statusHistory: historyEntry },
    };
    if (trackingNumber) update.$set.trackingNumber = trackingNumber;
    if (trackingCarrier) update.$set.trackingCarrier = trackingCarrier;

    await db.collection('orders').updateOne({ id: path[2] }, update);
    const updated = await db.collection('orders').findOne({ id: path[2] });

    // Send transactional emails based on status change (async, don't block)
    if (status === 'shipped' && updated.trackingNumber) {
      sendOrderShippedEmail(updated.buyerEmail, '', updated, {
        number: updated.trackingNumber,
        carrier: updated.trackingCarrier,
      }).catch((e) => console.error('[Email] failed to send shipped:', e?.message || e));
    } else if (status === 'delivered') {
      sendOrderDeliveredEmail(updated.buyerEmail, '', updated).catch((e) => console.error('[Email] failed to send delivered:', e?.message || e));
    } else if (status === 'cancelled' || status === 'payment_failed') {
      sendPaymentFailedEmail(updated.buyerEmail, '', updated, adminNotes).catch((e) => console.error('[Email] failed to send failed:', e?.message || e));
    }

    return json({ order: updated });
  }

  // GET /api/admin/orders - Admin list all orders
  if (path[0] === 'admin' && path[1] === 'orders' && method === 'GET') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;
    const status = new URL(request.url).searchParams.get('status');
    const filter = status ? { status } : {};
    const orders = await db.collection('orders')
      .find(filter)
      .sort({ createdAt: -1 })
      .limit(200)
      .toArray();
    return json({ orders });
  }

  // ===== CRYPTO PAYMENTS (Own Wallets - Self Custody) =====
  // No external gateway. Direct to own wallets.

  // GET /api/payments/crypto/config - Public config for checkout
  if (path[0] === 'payments' && path[1] === 'crypto' && path[2] === 'config' && method === 'GET') {
    const config = getCryptoConfig();
    return jsonCached(config, 200, 300); // cache 5 min
  }

  // GET /api/orders/:id/invoice - Get crypto invoice for order (buyer or admin)
  if (path[0] === 'orders' && path[1] && path[2] === 'invoice' && method === 'GET') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const orderId = path[1];
    const order = await db.collection('orders').findOne({ id: orderId });
    if (!order) return json({ error: 'Pedido no encontrado' }, 404);
    if (order.buyerId !== user.id && user.role !== 'admin') return json({ error: 'Sin permiso' }, 403);

    if (!order.cryptoInvoiceId) return json({ error: 'Este pedido no tiene factura crypto' }, 404);

    const invoice = await db.collection('crypto_invoices').findOne({ id: order.cryptoInvoiceId });
    if (!invoice) return json({ error: 'Factura no encontrada' }, 404);

    // Don't expose verification internals to buyer
    const { verification, ...invoiceOut } = invoice;
    return json({ invoice: invoiceOut });
  }

  // POST /api/orders/:id/invoice/submit-tx - Buyer submits txHash
  if (path[0] === 'orders' && path[1] && path[2] === 'invoice' && path[3] === 'submit-tx' && method === 'POST') {
    const { user, error } = await requireUser(request);
    if (error) return error;
    const orderId = path[1];

    const body = await request.json();
    const parsed = submitTxSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { txHash } = parsed.data;

    const order = await db.collection('orders').findOne({ id: orderId, buyerId: user.id });
    if (!order) return json({ error: 'Pedido no encontrado' }, 404);
    if (!order.cryptoInvoiceId) return json({ error: 'Este pedido no tiene factura crypto' }, 404);

    const invoice = await db.collection('crypto_invoices').findOne({ id: order.cryptoInvoiceId });
    if (!invoice) return json({ error: 'Factura no encontrada' }, 404);

    // Check status
    if (invoice.status === 'approved') return json({ error: 'Factura ya aprobada' }, 400);
    if (invoice.status === 'rejected') return json({ error: 'Factura rechazada' }, 400);
    if (new Date(invoice.expiresAt) < new Date()) {
      await db.collection('crypto_invoices').updateOne({ id: invoice.id }, { $set: { status: 'expired', updatedAt: new Date().toISOString() } });
      return json({ error: 'Factura expirada' }, 400);
    }

    // Normalize txHash for uniqueness check
    const txHashNormalized = normalizeTxHash(txHash);

    // Check if txHash already used (global unique)
    const existingTx = await db.collection('crypto_invoices').findOne({ txHashNormalized });
    if (existingTx && existingTx.id !== invoice.id) {
      return json({ error: 'Este hash de transacción ya fue utilizado en otra factura' }, 400);
    }

    const now = new Date().toISOString();
    await db.collection('crypto_invoices').updateOne(
      { id: invoice.id },
      { $set: { status: 'submitted', txHash, txHashNormalized, submittedAt: now, updatedAt: now } }
    );

    // Update order status
    await db.collection('orders').updateOne(
      { id: orderId },
      { $set: { paymentStatus: 'pending_payment', status: 'pending_payment', updatedAt: now }, $push: { statusHistory: { status: 'pending_payment', at: now, by: user.id, notes: `TxHash enviado: ${txHash}` } } }
    );

    const updatedInvoice = await db.collection('crypto_invoices').findOne({ id: invoice.id });
    const { verification, ...invOut } = updatedInvoice;
    return json({ invoice: invOut, message: 'TxHash enviado. Pendiente de verificación por administrador.' });
  }

  // GET /api/admin/crypto-invoices - Admin list crypto invoices
  if (path[0] === 'admin' && path[1] === 'crypto-invoices' && method === 'GET') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    const url = new URL(request.url);
    const status = url.searchParams.get('status');
    const businessId = url.searchParams.get('businessId');
    const from = url.searchParams.get('from');
    const to = url.searchParams.get('to');
    const limit = Math.min(100, Math.max(1, parseInt(url.searchParams.get('limit') || '50', 10)));
    const offset = Math.max(0, parseInt(url.searchParams.get('offset') || '0', 10));

    const filter = {};
    if (status) filter.status = status;
    if (businessId) filter.businessId = businessId;
    if (from || to) {
      filter.createdAt = {};
      if (from) filter.createdAt.$gte = from;
      if (to) filter.createdAt.$lte = to;
    }

    const [items, total] = await Promise.all([
      db.collection('crypto_invoices').find(filter).sort({ createdAt: -1 }).skip(offset).limit(limit).toArray(),
      db.collection('crypto_invoices').countDocuments(filter),
    ]);

    // Enrich with buyer/business info
    const buyerIds = [...new Set(items.map(i => i.buyerId))];
    const businessIds = [...new Set(items.map(i => i.businessId))];
    const [buyers, businesses] = await Promise.all([
      db.collection('users').find({ id: { $in: buyerIds } }, { projection: { id: 1, email: 1, name: 1 } }).toArray(),
      db.collection('businesses').find({ id: { $in: businessIds } }, { projection: { id: 1, name: 1 } }).toArray(),
    ]);
    const buyerMap = Object.fromEntries(buyers.map(b => [b.id, b]));
    const businessMap = Object.fromEntries(businesses.map(b => [b.id, b]));

    const enriched = items.map(inv => ({
      ...inv,
      buyer: buyerMap[inv.buyerId] || null,
      business: businessMap[inv.businessId] || null,
    }));

    return json({ invoices: enriched, total, limit, offset });
  }

  // POST /api/admin/crypto-invoices/:id/approve - Admin approves invoice
  if (path[0] === 'admin' && path[1] === 'crypto-invoices' && path[2] && path[3] === 'approve' && method === 'POST') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const parsed = approveInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { notes } = parsed.data;

    const invoice = await db.collection('crypto_invoices').findOne({ id: path[2] });
    if (!invoice) return json({ error: 'Factura no encontrada' }, 404);
    if (invoice.status === 'approved') return json({ error: 'Factura ya aprobada' }, 400);
    if (invoice.status === 'rejected') return json({ error: 'Factura rechazada, no se puede aprobar' }, 400);

    const now = new Date().toISOString();

    // Update invoice
    await db.collection('crypto_invoices').updateOne(
      { id: invoice.id },
      { $set: { status: 'approved', approvedBy: user.id, approvedAt: now, updatedAt: now, verification: { ...invoice.verification, lastCheckedAt: now } } }
    );

    // Update order
    const order = await db.collection('orders').findOne({ id: invoice.orderId });
    if (order) {
      await db.collection('orders').updateOne(
        { id: order.id },
        { $set: { paymentStatus: 'paid', status: 'paid', updatedAt: now, 'paymentRef.txHash': invoice.txHash, 'paymentRef.confirmedAt': now }, $push: { statusHistory: { status: 'paid', at: now, by: user.id, notes: notes || 'Pago verificado y aprobado por administrador' } } }
      );
    }

    // Send confirmation email
    if (order) {
      sendOrderConfirmationEmail(order.buyerEmail, '', { ...order, paymentStatus: 'paid', paymentRef: { txHash: invoice.txHash, confirmedAt: now } }).catch(e => console.error('[Email] failed to send payment confirmed:', e?.message || e));
    }

    const updatedInvoice = await db.collection('crypto_invoices').findOne({ id: invoice.id });
    const { verification, ...invOut } = updatedInvoice;
    return json({ invoice: invOut, message: 'Factura aprobada y pedido marcado como pagado.' });
  }

  // POST /api/admin/crypto-invoices/:id/reject - Admin rejects invoice
  if (path[0] === 'admin' && path[1] === 'crypto-invoices' && path[2] && path[3] === 'reject' && method === 'POST') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    const body = await request.json();
    const parsed = rejectInvoiceSchema.safeParse(body);
    if (!parsed.success) {
      return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
    }
    const { reason } = parsed.data;

    const invoice = await db.collection('crypto_invoices').findOne({ id: path[2] });
    if (!invoice) return json({ error: 'Factura no encontrada' }, 404);
    if (invoice.status === 'approved') return json({ error: 'Factura ya aprobada, no se puede rechazar' }, 400);
    if (invoice.status === 'rejected') return json({ error: 'Factura ya rechazada' }, 400);

    const now = new Date().toISOString();

    // Update invoice
    await db.collection('crypto_invoices').updateOne(
      { id: invoice.id },
      { $set: { status: 'rejected', rejectedBy: user.id, rejectedAt: now, rejectReason: reason, updatedAt: now } }
    );

    // Update order and RESTORE STOCK
    const order = await db.collection('orders').findOne({ id: invoice.orderId });
    if (order) {
      await db.collection('orders').updateOne(
        { id: order.id },
        { $set: { paymentStatus: 'payment_failed', status: 'payment_failed', updatedAt: now }, $push: { statusHistory: { status: 'payment_failed', at: now, by: user.id, notes: reason || 'Pago rechazado por administrador' } } }
      );

      // Restore stock
      for (const item of order.items) {
        await db.collection('products').updateOne(
          { id: item.productId },
          { $inc: { stock: item.quantity } }
        );
      }

      // Send failed email
      sendPaymentFailedEmail(order.buyerEmail, '', { ...order, paymentStatus: 'payment_failed' }, reason).catch(e => console.error('[Email] failed to send payment failed:', e?.message || e));
    }

    const updatedInvoice = await db.collection('crypto_invoices').findOne({ id: invoice.id });
    const { verification, ...invOut } = updatedInvoice;
    return json({ invoice: invOut, message: 'Factura rechazada. Stock restaurado.' });
  }

  // POST /api/admin/crypto-invoices/:id/retry-verification - Force re-check
  if (path[0] === 'admin' && path[1] === 'crypto-invoices' && path[2] && path[3] === 'retry-verification' && method === 'POST') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    const invoice = await db.collection('crypto_invoices').findOne({ id: path[2] });
    if (!invoice) return json({ error: 'Factura no encontrada' }, 404);
    if (!['pending', 'submitted'].includes(invoice.status)) return json({ error: 'Solo facturas pendientes/enviadas pueden re-verificarse' }, 400);

    // verifyCryptoInvoice is already imported at top of file
    const verification = await verifyCryptoInvoice(invoice);

    const now = new Date().toISOString();
    const update = {
      $set: {
        'verification.lastCheckedAt': now,
        'verification.confirmations': verification.confirmations,
        'verification.txData': verification.txData || null,
        'verification.error': verification.error || null,
        'verification.retryCount': (invoice.verification?.retryCount || 0) + 1,
        updatedAt: now,
      },
    };

    await db.collection('crypto_invoices').updateOne({ id: invoice.id }, update);

    const updatedInvoice = await db.collection('crypto_invoices').findOne({ id: invoice.id });
    const { verification: v, ...invOut } = updatedInvoice;
    return json({ invoice: invOut, verification });
  }

  // POST /api/admin/crypto-invoices/verify-pending - Batch verify all pending (for cron/scheduler)
  if (path[0] === 'admin' && path[1] === 'crypto-invoices' && path[2] === 'verify-pending' && method === 'POST') {
    const { user, error } = await requireAdmin(request);
    if (error) return error;

    // verifyPendingInvoices is already imported at top of file
    const results = await verifyPendingInvoices(db, 50);
    return json({ results, message: `Verificadas ${results.length} facturas` });
  }

  // ===== SEED =====
  if (path[0] === 'seed' && method === 'POST') {
    // safe to call multiple times - only seeds products when empty, but ALWAYS reconciles admin
    const existing = await db.collection('products').countDocuments();
    // ensure settings + admin user exist regardless
    await getSettings(db);

    // === Admin reconciliation (idempotent) ===
    // Credenciales del administrador SOLO desde variables de entorno del servidor.
    // Si faltan, se omite la reconciliación (nunca se usan valores por defecto).
    const ADMIN_EMAIL = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
    const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || '';
    const ADMIN_NAME = 'Administrador UBIK2 YEMG';
    const LEGACY_EMAILS = (process.env.ADMIN_LEGACY_EMAILS || '').split(',').map((e) => e.trim().toLowerCase()).filter(Boolean);
    const adminConfigured = Boolean(ADMIN_EMAIL && ADMIN_PASSWORD && ADMIN_PASSWORD.length >= 12);
    if (!adminConfigured) console.warn('[Seed] ADMIN_EMAIL/ADMIN_PASSWORD no configuradas (mín. 12 caracteres): se omite la reconciliación de admin.');

    let adminReconciled = 'skipped';
    if (adminConfigured) {
    adminReconciled = 'none';
    const newHash = await bcrypt.hash(ADMIN_PASSWORD, 10);

    // 1) Try to find any legacy admin email and migrate it to the new one
    const legacyAdmin = await db.collection('users').findOne({ email: { $in: LEGACY_EMAILS } });
    if (legacyAdmin) {
      // Check if new email already taken by another doc to avoid conflict
      const conflicting = await db.collection('users').findOne({ email: ADMIN_EMAIL });
      if (conflicting && conflicting.id !== legacyAdmin.id) {
        if (conflicting.businessId) {
          await db.collection('businesses').deleteOne({ id: conflicting.businessId });
          await db.collection('products').deleteMany({ businessId: conflicting.businessId });
        }
        await db.collection('users').deleteOne({ id: conflicting.id });
      }
      await db.collection('users').updateOne(
        { id: legacyAdmin.id },
        { $set: { email: ADMIN_EMAIL, password: newHash, role: 'admin', name: legacyAdmin.name || ADMIN_NAME, suspended: false } }
      );
      adminReconciled = 'migrated';
    } else {
      // 2) Otherwise, look for existing user with the new email
      const existingNew = await db.collection('users').findOne({ email: ADMIN_EMAIL });
      if (existingNew) {
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

    } // end if (adminConfigured)

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
      premiumPriceCUP: s.premiumPriceCUP || 0,
      plansEnabled: s.plansEnabled !== false,
      contactPhone: s.contactPhone || '+5359195051',
      contactEmail: s.contactEmail || 'UBIK2YEMG@gmail.com',
      facebookUrl: s.facebookUrl || 'https://www.facebook.com/profile.php?id=61590279593760',
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
      const parsed = settingsSchema.safeParse(body);
      if (!parsed.success) {
        return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
      }
      const update = { ...parsed.data, updatedAt: new Date().toISOString() };
      // Coerce numeric prices (already handled by schema, but ensure)
      if ('premiumPriceUSD' in update) update.premiumPriceUSD = Number(update.premiumPriceUSD) || 0;
      if ('premiumPriceCUP' in update) update.premiumPriceCUP = Number(update.premiumPriceCUP) || 0;
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

    if (path[1] === 'products' && path[2] && method === 'GET') {
      const product = await db.collection('products').findOne({
        id: path[2],
      });

      if (!product) {
        return json({ error: 'Producto no encontrado' }, 404);
      }

      const business = product.businessId
        ? await db.collection('businesses').findOne(
            { id: product.businessId },
            {
              projection: {
                id: 1,
                name: 1,
                logo: 1,
                location: 1,
                whatsapp: 1,
                telegram: 1,
                sms: 1,
                instagram: 1,
                facebook: 1,
              },
            }
          )
        : null;

      return json({
        product: { ...product, business },
      });
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
