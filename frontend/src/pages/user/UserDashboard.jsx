import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  FaShoppingBag, FaClock, FaCheckCircle,
  FaArrowRight, FaHeart, FaTruck, FaBoxOpen,
} from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, color, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 16 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="glass neon-border rounded-2xl p-5 flex items-center gap-4 hover:border-blue-500/30 transition-all"
  >
    <div className={`w-12 h-12 rounded-xl ${color} flex items-center justify-center shadow-lg flex-shrink-0`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-slate-400 text-xs font-medium uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-white mt-0.5">{value}</h3>
    </div>
  </motion.div>
);

const UserDashboard = () => {
  const { user } = useAuth();
  const { formatPrice } = useLocale();
  const [data,    setData]    = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getDashboard()
      .then((res) => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { title: 'Total Orders',  value: data?.summary?.totalOrders     || 0, icon: FaShoppingBag,  color: 'bg-blue-600',   delay: 0 },
    { title: 'Pending',       value: data?.summary?.pendingOrders   || 0, icon: FaClock,         color: 'bg-yellow-600', delay: 0.1 },
    { title: 'Completed',     value: data?.summary?.completedOrders || 0, icon: FaCheckCircle,   color: 'bg-green-600',  delay: 0.2 },
  ];

  return (
    <div className="space-y-6">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
        className="glass rounded-2xl border border-blue-500/20 p-8 relative overflow-hidden"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-blue-600/15 via-purple-600/5 to-transparent pointer-events-none" />
        <div className="absolute top-0 right-0 w-64 h-64 bg-blue-500/5 rounded-full -translate-y-1/2 translate-x-1/4 blur-3xl pointer-events-none" />
        <div className="relative z-10">
          <p className="text-blue-400 text-xs font-bold uppercase tracking-widest mb-2">Welcome back</p>
          <h2 className="text-2xl font-black text-white mb-2">{user?.fullName} 👋</h2>
          <p className="text-slate-400 text-sm max-w-md mb-6">Manage your orders, track deliveries, and discover new accessories for your device.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="btn-glow text-white px-5 py-2.5 rounded-xl font-bold text-sm flex items-center gap-2">
              Browse Products <FaArrowRight size={11} />
            </Link>
            <Link to="/cart" className="glass-light border border-white/10 text-slate-300 hover:text-white px-5 py-2.5 rounded-xl font-bold text-sm transition-colors">
              View Cart
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map((s) => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="glass neon-border rounded-2xl p-6"
        >
          <div className="flex items-center justify-between mb-5">
            <h4 className="text-white font-bold text-base">Recent Orders</h4>
            <Link to="/dashboard/orders" className="text-blue-400 text-xs font-bold flex items-center gap-1 hover:text-blue-300 transition-colors">
              View All <FaArrowRight size={9} />
            </Link>
          </div>

          <div className="space-y-3">
            {data?.recentOrders?.length > 0 ? (
              data.recentOrders.map((order) => (
                <div key={order?._id} className="flex items-center gap-3 p-3 glass-light rounded-xl border border-white/5 hover:border-blue-500/20 transition-all">
                  <div className="w-12 h-12 bg-dark-surface rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden">
                    {order?.items?.[0]?.product?.image
                      ? <img src={order.items[0].product.image} alt="" className="w-full h-full object-contain p-1" />
                      : <FaBoxOpen className="text-slate-600" size={18} />
                    }
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-slate-200 text-sm">#{order?._id?.slice(-6) || 'N/A'}</p>
                    <p className="text-xs text-slate-500">
                      {order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}
                    </p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-white text-sm">{formatPrice(order?.totalAmount || 0)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order?.status === 'Completed' ? 'badge-completed bg-green-500/10 text-green-500 border border-green-500/20' :
                      order?.status === 'Pending'   ? 'badge-pending bg-yellow-500/10 text-yellow-500 border border-yellow-500/20'   : 
                      order?.status === 'Approved'  ? 'badge-approved bg-blue-500/10 text-blue-500 border border-blue-500/20' :
                      'bg-red-500/10 text-red-500 border border-red-500/20'
                    }`}>
                      {order?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-12">
                <FaShoppingBag className="text-slate-700 text-4xl mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No orders yet</p>
                <Link to="/products" className="text-blue-400 text-xs font-bold mt-2 inline-block hover:text-blue-300">Start shopping →</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order tracking */}
        <motion.div
          initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="glass neon-border rounded-2xl p-6"
        >
          <h4 className="text-white font-bold text-base mb-5">Active Tracking</h4>
          {(() => {
            const active = data?.recentOrders?.find(o => o.status !== 'Completed' && o.status !== 'Cancelled');
            if (!active) return (
              <div className="text-center py-12">
                <FaTruck className="text-slate-700 text-4xl mx-auto mb-3" />
                <p className="text-slate-500 text-sm">No active deliveries</p>
              </div>
            );
            const steps = ['Pending', 'Approved', 'Completed'];
            const cur = steps.indexOf(active?.status || 'Pending');
            return (
              <div>
                <p className="text-slate-300 font-bold text-sm mb-6">Order #{active?._id?.slice(-6) || 'N/A'}</p>
                <div className="flex justify-between relative mb-8">
                  <div className="absolute top-4 left-0 w-full h-0.5 bg-white/5" />
                  <div className="absolute top-4 left-0 h-0.5 bg-blue-500 transition-all duration-1000" style={{ width: `${(cur / (steps.length - 1)) * 100}%` }} />
                  {steps.map((step, i) => (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${
                        i <= cur ? 'bg-blue-500 text-white glow-sm' : 'bg-dark-surface text-slate-600 border border-white/10'
                      }`}>
                        {i < cur ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${i <= cur ? 'text-blue-400' : 'text-slate-600'}`}>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 p-4 bg-blue-500/10 rounded-xl border border-blue-500/20">
                  <FaTruck className="text-blue-400 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-blue-300">
                      {active?.status === 'Pending' ? 'Waiting for approval' : 
                       active?.status === 'Approved' ? 'Delivery in progress' : 'Package delivered'}
                    </p>
                    <p className="text-xs text-blue-400/70 mt-0.5">Your package is being handled by our Kigali team.</p>
                  </div>
                </div>
              </div>
            );
          })()}
        </motion.div>
      </div>
    </div>
  );
};

export default UserDashboard;
