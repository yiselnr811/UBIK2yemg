/**
 * Crypto Verification Library (ETAPA 4)
 *
 * Verifies transactions on-chain for USDT/USDC on multiple networks.
 * Uses public RPC endpoints (no API keys required).
 * Designed for serverless environments (Render free tier) - stateless, idempotent.
 *
 * Networks supported:
 * - TRC20 (Tron): USDT
 * - ERC20 (Ethereum): USDT, USDC
 * - Polygon: USDT, USDC
 * - Base: USDT, USDC
 * - Arbitrum: USDT, USDC
 */

import { createHash } from 'node:crypto';
import { createPublicClient, http, parseAbi, formatUnits, decodeEventLog } from 'viem';
import { mainnet, polygon, base, arbitrum } from 'viem/chains';

// ===== Tron (TRC20) =====
// Convierte direcciones Tron entre hexadecimal y Base58Check.
const TRON_BASE58_ALPHABET = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';

function tronBase58Encode(buffer) {
  let value = BigInt('0x' + buffer.toString('hex'));
  let encoded = '';

  while (value > 0n) {
    const remainder = Number(value % 58n);
    encoded = TRON_BASE58_ALPHABET[remainder] + encoded;
    value /= 58n;
  }

  for (const byte of buffer) {
    if (byte !== 0) break;
    encoded = '1' + encoded;
  }

  return encoded;
}

function tronBase58Decode(address) {
  let value = 0n;

  for (const char of address) {
    const digit = TRON_BASE58_ALPHABET.indexOf(char);
    if (digit < 0) throw new Error('Dirección Tron Base58 inválida');
    value = value * 58n + BigInt(digit);
  }

  let hex = value.toString(16);
  if (hex.length % 2) hex = '0' + hex;

  const leadingOnes = address.match(/^1*/)?.[0].length || 0;
  const body = value === 0n ? Buffer.alloc(0) : Buffer.from(hex, 'hex');
  const decoded = Buffer.concat([Buffer.alloc(leadingOnes), body]);

  if (decoded.length !== 25) {
    throw new Error('Longitud de dirección Tron inválida');
  }

  const payload = decoded.subarray(0, 21);
  const checksum = decoded.subarray(21);
  const expectedChecksum = createHash('sha256')
    .update(createHash('sha256').update(payload).digest())
    .digest()
    .subarray(0, 4);

  if (!checksum.equals(expectedChecksum) || payload[0] !== 0x41) {
    throw new Error('Checksum o prefijo de dirección Tron inválido');
  }

  return payload.toString('hex').toLowerCase();
}

function tronHexToBase58(hexAddress) {
  let hex = String(hexAddress || '').replace(/^0x/i, '').toLowerCase();

  // Los topics de Transfer contienen los 20 bytes de la dirección.
  if (hex.length === 40) hex = '41' + hex;

  // Algunas respuestas incluyen 41 y otras pueden incluir 0x41.
  if (!/^[0-9a-f]{42}$/.test(hex) || !hex.startsWith('41')) {
    throw new Error('Dirección hexadecimal Tron inválida');
  }

  const payload = Buffer.from(hex, 'hex');
  const checksum = createHash('sha256')
    .update(createHash('sha256').update(payload).digest())
    .digest()
    .subarray(0, 4);

  return tronBase58Encode(Buffer.concat([payload, checksum]));
}

async function verifyTrc20(txHash, expectedAddress, expectedAmountRaw, contractAddress) {
  const rpcUrl = process.env.CRYPTO_RPC_TRON || 'https://api.trongrid.io';

  try {
    const txRes = await fetch(`${rpcUrl}/wallet/gettransactioninfobyid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: txHash }),
    });

    if (!txRes.ok) {
      return { success: false, error: `TronGrid respondió HTTP ${txRes.status}`, confirmations: 0 };
    }

    const txInfo = await txRes.json();

    // Una respuesta vacía puede significar que la transacción todavía no está indexada.
    if (!txInfo || !txInfo.blockNumber || !Array.isArray(txInfo.log)) {
      return { success: false, error: 'Transacción todavía no disponible en TronGrid; reintentar', confirmations: 0 };
    }

    if (txInfo.receipt?.result && txInfo.receipt.result !== 'SUCCESS') {
      return { success: false, error: 'La transacción Tron terminó con error', confirmations: 0 };
    }

    const latestRes = await fetch(`${rpcUrl}/wallet/getnowblock`);
    if (!latestRes.ok) {
      return { success: false, error: `No se pudo consultar el bloque actual de Tron (HTTP ${latestRes.status})`, confirmations: 0 };
    }

    const latestBlock = await latestRes.json();
    const latestNumber = latestBlock?.block_header?.raw_data?.number;

    if (!Number.isSafeInteger(latestNumber) || latestNumber < txInfo.blockNumber) {
      return { success: false, error: 'No se pudo calcular la confirmación de Tron; reintentar', confirmations: 0 };
    }

    const confirmations = latestNumber - txInfo.blockNumber + 1;
    const expectedReceiverHex = tronBase58Decode(expectedAddress);
    const expectedContractHex = tronBase58Decode(contractAddress);
    const transferTopic = 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef';

    const transferLogs = txInfo.log.filter(log =>
      String(log.topics?.[0] || '').replace(/^0x/i, '').toLowerCase() === transferTopic &&
      String(log.address || '').replace(/^0x/i, '').toLowerCase() === expectedContractHex
    );

    if (!transferLogs.length) {
      return { success: false, error: 'No se encontró un evento Transfer del contrato USDT esperado', confirmations };
    }

    // Revisar todos los eventos: una transacción puede contener varias transferencias.
    const transfers = transferLogs.map(log => {
      const from = tronHexToBase58(String(log.topics[1] || '').slice(-40));
      const to = tronHexToBase58(String(log.topics[2] || '').slice(-40));
      const amountRaw = BigInt('0x' + String(log.data || '0').replace(/^0x/i, '')).toString();
      return { from, to, amountRaw };
    });

    const matched = transfers.find(transfer =>
      tronBase58Decode(transfer.to) === expectedReceiverHex &&
      transfer.amountRaw === String(expectedAmountRaw)
    );

    if (!matched) {
      return {
        success: false,
        error: 'No se encontró una transferencia con destinatario e importe exactos',
        confirmations,
        addressMatch: transfers.some(t => tronBase58Decode(t.to) === expectedReceiverHex),
        amountMatch: transfers.some(t => t.amountRaw === String(expectedAmountRaw)),
      };
    }

    return {
      success: true,
      confirmations,
      txData: {
        from: matched.from,
        to: matched.to,
        amountRaw: matched.amountRaw,
        blockNumber: txInfo.blockNumber,
        timestamp: txInfo.blockTimeStamp,
      },
      addressMatch: true,
      amountMatch: true,
    };
  } catch (e) {
    return { success: false, error: e.message || 'Error consultando TronGrid; reintentar', confirmations: 0 };
  }
}

// ===== EVM Chains (ERC20, Polygon, Base, Arbitrum) =====
const erc20Abi = parseAbi([
  'event Transfer(address indexed from, address indexed to, uint256 value)',
]);

function getEvmClient(network) {
  const rpcUrls = {
    ERC20: process.env.CRYPTO_RPC_ETHEREUM || 'https://eth.llamarpc.com',
    POLYGON: process.env.CRYPTO_RPC_POLYGON || 'https://polygon-rpc.com',
    BASE: process.env.CRYPTO_RPC_BASE || 'https://mainnet.base.org',
    ARBITRUM: process.env.CRYPTO_RPC_ARBITRUM || 'https://arb1.arbitrum.io/rpc',
  };

  const chains = {
    ERC20: mainnet,
    POLYGON: polygon,
    BASE: base,
    ARBITRUM: arbitrum,
  };

  return createPublicClient({
    chain: chains[network],
    transport: http(rpcUrls[network]),
  });
}

async function verifyEvm(network, txHash, expectedAddress, expectedAmountRaw, contractAddress) {
  try {
    const client = getEvmClient(network);

    // Get transaction receipt
    const receipt = await client.getTransactionReceipt({ hash: txHash });

    if (!receipt || receipt.status !== 'success') {
      return { success: false, error: 'Transaction failed or not found', confirmations: 0 };
    }

    // Get current block for confirmations
    const currentBlock = await client.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);

    // Revisar todos los eventos Transfer del contrato de token esperado.
    const transferLogs = receipt.logs.filter(log =>
      log.address.toLowerCase() === contractAddress.toLowerCase() &&
      log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    );

    if (transferLogs.length === 0) {
      return { success: false, error: 'No ERC20 Transfer event found', confirmations };
    }

    const transfers = [];
    for (const log of transferLogs) {
      try {
        const decoded = decodeEventLog({
          abi: erc20Abi,
          data: log.data,
          topics: log.topics,
        });
        transfers.push({
          from: decoded.args.from,
          to: decoded.args.to,
          amountRaw: decoded.args.value.toString(),
        });
      } catch {
        // Ignorar eventos malformados; no aceptar una coincidencia no decodificada.
      }
    }

    const normalizedReceiver = expectedAddress.toLowerCase();
    const expectedRaw = String(expectedAmountRaw);
    const addressMatch = transfers.some(
      transfer => transfer.to.toLowerCase() === normalizedReceiver
    );
    const amountMatch = transfers.some(
      transfer => transfer.amountRaw === expectedRaw
    );
    const matched = transfers.find(
      transfer =>
        transfer.to.toLowerCase() === normalizedReceiver &&
        transfer.amountRaw === expectedRaw
    );

    if (!matched) {
      return {
        success: false,
        error: 'No se encontró una transferencia con destinatario e importe exactos',
        confirmations,
        addressMatch,
        amountMatch,
      };
    }

    return {
      success: true,
      confirmations,
      txData: {
        from: matched.from,
        to: matched.to,
        amountRaw: matched.amountRaw,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
      },
      addressMatch: true,
      amountMatch: true,
    };
  } catch (e) {
    return { success: false, error: e.message, confirmations: 0 };
  }
}

// ===== Main verification function =====
export async function verifyCryptoInvoice(invoice) {
  const { network, currency, txHash, receiverAddress, expectedAmountRaw, tokenContract } = invoice;

  if (!txHash) {
    return { success: false, error: 'No txHash provided', confirmations: 0 };
  }

  // Normalize inputs
  const normalizedTxHash = txHash.toLowerCase().replace(/^0x/, '');
  const fullTxHash = network === 'TRC20' ? normalizedTxHash : `0x${normalizedTxHash}`;
  const normalizedExpectedAddress = receiverAddress.toLowerCase();
  const normalizedExpectedAmount = expectedAmountRaw.toString();

  let result;

  if (network === 'TRC20') {
    result = await verifyTrc20(fullTxHash, normalizedExpectedAddress, normalizedExpectedAmount, tokenContract);
  } else {
    result = await verifyEvm(network, fullTxHash, normalizedExpectedAddress, normalizedExpectedAmount, tokenContract);
  }

  return {
    ...result,
    network,
    currency,
    verifiedAt: new Date().toISOString(),
  };
}

// ===== Batch verification for retry logic =====
export async function verifyPendingInvoices(db, limit = 20) {
  const config = {
    TRC20: 1,
    ERC20: 12,
    POLYGON: 20,
    BASE: 2,
    ARBITRUM: 20,
  };

  const invoices = await db.collection('crypto_invoices')
    .find({
      status: { $in: ['submitted', 'pending'] },
    })
    .sort({ 'verification.lastCheckedAt': 1 }) // Oldest check first
    .limit(limit)
    .toArray();

  const results = [];

  for (const invoice of invoices) {
    // Check if expired
    if (!invoice.txHash && new Date(invoice.expiresAt) < new Date()) {
      await db.collection('crypto_invoices').updateOne(
        { id: invoice.id },
        { $set: { status: 'expired', updatedAt: new Date().toISOString() } }
      );
      // Restore stock for expired invoices
      const order = await db.collection('orders').findOne({ id: invoice.orderId });
      if (order) {
        for (const item of order.items) {
          await db.collection('products').updateOne(
            { id: item.productId },
            { $inc: { stock: item.quantity } }
          );
        }
      }
      results.push({ invoiceId: invoice.id, status: 'expired' });
      continue;
    }

    // Skip if already approved/rejected
    if (['approved', 'rejected'].includes(invoice.status)) {
      continue;
    }

    const requiredConfirmations = config[invoice.network] || 1;

    try {
      const verification = await verifyCryptoInvoice(invoice);

      const update = {
        $set: {
          'verification.lastCheckedAt': new Date().toISOString(),
          'verification.confirmations': verification.confirmations,
          'verification.txData': verification.txData || null,
          'verification.error': verification.error || null,
          'verification.retryCount': (invoice.verification?.retryCount || 0) + 1,
          updatedAt: new Date().toISOString(),
        },
      };

      // Auto-approve if verified and enough confirmations
      if (verification.success && verification.confirmations >= requiredConfirmations) {
        update.$set.status = 'approved';
        update.$set.confirmedAt = new Date().toISOString();
        update.$set['verification.requiredConfirmations'] = requiredConfirmations;

        // La factura se aprobará mediante una actualización atómica más abajo.
        // Solo la ejecución que consiga cambiar su estado podrá marcar el pedido como pagado.
      } else if (verification.success && verification.confirmations < requiredConfirmations) {
        // Underpaid/overpaid check would go here
        update.$set.status = 'submitted'; // Still pending confirmations
        results.push({ invoiceId: invoice.id, status: 'pending-confirmations', confirmations: verification.confirmations, required: requiredConfirmations });
      } else {
        // Un resultado negativo no demuestra por sí solo que el pago sea inválido.
        // Mantener la factura pendiente ante transacciones no indexadas o errores RPC.
        update.$set.status = 'submitted';
        update.$set['verification.lastNegativeCheckAt'] = new Date().toISOString();

        results.push({
          invoiceId: invoice.id,
          status: 'pending-recheck',
          error: verification.error || 'No se pudo confirmar la transferencia; requiere nueva comprobación',
        });
      }

      // Actualización condicional: evita sobrescribir una factura procesada
      // por otra ejecución mientras se verificaba la transacción.
      const invoiceUpdate = await db.collection('crypto_invoices').updateOne(
        {
          id: invoice.id,
          status: { $in: ['submitted', 'pending'] },
        },
        update
      );

      if (update.$set.status === 'approved') {
        if (invoiceUpdate.modifiedCount === 1) {
          const confirmedAt = new Date().toISOString();
          await db.collection('orders').updateOne(
            { id: invoice.orderId, paymentStatus: { $ne: 'paid' } },
            {
              $set: {
                paymentStatus: 'paid',
                status: 'paid',
                updatedAt: confirmedAt,
                'paymentRef.txHash': invoice.txHash,
                'paymentRef.confirmedAt': confirmedAt,
              },
              $push: {
                statusHistory: {
                  status: 'paid',
                  at: confirmedAt,
                  by: 'auto-verification',
                  notes: `Auto-verificado: ${verification.confirmations} confirmaciones en ${invoice.network}`,
                },
              },
            }
          );

          results.push({
            invoiceId: invoice.id,
            status: 'auto-approved',
            confirmations: verification.confirmations,
          });
        } else {
          results.push({
            invoiceId: invoice.id,
            status: 'already-processed',
          });
        }
      }

    } catch (e) {
      // Network error - increment retry count but don't change status
      await db.collection('crypto_invoices').updateOne(
        { id: invoice.id },
        {
          $set: {
            'verification.lastCheckedAt': new Date().toISOString(),
            'verification.error': e.message,
            'verification.retryCount': (invoice.verification?.retryCount || 0) + 1,
            updatedAt: new Date().toISOString(),
          }
        }
      );
      results.push({ invoiceId: invoice.id, status: 'retry-error', error: e.message });
    }
  }

  return results;
}

// ===== Helper to convert amount to raw units =====
export function amountToRaw(amount, decimals = 6) {
  return Math.round(amount * Math.pow(10, decimals)).toString();
}

export function rawToAmount(raw, decimals = 6) {
  return Number(raw) / Math.pow(10, decimals);
}
