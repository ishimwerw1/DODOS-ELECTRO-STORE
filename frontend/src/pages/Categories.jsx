import { useState, useEffect, useMemo } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { FaChevronRight, FaSearch, FaThLarge, FaList, FaTag, FaLayerGroup } from 'react-icons/fa';
import { categoryAPI } from '../services/api';
import { toast } from 'react-toastify';

const Categories = () => {
  const [categories, setCategories] = useState([]);
  const [loading, setLoading]       = useState(true);
  const [search, setSearch]         = useState('');
  const [viewMode, setViewMode]     = useState('grid');

  useEffect(() => { fetchCategories(); }, []);

  const fetchCategories = async () => {
    try {
      setLoading(true);
      const res = await categoryAPI.getCategories();
      setCategories(res.data || []);
    } catch {
      toast.error('Failed to load categories');
    } finally {
      setLoading(false);
    }
  };

  const filtered = useMemo(() =>
    categories.filter(cat =>
      cat.name?.toLowerCase().includes(search.toLowerCase()) ||
      cat.description?.toLowerCase().includes(search.toLowerCase())
    ), [categories, search]);

  return (
    <div className="bg-gray-50 min-h-screen pb-16">

      {/* ── Breadcrumb ── */}
      <div className="bg-white border-b border-gray-200 py-3 px-4">
        <div className="max-w-7xl mx-auto flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <FaChevronRight size={8} />
          <span className="text-gray-700">Categories</span>
        </div>
      </div>

      {/* ── Page Header ── */}
      <div className="bg-white border-b border-gray-200 py-8 px-4">
        <div className="max-w-7xl mx-auto flex flex-col md:flex-row md:items-center justify-between gap-5">
          <div>
            <h1 className="text-2xl font-black text-gray-900">Product Categories</h1>
            <p className="text-sm text-gray-500 mt-1">{categories.length} categories available</p>
          </div>

          {/* Toolbar */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                placeholder="Search categories..."
                value={search}
                onChange={e => setSearch(e.target.value)}
                className="bg-gray-50 border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-gray-700 outline-none focus:border-green-500 w-full sm:w-56 transition-all"
              />
            </div>
            <div className="flex items-center gap-1 bg-gray-100 p-1 rounded-lg">
              <button onClick={() => setViewMode('grid')} className={`w-8 h-8 rounded flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <FaThLarge size={13} />
              </button>
              <button onClick={() => setViewMode('list')} className={`w-8 h-8 rounded flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}>
                <FaList size={13} />
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* ── Grid ── */}
      <div className="max-w-7xl mx-auto px-4 py-8">
        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5">
            {[...Array(8)].map(i => (
              <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                <div className="h-40 bg-gray-100" />
                <div className="p-4 space-y-2">
                  <div className="h-4 bg-gray-100 rounded w-2/3" />
                  <div className="h-3 bg-gray-100 rounded w-1/2" />
                  <div className="h-8 bg-gray-100 rounded mt-3" />
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className={viewMode === 'grid'
            ? 'grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-5'
            : 'flex flex-col gap-4'
          }>
            <AnimatePresence mode="popLayout">
              {filtered.map((cat, i) => (
                <motion.div
                  layout
                  key={cat._id || cat.name}
                  initial={{ opacity: 0, scale: 0.95 }}
                  animate={{ opacity: 1, scale: 1 }}
                  exit={{ opacity: 0, scale: 0.95 }}
                  transition={{ duration: 0.2, delay: i * 0.03 }}
                  className={`group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:border-green-200 transition-all duration-300 flex ${viewMode === 'grid' ? 'flex-col' : 'flex-row h-36'}`}
                >
                  {/* Image */}
                  <div className={`relative overflow-hidden bg-gray-50 ${viewMode === 'grid' ? 'h-40 w-full' : 'w-28 sm:w-48 h-full flex-shrink-0'}`}>
                    <img
                      src={cat.image || 'https://images.unsplash.com/photo-1511707171634-5f897ff02aa9?w=400&q=80'}
                      alt={cat.name}
                      className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    />
                    <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
                    <div className="absolute top-2 left-2 w-7 h-7 rounded-lg bg-green-500 flex items-center justify-center text-white shadow">
                      <FaTag size={11} />
                    </div>
                    <div className="absolute top-2 right-2 bg-black/50 backdrop-blur-sm px-2 py-0.5 rounded-full text-[9px] font-bold text-white uppercase tracking-wider">
                      {cat.productCount || 0} items
                    </div>
                    <div className="absolute bottom-3 left-3">
                      <h3 className="text-sm font-black text-white uppercase tracking-tight leading-tight">{cat.name}</h3>
                    </div>
                  </div>

                  {/* Body */}
                  <div className="p-4 flex flex-col justify-between flex-grow">
                    <p className="text-xs text-gray-500 line-clamp-2 mb-3">{cat.description || 'Premium selection of original parts'}</p>
                    <Link
                      to={`/products?category=${cat._id}`}
                      className="w-full py-2.5 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold uppercase tracking-widest text-center transition-all flex items-center justify-center gap-1.5"
                    >
                      View Products <FaChevronRight size={9} />
                    </Link>
                  </div>
                </motion.div>
              ))}
            </AnimatePresence>
          </div>
        )}

        {filtered.length === 0 && !loading && (
          <div className="text-center py-24 bg-white border border-gray-200 rounded-xl">
            <FaLayerGroup size={40} className="text-gray-300 mx-auto mb-4" />
            <h3 className="text-lg font-black text-gray-700">No categories found</h3>
            <p className="text-sm text-gray-400 mt-1">Try adjusting your search</p>
          </div>
        )}
      </div>
    </div>
  );
};

export default Categories;
