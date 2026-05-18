// Server-rendered product page used for SHARED LINKS.
// Provides OpenGraph metadata for WhatsApp/Facebook/Twitter previews.
// Renders proper HTML (NOT a 307 redirect) so crawlers can read the OG tags.
// Real browsers are auto-redirected to the SPA via a client-side script.

const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function fetchProduct(id) {
  try {
    const { MongoClient } = await import('mongodb');
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const product = await db.collection('products').findOne({ id });
    if (!product) { await client.close(); return null; }
    const business = product.businessId
      ? await db.collection('businesses').findOne({ id: product.businessId }, { projection: { name: 1, location: 1 } })
      : null;
    await client.close();
    return { ...product, business };
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const product = await fetchProduct(params.id);
  if (!product) {
    return { title: 'Producto no encontrado · UBIK2 YEMG', description: 'Marketplace cubano de MiPymes' };
  }
  const priceLabel = product.currency === 'USDC'
    ? `${Number(product.price).toLocaleString()} USDC`
    : `${Number(product.price).toLocaleString()} CUP`;
  const title = `${product.name} — ${priceLabel} · UBIK2 YEMG`;
  const shortDesc = (product.description || '').slice(0, 160)
    || `${product.name} disponible en ${product.business?.name || 'UBIK2 YEMG'}. Precio: ${priceLabel}.`;
  const shareUrl = `${BASE_URL}/product/${product.id}`;
  const ogImage = product.image && product.image.startsWith('http')
    ? product.image
    : `${BASE_URL}/logo.png`;
  return {
    title,
    description: shortDesc,
    openGraph: {
      title,
      description: shortDesc,
      url: shareUrl,
      siteName: 'UBIK2 YEMG',
      images: [{ url: ogImage, width: 1200, height: 630, alt: product.name }],
      locale: 'es_CU',
      type: 'website',
    },
    twitter: {
      card: 'summary_large_image',
      title,
      description: shortDesc,
      images: [ogImage],
    },
    alternates: { canonical: shareUrl },
  };
}

export default async function SharedProductPage({ params }) {
  const product = await fetchProduct(params.id);
  // Important: do NOT use redirect() here. We render a full HTML page so social media
  // crawlers (which do NOT execute JS and often do NOT follow redirects) can read
  // the OpenGraph metadata. Real browsers are redirected via inline JS.
  const safeId = encodeURIComponent(params.id);
  const targetUrl = `/?product=${safeId}`;
  const priceLabel = product
    ? (product.currency === 'USDC'
      ? `${Number(product.price).toLocaleString()} USDC`
      : `${Number(product.price).toLocaleString()} CUP`)
    : '';
  return (
    <>
      {/* eslint-disable-next-line @next/next/no-sync-scripts */}
      <script
        dangerouslySetInnerHTML={{
          __html: `try{window.location.replace(${JSON.stringify(targetUrl)})}catch(e){}`,
        }}
      />
      <noscript>
        <meta httpEquiv="refresh" content={`0; url=${targetUrl}`} />
      </noscript>
      <div style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
        padding: 24,
        background: 'linear-gradient(135deg, #1565C0 0%, #00A86B 100%)',
        color: 'white',
        textAlign: 'center',
      }}>
        <div style={{ maxWidth: 600 }}>
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
            {product ? product.name : 'Producto'}
          </h1>
          {product && (
            <p style={{ fontSize: 18, marginTop: 8, opacity: 0.92 }}>
              {priceLabel} · {product.business?.name || 'UBIK2 YEMG'}
            </p>
          )}
          <p style={{ marginTop: 24, opacity: 0.85 }}>Abriendo en UBIK2 YEMG…</p>
          <p style={{ marginTop: 12 }}>
            <a href={targetUrl} style={{ color: 'white', fontWeight: 700, textDecoration: 'underline' }}>
              Toca aquí si no te redirige automáticamente
            </a>
          </p>
        </div>
      </div>
    </>
  );
}
