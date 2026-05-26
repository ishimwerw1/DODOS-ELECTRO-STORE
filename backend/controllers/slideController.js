import Slide from '../models/Slide.js';

// @desc    Get all active slides
// @route   GET /api/slides
// @access  Public
export const getSlides = async (req, res) => {
  try {
    const slides = await Slide.find({ isActive: true }).sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slides', error: error.message });
  }
};

// @desc    Get all slides (including inactive)
// @route   GET /api/slides/admin
// @access  Private/Admin
export const getAllSlides = async (req, res) => {
  try {
    const slides = await Slide.find().sort({ order: 1 });
    res.json(slides);
  } catch (error) {
    res.status(500).json({ message: 'Error fetching slides', error: error.message });
  }
};

// @desc    Create a slide
// @route   POST /api/slides
// @access  Private/Admin
export const createSlide = async (req, res) => {
  try {
    const slide = await Slide.create(req.body);
    res.status(201).json(slide);
  } catch (error) {
    res.status(400).json({ message: 'Error creating slide', error: error.message });
  }
};

// @desc    Update a slide
// @route   PUT /api/slides/:id
// @access  Private/Admin
export const updateSlide = async (req, res) => {
  try {
    const slide = await Slide.findByIdAndUpdate(req.params.id, req.body, { new: true });
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json(slide);
  } catch (error) {
    res.status(400).json({ message: 'Error updating slide', error: error.message });
  }
};

// @desc    Delete a slide
// @route   DELETE /api/slides/:id
// @access  Private/Admin
export const deleteSlide = async (req, res) => {
  try {
    const slide = await Slide.findByIdAndDelete(req.params.id);
    if (!slide) return res.status(404).json({ message: 'Slide not found' });
    res.json({ message: 'Slide deleted' });
  } catch (error) {
    res.status(500).json({ message: 'Error deleting slide', error: error.message });
  }
};