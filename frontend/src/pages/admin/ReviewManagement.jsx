import { useState, useEffect } from 'react';
import { FaTrash, FaSearch, FaStar, FaUserCircle, FaQuoteLeft, FaCheckCircle, FaTimesCircle } from 'react-icons/fa';
import { reviewAPI } from '../../services/api';
import { toast } from 'react-toastify';
import { useTheme } from '../../context/ThemeContext';
import { motion, AnimatePresence } from 'framer-motion';

const ReviewManagement = () => {
  const { theme } = useTheme();
  const [reviews, setReviews] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchReviews();
  }, []);

  const fetchReviews = async () => {
    try {
      const res = await reviewAPI.getAllReviews();
      setReviews(res.data.reviews || []);
    } catch (error) {
      toast.error('Failed to load reviews');
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id) => {
    if (window.confirm('Are you sure you want to delete this review?')) {
      try {
        await reviewAPI.deleteReview(id);
        toast.success('Review deleted successfully');
        fetchReviews();
      } catch (error) {
        toast.error('Failed to delete review');
      }
    }
  };

  const filteredReviews = reviews.filter(r => 
    r.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
    r.comment.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const renderStars = (rating) => {
    return [...Array(5)].map((_, i) => (
      <FaStar key={i} size={12} className={i < rating ? 'text-yellow-500' : 'text-slate-700'} />
    ));
  };

  return (
    <div className="space-y-8 pb-10">
      {/* Header Area */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-6">
        <div>
          <h1 className={`text-3xl font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>Reviews</h1>
          <p className={`text-sm font-medium mt-1 ${theme === 'Dark' ? 'text-slate-500' : 'text-slate-400'}`}>Manage customer feedback and testimonials.</p>
        </div>
        <div className="flex items-center gap-4">
          <div className="relative group">
            <FaSearch size={14} className={`absolute left-4 top-1/2 -translate-y-1/2 ${theme === 'Dark' ? 'text-gray-600' : 'text-slate-400'}`} />
            <input 
              type="text" 
              placeholder="Search reviews..." 
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className={`rounded-2xl py-3.5 pl-11 pr-4 text-xs font-bold outline-none w-64 transition-all ${theme === 'Dark' ? 'bg-[#0a0d14] border border-white/5 text-white focus:border-blue-500/50' : 'bg-white border border-slate-200 text-slate-900 focus:border-blue-500/50 shadow-sm'}`}
            />
          </div>
        </div>
      </div>

      {/* Grid Area */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {loading ? (
          [...Array(6)].map((_, i) => (
            <div key={i} className={`h-64 rounded-[2.5rem] animate-pulse ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-100'}`} />
          ))
        ) : filteredReviews.length === 0 ? (
          <div className={`col-span-full py-20 text-center rounded-[3rem] border border-dashed ${theme === 'Dark' ? 'border-white/10 text-slate-500' : 'border-slate-200 text-slate-400'}`}>
            <p className="text-sm font-black uppercase tracking-widest">No reviews found</p>
          </div>
        ) : (
          filteredReviews.map((review) => (
            <motion.div
              layout
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              key={review._id}
              className={`group rounded-[2.5rem] p-8 border transition-all duration-500 relative overflow-hidden ${theme === 'Dark' ? 'bg-[#0a0d14] border-white/5 hover:border-blue-500/30' : 'bg-white border-slate-200 shadow-sm hover:shadow-xl'}`}
            >
              <div className="absolute top-8 right-8">
                <button 
                  onClick={() => handleDelete(review._id)} 
                  className={`w-10 h-10 rounded-xl flex items-center justify-center transition-all ${theme === 'Dark' ? 'bg-white/5 text-slate-400 hover:text-red-400 hover:bg-red-500/10' : 'bg-slate-50 text-slate-400 hover:text-red-600 hover:bg-red-50'}`}
                >
                  <FaTrash size={14} />
                </button>
              </div>

              <div className="flex items-center gap-4 mb-6">
                <div className={`w-12 h-12 rounded-2xl flex items-center justify-center ${theme === 'Dark' ? 'bg-white/5' : 'bg-slate-100'}`}>
                  <FaUserCircle size={24} className="text-blue-500" />
                </div>
                <div>
                  <h3 className={`text-sm font-black tracking-tight ${theme === 'Dark' ? 'text-white' : 'text-slate-900'}`}>{review.name}</h3>
                  <div className="flex items-center gap-1 mt-1">
                    {renderStars(review.rating)}
                  </div>
                </div>
              </div>

              <div className="relative">
                <FaQuoteLeft className="absolute -top-2 -left-2 text-blue-500/10" size={32} />
                <p className={`text-xs font-medium leading-relaxed relative z-10 ${theme === 'Dark' ? 'text-slate-400' : 'text-slate-600'}`}>
                  {review.comment}
                </p>
              </div>

              <div className="mt-8 pt-6 border-t border-white/5 flex items-center justify-between">
                <span className="text-[10px] text-slate-500 font-black uppercase tracking-widest">
                  {new Date(review.createdAt).toLocaleDateString()}
                </span>
                <div className="flex items-center gap-2">
                  <span className={`text-[9px] font-black uppercase tracking-widest ${review.approved !== false ? 'text-green-500' : 'text-yellow-500'}`}>
                    {review.approved !== false ? 'Approved' : 'Pending'}
                  </span>
                  {review.approved !== false ? <FaCheckCircle className="text-green-500" size={12} /> : <FaTimesCircle className="text-yellow-500" size={12} />}
                </div>
              </div>
            </motion.div>
          ))
        )}
      </div>
    </div>
  );
};

export default ReviewManagement;
