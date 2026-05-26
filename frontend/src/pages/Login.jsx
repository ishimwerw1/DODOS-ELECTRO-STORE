import { useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';
import { useGoogleLogin } from '@react-oauth/google';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaEye, FaEyeSlash, FaEnvelope, FaLock,
  FaArrowRight, FaShieldAlt, FaBolt, FaHeadset, FaCheckCircle
} from 'react-icons/fa';

/* ── Feature bullet ── */
const Feature = ({ icon: Icon, text }) => (
  <div className="flex items-center gap-4 group">
    <div className="w-10 h-10 rounded-2xl bg-blue-600/10 border border-blue-500/20 flex items-center justify-center flex-shrink-0 group-hover:bg-blue-600 group-hover:text-white transition-all duration-500">
      <Icon size={14} className="text-blue-400 group-hover:text-white transition-colors" />
    </div>
    <span className="text-slate-400 text-sm font-bold uppercase tracking-widest">{text}</span>
  </div>
);

/* ── Google logo SVG ── */
const GoogleIcon = () => (
  <svg width="20" height="20" viewBox="0 0 48 48">
    <path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/>
    <path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/>
    <path fill="#FBBC05" d="M10.53 28.59c-.48-1.45-.76-2.99-.76-4.59s.27-3.14.76-4.59l-7.98-6.19C.92 16.46 0 20.12 0 24c0 3.88.92 7.54 2.56 10.78l7.97-6.19z"/>
    <path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.18 1.48-4.97 2.31-8.16 2.31-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/>
  </svg>
);

const Login = ({ onSuccess }) => {
  const [form, setForm] = useState({ email: '', password: '' });
  const [loading, setLoading] = useState(false);
  const [googleLoading, setGoogleLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();
  const { login, loginWithGoogle, settings } = useAuth();
  const from = location.state?.from || '/';

  const storeName = settings?.general?.storeName || 'DODOS';
  const logoUrl = settings?.general?.logoUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = await login(form);
      toast.success('Welcome back to DODOS!');
      const isAdmin = data.user?.role === 'admin';
      if (onSuccess) onSuccess();
      else navigate(isAdmin ? '/admin' : from, { replace: true });
    } catch (err) {
      toast.error(err.response?.data?.message || 'Login failed');
    } finally {
      setLoading(false);
    }
  };

  const handleGoogleSuccess = async (tokenResponse) => {
    setGoogleLoading(true);
    try {
      const data = await loginWithGoogle(tokenResponse.access_token);
      toast.success('Signed in with Google!');
      const isAdmin = data.user?.role === 'admin';
      if (onSuccess) onSuccess();
      else navigate(isAdmin ? '/admin' : from, { replace: true });
    } catch {
      toast.error('Google sign-in failed');
    } finally {
      setGoogleLoading(false);
    }
  };

  const googleLogin = useGoogleLogin({
    onSuccess: handleGoogleSuccess,
    onError: () => toast.error('Google sign-in failed'),
  });

  return (
    <div className="min-h-screen w-full flex bg-[#05070a] overflow-hidden">
      
      {/* LEFT PANEL: HERO */}
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
          <div className="inline-flex items-center gap-3 bg-blue-600/10 border border-blue-500/20 rounded-full px-4 py-2 mb-10">
            <span className="w-2 h-2 rounded-full bg-blue-400 animate-pulse" />
            <span className="text-[10px] font-black text-blue-400 uppercase tracking-widest">Premium Access</span>
          </div>
          <h2 className="text-6xl xl:text-7xl font-black text-white leading-[1.1] tracking-tighter mb-8">
            The Hub of <br />
            <span className="text-gradient-blue">Innovation.</span>
          </h2>
          <p className="text-slate-500 text-lg font-medium mb-12 max-w-md leading-relaxed">
            Experience the future of phone accessories and professional repair tools in Rwanda.
          </p>
          <div className="space-y-6">
            <Feature icon={FaShieldAlt} text="Military Grade Security" />
            <Feature icon={FaBolt} text="Lightning Fast Orders" />
            <Feature icon={FaHeadset} text="24/7 Expert Support" />
          </div>
        </div>

        <p className="relative z-10 text-slate-700 text-[10px] font-black uppercase tracking-[0.3em]">
          © {new Date().getFullYear()} DODOS ELECTRO STORE LTD · Kigali, Rwanda
        </p>
      </motion.div>

      {/* RIGHT PANEL: FORM */}
      <motion.div 
        initial={{ x: 100, opacity: 0 }}
        animate={{ x: 0, opacity: 1 }}
        className="w-full lg:w-1/2 flex flex-col justify-center items-center p-8 bg-[#05070a] bg-mesh relative"
      >
        <div className="w-full max-w-md">
          <div className="mb-12">
            <h1 className="text-4xl font-black text-white uppercase tracking-tighter mb-4">Sign In</h1>
            <p className="text-slate-500 font-bold uppercase tracking-widest text-xs">
              New to Dodos?{' '}
              <Link to="/register" className="text-blue-400 hover:text-white transition-colors">
                Create Account Free
              </Link>
            </p>
          </div>

          <button
            onClick={() => googleLogin()}
            disabled={googleLoading}
            className="w-full flex items-center justify-center gap-4 py-4 bg-white/5 border border-white/5 rounded-2xl text-xs font-black uppercase tracking-widest text-white hover:bg-white/10 hover:border-white/10 transition-all mb-8 shadow-xl"
          >
            {googleLoading ? <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" /> : <GoogleIcon />}
            Continue with Google
          </button>

          <div className="flex items-center gap-4 mb-8 opacity-20">
            <div className="flex-1 h-px bg-white" />
            <span className="text-[10px] font-black text-white uppercase tracking-widest">OR</span>
            <div className="flex-1 h-px bg-white" />
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-3">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Email Address</label>
              <div className="relative group">
                <FaEnvelope className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type="email" required
                  value={form.email}
                  onChange={(e) => setForm({ ...form, email: e.target.value })}
                  placeholder="name@company.com"
                  className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-14 pr-6 text-white text-sm font-medium outline-none focus:border-blue-500/50 focus:bg-[#0a0d14] transition-all"
                />
              </div>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between ml-1">
                <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em]">Password</label>
                <Link to="/forgot-password" size="sm" className="text-[10px] font-black text-blue-500 uppercase tracking-widest hover:text-white transition-colors">Forgot?</Link>
              </div>
              <div className="relative group">
                <FaLock className="absolute left-6 top-1/2 -translate-y-1/2 text-slate-600 group-focus-within:text-blue-500 transition-colors" />
                <input
                  type={showPassword ? 'text' : 'password'} required
                  value={form.password}
                  onChange={(e) => setForm({ ...form, password: e.target.value })}
                  placeholder="••••••••"
                  className="w-full bg-[#0a0d14] border border-white/5 rounded-2xl py-4 pl-14 pr-14 text-white text-sm font-medium outline-none focus:border-blue-500/50 focus:bg-[#0a0d14] transition-all"
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-6 top-1/2 -translate-y-1/2 text-slate-600 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={16} /> : <FaEye size={16} />}
                </button>
              </div>
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full btn-premium py-5 mt-4"
            >
              {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : <>Sign In <FaArrowRight size={14} className="ml-2 inline" /></>}
            </button>
          </form>

          <div className="mt-12 flex items-center justify-center gap-8 border-t border-white/5 pt-10">
            <Link to="/products" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all">Shop Now</Link>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <Link to="/contact" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all">Support</Link>
            <div className="w-1 h-1 rounded-full bg-slate-800" />
            <Link to="/about" className="text-[10px] font-black text-slate-600 hover:text-white uppercase tracking-widest transition-all">Privacy</Link>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Login;