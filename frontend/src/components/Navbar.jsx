import { useState, useEffect, useRef } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaShoppingCart, FaUser, FaSearch, FaTimes, FaChevronDown,
  FaBoxOpen, FaRegHeart, FaBars, FaSignOutAlt, FaCog, FaHistory,
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

  const [scrolled, setScrolled]               = useState(false);
  const [isOpen, setIsOpen]                   = useState(false);
  const [showProfileMenu, setShowProfileMenu] = useState(false);
  const [searchVal, setSearchVal]             = useState('');
  const [searchFocus, setSearchFocus]         = useState(false);
  const [showSearch, setShowSearch]           = useState(false);
  const [notifications, setNotifications]     = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const profileMenuRef  = useRef(null);
  const notificationRef = useRef(null);
  const mobileSearchRef = useRef(null);

  const storeName = settings?.general?.storeName || 'DODOS';
  const logoUrl   = settings?.general?.logoUrl;

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', onScroll, { passive: true });
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => {
    if (isLoggedIn) {
      fetchNotifications();
      const interval = setInterval(fetchNotifications, 60000);
      return () => clearInterval(interval);
    }
  }, [isLoggedIn]);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (profileMenuRef.current  && !profileMenuRef.current.contains(e.target))  setShowProfileMenu(false);
      if (notificationRef.current && !notificationRef.current.contains(e.target)) setShowNotifications(false);
      if (mobileSearchRef.current && !mobileSearchRef.current.contains(e.target)) setShowSearch(false);
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  useEffect(() => {
    setIsOpen(false);
    setShowProfileMenu(false);
    setShowSearch(false);
  }, [location.pathname]);

  // Prevent body scroll when mobile drawer open
  useEffect(() => {
    document.body.style.overflow = isOpen ? 'hidden' : '';
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  const fetchNotifications = async () => {
    try {
      const res = await notificationAPI.getNotifications();
      setNotifications(res.data);
    } catch {}
  };

  const handleMarkAsRead = async (id) => {
    try {
      await notificationAPI.markAsRead(id);
      setNotifications(prev => prev.map(n => n._id === id ? { ...n, isRead: true } : n));
    } catch {}
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
    } catch {}
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
    } catch {}
  };

  const navLinks = [
    { label: 'Home',        path: '/' },
    { label: 'Shop',        path: '/products' },
    { label: 'Categories',  path: '/categories' },
    { label: 'Services',    path: '/services' },
    { label: 'Track Order', path: '/orders' },
    { label: 'About',       path: '/about' },
    { label: 'Contact',     path: '/contact' },
  ];

  const handleSearch = (e) => {
    e.preventDefault();
    if (searchVal.trim()) {
      navigate(`/products?search=${encodeURIComponent(searchVal.trim())}`);
      setSearchVal('');
      setShowSearch(false);
    }
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path.split('?')[0]);

  const unreadNotifCount = notifications.filter(n => !n.isRead).length;

  return (
    <>
      <header
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-500 ${
          scrolled ? 'shadow-[0_8px_32px_rgba(0,0,0,0.12)]' : ''
        }`}
      >
        {/* ── TOP HEADER (hidden on xs/watch) ── */}
        <div className="hidden sm:block">
          <TopHeader />
        </div>

        {/* ── MAIN BAR ── */}
        <div className={`w-full transition-all duration-500 bg-white border-b border-gray-200 ${
          scrolled ? 'h-[58px] shadow-sm' : 'h-[68px] sm:h-[76px]'
        }`}>
          <div className="max-w-[1600px] mx-auto h-full flex items-center gap-2 sm:gap-4 lg:gap-6 px-3 sm:px-4 xl:px-8">

            {/* LOGO */}
            <Link to="/" className="flex items-center gap-2 shrink-0 group tap-highlight-none">
              <motion.div
                whileHover={{ scale: 1.05 }}
                whileTap={{ scale: 0.95 }}
                className="relative flex-shrink-0"
              >
                <div className="w-9 h-9 sm:w-11 sm:h-11 bg-gradient-to-br from-green-400 to-green-600 rounded-xl sm:rounded-2xl flex items-center justify-center shadow-md shadow-green-500/20 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt="DODOS" className="w-full h-full object-contain p-1" />
                  ) : (
                    <svg width="22" height="22" viewBox="0 0 26 26" fill="none">
                      <path d="M13 2L3 7v12l10 5 10-5V7L13 2z" fill="white" fillOpacity="0.15" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      <path d="M13 2v22M3 7l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                      <circle cx="13" cy="12" r="3" fill="white"/>
                    </svg>
                  )}
                </div>
                <span className="absolute -bottom-0.5 -right-0.5 w-2.5 h-2.5 bg-green-400 border-2 border-white rounded-full" />
              </motion.div>
              <div className="flex flex-col leading-none">
                <div className="flex items-baseline gap-0.5">
                  <span className="font-black text-[16px] sm:text-[19px] text-gray-900 tracking-tight">DODOS</span>
                  <span className="font-black text-[16px] sm:text-[19px] text-green-500 tracking-tight">.</span>
                </div>
                <span className="hidden sm:block text-[8px] font-black text-gray-400 tracking-[0.22em] uppercase mt-0.5">Electro Store</span>
              </div>
            </Link>

            {/* SEARCH — desktop */}
            <form onSubmit={handleSearch} className="flex-1 max-w-[520px] hidden md:block">
              <div className={`flex items-center h-[42px] rounded-xl px-3 gap-2 border transition-all duration-300 ${
                searchFocus
                  ? 'bg-white border-green-500 shadow-[0_0_0_3px_rgba(34,197,94,0.1)]'
                  : 'bg-gray-50 border-gray-200 hover:border-gray-300'
              }`}>
                <FaSearch className={`transition-colors flex-shrink-0 ${searchFocus ? 'text-green-500' : 'text-gray-400'}`} size={13} />
                <input
                  type="text"
                  value={searchVal}
                  onChange={e => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  placeholder="Search products..."
                  className="flex-1 bg-transparent text-[13px] text-gray-800 placeholder:text-gray-400 outline-none font-medium min-w-0"
                />
                <button type="submit" className="bg-green-500 hover:bg-green-600 active:scale-95 text-white text-[10px] font-bold uppercase tracking-wider px-3 py-1.5 rounded-lg transition-all">
                  Search
                </button>
              </div>
            </form>

            {/* ACTIONS */}
            <div className="flex items-center gap-1 sm:gap-2 ml-auto">

              {/* Mobile search toggle */}
              <button
                onClick={() => setShowSearch(s => !s)}
                className="md:hidden w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-green-600 transition-all tap-highlight-none touch-target"
                aria-label="Search"
              >
                <FaSearch size={14} />
              </button>

              {/* Chat (logged-in users only) */}
              {isLoggedIn && user?.role === 'user' && (
                <motion.button
                  whileTap={{ scale: 0.9 }}
                  onClick={() => openChat()}
                  className="w-9 h-9 flex items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition-all relative tap-highlight-none touch-target"
                >
                  <FaCommentDots size={16} />
                  {chatUnreadCount > 0 && (
                    <>
                      <span className="absolute inset-0 rounded-xl bg-green-400 opacity-20 animate-ping" />
                      <span className="absolute -top-1 -right-1 w-4 h-4 bg-red-500 text-white text-[8px] font-black rounded-full flex items-center justify-center border-2 border-white z-10">
                        {chatUnreadCount > 9 ? '9+' : chatUnreadCount}
                      </span>
                    </>
                  )}
                </motion.button>
              )}

              {/* Wishlist */}
              <Link to="/wishlist" className="hidden sm:flex w-9 h-9 items-center justify-center rounded-xl bg-gray-100 border border-gray-200 text-gray-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition-all tap-highlight-none touch-target">
                <FaRegHeart size={16} />
              </Link>

              {/* Cart */}
              <Link
                to="/cart"
                className="flex items-center gap-1.5 group px-2 sm:px-3 py-2 rounded-xl hover:bg-gray-50 transition-all relative tap-highlight-none"
              >
                <div className="relative">
                  <FaShoppingCart size={17} className="text-gray-500 group-hover:text-green-600 transition-colors" />
                  <AnimatePresence>
                    {totalItems > 0 && (
                      <motion.span
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="absolute -top-2 -right-2 bg-green-500 text-white text-[8px] font-black w-4 h-4 rounded-full flex items-center justify-center border-2 border-white"
                      >
                        {totalItems > 9 ? '9+' : totalItems}
                      </motion.span>
                    )}
                  </AnimatePresence>
                </div>
                <div className="hidden xl:flex flex-col leading-none">
                  <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest">Cart</span>
                  <span className="text-[12px] font-black text-gray-800 mt-0.5">{formatPrice(totalPrice)}</span>
                </div>
              </Link>

              <div className="w-px h-5 bg-gray-200 mx-0.5 hidden lg:block" />

              {/* Notifications */}
              {isLoggedIn && (
                <div className="relative hidden sm:block" ref={notificationRef}>
                  <motion.button
                    whileTap={{ scale: 0.9 }}
                    onClick={() => setShowNotifications(s => !s)}
                    className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:text-green-600 hover:border-green-300 hover:bg-green-50 transition-all relative tap-highlight-none touch-target"
                  >
                    <FaBell size={14} className={showNotifications ? 'text-green-600' : ''} />
                    {unreadNotifCount > 0 && (
                      <span className="absolute top-1.5 right-1.5 w-2 h-2 bg-green-500 rounded-full border-2 border-white animate-pulse" />
                    )}
                  </motion.button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 8, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 8, scale: 0.95 }}
                        transition={{ duration: 0.18 }}
                        className="absolute right-0 mt-2 w-72 sm:w-80 bg-white border border-gray-200 rounded-2xl shadow-2xl overflow-hidden z-[70]"
                      >
                        <div className="p-3.5 border-b border-gray-100 flex items-center justify-between bg-gray-50">
                          <h3 className="font-black text-xs uppercase tracking-widest text-gray-800">Notifications</h3>
                          <button onClick={handleMarkAllAsRead} className="text-[10px] font-bold text-green-600 uppercase tracking-widest hover:text-green-700 transition-colors">
                            Mark all read
                          </button>
                        </div>
                        <div className="max-h-[300px] overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? notifications.map(n => (
                            <div
                              key={n._id}
                              onClick={() => handleMarkAsRead(n._id)}
                              className={`p-3.5 border-b border-gray-50 last:border-0 cursor-pointer transition-all hover:bg-gray-50 group relative ${!n.isRead ? 'bg-green-50/50' : ''}`}
                            >
                              <div className="flex gap-3">
                                <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                  n.type === 'ORDER_PLACED' ? 'bg-green-100 text-green-600' :
                                  n.type === 'PRODUCT_ADDED' ? 'bg-blue-100 text-blue-600' :
                                  'bg-gray-100 text-gray-500'
                                }`}>
                                  {n.type === 'ORDER_PLACED' ? <FaShoppingCart size={11} /> :
                                   n.type === 'PRODUCT_ADDED' ? <FaBox size={11} /> :
                                   <FaBell size={11} />}
                                </div>
                                <div className="flex-1 min-w-0">
                                  <p className="text-[12px] font-bold text-gray-800 truncate">{n.title}</p>
                                  <p className="text-[11px] mt-0.5 line-clamp-2 text-gray-500 leading-relaxed">{n.message}</p>
                                  <p className="text-[9px] mt-1 font-semibold text-gray-400 uppercase tracking-widest">
                                    {new Date(n.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                  </p>
                                </div>
                                <button onClick={e => handleDeleteNotification(e, n._id)} className="opacity-0 group-hover:opacity-100 p-1 text-gray-400 hover:text-red-500 transition-all">
                                  <FaTrash size={10} />
                                </button>
                              </div>
                              {!n.isRead && <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-green-500" />}
                            </div>
                          )) : (
                            <div className="p-10 text-center">
                              <FaEnvelopeOpen className="mx-auto text-gray-300 mb-3" size={26} />
                              <p className="text-[10px] font-bold text-gray-400 uppercase tracking-widest">No notifications</p>
                            </div>
                          )}
                        </div>
                        <Link to="/dashboard/settings" onClick={() => setShowNotifications(false)} className="block p-3 text-center text-[10px] font-bold uppercase tracking-widest text-gray-500 hover:text-green-600 border-t border-gray-100 transition-colors bg-gray-50">
                          Settings
                        </Link>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )}

              {/* Profile */}
              <div className="relative" ref={profileMenuRef}>
                <motion.button
                  whileTap={{ scale: 0.92 }}
                  onClick={() => setShowProfileMenu(s => !s)}
                  className="flex items-center gap-1.5 group px-2 sm:px-3 py-1.5 rounded-xl hover:bg-gray-50 transition-all tap-highlight-none"
                >
                  <div className="w-8 h-8 sm:w-9 sm:h-9 rounded-xl bg-gradient-to-br from-green-500 to-green-700 flex items-center justify-center overflow-hidden border-2 border-white shadow-sm group-hover:border-green-300 transition-all">
                    {isLoggedIn && user?.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser size={12} className="text-white" />
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-[12px] font-black text-gray-800">
                      {isLoggedIn ? (user?.fullName?.split(' ')[0]) : 'Sign In'}
                    </span>
                    <span className="text-[9px] text-gray-400 font-semibold uppercase tracking-widest mt-0.5 flex items-center gap-1">
                      Account <FaChevronDown size={6} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </motion.button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 8, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 8, scale: 0.95 }}
                      transition={{ duration: 0.18 }}
                      className="absolute right-0 mt-2 w-56 bg-white border border-gray-200 rounded-2xl p-2 shadow-2xl z-[60]"
                    >
                      {isLoggedIn ? (
                        <div className="space-y-0.5">
                          <div className="px-3 py-3 border-b border-gray-100 mb-1">
                            <p className="text-sm font-black text-gray-900 truncate">{user?.fullName}</p>
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
                            <FaSignOutAlt size={12} /> Sign Out
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

              {/* Hamburger */}
              <motion.button
                whileTap={{ scale: 0.88 }}
                onClick={() => setIsOpen(true)}
                className="lg:hidden ml-1 w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-600 hover:text-green-600 hover:bg-green-50 transition-all tap-highlight-none touch-target"
              >
                <FaBars size={16} />
              </motion.button>
            </div>
          </div>
        </div>

        {/* ── MOBILE SEARCH BAR (dropdown) ── */}
        <AnimatePresence>
          {showSearch && (
            <motion.div
              ref={mobileSearchRef}
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.22 }}
              className="md:hidden bg-white border-b border-gray-200 overflow-hidden"
            >
              <form onSubmit={handleSearch} className="flex items-center gap-2 px-3 py-3">
                <div className="flex-1 flex items-center gap-2 bg-gray-50 border border-gray-200 rounded-xl px-3 h-10 focus-within:border-green-500 focus-within:shadow-[0_0_0_3px_rgba(34,197,94,0.1)] transition-all">
                  <FaSearch size={12} className="text-gray-400 flex-shrink-0" />
                  <input
                    autoFocus
                    type="text"
                    value={searchVal}
                    onChange={e => setSearchVal(e.target.value)}
                    placeholder="Search products..."
                    className="flex-1 bg-transparent text-sm text-gray-800 placeholder:text-gray-400 outline-none"
                  />
                </div>
                <button type="submit" className="h-10 px-4 bg-green-500 hover:bg-green-600 text-white text-xs font-bold rounded-xl transition-all">
                  Go
                </button>
              </form>
            </motion.div>
          )}
        </AnimatePresence>

        {/* ── NAV STRIP (desktop only) ── */}
        <nav className="hidden lg:block bg-white border-b border-gray-200">
          <div className="max-w-[1600px] mx-auto px-8 h-[44px] flex items-center gap-1">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`relative h-full flex items-center px-4 text-[10px] font-bold uppercase tracking-[0.12em] transition-all duration-300 group ${
                    active ? 'text-green-600' : 'text-gray-500 hover:text-gray-900'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-4 right-4 h-[2px] bg-green-500 rounded-full transition-all duration-400 ${
                    active ? 'opacity-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'
                  }`} />
                </Link>
              );
            })}
            <div className="ml-auto flex items-center gap-2 px-3 py-1 rounded-full bg-green-50 border border-green-100">
              <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
              <span className="text-[9px] font-bold text-green-700 uppercase tracking-widest">Free Shipping in Kigali</span>
            </div>
          </div>
        </nav>
      </header>

      {/* ── MOBILE DRAWER ── */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[90]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              transition={{ type: 'spring', stiffness: 300, damping: 30 }}
              className="fixed top-0 right-0 bottom-0 w-[80vw] max-w-[300px] bg-white border-l border-gray-200 z-[100] flex flex-col shadow-2xl overflow-hidden"
            >
              {/* Drawer header */}
              <div className="flex items-center justify-between px-4 py-4 border-b border-gray-100 bg-gray-50">
                <div className="flex items-center gap-2.5">
                  <div className="w-8 h-8 bg-gradient-to-br from-green-400 to-green-600 rounded-xl flex items-center justify-center overflow-hidden">
                    {logoUrl ? (
                      <img src={logoUrl} alt="DODOS" className="w-full h-full object-contain p-1" />
                    ) : (
                      <svg width="16" height="16" viewBox="0 0 26 26" fill="none">
                        <path d="M13 2L3 7v12l10 5 10-5V7L13 2z" fill="white" fillOpacity="0.2" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                        <path d="M13 2v22M3 7l10 5 10-5" stroke="white" strokeWidth="1.5" strokeLinejoin="round"/>
                        <circle cx="13" cy="12" r="3" fill="white"/>
                      </svg>
                    )}
                  </div>
                  <div>
                    <span className="font-black text-sm text-gray-900 tracking-tight">DODOS<span className="text-green-500">.</span></span>
                    <p className="text-[8px] font-bold text-gray-400 uppercase tracking-widest">Electro Store</p>
                  </div>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-8 h-8 rounded-xl bg-gray-200 flex items-center justify-center text-gray-500 hover:bg-gray-300 transition-all">
                  <FaTimes size={13} />
                </button>
              </div>

              {/* Nav links */}
              <div className="flex-1 overflow-y-auto py-3 px-3">
                <div className="space-y-1">
                  {navLinks.map((link, i) => (
                    <motion.div
                      key={link.label}
                      initial={{ opacity: 0, x: 20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: i * 0.04 }}
                    >
                      <Link
                        to={link.path}
                        className={`block w-full px-4 py-3 rounded-xl text-sm font-bold uppercase tracking-widest transition-all ${
                          isActive(link.path)
                            ? 'bg-green-50 text-green-700 border border-green-200'
                            : 'text-gray-600 hover:bg-gray-50 hover:text-green-600 border border-transparent'
                        }`}
                      >
                        {link.label}
                      </Link>
                    </motion.div>
                  ))}
                </div>

                {/* Wishlist + Notifications shortcuts on mobile */}
                {isLoggedIn && (
                  <div className="mt-4 pt-4 border-t border-gray-100 grid grid-cols-2 gap-2">
                    <Link to="/wishlist" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600 transition-all">
                      <FaRegHeart size={13} /> Wishlist
                    </Link>
                    <Link to="/dashboard/orders" onClick={() => setIsOpen(false)} className="flex items-center gap-2 px-3 py-2.5 bg-gray-50 rounded-xl text-xs font-bold text-gray-600 border border-gray-200 hover:border-green-300 hover:text-green-600 transition-all">
                      <FaBoxOpen size={13} /> Orders
                    </Link>
                  </div>
                )}
              </div>

              {/* Drawer footer */}
              <div className="p-3 border-t border-gray-100 space-y-2">
                {isLoggedIn ? (
                  <>
                    <div className="px-3 py-2.5 bg-gray-50 rounded-xl border border-gray-200 flex items-center gap-3 mb-2">
                      <div className="w-8 h-8 rounded-xl bg-green-500 flex items-center justify-center text-white text-xs font-black">
                        {user?.fullName?.charAt(0) || 'U'}
                      </div>
                      <div className="min-w-0">
                        <p className="text-xs font-bold text-gray-800 truncate">{user?.fullName}</p>
                        <p className="text-[10px] text-gray-400 truncate">{user?.email}</p>
                      </div>
                    </div>
                    <button onClick={() => { logout(); setIsOpen(false); }} className="w-full py-2.5 bg-red-50 text-red-500 rounded-xl font-bold uppercase tracking-widest text-xs border border-red-100 hover:bg-red-500 hover:text-white transition-all">
                      Sign Out
                    </button>
                  </>
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

const ProfileMenuItem = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-3 py-2.5 rounded-xl text-gray-500 hover:bg-gray-50 hover:text-green-600 transition-all text-xs font-bold uppercase tracking-widest"
  >
    <Icon size={12} />
    {label}
  </Link>
);

export default Navbar;
