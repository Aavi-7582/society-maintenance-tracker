import Complaint from '../models/Complaint.js';
import { OVERDUE_DAYS } from '../config/constants.js';

// @desc    Get comprehensive metrics and chart distributions for Admin Dashboard
// @route   GET /api/admin/dashboard-stats
// @access  Private/Admin
export const getAdminDashboardStats = async (req, res, next) => {
  try {
    const today = new Date();

    const stats = await Complaint.aggregate([
      {
        $facet: {
          kpiMetrics: [
            {
              $group: {
                _id: null,
                total: { $sum: 1 },
                open: { $sum: { $cond: [{ $eq: ['$status', 'OPEN'] }, 1, 0] } },
                inProgress: { $sum: { $cond: [{ $eq: ['$status', 'IN_PROGRESS'] }, 1, 0] } },
                resolved: { $sum: { $cond: [{ $eq: ['$status', 'RESOLVED'] }, 1, 0] } },
                overdue: {
                  $sum: {
                    $cond: [
                      {
                        $and: [
                          { $ne: ['$status', 'RESOLVED'] },
                          {
                            $gt: [
                              { $divide: [{ $subtract: [today, '$createdAt'] }, 1000 * 3600 * 24] },
                              OVERDUE_DAYS
                            ]
                          }
                        ]
                      },
                      1,
                      0
                    ]
                  }
                }
              }
            }
          ],
          categoryDistribution: [
            { $group: { _id: '$category', value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } }
          ],
          priorityDistribution: [
            { $group: { _id: '$priority', value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } }
          ],
          statusDistribution: [
            { $group: { _id: '$status', value: { $sum: 1 } } },
            { $project: { name: '$_id', value: 1, _id: 0 } }
          ]
        }
      }
    ]);

    const extractedData = stats[0];
    const cards = extractedData.kpiMetrics[0] || { total: 0, open: 0, inProgress: 0, resolved: 0, overdue: 0 };
    delete cards._id;

    res.status(200).json({
      success: true,
      data: {
        cards,
        charts: {
          category: extractedData.categoryDistribution,
          priority: extractedData.priorityDistribution,
          status: extractedData.statusDistribution
        }
      }
    });
  } catch (error) {
    next(error);
  }
};