import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { FaMobileAlt, FaBatteryFull, FaTools, FaMicrochip, FaCamera, FaHeadphones, FaLaptop, FaTv, FaGamepad, FaPlug, FaShieldAlt, FaKeyboard } from 'react-icons/fa';
import { categoryAPI } from '../services/api';

const ICON_MAP = { FaMobileAlt, FaBatteryFull, FaTools, FaMicrochip, FaCamera, FaHeadphones, FaLaptop, FaTv, FaGamepad, FaPlug, FaShieldAlt, FaKeyboard };

const CategoriesSection = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data.filter(c => c.isActive) || []);
      } catch {}
      finally { setLoading(false); }
    };
    fetchCats();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-4 overflow-x-auto py-4 hide-scrollbar">
        {[...Array(7)].map((_, i) => (
          <div key={i} className="flex-shrink-0 flex flex-col items-center gap-2">
            <div className="w-20 h-20 rounded-full bg-gray-100 animate-pulse" />
            <div className="w-14 h-3 bg-gray-100 rounded animate-pulse" />
          </div>
        ))}
      </div>
    );
  }

  return (
    <div className="flex gap-3 sm:gap-6 overflow-x-auto py-3 sm:py-4 hide-scrollbar">
      {categories.map((cat) => {
        const IconComponent = ICON_MAP[cat.icon] || FaMobileAlt;
        return (
          <Link
            key={cat._id}
            to={`/products?category=${cat.name}`}
            className="flex-shrink-0 flex flex-col items-center gap-2 sm:gap-3 group w-16 sm:w-24"
          >
            <div className="w-14 h-14 sm:w-20 sm:h-20 rounded-full bg-gray-100 border-2 border-gray-200 group-hover:border-green-400 overflow-hidden flex items-center justify-center transition-all duration-300 group-hover:shadow-md group-hover:shadow-green-500/20">
              {cat.image ? (
                <img src={cat.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt={cat.name} loading="lazy" />
              ) : (
                <IconComponent size={22} className="text-gray-400 group-hover:text-green-500 transition-colors" />
              )}
            </div>
            <span className="text-[10px] sm:text-xs font-semibold text-gray-600 group-hover:text-green-600 text-center line-clamp-2 leading-tight transition-colors w-full">
              {cat.name}
            </span>
          </Link>
        );
      })}
    </div>
  );
};

export default CategoriesSection;
