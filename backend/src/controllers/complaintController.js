import Complaint from '../models/Complaint.js';
import cloudinary from '../config/cloudinary.js';
import { sendComplaintStatusEmail } from '../services/notificationService.js';

// Helper function to stream a buffer directly to Cloudinary
const uploadToCloudinary = (fileBuffer) => {
  return new Promise((resolve, reject) => {
    const uploadStream = cloudinary.uploader.upload_stream(
      { folder: 'society_complaints' },
      (error, result) => {
        if (error) return reject(error);
        resolve(result.secure_url); // Returns the permanent secure HTTPS image URL
      }
    );
    uploadStream.end(fileBuffer);
  });
};

// @desc    Create a new complaint (Resident only)
// @route   POST /api/complaints
// @access  Private/Resident
const createComplaint = async (req, res, next) => {
  try {
    const { title, description, category, priority } = req.body;
    let photoUrl = '';

    if (req.file) {
      photoUrl = await uploadToCloudinary(req.file.buffer);
    }

    const complaint = await Complaint.create({
      title,
      description,
      category,
      priority,
      photo: photoUrl, // Stores the active Cloudinary CDN URL in MongoDB
      resident: req.user._id,
    });

    res.status(201).json({
      success: true,
      message: 'Complaint created successfully',
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get logged-in resident's complaints
// @route   GET /api/complaints/my-complaints
// @access  Private/Resident
const getMyComplaints = async (req, res, next) => {
  try {
    const complaints = await Complaint.find({ resident: req.user._id })
      .sort({ createdAt: -1 });

    res.status(200).json({
      success: true,
      count: complaints.length,
      complaints,
    });
  } catch (error) {
    next(error);
  }
};


// @desc    Update complaint status & append to timeline history
// @route   PATCH /api/complaints/:id/status
// @access  Private (Typically Admin, but open to actors based on access control)
const updateComplaintStatus = async (req, res, next) => {
  try {
    const { id } = req.params;
    const { status, note } = req.body;

    if (!['OPEN', 'IN_PROGRESS', 'RESOLVED'].includes(status)) {
      return res.status(400).json({ success: false, message: 'Invalid status state transition' });
    }

    const complaint = await Complaint.findById(id);
    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint record not found' });
    }

    // Update the base top-level flag for quick filtering queries
    complaint.status = status;

    // Atomically push a new entry into our history log tracking subdocument array
    complaint.statusHistory.push({
      status,
      actor: req.user._id, // Tracks the logged-in user making the change
      note: note || `Status updated to ${status}`,
    });

    await complaint.save();

    // Re-fetch populated complaint to return complete readable data to client
    const updatedComplaint = await Complaint.findById(id)
      .populate('resident', 'name email flatNo')
      .populate('statusHistory.actor', 'name role');

    sendComplaintStatusEmail(
    updatedComplaint.resident.email,
    updatedComplaint.resident.name,
    updatedComplaint,
    status,
    note || `Status updated to ${status}`
    );

    res.status(200).json({
      success: true,
      message: 'Timeline status history appended successfully.',
      complaint: updatedComplaint,
    });
  } catch (error) {
    next(error);
  }
};

// @desc    Get complete detail of a single complaint with full timeline populate
// @route   GET /api/complaints/:id
// @access  Private
const getComplaintById = async (req, res, next) => {
  try {
    const complaint = await Complaint.findById(req.params.id)
      .populate('resident', 'name email flatNo')
      .populate('statusHistory.actor', 'name role');

    if (!complaint) {
      return res.status(404).json({ success: false, message: 'Complaint not found' });
    }

    // Security check: Residents can only see their own complaints
    if (req.user.role === 'resident' && complaint.resident._id.toString() !== req.user._id.toString()) {
      return res.status(403).json({ success: false, message: 'Unauthorized to view this complaint' });
    }

    res.status(200).json({
      success: true,
      complaint,
    });
  } catch (error) {
    next(error);
  }
};

export { createComplaint, getMyComplaints,getComplaintById ,updateComplaintStatus};