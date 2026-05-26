import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { FaEnvelope, FaSignOutAlt } from 'react-icons/fa';
import { useAuth } from '../context/AuthContext';
import { toast } from 'react-toastify';

const VerificationGuard = ({ children }) => {
  const { user, isLoggedIn, verifyEmail, resendVerification, logout } = useAuth();
  const [code, setCode] = useState('');
  const [loading, setLoading] = useState(false);

  // If not logged in, or logged in and verified, or admin, allow through
  if (!isLoggedIn || !user || user.isVerified || user.role === 'admin') {
    return children;
  }

  const handleVerify = async (e) => {
    e.preventDefault();
    if (!code) return;
    setLoading(true);
    try {
      await verifyEmail(code);
      toast.success('Email verified successfully! 🎉');
    } catch (err) {
      toast.error(err.response?.data?.message || 'Verification failed');
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    try {
      await resendVerification();
      toast.success('New code sent to your email!');
    } catch (err) {
      toast.error('Failed to resend code');
    }
  };

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-[#05070a] backdrop-blur-xl">
      <motion.div 
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        className="bg-[#0a0d14] border border-white/5 rounded-[3rem] p-10 max-w-md w-full shadow-2xl relative"
      >
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-blue-600/10 rounded-full flex items-center justify-center mx-auto mb-6 text-blue-400">
            <FaEnvelope size={32} />
          </div>
          <h2 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">Verify Your Account</h2>
          <p className="text-slate-500 text-xs font-bold uppercase tracking-widest leading-relaxed">
            Please enter the 6-digit code sent to <br />
            <span className="text-blue-400">{user.email}</span>
          </p>
        </div>

        <form onSubmit={handleVerify} className="space-y-6">
          <div className="space-y-3">
            <label className="text-[10px] font-black text-slate-500 uppercase tracking-[0.2em] ml-1">Verification Code</label>
            <input
              type="text" required maxLength="6"
              value={code}
              onChange={(e) => setCode(e.target.value)}
              placeholder="Enter 6-digit code"
              className="w-full bg-[#05070a] border border-white/5 rounded-2xl py-5 text-center text-2xl font-black tracking-[0.5em] text-white outline-none focus:border-blue-500/50 transition-all"
            />
          </div>

          <button type="submit" disabled={loading} className="btn-premium w-full py-5">
            {loading ? <div className="w-5 h-5 border-3 border-white border-t-transparent rounded-full animate-spin mx-auto" /> : 'Verify Account'}
          </button>
        </form>

        <div className="mt-8 flex flex-col gap-4 text-center">
          <button onClick={handleResend} className="text-[10px] font-black text-slate-500 hover:text-white uppercase tracking-[0.2em] transition-colors">
            Didn't receive code? Resend
          </button>
          
          <button 
            onClick={logout}
            className="flex items-center justify-center gap-2 text-[10px] font-black text-red-500/50 hover:text-red-500 uppercase tracking-[0.2em] transition-colors"
          >
            <FaSignOutAlt /> Logout and try again
          </button>
        </div>
      </motion.div>
    </div>
  );
};

export default VerificationGuard;