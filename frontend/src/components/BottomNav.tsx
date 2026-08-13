import { Link, useLocation } from 'react-router-dom';
import { FiHome, FiShoppingBag, FiPackage, FiGrid } from 'react-icons/fi';
import { useCart } from '../context/cartStore';
import { useAuth } from '../context/authStore';
import { FaUser } from 'react-icons/fa';

export default function BottomNav() {
  const location = useLocation();
  const count = useCart((s) => s.count());
  const user = useAuth((s) => s.user);
  const openDrawer = useCart((s) => s.setDrawer);

  const tabs = [
    { label: 'Home', to: '/', icon: <FiHome /> },
    { label: 'Products', to: '/products', icon: <FiShoppingBag /> },
  ];
  const cartTab = (
    <button onClick={() => openDrawer(true)} className="relative flex flex-col items-center gap-0.5 pt-2 text-[10px]">
      <FiPackage className="text-lg" />
      {count > 0 && (
        <span className="absolute -top-0.5 right-1/2 translate-x-3 flex h-4 min-w-4 items-center justify-center rounded-full bg-gradient-to-r from-primary to-secondary px-0.5 text-[9px] font-bold text-white">
          {count}
        </span>
      )}
      Cart
    </button>
  );
  const ordersTab = (
    <Link to="/orders" className="flex flex-col items-center gap-0.5 pt-2 text-[10px]">
      <FiGrid className="text-lg" /> Orders
    </Link>
  );
  const profileLink = user ? (
    <Link to="/profile" className="flex flex-col items-center gap-0.5 pt-2 text-[10px]">
      <FaUser className="text-lg" /> Profile
    </Link>
  ) : (
    <Link to="/login" className="flex flex-col items-center gap-0.5 pt-2 text-[10px]">
      <FaUser className="text-lg" /> Login
    </Link>
  );

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-40 flex items-stretch justify-around border-t border-white/10 bg-base/90 pb-[env(safe-area-inset-bottom)] backdrop-blur-xl md:hidden">
      {tabs.map((t) => {
        const active = location.pathname === t.to;
        return (
          <Link
            key={t.label}
            to={t.to}
            className={`flex flex-col items-center gap-0.5 pt-2 text-[10px] ${active ? 'text-aurora' : 'text-slate-400'}`}
          >
            {t.icon} {t.label}
          </Link>
        );
      })}
      {cartTab}
      {ordersTab}
      {profileLink}
    </nav>
  );
}