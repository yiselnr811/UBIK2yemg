import { PrivyClient } from '@privy-io/node';

let cachedClient;

export function getPrivyClient() {
  if (typeof window !== 'undefined') {
    throw new Error('Privy solo puede utilizarse en el servidor.');
  }

  if (cachedClient) return cachedClient;

  const appId = process.env.PRIVY_APP_ID;
  const appSecret = process.env.PRIVY_APP_SECRET;

  if (!appId || !appSecret) {
    throw new Error('Configuración de Privy incompleta en el servidor.');
  }

  cachedClient = new PrivyClient({ appId, appSecret });
  return cachedClient;
}

export async function checkPrivyConnection() {
  const client = getPrivyClient();

  // Consulta de solo lectura: no crea billeteras ni envía fondos.
  const page = await client.wallets().list({ limit: 1 });

  return {
    connected: true,
    walletsInSample: Array.isArray(page.data) ? page.data.length : 0,
    transfersEnabled: false,
  };
}
