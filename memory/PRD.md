# PRD — UBIK2 YEMG (Marketplace)

## Visión
Marketplace moderno mobile-first para Cuba/LATAM: comprar y vender productos y servicios. PWA rápida en redes lentas (2G/3G), imágenes optimizadas con Cloudinary, multi-moneda.

## Stack
- Next.js 14 App Router (frontend SPA en /app/app/page.js + API monolítica en /app/app/api/[[...path]]/route.js)
- MongoDB (MONGO_URL de .env, DB: ubik2_yemg) — NO migrar a otra DB
- Tailwind + shadcn/ui, JWT auth, Cloudinary (imágenes), Resend (emails, sandbox)

## Funcionalidades existentes
- Auth (comprador/vendedor/admin), recuperación de contraseña (Resend)
- Productos: CRUD, filtros avanzados (categoría jerárquica, subcategoría, país, tipo de negocio, moneda, precio), búsqueda con autocompletado
- Negocios: página pública compartible /b/[id] con OpenGraph; /product/[id] ídem
- Home rediseñado: hero compacto, menú visual, carrusel de negocios destacados, productos priorizados
- Multi-moneda UI (9 monedas), favoritos, reseñas, reportes, panel admin (pagos, usuarios, settings)
- PWA: service worker v2 (network-first para JS/_next, HTML; cache-first solo para íconos e imágenes)

## Sesión actual (fixes defensivos)
- Bug "Cannot read properties of undefined (reading 'startsWith')": causado por MONGO_URL undefined al crear MongoClient (ocurre en despliegues externos sin env vars, ej. Render). Fix: fallback + guards en route.js, /b/[id], /product/[id].
- Barrido defensivo: guards en file.type, Reviews (respuesta vacía), setStats admin, toLocaleString con locale explícito.
- Build de producción: 0 errores. Backend regression: 100% endpoints OK.
- Fix previo: Service Worker cacheaba JS viejo (cache-first) → causa del error de hidratación; ahora network-first + versión v2.

## Entornos
- PREVIEW (este entorno) / PRODUCCIÓN: https://ubik2yemg.qzz.io (usuario debe hacer Redeploy para recibir fixes)
- El usuario también intenta desplegar por su cuenta en Render → necesita configurar: MONGO_URL, DB_NAME, NEXT_PUBLIC_BASE_URL, JWT_SECRET, RESEND_*, CLOUDINARY_*

## Backlog (Fase 2/3)
- Conversión automática de monedas (API tipos de cambio)
- Pagos internacionales (PayPal, Stripe, USDT TRC20/BEP20)
- Geolocalización + orden por distancia ($geoNear)
- Dashboard de métricas para vendedores
- Verificar dominio propio en Resend (salir de sandbox)

## Credenciales
Ver /app/memory/test_credentials.md (admin: admin@ubik2.com / admin123; usuario: ubik2yemg@gmail.com / Yisel.112729)
