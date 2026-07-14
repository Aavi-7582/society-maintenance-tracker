import express from 'express';
import { getAllComplaintsAdmin, updateComplaintPriority } from '../controllers/adminController.js';
import { updateComplaintStatus } from '../controllers/complaintController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

// Enforce global admin locks across all endpoints in this file
router.use(protect);
router.use(authorize('admin'));

// Management Actions
router.get('/complaints', getAllComplaintsAdmin); // Get all complaints + Search & Filters
router.patch('/complaints/:id/priority', updateComplaintPriority); // Priority adjustment
router.patch('/complaints/:id/status', updateComplaintStatus); // Reused timeline status logic

export default router;