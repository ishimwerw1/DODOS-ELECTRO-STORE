import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaUser, FaSearch, FaTimes, FaChevronDown,
  FaBoxOpen, FaRegHeart, FaHeadset, FaBars, FaBolt, FaSignOutAlt, FaCog, FaHistory, FaShieldAlt,
  FaBell, FaTrash, FaEnvelopeOpen, FaBox, FaCommentDots
} from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useAuth } from '../context/AuthContext';
import { useLocale } from '../context/LocaleContext';
import { useChat } from '../context/ChatContext';
import { notificationAPI } from '../services/api';
import TopHeader from './TopHeader';

const Navbar = () => {
  const { totalItems, totalPrice } = useCart();
  const { isLoggedIn, user, logout, settings } = useAuth();
  const { formatPrice, t } = useLocale();
  const { unreadCount: chatUnreadCount, openChat } = useChat();
  const navigate = useNavigate();
  const location = useLocation();

  const [scrolled, setScrolled] = useState(false);
  const [isOpen, setIsOpen] = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchVal, setSearchVal] = useState('');
  const [searchFocus, setSearchFocus] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef = useRef(null);
  const notificationRef = useRef(null);

  const storeName = settings?.general?.storeName || 'DODOS';
  const logoUrl = settings?.general?.logoUrl;

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000); // Keep at 60s
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (profileMenuRef.current && !profileMenuRef.current.contains(event.target)) {
        setShowProfileMenu(false);
      }
      if (notificationRef.current && !notificationRef.current.contains(event.target)) {
        setShowNotifications(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
    } catch (error) {
      console.error('Error fetching notifications:', error);
    }
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch (error) {
      console.error('Error marking as read:', error);
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch (error) {
      console.error('Error marking all as read:', error);
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch (error) {
      console.error('Error deleting notification:', error);
    }
  };

  useEffect(() => { setScrolled(window.scrollY > 50); }, []);

  useEffect(() => { setIsOpen(false); setShowProfileMenu(false); }, [location.pathname]);

  const navLinks = [
    { label: 'Home', path: '/' },
    { label: 'Shop', path: '/products' },
    { label: 'Categories', path: '/categories' },
    { label: 'Services', path: '/services' },
    { label: 'Track Order', path: '/orders' },
    { label: 'About', path: '/about' },
    { label: 'Contact', path: '/contact' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
    }
  };

  const isActive = (path) =>
    path === '/'
      ? location.pathname === '/'
      : location.pathname.startsWith(path.split('?')[0]);

  const initials = user?.fullName
    ? user.fullName.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()
    : 'JD';

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'shadow-[0_10px_40px_rgba(0,0,0,0.6)]' : ''
        }`}
      >
        <TopHeader />

      <div
          className={`w-full transition-all duration-500 ${
            scrolled
              ? 'bg-white/95 backdrop-blur-xl h-[64px] shadow-md'
              : 'bg-white h-[80px] shadow-sm'
          } border-b border-gray-200`}
        >
          <div className="max-w-[1600px] mx-auto h-full flex items-center gap-8 px-4 xl:px-8">
            
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              {/* Logo mark */}
              <div className="relative flex-shrink-0">
                <div className="w-12 h-12 bg-gradient-to-br from-green-400 to-green-600 rounded-2xl flex items-center justify-center shadow-lg shadow-green-500/25 group-hover:shadow-green-500/40 group-hover:scale-105 transition-all duration-300 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="DODOS" className="w-full h-full object-contain p-1" />
                  ) : (
                    <svg width="26" height="26" viewBox="0 0 26 26" fill="none">
                      <path d="M13 2L3 7v12l10 5 10-5V7L13 2z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M13 2v22M3 7l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="13" cy="12" r="3" fill="white"/>
                    </svg>
                  )}
                </div>
                {/* Green dot indicator */}
                <span className="absolute -bottom-0.5 -right-0.5 w-3 h-3 bg-green-400 border-2 border-white rounded-full" />
              </div>

              {/* Brand name */}
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-1">
                  <span className="font-black text-[20px] text-gray-900 tracking-tight">DODOS</span>
                  <span className="font-black text-[20px] text-green-500 tracking-tight">.</span>
                </div>
                <span className="text-[9px] font-black text-gray-400 tracking-[0.25em] uppercase mt-0.5">Electro Store</span>
              </div>
            </Link>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-[580px] hidden md:block"
            >
              <div
                className={`flex items-center h-[46px] rounded-xl px-4 gap-3 border transition-all duration-300 ${
                  searchFocus
                    ? 'bg-white border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.1)]'
                    : 'bg-gray-50 border-gray-200 hover:border-gray-300'
                }`}
              >
                <FaSearch className={`transition-colors duration-300 flex-shrink-0 ${searchFocus ? 'text-green-500' : 'text-gray-400'}`} size={14} />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-[14px] text-gray-800 placeholder:text-gray-400 outline-none font-medium"
                />
                <button
                  type="submit"
                  className="bg-green-500 hover:bg-green-600 text-white text-[11px] font-bold uppercase tracking-wider px-4 py-1.5 rounded-lg transition-all"
                >
                  Search
                </button>
              </div>
            </form>

            {/* ACTIONS */}
            <div className="flex items-center gap-2 ml-auto">
              {isLoggedIn && user?.role === 'user' && (
                <button
                  onClick={() => openChat()}
                  className="w-10 h-10 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition-all relative group"
                >
                  <FaCommentDots size={18} className="group-hover:scale-110 transition-transform" />
                  {chatUnreadCount > 0 && (
                    <>
                      {/* Pulsing ring */}
                      <span className="absolute inset-0 rounded-xl bg-green-400 opacity-20 animate-ping" />
                      <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center border-2 border-white shadow-sm z-10">
                        {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                      </span>
                    </>
                  )}
                </button>
              )}

              <NavIconBtn to="/wishlist" icon={<FaRegHeart size={18} />} label="Wishlist" />
              
              <Link
                to="/cart"
                className="flex items-center gap-2 group px-3 py-2 rounded-xl hover:bg-gray-50 transition-all relative"
              >
                <div className="relative">
                  <FaShoppingCart size={19} className="text-gray-500 group-hover:text-green-600 transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2 -right-2 bg-green-500 text-white text-[9px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden xl:flex flex-col leading-none">
                  <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">Cart</span>
                  <span className="text-[13px] font-black text-gray-800 mt-0.5">{formatPrice(totalPrice)}</span>
                </div>
              </Link>

              <div className="w-px h-6 bg-gray-200 mx-1 hidden lg:block" />

              {/* NOTIFICATIONS */}
              {isLoggedIn && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-10 h-10 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition-all relative group"
                  >
                    <FaBell size={16} className="group-hover:rotate-12 transition-transform" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-2 right-2 w-2 h-2 bg-green-500 rounded-full border-2 border-white" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        className="absolute right-0 mt-2 w-80 bg-white border border-gray-200 rounded-2xl shadow-xl overflow-hidden z-[70]"
                      >
                        <div className="p-4 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">Notifications</h3>
                          <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-green-600 uppercase tracking-widest hover:text-green-700 transition-colors">
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-[320px] overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div
                                key={notification._id}
                                onClick={() => handleMarkAsRead(notification._id)}
                                className={`p-4 border-b border-gray-50 last:border-0 cursor-pointer transition-all hover:bg-gray-50 group relative ${!notification.isRead ? 'bg-green-50/50' : ''}`}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                    notification.type === 'ORDER_PLACED' ? 'bg-green-100 text-green-600' :
                                    notification.type === 'PRODUCT_ADDED' ? 'bg-blue-100 text-blue-600' :
                                    'bg-gray-100 text-gray-500'
                                  }`}>
                                    {notification.type === 'ORDER_PLACED' ? <FaShoppingCart size={12} /> :
                                     notification.type === 'PRODUCT_ADDED' ? <FaBox size={12} /> :
                                     <FaBell size={12} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-gray-800 truncate">{notification.title}</p>
                                    <p className="text-[11px] mt-0.5 line-clamp-2 text-gray-500 leading-relaxed">{notification.message}</p>
                                    <p className="text-[9px] mt-1.5 font-semibold text-gray-400 uppercase tracking-widest">
                                      {new Date(notification.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  <button onClick={(e) => handleDeleteNotification(e, notification._id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                                {!notification.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500" />}
                              </div>
                            ))
                          ) : (
                            <div className="p-10 text-center">
                              <FaEnvelopeOpen className="mx-auto text-gray-300 mb-3" size={28} />
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No notifications</p>
                            </div>
                          )}
                        </div>
                        <Link to="/dashboard/settings" onClick={() => setShowNotifications(false)} className="block p-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-green-600 border-t border-gray-100 transition-colors bg-gray-50">
                          Notification Settings
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* PROFILE */}
              <div className="relative" ref={profileMenuRef}>
                <button
                  onClick={() => setShowProfileMenu(!showProfileMenu)}
                  className="flex items-center gap-2 group px-3 py-2 rounded-xl hover:bg-gray-50 transition-all"
                >
                  <div className="w-9 h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:border-green-300 transition-all">
                    {isLoggedIn && user?.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser size={14} className="text-white" />
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-[13px] font-black text-gray-800">
                      {isLoggedIn ? (user?.fullName?.split(' ')[0]) : 'Sign In'}
                    </span>
                    <span className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      Account <FaChevronDown size={7} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-60 bg-white border border-gray-200 rounded-2xl p-2 shadow-xl z-[60]"
                    >
                      {isLoggedIn ? (
                        <div className="space-y-0.5">
                          <div className="px-3 py-3 border-b border-gray-100 mb-1">
                            <p className="text-sm font-black text-gray-900">{user?.fullName}</p>
                            <p className="text-xs text-gray-400 mt-0.5 truncate">{user?.email}</p>
                          </div>
                          <ProfileMenuItem to="/dashboard"          icon={FaHistory}   label="Dashboard" />
                          <ProfileMenuItem to="/dashboard/orders"   icon={FaBoxOpen}   label="My Orders" />
                          <ProfileMenuItem to="/dashboard/wishlist" icon={FaRegHeart}  label="Wishlist" />
                          <ProfileMenuItem to="/dashboard/settings" icon={FaCog}       label="Settings" />
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-3 py-2.5 rounded-xl text-red-500 hover:bg-red-50 transition-all text-xs font-bold uppercase tracking-widest mt-1"
                          >
                            <FaSignOutAlt size={13} /> Sign Out
                          </button>
                        </div>
                      ) : (
                        <div className="p-1 space-y-2">
                          <Link to="/login" className="flex items-center justify-center w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-xl text-xs font-black uppercase tracking-widest transition-all">
                            Sign In
                          </Link>
                          <Link to="/register" className="flex items-center justify-center w-full py-3 bg-gray-50 hover:bg-gray-100 text-gray-700 rounded-xl text-xs font-black uppercase tracking-widest border border-gray-200 transition-all">
                            Create Account
                          </Link>
                        </div>
                      )}
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>

              <button
                onClick={() => setIsOpen(true)}
                className="lg:hidden ml-1 w-11 h-11 rounded-2xl bg-bg-card border border-border-main flex items-center justify-center text-text-secondary hover:text-text-main transition-all"
              >
                <FaBars size={18} />
              </button>
            </div>
          </div>
        </div>

        {/* NAV STRIP */}
        <nav className="hidden lg:block bg-white border-b border-gray-200">
          <div className="max-w-[1600px] mx-auto px-8 h-[48px] flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`relative h-full flex items-center px-4 text-[11px] font-bold uppercase tracking-[0.12em] transition-all duration-300 group ${
                    active ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-4 right-4 h-[2px] bg-green-500 rounded-full transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'}`} />
                </Link>
              );
            })}
            
            <div className="ml-auto">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-green-50 border border-green-100">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-bold text-green-700 uppercase tracking-widest">Free Shipping in Kigali</span>
              </div>
            </div>
          </div>
        </nav>
      </header>

      {/* MOBILE DRAWER */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/40 backdrop-blur-sm z-[90]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[300px] bg-white border-l border-gray-200 z-[100] p-5 flex flex-col shadow-2xl"
            >
              <div className="flex items-center justify-between mb-6">
                <div className="flex items-center gap-2.5">
                  <div className="w-9 h-9 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center shadow-md overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="DODOS" className="w-full h-full object-contain p-1" />
                    ) : (
                      <svg width="18" height="18" viewBox="0 0 26 26" fill="none">
                        <path d="M13 2L3 7v12l10 5 10-5V7L13 2z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M13 2v22M3 7l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                        <circle cx="13" cy="12" r="3" fill="white"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="font-black text-base text-gray-900 tracking-tight">DODOS<span className="text-green-500">.</span></span>
                    <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest">Electro Store</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-9 h-9 rounded-xl bg-gray-100 flex items-center justify-center text-gray-500">
                  <FaTimes size={14} />
                </button>
              </div>

              <div className="space-y-1 mb-6">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="block w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest text-gray-600 hover:bg-gray-50 hover:text-green-600 transition-all"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-2">
                {isLoggedIn ? (
                  <button onClick={logout} className="w-full py-3 bg-red-50 text-red-500 rounded-xl font-bold uppercase tracking-widest text-xs border border-red-100">
                    Sign Out
                  </button>
                ) : (
                  <Link to="/login" className="block w-full py-3 bg-green-500 hover:bg-green-600 text-white text-center rounded-xl font-black uppercase tracking-widest text-xs transition-all">
                    Sign In
                  </Link>
                )}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
};

const NavIconBtn = ({ to, icon, label }) => (
  <Link
    to={to}
    className="flex flex-col items-center gap-0.5 group px-2 py-2 rounded-xl hover:bg-gray-50 transition-all"
  >
    <span className="text-gray-500 group-hover:text-green-600 transition-colors">{icon}</span>
    <span className="hidden xl:block text-[9px] font-semibold text-gray-400 uppercase tracking-[0.2em] group-hover:text-gray-600 transition-colors">
      {label}
    </span>
  </Link>
);

const ProfileMenuItem = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-all text-xs font-bold uppercase tracking-widest"
  >
    <Icon size={13} />
    {label}
  </Link>
);

export default Navbar;