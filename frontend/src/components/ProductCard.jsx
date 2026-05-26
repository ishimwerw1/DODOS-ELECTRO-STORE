import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaEye, FaStar, FaStarHalfAlt, FaCartPlus, FaRegHeart, FaCommentDots } from 'react-icons/fa';
import { useCart } from '../context/CartContext';
import { useWishlist } from '../context/WishlistContext';
import { useLocale } from '../context/LocaleContext';
import { useChat } from '../context/ChatContext';
import { toast } from 'react-toastify';
import { motion } from 'framer-motion';

const ProductCard = ({ product, viewMode = 'grid' }) => {
  const { addToCart } = useCart();
  const { addToWishlist, removeFromWishlist, isInWishlist } = useWishlist();
  const { formatPrice, t } = useLocale();
  const { openChat } = useChat();
  const [isHovered, setIsHovered] = useState(false);

  if (!product) return null;

  const productId = product._id || product.id;
  const inWishlist = isInWishlist(productId);

  const handleChat = (e) => {
    e.preventDefault();
    openChat(product);
  };

  const renderStars = (rating = 5) => {
    const stars = [];
    for (let i = 1; i <= 5; i++) {
      if (i <= rating) stars.push(<FaStar key={i} className="text-[#fbbf24]" />);
      else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} className="text-[#fbbf24]" />);
      else stars.push(<FaStar key={i} className="text-slate-700" />);
    }
    return stars;
  };

  const handleWishlist = (e) => {
    e.preventDefault();
    if (inWishlist) {
      removeFromWishlist(productId);
      toast.info('Removed from wishlist');
    } else {
      addToWishlist(product);
      toast.success('Added to wishlist ❤️');
    }
  };

  const handleAddToCart = async (e) => {
    e.preventDefault();
    const success = await addToCart(product);
    if (success) toast.success('Added to cart!');
  };

  if (viewMode === 'list') {
    return (
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-[#0a0d14] border border-white/5 rounded-[2.5rem] overflow-hidden flex flex-col md:flex-row gap-10 p-8 transition-all duration-500 hover:border-blue-500/30 hover:shadow-[0_20px_50px_rgba(0,0,0,0.5)]"
      >
        <div className="relative w-full md:w-72 h-72 bg-[#05070a] rounded-[2rem] overflow-hidden flex-shrink-0 flex items-center justify-center border border-white/5">
          <Link to={`/product/${productId}`} className="w-full h-full">
            <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-700" alt={product.name} />
          </Link>
          <div className="absolute top-5 right-5 flex flex-col gap-3">
            <button 
              onClick={handleWishlist} 
              className={`w-11 h-11 rounded-2xl bg-black/40 backdrop-blur-xl flex items-center justify-center border border-white/10 transition-all ${inWishlist ? 'text-red-500 border-red-500/30' : 'text-white/40 hover:text-white hover:border-white/30'}`}
            >
              {inWishlist ? <FaHeart size={16} /> : <FaRegHeart size={16} />}
            </button>
          </div>
        </div>
        
        <div className="flex-grow flex flex-col justify-between py-2">
          <div>
            <div className="flex items-center gap-3 mb-5">
              {product.isNew && <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1 rounded-lg uppercase tracking-widest">New</span>}
              {product.discount > 0 && <span className="bg-red-500/10 text-red-500 text-[10px] font-black px-3 py-1 rounded-lg border border-red-500/20">-{product.discount}% OFF</span>}
            </div>
            <Link to={`/product/${productId}`}>
              <h3 className="text-3xl font-black text-white group-hover:text-blue-400 transition-colors mb-4 tracking-tighter leading-tight">{product.name}</h3>
            </Link>
            <div className="flex items-center gap-4 mb-6">
              <div className="flex items-center gap-1">{renderStars(product.rating)}</div>
              <span className="text-[13px] text-slate-500 font-bold uppercase tracking-widest">({product.reviewCount || 0} reviews)</span>
            </div>
            <p className="text-slate-400 text-[15px] line-clamp-3 leading-relaxed max-w-3xl font-medium">{product.description}</p>
          </div>
          
          <div className="flex items-center gap-4 mt-10 pt-8 border-t border-white/5">
            <div className="flex items-baseline gap-4">
              <span className="text-4xl font-black text-white">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="text-lg text-slate-600 line-through font-bold">{formatPrice(product.oldPrice)}</span>}
            </div>
            <div className="flex items-center gap-3">
              <button onClick={handleChat} className="px-8 py-3.5 rounded-2xl bg-white/5 border border-white/10 text-white font-black uppercase tracking-widest text-xs hover:bg-white/10 transition-all flex items-center gap-2">
                <FaCommentDots size={16} /> {t('chat') || 'Chat'}
              </button>
              <button onClick={handleAddToCart} className="btn-premium flex items-center gap-3 px-10">
                <FaCartPlus size={18} /> {t('addToCart') || 'Add to Cart'}
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      initial={{ opacity: 0, scale: 0.95 }}
      animate={{ opacity: 1, scale: 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="card-premium group flex flex-col h-full relative overflow-hidden"
    >
      {/* Badges */}
      <div className="absolute top-6 left-6 z-10 flex flex-col gap-2">
        {product.isNew && <span className="bg-blue-600 text-white text-[10px] font-black px-3 py-1.5 rounded-xl uppercase tracking-widest shadow-lg shadow-blue-600/20">NEW</span>}
        {product.discount > 0 && <span className="bg-red-500 text-white text-[10px] font-black px-3 py-1.5 rounded-xl shadow-lg shadow-red-500/20">-{product.discount}%</span>}
      </div>

      {/* Action Buttons */}
      <div className="absolute top-6 right-6 z-10 flex flex-col gap-3 translate-x-16 opacity-0 group-hover:translate-x-0 group-hover:opacity-100 transition-all duration-500">
        <button 
          onClick={handleWishlist} 
          className={`w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center transition-all ${inWishlist ? 'text-red-500 bg-white/20' : 'text-slate-400 hover:text-white hover:bg-white/20'}`}
        >
          {inWishlist ? <FaHeart size={18} /> : <FaRegHeart size={18} />}
        </button>
        <Link 
          to={`/product/${productId}`} 
          className="w-12 h-12 rounded-2xl bg-white/10 backdrop-blur-xl border border-white/10 flex items-center justify-center text-slate-400 hover:text-white hover:bg-white/20 transition-all"
        >
          <FaEye size={18} />
        </Link>
      </div>

      {/* Image Area */}
      <div className="relative aspect-[4/5] overflow-hidden mb-8 rounded-[2.5rem] bg-[#05070a] border border-white/5 flex items-center justify-center">
        <Link to={`/product/${productId}`} className="w-full h-full flex items-center justify-center p-6">
          <img 
            src={product.image} 
            className="w-full h-full object-contain group-hover:scale-110 transition-transform duration-1000 ease-out drop-shadow-[0_20px_30px_rgba(0,0,0,0.5)]" 
            alt={product.name} 
          />
        </Link>
        
        {/* Quick Add Buttons on Hover */}
        <div className="absolute bottom-6 left-6 right-6 flex gap-3 translate-y-16 opacity-0 group-hover:translate-y-0 group-hover:opacity-100 transition-all duration-700 delay-100">
          <button 
            onClick={handleChat}
            className="flex-1 bg-white/10 backdrop-blur-xl border border-white/10 text-white font-black uppercase text-[11px] tracking-[0.2em] py-4 rounded-2xl shadow-2xl hover:bg-white/20 transition-all flex items-center justify-center gap-2"
          >
            <FaCommentDots size={14} /> Chat
          </button>
          <button 
            onClick={handleAddToCart}
            className="flex-1 bg-[#0d6efd] text-white font-black uppercase text-[11px] tracking-[0.2em] py-4 rounded-2xl shadow-2xl shadow-blue-600/30 hover:bg-blue-600 hover:scale-[1.02] transition-all active:scale-95 flex items-center justify-center gap-2"
          >
            <FaCartPlus size={14} /> Add +
          </button>
        </div>
      </div>

      {/* Info Area */}
      <div className="flex flex-col flex-grow px-2">
        <div className="mb-6">
           <Link to={`/product/${productId}`}>
             <h3 className="text-[17px] font-black text-white hover:text-blue-400 transition-colors line-clamp-2 leading-[1.3] mb-4 h-12 tracking-tight uppercase">{product.name}</h3>
           </Link>
           <div className="flex items-center justify-between mb-4">
             <div className="flex flex-col">
                <span className="text-[22px] font-black text-blue-400 tracking-tighter">{formatPrice(product.price)}</span>
                {product.oldPrice && <span className="text-[13px] text-slate-600 line-through font-bold">{formatPrice(product.oldPrice)}</span>}
             </div>
             <div className="text-right">
                <div className="flex items-center gap-1 text-[11px] text-yellow-500 mb-1">
                  <FaStar />
                  <span className="font-black text-white">{product.rating || 5.0}</span>
                </div>
                <span className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{product.reviewCount || 0} reviews</span>
             </div>
           </div>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
