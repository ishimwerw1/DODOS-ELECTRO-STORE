import { useState, useRef, useEffect } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEye, FaEyeSlash, FaUser, FaEnvelope, FaLock,
  FaArrowRight, FaTruck, FaTag, FaChevronDown, FaBolt, FaShieldAlt
} from 'react-icons/fa';

const COUNTRIES = [
  { code: 'RW', name: 'Rwanda',   dial: '+250', flag: '🇷🇼' },
  { code: 'UG', name: 'Uganda',   dial: '+256', flag: '🇺🇬' },
  { code: 'KE', name: 'Kenya',    dial: '+254', flag: '🇰🇪' },
  { code: 'TZ', name: 'Tanzania', dial: '+255', flag: '🇹🇿' },
  { code: 'US', name: 'USA',      dial: '+1',   flag: '🇺🇸' },
];

const GoogleIcon = () => (
  <svg width="18" height="18" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const PhoneInput = ({ value, onChange }) => {
  const [selected, setSelected] = useState(COUNTRIES[0]);
  const [open, setOpen]         = useState(false);
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
    <div ref={wrapRef} className="relative">
      <div className="flex bg-gray-50 border border-gray-200 rounded-xl overflow-hidden focus-within:border-green-500 focus-within:ring-2 focus-within:ring-green-500/10 transition-all">
        <button
          type="button"
          onClick={() => setOpen(!open)}
          className="flex items-center gap-2 px-3 bg-gray-100 border-r border-gray-200 hover:bg-gray-200 transition-all min-w-[90px]"
        >
          <span className="text-base">{selected.flag}</span>
          <span className="text-xs font-bold text-gray-700">{selected.dial}</span>
          <FaChevronDown size={8} className={`text-gray-400 transition-transform ${open ? 'rotate-180' : ''}`} />
        </button>
        <input
          type="tel"
          value={numberOnly}
          onChange={handleNumberChange}
          placeholder="7XX XXX XXX"
          className="flex-1 px-4 py-3.5 text-sm text-gray-800 bg-transparent outline-none"
        />
      </div>
      <AnimatePresence>
        {open && (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 8 }}
            className="absolute top-full left-0 right-0 mt-1 bg-white border border-gray-200 rounded-xl shadow-xl z-50 overflow-hidden"
          >
            {COUNTRIES.map((c) => (
              <button
                key={c.code}
                type="button"
                onClick={() => { setSelected(c); setOpen(false); onChange(`${c.dial} ${numberOnly}`); }}
                className="w-full flex items-center gap-3 px-4 py-2.5 text-xs font-semibold text-gray-600 hover:bg-gray-50 hover:text-gray-900 transition-all"
              >
                <span>{c.flag}</span>
                <span className="flex-1 text-left">{c.name}</span>
                <span className="text-green-600 font-bold">{c.dial}</span>
              </button>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};

const Register = () => {
  const [form, setForm]               = useState({ fullName: '', email: '', phone: '', password: '' });
  const [loading, setLoading]         = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword]   = useState(false);
  const navigate = useNavigate();
  const { register, loginWithGoogle, settings } = useAuth();

  const storeName = settings?.general?.storeName || 'DODOS';
  const logoUrl   = settings?.general?.logoUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      await register(form);
      toast.success('Account created! Please verify your email. 📧');
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
    <div className="min-h-screen w-full flex bg-gray-50 overflow-hidden">

      {/* LEFT PANEL */}
      <motion.div
        initial={{ x: -60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="hidden lg:flex w-1/2 flex-col justify-between p-16 bg-gray-900 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-green-900/20 to-transparent pointer-events-none" />

        <Link to="/" className="relative z-10 flex items-center gap-3">
          <div className="w-11 h-11 bg-green-500 rounded-xl flex items-center justify-center overflow-hidden shadow-lg">
            {logoUrl ? <img src={logoUrl} alt={storeName} className="w-full h-full object-contain p-1" /> : <FaBolt className="text-white text-lg" />}
          </div>
          <div>
            <p className="font-black text-xl text-white tracking-tight uppercase">{storeName}</p>
            <p className="text-[10px] font-bold text-green-400 tracking-[0.3em] uppercase">Electro Store</p>
          </div>
        </Link>

        <div className="relative z-10 max-w-md">
          <h2 className="text-5xl font-black text-white leading-tight tracking-tight mb-6">
            Join the <span className="text-green-400">DODOS</span> <br />Community.
          </h2>
          <p className="text-gray-400 text-base mb-10 leading-relaxed">
            Create your free account and get access to exclusive deals, fast delivery, and expert support.
          </p>
          <div className="space-y-4">
            {[
              { icon: FaTruck,    text: 'Free Express Shipping' },
              { icon: FaShieldAlt,text: 'Official Local Warranty' },
              { icon: FaTag,      text: 'Exclusive Member Deals' },
            ].map((f, i) => (
              <div key={i} className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-green-500/10 border border-green-500/20 flex items-center justify-center flex-shrink-0">
                  <f.icon size={13} className="text-green-400" />
                </div>
                <span className="text-gray-400 text-sm font-semibold">{f.text}</span>
              </div>
            ))}
          </div>
        </div>

        <p className="relative z-10 text-gray-600 text-[10px] font-semibold uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} DODOS ELECTRO STORE LTD
        </p>
      </motion.div>

      {/* RIGHT PANEL */}
      <motion.div
        initial={{ x: 60, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-white overflow-y-auto"
      >
        <div className="w-full max-w-md my-8">
          <div className="mb-7">
            <h1 className="text-3xl font-black text-gray-900 tracking-tight mb-2">Create Account</h1>
            <p className="text-gray-500 text-sm">
              Already have an account?{' '}
              <Link to="/login" className="text-green-600 font-bold hover:text-green-700 transition-colors">Sign In</Link>
            </p>
          </div>

          {/* Google */}
          <button
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-3 py-3.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold text-gray-700 hover:bg-gray-50 hover:border-gray-300 transition-all mb-5 shadow-sm"
          >
            {googleLoading ? <div className="w-4 h-4 border-2 border-gray-300 border-t-gray-600 rounded-full animate-spin" /> : <GoogleIcon />}
            Sign up with Google
          </button>

          <div className="flex items-center gap-3 mb-5">
            <div className="flex-1 h-px bg-gray-200" />
            <span className="text-xs font-semibold text-gray-400 uppercase tracking-widest">or</span>
            <div className="flex-1 h-px bg-gray-200" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            <Field label="Full Name"      icon={FaUser}     name="fullName" value={form.fullName} onChange={v => setForm({ ...form, fullName: v })} placeholder="John Doe" />
            <Field label="Email Address"  icon={FaEnvelope} name="email"    value={form.email}    onChange={v => setForm({ ...form, email: v })}    placeholder="name@company.com" />

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Phone Number</label>
              <PhoneInput value={form.phone} onChange={v => setForm({ ...form, phone: v })} />
            </div>

            <div>
              <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">Password</label>
              <div className="relative">
                <FaLock className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password}
                  onChange={e => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-12 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
                />
                <button type="button" onClick={() => setShowPassword(!showPassword)} className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors">
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <button
              type="submit" disabled={loading}
              className="w-full bg-green-500 hover:bg-green-600 text-white font-black py-4 rounded-xl transition-all flex items-center justify-center gap-2 text-sm shadow-sm shadow-green-500/20 disabled:opacity-60 mt-2"
            >
              {loading
                ? <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin" />
                : <>Create Account <FaArrowRight size={13} /></>
              }
            </button>
          </form>
        </div>
      </motion.div>
    </div>
  );
};

const Field = ({ label, icon: Icon, name, value, onChange, placeholder }) => (
  <div>
    <label className="block text-xs font-bold text-gray-600 mb-1.5 uppercase tracking-wider">{label}</label>
    <div className="relative">
      <Icon className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400" size={13} />
      <input
        type={name === 'email' ? 'email' : 'text'} required
        value={value}
        onChange={e => onChange(e.target.value)}
        placeholder={placeholder}
        className="w-full bg-gray-50 border border-gray-200 rounded-xl py-3.5 pl-11 pr-4 text-sm text-gray-800 outline-none focus:border-green-500 focus:ring-2 focus:ring-green-500/10 transition-all"
      />
    </div>
  </div>
);

export default Register;
