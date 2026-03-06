const UserStats = require('../models/UserStats');

// @desc    Get user performance statistics
// @route   GET /api/user/stats
// @access  Private
const getUserStats = async (req, res, next) => {
  try {
    const stats = await UserStats.find({ userId: req.user._id }).populate('subjectId', 'subjectName subjectIcon totalQuestions');
    res.json(stats);
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserStats };
