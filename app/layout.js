import './globals.css';
import { Toaster } from '@/components/ui/sonner';

export const metadata = {
  title: 'UBIK2 YEMG — Marketplace para MiPymes Cubanas',
  description: 'Plataforma marketplace moderna para MiPymes cubanas y LATAM. Publica tus productos y servicios en minutos.',
};

export default function RootLayout({ children }) {
  return (
    <html lang="es" className="dark">
      <body className="min-h-screen bg-background text-foreground antialiased">
        {children}
        <Toaster richColors position="top-center" theme="dark" />
      </body>
    </html>
  );
}
