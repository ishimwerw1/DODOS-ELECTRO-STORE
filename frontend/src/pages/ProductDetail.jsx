import { useParams, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { productAPI } from '../services/api.js';
import {
  FaStar, FaHeart, FaCartPlus, FaShieldAlt, FaTruck,
  FaRedo, FaSearchPlus, FaChevronRight, FaRegHeart,
  FaShoppingCart, FaCommentDots, FaCheckCircle, FaMinus, FaPlus,
  FaShare, FaTag
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { toast } from 'react-toastify';
import { useLocale } from '../context/LocaleContext';
import { useChat } from '../context/ChatContext';
import ProductCard from '../components/ProductCard';

const ProductDetail = () => {
  const { id } = useParams();
  const { addToCart }                              = useCart();
  const { addToWishlist, isInWishlist, removeFromWishlist } = useWishlist();
  const { formatPrice }                            = useLocale();
  const { openChat }                               = useChat();

  const [product, setProduct]       = useState(null);
  const [related, setRelated]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [quantity, setQuantity]     = useState(1);
  const [activeImage, setActiveImage] = useState(0);
  const [isZoomed, setIsZoomed]     = useState(false);
  const [mousePos, setMousePos]     = useState({ x: 0, y: 0 });
  const [activeTab, setActiveTab]   = useState('description');

  useEffect(() => {
    fetchProduct();
    window.scrollTo(0, 0);
  }, [id]);

  const fetchProduct = async () => {
    try {
      setLoading(true);
      const res = await productAPI.getProduct(id);
      setProduct(res.data.product);
      // fetch related products
      const relRes = await productAPI.getProducts({ category: res.data.product?.category });
      const all = relRes.data?.products || [];
      setRelated(all.filter(p => p._id !== id).slice(0, 5));
    } catch {
      toast.error('Failed to load product details');
    } finally {
      setLoading(false);
    }
  };

  const handleMouseMove = (e) => {
    if (!isZoomed) return;
    const { left, top, width, height } = e.currentTarget.getBoundingClientRect();
    setMousePos({
      x: ((e.pageX - left - window.scrollX) / width) * 100,
      y: ((e.pageY - top - window.scrollY) / height) * 100,
    });
  };

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <div className="w-12 h-12 border-4 border-green-500 border-t-transparent rounded-full animate-spin" />
        <p className="mt-4 text-gray-400 text-xs font-semibold uppercase tracking-widest">Loading product...</p>
      </div>
    );
  }

  if (!product) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50">
        <h2 className="text-2xl font-black text-gray-900 mb-4">Product Not Found</h2>
        <Link to="/products" className="bg-green-500 hover:bg-green-600 text-white font-black px-8 py-3.5 rounded-xl transition-all text-sm">
          Back to Shop
        </Link>
      </div>
    );
  }

  const inWishlist = isInWishlist(product._id);
  const images     = product.images?.length > 0 ? product.images : [product.image];
  const totalPrice = product.price * quantity;
  const oldPrice   = product.discount > 0 ? product.price * (1 + product.discount / 100) : null;

  const handleAddToCart = async () => {
    const success = await addToCart(product, quantity);
    if (success) toast.success('Added to cart!');
  };

  const handleChat = () => openChat(product);

  const toggleWishlist = () => {
    if (inWishlist) { removeFromWishlist(product._id); toast.info('Removed from wishlist'); }
    else            { addToWishlist(product);           toast.success('Added to wishlist ❤️'); }
  };

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-16">
      <div className="max-w-[1600px] mx-auto px-3 sm:px-4 xl:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <FaChevronRight size={8} />
          <Link to="/products" className="hover:text-green-600 transition-colors">Shop</Link>
          <FaChevronRight size={8} />
          <span className="text-gray-700 truncate max-w-[200px]">{product.name}</span>
        </nav>

        {/* ── MAIN GRID ── */}
        <div className="grid lg:grid-cols-2 gap-10 mb-12">

          {/* ── GALLERY ── */}
          <div className="space-y-4">
            {/* Main image */}
            <div
              className={`relative bg-white border border-gray-200 rounded-2xl overflow-hidden flex items-center justify-center shadow-sm group ${isZoomed ? 'cursor-zoom-out' : 'cursor-zoom-in'}`}
              style={{ height: 'clamp(260px, 55vw, 420px)' }}
              onMouseMove={handleMouseMove}
              onClick={() => setIsZoomed(!isZoomed)}
            >
              {/* Badges */}
              <div className="absolute top-4 left-4 z-10 flex flex-col gap-2">
                {product.isNew && (
                  <span className="bg-blue-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg uppercase tracking-wider">New</span>
                )}
                {product.discount > 0 && (
                  <span className="bg-red-500 text-white text-[9px] font-black px-2.5 py-1 rounded-lg">-{product.discount}%</span>
                )}
              </div>

              {/* Wishlist + zoom */}
              <div className="absolute top-4 right-4 z-10 flex flex-col gap-2">
                <button
                  onClick={e => { e.stopPropagation(); toggleWishlist(); }}
                  className={`w-9 h-9 rounded-full bg-white shadow border flex items-center justify-center transition-all hover:scale-110 ${inWishlist ? 'text-red-500 border-red-200' : 'text-gray-300 border-gray-200 hover:text-red-400'}`}
                >
                  {inWishlist ? <FaHeart size={14} /> : <FaRegHeart size={14} />}
                </button>
                <button
                  onClick={e => { e.stopPropagation(); setIsZoomed(!isZoomed); }}
                  className={`w-9 h-9 rounded-full bg-white shadow border flex items-center justify-center transition-all ${isZoomed ? 'bg-green-500 text-white border-green-500' : 'text-gray-400 border-gray-200 hover:text-green-600'}`}
                >
                  <FaSearchPlus size={13} />
                </button>
              </div>

              <img
                src={images[activeImage]}
                alt={product.name}
                className={`max-w-full max-h-full object-contain p-8 transition-transform duration-300 ${isZoomed ? 'scale-[2.2]' : 'group-hover:scale-105'}`}
                style={isZoomed ? { transformOrigin: `${mousePos.x}% ${mousePos.y}%` } : {}}
              />
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="flex gap-3 overflow-x-auto pb-1 custom-scrollbar">
                {images.map((img, i) => (
                  <button
                    key={i}
                    onClick={() => setActiveImage(i)}
                    className={`w-20 h-20 rounded-xl bg-white border-2 flex-shrink-0 overflow-hidden transition-all ${
                      activeImage === i ? 'border-green-500 shadow-sm' : 'border-gray-200 opacity-60 hover:opacity-100 hover:border-gray-300'
                    }`}
                  >
                    <img src={img} className="w-full h-full object-contain p-2" alt="" />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* ── PRODUCT INFO ── */}
          <div className="flex flex-col">

            {/* Category + share */}
            <div className="flex items-center justify-between mb-4">
              <span className="bg-green-50 text-green-700 border border-green-200 px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-widest flex items-center gap-1.5">
                <FaTag size={9} /> {product.category}
              </span>
              <button className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-400 hover:text-green-600 hover:bg-green-50 transition-all">
                <FaShare size={13} />
              </button>
            </div>

            {/* Name */}
            <h1 className="text-2xl xl:text-3xl font-black text-gray-900 leading-tight mb-3">
              {product.name}
            </h1>

            {/* Brand */}
            <p className="text-xs text-gray-400 font-semibold uppercase tracking-widest mb-4">
              Brand: <span className="text-gray-700">{product.brand}</span>
              {product.compatible && <> &nbsp;·&nbsp; Fits: <span className="text-gray-700">{product.compatible}</span></>}
            </p>

            {/* Stars */}
            <div className="flex flex-wrap items-center gap-2 sm:gap-3 mb-5">
              <div className="flex items-center gap-0.5">
                {[...Array(5)].map((_, i) => (
                  <FaStar key={i} size={13} className={i < Math.floor(product.rating || 5) ? 'text-yellow-400' : 'text-gray-200'} />
                ))}
              </div>
              <span className="text-sm font-black text-gray-800">{product.rating || 5.0}</span>
              <span className="text-xs text-gray-400">({product.reviewCount || 0})</span>
              <span className="text-xs font-semibold text-green-600 flex items-center gap-1">
                <FaCheckCircle size={10} /> In Stock ({product.stock || 0} left)
              </span>
            </div>

            {/* Price box */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 mb-5 shadow-sm">
              <div className="flex items-baseline gap-3 mb-3">
                <span className="text-3xl font-black text-gray-900">{formatPrice(product.price)}</span>
                {oldPrice && (
                  <span className="text-lg text-gray-400 line-through font-semibold">{formatPrice(oldPrice)}</span>
                )}
                {product.discount > 0 && (
                  <span className="bg-red-100 text-red-600 text-xs font-black px-2 py-0.5 rounded-lg">Save {product.discount}%</span>
                )}
              </div>
              <div className="flex flex-col gap-2">
                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                  <FaTruck size={12} className="text-green-500" /> Free same-day delivery in Kigali
                </div>
                <div className="flex items-center gap-2 text-xs text-gray-500 font-semibold">
                  <FaShieldAlt size={12} className="text-green-500" /> 1 Year official warranty
                </div>
              </div>
            </div>

            {/* Quantity */}
            <div className="mb-5">
              <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Quantity</p>
              <div className="flex items-center gap-4">
                <div className="flex items-center bg-gray-100 rounded-xl p-1 border border-gray-200">
                  <button
                    onClick={() => setQuantity(Math.max(1, quantity - 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-all text-gray-600"
                  >
                    <FaMinus size={10} />
                  </button>
                  <span className="w-10 text-center font-black text-gray-900 text-base">{quantity}</span>
                  <button
                    onClick={() => setQuantity(Math.min(product.stock || 99, quantity + 1))}
                    className="w-9 h-9 flex items-center justify-center rounded-lg hover:bg-white transition-all text-gray-600"
                  >
                    <FaPlus size={10} />
                  </button>
                </div>
                <div>
                  <p className="text-xs text-gray-400 font-semibold">Total</p>
                  <p className="text-lg font-black text-gray-900">{formatPrice(totalPrice)}</p>
                </div>
              </div>
            </div>

            {/* Action buttons */}
            <div className="flex gap-3 mb-6">
              <button
                onClick={handleAddToCart}
                className="flex-1 bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm shadow-green-500/20 active:scale-95"
              >
                <FaCartPlus size={16} /> Add to Cart
              </button>
              <button
                onClick={handleChat}
                className="flex-1 bg-white border border-gray-200 hover:border-green-400 hover:bg-green-50 text-gray-700 hover:text-green-700 font-bold py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all"
              >
                <FaCommentDots size={15} /> Chat
              </button>
            </div>

            {/* Buy now */}
            <Link
              to="/cart"
              onClick={handleAddToCart}
              className="w-full bg-gray-900 hover:bg-gray-800 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all mb-5"
            >
              <FaShoppingCart size={15} /> Buy Now
            </Link>

            {/* Trust row */}
            <div className="grid grid-cols-3 gap-3">
              {[
                { icon: FaShieldAlt, label: 'Secure Pay' },
                { icon: FaTruck,     label: 'Fast Delivery' },
                { icon: FaRedo,      label: '7-Day Return' },
              ].map((item, i) => (
                <div key={i} className="bg-white border border-gray-100 rounded-xl p-3 flex flex-col items-center gap-1.5 text-center">
                  <item.icon size={16} className="text-green-500" />
                  <p className="text-[10px] font-bold text-gray-500 uppercase tracking-wider">{item.label}</p>
                </div>
              ))}
            </div>
          </div>
        </div>

        {/* ── TABS: Description / Specs ── */}
        <div className="bg-white border border-gray-200 rounded-2xl overflow-hidden mb-10 shadow-sm">
          {/* Tab headers */}
          <div className="flex border-b border-gray-100">
            {['description', 'specs'].map(tab => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`px-8 py-4 text-sm font-bold uppercase tracking-widest transition-all relative ${
                  activeTab === tab ? 'text-green-600' : 'text-gray-400 hover:text-gray-700'
                }`}
              >
                {tab === 'description' ? 'Description' : 'Specifications'}
                {activeTab === tab && (
                  <motion.div layoutId="tab-indicator" className="absolute bottom-0 left-0 right-0 h-0.5 bg-green-500 rounded-full" />
                )}
              </button>
            ))}
          </div>

          {/* Tab content */}
          <div className="p-8">
            <AnimatePresence mode="wait">
              {activeTab === 'description' ? (
                <motion.div key="desc" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <p className="text-gray-600 leading-relaxed text-sm">
                    {product.description ||
                      'Experience premium quality with this professional-grade accessory. Engineered for durability and perfect compatibility, it meets the highest standards of the DODOS Electro Store collection.'}
                  </p>
                </motion.div>
              ) : (
                <motion.div key="specs" initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0 }}>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      { label: 'Brand',         value: product.brand },
                      { label: 'Category',      value: product.category },
                      { label: 'Compatible',    value: product.compatible || 'Universal' },
                      { label: 'Stock',         value: `${product.stock || 0} units` },
                      { label: 'Condition',     value: 'Brand New' },
                      { label: 'Warranty',      value: '1 Year' },
                    ].map((row, i) => (
                      <div key={i} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100">
                        <span className="text-xs font-bold text-gray-400 uppercase tracking-widest w-24 flex-shrink-0">{row.label}</span>
                        <span className="text-sm font-semibold text-gray-800">{row.value}</span>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        </div>

        {/* ── RELATED PRODUCTS ── */}
        {related.length > 0 && (
          <div>
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-green-500 rounded-full" />
              <h3 className="text-xl font-black text-gray-900">Related Products</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {related.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProductDetail;
