const ExamResult = require('../models/ExamResult');
const UserStats = require('../models/UserStats');

// @desc    Submit exam and calculate results
// @route   POST /api/exam/submit
// @access  Private
const submitExam = async (req, res, next) => {
  try {
    const { subjectId, totalQuestions, attempted, correct, wrong } = req.body;

    const accuracy = totalQuestions > 0 ? (correct / totalQuestions) * 100 : 0;

    const result = new ExamResult({
      userId: req.user._id,
      subjectId,
      totalQuestions,
      attempted,
      correct,
      wrong,
      accuracy,
    });

    const createdResult = await result.save();

    // Update UserStats
    let userStats = await UserStats.findOne({ userId: req.user._id, subjectId });

    if (userStats) {
      userStats.attempted += attempted;
      userStats.correct += correct;
      userStats.wrong += wrong;
      
      const totalAttemptedForAccuracy = userStats.attempted > 0 ? userStats.attempted : 1; // avoid division by zero
      userStats.accuracy = (userStats.correct / totalAttemptedForAccuracy) * 100;
      
      await userStats.save();
    } else {
      userStats = new UserStats({
        userId: req.user._id,
        subjectId,
        attempted,
        correct,
        wrong,
        accuracy: attempted > 0 ? (correct / attempted) * 100 : 0,
      });
      await userStats.save();
    }

    res.status(201).json(createdResult);
  } catch (error) {
    next(error);
  }
};

// @desc    Get user's past exam results
// @route   GET /api/exam/results?subjectId=x
// @access  Private
const getExamResults = async (req, res, next) => {
  try {
    const query = { userId: req.user._id };
    if (req.query.subjectId) {
      query.subjectId = req.query.subjectId;
    }

    const results = await ExamResult.find(query).sort({ completedAt: -1 }).populate('subjectId', 'subjectName');
    res.json(results);
  } catch (error) {
    next(error);
  }
};

module.exports = { submitExam, getExamResults };
