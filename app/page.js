'use client';

import { useEffect, useState, useCallback } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Card, CardContent } from '@/components/ui/card';
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from '@/components/ui/dialog';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';
import {
  Search,
  ShoppingBag,
  Sparkles,
  Plus,
  LayoutDashboard,
  LogOut,
  Store,
  MessageCircle,
  MapPin,
  Crown,
  Trash2,
  Pencil,
  ArrowLeft,
  Check,
  Loader2,
  Instagram,
  Facebook,
  Zap,
} from 'lucide-react';
import { toast } from 'sonner';

const API = '/api';

const formatPrice = (n) =>
  new Intl.NumberFormat('es-ES', { style: 'currency', currency: 'USD' }).format(Number(n || 0));

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
  const [view, setView] = useState('home'); // home | product | dashboard | business
  const [productId, setProductId] = useState(null);
  const [businessId, setBusinessId] = useState(null);

  const [token, setToken] = useState(null);
  const [user, setUser] = useState(null);
  const [business, setBusiness] = useState(null);

  const [products, setProducts] = useState([]);
  const [featured, setFeatured] = useState([]);
  const [categories, setCategories] = useState([]);
  const [stats, setStats] = useState({ productsCount: 0, businessesCount: 0, usersCount: 0 });

  const [query, setQuery] = useState('');
  const [category, setCategory] = useState('');
  const [loading, setLoading] = useState(false);

  const [authOpen, setAuthOpen] = useState(false);
  const [authMode, setAuthMode] = useState('login'); // login | register
  const [authForm, setAuthForm] = useState({
    email: '',
    password: '',
    businessName: '',
    whatsapp: '',
    location: '',
    description: '',
    logo: '',
  });

  const [planOpen, setPlanOpen] = useState(false);

  const [productOpen, setProductOpen] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const emptyProduct = {
    name: '',
    price: '',
    description: '',
    category: 'comida',
    stock: 1,
    image: '',
    available: true,
    featured: false,
  };
  const [productForm, setProductForm] = useState(emptyProduct);

  const [detail, setDetail] = useState(null);
  const [bizDetail, setBizDetail] = useState(null);
  const [myProducts, setMyProducts] = useState([]);

  // Init: load token + seed + data
  useEffect(() => {
    const t = typeof window !== 'undefined' ? localStorage.getItem('ubik2_token') : null;
    if (t) setToken(t);
    // Seed (no-op if data exists) + load
    api('/seed', { method: 'POST' }).catch(() => {});
    refreshHome();
    api('/categories').then((d) => setCategories(d.categories || []));
    api('/stats').then((d) => setStats(d)).catch(() => {});
  }, []);

  // When token changes, fetch user
  useEffect(() => {
    if (!token) {
      setUser(null);
      setBusiness(null);
      return;
    }
    api('/auth/me', { token })
      .then((d) => {
        setUser(d.user);
        setBusiness(d.business);
      })
      .catch(() => {
        setToken(null);
        localStorage.removeItem('ubik2_token');
      });
  }, [token]);

  const refreshHome = useCallback(() => {
    setLoading(true);
    Promise.all([
      api(`/products?${query ? `q=${encodeURIComponent(query)}&` : ''}${category ? `category=${category}` : ''}`),
      api('/products?featured=true'),
    ])
      .then(([all, feat]) => {
        setProducts(all.products || []);
        setFeatured(feat.products || []);
      })
      .catch((e) => toast.error(e.message))
      .finally(() => setLoading(false));
  }, [query, category]);

  useEffect(() => {
    if (view === 'home') refreshHome();
  }, [view, refreshHome]);

  // === AUTH ===
  const handleAuth = async (e) => {
    e?.preventDefault();
    try {
      if (authMode === 'register') {
        const { email, password, businessName, whatsapp, location, description, logo } = authForm;
        if (!email || !password || !businessName || !whatsapp) {
          return toast.error('Completa los campos obligatorios');
        }
        const d = await api('/auth/register', {
          method: 'POST',
          body: { email, password, businessName, whatsapp, location, description, logo },
        });
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

  // === PRODUCT FORM ===
  const openProductCreate = () => {
    setEditingProduct(null);
    setProductForm(emptyProduct);
    setProductOpen(true);
  };
  const openProductEdit = (p) => {
    setEditingProduct(p);
    setProductForm({
      name: p.name,
      price: p.price,
      description: p.description || '',
      category: p.category,
      stock: p.stock,
      image: p.image || '',
      available: p.available,
      featured: !!p.featured,
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
    } catch (err) {
      toast.error(err.message);
    }
  };

  const deleteProduct = async (id) => {
    if (!confirm('¿Eliminar este producto?')) return;
    try {
      await api(`/products/${id}`, { method: 'DELETE', token });
      toast.success('Producto eliminado');
      loadMyProducts();
      refreshHome();
    } catch (err) {
      toast.error(err.message);
    }
  };

  const loadMyProducts = useCallback(() => {
    if (!token) return;
    api('/my/products', { token })
      .then((d) => setMyProducts(d.products || []))
      .catch(() => {});
  }, [token]);

  useEffect(() => {
    if (view === 'dashboard') loadMyProducts();
  }, [view, loadMyProducts]);

  // Detail
  const openProduct = async (id) => {
    setProductId(id);
    setView('product');
    setDetail(null);
    try {
      const d = await api(`/products/${id}`);
      setDetail(d.product);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const openBusiness = async (id) => {
    setBusinessId(id);
    setView('business');
    setBizDetail(null);
    try {
      const d = await api(`/businesses/${id}`);
      setBizDetail(d);
    } catch (e) {
      toast.error(e.message);
    }
  };

  const requestPremium = async () => {
    try {
      await api('/subscription', {
        method: 'POST',
        token,
        body: { plan: 'premium', paymentMethod: 'usdc', reference: 'pendiente' },
      });
      toast.success('Solicitud enviada. Un admin revisará tu pago.');
      setPlanOpen(false);
    } catch (err) {
      toast.error(err.message);
    }
  };

  // === RENDER ===
  return (
    <div className="min-h-screen bg-gradient-to-br from-[#0a0418] via-[#100628] to-[#04081f] text-foreground relative overflow-x-hidden">
      {/* Background orbs */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden">
        <div className="absolute -top-40 -left-40 w-[500px] h-[500px] bg-purple-600/20 rounded-full blur-3xl" />
        <div className="absolute top-1/3 -right-40 w-[600px] h-[600px] bg-fuchsia-500/15 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-1/3 w-[500px] h-[500px] bg-blue-500/10 rounded-full blur-3xl" />
      </div>

      {/* Header */}
      <header className="sticky top-0 z-40 backdrop-blur-xl bg-black/30 border-b border-white/10">
        <div className="container mx-auto px-4 h-16 flex items-center justify-between gap-4">
          <button
            onClick={() => setView('home')}
            className="flex items-center gap-2 group"
          >
            <div className="relative h-9 w-9 rounded-lg bg-gradient-to-br from-fuchsia-500 via-purple-500 to-blue-500 flex items-center justify-center shadow-lg shadow-purple-500/30">
              <Zap className="h-5 w-5 text-white" />
            </div>
            <div className="flex flex-col leading-none">
              <span className="font-bold text-lg tracking-tight bg-gradient-to-r from-white via-fuchsia-200 to-purple-300 bg-clip-text text-transparent">
                UBIK2 YEMG
              </span>
              <span className="text-[10px] text-muted-foreground tracking-widest uppercase">
                Marketplace
              </span>
            </div>
          </button>

          {view === 'home' && (
            <div className="hidden md:flex flex-1 max-w-md relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Buscar productos..."
                className="pl-9 bg-white/5 border-white/10 focus-visible:ring-fuchsia-500"
              />
            </div>
          )}

          <div className="flex items-center gap-2">
            {user ? (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="text-foreground hover:bg-white/10"
                  onClick={() => setView('dashboard')}
                >
                  <LayoutDashboard className="h-4 w-4 mr-2" />
                  Panel
                </Button>
                <Button variant="ghost" size="icon" onClick={logout} className="hover:bg-white/10">
                  <LogOut className="h-4 w-4" />
                </Button>
              </>
            ) : (
              <>
                <Button
                  variant="ghost"
                  size="sm"
                  className="hover:bg-white/10"
                  onClick={() => {
                    setAuthMode('login');
                    setAuthOpen(true);
                  }}
                >
                  Entrar
                </Button>
                <Button
                  size="sm"
                  className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-lg shadow-purple-500/30"
                  onClick={() => {
                    setAuthMode('register');
                    setAuthOpen(true);
                  }}
                >
                  Publicar Negocio
                </Button>
              </>
            )}
          </div>
        </div>
      </header>

      {/* MAIN */}
      <main className="relative">
        {view === 'home' && (
          <Home
            featured={featured}
            products={products}
            categories={categories}
            category={category}
            setCategory={setCategory}
            query={query}
            setQuery={setQuery}
            stats={stats}
            loading={loading}
            onProduct={openProduct}
            onBusiness={openBusiness}
            onRegister={() => {
              setAuthMode('register');
              setAuthOpen(true);
            }}
          />
        )}

        {view === 'product' && (
          <ProductDetail
            product={detail}
            onBack={() => setView('home')}
            onBusiness={openBusiness}
          />
        )}

        {view === 'business' && (
          <BusinessDetail
            data={bizDetail}
            onBack={() => setView('home')}
            onProduct={openProduct}
          />
        )}

        {view === 'dashboard' && user && (
          <Dashboard
            user={user}
            business={business}
            products={myProducts}
            onNew={openProductCreate}
            onEdit={openProductEdit}
            onDelete={deleteProduct}
            onPlan={() => setPlanOpen(true)}
          />
        )}
        {view === 'dashboard' && !user && (
          <div className="container mx-auto py-32 text-center">
            <p className="text-muted-foreground mb-4">Necesitas iniciar sesión</p>
            <Button
              onClick={() => {
                setAuthMode('login');
                setAuthOpen(true);
              }}
            >
              Entrar
            </Button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="relative mt-24 border-t border-white/10 bg-black/30 backdrop-blur-xl">
        <div className="container mx-auto px-4 py-10 text-sm text-muted-foreground flex flex-col md:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-2">
            <Zap className="h-4 w-4 text-fuchsia-400" />
            <span>UBIK2 YEMG © 2025 — Marketplace para MiPymes Cubanas y LATAM</span>
          </div>
          <div className="flex gap-4">
            <span>USDC</span>
            <span>•</span>
            <span>Transfermóvil</span>
            <span>•</span>
            <span>WhatsApp</span>
          </div>
        </div>
      </footer>

      {/* AUTH DIALOG */}
      <Dialog open={authOpen} onOpenChange={setAuthOpen}>
        <DialogContent className="bg-[#100628]/95 border-white/10 backdrop-blur-xl max-w-md">
          <DialogHeader>
            <DialogTitle className="text-2xl">
              {authMode === 'login' ? 'Bienvenido de vuelta' : 'Crea tu negocio'}
            </DialogTitle>
            <DialogDescription>
              {authMode === 'login'
                ? 'Accede a tu panel para gestionar tus productos.'
                : 'Publica tu negocio en minutos. Plan Básico gratis.'}
            </DialogDescription>
          </DialogHeader>

          <Tabs value={authMode} onValueChange={setAuthMode}>
            <TabsList className="grid grid-cols-2 bg-white/5">
              <TabsTrigger value="login">Entrar</TabsTrigger>
              <TabsTrigger value="register">Registrar Negocio</TabsTrigger>
            </TabsList>

            <form onSubmit={handleAuth} className="space-y-3 mt-4">
              <div>
                <Label>Email *</Label>
                <Input
                  type="email"
                  value={authForm.email}
                  onChange={(e) => setAuthForm({ ...authForm, email: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label>Contraseña *</Label>
                <Input
                  type="password"
                  value={authForm.password}
                  onChange={(e) => setAuthForm({ ...authForm, password: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>

              {authMode === 'register' && (
                <>
                  <div>
                    <Label>Nombre del negocio *</Label>
                    <Input
                      value={authForm.businessName}
                      onChange={(e) => setAuthForm({ ...authForm, businessName: e.target.value })}
                      required
                      placeholder="Ej: Sabores de La Habana"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div>
                    <Label>WhatsApp * (formato internacional)</Label>
                    <Input
                      value={authForm.whatsapp}
                      onChange={(e) => setAuthForm({ ...authForm, whatsapp: e.target.value })}
                      required
                      placeholder="+5355512345"
                      className="bg-white/5 border-white/10"
                    />
                  </div>
                  <div className="grid grid-cols-2 gap-2">
                    <div>
                      <Label>Ubicación</Label>
                      <Input
                        value={authForm.location}
                        onChange={(e) => setAuthForm({ ...authForm, location: e.target.value })}
                        placeholder="La Habana, Cuba"
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                    <div>
                      <Label>Logo (URL)</Label>
                      <Input
                        value={authForm.logo}
                        onChange={(e) => setAuthForm({ ...authForm, logo: e.target.value })}
                        placeholder="https://..."
                        className="bg-white/5 border-white/10"
                      />
                    </div>
                  </div>
                  <div>
                    <Label>Descripción</Label>
                    <Textarea
                      value={authForm.description}
                      onChange={(e) => setAuthForm({ ...authForm, description: e.target.value })}
                      placeholder="Cuéntanos sobre tu negocio..."
                      className="bg-white/5 border-white/10"
                      rows={2}
                    />
                  </div>
                </>
              )}

              <DialogFooter>
                <Button
                  type="submit"
                  className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
                >
                  {authMode === 'login' ? 'Entrar' : 'Crear cuenta'}
                </Button>
              </DialogFooter>
            </form>
          </Tabs>
        </DialogContent>
      </Dialog>

      {/* PRODUCT DIALOG */}
      <Dialog open={productOpen} onOpenChange={setProductOpen}>
        <DialogContent className="bg-[#100628]/95 border-white/10 backdrop-blur-xl max-w-lg">
          <DialogHeader>
            <DialogTitle>
              {editingProduct ? 'Editar producto' : 'Publicar nuevo producto'}
            </DialogTitle>
            <DialogDescription>
              Completa los datos para mostrar tu producto en el marketplace.
            </DialogDescription>
          </DialogHeader>
          <form onSubmit={submitProduct} className="space-y-3">
            <div>
              <Label>Nombre *</Label>
              <Input
                value={productForm.name}
                onChange={(e) => setProductForm({ ...productForm, name: e.target.value })}
                required
                className="bg-white/5 border-white/10"
              />
            </div>
            <div className="grid grid-cols-2 gap-2">
              <div>
                <Label>Precio USD *</Label>
                <Input
                  type="number"
                  step="0.01"
                  value={productForm.price}
                  onChange={(e) => setProductForm({ ...productForm, price: e.target.value })}
                  required
                  className="bg-white/5 border-white/10"
                />
              </div>
              <div>
                <Label>Stock</Label>
                <Input
                  type="number"
                  value={productForm.stock}
                  onChange={(e) => setProductForm({ ...productForm, stock: e.target.value })}
                  className="bg-white/5 border-white/10"
                />
              </div>
            </div>
            <div>
              <Label>Categoría *</Label>
              <Select
                value={productForm.category}
                onValueChange={(v) => setProductForm({ ...productForm, category: v })}
              >
                <SelectTrigger className="bg-white/5 border-white/10">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((c) => (
                    <SelectItem key={c.id} value={c.id}>
                      {c.icon} {c.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
            <div>
              <Label>Imagen (URL)</Label>
              <Input
                value={productForm.image}
                onChange={(e) => setProductForm({ ...productForm, image: e.target.value })}
                placeholder="https://images.unsplash.com/..."
                className="bg-white/5 border-white/10"
              />
            </div>
            <div>
              <Label>Descripción</Label>
              <Textarea
                value={productForm.description}
                onChange={(e) => setProductForm({ ...productForm, description: e.target.value })}
                rows={3}
                className="bg-white/5 border-white/10"
              />
            </div>

            {user?.plan === 'premium' && (
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={productForm.featured}
                  onChange={(e) =>
                    setProductForm({ ...productForm, featured: e.target.checked })
                  }
                />
                <Sparkles className="h-4 w-4 text-amber-400" />
                Producto destacado (Premium)
              </label>
            )}

            <DialogFooter>
              <Button
                type="submit"
                className="w-full bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
              >
                {editingProduct ? 'Guardar cambios' : 'Publicar producto'}
              </Button>
            </DialogFooter>
          </form>
        </DialogContent>
      </Dialog>

      {/* PLAN DIALOG */}
      <Dialog open={planOpen} onOpenChange={setPlanOpen}>
        <DialogContent className="bg-[#100628]/95 border-white/10 backdrop-blur-xl max-w-2xl">
          <DialogHeader>
            <DialogTitle className="text-2xl flex items-center gap-2">
              <Crown className="h-6 w-6 text-amber-400" /> Pásate a Premium
            </DialogTitle>
            <DialogDescription>
              Desbloquea todo el poder de UBIK2 YEMG.
            </DialogDescription>
          </DialogHeader>
          <div className="grid md:grid-cols-2 gap-4">
            <div className="rounded-xl border border-white/10 bg-white/5 p-5">
              <Badge variant="secondary">Plan Básico</Badge>
              <h3 className="text-2xl font-bold mt-2">Gratis</h3>
              <ul className="text-sm text-muted-foreground space-y-2 mt-4">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Hasta 10 productos
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Aparece en marketplace
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Botón WhatsApp directo
                </li>
                <li className="text-muted-foreground/60">• Con publicidad</li>
              </ul>
            </div>
            <div className="rounded-xl border border-fuchsia-500/40 bg-gradient-to-br from-fuchsia-500/10 to-purple-600/10 p-5 relative shadow-lg shadow-purple-500/20">
              <Badge className="bg-gradient-to-r from-fuchsia-500 to-purple-600">Premium</Badge>
              <h3 className="text-2xl font-bold mt-2">
                $9.99<span className="text-base text-muted-foreground">/mes</span>
              </h3>
              <ul className="text-sm space-y-2 mt-4">
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Productos ilimitados
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Destacar productos
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Sin publicidad
                </li>
                <li className="flex gap-2">
                  <Check className="h-4 w-4 text-green-400" /> Prioridad en búsquedas
                </li>
              </ul>
              <Button
                onClick={requestPremium}
                className="w-full mt-4 bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
              >
                Pagar con USDC / Transfermóvil
              </Button>
              <p className="text-xs text-muted-foreground mt-2">
                Un administrador revisará tu pago manualmente.
              </p>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

// === HOME ===
const Home = ({
  featured,
  products,
  categories,
  category,
  setCategory,
  query,
  setQuery,
  stats,
  loading,
  onProduct,
  onBusiness,
  onRegister,
}) => {
  return (
    <>
      {/* HERO */}
      <section className="container mx-auto px-4 pt-12 md:pt-20 pb-12 relative">
        <div className="grid md:grid-cols-2 gap-10 items-center">
          <div>
            <Badge className="bg-fuchsia-500/15 text-fuchsia-300 border border-fuchsia-500/30 hover:bg-fuchsia-500/20">
              <Sparkles className="h-3 w-3 mr-1" /> Nuevo en Cuba & LATAM
            </Badge>
            <h1 className="text-4xl md:text-6xl font-extrabold mt-4 leading-tight tracking-tight">
              El{' '}
              <span className="bg-gradient-to-r from-fuchsia-400 via-purple-400 to-blue-400 bg-clip-text text-transparent">
                marketplace
              </span>{' '}
              que tu MiPyme necesita
            </h1>
            <p className="text-muted-foreground mt-5 text-lg max-w-xl">
              Publica tus productos, llega a más clientes y vende por WhatsApp.
              Sin comisiones, sin complicaciones.
            </p>
            <div className="flex flex-wrap gap-3 mt-7">
              <Button
                size="lg"
                onClick={onRegister}
                className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700 shadow-xl shadow-purple-500/30"
              >
                <Store className="h-5 w-5 mr-2" />
                Publica tu negocio gratis
              </Button>
              <Button
                size="lg"
                variant="outline"
                className="border-white/20 bg-white/5 hover:bg-white/10"
                onClick={() => document.getElementById('explore')?.scrollIntoView({ behavior: 'smooth' })}
              >
                Explorar productos
              </Button>
            </div>

            <div className="grid grid-cols-3 gap-3 mt-10 max-w-md">
              {[
                { v: stats.productsCount || 0, l: 'Productos' },
                { v: stats.businessesCount || 0, l: 'Negocios' },
                { v: stats.usersCount || 0, l: 'Vendedores' },
              ].map((s, i) => (
                <div
                  key={i}
                  className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 text-center"
                >
                  <div className="text-2xl font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
                    {s.v}+
                  </div>
                  <div className="text-xs text-muted-foreground mt-1">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative">
            <div className="absolute -inset-4 bg-gradient-to-r from-fuchsia-500/30 to-purple-600/30 rounded-3xl blur-2xl" />
            <div className="relative rounded-3xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
              <img
                src="https://images.unsplash.com/photo-1674027392887-751d6396b710?crop=entropy&cs=srgb&fm=jpg&ixid=M3w4NTYxODl8MHwxfHNlYXJjaHwxfHxtYXJrZXRwbGFjZSUyMHNob3BwaW5nfGVufDB8fHx8MTc3ODc4Mzg4OHww&ixlib=rb-4.1.0&q=85"
                alt="UBIK2 YEMG"
                className="w-full h-[420px] object-cover"
              />
              <div className="absolute bottom-4 left-4 right-4 rounded-xl border border-white/20 bg-black/40 backdrop-blur-xl p-3 flex items-center gap-3">
                <div className="h-10 w-10 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                  <ShoppingBag className="h-5 w-5 text-white" />
                </div>
                <div className="flex-1">
                  <div className="text-sm font-semibold">Compra directa por WhatsApp</div>
                  <div className="text-xs text-muted-foreground">Sin intermediarios</div>
                </div>
                <Badge className="bg-green-500/20 text-green-300 border-green-500/30">
                  En vivo
                </Badge>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* MOBILE SEARCH */}
      <section className="container mx-auto px-4 mb-6 md:hidden">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Buscar productos..."
            className="pl-9 bg-white/5 border-white/10"
          />
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="container mx-auto px-4 mb-12" id="explore">
        <h2 className="text-2xl font-bold mb-4">Categorías</h2>
        <div className="grid grid-cols-2 sm:grid-cols-4 lg:grid-cols-8 gap-3">
          <button
            onClick={() => setCategory('')}
            className={`rounded-xl p-4 text-center border transition-all backdrop-blur-md ${
              category === ''
                ? 'border-fuchsia-500 bg-fuchsia-500/15 shadow-lg shadow-fuchsia-500/20'
                : 'border-white/10 bg-white/5 hover:bg-white/10'
            }`}
          >
            <div className="text-2xl">✨</div>
            <div className="text-xs mt-1">Todas</div>
          </button>
          {categories.map((c) => (
            <button
              key={c.id}
              onClick={() => setCategory(c.id)}
              className={`rounded-xl p-4 text-center border transition-all backdrop-blur-md ${
                category === c.id
                  ? 'border-fuchsia-500 bg-fuchsia-500/15 shadow-lg shadow-fuchsia-500/20'
                  : 'border-white/10 bg-white/5 hover:bg-white/10'
              }`}
            >
              <div className="text-2xl">{c.icon}</div>
              <div className="text-xs mt-1">{c.name}</div>
            </button>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      {featured?.length > 0 && (
        <section className="container mx-auto px-4 mb-12">
          <h2 className="text-2xl font-bold mb-4 flex items-center gap-2">
            <Sparkles className="h-6 w-6 text-amber-400" /> Destacados
          </h2>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {featured.slice(0, 8).map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => onProduct(p.id)} highlight />
            ))}
          </div>
        </section>
      )}

      {/* ALL PRODUCTS */}
      <section className="container mx-auto px-4 mb-20">
        <h2 className="text-2xl font-bold mb-4">
          {category ? categories.find((c) => c.id === category)?.name : 'Todos los productos'}
        </h2>
        {loading ? (
          <div className="flex justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-fuchsia-400" />
          </div>
        ) : products.length === 0 ? (
          <p className="text-muted-foreground text-center py-12">No se encontraron productos.</p>
        ) : (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
            {products.map((p) => (
              <ProductCard key={p.id} p={p} onClick={() => onProduct(p.id)} />
            ))}
          </div>
        )}
      </section>
    </>
  );
};

// === PRODUCT CARD ===
const ProductCard = ({ p, onClick, highlight }) => {
  return (
    <Card
      onClick={onClick}
      className={`overflow-hidden cursor-pointer group bg-white/5 backdrop-blur-md border-white/10 hover:border-fuchsia-500/50 hover:bg-white/10 transition-all hover:shadow-xl hover:shadow-fuchsia-500/10 ${
        highlight ? 'ring-1 ring-amber-400/30' : ''
      }`}
    >
      <div className="relative aspect-square overflow-hidden bg-black/40">
        {p.image ? (
          <img
            src={p.image}
            alt={p.name}
            className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center text-muted-foreground">
            <ShoppingBag className="h-10 w-10" />
          </div>
        )}
        {p.featured && (
          <Badge className="absolute top-2 left-2 bg-amber-500/90 border-0 text-black">
            <Sparkles className="h-3 w-3 mr-1" /> Destacado
          </Badge>
        )}
      </div>
      <CardContent className="p-3">
        <div className="text-sm font-semibold truncate">{p.name}</div>
        <div className="text-xs text-muted-foreground truncate">{p.business?.name}</div>
        <div className="mt-2 flex items-center justify-between">
          <span className="text-lg font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent">
            {formatPrice(p.price)}
          </span>
          {p.stock > 0 ? (
            <Badge variant="outline" className="text-[10px] border-green-500/40 text-green-400">
              En stock
            </Badge>
          ) : (
            <Badge variant="outline" className="text-[10px] border-red-500/40 text-red-400">
              Agotado
            </Badge>
          )}
        </div>
      </CardContent>
    </Card>
  );
};

// === PRODUCT DETAIL ===
const ProductDetail = ({ product, onBack, onBusiness }) => {
  if (!product) {
    return (
      <div className="container mx-auto py-32 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-400" />
      </div>
    );
  }
  const wa = (product.business?.whatsapp || '').replace(/[^0-9+]/g, '');
  const waMsg = encodeURIComponent(
    `¡Hola! Vi tu producto "${product.name}" en UBIK2 YEMG. ¿Sigue disponible?`
  );
  const waLink = `https://wa.me/${wa.replace('+', '')}?text=${waMsg}`;

  return (
    <section className="container mx-auto px-4 pt-8 pb-20">
      <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white/10">
        <ArrowLeft className="h-4 w-4 mr-2" /> Volver
      </Button>
      <div className="grid md:grid-cols-2 gap-10">
        <div className="rounded-2xl overflow-hidden border border-white/10 bg-white/5 backdrop-blur-xl">
          <img
            src={product.image || 'https://placehold.co/600x600?text=Sin+imagen'}
            alt={product.name}
            className="w-full aspect-square object-cover"
          />
        </div>
        <div>
          {product.featured && (
            <Badge className="bg-amber-500/90 text-black border-0 mb-2">
              <Sparkles className="h-3 w-3 mr-1" /> Producto destacado
            </Badge>
          )}
          <h1 className="text-3xl md:text-4xl font-bold">{product.name}</h1>
          <div className="text-3xl font-bold bg-gradient-to-r from-fuchsia-300 to-purple-300 bg-clip-text text-transparent mt-3">
            {formatPrice(product.price)}
          </div>
          <p className="text-muted-foreground mt-4 leading-relaxed">{product.description}</p>

          <div className="flex flex-wrap gap-2 mt-5">
            <Badge variant="outline" className="border-white/20 bg-white/5">
              Stock: {product.stock}
            </Badge>
            <Badge variant="outline" className="border-white/20 bg-white/5">
              {product.category}
            </Badge>
          </div>

          {/* Business card */}
          {product.business && (
            <div
              className="mt-6 rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-4 flex items-center gap-3 cursor-pointer hover:bg-white/10"
              onClick={() => onBusiness(product.business.id)}
            >
              {product.business.logo ? (
                <img
                  src={product.business.logo}
                  alt=""
                  className="h-12 w-12 rounded-full object-cover border border-white/20"
                />
              ) : (
                <div className="h-12 w-12 rounded-full bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
                  <Store className="h-5 w-5" />
                </div>
              )}
              <div className="flex-1">
                <div className="font-semibold">{product.business.name}</div>
                <div className="text-xs text-muted-foreground flex items-center gap-1">
                  <MapPin className="h-3 w-3" /> {product.business.location || 'Cuba'}
                </div>
              </div>
              <Badge variant="outline" className="border-white/20">
                Ver tienda
              </Badge>
            </div>
          )}

          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center justify-center gap-2 w-full h-14 rounded-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-xl shadow-green-500/30 transition-all"
          >
            <MessageCircle className="h-5 w-5" />
            Contactar por WhatsApp
          </a>
        </div>
      </div>
    </section>
  );
};

// === BUSINESS DETAIL ===
const BusinessDetail = ({ data, onBack, onProduct }) => {
  if (!data) {
    return (
      <div className="container mx-auto py-32 flex justify-center">
        <Loader2 className="h-8 w-8 animate-spin text-fuchsia-400" />
      </div>
    );
  }
  const { business, products } = data;
  const wa = (business.whatsapp || '').replace(/[^0-9+]/g, '');
  const waLink = `https://wa.me/${wa.replace('+', '')}`;
  return (
    <section className="container mx-auto px-4 pt-8 pb-20">
      <Button variant="ghost" onClick={onBack} className="mb-6 hover:bg-white/10">
        <ArrowLeft className="h-4 w-4 mr-2" /> Volver
      </Button>
      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl p-6 md:p-8 flex flex-col md:flex-row items-start gap-6">
        {business.logo ? (
          <img
            src={business.logo}
            alt=""
            className="h-24 w-24 rounded-2xl object-cover border border-white/20"
          />
        ) : (
          <div className="h-24 w-24 rounded-2xl bg-gradient-to-br from-fuchsia-500 to-purple-600 flex items-center justify-center">
            <Store className="h-10 w-10" />
          </div>
        )}
        <div className="flex-1">
          <h1 className="text-3xl font-bold">{business.name}</h1>
          <p className="text-muted-foreground mt-1">{business.description}</p>
          <div className="flex flex-wrap gap-3 mt-3 text-sm text-muted-foreground">
            {business.location && (
              <span className="flex items-center gap-1">
                <MapPin className="h-4 w-4" /> {business.location}
              </span>
            )}
            {business.instagram && (
              <span className="flex items-center gap-1">
                <Instagram className="h-4 w-4" /> {business.instagram}
              </span>
            )}
            {business.facebook && (
              <span className="flex items-center gap-1">
                <Facebook className="h-4 w-4" /> {business.facebook}
              </span>
            )}
          </div>
          <a
            href={waLink}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-4 inline-flex items-center gap-2 px-5 h-11 rounded-lg bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white font-semibold shadow-lg shadow-green-500/30"
          >
            <MessageCircle className="h-4 w-4" /> Contactar
          </a>
        </div>
      </div>

      <h2 className="text-2xl font-bold mt-10 mb-4">Productos del negocio</h2>
      {products.length === 0 ? (
        <p className="text-muted-foreground">Este negocio aún no tiene productos.</p>
      ) : (
        <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4">
          {products.map((p) => (
            <ProductCard
              key={p.id}
              p={{ ...p, business }}
              onClick={() => onProduct(p.id)}
            />
          ))}
        </div>
      )}
    </section>
  );
};

// === DASHBOARD ===
const Dashboard = ({ user, business, products, onNew, onEdit, onDelete, onPlan }) => {
  const isPremium = user.plan === 'premium';
  const limit = isPremium ? '∞' : `${products.length}/10`;
  return (
    <section className="container mx-auto px-4 pt-10 pb-20">
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
        <div>
          <h1 className="text-3xl font-bold">Panel de {business?.name || 'tu negocio'}</h1>
          <p className="text-muted-foreground">Gestiona tu catálogo y suscripción.</p>
        </div>
        <div className="flex gap-2">
          <Button
            variant="outline"
            className="border-white/20 bg-white/5 hover:bg-white/10"
            onClick={onPlan}
          >
            <Crown className="h-4 w-4 mr-2 text-amber-400" />
            {isPremium ? 'Premium activo' : 'Mejorar plan'}
          </Button>
          <Button
            onClick={onNew}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Nuevo producto
          </Button>
        </div>
      </div>

      <div className="grid sm:grid-cols-3 gap-4 mb-8">
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <div className="text-sm text-muted-foreground">Productos</div>
          <div className="text-2xl font-bold mt-1">{limit}</div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <div className="text-sm text-muted-foreground">Plan</div>
          <div className="text-2xl font-bold mt-1 capitalize flex items-center gap-2">
            {user.plan}
            {isPremium && <Crown className="h-5 w-5 text-amber-400" />}
          </div>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/5 backdrop-blur-md p-5">
          <div className="text-sm text-muted-foreground">WhatsApp</div>
          <div className="text-lg font-bold mt-1">{business?.whatsapp || '—'}</div>
        </div>
      </div>

      <h2 className="text-xl font-bold mb-4">Tus productos</h2>
      {products.length === 0 ? (
        <div className="rounded-xl border border-dashed border-white/20 p-12 text-center bg-white/5 backdrop-blur-md">
          <ShoppingBag className="h-10 w-10 mx-auto text-muted-foreground mb-3" />
          <p className="text-muted-foreground mb-4">Aún no tienes productos publicados.</p>
          <Button
            onClick={onNew}
            className="bg-gradient-to-r from-fuchsia-500 to-purple-600 hover:from-fuchsia-600 hover:to-purple-700"
          >
            <Plus className="h-4 w-4 mr-2" /> Publica el primero
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {products.map((p) => (
            <Card key={p.id} className="bg-white/5 backdrop-blur-md border-white/10 overflow-hidden">
              <div className="aspect-video bg-black/40 overflow-hidden">
                {p.image ? (
                  <img src={p.image} alt={p.name} className="w-full h-full object-cover" />
                ) : (
                  <div className="w-full h-full flex items-center justify-center text-muted-foreground">
                    <ShoppingBag className="h-10 w-10" />
                  </div>
                )}
              </div>
              <CardContent className="p-4">
                <div className="flex items-start justify-between">
                  <div>
                    <div className="font-semibold">{p.name}</div>
                    <div className="text-sm text-muted-foreground">
                      {formatPrice(p.price)} · Stock {p.stock}
                    </div>
                  </div>
                  {p.featured && (
                    <Badge className="bg-amber-500/90 text-black border-0">
                      <Sparkles className="h-3 w-3" />
                    </Badge>
                  )}
                </div>
                <div className="flex gap-2 mt-3">
                  <Button
                    size="sm"
                    variant="outline"
                    className="flex-1 border-white/20 bg-white/5 hover:bg-white/10"
                    onClick={() => onEdit(p)}
                  >
                    <Pencil className="h-3 w-3 mr-1" /> Editar
                  </Button>
                  <Button
                    size="sm"
                    variant="outline"
                    className="border-red-500/40 text-red-400 hover:bg-red-500/10"
                    onClick={() => onDelete(p.id)}
                  >
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

export default App;
