import { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiArrowLeft, FiTruck, FiCheckCircle, FiClock, FiPackage } from 'react-icons/fi';
import { api } from '../lib/api';
import type { Order } from '../lib/types';

const STEPS = ['Pending', 'Confirmed', 'Shipped', 'Delivered'] as const;
const stepIcons = [<FiClock key="p" />, <FiCheckCircle key="c" />, <FiTruck key="s" />, <FiPackage key="d" />];

export default function OrderDetailPage() {
  const { id } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get(`/api/orders/${id}`)
      .then((r) => setOrder(r.data))
      .catch(() => navigate('/orders'))
      .finally(() => setLoading(false));
  }, [id, navigate]);

  if (loading) return <div className="mx-auto max-w-4xl px-4 pt-28"><div className="skeleton h-96" /></div>;
  if (!order) return null;

  const currentIdx = STEPS.indexOf(order.status);

  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
      <button onClick={() => navigate('/orders')} className="mb-6 flex items-center gap-2 text-sm text-subtitle hover:text-white">
        <FiArrowLeft /> All orders
      </button>

      <h1 className="mb-2 font-display text-3xl font-bold">
        Order <span className="text-aurora">#{order._id.slice(-8).toUpperCase()}</span>
      </h1>
      <p className="mb-8 text-sm text-subtitle">
        Placed {new Date(order.createdAt).toLocaleString('en-IN', { dateStyle: 'long', timeStyle: 'short' })} · {order.paymentMethod}
      </p>

      {/* status timeline */}
      <div className="glass mb-8 rounded-3xl p-6">
        <h2 className="mb-6 font-semibold">Tracking</h2>
        <div className="flex items-center">
          {STEPS.map((s, i) => {
            const reached = i <= currentIdx;
            return (
              <motion.div key={s} className="flex flex-1 items-center last:flex-none" initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
                <div className="flex flex-col items-center">
                  <div className={`flex h-11 w-11 items-center justify-center rounded-full text-lg transition ${
                    i < currentIdx ? 'bg-success/25 text-success'
                    : i === currentIdx ? 'bg-gradient-to-r from-primary to-secondary text-white'
                    : 'bg-white/8 text-subtitle'
                  }`}>
                    {stepIcons[i]}
                  </div>
                  <p className={`mt-2 text-[11px] font-medium ${reached ? 'text-white' : 'text-subtitle'}`}>{s}</p>
                </div>
                {i < STEPS.length - 1 && (
                  <div className={`mx-2 h-0.5 flex-1 rounded ${i < currentIdx ? 'bg-success/50' : 'bg-white/10'}`} />
                )}
              </motion.div>
            );
          })}
        </div>
      </div>

      <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
        {/* items */}
        <div className="glass rounded-3xl p-6 lg:col-span-2">
          <h2 className="mb-4 font-semibold">Items ({order.products.reduce((s, p) => s + p.quantity, 0)})</h2>
          <div className="flex flex-col gap-3">
            {order.products.map((p) => (
              <div key={p.productId} className="glass-soft flex items-center gap-3 rounded-xl p-3">
                <img src={p.image} alt={p.name} className="h-14 w-14 rounded-lg bg-white/10 object-cover" />
                <div className="flex-1">
                  <p className="text-sm font-medium">{p.name}</p>
                  <p className="text-xs text-subtitle">Qty {p.quantity} × ₹{p.price.toLocaleString('en-IN')}</p>
                </div>
                <p className="text-sm font-semibold">₹{(p.price * p.quantity).toLocaleString('en-IN')}</p>
              </div>
            ))}
          </div>
          <div className="mt-5 flex justify-between border-t border-white/10 pt-4 text-lg font-bold">
            <span>Total</span>
            <span className="text-aurora">₹{order.totalPrice.toLocaleString('en-IN')}</span>
          </div>
        </div>

        {/* delivery */}
        <div className="glass h-fit rounded-3xl p-6">
          <h2 className="mb-4 font-semibold">Deliver to</h2>
          <p className="text-sm leading-relaxed text-slate-300">
            {order.address.line1}<br />
            {order.address.city}, {order.address.state} — {order.address.pincode}
          </p>
          <p className="mt-2 text-sm text-subtitle">📞 {order.address.phone}</p>
          <h2 className="mb-2 mt-6 font-semibold">Payment</h2>
          <p className="text-sm text-slate-300">{order.paymentMethod}</p>
        </div>
      </div>
    </div>
  );
}