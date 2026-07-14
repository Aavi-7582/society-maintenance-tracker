import express from 'express';
import { registerResident, loginUser } from '../controllers/authController.js';
import {protect} from '../middlewares/authMiddleware.js';

const router = express.Router();

// Public routes
router.post('/register', registerResident);
router.post('/login', loginUser);

// Profile testing route (verifies token authentication)
router.get('/me', protect, (req, res) => {
  res.status(200).json({ success: true, user: req.user });
});

export default router;