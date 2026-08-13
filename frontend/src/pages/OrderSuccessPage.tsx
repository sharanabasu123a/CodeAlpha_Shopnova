import { useEffect, useState } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FiCheckCircle, FiPackage, FiArrowRight } from 'react-icons/fi';
import ConfettiBurst from '../components/Confetti';
import { api } from '../lib/api';
import type { Order } from '../lib/types';

export default function OrderSuccessPage() {
  const { orderId } = useParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);

  useEffect(() => {
    api.get(`/api/orders/${orderId}`).then((r) => setOrder(r.data)).catch(() => {});
  }, [orderId]);

  return (
    <div className="relative flex min-h-screen flex-col items-center justify-center px-4 text-center">
      <ConfettiBurst />
      <motion.div
        initial={{ opacity: 0, scale: 0.85 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ type: 'spring', damping: 16 }}
        className="flex flex-col items-center"
      >
        <div className="glass mb-6 flex h-24 w-24 items-center justify-center rounded-full">
          <FiCheckCircle className="text-5xl text-success" />
        </div>
        <h1 className="font-display text-4xl font-extrabold">
          Order <span className="text-aurora">Placed!</span>
        </h1>
        <p className="mt-3 max-w-md text-subtitle">
          Thank you — your order has been received and is now <span className="text-yellow-300">Pending</span> confirmation.
        </p>

        <div className="glass mt-8 w-full max-w-sm rounded-2xl p-5 text-left text-sm">
          <div className="flex justify-between py-1">
            <span className="text-subtitle">Order number</span>
            <span className="font-mono font-semibold text-aurora">#{orderId}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-subtitle">Total</span>
            <span className="font-semibold">₹{(order?.totalPrice || 0).toLocaleString('en-IN')}</span>
          </div>
          <div className="flex justify-between py-1">
            <span className="text-subtitle">Payment</span>
            <span className="font-semibold">{order?.paymentMethod || '…'}</span>
          </div>
        </div>

        <div className="mt-8 flex flex-wrap items-center justify-center gap-3">
          <Link to="/orders" className="btn-primary flex items-center gap-2 rounded-xl px-6 py-3 font-semibold text-white">
            <FiPackage /> Track Order <FiArrowRight />
          </Link>
          <Link to="/products" className="rounded-xl bg-white/5 px-6 py-3 font-semibold text-slate-200 hover:bg-white/10">
            Continue Shopping
          </Link>
        </div>
        <button onClick={() => navigate(-1)} className="mt-4 text-xs text-subtitle hover:text-white">Go back</button>
      </motion.div>
    </div>
  );
}