import { useState } from 'react';
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

/* ── MoMo modal ── */
const MoMoModal = ({ total, momoNumber, onClose, onConfirm, confirming }) => {
  const { formatPrice } = useLocale();
  return (
    <div className="fixed inset-0 bg-black/50 backdrop-blur-sm z-[100] flex items-center justify-center p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        className="bg-white border border-gray-200 rounded-2xl shadow-2xl w-full max-w-md p-8 relative overflow-hidden"
      >
        <div className="absolute top-0 left-0 w-full h-1 bg-yellow-400" />
        <div className="flex items-center gap-4 mb-6">
          <div className="w-14 h-14 bg-yellow-50 rounded-xl flex items-center justify-center text-yellow-500 border border-yellow-100">
            <FaMobileAlt size={24} />
          </div>
          <div>
            <h3 className="text-lg font-black text-gray-900">MoMo Payment</h3>
            <p className="text-gray-400 text-xs font-semibold uppercase tracking-widest">Instant Confirmation</p>
          </div>
        </div>
        <div className="bg-yellow-50 border border-yellow-100 rounded-xl p-5 mb-6">
          <p className="text-xs font-black text-yellow-600 uppercase tracking-widest mb-3 flex items-center gap-2"><FaBolt size={10} /> Instructions</p>
          <ol className="space-y-2">
            {[
              'Dial *182*8*1*241480# on your phone',
              'Confirm Merchant: edissa',
              `Enter Amount: ${formatPrice(total)}`,
              'Enter PIN to confirm',
            ].map((step, i) => (
              <li key={i} className="flex gap-2 text-xs text-gray-600">
                <span className="text-yellow-500 font-black">{i + 1}.</span> {step}
              </li>
            ))}
          </ol>
        </div>
        <div className="flex items-center justify-between p-4 bg-gray-50 rounded-xl mb-6 border border-gray-100">
          <div className="text-center flex-1 border-r border-gray-200">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">Total</p>
            <p className="text-base font-black text-gray-900">{formatPrice(total)}</p>
          </div>
          <div className="text-center flex-1">
            <p className="text-[9px] font-bold text-gray-400 uppercase tracking-widest mb-1">MoMo Number</p>
            <p className="text-base font-black text-gray-900">{momoNumber || '---'}</p>
          </div>
        </div>
        <div className="flex gap-3">
          <button onClick={onClose} className="flex-1 py-3.5 rounded-xl text-sm font-bold text-gray-500 hover:bg-gray-50 border border-gray-200 transition-all">Cancel</button>
          <button onClick={onConfirm} disabled={confirming} className="flex-1 py-3.5 bg-yellow-400 hover:bg-yellow-500 text-gray-900 rounded-xl text-sm font-black transition-all flex items-center justify-center gap-2">
            {confirming ? <div className="w-4 h-4 border-2 border-gray-700 border-t-transparent rounded-full animate-spin" /> : <><FaCheckCircle size={13} /> I have Paid</>}
          </button>
        </div>
      </motion.div>
    </div>
  );
};

/* ── Payment card ── */
const PayCard = ({ value, current, onChange, icon: Icon, title, subtitle, badge }) => (
  <label className={`flex items-center gap-4 p-4 rounded-xl border-2 cursor-pointer transition-all ${current === value ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-200'}`}>
    <input type="radio" name="paymentMethod" value={value} className="hidden" checked={current === value} onChange={() => onChange(value)} />
    <div className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 transition-all ${current === value ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400'}`}>
      <Icon size={18} />
    </div>
    <div className="flex-grow">
      <div className="flex items-center gap-2">
        <p className="font-bold text-gray-800 text-sm">{title}</p>
        {badge && <span className="text-[9px] font-black px-2 py-0.5 rounded-lg bg-green-100 text-green-700 uppercase tracking-widest">{badge}</span>}
      </div>
      <p className="text-xs text-gray-400 font-semibold mt-0.5">{subtitle}</p>
    </div>
    <div className={`w-5 h-5 rounded-full border-2 flex items-center justify-center flex-shrink-0 transition-all ${current === value ? 'border-green-500' : 'border-gray-300'}`}>
      {current === value && <div className="w-2.5 h-2.5 rounded-full bg-green-500" />}
    </div>
  </label>
);

const Checkout = () => {
  const { cart, totalPrice, clearCart } = useCart();
  const { formatPrice } = useLocale();
  const navigate  = useNavigate();
  const locState  = useLocation().state || {};

  const [location, setLocation]       = useState(locState.location || 'kigali');
  const deliveryFee = location === 'kigali' ? 0 : 2000;
  const total       = totalPrice + deliveryFee;

  const [paymentMethod, setPaymentMethod] = useState('momo');
  const [showMoMo, setShowMoMo]           = useState(false);
  const [placing, setPlacing]             = useState(false);

  const [form, setForm]     = useState({ fullName: '', phone: '', momoNumber: '', district: location === 'kigali' ? 'Kigali' : '', sector: '', street: '' });
  const [errors, setErrors] = useState({});

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
    setErrors({ ...errors, [e.target.name]: '' });
  };

  const validate = () => {
    const e = {};
    if (!form.fullName.trim()) e.fullName = 'Full name is required';
    if (!form.phone.trim())    e.phone    = 'Phone number is required';
    if (location === 'outside' && !form.district.trim()) e.district = 'District is required';
    if (!form.street.trim())   e.street   = 'Street address is required';
    if (paymentMethod === 'momo' && !form.momoNumber.trim()) e.momoNumber = 'MoMo number is required';
    return e;
  };

  const placeOrder = async () => {
    const errs = validate();
    if (Object.keys(errs).length) { setErrors(errs); return; }
    const items = cart.map(item => ({
      product: item.product?._id || item._id,
      name:    item.product?.name || item.name,
      price:   item.product?.price || item.price,
      quantity: item.quantity,
    }));
    try {
      setPlacing(true);
      await orderAPI.createOrder({ deliveryInfo: { ...form, district: location === 'kigali' ? 'Kigali' : form.district, paymentMethod, momoNumber: form.momoNumber }, items, totalAmount: total });
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
      <div className="min-h-screen flex flex-col items-center justify-center bg-gray-50 px-4">
        <div className="bg-white border border-gray-200 rounded-2xl p-14 text-center max-w-md w-full shadow-sm">
          <FaShoppingBag size={40} className="text-gray-300 mx-auto mb-6" />
          <h3 className="text-2xl font-black text-gray-900 mb-3">Cart is Empty</h3>
          <p className="text-gray-500 text-sm mb-8">Add items to your cart before proceeding to checkout.</p>
          <Link to="/products" className="bg-green-500 hover:bg-green-600 text-white font-black py-3.5 px-8 rounded-xl transition-all flex items-center justify-center gap-2 text-sm">
            <FaArrowLeft size={12} /> Back to Shop
          </Link>
        </div>
      </div>
    );
  }

  return (
    <>
      <AnimatePresence>
        {showMoMo && <MoMoModal total={total} momoNumber={form.momoNumber} onClose={() => setShowMoMo(false)} onConfirm={placeOrder} confirming={placing} />}
      </AnimatePresence>

      <div className="bg-gray-50 min-h-screen pt-6 pb-16">
        <div className="max-w-[1600px] mx-auto px-3 sm:px-4 xl:px-8">

          {/* Breadcrumb */}
          <nav className="flex items-center gap-2 text-xs font-semibold text-gray-400 uppercase tracking-widest mb-6">
            <Link to="/" className="hover:text-green-600 transition-colors">Home</Link>
            <FaChevronRight size={8} />
            <Link to="/cart" className="hover:text-green-600 transition-colors">Cart</Link>
            <FaChevronRight size={8} />
            <span className="text-gray-700">Checkout</span>
          </nav>

          <form onSubmit={handleProceed} className="grid lg:grid-cols-3 gap-8">

            {/* ── LEFT ── */}
            <div className="lg:col-span-2 space-y-6">
              <div className="flex items-center justify-between">
                <h1 className="text-2xl font-black text-gray-900">Checkout</h1>
                <div className="flex items-center gap-2 text-xs font-semibold text-green-600">
                  <span className="w-2 h-2 rounded-full bg-green-500 animate-pulse" />
                  Secure Session
                </div>
              </div>

              {/* Delivery Zone */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-4 flex items-center gap-2"><FaTruck size={12} /> 01. Delivery Zone</h3>
                <div className="flex gap-3 flex-wrap">
                  {[
                    { id: 'kigali',  label: 'Kigali City',     sub: 'Same Day Delivery' },
                    { id: 'outside', label: 'Outside Kigali',  sub: '1-2 Days Delivery' },
                  ].map(zone => (
                    <button
                      key={zone.id} type="button"
                      onClick={() => { setLocation(zone.id); setForm(p => ({ ...p, district: zone.id === 'kigali' ? 'Kigali' : '' })); }}
                      className={`flex-1 min-w-[120px] sm:min-w-[160px] flex flex-col items-start p-3 sm:p-4 rounded-xl border-2 transition-all ${location === zone.id ? 'border-green-500 bg-green-50' : 'border-gray-200 bg-white hover:border-green-200'}`}
                    >
                      <div className="flex items-center justify-between w-full mb-1">
                        <span className="font-bold text-gray-800 text-sm">{zone.label}</span>
                        <div className={`w-4 h-4 rounded-full border-2 flex items-center justify-center ${location === zone.id ? 'border-green-500' : 'border-gray-300'}`}>
                          {location === zone.id && <div className="w-2 h-2 rounded-full bg-green-500" />}
                        </div>
                      </div>
                      <span className="text-xs text-gray-400 font-semibold">{zone.sub}</span>
                    </button>
                  ))}
                </div>
              </div>

              {/* Shipping Info */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2"><FaShoppingBag size={12} /> 02. Shipping Information</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <Field label="Full Name"              name="fullName"  value={form.fullName}  onChange={handleChange} error={errors.fullName}  placeholder="John Doe" />
                  <Field label="Phone Number"           name="phone"     value={form.phone}     onChange={handleChange} error={errors.phone}     placeholder="078X XXX XXX" type="tel" />
                  <Field label="District"               name="district"  value={form.district}  onChange={handleChange} error={errors.district}  placeholder="e.g. Nyarugenge" disabled={location === 'kigali'} />
                  <Field label="Sector / Cell"          name="sector"    value={form.sector}    onChange={handleChange} placeholder="e.g. Kimihurura" />
                  <div className="md:col-span-2">
                    <Field label="Street Address / Building" name="street" value={form.street} onChange={handleChange} error={errors.street} placeholder="e.g. KN 2 St, Kigali Heights" />
                  </div>
                </div>
              </div>

              {/* Payment */}
              <div className="bg-white border border-gray-200 rounded-xl p-6">
                <h3 className="text-xs font-black text-green-600 uppercase tracking-widest mb-5 flex items-center gap-2"><FaShieldAlt size={12} /> 03. Secure Payment</h3>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                  <PayCard value="momo" current={paymentMethod} onChange={setPaymentMethod} icon={FaMobileAlt}    title="MoMo Pay"       subtitle="MTN Mobile Money"  badge="Popular" />
                  <PayCard value="cod"  current={paymentMethod} onChange={setPaymentMethod} icon={FaMoneyBillWave} title="Cash"          subtitle="Pay upon delivery" />
                  <PayCard value="bank" current={paymentMethod} onChange={setPaymentMethod} icon={FaUniversity}   title="Bank Transfer"  subtitle="Direct bank deposit" />
                </div>
                {paymentMethod === 'momo' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="mt-5 p-5 bg-yellow-50 border border-yellow-100 rounded-xl">
                    <Field label="Your MoMo Number" name="momoNumber" value={form.momoNumber} onChange={handleChange} error={errors.momoNumber} placeholder="078X XXX XXX" type="tel" />
                    <p className="text-xs text-yellow-600 font-semibold mt-3 flex items-center gap-1.5"><FaLock size={10} /> You will receive a prompt to confirm payment</p>
                  </motion.div>
                )}
              </div>
            </div>

            {/* ── ORDER SUMMARY ── */}
            <div className="lg:col-span-1">
              <div className="sticky top-[180px] bg-white border border-gray-200 rounded-xl p-6 shadow-sm">
                <div className="w-full h-1 bg-green-500 rounded-full mb-5" />
                <h3 className="text-base font-black text-gray-900 mb-5">Order Summary</h3>

                <div className="space-y-3 mb-5 max-h-52 overflow-y-auto custom-scrollbar pr-1">
                  {cart.map(item => {
                    const prod = item.product || item;
                    return (
                      <div key={prod._id} className="flex gap-3 items-center">
                        <div className="w-12 h-12 bg-gray-50 rounded-lg border border-gray-100 p-1.5 flex-shrink-0">
                          <img src={prod.image} alt="" className="w-full h-full object-contain" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-bold text-gray-800 truncate">{prod.name}</p>
                          <p className="text-[10px] text-gray-400 mt-0.5">{item.quantity} × {formatPrice(prod.price)}</p>
                        </div>
                      </div>
                    );
                  })}
                </div>

                <div className="space-y-3 mb-5 pb-5 border-b border-gray-100 text-sm">
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Subtotal</span>
                    <span className="font-black text-gray-900">{formatPrice(totalPrice)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-gray-500 font-semibold">Delivery</span>
                    <span className={`font-black ${deliveryFee === 0 ? 'text-green-600' : 'text-gray-900'}`}>
                      {deliveryFee === 0 ? 'FREE' : formatPrice(deliveryFee)}
                    </span>
                  </div>
                </div>

                <div className="flex justify-between items-end mb-5">
                  <div>
                    <p className="text-xs text-gray-400 uppercase tracking-widest font-semibold">Grand Total</p>
                    <p className="text-2xl font-black text-gray-900 mt-1">{formatPrice(total)}</p>
                  </div>
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest">VAT Incl.</p>
                </div>

                <button
                  type="submit" disabled={placing}
                  className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl flex items-center justify-center gap-2 text-sm transition-all shadow-sm shadow-green-500/20 disabled:opacity-60"
                >
                  {placing
                    ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                    : <>Confirm & Pay <FaChevronRight size={11} /></>
                  }
                </button>

                <div className="mt-4 space-y-2">
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold"><FaShieldAlt className="text-green-500" size={11} /> Secure SSL Encryption</div>
                  <div className="flex items-center gap-2 text-xs text-gray-400 font-semibold"><FaCheckCircle className="text-green-500" size={11} /> Official Dodos Warranty</div>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </>
  );
};

const Field = ({ label, name, value, onChange, error, placeholder, disabled, type = 'text' }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
    <input
      type={type} name={name} value={value} onChange={onChange} disabled={disabled} placeholder={placeholder}
      className={`w-full bg-gray-50 border ${error ? 'border-red-400' : 'border-gray-200'} rounded-xl px-4 py-3 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all disabled:opacity-40`}
    />
    {error && <p className="text-[10px] text-red-500 font-semibold mt-1">{error}</p>}
  </div>
);

export default Checkout;
