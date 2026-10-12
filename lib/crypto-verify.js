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

import { createPublicClient, http, parseAbi, decodeEventLog } from 'viem';;
import { mainnet, polygon, base, arbitrum } from 'viem/chains';

// ===== Tron (TRC20) =====
// Uses TronGrid REST API (no tronweb dependency for lighter bundle)
async function verifyTrc20(txHash, expectedAddress, expectedAmountRaw, contractAddress) {
  const rpcUrl = process.env.CRYPTO_RPC_TRON || 'https://api.trongrid.io';

  try {
    // Get transaction info
    const txRes = await fetch(`${rpcUrl}/wallet/gettransactioninfobyid`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ value: txHash }),
    });
    const txInfo = await txRes.json();

    if (!txRes.ok || txInfo.result?.code !== 0) {
      return { success: false, error: 'Transaction not found or failed', confirmations: 0 };
    }

    // Get block for confirmations
    const blockRes = await fetch(`${rpcUrl}/wallet/getblockbynum`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ num: txInfo.blockNumber }),
    });
    const blockInfo = await blockRes.json();

    // Get latest block for confirmations
    const latestRes = await fetch(`${rpcUrl}/wallet/getnowblock`);
    const latestBlock = await latestRes.json();

    const confirmations = latestBlock.block_header.raw_data.number - txInfo.blockNumber;

    // Parse TRC20 Transfer event from logs
    // TRC20 Transfer: Transfer(address,address,uint256)
    // topic0: keccak256("Transfer(address,address,uint256)") = 0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef
    const transferLogs = txInfo.log?.filter(log =>
      log.topics?.[0] === 'ddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef' &&
      log.address === contractAddress
    ) || [];

    if (transferLogs.length === 0) {
      return { success: false, error: 'No TRC20 Transfer event found', confirmations };
    }

    const log = transferLogs[0];
    // topics[1] = from (padded), topics[2] = to (padded), data = amount (hex)
    const toAddress = 'T' + log.topics[2].slice(-40); // Tron address format
    const amountRaw = BigInt('0x' + log.data).toString();

    const addressMatch = toAddress.toLowerCase() === expectedAddress.toLowerCase();
    const amountMatch = amountRaw === expectedAmountRaw;

    return {
      success: addressMatch && amountMatch,
      confirmations,
      txData: {
        from: 'T' + log.topics[1].slice(-40),
        to: toAddress,
        amountRaw,
        blockNumber: txInfo.blockNumber,
        timestamp: txInfo.blockTimeStamp,
      },
      addressMatch,
      amountMatch,
    };
  } catch (e) {
    return { success: false, error: e.message, confirmations: 0 };
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
    const receipt = await client.getTransactionReceipt({ hash: txHash as `0x${string}` });

    if (!receipt || receipt.status !== 'success') {
      return { success: false, error: 'Transaction failed or not found', confirmations: 0 };
    }

    // Get current block for confirmations
    const currentBlock = await client.getBlockNumber();
    const confirmations = Number(currentBlock - receipt.blockNumber);

    // Find Transfer event in logs
    const transferLogs = receipt.logs.filter(log =>
      log.address.toLowerCase() === contractAddress.toLowerCase() &&
      log.topics[0] === '0xddf252ad1be2c89b69c2b068fc378daa952ba7f163c4a11628f55a4df523b3ef'
    );

    if (transferLogs.length === 0) {
      return { success: false, error: 'No ERC20 Transfer event found', confirmations };
    }

    // Decode the first matching transfer
    const log = transferLogs[0];
    const decoded = client.decodeEventLog({
      abi: erc20Abi,
      data: log.data,
      topics: log.topics,
    });

    const toAddress = decoded.args.to;
    const amountRaw = decoded.args.value.toString();

    const addressMatch = toAddress.toLowerCase() === expectedAddress.toLowerCase();
    const amountMatch = amountRaw === expectedAmountRaw;

    return {
      success: addressMatch && amountMatch,
      confirmations,
      txData: {
        from: decoded.args.from,
        to: toAddress,
        amountRaw,
        blockNumber: Number(receipt.blockNumber),
        gasUsed: Number(receipt.gasUsed),
      },
      addressMatch,
      amountMatch,
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
      'verification.retryCount': { $lt: 10 }, // Max 10 retries
    })
    .sort({ 'verification.lastCheckedAt': 1 }) // Oldest check first
    .limit(limit)
    .toArray();

  const results = [];

  for (const invoice of invoices) {
    // Check if expired
    if (new Date(invoice.expiresAt) < new Date()) {
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

        // Update order
        await db.collection('orders').updateOne(
          { id: invoice.orderId },
          {
            $set: {
              paymentStatus: 'paid',
              status: 'paid',
              updatedAt: new Date().toISOString(),
              'paymentRef.txHash': invoice.txHash,
              'paymentRef.confirmedAt': new Date().toISOString(),
            },
            $push: {
              statusHistory: {
                status: 'paid',
                at: new Date().toISOString(),
                by: 'auto-verification',
                notes: `Auto-verificado: ${verification.confirmations} confirmaciones en ${invoice.network}`
              }
            }
          }
        );

        results.push({ invoiceId: invoice.id, status: 'auto-approved', confirmations: verification.confirmations });
      } else if (verification.success && verification.confirmations < requiredConfirmations) {
        // Underpaid/overpaid check would go here
        update.$set.status = 'submitted'; // Still pending confirmations
        results.push({ invoiceId: invoice.id, status: 'pending-confirmations', confirmations: verification.confirmations, required: requiredConfirmations });
      } else {
        // Verification failed (wrong address/amount)
        update.$set.status = 'rejected';
        update.$set.rejectReason = verification.error || 'Verificación fallida: dirección o importe incorrecto';
        update.$set.rejectedAt = new Date().toISOString();
        update.$set.rejectedBy = 'auto-verification';

        // Restore stock
        const order = await db.collection('orders').findOne({ id: invoice.orderId });
        if (order) {
          for (const item of order.items) {
            await db.collection('products').updateOne(
              { id: item.productId },
              { $inc: { stock: item.quantity } }
            );
          }
          await db.collection('orders').updateOne(
            { id: order.id },
            { $set: { paymentStatus: 'payment_failed', status: 'payment_failed', updatedAt: new Date().toISOString() } }
          );
        }

        results.push({ invoiceId: invoice.id, status: 'auto-rejected', error: verification.error });
      }

      await db.collection('crypto_invoices').updateOne({ id: invoice.id }, update);

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
