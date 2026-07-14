import Complaint from '../models/Complaint.js';

// @desc    Get all complaints with advanced search, pagination, and overdue priority sorting
// @route   GET /api/admin/complaints
// @access  Private/Admin
const getAllComplaintsAdmin = async (req, res, next) => {
  try {
    const { search, category, status, priority, startDate, endDate, page = 1, limit = 10 } = req.query;

    let query = {};

    // 1. Text Search
    if (search) {
      query.$or = [
        { title: { $regex: search, $options: 'i' } },
        { description: { $regex: search, $options: 'i' } }
      ];
    }

    // 2. Filters
    if (category) query.category = category;
    if (status) query.status = status;
    if (priority) query.priority = priority;

    // 3. Date Range
    if (startDate || endDate) {
      query.createdAt = {};
      if (startDate) query.createdAt.$gte = new Date(startDate);
      if (endDate) query.createdAt.$lte = new Date(endDate);
    }

    // Total Count matching the filter (critical for frontend pagination calculation)
    const totalComplaints = await Complaint.countDocuments(query);

    // 4. Fetch the dataset (Don't use .lean() so virtuals calculate cleanly)
    let complaints = await Complaint.find(query)
      .populate('resident', 'name email flatNo')
      .populate('statusHistory.actor', 'name role')
      .sort({ createdAt: -1 }); // Default chronological fallback

    // 5. Business Rule: Prioritize Overdue badges first 
    complaints.sort((a, b) => {
      if (a.isOverdue && !b.isOverdue) return -1;
      if (!a.isOverdue && b.isOverdue) return 1;
      return 0;
    });

    // 6. Apply manual pagination slice AFTER array sorting
    const parsedPage = parseInt(page);
    const parsedLimit = parseInt(limit);
    const skip = (parsedPage - 1) * parsedLimit;
    const paginatedComplaints = complaints.slice(skip, skip + parsedLimit);

    res.status(200).json({
      success: true,
      pagination: {
        total: totalComplaints,
        page: parsedPage,
        pages: Math.ceil(totalComplaints / parsedLimit),
        limit: parsedLimit
      },
      complaints: paginatedComplaints
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Update complaint priority level explicitly
// @route   PATCH /api/admin/complaints/:id/priority
// @access  Private/Admin
const updateComplaintPriority = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { priority } = req.body;

    if (!['Low', 'Medium', 'High'].includes(priority)) {
      return res.status(400).json({ success: false, message: 'Invalid priority level assigned' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found' });
    }

    complaint.priority = priority;
    await complaint.save();

    res.status(200).json({
      success: true,
      message: `Priority successfully changed to ${priority}`,
      complaint
    });
  } catch (error) {
    next(error);
  }
};

export { getAllComplaintsAdmin, updateComplaintPriority };