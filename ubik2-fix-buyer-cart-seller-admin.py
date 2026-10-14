#!/usr/bin/env python3
from pathlib import Path
from datetime import datetime
import shutil, subprocess, sys
ROOT = Path.home() / 'UBIK2yemg' / 'UBIK2yemg'
if not ROOT.is_dir():
    sys.exit(f'No encuentro el repositorio: {ROOT}')
branch = subprocess.run(['git','-C',str(ROOT),'branch','--show-current'],capture_output=True,text=True).stdout.strip()
if branch != 'fix/orders-crypto-email':
    sys.exit(f'ABORTADO: rama actual {branch!r}; cambia a fix/orders-crypto-email. No se modificó nada.')
api_path = ROOT / 'app/api/[[...path]]/route.js'
page_path = ROOT / 'app/page.js'
api, page = api_path.read_text(), page_path.read_text()
original_api, original_page = api, page

def once(text, old, new, label):
    count = text.count(old)
    if count != 1:
        raise RuntimeError(f'{label}: esperaba 1 coincidencia, encontré {count}. No se escribieron archivos.')
    return text.replace(old,new,1)

api = once(api, """async function requireUser(request) {
  const tok = getUserFromToken(request);
  if (!tok) return { error: json({ error: 'No autorizado' }, 401) };
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: tok.id });
  if (!user) return { error: json({ error: 'Usuario no encontrado' }, 401) };
  return { user };
}

async function requireAdmin(request) {
  const r = await requireUser(request);
  if (r.error) return r;
  if (r.user.role !== 'admin') return { error: json({ error: 'Solo administradores' }, 403) };
  return r;
}""", """function isConfiguredAdmin(user) {
  const configuredEmail = (process.env.ADMIN_EMAIL || '').trim().toLowerCase();
  return Boolean(configuredEmail && user?.email?.trim().toLowerCase() === configuredEmail);
}

async function requireUser(request) {
  const tok = getUserFromToken(request);
  if (!tok) return { error: json({ error: 'No autorizado' }, 401) };
  const db = await getDb();
  const user = await db.collection('users').findOne({ id: tok.id });
  if (!user) return { error: json({ error: 'Usuario no encontrado' }, 401) };
  // ADMIN_EMAIL is a server-side allowlist; normal password authentication is still required.
  return { user: isConfiguredAdmin(user) ? { ...user, role: 'admin' } : user };
}

async function requireAdmin(request) {
  const r = await requireUser(request);
  if (r.error) return r;
  if (r.user.role !== 'admin') return { error: json({ error: 'Solo administradores' }, 403) };
  return r;
}""", 'autorización admin')
api = once(api, """      const token = jwt.sign({ id: user.id, email: user.email, role: user.role }, JWT_SECRET, { expiresIn: '30d' });
      const { password: _, ...userOut } = user;
      return json({ token, user: userOut, business });""", """      const effectiveUser = isConfiguredAdmin(user) ? { ...user, role: 'admin' } : user;
      const token = jwt.sign({ id: effectiveUser.id, email: effectiveUser.email, role: effectiveUser.role }, JWT_SECRET, { expiresIn: '30d' });
      const { password: _, ...userOut } = effectiveUser;
      return json({ token, user: userOut, business });""", 'rol admin login')
api = once(api, """      const business = user.businessId ? await db.collection('businesses').findOne({ id: user.businessId }) : null;
      const { password: _, ...userOut } = user;
      return json({ user: userOut, business });""", """      const business = user.businessId ? await db.collection('businesses').findOne({ id: user.businessId }) : null;
      const effectiveUser = isConfiguredAdmin(user) ? { ...user, role: 'admin' } : user;
      const { password: _, ...userOut } = effectiveUser;
      return json({ user: userOut, business });""", 'rol admin /auth/me')
api = once(api, """      const body = await request.json();
      const parsed = businessSchema.safeParse(body);
      if (!parsed.success) {
        return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
      }
      const { businessName, whatsapp, location, description, logo, telegram, sms, instagram, facebook, businessType, country } = parsed.data;""", """      const body = await request.json();
      // The upgrade form sends businessName but businessSchema requires name.
      const parsed = businessSchema.safeParse({ ...body, name: body?.name || body?.businessName });
      if (!parsed.success) {
        return json({ error: 'Datos inválidos', details: parsed.error.flatten().fieldErrors }, 400);
      }
      const { name: businessName, whatsapp, location, description, logo, telegram, sms, instagram, facebook, businessType, country } = parsed.data;""", 'conversión comprador-vendedor')
api = once(api, """      await db.collection('crypto_invoices').insertOne(invoice);

      // Update order with payment reference
      await db.collection('orders').updateOne(
        { id: order.id },
        { $set: { paymentMethod: 'crypto', cryptoInvoiceId: invoice.id } }
      );
    }

    await db.collection('orders').insertOne(order);""", """      await db.collection('crypto_invoices').insertOne(invoice);

      // Save the invoice reference before inserting the order; updating before insert lost it.
      order.paymentMethod = 'crypto';
      order.cryptoInvoiceId = invoice.id;
    }

    await db.collection('orders').insertOne(order);""", 'referencia de factura crypto')

page = once(page, """  const [dark, setDark] = useState(false);
  const [favorites, setFavorites] = useState([]);""", """  const [dark, setDark] = useState(false);
  const [favorites, setFavorites] = useState([]);
  const [cart, setCart] = useState([]);""", 'estado carrito')
page = once(page, """    try {
      const fav = JSON.parse(localStorage.getItem('ubik2_favs') || '[]');
      setFavorites(Array.isArray(fav) ? fav : []);
    } catch {}""", """    try {
      const fav = JSON.parse(localStorage.getItem('ubik2_favs') || '[]');
      setFavorites(Array.isArray(fav) ? fav : []);
    } catch {}
    try {
      const savedCart = JSON.parse(localStorage.getItem('ubik2_cart') || '[]');
      setCart(Array.isArray(savedCart) ? savedCart.filter((item) => item?.product?.id && Number(item.quantity) > 0) : []);
    } catch { setCart([]); }""", 'restaurar carrito')
page = once(page, """  const startCryptoCheckout = async (product) => {
    if (!token) {
      toast.error('Debes iniciar sesión para comprar');
      setAuthMode('login');
      setAuthOpen(true);
      return;
    }

    if (!product.stock || product.stock <= 0) {
      return toast.error('Producto sin stock');
    }

    setCheckoutSubmitting(true);
    try {
      // First fetch crypto config if not loaded
      if (!cryptoConfig) {
        await fetchCryptoConfig();
      }

      // For now, default to first available network (user can change in UI later)
      // In a more advanced version, show a modal to select network
      const config = cryptoConfig || await fetchCryptoConfig();
      if (!config?.enabled?.length) {
        return toast.error('No hay redes crypto configuradas');
      }

      const selectedNetwork = config.enabled[0]; // TODO: let user choose

      // Create order with crypto payment
      const orderRes = await api('/orders', {
        method: 'POST',
        token,
        body: {
          items: [{ productId: product.id, quantity: 1 }],
          shippingName: user.name || '',
          shippingPhone: 'N/A', // Pago crypto sin envío físico
          shippingAddress: 'Pago crypto - Sin envío físico',
          shippingNotes: 'Pago con ' + selectedNetwork.currency + ' ' + selectedNetwork.network,
          paymentMethod: 'crypto',
          cryptoCurrency: selectedNetwork.currency,
          cryptoNetwork: selectedNetwork.network,
        },
      });

      setCheckoutOrder(orderRes.order);
      setCheckoutInvoice(orderRes.invoice);
      setView('checkout');
    } catch (err) {
      toast.error('Error creando pedido: ' + err.message);
    } finally {
      setCheckoutSubmitting(false);
    }
  };""", """  const saveCart = (nextCart) => {
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
      const config = cryptoConfig || await fetchCryptoConfig();
      if (!config?.enabled?.length) return toast.error('No hay redes crypto configuradas');
      const selectedNetwork = config.enabled[0];
      const orderRes = await api('/orders', {
        method: 'POST', token,
        body: {
          items: checkoutItems.map(({ product, quantity }) => ({ productId: product.id, quantity })),
          shippingName: user?.name || user?.email || 'Comprador',
          shippingPhone: user?.whatsapp || 'N/A',
          shippingAddress: 'Pago crypto - confirmar entrega con la tienda',
          shippingNotes: 'Pago con ' + selectedNetwork.currency + ' ' + selectedNetwork.network,
          paymentMethod: 'crypto', cryptoCurrency: selectedNetwork.currency, cryptoNetwork: selectedNetwork.network,
        },
      });
      setCheckoutOrder(orderRes.order); setCheckoutInvoice(orderRes.invoice);
      if (Array.isArray(productOrItems)) saveCart([]);
      setView('checkout');
    } catch (err) { toast.error('Error creando pedido: ' + err.message); }
    finally { setCheckoutSubmitting(false); }
  };""", 'checkout carrito')
page = once(page, """        user={user} business={business} onLogout={logout}""", """        user={user} business={business} onLogout={logout}
        cartCount={cart.reduce((sum, item) => sum + (Number(item.quantity) || 0), 0)}""", 'contador carrito')
page = once(page, """            startCryptoCheckout={startCryptoCheckout}
            checkoutSubmitting={checkoutSubmitting}""", """            startCryptoCheckout={startCryptoCheckout}
            onAddToCart={addToCart}
            checkoutSubmitting={checkoutSubmitting}""", 'prop añadir al carrito')
page = once(page, """        {view === 'favorites' && (
          <FavoritesView""", """        {view === 'cart' && <CartView items={cart} onBack={() => setView('home')} onUpdateQuantity={updateCartQuantity} onRemove={removeFromCart} onCheckout={startCryptoCheckout} submitting={checkoutSubmitting} />}

        {view === 'favorites' && (
          <FavoritesView""", 'vista carrito')
page = once(page, """        {view === 'dashboard' && user && !business && (
          <BuyerDashboard user={user} token={token} onBecomeSeller={() => setUpgradeOpen(true)} onFavorites={() => setView('favorites')} favoritesCount={favorites.length} />
        )}""", """        {view === 'dashboard' && user && !business && (
          <BuyerDashboard user={user} token={token} showBecomeSeller onBecomeSeller={() => setUpgradeOpen(true)} onFavorites={() => setView('favorites')} favoritesCount={favorites.length} />
        )}
        {view === 'buyer-orders' && user && (
          <BuyerDashboard user={user} token={token} showBecomeSeller={!business} onBecomeSeller={() => setUpgradeOpen(true)} onFavorites={() => setView('favorites')} favoritesCount={favorites.length} />
        )}""", 'historial comprador-vendedor')
page = once(page, """const Header = ({ t, lang, setLang, dark, setDark, user, business, onLogout, onLogin, onRegister, onPublish, onUpgradeSeller, searchInput, setSearchInput, onSearch, setView, favorites, dataSaver, setDataSaver, suggestions, suggestOpen, setSuggestOpen, suggestLoading, onSuggestionClick }) => {""", """const Header = ({ t, lang, setLang, dark, setDark, user, business, onLogout, onLogin, onRegister, onPublish, onUpgradeSeller, searchInput, setSearchInput, onSearch, setView, favorites, cartCount = 0, dataSaver, setDataSaver, suggestions, suggestOpen, setSuggestOpen, suggestLoading, onSuggestionClick }) => {""", 'prop cabecera carrito')
page = once(page, """        </Button>

        {/* Data saver toggle (ahorro de datos para conexiones lentas) */}""", """        </Button>
        <Button variant="ghost" size="icon" onClick={() => setView('cart')} className="relative" aria-label="Abrir carrito" title="Carrito de compras">
          <ShoppingBag className="h-5 w-5" />
          {cartCount > 0 && <span className="absolute -top-1 -right-1 bg-amber-500 text-white text-[9px] rounded-full h-4 min-w-4 px-1 flex items-center justify-center font-bold">{cartCount}</span>}
        </Button>

        {/* Data saver toggle (ahorro de datos para conexiones lentas) */}""", 'botón carrito')
page = once(page, """              {isBuyer && (
                <DropdownMenuItem onClick={onUpgradeSeller} className="text-[#00A86B] font-semibold">
                  <Store className="h-4 w-4 mr-2" /> Hazte vendedor
                </DropdownMenuItem>
              )}
              {user.role === 'admin' && (""", """              {isBuyer && (
                <DropdownMenuItem onClick={onUpgradeSeller} className="text-[#00A86B] font-semibold">
                  <Store className="h-4 w-4 mr-2" /> Hazte vendedor
                </DropdownMenuItem>
              )}
              <DropdownMenuItem onClick={() => setView('buyer-orders')}>
                <ShoppingBag className="h-4 w-4 mr-2" /> Mis compras y facturas
              </DropdownMenuItem>
              {user.role === 'admin' && (""", 'menú compras y facturas')
page = once(page, """const ProductDetail = ({ t, product, onBack, onBusiness, favorites, toggleFav, onShare, onReport, token, isLogged, onLoginNeeded, startCryptoCheckout, checkoutSubmitting }) => {""", """const ProductDetail = ({ t, product, onBack, onBusiness, favorites, toggleFav, onShare, onReport, token, isLogged, onLoginNeeded, startCryptoCheckout, onAddToCart, checkoutSubmitting }) => {""", 'prop ProductDetail')
page = once(page, """                {/* Crypto Buy Button */}
                {product.stock && product.stock > 0 && (
                  <Button
                    onClick={() => startCryptoCheckout(product)}""", """                {product.stock && product.stock > 0 && (
                  <Button onClick={() => onAddToCart?.(product)} className="w-full h-12 rounded-xl mt-3 border border-[#00A86B] text-[#00A86B] font-bold" variant="outline">
                    <ShoppingBag className="h-5 w-5 mr-2" /> Añadir al carrito
                  </Button>
                )}

                {/* Crypto Buy Button */}
                {product.stock && product.stock > 0 && (
                  <Button
                    onClick={() => startCryptoCheckout(product)}""", 'botón añadir carrito')
page = once(page, """const BuyerDashboard = ({ user, token, onBecomeSeller, onFavorites, favoritesCount }) => {""", """const BuyerDashboard = ({ user, token, showBecomeSeller = false, onBecomeSeller, onFavorites, favoritesCount }) => {""", 'dashboard reutilizable')
page = once(page, """      <Card className="overflow-hidden border-0 shadow-xl mb-6 brand-gradient text-white">
        <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
          <div>
            <Badge className="bg-white/20 text-white border-0 mb-2">Plan PRO</Badge>
            <h2 className="text-2xl md:text-3xl font-extrabold">¿Tienes algo para vender?</h2>
            <p className="text-white/90 mt-1 max-w-lg">
              Conviértete en vendedor gratis y publica hasta 10 productos.
            </p>
          </div>
          <Button
            size="lg"
            onClick={onBecomeSeller}
            className="bg-white text-[#1565C0] hover:bg-white/90 font-bold h-12 px-6"
          >
            <Store className="h-5 w-5 mr-2" /> Hazte vendedor
          </Button>
        </CardContent>
      </Card>""", """      {showBecomeSeller && (
        <Card className="overflow-hidden border-0 shadow-xl mb-6 brand-gradient text-white">
          <CardContent className="p-6 md:p-8 flex flex-col md:flex-row items-center justify-between gap-4">
            <div><Badge className="bg-white/20 text-white border-0 mb-2">Plan PRO</Badge><h2 className="text-2xl md:text-3xl font-extrabold">¿Tienes algo para vender?</h2><p className="text-white/90 mt-1 max-w-lg">Conviértete en vendedor gratis y publica hasta 10 productos.</p></div>
            <Button size="lg" onClick={onBecomeSeller} className="bg-white text-[#1565C0] hover:bg-white/90 font-bold h-12 px-6"><Store className="h-5 w-5 mr-2" /> Hazte vendedor</Button>
          </CardContent>
        </Card>
      )}""", 'promo solo comprador')
page = once(page, """// ============ BUYER DASHBOARD ============
const BuyerDashboard =""", """// ============ SHOPPING CART ============
const CartView = ({ items, onBack, onUpdateQuantity, onRemove, onCheckout, submitting }) => {
  const total = items.reduce((sum, item) => sum + (Number(item.product?.price) || 0) * item.quantity, 0);
  return (
    <section className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="flex items-center justify-between gap-3 mb-6"><div><h1 className="text-3xl font-extrabold">Mi carrito</h1><p className="text-muted-foreground">Revisa tus productos antes de pagar.</p></div><Button variant="outline" onClick={onBack}>Seguir comprando</Button></div>
      {!items.length ? <Card><CardContent className="p-10 text-center"><ShoppingBag className="h-12 w-12 mx-auto mb-3 text-muted-foreground"/><h2 className="text-xl font-bold mb-2">Tu carrito está vacío</h2><p className="text-muted-foreground mb-4">Abre un producto y pulsa «Añadir al carrito».</p><Button onClick={onBack}>Ver productos</Button></CardContent></Card> : <>
        <div className="space-y-3">{items.map(({ product, quantity }) => <Card key={product.id}><CardContent className="p-4 flex items-center gap-3">
          {product.image ? <img src={product.image} alt={product.name || 'Producto'} className="w-20 h-20 rounded-lg object-cover bg-muted"/> : <div className="w-20 h-20 rounded-lg bg-muted flex items-center justify-center"><ShoppingBag className="h-7 w-7"/></div>}
          <div className="flex-1 min-w-0"><div className="font-bold truncate">{product.name || 'Producto'}</div><div className="text-sm text-muted-foreground">{product.price} {product.currency || 'CUP'} c/u</div><div className="flex items-center gap-2 mt-2"><Button size="sm" variant="outline" onClick={() => quantity <= 1 ? onRemove(product.id) : onUpdateQuantity(product.id, quantity - 1)}>−</Button><span>{quantity}</span><Button size="sm" variant="outline" onClick={() => onUpdateQuantity(product.id, quantity + 1)} disabled={quantity >= (Number(product.stock) || 99)}>+</Button><Button size="sm" variant="ghost" className="text-destructive" onClick={() => onRemove(product.id)}><Trash2 className="h-4 w-4 mr-1"/>Quitar</Button></div></div>
          <div className="font-bold whitespace-nowrap">{((Number(product.price) || 0) * quantity).toLocaleString('es-ES')} {product.currency || 'CUP'}</div>
        </CardContent></Card>)}</div>
        <Card className="mt-5"><CardContent className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4"><div><div className="text-sm text-muted-foreground">Subtotal estimado</div><div className="text-2xl font-extrabold">{total.toLocaleString('es-ES')} CUP</div><p className="text-xs text-muted-foreground mt-1">El servidor calcula el importe definitivo al crear el pedido.</p></div><Button size="lg" disabled={submitting} onClick={() => onCheckout(items)} className="brand-gradient text-white font-bold">{submitting ? <Loader2 className="h-4 w-4 mr-2 animate-spin"/> : <CreditCard className="h-4 w-4 mr-2"/>}Pagar carrito con crypto</Button></CardContent></Card>
      </>}
    </section>
  );
};

// ============ BUYER DASHBOARD ============
const BuyerDashboard =""", 'componente carrito')

if api == original_api or page == original_page:
    sys.exit('No se detectaron cambios; no se escribió nada.')
stamp = datetime.now().strftime('%Y%m%d-%H%M%S')
for src in (api_path,page_path):
    shutil.copy2(src, src.with_name(src.name + f'.before-cart-seller-admin-{stamp}'))
api_path.write_text(api)
page_path.write_text(page)
print('Cambios aplicados en fix/orders-crypto-email.')
print(f'Copias de seguridad creadas con sufijo .before-cart-seller-admin-{stamp}')
print('Archivos modificados: app/api/[[...path]]/route.js y app/page.js')
print('No se hizo commit ni push automáticamente.')
