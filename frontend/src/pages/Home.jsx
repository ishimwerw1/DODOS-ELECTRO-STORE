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
import { useLocale } from '../context/LocaleContext';

const Home = () => {
  const { t, formatPrice } = useLocale();
  const navigate = useNavigate();

  const [topDeals, setTopDeals] = useState([]);
  const [newArrivals, setNewArrivals] = useState([]);
  const [categories, setCategories] = useState([]);
  const [slides, setSlides] = useState([]);
  const [loading, setLoading] = useState(true);
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
        setTopDeals(allProducts.filter(p => p.discount > 0).slice(0, 6));
        setNewArrivals(allProducts.sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 6));
        setCategories(catRes.data || []);
        if (slideRes.data?.length) {
          setSlides(slideRes.data.map(slide => ({
            id: slide._id,
            title: slide.title,
            subtitle: slide.subtitle,
            image: slide.image,
            tag: slide.badge || 'Featured',
            accent: slide.accent || '#0d6efd',
            bg: slide.bg || '#05070a',
            stats: { rating: '4.9', reviews: '10k+', delivery: 'Fast' }
          })));
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
    <div className="bg-bg-main min-h-screen pt-7 pb-20 w-full overflow-x-hidden bg-mesh">
      
      {/* ── HERO SECTION ── */}
      {slides.length > 0 && (
        <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-20">
          <div className="relative h-[680px] rounded-[3rem] overflow-hidden bg-[#0a0d14] border border-white/5 shadow-2xl">
            {/* Animated Background Elements */}
            <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-blue-600/10 blur-[120px] rounded-full -translate-y-1/2 translate-x-1/4 animate-pulse" />
            <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-blue-500/5 blur-[100px] rounded-full translate-y-1/2 -translate-x-1/4" />
            
            <AnimatePresence mode="wait">
              <motion.div
                key={activeSlide}
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                exit={{ opacity: 0 }}
                transition={{ duration: 1 }}
                className="absolute inset-0 flex items-center"
              >
                <div className="grid lg:grid-cols-2 h-full w-full">
                  <div className="p-12 xl:p-20 flex flex-col justify-center relative z-10">
                    <motion.div
                      initial={{ y: 20, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.2 }}
                      className="flex items-center gap-3 mb-6"
                    >
                      <span className="bg-blue-600/10 text-blue-400 px-4 py-1.5 rounded-full text-xs font-black uppercase tracking-widest border border-blue-500/20">
                        {currentSlide.tag}
                      </span>
                      <div className="flex items-center gap-1 text-yellow-500">
                        <FaStar size={12} />
                        <span className="text-white text-xs font-black">{currentSlide.stats.rating}</span>
                        <span className="text-slate-500 text-xs font-bold">({currentSlide.stats.reviews} reviews)</span>
                      </div>
                    </motion.div>

                    <motion.h1
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.3 }}
                      className="text-5xl xl:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-8"
                    >
                      {currentSlide.title.split(' ').map((word, i) => (
                        <span key={i} className={word === 'Accessories' || word === 'Technical' ? 'text-gradient-blue' : ''}>
                          {word}{' '}
                        </span>
                      ))}
                    </motion.h1>

                    <motion.p
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.4 }}
                      className="text-slate-400 text-lg xl:text-xl font-medium mb-10 max-w-lg leading-relaxed"
                    >
                      {currentSlide.subtitle}
                    </motion.p>

                    <motion.div
                      initial={{ y: 30, opacity: 0 }}
                      animate={{ y: 0, opacity: 1 }}
                      transition={{ delay: 0.5 }}
                      className="flex items-center gap-5"
                    >
                      <Link to="/products" className="btn-premium flex items-center gap-3 group">
                        Shop Now <FaArrowRight size={14} className="group-hover:translate-x-1 transition-transform" />
                      </Link>
                      <Link to="/categories" className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all">
                        Explore Categories
                      </Link>
                    </motion.div>

                    <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    transition={{ delay: 0.7 }}
                    className="mt-16 grid grid-cols-3 gap-8 border-t border-white/5 pt-8"
                  >
                    <div>
                      <p className="text-blue-400 font-black text-xl">100%</p>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('genuineParts') || 'Genuine Parts'}</p>
                    </div>
                    <div>
                      <p className="text-blue-400 font-black text-xl">24h</p>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('expressDelivery') || 'Express Delivery'}</p>
                    </div>
                    <div>
                      <p className="text-blue-400 font-black text-xl">1yr</p>
                      <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">{t('localWarranty') || 'Local Warranty'}</p>
                    </div>
                  </motion.div>
                  </div>

                  <div className="relative hidden lg:flex items-center justify-center p-12 overflow-hidden">
                    <motion.div
                      initial={{ scale: 0.8, opacity: 0, rotate: -10 }}
                      animate={{ scale: 1, opacity: 1, rotate: 0 }}
                      transition={{ duration: 1, ease: 'easeOut' }}
                      className="relative z-10 w-full h-full flex items-center justify-center"
                    >
                      <img src={currentSlide.image} className="max-h-[85%] object-contain drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] animate-float" alt="Product" />
                      
                      {/* Floating Elements */}
                      <div className="absolute top-20 right-20 w-16 h-16 bg-[#0a0d14] border border-white/10 rounded-2xl flex items-center justify-center shadow-2xl animate-bounce delay-700">
                        <FaMicrochip className="text-blue-400 text-2xl" />
                      </div>
                      <div className="absolute bottom-20 left-10 w-20 h-20 bg-[#0a0d14] border border-white/10 rounded-[2rem] flex items-center justify-center shadow-2xl animate-float delay-1000">
                        <FaTools className="text-blue-400 text-3xl" />
                      </div>
                    </motion.div>

                    {/* Decorative Circles */}
                    <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
                      <div className="w-[500px] h-[500px] border border-white/5 rounded-full" />
                      <div className="w-[700px] h-[700px] border border-white/[0.03] rounded-full absolute" />
                    </div>
                  </div>
                </div>
              </motion.div>
            </AnimatePresence>

            {/* Carousel Controls */}
            <div className="absolute bottom-12 left-1/2 -translate-x-1/2 flex items-center gap-3 z-20">
              {slides.map((_, i) => (
                <button
                  key={i}
                  onClick={() => setActiveSlide(i)}
                  className={`h-1.5 rounded-full transition-all duration-500 ${i === activeSlide ? 'w-10 bg-blue-500' : 'w-3 bg-white/20 hover:bg-white/40'}`}
                />
              ))}
            </div>
          </div>
        </section>
      )}

      {/* ── TRUST BADGES ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-24">
        <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            { icon: FaShippingFast, label: t('kigaliDelivery') || 'Kigali Delivery', desc: t('freeSameDayDelivery') || 'Free same-day delivery', color: '#0d6efd' },
            { icon: FaShieldAlt, label: t('qualityAssured') || 'Quality Assured', desc: t('originalProducts100') || '100% original products', color: '#0d6efd' },
            { icon: FaHeadset, label: t('expertSupport') || 'Expert Support', desc: t('realTechnicalAssistance') || 'Real technical assistance', color: '#0d6efd' },
            { icon: FaMicrochip, label: t('repairTools') || 'Repair Tools', desc: t('professionalGradeKit') || 'Professional grade kit', color: '#0d6efd' },
          ].map((item, i) => (
            <div key={i} className="card-premium flex items-center gap-6 group">
              <div className="w-14 h-14 rounded-2xl bg-blue-600/10 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 transition-all duration-500">
                <item.icon size={20} className="text-blue-400 group-hover:text-white transition-colors" />
              </div>
              <div>
                <p className="font-black text-sm text-white uppercase tracking-tight">{item.label}</p>
                <p className="text-slate-500 text-xs font-bold mt-1">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── CATEGORIES ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t('shopByCategory')}</h2>
            <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('findExactlyWhatYouNeed') || 'Find exactly what you need'}</p>
          </div>
          <Link to="/categories" className="text-blue-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2">
            {t('viewAll')} <FaChevronRight size={10} />
          </Link>
        </div>
        <CategoriesSection />
      </section>

      {/* ── TOP DEALS ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-24">
        <div className="flex items-center justify-between mb-12">
          <div className="flex items-center gap-6">
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t('deals')}</h2>
            <div className="bg-red-500/10 border border-red-500/20 rounded-xl px-4 py-2 flex items-center gap-3">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-red-500 text-[10px] font-black uppercase tracking-widest">{t('endsIn') || 'Ends in'}: 04h 22m 15s</span>
            </div>
          </div>
          <Link to="/products?sort=deals" className="text-blue-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2">
            {t('viewAll')} <FaChevronRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
            {[...Array(6)].map((_, i) => (
              <div key={i} className="aspect-[3/4] rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {topDeals.length > 0 ? (
              topDeals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-white/5">
                <FaFire className="text-slate-700 text-5xl mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">{t('noDealsAvailable') || 'No flash deals available today'}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── NEW ARRIVALS ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-24">
        <div className="flex items-center justify-between mb-12">
          <div>
            <h2 className="text-3xl font-black text-white uppercase tracking-tighter">{t('newArrivals')}</h2>
            <p className="text-slate-500 text-sm font-bold mt-1 uppercase tracking-widest">{t('latestProductsInOurStore') || 'Latest products in our store'}</p>
          </div>
          <Link to="/products?sort=newest" className="text-blue-400 hover:text-white transition-colors text-xs font-black uppercase tracking-widest flex items-center gap-2">
            {t('viewAll')} <FaChevronRight size={10} />
          </Link>
        </div>

        {loading ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {[...Array(4)].map((_, i) => (
              <div key={i} className="aspect-[4/5] rounded-[3rem] bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {newArrivals.length > 0 ? (
              newArrivals.map(product => (
                <ProductCard key={product._id} product={product} />
              ))
            ) : (
              <div className="col-span-full py-20 text-center glass rounded-[3rem] border border-white/5">
                <FaBolt className="text-slate-700 text-5xl mx-auto mb-4" />
                <p className="text-slate-500 font-bold uppercase tracking-widest">{t('noNewArrivals') || 'No new arrivals yet'}</p>
              </div>
            )}
          </div>
        )}
      </section>

      {/* ── NEWSLETTER ── */}
      <section className="max-w-[1600px] mx-auto px-4 xl:px-8 mb-10">
        <div className="bg-[#0a0d14] border border-white/5 rounded-[3rem] p-12 xl:p-20 relative overflow-hidden flex flex-col items-center text-center">
          <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[120px] rounded-full" />
          <div className="relative z-10 max-w-2xl">
            <div className="w-20 h-20 bg-blue-600/10 rounded-[2rem] flex items-center justify-center mx-auto mb-8 border border-blue-500/20">
              <FaEnvelope className="text-blue-400 text-3xl" />
            </div>
            <h2 className="text-4xl xl:text-5xl font-black text-white mb-6 tracking-tighter uppercase">Join the Elite Club</h2>
            <p className="text-slate-500 text-lg font-medium mb-10">Subscribe to get exclusive early access to deals, new arrivals, and professional repair guides directly in your inbox.</p>
            
            <form className="flex flex-col sm:flex-row items-center gap-4 bg-white/5 p-2 rounded-[2rem] border border-white/10 w-full">
              <input 
                type="email" 
                placeholder="Enter your email address" 
                className="flex-1 bg-transparent border-none outline-none px-6 py-4 text-white font-medium placeholder:text-slate-600"
              />
              <button className="btn-premium w-full sm:w-auto">
                Subscribe Now
              </button>
            </form>
            <p className="text-[10px] text-slate-600 font-bold uppercase tracking-widest mt-6">No spam, just premium content. Unsubscribe anytime.</p>
          </div>
        </div>
      </section>

    </div>
  );
};

export default Home;