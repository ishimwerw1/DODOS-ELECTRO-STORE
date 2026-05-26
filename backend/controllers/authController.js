import User from '../models/User.js';
import Order from '../models/Order.js';
import Notification from '../models/Notification.js';
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import crypto from 'crypto';
import sendEmail from '../utils/sendEmail.js';

// Register User
export const register = async (req, res) => {
  try {
    const { fullName, email, phone, password } = req.body;

    let user = await User.findOne({ email });
    if (user) return res.status(400).json({ message: 'User already exists' });

    /* Auto-detect language & currency from phone dial code */
    const dialLocaleMap = {
      '+250': { language: 'English',    currency: 'RWF' },
      '+256': { language: 'English',    currency: 'UGX' },
      '+254': { language: 'English',    currency: 'KES' },
      '+255': { language: 'English',    currency: 'TZS' },
      '+257': { language: 'French',     currency: 'BIF' },
      '+243': { language: 'French',     currency: 'CDF' },
      '+251': { language: 'English',    currency: 'ETB' },
      '+234': { language: 'English',    currency: 'NGN' },
      '+27':  { language: 'English',    currency: 'ZAR' },
      '+233': { language: 'English',    currency: 'GHS' },
      '+20':  { language: 'Arabic',     currency: 'EGP' },
      '+212': { language: 'French',     currency: 'MAD' },
      '+33':  { language: 'French',     currency: 'EUR' },
      '+49':  { language: 'German',     currency: 'EUR' },
      '+44':  { language: 'English',    currency: 'GBP' },
      '+1':   { language: 'English',    currency: 'USD' },
      '+91':  { language: 'English',    currency: 'INR' },
      '+86':  { language: 'Chinese',    currency: 'CNY' },
      '+81':  { language: 'Japanese',   currency: 'JPY' },
      '+82':  { language: 'Korean',     currency: 'KRW' },
      '+55':  { language: 'Portuguese', currency: 'BRL' },
      '+54':  { language: 'Spanish',    currency: 'ARS' },
      '+52':  { language: 'Spanish',    currency: 'MXN' },
    };

    let detectedPrefs = { language: 'English', currency: 'RWF' };
    if (phone) {
      const cleaned = phone.replace(/\s/g, '');
      const sorted  = Object.keys(dialLocaleMap).sort((a, b) => b.length - a.length);
      for (const dial of sorted) {
        if (cleaned.startsWith(dial)) { detectedPrefs = dialLocaleMap[dial]; break; }
      }
    }

    // Generate verification code
    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpire = new Date(Date.now() + 10 * 60 * 1000); // 10 mins

    user = new User({
      fullName,
      email,
      phone,
      password,
      role: 'user',
      preferences: {
        currency: detectedPrefs.currency,
        language: detectedPrefs.language,
      },
      verificationCode,
      verificationExpire
    });

    await user.save();

    // Send verification email
    try {
      await sendEmail({
        email: user.email,
        subject: 'Email Verification - Dodos Electro Store',
        message: `Your verification code is: ${verificationCode}. It expires in 10 minutes.`,
      });
    } catch (err) {
      console.error('Email send error:', err);
      // Don't fail registration if email fails, but maybe log it
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    res.status(201).json({
      token,
      user: {
        id:         user._id,
        fullName:   user.fullName,
        email:      user.email,
        phone:      user.phone,
        role:       user.role,
        preferences: user.preferences,
        isVerified: user.isVerified
      },
    });
  } catch (err) {
    console.error('Registration error:', err);
    res.status(500).json({ message: 'Server error during registration' });
  }
};

// Verify Email
export const verifyEmail = async (req, res) => {
  try {
    const { code } = req.body;
    const user = await User.findById(req.user.id);

    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    if (user.verificationCode !== code || user.verificationExpire < Date.now()) {
      return res.status(400).json({ message: 'Invalid or expired verification code' });
    }

    user.isVerified = true;
    user.verificationCode = undefined;
    user.verificationExpire = undefined;
    await user.save();

    res.json({ success: true, message: 'Email verified successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error during verification' });
  }
};

// Resend Verification Code
export const resendVerificationCode = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });
    if (user.isVerified) return res.status(400).json({ message: 'Email already verified' });

    const verificationCode = Math.floor(100000 + Math.random() * 900000).toString();
    const verificationExpire = new Date(Date.now() + 10 * 60 * 1000);

    user.verificationCode = verificationCode;
    user.verificationExpire = verificationExpire;
    await user.save();

    await sendEmail({
      email: user.email,
      subject: 'Email Verification - Dodos Electro Store',
      message: `Your new verification code is: ${verificationCode}. It expires in 10 minutes.`,
    });

    res.json({ success: true, message: 'Verification code sent' });
  } catch (err) {
    res.status(500).json({ message: 'Server error' });
  }
};

// Login User/Admin
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;

    const user = await User.findOne({ email }).select('+password');
    if (!user) return res.status(400).json({ message: 'Invalid credentials' });

    // Google-only accounts have no password — direct them to Google sign-in
    if (!user.password) {
      return res.status(400).json({ message: 'This account uses Google Sign-In. Please continue with Google.' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) return res.status(400).json({ message: 'Invalid credentials' });

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });
    
    res.json({
      token,
      user: {
        id:          user._id,
        fullName:    user.fullName,
        email:       user.email,
        phone:       user.phone,
        role:        user.role,
        preferences: user.preferences,
        isVerified:  user.isVerified
      },
    });
  } catch (err) {
    res.status(500).json({ message: 'Server error during login' });
  }
};

// Get User Profile
export const getMe = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('-password');
    res.json(user);
  } catch (err) {
    res.status(500).json({ message: 'Server error fetching user profile' });
  }
};

/**
 * @desc    Update user profile
 * @route   PUT /api/auth/profile
 * @access  Private
 */
export const updateProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select('+password');
    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    const { 
      fullName, 
      username, 
      email, 
      phone, 
      profilePicture, 
      addresses, 
      preferences, 
      notifications,
      password,
      currentPassword 
    } = req.body;

    // Basic Info
    if (fullName) user.fullName = fullName;
    if (phone) user.phone = phone;
    if (profilePicture) {
      user.profilePicture = profilePicture;
      user.avatar = profilePicture; // Sync both fields
    }
    if (username && username !== user.username) {
      const usernameExists = await User.findOne({ username });
      if (usernameExists) return res.status(400).json({ message: 'Username already taken' });
      user.username = username;
    }
    if (email && email !== user.email) {
      const emailExists = await User.findOne({ email });
      if (emailExists) return res.status(400).json({ message: 'Email already in use' });
      user.email = email;
    }

    // Password Update
    if (password) {
      if (!currentPassword) {
        return res.status(400).json({ message: 'Current password is required to set a new one' });
      }
      const isMatch = await user.comparePassword(currentPassword);
      if (!isMatch) {
        return res.status(400).json({ message: 'Incorrect current password' });
      }
      user.password = password;
    }

    // Nested Fields
    if (addresses) user.addresses = addresses;
    if (preferences) user.preferences = { ...user.preferences, ...preferences };
    if (notifications) user.notifications = { ...user.notifications, ...notifications };

    await user.save();

    // Notify Admins about setting change
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = admins.map(admin => ({
      recipient: admin._id,
      sender: user._id,
      title: 'User Updated Settings',
      message: `User ${user.fullName} updated their account settings.`,
      type: 'SETTINGS_CHANGED'
    }));
    await Notification.insertMany(adminNotifications);

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: user.toJSON()
    });
  } catch (error) {
    console.error('Update Profile Error:', error);
    res.status(500).json({ message: 'Server Error' });
  }
};

// Forgot Password
export const forgotPassword = async (req, res) => {
  try {
    const { email } = req.body;
    const user = await User.findOne({ email });

    if (!user) {
      return res.status(404).json({ message: 'User not found' });
    }

    // Get reset code
    const resetCode = user.getResetPasswordCode();
    await user.save({ validateBeforeSave: false });

    // Send email
    const message = `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #eee; border-radius: 10px;">
        <h2 style="color: #0d6efd; text-align: center;">DODOS ELECTRO STORE</h2>
        <p>Hello,</p>
        <p>You requested a password reset. Please use the following 6-digit verification code to reset your password:</p>
        <div style="background: #f4f4f4; padding: 20px; text-align: center; border-radius: 5px; margin: 20px 0;">
          <h1 style="letter-spacing: 5px; color: #333; margin: 0;">${resetCode}</h1>
        </div>
        <p>This code will expire in 10 minutes.</p>
        <p>If you didn't request this, please ignore this email.</p>
        <hr style="border: 0; border-top: 1px solid #eee; margin: 20px 0;" />
        <p style="font-size: 12px; color: #777; text-align: center;">&copy; ${new Date().getFullYear()} DODOS Electro Store. All rights reserved.</p>
      </div>
    `;

    try {
      await sendEmail({
        email: user.email,
        subject: 'Password Reset Verification Code',
        html: message,
      });

      res.status(200).json({ 
        success: true, 
        message: 'Password reset code sent to your email'
      });
    } catch (err) {
      console.error('Email Send Error Details:', err.message);
      
      user.resetPasswordCode = undefined;
      user.resetPasswordExpire = undefined;
      await user.save({ validateBeforeSave: false });

      // Return the specific error message to help the user debug
      let userFriendlyMessage = `Email delivery failed: ${err.message}.`;
      
      if (process.env.EMAIL_USER === 'your-actual-email@gmail.com') {
        userFriendlyMessage = "You haven't set your real Gmail address in the backend .env file yet. Please replace 'your-actual-email@gmail.com' with your real email.";
      } else if (err.message.includes('Invalid login')) {
        userFriendlyMessage = "Invalid Gmail login. Please double-check your EMAIL_USER and ensure your 16-character App Password is correct.";
      }

      return res.status(500).json({ 
        message: userFriendlyMessage
      });
    }
  } catch (err) {
    console.error('Forgot Password Error:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// Verify Reset Code
export const verifyResetCode = async (req, res) => {
  try {
    const { email, code } = req.body;

    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordCode: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    res.status(200).json({
      success: true,
      message: 'Code verified successfully'
    });
  } catch (err) {
    console.error('Verify Code Error:', err);
    res.status(500).json({ message: 'Server error during code verification' });
  }
};

// Reset Password
export const resetPassword = async (req, res) => {
  try {
    const { email, code, password } = req.body;

    const hashedCode = crypto
      .createHash('sha256')
      .update(code)
      .digest('hex');

    const user = await User.findOne({
      email,
      resetPasswordCode: hashedCode,
      resetPasswordExpire: { $gt: Date.now() }
    });

    if (!user) {
      return res.status(400).json({ message: 'Invalid or expired reset code' });
    }

    // Set new password
    user.password = password;
    user.resetPasswordCode = undefined;
    user.resetPasswordExpire = undefined;
    await user.save();

    res.status(200).json({
      success: true,
      message: 'Password reset successful'
    });
  } catch (err) {
    console.error('Reset Password Error:', err);
    res.status(500).json({ message: 'Server error during password reset' });
  }
};

// Get User Dashboard Data
export const getUserDashboard = async (req, res) => {
  try {
    const totalOrders = await Order.countDocuments({ user: req.user.id });
    const pendingOrders = await Order.countDocuments({ user: req.user.id, status: 'Pending' });
    const completedOrders = await Order.countDocuments({ user: req.user.id, status: 'Completed' });

    const recentOrders = await Order.find({ user: req.user.id })
      .sort({ createdAt: -1 })
      .limit(5)
      .populate('items.product', 'name image');

    res.status(200).json({
      summary: {
        totalOrders,
        pendingOrders,
        completedOrders
      },
      recentOrders
    });
  } catch (err) {
    console.error('User Dashboard Error:', err);
    res.status(500).json({ message: 'Error fetching dashboard data' });
  }
};

// Delete Account
export const deleteAccount = async (req, res) => {
  try {
    const user = await User.findById(req.user.id);
    if (!user) return res.status(404).json({ message: 'User not found' });

    // Notify Admins before deletion
    const admins = await User.find({ role: 'admin' });
    const adminNotifications = admins.map(admin => ({
      recipient: admin._id,
      title: 'Account Deleted',
      message: `User ${user.fullName} (${user.email}) has deleted their account.`,
      type: 'ACCOUNT_DELETED'
    }));
    await Notification.insertMany(adminNotifications);

    await user.deleteOne();
    res.status(200).json({ message: 'Account deleted successfully' });
  } catch (err) {
    res.status(500).json({ message: 'Server error deleting account' });
  }
};

// Google OAuth Sign-In / Sign-Up
export const googleAuth = async (req, res) => {
  try {
    const { credential } = req.body;
    if (!credential) return res.status(400).json({ message: 'Google credential is required' });

    // Fetch user info from Google using the access token
    const googleRes = await fetch('https://www.googleapis.com/oauth2/v3/userinfo', {
      headers: { Authorization: `Bearer ${credential}` },
    });

    if (!googleRes.ok) return res.status(401).json({ message: 'Invalid Google token' });

    const { email, name, picture, sub: googleId } = await googleRes.json();

    if (!email) return res.status(401).json({ message: 'Could not retrieve email from Google' });

    // Find existing user or create new one
    let user = await User.findOne({ email });

    if (!user) {
      user = new User({
        fullName:   name,
        email,
        googleId,
        avatar:     picture,
        phone:      '',
        password:   googleId + process.env.JWT_SECRET,
        role:       'user',
        preferences: { currency: 'RWF', language: 'English' },
      });
      await user.save();
    } else if (!user.googleId) {
      user.googleId = googleId;
      if (!user.avatar) user.avatar = picture;
      await user.save();
    }

    const token = jwt.sign({ id: user._id, role: user.role }, process.env.JWT_SECRET, { expiresIn: '7d' });

    res.json({
      token,
      user: {
        id:          user._id,
        fullName:    user.fullName,
        email:       user.email,
        phone:       user.phone,
        role:        user.role,
        avatar:      user.avatar,
        preferences: user.preferences,
      },
    });
  } catch (err) {
    console.error('Google auth error:', err);
    res.status(401).json({ message: 'Google authentication failed' });
  }
};