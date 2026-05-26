import { useState, useEffect } from 'react';
import { FaEye, FaTrash, FaCheckCircle, FaTruck, FaClock, FaSearch, FaTimes, FaFilter, FaEllipsisH, FaPrint, FaArrowLeft, FaCalendarAlt, FaUser, FaPhone, FaMapMarkerAlt, FaEnvelope, FaChevronDown } from 'react-icons/fa';
import { adminAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useLocale } from '../../context/LocaleContext';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const OrderManagement = () => {
  const { formatPrice } = useLocale();
  const { theme } = useTheme();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedOrder, setSelectedOrder] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      const res = await adminAPI.getAllOrders();
      setOrders(res.data.orders || []);
    } catch (error) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const handleUpdateStatus = async (id, status) => {
    try {
      await adminAPI.updateOrderStatus(id, status);
      toast.success(`Order status updated to ${status}`);
      fetchOrders();
      if (selectedOrder?._id === id) {
        setSelectedOrder(prev => ({ ...prev, status }));
      }
    } catch (error) {
      toast.error('Failed to update order status');
    }
  };

  const handleDeleteOrder = async (id) => {
    if (window.confirm('Are you sure you want to delete this order?')) {
      try {
        await adminAPI.deleteOrder(id);
        toast.success('Order deleted');
        fetchOrders();
      } catch (error) {
        toast.error('Failed to delete order');
      }
    }
  };

  const handlePrint = () => {
    window.print();
  };

  const getPaymentMethodLabel = (method) => {
    switch (method) {
      case 'momo': return 'MTN Mobile Money';
      case 'cod': return 'Cash on Delivery';
      case 'bank': return 'Bank Transfer';
      case 'cash': return 'Cash Payment';
      default: return method?.replace('_', ' ') || 'N/A';
    }
  };

  const filteredOrders = orders.filter(o => 
    o._id.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.user?.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
    o.deliveryInfo?.phone.includes(searchTerm)
  );

  const getStatusStyle = (status) => {
    switch (status) {
      case 'Pending':   return 'bg-yellow-500/10 text-yellow-500';
      case 'Approved':  return 'bg-blue-500/10 text-blue-500';
      case 'Completed': return 'bg-green-500/10 text-green-500';
      case 'Cancelled': return 'bg-red-500/10 text-red-500';
      default:          return 'bg-slate-500/10 text-slate-500';
    }
  };

  return (
    <div className="space-y-8 pb-10">
      <style>{`
        @media print {
          body * {
            visibility: hidden;
          }
          .print-area, .print-area * {
            visibility: visible;
          }
          .print-area {
            position: absolute;
            left: 0;
            top: 0;
            width: 100%;
          }
          .no-print {
            display: none !important;
          }
        }
      `}</style>
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Orders</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage and track customer orders.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <FaSearch size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search orders..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none w-64 transition-all ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5 text-white focus:border-blue-500/50' : 'bg-white border border-slate-200 text-slate-900 focus:border-blue-500/50 shadow-sm'}`}
            />
          </div>
          <button className={`flex items-center gap-3 px-6 py-3.5 rounded-2xl font-black text-xs uppercase tracking-widest transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:bg-white/10 hover:text-white border border-white/5' : 'bg-white text-slate-600 hover:bg-slate-50 border border-slate-200 shadow-sm'}`}>
            <FaFilter /> All Status
          </button>
        </div>
      </div>

      {/* Table Area */}
      <div className={`rounded-[2.5rem] border overflow-hidden ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5' : 'bg-white border-slate-200 shadow-sm'}`}>
        <div className="overflow-x-auto">
          <table className="w-full text-left">
            <thead>
              <tr className={`border-b ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Order ID</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Customer</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Amount</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Status</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500">Date</th>
                <th className="p-6 text-[10px] font-black uppercase tracking-widest text-slate-500 text-center">Actions</th>
              </tr>
            </thead>
            <tbody className={`divide-y ${theme === 'Dark' ? 'divide-white/5' : 'divide-slate-50'}`}>
              {loading ? (
                <tr><td colSpan="6" className="p-20 text-center"><div className="w-10 h-10 border-4 border-blue-500 border-t-transparent rounded-full animate-spin mx-auto" /></td></tr>
              ) : filteredOrders.map((order) => (
                <tr key={order._id} className="group hover:bg-white/[0.02] transition-colors">
                  <td className={`p-6 text-xs font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>#{order._id.slice(-6)}</td>
                  <td className="p-6">
                    <p className={`text-sm font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{order.user?.fullName}</p>
                    <p className="text-[10px] text-slate-500 font-bold uppercase tracking-widest">{order.deliveryInfo?.phone}</p>
                  </td>
                  <td className={`p-6 text-sm font-black ${theme === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>{formatPrice(order.totalAmount)}</td>
                  <td className="p-6 text-center">
                    <span className={`px-3 py-1.5 rounded-lg text-[9px] font-black uppercase tracking-widest ${getStatusStyle(order.status)}`}>
                      {order.status}
                    </span>
                  </td>
                  <td className={`p-6 text-xs font-bold ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>
                    {new Date(order.createdAt).toLocaleDateString()}
                  </td>
                  <td className="p-6">
                    <div className="flex justify-center gap-2">
                      <button 
                        onClick={() => { setSelectedOrder(order); setIsModalOpen(true); }}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-blue-400 hover:bg-blue-500/10' : 'bg-slate-50 text-slate-400 hover:text-blue-600 hover:bg-blue-50'}`}
                      >
                        <FaEye size={14} />
                      </button>
                      <button 
                        onClick={() => handleDeleteOrder(order._id)}
                        className={`w-9 h-9 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                      >
                        <FaTrash size={14} />
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Order Detail Modal */}
      <AnimatePresence>
        {isModalOpen && selectedOrder && (
          <div className="fixed inset-0 z-[100] flex items-center justify-center p-4">
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} onClick={() => setIsModalOpen(false)} className="absolute inset-0 bg-black/80 backdrop-blur-sm" />
            <motion.div 
              initial={{ scale: 0.9, opacity: 0, y: 20 }} 
              animate={{ scale: 1, opacity: 1, y: 0 }} 
              exit={{ scale: 0.9, opacity: 0, y: 20 }}
              className={`relative w-full max-w-5xl rounded-[3rem] overflow-hidden shadow-2xl print-area ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5' : 'bg-white'}`}
            >
              <div className={`p-8 border-b flex justify-between items-center ${theme === 'Dark' ? 'border-white/5 bg-white/[0.02]' : 'border-slate-100 bg-slate-50/50'}`}>
                <div className="flex items-center gap-4">
                  <button onClick={() => setIsModalOpen(false)} className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all no-print ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}>
                    <FaArrowLeft size={14} />
                  </button>
                  <div>
                    <h3 className={`text-xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Order Details #{selectedOrder._id.slice(-6)}</h3>
                    <p className="text-[10px] font-black text-slate-500 uppercase tracking-widest mt-1">View and manage order information</p>
                  </div>
                </div>
                <div className="flex items-center gap-3">
                  <span className={`px-3 py-1.5 rounded-lg text-[10px] font-black uppercase tracking-widest ${getStatusStyle(selectedOrder.status)}`}>
                    {selectedOrder.status}
                  </span>
                  <button 
                    onClick={handlePrint}
                    className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all no-print ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-white' : 'bg-slate-100 text-slate-500 hover:text-slate-900'}`}
                  >
                    <FaPrint size={14} />
                  </button>
                </div>
              </div>

              <div className="p-10 overflow-y-auto max-h-[75vh] custom-scrollbar print:max-h-none print:overflow-visible">
                <div className="grid grid-cols-1 md:grid-cols-12 gap-10">
                  {/* Left Column: Customer & Payment */}
                  <div className="md:col-span-4 space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Customer Information</h4>
                      <div className={`rounded-3xl p-6 space-y-4 border ${theme === 'Dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex items-center gap-4">
                          <div className="w-10 h-10 rounded-xl bg-blue-600 flex items-center justify-center text-white font-black">{selectedOrder.user?.fullName?.charAt(0)}</div>
                          <div>
                            <p className={`text-sm font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.user?.fullName}</p>
                            <p className="text-xs text-slate-500 font-bold">{selectedOrder.user?.email}</p>
                          </div>
                        </div>
                        <div className="space-y-3 pt-4 border-t border-white/5">
                          <div className="flex items-center gap-3 text-xs">
                            <FaPhone className="text-blue-500" />
                            <span className={theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}>{selectedOrder.deliveryInfo?.phone}</span>
                          </div>
                          <div className="flex items-start gap-3 text-xs">
                            <FaMapMarkerAlt className="text-blue-500 mt-1" />
                            <div className="flex flex-col">
                              <span className={`font-bold ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>
                                {selectedOrder.deliveryInfo?.district}, {selectedOrder.deliveryInfo?.sector}
                              </span>
                              <span className={theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}>
                                {selectedOrder.deliveryInfo?.street || selectedOrder.deliveryInfo?.address}
                              </span>
                            </div>
                          </div>
                        </div>
                      </div>
                    </div>

                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Payment Information</h4>
                      <div className={`rounded-3xl p-6 space-y-3 border ${theme === 'Dark' ? 'bg-white/[0.02] border-white/5' : 'bg-slate-50 border-slate-100'}`}>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Method</span>
                          <span className={`font-black uppercase tracking-widest ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>
                            {getPaymentMethodLabel(selectedOrder.deliveryInfo?.paymentMethod)}
                          </span>
                        </div>
                        {selectedOrder.deliveryInfo?.momoNumber && (
                          <div className="flex justify-between items-center text-xs">
                            <span className="text-slate-500 font-bold">MoMo Number</span>
                            <span className={`font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{selectedOrder.deliveryInfo?.momoNumber}</span>
                          </div>
                        )}
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Subtotal</span>
                          <span className={`font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{formatPrice(selectedOrder.totalAmount - (selectedOrder.deliveryFee || 0))}</span>
                        </div>
                        <div className="flex justify-between items-center text-xs">
                          <span className="text-slate-500 font-bold">Shipping</span>
                          <span className={`font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{formatPrice(selectedOrder.deliveryFee || 0)}</span>
                        </div>
                        <div className="pt-3 border-t border-white/5 flex justify-between items-center">
                          <span className="text-xs font-black uppercase tracking-widest text-blue-500">Total</span>
                          <span className={`text-xl font-black ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{formatPrice(selectedOrder.totalAmount)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Right Column: Order Items & Status Update */}
                  <div className="md:col-span-8 space-y-8">
                    <div className="space-y-4">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Order Items</h4>
                      <div className="space-y-4">
                        {selectedOrder.items.map((item, idx) => (
                          <div key={idx} className={`flex items-center gap-6 p-5 rounded-[2rem] border transition-all ${theme === 'Dark' ? 'bg-white/[0.02] border-white/5 hover:border-blue-500/20' : 'bg-white border-slate-100 shadow-sm hover:shadow-md'}`}>
                            <div className={`w-20 h-20 rounded-2xl p-3 flex-shrink-0 ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-50'}`}>
                              <img src={item.product?.image} className="w-full h-full object-contain" alt="" />
                            </div>
                            <div className="flex-grow min-w-0">
                              <p className={`text-sm font-black truncate ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{item.product?.name}</p>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">{item.product?.brand}</p>
                            </div>
                            <div className="text-right">
                              <p className={`text-sm font-black ${theme === 'Dark' ? 'text-blue-400' : 'text-blue-600'}`}>{formatPrice(item.price)}</p>
                              <p className="text-[10px] text-slate-500 font-black uppercase tracking-widest mt-1">Qty: {item.quantity}</p>
                            </div>
                          </div>
                        ))}
                      </div>
                    </div>

                    <div className="space-y-4 no-print">
                      <h4 className="text-[11px] font-black text-slate-500 uppercase tracking-widest ml-1">Update Status</h4>
                      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                        {['Pending', 'Approved', 'Completed', 'Cancelled'].map((status) => (
                          <button
                            key={status}
                            onClick={() => handleUpdateStatus(selectedOrder._id, status)}
                            className={`py-4 rounded-2xl text-[10px] font-black uppercase tracking-widest transition-all border-2 ${
                              selectedOrder.status === status 
                                ? 'bg-[#0d6efd] border-[#0d6efd] text-white shadow-lg shadow-blue-500/20' 
                                : theme === 'Dark' 
                                  ? 'bg-white/5 border-white/5 text-slate-500 hover:border-blue-500/50 hover:text-white'
                                  : 'bg-slate-50 border-slate-100 text-slate-400 hover:border-blue-500/50 hover:text-slate-900'
                            }`}
                          >
                            {status}
                          </button>
                        ))}
                      </div>
                    </div>
                  </div>
                </div>
              </div>

              <div className={`p-8 border-t flex justify-end gap-4 no-print ${theme === 'Dark' ? 'border-white/5' : 'border-slate-100'}`}>
                <button 
                  onClick={() => setIsModalOpen(false)}
                  className="px-10 py-3.5 bg-[#0d6efd] hover:bg-blue-600 text-white rounded-2xl text-xs font-black uppercase tracking-widest shadow-xl shadow-blue-500/20 transition-all active:scale-95"
                >
                  Close Detail
                </button>
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
};

export default OrderManagement;
