import { useState, useEffect } from 'react';
import { FaPlus, FaEdit, FaTrash, FaSearch, FaTicketAlt, FaCheckCircle, FaTimes, FaPercent, FaCalendarAlt, FaTag } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const CouponManagement = () => {
  const { theme } = useTheme();
  const [coupons, setCoupons] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingCoupon, setEditingCoupon] = useState(null);
  const [formData, setFormData] = useState({
    code: '',
    discountType: 'percentage',
    discountValue: '',
    expiryDate: '',
    minPurchase: '',
    isActive: true
  });

  const filteredCoupons = coupons.filter(coupon => 
    coupon.code.toLowerCase().includes(searchTerm.toLowerCase())
  );

  useEffect(() => {
    fetchCoupons();
  }, []);

  const fetchCoupons = async () => {
    try {
      const res = await adminAPI.getCoupons();
      setCoupons(res.data || []);
    } catch (error) {
      toast.error('Failed to load coupons');
    } finally {
      setLoading(false);
    }
  };

  const handleOpenModal = (coupon = null) => {
    if (coupon) {
      setEditingCoupon(coupon);
      setFormData({ 
        ...coupon, 
        expiryDate: coupon.expiryDate ? new Date(coupon.expiryDate).toISOString().split('T')[0] : '' 
      });
    } else {
      setEditingCoupon(null);
      setFormData({
        code: '',
        discountType: 'percentage',
        discountValue: '',
        expiryDate: '',
        minPurchase: '',
        isActive: true
      });
    }
    setIsModalOpen(true);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      if (editingCoupon) {
        await adminAPI.updateCoupon(editingCoupon._id, formData);
        toast.success('Coupon updated successfully');
      } else {
        await adminAPI.createCoupon(formData);
        toast.success('Coupon created successfully');
      }
      setIsModalOpen(false);
      fetchCoupons();
    } catch (error) {
      toast.error(error.response?.data?.message || 'Operation failed');
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this coupon?')) {
      try {
        await adminAPI.deleteCoupon(id);
        toast.success('Coupon deleted');
        fetchCoupons();
      } catch (error) {
        toast.error('Failed to delete coupon');
      }
    }
  };

  const generateCouponCode = () => {
    const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
    let code = 'DODOS-';
    for (let i = 0; i < 6; i++) {
      code += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    setFormData(prev => ({ ...prev, code }));
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Coupons</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage discount codes and promotional offers.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <FaSearch size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search coupons..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none w-64 transition-all ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5 text-white focus:border-blue-500/50' : 'bg-white border border-slate-200 text-slate-900 focus:border-blue-500/50 shadow-sm'}`}
            />
          </div>
          <button 
            onClick={() => handleOpenModal()}
            className="flex items-center gap-3 bg-[#0d6efd] hover:bg-blue-600 text-white px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all shadow-lg shadow-blue-500/20 active:scale-95"
          >
            <FaPlus /> Add Coupon
          </button>
        </div>
      </div>

      {/* Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
        {filteredCoupons.map((coupon) => (
          <motion.div
            layout
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            key={coupon._id}
            className={`group rounded-[2.5rem] p-8 border transition-all duration-500 relative overflow-hidden ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl'}`}
          >
            <div className="flex items-start justify-between mb-6">
              <div className={`w-14 h-14 rounded-2xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-blue-400 group-hover:bg-blue-600 group-hover:text-white' : 'bg-blue-50 text-blue-600 group-hover:bg-blue-600 group-hover:text-white'}`}>
                <FaTicketAlt size={24} />
              </div>
              <div className="flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                <button onClick={() => handleOpenModal(coupon)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}>
                  <FaEdit size={14} />
                </button>
                <button onClick={() => handleDelete(coupon._id)} className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50'}`}>
                  <FaTrash size={14} />
                </button>
              </div>
            </div>
            
            <div>
              <h3 className={`text-xl font-black tracking-tighter ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{coupon.code}</h3>
              <p className="text-[10px] text-blue-500 font-black uppercase tracking-[0.2em] mt-1">
                {coupon.discountType === 'percentage' ? `${coupon.discountValue}% OFF` : `RWF ${coupon.discountValue} OFF`}
              </p>
              
              <div className="mt-6 space-y-3">
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <FaCalendarAlt size={12} className="text-blue-400" />
                  <span>Expires: {new Date(coupon.expiryDate).toLocaleDateString()}</span>
                </div>
                <div className="flex items-center gap-3 text-[10px] font-bold uppercase tracking-widest text-slate-500">
                  <FaTag size={12} className="text-blue-400" />
                  <span>Min Purchase: RWF {coupon.minPurchase?.toLocaleString()}</span>
                </div>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${coupon.isActive ? 'bg-green-500/10 text-green-500' : 'bg-red-500/10 text-red-500'}`}>
                  {coupon.isActive ? 'Active' : 'Inactive'}
                </span>
                <FaCheckCircle className={coupon.isActive ? 'text-green-500' : 'text-slate-700'} size={14} />
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Modal Placeholder */}
      <AnimatePresence>
        {isModalOpen && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-xl rounded-[3rem] overflow-hidden shadow-2xl ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5' : 'bg-white'}`}
            >
              <div className={`p-8 border-b flex justify-between items-center ${theme === 'Dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                <div>
                  <h3 className={`text-xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{editingCoupon ? 'Edit Coupon' : 'Add New Coupon'}</h3>
                  <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">Configure your discount offer</p>
                </div>
                <button onClick={() => setIsModalOpen(false)} className={`w-10 h-10 rounded-full flex items-center justify-center transition-all ${theme === 'Dark' ? 'hover:bg-white/10 text-slate-400' : 'hover:bg-slate-200 text-slate-500'}`}><FaTimes /></button>
              </div>

              <form onSubmit={handleSubmit} className="p-10 space-y-6">
                <div className="space-y-2">
                  <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Coupon Code</label>
                  <div className="flex gap-4">
                    <input 
                      type="text" 
                      value={formData.code} 
                      onChange={(e) => setFormData({...formData, code: e.target.value.toUpperCase()})} 
                      placeholder="e.g. SAVE20" 
                      className={`flex-1 px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} 
                      required 
                    />
                    <button
                      type="button"
                      onClick={generateCouponCode}
                      className="px-6 py-3.5 bg-blue-600/10 text-blue-500 hover:bg-blue-600 hover:text-white rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all"
                    >
                      Generate
                    </button>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Discount Type</label>
                    <select 
                      value={formData.discountType}
                      onChange={(e) => setFormData({...formData, discountType: e.target.value})}
                      className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`}
                    >
                      <option value="percentage">Percentage (%)</option>
                      <option value="fixed">Fixed Amount (RWF)</option>
                    </select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Discount Value</label>
                    <input 
                      type="number" 
                      value={formData.discountValue} 
                      onChange={(e) => setFormData({...formData, discountValue: e.target.value})} 
                      placeholder="e.g. 10" 
                      className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} 
                      required 
                    />
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-6">
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Expiry Date</label>
                    <input 
                      type="date" 
                      value={formData.expiryDate} 
                      onChange={(e) => setFormData({...formData, expiryDate: e.target.value})} 
                      className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} 
                      required 
                    />
                  </div>
                  <div className="space-y-2">
                    <label className="text-[10px] font-black text-slate-500 uppercase tracking-widest ml-1">Min Purchase (RWF)</label>
                    <input 
                      type="number" 
                      value={formData.minPurchase} 
                      onChange={(e) => setFormData({...formData, minPurchase: e.target.value})} 
                      placeholder="e.g. 1000" 
                      className={`w-full px-5 py-3.5 rounded-2xl text-xs font-bold outline-none border transition-all ${theme === 'Dark' ? 'bg-white/5 border-white/5 text-white focus:border-blue-500/50' : 'bg-slate-50 border-slate-200 text-slate-900 focus:border-blue-500/50'}`} 
                    />
                  </div>
                </div>

                <div className="flex items-center gap-3 py-2">
                  <button
                    type="button"
                    onClick={() => setFormData({ ...formData, isActive: !formData.isActive })}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-all duration-300 focus:outline-none ${formData.isActive ? 'bg-[#0d6efd]' : theme === 'Dark' ? 'bg-white/5' : 'bg-slate-200'}`}
                  >
                    <span className={`inline-block h-4 w-4 transform rounded-full bg-white shadow-lg transition-transform duration-300 ${formData.isActive ? 'translate-x-6' : 'translate-x-1'}`} />
                  </button>
                  <span className={`text-[11px] font-black uppercase tracking-widest ${theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}`}>Coupon is Active</span>
                </div>

                <div className={`mt-10 pt-8 border-t flex justify-end gap-4 ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                  <button type="button" onClick={() => setIsModalOpen(false)} className={`px-8 py-3.5 rounded-2xl text-xs font-black uppercase tracking-widest transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10' : 'bg-slate-100 text-slate-600 hover:bg-slate-200'}`}>Cancel</button>
                  <button type="submit" className="px-10 py-3.5 bg-[#0d6efd] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95">
                    {editingCoupon ? 'Save Changes' : 'Create Coupon'}
                  </button>
                </div>
              </form>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default CouponManagement;
