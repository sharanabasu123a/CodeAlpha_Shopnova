import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/cartStore';
import { useAuth } from '../context/authStore';
import { motion, AnimatePresence } from 'framer-motion';
import { FiX, FiPlus, FiMinus, FiTrash2, FiShoppingBag, FiChevronDown } from 'react-icons/fi';
import { discountPct, fmtINR } from '../lib/types';
import { usePreferences } from '../context/preferencesStore';

export default function CartDrawer() {
  const { setDrawer: setOpen, items, total, updateQuantity, removeItem } = useCart();
  const drawerOpen = useCart((s) => s.drawerOpen);
  const user = useAuth((s) => s.user);
  const navigate = useNavigate();
  const { showImages } = usePreferences();

  const deliveryBy = new Date(Date.now() + 4 * 86400000).toLocaleDateString('en-IN', { weekday: 'short', day: 'numeric', month: 'short' });
  const savings = items.reduce((s, i) => s + (i.mrp && i.mrp > i.price ? (i.mrp - i.price) * i.quantity : 0), 0);

  const checkout = () => {
    setOpen(false);
    navigate(user ? '/checkout' : `/login?redirect=/checkout`);
  };

  return (
    <AnimatePresence>
      {drawerOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-[70] bg-black/50 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <motion.aside
            initial={{ x: '100%' }}
            animate={{ x: 0 }}
            exit={{ x: '100%' }}
            transition={{ type: 'spring', damping: 30, stiffness: 300 }}
            className="fixed top-0 right-0 z-[80] flex h-full w-full max-w-md flex-col bg-slate-50 shadow-2xl"
          >
            {/* header */}
            <div className="flex items-center justify-between bg-white px-5 py-3.5 shadow-sm">
              <h2 className="flex items-center gap-2 text-sm font-bold text-slate-800">
                <FiShoppingBag className="text-[#2874f0]" /> My Cart
                {items.length > 0 && <span className="text-xs font-normal text-slate-500">({items.length} items)</span>}
              </h2>
              <button onClick={() => setOpen(false)} className="rounded-full p-1.5 text-slate-500 hover:bg-slate-100" aria-label="Close cart">
                <FiX />
              </button>
            </div>

            <div className="flex-1 overflow-y-auto">
              {items.length === 0 ? (
                <div className="flex h-full flex-col items-center justify-center p-8 text-center">
                  <div className="mb-4 text-6xl">🛒</div>
                  <p className="mb-1 text-lg font-semibold text-slate-700">Your cart is empty!</p>
                  <p className="mb-6 text-sm text-slate-500">Add items to it now.</p>
                  <Link to="/products" onClick={() => setOpen(false)} className="rounded-sm bg-[#2874f0] px-8 py-2.5 text-sm font-semibold text-white">
                    Shop now
                  </Link>
                </div>
              ) : (
                <>
                  <p className="flex items-center gap-1 border-b border-slate-200 bg-white px-5 py-2.5 text-xs text-slate-500">
                    <span className="flex h-4 w-4 items-center justify-center rounded-full bg-[#2874f0] text-[9px] font-bold text-white">✓</span>
                    Yay! <span className="font-semibold text-[#388e3c]">Free shipping</span> on your order · Delivery by {deliveryBy}
                  </p>

                  <div className="flex flex-col gap-3 p-4">
                    {items.map((item) => {
                      const d = discountPct(item);
                      return (
                        <div key={item._id} className="rounded-sm bg-white p-3 shadow-sm">
                          <div className="flex gap-3">
                            {showImages ? (
                              <img src={item.image} alt={item.name} className="h-20 w-20 shrink-0 rounded-sm bg-white object-contain" />
                            ) : (
                              <div className="h-20 w-20 shrink-0 rounded-sm bg-white flex items-center justify-center text-slate-400 border border-slate-100">
                                <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-6 h-6 opacity-60">
                                  <path strokeLinecap="round" strokeLinejoin="round" d="M2.25 15.75l5.159-5.159a2.25 2.25 0 013.182 0l5.159 5.159m-1.5-1.5l1.409-1.409a2.25 2.25 0 013.182 0l2.909 2.909m-18 3.75h16.5a1.5 1.5 0 001.5-1.5V6a1.5 1.5 0 00-1.5-1.5H3.75A1.5 1.5 0 002.25 6v12a1.5 1.5 0 001.5 1.5zm10.5-11.25h.008v.008h-.008V8.25zm.375 0a.375 0 11-.75 0 .375 0 01.75 0z" />
                                </svg>
                              </div>
                            )}
                            <div className="min-w-0 flex-1">
                              <p className="truncate text-sm font-medium text-slate-700">{item.name}</p>
                              <div className="mt-1 flex items-baseline gap-1.5">
                                <span className="text-base font-bold text-slate-800">{fmtINR(item.price)}</span>
                                {d > 0 && item.mrp && <span className="text-xs text-slate-400 line-through">{fmtINR(item.mrp)}</span>}
                                {d > 0 && <span className="text-xs font-semibold text-[#388e3c]">{d}% off</span>}
                              </div>
                              {/* qty controls */}
                              <div className="mt-2 flex items-center justify-between">
                                <div className="flex items-center gap-2 border border-slate-200 px-1 py-0.5 text-sm">
                                  <button onClick={() => updateQuantity(item._id, item.quantity - 1)} disabled={item.quantity <= 1} className="px-1 font-bold text-slate-600 disabled:opacity-40" aria-label="decrease">−</button>
                                  <span className="w-4 text-center text-xs font-semibold">{item.quantity}</span>
                                  <button onClick={() => updateQuantity(item._id, item.quantity + 1)} disabled={item.quantity >= item.stock} className="px-1 font-bold text-slate-600 disabled:opacity-40" aria-label="increase">+</button>
                                </div>
                                <button onClick={() => removeItem(item._id)} className="text-xs font-semibold text-[#2874f0] hover:underline">Remove</button>
                              </div>
                            </div>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                </>
              )}
            </div>

            {items.length > 0 && (
              <div className="border-t border-slate-200 bg-white p-4 shadow-[0_-4px_12px_rgba(0,0,0,0.06)]">
                {/* price details */}
                <details className="group text-xs">
                  <summary className="flex cursor-pointer items-center justify-between font-semibold text-slate-700">
                    Price Details
                    <FiChevronDown className="transition group-open:rotate-180 text-slate-400" />
                  </summary>
                  <div className="mt-2 flex flex-col gap-1.5 text-slate-600">
                    <div className="flex justify-between"><span>Price ({items.reduce((s, i) => s + i.quantity, 0)} items)</span><span>{fmtINR(items.reduce((s, i) => s + i.subtotal, 0))}</span></div>
                    {savings > 0 && <div className="flex justify-between"><span>Discount</span><span className="text-[#388e3c]">−{fmtINR(savings)}</span></div>}
                    <div className="flex justify-between"><span>Delivery Charges</span><span className="text-[#388e3c]">FREE</span></div>
                    <div className="mt-1 flex justify-between border-t border-dashed border-slate-300 pt-1.5 font-bold text-slate-800"><span>Total Amount</span><span>{fmtINR(total)}</span></div>
                  </div>
                </details>
                <button onClick={checkout} className="mt-3 w-full rounded-sm bg-[#fb641b] py-3 font-semibold text-white shadow hover:bg-[#e85c16]">
                  PLACE ORDER
                </button>
              </div>
            )}
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}