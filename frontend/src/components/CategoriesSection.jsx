import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  FaArrowRight, FaMobileAlt, FaBatteryFull, FaTools, 
  FaMicrochip, FaCamera, FaHeadphones, FaLaptop, 
  FaTv, FaGamepad, FaPlug, FaShieldAlt, FaKeyboard,
  FaImage
} from 'react-icons/fa';
import { useLocale } from '../context/LocaleContext';
import { categoryAPI } from '../services/api';

const ICON_MAP = {
  FaMobileAlt,
  FaBatteryFull,
  FaTools,
  FaMicrochip,
  FaCamera,
  FaHeadphones,
  FaLaptop,
  FaTv,
  FaGamepad,
  FaPlug,
  FaShieldAlt,
  FaKeyboard
};

const CategoriesSection = () => {
  const { t } = useLocale();
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getCategories();
        // filter by highlightedHome if available, or just take first few
        setCategories(res.data.filter(c => c.isActive) || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchCats();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-6 hide-scrollbar">
        {[1,2,3,4,5,6].map(i => (
          <div key={i} className="flex-shrink-0 w-24 flex flex-col items-center gap-3">
            <div className="w-20 h-20 rounded-xl bg-gray-100 animate-pulse" />
            <div className="w-12 h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-8 overflow-x-auto py-8 hide-scrollbar">
      {categories.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || FaMobileAlt;
        return (
          <Link 
            key={cat._id}
            to={`/products?category=${cat.name}`}
            className="flex-shrink-0 w-36 flex flex-col items-center gap-5 group"
          >
            <div className="w-32 h-32 rounded-3xl bg-[#0a0d14] border border-white/5 shadow-2xl flex items-center justify-center text-slate-300 group-hover:border-blue-500/50 group-hover:text-blue-400 group-hover:shadow-blue-500/10 group-hover:-translate-y-2 transition-all duration-500 relative overflow-hidden">
              {/* Background gradient on hover */}
              <div className="absolute inset-0 bg-gradient-to-br from-blue-600/0 to-blue-600/0 group-hover:from-blue-600/5 group-hover:to-blue-600/20 transition-all duration-500" />
              
              {cat.image ? (
                <img src={cat.image} className="w-16 h-16 object-contain group-hover:scale-110 transition-transform duration-500 relative z-10" alt={cat.name} />
              ) : (
                <IconComponent size={40} className="group-hover:scale-110 transition-transform duration-500 relative z-10" />
              )}
            </div>
            <div className="text-center">
              <span className="text-sm font-black text-slate-400 group-hover:text-white uppercase tracking-widest line-clamp-1 leading-tight transition-colors">
                {cat.name}
              </span>
              <p className="text-[9px] font-bold text-slate-600 uppercase tracking-widest mt-1 opacity-0 group-hover:opacity-100 transition-opacity">
                {cat.productCount || 0} Items
              </p>
            </div>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoriesSection;
