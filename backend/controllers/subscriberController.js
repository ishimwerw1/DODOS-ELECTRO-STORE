import Subscriber from '../models/Subscriber.js';

/**
 * @desc    Subscribe to newsletter
 * @route   POST /api/subscribers
 * @access  Public
 */
export const subscribe = async (req, res) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.status(400).json({ message: 'Email is required' });
    }

    // Check if already subscribed
    const existingSubscriber = await Subscriber.findOne({ email });
    if (existingSubscriber) {
      if (existingSubscriber.status === 'active') {
        return res.status(400).json({ message: 'Email already subscribed' });
      } else {
        // Re-activate if previously unsubscribed
        existingSubscriber.status = 'active';
        await existingSubscriber.save();
        return res.status(200).json({ success: true, message: 'Successfully re-subscribed' });
      }
    }

    const newSubscriber = await Subscriber.create({ email });

    res.status(201).json({
      success: true,
      message: 'Successfully subscribed to newsletter',
      subscriber: newSubscriber
    });
  } catch (error) {
    console.error('Subscription error:', error.message);
    if (error.name === 'ValidationError') {
      return res.status(400).json({ message: error.message });
    }
    res.status(500).json({ message: 'Server Error' });
  }
};

/**
 * @desc    Get all subscribers (Admin)
 * @route   GET /api/subscribers
 * @access  Private/Admin
 */
export const getSubscribers = async (req, res) => {
  try {
    const subscribers = await Subscriber.find().sort({ createdAt: -1 });
    res.json(subscribers);
  } catch (error) {
    res.status(500).json({ message: 'Server Error' });
  }
};
