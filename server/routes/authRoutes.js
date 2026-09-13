import { requireAuthentication } from '../middleware/patientAccess.js';
import { captcha, requireOtp } from '../controllers/authVerification.js';
import { forgotPassword, resetPassword } from '../controllers/passwordResetController.js';
import express from 'express';
import { registerUser, loginUser, doctorProfile } from '../controllers/authController.js';

const router = express.Router();
router.get('/captcha', captcha);

router.post('/forgot-password', forgotPassword);
router.post('/reset-password', resetPassword);

router.post('/register', requireOtp('register'), registerUser);
router.post('/login', requireOtp('login'), loginUser);
router.get('/doctor-profile', requireAuthentication, doctorProfile);
router.patch('/doctor-profile', requireAuthentication, doctorProfile);

export default router;
