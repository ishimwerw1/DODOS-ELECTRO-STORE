import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaChevronRight, FaSearch, FaThLarge, FaList,
  FaTag, FaChevronDown, FaLayerGroup, FaBoxes, FaBoxOpen, FaHistory
} from 'react-icons/fa';
import { productAPI } from '../services/api';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [viewMode, setViewMode] = useState('grid'); // 'grid' or 'list'

  useEffect(() => {
    fetchCategories();
  }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getCategories();
      // res.data is expected to be an array of category objects with:
      // name, description, image, productCount, subcategories
      setCategories(res.data || []);
    } catch (error) {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const filteredCategories = useMemo(() => {
    return categories.filter(cat => 
      cat.name?.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase()) ||
      cat.subcategories?.some(sub => sub.toLowerCase().includes(search.toLowerCase()))
    );
  }, [categories, search]);

  const stats = useMemo(() => {
    const totalProducts = categories.reduce((sum, cat) => sum + (cat.productCount || 0), 0);
    const totalSubcats = categories.reduce((sum, cat) => sum + (cat.subcategories?.length || 0), 0);
    return [
      { label: 'Categories', value: categories.length, icon: FaLayerGroup },
      { label: 'Subcategories', value: `${totalSubcats}+`, icon: FaBoxes },
      { label: 'Products', value: `${totalProducts}+`, icon: FaBoxOpen },
      { label: 'Years', value: '4+', icon: FaHistory },
    ];
  }, [categories]);

  return (
    <div className="bg-[#f8faff] min-h-screen pb-20">
      {/* ── Dark Header ── */}
      <section className="bg-[#0b1426] pt-12 pb-24 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/10 to-transparent pointer-events-none" />
        
        <div className="max-w-7xl mx-auto px-6 relative z-10">
          <nav className="flex items-center gap-2 text-[10px] font-bold uppercase tracking-widest text-blue-400 mb-6">
            <Link to="/" className="hover:text-white transition-colors">Home</Link>
            <FaChevronRight size={8} />
            <span className="text-white/60">Categories</span>
          </nav>

          <h1 className="text-4xl md:text-5xl font-black text-white mb-4 tracking-tight">Product Categories</h1>
          <p className="text-blue-200/60 text-sm mb-10 max-w-2xl font-medium">
            {categories.length} main categories • {stats[1].value} subcategories - everything for your device
          </p>

          <div className="grid grid-cols-2 md:grid-cols-4 gap-4 md:gap-6">
            {stats.map((stat, i) => (
              <motion.div 
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.1 }}
                key={i} 
                className="bg-white/5 border border-white/10 rounded-2xl p-6 backdrop-blur-md"
              >
                <div className="text-2xl font-black text-blue-400 mb-2">{stat.value}</div>
                <div className="text-[10px] font-bold uppercase tracking-[0.2em] text-white/40">{stat.label}</div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ── Toolbar ── */}
      <div className="max-w-7xl mx-auto px-6 -mt-10 relative z-20">
        <div className="bg-white shadow-xl shadow-blue-900/5 border border-blue-50 rounded-3xl p-4 flex flex-col md:flex-row items-center gap-4">
          <div className="relative flex-1 w-full">
            <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-400" size={16} />
            <input 
              type="text"
              placeholder="Search categories or subcategories..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="w-full pl-14 pr-6 py-4 rounded-2xl bg-slate-50 border-none focus:ring-2 focus:ring-blue-500 font-medium text-slate-700"
            />
          </div>
          
          <div className="flex items-center gap-3 w-full md:w-auto">
            <div className="flex bg-slate-100 p-1 rounded-xl">
              <button 
                onClick={() => setViewMode('grid')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'grid' ? 'bg-[#0b1426] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FaThLarge size={14} /> Grid
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`flex items-center gap-2 px-5 py-2.5 rounded-lg text-xs font-bold uppercase tracking-widest transition-all ${viewMode === 'list' ? 'bg-[#0b1426] text-white shadow-lg' : 'text-slate-500 hover:text-slate-700'}`}
              >
                <FaList size={14} /> List
              </button>
            </div>
            <div className="hidden lg:block h-8 w-px bg-slate-200 mx-2" />
            <div className="hidden lg:block text-xs font-bold text-slate-400 uppercase tracking-widest">
              {filteredCategories.length} of {categories.length} categories
            </div>
          </div>
        </div>
      </div>

      {/* ── Category Grid ── */}
      <div className="max-w-7xl mx-auto px-6 mt-16">
        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8">
            {[1, 2, 3, 4, 5, 6, 7, 8].map(i => (
              <div key={i} className="bg-white rounded-[2rem] h-96 animate-pulse border border-slate-100" />
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid' ? 'grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-8' : 'flex flex-col gap-6'}>
            <AnimatePresence mode="popLayout">
              {filteredCategories.map((cat, i) => (
                <motion.div
                  layout
                  initial={{ opacity: 0, scale: 0.9 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.9 }}
                  transition={{ duration: 0.3, delay: i * 0.05 }}
                  key={cat._id || cat.name}
                  className={`group bg-white rounded-[2.5rem] border border-slate-100 overflow-hidden shadow-sm hover:shadow-2xl hover:shadow-blue-900/10 transition-all duration-500 flex ${viewMode === 'grid' ? 'flex-col h-full' : 'flex-row h-64'}`}
                >
                  {/* Image Part */}
                  <div className={`relative overflow-hidden ${viewMode === 'grid' ? 'aspect-[4/3] w-full' : 'w-72 h-full flex-shrink-0'}`}>
                    <img 
                      src={cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=600&q=80'} 
                      alt={cat.name} 
                      className="w-full h-full object-cover transition-transform duration-700 group-hover:scale-110"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent" />
                    
                    <div className="absolute top-5 left-5 w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white shadow-lg">
                      <FaTag size={16} />
                    </div>

                    <div className="absolute top-5 right-5 bg-black/40 backdrop-blur-md px-3 py-1.5 rounded-full text-[10px] font-black text-white uppercase tracking-widest border border-white/10">
                      {cat.productCount || 0} items
                    </div>

                    <div className="absolute bottom-6 left-6 right-6">
                      <h3 className="text-xl font-black text-white uppercase tracking-tight leading-tight group-hover:text-blue-400 transition-colors">
                        {cat.name}
                      </h3>
                      <p className="text-white/60 text-[10px] mt-1 line-clamp-2 font-medium uppercase tracking-wide">
                        {cat.description || 'Premium selection of original parts'}
                      </p>
                    </div>
                  </div>

                  {/* Subcategories Part */}
                  <div className="p-6 flex flex-col justify-between flex-grow">
                    <div className="flex flex-wrap gap-2 mb-6">
                      {cat.subcategories?.slice(0, 6).map((sub, idx) => (
                        <Link 
                          key={idx} 
                          to={`/products?category=${cat.name}&subcategory=${sub}`}
                          className="px-3 py-1.5 rounded-full bg-slate-50 border border-slate-100 text-[9px] font-bold text-slate-500 uppercase tracking-widest hover:bg-blue-600 hover:text-white hover:border-blue-600 transition-all"
                        >
                          {sub}
                        </Link>
                      ))}
                      {(!cat.subcategories || cat.subcategories.length === 0) && (
                        <span className="text-[10px] text-slate-400 font-bold uppercase tracking-widest italic">No subcategories listed</span>
                      )}
                    </div>

                    <Link 
                      to={`/products?category=${cat.name}`}
                      className="w-full py-4 rounded-2xl bg-slate-50 text-[#0b1426] text-[10px] font-black uppercase tracking-widest text-center hover:bg-[#0b1426] hover:text-white transition-all duration-300"
                    >
                      View All Products
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filteredCategories.length === 0 && !loading && (
          <div className="text-center py-40">
            <div className="w-20 h-20 bg-slate-100 rounded-full flex items-center justify-center mx-auto mb-6 text-slate-300">
              <FaSearch size={32} />
            </div>
            <h3 className="text-2xl font-black text-[#0b1426] uppercase tracking-tighter">No categories found</h3>
            <p className="text-slate-500 mt-2">Try adjusting your search terms</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
