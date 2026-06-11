import { useState, useEffect, useCallback } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { productAPI, slideAPI, categoryAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import PromoBanner from '../components/PromoBanner';
import {
  FaFilter, FaSearch, FaSortAmountDown, FaThLarge, FaList,
  FaTimes, FaStar, FaHistory, FaChevronDown, FaChevronRight
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../context/LocaleContext';

const Products = () => {
  const { t, formatPrice } = useLocale();
  const location = useLocation();
  const navigate = useNavigate();
  const queryParams = new URLSearchParams(location.search);

  const [products, setProducts]           = useState([]);
  const [categories, setCategories]       = useState([]);
  const [promoBanner, setPromoBanner]     = useState(null);
  const [loading, setLoading]             = useState(true);
  const [viewMode, setViewMode]           = useState('grid');
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [searchQuery, setSearchQuery]     = useState(queryParams.get('search') || '');
  const [openSections, setOpenSections]   = useState({ categories: true, subcategories: true, price: true, brand: true, rating: true });

  const [filters, setFilters] = useState({
    category:    queryParams.get('category')    || 'All',
    subcategory: queryParams.get('subcategory') || 'All',
    brand:       queryParams.get('brand')       || 'All',
    minPrice:    queryParams.get('minPrice')    || '',
    maxPrice:    queryParams.get('maxPrice')    || '',
    rating:      queryParams.get('rating')      || 'All',
    sort:        queryParams.get('sort')        || 'newest',
  });

  const brands = ['Apple', 'Samsung', 'Tecno', 'Itel', 'Infinix', 'Sony', 'Oppo', 'Huawei'];

  useEffect(() => {
    const fetchCats = async () => {
      try {
        const res = await categoryAPI.getCategories();
        setCategories(res.data?.filter(c => c.isActive) || []);
      } catch {}
    };
    const fetchBanner = async () => {
      try {
        const res = await slideAPI.getSlides();
        const withBanner = (res.data || []).find(s => s.bannerImage);
        if (withBanner) setPromoBanner(withBanner);
      } catch {}
    };
    fetchCats();
    fetchBanner();
  }, []);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    try {
      const params = {
        search:      searchQuery,
        category:    filters.category    !== 'All' ? filters.category    : '',
        subcategory: filters.subcategory !== 'All' ? filters.subcategory : '',
        brand:       filters.brand       !== 'All' ? filters.brand       : '',
        minPrice:    filters.minPrice,
        maxPrice:    filters.maxPrice,
        rating:      filters.rating      !== 'All' ? filters.rating      : '',
        sort:        filters.sort,
      };
      const res = await productAPI.getProducts(params);
      setProducts(res.data?.products || []);
    } catch {}
    finally { setLoading(false); }
  }, [searchQuery, filters]);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  const handleFilterChange = (name, value) => {
    const newFilters = { ...filters, [name]: value };
    setFilters(newFilters);
    const params = new URLSearchParams();
    if (searchQuery) params.set('search', searchQuery);
    Object.keys(newFilters).forEach(k => {
      if (newFilters[k] && newFilters[k] !== 'All') params.set(k, newFilters[k]);
    });
    navigate(`/products?${params.toString()}`, { replace: true });
  };

  const clearFilters = () => {
    setFilters({ category: 'All', subcategory: 'All', brand: 'All', minPrice: '', maxPrice: '', rating: 'All', sort: 'newest' });
    setSearchQuery('');
    navigate('/products', { replace: true });
  };

  const toggleSection = (key) => setOpenSections(prev => ({ ...prev, [key]: !prev[key] }));

  const activeFilterCount = [
    filters.category !== 'All',
    filters.brand    !== 'All',
    filters.minPrice !== '',
    filters.maxPrice !== '',
    filters.rating   !== 'All',
  ].filter(Boolean).length;

  /* ── SIDEBAR ── */
  const Sidebar = () => (
    <div className="space-y-0 bg-white border border-gray-200 rounded-xl overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-4 py-3 bg-gray-50 border-b border-gray-200">
        <span className="text-sm font-black text-gray-800 uppercase tracking-wide">Filters</span>
        {activeFilterCount > 0 && (
          <button onClick={clearFilters} className="text-[10px] font-bold text-red-500 hover:text-red-600 uppercase tracking-widest flex items-center gap-1">
            <FaTimes size={9} /> Clear all
          </button>
        )}
      </div>

      {/* Categories */}
      <SideSection title="Categories" open={openSections.categories} onToggle={() => toggleSection('categories')}>
        <div className="space-y-0.5">
          <SideItem label="All Categories" active={filters.category === 'All'} onClick={() => handleFilterChange('category', 'All')} />
          {categories.map(cat => (
            <SideItem key={cat._id} label={cat.name} active={filters.category === cat._id} onClick={() => handleFilterChange('category', cat._id)} />
          ))}
        </div>
      </SideSection>

      {/* Subcategories — shown when a category with subcategories is selected */}
      {(() => {
        const selectedCat = categories.find(c => c._id === filters.category);
        const subs = selectedCat?.subcategories || [];
        if (!subs.length) return null;
        return (
          <SideSection title="Subcategories" open={openSections.subcategories} onToggle={() => toggleSection('subcategories')}>
            <div className="space-y-0.5">
              <SideItem label="All" active={filters.subcategory === 'All'} onClick={() => handleFilterChange('subcategory', 'All')} />
              {subs.map(sub => (
                <SideItem key={sub} label={sub} active={filters.subcategory === sub} onClick={() => handleFilterChange('subcategory', sub)} />
              ))}
            </div>
          </SideSection>
        );
      })()}

      {/* Price */}
      <SideSection title="Price Range" open={openSections.price} onToggle={() => toggleSection('price')}>
        <div className="flex gap-2">
          <input
            type="number" placeholder="Min"
            value={filters.minPrice}
            onChange={e => handleFilterChange('minPrice', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:border-green-500"
          />
          <input
            type="number" placeholder="Max"
            value={filters.maxPrice}
            onChange={e => handleFilterChange('maxPrice', e.target.value)}
            className="w-full border border-gray-200 rounded-lg px-3 py-2 text-xs text-gray-700 outline-none focus:border-green-500"
          />
        </div>
      </SideSection>

      {/* Brand */}
      <SideSection title="Brand" open={openSections.brand} onToggle={() => toggleSection('brand')}>
        <div className="space-y-0.5">
          <SideItem label="All Brands" active={filters.brand === 'All'} onClick={() => handleFilterChange('brand', 'All')} />
          {brands.map(b => (
            <SideItem key={b} label={b} active={filters.brand === b} onClick={() => handleFilterChange('brand', b)} />
          ))}
        </div>
      </SideSection>

      {/* Rating */}
      <SideSection title="Customer Rating" open={openSections.rating} onToggle={() => toggleSection('rating')}>
        <div className="space-y-1">
          {[5, 4, 3, 2].map(star => (
            <button
              key={star}
              onClick={() => handleFilterChange('rating', star)}
              className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-xs transition-all ${
                filters.rating == star ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50'
              }`}
            >
              <div className="flex gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={10} className={i < star ? 'text-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span>& Up</span>
            </button>
          ))}
        </div>
      </SideSection>
    </div>
  );

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-16">
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8">

        {/* ── TOP BAR ── */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-6">
          <div>
            <h1 className="text-xl font-black text-gray-900 tracking-tight">
              Shop — <span className="text-green-600">{products.length} products</span>
            </h1>
            <p className="text-xs text-gray-500 mt-0.5">Original accessories &amp; professional tools</p>
          </div>

          <div className="flex items-center gap-3 flex-wrap">
            {/* Search */}
            <div className="relative">
              <FaSearch className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={12} />
              <input
                type="text"
                placeholder="Search products..."
                value={searchQuery}
                onChange={e => setSearchQuery(e.target.value)}
                className="bg-white border border-gray-200 rounded-lg py-2.5 pl-9 pr-4 text-sm text-gray-700 outline-none focus:border-green-500 w-56 transition-all"
              />
            </div>

            {/* Sort */}
            <div className="relative">
              <select
                value={filters.sort}
                onChange={e => handleFilterChange('sort', e.target.value)}
                className="appearance-none bg-white border border-gray-200 rounded-lg py-2.5 pl-4 pr-9 text-xs font-semibold text-gray-700 outline-none focus:border-green-500"
              >
                <option value="newest">Newest</option>
                <option value="price-low">Price: Low → High</option>
                <option value="price-high">Price: High → Low</option>
                <option value="rating">Best Rating</option>
              </select>
              <FaSortAmountDown className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 pointer-events-none" size={11} />
            </div>

            {/* View toggle */}
            <div className="flex items-center gap-1 bg-white border border-gray-200 rounded-lg p-1">
              <button
                onClick={() => setViewMode('grid')}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${viewMode === 'grid' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FaThLarge size={13} />
              </button>
              <button
                onClick={() => setViewMode('list')}
                className={`w-8 h-8 rounded flex items-center justify-center transition-all ${viewMode === 'list' ? 'bg-green-500 text-white' : 'text-gray-400 hover:text-gray-600'}`}
              >
                <FaList size={13} />
              </button>
            </div>

            {/* Mobile filter btn */}
            <button
              onClick={() => setShowMobileFilters(true)}
              className="lg:hidden flex items-center gap-2 bg-green-500 text-white px-4 py-2.5 rounded-lg text-xs font-bold"
            >
              <FaFilter size={11} /> Filters {activeFilterCount > 0 && `(${activeFilterCount})`}
            </button>
          </div>
        </div>

        <div className="flex gap-6">
          {/* ── SIDEBAR ── */}
          <aside className="hidden lg:block w-56 shrink-0">
            <div className="sticky top-[180px]">
              <Sidebar />
            </div>
          </aside>

          {/* ── PRODUCT GRID ── */}
          <main className="flex-1 min-w-0">
            {loading ? (
              <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                {[...Array(10)].map((_, i) => (
                  <div key={i} className="bg-white border border-gray-200 rounded-xl overflow-hidden animate-pulse">
                    <div className="h-44 bg-gray-100" />
                    <div className="p-3 space-y-2">
                      <div className="h-3 bg-gray-100 rounded w-3/4" />
                      <div className="h-3 bg-gray-100 rounded w-1/2" />
                      <div className="h-8 bg-gray-100 rounded mt-3" />
                    </div>
                  </div>
                ))}
              </div>
            ) : products.length > 0 ? (
              <>
                {/* First batch: up to 10 products */}
                <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                  {products.slice(0, 10).map(product => (
                    <ProductCard key={product._id} product={product} viewMode={viewMode} />
                  ))}
                </div>

                {/* Promo banner after first 10 products */}
                {viewMode === 'grid' && products.length > 10 && promoBanner && (
                  <div className="my-8">
                    <PromoBanner
                      image={promoBanner.bannerImage}
                      tag={promoBanner.badge}
                      title={promoBanner.title}
                      subtitle={promoBanner.subtitle}
                      cta="Shop Now"
                      ctaLink="/products"
                    />
                  </div>
                )}

                {/* Remaining products */}
                {products.length > 10 && (
                  <div className={`grid gap-4 ${viewMode === 'grid' ? 'grid-cols-2 sm:grid-cols-3 xl:grid-cols-4 2xl:grid-cols-5' : 'grid-cols-1'}`}>
                    {products.slice(10).map(product => (
                      <ProductCard key={product._id} product={product} viewMode={viewMode} />
                    ))}
                  </div>
                )}
              </>
            ) : (
              <div className="flex flex-col items-center justify-center py-32 bg-white border border-gray-200 rounded-xl">
                <FaSearch size={40} className="text-gray-300 mb-4" />
                <h3 className="text-lg font-black text-gray-700">No Products Found</h3>
                <p className="text-sm text-gray-400 mt-1">Try adjusting your filters or search query</p>
                <button onClick={clearFilters} className="mt-6 px-6 py-2.5 bg-green-500 hover:bg-green-600 text-white rounded-lg text-sm font-bold transition-all">
                  Clear Filters
                </button>
              </div>
            )}

            {/* Pagination */}
            {!loading && products.length > 0 && (
              <div className="mt-10 flex items-center justify-center gap-2">
                {[1, 2, 3].map(p => (
                  <button key={p} className={`w-9 h-9 rounded-lg text-sm font-bold transition-all ${p === 1 ? 'bg-green-500 text-white' : 'bg-white border border-gray-200 text-gray-600 hover:border-green-500 hover:text-green-600'}`}>
                    {p}
                  </button>
                ))}
                <span className="text-gray-400 px-1">...</span>
                <button className="w-9 h-9 rounded-lg bg-white border border-gray-200 text-sm font-bold text-gray-600 hover:border-green-500 hover:text-green-600 transition-all">12</button>
              </div>
            )}
          </main>
        </div>
      </div>

      {/* ── MOBILE FILTER DRAWER ── */}
      <AnimatePresence>
        {showMobileFilters && (
          <>
            <motion.div
              initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black/50 z-[100]"
              onClick={() => setShowMobileFilters(false)}
            />
            <motion.div
              initial={{ x: '-100%' }} animate={{ x: 0 }} exit={{ x: '-100%' }}
              className="fixed top-0 left-0 bottom-0 w-72 bg-white z-[110] overflow-y-auto shadow-2xl"
            >
              <div className="flex items-center justify-between p-4 border-b border-gray-200">
                <h2 className="font-black text-gray-900 uppercase tracking-wide">Filters</h2>
                <button onClick={() => setShowMobileFilters(false)} className="w-8 h-8 rounded-lg bg-gray-100 flex items-center justify-center text-gray-500">
                  <FaTimes size={13} />
                </button>
              </div>
              <div className="p-4">
                <Sidebar />
              </div>
              <div className="p-4 border-t border-gray-200">
                <button
                  onClick={() => setShowMobileFilters(false)}
                  className="w-full py-3 bg-green-500 hover:bg-green-600 text-white rounded-lg font-bold text-sm transition-all"
                >
                  Show {products.length} Products
                </button>
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </div>
  );
};

/* ── Helpers ── */
const SideSection = ({ title, open, onToggle, children }) => (
  <div className="border-b border-gray-100 last:border-0">
    <button
      onClick={onToggle}
      className="w-full flex items-center justify-between px-4 py-3 text-xs font-black text-gray-700 uppercase tracking-wide hover:bg-gray-50 transition-colors"
    >
      {title}
      <FaChevronDown size={10} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
    </button>
    <AnimatePresence>
      {open && (
        <motion.div
          initial={{ height: 0, opacity: 0 }}
          animate={{ height: 'auto', opacity: 1 }}
          exit={{ height: 0, opacity: 0 }}
          className="overflow-hidden"
        >
          <div className="px-3 pb-3">{children}</div>
        </motion.div>
      )}
    </AnimatePresence>
  </div>
);

const SideItem = ({ label, active, onClick }) => (
  <button
    onClick={onClick}
    className={`w-full text-left px-3 py-2 rounded-lg text-xs transition-all flex items-center justify-between ${
      active ? 'bg-green-50 text-green-700 font-bold' : 'text-gray-600 hover:bg-gray-50 font-medium'
    }`}
  >
    {label}
    {active && <div className="w-1.5 h-1.5 rounded-full bg-green-500" />}
  </button>
);

export default Products;
