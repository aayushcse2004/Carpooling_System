import express from 'express';
import { registerDriver, loginDriver, getDriverProfile, updateDriverProfile } from '../controllers/driver.controller.js';
import protect from '../middleware/authMiddleware.js';

const router = express.Router();

// Driver Registration
router.post('/register', registerDriver);

// Driver Login
router.post('/login', loginDriver);

// Driver Profile
router.get('/profile', protect, getDriverProfile);
router.put('/profile', protect, updateDriverProfile);

export default router;
