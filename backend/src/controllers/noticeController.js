import Notice from '../models/Notice.js';
import { broadcastImportantNoticeEmail } from '../services/notificationService.js';

// @desc    Create a new society notice
// @route   POST /api/notices
// @access  Private/Admin
const createNotice = async (req, res, next) => {
  try {
    const { title, description, important } = req.body;

    const notice = await Notice.create({
      title,
      description,
      important: important || false,
      createdBy: req.user._id,
    });

    if (notice.important) {
      broadcastImportantNoticeEmail(notice.title, notice.description);
    }

    res.status(201).json({
      success: true,
      message: 'Notice posted successfully to the board.',
      notice,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get all notices sorted by Pinned status first, then Chronologically
// @route   GET /api/notices
// @access  Private (Both Residents and Admins can view)
const getAllNotices = async (req, res, next) => {
  try {
    const notices = await Notice.find({})
      .populate('createdBy', 'name role')
      .sort({ important: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      count: notices.length,
      notices,
    });
  } catch (error) {
    next(error);
  }
};

export{ createNotice, getAllNotices };