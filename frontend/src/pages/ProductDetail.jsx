import { useParams, useNavigate, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productAPI } from '../services/api.js';
import { 
  FaStar, FaHeart, FaCartPlus, FaArrowLeft, FaShieldAlt, FaTruck, 
  FaRedo, FaCube, FaSearchPlus, FaBolt, FaChevronRight, FaRegHeart, FaRegStar
} from 'react-icons/fa';
import { motion, useScroll, useTransform, AnimatePresence, useSpring } from 'framer-motion';
import { toast } from 'react-toastify';
import { useLocale } from '../context/LocaleContext';

const ProductDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const { addToCart } = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { t, formatPrice } = useLocale();
  const [product, setProduct] = useState(null);
  const [loading, setLoading] = useState(true);
  const [quantity, setQuantity] = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed] = useState(false);
  const [mousePos, setMousePos] = useState({ x: 0, y: 0 });
  
  const containerRef = useRef(null);
  const { scrollYProgress } = useScroll({
    target: containerRef,
    offset: ["start end", "end start"]
  });

  const rawRotateY = useTransform(scrollYProgress, [0, 1], [-30, 30]);
  const rawRotateX = useTransform(scrollYProgress, [0, 1], [10, -10]);
  
  const rotateY = useSpring(rawRotateY, { stiffness: 50, damping: 20 });
  const rotateX = useSpring(rawRotateX, { stiffness: 50, damping: 20 });
  const scale = useTransform(scrollYProgress, [0, 0.5, 1], [0.95, 1.05, 0.95]);

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getProduct(id);
      setProduct(res.data.product);
    } catch (err) {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    const x = ((e.pageX - left - window.scrollX) / width) * 100;
    const y = ((e.pageY - top - window.scrollY) / height) * 100;
    setMousePos({ x, y });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a]">
        <div className="relative w-20 h-20">
          <div className="absolute inset-0 border-4 border-blue-600/20 rounded-full" />
          <div className="absolute inset-0 border-4 border-blue-600 border-t-transparent rounded-full animate-spin" />
          <FaBolt className="absolute inset-0 m-auto text-blue-600 animate-pulse" />
        </div>
        <p className="mt-8 text-slate-500 font-black uppercase tracking-[0.3em] text-xs">Loading Premium Content</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a]">
        <h2 className="text-3xl font-black text-white uppercase tracking-tighter">Product Not Found</h2>
        <Link to="/products" className="mt-8 btn-premium">Back to Shop</Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const images = product.images?.length > 0 ? product.images : [product.image];

  const handleAddToCart = async () => {
    const success = await addToCart(product, quantity);
    if (success) toast.success('Added to cart successfully!');
  };

  const toggleWishlist = () => {
    if (inWishlist) {
      removeFromWishlist(product._id);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist ❤️');
    }
  };

  return (
    <div className="bg-bg-main min-h-screen pt-7 pb-20 bg-mesh" ref={containerRef}>
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mb-12">
          <Link to="/" className="text-slate-500 hover:text-white transition-colors">Home</Link>
          <FaChevronRight size={8} className="text-slate-700" />
          <Link to="/products" className="text-slate-500 hover:text-white transition-colors">Shop</Link>
          <FaChevronRight size={8} className="text-slate-700" />
          <span className="text-blue-400">{product.name}</span>
        </nav>

        <div className="grid lg:grid-cols-2 gap-16 items-start">
          
          {/* GALLERY SECTION */}
          <div className="space-y-8">
            <div className="relative aspect-square rounded-[3rem] bg-[#0a0d14] border border-white/5 overflow-hidden flex items-center justify-center group shadow-2xl">
              {/* Feature Tags */}
              <div className="absolute top-8 left-8 flex flex-col gap-3 z-20">
                {product.isNew && (
                  <span className="bg-blue-600 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest shadow-lg shadow-blue-500/20">New</span>
                )}
                {product.discount > 0 && (
                  <span className="bg-red-500 text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-widest">-{product.discount}%</span>
                )}
              </div>

              <div className="absolute top-8 right-8 z-20 flex flex-col gap-3">
                <button 
                  onClick={() => setIsZoomed(!isZoomed)}
                  className={`w-12 h-12 rounded-2xl flex items-center justify-center border transition-all ${isZoomed ? 'bg-blue-600 text-white border-blue-600 shadow-lg shadow-blue-500/20' : 'bg-white/5 text-slate-500 border-white/10 hover:border-white/20'}`}
                >
                  <FaSearchPlus size={18} />
                </button>
                <div className="bg-white/5 border border-white/10 px-3 py-1.5 rounded-full flex items-center gap-2 text-[9px] font-black text-slate-500 uppercase tracking-widest">
                  <FaCube className="text-blue-400" /> 3D View
                </div>
              </div>

              <div 
                className={`relative w-full h-full perspective-1000 ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
                onMouseMove={handleMouseMove}
                onClick={() => setIsZoomed(!isZoomed)}
              >
                <motion.div
                  style={{ 
                    rotateY: isZoomed ? 0 : rotateY, 
                    rotateX: isZoomed ? 0 : rotateX, 
                    scale: isZoomed ? 1 : scale,
                    transformStyle: "preserve-3d"
                  }}
                  className="w-full h-full flex items-center justify-center"
                >
                  <img
                    src={images[activeImage]}
                    alt={product.name}
                    className={`w-full h-full object-cover drop-shadow-[0_20px_50px_rgba(0,0,0,0.8)] transition-transform duration-300 ${isZoomed ? 'scale-[2.5]' : ''}`}
                    style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
                  />
                </motion.div>
              </div>
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-4 overflow-x-auto pb-4 custom-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-24 h-24 rounded-2xl bg-[#0a0d14] border-2 transition-all flex-shrink-0 overflow-hidden ${
                      activeImage === i ? 'border-blue-600 shadow-lg shadow-blue-500/20' : 'border-white/5 hover:border-white/10 opacity-60 hover:opacity-100'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-cover" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* CONTENT SECTION */}
          <div className="flex flex-col">
            <div className="flex items-center justify-between mb-8">
              <span className="bg-blue-600/10 text-blue-400 px-5 py-2 rounded-2xl text-[11px] font-black uppercase tracking-[0.2em] border border-blue-500/20">
                {product.category}
              </span>
              <button 
                onClick={toggleWishlist}
                className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all shadow-xl ${
                  inWishlist ? 'bg-red-500/10 text-red-500 border border-red-500/20' : 'bg-white/5 text-slate-500 border border-white/10 hover:text-white'
                }`}
              >
                {inWishlist ? <FaHeart size={22} /> : <FaRegHeart size={22} />}
              </button>
            </div>

            <h1 className="text-4xl xl:text-5xl font-black text-white tracking-tighter leading-tight mb-6">
              {product.name}
            </h1>

            <div className="flex items-center gap-6 mb-10">
              <div className="flex items-center gap-1.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} className={i < Math.floor(product.rating) ? 'text-yellow-500' : 'text-slate-800'} size={14} />
                ))}
                <span className="ml-2 font-black text-white text-sm">{product.rating}</span>
              </div>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-[11px] text-slate-500 font-black uppercase tracking-[0.2em]">{product.reviewCount || 0} Customer Reviews</span>
              <div className="w-px h-4 bg-white/10" />
              <span className="text-[11px] text-green-500 font-black uppercase tracking-[0.2em]">In Stock</span>
            </div>

            <div className="bg-white/5 border border-white/5 rounded-[2.5rem] p-10 mb-10 relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full" />
              
              <div className="flex items-baseline gap-4 mb-6">
                <span className="text-5xl font-black text-white">{formatPrice(product.price)}</span>
                {product.discount > 0 && (
                  <span className="text-2xl text-slate-600 line-through font-bold">
                    {formatPrice(product.price * (1 + product.discount/100))}
                  </span>
                )}
              </div>

              <div className="space-y-4">
                <div className="flex items-center gap-3 text-blue-400 font-black text-[10px] uppercase tracking-widest">
                  <FaTruck /> Free Express Delivery in Kigali
                </div>
                <div className="flex items-center gap-3 text-slate-500 font-bold text-[11px] uppercase tracking-widest">
                  <FaShieldAlt className="text-blue-500" /> 1 Year Official Warranty
                </div>
              </div>
            </div>

            <div className="mb-10">
              <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Description</h4>
              <p className="text-slate-400 leading-relaxed font-medium text-[15px]">
                {product.description || 'Experience premium quality with this professional-grade accessory. Engineered for durability and perfect compatibility, it meets the highest standards of the DODOS Electro Store collection.'}
              </p>
            </div>

            <div className="grid sm:grid-cols-2 gap-8 mb-12">
              <div>
                <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-[0.3em] mb-4">Quantity</h4>
                <div className="flex items-center bg-white/5 rounded-2xl p-1.5 border border-white/5 w-40">
                  <button 
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white font-black"
                  >-</button>
                  <span className="flex-grow text-center font-black text-white text-lg">{quantity}</span>
                  <button 
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="w-12 h-12 flex items-center justify-center rounded-xl hover:bg-white/10 transition-all text-white font-black"
                  >+</button>
                </div>
              </div>
              <div className="flex flex-col justify-end">
                <p className="text-[11px] text-slate-500 font-bold uppercase tracking-widest mb-2">Total Price</p>
                <p className="text-2xl font-black text-white">{formatPrice(product.price * quantity)}</p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-5">
              <button
                onClick={handleAddToCart}
                className="flex-1 btn-premium flex items-center justify-center gap-4 py-5"
              >
                <FaCartPlus size={20} /> Add to Cart
              </button>
              <Link
                to="/cart"
                className="flex-1 bg-white/5 hover:bg-white/10 text-white font-black py-5 rounded-2xl border border-white/10 flex items-center justify-center gap-4 transition-all uppercase tracking-widest text-[13px]"
              >
                Buy Now
              </Link>
            </div>
          </div>
        </div>

        {/* TRUST SECTIONS */}
        <div className="grid md:grid-cols-3 gap-8 mt-24">
          {[
            { icon: FaShieldAlt, title: 'Secure Checkout', desc: 'Encrypted payment processing' },
            { icon: FaTruck, title: 'Fastest Delivery', desc: 'Same-day within Kigali City' },
            { icon: FaRedo, title: 'Easy Returns', desc: '7 days hassle-free return policy' }
          ].map((item, i) => (
            <div key={i} className="card-premium flex items-center gap-6">
              <div className="w-16 h-16 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400">
                <item.icon size={24} />
              </div>
              <div>
                <h4 className="font-black text-white uppercase tracking-tight text-sm">{item.title}</h4>
                <p className="text-slate-500 text-xs font-bold mt-1 uppercase tracking-widest">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default ProductDetail;
