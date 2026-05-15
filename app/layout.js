import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_BASE_URL || 'https://mipyme-hub.emergent.host'),
  title: {
    default: 'UBIK2 YEMG — Todo en un solo lugar',
    template: '%s | UBIK2 YEMG',
  },
  description:
    'Marketplace moderno para comprar y vender productos y servicios. Compra fácil, vende rápido. Conectando compradores y vendedores en Cuba y LATAM.',
  keywords: [
    'marketplace',
    'comprar',
    'vender',
    'Cuba',
    'LATAM',
    'productos',
    'servicios',
    'mipymes',
    'ubik2',
    'yemg',
  ],
  authors: [{ name: 'UBIK2 YEMG' }],
  icons: {
    icon: '/logo.png',
    apple: '/logo.png',
  },
  openGraph: {
    title: 'UBIK2 YEMG — Todo en un solo lugar',
    description: 'Compra fácil. Vende rápido. Conectando compradores y vendedores.',
    images: ['/logo.png'],
    type: 'website',
    locale: 'es_CU',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'UBIK2 YEMG',
    description: 'Todo en un solo lugar.',
    images: ['/logo.png'],
  },
};

export const viewport = {
  themeColor: '#1565C0',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" suppressHydrationWarning>
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-center" />
      </body>
    </html>
  );
}
