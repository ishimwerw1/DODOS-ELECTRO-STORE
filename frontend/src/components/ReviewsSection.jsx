import { useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  FaStar, FaRegStar, FaQuoteLeft, FaChevronLeft, FaChevronRight,
  FaPaperPlane, FaUserCircle, FaTimes, FaEdit,
} from 'react-icons/fa';
import { reviewAPI } from '../services/api';
import { toast } from 'react-toastify';

/* ── Star picker ── */
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
          : <FaRegStar style={{ fontSize: size }} className="text-gray-300 hover:text-yellow-300" />
        }
      </button>
    ))}
  </div>
);

/* ── Star display (read-only) ── */
const Stars = ({ rating, size = 12 }) => (
  <div className="flex gap-0.5">
    {[1, 2, 3, 4, 5].map((n) => (
      <FaStar key={n} size={size} className={n <= rating ? 'text-white' : 'text-gray-800'} />
    ))}
  </div>
);

/* ── Single review card ── */
const ReviewCard = ({ review }) => {
  const date = new Date(review.createdAt).toLocaleDateString('en-RW', {
    year: 'numeric', month: 'short', day: 'numeric',
  });

  return (
    <div className="bg-white/5 rounded-3xl border border-white/10 p-8 flex flex-col gap-6 h-full transition-all duration-500 hover:border-white">
      {/* Quote icon */}
      <FaQuoteLeft className="text-white/10 text-4xl flex-shrink-0" />

      {/* Comment */}
      <p className="text-gray-300 text-lg leading-relaxed flex-grow italic">
        "{review.comment}"
      </p>

      {/* Footer Info */}
      <div className="space-y-4">
        <Stars rating={review.rating} size={14} />
        <div className="flex items-center gap-4 pt-6 border-t border-white/10">
          <div className="w-12 h-12 rounded-2xl bg-white text-black flex items-center justify-center text-sm font-black flex-shrink-0 shadow-xl uppercase">
            {review.name.charAt(0)}
          </div>
          <div>
            <p className="font-black text-white text-sm uppercase tracking-widest">{review.name}</p>
            <p className="text-[10px] text-gray-500 font-bold uppercase tracking-widest mt-0.5">{date}</p>
          </div>
          {/* Verified badge */}
          <span className="ml-auto text-[9px] border border-white/20 text-gray-400 font-black px-2.5 py-1 rounded-md uppercase tracking-tighter">
            Verified
          </span>
        </div>
      </div>
    </div>
  );
};

/* ── Review form modal ── */
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
        className="bg-black border border-white/20 rounded-3xl shadow-2xl w-full max-w-lg p-8"
      >
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h3 className="font-black text-white text-2xl uppercase tracking-tighter">Write a Review</h3>
            <p className="text-gray-500 text-xs mt-1 uppercase tracking-widest font-bold">Share your experience</p>
          </div>
          <button
            onClick={onClose}
            className="w-10 h-10 rounded-xl bg-white/5 hover:bg-white/10 flex items-center justify-center text-white transition-colors border border-white/10"
          >
            <FaTimes size={14} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Name */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Your Name *</label>
            <input
              type="text"
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
              placeholder="e.g. John Doe"
              className={`w-full bg-white/5 border-2 rounded-xl px-4 py-3 text-sm text-white outline-none transition-all ${
                errors.name ? 'border-red-500' : 'border-white/10 focus:border-white'
              }`}
            />
            {errors.name && <p className="text-red-500 text-[10px] mt-2 font-bold uppercase">{errors.name}</p>}
          </div>

          {/* Rating */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Your Rating *</label>
            <div className="flex items-center gap-4">
              <StarPicker value={form.rating} onChange={(v) => setForm({ ...form, rating: v })} size={28} />
              <span className="text-xs font-black text-white uppercase tracking-widest">
                {['', 'Poor', 'Fair', 'Good', 'Very Good', 'Excellent'][form.rating]}
              </span>
            </div>
          </div>

          {/* Comment */}
          <div>
            <label className="block text-[10px] font-black text-gray-500 mb-2 uppercase tracking-[0.2em]">Your Review *</label>
            <textarea
              rows={4}
              value={form.comment}
              onChange={(e) => setForm({ ...form, comment: e.target.value })}
              placeholder="Tell others about product quality, service..."
              className={`w-full bg-white/5 border-2 rounded-xl px-4 py-3 text-sm text-white outline-none resize-none transition-all ${
                errors.comment ? 'border-red-500' : 'border-white/10 focus:border-white'
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

          {/* Actions */}
          <div className="flex gap-4 pt-2">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 py-4 border-2 border-white/10 rounded-xl text-xs font-black text-white hover:bg-white/5 transition-all uppercase tracking-widest"
            >
              Cancel
            </button>
            <button
              type="submit"
              disabled={submitting}
              className="flex-1 py-4 bg-white hover:bg-gray-200 disabled:opacity-50 text-black rounded-xl text-xs font-black transition-all flex items-center justify-center gap-2 uppercase tracking-widest"
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

/* ── Main ReviewsSection ── */
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

  /* rating distribution */
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
      toast.success('🎉 Thank you for your review!');
    } catch {
      toast.error('Could not submit review. Please try again.');
    } finally {
      setSubmitting(false);
    }
  };

  const next = () => setPage((p) => (p + 1) % totalPages);
  const prev = () => setPage((p) => (p - 1 + totalPages) % totalPages);

  return (
    <section className="bg-black py-24 border-t border-white/5">
      <div className="max-w-7xl mx-auto px-4">
        
        {/* Section header */}
        <div className="flex flex-col md:flex-row justify-between items-end mb-16 gap-8">
          <div>
            <span className="text-white/40 text-[10px] font-bold uppercase tracking-[0.3em] mb-3 block">Testimonials</span>
            <h2 className="text-4xl md:text-5xl font-black text-white uppercase tracking-tighter">
              Client <span className="text-gray-500">Feedback</span>
            </h2>
          </div>
          <button
            onClick={() => setShowForm(true)}
            className="bg-white text-black px-10 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all text-xs shadow-2xl"
          >
            Leave a Review
          </button>
        </div>

        {/* Rating summary */}
        {reviews.length > 0 && (
          <div className="bg-white/5 rounded-3xl border border-white/10 p-8 mb-12 flex flex-col md:flex-row gap-12 items-center">
            <div className="text-center flex-shrink-0">
              <p className="text-7xl font-black text-white tracking-tighter mb-2">{avgRating}</p>
              <Stars rating={Math.round(parseFloat(avgRating))} size={20} />
              <p className="text-gray-500 text-[10px] font-black uppercase tracking-widest mt-4">
                {reviews.length} Verified Reviews
              </p>
            </div>

            <div className="flex-1 w-full space-y-3">
              {dist.map(({ star, count, pct }) => (
                <div key={star} className="flex items-center gap-4">
                  <span className="text-[10px] font-black text-gray-500 w-4 text-right">{star}</span>
                  <FaStar size={10} className="text-white flex-shrink-0" />
                  <div className="flex-1 bg-white/5 rounded-full h-1.5 overflow-hidden">
                    <div
                      className="h-full bg-white rounded-full transition-all duration-700"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="text-[10px] font-black text-gray-600 w-8 text-right">{count}</span>
                </div>
              ))}
            </div>
          </div>
        )}

        {loading ? (
          <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-64 rounded-3xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : reviews.length === 0 ? (
          <div className="text-center py-24 bg-white/5 rounded-3xl border border-white/10">
            <p className="font-black text-white text-2xl uppercase tracking-tighter mb-2">No Reviews Yet</p>
            <p className="text-gray-500 text-sm mb-10 uppercase tracking-widest font-bold">Be the first to share your experience</p>
            <button
              onClick={() => setShowForm(true)}
              className="bg-white text-black px-12 py-4 rounded-xl font-black uppercase tracking-widest hover:bg-gray-200 transition-all text-xs"
            >
              Write the First Review
            </button>
          </div>
        ) : (
          <div className="relative group/slider">
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
              <AnimatePresence mode="popLayout">
                {visible.map((rev) => (
                  <motion.div
                    key={rev._id}
                    layout
                    initial={{ opacity: 0, scale: 0.9 }}
                    animate={{ opacity: 1, scale: 1 }}
                    exit={{ opacity: 0, scale: 0.9 }}
                    transition={{ duration: 0.4 }}
                  >
                    <ReviewCard review={rev} />
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>

            {totalPages > 1 && (
              <div className="flex justify-center gap-4 mt-12">
                <button
                  onClick={prev}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  aria-label="Previous reviews"
                >
                  <FaChevronLeft size={14} />
                </button>
                <button
                  onClick={next}
                  className="w-12 h-12 rounded-full border border-white/10 flex items-center justify-center text-white hover:bg-white hover:text-black transition-all"
                  aria-label="Next reviews"
                >
                  <FaChevronRight size={14} />
                </button>
              </div>
            )}
          </div>
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
