import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShoppingBag, FiTrash2, FiMinus, FiPlus, FiCreditCard, FiSmartphone, FiDollarSign } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { useCart } from '../context/cartStore';
import { api, apiErrorMessage } from '../lib/api';

const PAYMENTS = [
  { id: 'UPI', label: 'UPI', icon: <FiSmartphone /> },
  { id: 'Card', label: 'Card', icon: <FiCreditCard /> },
  { id: 'COD', label: 'Cash on Delivery', icon: <FiDollarSign /> },
] as const;

export default function CheckoutPage() {
  const { items, total, updateQuantity, removeItem, fetchCart } = useCart();
  const navigate = useNavigate();
  const [address, setAddress] = useState({ line1: '', city: '', state: '', pincode: '', phone: '' });
  const [payment, setPayment] = useState<'COD' | 'UPI' | 'Card'>('UPI');
  const [placing, setPlacing] = useState(false);
  const [error, setError] = useState('');

  useEffect(() => {
    fetchCart();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const canSubmit =
    address.line1.trim() && address.city.trim() && address.state.trim() &&
    /^\d{5,6}$/.test(address.pincode) && /^[0-9+\-\s]{10,15}$/.test(address.phone) &&
    items.length > 0;

  const placeOrder = async () => {
    setPlacing(true);
    setError('');
    try {
      const { data } = await api.post('/api/order', { address, paymentMethod: payment });
      useCart.getState().clearCart();
      navigate(`/order-success/${data.orderId}`, { replace: true });
    } catch (e) {
      setError(apiErrorMessage(e));
      fetchCart();
    } finally {
      setPlacing(false);
    }
  };

  const field = (k: keyof typeof address, label: string, placeholder: string, type = 'text') => (
    <div>
      <label className="label-glass">{label}</label>
      <input
        type={type}
        value={address[k]}
        onChange={(e) => setAddress((a) => ({ ...a, [k]: e.target.value }))}
        placeholder={placeholder}
        className="input-glass"
      />
    </div>
  );

  return (
    <div className="mx-auto max-w-6xl px-4 pt-24 pb-16">
      <h1 className="mb-8 font-display text-3xl font-bold">Check<span className="text-aurora">out</span></h1>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-5">
        {/* left: form */}
        <div className="lg:col-span-3">
          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} className="glass rounded-3xl p-6">
            <h2 className="mb-5 font-semibold">Shipping Address</h2>
            <div className="flex flex-col gap-4">
              {field('line1', 'Address', 'House no, street, locality')}
              <div className="grid grid-cols-2 gap-4">
                {field('city', 'City', 'City')}
                {field('state', 'State', 'State')}
              </div>
              <div className="grid grid-cols-2 gap-4">
                {field('pincode', 'Pincode', '6-digit PIN', 'text')}
                {field('phone', 'Phone', '10-digit mobile', 'tel')}
              </div>
            </div>
          </motion.div>

          <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.08 }} className="glass mt-6 rounded-3xl p-6">
            <h2 className="mb-5 font-semibold">Payment Method</h2>
            <div className="grid grid-cols-1 gap-3 sm:grid-cols-3">
              {PAYMENTS.map((p) => (
                <button
                  key={p.id}
                  onClick={() => setPayment(p.id)}
                  className={`flex flex-col items-center gap-2 rounded-2xl border p-5 text-sm transition ${
                    payment === p.id
                      ? 'border-primary/60 bg-primary/15 text-white'
                      : 'border-white/10 bg-white/5 text-subtitle hover:bg-white/10'
                  }`}
                >
                  <span className="text-2xl">{p.icon}</span>
                  {p.label}
                </button>
              ))}
            </div>
            <p className="mt-4 text-xs text-subtitle">Demo only — no real payment is processed.</p>
          </motion.div>
        </div>

        {/* right: summary */}
        <div className="lg:col-span-2">
          <div className="glass rounded-3xl p-6 lg:sticky lg:top-24">
            <h2 className="mb-4 flex items-center gap-2 font-semibold"><FiShoppingBag /> Order Summary</h2>

            {items.length === 0 ? (
              <p className="py-8 text-center text-sm text-subtitle">Your cart is empty.</p>
            ) : (
              <div className="mb-4 flex max-h-80 flex-col gap-3 overflow-y-auto pr-1">
                {items.map((it) => (
                  <div key={it._id} className="glass-soft flex items-center gap-3 rounded-xl p-2.5">
                    <img src={it.image} alt={it.name} className="h-12 w-12 rounded-lg bg-white/10 object-cover" />
                    <div className="min-w-0 flex-1">
                      <p className="truncate text-xs font-medium">{it.name}</p>
                      <p className="text-[11px] text-subtitle">₹{it.price.toLocaleString('en-IN')}</p>
                    </div>
                    <div className="flex items-center gap-1.5">
                      <button
                        onClick={() => updateQuantity(it._id, it.quantity - 1)}
                        disabled={it.quantity <= 1}
                        className="rounded-md bg-white/10 p-1 text-[10px] hover:bg-white/20 disabled:opacity-40"
                        aria-label="decrease"
                      ><FiMinus /></button>
                      <span className="w-5 text-center text-xs font-semibold">{it.quantity}</span>
                      <button
                        onClick={() => updateQuantity(it._id, it.quantity + 1)}
                        disabled={it.quantity >= it.stock}
                        className="rounded-md bg-white/10 p-1 text-[10px] hover:bg-white/20 disabled:opacity-40"
                        aria-label="increase"
                      ><FiPlus /></button>
                    </div>
                    <button onClick={() => removeItem(it._id)} className="p-1 text-red-400 hover:bg-red-500/20 rounded" aria-label="remove"><FiTrash2 /></button>
                  </div>
                ))}
              </div>
            )}

            <div className="border-t border-white/10 pt-4 text-sm">
              <div className="mb-1 flex justify-between text-subtitle"><span>Items</span><span>{items.reduce((s, i) => s + i.quantity, 0)}</span></div>
              <div className="mb-1 flex justify-between text-subtitle"><span>Shipping</span><span>Free</span></div>
              <div className="mb-3 flex justify-between text-lg font-bold"><span>Total</span><span className="text-aurora">₹{total.toLocaleString('en-IN')}</span></div>
            </div>

            {error && <div className="mb-3 rounded-xl border border-danger/40 bg-danger/10 px-4 py-2.5 text-xs text-red-200">{error}</div>}

            <button
              onClick={placeOrder}
              disabled={!canSubmit || placing}
              className="btn-primary w-full rounded-xl py-4 font-semibold text-white disabled:cursor-not-allowed disabled:opacity-40"
            >
              {placing ? 'Placing order…' : `Place Order · ₹${total.toLocaleString('en-IN')}`}
            </button>
            <p className="mt-3 text-center text-[11px] text-subtitle">
              Complete address & phone required before ordering.
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}