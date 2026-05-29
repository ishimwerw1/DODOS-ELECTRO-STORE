import { BrowserRouter as Router, Routes, Route, Navigate, Outlet } from 'react-router-dom';
import Navbar from './components/Navbar';
import ScrollToTop from './components/ScrollToTop';
import Footer from './components/Footer';

import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import { WishlistProvider } from './context/WishlistContext';
import { LocaleProvider } from './context/LocaleContext';
import { ThemeProvider, useTheme } from './context/ThemeContext';
import { ChatProvider } from './context/ChatContext';
import Sidebar from './components/Sidebar';
import ChatWindow from './components/ChatWindow';

// Pages
import Home from './pages/Home';
import Products from './pages/Products';
import ProductDetail from './pages/ProductDetail';
import Cart from './pages/Cart';
import Checkout from './pages/Checkout';
import Wishlist from './pages/Wishlist';
import OrderHistory from './pages/OrderHistory';
import About from './pages/About';

// Admin Pages
import AdminLayout from './pages/admin/AdminLayout';
import Dashboard from './pages/admin/Dashboard';
import ProductManagement from './pages/admin/ProductManagement';
import OrderManagement from './pages/admin/OrderManagement';
import CustomerManagement from './pages/admin/CustomerManagement';
import SlideManagement from './pages/admin/SlideManagement';
import CategoryManagement from './pages/admin/CategoryManagement';
import Settings from './pages/admin/Settings';
import StockManagement from './pages/admin/StockManagement';
import ReviewManagement from './pages/admin/ReviewManagement';
import CouponManagement from './pages/admin/CouponManagement';
import ReportManagement from './pages/admin/ReportManagement';
import ChatManagement from './pages/admin/ChatManagement';

// User Pages
import UserLayout from './pages/user/UserLayout';
import UserDashboard from './pages/user/UserDashboard';
import UserSettings from './pages/user/UserSettings';

// Auth & User Pages
import Login from './pages/Login';
import AdminLogin from './pages/AdminLogin';
import Register from './pages/Register';
import Profile from './pages/Profile';
import Contact from './pages/Contact';
import Services from './pages/Services';
import Categories from './pages/Categories';
import ForgotPassword from './pages/ForgotPassword';
import ProtectedRoute from './components/ProtectedRoute';
import VerificationGuard from './components/VerificationGuard';
import ErrorBoundary from './components/ErrorBoundary';

const ShopLayout = () => {
  const { sidebarOpen, setSidebarOpen } = useTheme();
  return (
    <div className="flex flex-col min-h-screen bg-bg-main">
      <Navbar />
      <div className="flex-1 flex pt-[158px] md:pt-[158px]">
        <Sidebar isOpen={sidebarOpen} setIsOpen={setSidebarOpen} />
        <main className="flex-1 transition-all duration-500 lg:pl-[280px] flex flex-col">
          <div className="flex-1">
            <Outlet />
          </div>
          <Footer />
        </main>
      </div>
    </div>
  );
};

function App() {
  return (
    <ErrorBoundary>
      <ThemeProvider>
        <Router>
          <ScrollToTop />
          <AuthProvider>
            <CartProvider>
              <WishlistProvider>
                <LocaleProvider>
                  <ChatProvider>
                    <div className="flex flex-col min-h-screen">
                    <VerificationGuard>
                      <Routes>
                      {/* Admin Routes */}
                      <Route path="/admin" element={
                        <ProtectedRoute adminOnly={true}>
                          <ErrorBoundary>
                            <AdminLayout />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }>
                        <Route index element={<Dashboard />} />
                        <Route path="products" element={<ProductManagement />} />
                        <Route path="orders" element={<OrderManagement />} />
                        <Route path="customers" element={<CustomerManagement />} />
                        <Route path="slides" element={<SlideManagement />} />
                        <Route path="categories" element={<CategoryManagement />} />
                        <Route path="stock" element={<StockManagement />} />
                        <Route path="reports" element={<ReportManagement />} />
                        <Route path="reviews" element={<ReviewManagement />} />
                        <Route path="coupons" element={<CouponManagement />} />
                        <Route path="chat" element={<ChatManagement />} />
                        <Route path="settings" element={<Settings />} />
                      </Route>

                      {/* User Dashboard Routes */}
                      <Route path="/dashboard" element={
                        <ProtectedRoute>
                          <ErrorBoundary>
                            <UserLayout />
                          </ErrorBoundary>
                        </ProtectedRoute>
                      }>
                        <Route index element={<UserDashboard />} />
                        <Route path="orders" element={<OrderHistory />} />
                        <Route path="wishlist" element={<Wishlist />} />
                        <Route path="settings" element={<UserSettings />} />
                      </Route>

                      {/* Main Shop Routes with Layout */}
                      <Route path="/" element={<ShopLayout />}>
                        {/* Public — no login needed */}
                        <Route index element={<Home />} />
                        <Route path="products" element={<Products />} />
                        <Route path="services" element={<Services />} />
                        <Route path="categories" element={<Categories />} />
                        <Route path="about" element={<About />} />
                        <Route path="product/:id" element={<ProductDetail />} />
                        <Route path="contact" element={<Contact />} />
                        <Route path="login" element={<Login />} />
                        <Route path="admin/login" element={<AdminLogin />} />
                        <Route path="register" element={<Register />} />
                        <Route path="forgot-password" element={<ForgotPassword />} />

                        {/* Protected — login required */}
                        <Route path="cart" element={<ProtectedRoute><Cart /></ProtectedRoute>} />
                        <Route path="checkout" element={<ProtectedRoute><Checkout /></ProtectedRoute>} />
                        <Route path="wishlist" element={<ProtectedRoute><Wishlist /></ProtectedRoute>} />
                        <Route path="orders" element={<ProtectedRoute><OrderHistory /></ProtectedRoute>} />
                        <Route path="profile" element={<ProtectedRoute><Navigate to="/dashboard/settings" replace /></ProtectedRoute>} />
                      </Route>
                      
                      {/* Redirects */}
                      <Route path="/shop" element={<Navigate to="/products" replace />} />
                      {/* Fallback catch-all for any other unmatched routes */}
                      <Route path="*" element={<Navigate to="/" replace />} />
                      </Routes>
                    </VerificationGuard>
                    <ChatWindow />
                  </div>
                </ChatProvider>
              </LocaleProvider>
              </WishlistProvider>
            </CartProvider>
          </AuthProvider>
        </Router>
      </ThemeProvider>
    </ErrorBoundary>
  );
}

export default App;