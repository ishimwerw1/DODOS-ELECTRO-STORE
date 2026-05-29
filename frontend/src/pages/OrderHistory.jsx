import { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { motion } from 'framer-motion';
import { FaShoppingBag, FaChevronRight, FaBoxOpen, FaClock, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { orderAPI } from '../services/api.js';
import { toast } from 'react-toastify';
import { useLocale } from '../context/LocaleContext';

const OrderHistory = () => {
  const { formatPrice } = useLocale();
  const [orders, setOrders]   = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => { fetchOrders(); }, []);

  const fetchOrders = async () => {
    try {
      setLoading(true);
      const res = await orderAPI.getOrders();
      setOrders(res.data.orders || []);
    } catch {
      toast.error('Failed to load orders');
    } finally {
      setLoading(false);
    }
  };

  const statusConfig = {
    Pending:   { icon: FaClock,       color: 'bg-yellow-50 text-yellow-600 border-yellow-200' },
    Approved:  { icon: FaCheckCircle, color: 'bg-blue-50 text-blue-600 border-blue-200' },
    Completed: { icon: FaCheckCircle, color: 'bg-green-50 text-green-600 border-green-200' },
    Cancelled: { icon: FaTimesCircle, color: 'bg-red-50 text-red-500 border-red-200' },
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="w-10 h-10 border-3 border-green-500 border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (orders.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 text-center px-4">
        <div className="w-20 h-20 bg-gray-100 rounded-full flex items-center justify-center mb-5">
          <FaShoppingBag size={28} className="text-gray-300" />
        </div>
        <h3 className="text-xl font-black text-gray-900 mb-2">No Orders Yet</h3>
        <p className="text-gray-400 text-sm mb-7 max-w-xs">You haven't placed any orders yet. Start shopping to see your orders here.</p>
        <Link to="/products" className="bg-green-500 hover:bg-green-600 text-white font-black px-8 py-3.5 rounded-xl transition-all text-sm">
          Start Shopping
        </Link>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-6 space-y-5">
      <div>
        <h2 className="text-2xl font-black text-gray-900">My Orders</h2>
        <p className="text-gray-400 text-sm mt-0.5">{orders.length} orders total</p>
      </div>

      <div className="space-y-3">
        {orders.map((order, i) => {
          const cfg = statusConfig[order.status] || statusConfig.Pending;
          const StatusIcon = cfg.icon;
          return (
            <motion.div
              key={order._id}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.04 }}
              className="bg-white border border-gray-200 rounded-xl p-5 flex flex-col sm:flex-row sm:items-center gap-4 hover:shadow-md hover:border-green-200 transition-all group"
            >
              {/* Image */}
              <div className="w-16 h-16 bg-gray-50 rounded-xl flex-shrink-0 flex items-center justify-center overflow-hidden border border-gray-100">
                {order.items?.[0]?.product?.image
                  ? <img src={order.items[0].product.image} className="w-full h-full object-contain p-2" alt="" />
                  : <FaBoxOpen className="text-gray-300" size={20} />
                }
              </div>

              {/* Info */}
              <div className="flex-grow">
                <div className="flex flex-wrap items-center gap-2 mb-1">
                  <h4 className="text-sm font-black text-gray-900">#{order.orderNumber || order._id.slice(-6)}</h4>
                  <span className={`px-2.5 py-1 rounded-lg text-[10px] font-bold uppercase tracking-widest border flex items-center gap-1.5 ${cfg.color}`}>
                    <StatusIcon size={10} /> {order.status}
                  </span>
                </div>
                <div className="flex flex-wrap gap-x-4 gap-y-1 text-xs text-gray-400 font-semibold">
                  <span>{new Date(order.createdAt).toLocaleDateString()}</span>
                  <span>{order.items?.length || 0} item{order.items?.length !== 1 ? 's' : ''}</span>
                </div>
              </div>

              {/* Price & action */}
              <div className="flex items-center justify-between sm:flex-col sm:items-end gap-3">
                <div className="sm:text-right">
                  <p className="text-[10px] text-gray-400 font-semibold uppercase tracking-widest mb-0.5">Total</p>
                  <p className="text-lg font-black text-gray-900">{formatPrice(order.totalAmount)}</p>
                </div>
                <Link
                  to={`/orders/${order._id}`}
                  className="w-9 h-9 rounded-xl bg-gray-100 border border-gray-200 flex items-center justify-center text-gray-500 hover:bg-green-500 hover:text-white hover:border-green-500 transition-all"
                >
                  <FaChevronRight size={12} />
                </Link>
              </div>
            </motion.div>
          );
        })}
      </div>
    </div>
  );
};

export default OrderHistory;
