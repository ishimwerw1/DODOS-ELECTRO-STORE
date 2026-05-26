import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock,
  FaArrowRight, FaCheckCircle, FaTruck, FaTag,
  FaSearch, FaChevronDown, FaBolt, FaShieldAlt, FaPhone
} from 'react-icons/fa';

const COUNTRIES = [
  { code: 'RW', name: 'Rwanda', dial: '+250', flag: '🇷🇼' },
  { code: 'UG', name: 'Uganda', dial: '+256', flag: '🇺🇬' },
  { code: 'KE', name: 'Kenya', dial: '+254', flag: '🇰🇪' },
  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { code: 'US', name: 'USA', dial: '+1', flag: '🇺🇸' },
];

const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const PhoneInput = ({ value, onChange }) => {
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const [open, setOpen] = useState(false);
  const wrapRef = useRef(null);

  useEffect(() => {
    const handler = (e) => { if (wrapRef.current && !wrapRef.current.contains(e.target)) setOpen(false); };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

  const handleNumberChange = (e) => {
    const digits = e.target.value.replace(/[^\d\s\-]/g, '');
    onChange(`${selected.dial} ${digits}`);
  };

  const numberOnly = value.replace(/^\+\d+\s?/, '');

  return (
    <div ref={wrapRef} className="relative group">
      <div className="flex bg-[#0a0d14] border border-white/5 rounded-2xl overflow-hidden focus-within:border-blue-500/50 transition-all">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-4 bg-white/5 border-r border-white/5 hover:bg-white/10 transition-all min-w-[100px]"
        >
          <span className="text-lg">{selected.flag}</span>
          <span className="text-xs font-black text-white">{selected.dial}</span>
          <FaChevronDown size={8} className={`text-slate-600 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <input
          type="tel"
          value={numberOnly}
          onChange={handleNumberChange}
          placeholder="7XX XXX XXX"
          className="flex-1 px-6 py-4 text-sm font-medium text-white bg-transparent outline-none"
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 10 }}
            className="absolute top-full left-0 right-0 mt-2 bg-[#0a0d14] border border-white/10 rounded-2xl shadow-2xl z-50 max-h-48 overflow-y-auto custom-scrollbar"
          >
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setSelected(c); setOpen(false); onChange(`${c.dial} ${numberOnly}`); }}
                className="w-full flex items-center gap-4 px-5 py-3 text-xs font-black uppercase tracking-widest text-slate-400 hover:bg-white/5 hover:text-white transition-all"
              >
                <span>{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-blue-400">{c.dial}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Register = () => {
  const [form, setForm] = useState({ fullName: '', email: '', phone: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [verificationCode, setVerificationCode] = useState('');
  const [verifying, setVerifying] = useState(false);
  const navigate = useNavigate();
  const { register, loginWithGoogle, verifyEmail, resendVerification, settings } = useAuth();

  const storeName = settings?.general?.storeName || 'DODOS';
  const logoUrl = settings?.general?.logoUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please verify your email. 📧');
      // Navigation is handled by VerificationGuard automatically since user is now logged in
    } catch (err) {
      toast.error(err.response?.data?.message || 'Registration failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      await loginWithGoogle(tokenResponse.access_token);
      toast.success('Account created with Google!');
      navigate('/');
    } catch {
      toast.error('Google sign-up failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-up failed'),
  });

  return (
    <div className="min-h-screen w-full flex bg-[#05070a] overflow-hidden">
      
      {/* LEFT PANEL */}
      <motion.div 
        initial={{ x: -100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-20 relative overflow-hidden bg-[#0a0d14] border-r border-white/5"
      >
        <div className="absolute top-0 left-0 w-full h-full bg-blue-600/5 blur-[120px] rounded-full" />
        <Link to="/" className="relative z-10 flex items-center gap-4 group">
          <div className="w-12 h-12 bg-blue-600 rounded-2xl flex items-center justify-center shadow-lg shadow-blue-500/20 group-hover:rotate-12 transition-all overflow-hidden">
            {logoUrl ? (
              <img src={logoUrl} alt={storeName} className="w-full h-full object-cover" />
            ) : (
              <FaBolt className="text-white text-xl animate-pulse" />
            )}
          </div>
          <div>
            <p className="font-black text-2xl text-white tracking-tighter uppercase">{storeName}</p>
            <p className="text-[10px] font-black text-blue-400 tracking-[0.3em] uppercase">Electro Store</p>
          </div>
        </Link>

        <div className="relative z-10 max-w-lg">
          <h2 className="text-6xl font-black text-white leading-[1.1] tracking-tighter mb-8">
            Unlock the <br />
            <span className="text-gradient-blue">Premium</span> Store.
          </h2>
          <div className="space-y-6">
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400"><FaTruck /></div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Free Express Shipping</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400"><FaShieldAlt /></div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Official Local Warranty</p>
            </div>
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-blue-600/10 flex items-center justify-center text-blue-400"><FaTag /></div>
              <p className="text-slate-400 font-black uppercase text-xs tracking-widest">Exclusive Member Deals</p>
            </div>
          </div>
        </div>

        <p className="relative z-10 text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">© {new Date().getFullYear()} DODOS ELECTRO STORE LTD</p>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#05070a] bg-mesh relative overflow-y-auto"
      >
        <div className="w-full max-w-md my-10">
          <div className="mb-10 text-center lg:text-left">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Create Account</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              Have an account? <Link to="/login" className="text-blue-400 hover:text-white transition-colors">Sign In</Link>
            </p>
          </div>

          <button
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 transition-all mb-8 shadow-xl"
          >
            {googleLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <GoogleIcon />}
            Sign up with Google
          </button>

          <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-6">
            <InputGroup label="Full Name" icon={FaUser} name="fullName" value={form.fullName} onChange={(v) => setForm({...form, fullName: v})} placeholder="Dodos Electro" />
            <InputGroup label="Email Address" icon={FaEnvelope} name="email" value={form.email} onChange={(v) => setForm({...form, email: v})} placeholder="name@company.com" />
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Phone Number</label>
              <PhoneInput value={form.phone} onChange={(v) => setForm({...form, phone: v})} />
            </div>
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Password</label>
              <div className="relative group">
                <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-14 pr-14 text-white text-sm font-medium outline-none focus:border-blue-500/50 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors">
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button type="submit" disabled={loading} className="btn-premium py-5 mt-4">
              {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : <>Create Account <FaArrowRight size={14} className="ml-2 inline" /></>}
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const InputGroup = ({ label, icon: Icon, name, value, onChange, placeholder }) => (
  <div className="space-y-3">
    <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">{label}</label>
    <div className="relative group">
      <Icon className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
      <input
        type={name === 'email' ? 'email' : 'text'} required
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium outline-none focus:border-blue-500/50 transition-all"
      />
    </div>
  </div>
);

export default Register;