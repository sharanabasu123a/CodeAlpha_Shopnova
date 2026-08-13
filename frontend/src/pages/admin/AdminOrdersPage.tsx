import { useEffect, useState } from 'react';
import { api, apiErrorMessage } from '../../lib/api';
import type { Order } from '../../lib/types';

const STATUSES = ['All', 'Pending', 'Confirmed', 'Shipped', 'Delivered'];
const NEXT: Record<string, string> = { Pending: 'Confirmed', Confirmed: 'Shipped', Shipped: 'Delivered', Delivered: 'Delivered' };
const statusColor: Record<Order['status'], string> = {
  Pending: 'bg-yellow-400/15 text-yellow-300',
  Confirmed: 'bg-secondary/15 text-cyan-300',
  Shipped: 'bg-primary/20 text-purple-300',
  Delivered: 'bg-success/15 text-green-300',
};

type AdminOrder = Order & { userId?: { _id: string; name: string; email: string; phone: string } };

export default function AdminOrdersPage() {
  const [orders, setOrders] = useState<AdminOrder[]>([]);
  const [status, setStatus] = useState('All');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    setLoading(true);
    const q = new URLSearchParams();
    if (status !== 'All') q.set('status', status);
    api.get(`/api/admin/orders?${q.toString()}`)
      .then((r) => setOrders(r.data.orders))
      .finally(() => setLoading(false));
  }, [status]);

  const advance = async (id: string, next: string) => {
    try {
      await api.put(`/api/admin/order/${id}/status`, { status: next });
      setOrders((os) => os.map((o) => (o._id === id ? { ...o, status: next as AdminOrder['status'] } : o)));
      window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: `Order marked ${next}`, type: 'success' } }));
    } catch (e) {
      window.dispatchEvent(new CustomEvent('agc:toast', { detail: { msg: apiErrorMessage(e), type: 'error' } }));
    }
  };

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-16">
      <h1 className="mb-6 font-display text-3xl font-bold">Order <span className="text-aurora">Management</span></h1>

      <div className="mb-6 flex flex-wrap gap-2">
        {STATUSES.map((s) => (
          <button
            key={s}
            onClick={() => setStatus(s)}
            className={`rounded-full px-4 py-2 text-sm font-medium transition ${
              status === s ? 'bg-gradient-to-r from-primary to-secondary text-white' : 'bg-white/5 text-slate-300 hover:bg-white/10'
            }`}
          >
            {s}
          </button>
        ))}
      </div>

      {loading ? (
        <div className="skeleton h-64" />
      ) : orders.length === 0 ? (
        <div className="glass rounded-3xl py-16 text-center text-subtitle">No orders with this status.</div>
      ) : (
        <div className="flex flex-col gap-4">
          {orders.map((o) => (
            <div key={o._id} className="glass rounded-2xl p-5">
              <div className="flex flex-wrap items-center justify-between gap-3">
                <div>
                  <div className="flex items-center gap-2">
                    <p className="font-mono text-sm font-bold text-aurora">#{o._id.slice(-8).toUpperCase()}</p>
                    <span className={`rounded-full px-2.5 py-0.5 text-xs font-semibold ${statusColor[o.status]}`}>{o.status}</span>
                  </div>
                  <p className="mt-1 text-xs text-subtitle">
                    {o.userId?.name || 'Customer'} · {o.userId?.email || ''} · {o.paymentMethod}
                  </p>
                  <p className="text-[11px] text-subtitle">
                    {new Date(o.createdAt).toLocaleString('en-IN')} · {o.address.city}, {o.address.state}
                  </p>
                </div>
                <div className="flex items-center gap-4">
                  <span className="font-display text-xl font-bold">₹{o.totalPrice.toLocaleString('en-IN')}</span>
                  {o.status !== 'Delivered' && (
                    <button onClick={() => advance(o._id, NEXT[o.status])} className="btn-primary rounded-xl px-4 py-2 text-sm font-semibold text-white">
                      Mark {NEXT[o.status]}
                    </button>
                  )}
                </div>
              </div>
              <div className="mt-3 flex gap-2">
                {o.products.map((p) => (
                  <div key={p.productId} className="flex items-center gap-2 rounded-xl bg-white/5 px-2.5 py-1.5 text-xs">
                    <img src={p.image} alt={p.name} className="h-7 w-7 rounded bg-white/10 object-cover" />
                    <span className="text-slate-300">{p.name} ×{p.quantity}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}