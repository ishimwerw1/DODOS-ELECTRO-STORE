import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  FaArrowRight, FaChevronRight, FaStar, FaListUl, FaSearch, FaBars, 
  FaFire, FaShippingFast, FaShieldAlt, FaHeadset, FaBolt, FaAward, 
  FaCheckCircle, FaTools, FaMicrochip, FaEnvelope 
} from 'react-icons/fa';
import { productAPI, categoryAPI, slideAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import CategoriesSection from '../components/CategoriesSection';
import PromoBanner from '../components/PromoBanner';
import { useLocale } from '../context/LocaleContext';

const Home = () => {
  const { t, formatPrice } = useLocale();
  const navigate = useNavigate();

  const [topDeals, setTopDeals]       = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories]   = useState([]);
  const [slides, setSlides]           = useState([]);
  const [promoBanners, setPromoBanners] = useState([]); // slides that have bannerImage and NO product image
  const [categorySections, setCategorySections] = useState([]); // Array of { category, products, banner }
  const [loading, setLoading]         = useState(true);
  const [activeSlide, setActiveSlide] = useState(0);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const [prodRes, catRes, slideRes] = await Promise.all([
          productAPI.getProducts(),
          categoryAPI.getCategories(),
          slideAPI.getSlides()
        ]);

        const allProducts = prodRes?.data?.products ?? [];
        const activeCategories = (catRes.data || []).filter(c => c.isActive);
        
        setTopDeals(allProducts.filter(p => p.discount > 0).slice(0, 6));
        setNewArrivals(allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6));
        setCategories(activeCategories);

        if (slideRes.data?.length) {
          const mapped = slideRes.data.map(slide => ({
            id:          slide._id,
            title:       slide.title,
            subtitle:    slide.subtitle,
            image:       slide.image || '',
            bannerImage: slide.bannerImage || '',
            tag:         slide.badge || 'Featured',
            category:    slide.category || '',
            stats: { rating: '4.9', reviews: '10k+', delivery: 'Fast' }
          }));

          // Slides: Anything with a product image
          setSlides(mapped.filter(s => s.image));
          
          // Banners: Anything with a bannerImage
          const banners = mapped.filter(s => s.bannerImage);
          setPromoBanners(banners);

          // Group products by category
          const sections = activeCategories.map(cat => {
            const catProducts = allProducts.filter(p => p.category === cat.name).slice(0, 5);
            const catBanner = banners.find(b => b.category === cat.name);
            return {
              category: cat,
              products: catProducts,
              banner: catBanner
            };
          }).filter(section => section.products.length > 0 || section.banner);
          
          setCategorySections(sections);
        }
      } catch (err) {
        console.error('Failed to fetch home data:', err);
      } finally {
        setLoading(false);
      }
    };
    fetchData();

    const interval = setInterval(() => {
      if (slides.length > 0) {
        setActiveSlide(prev => (prev + 1) % slides.length);
      }
    }, 8000);
    return () => clearInterval(interval);
  }, [slides.length]);

  const currentSlide = slides[activeSlide];

  return (
    <div className="bg-gray-50 min-h-screen pt-7 pb-20 w-full overflow-x-hidden">
      
      {/* ── HERO SLIDESHOW ── */}
      {slides.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-10">
          <div className="relative rounded-2xl overflow-hidden bg-white border border-gray-200 shadow-sm" style={{ minHeight: '420px' }}>

            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0, x: 40 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: -40 }}
                transition={{ duration: 0.5, ease: 'easeInOut' }}
                className="absolute inset-0"
              >
                <div className="grid lg:grid-cols-2 h-full min-h-[420px]">

                  {/* ── LEFT: text ── */}
                  <div className="flex flex-col justify-center px-10 py-12 xl:px-16 relative z-10">
                    {/* Badge */}
                    <motion.div
                      initial={{ y: 12, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.15 }}
                      className="flex items-center gap-3 mb-5"
                    >
                      <span className="bg-green-100 text-green-700 px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border border-green-200">
                        {currentSlide.tag}
                      </span>
                      <div className="flex items-center gap-1">
                        <FaStar size={11} className="text-yellow-400" />
                        <span className="text-gray-700 text-xs font-black">{currentSlide.stats.rating}</span>
                        <span className="text-gray-400 text-xs">({currentSlide.stats.reviews} reviews)</span>
                      </div>
                    </motion.div>

                    {/* Title */}
                    <motion.h1
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.25 }}
                      className="text-4xl xl:text-5xl font-black text-gray-900 leading-tight tracking-tight mb-4"
                    >
                      {currentSlide.title}
                    </motion.h1>

                    {/* Subtitle */}
                    <motion.p
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.35 }}
                      className="text-gray-500 text-base mb-8 max-w-md leading-relaxed"
                    >
                      {currentSlide.subtitle}
                    </motion.p>

                    {/* CTAs */}
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.45 }}
                      className="flex items-center gap-4 flex-wrap"
                    >
                      <Link
                        to="/products"
                        className="bg-green-500 hover:bg-green-600 text-white font-black px-7 py-3.5 rounded-xl text-sm flex items-center gap-2 transition-all shadow-sm shadow-green-500/20 group"
                      >
                        Shop Now <FaArrowRight size={12} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link
                        to="/categories"
                        className="bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold px-7 py-3.5 rounded-xl text-sm flex items-center gap-2 transition-all border border-gray-200"
                      >
                        Explore Categories
                      </Link>
                    </motion.div>

                    {/* Stats strip */}
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      transition={{ delay: 0.6 }}
                      className="mt-10 pt-6 border-t border-gray-100 grid grid-cols-3 gap-6"
                    >
                      {[
                        { value: '100%', label: t('genuineParts') || 'Genuine Parts' },
                        { value: '24h',  label: t('expressDelivery') || 'Express Delivery' },
                        { value: '1yr',  label: t('localWarranty') || 'Local Warranty' },
                      ].map((s, i) => (
                        <div key={i}>
                          <p className="text-green-600 font-black text-xl">{s.value}</p>
                          <p className="text-gray-400 text-[10px] font-semibold uppercase tracking-widest mt-0.5">{s.label}</p>
                        </div>
                      ))}
                    </motion.div>
                  </div>

                  {/* ── RIGHT: image ── */}
                  <div className="relative hidden lg:flex items-center justify-center overflow-hidden"
                    style={currentSlide.bannerImage ? {
                      backgroundImage: `url(${currentSlide.bannerImage})`,
                      backgroundSize: 'cover',
                      backgroundPosition: 'center',
                    } : {}}
                  >
                    {/* Overlay when banner image is set */}
                    {currentSlide.bannerImage && (
                      <div className="absolute inset-0 bg-white/60 backdrop-blur-[2px]" />
                    )}

                    {/* Decorative circles (shown when no banner) */}
                    {!currentSlide.bannerImage && (
                      <>
                        <div className="absolute w-80 h-80 rounded-full border-2 border-green-100 opacity-60" />
                        <div className="absolute w-56 h-56 rounded-full bg-green-50 opacity-80" />
                      </>
                    )}

                    {/* Background tint when no banner */}
                    {!currentSlide.bannerImage && (
                      <div className="absolute inset-0 bg-gradient-to-br from-gray-50 to-green-50/40" />
                    )}

                    {currentSlide.image && (
                      <motion.img
                        key={activeSlide}
                        initial={{ scale: 0.85, opacity: 0, rotate: -5 }}
                        animate={{ scale: 1, opacity: 1, rotate: 0 }}
                        transition={{ duration: 0.7, ease: 'easeOut' }}
                        src={currentSlide.image}
                        alt={currentSlide.title}
                        className="relative z-10 max-h-[340px] max-w-[90%] object-contain drop-shadow-xl"
                      />
                    )}

                    {/* Floating badge — rating */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.5, type: 'spring' }}
                      className="absolute top-8 right-8 bg-white border border-gray-200 rounded-2xl px-4 py-3 shadow-lg z-20"
                    >
                      <p className="text-[9px] font-black text-gray-400 uppercase tracking-widest">Best Seller</p>
                      <p className="text-green-600 font-black text-sm mt-0.5">⭐ {currentSlide.stats.rating} Rating</p>
                    </motion.div>

                    {/* Floating delivery badge */}
                    <motion.div
                      initial={{ scale: 0, opacity: 0 }}
                      animate={{ scale: 1, opacity: 1 }}
                      transition={{ delay: 0.7, type: 'spring' }}
                      className="absolute bottom-8 left-8 bg-green-500 text-white rounded-2xl px-4 py-3 shadow-lg z-20 flex items-center gap-2"
                    >
                      <FaShippingFast size={14} />
                      <div>
                        <p className="text-[9px] font-black uppercase tracking-widest opacity-80">Delivery</p>
                        <p className="font-black text-sm">Same Day</p>
                      </div>
                    </motion.div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Slide dots */}
            <div className="absolute bottom-5 left-1/2 -translate-x-1/2 flex items-center gap-2 z-20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-2 rounded-full transition-all duration-400 ${
                    i === activeSlide ? 'w-8 bg-green-500' : 'w-2 bg-gray-300 hover:bg-gray-400'
                  }`}
                />
              ))}
            </div>

            {/* Prev / Next arrows */}
            {slides.length > 1 && (
              <>
                <button
                  onClick={() => setActiveSlide(prev => (prev - 1 + slides.length) % slides.length)}
                  className="absolute left-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                >
                  <FaChevronRight size={12} className="rotate-180" />
                </button>
                <button
                  onClick={() => setActiveSlide(prev => (prev + 1) % slides.length)}
                  className="absolute right-4 top-1/2 -translate-y-1/2 z-20 w-9 h-9 bg-white border border-gray-200 rounded-full shadow flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                >
                  <FaChevronRight size={12} />
                </button>
              </>
            )}
          </div>
        </section>
      )}

      {/* ── TRUST BADGES ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-12">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: FaShippingFast, label: t('kigaliDelivery') || 'Kigali Delivery',   desc: t('freeSameDayDelivery') || 'Free same-day delivery',       color: '#22c55e' },
            { icon: FaShieldAlt,    label: t('qualityAssured') || 'Quality Assured',   desc: t('originalProducts100') || '100% original products',       color: '#22c55e' },
            { icon: FaHeadset,      label: t('expertSupport')  || 'Expert Support',    desc: t('realTechnicalAssistance') || 'Real technical assistance', color: '#22c55e' },
            { icon: FaMicrochip,    label: t('repairTools')    || 'Repair Tools',      desc: t('professionalGradeKit') || 'Professional grade kit',       color: '#22c55e' },
          ].map((item, i) => (
            <div key={i} className="bg-white border border-gray-200 rounded-xl flex items-center gap-4 p-4 hover:shadow-md transition-all group">
              <div className="w-12 h-12 rounded-xl bg-green-50 flex items-center justify-center flex-shrink-0 group-hover:bg-green-500 transition-all duration-300">
                <item.icon size={18} className="text-green-500 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-bold text-sm text-gray-900">{item.label}</p>
                <p className="text-gray-500 text-xs mt-0.5">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-12">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t('shopByCategory')}</h2>
          </div>
          <Link to="/categories" className="text-green-600 hover:text-green-700 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            {t('viewAll')} <FaChevronRight size={10} />
          </Link>
        </div>
        <CategoriesSection />
      </section>

      {/* ── TOP DEALS ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t('deals')}</h2>
            <div className="bg-red-50 border border-red-200 rounded-lg px-3 py-1 flex items-center gap-2">
              <span className="w-1.5 h-1.5 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">{t('endsIn') || 'Ends in'}: 04h 22m 15s</span>
            </div>
          </div>
          <Link to="/products?sort=deals" className="text-green-600 hover:text-green-700 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            {t('viewAll')} <FaChevronRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {topDeals.length > 0 ? (
              topDeals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-gray-200 rounded-xl">
                <FaFire className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t('noDealsAvailable') || 'No flash deals available today'}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── DYNAMIC CATEGORY SECTIONS ── */}
      {categorySections.map((section, idx) => (
        <div key={section.category._id}>
          {/* Category Banner (if exists) */}
          {section.banner && (
            <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-12">
              <PromoBanner
                image={section.banner.bannerImage}
                tag={section.banner.tag}
                title={section.banner.title}
                subtitle={section.banner.subtitle}
                cta="Shop Now"
                ctaLink={`/products?category=${section.category.name}`}
              />
            </section>
          )}

          {/* Category Products */}
          <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-16">
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-4">
                <div className="w-1 h-6 bg-green-500 rounded-full" />
                <div className="flex items-center gap-3">
                  {section.category.image && (
                    <div className="w-10 h-10 rounded-full overflow-hidden border border-gray-200">
                      <img src={section.category.image} className="w-full h-full object-cover" alt={section.category.name} />
                    </div>
                  )}
                  <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{section.category.name}</h2>
                </div>
              </div>
              <Link to={`/products?category=${section.category.name}`} className="text-green-600 hover:text-green-700 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1">
                {t('viewAll')} <FaChevronRight size={10} />
              </Link>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {section.products.map(product => (
                <ProductCard key={product._id} product={product} />
              ))}
            </div>
          </section>
        </div>
      ))}

      {/* ── GENERAL PROMO BANNERS (Banners not assigned to any category) ── */}
      {promoBanners.filter(b => !b.category).map((banner, idx) => (
        <section key={banner.id} className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-12">
          <PromoBanner
            image={banner.bannerImage}
            tag={banner.tag}
            title={banner.title}
            subtitle={banner.subtitle}
            cta="Shop Now"
            ctaLink="/products"
          />
        </section>
      ))}

      {/* ── NEW ARRIVALS (Fallback/Bottom section) ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-16">
        <div className="flex items-center justify-between mb-6">
          <div className="flex items-center gap-4">
            <div className="w-1 h-6 bg-green-500 rounded-full" />
            <div>
              <h2 className="text-xl font-black text-gray-900 uppercase tracking-tight">{t('newArrivals')}</h2>
            </div>
          </div>
          <Link to="/products?sort=newest" className="text-green-600 hover:text-green-700 transition-colors text-xs font-bold uppercase tracking-widest flex items-center gap-1">
            {t('viewAll')} <FaChevronRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {[...Array(5)].map((_, i) => (
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
        ) : (
          <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
            {newArrivals.length > 0 ? (
              newArrivals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-16 text-center bg-white border border-gray-200 rounded-xl">
                <FaBolt className="text-gray-300 text-4xl mx-auto mb-3" />
                <p className="text-gray-400 font-bold uppercase tracking-widest text-sm">{t('noNewArrivals') || 'No new arrivals yet'}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-10">
        <div className="bg-green-600 rounded-2xl p-10 xl:p-16 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 right-0 w-64 h-64 bg-white/5 rounded-full -translate-y-1/2 translate-x-1/4" />
          <div className="relative z-10 max-w-2xl">
            <div className="w-16 h-16 bg-white/10 rounded-2xl flex items-center justify-center mx-auto mb-6">
              <FaEnvelope className="text-white text-2xl" />
            </div>
            <h2 className="text-3xl xl:text-4xl font-black text-white mb-4 tracking-tight">Join the Elite Club</h2>
            <p className="text-green-100 text-base font-medium mb-8">Subscribe to get exclusive early access to deals, new arrivals, and professional repair guides.</p>
            <form className="flex flex-col sm:flex-row items-center gap-3 bg-white/10 p-2 rounded-xl border border-white/20 w-full max-w-lg mx-auto">
              <input
                type="email"
                placeholder="Enter your email address"
                className="flex-1 bg-transparent border-none outline-none px-4 py-3 text-white font-medium placeholder:text-green-200 text-sm"
              />
              <button className="bg-white text-green-600 font-black text-xs uppercase tracking-widest px-6 py-3 rounded-lg hover:bg-green-50 transition-all w-full sm:w-auto">
                Subscribe
              </button>
            </form>
            <p className="text-[10px] text-green-200 font-bold uppercase tracking-widest mt-4">No spam. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;