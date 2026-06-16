import Message from '../models/Message.js';
import User from '../models/User.js';
import Notification from '../models/Notification.js';

// @desc    Send message
// @route   POST /api/chat
// @access  Private
export const sendMessage = async (req, res, next) => {
  try {
    const { receiverId, text, product, replyTo } = req.body;
    const senderId = req.user.id;

    const message = await Message.create({
      sender: senderId,
      receiver: receiverId,
      text,
      product,
      replyTo
    });

    // Create notification for the receiver
    const sender = await User.findById(senderId);
    await Notification.create({
      recipient: receiverId,
      sender: senderId,
      title: 'New Message',
      message: `${sender.fullName}: ${text.substring(0, 50)}${text.length > 50 ? '...' : ''}`,
      type: 'CHAT_MESSAGE',
      relatedId: message._id
    });

    // Populate replyTo if exists
    if (replyTo) {
      await message.populate('replyTo');
    }

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get conversation between two users
// @route   GET /api/chat/:otherUserId
// @access  Private
export const getConversation = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const otherUserId = req.params.otherUserId;

    const messages = await Message.find({
      $or: [
        { sender: userId, receiver: otherUserId },
        { sender: otherUserId, receiver: userId }
      ]
    })
    .sort({ createdAt: 1 })
    .populate('replyTo');

    // Mark messages as read
    await Message.updateMany(
      { sender: otherUserId, receiver: userId, isRead: false },
      { isRead: true }
    );

    // Mark chat notifications as read
    await Notification.updateMany(
      { recipient: userId, sender: otherUserId, type: 'CHAT_MESSAGE', isRead: false },
      { isRead: true }
    );

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};

// @desc    Edit message
// @route   PUT /api/chat/:messageId
// @access  Private
export const editMessage = async (req, res, next) => {
  try {
    const { text } = req.body;
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to edit this message');
    }

    if (message.isDeleted) {
      res.status(400);
      throw new Error('Cannot edit a deleted message');
    }

    message.text = text;
    message.isEdited = true;
    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Delete message (soft delete)
// @route   DELETE /api/chat/:messageId
// @access  Private
export const deleteMessage = async (req, res, next) => {
  try {
    const message = await Message.findById(req.params.messageId);

    if (!message) {
      res.status(404);
      throw new Error('Message not found');
    }

    if (message.sender.toString() !== req.user.id) {
      res.status(401);
      throw new Error('Not authorized to delete this message');
    }

    message.text = 'This message was deleted';
    message.isDeleted = true;
    await message.save();

    res.json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all users who have chatted with the current user (for Admin)
// @route   GET /api/chat/conversations
// @access  Private
export const getConversations = async (req, res, next) => {
  try {
    const userId = req.user.id;
    
    // Find all unique users the current user has chatted with
    const messages = await Message.find({
      $or: [{ sender: userId }, { receiver: userId }]
    }).sort({ createdAt: -1 });

    const contactIds = new Set();
    const guestIds = new Set();
    messages.forEach(msg => {
      if (msg.guestId) {
        guestIds.add(msg.guestId);
      } else {
        if (msg.sender && msg.sender.toString() !== userId) contactIds.add(msg.sender.toString());
        if (msg.receiver && msg.receiver.toString() !== userId) contactIds.add(msg.receiver.toString());
      }
    });

    const contacts = await User.find({ _id: { $in: Array.from(contactIds) } })
      .select('fullName email avatar profilePicture');

    const enrichedContacts = await Promise.all(contacts.map(async (contact) => {
      const lastMsg = await Message.findOne({
        $or: [
          { sender: userId, receiver: contact._id },
          { sender: contact._id, receiver: userId }
        ]
      }).sort({ createdAt: -1 });

      const unreadCount = await Message.countDocuments({
        sender: contact._id,
        receiver: userId,
        isRead: false
      });

      return {
        ...contact.toObject(),
        lastMessage: lastMsg,
        unreadCount,
        isGuest: false,
      };
    }));

    // Add guest conversations
    for (const gId of guestIds) {
      const lastMsg = await Message.findOne({ guestId: gId }).sort({ createdAt: -1 });
      const unreadCount = await Message.countDocuments({ guestId: gId, receiver: userId, isRead: false, sender: null });
      enrichedContacts.push({
        _id: gId,
        fullName: 'Guest (' + gId.substring(0, 8) + '...)',
        email: 'Guest user',
        lastMessage: lastMsg,
        unreadCount,
        isGuest: true,
      });
    }

    res.json({ success: true, conversations: enrichedContacts });
  } catch (error) {
    next(error);
  }
};

// @desc    Get first admin ID
// @route   GET /api/chat/admin
// @access  Private
export const getAdminId = async (req, res, next) => {
  try {
    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      res.status(404);
      throw new Error('Admin not found');
    }
    res.json({ success: true, adminId: admin._id });
  } catch (error) {
    next(error);
  }
};

// @desc    Get total unread messages count for current user
// @route   GET /api/chat/unread/count
// @access  Private
export const getUnreadCount = async (req, res, next) => {
  try {
    const userId = req.user.id;
    const count = await Message.countDocuments({
      receiver: userId,
      isRead: false,
      sender: { $ne: null }
    });
    res.json({ success: true, count });
  } catch (error) {
    next(error);
  }
};

// @desc    Send message as guest (no auth required)
// @route   POST /api/chat/guest
// @access  Public
export const sendGuestMessage = async (req, res, next) => {
  try {
    const { guestId, text, product } = req.body;

    if (!guestId || !text) {
      return res.status(400).json({ message: 'Guest ID and text are required' });
    }

    const admin = await User.findOne({ role: 'admin' });
    if (!admin) {
      return res.status(404).json({ message: 'No admin available' });
    }

    const message = await Message.create({
      guestId,
      receiver: admin._id,
      text,
      product: product || null,
    });

    res.status(201).json({ success: true, message });
  } catch (error) {
    next(error);
  }
};

// @desc    Get guest conversation by guestId
// @route   GET /api/chat/guest/:guestId
// @access  Public
export const getGuestConversation = async (req, res, next) => {
  try {
    const { guestId } = req.params;

    const messages = await Message.find({ guestId })
      .sort({ createdAt: 1 })
      .populate('replyTo');

    res.json({ success: true, messages });
  } catch (error) {
    next(error);
  }
};
