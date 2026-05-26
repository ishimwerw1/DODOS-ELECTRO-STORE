import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productAPI, adminAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import { 
  FaFilter, FaSearch, FaSortAmountDown, FaThLarge, FaList, 
  FaChevronDown, FaTimes, FaStar, FaSlidersH, FaHistory, FaBolt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../context/LocaleContext';

const Products = () => {
  const { t, formatPrice } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [products, setProducts] = useState([]);
  const [categories, setCategories] = useState([]);
  const [loading, setLoading] = useState(true);
  const [viewMode, setViewMode] = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery] = useState(queryParams.get('search') || '');

  // Filters State
  const [filters, setFilters] = useState({
    category: queryParams.get('category') || 'All',
    brand: queryParams.get('brand') || 'All',
    minPrice: queryParams.get('minPrice') || '',
    maxPrice: queryParams.get('maxPrice') || '',
    rating: queryParams.get('rating') || 'All',
    sort: queryParams.get('sort') || 'newest'
  });

  const brands = ['Apple', 'Samsung', 'Tecno', 'Itel', 'Infinix', 'Sony', 'Oppo', 'Huawei'];

  useEffect(() => {
    const fetchInitialData = async () => {
      try {
        const catRes = await productAPI.getCategories();
        setCategories(catRes.data.filter(c => c.isActive) || []);
      } catch (err) {
        console.error('Failed to fetch categories:', err);
      }
    };
    fetchInitialData();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search: searchQuery,
        category: filters.category !== 'All' ? filters.category : '',
        brand: filters.brand !== 'All' ? filters.brand : '',
        minPrice: filters.minPrice,
        maxPrice: filters.maxPrice,
        rating: filters.rating !== 'All' ? filters.rating : '',
        sort: filters.sort
      };
      const res = await productAPI.getProducts(params);
      setProducts(res.data?.products || []);
    } catch (err) {
      console.error('Failed to fetch products:', err);
    } finally {
      setLoading(false);
    }
  }, [searchQuery, filters]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    Object.keys(newFilters).forEach(key => {
      if (newFilters[key] && newFilters[key] !== 'All') {
        params.set(key, newFilters[key]);
      }
    });
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    setFilters({
      category: 'All',
      brand: 'All',
      minPrice: '',
      maxPrice: '',
      rating: 'All',
      sort: 'newest'
    });
    setSearchQuery('');
    navigate('/products', { replace: true });
  };

  return (
    <div className="bg-bg-main min-h-screen pt-7 pb-20 bg-mesh">
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8">
        
        {/* ── TOP HEADER ── */}
        <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-6 mb-12">
          <div>
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
              Premium Shop
              <div className="bg-blue-600/10 border border-blue-500/20 px-3 py-1 rounded-lg flex items-center gap-2">
                <FaBolt className="text-blue-400 text-xs" />
                <span className="text-blue-400 text-[10px] font-black uppercase tracking-widest">{products.length} Items</span>
              </div>
            </h1>
            <p className="text-slate-500 text-sm font-bold mt-2 uppercase tracking-widest">Original Accessories & Professional Tools</p>
          </div>

          <div className="flex flex-wrap items-center gap-4">
            {/* Live Search */}
            <div className="relative w-full sm:w-80 group">
              <FaSearch className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" />
              <input 
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                className="w-full bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-12 pr-6 text-white text-sm font-medium outline-none focus:border-blue-500/50 focus:bg-white/[0.08] transition-all"
              />
            </div>

            {/* View Mode & Sort */}
            <div className="flex items-center gap-2 bg-white/5 p-1.5 rounded-2xl border border-white/5">
              <button 
                onClick={() => setViewMode('grid')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                <FaThLarge size={16} />
              </button>
              <button 
                onClick={() => setViewMode('list')}
                className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-white'}`}
              >
                <FaList size={16} />
              </button>
            </div>

            <div className="relative group">
              <select 
                value={filters.sort}
                onChange={(e) => handleFilterChange('sort', e.target.value)}
                className="appearance-none bg-white/5 border border-white/5 rounded-2xl py-3.5 pl-6 pr-12 text-white text-sm font-bold uppercase tracking-widest outline-none focus:border-blue-500/50 cursor-pointer"
              >
                <option value="newest" className="bg-[#0a0d14]">Newest</option>
                <option value="price-low" className="bg-[#0a0d14]">Price: Low to High</option>
                <option value="price-high" className="bg-[#0a0d14]">Price: High to Low</option>
                <option value="rating" className="bg-[#0a0d14]">Best Rating</option>
              </select>
              <FaSortAmountDown className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 pointer-events-none" />
            </div>

            <button 
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden w-12 h-12 bg-blue-600 text-white rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20"
            >
              <FaFilter />
            </button>
          </div>
        </div>

        <div className="flex gap-10">
          {/* ── SIDEBAR FILTERS ── */}
          <aside className="hidden lg:block w-72 shrink-0">
            <div className="sticky top-[180px] space-y-8">
              {/* Category Filter */}
              <FilterSection title="Categories">
                <div className="space-y-2 mt-4 max-h-60 overflow-y-auto custom-scrollbar pr-2">
                  <FilterBadge 
                    label="All Categories" 
                    active={filters.category === 'All'} 
                    onClick={() => handleFilterChange('category', 'All')}
                  />
                  {categories.map(cat => (
                    <FilterBadge 
                      key={cat._id}
                      label={cat.name} 
                      active={filters.category === cat.name} 
                      onClick={() => handleFilterChange('category', cat.name)}
                    />
                  ))}
                </div>
              </FilterSection>

              {/* Price Range */}
              <FilterSection title="Price Range">
                <div className="grid grid-cols-2 gap-3 mt-4">
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                    <input 
                      type="number" 
                      placeholder="Min"
                      value={filters.minPrice}
                      onChange={(e) => handleFilterChange('minPrice', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-7 pr-3 text-white text-xs outline-none focus:border-blue-500/50"
                    />
                  </div>
                  <div className="relative">
                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-600 text-xs">$</span>
                    <input 
                      type="number" 
                      placeholder="Max"
                      value={filters.maxPrice}
                      onChange={(e) => handleFilterChange('maxPrice', e.target.value)}
                      className="w-full bg-white/5 border border-white/5 rounded-xl py-2.5 pl-7 pr-3 text-white text-xs outline-none focus:border-blue-500/50"
                    />
                  </div>
                </div>
              </FilterSection>

              {/* Brand Filter */}
              <FilterSection title="Popular Brands">
                <div className="grid grid-cols-2 gap-2 mt-4">
                  {brands.map(brand => (
                    <button 
                      key={brand}
                      onClick={() => handleFilterChange('brand', brand)}
                      className={`px-3 py-2 rounded-xl text-[10px] font-black uppercase tracking-widest border transition-all ${
                        filters.brand === brand 
                        ? 'bg-blue-600 border-blue-600 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white hover:border-white/10'
                      }`}
                    >
                      {brand}
                    </button>
                  ))}
                </div>
              </FilterSection>

              {/* Rating Filter */}
              <FilterSection title="Customer Rating">
                <div className="space-y-2 mt-4">
                  {[4, 3, 2].map(star => (
                    <button 
                      key={star}
                      onClick={() => handleFilterChange('rating', star)}
                      className={`w-full flex items-center justify-between p-3 rounded-xl border transition-all group ${
                        filters.rating == star 
                        ? 'bg-blue-600/10 border-blue-500/50 text-white' 
                        : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                      }`}
                    >
                      <div className="flex items-center gap-1.5">
                        <div className="flex gap-0.5">
                          {[...Array(5)].map((_, i) => (
                            <FaStar key={i} size={10} className={i < star ? 'text-yellow-500' : 'text-slate-700'} />
                          ))}
                        </div>
                        <span className="text-[10px] font-black uppercase tracking-widest">& Up</span>
                      </div>
                      <span className="text-[10px] opacity-0 group-hover:opacity-100 transition-opacity font-bold">Apply</span>
                    </button>
                  ))}
                </div>
              </FilterSection>

              <button 
                onClick={clearFilters}
                className="w-full flex items-center justify-center gap-3 py-4 bg-red-500/10 hover:bg-red-500/20 text-red-500 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] transition-all border border-red-500/20"
              >
                <FaHistory size={12} /> Reset Filters
              </button>
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <main className="flex-1">
            {loading ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {[...Array(6)].map((_, i) => (
                  <div key={i} className="aspect-[4/5] bg-white/5 rounded-[2.5rem] animate-pulse" />
                ))}
              </div>
            ) : products.length > 0 ? (
              <div className={`grid gap-6 ${viewMode === 'grid' ? 'grid-cols-1 sm:grid-cols-2 xl:grid-cols-3' : 'grid-cols-1'}`}>
                {products.map((product, idx) => (
                  <ProductCard key={product._id} product={product} viewMode={viewMode} />
                ))}
              </div>
            ) : (
              <div className="flex flex-col items-center justify-center py-40 bg-white/5 border border-white/5 rounded-[3rem]">
                <div className="w-24 h-24 bg-white/5 rounded-[2.5rem] flex items-center justify-center mb-8">
                  <FaSearch size={32} className="text-slate-700" />
                </div>
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter">No Products Found</h3>
                <p className="text-slate-500 font-bold mt-2 uppercase tracking-widest text-xs">Try adjusting your filters or search query</p>
                <button 
                  onClick={clearFilters}
                  className="mt-10 btn-premium"
                >
                  Clear All Filters
                </button>
              </div>
            )}

            {/* Pagination Placeholder */}
            {!loading && products.length > 0 && (
              <div className="mt-16 flex items-center justify-center gap-3">
                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-blue-500 transition-all font-black">1</button>
                <button className="w-12 h-12 rounded-2xl bg-blue-600 text-white shadow-lg shadow-blue-500/20 font-black">2</button>
                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-blue-500 transition-all font-black">3</button>
                <div className="px-2 text-slate-700">...</div>
                <button className="w-12 h-12 rounded-2xl bg-white/5 border border-white/5 text-slate-400 hover:text-white hover:border-blue-500 transition-all font-black">12</button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── MOBILE FILTERS DRAWER ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div 
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100]"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div 
              initial={{ x: '100%' }}
              animate={{ x: 0 }}
              exit={{ x: '100%' }}
              className="fixed top-0 right-0 bottom-0 w-full max-w-sm bg-[#05070a] z-[110] p-8 overflow-y-auto"
            >
              <div className="flex items-center justify-between mb-10">
                <h2 className="text-2xl font-black text-white uppercase tracking-tighter">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="w-10 h-10 rounded-xl bg-white/5 flex items-center justify-center text-slate-400">
                  <FaTimes />
                </button>
              </div>
              
              {/* Reuse filter sections here */}
              <div className="space-y-10">
                <FilterSection title="Categories">
                  <div className="grid grid-cols-1 gap-2 mt-4">
                    {categories.map(cat => (
                      <button 
                        key={cat._id}
                        onClick={() => handleFilterChange('category', cat.name)}
                        className={`text-left px-5 py-4 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${
                          filters.category === cat.name ? 'bg-blue-600 text-white shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-500'
                        }`}
                      >
                        {cat.name}
                      </button>
                    ))}
                  </div>
                </FilterSection>
                {/* ... Add other filter sections for mobile ... */}
                
                <button 
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full btn-premium py-5 mt-10"
                >
                  Show {products.length} Items
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

const FilterSection = ({ title, children }) => (
  <div className="pb-8 border-b border-white/5 last:border-0">
    <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.2em] mb-4">{title}</h3>
    {children}
  </div>
);

const FilterBadge = ({ label, active, onClick }) => (
  <button 
    onClick={onClick}
    className={`w-full text-left px-4 py-3 rounded-xl text-xs font-bold transition-all group flex items-center justify-between ${
      active 
      ? 'bg-blue-600/10 text-blue-400 border border-blue-500/20' 
      : 'text-slate-500 hover:text-white border border-transparent hover:border-white/5'
    }`}
  >
    {label}
    {active && <div className="w-1.5 h-1.5 rounded-full bg-blue-500 shadow-[0_0_8px_rgba(13,110,253,0.8)]" />}
  </button>
);

export default Products;
