const UserStats = require('../models/UserStats');
const ExamResult = require('../models/ExamResult');

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

// @desc    Reset user performance statistics
// @route   DELETE /api/user/stats/reset
// @access  Private
const resetUserStats = async (req, res, next) => {
  try {
    await UserStats.deleteMany({ userId: req.user._id });
    await ExamResult.deleteMany({ userId: req.user._id });
    
    res.json({ message: 'Progress and exam history successfully reset.' });
  } catch (error) {
    next(error);
  }
};

module.exports = { getUserStats, resetUserStats };
