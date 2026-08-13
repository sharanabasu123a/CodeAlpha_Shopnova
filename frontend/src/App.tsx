import { useEffect, lazy, Suspense } from 'react';
import { Routes, Route, useLocation } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import Navbar from './components/Navbar';
import Footer from './components/Footer';
import BottomNav from './components/BottomNav';
import CartDrawer from './components/CartDrawer';
import ToastHost from './components/ToastHost';
import LoadingScreen from './components/LoadingScreen';
import RequireAuth from './components/RequireAuth';
import { useAuth } from './context/authStore';
import { useCart } from './context/cartStore';

const HomePage = lazy(() => import('./pages/HomePage'));
const ProductListPage = lazy(() => import('./pages/ProductListPage'));
const ProductDetailPage = lazy(() => import('./pages/ProductDetailPage'));
const LoginPage = lazy(() => import('./pages/LoginPage'));
const RegisterPage = lazy(() => import('./pages/RegisterPage'));
const CheckoutPage = lazy(() => import('./pages/CheckoutPage'));
const OrderSuccessPage = lazy(() => import('./pages/OrderSuccessPage'));
const OrdersPage = lazy(() => import('./pages/OrdersPage'));
const OrderDetailPage = lazy(() => import('./pages/OrderDetailPage'));
const ProfilePage = lazy(() => import('./pages/ProfilePage'));
const NotFoundPage = lazy(() => import('./pages/NotFoundPage'));
const AdminDashboardPage = lazy(() => import('./pages/admin/AdminDashboardPage'));
const AdminProductsPage = lazy(() => import('./pages/admin/AdminProductsPage'));
const AdminProductFormPage = lazy(() => import('./pages/admin/AdminProductFormPage'));
const AdminOrdersPage = lazy(() => import('./pages/admin/AdminOrdersPage'));

const pageVariants = {
  initial: { opacity: 0, y: 14, scale: 0.985, filter: 'blur(6px)' },
  animate: { opacity: 1, y: 0, scale: 1, filter: 'blur(0px)' },
  exit: { opacity: 0, y: -10, scale: 0.99, filter: 'blur(4px)' },
};

const transition = { duration: 0.5, ease: [0.22, 1, 0.36, 1] as const };

// Hide global chrome on the checkout page for focus (per navigation.md §6)
const isBare = (pathname: string) => pathname === '/checkout';

export default function App() {
  const location = useLocation();
  const loadProfile = useAuth((s) => s.loadProfile);
  const initialized = useAuth((s) => s.initialized);
  const fetchCart = useCart((s) => s.fetchCart);

  useEffect(() => {
    loadProfile();
  }, [loadProfile]);

  useEffect(() => {
    if (initialized && useAuth.getState().user) fetchCart();
  }, [initialized, fetchCart]);

  const bare = isBare(location.pathname);

  return (
    <div className="min-h-screen">
      <Suspense fallback={<LoadingScreen />}>
        <AnimatePresence mode="wait">
          {!initialized ? (
            <LoadingScreen key="loader" />
          ) : (
            <motion.div key={location.pathname} initial="initial" animate="animate" exit="exit" variants={pageVariants} transition={transition}>
              {!bare && <Navbar />}
              <Routes location={location}>
                <Route path="/" element={<HomePage />} />
                <Route path="/products" element={<ProductListPage />} />
                <Route path="/product/:id" element={<ProductDetailPage />} />
                <Route path="/login" element={<LoginPage />} />
                <Route path="/register" element={<RegisterPage />} />
                <Route path="/checkout" element={<RequireAuth><CheckoutPage /></RequireAuth>} />
                <Route path="/order-success/:orderId" element={<RequireAuth><OrderSuccessPage /></RequireAuth>} />
                <Route path="/orders" element={<RequireAuth><OrdersPage /></RequireAuth>} />
                <Route path="/orders/:id" element={<RequireAuth><OrderDetailPage /></RequireAuth>} />
                <Route path="/profile" element={<RequireAuth><ProfilePage /></RequireAuth>} />
                <Route path="/admin" element={<RequireAuth admin><AdminDashboardPage /></RequireAuth>} />
                <Route path="/admin/products" element={<RequireAuth admin><AdminProductsPage /></RequireAuth>} />
                <Route path="/admin/products/new" element={<RequireAuth admin><AdminProductFormPage /></RequireAuth>} />
                <Route path="/admin/products/:id/edit" element={<RequireAuth admin><AdminProductFormPage /></RequireAuth>} />
                <Route path="/admin/orders" element={<RequireAuth admin><AdminOrdersPage /></RequireAuth>} />
                <Route path="*" element={<NotFoundPage />} />
              </Routes>
              {!bare && <Footer />}
            </motion.div>
          )}
        </AnimatePresence>
      </Suspense>
      <CartDrawer />
      <ToastHost />
      {!bare && <BottomNav />}
    </div>
  );
}