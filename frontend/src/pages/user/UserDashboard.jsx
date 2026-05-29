import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaClock, FaCheckCircle, FaArrowRight, FaTruck, FaBoxOpen } from 'react-icons/fa';
import { authAPI } from '../../services/api';
import { useAuth } from '../../context/AuthContext';
import { useLocale } from '../../context/LocaleContext';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, bg, delay }) => (
  <motion.div
    initial={{ opacity: 0, y: 12 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay }}
    className="bg-white border border-gray-200 rounded-xl p-5 flex items-center gap-4 hover:shadow-md transition-all"
  >
    <div className={`w-12 h-12 rounded-xl ${bg} flex items-center justify-center flex-shrink-0`}>
      <Icon size={18} className="text-white" />
    </div>
    <div>
      <p className="text-gray-400 text-xs font-semibold uppercase tracking-wider">{title}</p>
      <h3 className="text-2xl font-black text-gray-900 mt-0.5">{value}</h3>
    </div>
  </motion.div>
);

const UserDashboard = () => {
  const { user }          = useAuth();
  const { formatPrice }   = useLocale();
  const [data, setData]   = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    authAPI.getDashboard()
      .then(res => setData(res.data))
      .catch(() => toast.error('Failed to load dashboard'))
      .finally(() => setLoading(false));
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-64">
      <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const stats = [
    { title: 'Total Orders',  value: data?.summary?.totalOrders     || 0, icon: FaShoppingBag, bg: 'bg-blue-500',   delay: 0 },
    { title: 'Pending',       value: data?.summary?.pendingOrders   || 0, icon: FaClock,        bg: 'bg-yellow-500', delay: 0.1 },
    { title: 'Completed',     value: data?.summary?.completedOrders || 0, icon: FaCheckCircle,  bg: 'bg-green-500',  delay: 0.2 },
  ];

  return (
    <div className="p-4 md:p-6 space-y-6">

      {/* Welcome banner */}
      <motion.div
        initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
        className="bg-green-500 rounded-xl p-7 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-white/10 rounded-full -translate-y-1/2 translate-x-1/4" />
        <div className="relative z-10">
          <p className="text-green-100 text-xs font-semibold uppercase tracking-widest mb-1">Welcome back</p>
          <h2 className="text-2xl font-black text-white mb-2">{user?.fullName} 👋</h2>
          <p className="text-green-100 text-sm max-w-md mb-5">Manage your orders, track deliveries, and discover new accessories.</p>
          <div className="flex flex-wrap gap-3">
            <Link to="/products" className="bg-white text-green-600 font-black px-5 py-2.5 rounded-xl text-sm flex items-center gap-2 hover:bg-green-50 transition-all">
              Browse Products <FaArrowRight size={11} />
            </Link>
            <Link to="/cart" className="bg-white/20 hover:bg-white/30 text-white font-bold px-5 py-2.5 rounded-xl text-sm transition-all">
              View Cart
            </Link>
          </div>
        </div>
      </motion.div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {stats.map(s => <StatCard key={s.title} {...s} />)}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">

        {/* Recent orders */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.3 }}
          className="bg-white border border-gray-200 rounded-xl p-5"
        >
          <div className="flex items-center justify-between mb-4">
            <h4 className="font-black text-gray-900 text-base">Recent Orders</h4>
            <Link to="/dashboard/orders" className="text-green-600 text-xs font-bold flex items-center gap-1 hover:text-green-700 transition-colors">
              View All <FaArrowRight size={9} />
            </Link>
          </div>
          <div className="space-y-3">
            {data?.recentOrders?.length > 0 ? (
              data.recentOrders.map(order => (
                <div key={order?._id} className="flex items-center gap-3 p-3 bg-gray-50 rounded-xl border border-gray-100 hover:border-green-200 transition-all">
                  <div className="w-11 h-11 bg-white rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                    {order?.items?.[0]?.product?.image
                      ? <img src={order.items[0].product.image} alt="" className="w-full h-full object-contain p-1" />
                      : <FaBoxOpen className="text-gray-300" size={16} />
                    }
                  </div>
                  <div className="flex-grow min-w-0">
                    <p className="font-bold text-gray-800 text-sm">#{order?._id?.slice(-6) || 'N/A'}</p>
                    <p className="text-xs text-gray-400">{order?.createdAt ? new Date(order.createdAt).toLocaleDateString() : '—'}</p>
                  </div>
                  <div className="text-right flex-shrink-0">
                    <p className="font-black text-gray-900 text-sm">{formatPrice(order?.totalAmount || 0)}</p>
                    <span className={`text-[10px] font-bold px-2 py-0.5 rounded-full ${
                      order?.status === 'Completed' ? 'bg-green-100 text-green-600' :
                      order?.status === 'Pending'   ? 'bg-yellow-100 text-yellow-600' :
                      order?.status === 'Approved'  ? 'bg-blue-100 text-blue-600' :
                      'bg-red-100 text-red-500'
                    }`}>
                      {order?.status || 'Unknown'}
                    </span>
                  </div>
                </div>
              ))
            ) : (
              <div className="text-center py-10">
                <FaShoppingBag className="text-gray-200 text-4xl mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No orders yet</p>
                <Link to="/products" className="text-green-600 text-xs font-bold mt-2 inline-block hover:text-green-700">Start shopping →</Link>
              </div>
            )}
          </div>
        </motion.div>

        {/* Order tracking */}
        <motion.div
          initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}
          className="bg-white border border-gray-200 rounded-xl p-5"
        >
          <h4 className="font-black text-gray-900 text-base mb-4">Active Tracking</h4>
          {(() => {
            const active = data?.recentOrders?.find(o => o.status !== 'Completed' && o.status !== 'Cancelled');
            if (!active) return (
              <div className="text-center py-10">
                <FaTruck className="text-gray-200 text-4xl mx-auto mb-3" />
                <p className="text-gray-400 text-sm">No active deliveries</p>
              </div>
            );
            const steps = ['Pending', 'Approved', 'Completed'];
            const cur   = steps.indexOf(active?.status || 'Pending');
            return (
              <div>
                <p className="text-gray-600 font-bold text-sm mb-5">Order #{active?._id?.slice(-6) || 'N/A'}</p>
                <div className="flex justify-between relative mb-6">
                  <div className="absolute top-4 left-0 w-full h-0.5 bg-gray-100" />
                  <div className="absolute top-4 left-0 h-0.5 bg-green-500 transition-all duration-1000" style={{ width: `${(cur / (steps.length - 1)) * 100}%` }} />
                  {steps.map((step, i) => (
                    <div key={step} className="relative z-10 flex flex-col items-center gap-2">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-bold transition-all ${i <= cur ? 'bg-green-500 text-white' : 'bg-gray-100 text-gray-400 border border-gray-200'}`}>
                        {i < cur ? '✓' : i + 1}
                      </div>
                      <span className={`text-[10px] font-bold uppercase tracking-wider ${i <= cur ? 'text-green-600' : 'text-gray-400'}`}>{step}</span>
                    </div>
                  ))}
                </div>
                <div className="flex items-center gap-3 p-4 bg-green-50 rounded-xl border border-green-100">
                  <FaTruck className="text-green-500 text-xl flex-shrink-0" />
                  <div>
                    <p className="text-sm font-bold text-green-700">
                      {active?.status === 'Pending' ? 'Waiting for approval' :
                       active?.status === 'Approved' ? 'Delivery in progress' : 'Package delivered'}
                    </p>
                    <p className="text-xs text-green-600/70 mt-0.5">Your package is being handled by our Kigali team.</p>
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
