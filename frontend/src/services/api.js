import axios from 'axios';

// Get API URL from environment or fallback to local development URL
const API_URL =
  import.meta.env.VITE_API_URL ||
  'https://dodos-electro-store.onrender.com/api';

console.log('API URL being used:', API_URL); // Debugging line for console

const api = axios.create({
  baseURL: API_URL,
  headers: {
    'Content-Type': 'application/json'
  },
  withCredentials: true 
});

// Add auth token to requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('dodos_token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Auth APIs
export const authAPI = {
  register: (data) => api.post('/auth/register', data),
  verifyEmail: (code) => api.post('/auth/verify-email', { code }),
  resendVerification: () => api.post('/auth/resend-verification'),
  login: (data) => api.post('/auth/login', data),
  googleAuth: (credential) => api.post('/auth/google', { credential }),
  getMe: () => api.get('/auth/me'),
  getPublicSettings: () => api.get('/auth/settings'),
  updateProfile: (data) => api.put('/auth/profile', data),
  getDashboard: () => api.get('/auth/dashboard'),
  forgotPassword:    (data)       => api.post('/auth/forgot-password', data),
  verifyResetCode:   (data)       => api.post('/auth/verify-code', data),
  resetPassword:     (data)       => api.put('/auth/reset-password', data),
  deleteAccount:     ()           => api.delete('/auth/account')
};

// Product APIs
export const productAPI = {
  getProducts: (params) => api.get('/products', { params }),
  getProduct: (id) => api.get(`/products/${id}`),
  createProduct: (data) => api.post('/products', data),
  updateProduct: (id, data) => api.put(`/products/${id}`, data),
  deleteProduct: (id) => api.delete(`/products/${id}`),
  getCategories: () => api.get('/products/categories')
};

// Slide APIs
export const slideAPI = {
  getSlides: () => api.get('/slides'),
  getAllSlides: () => api.get('/slides/admin'),
  createSlide: (data) => api.post('/slides', data),
  updateSlide: (id, data) => api.put(`/slides/${id}`, data),
  deleteSlide: (id) => api.delete(`/slides/${id}`)
};

// Cart APIs
export const cartAPI = {
  getCart: () => api.get('/cart'),
  addToCart: (data) => api.post('/cart', data),
  updateCartItem: (productId, data) => api.put(`/cart/${productId}`, data),
  removeFromCart: (productId) => api.delete(`/cart/${productId}`),
  clearCart: () => api.delete('/cart')
};

// Wishlist APIs
export const wishlistAPI = {
  getWishlist: () => api.get('/wishlist'),
  addToWishlist: (data) => api.post('/wishlist', data),
  removeFromWishlist: (productId) => api.delete(`/wishlist/${productId}`),
  clearWishlist: () => api.delete('/wishlist')
};

// Order APIs
export const orderAPI = {
  createOrder: (data) => api.post('/orders', data),
  getOrders: () => api.get('/orders/my-orders'),
  getOrder: (id) => api.get(`/orders/${id}`)
};

// Admin API
export const adminAPI = {
  getStats:          ()           => api.get('/admin/stats'),
  getCustomers:      ()           => api.get('/admin/customers'),
  getAllOrders:       ()           => api.get('/orders/all'),
  updateOrderStatus: (id, status) => api.put(`/orders/${id}/status`, { status }),
  deleteOrder:       (id)         => api.delete(`/orders/${id}`),
  getSettings:       ()           => api.get('/admin/settings'),
  updateSettings:    (data)       => api.put('/admin/settings', data),
  resetSettings:     ()           => api.post('/admin/settings/reset'),
  // Stock management
  getStockReport:    ()           => api.get('/admin/stock'),
  updateStock:       (id, data)   => api.put(`/admin/stock/${id}`, data),
  bulkRestock:       (updates)    => api.post('/admin/stock/bulk', { updates }),
  getSalesReport:    (params)     => api.get('/admin/stock/sales-report', { params }),
  // Categories (using admin routes)
  getAllCategories:  ()           => api.get('/admin/categories'),
  createCategory:    (data)       => api.post('/admin/categories', data),
  updateCategory:    (id, data)   => api.put(`/admin/categories/${id}`, data),
  deleteCategory:    (id)         => api.delete(`/admin/categories/${id}`),
  // Coupons (using coupon routes)
  getCoupons:        ()           => api.get('/coupons'),
  createCoupon:      (data)       => api.post('/coupons', data),
  updateCoupon:      (id, data)   => api.put(`/coupons/${id}`, data),
  deleteCoupon:      (id)         => api.delete(`/coupons/${id}`),
};

// Category APIs
export const categoryAPI = {
  getCategories: () => api.get('/categories'),
  getAllCategories: () => api.get('/categories/admin'),
  createCategory: (data) => api.post('/categories', data),
  updateCategory: (id, data) => api.put(`/categories/${id}`, data),
  deleteCategory: (id) => api.delete(`/categories/${id}`)
};

// Coupon APIs
export const couponAPI = {
  getCoupons:        ()           => api.get('/coupons'),
  createCoupon:      (data)       => api.post('/coupons', data),
  updateCoupon:      (id, data)   => api.put(`/coupons/${id}`, data),
  deleteCoupon:      (id)         => api.delete(`/coupons/${id}`)
};

// Notification APIs
export const notificationAPI = {
  getNotifications: () => api.get('/notifications'),
  markAsRead: (id) => api.patch(`/notifications/${id}/read`),
  markAllAsRead: () => api.patch('/notifications/read-all'),
  deleteNotification: (id) => api.delete(`/notifications/${id}`)
};

// Chat APIs
export const chatAPI = {
  getAdminId: () => api.get('/chat/admin'),
  getUnreadCount: () => api.get('/chat/unread/count'),
  getConversations: () => api.get('/chat/conversations'),
  getConversation: (otherUserId) => api.get(`/chat/${otherUserId}`),
  sendMessage: (data) => api.post('/chat', data),
  editMessage: (messageId, text) => api.put(`/chat/${messageId}`, { text }),
  deleteMessage: (messageId) => api.delete(`/chat/${messageId}`)
};

// AI APIs
export const aiAPI = {
  chat: (message, history) => api.post('/ai/chat', { message, history })
};

// Admin APIs
export const reviewAPI = {
  getReviews: () => api.get('/reviews'),
  getAllReviews: () => api.get('/reviews/admin'),
  createReview: (data) => api.post('/reviews', data),
  deleteReview: (id) => api.delete(`/reviews/${id}`)
};

// Subscriber APIs
export const subscriberAPI = {
  subscribe: (email) => api.post('/subscribers', { email }),
  getSubscribers: () => api.get('/subscribers')
};

export default api;

