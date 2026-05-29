import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { FaHeart, FaShoppingCart, FaTrash, FaArrowRight, FaBoxOpen, FaChevronRight } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useLocale();

  const handleAddToCart = async (product) => {
    const success = await addToCart(product);
    if (success) toast.success('Added to cart!');
  };

  const handleRemove = (id) => {
    removeFromWishlist(id);
    toast.info('Removed from wishlist');
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-white rounded-xl border border-dashed border-gray-200 mx-4 my-6">
        <div className="w-20 h-20 bg-gray-50 rounded-full flex items-center justify-center mb-5">
          <FaBoxOpen size={32} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">Your Wishlist is Empty</h3>
        <p className="text-gray-400 text-sm mb-7">Save your favorite accessories here for later.</p>
        <Link to="/products" className="bg-green-500 hover:bg-green-600 text-white font-black px-8 py-3.5 rounded-xl transition-all flex items-center gap-2 text-sm">
          Browse Products <FaArrowRight size={12} />
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-black text-gray-900">My Wishlist</h2>
          <p className="text-gray-400 text-sm mt-0.5">{wishlist.length} items saved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
        <AnimatePresence>
          {wishlist.map((product) => (
            <motion.div
              key={product._id}
              layout
              initial={{ opacity: 0, scale: 0.95 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white border border-gray-200 rounded-xl overflow-hidden hover:shadow-lg hover:-translate-y-1 transition-all duration-300 flex flex-col"
            >
              <div className="relative h-48 bg-gray-50 overflow-hidden">
                <img
                  src={product.image}
                  className="w-full h-full object-contain p-4 group-hover:scale-105 transition-transform duration-500"
                  alt={product.name}
                />
                <button
                  onClick={() => handleRemove(product._id)}
                  className="absolute top-3 right-3 w-8 h-8 bg-white rounded-full shadow flex items-center justify-center text-red-400 hover:bg-red-500 hover:text-white transition-all"
                >
                  <FaTrash size={12} />
                </button>
              </div>

              <div className="p-4 flex flex-col flex-grow">
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-1">{product.brand}</p>
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-bold text-gray-800 text-sm leading-snug mb-2 line-clamp-2 hover:text-green-600 transition-colors min-h-[36px]">
                    {product.name}
                  </h3>
                </Link>

                <div className="mt-auto pt-3 border-t border-gray-100">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-base font-black text-gray-900">{formatPrice(product.price)}</span>
                  </div>
                  <button
                    onClick={() => handleAddToCart(product)}
                    className="w-full bg-green-500 hover:bg-green-600 text-white font-bold py-2.5 rounded-lg transition-all flex items-center justify-center gap-2 text-xs"
                  >
                    <FaShoppingCart size={12} /> Add to Cart
                  </button>
                </div>
              </div>
            </motion.div>
          ))}
        </AnimatePresence>
      </div>
    </div>
  );
};

export default Wishlist;
