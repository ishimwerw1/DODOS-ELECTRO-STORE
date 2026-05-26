import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import {
  XAxis, YAxis, CartesianGrid, Tooltip,
  ResponsiveContainer, AreaChart, Area,
} from 'recharts';
import {
  FaBox, FaShoppingCart, FaUsers, FaChartLine,
  FaChevronDown, FaEllipsisH, FaWallet, FaCube,
  FaArrowUp, FaArrowDown, FaCalendarAlt,
  FaClock, FaTimesCircle, FaExclamationTriangle,
  FaMobileAlt, FaBolt, FaBatteryFull, FaShieldAlt, FaPlug,
} from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { toast } from 'react-toastify';

const StatCard = ({ title, value, icon: Icon, color, trend, trendUp, delay, theme }) => (
  <motion.div
    initial={{ opacity: 0, y: 20 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ delay, duration: 0.4 }}
    className={`rounded-3xl p-6 border transition-all duration-300 group ${
      theme === 'Dark' 
        ? 'bg-[#0a0d14] border-white/5 hover:border-blue-500/30' 
        : 'bg-white border-slate-200 hover:border-blue-500/30 shadow-sm hover:shadow-md'
    }`}
  >
    <div className="flex items-center justify-between mb-4">
      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center transition-all ${
        theme === 'Dark' ? 'bg-white/5 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'
      }`}>
        <Icon size={20} />
      </div>
      <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[10px] font-black uppercase tracking-widest ${
        trendUp 
          ? 'bg-green-500/10 text-green-500' 
          : 'bg-red-500/10 text-red-500'
      }`}>
        {trendUp ? <FaArrowUp size={8} /> : <FaArrowDown size={8} />}
        {trend}
      </div>
    </div>
    <div>
      <p className={`text-[11px] font-black uppercase tracking-[0.2em] mb-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>{title}</p>
      <h3 className={`text-2xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
    </div>
  </motion.div>
);

const Dashboard = () => {
  const { formatPrice } = useLocale();
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchData = async () => {
      try {
        const res = await adminAPI.getStats();
        setStats(res.data);
      } catch (err) {
        toast.error('Failed to load dashboard stats');
      } finally {
        setLoading(false);
      }
    };
    fetchData();
  }, []);

  if (loading) return (
    <div className="flex items-center justify-center h-96">
      <div className="w-12 h-12 border-4 border-blue-500 border-t-transparent rounded-full animate-spin" />
    </div>
  );

  const cards = [
    { title: 'Total Sales', value: formatPrice(stats?.summary?.totalRevenue || 0), icon: FaWallet, trend: '12.5%', trendUp: true, delay: 0 },
    { title: 'Total Orders', value: stats?.summary?.totalOrders || '0', icon: FaShoppingCart, trend: '8.2%', trendUp: true, delay: 0.1 },
    { title: 'Customers', value: stats?.summary?.totalCustomers || '0', icon: FaUsers, trend: '10.1%', trendUp: true, delay: 0.2 },
    { title: 'Products', value: stats?.summary?.totalProducts || '0', icon: FaCube, trend: '4.3%', trendUp: true, delay: 0.3 },
    { title: 'Pending Orders', value: stats?.summary?.pendingOrders || '0', icon: FaClock, trend: '2.1%', trendUp: false, delay: 0.4 },
    { title: 'Low Stock', value: stats?.summary?.lowStockItems || '0', icon: FaExclamationTriangle, trend: '5.4%', trendUp: false, delay: 0.5 },
  ];

  const salesData = stats?.salesHistory || [];

  const recentOrders = stats?.recentOrders || [];

  const topProducts = stats?.topProducts || [];

  const stockAlerts = stats?.lowStockProducts || [];

  return (
    <div className="space-y-8 pb-10">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Dashboard</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Welcome back, Admin! Here's what's happening with your store today.</p>
        </div>
        <div className={`flex items-center gap-3 px-4 py-2.5 rounded-2xl border ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-white border-slate-200 text-slate-600 shadow-sm'}`}>
          <FaCalendarAlt size={14} className="text-blue-500" />
          <span className="text-xs font-black uppercase tracking-widest">
            {new Date(Date.now() - 6 * 24 * 60 * 60 * 1000).toLocaleDateString()} - {new Date().toLocaleDateString()}
          </span>
          <FaChevronDown size={10} />
        </div>
      </div>

      {/* Stat Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-6 gap-6">
        {cards.map((c, i) => <StatCard key={c.title} {...c} theme={theme} />)}
      </div>

      {/* Main Grid */}
      <div className="grid grid-cols-1 xl:grid-cols-12 gap-8">
        
        {/* Sales Overview */}
        <div className={`xl:col-span-8 rounded-[2.5rem] p-8 border ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-10">
            <div>
              <h4 className={`text-xl font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Sales Overview</h4>
              <p className={`text-[11px] font-black uppercase tracking-widest mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Weekly revenue analysis</p>
            </div>
            <div className={`px-4 py-2 rounded-xl border text-[10px] font-black uppercase tracking-widest ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-slate-400' : 'bg-slate-50 border-slate-200 text-slate-600'}`}>
              This Week
            </div>
          </div>
          <div className="h-[300px] w-full">
            <ResponsiveContainer width="100%" height="100%" minWidth={0}>
              <AreaChart data={salesData}>
                <defs>
                  <linearGradient id="colorSales" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#0d6efd" stopOpacity={0.3}/>
                    <stop offset="95%" stopColor="#0d6efd" stopOpacity={0}/>
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke={theme === 'Dark' ? 'rgba(255,255,255,0.05)' : 'rgba(0,0,0,0.05)'} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} dy={10} />
                <YAxis axisLine={false} tickLine={false} tick={{ fill: '#64748b', fontSize: 10, fontWeight: 700 }} />
                <Tooltip 
                  contentStyle={{ 
                    backgroundColor: theme === 'Dark' ? '#0a0d14' : '#fff', 
                    border: theme === 'Dark' ? '1px solid rgba(255,255,255,0.1)' : '1px solid rgba(0,0,0,0.1)',
                    borderRadius: '1rem',
                    fontSize: '12px',
                    fontWeight: 'bold'
                  }} 
                />
                <Area type="monotone" dataKey="sales" stroke="#0d6efd" strokeWidth={3} fillOpacity={1} fill="url(#colorSales)" dot={{ r: 4, fill: '#0d6efd', strokeWidth: 2, stroke: theme === 'Dark' ? '#0a0d14' : '#fff' }} />
              </AreaChart>
            </ResponsiveContainer>
          </div>
        </div>

        {/* Top Selling Products */}
        <div className={`xl:col-span-4 rounded-[2.5rem] p-8 border ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
            <h4 className={`text-lg font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Top Selling Products</h4>
            <Link to="/admin/products" className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="space-y-6">
            {topProducts.map((product, i) => (
              <div key={i} className="flex items-center gap-4">
                <div className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 overflow-hidden ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                  {product.image ? (
                    <img src={product.image} alt={product.name} className="w-full h-full object-cover" />
                  ) : (
                    <FaBox size={18} className="text-blue-500" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-xs font-black truncate ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{product.name}</p>
                  <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{product.soldQty} Sold</p>
                </div>
                <div className="text-right">
                  <p className={`text-xs font-black ${theme === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>{formatPrice(product.revenue)}</p>
                </div>
              </div>
            ))}
            {topProducts.length === 0 && (
              <div className="py-10 text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">No sales yet</div>
            )}
          </div>
        </div>

        {/* Low Stock Alerts */}
        <div className={`xl:col-span-4 rounded-[2.5rem] p-8 border ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
            <h4 className={`text-lg font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Low Stock Alerts</h4>
            <Link to="/admin/products" className="text-orange-500 text-[10px] font-black uppercase tracking-widest hover:underline">Manage Stock</Link>
          </div>
          <div className="space-y-6">
            {stockAlerts.map((item, i) => (
              <div key={i} className="flex items-center justify-between group">
                <div className="flex items-center gap-3">
                  <div className={`w-10 h-10 rounded-xl overflow-hidden flex items-center justify-center ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                    {item.image ? (
                      <img src={item.image} alt={item.name} className="w-full h-full object-cover" />
                    ) : (
                      <FaExclamationTriangle size={14} className="text-orange-500" />
                    )}
                  </div>
                  <div>
                    <p className={`text-xs font-black truncate max-w-[150px] ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{item.name}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">Left: {item.stock}</p>
                  </div>
                </div>
                <div className={`px-2.5 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${theme === 'Dark' ? 'bg-orange-500/10 text-orange-500' : 'bg-orange-50 text-orange-600'}`}>
                  Critical
                </div>
              </div>
            ))}
            {stockAlerts.length === 0 && (
              <div className="py-10 text-center text-slate-500 font-bold uppercase text-[10px] tracking-widest">All stock healthy</div>
            )}
          </div>
        </div>

        {/* Recent Orders Table */}
        <div className={`xl:col-span-12 rounded-[2.5rem] p-8 border ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
          <div className="flex items-center justify-between mb-8">
            <h4 className={`text-xl font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Recent Orders</h4>
            <Link to="/admin/orders" className="text-blue-500 text-[10px] font-black uppercase tracking-widest hover:underline">View All</Link>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full text-left">
              <thead>
                <tr className={`border-b ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Status</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                  <th className="pb-4 text-[10px] font-black uppercase tracking-widest text-slate-500">Action</th>
                </tr>
              </thead>
              <tbody className={`divide-y ${theme === 'Dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
                {recentOrders.map((order) => (
                  <tr key={order._id} className="group hover:bg-white/[0.02] transition-colors">
                    <td className={`py-4 text-xs font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>#{order._id.slice(-6).toUpperCase()}</td>
                    <td className={`py-4 text-xs font-bold ${theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}`}>{order.user?.fullName || 'Guest'}</td>
                    <td className={`py-4 text-xs font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{formatPrice(order.totalAmount)}</td>
                    <td className="py-4">
                      <span className={`px-3 py-1 rounded-lg text-[9px] font-black uppercase tracking-widest ${
                        order.status === 'Completed' ? 'bg-green-500/10 text-green-500' :
                        order.status === 'Approved' ? 'bg-blue-500/10 text-blue-500' :
                        order.status === 'Pending' ? 'bg-yellow-500/10 text-yellow-500' :
                        'bg-red-500/10 text-red-500'
                      }`}>
                        {order.status}
                      </span>
                    </td>
                    <td className={`py-4 text-xs font-bold ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                      {new Date(order.createdAt).toLocaleDateString()}
                    </td>
                    <td className="py-4">
                      <Link to={`/admin/orders`} className={`w-8 h-8 rounded-lg flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-50 text-slate-400 hover:text-slate-900'}`}>
                        <FaEllipsisH size={12} />
                      </Link>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

      </div>
    </div>
  );
};

export default Dashboard;
