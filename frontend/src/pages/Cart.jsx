import { useState, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCart } from '../context/CartContext';
import { productAPI } from '../services/api';
import ProductCard from '../components/ProductCard';
import {
  FaTrash, FaPlus, FaMinus, FaArrowLeft, FaShoppingCart,
  FaTruck, FaShieldAlt, FaUndo, FaHeadset, FaTag, FaLock,
  FaStar, FaBolt, FaChevronRight, FaRegHeart
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../context/LocaleContext';

const Cart = () => {
  const { cart, removeFromCart, updateQuantity, totalPrice, clearCart } = useCart();
  const { t, formatPrice } = useLocale();
  const navigate = useNavigate();
  
  const [coupon, setCoupon] = useState('');
  const [couponApplied, setCouponApplied] = useState(false);
  const [discount, setDiscount] = useState(0);
  const [suggested, setSuggested] = useState([]);
  const [location, setLocation] = useState('kigali');

  const deliveryFee = location === 'kigali' ? 0 : 2000;
  const subtotal = totalPrice;
  const total = subtotal - discount + deliveryFee;

  useEffect(() => {
    productAPI.getProducts()
      .then((res) => {
        const all = res?.data?.products || [];
        const cartIds = new Set(cart.map((i) => (i.product?._id || i._id)));
        const pool = all.filter((p) => !cartIds.has(p._id));
        setSuggested(pool.sort(() => 0.5 - Math.random()).slice(0, 6));
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a] px-4 pt-[160px] bg-mesh">
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          className="bg-[#0a0d14] border border-white/5 p-16 rounded-[3rem] text-center max-w-lg w-full shadow-2xl relative overflow-hidden"
        >
          <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
          <div className="w-24 h-24 bg-white/5 text-slate-700 rounded-[2rem] flex items-center justify-center text-4xl mx-auto mb-10 border border-white/5">
            <FaShoppingCart />
          </div>
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Your Cart is Empty</h3>
          <p className="text-slate-500 font-medium mb-10 leading-relaxed">Looks like you haven't added anything to your cart yet. Explore our premium collection and find something special.</p>
          <Link
            to="/products"
            className="btn-premium flex items-center justify-center gap-3 w-full"
          >
            <FaArrowLeft size={13} /> Start Shopping
          </Link>
        </motion.div>
      </div>
    );
  }

  return (
    <div className="bg-bg-main min-h-screen pt-7 pb-20 bg-mesh">
      <div className="max-w-[1600px] mx-auto px-4 xl:px-8">
        
        {/* Breadcrumbs */}
        <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mb-12">
          <Link to="/" className="text-slate-500 hover:text-white transition-colors">Home</Link>
          <FaChevronRight size={8} className="text-slate-700" />
          <span className="text-blue-400">Shopping Cart</span>
        </nav>

        <div className="flex flex-col lg:flex-row gap-12">
          {/* MAIN CONTENT */}
          <div className="flex-1 space-y-8">
            <div className="flex items-center justify-between">
              <h1 className="text-4xl font-black text-white uppercase tracking-tighter flex items-center gap-4">
                Your Cart
                <span className="text-slate-700 font-black text-lg">/ {cart.length} Items</span>
              </h1>
              <button 
                onClick={clearCart}
                className="text-red-500/60 hover:text-red-500 text-[10px] font-black uppercase tracking-widest transition-all"
              >
                Clear All Items
              </button>
            </div>

            {/* Location Selector */}
            <div className="bg-[#0a0d14] border border-white/5 rounded-[2rem] p-8 flex flex-col md:flex-row md:items-center justify-between gap-6 shadow-xl relative overflow-hidden">
              <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/5 blur-[50px] rounded-full" />
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 bg-blue-600/10 rounded-xl flex items-center justify-center text-blue-400">
                  <FaTruck size={18} />
                </div>
                <div>
                  <p className="text-white font-black uppercase text-sm tracking-tight">Delivery Zone</p>
                  <p className="text-slate-500 text-[11px] font-bold uppercase tracking-widest mt-1">Select your area for shipping</p>
                </div>
              </div>
              <div className="flex gap-4">
                {['kigali', 'outside'].map((loc) => (
                  <button
                    key={loc}
                    onClick={() => setLocation(loc)}
                    className={`px-8 py-3 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all border ${
                      location === loc 
                      ? 'bg-blue-600 border-blue-600 text-white shadow-lg shadow-blue-500/20' 
                      : 'bg-white/5 border-white/5 text-slate-500 hover:text-white'
                    }`}
                  >
                    {loc === 'kigali' ? 'Kigali (Free)' : `Outside (${formatPrice(2000)})`}
                  </button>
                ))}
              </div>
            </div>

            {/* Cart Items List */}
            <div className="space-y-4">
              <AnimatePresence>
                {cart.map((item, idx) => {
                  const product = item.product || item;
                  const itemId = product._id || item._id || item.id;
                  return (
                    <motion.div
                      key={itemId}
                      initial={{ opacity: 0, y: 20 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0, x: -100 }}
                      className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-6 flex flex-col md:flex-row items-center gap-8 shadow-xl group hover:border-white/10 transition-all"
                    >
                      <div className="w-32 h-32 bg-[#05070a] rounded-[1.5rem] flex-shrink-0 border border-white/5 flex items-center justify-center overflow-hidden">
                        <img src={product.image} className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500" alt="" />
                      </div>
                      
                      <div className="flex-1 min-w-0 text-center md:text-left">
                        <Link to={`/product/${itemId}`}>
                          <h4 className="text-lg font-black text-white uppercase tracking-tight truncate group-hover:text-blue-400 transition-colors">
                            {product.name}
                          </h4>
                        </Link>
                        <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">
                          {product.brand} • {product.category}
                        </p>
                        <div className="flex items-center justify-center md:justify-start gap-2 mt-3">
                          <span className="w-1.5 h-1.5 rounded-full bg-green-500" />
                          <span className="text-[10px] font-black text-green-500/80 uppercase tracking-widest">In Stock</span>
                        </div>
                      </div>

                      <div className="flex flex-col items-center gap-2 px-8 border-x border-white/5">
                        <span className="text-[10px] font-black text-slate-500 uppercase tracking-widest">Unit Price</span>
                        <span className="text-lg font-black text-white">{formatPrice(product.price)}</span>
                      </div>

                      <div className="flex items-center bg-white/5 rounded-2xl p-1 border border-white/5 w-32">
                        <button 
                          onClick={() => updateQuantity(itemId, item.quantity - 1, product.stock)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white"
                        ><FaMinus size={10} /></button>
                        <span className="flex-1 text-center font-black text-white">{item.quantity}</span>
                        <button 
                          onClick={() => updateQuantity(itemId, item.quantity + 1, product.stock)}
                          className="w-10 h-10 flex items-center justify-center rounded-xl hover:bg-white/10 text-white"
                        ><FaPlus size={10} /></button>
                      </div>

                      <div className="flex flex-col items-center gap-2 min-w-[120px]">
                        <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Subtotal</span>
                        <span className="text-xl font-black text-white">{formatPrice(product.price * item.quantity)}</span>
                      </div>

                      <button 
                        onClick={() => removeFromCart(itemId)}
                        className="w-12 h-12 bg-red-500/10 text-red-500 rounded-2xl flex items-center justify-center border border-red-500/20 hover:bg-red-500 hover:text-white transition-all shadow-lg"
                      >
                        <FaTrash size={14} />
                      </button>
                    </motion.div>
                  );
                })}
              </AnimatePresence>
            </div>

            <Link to="/products" className="inline-flex items-center gap-3 text-slate-500 hover:text-white font-black uppercase text-[10px] tracking-[0.2em] transition-all group">
              <FaArrowLeft className="group-hover:-translate-x-1 transition-transform" /> Continue Shopping
            </Link>
          </div>

          {/* SIDEBAR SUMMARY */}
          <div className="lg:w-[420px] space-y-8">
            {/* Order Summary */}
            <div className="bg-[#0a0d14] border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
              <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
              <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-10">Order Summary</h3>
              
              <div className="space-y-6 mb-10 pb-10 border-b border-white/5">
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-black uppercase text-[11px] tracking-widest">Subtotal</span>
                  <span className="text-white font-black">{formatPrice(subtotal)}</span>
                </div>
                {discount > 0 && (
                  <div className="flex justify-between items-center text-red-500">
                    <span className="font-black uppercase text-[11px] tracking-widest">Discount (10%)</span>
                    <span className="font-black">-{formatPrice(discount)}</span>
                  </div>
                )}
                <div className="flex justify-between items-center">
                  <span className="text-slate-500 font-black uppercase text-[11px] tracking-widest">Delivery Fee</span>
                  <span className={`font-black ${deliveryFee === 0 ? 'text-green-500' : 'text-white'}`}>
                    {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                  </span>
                </div>
              </div>

              {/* Promo Code */}
              <div className="mb-10">
                <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest mb-4">Have a promo code?</p>
                <div className="flex gap-2">
                  <input 
                    type="text" 
                    value={coupon}
                    onChange={(e) => setCoupon(e.target.value)}
                    placeholder="Enter code"
                    className="flex-1 bg-white/5 border border-white/5 rounded-xl px-5 py-3 text-white text-sm font-bold uppercase tracking-widest outline-none focus:border-blue-500/50"
                  />
                  <button 
                    onClick={applyCoupon}
                    className="px-6 bg-white/5 border border-white/10 text-white rounded-xl text-[10px] font-black uppercase tracking-widest hover:bg-white/10 transition-all"
                  >
                    Apply
                  </button>
                </div>
                {couponApplied && (
                  <p className="text-[10px] text-green-500 font-black uppercase tracking-widest mt-3 flex items-center gap-2">
                    <FaBolt /> Coupon DODOS10 Applied!
                  </p>
                )}
              </div>

              <div className="flex justify-between items-end mb-10">
                <div>
                  <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Total Amount</p>
                  <p className="text-3xl font-black text-white mt-2">{formatPrice(total)}</p>
                </div>
                <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">VAT Incl.</p>
              </div>

              <Link to="/checkout" className="btn-premium w-full flex items-center justify-center gap-4 py-5 shadow-blue-500/30">
                Secure Checkout <FaLock size={14} />
              </Link>

              <div className="mt-8 flex items-center justify-center gap-6">
                <FaShieldAlt className="text-slate-700 text-xl" />
                <FaLock className="text-slate-700 text-xl" />
                <FaBolt className="text-slate-700 text-xl" />
              </div>
            </div>

            {/* Support Box */}
            <div className="bg-white/5 border border-white/10 rounded-[2.5rem] p-8 flex items-center gap-6">
              <div className="w-14 h-14 bg-blue-600/10 rounded-2xl flex items-center justify-center text-blue-400">
                <FaHeadset size={20} />
              </div>
              <div>
                <p className="text-white font-black text-xs uppercase tracking-tight">Need Help?</p>
                <p className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mt-1">Talk to our experts 24/7</p>
              </div>
            </div>
          </div>
        </div>

        {/* Suggested Section */}
        {suggested.length > 0 && (
          <div className="mt-32">
            <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-12">Complete Your Set</h3>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-6">
              {suggested.map((p) => (
                <ProductCard key={p._id} product={p} />
              ))}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default Cart;