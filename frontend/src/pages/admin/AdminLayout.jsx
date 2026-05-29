import { useState, useEffect, useRef } from 'react';
import { Outlet, Link, useNavigate, useLocation, Navigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaHome, FaBox, FaShoppingCart, FaUsers, FaCog,
  FaSignOutAlt, FaBars, FaTimes, FaLayerGroup, FaBookOpen,
  FaChartBar, FaBell, FaChevronDown, FaSearch, FaFilter,
  FaStar, FaTicketAlt, FaImage, FaMoon, FaSun, FaUserCircle,
  FaCheckCircle, FaExclamationCircle, FaTrash, FaCheck,
  FaEnvelopeOpen, FaCommentDots
} from 'react-icons/fa';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { adminAPI, notificationAPI, chatAPI } from '../../services/api';
import { toast } from 'react-toastify';

const menuItems = [
  { path: '/admin',            icon: FaHome,         label: 'Dashboard' },
  { path: '/admin/products',   icon: FaBox,          label: 'Products' },
  { path: '/admin/categories', icon: FaLayerGroup,   label: 'Categories' },
  { path: '/admin/orders',     icon: FaShoppingCart, label: 'Orders' },
  { path: '/admin/customers',  icon: FaUsers,        label: 'Customers' },
  { path: '/admin/reviews',    icon: FaStar,         label: 'Reviews' },
  { path: '/admin/coupons',    icon: FaTicketAlt,    label: 'Coupons' },
  { path: '/admin/slides',     icon: FaImage,        label: 'Banners' },
  { path: '/admin/reports',    icon: FaChartBar,     label: 'Reports' },
  { path: '/admin/settings',   icon: FaCog,          label: 'Settings' },
  { path: '/admin/chat',       icon: FaCommentDots,  label: 'Chat' },
];

const AdminLayout = () => {
  const [collapsed, setCollapsed] = useState(false);
  const [notifications, setNotifications] = useState([]);
  const [showNotifications, setShowNotifications] = useState(false);
  const [loadingNotifications, setLoadingNotifications] = useState(false);
  const [chatUnread, setChatUnread] = useState(0);
  const { logout, user } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const navigate  = useNavigate();
  const location  = useLocation();
  const notificationRef = useRef(null);

  useEffect(() => {
    fetchNotifications();
    const interval = setInterval(fetchNotifications, 60000);
    return () => clearInterval(interval);
  }, []);

  // Poll admin unread chat count every 10s
  useEffect(() => {
    const fetchChatUnread = async () => {
      try {
        const res = await chatAPI.getUnreadCount();
        setChatUnread(res.data.count ?? 0);
      } catch {}
    };
    fetchChatUnread();
    const id = setInterval(fetchChatUnread, 10000);
    return () => clearInterval(id);
  }, []);

  useEffect(() => {
    const handleClickOutside = (event) => {
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
      toast.error('Failed to mark notification as read');
    }
  };

  const handleMarkAllAsRead = async () => {
    try {
      await notificationAPI.markAllAsRead();
      setNotifications(prev => prev.map(n => ({ ...n, isRead: true })));
      toast.success('All notifications marked as read');
    } catch (error) {
      toast.error('Failed to mark all as read');
    }
  };

  const handleDeleteNotification = async (e, id) => {
    e.stopPropagation();
    try {
      await notificationAPI.deleteNotification(id);
      setNotifications(prev => prev.filter(n => n._id !== id));
      toast.success('Notification deleted');
    } catch (error) {
      toast.error('Failed to delete notification');
    }
  };

  if (user && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  const handleLogout = () => { logout(); navigate('/login'); };

  const isActive = (path) => path === '/admin'
    ? location.pathname === '/admin'
    : location.pathname.startsWith(path);

  return (
    <div className={`flex h-screen overflow-hidden ${theme === 'Dark' ? 'bg-[#05070a] text-slate-300' : 'bg-[#f8fafc] text-slate-600'} transition-colors duration-300`}>

      {/* ── Sidebar ── */}
      <motion.aside
        animate={{ width: collapsed ? 80 : 280 }}
        transition={{ duration: 0.3, ease: 'easeInOut' }}
        className={`${theme === 'Dark' ? 'bg-[#0a0d14] border-r border-white/5' : 'bg-white border-r border-slate-200'} flex flex-col flex-shrink-0 z-20 shadow-2xl`}
      >
        {/* Logo */}
        <div className="p-6 flex items-center gap-3 mb-4">
          <div className="w-14 h-14 bg-gradient-to-br from-[#0d6efd] to-blue-600 rounded-xl flex items-center justify-center text-white shadow-lg shadow-blue-500/20 overflow-hidden">
             {user?.settings?.general?.logoUrl ? (
                <img src={user.settings.general.logoUrl} alt="Logo" className="w-full h-full object-contain p-1" />
             ) : (
                <FaBox size={24} />
             )}
          </div>
          {!collapsed && (
            <div className="leading-none">
              <p className={`font-black text-xl tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{user?.settings?.general?.storeName || 'DODOS'}</p>
              <p className="text-[#0d6efd] font-bold text-[10px] uppercase tracking-[0.3em] -mt-0.5">ELECTRO STORE</p>
            </div>
          )}
        </div>

        {/* User Profile Section */}
        {!collapsed && (
          <div className="px-6 mb-8">
            <div className={`flex items-center gap-3 p-3 rounded-2xl border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 hover:bg-white/10' : 'bg-slate-50 border-slate-200 hover:bg-slate-100'}`}>
              <div className="w-10 h-10 rounded-full overflow-hidden border-2 border-blue-500/20 bg-blue-600 flex items-center justify-center text-white">
                {user?.profilePicture ? (
                  <img src={user.profilePicture} alt="Admin" className="w-full h-full object-cover" />
                ) : (
                  <FaUserCircle size={24} />
                )}
              </div>
              <div className="flex-1 min-w-0">
                <p className={`text-xs font-black truncate ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{user?.fullName || 'Admin User'}</p>
                <p className="text-[10px] text-blue-500 font-bold uppercase tracking-widest">Super Admin</p>
              </div>
            </div>
          </div>
        )}

        {/* Nav */}
        <nav className="flex-grow px-4 space-y-1.5 overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const Icon = item.icon;
            const active = isActive(item.path);
            return (
              <Link
                key={item.path}
                to={item.path}
                title={collapsed ? item.label : undefined}
                className={`flex items-center gap-4 px-4 py-3.5 rounded-xl transition-all duration-200 group relative ${
                  active 
                    ? 'bg-[#0d6efd] text-white shadow-lg shadow-blue-500/20' 
                    : theme === 'Dark' 
                      ? 'text-gray-500 hover:bg-white/5 hover:text-white'
                      : 'text-slate-500 hover:bg-slate-50 hover:text-slate-900'
                }`}
              >
                <Icon size={18} className={`${active ? 'text-white' : theme === 'Dark' ? 'text-gray-600 group-hover:text-gray-300' : 'text-slate-400 group-hover:text-slate-600'}`} />
                {!collapsed && <span className="text-[13px] font-black uppercase tracking-widest">{item.label}</span>}
                {active && !collapsed && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-white/50" />}
                {/* Chat unread badge */}
                {item.path === '/admin/chat' && chatUnread > 0 && (
                  <span className={`${collapsed ? 'absolute -top-1 -right-1' : 'ml-auto'} min-w-[18px] h-[18px] bg-red-500 text-white text-[9px] font-black rounded-full flex items-center justify-center px-1 border-2 ${active ? 'border-blue-600' : 'border-white'}`}>
                    {chatUnread > 9 ? '9+' : chatUnread}
                  </span>
                )}
              </Link>
            );
          })}
        </nav>

        {/* Theme Toggle & Logout */}
        <div className="p-4 mt-auto space-y-2">
          <button
            onClick={toggleTheme}
            className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all group ${theme === 'Dark' ? 'text-gray-500 hover:bg-white/5 hover:text-yellow-400' : 'text-slate-500 hover:bg-slate-50 hover:text-yellow-600'}`}
          >
            {theme === 'Dark' ? <FaSun size={18} /> : <FaMoon size={18} />}
            {!collapsed && <span className="text-[13px] font-black uppercase tracking-widest">{theme === 'Dark' ? 'Light Mode' : 'Dark Mode'}</span>}
          </button>
          <button
            onClick={handleLogout}
            className={`flex items-center gap-4 w-full px-4 py-3.5 rounded-xl transition-all group ${theme === 'Dark' ? 'text-gray-500 hover:bg-red-500/10 hover:text-red-400' : 'text-slate-500 hover:bg-red-50 hover:text-red-600'}`}
          >
            <FaSignOutAlt size={18} className="group-hover:rotate-180 transition-transform duration-500" />
            {!collapsed && <span className="text-[13px] font-black uppercase tracking-widest">Logout</span>}
          </button>
        </div>
      </motion.aside>

      {/* ── Main Content Area ── */}
      <div className="flex-grow flex flex-col overflow-hidden relative">
        
        {/* Top Header/Action Bar */}
        <header className={`h-20 flex items-center justify-between px-8 z-10 ${theme === 'Dark' ? 'bg-transparent border-b border-white/5' : 'bg-white border-b border-slate-200'}`}>
          <div className="flex items-center gap-6">
            <button onClick={() => setCollapsed(!collapsed)} className={`${theme === 'Dark' ? 'text-gray-500 hover:text-white' : 'text-slate-400 hover:text-slate-900'} transition-colors`}>
              <FaBars size={18} />
            </button>
            <div className="hidden md:flex items-center gap-2">
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'}`}>Admin</span>
              <div className={`w-1 h-1 rounded-full ${theme === 'Dark' ? 'bg-gray-800' : 'bg-slate-200'}`} />
              <span className={`text-[10px] font-black uppercase tracking-[0.2em] ${theme === 'Dark' ? 'text-blue-500' : 'text-blue-600'}`}>
                {location.pathname.split('/').pop() || 'Dashboard'}
              </span>
            </div>
          </div>
          
          <div className="flex items-center gap-6">
            <div className="relative group hidden sm:block">
              <FaSearch size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'} group-focus-within:text-blue-500 transition-colors`} />
              <input 
                type="text" 
                placeholder="Search analytics..." 
                className={`rounded-xl py-2.5 pl-11 pr-4 text-xs font-bold outline-none w-64 transition-all ${theme === 'Dark' ? 'bg-white/5 border border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border border-slate-200 text-slate-900 focus:border-blue-500/50'}`}
              />
            </div>
            
            <div className="relative" ref={notificationRef}>
              <button 
                onClick={() => setShowNotifications(!showNotifications)}
                className={`relative p-2.5 rounded-xl transition-all ${theme === 'Dark' ? 'bg-white/5 text-gray-500 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}
              >
                <FaBell size={18} />
                {notifications.filter(n => !n.isRead).length > 0 && (
                  <span className="absolute top-2 right-2 w-2 h-2 bg-blue-500 rounded-full border-2 border-inherit" />
                )}
              </button>

              <AnimatePresence>
                {showNotifications && (
                  <motion.div
                    initial={{ opacity: 0, y: 10, scale: 0.95 }}
                    animate={{ opacity: 1, y: 0, scale: 1 }}
                    exit={{ opacity: 0, y: 10, scale: 0.95 }}
                    className={`absolute right-0 mt-3 w-80 rounded-2xl shadow-2xl overflow-hidden z-50 border ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/10' : 'bg-white border-slate-200'}`}
                  >
                    <div className={`p-4 border-b flex items-center justify-between ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                      <h3 className={`font-black text-sm uppercase tracking-widest ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Notifications</h3>
                      <button 
                        onClick={handleMarkAllAsRead}
                        className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-blue-400 transition-colors"
                      >
                        Mark all as read
                      </button>
                    </div>
                    <div className="max-h-[400px] overflow-y-auto custom-scrollbar">
                      {notifications.length > 0 ? (
                        notifications.map((notification) => (
                          <div 
                            key={notification._id}
                            onClick={() => handleMarkAsRead(notification._id)}
                            className={`p-4 border-b last:border-0 cursor-pointer transition-all hover:bg-blue-500/5 group relative ${theme === 'Dark' ? 'border-white/5' : 'border-slate-50'} ${!notification.isRead ? (theme === 'Dark' ? 'bg-blue-500/5' : 'bg-blue-50/50') : ''}`}
                          >
                            <div className="flex gap-3">
                              <div className={`w-8 h-8 rounded-lg flex items-center justify-center flex-shrink-0 ${
                                notification.type === 'ORDER_PLACED' ? 'bg-green-500/10 text-green-500' :
                                notification.type === 'PRODUCT_ADDED' ? 'bg-blue-500/10 text-blue-500' :
                                'bg-slate-500/10 text-slate-500'
                              }`}>
                                {notification.type === 'ORDER_PLACED' ? <FaShoppingCart size={14} /> : 
                                 notification.type === 'PRODUCT_ADDED' ? <FaBox size={14} /> : 
                                 <FaBell size={14} />}
                              </div>
                              <div className="flex-1 min-w-0">
                                <p className={`text-xs font-bold truncate ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{notification.title}</p>
                                <p className={`text-[11px] mt-0.5 line-clamp-2 ${theme === 'Dark' ? 'text-slate-400' : 'text-slate-500'}`}>{notification.message}</p>
                                <p className="text-[9px] mt-2 font-medium text-slate-500">
                                  {new Date(notification.createdAt).toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' })}
                                </p>
                              </div>
                              <button 
                                onClick={(e) => handleDeleteNotification(e, notification._id)}
                                className="opacity-0 group-hover:opacity-100 p-1.5 hover:text-red-500 transition-all absolute top-2 right-2"
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
                          <FaEnvelopeOpen className="mx-auto text-slate-500/30 mb-3" size={32} />
                          <p className="text-xs font-bold text-slate-500 uppercase tracking-widest">No notifications</p>
                        </div>
                      )}
                    </div>
                    {notifications.length > 0 && (
                      <Link 
                        to="/admin/settings" 
                        onClick={() => setShowNotifications(false)}
                        className={`block p-3 text-center text-[10px] font-black uppercase tracking-widest border-t transition-colors ${theme === 'Dark' ? 'border-white/5 text-slate-500 hover:text-white' : 'border-slate-100 text-slate-400 hover:text-slate-900'}`}
                      >
                        View all settings
                      </Link>
                    )}
                  </motion.div>
                )}
              </AnimatePresence>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className={`flex-grow overflow-y-auto px-8 py-8 custom-scrollbar ${theme === 'Dark' ? 'bg-[#05070a]' : 'bg-[#f8fafc]'}`}>
          <Outlet />
        </main>
      </div>
    </div>
  );
};

export default AdminLayout;

