'use client';

import { useEffect, useState, useCallback, useMemo } from 'react';
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

const formatPrice = (n) =>
  `${new Intl.NumberFormat('es-ES', { maximumFractionDigits: 0 }).format(Number(n || 0))} CUP`;

const timeAgo = (iso) => {
  if (!iso) return '';
  const diff = (Date.now() - new Date(iso).getTime()) / 1000;
  if (diff < 60) return 'ahora';
  if (diff < 3600) return `${Math.floor(diff / 60)}min`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  if (diff < 604800) return `${Math.floor(diff / 86400)}d`;
  return new Date(iso).toLocaleDateString('es-ES', { day: 'numeric', month: 'short' });
};

function api(path, { method = 'GET', body, token } = {}) {
  const headers = { 'Content-Type': 'application/json' };
  if (token) headers.Authorization = `Bearer ${token}`;
  return fetch(`${API}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  }).then(async (r) => {
    const data = await r.json().catch(() => ({}));
    if (!r.ok) throw new Error(data.error || 'Error');
    return data;
  });
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
  const [filters, setFilters] = useState({ location: '', priceMin: '', priceMax: '', since: '' });
  const [loading, setLoading] = useState(false);

  const [lang, setLang] = useState('es');
  const [dark, setDark] = useState(false);
  const [favorites, setFavorites] = useState([]);

  // Dialogs
  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login');
  const [authForm, setAuthForm] = useState({
    email: '', password: '', businessName: '', whatsapp: '', telegram: '', sms: '',
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
    available: true, featured: false, location: '',
  };
  const [productForm, setProductForm] = useState(emptyProduct);
  const [legalOpen, setLegalOpen] = useState(null); // 'privacy' | 'terms' | 'contact'
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [reportOpen, setReportOpen] = useState(false);
  const [reportTarget, setReportTarget] = useState(null);
  const [reportForm, setReportForm] = useState({ reason: '', details: '' });

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

  useEffect(() => {
    if (typeof window === 'undefined') return;
    document.documentElement.classList.toggle('dark', dark);
    localStorage.setItem('ubik2_dark', dark ? '1' : '0');
  }, [dark]);

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
    if (filters.priceMin) params.set('priceMin', filters.priceMin);
    if (filters.priceMax) params.set('priceMax', filters.priceMax);
    if (filters.since) params.set('since', filters.since);
    Object.entries(extra).forEach(([k, v]) => params.set(k, v));
    return params.toString();
  }, [query, category, filters]);

  const refreshHome = useCallback(() => {
    setLoading(true);
    const hasFiltersOrQuery = query || category || filters.location || filters.priceMin || filters.priceMax || filters.since;
    // when filtering/searching, exclude featured from main grid
    const mainQ = hasFiltersOrQuery
      ? buildQuery({ excludeFeatured: 'true' })
      : buildQuery({ excludeFeatured: 'true' });
    Promise.all([
      api(`/products?${mainQ}`),
      hasFiltersOrQuery ? Promise.resolve({ products: [] }) : api('/products?featured=true'),
    ])
      .then(([all, feat]) => {
        setProducts(all.products || []);
        setFeatured(feat.products || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [buildQuery, query, category, filters]);

  useEffect(() => {
    if (view === 'home') refreshHome();
  }, [view, refreshHome]);

  // === Auth ===
  const handleAuth = async (e) => {
    e?.preventDefault();
    try {
      if (authMode === 'register') {
        const required = ['email', 'password', 'businessName', 'whatsapp'];
        for (const f of required) if (!authForm[f]) return toast.error('Completa los campos obligatorios');
        const d = await api('/auth/register', { method: 'POST', body: authForm });
        localStorage.setItem('ubik2_token', d.token);
        setToken(d.token);
        setAuthOpen(false);
        toast.success('¡Bienvenido a UBIK2 YEMG!');
        setView('dashboard');
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
    const url = `${window.location.origin}/?p=${p.id}`;
    const text = `${p.name} — ${formatPrice(p.price)}`;
    if (navigator.share) {
      try { await navigator.share({ title: p.name, text, url }); return; } catch {}
    }
    try { await navigator.clipboard.writeText(url); toast.success('Enlace copiado'); }
    catch { toast.error('No se pudo compartir'); }
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
      location: p.location || '',
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
      const d = await api('/auth/forgot', { method: 'POST', body: { email: forgotData.email } });
      toast.success('Token generado');
      setForgotData((f) => ({ ...f, token: d.resetToken }));
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
  const loadAdmin = useCallback(async () => {
    if (!token || user?.role !== 'admin') return;
    try {
      const [pays, usrs, prods, st, settingsRes, reps] = await Promise.all([
        api('/admin/payments', { token }),
        api('/admin/users', { token }),
        api('/admin/products', { token }),
        api('/admin/stats', { token }),
        api('/admin/settings', { token }),
        api('/admin/reports', { token }).catch(() => ({ reports: [] })),
      ]);
      setAdminData({
        payments: pays.payments || [], users: usrs.users || [],
        products: prods.products || [], stats: st, reports: reps.reports || [],
      });
      setAdminSettings(settingsRes.settings);
    } catch (err) { toast.error(err.message); }
  }, [token, user]);
  useEffect(() => { if (view === 'admin') loadAdmin(); }, [view, loadAdmin]);

  const approvePayment = async (id) => { try { await api(`/admin/payments/${id}/approve`, { method: 'POST', token }); toast.success('Aprobado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
  const rejectPayment = async (id) => { const r = prompt('Motivo') || ''; try { await api(`/admin/payments/${id}/reject`, { method: 'POST', token, body: { reason: r } }); toast.success('Rechazado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
  const adminUpdateUser = async (id, patch) => { try { await api(`/admin/users/${id}`, { method: 'PUT', token, body: patch }); toast.success('Actualizado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
  const adminDeleteProduct = async (id) => { if (!confirm('¿Eliminar?')) return; try { await api(`/admin/products/${id}`, { method: 'DELETE', token }); toast.success('Eliminado'); loadAdmin(); refreshHome(); } catch (e) { toast.error(e.message); } };
  const adminResolveReport = async (id, status) => { try { await api(`/admin/reports/${id}`, { method: 'PUT', token, body: { status } }); toast.success('Reporte actualizado'); loadAdmin(); } catch (e) { toast.error(e.message); } };
  const saveAdminSettings = async () => { try { const d = await api('/admin/settings', { method: 'PUT', token, body: adminSettings }); setAdminSettings(d.settings); setSettings(d.settings); toast.success('Guardado'); } catch (e) { toast.error(e.message); } };

  const onSearch = (e) => {
    e?.preventDefault();
    setQuery(searchInput.trim());
    if (view !== 'home') setView('home');
  };

  const resetFilters = () => {
    setCategory(''); setQuery(''); setSearchInput('');
    setFilters({ location: '', priceMin: '', priceMax: '', since: '' });
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* ====== HEADER ====== */}
      <Header
        t={t} lang={lang} setLang={setLang} dark={dark} setDark={setDark}
        user={user} business={business} onLogout={logout}
        onLogin={() => { setAuthMode('login'); setAuthOpen(true); }}
        onRegister={() => { setAuthMode('register'); setAuthOpen(true); }}
        onPublish={() => { if (!user) { setAuthMode('register'); setAuthOpen(true); } else { setView('dashboard'); setTimeout(openProductCreate, 100); } }}
        searchInput={searchInput} setSearchInput={setSearchInput} onSearch={onSearch}
        setView={setView} favorites={favorites}
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
            query={query} setQuery={setQuery} setSearchInput={setSearchInput}
          />
        )}

        {view === 'product' && (
          <ProductDetail
            t={t} product={detail} onBack={() => setView('home')}
            onBusiness={openBusiness} favorites={favorites} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
          />
        )}

        {view === 'business' && (
          <BusinessDetail
            t={t} data={bizDetail} onBack={() => setView('home')} onProduct={openProduct}
            favorites={favorites} toggleFav={toggleFav}
          />
        )}

        {view === 'favorites' && (
          <FavoritesView
            t={t} favorites={favorites} onProduct={openProduct} toggleFav={toggleFav}
            onShare={shareProduct} onReport={openReport}
          />
        )}

        {view === 'dashboard' && user && (
          <Dashboard
            user={user} business={business} products={myProducts}
            onNew={openProductCreate} onEdit={openProductEdit} onDelete={deleteProduct}
            onPlan={() => setPlanOpen(true)}
          />
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
            onUpdateUser={adminUpdateUser} onDeleteProduct={adminDeleteProduct}
            onResolveReport={adminResolveReport}
            onSaveSettings={saveAdminSettings}
            tab={adminTab} setTab={setAdminTab} onRefresh={loadAdmin}
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
      />
      <PlanDialog
        open={planOpen} onOpenChange={setPlanOpen}
        settings={settings} payment={paymentForm} setPayment={setPaymentForm}
        onSubmit={requestPremium} onScreenshotFile={onScreenshotFile}
      />
      <ReportDialog
        open={reportOpen} onOpenChange={setReportOpen}
        form={reportForm} setForm={setReportForm} onSubmit={submitReport}
      />
      <FiltersSheet
        open={filtersOpen} onOpenChange={setFiltersOpen}
        t={t} filters={filters} setFilters={setFilters} onApply={() => setFiltersOpen(false)}
        onClear={() => { setFilters({ location: '', priceMin: '', priceMax: '', since: '' }); setFiltersOpen(false); }}
      />
      <LegalDialog open={!!legalOpen} onOpenChange={(v) => !v && setLegalOpen(null)} kind={legalOpen} settings={settings} />
    </div>
  );
};

// ============ SUB COMPONENTS ============

const Logo = ({ size = 'md', dark, withText = true }) => (
  <div className="flex items-center gap-2">
    <div className={`relative ${size === 'lg' ? 'h-12 w-12' : size === 'sm' ? 'h-8 w-8' : 'h-10 w-10'} flex-shrink-0`}>
      <img src={LOGO} alt="UBIK2 YEMG" className="h-full w-full object-contain" />
    </div>
    {withText && (
      <div className="flex flex-col leading-none">
        <span className={`${size === 'lg' ? 'text-2xl' : 'text-lg'} font-extrabold tracking-tight brand-text-gradient`}>UBIK2 YEMG</span>
        <span className="text-[10px] text-muted-foreground tracking-wider uppercase hidden sm:block">Todo en un solo lugar</span>
      </div>
    )}
  </div>
);

const Header = ({ t, lang, setLang, dark, setDark, user, business, onLogout, onLogin, onRegister, onPublish, searchInput, setSearchInput, onSearch, setView, favorites }) => (
  <header className="sticky top-0 z-40 bg-card border-b border-border shadow-sm">
    <div className="container mx-auto px-4 h-16 flex items-center gap-3">
      <button onClick={() => setView('home')} className="flex-shrink-0">
        <Logo />
      </button>

      <form onSubmit={onSearch} className="hidden md:flex flex-1 max-w-2xl mx-2 relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="pl-9 pr-20 h-10 bg-muted/40"
        />
        <Button type="submit" size="sm" className="absolute right-1 top-1 h-8 brand-gradient text-white hover:opacity-90">
          {t.home === 'Inicio' ? 'Buscar' : 'Search'}
        </Button>
      </form>

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
              <DropdownMenuLabel>{business?.name}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={() => setView('dashboard')}>
                <LayoutDashboard className="h-4 w-4 mr-2" /> {t.panel}
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

    {/* Mobile search */}
    <form onSubmit={onSearch} className="md:hidden border-t border-border px-4 py-2 bg-muted/30">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <Input
          value={searchInput}
          onChange={(e) => setSearchInput(e.target.value)}
          placeholder={t.searchPlaceholder}
          className="pl-9 h-9"
        />
      </div>
    </form>
  </header>
);

// ============ HOME ============
const Home = ({ t, stats, categories, category, setCategory, featured, products, loading, filters, setFilters, onProduct, onBusiness, favorites, toggleFav, onShare, onReport, onCTA, onOpenFilters, resetFilters, query, setQuery, setSearchInput }) => {
  const hasFiltersOrQuery = query || category || filters.location || filters.priceMin || filters.priceMax || filters.since;

  return (
    <>
      {/* HERO */}
      <section className="relative overflow-hidden">
        <div className="absolute inset-0 brand-gradient opacity-95" />
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_50%,rgba(255,255,255,0.15),transparent_50%)]" />
        <div className="relative container mx-auto px-4 py-12 md:py-20 text-white">
          <div className="max-w-3xl mx-auto text-center">
            <img src={LOGO} alt="" className="h-24 md:h-32 mx-auto mb-4 drop-shadow-2xl" />
            <h1 className="text-3xl md:text-5xl font-extrabold tracking-tight leading-tight">
              {t.slogan}
            </h1>
            <p className="text-white/90 mt-3 text-base md:text-lg">{t.subSlogan}</p>

            <div className="mt-7 max-w-2xl mx-auto">
              <div className="relative bg-white rounded-2xl shadow-2xl flex items-center p-2">
                <Search className="ml-3 h-5 w-5 text-muted-foreground flex-shrink-0" />
                <Input
                  defaultValue={query}
                  onChange={(e) => setSearchInput(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === 'Enter') { setQuery(e.target.value.trim()); }
                  }}
                  placeholder={t.searchPlaceholder}
                  className="border-0 focus-visible:ring-0 text-foreground placeholder:text-muted-foreground/70 bg-transparent text-base"
                />
                <Button
                  onClick={() => { /* triggered by input search */ }}
                  className="bg-[#00A86B] hover:bg-[#008F5B] text-white font-semibold rounded-xl h-10 px-6"
                >
                  Buscar
                </Button>
              </div>
            </div>

            <div className="flex flex-wrap justify-center gap-6 mt-8 text-white/95 text-sm">
              <div className="flex items-center gap-1.5"><ShieldCheck className="h-4 w-4" /> Seguro</div>
              <div className="flex items-center gap-1.5"><TrendingUp className="h-4 w-4" /> Rápido</div>
              <div className="flex items-center gap-1.5"><Sparkles className="h-4 w-4" /> Sin comisiones</div>
            </div>
          </div>
        </div>
      </section>

      {/* CATEGORIES */}
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
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5 gap-3 md:gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => onProduct(p.id)} isFav={favorites.includes(p.id)} onFav={() => toggleFav(p.id)} onShare={() => onShare(p)} onReport={() => onReport(p.id, null)} />
            ))}
          </div>
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
  const wa = (p.business?.whatsapp || '').replace(/[^0-9+]/g, '').replace('+', '');
  const tg = p.business?.telegram?.trim();
  const sms = (p.business?.sms || p.business?.whatsapp || '').replace(/[^0-9+]/g, '');
  const waLink = wa && `https://wa.me/${wa}?text=${encodeURIComponent('Hola, vi tu producto en UBIK2 YEMG: ' + p.name)}`;
  const tgLink = tg && (tg.startsWith('@') ? `https://t.me/${tg.slice(1)}` : `https://t.me/${tg}`);
  const smsLink = sms && `sms:${sms}`;

  return (
    <Card
      className={`overflow-hidden cursor-pointer group bg-card border-border hover:shadow-xl transition-all hover-lift fade-in-up ${highlight ? 'ring-1 ring-amber-400/40' : ''}`}
      onClick={onClick}
    >
      <div className="relative aspect-square overflow-hidden bg-muted">
        {p.image ? (
          <img src={p.image} alt={p.name} loading="lazy" className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500" />
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
        <div className="text-xl md:text-2xl font-extrabold text-[#00A86B] leading-none">{formatPrice(p.price)}</div>
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
const ProductDetail = ({ t, product, onBack, onBusiness, favorites, toggleFav, onShare, onReport }) => {
  if (!product) {
    return <div className="container mx-auto py-32 flex justify-center"><Loader2 className="h-8 w-8 animate-spin text-[#1565C0]" /></div>;
  }
  const wa = (product.business?.whatsapp || '').replace(/[^0-9+]/g, '').replace('+', '');
  const tg = product.business?.telegram?.trim();
  const sms = (product.business?.sms || product.business?.whatsapp || '').replace(/[^0-9+]/g, '');
  const waMsg = encodeURIComponent(`¡Hola! Vi tu producto "${product.name}" en UBIK2 YEMG. ¿Sigue disponible?`);
  const waLink = wa && `https://wa.me/${wa}?text=${waMsg}`;
  const tgLink = tg && (tg.startsWith('@') ? `https://t.me/${tg.slice(1)}` : `https://t.me/${tg}`);
  const smsLink = sms && `sms:${sms}?body=${encodeURIComponent('Hola, vi tu producto en UBIK2 YEMG: ' + product.name)}`;
  const isFav = favorites.includes(product.id);

  return (
    <section className="container mx-auto px-4 py-8">
      <Button variant="ghost" onClick={onBack} className="mb-4"><ArrowLeft className="h-4 w-4 mr-2" /> Volver</Button>

      <div className="grid md:grid-cols-2 gap-8">
        <div className="rounded-2xl overflow-hidden bg-card border border-border shadow-md">
          <img src={product.image || 'https://placehold.co/600x600?text=Sin+imagen'} alt={product.name} className="w-full aspect-square object-cover" />
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
          <div className="text-4xl md:text-5xl font-extrabold text-[#00A86B] mt-3">{formatPrice(product.price)}</div>

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
          <div className="mt-6 p-4 rounded-2xl bg-muted/30 border border-border">
            <h3 className="font-semibold mb-3 text-sm">{t.contact}</h3>
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg">
                  <MessageCircle className="h-5 w-5" /> {t.whatsapp}
                </a>
              )}
              {tgLink && (
                <a href={tgLink} target="_blank" rel="noopener noreferrer" className="h-12 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg">
                  <Send className="h-5 w-5" /> {t.telegram}
                </a>
              )}
              {smsLink && (
                <a href={smsLink} className="h-12 rounded-xl bg-foreground text-background hover:opacity-90 font-semibold flex items-center justify-center gap-2 transition shadow-md hover:shadow-lg">
                  <Phone className="h-5 w-5" /> {t.sms}
                </a>
              )}
            </div>
          </div>

          {/* Seller card */}
          {product.business && (
            <div className="mt-6 rounded-2xl border border-border bg-card p-4 cursor-pointer hover:bg-muted/40 transition" onClick={() => onBusiness(product.business.id)}>
              <div className="flex items-center gap-3">
                {product.business.logo ? (
                  <img src={product.business.logo} alt="" className="h-14 w-14 rounded-full object-cover border" />
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
    </section>
  );
};

// ============ BUSINESS DETAIL ============
const BusinessDetail = ({ t, data, onBack, onProduct, favorites, toggleFav }) => {
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
              <img src={business.logo} alt="" className="h-24 w-24 md:h-32 md:w-32 rounded-2xl object-cover border-4 border-card shadow-lg" />
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
              {waLink && (
                <a href={waLink} target="_blank" rel="noopener noreferrer" className="mt-4 inline-flex items-center gap-2 px-5 h-11 rounded-xl bg-green-500 hover:bg-green-600 text-white font-semibold shadow">
                  <MessageCircle className="h-4 w-4" /> {t.contact}
                </a>
              )}
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
            <ProductCard key={p.id} p={{ ...p, business }} onClick={() => onProduct(p.id)} isFav={favorites.includes(p.id)} onFav={() => toggleFav(p.id)} onShare={() => {}} onReport={() => {}} />
          ))}
        </div>
      )}
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

// ============ DASHBOARD ============
const Dashboard = ({ user, business, products, onNew, onEdit, onDelete, onPlan }) => {
  const isPremium = user.plan === 'premium';
  const limit = isPremium ? '∞' : `${products.length}/10`;
  return (
    <section className="container mx-auto px-4 py-8">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-3xl font-extrabold">Panel de {business?.name}</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo y suscripción.</p>
        </div>
        <div className="flex gap-2">
          <Button variant="outline" onClick={onPlan}>
            <Crown className="h-4 w-4 mr-2 text-amber-500" /> {isPremium ? 'Premium activo' : 'Mejorar plan'}
          </Button>
          <Button onClick={onNew} className="bg-[#00A86B] hover:bg-[#008F5B] text-white">
            <Plus className="h-4 w-4 mr-2" /> Nuevo producto
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-3 mb-6">
        {[
          { l: 'Productos', v: limit },
          { l: 'Plan', v: user.plan, icon: isPremium ? <Crown className="h-4 w-4 text-amber-500 inline ml-1" /> : null },
          { l: 'WhatsApp', v: business?.whatsapp || '—' },
        ].map((s, i) => (
          <Card key={i}>
            <CardContent className="p-5">
              <div className="text-xs text-muted-foreground uppercase tracking-wider">{s.l}</div>
              <div className="text-2xl font-bold mt-1 capitalize">{s.v}{s.icon}</div>
            </CardContent>
          </Card>
        ))}
      </div>

      <h2 className="text-xl font-bold mb-4">Tus productos</h2>
      {products.length === 0 ? (
        <Card className="text-center py-12 border-dashed">
          <CardContent>
            <ShoppingBag className="h-12 w-12 mx-auto text-muted-foreground/40 mb-3" />
            <p className="text-muted-foreground mb-4">Aún no tienes productos publicados.</p>
            <Button onClick={onNew} className="bg-[#00A86B] hover:bg-[#008F5B] text-white">
              <Plus className="h-4 w-4 mr-2" /> Publica el primero
            </Button>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="overflow-hidden hover-lift">
              <div className="aspect-video bg-muted overflow-hidden">
                {p.image && <img src={p.image} alt={p.name} className="w-full h-full object-cover" />}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between gap-2">
                  <div className="min-w-0">
                    <div className="font-semibold truncate">{p.name}</div>
                    <div className="text-sm text-[#00A86B] font-bold">{formatPrice(p.price)}</div>
                    <div className="text-xs text-muted-foreground">Stock: {p.stock}</div>
                  </div>
                  {p.featured && <Badge className="bg-amber-500 text-black border-0"><Sparkles className="h-3 w-3" /></Badge>}
                </div>
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
          ))}
        </div>
      )}
    </section>
  );
};

// ============ ADMIN ============
const AdminDashboard = ({ data, settings, setSettings, onApprove, onReject, onUpdateUser, onDeleteProduct, onResolveReport, onSaveSettings, tab, setTab, onRefresh }) => {
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
                <div className="flex-1">
                  <div className="font-semibold flex items-center gap-2 flex-wrap">
                    {u.email}
                    {u.role === 'admin' && <Badge className="bg-amber-500 text-black border-0">admin</Badge>}
                    {u.suspended && <Badge variant="destructive">suspendido</Badge>}
                  </div>
                  <div className="text-xs text-muted-foreground">{u.business?.name || '—'} · Plan: <b>{u.plan}</b></div>
                </div>
                <div className="flex gap-2">
                  <Select value={u.plan} onValueChange={(v) => onUpdateUser(u.id, { plan: v })}>
                    <SelectTrigger className="w-32"><SelectValue /></SelectTrigger>
                    <SelectContent>
                      <SelectItem value="basico">Básico</SelectItem>
                      <SelectItem value="premium">Premium</SelectItem>
                    </SelectContent>
                  </Select>
                  <Button size="sm" variant="outline" onClick={() => onUpdateUser(u.id, { suspended: !u.suspended })}>
                    {u.suspended ? 'Reactivar' : 'Suspender'}
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
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
                  <div className="text-xs text-muted-foreground truncate">{p.business?.name} · {formatPrice(p.price)}</div>
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
                  <div><Label>Transfermóvil - Nombre</Label><Input value={settings.transfermovilName || ''} onChange={(e) => setSettings({ ...settings, transfermovilName: e.target.value })} /></div>
                  <div><Label>Transfermóvil - Número</Label><Input value={settings.transfermovilNumber || ''} onChange={(e) => setSettings({ ...settings, transfermovilNumber: e.target.value })} /></div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div><Label>Teléfono oficial</Label><Input value={settings.contactPhone || ''} onChange={(e) => setSettings({ ...settings, contactPhone: e.target.value })} /></div>
                  <div><Label>Email oficial</Label><Input value={settings.contactEmail || ''} onChange={(e) => setSettings({ ...settings, contactEmail: e.target.value })} /></div>
                </div>
                <Button onClick={onSaveSettings} className="brand-gradient text-white">Guardar cambios</Button>
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
const AuthDialog = ({ open, onOpenChange, mode, setMode, form, setForm, onSubmit, onForgot }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <div className="flex justify-center mb-2"><img src={LOGO} alt="" className="h-14" /></div>
        <DialogTitle className="text-center text-2xl">{mode === 'login' ? 'Bienvenido' : 'Crea tu negocio'}</DialogTitle>
        <DialogDescription className="text-center">
          {mode === 'login' ? 'Accede para gestionar tus productos.' : 'Publica tu negocio en minutos.'}
        </DialogDescription>
      </DialogHeader>
      <Tabs value={mode} onValueChange={setMode}>
        <TabsList className="grid grid-cols-2 w-full">
          <TabsTrigger value="login">Entrar</TabsTrigger>
          <TabsTrigger value="register">Registrar negocio</TabsTrigger>
        </TabsList>
        <form onSubmit={onSubmit} className="space-y-3 mt-4">
          <div><Label>Email *</Label><Input type="email" value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} required /></div>
          <div><Label>Contraseña *</Label><Input type="password" value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} required /></div>
          {mode === 'register' && (
            <>
              <div><Label>Nombre del negocio *</Label><Input value={form.businessName} onChange={(e) => setForm({ ...form, businessName: e.target.value })} required placeholder="Ej: Mi tienda" /></div>
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
              {mode === 'login' ? 'Entrar' : 'Crear cuenta'}
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

const ForgotDialog = ({ open, onOpenChange, step, setStep, data, setData, onRequest, onSubmit }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-md">
      <DialogHeader>
        <DialogTitle>Recuperar contraseña</DialogTitle>
        <DialogDescription>
          {step === 1 ? 'Ingresa tu email para generar un token.' : 'Pega el token y elige una nueva contraseña.'}
        </DialogDescription>
      </DialogHeader>
      {step === 1 ? (
        <div className="space-y-3">
          <div><Label>Email</Label><Input type="email" value={data.email} onChange={(e) => setData({ ...data, email: e.target.value })} /></div>
          <Button onClick={onRequest} className="w-full brand-gradient text-white">Generar token</Button>
        </div>
      ) : (
        <div className="space-y-3">
          <div><Label>Token</Label><Input value={data.token} onChange={(e) => setData({ ...data, token: e.target.value })} className="font-mono text-xs" /><p className="text-xs text-muted-foreground mt-1">En producción este token llegaría por email.</p></div>
          <div><Label>Nueva contraseña</Label><Input type="password" value={data.newPassword} onChange={(e) => setData({ ...data, newPassword: e.target.value })} /></div>
          <Button onClick={onSubmit} className="w-full brand-gradient text-white">Actualizar</Button>
        </div>
      )}
    </DialogContent>
  </Dialog>
);

const ProductDialog = ({ open, onOpenChange, editing, form, setForm, onSubmit, onImageFile, categories, isPremium }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-lg max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle>{editing ? 'Editar producto' : 'Publicar producto'}</DialogTitle>
        <DialogDescription>Completa los datos para mostrar tu producto en el marketplace.</DialogDescription>
      </DialogHeader>
      <form onSubmit={onSubmit} className="space-y-3">
        <div><Label>Nombre *</Label><Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} required /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>Precio CUP *</Label><Input type="number" step="1" value={form.price} onChange={(e) => setForm({ ...form, price: e.target.value })} required placeholder="Ej: 2500" /></div>
          <div><Label>Stock</Label><Input type="number" value={form.stock} onChange={(e) => setForm({ ...form, stock: e.target.value })} /></div>
        </div>
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

const PlanDialog = ({ open, onOpenChange, settings, payment, setPayment, onSubmit, onScreenshotFile }) => (
  <Dialog open={open} onOpenChange={onOpenChange}>
    <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
      <DialogHeader>
        <DialogTitle className="flex items-center gap-2 text-2xl"><Crown className="h-6 w-6 text-amber-500" /> Pásate a Premium</DialogTitle>
        <DialogDescription>Desbloquea todas las funciones.</DialogDescription>
      </DialogHeader>
      <div className="grid md:grid-cols-2 gap-3">
        <Card><CardContent className="p-5">
          <Badge variant="secondary">Plan Básico</Badge>
          <h3 className="text-2xl font-bold mt-2">Gratis</h3>
          <ul className="text-sm text-muted-foreground space-y-1.5 mt-3">
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Hasta 10 productos</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Marketplace público</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> WhatsApp/Telegram/SMS</li>
          </ul>
        </CardContent></Card>
        <Card className="border-[#00A86B] bg-[#00A86B]/5"><CardContent className="p-5">
          <Badge className="bg-[#00A86B] text-white">Premium</Badge>
          <h3 className="text-2xl font-bold mt-2">${settings?.premiumPriceUSD ?? '9.99'}<span className="text-base text-muted-foreground">/mes</span></h3>
          <ul className="text-sm space-y-1.5 mt-3">
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Productos ilimitados</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Destacar productos</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Sin publicidad</li>
            <li className="flex gap-2"><Check className="h-4 w-4 text-green-500" /> Prioridad en búsquedas</li>
          </ul>
        </CardContent></Card>
      </div>
      <div className="space-y-3 mt-4">
        <div className="grid grid-cols-2 gap-2">
          <button onClick={() => setPayment({ ...payment, method: 'usdc' })} className={`rounded-lg p-3 border text-sm ${payment.method === 'usdc' ? 'border-[#1565C0] bg-[#1565C0]/5' : 'border-border'}`}>💎 USDC</button>
          <button onClick={() => setPayment({ ...payment, method: 'transfermovil' })} className={`rounded-lg p-3 border text-sm ${payment.method === 'transfermovil' ? 'border-[#1565C0] bg-[#1565C0]/5' : 'border-border'}`}>📱 Transfermóvil</button>
        </div>
        {payment.method === 'usdc' && settings && (
          <div className="rounded-lg border bg-amber-50 p-3 text-xs">
            <div className="font-semibold text-amber-700 mb-1">Wallet USDC ({settings.usdcNetwork})</div>
            <div className="font-mono break-all">{settings.usdcWallet}</div>
          </div>
        )}
        {payment.method === 'transfermovil' && settings && (
          <div className="rounded-lg border bg-amber-50 p-3 text-xs">
            <div className="font-semibold text-amber-700 mb-1">Transfermóvil</div>
            <div>Nombre: <b>{settings.transfermovilName}</b></div>
            <div>Número: <b>{settings.transfermovilNumber}</b></div>
          </div>
        )}
        <div><Label className="text-xs">Hash / Referencia del pago</Label><Input value={payment.reference} onChange={(e) => setPayment({ ...payment, reference: e.target.value })} placeholder="0x... o número de operación" /></div>
        <div>
          <Label className="text-xs">Captura del pago (máx 2MB)</Label>
          <Input type="file" accept="image/*" onChange={(e) => onScreenshotFile(e.target.files?.[0])} />
          {payment.screenshot && <img src={payment.screenshot} alt="" className="mt-2 max-h-32 rounded-lg border" />}
        </div>
        <Button onClick={onSubmit} className="w-full brand-gradient text-white">Enviar solicitud</Button>
      </div>
    </DialogContent>
  </Dialog>
);

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
        <div><Label>{t.location}</Label><Input value={filters.location} onChange={(e) => setFilters({ ...filters, location: e.target.value })} placeholder="La Habana, Santiago..." /></div>
        <div className="grid grid-cols-2 gap-2">
          <div><Label>{t.priceMin} (CUP)</Label><Input type="number" value={filters.priceMin} onChange={(e) => setFilters({ ...filters, priceMin: e.target.value })} /></div>
          <div><Label>{t.priceMax} (CUP)</Label><Input type="number" value={filters.priceMax} onChange={(e) => setFilters({ ...filters, priceMax: e.target.value })} /></div>
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

export default App;
