import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiPackage } from 'react-icons/fi';
import { api } from '../lib/api';
import type { Order } from '../lib/types';

const statusColor: Record<Order['status'], string> = {
  Pending: 'bg-yellow-400/15 text-yellow-300',
  Confirmed: 'bg-secondary/15 text-cyan-300',
  Shipped: 'bg-primary/20 text-purple-300',
  Delivered: 'bg-success/15 text-green-300',
};

export default function OrdersPage() {
  const [orders, setOrders] = useState<Order[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/api/orders')
      .then((r) => setOrders(r.data.orders))
      .finally(() => setLoading(false));
  }, []);

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl px-4 pt-24">
        <div className="skeleton h-32" />
        <div className="skeleton mt-4 h-32" />
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-4xl px-4 pt-24 pb-16">
      <h1 className="mb-8 font-display text-3xl font-bold">Your <span className="text-aurora">Orders</span></h1>

      {orders.length === 0 ? (
        <div className="glass flex flex-col items-center rounded-3xl py-20 text-center">
          <FiPackage className="mb-4 text-6xl opacity-30" />
          <p className="font-medium text-white">No orders yet</p>
          <p className="mt-1 text-sm text-subtitle">Your future orders will appear here.</p>
          <Link to="/products" className="btn-primary mt-6 rounded-xl px-6 py-2.5 text-sm font-semibold text-white">
            Start Shopping
          </Link>
        </div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <Link key={o._id} to={`/orders/${o._id}`} className="glass glass-hover block rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <p className="font-mono text-sm font-semibold text-aurora">#{o._id.slice(-8).toUpperCase()}</p>
                  <p className="mt-0.5 text-xs text-subtitle">
                    {new Date(o.createdAt).toLocaleString('en-IN', { dateStyle: 'medium', timeStyle: 'short' })}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[o.status]}`}>{o.status}</span>
                  <span className="font-display text-lg font-bold">₹{o.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {o.products.slice(0, 4).map((p) => (
                  <img key={p.productId} src={p.image} alt={p.name} className="h-10 w-10 rounded-lg bg-white/10 object-cover" />
                ))}
                <span className="flex items-center px-2 text-xs text-subtitle">
                  {o.products.reduce((s, p) => s + p.quantity, 0)} items
                </span>
              </div>
            </Link>
          ))}
        </div>
      )}
    </div>
  );
}