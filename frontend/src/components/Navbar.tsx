import { useEffect, useState } from 'react';
import { Link, useLocation, useNavigate } from 'react-router-dom';
import { FiSearch, FiShoppingCart, FiChevronDown, FiUser, FiLogOut, FiPackage, FiGrid, FiSettings, FiMenu } from 'react-icons/fi';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuth } from '../context/authStore';
import { useCart } from '../context/cartStore';
import { api } from '../lib/api';
import { usePreferences } from '../context/preferencesStore';

const CAT_STRIP = [
  { name: 'Electronics', to: '/products?category=Electronics' },
  { name: 'Fashion', to: '/products?category=Fashion' },
  { name: 'Shoes', to: '/products?category=Shoes' },
  { name: 'Watches', to: '/products?category=Watches' },
  { name: 'Gaming', to: '/products?category=Gaming' },
];

interface Suggestion {
  _id: string;
  name: string;
  brand: string;
  price: number;
  mrp: number;
  image: string;
  category: string;
  rating: number;
  numReviews: number;
}

const fmt = (n: number) => '₹' + n.toLocaleString('en-IN');

export default function Navbar() {
  const { user, logout } = useAuth();
  const cartCount = useCart((s) => s.count());
  const setDrawer = useCart((s) => s.setDrawer);
  const navigate = useNavigate();
  const location = useLocation();
  const { showImages, toggleShowImages } = usePreferences();
  const [query, setQuery] = useState('');
  const [suggestions, setSuggestions] = useState<Suggestion[]>([]);
  const [showSug, setShowSug] = useState(false);
  const [activeIdx, setActiveIdx] = useState(-1);
  const [menuOpen, setMenuOpen] = useState(false);
  const [mobileOpen, setMobileOpen] = useState(false);

  // reflect current URL search in the box (e.g. after navigating to results)
  useEffect(() => {
    const q = new URLSearchParams(location.search).get('search');
    setQuery(q || '');
  }, [location.search]);

  // debounce autocomplete
  useEffect(() => {
    const q = query.trim();
    if (!q || q.length < 2) {
      setSuggestions([]);
      setShowSug(false);
      return;
    }
    const t = setTimeout(() => {
      api
        .get(`/api/products/suggest?q=${encodeURIComponent(q)}`)
        .then((r) => {
          setSuggestions(r.data.suggestions || []);
          setActiveIdx(-1);
        })
        .catch(() => {});
    }, 200);
    return () => clearTimeout(t);
  }, [query]);

  const search = (term?: string) => {
    const q = (term ?? query).trim();
    setShowSug(false);
    if (q) navigate(`/products?search=${encodeURIComponent(q)}`);
    else navigate('/products');
  };

  const onKeyDown = (e: React.KeyboardEvent) => {
    if (!showSug || suggestions.length === 0) {
      if (e.key === 'Enter') search();
      return;
    }
    if (e.key === 'ArrowDown') {
      e.preventDefault();
      setActiveIdx((i) => (i + 1) % suggestions.length);
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      setActiveIdx((i) => (i <= 0 ? suggestions.length - 1 : i - 1));
    } else if (e.key === 'Enter') {
      e.preventDefault();
      if (activeIdx >= 0) {
        const s = suggestions[activeIdx];
        setQuery(s.name);
        setShowSug(false);
        navigate(`/product/${s._id}`);
      } else {
        search();
      }
    } else if (e.key === 'Escape') {
      setShowSug(false);
    }
  };

  const logoutAndGo = () => {
    logout();
    navigate('/');
  };

  const AccountMenu = (
    <div className="relative">
      <button
        onClick={() => setMenuOpen((v) => !v)}
        className="flex items-center gap-1 rounded-lg px-3 py-2 text-sm font-semibold text-white hover:bg-white/10"
      >
        {user ? (
          <>
            <span className="flex h-6 w-6 items-center justify-center rounded-full bg-white/20 text-xs font-bold">{user.name.charAt(0).toUpperCase()}</span>
            <span className="max-w-24 truncate">{user.name.split(' ')[0]}</span>
          </>
        ) : (
          <>
            <FiUser /> Login
          </>
        )}
        <FiChevronDown className="text-xs" />
      </button>
      <AnimatePresence>
        {menuOpen && (
          <>
            <div className="fixed inset-0 z-40" onClick={() => setMenuOpen(false)} />
            <motion.div
              initial={{ opacity: 0, y: -6 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              className="absolute right-0 z-50 mt-2 w-56 rounded-lg bg-white p-2 text-slate-800 shadow-2xl"
            >
              {user ? (
                <>
                  <div className="border-b border-slate-200 px-3 py-2">
                    <p className="text-sm font-bold">{user.name}</p>
                    <p className="text-xs text-slate-500">{user.email}</p>
                  </div>
                  <Link to="/orders" onClick={() => setMenuOpen(false)} className="mt-1 flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-slate-100"><FiGrid /> Orders</Link>
                  <Link to="/profile" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-slate-100"><FiUser /> Profile</Link>
                  {user.role === 'admin' && (
                    <Link to="/admin" onClick={() => setMenuOpen(false)} className="flex items-center gap-2 rounded px-3 py-2 text-sm hover:bg-slate-100"><FiSettings /> Admin Dashboard</Link>
                  )}
                  <button onClick={logoutAndGo} className="flex w-full items-center gap-2 rounded px-3 py-2 text-sm text-red-600 hover:bg-slate-100"><FiLogOut /> Logout</button>
                </>
              ) : (
                <>
                  <Link to="/login" onClick={() => setMenuOpen(false)} className="block rounded bg-[#2874f0] px-4 py-2 text-center text-sm font-semibold text-white hover:bg-[#1d63d8]">Login</Link>
                  <p className="mt-2 px-3 text-xs text-slate-500">New to Shop Nova? <Link to="/register" onClick={() => setMenuOpen(false)} className="font-semibold text-[#2874f0]">Create account</Link></p>
                </>
              )}
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );

  return (
    <>
      {/* Top bar */}
      <header className="sticky top-0 z-50 bg-[#2874f0] shadow-md">
        <div className="mx-auto flex h-14 max-w-7xl items-center gap-4 px-4">
          <button onClick={() => setMobileOpen(true)} className="text-white md:hidden"><FiMenu className="text-xl" /></button>

          {/* Logo */}
          <Link to="/" className="flex shrink-0 flex-col leading-none">
            <span className="font-display text-lg font-bold italic text-white">
              Shop<span className="text-yellow-300">Nova</span>
            </span>
            <span className="flex items-center gap-1 text-[10px] font-medium text-white">
              Explore <span className="text-yellow-300">Plus</span>
              <svg width="12" height="6" viewBox="0 0 14 7" className="mt-0.5"><path d="M0 0h14L7 7z" fill="#ffe500"/></svg>
            </span>
          </Link>

          {/* Search */}
          <form onSubmit={(e) => { e.preventDefault(); search(); }} className="relative flex max-w-xl flex-1 items-center overflow-visible rounded-sm bg-white">
            <input
              value={query}
              onChange={(e) => { setQuery(e.target.value); setShowSug(true); }}
              onKeyDown={onKeyDown}
              onFocus={() => query.trim().length >= 2 && setShowSug(true)}
              onBlur={() => setTimeout(() => setShowSug(false), 150)}
              placeholder="Search for products, brands and more"
              className="h-9 w-full px-3 text-sm text-slate-800 outline-none placeholder:text-slate-400"
            />
            <button type="submit" className="flex h-9 w-11 items-center justify-center text-[#2874f0]" aria-label="Search">
              <FiSearch className="text-xl" />
            </button>

            {/* Flipkart-style live suggestions */}
            <AnimatePresence>
              {showSug && suggestions.length > 0 && (
                <motion.div
                  initial={{ opacity: 0, y: -4 }}
                  animate={{ opacity: 1, y: 0 }}
                  exit={{ opacity: 0, y: -4 }}
                  transition={{ duration: 0.12 }}
                  className="absolute top-full left-0 z-[80] mt-1 w-full overflow-hidden rounded-b-sm bg-white shadow-2xl ring-1 ring-slate-200"
                >
                  {suggestions.map((s, i) => (
                    <button
                      key={s._id}
                      type="button"
                      onMouseDown={(e) => { e.preventDefault(); setQuery(s.name); setShowSug(false); navigate(`/product/${s._id}`); }}
                      className={`flex w-full items-center gap-3 px-3 py-2 text-left ${i === activeIdx ? 'bg-slate-100' : ''}`}
                    >
                      <img src={s.image} alt="" className="h-9 w-9 shrink-0 rounded-sm object-contain" />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-medium text-slate-800">{s.name}</p>
                        <p className="text-xs text-slate-500">{s.category} • {s.brand}</p>
                      </div>
                      <div className="shrink-0 text-right">
                        <p className="text-sm font-semibold text-slate-800">{fmt(s.price)}</p>
                        <p className="text-xs text-slate-400 line-through">{fmt(s.mrp)}</p>
                      </div>
                    </button>
                  ))}
                  <button
                    type="button"
                    onMouseDown={(e) => { e.preventDefault(); search(query); }}
                    className="flex w-full items-center gap-2 border-t border-slate-200 bg-[#2874f0]/5 px-3 py-2.5 text-sm font-semibold text-[#2874f0]"
                  >
                    <FiSearch /> View all results for "{query.trim()}"
                  </button>
                </motion.div>
              )}
            </AnimatePresence>
          </form>

          <div className="ml-auto hidden items-center gap-3 md:flex">
            {AccountMenu}
            <button
              onClick={() => navigate('/products')}
              className="hidden rounded-sm px-2 py-2 text-sm font-semibold text-white hover:bg-white/10 lg:block"
            >
              Become a Seller
            </button>
            <button
              onClick={() => navigate('/orders')}
              className="flex items-center gap-1 rounded-sm px-2 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <FiPackage /> Orders
            </button>
            
            {/* Show/Hide Images Toggle */}
            <button
              onClick={toggleShowImages}
              className="flex items-center gap-1.5 rounded-sm px-2 py-2 text-sm font-semibold text-white hover:bg-white/10 transition"
              title={showImages ? "Hide product images" : "Show product images"}
            >
              <span className="text-xs">Images</span>
              <div className={`relative h-5 w-9 rounded-full transition-colors duration-200 ${showImages ? 'bg-yellow-400' : 'bg-white/30'}`}>
                <div className={`absolute top-0.5 left-0.5 h-4 w-4 rounded-full bg-white transition-transform duration-200 ${showImages ? 'translate-x-4' : 'translate-x-0'}`} />
              </div>
            </button>

            <button
              onClick={() => setDrawer(true)}
              className="relative flex items-center gap-1 rounded-sm px-2 py-2 text-sm font-semibold text-white hover:bg-white/10"
            >
              <FiShoppingCart className="text-lg" />
              Cart
              {cartCount > 0 && (
                <span className="absolute -top-1 -right-1 flex h-5 min-w-5 items-center justify-center rounded-full bg-yellow-400 px-1 text-[10px] font-bold text-black">
                  {cartCount}
                </span>
              )}
            </button>
          </div>

          {/* mobile icons */}
          <div className="ml-auto flex items-center gap-2 md:hidden">
            <button onClick={() => setDrawer(true)} className="relative text-white">
              <FiShoppingCart className="text-xl" />
              {cartCount > 0 && (
                <span className="absolute -top-1.5 -right-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-yellow-400 px-1 text-[9px] font-bold text-black">{cartCount}</span>
              )}
            </button>
          </div>
        </div>
      </header>

      {/* Category strip */}
      <div className="sticky top-14 z-40 hidden border-b border-slate-800 bg-white text-slate-800 shadow-sm md:block">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-4">
          {CAT_STRIP.map((c) => (
            <Link key={c.name} to={c.to} className="flex-1 py-3 text-center text-sm font-semibold hover:text-[#2874f0]">
              {c.name}
            </Link>
          ))}
        </div>
      </div>

      {/* mobile drawer */}
      <AnimatePresence>
        {mobileOpen && (
          <>
            <div className="fixed inset-0 z-[60] bg-black/50" onClick={() => setMobileOpen(false)} />
            <motion.div
              initial={{ x: '-100%' }}
              animate={{ x: 0 }}
              exit={{ x: '-100%' }}
              transition={{ duration: 0.25 }}
              className="fixed top-0 left-0 z-[70] h-full w-72 bg-white text-slate-800 p-4"
            >
              <div className="mb-4 flex items-center justify-between border-b border-slate-200 pb-3">
                <span className="font-bold text-[#2874f0]">ShopNova</span>
                <button onClick={() => setMobileOpen(false)} className="text-2xl text-slate-400">×</button>
              </div>
              <div className="flex flex-col gap-1 text-sm font-medium">
                <Link to="/" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 hover:bg-slate-100">Home</Link>
                <Link to="/products" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 hover:bg-slate-100">Products</Link>
                {CAT_STRIP.map((c) => (
                  <Link key={c.name} to={c.to} onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 hover:bg-slate-100">{c.name}</Link>
                ))}
                <Link to="/orders" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 hover:bg-slate-100">Orders</Link>
                {user?.role === 'admin' && <Link to="/admin" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 hover:bg-slate-100">Admin</Link>}
                <Link to="/profile" onClick={() => setMobileOpen(false)} className="rounded px-3 py-2.5 hover:bg-slate-100">Profile</Link>
                {user ? (
                  <button onClick={() => { setMobileOpen(false); logoutAndGo(); }} className="rounded px-3 py-2.5 text-left text-red-600 hover:bg-slate-100">Logout</button>
                ) : (
                  <Link to="/login" onClick={() => setMobileOpen(false)} className="rounded bg-[#2874f0] px-3 py-2.5 text-center font-semibold text-white">Login / Register</Link>
                )}
                
                {/* Mobile Images Toggle */}
                <div className="flex items-center justify-between border-t border-slate-200 mt-2 pt-3 px-3">
                  <span className="text-slate-600 font-semibold">Show Images</span>
                  <button
                    onClick={toggleShowImages}
                    className={`relative h-6 w-11 rounded-full transition-colors duration-200 ${showImages ? 'bg-[#2874f0]' : 'bg-slate-300'}`}
                  >
                    <div className={`absolute top-0.5 left-0.5 h-5 w-5 rounded-full bg-white transition-transform duration-200 ${showImages ? 'translate-x-5' : 'translate-x-0'}`} />
                  </button>
                </div>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}