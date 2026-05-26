import { useState, useEffect } from 'react';
import { useCart } from '../context/CartContext';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { orderAPI } from '../services/api.js';
import { toast } from 'react-toastify';
import {
  FaTruck, FaLock, FaShoppingBag, FaArrowLeft,
  FaCheckCircle, FaMobileAlt, FaMoneyBillWave,
  FaUniversity, FaChevronRight, FaBolt, FaShieldAlt
} from 'react-icons/fa';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocale } from '../context/LocaleContext';

/* ── MoMo instructions modal ── */
const MoMoModal = ({ total, momoNumber, onClose, onConfirm, confirming }) => {
  const { t, formatPrice } = useLocale();
  return (
    <div className="fixed inset-0 bg-black/80 backdrop-blur-md z-[100] flex items-center justify-center p-4">
      <motion.div 
        initial={{ opacity: 0, scale: 0.9, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-[#0a0d14] border border-white/5 rounded-[3rem] shadow-2xl w-full max-w-md p-10 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-500" />
        
        <div className="flex items-center gap-5 mb-8">
          <div className="w-16 h-16 bg-yellow-500/10 rounded-[1.5rem] flex items-center justify-center text-yellow-500 border border-yellow-500/20">
            <FaMobileAlt size={28} />
          </div>
          <div>
            <h3 className="text-xl font-black text-white uppercase tracking-tighter">MoMo Payment</h3>
            <p className="text-slate-500 text-[10px] font-black uppercase tracking-widest mt-1">Instant Confirmation</p>
          </div>
        </div>

        <div className="bg-white/5 border border-white/5 rounded-2xl p-6 mb-8">
          <p className="text-[11px] font-black text-yellow-500 uppercase tracking-widest mb-4 flex items-center gap-2">
            <FaBolt /> Instructions
          </p>
          <ol className="space-y-3">
            {[
              'Dial *182*8*1*241480# on your phone',
              'Confirm Merchant: edissa',
              `Enter Amount: ${formatPrice(total)}`,
              'Enter PIN to confirm'
            ].map((step, i) => (
              <li key={i} className="flex gap-3 text-xs text-slate-400 font-medium">
                <span className="text-yellow-500 font-black">{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </div>

        <div className="flex items-center justify-between p-4 bg-[#05070a] rounded-xl mb-8 border border-white/5">
          <div className="text-center flex-1 border-r border-white/5">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">Total</p>
            <p className="text-lg font-black text-white">{formatPrice(total)}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[9px] font-black text-slate-500 uppercase tracking-widest mb-1">MoMo Number</p>
            <p className="text-lg font-black text-white">{momoNumber || '---'}</p>
          </div>
        </div>

        <div className="flex gap-4">
          <button
            onClick={onClose}
            className="flex-1 py-4 rounded-2xl text-[11px] font-black uppercase tracking-widest text-slate-500 hover:bg-white/5 transition-all"
          >
            Cancel
          </button>
          <button
            onClick={onConfirm}
            disabled={confirming}
            className="flex-1 py-4 bg-yellow-500 hover:bg-yellow-400 text-black rounded-2xl text-[11px] font-black uppercase tracking-widest transition-all shadow-lg shadow-yellow-500/20 flex items-center justify-center gap-3"
          >
            {confirming ? <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" /> : <><FaCheckCircle /> I have Paid</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Payment method card ── */
const PayCard = ({ value, current, onChange, icon: Icon, title, subtitle, badge }) => (
  <label className={`flex items-center gap-5 p-6 rounded-2xl border-2 cursor-pointer transition-all ${current === value ? 'border-blue-600 bg-blue-600/5 shadow-lg shadow-blue-500/10' : 'border-white/5 bg-[#0a0d14] hover:border-white/10'}`}>
    <input type="radio" name="paymentMethod" value={value} className="hidden" checked={current === value} onChange={() => onChange(value)} />
    <div className={`w-14 h-14 rounded-xl flex items-center justify-center flex-shrink-0 border transition-all ${current === value ? 'bg-blue-600 text-white border-blue-500' : 'bg-[#05070a] text-slate-500 border-white/5'}`}>
      <Icon size={20} />
    </div>
    <div className="flex-grow">
      <div className="flex items-center gap-3">
        <p className="font-black text-white text-sm uppercase tracking-tight">{title}</p>
        {badge && <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-blue-600/20 text-blue-400 border border-blue-500/20 uppercase tracking-widest">{badge}</span>}
      </div>
      <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest mt-1">{subtitle}</p>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${current === value ? 'border-blue-600' : 'border-slate-700'}`}>
      {current === value && <div className="w-2.5 h-2.5 rounded-full bg-blue-600 shadow-[0_0_10px_#0d6efd]" />}
    </div>
  </label>
);

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { t, formatPrice } = useLocale();
  const navigate = useNavigate();
  const locState = useLocation().state || {};

  const [location, setLocation] = useState(locState.location || 'kigali');
  const deliveryFee = location === 'kigali' ? 0 : 2000;
  const total = totalPrice + deliveryFee;

  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [showMoMo, setShowMoMo] = useState(false);
  const [placing, setPlacing] = useState(false);

  const [form, setForm] = useState({
    fullName: '',
    phone: '',
    momoNumber: '',
    district: location === 'kigali' ? 'Kigali' : '',
    sector: '',
    street: '',
  });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim()) e.phone = 'Phone number is required';
    if (location === 'outside' && !form.district.trim()) e.district = 'District is required for outside Kigali';
    if (!form.street.trim()) e.street = 'Street address is required';
    if (paymentMethod === 'momo' && !form.momoNumber.trim()) e.momoNumber = 'MoMo number is required';
    return e;
  };

  const placeOrder = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }

    const items = cart.map((item) => ({
      product: item.product?._id || item._id,
      name: item.product?.name || item.name,
      price: item.product?.price || item.price,
      quantity: item.quantity,
    }));

    try {
      setPlacing(true);
      await orderAPI.createOrder({
        deliveryInfo: {
          ...form,
          district: location === 'kigali' ? 'Kigali' : form.district,
          paymentMethod,
          momoNumber: form.momoNumber,
        },
        items,
        totalAmount: total,
      });
      await clearCart();
      setShowMoMo(false);
      toast.success('Order placed successfully! 🚀');
      navigate('/dashboard/orders');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to place order');
    } finally {
      setPlacing(false);
    }
  };

  const handleProceed = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    if (paymentMethod === 'momo') setShowMoMo(true);
    else placeOrder();
  };

  if (cart.length === 0) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#05070a] px-4 pt-[160px] bg-mesh">
        <div className="bg-[#0a0d14] border border-white/5 p-16 rounded-[3rem] text-center max-w-lg w-full shadow-2xl">
          <FaShoppingBag size={48} className="text-slate-700 mx-auto mb-8" />
          <h3 className="text-3xl font-black text-white uppercase tracking-tighter mb-4">Cart is Empty</h3>
          <p className="text-slate-500 font-medium mb-10">Add items to your cart before proceeding to checkout.</p>
          <Link to="/products" className="btn-premium flex items-center justify-center gap-3 w-full">
            <FaArrowLeft size={13} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showMoMo && (
          <MoMoModal
            total={total}
            momoNumber={form.momoNumber}
            onClose={() => setShowMoMo(false)}
            onConfirm={placeOrder}
            confirming={placing}
          />
        )}
      </AnimatePresence>

      <div className="bg-bg-main min-h-screen pt-7 pb-20 bg-mesh">
        <div className="max-w-[1600px] mx-auto px-4 xl:px-8">
          
          {/* Breadcrumbs */}
          <nav className="flex items-center gap-3 text-[10px] font-black uppercase tracking-[0.2em] mb-12">
            <Link to="/" className="text-slate-500 hover:text-white transition-colors">Home</Link>
            <FaChevronRight size={8} className="text-slate-700" />
            <Link to="/cart" className="text-slate-500 hover:text-white transition-colors">Cart</Link>
            <FaChevronRight size={8} className="text-slate-700" />
            <span className="text-blue-400">Checkout</span>
          </nav>

          <form onSubmit={handleProceed} className="grid lg:grid-cols-3 gap-12">
            
            {/* LEFT COLUMN: FORMS */}
            <div className="lg:col-span-2 space-y-10">
              
              <div className="flex items-center justify-between">
                <h1 className="text-4xl font-black text-white uppercase tracking-tighter">Checkout</h1>
                <div className="flex items-center gap-3">
                  <span className="w-2.5 h-2.5 rounded-full bg-blue-600 animate-pulse" />
                  <span className="text-[10px] font-black text-blue-400 uppercase tracking-[0.2em]">Secure Session Active</span>
                </div>
              </div>

              {/* Delivery Zone */}
              <section className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 w-40 h-40 bg-blue-600/5 blur-[60px] rounded-full" />
                <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <FaTruck /> 01. Delivery Zone
                </h3>
                <div className="flex gap-4 flex-wrap">
                  {[
                    { id: 'kigali', label: 'Kigali City', sub: 'Same Day Delivery' },
                    { id: 'outside', label: 'Outside Kigali', sub: '1-2 Days Delivery' }
                  ].map((zone) => (
                    <button
                      key={zone.id}
                      type="button"
                      onClick={() => { 
                        setLocation(zone.id); 
                        setForm(prev => ({ ...prev, district: zone.id === 'kigali' ? 'Kigali' : '' }));
                        setErrors(prev => ({ ...prev, district: '' }));
                      }}
                      className={`flex-1 min-w-[200px] flex flex-col items-start p-6 rounded-2xl border-2 transition-all ${location === zone.id ? 'border-blue-600 bg-blue-600/5' : 'border-white/5 bg-[#05070a] hover:border-white/10'}`}
                    >
                      <div className="flex items-center justify-between w-full mb-3">
                        <span className="font-black text-white text-sm uppercase tracking-tight">{zone.label}</span>
                        <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center ${location === zone.id ? 'border-blue-600' : 'border-slate-700'}`}>
                          {location === zone.id && <div className="w-2.5 h-2.5 rounded-full bg-blue-600" />}
                        </div>
                      </div>
                      <span className="text-[10px] font-bold text-slate-500 uppercase tracking-widest">{zone.sub}</span>
                    </button>
                  ))}
                </div>
              </section>

              {/* Delivery Info */}
              <section className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
                <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <FaShoppingBag /> 02. Shipping Information
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                  <InputGroup label="Full Name" name="fullName" value={form.fullName} onChange={handleChange} error={errors.fullName} placeholder="Dodos Electro" />
                  <InputGroup label="Phone Number" name="phone" value={form.phone} onChange={handleChange} error={errors.phone} placeholder="078X XXX XXX" />
                  <InputGroup 
                    label="District" 
                    name="district" 
                    value={form.district} 
                    onChange={handleChange} 
                    disabled={location === 'kigali'} 
                    placeholder="e.g. Nyarugenge" 
                    error={errors.district}
                  />
                  <InputGroup label="Sector / Cell" name="sector" value={form.sector} onChange={handleChange} placeholder="e.g. Kimihurura" />
                  <div className="md:col-span-2">
                    <InputGroup label="Street Address / Building" name="street" value={form.street} onChange={handleChange} error={errors.street} placeholder="e.g. KN 2 St, Kigali Heights, Office 402" />
                  </div>
                </div>
              </section>

              {/* Payment Method */}
              <section className="bg-[#0a0d14] border border-white/5 rounded-[2.5rem] p-10 shadow-xl relative overflow-hidden">
                <h3 className="text-[11px] font-black text-blue-400 uppercase tracking-[0.3em] mb-8 flex items-center gap-3">
                  <FaShieldAlt /> 03. Secure Payment
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <PayCard value="momo" current={paymentMethod} onChange={setPaymentMethod} icon={FaMobileAlt} title="MoMo Pay" subtitle="MTN Mobile Money" badge="Popular" />
                  <PayCard value="cod" current={paymentMethod} onChange={setPaymentMethod} icon={FaMoneyBillWave} title="Cash" subtitle="Pay upon delivery" />
                  <PayCard value="bank" current={paymentMethod} onChange={setPaymentMethod} icon={FaUniversity} title="Bank Transfer" subtitle="Direct bank deposit" />
                </div>

                {paymentMethod === 'momo' && (
                  <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="mt-10 p-8 bg-yellow-500/5 border border-yellow-500/10 rounded-[2rem]">
                    <InputGroup label="Your MoMo Number" name="momoNumber" value={form.momoNumber} onChange={handleChange} error={errors.momoNumber} placeholder="078X XXX XXX" color="yellow" />
                    <p className="text-[10px] text-yellow-500/60 font-bold uppercase tracking-widest mt-4 flex items-center gap-2">
                      <FaLock /> You will receive a prompt on this number to confirm payment
                    </p>
                  </motion.div>
                )}
              </section>
            </div>

            {/* RIGHT COLUMN: ORDER SUMMARY */}
            <div className="lg:col-span-1">
              <div className="sticky top-[180px] bg-[#0a0d14] border border-white/5 rounded-[3rem] p-10 shadow-2xl relative overflow-hidden">
                <div className="absolute top-0 left-0 w-full h-1 bg-gradient-to-r from-blue-600 to-blue-400" />
                <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-10">Order Summary</h3>

                {/* Items List */}
                <div className="space-y-6 mb-10 max-h-60 overflow-y-auto custom-scrollbar pr-4 border-b border-white/5 pb-10">
                  {cart.map((item) => {
                    const prod = item.product || item;
                    return (
                      <div key={prod._id} className="flex gap-4 items-center">
                        <div className="w-14 h-14 bg-[#05070a] rounded-xl border border-white/5 p-2 flex-shrink-0">
                          <img src={prod.image} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-black text-white truncate uppercase tracking-tight">{prod.name}</p>
                          <p className="text-[10px] text-slate-500 font-bold mt-1 uppercase tracking-widest">{item.quantity} x {formatPrice(prod.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-6 mb-10 pb-10 border-b border-white/5">
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-black uppercase text-[11px] tracking-widest">Subtotal</span>
                    <span className="text-white font-black">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-slate-500 font-black uppercase text-[11px] tracking-widest">Delivery Fee</span>
                    <span className={`font-black ${deliveryFee === 0 ? 'text-green-500' : 'text-white'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-10">
                  <div>
                    <p className="text-[11px] font-black text-slate-500 uppercase tracking-widest">Grand Total</p>
                    <p className="text-3xl font-black text-white mt-2 tracking-tighter">{formatPrice(total)}</p>
                  </div>
                  <p className="text-[10px] font-black text-slate-700 uppercase tracking-widest mb-1">VAT Included</p>
                </div>

                <button
                  type="submit"
                  disabled={placing}
                  className="btn-premium w-full flex items-center justify-center gap-4 py-5 shadow-blue-500/30"
                >
                  {placing ? (
                    <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <>Confirm & Pay <FaChevronRight size={12} /></>
                  )}
                </button>

                <div className="mt-8 space-y-4">
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <FaShieldAlt className="text-blue-500" /> Secure SSL Encryption
                  </div>
                  <div className="flex items-center gap-3 text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">
                    <FaCheckCircle className="text-green-500" /> Official Dodos Warranty
                  </div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const InputGroup = ({ label, name, value, onChange, error, placeholder, disabled, color = 'blue' }) => (
  <div className="space-y-3">
    <label className={`text-[10px] font-black uppercase tracking-[0.2em] ml-1 ${color === 'yellow' ? 'text-yellow-500' : 'text-slate-500'}`}>
      {label}
    </label>
    <input
      type={name === 'phone' || name === 'momoNumber' ? 'tel' : 'text'}
      name={name}
      value={value}
      onChange={onChange}
      disabled={disabled}
      placeholder={placeholder}
      className={`w-full bg-[#05070a] border ${error ? 'border-red-500' : 'border-white/5'} rounded-2xl px-6 py-4 text-white text-sm font-medium outline-none focus:border-${color === 'yellow' ? 'yellow-500' : 'blue-600'}/50 transition-all disabled:opacity-40`}
    />
    {error && <p className="text-[9px] text-red-500 font-black uppercase tracking-widest ml-1">{error}</p>}
  </div>
);

export default Checkout;