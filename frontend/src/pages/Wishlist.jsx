import { Link } from 'react-router-dom';
import { useWishlist } from '../context/WishlistContext';
import { useCart } from '../context/CartContext';
import { useLocale } from '../context/LocaleContext';
import { FaHeart, FaShoppingCart, FaTrash, FaArrowRight, FaBoxOpen } from 'react-icons/fa';
import { toast } from 'react-toastify';
import { motion, AnimatePresence } from 'framer-motion';

const Wishlist = () => {
  const { wishlist, removeFromWishlist } = useWishlist();
  const { addToCart } = useCart();
  const { formatPrice } = useLocale();

  const handleAddToCart = async (product) => {
    const success = await addToCart(product);
    if (success) {
      toast.success('🎉 Added to cart!');
    }
  };

  const handleRemove = (id) => {
    removeFromWishlist(id);
    toast.info('Removed from wishlist');
  };

  if (wishlist.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center p-8 bg-gray-50 rounded-[3rem] border border-dashed border-gray-200">
        <div className="w-24 h-24 bg-white rounded-full flex items-center justify-center shadow-sm mb-6">
          <FaBoxOpen size={40} className="text-gray-200" />
        </div>
        <h3 className="text-2xl font-black text-dark uppercase tracking-tighter mb-2">Your Wishlist is Empty</h3>
        <p className="text-gray-400 font-bold mb-8">Save your favorite accessories here for later.</p>
        <Link 
          to="/products" 
          className="bg-primary text-black px-10 py-4 rounded-2xl font-black shadow-xl hover:bg-primary-dark transition-all flex items-center gap-3 uppercase tracking-tighter"
        >
          Browse Products <FaArrowRight size={14} />
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-10 animate-fadeIn">
      <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
        <div>
          <h2 className="text-4xl font-black text-dark uppercase tracking-tighter">My Wishlist</h2>
          <p className="text-gray-400 font-bold mt-1">You have {wishlist.length} items saved</p>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8">
        <AnimatePresence>
          {wishlist.map((product) => (
            <motion.div 
              key={product._id} 
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.9 }}
              className="group bg-white rounded-[2.5rem] shadow-sm hover:shadow-2xl transition-all duration-500 overflow-hidden flex flex-col border border-gray-50"
            >
              <div className="relative h-64 bg-gray-50/50 overflow-hidden">
                <img
                  src={product.image}
                  className="w-full h-full object-cover transform group-hover:scale-110 transition-transform duration-700"
                  alt={product.name}
                />
                <button 
                  className="absolute top-6 right-6 bg-white/90 p-3 rounded-2xl shadow-sm text-red-500 hover:bg-red-500 hover:text-white transition-all" 
                  onClick={() => handleRemove(product._id)}
                  title="Remove from wishlist"
                >
                  <FaTrash size={14} />
                </button>
              </div>

              <div className="p-8 flex flex-col flex-grow">
                <Link to={`/product/${product._id}`}>
                  <h3 className="font-black text-dark text-lg leading-tight mb-3 line-clamp-2 min-h-[3rem] uppercase tracking-tighter group-hover:text-primary transition-colors">
                    {product.name}
                  </h3>
                </Link>
                
                <div className="flex items-center gap-2 mb-6">
                  <span className="text-[10px] bg-gray-50 text-gray-400 px-3 py-1.5 rounded-lg uppercase font-black tracking-widest border border-gray-100">
                    {product.brand}
                  </span>
                  <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider">
                    {product.compatible}
                  </span>
                </div>

                <div className="mt-auto pt-6 border-t border-gray-50">
                  <div className="flex items-center justify-between mb-6">
                    <span className="text-2xl font-black text-dark tracking-tighter">
                      {formatPrice(product.price)}
                    </span>
                  </div>

                  <button 
                    className="w-full bg-primary text-black font-black py-4 rounded-2xl shadow-lg hover:bg-primary-dark transition-all transform hover:-translate-y-1 flex items-center justify-center gap-3 uppercase tracking-tighter"
                    onClick={() => handleAddToCart(product)}
                  >
                    <FaShoppingCart size={16} /> Add to Cart
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
