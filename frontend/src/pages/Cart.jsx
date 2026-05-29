import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart,
  FaTruck, FaShieldAlt, FaHeadset, FaLock, FaBolt,
  FaChevronRight, FaTag
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../context/LocaleContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { formatPrice } = useLocale();
  const navigate = useNavigate();

  const [coupon, setCoupon]           = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount]       = useState(0);
  const [suggested, setSuggested]     = useState([]);
  const [location, setLocation]       = useState('kigali');

  const deliveryFee = location === 'kigali' ? 0 : 2000;
  const subtotal    = totalPrice;
  const total       = subtotal - discount + deliveryFee;

  useEffect(() => {
    productAPI.getProducts()
      .then(res => {
        const all    = res?.data?.products || [];
        const cartIds = new Set(cart.map(i => i.product?._id || i._id));
        setSuggested(all.filter(p => !cartIds.has(p._id)).sort(() => 0.5 - Math.random()).slice(0, 5));
      })
      .catch(() => {});
  }, [cart]);

  const applyCoupon = () => {
    if (coupon.trim().toUpperCase() === 'DODOS10') {
      setDiscount(Math.round(subtotal * 0.1));
      setCouponApplied(true);
    } else {
      setDiscount(0);
      setCouponApplied(false);
    }
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center max-w-md w-full shadow-sm">
          <div className="w-20 h-20 bg-gray-100 rounded-2xl flex items-center justify-center text-gray-300 text-4xl mx-auto mb-6">
            <FaShoppingCart />
          </div>
          <h3 className="text-2xl font-black text-gray-900 mb-3">Your Cart is Empty</h3>
          <p className="text-gray-500 text-sm mb-8">Explore our premium collection and find something special.</p>
          <Link to="/products" className="bg-green-500 hover:bg-green-600 text-white font-black py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
            <FaArrowLeft size={12} /> Start Shopping
          </Link>
        </div>
      </div>
    );
  }

  return (
    <div className="bg-gray-50 min-h-screen pt-6 pb-16">
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8">

        {/* Breadcrumb */}
        <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
          <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
          <FaChevronRight size={8} />
          <span className="text-gray-700">Shopping Cart</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-8">

          {/* ── MAIN ── */}
          <div className="flex-1 space-y-5">
            <div className="flex items-center justify-between">
              <h1 className="text-2xl font-black text-gray-900">
                Your Cart <span className="text-gray-400 font-semibold text-lg">({cart.length} items)</span>
              </h1>
              <button onClick={clearCart} className="text-xs font-semibold text-red-400 hover:text-red-600 transition-colors uppercase tracking-widest">
                Clear All
              </button>
            </div>

            {/* Delivery zone */}
            <div className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500">
                  <FaTruck size={16} />
                </div>
                <div>
                  <p className="font-bold text-gray-800 text-sm">Delivery Zone</p>
                  <p className="text-gray-400 text-xs">Select your area for shipping</p>
                </div>
              </div>
              <div className="flex gap-3">
                {[
                  { id: 'kigali',  label: 'Kigali (Free)' },
                  { id: 'outside', label: `Outside (+${formatPrice(2000)})` },
                ].map(loc => (
                  <button
                    key={loc.id}
                    onClick={() => setLocation(loc.id)}
                    className={`px-5 py-2 rounded-lg text-xs font-bold uppercase tracking-widest transition-all border ${
                      location === loc.id
                        ? 'bg-green-500 border-green-500 text-white'
                        : 'bg-gray-50 border-gray-200 text-gray-500 hover:border-green-300 hover:text-green-600'
                    }`}
                  >
                    {loc.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart items */}
            <div className="space-y-3">
              <AnimatePresence>
                {cart.map((item) => {
                  const product = item.product || item;
                  const itemId  = product._id || item._id || item.id;
                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -80 }}
                      className="bg-white border border-gray-200 rounded-xl p-4 flex flex-col sm:flex-row items-center gap-5 hover:shadow-md transition-all"
                    >
                      <div className="w-24 h-24 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                        <img src={product.image} className="w-full h-full object-contain p-2" alt="" />
                      </div>

                      <div className="flex-1 min-w-0 text-center sm:text-left">
                        <Link to={`/product/${itemId}`}>
                          <h4 className="text-sm font-bold text-gray-900 hover:text-green-600 transition-colors truncate">{product.name}</h4>
                        </Link>
                        <p className="text-xs text-gray-400 mt-0.5">{product.brand} · {product.category}</p>
                        <div className="flex items-center justify-center sm:justify-start gap-1.5 mt-1.5">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] font-semibold text-green-600 uppercase tracking-widest">In Stock</span>
                        </div>
                      </div>

                      <div className="text-center">
                        <p className="text-[10px] text-gray-400 uppercase tracking-widest mb-1">Unit</p>
                        <p className="text-sm font-black text-gray-800">{formatPrice(product.price)}</p>
                      </div>

                      {/* Qty */}
                      <div className="flex items-center bg-gray-100 rounded-lg p-0.5 border border-gray-200">
                        <button onClick={() => updateQuantity(itemId, item.quantity - 1, product.stock)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-all text-gray-600">
                          <FaMinus size={9} />
                        </button>
                        <span className="w-8 text-center text-sm font-black text-gray-800">{item.quantity}</span>
                        <button onClick={() => updateQuantity(itemId, item.quantity + 1, product.stock)} className="w-8 h-8 flex items-center justify-center rounded-md hover:bg-white transition-all text-gray-600">
                          <FaPlus size={9} />
                        </button>
                      </div>

                      <div className="text-center min-w-[90px]">
                        <p className="text-[10px] text-green-600 uppercase tracking-widest mb-1 font-semibold">Subtotal</p>
                        <p className="text-base font-black text-gray-900">{formatPrice(product.price * item.quantity)}</p>
                      </div>

                      <button onClick={() => removeFromCart(itemId)} className="w-9 h-9 bg-red-50 text-red-400 rounded-lg flex items-center justify-center border border-red-100 hover:bg-red-500 hover:text-white transition-all">
                        <FaTrash size={12} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <Link to="/products" className="inline-flex items-center gap-2 text-xs font-semibold text-gray-400 hover:text-green-600 transition-colors uppercase tracking-widest">
              <FaArrowLeft size={10} /> Continue Shopping
            </Link>
          </div>

          {/* ── SUMMARY ── */}
          <div className="lg:w-[360px] space-y-4">
            <div className="bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
              <h3 className="text-base font-black text-gray-900 mb-5">Order Summary</h3>

              <div className="space-y-3 mb-5 pb-5 border-b border-gray-100">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-semibold">Subtotal</span>
                  <span className="font-black text-gray-900">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between text-sm text-red-500">
                    <span className="font-semibold">Discount (10%)</span>
                    <span className="font-black">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between text-sm">
                  <span className="text-gray-500 font-semibold">Delivery</span>
                  <span className={`font-black ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              {/* Coupon */}
              <div className="mb-5">
                <p className="text-xs font-bold text-gray-500 uppercase tracking-widest mb-2">Promo Code</p>
                <div className="flex gap-2">
                  <input
                    type="text"
                    value={coupon}
                    onChange={e => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-gray-50 border border-gray-200 rounded-lg px-3 py-2.5 text-sm text-gray-700 outline-none focus:border-green-500 uppercase tracking-widest"
                  />
                  <button onClick={applyCoupon} className="px-4 bg-gray-100 border border-gray-200 text-gray-600 rounded-lg text-xs font-bold uppercase tracking-widest hover:bg-gray-200 transition-all">
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-xs text-green-600 font-bold mt-2 flex items-center gap-1.5">
                    <FaBolt size={10} /> DODOS10 applied — 10% off!
                  </p>
                )}
              </div>

              <div className="flex justify-between items-end mb-5">
                <div>
                  <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Total</p>
                  <p className="text-2xl font-black text-gray-900 mt-1">{formatPrice(total)}</p>
                </div>
                <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">VAT Incl.</p>
              </div>

              <Link
                to="/checkout"
                className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm shadow-green-500/20"
              >
                Secure Checkout <FaLock size={12} />
              </Link>

              <div className="mt-4 flex items-center justify-center gap-5 text-gray-300">
                <FaShieldAlt size={18} />
                <FaLock size={18} />
                <FaBolt size={18} />
              </div>
            </div>

            {/* Support */}
            <div className="bg-white border border-gray-200 rounded-xl p-4 flex items-center gap-3">
              <div className="w-10 h-10 bg-green-50 rounded-xl flex items-center justify-center text-green-500 flex-shrink-0">
                <FaHeadset size={16} />
              </div>
              <div>
                <p className="text-sm font-bold text-gray-800">Need Help?</p>
                <p className="text-xs text-gray-400">Talk to our experts 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested */}
        {suggested.length > 0 && (
          <div className="mt-14">
            <div className="flex items-center gap-3 mb-5">
              <div className="w-1 h-6 bg-green-500 rounded-full" />
              <h3 className="text-xl font-black text-gray-900">You May Also Like</h3>
            </div>
            <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-4">
              {suggested.map(p => <ProductCard key={p._id} product={p} />)}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;
