import { Routes, Route, Navigate } from 'react-router-dom';
import { Suspense, lazy } from 'react';

// Layout components
import Header from './components/Header';
import Footer from './components/Footer';
import CartDrawer from './components/CartDrawer';
import AdminGuard from './components/AdminGuard';

// Public pages
import Home from './pages/Home';
import CategoryPage from './pages/CategoryPage';
import ProductPage from './pages/ProductPage';
import SearchPage from './pages/SearchPage';
import CheckoutPage from './pages/CheckoutPage';
import OrderSuccessPage from './pages/OrderSuccessPage';

// Admin pages
import AdminLogin from './admin/AdminLogin';
import AdminLayout from './admin/AdminLayout';
import AdminDashboard from './admin/AdminDashboard';
import AdminCategories from './admin/AdminCategories';
import AdminCategoryProducts from './admin/AdminCategoryProducts';
import AdminProducts from './admin/AdminProducts';
import AdminOrders from './admin/AdminOrders';
import AdminSettings from './admin/AdminSettings';

function ShopLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <CartDrawer />
      <main className="flex-1">{children}</main>
      <Footer />
    </div>
  );
}

function LoadingSpinner() {
  return (
    <div className="min-h-screen flex items-center justify-center">
      <div className="animate-spin rounded-full h-12 w-12 border-4 border-primary border-t-transparent" />
    </div>
  );
}

export default function App() {
  return (
    <Suspense fallback={<LoadingSpinner />}>
      <Routes>
        {/* ── Public store routes ── */}
        <Route path="/" element={<ShopLayout><Home /></ShopLayout>} />
        <Route path="/category/:slug" element={<ShopLayout><CategoryPage /></ShopLayout>} />
        <Route path="/product/:slug" element={<ShopLayout><ProductPage /></ShopLayout>} />
        <Route path="/search" element={<ShopLayout><SearchPage /></ShopLayout>} />
        <Route path="/checkout" element={<ShopLayout><CheckoutPage /></ShopLayout>} />
        <Route path="/order-success" element={<ShopLayout><OrderSuccessPage /></ShopLayout>} />

        {/* ── Admin routes ── */}
        <Route path="/admin/login" element={<AdminLogin />} />
        <Route
          path="/admin"
          element={
            <AdminGuard>
              <AdminLayout />
            </AdminGuard>
          }
        >
          <Route index element={<AdminDashboard />} />
          <Route path="categories" element={<AdminCategories />} />
          <Route path="categories/:categoryId/products" element={<AdminCategoryProducts />} />
          <Route path="products" element={<AdminProducts />} />
          <Route path="orders" element={<AdminOrders />} />
          <Route path="settings" element={<AdminSettings />} />
        </Route>

        {/* ── Fallback ── */}
        <Route path="*" element={<Navigate to="/" replace />} />
      </Routes>
    </Suspense>
  );
}
