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
              ? 'bg-bg-main/90 backdrop-blur-xl h-[70px]'
              : 'bg-bg-main h-[90px]'
          } border-b border-border-main`}
        >
          <div className="max-w-[1600px] mx-auto h-full flex items-center gap-8 px-4 xl:px-8">
            
            {/* LOGO */}
            <Link to="/" className="flex items-center gap-3 shrink-0 group">
              <div className="relative w-14 h-14">
                <div className="absolute inset-0 bg-blue-600 rounded-2xl rotate-6 group-hover:rotate-12 transition-transform duration-500 opacity-20" />
                <div className="relative w-14 h-14 bg-gradient-to-br from-[#0d6efd] to-[#00d2ff] rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/30 overflow-hidden">
                  {logoUrl ? (
                    <img src={logoUrl} alt={storeName} className="w-full h-full object-contain p-1" />
                  ) : (
                    <FaBolt className="text-white text-2xl animate-pulse" />
                  )}
                </div>
              </div>
              <div className="flex flex-col leading-none">
                <span className="font-black text-[22px] text-text-main tracking-tighter uppercase">{storeName}</span>
                <span className="text-[11px] font-bold text-blue-400 tracking-[0.3em] uppercase mt-0.5">Electro Store</span>
              </div>
            </Link>

            {/* SEARCH */}
            <form
              onSubmit={handleSearch}
              className="flex-1 max-w-[580px] hidden md:block"
            >
              <div
                className={`flex items-center h-[50px] rounded-2xl px-5 gap-4 border transition-all duration-500 ${
                  searchFocus
                    ? 'bg-bg-surface border-blue-500 shadow-[0_0_25px_rgba(13,110,253,0.15)]'
                    : 'bg-bg-card border-border-main hover:border-blue-500/30'
                }`}
              >
                <FaSearch className={`transition-colors duration-300 ${searchFocus ? 'text-blue-500' : 'text-text-secondary'}`} />
                <input
                  type="text"
                  value={searchVal}
                  onChange={(e) => setSearchVal(e.target.value)}
                  onFocus={() => setSearchFocus(true)}
                  onBlur={() => setSearchFocus(false)}
                  placeholder="Search premium accessories..."
                  className="flex-1 bg-transparent text-[14px] text-text-main placeholder:text-text-secondary/50 outline-none font-medium"
                />
                <button
                  type="submit"
                  className="bg-blue-600 hover:bg-blue-500 text-white text-[11px] font-black uppercase tracking-wider px-5 py-2 rounded-xl transition-all shadow-lg shadow-blue-500/20"
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
                  className="w-11 h-11 flex items-center justify-center rounded-2xl bg-bg-card border border-border-main text-text-secondary hover:text-blue-500 hover:border-blue-500/30 transition-all relative group"
                >
                  <FaCommentDots size={20} className="group-hover:scale-110 transition-transform" />
                  {chatUnreadCount > 0 && (
                    <span className="absolute -top-1 -right-1 w-5 h-5 bg-blue-600 text-white text-[10px] font-black rounded-full flex items-center justify-center border-2 border-bg-main shadow-lg">
                      {chatUnreadCount}
                    </span>
                  )}
                </button>
              )}

              <NavIconBtn to="/wishlist" icon={<FaRegHeart size={20} />} label="Wishlist" />
              
              <Link
                to="/cart"
                className="flex items-center gap-3 group px-4 py-2.5 rounded-2xl hover:bg-bg-surface transition-all relative"
              >
                <div className="relative">
                  <FaShoppingCart size={21} className="text-text-secondary group-hover:text-blue-400 transition-colors" />
                  {totalItems > 0 && (
                    <span className="absolute -top-2.5 -right-2.5 bg-blue-600 text-white text-[10px] font-black w-5 h-5 rounded-full flex items-center justify-center border-2 border-bg-main shadow-lg shadow-blue-500/40">
                      {totalItems}
                    </span>
                  )}
                </div>
                <div className="hidden xl:flex flex-col leading-none">
                  <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest">Cart</span>
                  <span className="text-[14px] font-black text-text-main mt-1">{formatPrice(totalPrice)}</span>
                </div>
              </Link>

              <div className="w-px h-8 bg-border-main mx-2 hidden lg:block" />

              {/* NOTIFICATIONS */}
              {isLoggedIn && (
                <div className="relative" ref={notificationRef}>
                  <button
                    onClick={() => setShowNotifications(!showNotifications)}
                    className="w-11 h-11 rounded-2xl bg-bg-card border border-border-main flex items-center justify-center text-text-secondary hover:text-blue-400 hover:border-blue-400/50 transition-all relative group"
                  >
                    <FaBell size={18} className="group-hover:rotate-12 transition-transform" />
                    {notifications.filter(n => !n.isRead).length > 0 && (
                      <span className="absolute top-2.5 right-2.5 w-2 h-2 bg-blue-600 rounded-full border-2 border-bg-main" />
                    )}
                  </button>

                  <AnimatePresence>
                    {showNotifications && (
                      <motion.div
                        initial={{ opacity: 0, y: 10, scale: 0.95 }}
                        animate={{ opacity: 1, y: 0, scale: 1 }}
                        exit={{ opacity: 0, y: 10, scale: 0.95 }}
                        className="absolute right-0 mt-3 w-80 bg-bg-card border border-border-main rounded-3xl shadow-2xl overflow-hidden z-[70] backdrop-blur-2xl"
                      >
                        <div className="p-4 border-b border-border-main flex items-center justify-between">
                          <h3 className="font-black text-xs uppercase tracking-widest text-text-main">Notifications</h3>
                          <button 
                            onClick={handleMarkAllAsRead}
                            className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                          >
                            Mark all as read
                          </button>
                        </div>
                        <div className="max-h-[350px] overflow-y-auto custom-scrollbar">
                          {notifications.length > 0 ? (
                            notifications.map((notification) => (
                              <div 
                                key={notification._id}
                                onClick={() => handleMarkAsRead(notification._id)}
                                className={`p-4 border-b border-border-main/50 last:border-0 cursor-pointer transition-all hover:bg-blue-500/5 group relative ${!notification.isRead ? 'bg-blue-500/5' : ''}`}
                              >
                                <div className="flex gap-3">
                                  <div className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
                                    notification.type === 'ORDER_PLACED' ? 'bg-green-500/10 text-green-500' :
                                    notification.type === 'PRODUCT_ADDED' ? 'bg-blue-500/10 text-blue-500' :
                                    'bg-slate-500/10 text-slate-500'
                                  }`}>
                                    {notification.type === 'ORDER_PLACED' ? <FaShoppingCart size={14} /> : 
                                     notification.type === 'PRODUCT_ADDED' ? <FaBox size={14} /> : 
                                     <FaBell size={14} />}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <p className="text-[13px] font-bold text-text-main truncate">{notification.title}</p>
                                    <p className="text-[11px] mt-0.5 line-clamp-2 text-text-secondary leading-relaxed">{notification.message}</p>
                                    <p className="text-[9px] mt-2 font-black text-text-secondary/50 uppercase tracking-widest">
                                      {new Date(notification.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                    </p>
                                  </div>
                                  <button 
                                    onClick={(e) => handleDeleteNotification(e, notification._id)}
                                    className="opacity-0 group-hover:opacity-100 p-1.5 text-text-secondary hover:text-red-500 transition-all absolute top-2 right-2"
                                  >
                                    <FaTrash size={10} />
                                  </button>
                                </div>
                                {!notification.isRead && (
                                  <div className="absolute left-0 top-0 bottom-0 w-0.5 bg-blue-500" />
                                )}
                              </div>
                            ))
                          ) : (
                            <div className="p-10 text-center">
                              <FaEnvelopeOpen className="mx-auto text-text-secondary/20 mb-3" size={32} />
                              <p className="text-[10px] font-black text-text-secondary uppercase tracking-widest">No notifications</p>
                            </div>
                          )}
                        </div>
                        <Link 
                          to="/dashboard/settings" 
                          onClick={() => setShowNotifications(false)}
                          className="block p-4 text-center text-[10px] font-black uppercase tracking-widest text-text-secondary hover:text-blue-400 border-t border-border-main transition-colors bg-bg-surface/30"
                        >
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
                  className="flex items-center gap-3 group px-4 py-2.5 rounded-2xl hover:bg-bg-surface transition-all"
                >
                  <div className="w-10 h-10 rounded-2xl bg-gradient-to-br from-blue-600 to-blue-800 flex items-center justify-center overflow-hidden border border-white/10 group-hover:border-blue-400 transition-all shadow-lg">
                    {isLoggedIn && user?.profilePicture ? (
                      <img src={user.profilePicture} alt="" className="w-full h-full object-cover" />
                    ) : (
                      <FaUser size={16} className="text-blue-100" />
                    )}
                  </div>
                  <div className="hidden lg:flex flex-col items-start leading-none">
                    <span className="text-[14px] font-black text-text-main">
                      {isLoggedIn ? (user?.fullName?.split(' ')[0]) : 'Sign In'}
                    </span>
                    <span className="text-[10px] text-text-secondary font-bold uppercase tracking-widest mt-1 flex items-center gap-1">
                      Account <FaChevronDown size={8} className={`transition-transform duration-300 ${showProfileMenu ? 'rotate-180' : ''}`} />
                    </span>
                  </div>
                </button>

                <AnimatePresence>
                  {showProfileMenu && (
                    <motion.div
                      initial={{ opacity: 0, y: 10, scale: 0.95 }}
                      animate={{ opacity: 1, y: 0, scale: 1 }}
                      exit={{ opacity: 0, y: 10, scale: 0.95 }}
                      className="absolute right-0 mt-2 w-64 bg-bg-card border border-border-main rounded-3xl p-3 shadow-2xl backdrop-blur-2xl z-[60]"
                    >
                      {isLoggedIn ? (
                        <div className="space-y-1">
                          <div className="px-4 py-3 border-b border-border-main mb-2">
                            <p className="text-sm font-black text-text-main">{user?.fullName}</p>
                            <p className="text-xs text-text-secondary mt-1 truncate">{user?.email}</p>
                          </div>
                          <ProfileMenuItem to="/dashboard" icon={FaHistory} label="Dashboard" />
                          <ProfileMenuItem to="/dashboard/orders" icon={FaBoxOpen} label="My Orders" />
                          <ProfileMenuItem to="/dashboard/wishlist" icon={FaRegHeart} label="Wishlist" />
                          <ProfileMenuItem to="/dashboard/settings" icon={FaCog} label="Settings" />
                          <button
                            onClick={logout}
                            className="w-full flex items-center gap-3 px-4 py-3 rounded-2xl text-red-500 hover:bg-red-500/10 transition-all text-xs font-black uppercase tracking-widest mt-2"
                          >
                            <FaSignOutAlt size={14} /> Sign Out
                          </button>
                        </div>
                      ) : (
                        <div className="p-2 space-y-2">
                          <Link to="/login" className="flex items-center justify-center w-full py-3.5 bg-blue-600 hover:bg-blue-500 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-lg shadow-blue-500/20">
                            Sign In
                          </Link>
                          <Link to="/register" className="flex items-center justify-center w-full py-3.5 bg-bg-surface hover:bg-bg-surface/80 text-text-main rounded-2xl text-xs font-black uppercase tracking-widest border border-border-main">
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
        <nav className="hidden lg:block bg-bg-main border-b border-border-main">
          <div className="max-w-[1600px] mx-auto px-8 h-[54px] flex items-center gap-2">
            {navLinks.map((link) => {
              const active = isActive(link.path);
              return (
                <Link
                  key={link.label}
                  to={link.path}
                  className={`relative h-full flex items-center px-5 text-[11px] font-black uppercase tracking-[0.15em] transition-all duration-300 group ${
                    active ? 'text-blue-400' : 'text-text-secondary hover:text-text-main'
                  }`}
                >
                  {link.label}
                  <span className={`absolute bottom-0 left-5 right-5 h-[2px] bg-blue-500 rounded-full transition-all duration-500 ${active ? 'opacity-100' : 'opacity-0 scale-x-0 group-hover:opacity-100 group-hover:scale-x-100'}`} />
                </Link>
              );
            })}
            
            <div className="ml-auto">
              <div className="flex items-center gap-2 px-4 py-1.5 rounded-full bg-blue-500/5 border border-blue-500/10">
                <div className="w-1.5 h-1.5 rounded-full bg-green-500 animate-pulse" />
                <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Free Shipping on orders 50k+</span>
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
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[90]"
              onClick={() => setIsOpen(false)}
            />
            <motion.div
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-[320px] bg-[#05070a] border-l border-white/10 z-[100] p-6 flex flex-col"
            >
              <div className="flex items-center justify-between mb-8">
                <div className="flex items-center gap-3">
                  <div className="w-9 h-9 bg-blue-600 rounded-xl flex items-center justify-center">
                    <FaBolt className="text-white text-sm" />
                  </div>
                  <span className="font-black text-lg text-white">DODOS</span>
                </div>
                <button onClick={() => setIsOpen(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                  <FaTimes size={16} />
                </button>
              </div>

              <div className="space-y-2 mb-8">
                {navLinks.map((link) => (
                  <Link
                    key={link.label}
                    to={link.path}
                    className="block w-full px-5 py-4 rounded-2xl text-sm font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white"
                  >
                    {link.label}
                  </Link>
                ))}
              </div>

              <div className="mt-auto space-y-3">
                {isLoggedIn ? (
                  <button onClick={logout} className="w-full py-4 bg-red-500/10 text-red-500 rounded-2xl font-black uppercase tracking-widest text-xs border border-red-500/20">
                    Sign Out
                  </button>
                ) : (
                  <Link to="/login" className="block w-full py-4 bg-blue-600 text-white text-center rounded-2xl font-black uppercase tracking-widest text-xs">
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
    className="flex flex-col items-center gap-1 group px-3 py-2 rounded-2xl hover:bg-white/[0.05] transition-all"
  >
    <span className="text-slate-400 group-hover:text-blue-400 transition-colors">{icon}</span>
    <span className="hidden xl:block text-[9px] font-bold text-slate-600 uppercase tracking-[0.2em] group-hover:text-slate-400 transition-colors">
      {label}
    </span>
  </Link>
);

const ProfileMenuItem = ({ to, icon: Icon, label }) => (
  <Link
    to={to}
    className="flex items-center gap-3 px-4 py-3 rounded-2xl text-slate-400 hover:bg-white/5 hover:text-blue-400 transition-all text-xs font-black uppercase tracking-widest"
  >
    <Icon size={14} />
    {label}
  </Link>
);

export default Navbar;