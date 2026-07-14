import express from 'express';
import { createNotice, getAllNotices } from '../controllers/noticeController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// All notice interactions require a valid session token
router.use(protect);

// Shared View Permission
router.get('/', getAllNotices);

// Admin Broadcast Lock
router.post('/', authorize('admin'), createNotice);

export default router;