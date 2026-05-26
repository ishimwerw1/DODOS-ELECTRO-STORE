import Review from '../models/Review.js';

// @desc  Get all approved reviews
// @route GET /api/reviews
// @access Public
export const getReviews = async (req, res, next) => {
  try {
    const reviews = await Review.find({ approved: true }).sort({ createdAt: -1 });
    res.json({ success: true, reviews });
  } catch (err) {
    next(err);
  }
};

// @desc  Submit a new review
// @route POST /api/reviews
// @access Public
export const createReview = async (req, res, next) => {
  try {
    const { name, rating, comment } = req.body;
    if (!name || !rating || !comment) {
      return res.status(400).json({ message: 'Name, rating and comment are required.' });
    }
    const review = await Review.create({ name, rating: Number(rating), comment });
    res.status(201).json({ success: true, review });
  } catch (err) {
    next(err);
  }
};

// @desc  Delete a review (admin)
// @route DELETE /api/reviews/:id
// @access Admin
export const deleteReview = async (req, res, next) => {
  try {
    await Review.findByIdAndDelete(req.params.id);
    res.json({ success: true, message: 'Review deleted' });
  } catch (err) {
    next(err);
  }
};
