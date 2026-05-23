'use client';

import React, { useEffect, useState, useCallback, useMemo } from 'react';
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
} from 'lucide-react';
import { toast } from 'sonner';

const API = '/api';
const LOGO = '/logo.png';

// ========= i18n =========
const TRANSLATIONS = {
  es: {
    slogan: 'Todo en un solo lugar.',
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
  },
  en: {
    slogan: 'All in one place.',
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
  },
  it: {
    slogan: 'Tutto in un solo posto.',
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
  },
  ru: {
    slogan: 'Всё в одном месте.',
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
  },
};
const FLAGS = { es: '🇪🇸', en: '🇬🇧', it: '🇮🇹', ru: '🇷🇺' };
const LANG_NAMES = { es: 'Español', en: 'English', it: 'Italiano', ru: 'Русский' };

const formatPrice = (n, currency = 'CUP') => {
  const num = Number(n || 0);
  if (currency === 'USDC') {
    return `${new Intl.NumberFormat('en-US', { minimumFractionDigits: 2, maximumFractionDigits: 2 }).format(num)} USDC`;
  }
  return `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(num)} CUP`;
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
  const sms = cleanPhone(b.sms || b.whatsapp);

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
  const smsLink = sms ? `sms:${sms}?body=${encoded}` : '';

  return {
    msg, encoded,
    wa, tg: tgUser, sms,
    waLink, tgLink, smsLink,
    anyAvailable: !!(waLink || tgLink || smsLink),
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
        if (!r.ok) throw new Error(data.error || `Error ${r.status}`);
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
  const [stats, setStats] = useState({ productsCount: 0, businessesCount: 0, usersCount: 0 });
  const [settings, setSettings] = useState(null);

  const [query, setQuery] = useState('');
  const [searchInput, setSearchInput] = useState('');
  const [category, setCategory] = useState('');
  const [filters, setFilters] = useState({ location: '', businessName: '', province: '', municipality: '', physicalOnly: false, priceMin: '', priceMax: '', since: '', featuredOnly: false, availableOnly: true });
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

  const PAGE_SIZE = 12;

  const [lang, setLang] = useState('es');
  const [dark, setDark] = useState(false);
  const [favorites, setFavorites] = useState([]);

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
    name: '', price: '', description: '', category: 'electronica', stock: 1, image: '',
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

  // Admin
  const [adminData, setAdminData] = useState({ payments: [], users: [], products: [], stats: null, reports: [] });
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
    api('/categories').then((d) => setCategories(d.categories || [])).catch(() => {});
    api('/settings').then((d) => setSettings(d)).catch(() => {});
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
    if (filters.province) params.set('province', filters.province);
    if (filters.municipality) params.set('municipality', filters.municipality);
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
    ])
      .then(([all, feat]) => {
        setProducts(all.products || []);
        setHasMore(!!all.hasMore);
        setFeatured(feat.products || []);
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
      name: p.name, price: p.price, description: p.description || '', category: p.category,
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
      const [pays, usrs, prods, st, settingsRes, reps] = await Promise.all([
        api('/admin/payments', { token }),
        api('/admin/users', { token }),
        api('/admin/products?lite=true', { token }).catch(() => api('/admin/products', { token })),
        api('/admin/stats', { token }),
        api('/admin/settings', { token }),
        api('/admin/reports', { token }).catch(() => ({ reports: [] })),
      ]);
      setAdminData({
        payments: pays.payments || [], users: usrs.users || [],
        products: prods.products || [], stats: st, reports: reps.reports || [],
      });
      setAdminSettings(settingsRes.settings);
      // Keep global stats in sync with admin stats so home shows latest counters too
      if (st) setStats({
        productsCount: st.products ?? st.productsCount,
        businessesCount: st.businesses ?? st.businessesCount,
        usersCount: st.users ?? st.usersCount,
      });
    } catch (err) { toast.error(err.message); }
    finally { adminLoadingRef.current = false; setAdminLoading(false); }
  }, [token, user]);
  useEffect(() => { if (view === 'admin') loadAdmin(); }, [view, loadAdmin]);

  const approvePayment = async (id) => { try { await api(`/admin/payments/${id}/approve`, { method: 'POST', token }); toast.success('Aprobado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
  const rejectPayment = async (id) => { const r = prompt('Motivo') || ''; try { await api(`/admin/payments/${id}/reject`, { method: 'POST', token, body: { reason: r } }); toast.success('Rechazado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
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
    setQuery(searchInput.trim());
    if (view !== 'home') setView('home');
  };

  const resetFilters = () => {
    setCategory('');
    setFilters({ location: '', businessName: '', province: '', municipality: '', physicalOnly: false, priceMin: '', priceMax: '', since: '', featuredOnly: false, availableOnly: true });
    setQuery('');
    setSearchInput('');
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ====== HEADER ====== */}
      <Header
        t={t} lang={lang} setLang={setLang} dark={dark} setDark={setDark}
        user={user} business={business} onLogout={logout}
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
            filters={filters} setFilters={setFilters}
            onProduct={openProduct} onBusiness={openBusiness}
            favorites={favorites} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
            onCTA={() => { if (!user) { setAuthMode('register'); setAuthOpen(true); } else { setView('dashboard'); } }}
            onOpenFilters={() => setFiltersOpen(true)}
            resetFilters={resetFilters}
            query={query} setQuery={setQuery} searchInput={searchInput} setSearchInput={setSearchInput}
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
          />
        )}

        {view === 'product' && (
          <ProductDetail
            t={t} product={detail} onBack={() => setView('home')}
            onBusiness={openBusiness} favorites={favorites} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
            token={token} isLogged={!!user}
            onLoginNeeded={() => { setAuthMode('login'); setAuthOpen(true); }}
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

        {view === 'favorites' && (
          <FavoritesView
            t={t} favorites={favorites} onProduct={openProduct} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
          />
        )}

        {view === 'dashboard' && user && business && (
          <Dashboard
            user={user} business={business} products={myProducts}
            onNew={openProductCreate} onEdit={openProductEdit} onDelete={deleteProduct}
            onPlan={() => setPlanOpen(true)}
            onShareBusiness={() => shareBusiness(business)}
            compressLogo={compressLogo} onLogoChange={updateMyLogo}
          />
        )}
        {view === 'dashboard' && user && !business && (
          <BuyerDashboard user={user} onBecomeSeller={() => setUpgradeOpen(true)} onFavorites={() => setView('favorites')} favoritesCount={favorites.length} />
        )}
        {view === 'dashboard' && !user && (
          <div className="container mx-auto py-32 text-center">
            <p className="text-muted-foreground mb-4">Necesitas iniciar sesión</p>
            <Button onClick={() => { setAuthMode('login'); setAuthOpen(true); }}>Entrar</Button>
          </div>
        )}

        {view === 'admin' && user?.role === 'admin' && (
          <AdminDashboard
            data={adminData} settings={adminSettings} setSettings={setAdminSettings}
            onApprove={approvePayment} onReject={rejectPayment}
            onUpdateUser={adminUpdateUser} onDeleteUser={adminDeleteUser}
            onUpdateBusiness={adminUpdateBusiness} onDeleteBusiness={adminDeleteBusiness}
            onDeleteProduct={adminDeleteProduct}
            onResolveReport={adminResolveReport}
            onSaveSettings={saveAdminSettings}
            savingSettings={savingSettings}
            tab={adminTab} setTab={setAdminTab} onRefresh={loadAdmin}
            compressLogo={compressLogo}
          />
        )}
      </main>

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
      />
      <UpgradeSellerDialog
        open={upgradeOpen} onOpenChange={setUpgradeOpen}
        form={upgradeForm} setForm={setUpgradeForm} onSubmit={() => upgradeSeller(upgradeForm)}
        compressLogo={compressLogo}
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
        onClear={() => { setFilters({ location: '', businessName: '', province: '', municipality: '', physicalOnly: false, priceMin: '', priceMax: '', since: '', featuredOnly: false, availableOnly: true }); setFiltersOpen(false); }}
      />
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
    if (!file.type.startsWith('image/')) { toast.error('Solo se permiten imágenes'); return; }
    if (file.size > 5 * 1024 * 1024) { toast.error('El logo debe pesar menos de 5MB'); return; }
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
  <svg
    width={size}
    height={size}
    viewBox="0 0 100 100"
    xmlns="http://www.w3.org/2000/svg"
    className="flex-shrink-0"
    aria-label="UBIK2 YEMG"
  >
    <defs>
      <linearGradient id="ubikGrad" x1="0%" y1="0%" x2="100%" y2="100%">
        <stop offset="0%" stopColor="#1565C0" />
        <stop offset="100%" stopColor="#00A86B" />
      </linearGradient>
    </defs>
    {/* Pin/location marker outline */}
    <path
      d="M50 8 C32 8 18 22 18 40 C18 58 50 92 50 92 C50 92 82 58 82 40 C82 22 68 8 50 8 Z"
      fill="none"
      stroke="url(#ubikGrad)"
      strokeWidth="4.5"
      strokeLinejoin="round"
    />
    {/* Shopping cart body */}
    <path
      d="M30 38 L66 38 L62 58 L36 58 Z"
      fill="none"
      stroke="url(#ubikGrad)"
      strokeWidth="3.5"
      strokeLinejoin="round"
    />
    {/* Cart handle */}
    <path
      d="M26 32 L31 32 L36 58"
      fill="none"
      stroke="url(#ubikGrad)"
      strokeWidth="3.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
    {/* Cart wheels */}
    <circle cx="40" cy="66" r="3" fill="url(#ubikGrad)" />
    <circle cx="58" cy="66" r="3" fill="url(#ubikGrad)" />
    {/* Check mark inside cart */}
    <path
      d="M40 47 L46 53 L57 42"
      fill="none"
      stroke="url(#ubikGrad)"
      strokeWidth="4"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const Logo = ({ size = 'md', withText = true, onDark = false }) => {
  const px = size === 'lg' ? 56 : size === 'sm' ? 32 : 44;
  return (
    <div className="flex items-center gap-2.5">
      <div className={`relative flex-shrink-0 rounded-xl bg-black flex items-center justify-center ${size === 'lg' ? 'h-16 w-16' : size === 'sm' ? 'h-10 w-10' : 'h-12 w-12'} shadow-md`}>
        <LogoSVG size={px - 8} />
      </div>
      {withText && (
        <div className="flex flex-col leading-none">
          <span className={`${size === 'lg' ? 'text-3xl' : 'text-xl'} font-extrabold tracking-tight ${onDark ? 'text-white' : 'brand-text-gradient'}`}>UBIK2 YEMG</span>
          <span className={`text-[10px] tracking-wider uppercase hidden sm:block ${onDark ? 'text-white/80' : 'text-muted-foreground'}`}>Todo en un solo lugar</span>
        </div>
      )}
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
                  {s.currency === 'USDC' ? '💎' : '🇨🇺'} {Number(s.price).toLocaleString()}
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

const Header = ({ t, lang, setLang, dark, setDark, user, business, onLogout, onLogin, onRegister, onPublish, onUpgradeSeller, searchInput, setSearchInput, onSearch, setView, favorites, dataSaver, setDataSaver, suggestions, suggestOpen, setSuggestOpen, suggestLoading, onSuggestionClick }) => {
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
            <DropdownMenuLabel>Idioma</DropdownMenuLabel>
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
const Home = ({ t, stats, categories, category, setCategory, featured, products, loading, filters, setFilters, onProduct, onBusiness, favorites, toggleFav, onShare, onReport, onCTA, onOpenFilters, resetFilters, query, setQuery, searchInput, setSearchInput, onPublish, onRegister, isLogged, dataSaver, hasMore, loadingMore, onLoadMore, suggestions, suggestOpen, setSuggestOpen, suggestLoading, onSuggestionClick }) => {
  const hasFiltersOrQuery = query || category || filters.location || filters.priceMin || filters.priceMax || filters.since;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative container mx-auto px-4 py-12 md:py-20 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <div className="mx-auto mb-5 inline-flex items-center justify-center rounded-3xl bg-black/90 backdrop-blur-sm p-5 shadow-2xl ring-2 ring-white/20">
              <LogoSVG size={96} />
              <div className="ml-3 text-left">
                <div className="text-3xl md:text-4xl font-extrabold tracking-tight brand-text-gradient leading-none">UBIK2 YEMG</div>
                <div className="text-[10px] md:text-xs text-white/70 tracking-widest uppercase mt-1">Todo en un solo lugar</div>
              </div>
            </div>
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight drop-shadow-lg">
              {t.slogan}
            </h1>
            <p className="text-white/90 mt-3 text-base md:text-lg">{t.subSlogan}</p>

            {/* CTA buttons prominent for beginners */}
            <div className="mt-6 flex flex-col sm:flex-row gap-3 justify-center max-w-xl mx-auto">
              <Button
                size="lg"
                onClick={onPublish}
                className="h-14 bg-[#00A86B] hover:bg-[#008F5B] text-white font-bold text-base shadow-2xl hover:scale-[1.02] transition-transform flex-1"
              >
                <Plus className="h-5 w-5 mr-2" /> Publicar gratis
              </Button>
              {!isLogged && (
                <Button
                  size="lg"
                  variant="outline"
                  onClick={onRegister}
                  className="h-14 bg-white/10 backdrop-blur-md border-white/40 text-white hover:bg-white/20 font-bold text-base flex-1"
                >
                  <Store className="h-5 w-5 mr-2" /> Crear cuenta
                </Button>
              )}
            </div>

            {/* How it works - 3 steps */}
            <div className="mt-7 grid grid-cols-3 gap-2 max-w-xl mx-auto text-white/95">
              {[
                { n: '1', t: 'Crea tu cuenta', s: 'Gratis en 1 minuto' },
                { n: '2', t: 'Publica tu producto', s: 'Foto, precio, listo' },
                { n: '3', t: 'Recibe contactos', s: 'WhatsApp directo' },
              ].map((step, i) => (
                <div key={i} className="rounded-xl bg-white/10 backdrop-blur-md border border-white/20 p-3 text-center">
                  <div className="mx-auto h-7 w-7 rounded-full bg-white text-[#1565C0] font-extrabold flex items-center justify-center text-sm">{step.n}</div>
                  <div className="text-xs font-semibold mt-1.5">{step.t}</div>
                  <div className="text-[10px] text-white/80 hidden sm:block">{step.s}</div>
                </div>
              ))}
            </div>

            <div className="mt-7 max-w-2xl mx-auto">
              <div className="text-xs text-white/80 mb-2 uppercase tracking-wider font-semibold">¿Buscando algo?</div>
              {/* Force dark text on the white hero card so search input is always visible in dark mode too */}
              <div className="relative bg-white rounded-2xl shadow-2xl p-2 text-gray-900 [&_input]:!text-gray-900 [&_input]:placeholder:!text-gray-500">
                <SearchBar
                  value={searchInput}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onSubmit={(e) => { setQuery(searchInput.trim()); }}
                  placeholder={t.searchPlaceholder}
                  suggestions={suggestions}
                  open={suggestOpen}
                  setOpen={setSuggestOpen}
                  loading={suggestLoading}
                  onPick={onSuggestionClick}
                />
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-6 text-white/95 text-sm">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Seguro</div>
              <div className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Rápido</div>
              <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Sin comisiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES - hidden when searching/filtering */}
      {!hasFiltersOrQuery && (
        <section className="container mx-auto px-4 -mt-8 relative z-10">
          <Card className="shadow-xl border-0">
            <CardContent className="p-4 md:p-6">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-lg font-bold">{t.categories}</h2>
                {category && (
                  <Button variant="ghost" size="sm" onClick={() => setCategory('')}>
                    <X className="h-3 w-3 mr-1" /> {t.clear}
                  </Button>
                )}
              </div>
              <div className="grid grid-cols-3 sm:grid-cols-5 md:grid-cols-7 lg:grid-cols-10 gap-2">
                {categories.map((c) => (
                  <button
                    key={c.id}
                    onClick={() => setCategory(category === c.id ? '' : c.id)}
                    className={`group flex flex-col items-center justify-center gap-1 py-3 px-2 rounded-xl border transition-all hover-lift ${
                      category === c.id
                        ? 'border-[#1565C0] bg-[#1565C0]/5 shadow-md'
                        : 'border-border bg-card hover:border-[#1565C0]/40'
                    }`}
                  >
                    <span className="text-2xl">{c.icon}</span>
                    <span className={`text-[11px] font-medium text-center leading-tight line-clamp-2 ${category === c.id ? 'text-[#1565C0]' : 'text-foreground'}`}>{c.name}</span>
                  </button>
                ))}
              </div>
            </CardContent>
          </Card>
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

      {/* FEATURED - only on default home view */}
      {!hasFiltersOrQuery && featured.length > 0 && (
        <section className="container mx-auto px-4 mb-12">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl md:text-2xl font-bold flex items-center gap-2">
              <Sparkles className="h-5 w-5 text-amber-500" /> {t.recommended}
            </h2>
          </div>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {featured.slice(0, 10).map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => onProduct(p.id)} isFav={favorites.includes(p.id)} onFav={() => toggleFav(p.id)} onShare={() => onShare(p)} onReport={() => onReport(p.id, null)} highlight />
            ))}
          </div>
        </section>
      )}

      {/* STATS BANNER */}
      <section className="container mx-auto px-4 mb-12">
        <div className="rounded-2xl brand-gradient text-white p-6 md:p-10 text-center">
          <h3 className="text-sm font-semibold uppercase tracking-wider text-white/80 mb-3">{t.stats}</h3>
          <div className="grid grid-cols-3 gap-4 mt-4">
            {[
              { v: stats.productsCount || 0, l: t.products },
              { v: stats.businessesCount || 0, l: t.businesses },
              { v: stats.usersCount || 0, l: t.sellers },
            ].map((s, i) => (
              <div key={i}>
                <div className="text-3xl md:text-5xl font-extrabold">{s.v}+</div>
                <div className="text-sm md:text-base text-white/90 mt-1 capitalize">{s.l}</div>
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
          <span className="flex items-center gap-0.5 flex-shrink-0">
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
const ProductDetail = ({ t, product, onBack, onBusiness, favorites, toggleFav, onShare, onReport, token, isLogged, onLoginNeeded }) => {
  if (!product) {
    return <div className="container mx-auto py-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1565C0]" /></div>;
  }
  const contact = buildContactLinks(product);
  const { waLink, tgLink, smsLink, anyAvailable } = contact;

  // Smart unified CTA: prefers WhatsApp, then Telegram, then SMS.
  // Opens the first available channel directly so user doesn't have to choose if there's only one.
  const primaryHref = waLink || tgLink || smsLink || '#';
  const primaryLabel = waLink ? 'WhatsApp' : tgLink ? 'Telegram' : smsLink ? 'SMS' : '';
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
            <span className="flex items-center gap-1"><Clock className="h-4 w-4" /> {timeAgo(product.createdAt)}</span>
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
            {/* Privacy mode: product or business hides digital contacts → show physical info */}
            {(product.contactsHidden || product.business?.contactsHidden) ? (() => {
              // Effective physical info: product-level fields override business-level
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
                      <span>
                        {address && <>{address}<br /></>}
                        {locLine}
                      </span>
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
            })() : anyAvailable ? (
              <>
                {/* Primary CTA — Web3-style */}
                <a
                  href={primaryHref}
                  target={primaryHref.startsWith('sms:') ? undefined : '_blank'}
                  rel="noopener noreferrer"
                  className="block w-full h-14 rounded-xl brand-gradient text-white font-bold flex items-center justify-center gap-2 transition-all shadow-lg hover:shadow-2xl hover:-translate-y-0.5 active:translate-y-0 active:shadow-md text-base"
                  aria-label="Contactar vendedor"
                >
                  <MessageCircle className="h-5 w-5" />
                  Contactar vendedor
                  <span className="text-xs opacity-80 ml-1">· {primaryLabel}</span>
                </a>

                {/* Secondary channels — only shown if there are 2+ channels */}
                {((!!waLink + !!tgLink + !!smsLink) > 1) && (
                  <>
                    <div className="text-[10px] text-muted-foreground uppercase tracking-wider mt-4 mb-2 text-center font-semibold">
                      O elige otro canal
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                      {waLink && (
                        <a href={waLink} target="_blank" rel="noopener noreferrer" className="h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md">
                          <MessageCircle className="h-4 w-4" /> {t.whatsapp}
                        </a>
                      )}
                      {tgLink && (
                        <a href={tgLink} target="_blank" rel="noopener noreferrer" className="h-11 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md">
                          <Send className="h-4 w-4" /> {t.telegram}
                        </a>
                      )}
                      {smsLink && (
                        <a href={smsLink} className="h-11 rounded-xl bg-foreground text-background hover:opacity-90 font-semibold flex items-center justify-center gap-2 transition shadow-sm hover:shadow-md">
                          <Phone className="h-4 w-4" /> {t.sms}
                        </a>
                      )}
                    </div>
                  </>
                )}
              </>
            ) : (
              <div className="text-center py-3 text-sm text-muted-foreground">
                Este vendedor no configuró canales de contacto.
              </div>
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
                    {product.business.name[0]?.toUpperCase()}
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
      .then((d) => setData(d))
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
                <span className="text-[10px] text-muted-foreground ml-auto">{timeAgo(r.createdAt)}</span>
              </div>
              {r.comment && <p className="text-sm mt-2 ml-10 text-foreground/90">{r.comment}</p>}
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

// ============ BUYER DASHBOARD ============
const BuyerDashboard = ({ user, onBecomeSeller, onFavorites, favoritesCount }) => (
  <section className="container mx-auto px-4 py-8">
    <div className="mb-6">
      <h1 className="text-3xl font-extrabold">Hola, {user.name || user.email.split('@')[0]} 👋</h1>
      <p className="text-muted-foreground">Tu cuenta personal de UBIK2 YEMG</p>
    </div>

    {/* Upgrade banner */}
    <Card className="overflow-hidden border-0 shadow-xl mb-6 brand-gradient text-white">
      <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
        <div>
          <Badge className="bg-white/20 text-white border-0 mb-2">Próximo: Plan PRO</Badge>
          <h2 className="text-2xl md:text-3xl font-extrabold">¿Tienes algo para vender?</h2>
          <p className="text-white/90 mt-1 max-w-lg">
            Conviértete en vendedor gratis y publica hasta 10 productos. Cuando lo necesites, pásate a PRO para productos ilimitados.
          </p>
        </div>
        <Button size="lg" onClick={onBecomeSeller} className="bg-white text-[#1565C0] hover:bg-white/90 font-bold h-12 px-6">
          <Store className="h-5 w-5 mr-2" /> Hazte vendedor
        </Button>
      </CardContent>
    </Card>

    {/* Grid de info */}
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
          <div className="text-sm font-semibold truncate">{user.email}</div>
          <div className="text-xs text-muted-foreground">Email de tu cuenta</div>
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

    {/* Próximamente PRO */}
    <Card className="mt-6 border-dashed">
      <CardContent className="p-6 text-center">
        <Crown className="h-10 w-10 mx-auto text-amber-500 mb-3" />
        <h3 className="text-xl font-bold mb-2">UBIK2 YEMG PRO — Próximamente</h3>
        <p className="text-muted-foreground max-w-lg mx-auto text-sm">
          Funciones premium para compradores: alertas de precios, búsquedas guardadas, contacto directo prioritario, comparador y mucho más.
        </p>
      </CardContent>
    </Card>
  </section>
);

// ============ DASHBOARD (Seller) ============
const Dashboard = ({ user, business, products, onNew, onEdit, onDelete, onPlan, onShareBusiness, compressLogo, onLogoChange }) => {
  const isPremium = user.plan === 'premium';
  const limit = isPremium ? '∞' : `${products.length}/10`;
  const [tab, setTab] = React.useState('all');
  const [groupByCategory, setGroupByCategory] = React.useState(false);

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
            Este producto <b>no será visible</b> en el marketplace porque no tiene stock disponible. Edítalo y agrega stock para reactivarlo.
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
        <Card className="mb-6">
          <CardContent className="p-4">
            <LogoUploader
              value={business?.logo || ''}
              onChange={onLogoChange}
              compressLogo={compressLogo}
              label="Logo del negocio (toca para cambiar)"
            />
          </CardContent>
        </Card>
      )}

      {/* Stats — 4 cards instead of 3 */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
        <Card><CardContent className="p-4">
          <div className="text-[10px] text-muted-foreground uppercase tracking-wider">Total productos</div>
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
            Agrupar por categoría
          </label>
        </div>
      </Tabs>

      {visibleProducts.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">
              {tab === 'out' ? '¡No tienes productos agotados! 🎉' :
               tab === 'featured' ? 'No tienes productos destacados.' :
               tab === 'active' ? 'No tienes productos activos.' :
               'Aún no tienes productos publicados.'}
            </p>
            <Button onClick={onNew} className="bg-[#00A86B] hover:bg-[#008F5B] text-white">
              <Plus className="h-4 w-4 mr-2" /> {tab === 'all' ? 'Publica el primero' : 'Crear producto'}
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
    </section>
  );
};

// ============ ADMIN ============
const AdminDashboard = ({ data, settings, setSettings, onApprove, onReject, onUpdateUser, onDeleteUser, onUpdateBusiness, onDeleteBusiness, onDeleteProduct, onResolveReport, onSaveSettings, savingSettings, tab, setTab, onRefresh, compressLogo }) => {
  const [editBiz, setEditBiz] = useState(null);
  const { payments, users, products, stats, reports } = data;
  const pending = payments.filter((p) => p.status === 'pending');
  const pendingReports = reports.filter((r) => r.status === 'pending');
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
                  {u.business && (
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
          <BusinessEditDialog biz={editBiz} onClose={() => setEditBiz(null)} onSave={(id, patch) => { onUpdateBusiness(id, patch); setEditBiz(null); }} compressLogo={compressLogo} />
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
          <h4 className="font-semibold text-sm mb-3">Legal</h4>
          <div className="space-y-2 text-sm text-muted-foreground">
            <button onClick={() => onLegal('privacy')} className="block hover:text-foreground">{t.privacyPolicy}</button>
            <button onClick={() => onLegal('terms')} className="block hover:text-foreground">{t.terms}</button>
            <button onClick={() => onLegal('contact')} className="block hover:text-foreground">{t.officialContact}</button>
          </div>
          <div className="mt-4">
            <div className="text-xs text-muted-foreground mb-1">Idioma</div>
            <div className="flex gap-1">
              {Object.entries(FLAGS).map(([k, f]) => (
                <button key={k} onClick={() => setLang(k)} className={`text-xl p-1 rounded ${lang === k ? 'ring-2 ring-[#1565C0]' : 'opacity-60 hover:opacity-100'}`}>{f}</button>
              ))}
            </div>
          </div>
        </div>
      </div>
      <div className="mt-8 pt-6 border-t border-border text-xs text-muted-foreground flex flex-col md:flex-row justify-between gap-2">
        <div>© 2025 UBIK2 YEMG · Todos los derechos reservados</div>
        <div className="flex gap-4">USDC · Transfermóvil · WhatsApp · Telegram · SMS</div>
      </div>
    </div>
  </footer>
);

// ============ DIALOGS ============
const AuthDialog = ({ open, onOpenChange, mode, setMode, form, setForm, onSubmit, onForgot, compressLogo }) => (
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

const UpgradeSellerDialog = ({ open, onOpenChange, form, setForm, onSubmit, compressLogo }) => (
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
            <Input type="number" step={form.currency === 'USDC' ? '0.01' : '1'} value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder={form.currency === 'USDC' ? 'Ej: 25.00' : 'Ej: 2500'} />
          </div>
          <div>
            <Label>Moneda</Label>
            <Select value={form.currency || 'CUP'} onValueChange={(v) => setForm({ ...form, currency: v })}>
              <SelectTrigger><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="CUP">🇨🇺 CUP</SelectItem>
                <SelectItem value="USDC">💎 USDC</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
        <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
        <div><Label>Categoría *</Label>
          <Select value={form.category} onValueChange={(v) => setForm({ ...form, category: v })}>
            <SelectTrigger><SelectValue /></SelectTrigger>
            <SelectContent>
              {categories.map((c) => (<SelectItem key={c.id} value={c.id}>{c.icon} {c.name}</SelectItem>))}
            </SelectContent>
          </Select>
        </div>
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

const FiltersSheet = ({ open, onOpenChange, t, filters, setFilters, onApply, onClear }) => (
  <Sheet open={open} onOpenChange={onOpenChange}>
    <SheetContent>
      <SheetHeader>
        <SheetTitle className="flex items-center gap-2"><Filter className="h-5 w-5" /> {t.filters}</SheetTitle>
      </SheetHeader>
      <div className="space-y-4 mt-6">
        <div>
          <Label>Provincia / Municipio / Dirección</Label>
          <Input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="La Habana, Santiago, Vedado..." />
          <p className="text-[10px] text-muted-foreground mt-1">Busca por provincia, municipio o palabra clave de la ubicación.</p>
        </div>
        <div>
          <Label>Nombre del negocio</Label>
          <Input value={filters.businessName || ''} onChange={(e) => setFilters({ ...filters, businessName: e.target.value })} placeholder="Ej: Cafetería La Esquina" />
        </div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Provincia</Label><Input value={filters.province || ''} onChange={(e) => setFilters({ ...filters, province: e.target.value })} placeholder="La Habana" /></div>
          <div><Label>Municipio</Label><Input value={filters.municipality || ''} onChange={(e) => setFilters({ ...filters, municipality: e.target.value })} placeholder="Plaza" /></div>
        </div>
        <label className="flex items-center gap-2 text-sm border border-border rounded-md p-2 cursor-pointer hover:bg-muted/50">
          <input type="checkbox" checked={!!filters.physicalOnly} onChange={(e) => setFilters({ ...filters, physicalOnly: e.target.checked })} />
          <Store className="h-4 w-4 text-[#1565C0]" /> Solo negocios físicos (sin contacto online)
        </label>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t.priceMin}</Label><Input type="number" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} placeholder="0" /></div>
          <div><Label>{t.priceMax}</Label><Input type="number" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} placeholder="∞" /></div>
        </div>
        <p className="text-[10px] text-muted-foreground -mt-1">Aplica en la moneda del producto (CUP o USDC).</p>
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
          <Label>{t.date}</Label>
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

const BusinessEditDialog = ({ biz, onClose, onSave, compressLogo }) => {
  const [form, setForm] = useState(null);
  useEffect(() => {
    if (biz) {
      // Pre-load existing values, defaulting new fields safely so admin can edit without losing data
      setForm({
        showContactsPublicly: true, // default visible
        province: '', municipality: '', address: '', openingHours: '', closingHours: '', messenger: '',
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
