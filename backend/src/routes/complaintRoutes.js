import express from 'express';
import { 
  createComplaint, 
  getMyComplaints, 
  getComplaintById, 
} from '../controllers/complaintController.js';
import { protect, authorize } from '../middlewares/authMiddleware.js';
import upload from '../middlewares/uploadMiddleware.js';

const router = express.Router();

// All routes require authentication
router.use(protect);

// ----------------- Resident Endpoints -----------------
router.post('/', authorize('resident'),upload.single('photo'), createComplaint);
router.get('/my-complaints', authorize('resident'), getMyComplaints);

// ----------------- Shared Endpoints -----------------
// Allowed for Admins globally, and Residents ONLY for their own complaints (handled inside controller)
router.get('/:id', getComplaintById);

export default router;