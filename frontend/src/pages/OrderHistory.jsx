import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaChevronRight, FaBoxOpen, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { orderAPI } from '../services/api.js';
import { toast } from 'react-toastify';
import { useLocale } from '../context/LocaleContext';

const OrderHistory = () => {
  const { t, formatPrice } = useLocale();
  const [orders, setOrders] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchOrders();
  }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getOrders();
      setOrders(res.data.orders || []);
    } catch (err) {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const getStatusIcon = (status) => {
    switch (status) {
      case 'Pending':   return <FaClock className="text-yellow-500" />;
      case 'Approved':  return <FaCheckCircle className="text-blue-500" />;
      case 'Completed': return <FaCheckCircle className="text-green-500" />;
      case 'Cancelled': return <FaTimesCircle className="text-red-500" />;
      default:          return <FaClock className="text-slate-500" />;
    }
  };

  const getStatusClass = (status) => {
    switch (status) {
      case 'Pending':   return 'bg-yellow-500/10 text-yellow-500 border-yellow-500/20';
      case 'Approved':  return 'bg-blue-500/10 text-blue-500 border-blue-500/20';
      case 'Completed': return 'bg-green-500/10 text-green-500 border-green-500/20';
      case 'Cancelled': return 'bg-red-500/10 text-red-500 border-red-500/20';
      default:          return 'bg-slate-500/10 text-slate-500 border-slate-500/20';
    }
  };

  if (loading) {
    return (
      <div className="min-h-[60vh] flex items-center justify-center">
        <div className="w-12 h-12 border-4 border-primary border-t-transparent rounded-full animate-spin"></div>
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="min-h-[60vh] flex flex-col items-center justify-center text-center px-4">
        <div className="w-20 h-20 bg-white/5 rounded-full flex items-center justify-center mb-6">
          <FaShoppingBag size={32} className="text-slate-700" />
        </div>
        <h3 className="text-2xl font-black text-white uppercase tracking-tighter mb-2">{t('noOrders')}</h3>
        <p className="text-slate-500 mb-8 max-w-xs">{t('noOrdersDesc') || "You haven't placed any orders yet."}</p>
        <Link to="/products" className="btn-primary px-8 py-3 rounded-xl font-bold uppercase tracking-widest text-xs">
          {t('startShopping')}
        </Link>
      </div>
    );
  }

  return (
    <div className="max-w-6xl mx-auto px-4 py-12">
      <div className="mb-10">
        <h2 className="text-4xl font-black text-white uppercase tracking-tighter mb-2">My <span className="text-gray-500">Orders</span></h2>
        <p className="text-slate-500 text-sm uppercase tracking-widest font-bold">History of your recent transactions</p>
      </div>

      <div className="space-y-4">
        {orders.map((order, i) => (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            key={order._id}
            className="glass rounded-3xl border border-white/5 hover:border-blue-500/20 transition-all overflow-hidden group"
          >
            <div className="p-6 md:p-8 flex flex-col md:flex-row md:items-center gap-6">
              {/* Order Image/Icon */}
              <div className="w-20 h-20 bg-white/5 rounded-2xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-white/5 group-hover:border-blue-500/20 transition-all">
                {order.items?.[0]?.product?.image ? (
                  <img src={order.items[0].product.image} className="w-full h-full object-contain p-2" alt="" />
                ) : (
                  <FaBoxOpen className="text-slate-700" size={24} />
                )}
              </div>

              {/* Order Info */}
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-3 mb-2">
                  <h4 className="text-lg font-black text-white uppercase tracking-tighter">#{order.orderNumber || order._id.slice(-6)}</h4>
                  <span className={`px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-widest border flex items-center gap-1.5 ${getStatusClass(order.status)}`}>
                    {getStatusIcon(order.status)}
                    {order.status}
                  </span>
                </div>
                <div className="flex flex-wrap items-center gap-x-6 gap-y-2 text-slate-500 text-xs font-bold uppercase tracking-widest">
                  <p>Date: <span className="text-slate-300 ml-1">{new Date(order.createdAt).toLocaleDateString()}</span></p>
                  <p>Items: <span className="text-slate-300 ml-1">{order.items?.length || 0}</span></p>
                </div>
              </div>

              {/* Price & Action */}
              <div className="flex items-center justify-between md:flex-col md:items-end gap-4">
                <div className="text-left md:text-right">
                  <p className="text-[10px] text-slate-500 font-black uppercase tracking-[0.2em] mb-1">Total Amount</p>
                  <p className="text-2xl font-black text-white">{formatPrice(order.totalAmount)}</p>
                </div>
                <Link 
                  to={`/orders/${order._id}`} 
                  className="w-12 h-12 rounded-2xl bg-white/5 border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all group-hover:scale-105"
                >
                  <FaChevronRight size={14} />
                </Link>
              </div>
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
};

export default OrderHistory;
