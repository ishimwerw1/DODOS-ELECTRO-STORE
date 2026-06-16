import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar, FaRegStar, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaPaperPlane, FaTimes, FaCheckCircle,
} from 'react-icons/fa';
import { reviewAPI } from '../services/api';
import { toast } from 'react-toastify';

const StarPicker = ({ value, onChange, size = 24 }) => (
  <div className="flex gap-1">
    {[1, 2, 3, 4, 5].map((n) => (
      <button
        key={n}
        type="button"
        onClick={() => onChange(n)}
        className="transition-transform hover:scale-110 focus:outline-none"
        aria-label={`Rate ${n} star${n > 1 ? 's' : ''}`}
      >
        {n <= value
          ? <FaStar style={{ fontSize: size }} className="text-yellow-400" />
          : <FaRegStar style={{ fontSize: size }} className="text-gray-600 hover:text-yellow-300" />
        }
      </button>
    ))}
  </div>
);

const Stars = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <FaStar key={n} size={size} className={n <= rating ? 'text-yellow-400' : 'text-gray-700'} />
    ))}
  </div>
);

const ReviewCard = ({ review }) => {
  const date = new Date(review.createdAt).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="group bg-gradient-to-br from-white/[0.07] to-white/[0.02] rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 flex flex-col gap-4 sm:gap-6 h-full transition-all duration-500 hover:border-white/30 hover:shadow-[0_0_40px_-10px_rgba(255,255,255,0.1)]">
      <div className="flex items-start gap-3">
        <FaQuoteLeft className="text-green-500/30 text-2xl sm:text-3xl flex-shrink-0 mt-1" />
        <div className="flex items-center gap-1.5 ml-auto">
          {[1, 2, 3, 4, 5].map((n) => (
            <FaStar key={n} size={11} className={n <= review.rating ? 'text-yellow-400' : 'text-gray-700'} />
          ))}
        </div>
      </div>

      <p className="text-gray-300 text-sm sm:text-base leading-relaxed flex-grow">
        &ldquo;{review.comment}&rdquo;
      </p>

      <div className="flex items-center gap-3 pt-4 sm:pt-6 border-t border-white/10">
        <div className="w-10 h-10 sm:w-12 sm:h-12 rounded-2xl bg-gradient-to-br from-green-400 to-green-600 flex items-center justify-center text-white text-sm font-black flex-shrink-0 shadow-lg uppercase">
          {review.name.charAt(0)}
        </div>
        <div>
          <p className="font-bold text-white text-xs sm:text-sm">{review.name}</p>
          <p className="text-gray-500 text-[10px] font-semibold mt-0.5">{date}</p>
        </div>
        <span className="ml-auto flex items-center gap-1.5 text-[9px] bg-green-500/10 text-green-400 border border-green-500/20 font-bold px-2.5 py-1 rounded-md uppercase tracking-tighter">
          <FaCheckCircle size={8} />
          Verified
        </span>
      </div>
    </div>
  );
};

const ReviewForm = ({ onClose, onSubmit, submitting }) => {
  const [form, setForm] = useState({ name: '', rating: 5, comment: '' });
  const [errors, setErrors] = useState({});

  const validate = () => {
    const e = {};
    if (!form.name.trim())    e.name    = 'Name is required';
    if (!form.comment.trim()) e.comment = 'Comment is required';
    if (form.comment.trim().length < 10) e.comment = 'At least 10 characters';
    return e;
  };

  const handleSubmit = (e) => {
    e.preventDefault();
    const errs = validate();
    if (Object.keys(errs).length > 0) return setErrors(errs);
    onSubmit(form);
  };

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 bg-black/80 backdrop-blur-sm">
      <motion.div
        initial={{ opacity: 0, scale: 0.95, y: 20 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.95, y: 20 }}
        transition={{ duration: 0.2 }}
        className="bg-[#0a0d14] border border-white/10 rounded-3xl shadow-2xl w-full max-w-lg p-6 sm:p-8"
      >
        <div className="flex items-center justify-between mb-6 sm:mb-8">
          <div>
            <h3 className="font-black text-white text-xl sm:text-2xl uppercase tracking-tighter">Write a Review</h3>
            <p className="text-gray-500 text-[10px] sm:text-xs mt-1 uppercase tracking-widest font-bold">Share your experience</p>
          </div>
          <button
            onClick={onClose}
            className="w-9 h-9 sm:w-10 sm:h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5 sm:space-y-6">
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Your Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Doe"
              className={`w-full bg-white/5 border-2 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all ${
                errors.name ? 'border-red-500' : 'border-white/10 focus:border-white/30'
              }`}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.name}</p>}
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Your Rating *</label>
            <div className="flex items-center gap-4">
              <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size={28} />
              <span className="text-xs font-bold text-white/70 uppercase tracking-widest">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
              </span>
            </div>
          </div>

          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Your Review *</label>
            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Tell others about product quality, service..."
              className={`w-full bg-white/5 border-2 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition-all ${
                errors.comment ? 'border-red-500' : 'border-white/10 focus:border-white/30'
              }`}
            />
            <div className="flex justify-between mt-2">
              {errors.comment
                ? <p className="text-red-500 text-[10px] font-bold uppercase">{errors.comment}</p>
                : <span />
              }
              <p className={`text-[10px] font-bold ml-auto ${form.comment.length > 450 ? 'text-white' : 'text-gray-600'}`}>
                {form.comment.length}/500
              </p>
            </div>
          </div>

          <div className="flex gap-3 sm:gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-3.5 sm:py-4 border-2 border-white/10 rounded-xl text-[10px] sm:text-xs font-black text-white hover:bg-white/5 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-3.5 sm:py-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-xl text-[10px] sm:text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
            >
              {submitting
                ? <span className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin" />
                : <><FaPaperPlane size={12} /> Submit</>
              }
            </button>
          </div>
        </form>
      </motion.div>
    </div>
  );
};

const ReviewsSection = () => {
  const [reviews,    setReviews]    = useState([]);
  const [loading,    setLoading]    = useState(true);
  const [page,       setPage]       = useState(0);
  const [showForm,   setShowForm]   = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const PER_PAGE   = 3;
  const totalPages = Math.ceil(reviews.length / PER_PAGE);
  const visible    = reviews.slice(page * PER_PAGE, page * PER_PAGE + PER_PAGE);

  const avgRating = reviews.length
    ? (reviews.reduce((a, r) => a + r.rating, 0) / reviews.length).toFixed(1)
    : '0.0';

  const dist = [5, 4, 3, 2, 1].map((star) => ({
    star,
    count: reviews.filter((r) => r.rating === star).length,
    pct: reviews.length
      ? Math.round((reviews.filter((r) => r.rating === star).length / reviews.length) * 100)
      : 0,
  }));

  useEffect(() => {
    reviewAPI.getReviews()
      .then((res) => setReviews(res.data.reviews || []))
      .catch(() => {})
      .finally(() => setLoading(false));
  }, []);

  const handleAddReview = async (form) => {
    setSubmitting(true);
    try {
      const res = await reviewAPI.createReview(form);
      setReviews((prev) => [res.data.review, ...prev]);
      setShowForm(false);
      setPage(0);
      toast.success('Thank you for your review!');
    } catch {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setPage((p) => (p + 1) % totalPages);
  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <section className="relative bg-gradient-to-b from-black to-[#05070a] py-16 sm:py-24 overflow-hidden">
      {/* Background decorative elements */}
      <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[800px] h-[800px] bg-green-500/5 rounded-full blur-[120px] pointer-events-none" />
      <div className="absolute bottom-0 right-0 w-[400px] h-[400px] bg-white/5 rounded-full blur-[100px] pointer-events-none" />

      <div className="relative z-10 max-w-7xl mx-auto px-4 sm:px-6">

        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-12 sm:mb-16 gap-6 sm:gap-8">
          <div>
            <span className="text-green-400/60 text-[10px] sm:text-xs font-bold uppercase tracking-[0.3em] mb-3 block">
              Testimonials
            </span>
            <h2 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-black text-white uppercase tracking-tighter leading-none">
              Client <span className="text-transparent bg-clip-text bg-gradient-to-r from-green-400 to-green-600">Feedback</span>
            </h2>
            <p className="text-gray-500 text-xs sm:text-sm mt-3 sm:mt-4 font-medium max-w-md">
              What our customers say about their experience shopping and repairing with us.
            </p>
          </div>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={() => setShowForm(true)}
            className="bg-gradient-to-r from-green-500 to-green-600 text-white px-6 sm:px-10 py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-widest hover:from-green-400 hover:to-green-500 transition-all text-[10px] sm:text-xs shadow-lg shadow-green-500/20 flex-shrink-0"
          >
            Leave a Review
          </motion.button>
        </div>

        {/* Rating summary */}
        {reviews.length > 0 && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl sm:rounded-3xl border border-white/10 p-5 sm:p-8 mb-10 sm:mb-14 flex flex-col md:flex-row gap-6 sm:gap-12 items-center backdrop-blur-sm"
          >
            <div className="text-center flex-shrink-0">
              <div className="flex items-center justify-center gap-2 mb-1">
                <p className="text-5xl sm:text-7xl font-black text-white tracking-tighter">{avgRating}</p>
                <span className="text-yellow-400 text-2xl sm:text-3xl">★</span>
              </div>
              <Stars rating={Math.round(parseFloat(avgRating))} size={18} />
              <p className="text-gray-500 text-[10px] sm:text-xs font-bold uppercase tracking-widest mt-3 sm:mt-4">
                {reviews.length} Verified {reviews.length === 1 ? 'Review' : 'Reviews'}
              </p>
            </div>

            <div className="flex-1 w-full space-y-2.5">
              {dist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-2 sm:gap-3">
                  <span className="text-[10px] sm:text-xs font-bold text-gray-400 w-3 sm:w-4 text-right">{star}</span>
                  <FaStar size={10} className="text-yellow-400 flex-shrink-0" />
                  <div className="flex-1 bg-white/5 rounded-full h-2 sm:h-2.5 overflow-hidden">
                    <motion.div
                      initial={{ width: 0 }}
                      whileInView={{ width: `${pct}%` }}
                      viewport={{ once: true }}
                      transition={{ duration: 0.8, ease: 'easeOut' }}
                      className="h-full bg-gradient-to-r from-yellow-400 to-yellow-500 rounded-full"
                    />
                  </div>
                  <span className="text-[10px] sm:text-xs font-bold text-gray-600 w-6 sm:w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6 sm:gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-56 sm:h-64 rounded-2xl sm:rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="text-center py-16 sm:py-24 bg-gradient-to-br from-white/[0.06] to-white/[0.02] rounded-2xl sm:rounded-3xl border border-white/10"
          >
            <div className="w-16 h-16 sm:w-20 sm:h-20 rounded-full bg-white/5 flex items-center justify-center mx-auto mb-4 sm:mb-6">
              <FaQuoteLeft className="text-green-500/40 text-xl sm:text-2xl" />
            </div>
            <p className="font-black text-white text-xl sm:text-2xl uppercase tracking-tighter mb-2">No Reviews Yet</p>
            <p className="text-gray-500 text-xs sm:text-sm mb-8 sm:mb-10 uppercase tracking-widest font-bold">Be the first to share your experience</p>
            <motion.button
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.97 }}
              onClick={() => setShowForm(true)}
              className="bg-gradient-to-r from-green-500 to-green-600 text-white px-8 sm:px-12 py-3.5 sm:py-4 rounded-xl font-black uppercase tracking-widest hover:from-green-400 hover:to-green-500 transition-all text-[10px] sm:text-xs shadow-lg shadow-green-500/20"
            >
              Write the First Review
            </motion.button>
          </motion.div>
        ) : (
          <>
            {/* Desktop grid */}
            <div className="hidden md:grid md:grid-cols-3 gap-6 sm:gap-8">
              <AnimatePresence mode="popLayout">
                {visible.map((rev) => (
                  <motion.div
                    key={rev._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9, y: 10 }}
                    animate={{ opacity: 1, scale: 1, y: 0 }}
                    exit={{ opacity: 0, scale: 0.9, y: -10 }}
                    transition={{ duration: 0.35 }}
                  >
                    <ReviewCard review={rev} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {/* Mobile horizontal swipe */}
            <div className="md:hidden mobile-scroll-x -mx-4 px-4">
              <AnimatePresence mode="popLayout">
                {visible.map((rev) => (
                  <motion.div
                    key={rev._id}
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.35 }}
                    className="w-[85vw] max-w-[320px] flex-shrink-0"
                  >
                    <ReviewCard review={rev} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex items-center justify-center gap-4 mt-8 sm:mt-12">
                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={prev}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all bg-white/5"
                  aria-label="Previous reviews"
                >
                  <FaChevronLeft size={13} />
                </motion.button>

                <div className="flex items-center gap-2">
                  {Array.from({ length: totalPages }).map((_, i) => (
                    <button
                      key={i}
                      onClick={() => setPage(i)}
                      className={`h-1.5 rounded-full transition-all duration-400 ${
                        i === page ? 'w-6 sm:w-8 bg-green-500' : 'w-1.5 bg-white/20 hover:bg-white/40'
                      }`}
                    />
                  ))}
                </div>

                <motion.button
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  onClick={next}
                  className="w-11 h-11 sm:w-12 sm:h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all bg-white/5"
                  aria-label="Next reviews"
                >
                  <FaChevronRight size={13} />
                </motion.button>
              </div>
            )}
          </>
        )}
      </div>

      <AnimatePresence>
        {showForm && (
          <ReviewForm
            onClose={() => setShowForm(false)}
            onSubmit={handleAddReview}
            submitting={submitting}
          />
        )}
      </AnimatePresence>
    </section>
  );
};

export default ReviewsSection;
