import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FiEdit2, FiTrash2, FiPlus, FiSearch } from 'react-icons/fi';
import { api } from '../../lib/api';
import type { Product } from '../../lib/types';

export default function AdminProductsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [q, setQ] = useState('');
  const [confirmDelete, setConfirmDelete] = useState<Product | null>(null);
  const [deleting, setDeleting] = useState(false);

  const load = () => {
    setLoading(true);
    const params = new URLSearchParams({ limit: '48' });
    if (q) params.set('search', q);
    api.get(`/api/products?${params.toString()}`)
      .then((r) => setProducts(r.data.products))
      .finally(() => setLoading(false));
  };

  useEffect(() => {
    const t = setTimeout(load, 300);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [q]);

  const doDelete = async () => {
    if (!confirmDelete) return;
    setDeleting(true);
    try {
      await api.delete(`/api/product/${confirmDelete._id}`);
      setConfirmDelete(null);
      window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: 'Product deleted', type: 'success' } }));
      load();
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <h1 className="font-display text-3xl font-bold">Product <span className="text-aurora">Catalog</span></h1>
        <Link to="/admin/products/new" className="btn-primary flex items-center gap-2 rounded-xl px-5 py-2.5 text-sm font-semibold text-white">
          <FiPlus /> Add Product
        </Link>
      </div>

      <div className="mb-6 flex items-center gap-2 rounded-xl border border-white/10 bg-white/5 px-3.5 py-2.5">
        <FiSearch className="text-slate-400" />
        <input
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Search products…"
          className="w-full bg-transparent text-sm outline-none placeholder:text-slate-500"
        />
      </div>

      <div className="glass overflow-x-auto rounded-3xl">
        {loading ? (
          <div className="grid grid-cols-1 gap-3 p-4">
            {Array.from({ length: 5 }, (_, i) => <div key={i} className="skeleton h-16" />)}
          </div>
        ) : products.length === 0 ? (
          <p className="py-16 text-center text-subtitle">No products found.</p>
        ) : (
          <table className="w-full min-w-[720px] text-sm">
            <thead>
              <tr className="border-b border-white/10 text-left text-xs uppercase tracking-wider text-subtitle">
                <th className="p-4">Product</th>
                <th className="p-4">Category</th>
                <th className="p-4">Price</th>
                <th className="p-4">Stock</th>
                <th className="p-4">Rating</th>
                <th className="p-4 text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {products.map((p) => (
                <tr key={p._id} className="border-b border-white/5 last:border-0 hover:bg-white/5">
                  <td className="p-4">
                    <div className="flex items-center gap-3">
                      <img src={p.image} alt={p.name} className="h-10 w-10 rounded-lg bg-white/10 object-cover" />
                      <div>
                        <p className="font-medium">{p.name}</p>
                        <p className="text-xs text-subtitle">{p._id}</p>
                      </div>
                    </div>
                  </td>
                  <td className="p-4 text-subtitle">{p.category}</td>
                  <td className="p-4 font-medium">₹{p.price.toLocaleString('en-IN')}</td>
                  <td className="p-4">
                    <span className={`rounded-full px-2.5 py-0.5 text-xs ${p.stock === 0 ? 'bg-danger/15 text-red-300' : p.stock <= 5 ? 'bg-yellow-400/15 text-yellow-300' : 'bg-success/15 text-green-300'}`}>
                      {p.stock}
                    </span>
                  </td>
                  <td className="p-4 text-subtitle">{p.rating?.toFixed(1) || '0.0'}</td>
                  <td className="p-4">
                    <div className="flex justify-end gap-2">
                      <Link to={`/admin/products/${p._id}/edit`} className="rounded-lg p-2 text-secondary hover:bg-white/10">
                        <FiEdit2 />
                      </Link>
                      <button onClick={() => setConfirmDelete(p)} className="rounded-lg p-2 text-red-400 hover:bg-red-500/10">
                        <FiTrash2 />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </div>

      <AnimatePresence>
        {confirmDelete && (
          <>
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} className="fixed inset-0 z-[70] bg-black/60" onClick={() => setConfirmDelete(null)} />
            <motion.div
              initial={{ opacity: 0, scale: 0.92 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.92 }}
              className="glass fixed left-1/2 top-1/2 z-[80] w-full max-w-sm -translate-x-1/2 -translate-y-1/2 rounded-3xl p-6"
            >
              <h3 className="font-display text-lg font-bold">Delete product?</h3>
              <p className="mt-2 text-sm text-subtitle">
                "<strong className="text-white">{confirmDelete.name}</strong>" will be permanently removed.
              </p>
              <div className="mt-6 flex gap-3">
                <button onClick={() => setConfirmDelete(null)} className="flex-1 rounded-xl bg-white/5 py-2.5 text-sm font-semibold hover:bg-white/10">
                  Cancel
                </button>
                <button onClick={doDelete} disabled={deleting} className="flex-1 rounded-xl bg-danger py-2.5 text-sm font-semibold text-white disabled:opacity-50">
                  {deleting ? 'Deleting…' : 'Delete'}
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
}