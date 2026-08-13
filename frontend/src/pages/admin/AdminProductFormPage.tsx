import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiSave, FiUpload } from 'react-icons/fi';
import { api, apiErrorMessage } from '../../lib/api';

const CATEGORIES = ['Electronics', 'Fashion', 'Shoes', 'Watches', 'Gaming'];

export default function AdminProductFormPage() {
  const { id } = useParams();
  const isEdit = Boolean(id);
  const navigate = useNavigate();

  const [form, setForm] = useState({
    name: '',
    price: '',
    description: '',
    category: 'Electronics',
    stock: '0',
    image: '',
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(isEdit);
  const [uploading, setUploading] = useState(false);

  useEffect(() => {
    if (isEdit) {
      api.get(`/api/product/${id}`).then((r) => {
        const p = r.data;
        setForm({
          name: p.name,
          price: String(p.price),
          description: p.description,
          category: p.category,
          stock: String(p.stock),
          image: p.image,
        });
        setLoading(false);
      }).catch(() => navigate('/admin/products'));
    }
  }, [id, isEdit, navigate]);

  const set = (k: keyof typeof form) => (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) =>
    setForm((f) => ({ ...f, [k]: e.target.value }));

  const onFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    const fd = new FormData();
    fd.append('image', file);
    try {
      const { data } = await api.post('/api/upload', fd, { headers: { 'Content-Type': 'multipart/form-data' } });
      setForm((f) => ({ ...f, image: data.url }));
      window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: 'Image uploaded', type: 'success' } }));
    } catch (err) {
      setError(apiErrorMessage(err));
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setError('');
    if (!form.name || !form.price || !form.description || !form.image) {
      return setError('Name, price, description and image are required.');
    }
    setSaving(true);
    try {
      const payload = {
        name: form.name,
        price: Number(form.price),
        description: form.description,
        category: form.category,
        stock: Number(form.stock || 0),
        image: form.image,
      };
      if (isEdit) await api.put(`/api/product/${id}`, payload);
      else await api.post('/api/product', payload);
      window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: isEdit ? 'Product updated' : 'Product created', type: 'success' } }));
      navigate('/admin/products');
    } catch (e) {
      setError(apiErrorMessage(e));
    } finally {
      setSaving(false);
    }
  };

  if (loading) return <div className="mx-auto max-w-2xl px-4 pt-28"><div className="skeleton h-96" /></div>;

  return (
    <div className="mx-auto max-w-2xl px-4 pt-24 pb-16">
      <button onClick={() => navigate('/admin/products')} className="mb-6 flex items-center gap-2 text-sm text-subtitle hover:text-white">
        <FiArrowLeft /> Back to catalog
      </button>

      <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-8">
        <h1 className="mb-6 font-display text-2xl font-bold">
          {isEdit ? 'Edit ' : 'Add '}<span className="text-aurora">Product</span>
        </h1>

        {error && <div className="mb-4 rounded-xl border border-danger/40 bg-danger/10 px-4 py-3 text-sm text-red-200">{error}</div>}

        <div className="flex flex-col gap-4">
          <div>
            <label className="label-glass">Product Name</label>
            <input value={form.name} onChange={set('name')} className="input-glass" placeholder="Wireless Earbuds Pro" />
          </div>

          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="label-glass">Price (₹)</label>
              <input value={form.price} onChange={set('price')} type="number" min="0" className="input-glass" placeholder="2499" />
            </div>
            <div>
              <label className="label-glass">Stock</label>
              <input value={form.stock} onChange={set('stock')} type="number" min="0" className="input-glass" placeholder="20" />
            </div>
          </div>

          <div>
            <label className="label-glass">Category</label>
            <select value={form.category} onChange={set('category')} className="input-glass">
              {CATEGORIES.map((c) => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>

          <div>
            <label className="label-glass">Description</label>
            <textarea value={form.description} onChange={set('description')} rows={4} className="input-glass resize-none" placeholder="Describe the product…" />
          </div>

          <div>
            <label className="label-glass">Image</label>
            <div className="flex flex-col gap-3 sm:flex-row">
              <input value={form.image} onChange={set('image')} className="input-glass flex-1" placeholder="Image URL or /images/products/p1.svg" />
              <label className="btn-buy flex cursor-pointer items-center justify-center gap-2 rounded-xl px-4 py-3 text-sm font-semibold text-white">
                <FiUpload /> {uploading ? 'Uploading…' : 'Upload'}
                <input type="file" accept="image/*" onChange={onFile} className="hidden" />
              </label>
            </div>
            {form.image && (
              <img src={form.image} alt="preview" className="mt-3 h-32 w-32 rounded-xl bg-white/10 object-cover" />
            )}
          </div>

          <button onClick={save} disabled={saving} className="btn-primary mt-2 flex items-center justify-center gap-2 rounded-xl py-3.5 font-semibold text-white disabled:opacity-50">
            <FiSave /> {saving ? 'Saving…' : isEdit ? 'Update Product' : 'Create Product'}
          </button>
        </div>
      </motion.div>
    </div>
  );
}