import { useState } from 'react';
import { Link } from 'react-router-dom';
import { FaShoppingCart, FaHeart, FaEye, FaStar, FaStarHalfAlt, FaRegHeart, FaCommentDots, FaCartPlus } from 'react-icons/fa';
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
      if (i <= rating) stars.push(<FaStar key={i} className="text-[#f59e0b]" size={11} />);
      else if (i - 0.5 <= rating) stars.push(<FaStarHalfAlt key={i} className="text-[#f59e0b]" size={11} />);
      else stars.push(<FaStar key={i} className="text-gray-300" size={11} />);
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

  /* ── LIST VIEW ── */
  if (viewMode === 'list') {
    return (
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex gap-0 hover:shadow-lg transition-all duration-300"
      >
        {/* Image */}
        <div className="relative w-48 h-48 bg-gray-50 flex-shrink-0 flex items-center justify-center overflow-hidden">
          <Link to={`/product/${productId}`} className="w-full h-full flex items-center justify-center p-4">
            <img src={product.image} className="max-w-full max-h-full object-contain group-hover:scale-105 transition-transform duration-500" alt={product.name} />
          </Link>
          {product.discount > 0 && (
            <span className="absolute top-2 left-2 bg-red-500 text-white text-[10px] font-bold px-2 py-0.5 rounded">-{product.discount}%</span>
          )}
          <button onClick={handleWishlist} className={`absolute top-2 right-2 w-8 h-8 rounded-full bg-white shadow flex items-center justify-center transition-all ${inWishlist ? 'text-red-500' : 'text-gray-400 hover:text-red-400'}`}>
            {inWishlist ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
          </button>
        </div>

        {/* Info */}
        <div className="flex-1 p-5 flex flex-col justify-between">
          <div>
            <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">{product.brand}</p>
            <Link to={`/product/${productId}`}>
              <h3 className="text-sm font-bold text-gray-800 hover:text-green-600 transition-colors line-clamp-2 leading-snug mb-2">{product.name}</h3>
            </Link>
            <div className="flex items-center gap-1.5 mb-3">
              <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
              <span className="text-[11px] text-gray-400">({product.reviewCount || 0})</span>
            </div>
            <p className="text-xs text-gray-500 line-clamp-2">{product.description}</p>
          </div>
          <div className="flex items-center justify-between mt-4 pt-4 border-t border-gray-100">
            <div>
              <span className="text-lg font-black text-gray-900">{formatPrice(product.price)}</span>
              {product.oldPrice && <span className="text-xs text-gray-400 line-through ml-2">{formatPrice(product.oldPrice)}</span>}
            </div>
            <div className="flex items-center gap-2">
              <button
                onClick={handleChat}
                className="flex items-center gap-1.5 px-3 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all shadow-sm shadow-green-500/30"
              >
                <FaCommentDots size={12} /> Chat
              </button>
              <button
                onClick={handleAddToCart}
                className="flex items-center gap-1.5 px-4 py-2 rounded-lg bg-green-500 hover:bg-green-600 text-white text-xs font-bold transition-all shadow-sm shadow-green-500/30"
              >
                <FaShoppingCart size={12} /> Add to cart
              </button>
            </div>
          </div>
        </div>
      </motion.div>
    );
  }

  /* ── GRID VIEW (matches image style) ── */
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.97 }}
      animate={{ opacity: 1, scale: 1 }}
      onHoverStart={() => setIsHovered(true)}
      onHoverEnd={() => setIsHovered(false)}
      className="group bg-white border border-gray-200 rounded-xl overflow-hidden flex flex-col hover:shadow-xl hover:-translate-y-1 transition-all duration-300 relative"
    >
      {/* Badges */}
      <div className="absolute top-2 left-2 z-10 flex flex-col gap-1">
        {product.isNew && (
          <span className="bg-blue-500 text-white text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider">NEW</span>
        )}
        {product.discount > 0 && (
          <span className="bg-red-500 text-white text-[9px] font-black px-2 py-0.5 rounded">-{product.discount}%</span>
        )}
      </div>

      {/* Wishlist */}
      <button
        onClick={handleWishlist}
        className={`absolute top-2 right-2 z-10 w-8 h-8 rounded-full bg-white shadow-md flex items-center justify-center transition-all hover:scale-110 ${inWishlist ? 'text-red-500' : 'text-gray-300 hover:text-red-400'}`}
      >
        {inWishlist ? <FaHeart size={13} /> : <FaRegHeart size={13} />}
      </button>

      {/* Image */}
      <Link to={`/product/${productId}`} className="block bg-gray-50 flex items-center justify-center overflow-hidden" style={{ height: '180px' }}>
        <img
          src={product.image}
          className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
          alt={product.name}
        />
      </Link>

      {/* Info */}
      <div className="p-3 flex flex-col flex-grow">
        {/* Brand */}
        <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1 truncate">{product.brand}</p>

        {/* Name */}
        <Link to={`/product/${productId}`}>
          <h3 className="text-[13px] font-semibold text-gray-800 hover:text-green-600 transition-colors line-clamp-2 leading-snug mb-2 min-h-[36px]">
            {product.name}
          </h3>
        </Link>

        {/* Stars */}
        <div className="flex items-center gap-1 mb-2">
          <div className="flex items-center gap-0.5">{renderStars(product.rating)}</div>
          <span className="text-[10px] text-gray-400">({product.reviewCount || 0})</span>
        </div>

        {/* Price */}
        <div className="flex items-baseline gap-2 mb-3 mt-auto">
          <span className="text-[15px] font-black text-gray-900">{formatPrice(product.price)}</span>
          {product.oldPrice && (
            <span className="text-[11px] text-gray-400 line-through">{formatPrice(product.oldPrice)}</span>
          )}
        </div>

        {/* Buttons */}
        <div className="flex gap-2">
          <button
            onClick={handleChat}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500 hover:bg-green-600 active:scale-95 text-white text-[11px] font-bold transition-all shadow-sm shadow-green-500/20"
          >
            <FaCommentDots size={11} />
            <span>Chat</span>
          </button>
          <button
            onClick={handleAddToCart}
            className="flex-1 flex items-center justify-center gap-1.5 py-2 rounded-lg bg-green-500 hover:bg-green-600 active:scale-95 text-white text-[11px] font-bold transition-all shadow-sm shadow-green-500/20"
          >
            <FaShoppingCart size={11} />
            <span>Add to cart</span>
          </button>
        </div>
      </div>
    </motion.div>
  );
};

export default ProductCard;
