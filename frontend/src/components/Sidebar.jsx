import { Link, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaHome, FaBox, FaThLarge, FaTools, FaHistory, 
  FaRegHeart, FaInfoCircle, FaHeadset, FaBolt, FaChevronRight 
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { label: 'Home', path: '/', icon: FaHome },
    { label: 'Shop All', path: '/products', icon: FaBox },
    { label: 'Categories', path: '/categories', icon: FaThLarge },
    { label: 'Services', path: '/services', icon: FaTools },
    { label: 'My Orders', path: '/dashboard/orders', icon: FaHistory },
    { label: 'Wishlist', path: '/dashboard/wishlist', icon: FaRegHeart },
    { label: 'About Us', path: '/about', icon: FaInfoCircle },
    { label: 'Support', path: '/contact', icon: FaHeadset },
  ];

  const isActive = (path) => 
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside 
      className={`fixed left-0 top-[158px] bottom-0 w-[280px] bg-bg-main border-r border-border-main z-40 transition-transform duration-500 lg:translate-x-0 ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col p-6">
        <div className="space-y-2 flex-grow overflow-y-auto custom-scrollbar">
          <p className="text-[10px] font-black text-text-secondary uppercase tracking-[0.3em] mb-6 px-4">Navigation</p>
          
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`group flex items-center justify-between px-5 py-4 rounded-2xl transition-all ${
                  active 
                    ? 'bg-blue-600/10 border border-blue-500/20 text-blue-400' 
                    : 'text-text-secondary hover:bg-bg-surface hover:text-text-main border border-transparent'
                }`}
              >
                <div className="flex items-center gap-4">
                  <item.icon size={18} className={active ? 'text-blue-400' : 'text-text-secondary group-hover:text-text-main transition-colors'} />
                  <span className="text-[13px] font-black uppercase tracking-widest">{item.label}</span>
                </div>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(13,110,253,0.8)]" />}
              </Link>
            );
          })}
        </div>

        <div className="mt-auto pt-6 border-t border-border-main">
          <div className="bg-gradient-to-br from-blue-600/10 to-blue-400/5 rounded-3xl p-6 border border-blue-500/10 relative overflow-hidden group">
            <div className="absolute top-0 right-0 w-24 h-24 bg-blue-600/5 blur-[40px] rounded-full group-hover:bg-blue-600/10 transition-all" />
            <div className="relative z-10">
              <FaBolt className="text-blue-400 text-xl mb-3" />
              <p className="text-text-main font-black text-xs uppercase tracking-tight mb-1">DODOS Premium</p>
              <p className="text-text-secondary text-[10px] font-bold uppercase tracking-widest mb-4">Unlock exclusive deals and faster delivery.</p>
              <Link to="/products" className="inline-flex items-center gap-2 text-[10px] font-black text-blue-400 uppercase tracking-[0.2em] hover:text-text-main transition-colors">
                Explore Now <FaChevronRight size={8} />
              </Link>
            </div>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;