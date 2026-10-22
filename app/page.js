'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
import jsQR from 'jsqr';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import { Skeleton } from '@/components/ui/skeleton';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogAction,
  AlertDialogCancel,
} from '@/components/ui/alert-dialog';
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from '@/components/ui/sheet';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import {
  Search, ShoppingBag, Plus, LayoutDashboard, LogOut, Store, MessageCircle,
  MapPin, Crown, Trash2, Pencil, ArrowLeft, Check, Loader2, Instagram, Facebook,
  Heart, Share2, Flag, Filter, Globe, Sun, Moon, ShieldCheck, Phone, Mail,
  Send, Sparkles, ChevronRight, Tag, Clock, X, Menu, Star, TrendingUp,
  Leaf, ImageOff, ImageIcon,
  AlertCircle, CheckCircle, XCircle, CreditCard, Wallet, Copy,
} from 'lucide-react';
import { toast } from 'sonner';
import AadsFloatingAd from '@/components/AadsFloatingAd';

const API = '/api';
const LOGO = '/logo.svg';

// ========= i18n =========
const TRANSLATIONS = {
  es: {
    slogan: 'Todo en un solo lugar.',
    cartTitle: "Mi carrito",
    cartSubtitle: "Revisa tus productos antes de pagar.",
    continueShopping: "Seguir comprando",
    emptyCart: "Tu carrito está vacío",
    emptyCartDesc: "Abre un producto y pulsa «Añadir al carrito».",
    viewProducts: "Ver productos",
    removeItem: "Quitar",
    estimatedSubtotal: "Subtotal estimado",
    serverCalculatesTotal: "El servidor calcula el importe definitivo al crear el pedido.",
    payCartCrypto: "Pagar carrito con crypto",
    productFallback: "Producto",
    languageLabel: "Idioma",
    legalLabel: "Legal",
    rightsReserved: "Todos los derechos reservados",
    loginRequired: "Necesitas iniciar sesión",
    subSlogan: 'Compra fácil. Vende rápido. Conectando compradores y vendedores.',
    searchPlaceholder: 'Buscar productos, servicios o categorías...',
    publish: 'Publicar anuncio',
    enter: 'Entrar',
    panel: 'Mi panel',
    admin: 'Admin',
    home: 'Inicio',
    categories: 'Categorías',
    allCategories: 'Todas',
    latest: 'Últimas publicaciones',
    recommended: 'Productos destacados',
    stats: 'Una comunidad creciendo',
    cta: 'Compra y vende fácil con UBIK2 YEMG',
    ctaSub: 'Publica tu anuncio en menos de un minuto. Es totalmente gratis para empezar.',
    publishFree: 'Publicar gratis',
    explore: 'Explorar marketplace',
    contact: 'Contactar',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    sms: 'SMS / Llamar',
    favorites: 'Favoritos',
    share: 'Compartir',
    report: 'Reportar',
    seller: 'Vendedor',
    verified: 'Verificado',
    seeStore: 'Ver tienda',
    products: 'productos',
    businesses: 'negocios',
    sellers: 'vendedores',
    privacyPolicy: 'Política de privacidad',
    terms: 'Términos y condiciones',
    officialContact: 'Contacto oficial',
    filters: 'Filtros',
    location: 'Ubicación',
    priceMin: 'Precio mínimo',
    priceMax: 'Precio máximo',
    date: 'Fecha',
    anytime: 'Cualquier fecha',
    last7: 'Últimos 7 días',
    last30: 'Últimos 30 días',
    last90: 'Últimos 90 días',
    clear: 'Limpiar',
    apply: 'Aplicar',
    noResults: 'No se encontraron resultados',
    inStock: 'Disponible',
    outOfStock: 'Agotado',
    featured: 'Destacado',
    new: 'Nuevo',
    // Crypto
    buyingWithCrypto: 'Comprar con Crypto',
    invoiceExpired: 'Factura expirada',
    pendingPayment: 'Pendiente de pago',
    txHashSubmitted: 'TxHash enviado - En verificación',
    paymentConfirmed: 'Pago confirmado y aprobado',
    paymentRejected: 'Pago rechazado',
    sendTxHash: 'Enviar hash de transacción',
    txHashPlaceholder: '0x... o hash de Tron (64 hex)',
    copyAddress: 'Copiar dirección',
    receiverAddress: 'Dirección receptora (solo depósito)',
    expectedAmount: 'Importe esperado',
    paymentDetails: 'Detalles del pago',
    orderSummary: 'Resumen del pedido',
    verificationNote: 'El administrador verificará la transacción en el blockchain. No se marca pagado solo por enviar el hash.',
    pendingVerification: 'En verificación',
    verificationDesc: 'Un administrador lo verificará manualmente en el explorer. Recibirás notificación cuando se apruebe o rechace.',
    paymentApproved: '¡Pago confirmado!',
    approvedDesc: 'Tu pedido ha sido marcado como pagado. El vendedor preparará tu pedido.',
    paymentRejectedDesc: 'Pago rechazado',
    rejectedDesc: 'Motivo: {reason}',
    stockRestored: 'El stock ha sido restaurado. Puedes crear un nuevo pedido.',
    invoiceExpiredDesc: 'El tiempo para pagar ha terminado. El stock ha sido restaurado.',
      accountSubtitle: 'Tu cuenta personal de UBIK2 YEMG',
    becomeSellerTitle: '¿Tienes algo para vender?',
    becomeSellerDesc: 'Conviértete en vendedor gratis y publica hasta 10 productos.',
    accountEmail: 'Email de tu cuenta',
    myOrdersInvoices: 'Mis pedidos y facturas',
    loadingOrders: 'Cargando tus pedidos…',
    noOrders: 'Todavía no tienes pedidos asociados a esta cuenta.',
    orderDate: 'Fecha',
    orderStatus: 'Estado del pedido',
    deliveryData: 'Datos de entrega',
    noProductDetails: 'No hay detalles de productos disponibles.',
    downloadInvoiceQR: 'Descargar factura PDF con QR',
    verifyInvoice: 'Verificar factura',
    invoiceNumber: 'Número de factura:',
    loadingInvoice: 'Cargando factura…',
    hideInvoice: 'Ocultar factura',
    viewPaymentInvoice: 'Ver factura de pago',
    sellerOrdersTitle: 'Pedidos y entregas',
    sellerOrdersDesc: 'Actualiza el envío de los pedidos de tu comercio. Solo puedes gestionar pedidos con el pago confirmado.',
    loadingSellerOrders: 'Cargando pedidos...',
    noSellerOrders: 'Todavía no hay pedidos para este comercio.',
    orderLabel: 'Pedido',
    dateUnavailable: 'Fecha no disponible',
    paymentConfirmedLabel: 'Pago confirmado',
    paymentPendingLabel: 'Pago pendiente',
    buyerConfirmedReceipt: 'El comprador confirmó la recepción.',
    awaitingBuyerReceipt: 'Entrega marcada. Pendiente de confirmación del comprador.',
    shippingStatus: 'Estado del envío',
    trackingNumber: 'Número de seguimiento',
    buyerNotes: 'Notas para el comprador',
    deliveryPhotos: 'Fotos de entrega (máximo 4 por actualización)',
    registeredPhotos: 'Fotos registradas',
    shippingHistory: 'Historial de estados',
    saveTracking: 'Guardar seguimiento',
    saving: 'Guardando...',
    ordersLoadError: 'No se pudieron cargar los pedidos.',
    invoiceLoadError: 'No se pudo cargar la factura.',
    receiptError: 'No se pudo confirmar la recepción.',
    hashSent: 'Hash enviado. Pago pendiente de verificación.',
    hashError: 'No se pudo enviar el hash.',
    qrDownloadError: 'No se pudo descargar el QR.',
    invoiceIdMissing: 'La factura todavía no tiene identificador.',
    invalidInvoiceId: 'Esta factura todavía no tiene identificador válido.',
    trackingSaveError: 'No se pudo guardar el seguimiento.',
    addressLabel: 'Dirección',
    carrierPlaceholder: 'Ej. transportista local',
    deliveryNotesPlaceholder: 'Información sobre la preparación o entrega',
    photosWillUpload: 'Las fotos seleccionadas se subirán al guardar. Fotos ya registradas:',
    personalGreeting: 'Hola',
    basicPlan: 'Plan Básico',
    premiumPlan: 'Plan Premium',
    premiumActive: 'Premium activo',
    improvePlan: 'Mejorar plan',
    newProduct: 'Nuevo producto',
    totalProducts: 'Total productos',
    groupByCategory: 'Agrupar por categoría',
    noOutOfStock: '¡No tienes productos agotados! 🎉',
    noFeaturedProducts: 'No tienes productos destacados.',
    noActiveProducts: 'No tienes productos activos.',
    noPublishedProducts: 'Aún no tienes productos publicados.',
    publishFirst: 'Publica el primero',
    createProduct: 'Crear producto',
    noLogoTitle: 'Aún no tienes logo.',
    noLogoDesc: 'Súbelo ahora para que los compradores te encuentren más fácilmente y tu negocio se vea profesional. Se comprime y optimiza automáticamente.',
    saveWallets: 'Guardar billeteras',
    walletsNoTransfers: 'Guardar estos datos no activa transferencias automáticas.',
    productNotVisible: 'Este producto no será visible en el marketplace porque no tiene stock disponible. Edítalo y agrega stock para reactivarlo.',
    edit: 'Editar',
    product: 'Producto',
    total: 'Total',
    sellerLoadingError: 'No se pudieron cargar los pedidos.',
    trackingNumberLabel: 'Número de seguimiento',

      preparingOrder: 'Preparando pedido',
      shipped: 'Enviado',
      delivered: 'Entregado'
    },
  en: {
    slogan: 'All in one place.',
    cartTitle: "My cart",
    cartSubtitle: "Review your products before paying.",
    continueShopping: "Continue shopping",
    emptyCart: "Your cart is empty",
    emptyCartDesc: "Open a product and press “Add to cart”.",
    viewProducts: "View products",
    removeItem: "Remove",
    estimatedSubtotal: "Estimated subtotal",
    serverCalculatesTotal: "The server calculates the final amount when creating the order.",
    payCartCrypto: "Pay cart with crypto",
    productFallback: "Product",
    languageLabel: "Language",
    legalLabel: "Legal",
    rightsReserved: "All rights reserved",
    loginRequired: "You need to sign in",
    subSlogan: 'Buy easy. Sell fast. Connecting buyers and sellers.',
    searchPlaceholder: 'Search products, services or categories...',
    publish: 'Post ad',
    enter: 'Sign in',
    panel: 'My panel',
    admin: 'Admin',
    home: 'Home',
    categories: 'Categories',
    allCategories: 'All',
    latest: 'Latest listings',
    recommended: 'Featured products',
    stats: 'A growing community',
    cta: 'Buy and sell easily with UBIK2 YEMG',
    ctaSub: 'Post your ad in less than a minute. Totally free to start.',
    publishFree: 'Post for free',
    explore: 'Explore marketplace',
    contact: 'Contact',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    sms: 'SMS / Call',
    favorites: 'Favorites',
    share: 'Share',
    report: 'Report',
    seller: 'Seller',
    verified: 'Verified',
    seeStore: 'View store',
    products: 'products',
    businesses: 'businesses',
    sellers: 'sellers',
    privacyPolicy: 'Privacy policy',
    terms: 'Terms and conditions',
    officialContact: 'Official contact',
    filters: 'Filters',
    location: 'Location',
    // Crypto
    buyingWithCrypto: 'Buy with Crypto',
    invoiceExpired: 'Invoice expired',
    pendingPayment: 'Pending payment',
    txHashSubmitted: 'TxHash submitted - Under verification',
    paymentConfirmed: 'Payment confirmed and approved',
    paymentRejected: 'Payment rejected',
    sendTxHash: 'Send transaction hash',
    txHashPlaceholder: '0x... or Tron hash (64 hex)',
    copyAddress: 'Copy address',
    receiverAddress: 'Receiver address (deposit only)',
    expectedAmount: 'Expected amount',
    paymentDetails: 'Payment details',
    orderSummary: 'Order summary',
    verificationNote: 'Admin will verify transaction on blockchain. Not marked paid just by sending hash.',
    pendingVerification: 'Under verification',
    verificationDesc: 'Admin will verify manually on explorer. You\'ll be notified when approved or rejected.',
    paymentApproved: 'Payment confirmed!',
    approvedDesc: 'Your order has been marked as paid. Seller will prepare your order.',
    paymentRejectedDesc: 'Payment rejected',
    rejectedDesc: 'Reason: {reason}',
    stockRestored: 'Stock restored. You can create a new order.',
    invoiceExpiredDesc: 'Payment time expired. Stock restored.',
    priceMin: 'Min price',
    priceMax: 'Max price',
    date: 'Date',
    anytime: 'Anytime',
    last7: 'Last 7 days',
    last30: 'Last 30 days',
    last90: 'Last 90 days',
    clear: 'Clear',
    apply: 'Apply',
    noResults: 'No results found',
    inStock: 'In stock',
    outOfStock: 'Out of stock',
    featured: 'Featured',
    new: 'New',
      accountSubtitle: 'Your personal UBIK2 YEMG account',
    becomeSellerTitle: 'Have something to sell?',
    becomeSellerDesc: 'Become a seller for free and publish up to 10 products.',
    accountEmail: 'Account email',
    myOrdersInvoices: 'My orders and invoices',
    loadingOrders: 'Loading your orders…',
    noOrders: "You don't have any orders associated with this account yet.",
    orderDate: 'Date',
    orderStatus: 'Order status',
    deliveryData: 'Delivery details',
    noProductDetails: 'No product details available.',
    downloadInvoiceQR: 'Download PDF invoice with QR',
    verifyInvoice: 'Verify invoice',
    invoiceNumber: 'Invoice number:',
    loadingInvoice: 'Loading invoice…',
    hideInvoice: 'Hide invoice',
    viewPaymentInvoice: 'View payment invoice',
    sellerOrdersTitle: 'Orders and deliveries',
    sellerOrdersDesc: "Update shipping for your store's orders. You can only manage orders with confirmed payment.",
    loadingSellerOrders: 'Loading orders...',
    noSellerOrders: 'There are no orders for this store yet.',
    orderLabel: 'Order',
    dateUnavailable: 'Date unavailable',
    paymentConfirmedLabel: 'Payment confirmed',
    paymentPendingLabel: 'Payment pending',
    buyerConfirmedReceipt: 'The buyer confirmed receipt.',
    awaitingBuyerReceipt: 'Delivery marked. Waiting for buyer confirmation.',
    shippingStatus: 'Shipping status',
    trackingNumber: 'Tracking number',
    buyerNotes: 'Notes for the buyer',
    deliveryPhotos: 'Delivery photos (up to 4 per update)',
    registeredPhotos: 'Registered photos',
    shippingHistory: 'Status history',
    saveTracking: 'Save tracking',
    saving: 'Saving...',
    ordersLoadError: "Couldn't load orders.",
    invoiceLoadError: "Couldn't load the invoice.",
    receiptError: "Couldn't confirm receipt.",
    hashSent: 'Hash submitted. Payment verification pending.',
    hashError: "Couldn't submit the hash.",
    qrDownloadError: "Couldn't download the QR.",
    invoiceIdMissing: "The invoice doesn't have an identifier yet.",
    invalidInvoiceId: "This invoice doesn't have a valid identifier yet.",
    trackingSaveError: "Couldn't save tracking information.",
    addressLabel: 'Address',
    carrierPlaceholder: 'e.g. local carrier',
    deliveryNotesPlaceholder: 'Information about preparation or delivery',
    photosWillUpload: 'Selected photos will be uploaded when saved. Already registered photos:',
    personalGreeting: 'Hello',
    basicPlan: 'Basic plan',
    premiumPlan: 'Premium plan',
    premiumActive: 'Premium active',
    improvePlan: 'Upgrade plan',
    newProduct: 'New product',
    totalProducts: 'Total products',
    groupByCategory: 'Group by category',
    noOutOfStock: 'No out-of-stock products! 🎉',
    noFeaturedProducts: 'You have no featured products.',
    noActiveProducts: 'You have no active products.',
    noPublishedProducts: "You haven't published any products yet.",
    publishFirst: 'Publish your first',
    createProduct: 'Create product',
    noLogoTitle: "You don't have a logo yet.",
    noLogoDesc: 'Upload one so buyers can find you more easily and your business looks professional. It is automatically compressed and optimized.',
    saveWallets: 'Save wallets',
    walletsNoTransfers: 'Saving this information does not enable automatic transfers.',
    productNotVisible: "This product won't be visible in the marketplace because it has no stock. Edit it and add stock to reactivate it.",
    edit: 'Edit',
    product: 'Product',
    total: 'Total',
    sellerLoadingError: "Couldn't load orders.",
    trackingNumberLabel: 'Tracking number',

      preparingOrder: 'Preparing order',
      shipped: 'Shipped',
      delivered: 'Delivered'
    },
  it: {
    slogan: 'Tutto in un solo posto.',
    cartTitle: "Il mio carrello",
    cartSubtitle: "Controlla i prodotti prima di pagare.",
    continueShopping: "Continua gli acquisti",
    emptyCart: "Il carrello è vuoto",
    emptyCartDesc: "Apri un prodotto e premi «Aggiungi al carrello».",
    viewProducts: "Vedi prodotti",
    removeItem: "Rimuovi",
    estimatedSubtotal: "Subtotale stimato",
    serverCalculatesTotal: "Il server calcola l'importo definitivo quando crea l'ordine.",
    payCartCrypto: "Paga il carrello con crypto",
    productFallback: "Prodotto",
    languageLabel: "Lingua",
    legalLabel: "Informazioni legali",
    rightsReserved: "Tutti i diritti riservati",
    loginRequired: "Devi accedere",
    subSlogan: 'Compra facile. Vendi veloce. Collegando acquirenti e venditori.',
    searchPlaceholder: 'Cerca prodotti, servizi o categorie...',
    publish: 'Pubblica annuncio',
    enter: 'Accedi',
    panel: 'Pannello',
    admin: 'Admin',
    home: 'Home',
    categories: 'Categorie',
    allCategories: 'Tutte',
    latest: 'Ultimi annunci',
    recommended: 'In evidenza',
    stats: 'Una comunità in crescita',
    cta: 'Compra e vendi facilmente con UBIK2 YEMG',
    ctaSub: "Pubblica il tuo annuncio in meno di un minuto. È gratis.",
    publishFree: 'Pubblica gratis',
    explore: 'Esplora marketplace',
    contact: 'Contatta',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    sms: 'SMS / Chiama',
    favorites: 'Preferiti',
    share: 'Condividi',
    report: 'Segnala',
    seller: 'Venditore',
    verified: 'Verificato',
    seeStore: 'Vedi negozio',
    products: 'prodotti',
    businesses: 'negozi',
    sellers: 'venditori',
    privacyPolicy: 'Privacy',
    terms: 'Termini',
    officialContact: 'Contatto ufficiale',
    filters: 'Filtri',
    location: 'Luogo',
    priceMin: 'Prezzo min',
    priceMax: 'Prezzo max',
    date: 'Data',
    anytime: 'Qualsiasi data',
    last7: 'Ultimi 7 giorni',
    last30: 'Ultimi 30 giorni',
    last90: 'Ultimi 90 giorni',
    clear: 'Pulisci',
    apply: 'Applica',
    noResults: 'Nessun risultato',
    inStock: 'Disponibile',
    outOfStock: 'Esaurito',
    featured: 'In evidenza',
    new: 'Nuovo',
    // Crypto
    buyingWithCrypto: 'Compra con Crypto',
    invoiceExpired: 'Fattura scaduta',
    pendingPayment: 'Pagamento in attesa',
    txHashSubmitted: 'TxHash inviato - In verifica',
    paymentConfirmed: 'Pagamento confermato e approvato',
    paymentRejected: 'Pagamento rifiutato',
    sendTxHash: 'Invia hash transazione',
    txHashPlaceholder: '0x... o hash Tron (64 hex)',
    copyAddress: 'Copia indirizzo',
    receiverAddress: 'Indirizzo ricevente (solo deposito)',
    expectedAmount: 'Importo atteso',
    paymentDetails: 'Dettagli pagamento',
    orderSummary: 'Riepilogo ordine',
    verificationNote: 'L\'admin verificherà la transazione sulla blockchain. Non segnato come pagato solo inviando l\'hash.',
    pendingVerification: 'In verifica',
    verificationDesc: 'L\'admin verificherà manualmente sull\'explorer. Sarai notificato quando approvato o rifiutato.',
    paymentApproved: 'Pagamento confermato!',
    approvedDesc: 'Il tuo ordine è stato segnato come pagato. Il venditore preparerà il tuo ordine.',
    paymentRejectedDesc: 'Pagamento rifiutato',
    rejectedDesc: 'Motivo: {reason}',
    stockRestored: 'Stock ripristinato. Puoi creare un nuovo ordine.',
    invoiceExpiredDesc: 'Tempo di pagamento scaduto. Stock ripristinato.',
      accountSubtitle: 'Il tuo account personale UBIK2 YEMG',
    becomeSellerTitle: 'Hai qualcosa da vendere?',
    becomeSellerDesc: 'Diventa venditore gratuitamente e pubblica fino a 10 prodotti.',
    accountEmail: 'Email del tuo account',
    myOrdersInvoices: 'I miei ordini e fatture',
    loadingOrders: 'Caricamento degli ordini…',
    noOrders: 'Non hai ancora ordini associati a questo account.',
    orderDate: 'Data',
    orderStatus: "Stato dell'ordine",
    deliveryData: 'Dati di consegna',
    noProductDetails: 'Nessun dettaglio dei prodotti disponibile.',
    downloadInvoiceQR: 'Scarica la fattura PDF con QR',
    verifyInvoice: 'Verifica fattura',
    invoiceNumber: 'Numero fattura:',
    loadingInvoice: 'Caricamento fattura…',
    hideInvoice: 'Nascondi fattura',
    viewPaymentInvoice: 'Visualizza fattura di pagamento',
    sellerOrdersTitle: 'Ordini e consegne',
    sellerOrdersDesc: 'Aggiorna la spedizione degli ordini del tuo negozio. Puoi gestire solo gli ordini con pagamento confermato.',
    loadingSellerOrders: 'Caricamento ordini...',
    noSellerOrders: 'Non ci sono ancora ordini per questo negozio.',
    orderLabel: 'Ordine',
    dateUnavailable: 'Data non disponibile',
    paymentConfirmedLabel: 'Pagamento confermato',
    paymentPendingLabel: 'Pagamento in attesa',
    buyerConfirmedReceipt: "L'acquirente ha confermato la ricezione.",
    awaitingBuyerReceipt: "Consegna segnata. In attesa della conferma dell'acquirente.",
    shippingStatus: 'Stato della spedizione',
    trackingNumber: 'Numero di tracciamento',
    buyerNotes: "Note per l'acquirente",
    deliveryPhotos: 'Foto della consegna (massimo 4 per aggiornamento)',
    registeredPhotos: 'Foto registrate',
    shippingHistory: 'Cronologia degli stati',
    saveTracking: 'Salva tracciamento',
    saving: 'Salvataggio...',
    ordersLoadError: 'Impossibile caricare gli ordini.',
    invoiceLoadError: 'Impossibile caricare la fattura.',
    receiptError: 'Impossibile confermare la ricezione.',
    hashSent: 'Hash inviato. Verifica del pagamento in attesa.',
    hashError: "Impossibile inviare l'hash.",
    qrDownloadError: 'Impossibile scaricare il QR.',
    invoiceIdMissing: 'La fattura non ha ancora un identificativo.',
    invalidInvoiceId: 'Questa fattura non ha ancora un identificativo valido.',
    trackingSaveError: 'Impossibile salvare il tracciamento.',
    addressLabel: 'Indirizzo',
    carrierPlaceholder: 'es. corriere locale',
    deliveryNotesPlaceholder: 'Informazioni sulla preparazione o consegna',
    photosWillUpload: 'Le foto selezionate saranno caricate al salvataggio. Foto già registrate:',
    personalGreeting: 'Ciao',
    basicPlan: 'Piano Base',
    premiumPlan: 'Piano Premium',
    premiumActive: 'Premium attivo',
    improvePlan: 'Migliora piano',
    newProduct: 'Nuovo prodotto',
    totalProducts: 'Prodotti totali',
    groupByCategory: 'Raggruppa per categoria',
    noOutOfStock: 'Non hai prodotti esauriti! 🎉',
    noFeaturedProducts: 'Non hai prodotti in evidenza.',
    noActiveProducts: 'Non hai prodotti attivi.',
    noPublishedProducts: 'Non hai ancora pubblicato prodotti.',
    publishFirst: 'Pubblica il primo',
    createProduct: 'Crea prodotto',
    noLogoTitle: 'Non hai ancora un logo.',
    noLogoDesc: 'Caricalo affinché gli acquirenti possano trovarti più facilmente e la tua attività abbia un aspetto professionale. Viene compresso e ottimizzato automaticamente.',
    saveWallets: 'Salva portafogli',
    walletsNoTransfers: 'Salvare questi dati non attiva trasferimenti automatici.',
    productNotVisible: 'Questo prodotto non sarà visibile nel marketplace perché non ha scorte. Modificalo e aggiungi scorte per riattivarlo.',
    edit: 'Modifica',
    product: 'Prodotto',
    total: 'Totale',
    sellerLoadingError: 'Impossibile caricare gli ordini.',
    trackingNumberLabel: 'Numero di tracciamento',

      preparingOrder: "Preparazione dell'ordine",
      shipped: 'Spedito',
      delivered: 'Consegnato'
    },
  ru: {
    slogan: 'Всё в одном месте.',
    cartTitle: "Моя корзина",
    cartSubtitle: "Проверьте товары перед оплатой.",
    continueShopping: "Продолжить покупки",
    emptyCart: "Корзина пуста",
    emptyCartDesc: "Откройте товар и нажмите «Добавить в корзину».",
    viewProducts: "Посмотреть товары",
    removeItem: "Удалить",
    estimatedSubtotal: "Предварительная сумма",
    serverCalculatesTotal: "Сервер рассчитает окончательную сумму при создании заказа.",
    payCartCrypto: "Оплатить корзину криптовалютой",
    productFallback: "Товар",
    languageLabel: "Язык",
    legalLabel: "Правовая информация",
    rightsReserved: "Все права защищены",
    loginRequired: "Войдите в аккаунт",
    subSlogan: 'Покупайте легко. Продавайте быстро. Соединяя покупателей и продавцов.',
    searchPlaceholder: 'Поиск товаров, услуг или категорий...',
    publish: 'Разместить',
    enter: 'Войти',
    panel: 'Панель',
    admin: 'Админ',
    home: 'Главная',
    categories: 'Категории',
    allCategories: 'Все',
    latest: 'Последние',
    recommended: 'Рекомендуем',
    stats: 'Растущее сообщество',
    cta: 'Покупайте и продавайте с UBIK2 YEMG',
    ctaSub: 'Разместите объявление меньше чем за минуту. Бесплатно.',
    publishFree: 'Разместить бесплатно',
    explore: 'Изучить маркетплейс',
    contact: 'Связаться',
    whatsapp: 'WhatsApp',
    telegram: 'Telegram',
    sms: 'SMS / Звонок',
    favorites: 'Избранное',
    share: 'Поделиться',
    report: 'Жалоба',
    seller: 'Продавец',
    verified: 'Проверен',
    seeStore: 'Магазин',
    products: 'товары',
    businesses: 'магазины',
    sellers: 'продавцы',
    privacyPolicy: 'Политика',
    terms: 'Условия',
    officialContact: 'Контакты',
    filters: 'Фильтры',
    location: 'Локация',
    priceMin: 'Мин цена',
    priceMax: 'Макс цена',
    date: 'Дата',
    anytime: 'Любая дата',
    last7: '7 дней',
    last30: '30 дней',
    last90: '90 дней',
    clear: 'Очистить',
    apply: 'Применить',
    noResults: 'Ничего не найдено',
    inStock: 'В наличии',
    outOfStock: 'Нет в наличии',
    featured: 'Топ',
    new: 'Новый',
    // Crypto
    buyingWithCrypto: 'Купить криптой',
    invoiceExpired: 'Счёт истёк',
    pendingPayment: 'Оплата ожидается',
    txHashSubmitted: 'TxHash отправлен — на проверке',
    paymentConfirmed: 'Оплата подтверждена и одобрена',
    paymentRejected: 'Оплата отклонена',
    sendTxHash: 'Отправить хэш транзакции',
    txHashPlaceholder: '0x... или хэш Tron (64 hex)',
    copyAddress: 'Копировать адрес',
    receiverAddress: 'Адрес получателя (только для депозита)',
    expectedAmount: 'Ожидаемая сумма',
    paymentDetails: 'Детали оплаты',
    orderSummary: 'Сводка заказа',
    verificationNote: 'Админ проверит транзакцию в блокчейне. Не помечается как оплачено просто отсылкой хэша.',
    pendingVerification: 'На проверке',
    verificationDesc: 'Админ проверит вручную в эксплорере. Вас уведомят при одобрении или отклонении.',
    paymentApproved: 'Оплата подтверждена!',
    approvedDesc: 'Ваш заказ помечен как оплаченный. Продавец подготовит заказ.',
    paymentRejectedDesc: 'Оплата отклонена',
    rejectedDesc: 'Причина: {reason}',
    stockRestored: 'Склад восстановлен. Можно создать новый заказ.',
    invoiceExpiredDesc: 'Время оплаты истекло. Склад восстановлен.',
      accountSubtitle: 'Ваша личная учётная запись UBIK2 YEMG',
    becomeSellerTitle: 'Есть что продать?',
    becomeSellerDesc: 'Станьте продавцом бесплатно и публикуйте до 10 товаров.',
    accountEmail: 'Электронная почта аккаунта',
    myOrdersInvoices: 'Мои заказы и счета',
    loadingOrders: 'Загрузка заказов…',
    noOrders: 'У вас пока нет заказов, связанных с этой учётной записью.',
    orderDate: 'Дата',
    orderStatus: 'Статус заказа',
    deliveryData: 'Данные доставки',
    noProductDetails: 'Нет доступных сведений о товарах.',
    downloadInvoiceQR: 'Скачать счёт PDF с QR',
    verifyInvoice: 'Проверить счёт',
    invoiceNumber: 'Номер счёта:',
    loadingInvoice: 'Загрузка счёта…',
    hideInvoice: 'Скрыть счёт',
    viewPaymentInvoice: 'Посмотреть счёт на оплату',
    sellerOrdersTitle: 'Заказы и доставка',
    sellerOrdersDesc: 'Обновляйте доставку заказов магазина. Управлять можно только заказами с подтверждённой оплатой.',
    loadingSellerOrders: 'Загрузка заказов...',
    noSellerOrders: 'У этого магазина пока нет заказов.',
    orderLabel: 'Заказ',
    dateUnavailable: 'Дата недоступна',
    paymentConfirmedLabel: 'Оплата подтверждена',
    paymentPendingLabel: 'Ожидается оплата',
    buyerConfirmedReceipt: 'Покупатель подтвердил получение.',
    awaitingBuyerReceipt: 'Доставка отмечена. Ожидается подтверждение покупателя.',
    shippingStatus: 'Статус доставки',
    trackingNumber: 'Номер отслеживания',
    buyerNotes: 'Примечания для покупателя',
    deliveryPhotos: 'Фото доставки (не более 4 за обновление)',
    registeredPhotos: 'Зарегистрированные фотографии',
    shippingHistory: 'История статусов',
    saveTracking: 'Сохранить отслеживание',
    saving: 'Сохранение...',
    ordersLoadError: 'Не удалось загрузить заказы.',
    invoiceLoadError: 'Не удалось загрузить счёт.',
    receiptError: 'Не удалось подтвердить получение.',
    hashSent: 'Хеш отправлен. Ожидается проверка платежа.',
    hashError: 'Не удалось отправить хеш.',
    qrDownloadError: 'Не удалось скачать QR.',
    invoiceIdMissing: 'У счёта пока нет идентификатора.',
    invalidInvoiceId: 'У этого счёта пока нет действительного идентификатора.',
    trackingSaveError: 'Не удалось сохранить отслеживание.',
    addressLabel: 'Адрес',
    carrierPlaceholder: 'например, местный перевозчик',
    deliveryNotesPlaceholder: 'Информация о подготовке или доставке',
    photosWillUpload: 'Выбранные фотографии будут загружены при сохранении. Уже зарегистрировано:',
    personalGreeting: 'Здравствуйте',
    basicPlan: 'Базовый план',
    premiumPlan: 'Премиум-план',
    premiumActive: 'Премиум активен',
    improvePlan: 'Улучшить план',
    newProduct: 'Новый товар',
    totalProducts: 'Всего товаров',
    groupByCategory: 'Группировать по категории',
    noOutOfStock: 'Нет товаров, которых нет в наличии! 🎉',
    noFeaturedProducts: 'У вас нет рекомендуемых товаров.',
    noActiveProducts: 'У вас нет активных товаров.',
    noPublishedProducts: 'Вы ещё не публиковали товары.',
    publishFirst: 'Опубликуйте первый',
    createProduct: 'Создать товар',
    noLogoTitle: 'У вас пока нет логотипа.',
    noLogoDesc: 'Загрузите его, чтобы покупатели легче находили вас, а ваш бизнес выглядел профессионально. Логотип автоматически сжимается и оптимизируется.',
    saveWallets: 'Сохранить кошельки',
    walletsNoTransfers: 'Сохранение этих данных не включает автоматические переводы.',
    productNotVisible: 'Этот товар не будет виден на маркетплейсе, потому что его нет в наличии. Отредактируйте товар и добавьте остаток, чтобы снова активировать его.',
    edit: 'Изменить',
    product: 'Товар',
    total: 'Итого',
    sellerLoadingError: 'Не удалось загрузить заказы.',
    trackingNumberLabel: 'Номер отслеживания',

      preparingOrder: 'Заказ готовится',
      shipped: 'Отправлен',
      delivered: 'Доставлен'
    },
};
const FLAGS = { es: '🇪🇸', en: '🇬🇧', it: '🇮🇹', ru: '🇷🇺' };
const LANG_NAMES = { es: 'Español', en: 'English', it: 'Italiano', ru: 'Русский' };

// Currency display map — flags + locales for prettier formatting.
const CURRENCY_INFO = {
  CUP:  { flag: '🇨🇺', label: 'CUP',  locale: 'es-ES', fractionDigits: 0 },
  MLC:  { flag: '💳', label: 'MLC',  locale: 'es-ES', fractionDigits: 2 },
  USD:  { flag: '🇺🇸', label: 'USD',  locale: 'en-US', fractionDigits: 2 },
  EUR:  { flag: '🇪🇺', label: 'EUR',  locale: 'es-ES', fractionDigits: 2 },
  GBP:  { flag: '🇬🇧', label: 'GBP',  locale: 'en-GB', fractionDigits: 2 },
  CAD:  { flag: '🇨🇦', label: 'CAD',  locale: 'en-CA', fractionDigits: 2 },
  MXN:  { flag: '🇲🇽', label: 'MXN',  locale: 'es-MX', fractionDigits: 2 },
  USDT: { flag: '💎', label: 'USDT', locale: 'en-US', fractionDigits: 2 },
  USDC: { flag: '💠', label: 'USDC', locale: 'en-US', fractionDigits: 2 },
};
const ALL_CURRENCIES = Object.keys(CURRENCY_INFO);

const formatPrice = (n, currency = 'CUP') => {
  const num = Number(n || 0);
  const info = CURRENCY_INFO[currency] || CURRENCY_INFO.CUP;
  const code = info.label;
  const formatted = new Intl.NumberFormat(info.locale, {
    minimumFractionDigits: info.fractionDigits,
    maximumFractionDigits: info.fractionDigits,
  }).format(num);
  return `${formatted} ${code}`;
};

// === Cloudinary thumbnail helper ===
// Injects a transformation segment into a Cloudinary URL so we serve tiny, optimized
// thumbnails (WebP/AVIF auto, auto-quality) instead of full-size logos. Falls back to
// the original URL if it is not a Cloudinary image.
const cdnThumb = (url, size = 200) => {
  if (!url || typeof url !== 'string') return url;
  if (!url.includes('res.cloudinary.com')) return url;
  // Avoid double-applying transformations.
  if (url.includes('/c_fill,') || url.includes(`/w_${size},`)) return url;
  return url.replace('/upload/', `/upload/c_fill,w_${size},h_${size},f_auto,q_auto/`);
};


// === Centralized contact links for "Contactar vendedor" buttons ===
// Builds a professional, dynamic message and detects which channels the seller has.
// Returns { msg, encoded, wa, tg, sms, waLink, tgLink, smsLink, anyAvailable }.
const buildContactLinks = (p) => {
  if (!p) return { anyAvailable: false };
  const b = p.business || {};
  const cleanPhone = (s) => String(s || '').replace(/[^0-9+]/g, '').replace(/^\+/, '');
  const wa = cleanPhone(b.whatsapp);
  const tgRaw = (b.telegram || '').trim();
  // El teléfono solo se habilita si el vendedor lo configuró explícitamente.
  const phoneRaw = String(b.sms || '').trim();
  const phone = phoneRaw.replace(/[^0-9+]/g, '');
  const sms = cleanPhone(phoneRaw);

  const name = p.name || 'tu producto';
  const price = formatPrice(p.price, p.currency);
  const location = (p.location || b.location || '').trim() || 'Cuba';

  // Professional template — kept compact, emoji-friendly, mobile-first
  const msg =
    `Hola 👋, vi tu producto en UBIK2:\n\n` +
    `🛒 ${name}\n` +
    `💲 Precio: ${price}\n` +
    `📍 Ubicación: ${location}\n\n` +
    `Me interesa obtener más información. ¿Sigue disponible?`;
  const encoded = encodeURIComponent(msg);

  // WhatsApp: wa.me link with prefilled text
  const waLink = wa ? `https://wa.me/${wa}?text=${encoded}` : '';
  // Telegram: t.me/<username> — Telegram doesn't support prefilled text via deep link reliably,
  // so we open the chat directly. Username can be "@user" or "user".
  const tgUser = tgRaw.replace(/^@/, '').replace(/^https?:\/\/(t\.me|telegram\.me)\//i, '');
  const tgLink = tgUser ? `https://t.me/${tgUser}` : '';
  // SMS: spec is sms:NUMBER?body=... (iOS uses `&body=`, Android `?body=`; ?body works on both).
  const phoneLink = phone ? `tel:${phone}` : '';
  const smsLink = sms ? `sms:${sms}?body=${encoded}` : '';

  return {
    msg, encoded,
    wa, tg: tgUser, phone, sms,
    waLink, tgLink, phoneLink, smsLink,
    anyAvailable: !!(waLink || tgLink || phoneLink || smsLink),
  };
};

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

// Resilient API helper with timeout + automatic retry (network-friendly for Cuba)
function api(path, { method = 'GET', body, token, timeout = 10000, retries = 1, signal } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  const doFetch = (attempt) => {
    const ctrl = new AbortController();
    const timer = setTimeout(() => ctrl.abort(), timeout);
    if (signal) signal.addEventListener('abort', () => ctrl.abort());
    return fetch(`${API}${path}`, {
      method,
      headers,
      body: body ? JSON.stringify(body) : undefined,
      signal: ctrl.signal,
    })
      .then(async (r) => {
        clearTimeout(timer);
        const data = await r.json().catch(() => ({}));
        if (!r.ok) {
          const details = data.details && typeof data.details === 'object'
            ? Object.entries(data.details)
                .map(([field, messages]) =>
                  `${field}: ${Array.isArray(messages) ? messages.join(', ') : String(messages)}`
                )
                .join('; ')
            : '';
          throw new Error(details
            ? `${data.error || `Error ${r.status}`} — ${details}`
            : (data.error || `Error ${r.status}`));
        }
        return data;
      })
      .catch((err) => {
        clearTimeout(timer);
        const isAbort = err?.name === 'AbortError';
        const isNetwork = err?.message === 'Failed to fetch' || err?.message?.includes('NetworkError');
        // Only retry on GET for transient network failures or timeouts
        if (attempt < retries && method === 'GET' && (isAbort || isNetwork)) {
          return new Promise((resolve) => setTimeout(resolve, 800 * (attempt + 1))).then(() => doFetch(attempt + 1));
        }
        if (isAbort) throw new Error('La conexión es lenta. Intenta de nuevo.');
        throw err;
      });
  };
  return doFetch(0);
}

// Detect slow connection (2G/slow-2g) to auto-enable data saver
function detectSlowConnection() {
  if (typeof navigator === 'undefined') return false;
  const c = navigator.connection || navigator.mozConnection || navigator.webkitConnection;
  if (!c) return false;
  if (c.saveData) return true;
  return ['slow-2g', '2g'].includes(c.effectiveType);
}

const App = () => {
  // === State ===
  const [view, setView] = useState('home');
  const [productId, setProductId] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);

  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [businessTypes, setBusinessTypes] = useState([]);
  const [stats, setStats] = useState({ productsCount: 0, businessesCount: 0, usersCount: 0, servicesCount: 0, activeBusinessesCount: 0 });
  const [settings, setSettings] = useState(null);

  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState({ location: '', businessName: '', country: '', province: '', municipality: '', businessType: '', subcategory: '', currency: '', physicalOnly: false, priceMin: '', priceMax: '', since: '', featuredOnly: false, availableOnly: true });
  const [loading, setLoading] = useState(false);

  // === Cuba/100K optimizations ===
  const [dataSaver, setDataSaver] = useState(false); // hides images, uses lite payloads
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);

  // === Search autocomplete ===
  const [suggestions, setSuggestions] = useState([]);
  const [suggestOpen, setSuggestOpen] = useState(false);
  const [suggestLoading, setSuggestLoading] = useState(false);

  // === Featured businesses for home ===
  const [topBusinesses, setTopBusinesses] = useState([]);

  const PAGE_SIZE = 12;

  const [lang, setLang] = useState('es');
  const [dark, setDark] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);

  // Dialogs
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    accountType: 'buyer', // 'buyer' | 'seller'
    email: '', password: '', name: '',
    businessName: '', whatsapp: '', telegram: '', sms: '',
    location: '', description: '', logo: '',
  });
  const [forgotOpen, setForgotOpen] = useState(false);
  const [forgotStep, setForgotStep] = useState(1);
  const [forgotData, setForgotData] = useState({ email: '', token: '', newPassword: '' });
  const [planOpen, setPlanOpen] = useState(false);
  const [paymentForm, setPaymentForm] = useState({ method: 'usdc', reference: '', screenshot: '' });
  const [productOpen, setProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const emptyProduct = {
    name: '', price: '', description: '', category: 'electronica', subcategory: '', stock: 1, image: '',
    available: true, featured: false, location: '', currency: 'CUP',
    showPublicContact: true, province: '', municipality: '', address: '', openingHours: '', closingHours: '',
  };
  const [productForm, setProductForm] = useState(emptyProduct);
  const [legalOpen, setLegalOpen] = useState(null); // 'privacy' | 'terms' | 'contact'
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportForm, setReportForm] = useState({ reason: '', details: '' });

  const [upgradeOpen, setUpgradeOpen] = useState(false);
  const [upgradeForm, setUpgradeForm] = useState({
    businessName: '', whatsapp: '', telegram: '', sms: '', location: '', description: '', logo: '',
  });

  const [detail, setDetail] = useState(null);
  const [bizDetail, setBizDetail] = useState(null);
  const [myProducts, setMyProducts] = useState([]);

  // Crypto checkout
  const [checkoutOrder, setCheckoutOrder] = useState(null);
  const [checkoutInvoice, setCheckoutInvoice] = useState(null);
  const [checkoutTxHash, setCheckoutTxHash] = useState('');
  const [checkoutSubmitting, setCheckoutSubmitting] = useState(false);
  const [cryptoConfig, setCryptoConfig] = useState(null);
  const [cryptoSelectorOpen, setCryptoSelectorOpen] = useState(false);
  const [cryptoSelectedKey, setCryptoSelectedKey] = useState('');
  const [checkoutPaymentMethod, setCheckoutPaymentMethod] = useState('crypto');
  const [cryptoPendingCheckout, setCryptoPendingCheckout] = useState(null);
  const [checkoutBusiness, setCheckoutBusiness] = useState(null);
  const [deliveryMethod, setDeliveryMethod] = useState('pickup');
  const canUseHomeDelivery = user?.plan === 'premium' && checkoutBusiness?.deliveryEnabled === true;
  const [cryptoRecipientData, setCryptoRecipientData] = useState({
    recipientId: '', name: '', address: '', email: '', phone: '',
  });

  // Admin
  const [adminData, setAdminData] = useState({ payments: [], users: [], products: [], stats: null, reports: [], orders: [], transfermovilEvents: [] });
  const [adminTab, setAdminTab] = useState('payments');
  const [adminSettings, setAdminSettings] = useState(null);

  const t = useMemo(() => TRANSLATIONS[lang] || TRANSLATIONS.es, [lang]);

  // === Boot ===
  useEffect(() => {
    if (typeof window === 'undefined') return;
    const t = localStorage.getItem('ubik2_token');
    if (t) setToken(t);
    const sLang = localStorage.getItem('ubik2_lang');
    if (sLang && TRANSLATIONS[sLang]) setLang(sLang);
    const sDark = localStorage.getItem('ubik2_dark') === '1';
    setDark(sDark);
    document.documentElement.classList.toggle('dark', sDark);
    // Data saver: explicit pref wins; otherwise auto-detect slow conns
    const dsStored = localStorage.getItem('ubik2_data_saver');
    if (dsStored === '1') setDataSaver(true);
    else if (dsStored === '0') setDataSaver(false);
    else if (detectSlowConnection()) {
      setDataSaver(true);
      toast.success('Detectamos conexión lenta. Activamos modo ahorro de datos.', { duration: 4500 });
    }
    try {
      const fav = JSON.parse(localStorage.getItem('ubik2_favs') || '[]');
      setFavorites(Array.isArray(fav) ? fav : []);
    } catch {}
    try {
      const savedCart = JSON.parse(localStorage.getItem('ubik2_cart') || '[]');
      setCart(Array.isArray(savedCart) ? savedCart.filter((item) => item?.product?.id && Number(item.quantity) > 0) : []);
    } catch { setCart([]); }
    (async () => {
      try {
        const st = await api('/stats');
        setStats(st);
        if (st && (st.productsCount === 0 || st.businessesCount === 0)) {
          await api('/seed', { method: 'POST' }).catch(() => {});
          api('/stats').then((d) => setStats(d)).catch(() => {});
        }
      } catch {}
    })();
    api('/categories').then((d) => { setCategories(d.categories || []); setBusinessTypes(d.businessTypes || []); }).catch(() => {});
    api('/settings').then((d) => setSettings(d)).catch(() => {});
  }, []);

  // === Live stats: refresh every 30s while the tab is visible (cheap, cached endpoint) ===
  useEffect(() => {
    if (typeof document === 'undefined') return;
    const tick = () => {
      if (document.visibilityState !== 'visible') return;
      api('/stats').then((d) => setStats(d)).catch(() => {});
    };
    const id = setInterval(tick, 30000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ubik2_lang', lang);
  }, [lang]);

  // === Detect query params from shared links / email recovery ===
  useEffect(() => {
    if (typeof window === 'undefined') return;
    try {
      const params = new URLSearchParams(window.location.search);
      const rt = params.get('reset_token');
      const sharedProductId = params.get('product');
      const sharedBusinessId = params.get('business');
      let cleaned = false;

      if (rt) {
        setForgotData((f) => ({ ...f, token: rt, newPassword: '' }));
        setForgotStep(2);
        setForgotOpen(true);
        cleaned = true;
      }
      if (sharedProductId) {
        setProductId(sharedProductId);
        setView('product');
        setDetail(null);
        api(`/products/${sharedProductId}`).then((d) => setDetail(d.product)).catch(() => {});
        cleaned = true;
      } else if (sharedBusinessId) {
        setBusinessId(sharedBusinessId);
        setView('business');
        setBizDetail(null);
        api(`/businesses/${sharedBusinessId}`).then((d) => setBizDetail(d)).catch(() => {});
        cleaned = true;
      }

      if (cleaned) {
        const url = new URL(window.location.href);
        url.searchParams.delete('reset_token');
        url.searchParams.delete('product');
        url.searchParams.delete('business');
        window.history.replaceState({}, '', url.pathname + (url.search || '') + url.hash);
      }
    } catch {}
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ubik2_dark', dark ? '1' : '0');
  }, [dark]);

  useEffect(() => {
    if (typeof window === 'undefined') return;
    localStorage.setItem('ubik2_data_saver', dataSaver ? '1' : '0');
  }, [dataSaver]);

  useEffect(() => {
    if (!token) { setUser(null); setBusiness(null); return; }
    api('/auth/me', { token })
      .then((d) => { setUser(d.user); setBusiness(d.business); })
      .catch(() => { setToken(null); localStorage.removeItem('ubik2_token'); });
  }, [token]);

  // === Fetch products ===
  const buildQuery = useCallback((extra = {}) => {
    const params = new URLSearchParams();
    if (query) params.set('q', query);
    if (category) params.set('category', category);
    if (filters.location) params.set('location', filters.location);
    if (filters.businessName) params.set('businessName', filters.businessName);
    if (filters.country) params.set('country', filters.country);
    if (filters.province) params.set('province', filters.province);
    if (filters.municipality) params.set('municipality', filters.municipality);
    if (filters.businessType) params.set('businessType', filters.businessType);
    if (filters.subcategory) params.set('subcategory', filters.subcategory);
    if (filters.currency) params.set('currency', filters.currency);
    if (filters.physicalOnly) params.set('physicalOnly', 'true');
    if (filters.priceMin) params.set('priceMin', filters.priceMin);
    if (filters.priceMax) params.set('priceMax', filters.priceMax);
    if (filters.since) params.set('since', filters.since);
    if (filters.featuredOnly) params.set('featured', 'true');
    // Data saver mode: ask backend to skip heavy base64 images
    if (dataSaver) params.set('lite', 'true');
    params.set('limit', String(PAGE_SIZE));
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return params.toString();
  }, [query, category, filters, dataSaver]);

  const refreshHome = useCallback(() => {
    setLoading(true);
    setPage(1);
    const hasFiltersOrQuery = query || category || filters.location || filters.priceMin || filters.priceMax || filters.since;
    // Show ALL products (incl. featured) in main grid so destacados también aparecen en "Recientes".
    // Featured section sigue cargando aparte para el carrusel arriba.
    const mainQ = buildQuery({ page: '1' });
    const featQ = dataSaver ? '/products?featured=true&lite=true&limit=8' : '/products?featured=true&limit=12';
    Promise.all([
      api(`/products?${mainQ}`),
      hasFiltersOrQuery ? Promise.resolve({ products: [], hasMore: false }) : api(featQ),
      hasFiltersOrQuery ? Promise.resolve({ businesses: [] }) : api('/businesses?limit=12'),
    ])
      .then(([all, feat, biz]) => {
        setProducts(all.products || []);
        setHasMore(!!all.hasMore);
        setFeatured(feat.products || []);
        setTopBusinesses(biz.businesses || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [buildQuery, query, category, filters, dataSaver]);

  const loadMore = useCallback(() => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    const next = page + 1;
    const mainQ = buildQuery({ page: String(next) });
    api(`/products?${mainQ}`)
      .then((d) => {
        setProducts((prev) => [...prev, ...(d.products || [])]);
        setHasMore(!!d.hasMore);
        setPage(next);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoadingMore(false));
  }, [loadingMore, hasMore, page, buildQuery]);

  // === Autocomplete (debounced) ===
  useEffect(() => {
    const q = (searchInput || '').trim();
    if (q.length < 2) {
      setSuggestions([]);
      setSuggestLoading(false);
      return;
    }
    setSuggestLoading(true);
    const ctrl = new AbortController();
    const timer = setTimeout(() => {
      api(`/search/suggest?q=${encodeURIComponent(q)}`, { signal: ctrl.signal, retries: 0, timeout: 4000 })
        .then((d) => setSuggestions(d.suggestions || []))
        .catch(() => setSuggestions([]))
        .finally(() => setSuggestLoading(false));
    }, 280); // debounce ~280ms — gentle on Cuban networks
    return () => { clearTimeout(timer); ctrl.abort(); };
  }, [searchInput]);

  const onSuggestionClick = useCallback((s) => {
    setSuggestOpen(false);
    setSearchInput('');
    if (s.type === 'category') {
      setCategory(s.value);
      setQuery('');
      setView('home');
    } else if (s.type === 'product') {
      // Fetch product detail like openProduct does (was the bug)
      setProductId(s.value); setView('product'); setDetail(null);
      api(`/products/${s.value}`).then((d) => setDetail(d.product)).catch((e) => toast.error(e.message));
    } else if (s.type === 'business') {
      setBusinessId(s.value); setView('business'); setBizDetail(null);
      api(`/businesses/${s.value}`).then((d) => setBizDetail(d)).catch((e) => toast.error(e.message));
    }
  }, []);

  useEffect(() => {
    if (view === 'home') refreshHome();
  }, [view, refreshHome]);

  // === Auth ===
  const handleAuth = async (e) => {
    e?.preventDefault();
    try {
      if (authMode === 'register') {
        if (!authForm.email || !authForm.password) return toast.error('Email y contraseña requeridos');
        if (authForm.accountType === 'seller' && (!authForm.businessName || !authForm.whatsapp)) {
          return toast.error('Para vender necesitas nombre del negocio y WhatsApp');
        }
        if (authForm.accountType === 'buyer' && !authForm.name) {
          return toast.error('Tu nombre es requerido');
        }
        const d = await api('/auth/register', { method: 'POST', body: authForm });
        localStorage.setItem('ubik2_token', d.token);
        setToken(d.token);
        setAuthOpen(false);
        toast.success(authForm.accountType === 'seller' ? '¡Bienvenido a UBIK2 YEMG!' : '¡Cuenta creada! Ya puedes guardar favoritos y contactar vendedores.');
        if (authForm.accountType === 'seller') setView('dashboard');
      } else {
        const d = await api('/auth/login', {
          method: 'POST',
          body: { email: authForm.email, password: authForm.password },
        });
        localStorage.setItem('ubik2_token', d.token);
        setToken(d.token);
        setAuthOpen(false);
        toast.success('Sesión iniciada');
      }
    } catch (err) {
      toast.error(err.message);
    }
  };

  // Upgrade buyer to seller
  const upgradeSeller = async (data) => {
    try {
      const d = await api('/auth/upgrade-seller', { method: 'POST', token, body: data });
      setUser(d.user);
      setBusiness(d.business);
      toast.success(d.message);
      setUpgradeOpen(false);
      setView('dashboard');
    } catch (err) {
      toast.error(err.message);
    }
  };
  const logout = () => {
    localStorage.removeItem('ubik2_token');
    setToken(null);
    setView('home');
    toast.success('Sesión cerrada');
  };

  // === Favorites ===
  const toggleFav = (id) => {
    setFavorites((prev) => {
      const next = prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id];
      localStorage.setItem('ubik2_favs', JSON.stringify(next));
      return next;
    });
  };

  // === Share ===
  const shareProduct = async (p) => {
    // SEO-friendly URL — server-rendered with OpenGraph metadata so WhatsApp/FB preview shows the product image+price.
    const url = `${window.location.origin}/product/${p.id}`;
    const text = `${p.name} — ${formatPrice(p.price, p.currency)}`;
    if (navigator.share) {
      try { await navigator.share({ title: p.name, text, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); toast.success('Enlace copiado'); }
    catch { toast.error('No se pudo compartir'); }
  };

  const shareBusiness = async (b) => {
    if (!b?.id) return;
    // SEO-friendly URL — server-rendered with OpenGraph metadata (logo, name, description).
    const url = `${window.location.origin}/b/${b.id}`;
    const text = b.description ? `${b.name} — ${b.description.slice(0, 120)}` : b.name;
    if (navigator.share) {
      try { await navigator.share({ title: b.name, text, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); toast.success('Enlace del negocio copiado'); }
    catch { toast.error('No se pudo compartir'); }
  };

  // === Owner self-edit logo ===
  // Sends the new logo to /api/businesses/<id> (the backend uploads it to Cloudinary
  // and returns the CDN URL). Updates local state so the new logo appears instantly.
  const updateMyLogo = async (dataUrl) => {
    if (!business?.id) return;
    try {
      const updated = await api(`/businesses/${business.id}`, {
        method: 'PUT',
        token,
        body: { logo: dataUrl },
      });
      const newBiz = updated?.business || { ...business, logo: dataUrl };
      setBusiness(newBiz);
      toast.success('Logo actualizado');
    } catch (e) {
      toast.error(e?.message || 'No se pudo actualizar el logo');
    }
  };

  // === Product CRUD ===
  const compressImage = (file, maxSize = 1200, quality = 0.82) =>
    new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width >= height) { height = Math.round((height * maxSize) / width); width = maxSize; }
            else { width = Math.round((width * maxSize) / height); height = maxSize; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          resolve(canvas.toDataURL('image/jpeg', quality));
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });


  // Logo-specific compressor: 512x512 max, WebP first with JPEG fallback for older browsers.
  // Logos are decorative thumbnails — we never need full HD here.
  const compressLogo = (file, maxSize = 512) =>
    new Promise((resolve, reject) => {
      if (!file) return reject(new Error('Archivo vacío'));
      const reader = new FileReader();
      reader.onerror = reject;
      reader.onload = (e) => {
        const img = new Image();
        img.onerror = reject;
        img.onload = () => {
          let { width, height } = img;
          if (width > maxSize || height > maxSize) {
            if (width >= height) { height = Math.round((height * maxSize) / width); width = maxSize; }
            else { width = Math.round((width * maxSize) / height); height = maxSize; }
          }
          const canvas = document.createElement('canvas');
          canvas.width = width; canvas.height = height;
          canvas.getContext('2d').drawImage(img, 0, 0, width, height);
          // Try WebP first (~30% smaller). Fall back to JPEG if the browser refuses.
          let out = null;
          try { out = canvas.toDataURL('image/webp', 0.85); } catch { out = null; }
          if (!out || !out.startsWith('data:image/webp')) {
            out = canvas.toDataURL('image/jpeg', 0.85);
          }
          resolve(out);
        };
        img.src = e.target.result;
      };
      reader.readAsDataURL(file);
    });

  const onProductImageFile = async (file) => {
    if (!file) return;
    if (!file.type.startsWith('image/')) return toast.error('Solo se permiten imágenes');
    if (file.size > 8 * 1024 * 1024) return toast.error('La imagen debe pesar menos de 8MB');
    try {
      toast.loading('Procesando imagen...', { id: 'img' });
      const dataUrl = await compressImage(file);
      setProductForm((p) => ({ ...p, image: dataUrl }));
      toast.success('Imagen lista', { id: 'img' });
    } catch { toast.error('Error procesando la imagen', { id: 'img' }); }
  };

  const onScreenshotFile = (file) => {
    if (!file) return;
    if (file.size > 2 * 1024 * 1024) return toast.error('Máx 2MB');
    const reader = new FileReader();
    reader.onload = (e) => setPaymentForm((p) => ({ ...p, screenshot: e.target.result }));
    reader.readAsDataURL(file);
  };

  const openProductCreate = () => {
    setEditingProduct(null);
    setProductForm({ ...emptyProduct, location: business?.location || '' });
    setProductOpen(true);
  };
  const openProductEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name, price: p.price, description: p.description || '', category: p.category, subcategory: p.subcategory || '',
      stock: p.stock, image: p.image || '', available: p.available, featured: !!p.featured,
      location: p.location || '', currency: p.currency || 'CUP',
      showPublicContact: p.showPublicContact !== false, // default true for legacy products
      province: p.province || '', municipality: p.municipality || '', address: p.address || '',
      openingHours: p.openingHours || '', closingHours: p.closingHours || '',
    });
    setProductOpen(true);
  };
  const submitProduct = async (e) => {
    e?.preventDefault();
    try {
      const payload = { ...productForm, price: Number(productForm.price), stock: Number(productForm.stock) };
      if (editingProduct) {
        await api(`/products/${editingProduct.id}`, { method: 'PUT', token, body: payload });
        toast.success('Producto actualizado');
      } else {
        await api('/products', { method: 'POST', token, body: payload });
        toast.success('Producto publicado');
      }
      setProductOpen(false);
      loadMyProducts();
      refreshHome();
    } catch (err) { toast.error(err.message); }
  };
  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE', token });
      toast.success('Producto eliminado');
      loadMyProducts();
      refreshHome();
    } catch (err) { toast.error(err.message); }
  };

  const loadMyProducts = useCallback(() => {
    if (!token) return;
    api('/my/products', { token }).then((d) => setMyProducts(d.products || [])).catch(() => {});
  }, [token]);
  useEffect(() => { if (view === 'dashboard') loadMyProducts(); }, [view, loadMyProducts]);

  // === Detail nav ===
  const openProduct = async (id) => {
    setProductId(id); setView('product'); setDetail(null);
    try { const d = await api(`/products/${id}`); setDetail(d.product); }
    catch (e) { toast.error(e.message); }
  };
  const openBusiness = async (id) => {
    setBusinessId(id); setView('business'); setBizDetail(null);
    try { const d = await api(`/businesses/${id}`); setBizDetail(d); }
    catch (e) { toast.error(e.message); }
  };

  // === Plan ===
  const requestPremium = async () => {
    try {
      await api('/subscription', {
        method: 'POST', token,
        body: { plan: 'premium', ...paymentForm },
      });
      toast.success('Solicitud enviada. Un admin revisará tu pago.');
      setPlanOpen(false);
      setPaymentForm({ method: 'usdc', reference: '', screenshot: '' });
    } catch (err) { toast.error(err.message); }
  };

  // === Forgot ===
  const requestForgot = async () => {
    try {
      if (!forgotData.email) return toast.error('Ingresa tu email');
      await api('/auth/forgot', { method: 'POST', body: { email: forgotData.email } });
      toast.success('Revisa tu correo. Si está registrado, te enviamos instrucciones.');
      setForgotStep(2);
    } catch (err) { toast.error(err.message); }
  };
  const submitReset = async () => {
    try {
      await api('/auth/reset', { method: 'POST', body: { token: forgotData.token, newPassword: forgotData.newPassword } });
      toast.success('Contraseña actualizada');
      setForgotOpen(false); setForgotStep(1); setForgotData({ email: '', token: '', newPassword: '' });
      setAuthMode('login'); setAuthOpen(true);
    } catch (err) { toast.error(err.message); }
  };

  // === Crypto Checkout ===
  const fetchCryptoConfig = async () => {
    try {
      const config = await api('/payments/crypto/config');
      setCryptoConfig(config);
      return config;
    } catch (err) {
      toast.error('Error cargando configuración crypto: ' + err.message);
      return null;
    }
  };

  const saveCart = (nextCart) => {
    setCart(nextCart);
    try { localStorage.setItem('ubik2_cart', JSON.stringify(nextCart)); } catch {}
  };

  const addToCart = (product) => {
    if (!product?.id || !product.stock || product.stock <= 0) return toast.error('Producto sin stock');
    setCart((current) => {
      const currentBusiness = current[0]?.product?.businessId;
      if (currentBusiness && product.businessId && currentBusiness !== product.businessId) {
        toast.error('El carrito solo admite productos de una tienda por pedido.');
        return current;
      }
      const existing = current.find((item) => item.product.id === product.id);
      const next = existing
        ? current.map((item) => item.product.id === product.id ? { ...item, quantity: Math.min(Number(product.stock) || 99, item.quantity + 1) } : item)
        : [...current, { product, quantity: 1 }];
      try { localStorage.setItem('ubik2_cart', JSON.stringify(next)); } catch {}
      toast.success('Producto añadido al carrito');
      return next;
    });
  };
  const updateCartQuantity = (productId, quantity) => saveCart(cart.map((item) => item.product.id === productId ? { ...item, quantity: Math.max(1, Math.min(Number(item.product.stock) || 99, Number(quantity) || 1)) } : item));
  const removeFromCart = (productId) => saveCart(cart.filter((item) => item.product.id !== productId));

  const startCryptoCheckout = async (productOrItems) => {
    if (!token) {
      toast.error('Inicia sesión para pagar; tu carrito se conservará.');
      setAuthMode('login'); setAuthOpen(true); return;
    }
    const checkoutItems = Array.isArray(productOrItems) ? productOrItems : [{ product: productOrItems, quantity: 1 }];
    if (!checkoutItems.length) return toast.error('El carrito está vacío');
    for (const item of checkoutItems) {
      if (!item?.product?.id || !item.product.stock || item.product.stock < item.quantity) return toast.error(`Stock insuficiente para ${item?.product?.name || 'un producto'}`);
    }
    const businessIds = [...new Set(checkoutItems.map((item) => item.product.businessId).filter(Boolean))];
    if (businessIds.length > 1) return toast.error('El carrito debe contener productos de una sola tienda.');

    setCheckoutSubmitting(true);
    try {
      let businessInfo = null;
      if (businessIds[0]) {
        try {
          const businessRes = await api(`/businesses/${encodeURIComponent(businessIds[0])}`, { token });
          businessInfo = businessRes?.business || null;
        } catch {
          // La recogida sigue disponible aunque falle la consulta del negocio.
        }
      }
      setCheckoutBusiness(businessInfo);
      setDeliveryMethod('pickup');

      let config = cryptoConfig;
      if (!config) {
        try {
          config = await api('/payments/crypto/config');
          setCryptoConfig(config);
        } catch {
          config = null;
        }
      }

      const hasCrypto = Array.isArray(config?.enabled) && config.enabled.length > 0;
      const hasTransfermovil = businessInfo?.transfermovilEnabled === true
        && Boolean(String(businessInfo?.transfermovilNumber || '').trim())
        && Boolean(String(businessInfo?.transfermovilName || '').trim());
      const hasEnzona = businessInfo?.enzonaEnabled === true
        && Boolean(String(businessInfo?.enzonaRecipient || '').trim());

      if (!hasCrypto && !hasTransfermovil && !hasEnzona) {
        toast.error('Este negocio no tiene métodos de pago configurados.');
        return;
      }

      const initialMethod = hasCrypto ? 'crypto' : hasTransfermovil ? 'transfermovil' : 'enzona';
      setCheckoutPaymentMethod(initialMethod);
      setCryptoPendingCheckout({
        items: checkoutItems,
        clearCart: Array.isArray(productOrItems),
      });
      if (hasCrypto) {
        setCryptoSelectedKey(`${config.enabled[0].currency}:${config.enabled[0].network}`);
      } else {
        setCryptoSelectedKey('');
      }
      setCryptoSelectorOpen(true);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const confirmCryptoCheckout = async () => {
    if (!cryptoPendingCheckout) return;

    const recipient = {
      recipientId: cryptoRecipientData.recipientId.trim(),
      name: cryptoRecipientData.name.trim(),
      address: cryptoRecipientData.address.trim(),
      email: cryptoRecipientData.email.trim(),
      phone: cryptoRecipientData.phone.trim(),
    };

    if ([recipient.recipientId, recipient.name, recipient.email, recipient.phone].some((value) => !value)) {
      toast.error('Completa los datos del destinatario');
      return;
    }
    if (deliveryMethod === 'delivery' && !recipient.address) {
      toast.error('Introduce la dirección de entrega');
      return;
    }
    if (deliveryMethod === 'delivery' && !canUseHomeDelivery) {
      toast.error('La entrega a domicilio requiere un comprador Premium y un negocio con entregas habilitadas.');
      setDeliveryMethod('pickup');
      return;
    }
    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient.email)) {
      toast.error('Introduce un correo electrónico válido');
      return;
    }

    const selectedNetwork = checkoutPaymentMethod === 'crypto'
      ? cryptoConfig?.enabled?.find(
          (network) => `${network.currency}:${network.network}` === cryptoSelectedKey
        )
      : null;

    if (checkoutPaymentMethod === 'crypto' && !selectedNetwork) {
      toast.error('Selecciona una red crypto habilitada');
      return;
    }
    if (!['crypto', 'transfermovil', 'enzona'].includes(checkoutPaymentMethod)) {
      toast.error('Selecciona un método de pago válido');
      return;
    }

    setCheckoutSubmitting(true);
    try {
      const orderRes = await api('/orders', {
        method: 'POST', token,
        body: {
          items: cryptoPendingCheckout.items.map(({ product, quantity }) => ({
            productId: product.id,
            quantity,
          })),
          shippingRecipientId: recipient.recipientId,
          shippingName: recipient.name,
          shippingPhone: recipient.phone,
          shippingAddress: deliveryMethod === 'delivery'
            ? recipient.address
            : `Recogida en el negocio: ${checkoutBusiness?.name || 'negocio'}`,
          deliveryMethod,
          shippingEmail: recipient.email,
          shippingNotes: checkoutPaymentMethod === 'crypto'
            ? 'Pago con ' + selectedNetwork.currency + ' ' + selectedNetwork.network
            : 'Pago pendiente de revisión manual: ' + checkoutPaymentMethod,
          paymentMethod: checkoutPaymentMethod,
          ...(checkoutPaymentMethod === 'crypto' ? {
            cryptoCurrency: selectedNetwork.currency,
            cryptoNetwork: selectedNetwork.network,
          } : {}),
        },
      });
      setCheckoutOrder(orderRes.order);
      setCheckoutInvoice(orderRes.invoice);
      if (cryptoPendingCheckout.clearCart) saveCart([]);
      setCryptoSelectorOpen(false);
      setCryptoPendingCheckout(null);
      setView('checkout');
    } catch (err) {
      toast.error('Error creando pedido: ' + err.message);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const closeCryptoSelector = () => {
    if (checkoutSubmitting) return;
    setCryptoSelectorOpen(false);
    setCryptoPendingCheckout(null);
    setCryptoSelectedKey('');
  };

  const submitTxHash = async () => {
    if (!checkoutTxHash.trim()) return toast.error('Ingresa el hash de transacción');
    if (!checkoutOrder?.cryptoInvoiceId) return toast.error('No hay factura asociada');

    setCheckoutSubmitting(true);
    try {
      const res = await api(`/orders/${checkoutOrder.id}/invoice/submit-tx`, {
        method: 'POST',
        token,
        body: { txHash: checkoutTxHash.trim() },
      });
      setCheckoutInvoice(res.invoice);
      toast.success('TxHash enviado. Pendiente de verificación.');
    } catch (err) {
      toast.error('Error enviando hash: ' + err.message);
    } finally {
      setCheckoutSubmitting(false);
    }
  };

  const cancelCheckout = () => {
    setCheckoutOrder(null);
    setCheckoutInvoice(null);
    setCheckoutTxHash('');
    setView('home');
  };

  // Admin crypto invoices
  const [rejectCryptoInvoiceId, setRejectCryptoInvoiceId] = useState(null);
  const [rejectCryptoReason, setRejectCryptoReason] = useState('');

  const loadAdminCryptoInvoices = async () => {
    try {
      const res = await api('/admin/crypto-invoices', { token });
      setAdminData((d) => ({ ...d, cryptoInvoices: res.invoices || [] }));
    } catch (err) {
      toast.error('Error cargando facturas crypto: ' + err.message);
    }
  };

  const onApproveCryptoInvoice = async (invoiceId) => {
    try {
      await api(`/admin/crypto-invoices/${invoiceId}/approve`, { method: 'POST', token });
      toast.success('Factura aprobada');
      loadAdminCryptoInvoices();
    } catch (err) {
      toast.error('Error aprobando: ' + err.message);
    }
  };

  const onRejectCryptoInvoice = async () => {
    if (!rejectCryptoInvoiceId) return;
    if (!rejectCryptoReason.trim()) return toast.error('Ingresa un motivo');
    try {
      await api(`/admin/crypto-invoices/${rejectCryptoInvoiceId}/reject`, {
        method: 'POST', token,
        body: { reason: rejectCryptoReason }
      });
      toast.success('Factura rechazada');
      setRejectCryptoInvoiceId(null);
      setRejectCryptoReason('');
      loadAdminCryptoInvoices();
    } catch (err) {
      toast.error('Error rechazando: ' + err.message);
    }
  };

  // === Report ===
  const submitReport = async () => {
    if (!reportForm.reason) return toast.error('Selecciona un motivo');
    try {
      await api('/reports', {
        method: 'POST', token,
        body: { productId: reportTarget?.productId, businessId: reportTarget?.businessId, ...reportForm },
      });
      toast.success('Reporte enviado');
      setReportOpen(false); setReportForm({ reason: '', details: '' });
    } catch (err) { toast.error(err.message); }
  };
  const openReport = (productId, businessId) => {
    setReportTarget({ productId, businessId });
    setReportForm({ reason: '', details: '' });
    setReportOpen(true);
  };

  // === Admin ===
  const [adminLoading, setAdminLoading] = useState(false);
  const adminLoadingRef = React.useRef(false);
  const loadAdmin = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    // Guard: prevent overlapping/duplicate calls (anti-freeze)
    if (adminLoadingRef.current) return;
    adminLoadingRef.current = true;
    setAdminLoading(true);
    try {
      const [pays, usrs, prods, st, settingsRes, reps, cryptoInvoices, ordersRes, transfermovilEventsRes] = await Promise.all([
        api('/admin/payments', { token }),
        api('/admin/users', { token }),
        api('/admin/products?lite=true', { token }).catch(() => api('/admin/products', { token })),
        api('/admin/stats', { token }),
        api('/admin/settings', { token }),
        api('/admin/reports', { token }).catch(() => ({ reports: [] })),
        api('/admin/crypto-invoices', { token }).catch(() => ({ invoices: [] })),
        api('/admin/orders', { token }).catch(() => ({ orders: [] })),
        api('/admin/transfermovil-events', { token }).catch(() => ({ events: [] })),
      ]);
      setAdminData({
        payments: pays.payments || [], users: usrs.users || [],
        products: prods.products || [], stats: st, reports: reps.reports || [],
        cryptoInvoices: cryptoInvoices.invoices || [],
        orders: ordersRes.orders || [],
        transfermovilEvents: transfermovilEventsRes.events || [],
      });
      setAdminSettings(settingsRes.settings);
      // Keep global stats in sync with admin stats so home shows latest counters too
      if (st) setStats((prev) => ({
        ...prev,
        productsCount: st.products ?? st.productsCount ?? prev.productsCount ?? 0,
        businessesCount: st.businesses ?? st.businessesCount ?? prev.businessesCount ?? 0,
        usersCount: st.users ?? st.usersCount ?? prev.usersCount ?? 0,
      }));
    } catch (err) { toast.error(err.message); }
    finally { adminLoadingRef.current = false; setAdminLoading(false); }
  }, [token, user]);
  useEffect(() => { if (view === 'admin') loadAdmin(); }, [view, loadAdmin]);

  const approvePayment = async (id) => { try { await api(`/admin/payments/${id}/approve`, { method: 'POST', token }); toast.success('Aprobado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
  const rejectPayment = async (id) => { const r = prompt('Motivo') || ''; try { await api(`/admin/payments/${id}/reject`, { method: 'POST', token, body: { reason: r } }); toast.success('Rechazado'); loadAdmin(); } catch (e) { toast.error(e.message); } };

  const adminUpdateOrder = async (order) => {
    const allowed = ['processing', 'shipped', 'delivered'];
    const currentShippingStatus = allowed.includes(order.shippingStatus)
      ? order.shippingStatus
      : 'processing';
    const status = prompt(
      'Nuevo estado de preparación/entrega:\n' + allowed.join(', '),
      currentShippingStatus
    );
    if (status === null) return;
    if (!allowed.includes(status.trim())) {
      toast.error('Estado no válido. Usa uno de los estados indicados.');
      return;
    }

    const trackingNumber = prompt('Número de seguimiento (deja vacío si no aplica):', order.trackingNumber || '');
    if (trackingNumber === null) return;
    const trackingCarrier = prompt('Transportista:', order.trackingCarrier || '');
    if (trackingCarrier === null) return;
    const adminNotes = prompt('Notas administrativas:', order.adminNotes || '');
    if (adminNotes === null) return;

    try {
      await api(`/admin/orders/${order.id}`, {
        method: 'PUT',
        token,
        body: {
          status: status.trim(),
          trackingNumber: trackingNumber.trim(),
          trackingCarrier: trackingCarrier.trim(),
          adminNotes: adminNotes.trim(),
        },
      });
      toast.success('Pedido actualizado');
      await loadAdmin();
    } catch (e) {
      toast.error('No se pudo actualizar el pedido: ' + e.message);
    }
  };

  // Optimistic UI: update local state immediately, then sync from server. Prevents UI freeze when changing plan.
  const adminUpdateUser = async (id, patch) => {
    setAdminData((d) => ({ ...d, users: (d.users || []).map((u) => u.id === id ? { ...u, ...patch } : u) }));
    try { await api(`/admin/users/${id}`, { method: 'PUT', token, body: patch }); toast.success('Actualizado'); loadAdmin(); }
    catch (e) { toast.error(e.message); loadAdmin(); }
  };
  const adminDeleteProduct = async (id) => {
    if (!confirm('¿Eliminar?')) return;
    setAdminData((d) => ({
      ...d,
      products: (d.products || []).filter((p) => p.id !== id),
      stats: d.stats ? { ...d.stats, products: Math.max(0, (d.stats.products ?? 1) - 1) } : d.stats,
    }));
    setStats((s) => ({ ...s, productsCount: Math.max(0, (s?.productsCount ?? 1) - 1) }));
    try { await api(`/admin/products/${id}`, { method: 'DELETE', token }); toast.success('Eliminado'); loadAdmin(); refreshHome(); }
    catch (e) { toast.error(e.message); loadAdmin(); }
  };
  const adminDeleteUser = async (id, email) => {
    if (!confirm(`⚠️ Eliminar usuario ${email} y TODOS sus datos (negocio, productos, pagos)? Esta acción no se puede deshacer.`)) return;
    const targetUser = (adminData.users || []).find((u) => u.id === id);
    const hadBiz = !!targetUser?.business;
    const ownedProductsCount = (adminData.products || []).filter((p) => p.businessId === targetUser?.business?.id).length;
    setAdminData((d) => ({
      ...d,
      users: (d.users || []).filter((u) => u.id !== id),
      products: (d.products || []).filter((p) => p.businessId !== targetUser?.business?.id),
      stats: d.stats ? {
        ...d.stats,
        users: Math.max(0, (d.stats.users ?? 1) - 1),
        businesses: Math.max(0, (d.stats.businesses ?? 0) - (hadBiz ? 1 : 0)),
        products: Math.max(0, (d.stats.products ?? 0) - ownedProductsCount),
      } : d.stats,
    }));
    setStats((s) => ({
      ...s,
      usersCount: Math.max(0, (s?.usersCount ?? 1) - 1),
      businessesCount: Math.max(0, (s?.businessesCount ?? 0) - (hadBiz ? 1 : 0)),
      productsCount: Math.max(0, (s?.productsCount ?? 0) - ownedProductsCount),
    }));
    try { await api(`/admin/users/${id}`, { method: 'DELETE', token }); toast.success('Usuario eliminado'); loadAdmin(); refreshHome(); }
    catch (e) { toast.error(e.message); loadAdmin(); }
  };
  const adminUpdateBusiness = async (id, patch) => {
    setAdminData((d) => ({
      ...d,
      users: (d.users || []).map((u) => u.business?.id === id ? { ...u, business: { ...u.business, ...patch } } : u),
    }));
    try { await api(`/admin/businesses/${id}`, { method: 'PUT', token, body: patch }); toast.success('Negocio actualizado'); loadAdmin(); refreshHome(); }
    catch (e) { toast.error(e.message); loadAdmin(); }
  };
  const adminDeleteBusiness = async (id, name) => {
    if (!confirm(`Eliminar el negocio "${name}" y todos sus productos? El usuario se convertirá en comprador.`)) return;
    const ownedProductsCount = (adminData.products || []).filter((p) => p.businessId === id).length;
    setAdminData((d) => ({
      ...d,
      users: (d.users || []).map((u) => u.business?.id === id ? { ...u, business: null } : u),
      products: (d.products || []).filter((p) => p.businessId !== id),
      stats: d.stats ? {
        ...d.stats,
        businesses: Math.max(0, (d.stats.businesses ?? 1) - 1),
        products: Math.max(0, (d.stats.products ?? 0) - ownedProductsCount),
      } : d.stats,
    }));
    setStats((s) => ({
      ...s,
      businessesCount: Math.max(0, (s?.businessesCount ?? 1) - 1),
      productsCount: Math.max(0, (s?.productsCount ?? 0) - ownedProductsCount),
    }));
    try { await api(`/admin/businesses/${id}`, { method: 'DELETE', token }); toast.success('Negocio eliminado'); loadAdmin(); refreshHome(); }
    catch (e) { toast.error(e.message); loadAdmin(); }
  };
  const adminResolveReport = async (id, status) => { try { await api(`/admin/reports/${id}`, { method: 'PUT', token, body: { status } }); toast.success('Reporte actualizado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
  const [savingSettings, setSavingSettings] = useState(false);
  const saveAdminSettings = async () => {
    if (savingSettings) return;
    setSavingSettings(true);
    try {
      const d = await api('/admin/settings', { method: 'PUT', token, body: adminSettings });
      setAdminSettings(d.settings);
      setSettings(d.settings);
      toast.success('Guardado ✓');
    } catch (e) { toast.error(e.message); }
    finally { setSavingSettings(false); }
  };

  const onSearch = (e) => {
    e?.preventDefault();
    setCategory('');
    setQuery(searchInput.trim());
    setSuggestOpen(false);
    if (view !== 'home') setView('home');
  };

  const resetFilters = () => {
    setCategory('');
    setFilters({ location: '', businessName: '', country: '', province: '', municipality: '', businessType: '', subcategory: '', currency: '', physicalOnly: false, priceMin: '', priceMax: '', since: '', featuredOnly: false, availableOnly: true });
    setQuery('');
    setSearchInput('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ====== HEADER ====== */}
      <Header
        t={t} lang={lang} setLang={setLang} dark={dark} setDark={setDark}
        user={user} business={business} onLogout={logout}
        cartCount={cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}
        onLogin={() => { setAuthMode('login'); setAuthOpen(true); }}
        onRegister={() => { setAuthMode('register'); setAuthOpen(true); }}
        onPublish={() => {
          if (!user) { setAuthMode('register'); setAuthForm({ ...authForm, accountType: 'seller' }); setAuthOpen(true); }
          else if (!business) { setUpgradeOpen(true); }
          else { setView('dashboard'); setTimeout(openProductCreate, 100); }
        }}
        onUpgradeSeller={() => setUpgradeOpen(true)}
        searchInput={searchInput} setSearchInput={setSearchInput} onSearch={onSearch}
        setView={setView} favorites={favorites}
        dataSaver={dataSaver} setDataSaver={setDataSaver}
        suggestions={suggestions} suggestOpen={suggestOpen} setSuggestOpen={setSuggestOpen}
        suggestLoading={suggestLoading} onSuggestionClick={onSuggestionClick}
      />

      {/* ====== MAIN ====== */}
      <main className="flex-1">
        {view === 'home' && (
          <Home
            t={t} stats={stats} categories={categories}
            category={category} setCategory={setCategory}
            featured={featured} products={products} loading={loading}
            topBusinesses={topBusinesses}
            filters={filters} setFilters={setFilters}
            onProduct={openProduct} onBusiness={openBusiness}
            favorites={favorites} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
            onCTA={() => { if (!user) { setAuthMode('register'); setAuthOpen(true); } else { setView('dashboard'); } }}
            onOpenFilters={() => setFiltersOpen(true)}
            resetFilters={resetFilters}
            query={query} setQuery={setQuery} searchInput={searchInput} setSearchInput={setSearchInput} onSearch={onSearch}
            onPublish={() => {
              if (!user) { setAuthMode('register'); setAuthForm({ ...authForm, accountType: 'seller' }); setAuthOpen(true); }
              else if (!business) { setUpgradeOpen(true); }
              else { setView('dashboard'); setTimeout(openProductCreate, 100); }
            }}
            onRegister={() => { setAuthMode('register'); setAuthOpen(true); }}
            isLogged={!!user}
            dataSaver={dataSaver}
            hasMore={hasMore} loadingMore={loadingMore} onLoadMore={loadMore}
            suggestions={suggestions} suggestOpen={suggestOpen} setSuggestOpen={setSuggestOpen}
            suggestLoading={suggestLoading} onSuggestionClick={onSuggestionClick}
            onFavorites={() => setView('favorites')}
          />
        )}

        {view === 'product' && (
          <ProductDetail
            t={t} product={detail} onBack={() => setView('home')}
            onBusiness={openBusiness} favorites={favorites} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
            token={token} isLogged={!!user}
            onLoginNeeded={() => { setAuthMode('login'); setAuthOpen(true); }}
            startCryptoCheckout={startCryptoCheckout}
            onAddToCart={addToCart}
            checkoutSubmitting={checkoutSubmitting}
          />
        )}

        {view === 'business' && (
          <BusinessDetail
            t={t} data={bizDetail} onBack={() => setView('home')} onProduct={openProduct}
            favorites={favorites} toggleFav={toggleFav}
            token={token} isLogged={!!user}
            onLoginNeeded={() => { setAuthMode('login'); setAuthOpen(true); }}
            onShareBusiness={shareBusiness} onShareProduct={shareProduct}
            onReport={openReport}
          />
        )}

        {view === 'cart' && <CartView t={t} lang={lang} items={cart} onBack={() => setView('home')} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onCheckout={startCryptoCheckout} submitting={checkoutSubmitting} />}

        {view === 'favorites' && (
          <FavoritesView
            t={t} favorites={favorites} onProduct={openProduct} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
          />
        )}

        {view === 'checkout' && checkoutOrder && checkoutInvoice && (
          <CryptoCheckout
            t={t}
            order={checkoutOrder}
            invoice={checkoutInvoice}
            config={cryptoConfig}
            txHash={checkoutTxHash}
            setTxHash={setCheckoutTxHash}
            onSubmit={submitTxHash}
            onCancel={cancelCheckout}
            submitting={checkoutSubmitting}
            onBack={() => setView('home')}
          />
        )}

        {view === 'checkout' && checkoutOrder && !checkoutInvoice && (
          <ManualPaymentCheckout
            order={checkoutOrder}
            token={token}
            onOrderUpdate={setCheckoutOrder}
            onCancel={cancelCheckout}
            onBack={() => setView('home')}
          />
        )}

        {view === 'dashboard' && user && business && (
          <Dashboard
            user={user} business={business} products={myProducts} token={token}
            onNew={openProductCreate} onEdit={openProductEdit} onDelete={deleteProduct}
            onPlan={() => setPlanOpen(true)}
            onShareBusiness={() => shareBusiness(business)}
            compressLogo={compressLogo} compressImage={compressImage} onLogoChange={updateMyLogo} t={t} lang={lang}
          />
        )}
        {view === 'dashboard' && user && !business && (
          <BuyerDashboard t={t} lang={lang} user={user} token={token} showBecomeSeller onBecomeSeller={() => setUpgradeOpen(true)} onFavorites={() => setView('favorites')} favoritesCount={favorites.length} />
        )}
        {view === 'buyer-orders' && user && (
          <BuyerDashboard t={t} lang={lang} user={user} token={token} showBecomeSeller={!business} onBecomeSeller={() => setUpgradeOpen(true)} onFavorites={() => setView('favorites')} favoritesCount={favorites.length} />
        )}
        {view === 'dashboard' && !user && (
          <div className="container mx-auto py-32 text-center">
            <p className="text-muted-foreground mb-4">{t.loginRequired}</p>
            <Button onClick={() => { setAuthMode('login'); setAuthOpen(true); }}>Entrar</Button>
          </div>
        )}

        {view === 'admin' && user?.role === 'admin' && (
          <AdminDashboard
            data={adminData} settings={adminSettings} setSettings={setAdminSettings}
            onApprove={approvePayment} onReject={rejectPayment} onUpdateOrder={adminUpdateOrder}
            onUpdateUser={adminUpdateUser} onDeleteUser={adminDeleteUser}
            onUpdateBusiness={adminUpdateBusiness} onDeleteBusiness={adminDeleteBusiness}
            onDeleteProduct={adminDeleteProduct}
            onResolveReport={adminResolveReport}
            onSaveSettings={saveAdminSettings}
            savingSettings={savingSettings}
            tab={adminTab} setTab={setAdminTab} onRefresh={loadAdmin}
            compressLogo={compressLogo}
            businessTypes={businessTypes}
            onApproveCryptoInvoice={onApproveCryptoInvoice}
            onRejectCryptoInvoice={onRejectCryptoInvoice}
            rejectCryptoInvoiceId={rejectCryptoInvoiceId}
            setRejectCryptoInvoiceId={setRejectCryptoInvoiceId}
            rejectCryptoReason={rejectCryptoReason}
            setRejectCryptoReason={setRejectCryptoReason}
          />
        )}
      </main>

      {/* Publicidad A-ADS solo en vistas públicas; nunca durante el pago ni en administración */}
      {['home', 'product', 'business', 'favorites'].includes(view) && (
        <AadsFloatingAd />
      )}

      {/* ====== FOOTER ====== */}
      <Footer t={t} settings={settings} onLegal={setLegalOpen} setLang={setLang} lang={lang} />

      {/* ====== DIALOGS ====== */}
      <AuthDialog
        open={authOpen} onOpenChange={setAuthOpen}
        mode={authMode} setMode={setAuthMode}
        form={authForm} setForm={setAuthForm}
        onSubmit={handleAuth}
        onForgot={() => { setAuthOpen(false); setForgotStep(1); setForgotOpen(true); }}
        compressLogo={compressLogo}
        businessTypes={businessTypes}
      />
      <UpgradeSellerDialog
        open={upgradeOpen} onOpenChange={setUpgradeOpen}
        form={upgradeForm} setForm={setUpgradeForm} onSubmit={() => upgradeSeller(upgradeForm)}
        compressLogo={compressLogo}
        businessTypes={businessTypes}
      />
      <ForgotDialog
        open={forgotOpen} onOpenChange={setForgotOpen}
        step={forgotStep} setStep={setForgotStep}
        data={forgotData} setData={setForgotData}
        onRequest={requestForgot} onSubmit={submitReset}
      />
      <ProductDialog
        open={productOpen} onOpenChange={setProductOpen}
        editing={editingProduct} form={productForm} setForm={setProductForm}
        onSubmit={submitProduct} onImageFile={onProductImageFile}
        categories={categories} isPremium={user?.plan === 'premium'}
        business={business}
      />
      <PlanDialog
        open={planOpen} onOpenChange={setPlanOpen}
        settings={settings} payment={paymentForm} setPayment={setPaymentForm}
        onSubmit={requestPremium} onScreenshotFile={onScreenshotFile}
        currentPlan={user?.plan}
      />
      <ReportDialog
        open={reportOpen} onOpenChange={setReportOpen}
        form={reportForm} setForm={setReportForm} onSubmit={submitReport}
      />
      <FiltersSheet
        open={filtersOpen} onOpenChange={setFiltersOpen}
        t={t} filters={filters} setFilters={setFilters} onApply={() => setFiltersOpen(false)}
        onClear={() => { setFilters({ location: '', businessName: '', country: '', province: '', municipality: '', businessType: '', subcategory: '', currency: '', physicalOnly: false, priceMin: '', priceMax: '', since: '', featuredOnly: false, availableOnly: true }); setFiltersOpen(false); }}
        categories={categories} category={category} businessTypes={businessTypes}
      />
      <Dialog
        open={cryptoSelectorOpen}
        onOpenChange={(open) => {
          if (open) {
            setCryptoSelectorOpen(true);
          } else {
            closeCryptoSelector();
          }
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>Elige tu criptomoneda y red</DialogTitle>
            <DialogDescription>
              Selecciona cómo deseas pagar. El pedido se creará después de confirmar.
            </DialogDescription>
          </DialogHeader>
          <div className="max-h-[70vh] space-y-4 overflow-y-auto py-2 pr-1">
            <div className="space-y-3">
              <h3 className="font-semibold">Datos de la persona que recibirá el pedido</h3>

              <div className="space-y-3 rounded-lg border p-3">
                <p className="font-medium">¿Cómo recibirás tu pedido?</p>
                <label className="flex cursor-pointer items-start gap-2">
                  <input
                    type="radio"
                    name="delivery-method"
                    value="pickup"
                    checked={deliveryMethod === 'pickup'}
                    onChange={() => setDeliveryMethod('pickup')}
                    disabled={checkoutSubmitting}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Recogida en el negocio</span>
                    <span className="block text-sm text-muted-foreground">
                      Opción disponible para todos los compradores.
                    </span>
                  </span>
                </label>

                {canUseHomeDelivery ? (
                  <label className="flex cursor-pointer items-start gap-2">
                    <input
                      type="radio"
                      name="delivery-method"
                      value="delivery"
                      checked={deliveryMethod === 'delivery'}
                      onChange={() => setDeliveryMethod('delivery')}
                      disabled={checkoutSubmitting}
                      className="mt-1"
                    />
                    <span>
                      <span className="font-medium">Entrega a domicilio</span>
                      <span className="block text-sm text-muted-foreground">
                        Disponible para tu cuenta Premium en este negocio.
                      </span>
                    </span>
                  </label>
                ) : (
                  <p className="text-sm text-muted-foreground">
                    {user?.plan !== 'premium'
                      ? 'La entrega a domicilio requiere el plan Premium.'
                      : 'Este negocio no tiene habilitada la entrega a domicilio.'}
                  </p>
                )}
              </div>

              <div className="space-y-1">
                <Label htmlFor="crypto-recipient-id">ID del destinatario</Label>
                <Input id="crypto-recipient-id" autoComplete="off" maxLength={50}
                  value={cryptoRecipientData.recipientId}
                  onChange={(e) => setCryptoRecipientData((prev) => ({ ...prev, recipientId: e.target.value }))}
                  disabled={checkoutSubmitting} required placeholder="ID de identificación" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="crypto-recipient-name">Nombre y apellidos</Label>
                <Input id="crypto-recipient-name" autoComplete="name" maxLength={100}
                  value={cryptoRecipientData.name}
                  onChange={(e) => setCryptoRecipientData((prev) => ({ ...prev, name: e.target.value }))}
                  disabled={checkoutSubmitting} required placeholder="Nombre completo" />
              </div>
              {deliveryMethod === 'delivery' ? (
                <div className="space-y-1">
                  <Label htmlFor="crypto-recipient-address">Dirección de entrega</Label>
                  <Input id="crypto-recipient-address" autoComplete="street-address" maxLength={500}
                    value={cryptoRecipientData.address}
                    onChange={(e) => setCryptoRecipientData((prev) => ({ ...prev, address: e.target.value }))}
                    disabled={checkoutSubmitting} required placeholder="Calle, número, ciudad y país" />
                </div>
              ) : (
                <p className="rounded-md bg-muted p-3 text-sm">
                  Recogerás el pedido en el negocio. No necesitas introducir una dirección de entrega.
                </p>
              )}
              <div className="space-y-1">
                <Label htmlFor="crypto-recipient-email">Correo electrónico</Label>
                <Input id="crypto-recipient-email" type="email" autoComplete="email" maxLength={254}
                  value={cryptoRecipientData.email}
                  onChange={(e) => setCryptoRecipientData((prev) => ({ ...prev, email: e.target.value }))}
                  disabled={checkoutSubmitting} required placeholder="correo@ejemplo.com" />
              </div>
              <div className="space-y-1">
                <Label htmlFor="crypto-recipient-phone">Teléfono</Label>
                <Input id="crypto-recipient-phone" type="tel" autoComplete="tel" maxLength={20}
                  value={cryptoRecipientData.phone}
                  onChange={(e) => setCryptoRecipientData((prev) => ({ ...prev, phone: e.target.value }))}
                  disabled={checkoutSubmitting} required placeholder="+34 600 000 000" />
              </div>
            </div>
            <div className="space-y-3 border-t pt-4">
              <h3 className="font-semibold">Método de pago</h3>
              {Array.isArray(cryptoConfig?.enabled) && cryptoConfig.enabled.length > 0 && (
                <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3">
                  <input
                    type="radio"
                    name="checkout-payment-method"
                    checked={checkoutPaymentMethod === 'crypto'}
                    onChange={() => setCheckoutPaymentMethod('crypto')}
                    disabled={checkoutSubmitting}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Criptomonedas</span>
                    <span className="block text-sm text-muted-foreground">Pago mediante una red crypto habilitada.</span>
                  </span>
                </label>
              )}
              {checkoutBusiness?.transfermovilEnabled === true
                && checkoutBusiness?.transfermovilNumber
                && checkoutBusiness?.transfermovilName && (
                <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3">
                  <input
                    type="radio"
                    name="checkout-payment-method"
                    checked={checkoutPaymentMethod === 'transfermovil'}
                    onChange={() => setCheckoutPaymentMethod('transfermovil')}
                    disabled={checkoutSubmitting}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">Transfermóvil</span>
                    <span className="block text-sm text-muted-foreground">Transferencia al destinatario del negocio.</span>
                  </span>
                </label>
              )}
              {checkoutBusiness?.enzonaEnabled === true && checkoutBusiness?.enzonaRecipient && (
                <label className="flex cursor-pointer items-start gap-2 rounded-md border p-3">
                  <input
                    type="radio"
                    name="checkout-payment-method"
                    checked={checkoutPaymentMethod === 'enzona'}
                    onChange={() => setCheckoutPaymentMethod('enzona')}
                    disabled={checkoutSubmitting}
                    className="mt-1"
                  />
                  <span>
                    <span className="font-medium">EnZona</span>
                    <span className="block text-sm text-muted-foreground">Pago al destinatario configurado por el negocio.</span>
                  </span>
                </label>
              )}
            </div>

            {checkoutPaymentMethod === 'transfermovil' && (
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p className="font-semibold">Destinatario de Transfermóvil</p>
                <p>Número: {checkoutBusiness?.transfermovilNumber}</p>
                <p>Titular: {checkoutBusiness?.transfermovilName}</p>
                <p className="text-muted-foreground">El pedido quedará pendiente hasta que se revise el pago.</p>
              </div>
            )}
            {checkoutPaymentMethod === 'enzona' && (
              <div className="rounded-md bg-muted p-3 text-sm space-y-1">
                <p className="font-semibold">Destinatario de EnZona</p>
                <p>{checkoutBusiness?.enzonaRecipient}</p>
                <p className="text-muted-foreground">El pedido quedará pendiente hasta que se revise el pago.</p>
              </div>
            )}

            {checkoutPaymentMethod === 'crypto' && (
              <div className="space-y-3 border-t pt-4">
              <Label htmlFor="crypto-network-select">Red de pago</Label>
            <Select
              value={cryptoSelectedKey}
              onValueChange={setCryptoSelectedKey}
              disabled={checkoutSubmitting}
            >
              <SelectTrigger id="crypto-network-select">
                <SelectValue placeholder="Selecciona una red" />
              </SelectTrigger>
              <SelectContent>
                {(cryptoConfig?.enabled || []).map((network) => {
                  const key = `${network.currency}:${network.network}`;
                  return (
                    <SelectItem key={key} value={key}>
                      {network.label || `${network.currency} (${network.network})`}
                    </SelectItem>
                  );
                })}
              </SelectContent>
            </Select>
            {(() => {
              const items = cryptoPendingCheckout?.items || [];
              if (!items.length) return null;

              const total = items.reduce(
                (sum, item) => sum + (Number(item.product?.price) || 0) * (Number(item.quantity) || 0),
                0
              );
              const orderCurrency = String(items[0]?.product?.currency || 'CUP').toUpperCase();
              const configuredRate = Number(settings?.usdRate);
              const usdRate = Number.isFinite(configuredRate) && configuredRate > 0
                ? configuredRate
                : 120;

              const amount = orderCurrency === 'CUP'
                ? total / usdRate
                : ['USD', 'USDT', 'USDC'].includes(orderCurrency)
                  ? total
                  : null;

              const selected = cryptoConfig?.enabled?.find(
                (network) => `${network.currency}:${network.network}` === cryptoSelectedKey
              );

              if (amount === null) {
                return (
                  <p className="text-sm text-destructive" role="alert">
                    No hay conversión configurada de {orderCurrency} a criptomonedas.
                  </p>
                );
              }

              return (
                <div className="rounded-md bg-muted p-3 space-y-1" aria-live="polite">
                  <p className="font-semibold">
                    Importe estimado: {amount.toLocaleString('es-ES', {
                      minimumFractionDigits: 2,
                      maximumFractionDigits: 8
                    })} {selected?.currency || ''}
                  </p>
                  <p className="text-xs text-muted-foreground">
                    {selected?.network ? `Red: ${selected.network}. ` : ''}
                    El importe definitivo se confirmará al crear la factura.
                  </p>
                </div>
              );
            })()}
              </div>
            )}
          </div>
          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              disabled={checkoutSubmitting}
              onClick={closeCryptoSelector}
            >
              Cancelar
            </Button>
            <Button
              type="button"
              disabled={checkoutSubmitting || (checkoutPaymentMethod === 'crypto' && !cryptoSelectedKey)}
              onClick={confirmCryptoCheckout}
            >
              {checkoutSubmitting ? 'Procesando...' : 'Confirmar y crear pedido'}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
      <LegalDialog open={!!legalOpen} onOpenChange={(v) => !v && setLegalOpen(null)} kind={legalOpen} settings={settings} />
    </div>
  );
};

// ============ SUB COMPONENTS ============

// ============ LOGO UPLOADER ============
// Reusable logo upload control with preview, loader and remove button.
// Compresses to WebP/JPEG @ 512×512 max before passing the data URL to onChange.
// The backend turns base64 into a Cloudinary URL on save.
const LogoUploader = ({ value, onChange, compressLogo, label = 'Logo del negocio', size = 'md' }) => {
  const inputRef = React.useRef(null);
  const [busy, setBusy] = React.useState(false);
  const dims = size === 'sm' ? 'h-16 w-16' : size === 'lg' ? 'h-28 w-28' : 'h-20 w-20';
  const handleFile = async (file) => {
    if (!file) return;
    if (!(file.type || '').startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
    if ((file.size || 0) > 5 * 1024 * 1024) { toast.error('El logo debe pesar menos de 5MB'); return; }
    setBusy(true);
    try {
      const dataUrl = await compressLogo(file);
      onChange(dataUrl);
    } catch {
      toast.error('No se pudo procesar la imagen');
    } finally {
      setBusy(false);
      if (inputRef.current) inputRef.current.value = '';
    }
  };
  return (
    <div>
      <Label className="text-sm">{label}</Label>
      <div className="mt-1 flex items-center gap-3">
        <div className={`${dims} rounded-2xl bg-muted border border-border overflow-hidden flex items-center justify-center relative shrink-0`}>
          {busy ? (
            <Loader2 className="h-6 w-6 text-[#1565C0] animate-spin" />
          ) : value ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={value}
              alt="logo preview"
              className="w-full h-full object-cover"
              loading="lazy"
              decoding="async"
            />
          ) : (
            <ImageIcon className="h-6 w-6 text-muted-foreground/50" />
          )}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex flex-wrap gap-2">
            <Button
              type="button"
              variant="outline"
              size="sm"
              disabled={busy}
              onClick={() => inputRef.current?.click()}
            >
              {busy ? (<><Loader2 className="h-3 w-3 mr-1 animate-spin" /> Subiendo...</>) : (value ? 'Cambiar logo' : 'Subir logo')}
            </Button>
            {value && !busy && (
              <Button
                type="button"
                variant="ghost"
                size="sm"
                className="text-destructive hover:text-destructive"
                onClick={() => onChange('')}
              >
                <X className="h-3 w-3 mr-1" /> Quitar
              </Button>
            )}
          </div>
          <p className="text-[11px] text-muted-foreground mt-1 leading-tight">
            JPG/PNG/WebP. Se comprime a ~512px (WebP) para carga rápida en móviles.
          </p>
        </div>
      </div>
      <input
        ref={inputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e) => handleFile(e.target.files?.[0])}
      />
    </div>
  );
};


const LogoSVG = ({ size = 40, showText = false, textWhite = false }) => (
  <img
    src="/ubik-logo-nuevo.jpg"
    width={Math.round(size * 2.7)}
    height={size}
    alt="UBIK2 YEMG"
    loading="eager"
    decoding="async"
    className="flex-shrink-0 object-contain"
    style={{ width: `${Math.round(size * 2.7)}px`, height: `${size}px` }}
  />
);

const Logo = ({ size = 'md', withText = false, onDark = false }) => {
  const px = size === 'lg' ? 56 : size === 'sm' ? 32 : 44;
  return (
    <div className="flex items-center gap-2.5">
      <LogoSVG size={px} />

    </div>
  );
};

const SearchBar = ({ value, onChange, onSubmit, placeholder, suggestions, open, setOpen, loading, onPick, compact = false }) => {
  const [focused, setFocused] = useState(false);
  const show = focused && open && (suggestions?.length > 0 || loading);
  return (
    <div className="relative flex-1">
      <form onSubmit={(e) => { e.preventDefault(); setOpen(false); onSubmit(e); }}>
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground pointer-events-none" />
        <Input
          value={value}
          onChange={(e) => { onChange(e); setOpen(true); }}
          onFocus={() => { setFocused(true); setOpen(true); }}
          onBlur={() => setTimeout(() => setFocused(false), 180)}
          placeholder={placeholder}
          className={compact ? 'pl-9 h-9' : 'pl-9 pr-20 h-10 bg-muted/40'}
          autoComplete="off"
        />
        {!compact && (
          <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 brand-gradient text-white hover:opacity-90">
            Buscar
          </Button>
        )}
      </form>
      {show && (
        <div className="absolute left-0 right-0 top-full mt-1 bg-popover border border-border rounded-md shadow-lg overflow-hidden z-50 max-h-80 overflow-y-auto">
          {loading && suggestions.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground flex items-center gap-2">
              <span className="inline-block h-3 w-3 rounded-full border-2 border-[#1565C0] border-t-transparent animate-spin" />
              Buscando sugerencias…
            </div>
          )}
          {suggestions.map((s, i) => (
            <button
              key={`${s.type}-${s.value}-${i}`}
              type="button"
              onMouseDown={(e) => { e.preventDefault(); onPick(s); }}
              className="w-full text-left px-3 py-2 hover:bg-muted text-sm flex items-center justify-between gap-2 border-b last:border-b-0 border-border/40"
            >
              <span className="flex items-center gap-2 truncate">
                <span className="text-xs uppercase font-semibold text-muted-foreground w-16 flex-shrink-0">
                  {s.type === 'product' ? 'Producto' : s.type === 'business' ? 'Negocio' : 'Categoría'}
                </span>
                <span className="truncate">{s.label}</span>
              </span>
              {s.type === 'product' && s.price != null && (
                <span className="text-xs font-bold text-[#1565C0] flex-shrink-0">
                  {s.currency === 'USDC' ? '💎' : '🇨🇺'} {Number(s.price || 0).toLocaleString('es-ES')}
                </span>
              )}
            </button>
          ))}
          {!loading && suggestions.length === 0 && (
            <div className="p-3 text-xs text-muted-foreground">Sin sugerencias. Pulsa Enter para buscar.</div>
          )}
        </div>
      )}
    </div>
  );
};

const Header = ({ t, lang, setLang, dark, setDark, user, business, onLogout, onLogin, onRegister, onPublish, onUpgradeSeller, searchInput, setSearchInput, onSearch, setView, favorites, cartCount = 0, dataSaver, setDataSaver, suggestions, suggestOpen, setSuggestOpen, suggestLoading, onSuggestionClick }) => {
  const isBuyer = user && !business;
  return (
  <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
    <div className="container mx-auto px-4 h-16 flex items-center gap-3">
      <button onClick={() => setView('home')} className="flex-shrink-0">
        <Logo />
      </button>

      <div className="hidden md:flex flex-1 max-w-2xl mx-2">
        <SearchBar
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          onSubmit={onSearch}
          placeholder={t.searchPlaceholder}
          suggestions={suggestions}
          open={suggestOpen}
          setOpen={setSuggestOpen}
          loading={suggestLoading}
          onPick={onSuggestionClick}
        />
      </div>

      <div className="flex items-center gap-1 ml-auto">
        <Button
          variant="default"
          size="sm"
          onClick={onPublish}
          className="hidden sm:flex bg-[#00A86B] hover:bg-[#008F5B] text-white font-semibold"
        >
          <Plus className="h-4 w-4 mr-1" /> {t.publish}
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setView('favorites')} className="relative">
          <Heart className="h-5 w-5" />
          {favorites.length > 0 && (
            <span className="absolute -top-1 -right-1 bg-[#00A86B] text-white text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-bold">
              {favorites.length}
            </span>
          )}
        </Button>
        <Button variant="ghost" size="icon" onClick={() => setView('cart')} className="relative" aria-label="Abrir carrito" title="Carrito de compras">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-bold">{cartCount}</span>}
        </Button>

        {/* Data saver toggle (ahorro de datos para conexiones lentas) */}
        <Button
          variant="ghost"
          size="icon"
          onClick={() => {
            setDataSaver(!dataSaver);
            toast.success(dataSaver ? 'Modo ahorro de datos: OFF' : 'Modo ahorro de datos: ON', { duration: 2200 });
          }}
          title={dataSaver ? 'Modo ahorro de datos activado (sin imágenes)' : 'Activar modo ahorro de datos'}
          className={dataSaver ? 'text-[#00A86B]' : ''}
          aria-label="Ahorro de datos"
        >
          {dataSaver ? <Leaf className="h-5 w-5" /> : <ImageIcon className="h-5 w-5" />}
        </Button>

        <Button variant="ghost" size="icon" onClick={() => setDark(!dark)}>
          {dark ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
        </Button>

        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon"><Globe className="h-5 w-5" /></Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>{t.languageLabel}</DropdownMenuLabel>
            <DropdownMenuSeparator />
            {Object.entries(LANG_NAMES).map(([k, n]) => (
              <DropdownMenuItem key={k} onClick={() => setLang(k)} className={lang === k ? 'bg-muted' : ''}>
                <span className="mr-2">{FLAGS[k]}</span> {n}
              </DropdownMenuItem>
            ))}
          </DropdownMenuContent>
        </DropdownMenu>

        {user ? (
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button variant="ghost" size="sm" className="font-medium">
                <div className="h-7 w-7 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold mr-1">
                  {(business?.name || user.email)[0]?.toUpperCase()}
                </div>
                <span className="hidden md:inline truncate max-w-32">{business?.name || user.email}</span>
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{business?.name || user.name || user.email}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              {!isBuyer && (
                <DropdownMenuItem onClick={() => setView('dashboard')}>
                  <LayoutDashboard className="h-4 w-4 mr-2" /> {t.panel}
                </DropdownMenuItem>
              )}
              {isBuyer && (
                <DropdownMenuItem onClick={onUpgradeSeller} className="text-[#00A86B] font-semibold">
                  <Store className="h-4 w-4 mr-2" /> Hazte vendedor
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setView('buyer-orders')}>
                <ShoppingBag className="h-4 w-4 mr-2" /> Mis compras y facturas
              </DropdownMenuItem>
              {user.role === 'admin' && (
                <DropdownMenuItem onClick={() => setView('admin')}>
                  <Crown className="h-4 w-4 mr-2 text-[#00A86B]" /> {t.admin}
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setView('favorites')}>
                <Heart className="h-4 w-4 mr-2" /> {t.favorites}
              </DropdownMenuItem>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={onLogout} className="text-destructive">
                <LogOut className="h-4 w-4 mr-2" /> Cerrar sesión
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        ) : (
          <>
            <Button variant="ghost" size="sm" onClick={onLogin} className="hidden sm:inline-flex">{t.enter}</Button>
            <Button size="sm" onClick={onRegister} className="brand-gradient text-white hover:opacity-90 sm:hidden">
              <Plus className="h-4 w-4" />
            </Button>
          </>
        )}
      </div>
    </div>

    {/* Mobile search with autocomplete */}
    <div className="md:hidden border-t border-border px-4 py-2 bg-muted/30">
      <SearchBar
        compact
        value={searchInput}
        onChange={(e) => setSearchInput(e.target.value)}
        onSubmit={onSearch}
        placeholder={t.searchPlaceholder}
        suggestions={suggestions}
        open={suggestOpen}
        setOpen={setSuggestOpen}
        loading={suggestLoading}
        onPick={onSuggestionClick}
      />
    </div>
  </header>
  );
};

// ============ HOME ============

function PublicInvoiceScanner() {
  const [open, setOpen] = React.useState(false);
  const [scanning, setScanning] = React.useState(false);
  const [value, setValue] = React.useState('');
  const [invoice, setInvoice] = React.useState(null);
  const [error, setError] = React.useState('');
  const [loading, setLoading] = React.useState(false);
  const videoRef = React.useRef(null);

  const stopCamera = React.useCallback(() => {
    const video = videoRef.current;
    if (video && video.srcObject) {
      video.srcObject.getTracks().forEach(track => track.stop());
      video.srcObject = null;
    }
  }, []);

  React.useEffect(() => () => stopCamera(), [stopCamera]);

  const lookup = async (input) => {
    const raw = String(input || '').trim();
    if (!raw) return;
    let token = raw;
    try {
      if (/^https?:\/\//i.test(raw)) {
        const url = new URL(raw);
        const match = url.pathname.match(/\/invoice\/([^/]+)/);
        if (!match) throw new Error('El QR no contiene un enlace de factura reconocido.');
        token = decodeURIComponent(match[1]);
      }
    } catch (e) {
      setError(e.message || 'Código QR no válido.');
      return;
    }

    if (!/^[0-9a-f-]{36}$/i.test(token)) {
      setError('Introduce un QR de factura o su identificador válido.');
      return;
    }

    setLoading(true);
    setError('');
    setInvoice(null);
    try {
      const response = await fetch('/api/public/invoices/' + encodeURIComponent(token), {
        method: 'GET',
        cache: 'no-store'
      });
      const data = await response.json();
      if (!response.ok || !data.valid) {
        throw new Error(data.error || 'Factura no encontrada o no válida.');
      }
      setInvoice(data);
      setValue(raw);
      setScanning(false);
      stopCamera();
    } catch (e) {
      setError(e.message || 'No se pudo verificar la factura.');
    } finally {
      setLoading(false);
    }
  };

  React.useEffect(() => {
    if (!open || !scanning) return;
    let cancelled = false;
    let stream = null;
    let frame = null;
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d', { willReadFrequently: true });

    const scanFrame = async () => {
      if (cancelled) return;
      const video = videoRef.current;
      if (video && ctx && video.readyState >= 2 && video.videoWidth > 0) {
        try {
          const width = Math.min(video.videoWidth, 640);
          const height = Math.max(1, Math.round(width * video.videoHeight / video.videoWidth));
          canvas.width = width;
          canvas.height = height;
          ctx.drawImage(video, 0, 0, width, height);
          const pixels = ctx.getImageData(0, 0, width, height);
          const code = jsQR(pixels.data, width, height, { inversionAttempts: 'attemptBoth' });
          if (code && code.data) {
            setValue(code.data);
            setScanning(false);
            await lookup(code.data);
            return;
          }
        } catch (_) {}
      }
      if (!cancelled) frame = requestAnimationFrame(scanFrame);
    };

    const start = async () => {
      try {
        if (!navigator.mediaDevices?.getUserMedia) {
          throw new Error('Este navegador no permite acceder a la cámara. Utiliza una imagen QR o pega el enlace de la factura.');
        }
        stream = await navigator.mediaDevices.getUserMedia({
          video: { facingMode: { ideal: 'environment' } },
          audio: false
        });
        if (cancelled) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        const video = videoRef.current;
        if (!video) {
          stream.getTracks().forEach(track => track.stop());
          return;
        }
        video.srcObject = stream;
        await video.play();
        if (!cancelled) scanFrame();
      } catch (e) {
        setError(e.message || 'No se pudo abrir la cámara. Comprueba los permisos o utiliza una imagen QR.');
        setScanning(false);
      }
    };

    start();
    return () => {
      cancelled = true;
      if (frame) cancelAnimationFrame(frame);
      if (stream) stream.getTracks().forEach(track => track.stop());
      if (videoRef.current) videoRef.current.srcObject = null;
    };
  }, [open, scanning]);

  const scanImage = async (file) => {
    if (!file) return;
    setError('');
    let bitmap = null;
    let objectUrl = null;
    try {
      let source;
      if (typeof createImageBitmap === 'function') {
        bitmap = await createImageBitmap(file);
        source = bitmap;
      } else {
        objectUrl = URL.createObjectURL(file);
        source = await new Promise((resolve, reject) => {
          const image = new Image();
          image.onload = () => resolve(image);
          image.onerror = () => reject(new Error('No se pudo abrir la imagen seleccionada.'));
          image.src = objectUrl;
        });
      }

      const width = source.width || source.naturalWidth;
      const height = source.height || source.naturalHeight;
      if (!width || !height) throw new Error('La imagen no tiene dimensiones válidas.');

      const canvas = document.createElement('canvas');
      const scale = Math.min(1, 1200 / Math.max(width, height));
      canvas.width = Math.max(1, Math.round(width * scale));
      canvas.height = Math.max(1, Math.round(height * scale));
      const ctx = canvas.getContext('2d', { willReadFrequently: true });
      if (!ctx) throw new Error('No se pudo procesar la imagen.');

      ctx.drawImage(source, 0, 0, canvas.width, canvas.height);
      const pixels = ctx.getImageData(0, 0, canvas.width, canvas.height);
      const code = jsQR(pixels.data, canvas.width, canvas.height, { inversionAttempts: 'attemptBoth' });
      if (!code || !code.data) {
        throw new Error('No se encontró un QR legible. Prueba con una imagen más nítida.');
      }
      setValue(code.data);
      await lookup(code.data);
    } catch (e) {
      setError(e.message || 'No se pudo leer esa imagen.');
    } finally {
      if (bitmap && typeof bitmap.close === 'function') bitmap.close();
      if (objectUrl) URL.revokeObjectURL(objectUrl);
    }
  };

  return (
    <div className="mt-4 mx-auto max-w-2xl rounded-2xl border border-white/30 bg-white/95 p-4 text-left text-gray-900 shadow-lg">
      <button type="button" onClick={() => { setOpen(!open); setError(''); }}
        className="w-full rounded-xl bg-[#1565C0] px-4 py-3 font-bold text-white">
        {open ? 'Cerrar verificador de facturas' : '📷 Escanear QR / verificar factura'}
      </button>
      {open && (
        <div className="mt-4 space-y-3">
          <p className="text-sm text-gray-700">Disponible sin iniciar sesión. Consultar una factura no confirma el pago ni libera fondos.</p>
          <div className="flex flex-wrap gap-2">
            <button type="button" onClick={() => { setError(''); setInvoice(null); setScanning(true); }}
              className="rounded-lg border px-3 py-2 text-sm font-semibold">Abrir cámara</button>
            <label className="cursor-pointer rounded-lg border px-3 py-2 text-sm font-semibold">
              Leer imagen QR
              <input type="file" accept="image/*" className="sr-only"
                onChange={e => scanImage(e.target.files?.[0])} />
            </label>
          </div>
          <video ref={videoRef} autoPlay playsInline muted
            className={scanning ? 'w-full max-h-64 rounded-xl bg-black object-contain' : 'hidden'} />
          <form onSubmit={e => { e.preventDefault(); lookup(value); }} className="flex gap-2">
            <input value={value} onChange={e => setValue(e.target.value)}
              placeholder="Pega el enlace o ID de la factura"
              className="min-w-0 flex-1 rounded-lg border border-gray-300 px-3 py-2 text-sm" />
            <button disabled={loading} className="rounded-lg bg-gray-900 px-3 py-2 text-sm font-bold text-white">
              {loading ? 'Verificando…' : 'Verificar'}
            </button>
          </form>
          {error && <p role="alert" className="text-sm text-red-700">{error}</p>}
          {invoice && (
            <div className="space-y-2 rounded-xl border border-green-300 bg-green-50 p-3 text-sm">
              <h3 className="font-bold text-green-900">Factura válida según el servidor</h3>
              <p><b>Número:</b> {invoice.invoiceNumber || invoice.publicInvoiceId || '—'}</p>
              <p><b>Negocio:</b> {invoice.businessName || '—'}</p>
              <div><b>Productos:</b>
                {Array.isArray(invoice.items) && invoice.items.length
                  ? <ul className="list-disc pl-5">{invoice.items.map((item, i) =>
                      <li key={i}>{item.name || item.title || item.productName || 'Producto'} × {item.quantity ?? item.qty ?? 1}</li>
                    )}</ul>
                  : <p>Sin detalles de productos disponibles.</p>}
              </div>
              <p><b>Total:</b> {invoice.total ?? '—'} {invoice.currency || '—'}</p>
              <p><b>Estado del pago:</b> {invoice.paymentStatus || 'No disponible'}</p>
              <p className="text-xs text-gray-700">La validez de la factura no demuestra por sí sola que el pago esté confirmado. Este escáner no modifica pedidos, pagos ni escrow.</p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}

const Home = ({ t, stats, categories, category, setCategory, featured, products, loading, topBusinesses = [], filters, setFilters, onProduct, onBusiness, favorites, toggleFav, onShare, onReport, onCTA, onOpenFilters, resetFilters, query, setQuery, searchInput, setSearchInput, onSearch, onPublish, onRegister, isLogged, dataSaver, hasMore, loadingMore, onLoadMore, suggestions, suggestOpen, setSuggestOpen, suggestLoading, onSuggestionClick, onFavorites }) => {
  const [showFeaturedProducts, setShowFeaturedProducts] = React.useState(true);
  const [showFeaturedBusinesses, setShowFeaturedBusinesses] = React.useState(true);
  const hasFiltersOrQuery = query || category || filters.location || filters.priceMin || filters.priceMax || filters.since || filters.subcategory || filters.businessType || filters.country || filters.featuredOnly;

  // Smooth scroll helper
  const scrollToExplore = () => {
    const el = document.getElementById('explore');
    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  // Quick nav actions
  const navActions = [
    { id: 'cats', label: 'Categorías', icon: '🗂️', onClick: () => {
      const el = document.getElementById('categories-section');
      if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }},
    { id: 'stores', label: 'Tiendas', icon: '🏬', onClick: () => {
      setCategory('');
      setFilters({ ...filters, businessType: 'tienda', physicalOnly: false, featuredOnly: false, subcategory: '' });
      scrollToExplore();
    }},
    { id: 'fav', label: 'Favoritos', icon: '❤️', onClick: () => onFavorites?.() },
    { id: 'featured', label: 'Destacados', icon: '⭐', onClick: () => {
      setCategory('');
      setFilters({ ...filters, featuredOnly: true, businessType: '', subcategory: '' });
      scrollToExplore();
    }},
    { id: 'services', label: 'Servicios', icon: '🛠️', onClick: () => {
      setCategory('servicios');
      setFilters({ ...filters, featuredOnly: false, businessType: '', subcategory: '' });
      scrollToExplore();
    }},
    { id: 'offers', label: 'Ofertas', icon: '🏷️', onClick: () => {
      // Until a discount field exists, "Ofertas" muestra los más recientes con stock.
      setCategory('');
      setFilters({ ...filters, since: new Date(Date.now() - 7 * 86400000).toISOString(), featuredOnly: false, businessType: '', subcategory: '' });
      scrollToExplore();
    }},
    { id: 'recent', label: 'Recientes', icon: '🕒', onClick: () => {
      setCategory('');
      setFilters({ ...filters, since: new Date(Date.now() - 30 * 86400000).toISOString(), featuredOnly: false, businessType: '', subcategory: '' });
      scrollToExplore();
    }},
  ];

  return (
    <>
      {/* HERO - compact, mobile-app feel. Products + businesses visible in first viewport. */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative container mx-auto px-4 pt-6 pb-10 md:pt-8 md:pb-12 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight leading-tight drop-shadow">
              {t.slogan}
            </h1>
            <p className="text-white/90 mt-1 text-sm md:text-base">{t.subSlogan}</p>

            {/* Big prominent search — the main entry point */}
            <div className="mt-4 max-w-2xl mx-auto">
              <div className="relative bg-white rounded-2xl shadow-2xl p-2 text-gray-900 [&_input]:!text-gray-900 [&_input]:placeholder:!text-gray-500">
                <SearchBar
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onSubmit={onSearch}
                  placeholder={t.searchPlaceholder}
                  suggestions={suggestions}
                  open={suggestOpen}
                  setOpen={setSuggestOpen}
                  loading={suggestLoading}
                  onPick={onSuggestionClick}
                />
              </div>
            </div>

            <PublicInvoiceScanner />

            {/* CTA buttons compact */}
            <div className="mt-3 flex gap-2 justify-center max-w-xl mx-auto">
              <Button
                size="sm"
                onClick={onPublish}
                className="h-10 bg-[#00A86B] hover:bg-[#008F5B] text-white font-bold shadow-lg flex-1 md:flex-initial md:px-6"
              >
                <Plus className="h-4 w-4 mr-1.5" /> Publicar gratis
              </Button>
              {!isLogged && (
                <Button
                  size="sm"
                  variant="outline"
                  onClick={onRegister}
                  className="h-10 bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20 font-bold flex-1 md:flex-initial md:px-6"
                >
                  <Store className="h-4 w-4 mr-1.5" /> Crear cuenta
                </Button>
              )}
            </div>

            {/* Trust signals - tiny inline */}
            <div className="flex flex-wrap justify-center gap-x-4 gap-y-1 mt-4 text-white/90 text-[11px] md:text-xs">
              <div className="flex items-center gap-1"><ShieldCheck className="h-3.5 w-3.5" /> Seguro</div>
              <div className="flex items-center gap-1"><TrendingUp className="h-3.5 w-3.5" /> Rápido</div>
              <div className="flex items-center gap-1"><Sparkles className="h-3.5 w-3.5" /> Sin comisiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES - keep available while searching or filtering */}
      <section id="categories-section" className="container mx-auto px-4 mt-6 relative z-10">
          <div className="flex items-center justify-between mb-2">
            <h2 className="text-sm font-bold uppercase tracking-wide text-muted-foreground">{t.categories}</h2>
            {category && (
              <Button variant="ghost" size="sm" onClick={() => setCategory('')} className="h-7">
                <X className="h-3 w-3 mr-1" /> {t.clear}
              </Button>
            )}
          </div>
          <div className="flex gap-2 overflow-x-auto pb-2 -mx-4 px-4" style={{ scrollbarWidth: 'thin' }}>
            {categories.map((c) => (
              <button
                key={c.id}
                onClick={() => {
                  setCategory(category === c.id ? '' : c.id);
                  setQuery('');
                  setSearchInput('');
                  setSuggestOpen(false);
                  setFilters({ ...filters, subcategory: '' });
                }}
                className={`shrink-0 flex flex-col items-center justify-center gap-1 min-w-[78px] py-2.5 px-3 rounded-2xl border-2 transition-all ${
                  category === c.id
                    ? 'border-[#1565C0] bg-[#1565C0]/10 shadow-md'
                    : 'border-border bg-card hover:border-[#1565C0]/40'
                }`}
              >
                <span className="text-2xl leading-none">{c.icon}</span>
                <span className={`text-[10.5px] font-semibold text-center leading-tight line-clamp-2 ${category === c.id ? 'text-[#1565C0]' : 'text-foreground'}`}>{c.name}</span>
              </button>
            ))}
          </div>
      </section>

      {/* FEATURED PRODUCTS - PRIMARY HERO CONTENT (above everything else on home) */}
      {!hasFiltersOrQuery && featured.length > 0 && (
        <section className="container mx-auto px-4 mt-8 mb-8">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
                <Star className="h-5 w-5 text-amber-500 fill-amber-500" /> Destacados
              </h2>
              <button type="button" onClick={() => setShowFeaturedProducts(v => !v)}
                aria-expanded={showFeaturedProducts}
                className="text-xs font-semibold rounded-lg border border-border px-3 py-2 hover:bg-muted">
                {showFeaturedProducts ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{featured.length}</span>
          </div>
{showFeaturedProducts && (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {featured.map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => onProduct(p.id)} isFav={favorites.includes(p.id)} onFav={() => toggleFav(p.id)} onShare={() => onShare(p)} onReport={() => onReport(p.id, null)} />
            ))}
          </div>
          )}
        </section>
      )}

      {/* FEATURED BUSINESSES - horizontal carousel */}
      {!hasFiltersOrQuery && topBusinesses.length > 0 && (
        <section className="container mx-auto px-4 mb-10">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-3">
              <h2 className="text-xl md:text-2xl font-extrabold flex items-center gap-2">
                <Store className="h-5 w-5 text-[#00A86B]" /> Negocios destacados
              </h2>
              <button type="button" onClick={() => setShowFeaturedBusinesses(v => !v)}
                aria-expanded={showFeaturedBusinesses}
                className="text-xs font-semibold rounded-lg border border-border px-3 py-2 hover:bg-muted">
                {showFeaturedBusinesses ? 'Ocultar' : 'Mostrar'}
              </button>
            </div>
            <span className="text-xs text-muted-foreground">{topBusinesses.length}</span>
          </div>
{showFeaturedBusinesses && (
          <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory" style={{ scrollbarWidth: 'thin' }}>
            {topBusinesses.map((b) => (
              <button
                key={b.id}
                onClick={() => onBusiness(b.id)}
                className="snap-start shrink-0 w-[180px] md:w-[210px] rounded-2xl border border-border bg-card overflow-hidden text-left hover:border-[#1565C0]/50 hover:shadow-lg transition group"
              >
                <div className="h-24 brand-gradient relative">
                  {b.logo ? (
                    <img
                      src={cdnThumb(b.logo, 240)}
                      alt={b.name}
                      loading="lazy"
                      decoding="async"
                      className="absolute left-1/2 -translate-x-1/2 -bottom-7 h-14 w-14 rounded-2xl object-cover border-4 border-card shadow-md bg-card"
                    />
                  ) : (
                    <div className="absolute left-1/2 -translate-x-1/2 -bottom-7 h-14 w-14 rounded-2xl bg-card border-4 border-card flex items-center justify-center text-2xl font-bold text-[#1565C0]">
                      {b.name?.[0]?.toUpperCase() || '?'}
                    </div>
                  )}
                </div>
                <div className="pt-9 px-3 pb-3 text-center">
                  <div className="font-bold text-sm line-clamp-1 flex items-center justify-center gap-1">
                    {b.name}
                    {b.verified && <ShieldCheck className="h-3.5 w-3.5 text-[#1565C0] shrink-0" />}
                  </div>
                  {b.location && (
                    <div className="text-[11px] text-muted-foreground line-clamp-1 mt-0.5 flex items-center justify-center gap-1">
                      <MapPin className="h-3 w-3" /> {b.location}
                    </div>
                  )}
                  <div className="mt-2 inline-flex items-center gap-1 text-[11px] bg-[#1565C0]/10 text-[#1565C0] font-semibold rounded-full px-2 py-0.5">
                    <ShoppingBag className="h-3 w-3" /> {b.productsCount} productos
                  </div>
                </div>
              </button>
            ))}
          </div>
          )}
        </section>
      )}

      {/* FILTERS BAR */}
      {hasFiltersOrQuery && (
        <section className="container mx-auto px-4 mt-6">
          <div className="flex flex-wrap items-center gap-2">
            <Badge variant="outline" className="text-xs">
              {products.length} resultado{products.length !== 1 ? 's' : ''}
            </Badge>
            {query && <Badge className="bg-[#1565C0] text-white">"{query}" <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => { setQuery(''); setSearchInput(''); }} /></Badge>}
            {category && <Badge className="bg-[#1565C0] text-white">{categories.find(c => c.id === category)?.name} <X className="h-3 w-3 ml-1 cursor-pointer" onClick={() => setCategory('')} /></Badge>}
            {filters.location && <Badge className="bg-[#1565C0] text-white">{filters.location}</Badge>}
            <Button variant="outline" size="sm" onClick={onOpenFilters}>
              <Filter className="h-3 w-3 mr-1" /> {t.filters}
            </Button>
            <Button variant="ghost" size="sm" onClick={resetFilters}>{t.clear}</Button>
          </div>
        </section>
      )}

      {/* PRODUCTS (search/filter results) */}
      <section className="container mx-auto px-4 mt-8 mb-12" id="explore">
        <div className="flex items-center justify-between mb-4">
          <h2 className="text-xl md:text-2xl font-bold">
            {hasFiltersOrQuery ? `Resultados (${products.length})` : t.latest}
          </h2>
          {!hasFiltersOrQuery && (
            <Button variant="outline" size="sm" onClick={onOpenFilters}>
              <Filter className="h-4 w-4 mr-1" /> {t.filters}
            </Button>
          )}
        </div>
        {loading ? <ProductGridSkeleton /> : products.length === 0 ? (
          <div className="text-center py-16">
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
            <p className="text-muted-foreground">{t.noResults}</p>
          </div>
        ) : (
          <>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
              {products.map((p) => (
                <ProductCard key={p.id} p={p} onClick={() => onProduct(p.id)} isFav={favorites.includes(p.id)} onFav={() => toggleFav(p.id)} onShare={() => onShare(p)} onReport={() => onReport(p.id, null)} />
              ))}
            </div>
            {hasMore && (
              <div className="flex justify-center mt-6">
                <Button
                  onClick={onLoadMore}
                  disabled={loadingMore}
                  variant="outline"
                  size="lg"
                  className="min-w-48 border-[#1565C0] text-[#1565C0] hover:bg-[#1565C0] hover:text-white"
                >
                  {loadingMore ? (
                    <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Cargando…</>
                  ) : (
                    <>Cargar más productos <ChevronRight className="h-4 w-4 ml-1" /></>
                  )}
                </Button>
              </div>
            )}
            {!hasMore && products.length > 12 && (
              <div className="text-center mt-6 text-xs text-muted-foreground">
                ✅ Has visto todos los productos disponibles
              </div>
            )}
          </>
        )}
      </section>

      {/* (Featured products were moved ABOVE the latest grid for better mobile UX) */}

      {/* STATS BANNER */}
      <section className="container mx-auto px-4 mb-12">
        <div className="rounded-2xl brand-gradient text-white p-6 md:p-10 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-3">
            {t.stats} · <span className="text-white/60 text-[10px]">en tiempo real</span>
          </h3>
          <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mt-4">
            {[
              { v: stats.productsCount || 0, l: 'Productos activos' },
              { v: stats.servicesCount || 0, l: 'Servicios' },
              { v: stats.activeBusinessesCount || 0, l: 'Negocios activos' },
              { v: stats.businessesCount || 0, l: 'Negocios totales' },
              { v: stats.usersCount || 0, l: 'Usuarios' },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-2xl md:text-4xl font-extrabold tabular-nums">{Number(s.v).toLocaleString('es-ES')}</div>
                <div className="text-xs md:text-sm text-white/90 mt-1">{s.l}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="container mx-auto px-4 mb-16">
        <Card className="overflow-hidden border-0 shadow-xl">
          <CardContent className="p-6 md:p-12 flex flex-col md:flex-row items-center justify-between gap-6">
            <div>
              <h3 className="text-2xl md:text-3xl font-extrabold">{t.cta}</h3>
              <p className="text-muted-foreground mt-2 max-w-xl">{t.ctaSub}</p>
            </div>
            <Button size="lg" onClick={onCTA} className="bg-[#00A86B] hover:bg-[#008F5B] text-white font-semibold px-8 h-12 text-base">
              <Plus className="h-5 w-5 mr-2" /> {t.publishFree}
            </Button>
          </CardContent>
        </Card>
      </section>
    </>
  );
};

// ============ PRODUCT CARD ============
const ProductCard = ({ p, onClick, isFav, onFav, onShare, onReport, highlight }) => {
  const contactsHidden = p.contactsHidden === true || p.showPublicContact === false || p.business?.contactsHidden === true;
  const { waLink, tgLink, smsLink } = contactsHidden ? {} : buildContactLinks(p);

  return (
    <Card
      className={`overflow-hidden cursor-pointer group bg-card border-border hover:shadow-xl transition-all hover-lift fade-in-up ${highlight ? 'ring-1 ring-amber-400/40' : ''}`}
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            loading="lazy"
            decoding="async"
            className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
          />
        ) : p.hasImage ? (
          // Lite/data-saver mode: image not loaded — placeholder explaining why
          <div className="w-full h-full flex flex-col items-center justify-center text-muted-foreground/70 bg-gradient-to-br from-[#1565C0]/5 to-[#00A86B]/5">
            <ImageOff className="h-10 w-10 mb-1" />
            <span className="text-[10px] text-center px-2">Imagen omitida (ahorro de datos)</span>
          </div>
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground/40">
            <ShoppingBag className="h-12 w-12" />
          </div>
        )}
        {p.featured && (
          <Badge className="absolute top-2 left-2 bg-amber-500 text-black border-0 shadow-md text-[10px]">
            <Sparkles className="h-2.5 w-2.5 mr-1" /> Destacado
          </Badge>
        )}
        <button
          onClick={(e) => { e.stopPropagation(); onFav(); }}
          className="absolute top-2 right-2 h-8 w-8 rounded-full bg-white/90 backdrop-blur flex items-center justify-center shadow-md hover:scale-110 transition"
        >
          <Heart className={`h-4 w-4 ${isFav ? 'fill-red-500 text-red-500' : 'text-foreground'}`} />
        </button>
      </div>

      <CardContent className="p-3">
        <div className="text-xl md:text-2xl font-extrabold text-[#00A86B] leading-none">{formatPrice(p.price, p.currency)}</div>
        <div className="text-sm font-medium mt-1.5 line-clamp-2 leading-tight min-h-[2.5rem]">{p.name}</div>
        <div className="flex items-center justify-between mt-1 text-[11px] text-muted-foreground">
          <span className="flex items-center gap-0.5 truncate">
            <MapPin className="h-3 w-3 flex-shrink-0" />
            <span className="truncate">{p.location || p.business?.location || 'Cuba'}</span>
          </span>
          <span className="flex items-center gap-0.5 flex-shrink-0" suppressHydrationWarning>
            <Clock className="h-3 w-3" /> {timeAgo(p.createdAt)}
          </span>
        </div>
        <div className="flex gap-1.5 mt-2.5" onClick={(e) => e.stopPropagation()}>
          {waLink && (
            <a href={waLink} target="_blank" rel="noopener noreferrer" className="flex-1 h-8 rounded-md bg-green-500 hover:bg-green-600 text-white flex items-center justify-center transition" title="WhatsApp">
              <MessageCircle className="h-4 w-4" />
            </a>
          )}
          {tgLink && (
            <a href={tgLink} target="_blank" rel="noopener noreferrer" className="flex-1 h-8 rounded-md bg-sky-500 hover:bg-sky-600 text-white flex items-center justify-center transition" title="Telegram">
              <Send className="h-4 w-4" />
            </a>
          )}
          {smsLink && (
            <a href={smsLink} className="flex-1 h-8 rounded-md bg-foreground hover:opacity-90 text-background flex items-center justify-center transition" title="SMS">
              <Phone className="h-4 w-4" />
            </a>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

const ProductGridSkeleton = () => (
  <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
    {Array.from({ length: 10 }).map((_, i) => (
      <Card key={i} className="overflow-hidden">
        <Skeleton className="aspect-square" />
        <CardContent className="p-3 space-y-2">
          <Skeleton className="h-6 w-1/2" />
          <Skeleton className="h-4 w-full" />
          <Skeleton className="h-3 w-2/3" />
        </CardContent>
      </Card>
    ))}
  </div>
);

// ============ PRODUCT DETAIL ============
const ProductDetail = ({ t, product, onBack, onBusiness, favorites, toggleFav, onShare, onReport, token, isLogged, onLoginNeeded, startCryptoCheckout, onAddToCart, checkoutSubmitting }) => {
  if (!product) {
    return <div className="container mx-auto py-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1565C0]" /></div>;
  }
  const contact = buildContactLinks(product);
  const { waLink, tgLink, phoneLink, smsLink, anyAvailable } = contact;
  const contactsHidden =
    product.contactsHidden === true ||
    product.showPublicContact === false ||
    product.business?.contactsHidden === true ||
    product.business?.showContactsPublicly === false;
  const isFav = favorites.includes(product.id);

  return (
    <section className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-md">
          <img src={product.image || 'https://placehold.co/600x600?text=Sin+imagen'} alt={product.name} loading="eager" decoding="async" className="w-full aspect-square object-cover" />
        </div>
        <div>
          <div className="flex items-start gap-2 mb-3 flex-wrap">
            {product.featured && (
              <Badge className="bg-amber-500 text-black border-0"><Sparkles className="h-3 w-3 mr-1" /> {t.featured}</Badge>
            )}
            <Badge variant="outline" className="capitalize">{product.category}</Badge>
            {product.stock > 0 ? <Badge className="bg-green-500 text-white">{t.inStock}</Badge> : <Badge variant="destructive">{t.outOfStock}</Badge>}
          </div>
          <h1 className="text-3xl md:text-4xl font-extrabold">{product.name}</h1>
          <div className="text-4xl md:text-5xl font-extrabold text-[#00A86B] mt-3">{formatPrice(product.price, product.currency)}</div>

          <div className="flex flex-wrap items-center gap-4 mt-3 text-sm text-muted-foreground">
            {product.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {product.location}</span>}
            <span className="flex items-center gap-1" suppressHydrationWarning><Clock className="h-4 w-4" /> {timeAgo(product.createdAt)}</span>
          </div>

          <p className="mt-5 text-foreground/90 whitespace-pre-line leading-relaxed">{product.description}</p>

          {/* Action buttons */}
          <div className="grid grid-cols-3 gap-2 mt-6">
            <Button variant="outline" onClick={() => toggleFav(product.id)} className={isFav ? 'border-red-500 text-red-500' : ''}>
              <Heart className={`h-4 w-4 mr-2 ${isFav ? 'fill-current' : ''}`} /> {t.favorites}
            </Button>
            <Button variant="outline" onClick={() => onShare(product)}>
              <Share2 className="h-4 w-4 mr-2" /> {t.share}
            </Button>
            <Button variant="outline" onClick={() => onReport(product.id, null)} className="text-orange-500 border-orange-500/40 hover:bg-orange-50">
              <Flag className="h-4 w-4 mr-2" /> {t.report}
            </Button>
          </div>

          {/* Contact section */}
          <div className="mt-6 p-5 rounded-2xl bg-gradient-to-br from-[#1565C0]/5 via-card to-[#00A86B]/5 border border-border shadow-sm">
            {/* Mostrar solo los canales configurados y respetar la privacidad. */}
            {contactsHidden ? (() => {
              const province = product.province || product.business?.province;
              const municipality = product.municipality || product.business?.municipality;
              const address = product.address || product.business?.address;
              const opening = product.openingHours || product.business?.openingHours;
              const closing = product.closingHours || product.business?.closingHours;
              const locLine = [municipality, province].filter(Boolean).join(', ') || product.business?.location || product.location;
              return (
                <div className="space-y-3">
                  <div className="flex items-center gap-2 text-[#1565C0] font-semibold">
                    <Store className="h-5 w-5" />
                    <span>Negocio físico</span>
                  </div>
                  <p className="text-sm leading-relaxed">
                    <b>Visita este negocio físicamente para más información o compras.</b>
                  </p>
                  {(address || locLine) && (
                    <div className="text-sm text-muted-foreground flex items-start gap-2">
                      <MapPin className="h-4 w-4 mt-0.5 flex-shrink-0 text-[#00A86B]" />
                      <span>{address && <>{address}<br /></>}{locLine}</span>
                    </div>
                  )}
                  {(opening || closing) && (
                    <div className="text-sm text-muted-foreground flex items-center gap-2">
                      <Clock className="h-4 w-4 text-[#00A86B]" />
                      <span>Horario: <b>{opening || '—'}</b> a <b>{closing || '—'}</b></span>
                    </div>
                  )}
                </div>
              );
            })() : (
              <div className="space-y-3">
                <div className="font-semibold text-base">Contactar vendedor</div>
                {anyAvailable ? (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
                    {waLink && (
                      <a href={waLink} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm">
                        <MessageCircle className="h-5 w-5" /> WhatsApp
                      </a>
                    )}
                    {tgLink && (
                      <a href={tgLink} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm">
                        <Send className="h-5 w-5" /> Telegram
                      </a>
                    )}
                    {phoneLink && (
                      <a href={phoneLink} className="h-12 rounded-xl bg-foreground text-background hover:opacity-90 font-semibold flex items-center justify-center gap-2 transition shadow-sm">
                        <Phone className="h-5 w-5" /> Llamar
                      </a>
                    )}
                    {smsLink && (
                      <a href={smsLink} className="h-12 rounded-xl border border-border hover:bg-muted font-semibold flex items-center justify-center gap-2 transition shadow-sm">
                        <MessageCircle className="h-5 w-5" /> SMS
                      </a>
                    )}
                  </div>
                ) : (
                  <div className="text-sm text-muted-foreground">
                    Este vendedor no configuró canales de contacto.
                  </div>
                )}
              </div>
            )}

            {/* Las opciones de compra no dependen de los canales de contacto. */}
            {product.stock > 0 && (
              <Button onClick={() => onAddToCart?.(product)} className="w-full h-12 rounded-xl mt-4 border border-[#00A86B] text-[#00A86B] font-bold" variant="outline">
                <ShoppingBag className="h-5 w-5 mr-2" /> Añadir al carrito
              </Button>
            )}

            {product.stock > 0 && (
              <Button
                onClick={() => startCryptoCheckout(product)}
                disabled={checkoutSubmitting}
                className="w-full h-14 rounded-xl mt-3 bg-amber-500 hover:bg-amber-600 text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg"
                aria-label="Comprar con criptomonedas"
              >
                {checkoutSubmitting ? <Loader2 className="h-5 w-5 animate-spin" /> : <CreditCard className="h-5 w-5" />}
                Comprar con Crypto
                <span className="text-xs opacity-80 ml-1">· USDT/USDC</span>
              </Button>
            )}
          </div>

          {/* Seller card */}
          {product.business && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-muted/40 transition" onClick={() => onBusiness(product.business.id)}>
              <div className="flex items-center gap-3">
                {product.business.logo ? (
                  <img
                    src={cdnThumb(product.business.logo, 120)}
                    alt={product.business.name || ''}
                    width={56}
                    height={56}
                    loading="lazy"
                    decoding="async"
                    className="h-14 w-14 rounded-full object-cover border"
                  />
                ) : (
                  <div className="h-14 w-14 rounded-full brand-gradient flex items-center justify-center text-white font-bold text-xl">
                    {product.business?.name?.[0]?.toUpperCase() || "N"}
                  </div>
                )}
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-1 flex-wrap">
                    {product.business.name}
                    {product.business.verified && <ShieldCheck className="h-4 w-4 text-[#1565C0]" />}
                  </div>
                  <div className="text-xs text-muted-foreground flex items-center gap-1">
                    <MapPin className="h-3 w-3" /> {product.business.location || 'Cuba'}
                  </div>
                </div>
                <ChevronRight className="h-5 w-5 text-muted-foreground" />
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Reviews section - full width */}
      <Reviews productId={product.id} token={token} isLogged={isLogged} onLoginNeeded={onLoginNeeded} />
    </section>
  );
};

// ============ BUSINESS DETAIL ============
const BusinessDetail = ({ t, data, onBack, onProduct, favorites, toggleFav, token, isLogged, onLoginNeeded, onShareBusiness, onShareProduct, onReport }) => {
  if (!data) return <div className="container mx-auto py-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1565C0]" /></div>;
  const { business, products } = data;
  const wa = (business.whatsapp || '').replace(/[^0-9+]/g, '').replace('+', '');
  const waLink = wa && `https://wa.me/${wa}`;
  return (
    <section className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>
      <Card className="overflow-hidden">
        <div className="h-32 brand-gradient" />
        <CardContent className="p-6">
          <div className="flex flex-col md:flex-row gap-6 items-start -mt-16 md:-mt-20">
            {business.logo ? (
              <img
                src={cdnThumb(business.logo, 512)}
                alt={business.name}
                width={128}
                height={128}
                loading="eager"
                fetchPriority="high"
                decoding="async"
                className="h-24 w-24 md:h-32 md:w-32 rounded-2xl object-cover border-4 border-card shadow-lg"
              />
            ) : (
              <div className="h-24 w-24 md:h-32 md:w-32 rounded-2xl brand-gradient border-4 border-card shadow-lg flex items-center justify-center text-white text-4xl font-bold">
                {business.name[0]?.toUpperCase()}
              </div>
            )}
            <div className="flex-1 md:pt-16">
              <h1 className="text-2xl md:text-3xl font-extrabold flex items-center gap-2 flex-wrap">
                {business.name}
                {business.verified && <ShieldCheck className="h-6 w-6 text-[#1565C0]" />}
              </h1>
              <p className="text-muted-foreground mt-1">{business.description}</p>
              <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
                {business.location && <span className="flex items-center gap-1"><MapPin className="h-4 w-4" /> {business.location}</span>}
                {business.instagram && <span className="flex items-center gap-1"><Instagram className="h-4 w-4" /> {business.instagram}</span>}
                {business.facebook && <span className="flex items-center gap-1"><Facebook className="h-4 w-4" /> {business.facebook}</span>}
              </div>
              <div className="flex flex-wrap gap-2 mt-4">
                {waLink && (
                  <a href={waLink} target="_blank" rel="noopener noreferrer" className="inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow">
                    <MessageCircle className="h-4 w-4" /> {t.contact}
                  </a>
                )}
                <Button
                  variant="outline"
                  className="h-11 rounded-xl font-semibold"
                  onClick={() => onShareBusiness?.(business)}
                >
                  <Share2 className="h-4 w-4 mr-2" /> Compartir negocio
                </Button>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      <h2 className="text-xl font-bold mt-10 mb-4">Productos del negocio</h2>
      {products.length === 0 ? (
        <p className="text-muted-foreground">Este negocio aún no tiene productos.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              p={{ ...p, business }}
              onClick={() => onProduct(p.id)}
              isFav={favorites.includes(p.id)}
              onFav={() => toggleFav(p.id)}
              onShare={() => onShareProduct?.({ ...p, business })}
              onReport={() => onReport?.(p.id, business.id)}
            />
          ))}
        </div>
      )}

      {/* Business reviews */}
      <Reviews businessId={business.id} token={token} isLogged={isLogged} onLoginNeeded={onLoginNeeded} />
    </section>
  );
};

// ============ FAVORITES ============
const FavoritesView = ({ t, favorites, onProduct, toggleFav, onShare, onReport }) => {
  const [items, setItems] = useState([]);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    if (favorites.length === 0) { setItems([]); setLoading(false); return; }
    Promise.all(favorites.map((id) => api(`/products/${id}`).then((d) => d.product).catch(() => null)))
      .then((arr) => setItems(arr.filter(Boolean)))
      .finally(() => setLoading(false));
  }, [favorites]);
  return (
    <section className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-extrabold mb-6 flex items-center gap-2">
        <Heart className="h-7 w-7 fill-red-500 text-red-500" /> {t.favorites} ({favorites.length})
      </h1>
      {loading ? <ProductGridSkeleton /> : items.length === 0 ? (
        <div className="text-center py-16">
          <Heart className="h-12 w-12 mx-auto text-muted-foreground/30 mb-3" />
          <p className="text-muted-foreground">No tienes favoritos aún. Toca el ❤️ en cualquier producto.</p>
        </div>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
          {items.map((p) => (
            <ProductCard key={p.id} p={p} onClick={() => onProduct(p.id)} isFav={true} onFav={() => toggleFav(p.id)} onShare={() => onShare(p)} onReport={() => onReport(p.id, null)} />
          ))}
        </div>
      )}
    </section>
  );
};

// ============ REVIEWS ============
const StarRating = ({ value, onChange, size = 'md' }) => {
  const sizes = { sm: 'h-3.5 w-3.5', md: 'h-5 w-5', lg: 'h-6 w-6' };
  return (
    <div className="flex items-center gap-0.5">
      {[1, 2, 3, 4, 5].map((n) => (
        <button
          key={n}
          type="button"
          disabled={!onChange}
          onClick={() => onChange?.(n)}
          className={onChange ? 'cursor-pointer hover:scale-110 transition' : 'cursor-default'}
        >
          <Star
            className={`${sizes[size]} ${n <= value ? 'fill-amber-400 text-amber-400' : 'text-muted-foreground/30'}`}
          />
        </button>
      ))}
    </div>
  );
};

const Reviews = ({ productId, businessId, token, isLogged, onLoginNeeded }) => {
  const [data, setData] = useState({ reviews: [], average: 0, count: 0 });
  const [loading, setLoading] = useState(true);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState('');
  const [submitting, setSubmitting] = useState(false);

  const load = useCallback(() => {
    setLoading(true);
    const q = productId ? `productId=${productId}` : `businessId=${businessId}`;
    api(`/reviews?${q}`)
      .then((d) => setData({ reviews: Array.isArray(d?.reviews) ? d.reviews : [], average: d?.average || 0, count: d?.count || 0 }))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, [productId, businessId]);

  useEffect(() => { load(); }, [load]);

  const submit = async (e) => {
    e.preventDefault();
    if (!isLogged) return onLoginNeeded?.();
    if (rating < 1) return toast.error('Selecciona una calificación');
    setSubmitting(true);
    try {
      await api('/reviews', { method: 'POST', token, body: { productId, businessId, rating, comment } });
      toast.success('¡Gracias por tu reseña!');
      setRating(0); setComment('');
      load();
    } catch (err) { toast.error(err.message); }
    finally { setSubmitting(false); }
  };

  return (
    <div className="mt-8 rounded-2xl border border-border bg-card p-5 md:p-6">
      <div className="flex items-center justify-between flex-wrap gap-2 mb-4">
        <h3 className="text-xl font-bold flex items-center gap-2">
          <Star className="h-5 w-5 fill-amber-400 text-amber-400" />
          Reseñas
        </h3>
        {data.count > 0 && (
          <div className="flex items-center gap-2">
            <StarRating value={Math.round(data.average)} />
            <span className="text-sm font-bold">{data.average.toFixed(1)}</span>
            <span className="text-xs text-muted-foreground">· {data.count} reseña{data.count !== 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Add review form */}
      <form onSubmit={submit} className="space-y-2 mb-5 p-4 rounded-xl bg-muted/40">
        <Label className="text-xs">Tu calificación</Label>
        <StarRating value={rating} onChange={setRating} size="lg" />
        <Textarea
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          placeholder="Cuéntanos tu experiencia (opcional, máx 500 caracteres)"
          rows={2}
          maxLength={500}
          className="bg-card"
        />
        <Button type="submit" size="sm" disabled={submitting} className="brand-gradient text-white">
          {submitting ? <Loader2 className="h-4 w-4 mr-1 animate-spin" /> : <Star className="h-4 w-4 mr-1" />}
          {isLogged ? 'Publicar reseña' : 'Inicia sesión para reseñar'}
        </Button>
      </form>

      {/* Reviews list */}
      {loading ? (
        <div className="flex justify-center py-6"><Loader2 className="h-5 w-5 animate-spin text-muted-foreground" /></div>
      ) : data.reviews.length === 0 ? (
        <p className="text-sm text-muted-foreground text-center py-4">Sé el primero en dejar una reseña.</p>
      ) : (
        <div className="space-y-3">
          {data.reviews.map((r) => (
            <div key={r.id} className="border-b border-border last:border-0 pb-3 last:pb-0">
              <div className="flex items-center gap-2 flex-wrap">
                <div className="h-8 w-8 rounded-full brand-gradient flex items-center justify-center text-white text-xs font-bold">
                  {r.userName?.[0]?.toUpperCase() || '?'}
                </div>
                <span className="font-semibold text-sm">{r.userName}</span>
                <StarRating value={r.rating} size="sm" />
                <span className="text-[10px] text-muted-foreground ml-auto" suppressHydrationWarning>{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && <p className="text-sm mt-2 ml-10 text-foreground/90">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ SHOPPING CART ============
const CartView = ({ items, onBack, onUpdateQuantity, onRemove, onCheckout, submitting, t, lang }) => {
  const total = items.reduce((sum, item) => sum + (Number(item.product?.price) || 0) * item.quantity, 0);
  return (
    <section className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between gap-3 mb-6"><div><h1 className="text-3xl font-extrabold">{t.cartTitle}</h1><p className="text-muted-foreground">{t.cartSubtitle}</p></div><Button variant="outline" onClick={onBack}>{t.continueShopping}</Button></div>
      {!items.length ? <Card><CardContent className="p-10 text-center"><ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground"/><h2 className="text-xl font-bold mb-2">{t.emptyCart}</h2><p className="text-muted-foreground mb-4">{t.emptyCartDesc}</p><Button onClick={onBack}>{t.viewProducts}</Button></CardContent></Card> : <>
        <div className="space-y-3">{items.map(({ product, quantity }) => <Card key={product.id}><CardContent className="p-4 flex items-center gap-3">
          {product.image ? <img src={product.image} alt={product.name || t.productFallback} className="w-20 h-20 rounded-lg object-cover bg-muted"/> : <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center"><ShoppingBag className="h-7 w-7"/></div>}
          <div className="flex-1 min-w-0"><div className="font-bold truncate">{product.name || t.productFallback}</div><div className="text-sm text-muted-foreground">{product.price} {product.currency || 'CUP'} c/u</div><div className="flex items-center gap-2 mt-2"><Button size="sm" variant="outline" onClick={() => quantity <= 1 ? onRemove(product.id) : onUpdateQuantity(product.id, quantity - 1)}>−</Button><span>{quantity}</span><Button size="sm" variant="outline" onClick={() => onUpdateQuantity(product.id, quantity + 1)} disabled={quantity >= (Number(product.stock) || 99)}>+</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => onRemove(product.id)}><Trash2 className="h-4 w-4 mr-1"/>{t.removeItem}</Button></div></div>
          <div className="font-bold whitespace-nowrap">{((Number(product.price) || 0) * quantity).toLocaleString(lang === 'en' ? 'en-US' : lang === 'it' ? 'it-IT' : lang === 'ru' ? 'ru-RU' : 'es-ES')} {product.currency || 'CUP'}</div>
        </CardContent></Card>)}</div>
        <Card className="mt-5"><CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4"><div><div className="text-sm text-muted-foreground">{t.estimatedSubtotal}</div><div className="text-2xl font-extrabold">{total.toLocaleString(lang === 'en' ? 'en-US' : lang === 'it' ? 'it-IT' : lang === 'ru' ? 'ru-RU' : 'es-ES')} CUP</div><p className="text-xs text-muted-foreground mt-1">{t.serverCalculatesTotal}</p></div><Button size="lg" disabled={submitting} onClick={() => onCheckout(items)} className="brand-gradient text-white font-bold">{submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <CreditCard className="h-4 w-4 mr-2"/>}{t.payCartCrypto}</Button></CardContent></Card>
      </>}
    </section>
  );
};

// ============ BUYER DASHBOARD ============
const BuyerDashboard = ({ user, token, showBecomeSeller = false, onBecomeSeller, onFavorites, favoritesCount, t, lang = 'es' }) => {
  const [orders, setOrders] = useState([]);
  const [ordersLoading, setOrdersLoading] = useState(true);
  const [ordersError, setOrdersError] = useState('');
  const [openInvoiceId, setOpenInvoiceId] = useState(null);
  const [invoices, setInvoices] = useState({});
  const [invoiceLoading, setInvoiceLoading] = useState({});
  const [invoiceErrors, setInvoiceErrors] = useState({});
  const [invoiceTxHashes, setInvoiceTxHashes] = useState({});
  const [invoiceSubmitLoading, setInvoiceSubmitLoading] = useState({});
  const [invoiceSubmitMessages, setInvoiceSubmitMessages] = useState({});
  const [receiptConfirmLoading, setReceiptConfirmLoading] = useState({});
  const [receiptConfirmMessages, setReceiptConfirmMessages] = useState({});


  useEffect(() => {
    let cancelled = false;

    if (!token) {
      setOrders([]);
      setOrdersLoading(false);
      setOrdersError('Inicia sesión para consultar tus pedidos.');
      return () => { cancelled = true; };
    }

    setOrdersLoading(true);
    setOrdersError('');

    api('/my/orders', { token })
      .then((data) => {
        if (!cancelled) {
          setOrders(Array.isArray(data.orders) ? data.orders : []);
        }
      })
      .catch((error) => {
        if (!cancelled) {
          setOrdersError(error?.message || t.ordersLoadError);
        }
      })
      .finally(() => {
        if (!cancelled) setOrdersLoading(false);
      });

    return () => { cancelled = true; };
  }, [token]);

  const loadInvoice = async (order) => {
    if (openInvoiceId === order.id) {
      setOpenInvoiceId(null);
      return;
    }

    setOpenInvoiceId(order.id);
    if (invoices[order.id] || invoiceLoading[order.id]) return;

    setInvoiceLoading((prev) => ({ ...prev, [order.id]: true }));
    setInvoiceErrors((prev) => ({ ...prev, [order.id]: '' }));

    try {
      const data = await api(`/orders/${encodeURIComponent(order.id)}/invoice`, { token });
      setInvoices((prev) => ({ ...prev, [order.id]: data.invoice }));
    } catch (error) {
      setInvoiceErrors((prev) => ({
        ...prev,
        [order.id]: error?.message || t.invoiceLoadError,
      }));
    } finally {
      setInvoiceLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };


  const downloadOrderInvoice = async (order) => {
    try {
      const response = await fetch(
        `${API}/orders/${encodeURIComponent(order.id)}/invoice/pdf`,
        { headers: { Authorization: `Bearer ${token}` }, cache: 'no-store' }
      );
      if (!response.ok) {
        const data = await response.json().catch(() => ({}));
        throw new Error(data.error || t.invoiceLoadError);
      }
      const blob = await response.blob();
      const objectUrl = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = objectUrl;
      link.download = `factura-${String(order.id || 'pedido').slice(0, 8)}.pdf`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(objectUrl), 1500);
    } catch (error) {
      toast.error(error?.message || t.invoiceLoadError);
    }
  };

  const downloadInvoiceQR = async (order) => {
    if (!order?.publicInvoiceId) {
      toast.error(t.invoiceIdMissing);
      return;
    }
    try {
      const response = await fetch(
        `${API}/public/invoices/${encodeURIComponent(order.publicInvoiceId)}/qr.png`,
        { cache: 'no-store' }
      );
      if (!response.ok) throw new Error(t.qrDownloadError);
      const blob = await response.blob();
      const url = URL.createObjectURL(blob);
      const link = document.createElement('a');
      link.href = url;
      link.download = `qr-factura-${String(order.publicInvoiceId).slice(0, 8)}.png`;
      document.body.appendChild(link);
      link.click();
      link.remove();
      setTimeout(() => URL.revokeObjectURL(url), 1500);
    } catch (error) {
      toast.error(error?.message || 'Error descargando el QR.');
    }
  };

  const confirmOrderReceipt = async (order) => {
    if (!order?.publicInvoiceId) {
      setReceiptConfirmMessages((prev) => ({
        ...prev,
        [order.id]: t.invalidInvoiceId
      }));
      return;
    }

    setReceiptConfirmLoading((prev) => ({ ...prev, [order.id]: true }));
    setReceiptConfirmMessages((prev) => ({ ...prev, [order.id]: '' }));

    try {
      const data = await api(
        `/orders/${encodeURIComponent(order.id)}/confirm-receipt`,
        {
          method: 'POST',
          token,
          body: { publicInvoiceId: order.publicInvoiceId }
        }
      );

      if (data.order) {
        setOrders((prev) =>
          prev.map((item) => item.id === order.id ? data.order : item)
        );
      }

      setReceiptConfirmMessages((prev) => ({
        ...prev,
        [order.id]: data.message || 'Recepción confirmada correctamente.'
      }));
    } catch (error) {
      setReceiptConfirmMessages((prev) => ({
        ...prev,
        [order.id]: error?.message || t.receiptError
      }));
    } finally {
      setReceiptConfirmLoading((prev) => ({ ...prev, [order.id]: false }));
    }
  };

  const submitInvoiceTxHash = async (order) => {
    const txHash = (invoiceTxHashes[order.id] || '').trim();

    if (!txHash) {
      setInvoiceSubmitMessages((prev) => ({
        ...prev,
        [order.id]: 'Introduce el hash de la transacción.',
      }));
      return;
    }

    setInvoiceSubmitLoading((prev) => ({ ...prev, [order.id]: true }));
    setInvoiceSubmitMessages((prev) => ({ ...prev, [order.id]: '' }));

    try {
      const result = await api(
        `/orders/${encodeURIComponent(order.id)}/invoice/submit-tx`,
        {
          method: 'POST',
          token,
          body: { txHash },
        }
      );

      setInvoices((prev) => ({
        ...prev,
        [order.id]: result.invoice,
      }));

      setInvoiceTxHashes((prev) => ({
        ...prev,
        [order.id]: '',
      }));

      setInvoiceSubmitMessages((prev) => ({
        ...prev,
        [order.id]: result.message || t.hashSent,
      }));
    } catch (error) {
      setInvoiceSubmitMessages((prev) => ({
        ...prev,
        [order.id]: error?.message || t.hashError,
      }));
    } finally {
      setInvoiceSubmitLoading((prev) => ({
        ...prev,
        [order.id]: false,
      }));
    }
  };

  const formatMoney = (amount, currency = 'USD') => {
    const value = Number(amount);
    if (!Number.isFinite(value)) return `— ${currency}`;
    try {
      return new Intl.NumberFormat('es-ES', {
        style: 'currency',
        currency: currency || 'USD',
      }).format(value);
    } catch {
      return `${value.toFixed(2)} ${currency || 'USD'}`;
    }
  };

  const formatDate = (value) => {
    if (!value) return '—';
    const date = new Date(value);
    return Number.isNaN(date.getTime())
      ? '—'
      : date.toLocaleString('es-ES');
  };

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <h1 className="text-3xl font-extrabold">
          Hola, {user.name || user.email?.split('@')[0] || 'comprador'} 👋
        </h1>
        <p className="text-muted-foreground">{t.accountSubtitle}</p>
      </div>

      {showBecomeSeller && (
        <Card className="overflow-hidden border-0 shadow-xl mb-6 brand-gradient text-white">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div><Badge className="bg-white/20 text-white border-0 mb-2">Plan PRO</Badge><h2 className="text-2xl md:text-3xl font-extrabold">{t.becomeSellerTitle}</h2><p className="text-white/90 mt-1 max-w-lg">{t.becomeSellerDesc}</p></div>
            <Button size="lg" onClick={onBecomeSeller} className="bg-white text-[#1565C0] hover:bg-white/90 font-bold h-12 px-6"><Store className="h-5 w-5 mr-2" /> Hazte vendedor</Button>
          </CardContent>
        </Card>
      )}

      <div className="grid md:grid-cols-3 gap-4">
        <Card className="hover-lift cursor-pointer" onClick={onFavorites}>
          <CardContent className="p-6">
            <Heart className="h-8 w-8 text-red-500 mb-2" />
            <div className="text-2xl font-bold">{favoritesCount}</div>
            <div className="text-sm text-muted-foreground">Productos guardados</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Mail className="h-8 w-8 text-[#1565C0] mb-2" />
            <div className="text-sm font-semibold break-all">{user.email}</div>
            <div className="text-xs text-muted-foreground">{t.accountEmail}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-6">
            <Sparkles className="h-8 w-8 text-amber-500 mb-2" />
            <div className="text-2xl font-bold capitalize">{user.plan || 'free'}</div>
            <div className="text-xs text-muted-foreground">Tu plan actual</div>
          </CardContent>
        </Card>
      </div>

      <div className="mt-8">
        <h2 className="text-2xl font-bold mb-4">{t.myOrdersInvoices}</h2>

        {ordersLoading && (
          <Card><CardContent className="p-6">{t.loadingOrders}</CardContent></Card>
        )}

        {!ordersLoading && ordersError && (
          <Card>
            <CardContent className="p-6">
              <p className="text-sm text-red-600">{ordersError}</p>
            </CardContent>
          </Card>
        )}

        {!ordersLoading && !ordersError && orders.length === 0 && (
          <Card>
            <CardContent className="p-6 text-muted-foreground">
              {t.noOrders}
            </CardContent>
          </Card>
        )}

        <div className="space-y-4">
          {orders.map((order) => (
            <Card key={order.id || order._id}>
              <CardContent className="p-5 space-y-3">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="font-bold break-all">
                      Pedido {order.id || order._id}
                    </h3>
                    <p className="text-sm text-muted-foreground">
                      {t.orderDate}: {formatDate(order.createdAt)}
                    </p>
                    <p className="text-sm">
                      {t.orderStatus}: <strong>{order.status || order.shippingStatus || 'Pendiente'}</strong>
                    </p>
                    <p className="text-sm">
                      Estado del pago: <strong>{order.paymentStatus || 'Pendiente'}</strong>
                    </p>
                  </div>
                  <div className="md:text-right">
                    <div className="text-xl font-bold">
                      {formatMoney(order.total, order.currency || 'USD')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {order.businessName || 'Comercio'}
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Productos</h4>
                  {Array.isArray(order.items) && order.items.length > 0 ? (
                    <ul className="list-disc pl-5 space-y-1">
                      {order.items.map((item, index) => (
                        <li key={item.productId || item.id || index} className="text-sm">
                          {item.name || item.title || 'Producto'}
                          {' · Cantidad: '}{item.quantity ?? 1}
                          {' · '}{formatMoney(
                            item.lineTotal ?? (Number(item.unitPrice || 0) * Number(item.quantity || 1)),
                            item.currency || order.currency || 'USD'
                          )}
                        </li>
                      ))}
                    </ul>
                  ) : (
                    <p className="text-sm text-muted-foreground">{t.noProductDetails}</p>
                  )}
                </div>

                {order.shipping && (
                  <div className="rounded-lg border p-3">
                    <h4 className="font-semibold mb-1">{t.deliveryData}</h4>
                    {order.shipping.recipientId && <p className="text-sm">ID del destinatario: {order.shipping.recipientId}</p>}
                    {order.shipping.name && <p className="text-sm">Nombre: {order.shipping.name}</p>}
                    {order.shipping.email && <p className="text-sm">Correo electrónico: {order.shipping.email}</p>}
                    {order.shipping.phone && <p className="text-sm">Teléfono: {order.shipping.phone}</p>}
                    {order.shipping.address && <p className="text-sm">Dirección: {order.shipping.address}</p>}
                    {order.shipping.notes && <p className="text-sm">Notas: {order.shipping.notes}</p>}
                  </div>
                )}

                {order.trackingNumber && (
                  <p className="text-sm">
                    Seguimiento: {order.trackingNumber}
                    {order.trackingCarrier ? ` · ${order.trackingCarrier}` : ''}
                  </p>
                )}

                {/* Seguimiento del envío visible para el comprador */}
                {(order.shippingStatus || order.trackingNumber || order.trackingCarrier ||
                  (Array.isArray(order.statusHistory) && order.statusHistory.length > 0) ||
                  (Array.isArray(order.deliveryPhotos) && order.deliveryPhotos.length > 0)) && (
                  <div className="rounded-lg border p-3 space-y-3">
                    <h3 className="font-semibold">Seguimiento del envío</h3>
                    {order.shippingStatus && (
                      <p className="text-sm">
                        Estado:
                        <strong className="ml-1">
                          {{
                            processing: t.preparingOrder,
                            shipped: t.shipped,
                            delivered: t.delivered
                          }[order.shippingStatus] || order.shippingStatus}
                        </strong>
                      </p>
                    )}
                    {(order.trackingNumber || order.trackingCarrier) && (
                      <p className="text-sm">
                        Transportista: {order.trackingCarrier || 'No indicado'}
                        {' · '}Seguimiento: {order.trackingNumber || 'Pendiente'}
                      </p>
                    )}
                    {Array.isArray(order.statusHistory) && order.statusHistory.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Historial del envío</h4>
                        {[...order.statusHistory].reverse().map((entry, index) => (
                          <div key={entry.id || `${entry.at || entry.createdAt || 'evento'}-${index}`}
                               className="border-l-2 pl-3 py-1 space-y-1">
                            <p className="text-sm font-medium">
                              {{
                                processing: t.preparingOrder,
                                shipped: t.shipped,
                                delivered: t.delivered
                              }[entry.status] || entry.status || 'Actualización'}
                            </p>
                            {(entry.at || entry.createdAt) && (
                              <p className="text-xs text-muted-foreground">
                                {new Date(entry.at || entry.createdAt).toLocaleString()}
                              </p>
                            )}
                            {entry.trackingCarrier && (
                              <p className="text-sm">Transportista: {entry.trackingCarrier}</p>
                            )}
                            {entry.trackingNumber && (
                              <p className="text-sm">Seguimiento: {entry.trackingNumber}</p>
                            )}
                            {entry.notes && <p className="text-sm">{entry.notes}</p>}
                          </div>
                        ))}
                      </div>
                    )}
                    {Array.isArray(order.deliveryPhotos) && order.deliveryPhotos.length > 0 && (
                      <div className="space-y-2">
                        <h4 className="text-sm font-medium">Fotos de entrega</h4>
                        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                          {order.deliveryPhotos.map((photo, index) => (
                            <a key={`${photo}-${index}`} href={photo}
                               target="_blank" rel="noopener noreferrer"
                               className="block">
                              <img src={photo} alt={`Foto de entrega ${index + 1}`}
                                   loading="lazy"
                                   className="w-full h-28 object-cover rounded-md border" />
                            </a>
                          ))}
                        </div>
                      </div>
                    )}
                  </div>
                )}


                <div className="pt-2">
                  <Button
                    variant="outline"
                    onClick={() => downloadOrderInvoice(order)}
                  >
                    {t.downloadInvoiceQR}
                  </Button>
                  {order.publicInvoiceId && (
                    <Button variant="outline" onClick={() => downloadInvoiceQR(order)}>
                      Descargar QR en PNG
                    </Button>
                  )}
                  {order.publicInvoiceId && (
                    <Button variant="outline" onClick={() =>
                      window.open(`/invoice/${encodeURIComponent(order.publicInvoiceId)}`, '_blank', 'noopener,noreferrer')
                    }>
                      {t.verifyInvoice}
                    </Button>
                  )}
                </div>

                {order.publicInvoiceId && (
                  <p className="text-xs text-muted-foreground pt-2 break-all">
                    {t.invoiceNumber} <strong>{order.publicInvoiceId}</strong>
                  </p>
                )}

                {(
                  order.paymentStatus === 'paid' ||
                  order.status === 'paid' ||
                  order.status === 'delivered'
                ) && (
                  <>
                    {(order.shippingStatus === 'delivered' || order.status === 'delivered') &&
                     (
                       order.paymentStatus === 'paid' ||
                       order.status === 'paid' ||
                       (!order.paymentStatus && ['processing', 'shipped', 'delivered'].includes(order.status))
                     ) && (
                      <div className="pt-3 space-y-2">
                        {order.buyerReceiptConfirmation?.confirmedAt ? (
                          <p className="text-sm text-green-700 font-medium">
                            Recepción confirmada.
                          </p>
                        ) : (
                          <Button
                            onClick={() => confirmOrderReceipt(order)}
                            disabled={
                              !!receiptConfirmLoading[order.id] ||
                              !order.publicInvoiceId
                            }
                          >
                            {receiptConfirmLoading[order.id]
                              ? 'Confirmando recepción…'
                              : 'Confirmar recepción'}
                          </Button>
                        )}
                        {receiptConfirmMessages[order.id] && (
                          <p className="text-sm" role="status">
                            {receiptConfirmMessages[order.id]}
                          </p>
                        )}
                      </div>
                    )}
                  </>
                )}

                {order.cryptoInvoiceId && (
                  <div className="pt-2">
                    <Button
                      variant="outline"
                      onClick={() => loadInvoice(order)}
                      disabled={!!invoiceLoading[order.id]}
                    >
                      {invoiceLoading[order.id]
                        ? '{t.loadingInvoice}'
                        : openInvoiceId === order.id
                          ? '{t.hideInvoice}'
                          : '{t.viewPaymentInvoice}'}
                    </Button>

                    {openInvoiceId === order.id && invoiceErrors[order.id] && (
                      <p className="text-sm text-red-600 mt-2">{invoiceErrors[order.id]}</p>
                    )}

                    {openInvoiceId === order.id && invoices[order.id] && (
                      <div className="rounded-lg border p-4 mt-3 space-y-1 break-words">
                        <h4 className="font-semibold">Factura de pago</h4>
                        <p className="text-sm">
                          Estado: <strong>{invoices[order.id].status || 'Pendiente'}</strong>
                        </p>
                        <p className="text-sm">
                          Importe esperado: <strong>
                            {formatMoney(
                              invoices[order.id].expectedAmount,
                              invoices[order.id].currency || 'USDT'
                            )}
                          </strong>
                        </p>
                        <p className="text-sm">Red: {invoices[order.id].network || '—'}</p>
                        <p className="text-sm">
                          Dirección de pago: {invoices[order.id].receiverAddress || '—'}
                        </p>
                        <p className="text-sm">
                          Vence: {formatDate(invoices[order.id].expiresAt)}
                        </p>
                        {invoices[order.id].txHash && (
                          <p className="text-sm break-all">
                            Transacción enviada: {invoices[order.id].txHash}
                          </p>
                        )}

                        {!['approved', 'rejected', 'expired', 'submitted'].includes(
                          String(invoices[order.id].status || '').toLowerCase()
                        ) && (
                          <div className="pt-3 space-y-2">
                            <Label htmlFor={`invoice-tx-${order.id}`}>
                              Hash de la transacción
                            </Label>
                            <Input
                              id={`invoice-tx-${order.id}`}
                              value={
                                invoiceTxHashes[order.id] ??
                                invoices[order.id].txHash ??
                                ''
                              }
                              onChange={(event) => {
                                const value = event.target.value;
                                setInvoiceTxHashes((prev) => ({
                                  ...prev,
                                  [order.id]: value,
                                }));
                              }}
                              placeholder="Pega aquí el hash de la operación"
                              autoComplete="off"
                              spellCheck={false}
                              className="font-mono text-sm"
                              disabled={!!invoiceSubmitLoading[order.id]}
                            />
                            <Button
                              type="button"
                              onClick={() => submitInvoiceTxHash(order)}
                              disabled={
                                !!invoiceSubmitLoading[order.id] ||
                                !(invoiceTxHashes[order.id] ??
                                  invoices[order.id].txHash ??
                                  '').trim()
                              }
                            >
                              {invoiceSubmitLoading[order.id]
                                ? 'Enviando hash…'
                                : 'Enviar hash'}
                            </Button>
                            {invoiceSubmitMessages[order.id] && (
                              <p className="text-sm break-words" role="status">
                                {invoiceSubmitMessages[order.id]}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </div>
      </div>

      <Card className="mt-6 border-dashed">
        <CardContent className="p-6 text-center">
          <Crown className="h-10 w-10 mx-auto text-amber-500 mb-3" />
          <h3 className="text-xl font-bold mb-2">UBIK2 YEMG PRO — Próximamente</h3>
          <p className="text-muted-foreground max-w-lg mx-auto text-sm">
            Funciones premium para compradores: alertas de precios, búsquedas guardadas,
            contacto directo prioritario y mucho más.
          </p>
        </CardContent>
      </Card>
    </section>
  );
};

// ============ DASHBOARD (Seller) ============
const Dashboard = ({ user, business, products: rawProducts, onNew, onEdit, onDelete, onPlan, onShareBusiness, compressLogo, compressImage, onLogoChange, token, t, lang = 'es' }) => {
  const products = Array.isArray(rawProducts) ? rawProducts.filter((product) => product && typeof product === 'object') : [];
  const isPremium = user.plan === 'premium';
  const limit = isPremium ? '∞' : `${products.length}/10`;
  const [tab, setTab] = React.useState('all');
  const [groupByCategory, setGroupByCategory] = React.useState(false);
  const [sellerOrders, setSellerOrders] = React.useState([]);
  const [sellerOrdersLoading, setSellerOrdersLoading] = React.useState(true);
  const [sellerOrdersError, setSellerOrdersError] = React.useState('');
  const [sellerOrderForms, setSellerOrderForms] = React.useState({});
  const [sellerOrderSaving, setSellerOrderSaving] = React.useState({});
  const [sellerOrderMessage, setSellerOrderMessage] = React.useState({});

  const [cryptoPayoutWallets, setCryptoPayoutWallets] = React.useState({ ...(business?.cryptoPayoutWallets || {}) });
  const [walletSaving, setWalletSaving] = React.useState(false);
  const [walletMessage, setWalletMessage] = React.useState('');
  const [businessDescription, setBusinessDescription] = React.useState(business?.description || '');
  const [businessLocation, setBusinessLocation] = React.useState(business?.location || '');
  const [transfermovilEnabled, setTransfermovilEnabled] = React.useState(business?.transfermovilEnabled === true);
  const [transfermovilNumber, setTransfermovilNumber] = React.useState(business?.transfermovilNumber || '');
  const [transfermovilName, setTransfermovilName] = React.useState(business?.transfermovilName || '');
  const [transfermovilAccount, setTransfermovilAccount] = React.useState(business?.transfermovilAccount || '');
  const [enzonaEnabled, setEnzonaEnabled] = React.useState(business?.enzonaEnabled === true);
  const [enzonaRecipient, setEnzonaRecipient] = React.useState(business?.enzonaRecipient || '');
  const [paymentSettingsSaving, setPaymentSettingsSaving] = React.useState(false);
  const [paymentSettingsMessage, setPaymentSettingsMessage] = React.useState('');

  const [businessSaving, setBusinessSaving] = React.useState(false);
  const [businessMessage, setBusinessMessage] = React.useState('');
  const [identityVerification, setIdentityVerification] = React.useState(
    business?.identityVerification || user?.identityVerification || null
  );
  const [identityBusy, setIdentityBusy] = React.useState(false);
  const [identityMessage, setIdentityMessage] = React.useState('');
  const [showWallets, setShowWallets] = React.useState(true);
  const [showInventory, setShowInventory] = React.useState(true);

  React.useEffect(() => {
    setCryptoPayoutWallets({ ...(business?.cryptoPayoutWallets || {}) });
    setBusinessDescription(business?.description || '');
    setBusinessLocation(business?.location || '');
    setTransfermovilEnabled(business?.transfermovilEnabled === true);
    setTransfermovilNumber(business?.transfermovilNumber || '');
    setTransfermovilName(business?.transfermovilName || '');
    setTransfermovilAccount(business?.transfermovilAccount || '');
    setEnzonaEnabled(business?.enzonaEnabled === true);
    setEnzonaRecipient(business?.enzonaRecipient || '');

    if (typeof window !== 'undefined' && business?.id) {
      try {
        const saved = window.localStorage.getItem(`ubik-seller-sections-${business.id}`);
        if (saved) {
          const preferences = JSON.parse(saved);
          setShowWallets(preferences.showWallets !== false);
          setShowInventory(preferences.showInventory !== false);
        } else {
          setShowWallets(true);
          setShowInventory(true);
        }
      } catch {
        setShowWallets(true);
        setShowInventory(true);
      }
    }
  }, [business?.id]);

  const saveSectionPreferences = (next) => {
    if (!business?.id || typeof window === 'undefined') return;
    try {
      const current = {
        showWallets,
        showInventory,
        ...next
      };
      window.localStorage.setItem(
        `ubik-seller-sections-${business.id}`,
        JSON.stringify(current)
      );
    } catch {}
  };

  const refreshIdentityVerification = async () => {
    if (!token || identityBusy) return;
    setIdentityBusy(true);
    setIdentityMessage('');
    try {
      const result = await api('/auth/me', { token, retries: 0 });
      const latest = result?.user?.identityVerification
        || result?.business?.identityVerification
        || null;
      setIdentityVerification(latest);
      setIdentityMessage(
        latest?.status === 'approved'
          ? 'Tu identidad está verificada.'
          : 'Estado de verificación actualizado.'
      );
    } catch (error) {
      setIdentityMessage(error?.message || 'No se pudo consultar el estado.');
    } finally {
      setIdentityBusy(false);
    }
  };

  const startIdentityVerification = async () => {
    if (!token || identityBusy) return;
    setIdentityBusy(true);
    setIdentityMessage('');
    try {
      const result = await api('/identity/didit/session', {
        method: 'POST',
        token,
        body: {},
        retries: 0,
        timeout: 20000
      });
      if (!result?.sessionUrl) {
        throw new Error('Didit no devolvió el enlace de verificación.');
      }
      setIdentityVerification({
        provider: 'didit',
        sessionId: result.sessionId,
        sessionUrl: result.sessionUrl,
        status: result.status || 'pending',
        startedAt: new Date().toISOString()
      });
      setIdentityMessage('Sesión creada. Pulsa el enlace para abrir Didit.');
    } catch (error) {
      setIdentityMessage(error?.message || 'No se pudo iniciar la verificación.');
    } finally {
      setIdentityBusy(false);
    }
  };

  const saveSellerPaymentSettings = async () => {
    if (!business?.id || paymentSettingsSaving) return;

    setPaymentSettingsSaving(true);
    setPaymentSettingsMessage('');

    try {
      const result = await api(`/businesses/${business.id}`, {
        method: 'PUT',
        token,
        body: {
          transfermovilEnabled,
          transfermovilNumber: transfermovilNumber.trim(),
          transfermovilName: transfermovilName.trim(),
          transfermovilAccount: transfermovilAccount.trim(),
          enzonaEnabled,
          enzonaRecipient: enzonaRecipient.trim()
        }
      });

      if (result?.error) throw new Error(result.error);

      setPaymentSettingsMessage('Configuración de pagos guardada correctamente.');
      toast.success('Configuración de pagos actualizada');
    } catch (error) {
      setPaymentSettingsMessage(error?.message || 'No se pudo guardar la configuración de pagos.');
    } finally {
      setPaymentSettingsSaving(false);
    }
  };

  const saveBusinessProfile = async () => {
    if (!business?.id || businessSaving) return;
    setBusinessSaving(true);
    setBusinessMessage('');
    try {
      const result = await api(`/businesses/${business.id}`, {
        method: 'PUT',
        token,
        body: {
          description: businessDescription,
          location: businessLocation
        }
      });
      if (result?.error) throw new Error(result.error);
      setBusinessMessage('Descripción y ubicación guardadas correctamente.');
      toast.success('Información del negocio actualizada');
    } catch (error) {
      setBusinessMessage(error?.message || 'No se pudo guardar la información.');
    } finally {
      setBusinessSaving(false);
    }
  };

  const saveCryptoPayoutWallets = async () => {
    if (!business?.id || walletSaving) return;
    setWalletSaving(true);
    setWalletMessage('');
    try {
      const result = await api(`/businesses/${business.id}`, {
        method: 'PUT',
        token,
        body: { cryptoPayoutWallets }
      });
      if (result?.error) throw new Error(result.error);
      setWalletMessage('Billeteras guardadas correctamente.');
    } catch (error) {
      setWalletMessage(error?.message || 'No se pudieron guardar las billeteras.');
    } finally {
      setWalletSaving(false);
    }
  };


  React.useEffect(() => {
    let cancelled = false;
    (async () => {
      setSellerOrdersLoading(true);
      setSellerOrdersError('');
      try {
        const result = await api('/seller/orders', { token });
        if (!cancelled) {
          setSellerOrders(Array.isArray(result?.orders) ? result.orders.filter((order) => order && typeof order === 'object') : []);
        }
      } catch (error) {
        if (!cancelled) {
          setSellerOrdersError(error?.message || t.sellerLoadingError);
        }
      } finally {
        if (!cancelled) setSellerOrdersLoading(false);
      }
    })();
    return () => { cancelled = true; };
  }, [token, business?.id]);

  // Stats derived once
  const stats = React.useMemo(() => {
    const total = products.length;
    const outOfStock = products.filter((p) => !p.stock || p.stock <= 0).length;
    const active = products.filter((p) => p.stock > 0 && p.available !== false).length;
    const featured = products.filter((p) => p.featured).length;
    const byCategory = products.reduce((acc, p) => {
      acc[p.category] = (acc[p.category] || 0) + 1;
      return acc;
    }, {});
    return { total, outOfStock, active, featured, byCategory };
  }, [products]);

  // Filter products based on selected tab
  const visibleProducts = React.useMemo(() => {
    if (tab === 'active') return products.filter((p) => p.stock > 0 && p.available !== false);
    if (tab === 'out') return products.filter((p) => !p.stock || p.stock <= 0);
    if (tab === 'featured') return products.filter((p) => p.featured);
    return products;
  }, [products, tab]);

  // Optional category grouping
  const grouped = React.useMemo(() => {
    if (!groupByCategory) return null;
    const map = {};
    for (const p of visibleProducts) {
      const k = p.category || 'otros';
      (map[k] = map[k] || []).push(p);
    }
    return Object.entries(map).sort((a, b) => b[1].length - a[1].length);
  }, [visibleProducts, groupByCategory]);

  const renderProductCard = (p) => (
    <Card key={p.id} className={`overflow-hidden hover-lift ${(!p.stock || p.stock <= 0) ? 'ring-1 ring-orange-300' : ''}`}>
      <div className="aspect-video bg-muted overflow-hidden relative">
        {p.image && <img src={p.image} alt={p.name} loading="lazy" decoding="async" className="w-full h-full object-cover" />}
        {(!p.stock || p.stock <= 0) && (
          <div className="absolute inset-0 bg-black/40 flex items-center justify-center">
            <Badge variant="destructive" className="font-bold text-xs">⚠️ Sin stock — Oculto</Badge>
          </div>
        )}
      </div>
      <CardContent className="p-4">
        <div className="flex items-start justify-between gap-2">
          <div className="min-w-0">
            <div className="font-semibold truncate">{p.name}</div>
            <div className="text-sm text-[#00A86B] font-bold">{formatPrice(p.price, p.currency)}</div>
            <div className="text-xs text-muted-foreground flex flex-wrap items-center gap-1 mt-1">
              <Badge variant="outline" className="text-[10px]">{p.category}</Badge>
              <span>Stock: <b className={!p.stock || p.stock <= 0 ? 'text-orange-600' : ''}>{p.stock ?? 0}</b></span>
            </div>
          </div>
          {p.featured && <Badge className="bg-amber-500 text-black border-0"><Sparkles className="h-3 w-3" /></Badge>}
        </div>
        {(!p.stock || p.stock <= 0) && (
          <p className="text-[11px] text-orange-700 dark:text-orange-400 bg-orange-50 dark:bg-orange-950/30 border border-orange-200 dark:border-orange-900 rounded-md p-2 mt-2">
            {t.productNotVisible}
          </p>
        )}
        <div className="flex gap-2 mt-3">
          <Button size="sm" variant="outline" className="flex-1" onClick={() => onEdit(p)}>
            <Pencil className="h-3 w-3 mr-1" /> Editar
          </Button>
          <Button size="sm" variant="outline" className="text-destructive border-destructive/40" onClick={() => onDelete(p.id)}>
            <Trash2 className="h-3 w-3" />
          </Button>
        </div>
      </CardContent>
    </Card>
  );

  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div className="flex items-center gap-4 min-w-0">
          {business?.logo ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={cdnThumb(business.logo, 200)}
              alt={business.name}
              width={64}
              height={64}
              loading="eager"
              decoding="async"
              className="h-16 w-16 rounded-2xl object-cover border border-border shadow-sm shrink-0"
            />
          ) : (
            <div className="h-16 w-16 rounded-2xl brand-gradient flex items-center justify-center text-white text-2xl font-bold shrink-0">
              {business?.name?.[0]?.toUpperCase() || '?'}
            </div>
          )}
          <div className="min-w-0">
            <h1 className="text-2xl md:text-3xl font-extrabold truncate">Panel de {business?.name}</h1>
            <p className="text-muted-foreground text-sm">Gestiona tu catálogo y suscripción.</p>
          </div>
        </div>
        <div className="flex gap-2 flex-wrap">
          <Button
            variant="outline"
            onClick={() => document.getElementById('sellerOrdersPanelPhase5')?.scrollIntoView({ behavior: 'smooth', block: 'start' })}
          >
            {t.sellerOrdersTitle} ({sellerOrders.length})
          </Button>
          <Button variant="outline" onClick={onShareBusiness} title="Copiar enlace público del negocio">
            <Share2 className="h-4 w-4 mr-2" /> Compartir negocio
          </Button>
          <Button variant="outline" onClick={onPlan}>
            <Crown className="h-4 w-4 mr-2 text-amber-500" /> {isPremium ? 'Premium activo' : 'Mejorar plan'}
          </Button>
          <Button onClick={onNew} className="bg-[#00A86B] hover:bg-[#008F5B] text-white">
            <Plus className="h-4 w-4 mr-2" /> Nuevo producto
          </Button>
        </div>
      </div>

      {/* === Quick logo edit (owner self-edit) === */}
      {onLogoChange && compressLogo && (
        <Card className={`mb-6 ${!business?.logo ? 'border-[#00A86B]/50 bg-[#00A86B]/5' : ''}`}>
          <CardContent className="p-4">
            {!business?.logo && (
              <div className="mb-3 flex items-start gap-2 text-sm">
                <Sparkles className="h-4 w-4 text-[#00A86B] shrink-0 mt-0.5" />
                <p>
                  <b>{t.noLogoTitle}</b> {t.noLogoDesc}
                </p>
              </div>
            )}
            <LogoUploader
              value={business?.logo || ''}
              onChange={onLogoChange}
              compressLogo={compressLogo}
              label={business?.logo ? 'Logo del negocio (toca para cambiar)' : 'Subir logo del negocio'}
            />
          </CardContent>
        </Card>
      )}


<div className="mb-6 rounded-xl border border-gray-200 p-4">
  <h2 className="mb-3 text-lg font-semibold">Mi negocio: descripción y ubicación</h2>
  <div className="grid grid-cols-1 gap-3">
    <label className="block text-sm font-medium">
      Descripción del negocio
      <textarea
        value={businessDescription}
        onChange={(event) => setBusinessDescription(event.target.value)}
        maxLength={1000}
        rows={3}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2"
        placeholder="Describe tu negocio y lo que ofreces"
      />
    </label>
    <label className="block text-sm font-medium">
      Ubicación del negocio
      <input
        value={businessLocation}
        onChange={(event) => setBusinessLocation(event.target.value)}
        maxLength={200}
        className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2"
        placeholder="La Habana, Cuba"
      />
    </label>
  </div>
  <div className="mt-3 flex flex-wrap items-center gap-3">
    <button
      type="button"
      onClick={saveBusinessProfile}
      disabled={businessSaving}
      className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white disabled:opacity-50"
    >
      {businessSaving ? 'Guardando…' : 'Guardar información'}
    </button>
    <span role="status" aria-live="polite" className="text-sm">{businessMessage}</span>
  </div>
</div>

<div className="mb-6 rounded-xl border border-gray-200 p-4">
  <h2 className="mb-2 text-lg font-semibold">Configurar pagos por Transfermóvil y EnZona</h2>
  <p className="mb-4 text-sm text-gray-600">
    Introduce los datos de tu negocio que verá el comprador. Comprueba que sean correctos antes de habilitar cada método.
  </p>

  <div className="space-y-4">
    <section className="rounded-lg border border-gray-200 p-3">
      <label className="flex items-center gap-2 font-semibold">
        <input
          type="checkbox"
          checked={transfermovilEnabled}
          onChange={(event) => setTransfermovilEnabled(event.target.checked)}
        />
        Habilitar Transfermóvil
      </label>

      <div className="mt-3 grid grid-cols-1 gap-3 md:grid-cols-2">
        <label className="block text-sm font-medium">
          Número de teléfono o tarjeta receptora
          <input
            type="text"
            autoComplete="off"
            value={transfermovilNumber}
            onChange={(event) => setTransfermovilNumber(event.target.value)}
            maxLength={40}
            placeholder="Número o tarjeta para recibir el pago"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium">
          Nombre del titular
          <input
            type="text"
            autoComplete="name"
            value={transfermovilName}
            onChange={(event) => setTransfermovilName(event.target.value)}
            maxLength={100}
            placeholder="Nombre del titular de la cuenta"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2"
          />
        </label>

        <label className="block text-sm font-medium md:col-span-2">
          Cuenta receptora para verificar el SMS
          <input
            type="text"
            autoComplete="off"
            value={transfermovilAccount}
            onChange={(event) => setTransfermovilAccount(event.target.value)}
            maxLength={60}
            placeholder="Identificador de la cuenta que debe aparecer en el SMS"
            className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2"
          />
          <span className="mt-1 block text-xs text-gray-500">
            Este dato se utilizará para contrastar la operación recibida. Guardarlo no confirma por sí solo ningún pago.
          </span>
        </label>
      </div>
    </section>

    <section className="rounded-lg border border-gray-200 p-3">
      <label className="flex items-center gap-2 font-semibold">
        <input
          type="checkbox"
          checked={enzonaEnabled}
          onChange={(event) => setEnzonaEnabled(event.target.checked)}
        />
        Habilitar EnZona
      </label>

      <label className="mt-3 block text-sm font-medium">
        Destinatario EnZona
        <input
          type="text"
          autoComplete="off"
          value={enzonaRecipient}
          onChange={(event) => setEnzonaRecipient(event.target.value)}
          maxLength={150}
          placeholder="Usuario o destinatario para recibir el pago"
          className="mt-1 w-full rounded-lg border border-gray-300 bg-background px-3 py-2"
        />
      </label>
    </section>
  </div>

  <div className="mt-4 flex flex-wrap items-center gap-3">
    <button
      type="button"
      onClick={saveSellerPaymentSettings}
      disabled={paymentSettingsSaving}
      className="rounded-lg bg-green-700 px-4 py-2 font-medium text-white disabled:opacity-50"
    >
      {paymentSettingsSaving ? 'Guardando…' : 'Guardar configuración de pagos'}
    </button>
    <span role="status" aria-live="polite" className="text-sm">
      {paymentSettingsMessage}
    </span>
  </div>
</div>

<div className="mb-4 rounded-xl border border-gray-200 p-4">
  <h2 className="mb-3 text-lg font-semibold">Personalizar panel del vendedor</h2>
  <div className="flex flex-wrap gap-3">
    <button
      type="button"
      aria-pressed={showWallets}
      onClick={() => {
        const next = !showWallets;
        setShowWallets(next);
        saveSectionPreferences({ showWallets: next });
      }}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
    >
      {showWallets ? 'Ocultar billeteras de cobro' : 'Mostrar billeteras de cobro'}
    </button>
    <button
      type="button"
      aria-pressed={showInventory}
      onClick={() => {
        const next = !showInventory;
        setShowInventory(next);
        saveSectionPreferences({ showInventory: next });
      }}
      className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-medium"
    >
      {showInventory ? 'Ocultar inventario' : 'Mostrar inventario'}
    </button>
  </div>
  <p className="mt-2 text-xs text-muted-foreground">
    Estas opciones solo ocultan o muestran secciones del panel. No eliminan productos ni cambian pagos o existencias.
  </p>
</div>

{showWallets && (
<div className="mb-6 rounded-xl border border-gray-200 p-4">
  <h2 className="mb-2 text-lg font-semibold">Billeteras para recibir pagos</h2>
  <p className="mb-4 text-sm text-gray-600">
    Configura las direcciones de destino de tu negocio. Deja vacío un campo para borrar esa dirección.
    {t.walletsNoTransfers}
  </p>
  <div className="grid grid-cols-1 gap-3 md:grid-cols-2">
    {[
      ['TRC20', 'TRON (TRC20) — USDT'],
      ['ERC20', 'Ethereum (ERC20)'],
      ['POLYGON', 'Polygon'],
      ['BASE', 'Base'],
      ['ARBITRUM', 'Arbitrum'],
      ['BEP20', 'BNB Smart Chain']
    ].map(([network, label]) => (
      <label key={network} className="block text-sm font-medium">
        {label}
        <input
          type="text"
          autoComplete="off"
          spellCheck={false}
          value={cryptoPayoutWallets[network] || ''}
          onChange={(event) => setCryptoPayoutWallets((previous) => ({
            ...previous,
            [network]: event.target.value
          }))}
          placeholder={`Dirección ${network}`}
          className="mt-1 w-full rounded-lg border border-gray-300 px-3 py-2"
        />
      </label>
    ))}
  </div>
  <div className="mt-4 flex flex-wrap items-center gap-3">
    <button
      type="button"
      onClick={saveCryptoPayoutWallets}
      disabled={walletSaving}
      className="rounded-lg bg-blue-600 px-4 py-2 font-medium text-white disabled:opacity-50"
    >
      {walletSaving ? 'Guardando…' : t.saveWallets}
    </button>
    <span role="status" aria-live="polite" className="text-sm">{walletMessage}</span>
  </div>
</div>
)}

{showInventory && (
<>
{/* Stats — 4 cards instead of 3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">{t.totalProducts}</div>
          <div className="text-2xl font-bold mt-1">{stats.total}</div>
          <div className="text-[10px] text-muted-foreground mt-1">{isPremium ? 'Plan Premium ∞' : `Plan Básico — ${stats.total}/10`}</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Activos</div>
          <div className="text-2xl font-bold mt-1 text-green-600">{stats.active}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Visibles en el marketplace</div>
        </CardContent></Card>
        <Card className={stats.outOfStock > 0 ? 'border-orange-300' : ''}><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Agotados</div>
          <div className="text-2xl font-bold mt-1 text-orange-600">{stats.outOfStock}</div>
          <div className="text-[10px] text-muted-foreground mt-1">Ocultos automáticamente</div>
        </CardContent></Card>
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Destacados</div>
          <div className="text-2xl font-bold mt-1 text-amber-500 flex items-center gap-1">{stats.featured} <Sparkles className="h-4 w-4" /></div>
          <div className="text-[10px] text-muted-foreground mt-1">{isPremium ? 'Activa destacado al editar' : 'Solo Premium'}</div>
        </CardContent></Card>
      </div>

      {/* Tabs */}
      <Tabs value={tab} onValueChange={setTab} className="mb-4">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
          <TabsList className="flex flex-wrap h-auto">
            <TabsTrigger value="all">Todos ({stats.total})</TabsTrigger>
            <TabsTrigger value="active">Activos ({stats.active})</TabsTrigger>
            <TabsTrigger value="out">
              Agotados {stats.outOfStock > 0 && <span className="ml-1 text-orange-600 font-bold">({stats.outOfStock})</span>}
            </TabsTrigger>
            <TabsTrigger value="featured">Destacados ({stats.featured})</TabsTrigger>
          </TabsList>
          <label className="flex items-center gap-2 text-sm text-muted-foreground cursor-pointer">
            <input type="checkbox" checked={groupByCategory} onChange={(e) => setGroupByCategory(e.target.checked)} />
            {t.groupByCategory}
          </label>
        </div>
      </Tabs>

      {visibleProducts.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">
              {tab === 'out' ? t.noOutOfStock :
               tab === 'featured' ? t.noFeaturedProducts :
               tab === 'active' ? t.noActiveProducts :
               t.noPublishedProducts}
            </p>
            <Button onClick={onNew} className="bg-[#00A86B] hover:bg-[#008F5B] text-white">
              <Plus className="h-4 w-4 mr-2" /> {tab === 'all' ? t.publishFirst : t.createProduct}
            </Button>
          </CardContent>
        </Card>
      ) : grouped ? (
        <div className="space-y-6">
          {grouped.map(([cat, items]) => (
            <div key={cat}>
              <h3 className="text-sm font-bold uppercase tracking-wider text-muted-foreground mb-2 flex items-center gap-2">
                <Tag className="h-3 w-3" /> {cat} <span className="text-xs font-normal">({items.length})</span>
              </h3>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {items.map(renderProductCard)}
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {visibleProducts.map(renderProductCard)}
        </div>
      )}

</>
)}

      {/* Seguimiento de pedidos del vendedor - Fase 5 */}
      <section id="sellerOrdersPanelPhase5" className="mt-8 space-y-4">
        <div>
          <h2 className="text-xl font-bold">{t.sellerOrdersTitle}</h2>
          <p className="text-sm text-muted-foreground">
            {t.sellerOrdersDesc}
          </p>
        </div>

        {sellerOrdersLoading && (
          <Card><CardContent className="p-4 text-sm">{t.loadingSellerOrders}</CardContent></Card>
        )}

        {sellerOrdersError && (
          <Card className="border-destructive">
            <CardContent className="p-4 text-sm text-destructive">
              {sellerOrdersError}
              <Button size="sm" variant="outline" className="ml-3"
                onClick={async () => {
                  setSellerOrdersLoading(true);
                  setSellerOrdersError('');
                  try {
                    const result = await api('/seller/orders', { token });
                    setSellerOrders(Array.isArray(result?.orders) ? result.orders.filter((order) => order && typeof order === 'object') : []);
                  } catch (error) {
                    setSellerOrdersError(error?.message || t.sellerLoadingError);
                  } finally {
                    setSellerOrdersLoading(false);
                  }
                }}>
                Reintentar
              </Button>
            </CardContent>
          </Card>
        )}

        {!sellerOrdersLoading && !sellerOrdersError && sellerOrders.length === 0 && (
          <Card><CardContent className="p-5 text-sm text-muted-foreground">
            {t.noSellerOrders}
          </CardContent></Card>
        )}

        <div className="space-y-4">
          {sellerOrders.map((order) => {
            const form = sellerOrderForms[order.id] || {};
            const saving = Boolean(sellerOrderSaving[order.id]);
            const message = sellerOrderMessage[order.id];
            const photos = Array.isArray(order.deliveryPhotos) ? order.deliveryPhotos : [];
            const history = Array.isArray(order.statusHistory) ? [...order.statusHistory].reverse() : [];
            const paid = (order.paymentStatus || (order.status === 'paid' ? 'paid' : '')) === 'paid';
            const currentStatus = ['processing', 'shipped', 'delivered'].includes(order.shippingStatus)
              ? order.shippingStatus
              : (['processing', 'shipped', 'delivered'].includes(order.status) ? order.status : 'processing');
            const deliveryMethod = order.deliveryMethod || order.shipping?.deliveryMethod || 'pickup';
            const availableStatuses = currentStatus === 'delivered'
              ? ['delivered']
              : deliveryMethod === 'pickup'
                ? (currentStatus === 'processing' ? ['processing', 'delivered'] : [currentStatus, 'delivered'])
                : (currentStatus === 'processing' ? ['processing', 'shipped'] : ['shipped', 'delivered']);

            return (
              <Card key={order.id}>
                <CardContent className="p-4 space-y-4">
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <h3 className="font-bold">{t.orderLabel} #{String(order.id || 'Sin identificador')}</h3>
                      <p className="text-xs text-muted-foreground">
                        {order.createdAt ? new Date(order.createdAt).toLocaleString(({ es: 'es-ES', en: 'en-US', it: 'it-IT', ru: 'ru-RU' })[lang] || 'es-ES') : t.dateUnavailable}
                      </p>
                    </div>
                    <Badge variant={paid ? 'default' : 'outline'}>
                      {paid ? t.paymentConfirmedLabel : t.paymentPendingLabel}
                    </Badge>
                  </div>

                  {order.buyerReceiptConfirmation?.confirmedAt ? (
                    <p className="text-sm font-medium text-green-700">
                      {t.buyerConfirmedReceipt}
                    </p>
                  ) : currentStatus === 'delivered' ? (
                    <p className="text-sm text-amber-700">
                      {t.awaitingBuyerReceipt}
                    </p>
                  ) : null}

                  <div className="text-sm space-y-1">
                    {(Array.isArray(order.items) ? order.items : []).map((item, index) => (
                      <div key={item.id || item.productId || index} className="flex justify-between gap-3">
                        <span>{item.productName || item.name || item.title || 'Producto'} × {item.quantity || item.qty || 1}</span>
                      </div>
                    ))}
                    <div className="font-semibold pt-1">
                      Total: {formatPrice(Number(order.total || order.totalCUP || 0), order.currency || 'CUP')}
                    </div>
                  </div>

                  {order.trackingNumber && (
                    <p className="text-sm">
                      Seguimiento actual: <b>{order.trackingCarrier || 'Transportista no indicado'}</b>
                      {' · '}{order.trackingNumber}
                    </p>
                  )}

                  {!paid && (
                    <p className="text-sm text-amber-700 dark:text-amber-400">
                      No puedes actualizar el envío hasta que el pago esté confirmado.
                    </p>
                  )}

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>{t.shippingStatus}</Label>
                      <select
                        className="w-full h-10 rounded-md border border-input bg-background px-3 text-sm"
                        value={form.status || currentStatus}
                        disabled={!paid || saving}
                        onChange={(e) => setSellerOrderForms((old) => ({
                          ...old,
                          [order.id]: { ...old[order.id], status: e.target.value }
                        }))}
                      >
                        {availableStatuses.map((statusOption) => (
                          <option key={statusOption} value={statusOption}>
                            {{
                              processing: t.preparingOrder,
                              shipped: t.shipped,
                              delivered: t.delivered,
                            }[statusOption] || statusOption}
                          </option>
                        ))}
                      </select>
                    </div>
                    <div className="space-y-1">
                      <Label>Transportista</Label>
                      <Input
                        maxLength={50}
                        placeholder="Ej. transportista local"
                        value={form.trackingCarrier ?? order.trackingCarrier ?? ''}
                        disabled={!paid || saving}
                        onChange={(e) => setSellerOrderForms((old) => ({
                          ...old,
                          [order.id]: { ...old[order.id], trackingCarrier: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>{t.trackingNumber}</Label>
                      <Input
                        maxLength={100}
                        placeholder="Código o referencia del envío"
                        value={form.trackingNumber ?? order.trackingNumber ?? ''}
                        disabled={!paid || saving}
                        onChange={(e) => setSellerOrderForms((old) => ({
                          ...old,
                          [order.id]: { ...old[order.id], trackingNumber: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>{t.buyerNotes}</Label>
                      <textarea
                        className="w-full min-h-20 rounded-md border border-input bg-background px-3 py-2 text-sm"
                        maxLength={1000}
                        placeholder="Información sobre la preparación o entrega"
                        value={form.notes ?? ''}
                        disabled={!paid || saving}
                        onChange={(e) => setSellerOrderForms((old) => ({
                          ...old,
                          [order.id]: { ...old[order.id], notes: e.target.value }
                        }))}
                      />
                    </div>
                    <div className="space-y-1 sm:col-span-2">
                      <Label>{t.deliveryPhotos}</Label>
                      <Input
                        type="file"
                        accept="image/jpeg,image/png,image/webp"
                        multiple
                        disabled={!paid || saving}
                        onChange={async (e) => {
                          const files = Array.from(e.target.files || []).slice(0, 4);
                          if (e.target.files?.length > 4) {
                            toast.error('Selecciona como máximo 4 fotos por actualización.');
                          }
                          try {
                            const converted = await Promise.all(
                              files.map((file) => compressImage(file, 1000, 0.72))
                            );
                            const size = converted.reduce((sum, photo) => sum + photo.length, 0);
                            if (size > 3 * 1024 * 1024) {
                              throw new Error('Las fotos comprimidas superan 3 MB en total. Selecciona menos fotos.');
                            }
                            setSellerOrderForms((old) => ({
                              ...old,
                              [order.id]: { ...old[order.id], deliveryPhotos: converted }
                            }));
                          } catch (error) {
                            toast.error(error?.message || 'No se pudieron procesar las fotos.');
                            e.target.value = '';
                          }
                        }}
                      />
                      <p className="text-xs text-muted-foreground">
                        Las fotos seleccionadas se subirán al guardar. Fotos ya registradas: {photos.length}/12.
                      </p>
                      {(form.deliveryPhotos || []).length > 0 && (
                        <p className="text-xs">{form.deliveryPhotos.length} foto(s) nuevas seleccionadas.</p>
                      )}
                    </div>
                  </div>

                  {message && (
                    <p className={`text-sm ${message.type === 'error' ? 'text-destructive' : 'text-green-600'}`}>
                      {message.text}
                    </p>
                  )}

                  <Button
                    className="bg-[#00A86B] hover:bg-[#008F5B] text-white"
                    disabled={!paid || saving}
                    onClick={async () => {
                      setSellerOrderSaving((old) => ({ ...old, [order.id]: true }));
                      setSellerOrderMessage((old) => ({ ...old, [order.id]: null }));
                      try {
                        const payload = {
                          status: form.status || currentStatus,
                          trackingNumber: form.trackingNumber ?? order.trackingNumber ?? '',
                          trackingCarrier: form.trackingCarrier ?? order.trackingCarrier ?? '',
                          notes: form.notes || '',
                          deliveryPhotos: form.deliveryPhotos || [],
                        };
                        await api(`/seller/orders/${encodeURIComponent(order.id)}`, {
                          method: 'PUT',
                          token,
                          body: payload,
                        });
                        const result = await api('/seller/orders', { token });
                        setSellerOrders(Array.isArray(result?.orders) ? result.orders.filter((order) => order && typeof order === 'object') : []);
                        setSellerOrderForms((old) => {
                          const next = { ...old };
                          delete next[order.id];
                          return next;
                        });
                        setSellerOrderMessage((old) => ({
                          ...old,
                          [order.id]: { type: 'success', text: 'Seguimiento guardado correctamente.' }
                        }));
                      } catch (error) {
                        setSellerOrderMessage((old) => ({
                          ...old,
                          [order.id]: { type: 'error', text: error?.message || t.trackingSaveError }
                        }));
                      } finally {
                        setSellerOrderSaving((old) => ({ ...old, [order.id]: false }));
                      }
                    }}
                  >
                    {saving ? t.saving : t.saveTracking}
                  </Button>

                  {photos.length > 0 && (
                    <div className="space-y-2">
                      <h4 className="text-sm font-semibold">{t.registeredPhotos}</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
                        {photos.map((photo, index) => (
                          <a key={`${photo}-${index}`} href={photo} target="_blank" rel="noreferrer">
                            {/* eslint-disable-next-line @next/next/no-img-element */}
                            <img src={photo} alt={`Foto de entrega ${index + 1}`}
                              className="w-full h-24 object-cover rounded-md border" loading="lazy" />
                          </a>
                        ))}
                      </div>
                    </div>
                  )}

                  {history.length > 0 && (
                    <details>
                      <summary className="cursor-pointer text-sm font-semibold">{t.shippingHistory}</summary>
                      <div className="mt-2 space-y-2">
                        {history.map((entry, index) => (
                          <div key={`${entry.at || index}-${index}`} className="border-l-2 pl-3 py-1 text-sm">
                            <div className="font-medium">
                              {entry.status || 'Actualización'}
                              {entry.at ? ` · ${new Date(entry.at).toLocaleString()}` : ''}
                            </div>
                            {entry.notes && <p className="text-muted-foreground">{entry.notes}</p>}
                          </div>
                        ))}
                      </div>
                    </details>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </section>

    </section>
  );
};

// ============ ADMIN ============
const AdminDashboard = ({ data, settings, setSettings, onApprove, onReject, onUpdateOrder, onUpdateUser, onDeleteUser, onUpdateBusiness, onDeleteBusiness, onDeleteProduct, onResolveReport, onSaveSettings, savingSettings, tab, setTab, onRefresh, compressLogo, businessTypes, onApproveCryptoInvoice, onRejectCryptoInvoice, rejectCryptoInvoiceId, setRejectCryptoInvoiceId, rejectCryptoReason, setRejectCryptoReason }) => {
  const [editBiz, setEditBiz] = useState(null);
  const [showBusinessEditControls, setShowBusinessEditControls] = useState(false);
  const payments = Array.isArray(data?.payments) ? data.payments : [];
  const users = Array.isArray(data?.users) ? data.users : [];
  const products = Array.isArray(data?.products) ? data.products : [];
  const stats = data?.stats ?? null;
  const reports = Array.isArray(data?.reports) ? data.reports : [];
  const pending = payments.filter((p) => p?.status === 'pending');
  const pendingReports = reports.filter((r) => r?.status === 'pending');
  const cryptoInvoices = data.cryptoInvoices || [];
  const transfermovilEvents = Array.isArray(data?.transfermovilEvents) ? data.transfermovilEvents : [];
  const transfermovilPending = transfermovilEvents.filter((event) => event?.status === 'pending_review').length;
  const cryptoPending = cryptoInvoices.filter((i) => i.status === 'submitted' || i.status === 'pending').length;
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-3xl font-extrabold flex items-center gap-2"><Crown className="h-7 w-7 text-amber-500" /> Administración</h1>
          <p className="text-muted-foreground">Gestiona usuarios, productos, pagos y reportes.</p>
        </div>
        <Button variant="outline" onClick={onRefresh}>Actualizar</Button>
      </div>
      {stats && (
        <div className="grid grid-cols-2 lg:grid-cols-6 gap-3 mb-6">
          {[
            { l: 'Productos', v: stats.products },
            { l: 'Negocios', v: stats.businesses },
            { l: 'Usuarios', v: stats.users },
            { l: 'Pagos pend.', v: stats.pendingPayments, hl: stats.pendingPayments > 0 },
            { l: 'Pagos OK', v: stats.approvedPayments },
            { l: 'Reportes pend.', v: pendingReports.length, hl: pendingReports.length > 0 },
          ].map((s, i) => (
            <Card key={i} className={s.hl ? 'border-amber-500 bg-amber-50' : ''}>
              <CardContent className="p-4">
                <div className="text-xs text-muted-foreground">{s.l}</div>
                <div className="text-2xl font-bold mt-1">{s.v}</div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
      <Tabs value={tab} onValueChange={setTab}>
        <TabsList>
          <TabsTrigger value="payments">Pagos {pending.length > 0 && <Badge className="ml-2 bg-amber-500 text-black border-0">{pending.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="crypto-invoices">Crypto Invoices {cryptoPending > 0 && <Badge className="ml-2 bg-blue-500 text-white border-0">{cryptoPending}</Badge>}</TabsTrigger>
          <TabsTrigger value="transfermovil">
            Transfermóvil {transfermovilPending > 0 && <Badge className="ml-2 bg-amber-500 text-black border-0">{transfermovilPending}</Badge>}
          </TabsTrigger>
          <TabsTrigger value="orders">Pedidos ({(data.orders || []).length})</TabsTrigger>
          <TabsTrigger value="reports">Reportes {pendingReports.length > 0 && <Badge className="ml-2 bg-red-500 text-white border-0">{pendingReports.length}</Badge>}</TabsTrigger>
          <TabsTrigger value="users">Usuarios</TabsTrigger>
          <TabsTrigger value="products">Productos</TabsTrigger>
          <TabsTrigger value="settings">Configuración</TabsTrigger>
        </TabsList>

        <TabsContent value="payments" className="mt-4 space-y-3">
          {payments.length === 0 ? <p className="text-muted-foreground text-center py-12">No hay pagos.</p> : payments.map((p) => (
            <Card key={p.id}>
              <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{p.business?.name || '—'}</span>
                    <span className="text-xs text-muted-foreground">{p.user?.email}</span>
                    <Badge variant={p.status === 'pending' ? 'default' : p.status === 'approved' ? 'secondary' : 'destructive'}>{p.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{p.plan} · {p.paymentMethod?.toUpperCase()} · ${p.amount} · ref: {p.reference || 's/ref'}</div>
                  {p.screenshot && (
                    <a
                      href={p.screenshot}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Click para ver comprobante completo"
                      className="inline-block mt-2 rounded-md overflow-hidden border border-border hover:ring-2 hover:ring-[#1565C0] transition-all"
                    >
                      <img
                        src={p.screenshot}
                        alt="Comprobante de pago"
                        loading="lazy"
                        decoding="async"
                        className="max-h-24 cursor-zoom-in"
                      />
                    </a>
                  )}
                </div>
                {p.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onApprove(p.id)} className="bg-green-500 hover:bg-green-600 text-white"><Check className="h-3 w-3 mr-1" /> Aprobar</Button>
                    <Button size="sm" variant="outline" onClick={() => onReject(p.id)} className="text-destructive border-destructive/40">Rechazar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="crypto-invoices" className="mt-4 space-y-3">
          {cryptoInvoices.length === 0 ? <p className="text-muted-foreground text-center py-12">No hay facturas crypto.</p> : cryptoInvoices.map((inv) => (
            <Card key={inv.id}>
              <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-semibold">{inv.business?.name || '—'}</span>
                    <span className="text-xs text-muted-foreground">{inv.buyer?.email}</span>
                    <Badge variant={
                      inv.status === 'pending' ? 'default' :
                      inv.status === 'submitted' ? 'outline' :
                      inv.status === 'approved' ? 'secondary' :
                      inv.status === 'rejected' ? 'destructive' : 'default'
                    }>{inv.status}</Badge>
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">
                    {inv.currency} {inv.network} · {Number(inv.expectedAmount).toLocaleString('es-ES', {minimumFractionDigits: 2})} {inv.currency} · {inv.txHash ? inv.txHash.slice(0, 16) + '...' : 'sin hash'}
                  </div>
                  {inv.txHash && (
                    <a
                      href={({TRC20: `https://tronscan.org/#/transaction/${inv.txHash}`, ERC20: `https://etherscan.io/tx/${inv.txHash}`, POLYGON: `https://polygonscan.com/tx/${inv.txHash}`, BASE: `https://basescan.org/tx/${inv.txHash}`, ARBITRUM: `https://arbiscan.io/tx/${inv.txHash}`, BEP20: `https://bscscan.com/tx/${inv.txHash}`}[inv.network] || `https://etherscan.io/tx/${inv.txHash}`)}
                      target="_blank"
                      rel="noopener noreferrer"
                      title="Ver en explorer"
                      className="inline-block mt-2 text-xs text-blue-600 hover:underline"
                    >
                      Ver transacción en explorer
                    </a>
                  )}
                </div>
                {(inv.status === 'pending' || inv.status === 'submitted') && (
                  <div className="flex gap-2 flex-wrap">
                    {inv.status === 'submitted' && (
                      <Button size="sm" onClick={() => onApproveCryptoInvoice(inv.id)} className="bg-green-500 hover:bg-green-600 text-white">
                        <Check className="h-3 w-3 mr-1" /> Aprobar
                      </Button>
                    )}
                    {inv.status === 'submitted' && (
                      <Button size="sm" variant="outline" onClick={() => { setRejectCryptoInvoiceId(inv.id); setRejectCryptoReason(''); }} className="text-destructive border-destructive/40">
                        Rechazar
                      </Button>
                    )}
                    {inv.status === 'pending' && (
                      <Button size="sm" variant="outline" onClick={() => { setRejectCryptoInvoiceId(inv.id); setRejectCryptoReason(''); }} className="text-destructive border-destructive/40">
                        Rechazar (expirada)
                      </Button>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          ))}

          {rejectCryptoInvoiceId && (
            <AlertDialog open onOpenChange={(open) => { if (!open) { setRejectCryptoInvoiceId(null); setRejectCryptoReason(''); } }}>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>Rechazar factura crypto</AlertDialogTitle>
                  <AlertDialogDescription>
                    Ingresa el motivo del rechazo. El stock del pedido será restaurado.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <Textarea
                  value={rejectCryptoReason}
                  onChange={(e) => setRejectCryptoReason(e.target.value)}
                  placeholder="Motivo (ej: hash no encontrado, importe incorrecto, red errónea)"
                  rows={3}
                  className="mb-4"
                />
                <AlertDialogAction onClick={onRejectCryptoInvoice}>Rechazar</AlertDialogAction>
                <AlertDialogCancel onClick={() => { setRejectCryptoInvoiceId(null); setRejectCryptoReason(''); }}>Cancelar</AlertDialogCancel>
              </AlertDialogContent>
            </AlertDialog>
          )}
        </TabsContent>

        <TabsContent value="transfermovil" className="mt-4 space-y-3">
          <div className="rounded-md border p-3 text-sm">
            <p className="font-semibold">Revisión manual de SMS</p>
            <p className="text-muted-foreground">
              Recibir un mensaje no confirma el pago. Comprueba el importe,
              el destinatario y la referencia antes de gestionar cualquier pedido.
            </p>
          </div>
          {transfermovilEvents.length === 0 ? (
            <p className="text-muted-foreground text-center py-12">
              No hay SMS registrados para revisar.
            </p>
          ) : transfermovilEvents.map((event) => (
            <Card key={event._id}>
              <CardContent className="p-4 space-y-2">
                <div className="flex flex-wrap items-center gap-2">
                  <Badge variant={event.status === 'pending_review' ? 'default' : 'secondary'}>
                    {event.status || 'sin estado'}
                  </Badge>
                  <span className="text-xs text-muted-foreground">
                    Recibido: {event.receivedAt ? new Date(event.receivedAt).toLocaleString('es-ES') : 'fecha no disponible'}
                  </span>
                </div>
                <p className="text-sm">
                  <span className="font-semibold">Remitente:</span> {event.sender || 'No indicado'}
                </p>
                <div className="rounded-md bg-muted p-3 text-sm whitespace-pre-wrap break-words">
                  {event.smsText || 'Mensaje vacío'}
                </div>
                {event.matchedOrderId && (
                  <p className="text-sm">
                    <span className="font-semibold">Pedido relacionado:</span> {event.matchedOrderId}
                  </p>
                )}
                {event.reviewNotes && (
                  <p className="text-sm text-muted-foreground">
                    <span className="font-semibold">Notas:</span> {event.reviewNotes}
                  </p>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="orders" className="mt-4 space-y-3">
          {(data.orders || []).length === 0 ? (
            <p className="text-muted-foreground text-center py-12">Todavía no hay pedidos.</p>
          ) : (data.orders || []).map((order) => (
            <Card key={order.id}>
              <CardContent className="p-4 space-y-3">
                <div className="flex flex-col md:flex-row md:items-start md:justify-between gap-3">
                  <div>
                    <h3 className="font-bold">Pedido #{String(order.id || '').slice(-12)}</h3>
                    <p className="text-sm text-muted-foreground">
                      {order.createdAt ? new Date(order.createdAt).toLocaleString('es-ES') : 'Fecha no disponible'}
                    </p>
                    <p className="text-sm mt-1">Comprador: {order.shipping?.name || order.buyerName || '—'}</p>
                    <p className="text-sm">Correo: {order.buyerEmail || order.shipping?.email || '—'}</p>
                    <p className="text-sm">Teléfono: {order.shipping?.phone || '—'}</p>
                  </div>
                  <div className="space-y-2 md:text-right">
                    <Badge>{order.status || 'pending_payment'}</Badge>
                    <p className="font-bold text-lg">
                      {order.currency || 'USD'} {Number(order.total ?? order.subtotal ?? 0).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                    </p>
                    <Button size="sm" onClick={() => onUpdateOrder(order)}>Actualizar pedido</Button>
                  </div>
                </div>

                <div className="rounded-md border p-3">
                  <h4 className="font-semibold mb-1">Dirección de entrega</h4>
                  <p className="text-sm">{order.shipping?.address || 'No especificada'}</p>
                  {order.shipping?.notes && <p className="text-sm text-muted-foreground mt-1">Indicaciones: {order.shipping.notes}</p>}
                </div>

                <div>
                  <h4 className="font-semibold mb-2">Productos comprados</h4>
                  {(order.items || []).length === 0 ? (
                    <p className="text-sm text-muted-foreground">El pedido no contiene artículos visibles.</p>
                  ) : (
                    <div className="space-y-2">
                      {order.items.map((item, index) => (
                        <div key={item.productId || index} className="flex justify-between gap-3 text-sm border-b pb-2">
                          <span>{item.productName || 'Producto'} × {Number(item.quantity || 0)}</span>
                          <span className="font-medium">
                            {order.currency || item.currency || 'USD'} {Number(item.lineTotal ?? (Number(item.unitPrice || 0) * Number(item.quantity || 0))).toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                          </span>
                        </div>
                      ))}
                    </div>
                  )}
                </div>

                {(order.trackingNumber || order.trackingCarrier) && (
                  <p className="text-sm">
                    Seguimiento: {order.trackingCarrier || 'Transportista no indicado'} · {order.trackingNumber || 'Número pendiente'}
                  </p>
                )}
                {order.adminNotes && <p className="text-sm text-muted-foreground">Notas: {order.adminNotes}</p>}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="reports" className="mt-4 space-y-3">
          {reports.length === 0 ? <p className="text-muted-foreground text-center py-12">Sin reportes.</p> : reports.map((r) => (
            <Card key={r.id}>
              <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex-1">
                  <div className="font-semibold">{r.reason}</div>
                  <div className="text-xs text-muted-foreground">{r.details}</div>
                  <div className="text-[10px] text-muted-foreground mt-1">
                    {r.productId ? `Producto: ${r.productId}` : `Negocio: ${r.businessId}`} · {new Date(r.createdAt).toLocaleString('es-ES')}
                  </div>
                </div>
                <Badge variant={r.status === 'pending' ? 'default' : 'secondary'}>{r.status}</Badge>
                {r.status === 'pending' && (
                  <div className="flex gap-2">
                    <Button size="sm" onClick={() => onResolveReport(r.id, 'resolved')} className="bg-green-500 text-white"><Check className="h-3 w-3" /></Button>
                    <Button size="sm" variant="outline" onClick={() => onResolveReport(r.id, 'dismissed')}>Descartar</Button>
                  </div>
                )}
              </CardContent>
            </Card>
          ))}
        </TabsContent>

        <TabsContent value="users" className="mt-4 space-y-2">
          <div className="flex items-center justify-between gap-3 rounded-lg border p-3">
            <div>
              <h3 className="font-semibold">Editar negocios</h3>
              <p className="text-sm text-muted-foreground">
                Los controles de edición permanecen ocultos hasta que los necesites.
              </p>
            </div>
            <Button
              type="button"
              size="sm"
              variant={showBusinessEditControls ? "default" : "outline"}
              aria-label={showBusinessEditControls ? "Ocultar edición de negocios" : "Mostrar edición de negocios"}
              aria-expanded={showBusinessEditControls}
              onClick={() => {
                if (showBusinessEditControls) setEditBiz(null);
                setShowBusinessEditControls((visible) => !visible);
              }}
            >
              <Pencil className="mr-2 h-4 w-4" />
              {showBusinessEditControls ? "Ocultar" : "Editar negocios"}
            </Button>
          </div>
          {users.map((u) => (
            <Card key={u.id}>
              <CardContent className="p-4 flex flex-col md:flex-row gap-3 md:items-center">
                <div className="flex-1 min-w-0">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    {u.email}
                    {u.role === 'admin' && <Badge className="bg-amber-500 text-black border-0">admin</Badge>}
                    {u.accountType === 'buyer' && <Badge variant="outline">comprador</Badge>}
                    {u.suspended && <Badge variant="destructive">suspendido</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">
                    {u.business ? `🏪 ${u.business.name}` : '🛍️ Sin negocio'} · Plan: <b>{u.plan}</b> · {u.name || '—'}
                    {u.business && (
                      <div className="mt-1 flex flex-wrap items-center gap-2">
                        {u.business.verified ? (
                          <Badge className="bg-green-600 text-white border-0">Verificado</Badge>
                        ) : (
                          <Badge variant="outline" className="border-amber-500 text-amber-600">Pendiente de verificación</Badge>
                        )}
                        {u.business.verified && u.business.verifiedAt && (
                          <span className="text-[10px] text-muted-foreground">
                            Verificado el {new Date(u.business.verifiedAt).toLocaleString('es-ES')}
                          </span>
                        )}
                      </div>
                    )}

                  </div>
                </div>
                <div className="flex gap-2 flex-wrap">
                  <Select value={u.plan} onValueChange={(v) => onUpdateUser(u.id, { plan: v })}>
                    <SelectTrigger className="w-28"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="free">Free</SelectItem>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  {showBusinessEditControls && u.business && (
                    <Button size="sm" variant="outline" onClick={() => setEditBiz(u.business)}>
                      <Pencil className="h-3 w-3 mr-1" /> Editar negocio
                    </Button>
                  )}
                  <Button size="sm" variant="outline" onClick={() => onUpdateUser(u.id, { suspended: !u.suspended })}>
                    {u.suspended ? 'Reactivar' : 'Suspender'}
                  </Button>
                  {u.business && (
                    <Button size="sm" variant="outline" onClick={() => onDeleteBusiness(u.business.id, u.business.name)} className="text-orange-600 border-orange-500/40">
                      <Trash2 className="h-3 w-3 mr-1" /> Negocio
                    </Button>
                  )}
                  {u.role !== 'admin' && (
                    <Button size="sm" variant="outline" onClick={() => onDeleteUser(u.id, u.email)} className="text-destructive border-destructive/40">
                      <Trash2 className="h-3 w-3 mr-1" /> Usuario
                    </Button>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
          <BusinessEditDialog biz={editBiz} onClose={() => setEditBiz(null)} onSave={(id, patch) => { onUpdateBusiness(id, patch); setEditBiz(null); }} compressLogo={compressLogo} businessTypes={businessTypes} />
        </TabsContent>

        <TabsContent value="products" className="mt-4">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-3">
            {products.map((p) => (
              <Card key={p.id} className="overflow-hidden">
                <div className="aspect-video bg-muted">
                  {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
                </div>
                <CardContent className="p-3">
                  <div className="font-semibold truncate">{p.name}</div>
                  <div className="text-xs text-muted-foreground truncate">{p.business?.name} · {formatPrice(p.price, p.currency)}</div>
                  <Button size="sm" variant="outline" onClick={() => onDeleteProduct(p.id)} className="mt-2 w-full text-destructive border-destructive/40">
                    <Trash2 className="h-3 w-3 mr-1" /> Eliminar
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </TabsContent>

        <TabsContent value="settings" className="mt-4">
          {settings && (
            <Card>
              <CardContent className="p-6 space-y-3 max-w-2xl">
                <div>
                  <Label>Wallet USDC</Label>
                  <Input value={settings.usdcWallet || ''} onChange={(e) => setSettings({ ...settings, usdcWallet: e.target.value })} className="font-mono" />
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Red USDC</Label><Input value={settings.usdcNetwork || ''} onChange={(e) => setSettings({ ...settings, usdcNetwork: e.target.value })} /></div>
                  <div><Label>Tasa de cambio (CUP por 1 USD)</Label><Input type="number" min="0.01" max="10000" step="0.01" value={settings.usdRate ?? 120} onChange={(e) => setSettings({ ...settings, usdRate: e.target.value === '' ? '' : Number(e.target.value) })} placeholder="Ej: 120" /><p className="text-xs text-muted-foreground">Se utiliza para convertir precios en CUP a USDT/USDC.</p></div>
                  <div><Label>Precio Premium (USD)</Label><Input type="number" step="0.01" value={settings.premiumPriceUSD ?? 0} onChange={(e) => setSettings({ ...settings, premiumPriceUSD: Number(e.target.value) })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Precio Premium (CUP)</Label><Input type="number" step="1" value={settings.premiumPriceCUP ?? 0} onChange={(e) => setSettings({ ...settings, premiumPriceCUP: Number(e.target.value) })} placeholder="Ej: 3500" /></div>
                  <div className="flex items-end gap-2">
                    <label className="flex items-center gap-2 text-sm border border-border rounded-md p-2 w-full cursor-pointer hover:bg-muted/50">
                      <input type="checkbox" checked={settings.plansEnabled !== false} onChange={(e) => setSettings({ ...settings, plansEnabled: e.target.checked })} />
                      <Sparkles className="h-4 w-4 text-amber-500" /> Suscripciones activas
                    </label>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Transfermóvil - Nombre</Label><Input value={settings.transfermovilName || ''} onChange={(e) => setSettings({ ...settings, transfermovilName: e.target.value })} /></div>
                  <div><Label>Transfermóvil - Número</Label><Input value={settings.transfermovilNumber || ''} onChange={(e) => setSettings({ ...settings, transfermovilNumber: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Teléfono oficial</Label><Input value={settings.contactPhone || ''} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} /></div>
                  <div><Label>Email oficial</Label><Input value={settings.contactEmail || ''} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} /></div>
                </div>
                <div>
                  <Label>URL Facebook oficial</Label>
                  <Input
                    value={settings.facebookUrl || ''}
                    onChange={(e) => setSettings({ ...settings, facebookUrl: e.target.value })}
                    placeholder="https://www.facebook.com/profile.php?id=61590279593760"
                  />
                  <p className="text-[10px] text-muted-foreground mt-1">Aparece en footer, contacto y comprobantes. Si dejas vacío, se usa el oficial por defecto.</p>
                </div>
                <Button onClick={onSaveSettings} disabled={savingSettings} className="brand-gradient text-white disabled:opacity-60">
                  {savingSettings ? <><Loader2 className="h-4 w-4 mr-2 animate-spin" /> Guardando…</> : 'Guardar cambios'}
                </Button>
              </CardContent>
            </Card>
          )}
        </TabsContent>
      </Tabs>
    </section>
  );
};

// ============ FOOTER ============
const Footer = ({ t, settings, onLegal, setLang, lang }) => (
  <footer className="bg-card border-t border-border mt-16">
    <div className="container mx-auto px-4 py-10">
      <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
        <div className="col-span-2">
          <Logo size="lg" />
          <p className="text-sm text-muted-foreground mt-3 max-w-md">{t.subSlogan}</p>
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">{t.officialContact}</h4>
          {settings && (
            <div className="space-y-2 text-sm text-muted-foreground">
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-2 hover:text-foreground"><Phone className="h-4 w-4" /> {settings.contactPhone}</a>
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-2 hover:text-foreground break-all"><Mail className="h-4 w-4" /> {settings.contactEmail}</a>
              <a
                href={settings.facebookUrl || 'https://www.facebook.com/profile.php?id=61590279593760'}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-2 hover:text-foreground"
                aria-label="Facebook UBIK2 YEMG"
              >
                <Facebook className="h-4 w-4 text-[#1877F2]" /> Facebook UBIK2 YEMG
              </a>
            </div>
          )}
        </div>
        <div>
          <h4 className="font-semibold text-sm mb-3">{t.legalLabel}</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <button onClick={() => onLegal('privacy')} className="block hover:text-foreground">{t.privacyPolicy}</button>
            <button onClick={() => onLegal('terms')} className="block hover:text-foreground">{t.terms}</button>
            <button onClick={() => onLegal('contact')} className="block hover:text-foreground">{t.officialContact}</button>
          </div>
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">{t.languageLabel}</div>
            <div className="flex gap-1">
              {Object.entries(FLAGS).map(([k, f]) => (
                <button key={k} onClick={() => setLang(k)} className={`text-xl p-1 rounded ${lang === k ? 'ring-2 ring-[#1565C0]' : 'opacity-60 hover:opacity-100'}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
        <div>© {new Date().getFullYear()} UBIK2YEMG · {t.rightsReserved}</div>
        <div className="flex gap-4">USDC · Transfermóvil · WhatsApp · Telegram · SMS</div>
      </div>
    </div>
  </footer>
);

// ============ DIALOGS ============
const AuthDialog = ({ open, onOpenChange, mode, setMode, form, setForm, onSubmit, onForgot, compressLogo, businessTypes = [] }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex justify-center mb-2">
          <div className="rounded-2xl bg-black p-3 shadow-md">
            <LogoSVG size={48} />
          </div>
        </div>
        <DialogTitle className="text-center text-2xl">{mode === 'login' ? 'Bienvenido' : 'Crea tu cuenta'}</DialogTitle>
        <DialogDescription className="text-center">
          {mode === 'login' ? 'Accede a tu cuenta.' : 'Elige el tipo de cuenta que necesitas.'}
        </DialogDescription>
      </DialogHeader>
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="register">Registrarme</TabsTrigger>
        </TabsList>
        <form onSubmit={onSubmit} className="space-y-3 mt-4">
          {mode === 'register' && (
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => setForm({ ...form, accountType: 'buyer' })}
                className={`p-3 rounded-xl border-2 text-left transition ${form.accountType === 'buyer' ? 'border-[#1565C0] bg-[#1565C0]/5' : 'border-border hover:border-[#1565C0]/40'}`}
              >
                <div className="text-2xl mb-1">🛍️</div>
                <div className="font-semibold text-sm">Comprador</div>
                <div className="text-[10px] text-muted-foreground">Para buscar y guardar productos</div>
              </button>
              <button
                type="button"
                onClick={() => setForm({ ...form, accountType: 'seller' })}
                className={`p-3 rounded-xl border-2 text-left transition ${form.accountType === 'seller' ? 'border-[#00A86B] bg-[#00A86B]/5' : 'border-border hover:border-[#00A86B]/40'}`}
              >
                <div className="text-2xl mb-1">🏪</div>
                <div className="font-semibold text-sm">Vendedor</div>
                <div className="text-[10px] text-muted-foreground">Para publicar productos</div>
              </button>
            </div>
          )}
          <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label>Contraseña *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          {mode === 'register' && form.accountType === 'buyer' && (
            <div><Label>Tu nombre *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required placeholder="Ej: Juan Pérez" /></div>
          )}
          {mode === 'register' && form.accountType === 'seller' && (
            <>
              <div><Label>Nombre del negocio *</Label><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required placeholder="Ej: Mi tienda" /></div>
              <LogoUploader value={form.logo || ''} onChange={(v) => setForm({ ...form, logo: v })} compressLogo={compressLogo} />
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Tipo de negocio</Label>
                  <Select value={form.businessType || 'tienda'} onValueChange={(v) => setForm({ ...form, businessType: v })}>
                    <SelectTrigger><SelectValue /></SelectTrigger>
                    <SelectContent>
                      {businessTypes.map((bt) => (<SelectItem key={bt.id} value={bt.id}>{bt.icon} {bt.name}</SelectItem>))}
                    </SelectContent>
                  </Select>
                </div>
                <div><Label>País</Label><Input value={form.country || 'Cuba'} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Cuba" /></div>
              </div>
              <div><Label>WhatsApp * (formato internacional)</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required placeholder="+5355555555" /></div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Telegram (@usuario)</Label><Input value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="@usuario" /></div>
                <div><Label>SMS / Llamada</Label><Input value={form.sms} onChange={(e) => setForm({ ...form, sms: e.target.value })} placeholder="+5355555555" /></div>
              </div>
              <div><Label>Ubicación</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="La Habana, Cuba" /></div>
              <div><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
            </>
          )}
          <DialogFooter>
            <Button type="submit" className="w-full brand-gradient text-white hover:opacity-90">
              {mode === 'login' ? 'Entrar' : (form.accountType === 'seller' ? 'Crear cuenta de vendedor' : 'Crear cuenta gratis')}
            </Button>
          </DialogFooter>
          {mode === 'login' && (
            <button type="button" onClick={onForgot} className="text-xs text-[#1565C0] hover:underline w-full text-center">
              ¿Olvidaste tu contraseña?
            </button>
          )}
        </form>
      </Tabs>
    </DialogContent>
  </Dialog>
);

const UpgradeSellerDialog = ({ open, onOpenChange, form, setForm, onSubmit, compressLogo, businessTypes = [] }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl">
          <Store className="h-6 w-6 text-[#00A86B]" /> Conviértete en vendedor
        </DialogTitle>
        <DialogDescription>
          Completa los datos de tu negocio para empezar a publicar productos.
        </DialogDescription>
      </DialogHeader>
      <form onSubmit={(e) => { e.preventDefault(); onSubmit(); }} className="space-y-3">
        <div><Label>Nombre del negocio *</Label><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required placeholder="Ej: Mi tienda" /></div>
        <LogoUploader value={form.logo || ''} onChange={(v) => setForm({ ...form, logo: v })} compressLogo={compressLogo} />
        <div className="grid grid-cols-2 gap-2">
          <div>
            <Label>Tipo de negocio</Label>
            <Select value={form.businessType || 'tienda'} onValueChange={(v) => setForm({ ...form, businessType: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {businessTypes.map((bt) => (<SelectItem key={bt.id} value={bt.id}>{bt.icon} {bt.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <div><Label>País</Label><Input value={form.country || 'Cuba'} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Cuba" /></div>
        </div>
        <div><Label>WhatsApp *</Label><Input value={form.whatsapp} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} required placeholder="+5355555555" /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Telegram</Label><Input value={form.telegram} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="@usuario" /></div>
          <div><Label>SMS</Label><Input value={form.sms} onChange={(e) => setForm({ ...form, sms: e.target.value })} placeholder="+5355555555" /></div>
        </div>
        <div><Label>Ubicación</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="La Habana, Cuba" /></div>
        <div><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>
        <Button type="submit" className="w-full bg-[#00A86B] hover:bg-[#008F5B] text-white">
          <Store className="h-4 w-4 mr-2" /> Activar mi cuenta de vendedor
        </Button>
      </form>
    </DialogContent>
  </Dialog>
);

const ForgotDialog = ({ open, onOpenChange, step, setStep, data, setData, onRequest, onSubmit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Recuperar contraseña</DialogTitle>
        <DialogDescription>
          {step === 1
            ? 'Ingresa tu email y te enviaremos un enlace para restablecer tu contraseña.'
            : 'Revisa tu correo (incluida la carpeta de spam). Haz clic en el enlace recibido o pega el token aquí.'}
        </DialogDescription>
      </DialogHeader>
      {step === 1 ? (
        <div className="space-y-3">
          <div><Label>Email</Label><Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} placeholder="tu@correo.com" /></div>
          <Button onClick={onRequest} className="w-full brand-gradient text-white">Enviar instrucciones</Button>
          <p className="text-xs text-muted-foreground text-center">
            Si el correo está registrado en UBIK2 YEMG, recibirás un mensaje en pocos minutos.
          </p>
        </div>
      ) : (
        <div className="space-y-3">
          <div className="text-xs bg-green-50 border border-green-200 text-green-800 rounded-md p-3">
            📧 Te enviamos un correo con un enlace de recuperación. El enlace caduca en <strong>30 minutos</strong>.
          </div>
          <div>
            <Label>Token (del correo)</Label>
            <Input value={data.token} onChange={(e) => setData({ ...data, token: e.target.value })} className="font-mono text-xs" placeholder="Pega aquí el token del correo" />
            <p className="text-xs text-muted-foreground mt-1">También puedes hacer clic directamente en el botón del correo.</p>
          </div>
          <div>
            <Label>Nueva contraseña</Label>
            <Input type="password" value={data.newPassword} onChange={(e) => setData({ ...data, newPassword: e.target.value })} placeholder="Mínimo 6 caracteres" />
          </div>
          <Button onClick={onSubmit} className="w-full brand-gradient text-white">Actualizar contraseña</Button>
          <button type="button" onClick={() => setStep(1)} className="text-xs text-[#1565C0] hover:underline w-full text-center">
            ¿No recibiste el correo? Reintentar
          </button>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

const ProductDialog = ({ open, onOpenChange, editing, form, setForm, onSubmit, onImageFile, categories, isPremium, business }) => {
  const hidingContacts = form.showPublicContact === false;
  // Effective values (form override > business fallback)
  const eff = (k) => form[k] || business?.[k] || '';
  const missing = hidingContacts ? [
    !eff('province') && 'provincia',
    !eff('municipality') && 'municipio',
    !eff('address') && 'dirección',
    !eff('openingHours') && 'horario apertura',
    !eff('closingHours') && 'horario cierre',
  ].filter(Boolean) : [];
  const handleSubmit = (e) => {
    e.preventDefault();
    if (hidingContacts && missing.length) {
      toast.error(`Si ocultas los contactos debes agregar dirección física y horarios del negocio. Faltan: ${missing.join(', ')}.`);
      return;
    }
    onSubmit(e);
  };
  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editing ? 'Editar producto' : 'Publicar producto'}</DialogTitle>
        <DialogDescription>Completa los datos para mostrar tu producto en el marketplace.</DialogDescription>
      </DialogHeader>
      <form onSubmit={handleSubmit} className="space-y-3">
        <div><Label>Nombre *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="grid grid-cols-3 gap-2">
          <div className="col-span-2">
            <Label>Precio *</Label>
            <Input type="number" step={form.currency === 'CUP' ? '1' : '0.01'} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder={form.currency === 'CUP' ? 'Ej: 2500' : 'Ej: 25.00'} />
          </div>
          <div>
            <Label>Moneda</Label>
            <Select value={form.currency || 'CUP'} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                {ALL_CURRENCIES.map((code) => (
                  <SelectItem key={code} value={code}>
                    {CURRENCY_INFO[code].flag} {code}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
        <div><Label>Categoría *</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v, subcategory: '' })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
        {(() => {
          const cat = categories.find((c) => c.id === form.category);
          const subs = cat?.children || [];
          if (subs.length === 0) return null;
          return (
            <div>
              <Label>Subcategoría</Label>
              <Select value={form.subcategory || '__none__'} onValueChange={(v) => setForm({ ...form, subcategory: v === '__none__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Opcional — afina la búsqueda" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__none__">— Sin subcategoría —</SelectItem>
                  {subs.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          );
        })()}
        <div><Label>Ubicación</Label><Input value={form.location} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="La Habana, Cuba" /></div>
        <div>
          <Label>Imagen del producto</Label>
          <div className="space-y-2">
            <Input type="file" accept="image/*" onChange={(e) => onImageFile(e.target.files?.[0])} className="file:bg-[#1565C0] file:text-white file:rounded-md file:border-0 file:px-3 file:py-1 cursor-pointer" />
            <div className="flex items-center gap-2"><div className="flex-1 h-px bg-border" /><span className="text-[10px] text-muted-foreground uppercase">o URL</span><div className="flex-1 h-px bg-border" /></div>
            <Input value={form.image?.startsWith('data:') ? '' : form.image} onChange={(e) => setForm({ ...form, image: e.target.value })} placeholder="https://..." />
            {form.image && (
              <div className="relative inline-block">
                <img src={form.image} alt="" className="h-24 w-24 object-cover rounded-lg border" />
                <button type="button" onClick={() => setForm({ ...form, image: '' })} className="absolute -top-2 -right-2 h-6 w-6 rounded-full bg-red-500 text-white text-xs flex items-center justify-center">×</button>
              </div>
            )}
          </div>
        </div>
        <div><Label>Descripción</Label><Textarea value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={3} /></div>

        {/* === Privacy toggle (per-product) === */}
        <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
          <label className="flex items-center justify-between gap-2 cursor-pointer">
            <div className="flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-[#1565C0]" />
              <span className="text-sm font-semibold">Mostrar contactos en esta publicación</span>
            </div>
            <input
              type="checkbox"
              checked={form.showPublicContact !== false}
              onChange={(e) => setForm({ ...form, showPublicContact: e.target.checked })}
              className="h-4 w-4"
            />
          </label>
          <p className="text-[11px] text-muted-foreground">
            Si lo desactivas, en <b>esta publicación</b> los clientes verán <b>producto, precio, dirección, horarios</b> pero NO WhatsApp/Teléfono/SMS/Messenger. Útil para atraer clientes físicamente al negocio.
          </p>
          {hidingContacts && (
            <div className="text-[11px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded p-2">
              ⚠️ Si ocultas los contactos debes agregar dirección física y horarios del negocio.
              {missing.length > 0 ? <> Faltan: <b>{missing.join(', ')}</b>.</> : <> Datos OK ✅</>}
            </div>
          )}
        </div>

        {/* === Physical info — required when contacts hidden. Inherit from business if blank === */}
        {hidingContacts && (
          <div className="space-y-2 border-l-2 border-[#1565C0]/40 pl-3">
            <div className="text-xs font-semibold text-muted-foreground uppercase tracking-wider">Datos físicos del negocio {business && <span className="font-normal normal-case">(se reutilizan del negocio si los dejas vacíos)</span>}</div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Provincia *</Label><Input value={form.province ?? business?.province ?? ''} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="La Habana" /></div>
              <div><Label>Municipio *</Label><Input value={form.municipality ?? business?.municipality ?? ''} onChange={(e) => setForm({ ...form, municipality: e.target.value })} placeholder="Plaza" /></div>
            </div>
            <div><Label>Dirección exacta *</Label><Input value={form.address ?? business?.address ?? ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle 23 e/ L y M" /></div>
            <div className="grid grid-cols-2 gap-2">
              <div><Label>Hora apertura *</Label><Input type="time" value={form.openingHours ?? business?.openingHours ?? ''} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} /></div>
              <div><Label>Hora cierre *</Label><Input type="time" value={form.closingHours ?? business?.closingHours ?? ''} onChange={(e) => setForm({ ...form, closingHours: e.target.value })} /></div>
            </div>
          </div>
        )}

        {isPremium && (
          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={form.featured} onChange={(e) => setForm({ ...form, featured: e.target.checked })} />
            <Sparkles className="h-4 w-4 text-amber-500" /> Producto destacado (Premium)
          </label>
        )}
        <DialogFooter>
          <Button type="submit" className="w-full brand-gradient text-white">{editing ? 'Guardar' : 'Publicar'}</Button>
        </DialogFooter>
      </form>
    </DialogContent>
  </Dialog>
  );
};

const PlanDialog = ({ open, onOpenChange, settings, payment, setPayment, onSubmit, onScreenshotFile, currentPlan }) => {
  const priceUSD = settings?.premiumPriceUSD;
  const priceCUP = settings?.premiumPriceCUP;
  const plansEnabled = settings?.plansEnabled !== false;
  const isAlreadyPremium = currentPlan === 'premium';
  return (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl"><Crown className="h-6 w-6 text-amber-500" /> Pásate a Premium</DialogTitle>
        <DialogDescription>
          {isAlreadyPremium ? 'Tu plan actual es Premium ⭐. Puedes renovar o cambiar método de pago.' : 'Desbloquea todas las funciones del marketplace.'}
        </DialogDescription>
      </DialogHeader>
      {!plansEnabled && (
        <div className="rounded-md border border-amber-300 bg-amber-50 dark:bg-amber-950/30 text-amber-800 dark:text-amber-200 text-sm p-3">
          ⚠️ Las suscripciones están temporalmente desactivadas. Vuelve más tarde.
        </div>
      )}
      <div className="grid md:grid-cols-2 gap-3">
        <Card className={!isAlreadyPremium ? 'ring-2 ring-muted' : ''}><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <Badge variant="secondary">Plan Básico</Badge>
            {!isAlreadyPremium && <Badge className="bg-blue-500 text-white text-[10px]">TU PLAN</Badge>}
          </div>
          <h3 className="text-2xl font-bold mt-2">Gratis</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 mt-3">
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Hasta 10 productos</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Marketplace público</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> WhatsApp/Telegram/SMS</li>
          </ul>
        </CardContent></Card>
        <Card className={`border-[#00A86B] bg-[#00A86B]/5 ${isAlreadyPremium ? 'ring-2 ring-[#00A86B]' : ''}`}><CardContent className="p-5">
          <div className="flex items-center justify-between">
            <Badge className="bg-[#00A86B] text-white">Premium</Badge>
            {isAlreadyPremium && <Badge className="bg-amber-500 text-black text-[10px]"><Crown className="h-3 w-3 mr-1 inline" /> TU PLAN</Badge>}
          </div>
          <div className="mt-2 space-y-0.5">
            {priceUSD != null && Number(priceUSD) > 0 ? (
              <h3 className="text-2xl font-bold">${Number(priceUSD).toFixed(2)} <span className="text-sm font-normal text-muted-foreground">USDC / mes</span></h3>
            ) : null}
            {priceCUP != null && Number(priceCUP) > 0 ? (
              <h3 className="text-xl font-bold">{Number(priceCUP).toLocaleString('es-ES')} <span className="text-sm font-normal text-muted-foreground">CUP / mes (Transfermóvil)</span></h3>
            ) : null}
            {(!priceUSD || Number(priceUSD) <= 0) && (!priceCUP || Number(priceCUP) <= 0) && (
              <div className="text-sm text-muted-foreground italic">
                El administrador aún no configuró los precios. Vuelve más tarde.
              </div>
            )}
          </div>
          <ul className="text-sm space-y-1.5 mt-3">
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Productos ilimitados</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Destacar productos</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Sin publicidad</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Prioridad en búsquedas</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Estadísticas avanzadas</li>
          </ul>
        </CardContent></Card>
      </div>
      <div className="space-y-3 mt-4">
        <div className="grid grid-cols-2 gap-2">
          <button
            type="button"
            onClick={() => setPayment({ ...payment, method: 'usdc' })}
            className={`rounded-lg p-3 border text-sm transition ${payment.method === 'usdc' ? 'border-[#1565C0] bg-[#1565C0]/5' : 'border-border'}`}
          >
            💎 USDC {priceUSD ? <span className="font-bold ml-1">${Number(priceUSD).toFixed(2)}</span> : null}
          </button>
          <button
            type="button"
            onClick={() => setPayment({ ...payment, method: 'transfermovil' })}
            className={`rounded-lg p-3 border text-sm transition ${payment.method === 'transfermovil' ? 'border-[#1565C0] bg-[#1565C0]/5' : 'border-border'}`}
          >
            📱 Transfermóvil {priceCUP ? <span className="font-bold ml-1">{Number(priceCUP).toLocaleString('es-ES')} CUP</span> : null}
          </button>
        </div>
        {payment.method === 'usdc' && settings && (
          <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-3 text-xs">
            <div className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Wallet USDC ({settings.usdcNetwork || 'TRC20'})</div>
            <div className="font-mono break-all">{settings.usdcWallet || '— sin configurar —'}</div>
            {priceUSD ? <div className="mt-2">Monto a transferir: <b>${Number(priceUSD).toFixed(2)} USDC</b></div> : null}
          </div>
        )}
        {payment.method === 'transfermovil' && settings && (
          <div className="rounded-lg border bg-amber-50 dark:bg-amber-950/30 p-3 text-xs">
            <div className="font-semibold text-amber-700 dark:text-amber-300 mb-1">Transfermóvil</div>
            <div>Nombre: <b>{settings.transfermovilName || '— sin configurar —'}</b></div>
            <div>Número: <b>{settings.transfermovilNumber || '— sin configurar —'}</b></div>
            {priceCUP ? <div className="mt-2">Monto a transferir: <b>{Number(priceCUP).toLocaleString('es-ES')} CUP</b></div> : null}
          </div>
        )}
        <div><Label className="text-xs">Hash / Referencia del pago</Label><Input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} placeholder="0x... o número de operación" /></div>
        <div>
          <Label className="text-xs">Captura del pago (máx 2MB)</Label>
          <Input type="file" accept="image/*" onChange={(e) => onScreenshotFile(e.target.files?.[0])} />
          {payment.screenshot && <img src={payment.screenshot} alt="" loading="lazy" className="mt-2 max-h-32 rounded-lg border" />}
        </div>
        <Button onClick={onSubmit} disabled={!plansEnabled} className="w-full brand-gradient text-white disabled:opacity-50">
          {plansEnabled ? 'Enviar solicitud de pago' : 'Suscripciones desactivadas'}
        </Button>
      </div>
    </DialogContent>
  </Dialog>
  );
};

const REPORT_REASONS = ['Spam o estafa', 'Producto prohibido', 'Información falsa', 'Contenido ofensivo', 'Precio engañoso', 'Otro'];
const ReportDialog = ({ open, onOpenChange, form, setForm, onSubmit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2"><Flag className="h-5 w-5 text-orange-500" /> Reportar</DialogTitle>
        <DialogDescription>Ayúdanos a mantener UBIK2 YEMG seguro.</DialogDescription>
      </DialogHeader>
      <div className="space-y-3">
        <div>
          <Label>Motivo *</Label>
          <Select value={form.reason} onValueChange={(v) => setForm({ ...form, reason: v })}>
            <SelectTrigger><SelectValue placeholder="Selecciona un motivo" /></SelectTrigger>
            <SelectContent>
              {REPORT_REASONS.map((r) => <SelectItem key={r} value={r}>{r}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <Label>Detalles</Label>
          <Textarea value={form.details} onChange={(e) => setForm({ ...form, details: e.target.value })} placeholder="Describe el problema..." rows={3} maxLength={1000} />
        </div>
        <Button onClick={onSubmit} className="w-full bg-orange-500 hover:bg-orange-600 text-white">Enviar reporte</Button>
      </div>
    </DialogContent>
  </Dialog>
);

const FiltersSheet = ({ open, onOpenChange, t, filters, setFilters, onApply, onClear, categories = [], category, businessTypes = [] }) => {
  const selectedCat = categories.find((c) => c.id === category);
  const subs = selectedCat?.children || [];
  return (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent className="overflow-y-auto">
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> {t.filters}</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 mt-6">
        {/* ===== UBICACIÓN ===== */}
        <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
          <div className="text-xs font-bold uppercase text-muted-foreground">📍 Ubicación</div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">País</Label><Input value={filters.country || ''} onChange={(e) => setFilters({ ...filters, country: e.target.value })} placeholder="Cuba" /></div>
            <div><Label className="text-xs">Provincia</Label><Input value={filters.province || ''} onChange={(e) => setFilters({ ...filters, province: e.target.value })} placeholder="La Habana" /></div>
          </div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label className="text-xs">Municipio</Label><Input value={filters.municipality || ''} onChange={(e) => setFilters({ ...filters, municipality: e.target.value })} placeholder="Plaza" /></div>
            <div><Label className="text-xs">Dirección / Zona</Label><Input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="Vedado..." /></div>
          </div>
        </div>

        {/* ===== NEGOCIO ===== */}
        <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
          <div className="text-xs font-bold uppercase text-muted-foreground">🏪 Negocio</div>
          <div><Label className="text-xs">Nombre del negocio</Label><Input value={filters.businessName || ''} onChange={(e) => setFilters({ ...filters, businessName: e.target.value })} placeholder="Ej: Cafetería La Esquina" /></div>
          <div>
            <Label className="text-xs">Tipo de negocio</Label>
            <Select value={filters.businessType || '__all__'} onValueChange={(v) => setFilters({ ...filters, businessType: v === '__all__' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Cualquiera" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">— Cualquier tipo —</SelectItem>
                {businessTypes.map((bt) => (<SelectItem key={bt.id} value={bt.id}>{bt.icon} {bt.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
          <label className="flex items-center gap-2 text-sm border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50 bg-card">
            <input type="checkbox" checked={!!filters.physicalOnly} onChange={(e) => setFilters({ ...filters, physicalOnly: e.target.checked })} />
            <Store className="h-4 w-4 text-[#1565C0]" /> Solo negocios físicos
          </label>
        </div>

        {/* ===== CATEGORÍA / SUBCATEGORÍA ===== */}
        {subs.length > 0 && (
          <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
            <div className="text-xs font-bold uppercase text-muted-foreground">🗂️ Subcategoría · {selectedCat.icon} {selectedCat.name}</div>
            <Select value={filters.subcategory || '__all__'} onValueChange={(v) => setFilters({ ...filters, subcategory: v === '__all__' ? '' : v })}>
              <SelectTrigger><SelectValue placeholder="Todas las subcategorías" /></SelectTrigger>
              <SelectContent>
                <SelectItem value="__all__">— Todas —</SelectItem>
                {subs.map((s) => (<SelectItem key={s.id} value={s.id}>{s.name}</SelectItem>))}
              </SelectContent>
            </Select>
          </div>
        )}

        {/* ===== PRECIO / MONEDA ===== */}
        <div className="rounded-lg border border-border p-3 space-y-2 bg-muted/30">
          <div className="text-xs font-bold uppercase text-muted-foreground">💰 Precio</div>
          <div className="grid grid-cols-3 gap-2">
            <div className="col-span-2 grid grid-cols-2 gap-2">
              <div><Label className="text-xs">{t.priceMin}</Label><Input type="number" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} placeholder="0" /></div>
              <div><Label className="text-xs">{t.priceMax}</Label><Input type="number" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} placeholder="∞" /></div>
            </div>
            <div>
              <Label className="text-xs">Moneda</Label>
              <Select value={filters.currency || '__all__'} onValueChange={(v) => setFilters({ ...filters, currency: v === '__all__' ? '' : v })}>
                <SelectTrigger><SelectValue placeholder="Todas" /></SelectTrigger>
                <SelectContent>
                  <SelectItem value="__all__">Todas</SelectItem>
                  {ALL_CURRENCIES.map((code) => (<SelectItem key={code} value={code}>{CURRENCY_INFO[code].flag} {code}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
          </div>
          <p className="text-[10px] text-muted-foreground">El rango se aplica en la moneda del producto.</p>
        </div>

        {/* ===== OTROS ===== */}
        <div className="grid grid-cols-2 gap-2">
          <label className="flex items-center gap-2 text-sm border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50">
            <input type="checkbox" checked={!!filters.featuredOnly} onChange={(e) => setFilters({ ...filters, featuredOnly: e.target.checked })} />
            <Star className="h-4 w-4 text-amber-500" /> Solo destacados
          </label>
          <label className="flex items-center gap-2 text-sm border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50">
            <input type="checkbox" checked={filters.availableOnly !== false} onChange={(e) => setFilters({ ...filters, availableOnly: e.target.checked })} />
            <Check className="h-4 w-4 text-green-600" /> Disponibles
          </label>
        </div>
        <div>
          <Label className="text-xs">{t.date}</Label>
          <Select value={filters.since || 'all'} onValueChange={(v) => setFilters({ ...filters, since: v === 'all' ? '' : new Date(Date.now() - Number(v) * 86400000).toISOString() })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="all">{t.anytime}</SelectItem>
              <SelectItem value="7">{t.last7}</SelectItem>
              <SelectItem value="30">{t.last30}</SelectItem>
              <SelectItem value="90">{t.last90}</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="flex gap-2 pt-4">
          <Button variant="outline" onClick={onClear} className="flex-1">{t.clear}</Button>
          <Button onClick={onApply} className="flex-1 brand-gradient text-white">{t.apply}</Button>
        </div>
      </div>
    </SheetContent>
  </Sheet>
  );
};

const ManualPaymentCheckout = ({ order, token, onOrderUpdate, onCancel, onBack }) => {
  const method = order?.paymentMethod;
  const details = order?.paymentDetails || {};
  const [transactionReference, setTransactionReference] = useState(
    order?.buyerTransactionReference || ''
  );
  const [submittingReference, setSubmittingReference] = useState(false);

  const submitTransactionReference = async (event) => {
    event.preventDefault();

    const reference = transactionReference.trim();

    if (!/^[A-Za-z0-9_-]{4,100}$/.test(reference)) {
      return toast.error('Introduce la referencia real de la operación: entre 4 y 100 letras, números, guiones o guiones bajos.');
    }

    if (!token) {
      return toast.error('Inicia sesión para registrar la referencia del pago.');
    }

    if (order?.paymentStatus !== 'pending_payment') {
      return toast.error('Este pedido ya no está pendiente de pago.');
    }

    setSubmittingReference(true);

    try {
      const result = await api(
        `/orders/${encodeURIComponent(order.id)}/submit-payment-reference`,
        {
          method: 'POST',
          body: { transactionReference: reference },
          token,
        }
      );

      const isPaid = ['paid', 'auto_approved'].includes(result.status);

      onOrderUpdate?.({
        ...order,
        buyerTransactionReference: reference,
        ...(isPaid ? { paymentStatus: 'paid', status: 'paid' } : {}),
      });

      if (isPaid) {
        toast.success(result.message || 'El pago figura como confirmado.');
      } else {
        toast.success(result.message || 'Referencia guardada. El pedido sigue pendiente de verificación.');
      }
    } catch (error) {
      toast.error(error?.message || 'No se pudo registrar la referencia.');
    } finally {
      setSubmittingReference(false);
    }
  };

  const formatTotal = (value, currency) => {
    const amount = Number(value);
    return Number.isFinite(amount)
      ? `${amount.toLocaleString('es-ES', { minimumFractionDigits: 2, maximumFractionDigits: 2 })} ${currency || ''}`
      : '—';
  };

  return (
    <section className="container mx-auto max-w-2xl px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="mr-2 h-4 w-4" /> Volver
      </Button>
      <Card className="overflow-hidden shadow-xl">
        <div className="brand-gradient p-6 text-center text-white">
          <h1 className="mb-2 text-2xl font-bold">
            {method === 'transfermovil' ? 'Pago por Transfermóvil' : 'Pago por EnZona'}
          </h1>
          <p>Pedido #{String(order.id || '').slice(0, 8).toUpperCase()}</p>
        </div>
        <CardContent className="space-y-5 p-6">
          <div className="rounded-xl border border-amber-300 bg-amber-50 p-4 text-amber-900">
            <p className="font-semibold">Estado: pendiente de pago y revisión</p>
            <p className="mt-1 text-sm">
              Realiza la transferencia con los datos que aparecen abajo. El pedido no se confirmará automáticamente.
            </p>
          </div>
          <div className="space-y-2 rounded-lg border p-4">
            <p className="text-sm text-muted-foreground">Importe del pedido</p>
            <p className="text-2xl font-bold">{formatTotal(order.total, order.currency)}</p>
            {method === 'transfermovil' ? (
              <>
                <p><strong>Número del destinatario:</strong> {details.recipientNumber || 'No disponible'}</p>
                <p><strong>Titular:</strong> {details.recipientName || 'No disponible'}</p>
              </>
            ) : (
              <p><strong>Destinatario de EnZona:</strong> {details.recipient || 'No disponible'}</p>
            )}
            <p><strong>Referencia del pedido:</strong> {order.publicInvoiceId || order.id}</p>
          </div>
          <form onSubmit={submitTransactionReference} className="space-y-3 rounded-lg border p-4">
            <label htmlFor="transfer-transaction-reference" className="block text-sm font-semibold">
              Referencia real de la transferencia
            </label>
            <input
              id="transfer-transaction-reference"
              type="text"
              value={transactionReference}
              onChange={(event) => setTransactionReference(event.target.value)}
              maxLength={100}
              autoComplete="off"
              spellCheck={false}
              placeholder="Ej.: número de transacción del comprobante"
              disabled={submittingReference || order.paymentStatus !== 'pending_payment'}
              className="w-full rounded-md border bg-background px-3 py-2 text-sm"
              required
            />
            <p className="text-xs text-muted-foreground">
              Introduce el número de transacción que aparece en el comprobante, no el número de pedido.
            </p>
            <Button
              type="submit"
              disabled={
                submittingReference ||
                order.paymentStatus !== 'pending_payment' ||
                !transactionReference.trim()
              }
              className="w-full"
            >
              {submittingReference ? 'Comprobando referencia…' : 'Enviar referencia de pago'}
            </Button>
            {order.paymentStatus === 'paid' && (
              <p className="text-sm font-semibold text-green-700">
                El sistema registra este pedido como pagado.
              </p>
            )}
          </form>
          <p className="text-sm text-muted-foreground">
            Conserva el comprobante. La referencia se comparará con el SMS recibido por el sistema. Si falta información o hay discrepancias, el pedido seguirá pendiente de revisión. Un SMS por sí solo no constituye una prueba bancaria criptográfica.
          </p>
          <div className="flex flex-wrap gap-2">
            <Button onClick={onCancel}>Volver al inicio</Button>
          </div>
        </CardContent>
      </Card>
    </section>
  );
};

const CryptoCheckout = ({ t, order, invoice, config, txHash, setTxHash, onSubmit, onCancel, submitting, onBack }) => {
  if (!order || !invoice) return null;

  const timeLeft = new Date(invoice.expiresAt) - new Date();
  const expired = timeLeft <= 0;
  const minutes = Math.max(0, Math.ceil(timeLeft / 60000));
  const seconds = Math.max(0, Math.floor((timeLeft % 60000) / 1000));

  const formatAmount = (amountRaw, decimals = invoice.decimals) => {
    const raw = String(amountRaw ?? '');
    if (!/^\d+$/.test(raw) || !Number.isInteger(decimals) || decimals < 0) return '—';

    const padded = raw.padStart(decimals + 1, '0');
    const integerPart = decimals > 0 ? padded.slice(0, -decimals) : padded;
    let fractionalPart = decimals > 0
      ? padded.slice(-decimals).replace(/0+$/, '')
      : '';

    if (fractionalPart.length < 2) {
      fractionalPart = fractionalPart.padEnd(2, '0');
    }

    const groupedInteger = integerPart.replace(/\B(?=(\d{3})+(?!\d))/g, '.');
    return `${groupedInteger},${fractionalPart}`;
  };

  const copyToClipboard = (text, label) => {
    navigator.clipboard.writeText(text);
    toast.success(`${label} copiado al portapapeles`);
  };

  return (
    <section className="container mx-auto px-4 py-8 max-w-2xl">
      <Button variant="ghost" onClick={onBack} className="mb-4">
        <ArrowLeft className="h-4 w-4 mr-2" /> Volver
      </Button>

      <Card className="overflow-hidden shadow-xl">
        <div className="brand-gradient p-6 text-white text-center">
          <h1 className="text-2xl font-bold mb-2">Pago con Criptomonedas</h1>
          <p className="opacity-90">Pedido #{order.id.slice(0, 8).toUpperCase()}</p>
        </div>

        <CardContent className="p-6 space-y-6">
          {/* Status indicator */}
          <div className={`p-4 rounded-xl text-center ${expired ? 'bg-red-50 dark:bg-red-950/30 border border-red-200' : invoice.status === 'submitted' ? 'bg-amber-50 dark:bg-amber-950/30 border border-amber-200' : 'bg-blue-50 dark:bg-blue-950/30 border border-blue-200'}`}>
            {expired && (
              <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5" />
                <span className="font-semibold">Factura expirada</span>
              </div>
            )}
            {invoice.status === 'pending' && !expired && (
              <div className="flex items-center justify-center gap-2 text-blue-700 dark:text-blue-300">
                <Clock className="h-5 w-5 animate-pulse" />
                <span className="font-semibold">Pendiente de pago</span>
                <span className="font-mono bg-white/50 dark:bg-black/20 px-2 py-0.5 rounded">
                  {minutes}:{seconds.toString().padStart(2, '0')}
                </span>
              </div>
            )}
            {invoice.status === 'submitted' && (
              <div className="flex items-center justify-center gap-2 text-amber-700 dark:text-amber-300">
                <Loader2 className="h-5 w-5 animate-spin" />
                <span className="font-semibold">TxHash enviado - En verificación</span>
              </div>
            )}
            {invoice.status === 'approved' && (
              <div className="flex items-center justify-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" />
                <span className="font-semibold">Pago confirmado y aprobado</span>
              </div>
            )}
            {invoice.status === 'rejected' && (
              <div className="flex items-center justify-center gap-2 text-red-700 dark:text-red-300">
                <XCircle className="h-5 w-5" />
                <span className="font-semibold">Pago rechazado</span>
                {invoice.rejectReason && <span className="text-sm ml-2">{invoice.rejectReason}</span>}
              </div>
            )}
          </div>

          {/* Payment Details */}
          <div className="space-y-4 border-t border-b border-border py-4">
            <h3 className="font-semibold text-lg flex items-center gap-2">
              <CreditCard className="h-5 w-5" /> Detalles del pago
            </h3>
            <div className="grid grid-cols-2 gap-4 text-sm">
              <div>
                <p className="text-muted-foreground">Moneda</p>
                <p className="font-semibold">{invoice.currency} ({invoice.network})</p>
              </div>
              <div>
                <p className="text-muted-foreground">Red</p>
                <p className="font-semibold">{config?.enabled?.find(n => n.key === invoice.network + '_' + invoice.currency)?.label || invoice.network}</p>
              </div>
              <div>
                <p className="text-muted-foreground">Importe esperado</p>
                <p className="font-semibold text-xl">{formatAmount(invoice.expectedAmountRaw, invoice.decimals)} {invoice.currency}</p>
              </div>
              <div>
                <p className="text-muted-foreground">En unidades mínimas</p>
                <p className="font-mono text-xs break-all">{invoice.expectedAmountRaw}</p>
              </div>
            </div>
          </div>

          {/* Receiver Address */}
          <div className="space-y-3 p-4 bg-muted/30 rounded-xl">
            <h3 className="font-semibold flex items-center gap-2">
              <Wallet className="h-5 w-5" /> Dirección receptora (solo depósito)
            </h3>
            <div className="flex gap-2 flex-wrap">
              <code className="flex-1 min-w-0 bg-background p-3 rounded border border-border text-sm font-mono break-all">{invoice.receiverAddress}</code>
              <Button variant="outline" size="sm" onClick={() => copyToClipboard(invoice.receiverAddress, 'Dirección')}>
                <Copy className="h-4 w-4 mr-1" /> Copiar
              </Button>
            </div>
            <p className="text-xs text-muted-foreground">
              Envía exactamente <b>{formatAmount(invoice.expectedAmountRaw, invoice.decimals)} {invoice.currency}</b> a esta dirección en la red <b>{invoice.network}</b>.
              <br />Contrato: <code className="text-xs font-mono break-all">{invoice.tokenContract}</code>
            </p>
          </div>

          {/* Order Summary */}
          <div className="space-y-2">
            <h3 className="font-semibold flex items-center gap-2">
              <ShoppingBag className="h-5 w-5" /> Resumen del pedido
            </h3>
            <div className="rounded-lg border border-border p-4">
              {order.items.map((item, i) => (
                <div key={i} className="flex justify-between text-sm py-1 border-b last:border-0">
                  <span>{item.productName} x{item.quantity}</span>
                  <span className="font-medium">{Number(item.lineTotal).toLocaleString('es-ES')} {item.currency}</span>
                </div>
              ))}
              <div className="flex justify-between font-semibold text-lg pt-2 border-t">
                <span>Total</span>
                <span>{Number(order.total).toLocaleString('es-ES')} {order.currency}</span>
              </div>
            </div>
          </div>

          {/* Submit TxHash */}
          {invoice.status === 'pending' && !expired && (
            <div className="space-y-3 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 rounded-xl">
              <h3 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-300">
                <Send className="h-5 w-5" /> Enviar hash de transacción
              </h3>
              <p className="text-sm text-green-600 dark:text-green-400">
                Después de enviar el pago desde tu wallet, copia el hash (TXID) del explorer y pégalo aquí.
              </p>
              <div className="flex gap-2">
                <Input
                  value={txHash}
                  onChange={(e) => setTxHash(e.target.value)}
                  placeholder="0x... o hash de Tron (64 hex)"
                  className="flex-1 font-mono text-sm"
                  disabled={submitting}
                />
                <Button onClick={onSubmit} disabled={submitting || !txHash.trim()} className="whitespace-nowrap">
                  {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4 mr-1" />} Enviar
                </Button>
              </div>
              <p className="text-xs text-muted-foreground">
                El administrador verificará la transacción en el blockchain. No se marca pagado solo por enviar el hash.
              </p>
            </div>
          )}

          {invoice.status === 'submitted' && (
            <div className="space-y-2 p-4 bg-amber-50 dark:bg-amber-950/30 border border-amber-200 rounded-xl">
              <h3 className="font-semibold flex items-center gap-2 text-amber-700 dark:text-amber-300">
                <Clock className="h-5 w-5" /> En verificación
              </h3>
              <p className="text-sm">Tu hash <code className="font-mono break-all">{invoice.txHash}</code> ha sido enviado.</p>
              <p className="text-sm text-amber-600 dark:text-amber-400">
                Un administrador lo verificará manualmente en el explorer ({({TRC20: 'Tronscan', ERC20: 'Etherscan', POLYGON: 'Polygonscan', BASE: 'Basescan', ARBITRUM: 'Arbiscan', BEP20: 'BscScan'}[invoice.network] || 'explorer')}).
                Recibirás notificación cuando se apruebe o rechace.
              </p>
            </div>
          )}

          {invoice.status === 'approved' && (
            <div className="space-y-2 p-4 bg-green-50 dark:bg-green-950/30 border border-green-200 rounded-xl">
              <h3 className="font-semibold flex items-center gap-2 text-green-700 dark:text-green-300">
                <CheckCircle className="h-5 w-5" /> ¡Pago confirmado!
              </h3>
              <p className="text-sm">Tu pedido ha sido marcado como <b>pagado</b>. El vendedor preparará tu pedido.</p>
              <p className="text-xs text-muted-foreground">Hash confirmado: <code className="font-mono break-all">{invoice.txHash}</code></p>
            </div>
          )}

          {invoice.status === 'rejected' && (
            <div className="space-y-2 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl">
              <h3 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-300">
                <XCircle className="h-5 w-5" /> Pago rechazado
              </h3>
              <p className="text-sm">Motivo: {invoice.rejectReason || 'No especificado'}</p>
              <p className="text-sm">El stock ha sido restaurado. Puedes crear un nuevo pedido.</p>
              <Button variant="outline" onClick={onCancel}>Volver al inicio</Button>
            </div>
          )}

          {expired && invoice.status === 'pending' && (
            <div className="space-y-2 p-4 bg-red-50 dark:bg-red-950/30 border border-red-200 rounded-xl">
              <h3 className="font-semibold flex items-center gap-2 text-red-700 dark:text-red-300">
                <AlertCircle className="h-5 w-5" /> Factura expirada
              </h3>
              <p className="text-sm">El tiempo para pagar ha terminado. El stock ha sido restaurado.</p>
              <Button variant="outline" onClick={onCancel}>Volver al inicio</Button>
            </div>
          )}
        </CardContent>
      </Card>
    </section>
  );
};

const LegalDialog = ({ open, onOpenChange, kind, settings }) => {
  const titles = {
    privacy: 'Política de Privacidad',
    terms: 'Términos y Condiciones',
    contact: 'Contacto Oficial',
  };
  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>{titles[kind] || ''}</DialogTitle>
        </DialogHeader>
        <div className="space-y-4 text-sm text-muted-foreground leading-relaxed">
          {kind === 'privacy' && (
            <>
              <p><b>UBIK2 YEMG</b> respeta tu privacidad. Esta política describe cómo recopilamos y usamos tu información.</p>
              <p><b>Información que recopilamos:</b> email, nombre de negocio, número de contacto (WhatsApp/Telegram/SMS), ubicación, productos publicados.</p>
              <p><b>Uso:</b> para mostrarte como vendedor a compradores potenciales y facilitar la conexión directa entre las partes.</p>
              <p><b>No compartimos</b> tu información con terceros sin tu consentimiento.</p>
              <p><b>Cookies:</b> usamos almacenamiento local para guardar tu sesión, idioma y favoritos.</p>
              <p><b>Contacto:</b> {settings?.contactEmail}</p>
            </>
          )}
          {kind === 'terms' && (
            <>
              <p>Al usar <b>UBIK2 YEMG</b> aceptas estos términos.</p>
              <p><b>1. Marketplace:</b> UBIK2 YEMG es una plataforma que conecta compradores y vendedores. No participamos en las transacciones.</p>
              <p><b>2. Contenido prohibido:</b> está prohibido publicar productos ilegales, armas, drogas, contenido para adultos, productos falsificados o información engañosa.</p>
              <p><b>3. Responsabilidad:</b> el vendedor es responsable de la calidad, descripción y entrega del producto. El comprador es responsable del pago acordado.</p>
              <p><b>4. Suscripciones:</b> el plan Premium es de pago mensual. Los pagos manuales son revisados por administradores.</p>
              <p><b>5. Reportes:</b> los usuarios pueden reportar publicaciones inapropiadas. Nos reservamos el derecho de eliminar contenido y suspender cuentas.</p>
              <p><b>6. Modificaciones:</b> nos reservamos el derecho de modificar estos términos.</p>
            </>
          )}
          {kind === 'contact' && settings && (
            <>
              <p>Para soporte, reclamaciones, negociaciones o reportes:</p>
              <a href={`tel:${settings.contactPhone}`} className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/70 transition">
                <Phone className="h-5 w-5 text-[#1565C0]" />
                <div><div className="font-semibold text-foreground">Teléfono</div><div>{settings.contactPhone}</div></div>
              </a>
              <a href={`mailto:${settings.contactEmail}`} className="flex items-center gap-3 p-4 rounded-xl bg-muted hover:bg-muted/70 transition">
                <Mail className="h-5 w-5 text-[#1565C0]" />
                <div><div className="font-semibold text-foreground">Email</div><div className="break-all">{settings.contactEmail}</div></div>
              </a>
            </>
          )}
        </div>
      </DialogContent>
    </Dialog>
  );
};

const BusinessEditDialog = ({ biz, onClose, onSave, compressLogo, businessTypes = [] }) => {
  const [form, setForm] = useState(null);
  useEffect(() => {
    if (biz) {
      // Pre-load existing values, defaulting new fields safely so admin can edit without losing data
      setForm({
        showContactsPublicly: true, // default visible
        province: '', municipality: '', address: '', openingHours: '', closingHours: '', messenger: '',
        commissionRateBps: 300,
        ...biz,
      });
    }
  }, [biz]);
  if (!biz || !form) return null;
  const hidingContacts = form.showContactsPublicly === false;
  const missing = hidingContacts ? [
    !form.province && 'provincia',
    !form.municipality && 'municipio',
    !form.address && 'dirección',
    !form.openingHours && 'horario apertura',
    !form.closingHours && 'horario cierre',
  ].filter(Boolean) : [];
  const handleSave = () => {
    if (!Number.isInteger(Number(form.commissionRateBps)) || Number(form.commissionRateBps) < 0 || Number(form.commissionRateBps) > 3000) {
      toast.error('La comisión debe estar entre 0 % y 30 %.');
      return;
    }
    if (hidingContacts && missing.length) {
      toast.error(`Si ocultas los contactos debes agregar dirección física y horarios. Faltan: ${missing.join(', ')}.`);
      return;
    }
    onSave(biz.id, form);
  };
  return (
    <Dialog open={!!biz} onOpenChange={(v) => !v && onClose()}>
      <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Store className="h-5 w-5" /> Editar negocio
          </DialogTitle>
        </DialogHeader>
        <div className="space-y-3">
          <LogoUploader value={form.logo || ''} onChange={(v) => setForm({ ...form, logo: v })} compressLogo={compressLogo} />
          <div><Label>Nombre *</Label><Input value={form.name || ''} onChange={(e) => setForm({ ...form, name: e.target.value })} /></div>
          <div className="grid grid-cols-2 gap-2">
            <div>
              <Label>Tipo de negocio</Label>
              <Select value={form.businessType || 'tienda'} onValueChange={(v) => setForm({ ...form, businessType: v })}>
                <SelectTrigger><SelectValue /></SelectTrigger>
                <SelectContent>
                  {businessTypes.map((bt) => (<SelectItem key={bt.id} value={bt.id}>{bt.icon} {bt.name}</SelectItem>))}
                </SelectContent>
              </Select>
            </div>
            <div><Label>País</Label><Input value={form.country || ''} onChange={(e) => setForm({ ...form, country: e.target.value })} placeholder="Cuba" /></div>
          </div>
          <div><Label>Descripción</Label><Textarea value={form.description || ''} onChange={(e) => setForm({ ...form, description: e.target.value })} rows={2} /></div>

          {/* === Privacy toggle === */}
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <label className="flex items-center justify-between gap-2 cursor-pointer">
              <div className="flex items-center gap-2">
                <ShieldCheck className="h-4 w-4 text-[#1565C0]" />
                <span className="text-sm font-semibold">Mostrar contactos públicamente</span>
              </div>
              <input
                type="checkbox"
                checked={form.showContactsPublicly !== false}
                onChange={(e) => setForm({ ...form, showContactsPublicly: e.target.checked })}
                className="h-4 w-4"
              />
            </label>
            <p className="text-[11px] text-muted-foreground">
              Si lo desactivas, los compradores verán: <b>productos, dirección, horarios y descripción</b>, pero <b>NO</b> verán tus contactos digitales. Útil para negocios físicos.
            </p>
            {hidingContacts && (
              <div className="text-[11px] bg-amber-50 dark:bg-amber-950/30 border border-amber-200 dark:border-amber-900 text-amber-800 dark:text-amber-200 rounded p-2">
                ⚠️ Si ocultas los contactos debes agregar dirección física y horarios. {missing.length > 0 && <>Faltan: <b>{missing.join(', ')}</b>.</>}
              </div>
            )}
          </div>

          {/* === Contact channels (hidden if showContactsPublicly === false) === */}
          {!hidingContacts && (
            <>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>WhatsApp</Label><Input value={form.whatsapp || ''} onChange={(e) => setForm({ ...form, whatsapp: e.target.value })} placeholder="+5355..." /></div>
                <div><Label>Telegram</Label><Input value={form.telegram || ''} onChange={(e) => setForm({ ...form, telegram: e.target.value })} placeholder="@usuario" /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>SMS</Label><Input value={form.sms || ''} onChange={(e) => setForm({ ...form, sms: e.target.value })} placeholder="+5355..." /></div>
                <div><Label>Messenger (URL)</Label><Input value={form.messenger || ''} onChange={(e) => setForm({ ...form, messenger: e.target.value })} placeholder="m.me/..." /></div>
              </div>
              <div className="grid grid-cols-2 gap-2">
                <div><Label>Instagram</Label><Input value={form.instagram || ''} onChange={(e) => setForm({ ...form, instagram: e.target.value })} /></div>
                <div><Label>Facebook</Label><Input value={form.facebook || ''} onChange={(e) => setForm({ ...form, facebook: e.target.value })} /></div>
              </div>
            </>
          )}

          {/* === Physical location (mandatory when hiding contacts) === */}
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Provincia {hidingContacts && '*'}</Label><Input value={form.province || ''} onChange={(e) => setForm({ ...form, province: e.target.value })} placeholder="La Habana" /></div>
            <div><Label>Municipio {hidingContacts && '*'}</Label><Input value={form.municipality || ''} onChange={(e) => setForm({ ...form, municipality: e.target.value })} placeholder="Plaza" /></div>
          </div>
          <div><Label>Dirección exacta {hidingContacts && '*'}</Label><Input value={form.address || ''} onChange={(e) => setForm({ ...form, address: e.target.value })} placeholder="Calle 23 e/ L y M" /></div>
          <div className="grid grid-cols-2 gap-2">
            <div><Label>Hora apertura {hidingContacts && '*'}</Label><Input type="time" value={form.openingHours || ''} onChange={(e) => setForm({ ...form, openingHours: e.target.value })} /></div>
            <div><Label>Hora cierre {hidingContacts && '*'}</Label><Input type="time" value={form.closingHours || ''} onChange={(e) => setForm({ ...form, closingHours: e.target.value })} /></div>
          </div>
          <div><Label>Ubicación / Ciudad (visible)</Label><Input value={form.location || ''} onChange={(e) => setForm({ ...form, location: e.target.value })} placeholder="La Habana, Cuba" /></div>

          <div className="rounded-md border border-border p-3 space-y-3">
            <h3 className="font-semibold">Pago por Transfermóvil</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.transfermovilEnabled === true}
                onChange={(e) => setForm({ ...form, transfermovilEnabled: e.target.checked })}
              />
              Habilitar Transfermóvil
            </label>
            <div>
              <Label>Número o tarjeta receptora</Label>
              <Input
                value={form.transfermovilNumber || ''}
                maxLength={40}
                onChange={(e) => setForm({ ...form, transfermovilNumber: e.target.value })}
                placeholder="Número de la tarjeta o teléfono"
              />
            </div>
            <div>
              <Label>Nombre del titular</Label>
              <Input
                value={form.transfermovilName || ''}
                maxLength={100}
                onChange={(e) => setForm({ ...form, transfermovilName: e.target.value })}
                placeholder="Nombre del titular"
              />
            </div>
            <div>
              <Label>Cuenta receptora para verificar SMS</Label>
              <Input
                value={form.transfermovilAccount || ''}
                maxLength={60}
                onChange={(e) => setForm({ ...form, transfermovilAccount: e.target.value })}
                placeholder="Cuenta que aparece en el SMS bancario"
              />
              <p className="text-xs text-muted-foreground">
                Debe coincidir con la cuenta receptora indicada en el SMS de Transfermóvil.
              </p>
            </div>
          </div>

          <div className="rounded-md border border-border p-3 space-y-3">
            <h3 className="font-semibold">Pago por EnZona</h3>
            <label className="flex items-center gap-2 text-sm">
              <input
                type="checkbox"
                checked={form.enzonaEnabled === true}
                onChange={(e) => setForm({ ...form, enzonaEnabled: e.target.checked })}
              />
              Habilitar EnZona
            </label>
            <div>
              <Label>Destinatario EnZona</Label>
              <Input
                value={form.enzonaRecipient || ''}
                maxLength={150}
                onChange={(e) => setForm({ ...form, enzonaRecipient: e.target.value })}
                placeholder="Teléfono, cuenta o identificador receptor"
              />
            </div>
          </div>

          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <Label>Comisión por venta (%)</Label>
            <Input
              type="number"
              min="0"
              max="30"
              step="0.01"
              value={(Number(form.commissionRateBps ?? 300) / 100).toFixed(2)}
              onChange={(e) => setForm({ ...form, commissionRateBps: e.target.value === '' ? '' : Math.round(Number(e.target.value) * 100) })}
            />
            <p className="text-[11px] text-muted-foreground">
              Predeterminada: 3 %. Admite del 0 % al 30 %. El cambio solo afecta a nuevas facturas.
            </p>
          </div>
          <div className="rounded-md border border-border bg-muted/30 p-3 space-y-2">
            <label className="flex items-center justify-between gap-3 cursor-pointer">
              <span className="text-sm font-semibold">Permitir entregas</span>
              <input
                type="checkbox"
                checked={form.deliveryEnabled === true}
                onChange={(e) => setForm({ ...form, deliveryEnabled: e.target.checked })}
                className="h-4 w-4"
              />
            </label>
            <p className="text-[11px] text-muted-foreground">
              Activa las entregas para este negocio. El vendedor necesita un plan Premium.
            </p>
          </div>

          <label className="flex items-center gap-2 text-sm">
            <input type="checkbox" checked={!!form.verified} onChange={(e) => setForm({ ...form, verified: e.target.checked })} />
            <ShieldCheck className="h-4 w-4 text-[#1565C0]" /> Marcar como verificado
          </label>
          <Button onClick={handleSave} className="w-full brand-gradient text-white">Guardar cambios</Button>
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default App;
