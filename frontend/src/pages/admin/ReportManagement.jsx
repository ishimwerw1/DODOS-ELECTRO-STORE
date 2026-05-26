import { useState, useEffect } from 'react';
import { FaChartBar, FaChartLine, FaChartPie, FaDownload, FaCalendarAlt, FaDollarSign, FaShoppingCart, FaUsers, FaBoxOpen, FaArrowUp, FaArrowDown } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { motion } from 'framer-motion';

const ReportManagement = () => {
  const { theme } = useTheme();
  const [stats, setStats] = useState(null);
  const [reportData, setReportData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [timeRange, setTimeRange] = useState('7days');

  useEffect(() => {
    fetchData();
  }, [timeRange]);

  const fetchData = async () => {
    try {
      setLoading(true);
      // Fetch both dashboard stats and detailed sales report
      const [statsRes, reportRes] = await Promise.all([
        adminAPI.getStats(),
        adminAPI.getSalesReport({ 
          from: getStartDate(timeRange),
          to: new Date().toISOString().split('T')[0]
        })
      ]);
      setStats(statsRes.data);
      setReportData(reportRes.data);
    } catch (error) {
      toast.error('Failed to load report data');
    } finally {
      setLoading(false);
    }
  };

  const getStartDate = (range) => {
    const date = new Date();
    if (range === '7days') date.setDate(date.getDate() - 7);
    else if (range === '30days') date.setDate(date.getDate() - 30);
    else if (range === '1year') date.setFullYear(date.getFullYear() - 1);
    return date.toISOString().split('T')[0];
  };

  const StatCard = ({ title, value, icon: Icon, trend, color }) => (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={`p-8 rounded-[2.5rem] border transition-all duration-500 ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl'}`}
    >
      <div className="flex items-start justify-between mb-6">
        <div className={`w-14 h-14 rounded-2xl flex items-center justify-center ${color} shadow-lg shadow-blue-500/10`}>
          <Icon size={24} className="text-white" />
        </div>
        {trend && (
          <div className={`flex items-center gap-1 text-[10px] font-black uppercase tracking-widest ${trend > 0 ? 'text-green-500' : 'text-red-500'}`}>
            {trend > 0 ? <FaArrowUp /> : <FaArrowDown />}
            {Math.abs(trend)}%
          </div>
        )}
      </div>
      <div>
        <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">{title}</p>
        <h3 className={`text-2xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{value}</h3>
      </div>
    </motion.div>
  );

  return (
    <div className="space-y-10 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Reports & Analytics</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Detailed overview of your store performance.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className={`flex items-center p-1 rounded-2xl ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5' : 'bg-white border border-slate-200 shadow-sm'}`}>
            {['7days', '30days', '1year'].map((range) => (
              <button
                key={range}
                onClick={() => setTimeRange(range)}
                className={`px-6 py-2.5 rounded-xl text-[10px] font-black uppercase tracking-widest transition-all ${timeRange === range ? 'bg-[#0d6efd] text-white shadow-lg shadow-blue-500/20' : 'text-slate-500 hover:text-blue-500'}`}
              >
                {range.replace('days', ' Days').replace('year', ' Year')}
              </button>
            ))}
          </div>
          <button className="flex items-center gap-3 bg-white/5 border border-white/10 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest hover:bg-white/10 transition-all">
            <FaDownload /> Export
          </button>
        </div>
      </div>

      {loading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[...Array(4)].map((_, i) => (
            <div key={i} className={`h-48 rounded-[2.5rem] animate-pulse ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
          ))}
        </div>
      ) : (
        <>
          {/* Top Stats */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <StatCard 
              title="Total Revenue" 
              value={`RWF ${stats?.summary?.totalRevenue?.toLocaleString() || 0}`} 
              icon={FaDollarSign} 
              trend={12} 
              color="bg-blue-600" 
            />
            <StatCard 
              title="Total Orders" 
              value={stats?.summary?.totalOrders || 0} 
              icon={FaShoppingCart} 
              trend={8} 
              color="bg-purple-600" 
            />
            <StatCard 
              title="Total Customers" 
              value={stats?.summary?.totalCustomers || 0} 
              icon={FaUsers} 
              trend={-3} 
              color="bg-indigo-600" 
            />
            <StatCard 
              title="Total Products" 
              value={stats?.summary?.totalProducts || 0} 
              icon={FaBoxOpen} 
              color="bg-pink-600" 
            />
          </div>

          {/* Detailed Charts Area */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
            <div className={`p-10 rounded-[3rem] border ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-10">
                <h3 className={`text-xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Sales Overview</h3>
                <FaChartLine className="text-blue-500" size={20} />
              </div>
              <div className="h-64 flex items-end justify-between gap-4">
                {reportData?.salesByDate?.map((day, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-4 group">
                    <div className="relative w-full">
                      <motion.div 
                        initial={{ height: 0 }} 
                        animate={{ height: `${(day.revenue / Math.max(...reportData.salesByDate.map(d => d.revenue))) * 100}%` }}
                        className="w-full bg-gradient-to-t from-blue-600 to-blue-400 rounded-t-xl opacity-20 group-hover:opacity-100 transition-all cursor-pointer relative"
                      >
                        <div className="absolute -top-10 left-1/2 -translate-x-1/2 bg-blue-600 text-white text-[9px] font-black px-2 py-1 rounded opacity-0 group-hover:opacity-100 transition-all">
                          {day.revenue.toLocaleString()}
                        </div>
                      </motion.div>
                    </div>
                    <span className="text-[9px] font-black text-slate-500 uppercase tracking-widest -rotate-45 mt-2">{day._id.split('-').slice(1).join('/')}</span>
                  </div>
                ))}
                {!reportData?.salesByDate?.length && (
                  <div className="flex-1 py-20 text-center text-slate-500 text-[10px] font-black uppercase tracking-widest">
                    No sales data for this period
                  </div>
                )}
              </div>
            </div>

            <div className={`p-10 rounded-[3rem] border ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
              <div className="flex items-center justify-between mb-10">
                <h3 className={`text-xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Top Selling Categories</h3>
                <FaChartPie className="text-purple-500" size={20} />
              </div>
              <div className="space-y-6">
                {reportData?.categoryBreakdown?.slice(0, 5).map((cat, i) => (
                  <div key={i} className="flex items-center justify-between group">
                    <div className="flex items-center gap-4">
                      <div className={`w-10 h-10 rounded-xl flex items-center justify-center ${theme === 'Dark' ? 'bg-white/5 text-slate-400' : 'bg-slate-50 text-slate-500'}`}>
                        {i + 1}
                      </div>
                      <span className={`text-xs font-bold ${theme === 'Dark' ? 'text-slate-300' : 'text-slate-700'}`}>{cat._id || 'Uncategorized'}</span>
                    </div>
                    <div className="flex items-center gap-4">
                      <div className="w-32 h-2 bg-slate-800 rounded-full overflow-hidden">
                        <div className="h-full bg-purple-500" style={{ width: `${(cat.revenue / reportData.totals.revenue) * 100}%` }} />
                      </div>
                      <span className="text-[10px] font-black text-purple-500 w-12 text-right">RWF {cat.revenue.toLocaleString()}</span>
                    </div>
                  </div>
                ))}
                {!reportData?.categoryBreakdown?.length && (
                  <div className="py-10 text-center text-slate-500 text-xs font-bold uppercase tracking-widest">
                    No category data available
                  </div>
                )}
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  );
};

export default ReportManagement;
