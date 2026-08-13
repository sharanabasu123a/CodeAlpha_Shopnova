import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { FiShoppingBag, FiDollarSign, FiBox, FiUsers, FiTrendingUp, FiAlertTriangle } from 'react-icons/fi';
import { motion } from 'framer-motion';
import { api } from '../../lib/api';
import type { Order } from '../../lib/types';

interface Stats {
  orderCount: number;
  revenue: number;
  todayOrders: number;
  userCount: number;
  productCount: number;
  lowStock: number;
}

const statusColor: Record<Order['status'], string> = {
  Pending: 'bg-yellow-400/15 text-yellow-300',
  Confirmed: 'bg-secondary/15 text-cyan-300',
  Shipped: 'bg-primary/20 text-purple-300',
  Delivered: 'bg-success/15 text-green-300',
};

export default function AdminDashboardPage() {
  const [stats, setStats] = useState<Stats | null>(null);
  const [recent, setRecent] = useState<Order[]>([]);

  useEffect(() => {
    api.get('/api/admin/stats').then((r) => {
      setStats(r.data.stats);
      setRecent(r.data.recentOrders);
    }).catch(() => {});
  }, []);

  const cards = stats
    ? [
        { label: 'Orders', value: stats.orderCount.toLocaleString('en-IN'), icon: <FiShoppingBag />, color: 'text-primary' },
        { label: 'Revenue', value: `₹${stats.revenue.toLocaleString('en-IN')}`, icon: <FiDollarSign />, color: 'text-success' },
        { label: 'Today', value: stats.todayOrders.toLocaleString('en-IN'), icon: <FiTrendingUp />, color: 'text-secondary' },
        { label: 'Products', value: stats.productCount.toLocaleString('en-IN'), icon: <FiBox />, color: 'text-purple-300' },
        { label: 'Users', value: stats.userCount.toLocaleString('en-IN'), icon: <FiUsers />, color: 'text-cyan-300' },
      ]
    : [];

  return (
    <div className="mx-auto max-w-7xl px-4 pt-24 pb-16">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-3">
        <div>
          <h1 className="font-display text-3xl font-bold">Admin <span className="text-aurora">Dashboard</span></h1>
          <p className="mt-1 text-sm text-subtitle">Manage your catalog and fulfill orders.</p>
        </div>
        <div className="flex gap-2">
          <Link to="/admin/products/new" className="btn-primary rounded-xl px-4 py-2.5 text-sm font-semibold text-white">
            + Add Product
          </Link>
          <Link to="/admin/orders" className="rounded-xl bg-white/5 px-4 py-2.5 text-sm font-semibold hover:bg-white/10">
            View Orders
          </Link>
        </div>
      </div>

      {/* stats */}
      <div className="grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-5">
        {cards.map((c, i) => (
          <motion.div key={c.label} initial={{ opacity: 0, y: 14 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }} className="glass rounded-2xl p-5">
            <span className={`text-2xl ${c.color}`}>{c.icon}</span>
            <p className="mt-2 font-display text-2xl font-bold">{c.value}</p>
            <p className="text-xs text-subtitle">{c.label}</p>
          </motion.div>
        ))}
      </div>

      {stats && stats.lowStock > 0 && (
        <div className="mt-6 flex items-center gap-3 rounded-2xl border border-yellow-400/30 bg-yellow-400/10 px-5 py-4 text-sm">
          <FiAlertTriangle className="text-yellow-400" />
          <span>
            <strong className="text-yellow-200">{stats.lowStock}</strong> product{stats.lowStock > 1 ? 's' : ''} running low on stock (≤ 5).
          </span>
          <Link to="/admin/products" className="ml-auto text-yellow-300 hover:underline">Review</Link>
        </div>
      )}

      {/* recent orders */}
      <div className="glass mt-8 rounded-3xl p-6">
        <h2 className="mb-4 font-semibold">Recent Orders</h2>
        {recent.length === 0 ? (
          <p className="py-8 text-center text-sm text-subtitle">No orders yet.</p>
        ) : (
          <div className="flex flex-col gap-2">
            {recent.map((o) => (
              <Link key={o._id} to={`/admin/orders`} className="flex items-center justify-between rounded-xl bg-white/5 px-4 py-3 hover:bg-white/10">
                <div>
                  <p className="font-mono text-sm font-semibold text-aurora">#{o._id.slice(-8).toUpperCase()}</p>
                  <p className="text-xs text-subtitle">
                    {(o as Order & { userId?: { name?: string; email?: string } }).userId?.name || 'customer'} · {new Date(o.createdAt).toLocaleDateString('en-IN')}
                  </p>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`rounded-full px-3 py-1 text-xs font-semibold ${statusColor[o.status]}`}>{o.status}</span>
                  <span className="font-semibold">₹{o.totalPrice.toLocaleString('en-IN')}</span>
                </div>
              </Link>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}