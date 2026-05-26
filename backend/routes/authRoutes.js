import express from 'express';
import { 
  register, login, getMe, updateProfile, 
  forgotPassword, verifyResetCode, resetPassword, 
  getUserDashboard, deleteAccount, googleAuth,
  verifyEmail, resendVerificationCode
} from '../controllers/authController.js';
import { getSystemSettings } from '../controllers/adminController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.get('/settings', getSystemSettings);
router.post('/register', register);
router.post('/verify-email', protect, verifyEmail);
router.post('/resend-verification', protect, resendVerificationCode);
router.post('/login', login);
router.post('/google', googleAuth);
router.post('/forgot-password', forgotPassword);
router.post('/verify-code', verifyResetCode);
router.put('/reset-password', resetPassword);
router.get('/me', protect, getMe);
router.put('/profile', protect, updateProfile);
router.get('/dashboard', protect, getUserDashboard);
router.delete('/account', protect, deleteAccount);

export default router;

