import Repair from '../models/Repair.js';

/**
 * @desc    Book a new repair service
 * @route   POST /api/repairs
 * @access  Public/Private
 */
export const bookRepair = async (req, res) => {
  try {
    const { customerName, phone, deviceModel, issueDescription } = req.body;

    if (!customerName || !phone || !deviceModel || !issueDescription) {
      return res.status(400).json({ message: 'All fields are required' });
    }

    const newRepair = await Repair.create({
      customerName,
      phone,
      deviceModel,
      issueDescription,
      user: req.user ? req.user._id : null // Use logged in user ID if available
    });

    res.status(201).json({
      success: true,
      message: 'Repair booking successful',
      repair: newRepair
    });
  } catch (error) {
    console.error('Repair Booking Error:', error.message);
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get all repairs (Admin)
 * @route   GET /api/repairs
 * @access  Private/Admin
 */
export const getRepairs = async (req, res) => {
  try {
    const repairs = await Repair.find().sort({ createdAt: -1 });
    res.json(repairs);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
