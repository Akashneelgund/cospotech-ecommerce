import React from 'react';
import { BrowserRouter, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';

// Layout Components
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { CartDrawer } from './components/layout/CartDrawer';
import { Toast } from './components/common/Toast';

// Storefront Pages
import { HomePage } from './pages/HomePage';
import { ShopPage } from './pages/ShopPage';
import { ProductDetailsPage } from './pages/ProductDetailsPage';
import { OffersPage } from './pages/OffersPage';
import { CartPage } from './pages/CartPage';
import { WishlistPage } from './pages/WishlistPage';
import { CheckoutPage } from './pages/CheckoutPage';
import { OrderConfirmationPage } from './pages/OrderConfirmationPage';
import { AccountPage } from './pages/AccountPage';
import { InvoicePage } from './pages/InvoicePage';
import { LoginPage } from './pages/LoginPage';
import { RegisterPage } from './pages/RegisterPage';

// Common Floating & Navigation Components
import { WhatsAppButton } from './components/common/WhatsAppButton';
import { MobileBottomNav } from './components/layout/MobileBottomNav';

// Admin Suite Pages
import { AdminLayout } from './pages/admin/AdminLayout';
import { AdminDashboard } from './pages/admin/AdminDashboard';
import { AdminProducts } from './pages/admin/AdminProducts';
import { AdminInventory } from './pages/admin/AdminInventory';
import { AdminOrders } from './pages/admin/AdminOrders';
import { AdminCustomers } from './pages/admin/AdminCustomers';
import { AdminImport } from './pages/admin/AdminImport';
import { AdminBanners } from './pages/admin/AdminBanners';
import { AdminFlashSales } from './pages/admin/AdminFlashSales';
import { AdminAbandonedCarts } from './pages/admin/AdminAbandonedCarts';

export const App: React.FC = () => {
  return (
    <AuthProvider>
      <CartProvider>
        <WishlistProvider>
          <BrowserRouter>
            <div className="flex flex-col min-h-screen">
              <Toast />
              <CartDrawer />

              <Routes>
                {/* Admin Routes (Custom Layout without Storefront Header/Footer) */}
                <Route path="/admin" element={<AdminLayout />}>
                  <Route index element={<AdminDashboard />} />
                  <Route path="products" element={<AdminProducts />} />
                  <Route path="inventory" element={<AdminInventory />} />
                  <Route path="orders" element={<AdminOrders />} />
                  <Route path="customers" element={<AdminCustomers />} />
                  <Route path="banners" element={<AdminBanners />} />
                  <Route path="flash-sales" element={<AdminFlashSales />} />
                  <Route path="abandoned-carts" element={<AdminAbandonedCarts />} />
                  <Route path="import" element={<AdminImport />} />
                </Route>

                {/* Print Invoice Page (Isolated without Header/Footer) */}
                <Route path="/invoice/:orderId" element={<InvoicePage />} />

                {/* Main Customer Storefront Routes */}
                <Route
                  path="*"
                  element={
                    <div className="flex flex-col min-h-screen pb-20 md:pb-0">
                      <Header />
                      <main className="flex-1">
                        <Routes>
                          <Route path="/" element={<HomePage />} />
                          <Route path="/shop" element={<ShopPage />} />
                          <Route path="/offers" element={<OffersPage />} />
                          <Route path="/products/:slug" element={<ProductDetailsPage />} />
                          <Route path="/cart" element={<CartPage />} />
                          <Route path="/wishlist" element={<WishlistPage />} />
                          <Route path="/checkout" element={<CheckoutPage />} />
                          <Route path="/order-success/:orderId" element={<OrderConfirmationPage />} />
                          <Route path="/account" element={<AccountPage />} />
                          <Route path="/login" element={<LoginPage />} />
                          <Route path="/register" element={<RegisterPage />} />
                        </Routes>
                      </main>
                      <Footer />
                      <WhatsAppButton />
                      <MobileBottomNav
                        onOpenSearch={() => window.dispatchEvent(new CustomEvent('open-search'))}
                      />
                    </div>
                  }
                />
              </Routes>
            </div>
          </BrowserRouter>
        </WishlistProvider>
      </CartProvider>
    </AuthProvider>
  );
};

export default App;
