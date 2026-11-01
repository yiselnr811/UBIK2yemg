# DISEÑO — Sistema de Pagos Propios con Criptomonedas (ETAPA 2)

**Rama**: `feat/own-crypto-payments`
**Basado en**: `main` (commit `be34301`)
**Fecha**: 2025

---

## 1. Objetivo

Implementar cobro directo a **billeteras propias** (self-custody) sin pasarelas externas (NOWPayments, PayRam, etc.), soportando:

- **USDT TRC20** (Tron)
- **USDT / USDC** en Ethereum, Polygon, Base, Arbitrum, Optimism
- Selección explícita de **moneda + red** por el comprador
- Direcciones receptoras configurables por **variables de entorno seguras** (solo lectura)
- Facturas únicas (`crypto_invoices`) con: importe esperado, vencimiento, estado, txHash

---

## 2. Monedas y redes soportadas (verificadas)

| Moneda | Red | Contrato (mainnet) | Decimales | RPC público recomendado | Explorador |
|--------|-----|-------------------|-----------|------------------------|------------|
| USDT | TRC20 (Tron) | `TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t` | 6 | `https://api.trongrid.io` | tronscan.org |
| USDT | Ethereum (ERC20) | `0xdAC17F958D2ee523a2206206994597C13D831ec7` | 6 | `https://eth.llamarpc.com` | etherscan.io |
| USDC | Ethereum (ERC20) | `0xA0b86a33E6441b8C4505B0e4d0fF7D6E6F7a7F2F` | 6 | `https://eth.llamarpc.com` | etherscan.io |
| USDT | Polygon | `0xc2132D05D31c914a87C6611C10748AEb04B58e8F` | 6 | `https://polygon-rpc.com` | polygonscan.com |
| USDC | Polygon | `0x2791Bca1f2de4661ED88A30C99A7a9449Aa84174` | 6 | `https://polygon-rpc.com` | polygonscan.com |
| USDT | Base | `0xfde4C96c8593536E31F229EA8f37b2ADa2699bb2` | 6 | `https://mainnet.base.org` | basescan.org |
| USDC | Base | `0x833589fCD6eDb6E08f4c7C32D4f71b54bdA02913` | 6 | `https://mainnet.base.org` | basescan.org |
| USDT | Arbitrum | `0xFd086bC7CD5C481DCC9C85ebE478A1C0b69FCbb9` | 6 | `https://arb1.arbitrum.io/rpc` | arbiscan.io |
| USDC | Arbitrum | `0xaf88d065e77c8cC2239327C5EDb3A432268e5831` | 6 | `https://arb1.arbitrum.io/rpc` | arbiscan.io |

> **Nota**: No se afirma soporte hasta validar contrato + RPC + método de verificación fiable. Las redes arriba son las de **Fase 1 (manual)**; la verificación automática (ETAPA 4) se implementará solo para las que tengan RPC confiable gratuito.

---

## 3. Esquema MongoDB — Nueva colección: `crypto_invoices`

```javascript
{
  _id: ObjectId,
  id: "uuid-v4",                    // ID público (no _id)
  orderId: "uuid-v4",               // Ref a orders.id
  buyerId: "uuid-v4",               // Ref a users.id
  businessId: "uuid-v4",            // Ref a businesses.id (vendedor)

  // Configuración de pago
  currency: "USDT",                 // "USDT" | "USDC"
  network: "TRC20",                 // "TRC20" | "ERC20" | "POLYGON" | "BASE" | "ARBITRUM"
  tokenContract: "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t", // contrato verificado
  decimals: 6,
  expectedAmount: 100.00,           // Importe esperado en token (ej: 100 USDT)
  expectedAmountRaw: "100000000",   // En unidades mínimas (6 decimales = 100 * 10^6)
  receiverAddress: "TXyZ123...",    // Dirección receptora (de config/env)

  // Estado y ciclo de vida
  status: "pending",                // "pending" | "submitted" | "approved" | "rejected" | "expired" | "underpaid" | "overpaid"
  expiresAt: ISODate("2025-01-15T10:30:00Z"), // 30 min por defecto
  submittedAt: ISODate,             // Cuando cliente envía txHash
  confirmedAt: ISODate,             // Cuando admin aprueba (manual) o auto-verifica

  // Datos de transacción (cliente)
  txHash: "0xabc...",               // Hash enviado por cliente
  txHashNormalized: "0xabc...",     // Lowercase sin 0x duplicado para índice único
  senderAddress: "0x...",           // Opcional: dirección remitente (si la extraemos)

  // Auditoría admin
  approvedBy: "admin-uuid",         // Admin que aprobó
  approvedAt: ISODate,
  rejectReason: "",                 // Si rejected
  rejectedBy: "admin-uuid",
  rejectedAt: ISODate,

  // Verificación automática (ETAPA 4)
  verification: {
    lastCheckedAt: ISODate,
    confirmations: 0,
    requiredConfirmations: 1,       // TRC20=1, ERC20=12, POLYGON=20, BASE=2, ARBITRUM=20
    txData: {},                     // Raw tx data from RPC
    error: null,
    retryCount: 0,
  },

  // Metadatos
  createdAt: ISODate,
  updatedAt: ISODate,

  // Índices únicos críticos
  // - { txHashNormalized: 1 } unique (anti-duplicado global)
  // - { orderId: 1 } unique (una factura por orden)
  // - { buyerId: 1, createdAt: -1 }
  // - { status: 1, expiresAt: 1 }
  // - { businessId: 1, status: 1 }
}
```

---

## 4. Configuración — Variables de entorno (`.env.example`)

```bash
# ============================================
# CRYPTO PAYMENTS — Own Wallets (SELF-CUSTODY)
# ============================================
# SOLO direcciones PÚBLICAS (receive-only). NUNCA private keys, mnemonics, seeds.

# Formato: NETWORK_TOKEN=ADDRESS
# Ejemplos (reemplazar con tus direcciones reales):
CRYPTO_WALLET_TRC20_USDT=TXyZ123ExampleUSDTTRC20WalletAddressChangeMe
CRYPTO_WALLET_ERC20_USDT=0x1234567890123456789012345678901234567890
CRYPTO_WALLET_ERC20_USDC=0x1234567890123456789012345678901234567890
CRYPTO_WALLET_POLYGON_USDT=0x1234567890123456789012345678901234567890
CRYPTO_WALLET_POLYGON_USDC=0x1234567890123456789012345678901234567890
CRYPTO_WALLET_BASE_USDT=0x1234567890123456789012345678901234567890
CRYPTO_WALLET_BASE_USDC=0x1234567890123456789012345678901234567890
CRYPTO_WALLET_ARBITRUM_USDT=0x1234567890123456789012345678901234567890
CRYPTO_WALLET_ARBITRUM_USDC=0x1234567890123456789012345678901234567890

# RPC URLs (públicos gratuitos, sin API key) — para verificación automática ETAPA 4
CRYPTO_RPC_TRON=https://api.trongrid.io
CRYPTO_RPC_ETHEREUM=https://eth.llamarpc.com
CRYPTO_RPC_POLYGON=https://polygon-rpc.com
CRYPTO_RPC_BASE=https://mainnet.base.org
CRYPTO_RPC_ARBITRUM=https://arb1.arbitrum.io/rpc

# Configuración de facturas
CRYPTO_INVOICE_EXPIRY_MINUTES=30           # Vencimiento factura
CRYPTO_MIN_CONFIRMATIONS_TRC20=1           # Confirmaciones requeridas por red
CRYPTO_MIN_CONFIRMATIONS_ERC20=12
CRYPTO_MIN_CONFIRMATIONS_POLYGON=20
CRYPTO_MIN_CONFIRMATIONS_BASE=2
CRYPTO_MIN_CONFIRMATIONS_ARBITRUM=20

# Tolerancias (porcentaje sobre expectedAmount)
CRYPTO_UNDERPAY_TOLERANCE_PCT=0.5          # 0.5% bajo = underpaid
CRYPTO_OVERPAY_TOLERANCE_PCT=5             # 5% sobre = overpaid (requiere revisión manual)

# Monedas/redes habilitadas (CSV) — solo las que tengas wallet configurada
CRYPTO_ENABLED_NETWORKS=TRC20_USDT,ERC20_USDT,ERC20_USDC,POLYGON_USDT,POLYGON_USDC,BASE_USDT,BASE_USDC,ARBITRUM_USDT,ARBITRUM_USDC
```

---

## 5. Endpoints API — Nuevos (prefijo `/api`)

### 5.1 Configuración pública (para checkout)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/payments/crypto/config` | Devuelve monedas/redes habilitadas + direcciones receptoras + expiryy |

**Respuesta**:
```json
{
  "enabled": [
    { "currency": "USDT", "network": "TRC20", "label": "USDT (TRC20 - Tron)", "receiverAddress": "TXyZ...", "decimals": 6, "minConfirmations": 1 },
    { "currency": "USDC", "network": "ERC20", "label": "USDC (Ethereum ERC20)", "receiverAddress": "0x123...", "decimals": 6, "minConfirmations": 12 }
  ],
  "expiryMinutes": 30,
  "underpayTolerancePct": 0.5,
  "overpayTolerancePct": 5
}
```

### 5.2 Crear factura al crear orden

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/orders` | (Existente) Al crear orden, si `paymentMethod === 'crypto'`, crea `crypto_invoice` automáticamente |

**Body adicional en createOrder**:
```json
{
  "items": [...],
  "shippingName": "...",
  "shippingPhone": "...",
  "shippingAddress": "...",
  "paymentMethod": "crypto",           // NUEVO: 'crypto' | 'transfermovil' | 'cash'
  "cryptoCurrency": "USDT",            // Requerido si crypto
  "cryptoNetwork": "TRC20",            // Requerido si crypto
  "idempotencyKey": "uuid-cliente"
}
```

**Respuesta** (extiende orden existente):
```json
{
  "order": { ... },
  "invoice": {
    "id": "inv-uuid",
    "currency": "USDT",
    "network": "TRC20",
    "expectedAmount": 100.00,
    "expectedAmountRaw": "100000000",
    "receiverAddress": "TXyZ...",
    "expiresAt": "2025-01-15T10:30:00Z",
    "tokenContract": "TR7NHqjeKQxGTCi8q8ZY4pL8otSzgjLj6t",
    "decimals": 6
  }
}
```

### 5.3 Consultar factura (cliente)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/orders/:orderId/invoice` | Devuelve factura completa para mostrar en UI |

### 5.4 Enviar txHash (cliente)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/orders/:orderId/invoice/submit-tx` | Cliente envía hash de transacción |

**Body**:
```json
{ "txHash": "0xabc123..." }
```

**Validaciones**:
- Factura existe y status `pending` o `submitted`
- No expirada (`expiresAt > now`)
- `txHash` no usado en otra factura (índice único `txHashNormalized`)
- Formato básico válido (0x + 64 hex para EVM, o 64 hex para Tron)

**Respuesta**:
```json
{
  "invoice": { ..., "status": "submitted", "txHash": "0xabc...", "submittedAt": "..." }
}
```

### 5.5 Admin: Listar facturas pendientes

| Método | Ruta | Descripción |
|--------|------|-------------|
| `GET` | `/admin/crypto-invoices` | Lista con filtros: status, businessId, date range |

**Query params**: `status=pending|submitted|approved|rejected|expired`, `businessId`, `from`, `to`, `limit`, `offset`

### 5.6 Admin: Aprobar factura

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/admin/crypto-invoices/:invoiceId/approve` | Admin verifica en explorer y aprueba |

**Body**: `{ "notes": "Verificado en Tronscan block #12345" }`

**Efectos**:
- `status: "approved"`, `approvedAt`, `approvedBy`
- Actualiza `order.paymentStatus = "paid"`, `order.paymentRef.txHash`
- Decrementa stock (ya hecho en creación de orden)
- Envía email/notificación al comprador

### 5.7 Admin: Rechazar factura

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/admin/crypto-invoices/:invoiceId/reject` | Admin rechaza con motivo |

**Body**: `{ "reason": "Hash no encontrado / importe incorrecto / red errónea" }`

**Efectos**:
- `status: "rejected"`, `rejectedAt`, `rejectedBy`, `rejectReason`
- `order.paymentStatus = "payment_failed"`
- **Restaura stock** de los items de la orden

### 5.8 Admin: Reintentar verificación (ETAPA 4)

| Método | Ruta | Descripción |
|--------|------|-------------|
| `POST` | `/admin/crypto-invoices/:invoiceId/retry-verification` | Fuerza re-check automático |

---

## 6. Flujo de datos — ETAPA 3 (Manual)

```
┌─────────┐     POST /orders (paymentMethod=crypto)     ┌──────────────┐
│ Cliente │ ──────────────────────────────────────────> │   API/DB     │
└─────────┘                                              │              │
     │                                                   │ 1. Valida    │
     │                                                   │    stock     │
     │                                                   │ 2. Crea order│
     │                                                   │ 3. Crea      │
     │              { order, invoice }                   │    crypto_   │
     │ <──────────────────────────────────────────────── │    invoice   │
     │                                                   └──────────────┘
     │
     ▼
┌─────────┐     GET /orders/:id/invoice                   ┌──────────────┐
│ Cliente │ ──────────────────────────────────────────> │   API/DB     │
│  (UI)   │                                               │              │
└─────────┘              { invoice details }              └──────────────┘
     │
     │  [Muestra: Red, Token, Importe, Dirección, QR, Expiración, Order ID]
     │
     ▼
┌─────────┐     Cliente envía desde SU wallet              │  Blockchain  │
│ Cliente │ ────────────────────────────────────────────> │  (Tron/EVM)  │
│ (wallet)│                                               │              │
└─────────┘                                               └──────────────┘
     │
     │  [Copia txHash del explorer]
     ▼
┌─────────┐     POST /orders/:id/invoice/submit-tx        ┌──────────────┐
│ Cliente │ ──────────────────────────────────────────> │   API/DB     │
│  (UI)   │                                               │              │
└─────────┘              { invoice: submitted }           └──────────────┘
     │
     ▼
┌─────────┐     GET /admin/crypto-invoices                ┌──────────────┐
│ Admin   │ ──────────────────────────────────────────> │   API/DB     │
│ (panel) │                                               │              │
└─────────┘              [Lista facturas submitted]       └──────────────┘
     │
     │  [Admin abre explorer, verifica: red, contrato, destino, importe, confirmaciones]
     ▼
┌─────────┐     POST /admin/crypto-invoices/:id/approve   ┌──────────────┐
│ Admin   │ ──────────────────────────────────────────> │   API/DB     │
│ (panel) │                                               │              │
└─────────┘              { ok: true, order: paid }        └──────────────┘
```

---

## 7. Reglas de negocio críticas

| Regla | Implementación |
|-------|----------------|
| **Una factura por orden** | Índice único `orderId` en `crypto_invoices` |
| **Un txHash = una factura** | Índice único `txHashNormalized` (lowercase, sin 0x duplicado) |
| **No marcar pagado sin verificación** | Solo admin `approve` o auto-verificación (ETAPA 4) cambian a `approved` |
| **Expiración** | Job/cleanup: `pending` + `expiresAt < now` → `expired`; `submitted` + expirada sin acción → `expired` |
| **Stock** | Decrementa al crear orden; restaura si `reject` o `expired` sin pagar |
| **Anti-duplicado cliente** | `idempotencyKey` en orden + `txHashNormalized` único en factura |
| **Compatibilidad `payments`** | Colección `payments` intacta para suscripciones; `crypto_invoices` nueva para órdenes |

---

## 8. Compatibilidad con colección `payments` existente

| Colección | Propósito | Campos clave |
|-----------|-----------|--------------|
| `payments` | **Suscripciones premium** (plan mensual) | `plan`, `planExpiresAt`, `paymentMethod: 'usdc'|'transfermovil'` |
| `crypto_invoices` | **Órdenes de compra** (productos) | `orderId`, `currency`, `network`, `expectedAmount`, `txHash` |

**No se mezclan**. El frontend distingue:
- "Pagar suscripción" → usa `payments` (flujo actual)
- "Pagar pedido" → usa `crypto_invoices` (nuevo flujo)

---

## 9. Seguridad

- **Nunca** private keys en repo, MongoDB, frontend, logs
- Direcciones receptoras solo desde `process.env.CRYPTO_WALLET_*`
- Validación estricta de `currency` + `network` contra lista permitida
- `txHashNormalized` = `txHash.toLowerCase().replace(/^0x/, '')` para índice único
- Rate limit en `/submit-tx` (max 5/min por IP/usuario)
- Admin actions auditadas (`approvedBy`, `rejectedBy`, `reason`, timestamps)

---

## 10. Limitaciones versión gratuita (Render free tier)

| Limitación | Mitigación |
|------------|------------|
| Sin procesos persistentes (no cron, no workers) | Verificación manual (ETAPA 3) + polling en requests admin / webhook externo opcional |
| Cold starts (spin down tras 15 min inactividad) | Endpoints idempotentes; reintentos seguros en ETAPA 4 |
| Sin IP fija para webhooks | No depender de webhooks; usar polling pull |
| Límite 512 MB RAM | Verificación ligera (ethers/tronweb solo lectura) |

---

## 11. Próximos pasos (ETAPA 3)

1. **Zod schemas** para `crypto_invoice` y endpoints nuevos
2. **Helper `getCryptoConfig()`** que lea `CRYPTO_WALLET_*` y construya lista habilitada
3. **Endpoint `GET /payments/crypto/config`**
4. **Extender `POST /orders`** para crear factura si `paymentMethod === 'crypto'`
5. **Endpoints**: `GET /orders/:id/invoice`, `POST /orders/:id/invoice/submit-tx`
6. **Admin endpoints**: `GET /admin/crypto-invoices`, `POST /admin/crypto-invoices/:id/approve|reject`
7. **Frontend**: Checkout flow → seleccionar crypto → mostrar factura → input txHash → admin panel
8. **Índices MongoDB** únicos + TTL opcional en `expiresAt`
