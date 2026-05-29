import { Link, useLocation } from 'react-router-dom';
import {
  FaHome, FaBox, FaThLarge, FaTools, FaHistory,
  FaRegHeart, FaInfoCircle, FaHeadset, FaChevronRight, FaBolt
} from 'react-icons/fa';

const Sidebar = ({ isOpen, setIsOpen }) => {
  const location = useLocation();

  const menuItems = [
    { label: 'Home',       path: '/',                  icon: FaHome },
    { label: 'Shop All',   path: '/products',           icon: FaBox },
    { label: 'Categories', path: '/categories',         icon: FaThLarge },
    { label: 'Services',   path: '/services',           icon: FaTools },
    { label: 'My Orders',  path: '/dashboard/orders',   icon: FaHistory },
    { label: 'Wishlist',   path: '/dashboard/wishlist', icon: FaRegHeart },
    { label: 'About Us',   path: '/about',              icon: FaInfoCircle },
    { label: 'Support',    path: '/contact',            icon: FaHeadset },
  ];

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  return (
    <aside
      className={`fixed left-0 top-[158px] bottom-0 w-[260px] bg-white border-r border-gray-200 z-40 transition-transform duration-500 lg:translate-x-0 shadow-sm ${
        isOpen ? 'translate-x-0' : '-translate-x-full'
      }`}
    >
      <div className="h-full flex flex-col p-4">
        <p className="text-[10px] font-black text-gray-400 uppercase tracking-[0.3em] mb-4 px-3">Navigation</p>

        <div className="space-y-1 flex-grow overflow-y-auto custom-scrollbar">
          {menuItems.map((item) => {
            const active = isActive(item.path);
            return (
              <Link
                key={item.label}
                to={item.path}
                className={`group flex items-center justify-between px-4 py-3 rounded-xl transition-all ${
                  active
                    ? 'bg-green-50 border border-green-200 text-green-700'
                    : 'text-gray-500 hover:bg-gray-50 hover:text-gray-900 border border-transparent'
                }`}
              >
                <div className="flex items-center gap-3">
                  <item.icon
                    size={16}
                    className={active ? 'text-green-600' : 'text-gray-400 group-hover:text-gray-600 transition-colors'}
                  />
                  <span className="text-[13px] font-semibold">{item.label}</span>
                </div>
                {active && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
              </Link>
            );
          })}
        </div>

        {/* Promo card */}
        <div className="mt-4 pt-4 border-t border-gray-100">
          <div className="bg-green-500 rounded-xl p-5 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-20 h-20 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/2" />
            <FaBolt className="text-white text-lg mb-2 relative z-10" />
            <p className="text-white font-black text-xs uppercase tracking-tight mb-1 relative z-10">DODOS Premium</p>
            <p className="text-green-100 text-[10px] font-semibold mb-3 relative z-10">Exclusive deals & faster delivery.</p>
            <Link
              to="/products"
              className="inline-flex items-center gap-1.5 text-[10px] font-black text-white uppercase tracking-widest hover:text-green-100 transition-colors relative z-10"
            >
              Explore Now <FaChevronRight size={8} />
            </Link>
          </div>
        </div>
      </div>
    </aside>
  );
};

export default Sidebar;
