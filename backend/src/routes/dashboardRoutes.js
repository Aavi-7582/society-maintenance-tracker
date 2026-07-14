import express from 'express';
import { getAdminDashboardStats } from '../controllers/dashboardController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';

const router = express.Router();

router.use(protect);
router.use(authorize('admin'));

router.get('/stats', getAdminDashboardStats);

export default router;