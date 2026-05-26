import { useState, useEffect } from 'react';
import { FaUser, FaPhone, FaEnvelope, FaMapMarkerAlt, FaHistory, FaSearch, FaFilter, FaEllipsisH, FaChevronDown, FaUserPlus, FaCheckCircle, FaTimes, FaPlus, FaTrash } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { useLocale } from '../../context/LocaleContext';
import { motion, AnimatePresence } from 'framer-motion';

const CustomerManagement = () => {
  const { theme } = useTheme();
  const { formatPrice } = useLocale();
  const [customers, setCustomers] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchCustomers();
  }, []);

  const fetchCustomers = async () => {
    try {
      const res = await adminAPI.getCustomers();
      setCustomers(res.data || []);
    } catch (error) {
      toast.error('Failed to load customers');
    } finally {
      setLoading(false);
    }
  };

  const filteredCustomers = customers.filter(c => 
    c.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    c.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
    (c.phone && c.phone.includes(searchTerm))
  );

  const getInitials = (name) => {
    return name ? name.split(' ').map(n => n[0]).join('').slice(0, 2).toUpperCase() : '??';
  };

  const colors = ['bg-blue-600', 'bg-purple-600', 'bg-orange-600', 'bg-pink-600', 'bg-indigo-600'];

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Customers</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage and view your store's customer base.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <FaSearch size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search customers..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none w-64 transition-all ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5 text-white focus:border-blue-500/50' : 'bg-white border border-slate-200 text-slate-900 focus:border-blue-500/50 shadow-sm'}`}
            />
          </div>
        </div>
      </div>

      {/* Table Area */}
      <div className={`rounded-[2.5rem] border overflow-hidden ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Email</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Orders</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Total Spent</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'Dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredCustomers.length === 0 ? (
                <tr><td colSpan="6" className="p-20 text-center text-slate-500 font-bold uppercase text-xs tracking-widest">No customers found</td></tr>
              ) : filteredCustomers.map((customer, idx) => (
                <tr key={customer._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className="p-6">
                    <div className="flex items-center gap-4">
                      <div className={`w-12 h-12 rounded-2xl flex items-center justify-center font-black text-white shadow-lg ${colors[idx % colors.length]}`}>
                        {getInitials(customer.fullName)}
                      </div>
                      <div className="min-w-0">
                        <p className={`text-sm font-black truncate ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{customer.fullName}</p>
                        <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{customer.phone || 'No Phone'}</p>
                      </div>
                    </div>
                  </td>
                  <td className={`p-6 text-xs font-bold ${theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                    {customer.email}
                  </td>
                  <td className={`p-6 text-center text-xs font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>
                    {customer.orderCount || 0}
                  </td>
                  <td className={`p-6 text-center text-xs font-black ${theme === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>
                    {formatPrice(customer.totalSpent || 0)}
                  </td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${customer.isActive !== false ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                      {customer.isActive !== false ? 'Active' : 'Inactive'}
                    </span>
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                        <FaHistory size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
};

export default CustomerManagement;
