import { useState } from 'react';
import { useParams, useNavigate, Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaLock, FaArrowLeft, FaCheckCircle, FaBolt, FaArrowRight, FaEye, FaEyeSlash } from 'react-icons/fa';
import { authAPI } from '../services/api';
import { toast } from 'react-toastify';
import { useAuth } from '../context/AuthContext';

const ResetPassword = () => {
  const { resetToken } = useParams();
  const navigate = useNavigate();
  const { settings } = useAuth();
  
  const [form, setForm] = useState({ password: '', confirmPassword: '' });
  const [loading, setLoading] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const storeName = settings?.general?.storeName || 'DODOS';
  const logoUrl = settings?.general?.logoUrl;

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (form.password !== form.confirmPassword) {
      return toast.error('Passwords do not match');
    }
    if (form.password.length < 6) {
      return toast.error('Password must be at least 6 characters');
    }

    setLoading(true);
    try {
      await authAPI.resetPassword(resetToken, { password: form.password });
      toast.success('Password reset successful! Please login.');
      navigate('/login');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Failed to reset password');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-[#05070a] p-6 bg-mesh">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg"
      >
        <div className="flex flex-col items-center mb-10">
          <Link to="/" className="flex flex-col items-center group">
            <div className="w-16 h-16 bg-blue-600 rounded-[2rem] flex items-center justify-center shadow-2xl shadow-blue-500/20 group-hover:rotate-12 transition-all overflow-hidden mb-4">
              {logoUrl ? (
                <img src={logoUrl} alt={storeName} className="w-full h-full object-contain p-2" />
              ) : (
                <FaBolt className="text-white text-3xl" />
              )}
            </div>
            <h1 className="text-2xl font-black text-white uppercase tracking-tighter">{storeName}</h1>
            <p className="text-blue-500 text-[10px] font-black uppercase tracking-[0.3em] mt-1">Security Center</p>
          </Link>
        </div>

        <div className="bg-[#0a0d14] border border-white/5 rounded-[3rem] p-10 md:p-14 shadow-2xl relative overflow-hidden">
          <div className="absolute top-0 right-0 w-32 h-32 bg-blue-600/10 blur-[60px] rounded-full" />
          
          <h2 className="text-3xl font-black text-white mb-4 tracking-tighter leading-tight">Reset Password</h2>
          <p className="text-slate-400 text-sm font-medium mb-10 leading-relaxed">
            Please enter your new password below. Make sure it's strong and unique.
          </p>

          <form onSubmit={handleSubmit} className="space-y-6">
            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">New Password</label>
              <div className="relative group">
                <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.password}
                  onChange={(e) => setForm({...form, password: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                />
                <button 
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-5 top-1/2 -translate-y-1/2 text-slate-500 hover:text-white transition-colors"
                >
                  {showPassword ? <FaEyeSlash size={14} /> : <FaEye size={14} />}
                </button>
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Confirm New Password</label>
              <div className="relative group">
                <FaLock className="absolute left-5 top-1/2 -translate-y-1/2 text-slate-500 group-focus-within:text-blue-500 transition-colors" size={14} />
                <input 
                  type={showPassword ? "text" : "password"}
                  required
                  value={form.confirmPassword}
                  onChange={(e) => setForm({...form, confirmPassword: e.target.value})}
                  placeholder="••••••••"
                  className="w-full bg-white/5 border border-white/5 rounded-2xl py-4 pl-12 pr-12 text-sm font-bold text-white outline-none focus:border-blue-500/50 transition-all placeholder:text-slate-700"
                />
              </div>
            </div>

            <button 
              type="submit" 
              disabled={loading}
              className="w-full py-4 bg-blue-600 hover:bg-blue-700 text-white rounded-2xl font-black uppercase text-xs tracking-[0.2em] shadow-xl shadow-blue-600/20 transition-all flex items-center justify-center gap-3 active:scale-[0.98] disabled:opacity-50"
            >
              {loading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>Update Password <FaArrowRight size={12} /></>
              )}
            </button>
          </form>

          <div className="mt-12 pt-8 border-t border-white/5 flex justify-center">
            <Link to="/login" className="flex items-center gap-2 text-slate-500 hover:text-white transition-colors text-[10px] font-black uppercase tracking-widest">
              <FaArrowLeft size={10} /> Back to Sign In
            </Link>
          </div>
        </div>

        <p className="text-center mt-10 text-[10px] font-bold text-slate-700 uppercase tracking-widest">
          &copy; {new Date().getFullYear()} {storeName}. All Rights Reserved.
        </p>
      </motion.div>
    </div>
  );
};

export default ResetPassword;
