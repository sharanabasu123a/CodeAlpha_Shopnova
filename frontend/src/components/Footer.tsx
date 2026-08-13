import { Link } from 'react-router-dom';
import { FaInstagram, FaGithub, FaTwitter } from 'react-icons/fa';
import { FiArrowUp } from 'react-icons/fi';

export default function Footer() {
  return (
    <footer className="relative mt-16 border-t border-white/10 bg-base/60 pt-12 pb-24 md:pb-12">
      <div className="mx-auto max-w-7xl px-6">
        <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-4">
          <div>
            <p className="mb-3 flex items-center gap-2 font-display text-lg font-bold">
              <span className="flex h-8 w-8 items-center justify-center rounded-xl bg-gradient-to-br from-primary to-secondary text-white">S</span>
              Shop<span className="text-aurora">Nova</span>
            </p>
            <p className="text-sm text-subtitle">
              Shop Nova — electronics, fashion, shoes, watches & gaming, delivered fast with great prices.
            </p>
          </div>
          <div>
            <p className="mb-3 font-semibold">Shop</p>
            <ul className="space-y-2 text-sm text-subtitle">
              <li><Link className="hover:text-white" to="/products">All Products</Link></li>
              <li><Link className="hover:text-white" to="/products?category=Electronics">Electronics</Link></li>
              <li><Link className="hover:text-white" to="/products?category=Fashion">Fashion</Link></li>
              <li><Link className="hover:text-white" to="/products?category=Gaming">Gaming</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold">Account</p>
            <ul className="space-y-2 text-sm text-subtitle">
              <li><Link className="hover:text-white" to="/login">Login</Link></li>
              <li><Link className="hover:text-white" to="/register">Create Account</Link></li>
              <li><Link className="hover:text-white" to="/orders">Order History</Link></li>
            </ul>
          </div>
          <div>
            <p className="mb-3 font-semibold">Follow</p>
            <div className="flex gap-3">
              {[FaInstagram, FaGithub, FaTwitter].map((Icon, i) => (
                <span key={i} className="flex h-10 w-10 cursor-pointer items-center justify-center rounded-xl bg-white/5 text-slate-300 transition hover:bg-white/10 hover:text-white">
                  <Icon />
                </span>
              ))}
            </div>
            <button
              onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
              className="mt-6 flex items-center gap-2 rounded-xl bg-white/5 px-4 py-2 text-sm text-slate-300 hover:bg-white/10"
            >
              <FiArrowUp /> Back to top
            </button>
          </div>
        </div>
        <p className="mt-10 border-t border-white/10 pt-6 text-center text-xs text-subtitle">
          © {new Date().getFullYear()} Shop Nova · CodeAlpha Task 1
        </p>
      </div>
    </footer>
  );
}