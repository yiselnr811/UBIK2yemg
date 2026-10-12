// Server-rendered public BUSINESS page used for SHARED LINKS.
// Provides OpenGraph metadata so WhatsApp/Facebook/Twitter generate rich previews
// with the business logo, name and description.
// Real browsers are auto-redirected (client-side) to the SPA via `/?business=<id>`.
// Crawlers (which do NOT execute JS) read the OG tags directly from the HTML.

const DB_NAME = process.env.DB_NAME || 'ubik2_yemg';
const BASE_URL = process.env.NEXT_PUBLIC_BASE_URL || 'http://localhost:3000';

async function fetchBusiness(id) {
  try {
    const { MongoClient } = await import('mongodb');
    if (!process.env.MONGO_URL) return null;
    const client = new MongoClient(process.env.MONGO_URL);
    await client.connect();
    const db = client.db(DB_NAME);
    const business = await db.collection('businesses').findOne({ id });
    if (!business) { await client.close(); return null; }
    const productsCount = await db.collection('products').countDocuments({ businessId: id });
    await client.close();
    return { ...business, productsCount };
  } catch (e) {
    return null;
  }
}

export async function generateMetadata({ params }) {
  const business = await fetchBusiness(params.id);
  if (!business) {
    return {
      title: 'Negocio no encontrado · UBIK2 YEMG',
      description: 'Marketplace cubano de MiPymes',
    };
  }
  const title = `${business.name} · UBIK2 YEMG`;
  const shortDesc = (business.description || '').slice(0, 160)
    || `Visita ${business.name} en UBIK2 YEMG${business.location ? ` — ${business.location}` : ''}.`;
  const shareUrl = `${BASE_URL}/b/${business.id}`;
  // Use a Cloudinary 1200x630 OG-formatted image if logo is hosted on Cloudinary.
  const ogImage = business.logo && business.logo.includes('res.cloudinary.com')
    ? business.logo.replace('/upload/', '/upload/c_pad,w_1200,h_630,b_auto,f_jpg,q_auto/')
    : (business.logo && business.logo.startsWith('http') ? business.logo : `${BASE_URL}/logo.png`);
  return {
    title,
    description: shortDesc,
    openGraph: {
      title,
      description: shortDesc,
      url: shareUrl,
      siteName: 'UBIK2 YEMG',
      images: [{ url: ogImage, width: 1200, height: 630, alt: business.name }],
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

export default async function SharedBusinessPage({ params }) {
  const business = await fetchBusiness(params.id);
  const safeId = encodeURIComponent(params.id);
  const targetUrl = `/?business=${safeId}`;
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
          {business?.logo && (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={business.logo}
              alt={business.name}
              style={{
                width: 96, height: 96, borderRadius: 20, objectFit: 'cover',
                margin: '0 auto 16px', border: '4px solid rgba(255,255,255,0.25)',
                boxShadow: '0 8px 24px rgba(0,0,0,0.2)',
              }}
            />
          )}
          <h1 style={{ fontSize: 28, fontWeight: 800, margin: 0 }}>
            {business ? business.name : 'Negocio'}
          </h1>
          {business?.location && (
            <p style={{ fontSize: 16, marginTop: 6, opacity: 0.92 }}>📍 {business.location}</p>
          )}
          {business?.description && (
            <p style={{ marginTop: 12, opacity: 0.92, lineHeight: 1.5 }}>
              {business.description.slice(0, 220)}
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
