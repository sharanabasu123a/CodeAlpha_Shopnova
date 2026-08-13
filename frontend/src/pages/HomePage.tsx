import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowRight, FiSearch, FiStar, FiTrendingUp } from 'react-icons/fi';
import AuroraField from '../components/Hero';
import ProductCard from '../components/ProductCard';
import { api } from '../lib/api';
import type { Product, Category } from '../lib/types';

const categoryIcons: Record<string, string> = {
  Electronics: '💻',
  Fashion: '👗',
  Shoes: '👟',
  Watches: '⌚',
  Gaming: '🎮',
};

function WordReveal({ text }: { text: string }) {
  return (
    <span>
      {text.split(' ').map((w, i) => (
        <motion.span
          key={i}
          className="inline-block"
          initial={{ opacity: 0, y: 26, filter: 'blur(6px)' }}
          animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
          transition={{ delay: 0.15 + i * 0.09, duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
        >
          {w}&nbsp;
        </motion.span>
      ))}
    </span>
  );
}

export default function HomePage() {
  const [featured, setFeatured] = useState<Product[]>([]);
  const [trending, setTrending] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [search, setSearch] = useState('');

  useEffect(() => {
    api.get('/api/products/featured').then((r) => setFeatured(r.data.products)).catch(() => {});
    api.get('/api/products?limit=12').then((r) => setTrending(r.data.products)).catch(() => {});
    api.get('/api/products/categories').then((r) => setCategories(r.data.categories)).catch(() => {});
  }, []);

  const goSearch = () => {
    window.location.href = `/products?search=${encodeURIComponent(search)}`;
  };

  const stats = [
    { label: 'Happy Customers', value: 10000, suffix: '+' },
    { label: 'Products', value: 1500, suffix: '+' },
    { label: 'Satisfaction', value: 99, suffix: '%' },
  ];

  return (
    <div className="pb-16">
      {/* HERO */}
      <section className="relative flex min-h-[92vh] items-center justify-center overflow-hidden">
        <AuroraField />
        <div className="pointer-events-none absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-base" />

        <div className="relative z-10 mx-auto max-w-4xl px-4 pt-24 pb-20 text-center">
          <motion.div
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
            className="mb-5 inline-flex items-center gap-2 rounded-full border border-white/15 bg-white/5 px-4 py-1.5 text-xs font-medium text-slate-300"
          >
            ✨ Welcome to Shop Nova
          </motion.div>

          <h1 className="font-display text-5xl font-extrabold leading-tight sm:text-7xl">
            <WordReveal text="Shop" /> <span className="text-aurora"><WordReveal text="Nova" /></span> <WordReveal text="Everything" />
          </h1>

          <motion.p
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.7, duration: 0.5 }}
            className="mx-auto mt-5 max-w-xl text-base text-subtitle sm:text-lg"
          >
            Handpicked electronics, fashion, shoes, watches & gaming gear — delivered fast, priced right, styled bright.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 14 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.9, duration: 0.5 }}
            className="mx-auto mt-8 flex w-full max-w-md items-center gap-2 rounded-2xl border border-white/15 bg-white/8 p-1.5 backdrop-blur-md"
          >
            <FiSearch className="ml-3 text-slate-400" />
            <input
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && goSearch()}
              placeholder="Search for laptops, sneakers, watches…"
              className="w-full bg-transparent px-2 py-2.5 text-sm text-white outline-none placeholder:text-slate-500"
            />
            <button onClick={goSearch} className="btn-primary whitespace-nowrap rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
              Shop Now
            </button>
          </motion.div>

          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.1 }}
            className="mt-8 flex flex-wrap items-center justify-center gap-4 text-sm text-slate-300"
          >
            <Link to="/products" className="flex items-center gap-1 text-aurora hover:underline">
              Browse all products <FiArrowRight />
            </Link>
            <span className="flex items-center gap-1">
              4.8 <FiStar className="fill-yellow-400 text-yellow-400" /> from 10k+ reviews
            </span>
          </motion.div>
        </div>
      </section>

      {/* CATEGORIES */}
      <section className="mx-auto max-w-7xl px-4">
        <h2 className="mb-6 font-display text-2xl font-bold sm:text-3xl">Shop by <span className="text-aurora">Category</span></h2>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
          {categories.map((c, i) => (
            <motion.div
              key={c.name}
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.06, duration: 0.4 }}
            >
              <Link
                to={`/products?category=${encodeURIComponent(c.name)}`}
                className="glass glass-hover group flex flex-col items-center rounded-3xl p-6 text-center"
              >
                <span className="mb-3 text-4xl transition-transform duration-300 group-hover:scale-110 group-hover:rotate-6">
                  {categoryIcons[c.name] || '✨'}
                </span>
                <p className="font-medium">{c.name}</p>
                <p className="text-xs text-subtitle">{c.count || 0} products</p>
              </Link>
            </motion.div>
          ))}
        </div>
      </section>

      {/* FEATURED */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-2xl font-bold sm:text-3xl">Featured <span className="text-aurora">Products</span></h2>
          <Link to="/products" className="flex items-center gap-1 text-sm text-aurora hover:underline">View all <FiArrowRight /></Link>
        </div>
        <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4">
          {featured.map((p) => <ProductCard key={p._id} product={p} />)}
        </div>
      </section>

      {/* TRENDING */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <h2 className="mb-6 flex items-center gap-2 font-display text-2xl font-bold sm:text-3xl">
          <FiTrendingUp className="text-secondary" /> Trending Now
        </h2>
        <div className="no-scrollbar -mx-4 flex gap-5 overflow-x-auto px-4 pb-4 snap-x">
          {trending.map((p) => (
            <div key={p._id} className="w-72 shrink-0 snap-start">
              <ProductCard product={p} />
            </div>
          ))}
        </div>
      </section>

      {/* BRAND STRIP */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="glass grid grid-cols-2 gap-4 rounded-3xl p-6 text-center sm:grid-cols-4">
          {[
            { icon: '🚚', t: 'Fast Delivery', d: 'Free & quick shipping' },
            { icon: '🔄', t: 'Easy Returns', d: '7-day replacement' },
            { icon: '💰', t: 'Best Prices', d: 'Daily deals & offers' },
            { icon: '🛡️', t: 'Genuine Products', d: '100% authentic' },
          ].map((f) => (
            <div key={f.t}>
              <p className="text-2xl">{f.icon}</p>
              <p className="mt-1 text-sm font-semibold">{f.t}</p>
              <p className="text-xs text-subtitle">{f.d}</p>
            </div>
          ))}
        </div>
      </section>

      {/* STATS */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="glass grid grid-cols-3 gap-4 rounded-3xl p-8 text-center">
          {stats.map((s, i) => (
            <motion.div
              key={s.label}
              initial={{ opacity: 0, y: 16 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ delay: i * 0.1 }}
            >
              <Counter target={s.value} suffix={s.suffix} />
              <p className="mt-1 text-xs text-subtitle sm:text-sm">{s.label}</p>
            </motion.div>
          ))}
        </div>
      </section>

      {/* NEWSLETTER */}
      <section className="mx-auto max-w-7xl px-4 pt-16">
        <div className="glass relative overflow-hidden rounded-3xl p-10 text-center">
          <div className="absolute inset-0 bg-aurora opacity-60" />
          <div className="relative">
            <h2 className="font-display text-2xl font-bold sm:text-3xl">Join the Shop Nova <span className="text-aurora">Newsletter</span></h2>
            <p className="mx-auto mt-3 max-w-md text-sm text-subtitle">Get early access to drops, exclusive offers & nova-level style tips.</p>
            <form className="mx-auto mt-6 flex max-w-md gap-2" onSubmit={(e) => { e.preventDefault(); window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: 'Subscribed! Welcome to Shop Nova.', type: 'success' } })); }}>
              <input required type="email" placeholder="you@email.com" className="input-glass flex-1" />
              <button className="btn-primary whitespace-nowrap rounded-xl px-5 py-3 text-sm font-semibold text-white">Subscribe</button>
            </form>
          </div>
        </div>
      </section>
    </div>
  );
}

function Counter({ target, suffix }: { target: number; suffix: string }) {
  const [n, setN] = useState(0);
  useEffect(() => {
    let raf = 0;
    const start = Date.now();
    const dur = 1600;
    const loop = () => {
      const p = Math.min(1, (Date.now() - start) / dur);
      setN(Math.floor(p * target));
      if (p < 1) raf = requestAnimationFrame(loop);
    };
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
  }, [target]);
  return (
    <p className="font-display text-3xl font-extrabold text-aurora sm:text-5xl">
      {n.toLocaleString('en-IN')}{suffix}
    </p>
  );
}